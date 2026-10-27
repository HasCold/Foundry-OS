import { create } from 'zustand'
import type { Account, ApInvoice, ArInvoice, CostVarianceRecord, LedgerEntry, LedgerLine, PoReceiptEvent, ProductionOrder, PurchaseOrder, QualityHold } from '@/types'
import { chartOfAccounts, apInvoices as seedApInvoices, arInvoices as seedArInvoices, openingLedgerEntries, arSeedLedgerEntries, costVarianceSeed } from '@/mock/finance'
import { assertBalanced } from '../utils/ledgerCalculations'
import { nextId } from '@/lib/utils'

interface FinanceState {
  accounts: Account[]
  entries: LedgerEntry[]
  apInvoices: ApInvoice[]
  arInvoices: ArInvoice[]
  costVariance: CostVarianceRecord[]

  // --- Reactions to other modules — called from src/app/domainIntegrations.ts,
  // never directly from UI components. Each one is the one place that knows
  // how a shop-floor event turns into a journal entry.
  recordPoApproved: (po: PurchaseOrder) => void
  recordPoReceipt: (po: PurchaseOrder, receipt: PoReceiptEvent) => void
  recordProductionCompleted: (order: ProductionOrder) => void
  recordQualityScrap: (hold: QualityHold, unitCost: number) => void

  // --- Direct user actions, called from the Finance dashboard UI.
  processApPayment: (invoiceId: string) => void
  processArPayment: (invoiceId: string) => void
  recordSale: (customerName: string, saleAmount: number, cogsAmount: number) => void
}

/** Appends a balanced journal entry. Every posting path in this store funnels through here so nothing can post an unbalanced entry. */
function makeEntry(memo: string, sourceModule: LedgerEntry['sourceModule'], lines: LedgerLine[]): LedgerEntry {
  assertBalanced(lines)
  return { id: nextId('gl'), date: new Date().toISOString(), memo, sourceModule, lines }
}

/** Bumps the current (last) month's actual amount for one cost-variance category — this is what makes the variance chart move live. */
function bumpCostVariance(records: CostVarianceRecord[], category: CostVarianceRecord['category'], amount: number): CostVarianceRecord[] {
  const lastIndexOfCategory = [...records].reverse().findIndex((r) => r.category === category)
  if (lastIndexOfCategory === -1 || amount === 0) return records
  const targetIndex = records.length - 1 - lastIndexOfCategory
  return records.map((r, i) => (i === targetIndex ? { ...r, actualAmount: r.actualAmount + amount } : r))
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: chartOfAccounts,
  entries: [...openingLedgerEntries, ...arSeedLedgerEntries],
  apInvoices: seedApInvoices,
  arInvoices: seedArInvoices,
  costVariance: costVarianceSeed,

  // Procurement -> Finance: approving a PO immediately obligates the company
  // to pay for it, so the liability is booked the moment it's approved (not
  // when goods physically arrive). The debit side goes to "Inventory in
  // Transit" rather than Raw Materials directly — the value only becomes
  // real, on-hand Raw Materials Inventory as it's actually received, which
  // is what recordPoReceipt below walks forward, piece by piece.
  recordPoApproved: (po) => {
    const entry = makeEntry(`PO approved — ${po.poNumber} (${po.supplierName})`, 'procurement', [
      { accountCode: '1190', direction: 'debit', amount: po.totalValue },
      { accountCode: '2000', direction: 'credit', amount: po.totalValue },
    ])
    const invoice: ApInvoice = {
      id: nextId('ap'),
      invoiceNumber: `AP-${po.poNumber}`,
      supplierName: po.supplierName,
      poNumber: po.poNumber,
      amount: po.totalValue,
      issuedDate: entry.date,
      dueDate: po.expectedDate,
      status: 'unpaid',
      // Carried through so the FX Variance Ledger can revalue this payable
      // against today's live rate even though the ledger itself stays in USD.
      bookingCurrency: po.bookingCurrency,
      bookingRateUsd: po.bookingRateUsd,
    }
    set((state) => ({ entries: [entry, ...state.entries], apInvoices: [invoice, ...state.apInvoices] }))
  },

  // Procurement -> Finance: a warehouse intake (partial or full) converts
  // exactly the value actually received from "in transit" into real,
  // on-hand Raw Materials — never the full PO value, so a 40-of-100-unit
  // delivery only recognizes 40 units' worth of Raw Materials Inventory.
  recordPoReceipt: (po, receipt) => {
    if (receipt.totalValueReceived <= 0) return
    const entry = makeEntry(
      `Goods received — ${receipt.poNumber} from ${po.supplierName} (${receipt.lines.map((l) => `${l.quantityReceived}× ${l.itemName}`).join(', ')})`,
      'procurement',
      [
        { accountCode: '1200', direction: 'debit', amount: receipt.totalValueReceived },
        { accountCode: '1190', direction: 'credit', amount: receipt.totalValueReceived },
      ],
    )
    set((state) => ({ entries: [entry, ...state.entries] }))
  },

  // Scheduler -> Finance: a completed run walks its cost through the
  // manufacturing pipeline — Raw Materials -> WIP -> Finished Goods — as two
  // separate transfers, exactly like a real job-costing system would.
  recordProductionCompleted: (order) => {
    // Orders that never left "planned" carry actualCost: 0 (actual cost is
    // only known once a run is underway) — fall back to standard cost so
    // completing them still books a realistic transfer instead of $0. This
    // correctly yields zero variance in that fallback case rather than a
    // fabricated one.
    const effectiveActualCost = order.actualCost > 0 ? order.actualCost : order.standardCost
    const runValue = order.quantityCompleted * effectiveActualCost
    if (runValue <= 0) return

    const toWip = makeEntry(`Materials issued to WIP — ${order.orderNumber} (${order.productName})`, 'production', [
      { accountCode: '1210', direction: 'debit', amount: runValue },
      { accountCode: '1200', direction: 'credit', amount: runValue },
    ])
    const toFinishedGoods = makeEntry(`Production complete, transferred to Finished Goods — ${order.orderNumber}`, 'production', [
      { accountCode: '1220', direction: 'debit', amount: runValue },
      { accountCode: '1210', direction: 'credit', amount: runValue },
    ])

    // Any actual-vs-standard overrun on this run reads as material cost
    // variance for the cost-variance chart's "current month" column.
    const overrun = Math.max(0, (effectiveActualCost - order.standardCost) * order.quantityCompleted)

    set((state) => ({
      entries: [toFinishedGoods, toWip, ...state.entries],
      costVariance: bumpCostVariance(state.costVariance, 'Material Waste', overrun),
    }))
  },

  // Quality -> Finance: material scrapped during a disposition is a real
  // write-off, not just an inventory adjustment — it's booked as a Material
  // Waste Expense against whatever stock stage it was scrapped from (WIP,
  // in this app). This is the "Scrap-to-Finance Expense Leak" trigger.
  recordQualityScrap: (hold, unitCost) => {
    const scrapValue = hold.quantityOnHold * unitCost
    if (scrapValue <= 0) return

    const entry = makeEntry(`Scrap write-off — ${hold.orderNumber} (${hold.productName})`, 'quality', [
      { accountCode: '5100', direction: 'debit', amount: scrapValue },
      { accountCode: '1210', direction: 'credit', amount: scrapValue },
    ])

    set((state) => ({
      entries: [entry, ...state.entries],
      costVariance: bumpCostVariance(state.costVariance, 'Scrap Loss', scrapValue),
    }))
  },

  // Settles a supplier invoice: cash out, liability cleared.
  processApPayment: (invoiceId) => {
    const invoice = get().apInvoices.find((i) => i.id === invoiceId)
    if (!invoice || invoice.status === 'paid') return

    const entry = makeEntry(`Payment sent — ${invoice.invoiceNumber} (${invoice.supplierName})`, 'ap', [
      { accountCode: '2000', direction: 'debit', amount: invoice.amount },
      { accountCode: '1000', direction: 'credit', amount: invoice.amount },
    ])

    set((state) => ({
      entries: [entry, ...state.entries],
      apInvoices: state.apInvoices.map((i) => (i.id === invoiceId ? { ...i, status: 'paid', paidDate: entry.date } : i)),
    }))
  },

  // Collects a customer payment: cash in, receivable cleared.
  processArPayment: (invoiceId) => {
    const invoice = get().arInvoices.find((i) => i.id === invoiceId)
    if (!invoice || invoice.status === 'paid') return

    const entry = makeEntry(`Payment received — ${invoice.invoiceNumber} (${invoice.customerName})`, 'ar', [
      { accountCode: '1000', direction: 'debit', amount: invoice.amount },
      { accountCode: '1100', direction: 'credit', amount: invoice.amount },
    ])

    set((state) => ({
      entries: [entry, ...state.entries],
      arInvoices: state.arInvoices.map((i) => (i.id === invoiceId ? { ...i, status: 'paid', paidDate: entry.date } : i)),
    }))
  },

  // Manual "new sale" action from the AR board: recognizes revenue and, in
  // the same stroke, relieves Finished Goods inventory for the cost of what
  // shipped — the two halves of recording a sale under accrual accounting.
  recordSale: (customerName, saleAmount, cogsAmount) => {
    const revenueEntry = makeEntry(`Revenue recognized — new sale to ${customerName}`, 'ar', [
      { accountCode: '1100', direction: 'debit', amount: saleAmount },
      { accountCode: '4000', direction: 'credit', amount: saleAmount },
    ])
    const cogsEntry =
      cogsAmount > 0
        ? makeEntry(`COGS recognized — shipment to ${customerName}`, 'ar', [
            { accountCode: '5000', direction: 'debit', amount: cogsAmount },
            { accountCode: '1220', direction: 'credit', amount: cogsAmount },
          ])
        : null

    const invoice: ArInvoice = {
      id: nextId('ar'),
      invoiceNumber: `AR-${1000 + Math.floor(Math.random() * 9000)}`,
      customerName,
      amount: saleAmount,
      issuedDate: revenueEntry.date,
      dueDate: revenueEntry.date,
      status: 'unpaid',
    }

    set((state) => ({
      entries: [revenueEntry, ...(cogsEntry ? [cogsEntry] : []), ...state.entries],
      arInvoices: [invoice, ...state.arInvoices],
    }))
  },
}))

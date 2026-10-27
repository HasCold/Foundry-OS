import { create } from 'zustand'
import type { PoReceiptEvent, PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { purchaseOrders as initialPOs, poReceiptEvents as initialReceipts } from '@/mock/procurement'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'
import { useMrpStore } from '@/features/inventory/store/mrpStore'
import { appEvents } from '@/lib/appEvents'
import { nextId } from '@/lib/utils'

/** One line item's requested intake quantity, as entered on the Partial Material Intake form. */
export interface ReceiptLineInput {
  lineId: string
  quantity: number
}

interface ProcurementState {
  purchaseOrders: PurchaseOrder[]
  /** Warehouse intake history — every partial or full receipt ever logged, newest first. */
  receiptEvents: PoReceiptEvent[]

  /** Converts an MRP-suggested PO into a real, approved operational PO. */
  approveSuggested: (suggested: PurchaseOrder) => void
  /** Moves a PO forward a simple lifecycle step that ISN'T driven by receiving (drafted -> approved, approved -> in_transit). */
  advanceStatus: (poId: string, status: PurchaseOrderStatus) => void
  /** Logs a warehouse intake against a PO — covers the "Partial Material Intake" workflow, including full receipts. */
  recordReceipt: (poId: string, lineInputs: ReceiptLineInput[], receivedBy: string) => void
}

export const useProcurementStore = create<ProcurementState>((set, get) => ({
  purchaseOrders: initialPOs,
  receiptEvents: initialReceipts,

  approveSuggested: (suggested) => {
    const approved: PurchaseOrder = {
      ...suggested,
      id: nextId('po'),
      poNumber: `PUR-${9100 + Math.floor(Math.random() * 900)}`,
      status: 'approved',
      createdDate: new Date().toISOString(),
    }

    // Direct calls: Inventory and MRP are Procurement's own close collaborators —
    // "approving a PO raises on-order inventory and clears the suggestion" is a
    // single procurement-domain concept, not a cross-cutting concern.
    suggested.lines.forEach((line) => useInventoryStore.getState().incrementOnOrder(line.itemId, line.quantity))
    useMrpStore.getState().removeSuggestedPO(suggested.id)

    set((state) => ({ purchaseOrders: [approved, ...state.purchaseOrders] }))

    // Event, not a direct call: Finance (and anything else added later) reacts to
    // "a PO was approved" without Procurement needing to import Finance at all.
    // See src/app/domainIntegrations.ts for what listens to this.
    appEvents.emit('po.approved', { po: approved })
  },

  advanceStatus: (poId, status) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) => (p.id === poId ? { ...p, status } : p)),
    }))
    // Note: this action deliberately never sets 'partially_received' or
    // 'fully_completed' — those two statuses only ever result from
    // recordReceipt(), so the receiving math and the status are always
    // derived from the same place instead of two paths disagreeing.
  },

  recordReceipt: (poId, lineInputs, receivedBy) => {
    const po = get().purchaseOrders.find((p) => p.id === poId)
    if (!po) return

    // Clamp every requested intake quantity to what's actually still outstanding
    // on that line, so a typo (or a stale form) can never over-receive a PO.
    const receiptLines = lineInputs
      .map((input) => {
        const line = po.lines.find((l) => l.id === input.lineId)
        if (!line) return null
        const remaining = line.quantity - line.quantityReceived
        const quantityReceived = Math.max(0, Math.min(input.quantity, remaining))
        if (quantityReceived <= 0) return null
        return { itemId: line.itemId, sku: line.sku, itemName: line.itemName, quantityReceived, unitCost: line.unitCost }
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)

    if (receiptLines.length === 0) return

    const updatedLines = po.lines.map((line) => {
      const receipt = receiptLines.find((r) => r.itemId === line.itemId)
      return receipt ? { ...line, quantityReceived: line.quantityReceived + receipt.quantityReceived } : line
    })
    const isFullyReceived = updatedLines.every((l) => l.quantityReceived >= l.quantity)
    const updatedPo: PurchaseOrder = { ...po, lines: updatedLines, status: isFullyReceived ? 'fully_completed' : 'partially_received' }

    const receiptEvent: PoReceiptEvent = {
      id: nextId('rcpt'),
      poId: po.id,
      poNumber: po.poNumber,
      receivedAt: new Date().toISOString(),
      receivedBy,
      lines: receiptLines,
      totalValueReceived: receiptLines.reduce((sum, l) => sum + l.quantityReceived * l.unitCost, 0),
    }

    // Direct call: physically receiving goods against a PO is Procurement +
    // Inventory's own concern (raise on-hand, drop on-order, log a lot) —
    // reuses the exact same action a full receipt always used.
    receiptLines.forEach((l) => useInventoryStore.getState().receiveOnOrder(l.itemId, l.quantityReceived, po.supplierName, po.poNumber))

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((p) => (p.id === poId ? updatedPo : p)),
      receiptEvents: [receiptEvent, ...state.receiptEvents],
    }))

    // Event: Finance reacts by walking the received value from "Inventory in
    // Transit" into Raw Materials — see domainIntegrations.ts.
    appEvents.emit('po.receiptRecorded', { po: updatedPo, receipt: receiptEvent, isFullyReceived })
  },
}))

import type { Account, ApInvoice, ArInvoice, CostVarianceRecord, LedgerEntry } from '@/types'

/**
 * A small but real chart of accounts, enough to produce a genuine Balance
 * Sheet and Income Statement from double-entry postings — not a display-only
 * mock. Every ledger entry the app posts references one of these codes.
 */
export const chartOfAccounts: Account[] = [
  { code: '1000', name: 'Cash', type: 'asset', normalBalance: 'debit' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', normalBalance: 'debit' },
  // Sits between "PO approved" and "goods physically received" so a partial
  // delivery can move only the value actually received into Raw Materials —
  // see recordPoApproved / recordPoReceipt in financeStore.ts.
  { code: '1190', name: 'Inventory in Transit', type: 'asset', normalBalance: 'debit' },
  { code: '1200', name: 'Raw Materials Inventory', type: 'asset', normalBalance: 'debit' },
  { code: '1210', name: 'Work-In-Progress Inventory', type: 'asset', normalBalance: 'debit' },
  { code: '1220', name: 'Finished Goods Inventory', type: 'asset', normalBalance: 'debit' },

  { code: '2000', name: 'Accounts Payable', type: 'liability', normalBalance: 'credit' },

  { code: '3000', name: "Owner's Equity", type: 'equity', normalBalance: 'credit' },
  { code: '3900', name: 'Retained Earnings', type: 'equity', normalBalance: 'credit' },

  { code: '4000', name: 'Manufacturing Revenue', type: 'revenue', normalBalance: 'credit' },
  { code: '4900', name: 'FX Gain / (Loss)', type: 'revenue', normalBalance: 'credit' },

  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', normalBalance: 'debit' },
  { code: '5100', name: 'Material Waste Expense', type: 'expense', normalBalance: 'debit' },
  { code: '5200', name: 'Operating Expenses', type: 'expense', normalBalance: 'debit' },
]

/**
 * Opening balances, posted as ordinary (balanced) journal entries so the
 * Balance Sheet is coherent the moment the app loads: an owner contribution
 * funding cash and starting raw-material stock.
 */
export const openingLedgerEntries: LedgerEntry[] = [
  {
    id: 'gl-seed-1',
    date: '2026-01-02T09:00:00.000Z',
    memo: "Owner's capital contribution — opening cash balance",
    sourceModule: 'opening_balance',
    lines: [
      { accountCode: '1000', direction: 'debit', amount: 500000 },
      { accountCode: '3000', direction: 'credit', amount: 500000 },
    ],
  },
  {
    id: 'gl-seed-2',
    date: '2026-01-03T09:00:00.000Z',
    memo: 'Opening raw materials inventory balance',
    sourceModule: 'opening_balance',
    lines: [
      { accountCode: '1200', direction: 'debit', amount: 118500 },
      { accountCode: '3900', direction: 'credit', amount: 118500 },
    ],
  },
  {
    id: 'gl-seed-3',
    date: '2026-01-15T09:00:00.000Z',
    memo: 'Q1 operating expenses (rent, utilities, admin) paid in cash',
    sourceModule: 'opening_balance',
    lines: [
      { accountCode: '5200', direction: 'debit', amount: 42000 },
      { accountCode: '1000', direction: 'credit', amount: 42000 },
    ],
  },
]

export const apInvoices: ApInvoice[] = [
  {
    id: 'ap-seed-1',
    invoiceNumber: 'INV-SUP-8841',
    supplierName: 'Titan Alloys Co.',
    amount: 24600,
    issuedDate: '2026-07-28T00:00:00.000Z',
    dueDate: '2026-08-27T00:00:00.000Z',
    status: 'unpaid',
  },
  {
    id: 'ap-seed-2',
    invoiceNumber: 'INV-SUP-8852',
    supplierName: 'Precision Fasteners Inc.',
    amount: 8320,
    issuedDate: '2026-08-02T00:00:00.000Z',
    dueDate: '2026-08-16T00:00:00.000Z',
    status: 'unpaid',
  },
  {
    id: 'ap-seed-3',
    invoiceNumber: 'INV-SUP-8799',
    supplierName: 'Global Circuit Supply',
    amount: 15750,
    issuedDate: '2026-07-10T00:00:00.000Z',
    dueDate: '2026-08-09T00:00:00.000Z',
    status: 'paid',
    paidDate: '2026-08-05T00:00:00.000Z',
  },
]

export const arInvoices: ArInvoice[] = [
  {
    id: 'ar-seed-1',
    invoiceNumber: 'INV-CUST-3301',
    customerName: 'Vertex Automotive Group',
    amount: 68000,
    issuedDate: '2026-07-20T00:00:00.000Z',
    dueDate: '2026-08-19T00:00:00.000Z',
    status: 'unpaid',
  },
  {
    id: 'ar-seed-2',
    invoiceNumber: 'INV-CUST-3312',
    customerName: 'Alpine Aerospace Ltd.',
    amount: 41500,
    issuedDate: '2026-08-05T00:00:00.000Z',
    dueDate: '2026-09-04T00:00:00.000Z',
    status: 'unpaid',
  },
  {
    id: 'ar-seed-3',
    invoiceNumber: 'INV-CUST-3288',
    customerName: 'Meridian Electronics',
    amount: 29750,
    issuedDate: '2026-07-01T00:00:00.000Z',
    dueDate: '2026-07-31T00:00:00.000Z',
    status: 'paid',
    paidDate: '2026-07-25T00:00:00.000Z',
  },
]

// The GL entries backing the two AR invoices above that were already unpaid
// at seed time (revenue is recognized when the invoice is issued).
export const arSeedLedgerEntries: LedgerEntry[] = [
  {
    id: 'gl-seed-ar-1',
    date: arInvoices[0].issuedDate,
    memo: `Revenue recognized — ${arInvoices[0].invoiceNumber} (${arInvoices[0].customerName})`,
    sourceModule: 'ar',
    lines: [
      { accountCode: '1100', direction: 'debit', amount: arInvoices[0].amount },
      { accountCode: '4000', direction: 'credit', amount: arInvoices[0].amount },
    ],
  },
  {
    id: 'gl-seed-ar-2',
    date: arInvoices[1].issuedDate,
    memo: `Revenue recognized — ${arInvoices[1].invoiceNumber} (${arInvoices[1].customerName})`,
    sourceModule: 'ar',
    lines: [
      { accountCode: '1100', direction: 'debit', amount: arInvoices[1].amount },
      { accountCode: '4000', direction: 'credit', amount: arInvoices[1].amount },
    ],
  },
]

/**
 * Illustrative Standard-vs-Actual variance history. "Material Waste" and
 * "Scrap Loss" also grow live during the session — see `financeStore` — as
 * production runs complete and quality holds are dispositioned to scrap;
 * "Labor Overtime" stays as seeded historical data since nothing in this
 * demo currently generates overtime events.
 */
export const costVarianceSeed: CostVarianceRecord[] = [
  { month: 'Apr', category: 'Material Waste', standardAmount: 18000, actualAmount: 19200 },
  { month: 'Apr', category: 'Scrap Loss', standardAmount: 6000, actualAmount: 7100 },
  { month: 'Apr', category: 'Labor Overtime', standardAmount: 9000, actualAmount: 11400 },
  { month: 'May', category: 'Material Waste', standardAmount: 18500, actualAmount: 20100 },
  { month: 'May', category: 'Scrap Loss', standardAmount: 6200, actualAmount: 6800 },
  { month: 'May', category: 'Labor Overtime', standardAmount: 9200, actualAmount: 10500 },
  { month: 'Jun', category: 'Material Waste', standardAmount: 19000, actualAmount: 21800 },
  { month: 'Jun', category: 'Scrap Loss', standardAmount: 6400, actualAmount: 8200 },
  { month: 'Jun', category: 'Labor Overtime', standardAmount: 9400, actualAmount: 9900 },
  { month: 'Jul', category: 'Material Waste', standardAmount: 19500, actualAmount: 22400 },
  { month: 'Jul', category: 'Scrap Loss', standardAmount: 6600, actualAmount: 7500 },
  { month: 'Jul', category: 'Labor Overtime', standardAmount: 9600, actualAmount: 12800 },
  { month: 'Aug', category: 'Material Waste', standardAmount: 20000, actualAmount: 20000 },
  { month: 'Aug', category: 'Scrap Loss', standardAmount: 6800, actualAmount: 6800 },
  { month: 'Aug', category: 'Labor Overtime', standardAmount: 9800, actualAmount: 10200 },
]

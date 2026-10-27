// ---------------------------------------------------------------------------
// Domain model for the Manufacturing ERP demo. Everything here is designed
// to be trivially swappable for real API/DB-backed types later — these are
// the shapes a REST or GraphQL layer would also return.
// ---------------------------------------------------------------------------

export type UnitOfMeasure = 'ea' | 'kg' | 'g' | 'm' | 'cm' | 'L' | 'mL' | 'roll' | 'sheet' | 'box'

export type ProductCategory =
  | 'Electronics'
  | 'Automotive'
  | 'Industrial Equipment'
  | 'Consumer Goods'
  | 'Aerospace Components'

export type ProductionLine = 'Line A – Assembly' | 'Line B – Machining' | 'Line C – Fabrication' | 'Line D – Packaging'

// --- BOM -------------------------------------------------------------------

export type BomNodeType = 'finished_good' | 'sub_assembly' | 'raw_material' | 'routing_step'

export interface RoutingStepDetail {
  workCenter: string
  machineId: string
  setupTimeMinutes: number
  runTimeMinutesPerUnit: number
  standardLaborRatePerHour: number
  actualLaborRatePerHour: number
  machineRatePerHour: number
  overheadRatePerHour: number
}

/**
 * A single node in a multi-level BOM tree. Finished goods and sub-assemblies
 * contain `children` (raw materials, nested sub-assemblies, and routing
 * steps). Raw materials and routing steps are leaves.
 */
export interface BomNode {
  id: string
  type: BomNodeType
  name: string
  sku: string
  category?: ProductCategory
  quantityPer: number // quantity of this node required per parent unit
  uom: UnitOfMeasure
  standardUnitCost: number // engineering standard cost baseline
  actualUnitCost: number // last observed/actual cost (drifts from standard)
  scrapFactorPct: number // expected scrap/waste % applied on top of quantityPer
  routing?: RoutingStepDetail
  children?: BomNode[]
  notes?: string
}

export interface CostRollup {
  nodeId: string
  standardMaterialCost: number
  actualMaterialCost: number
  standardLaborCost: number
  actualLaborCost: number
  standardOverheadCost: number
  actualOverheadCost: number
  standardTotalCost: number
  actualTotalCost: number
  varianceAmount: number
  variancePct: number
}

// --- Inventory ---------------------------------------------------------------

export interface Lot {
  id: string
  lotNumber: string
  serialNumbers?: string[]
  quantity: number
  receivedDate: string
  expiryDate?: string
  supplier: string
  qualityStatus: 'released' | 'quarantine' | 'rejected'
  warehouseLocation: string
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: ProductCategory
  uom: UnitOfMeasure
  onHand: number
  reserved: number
  onOrder: number
  safetyStock: number
  reorderPoint: number
  reorderQuantity: number
  unitCost: number
  leadTimeDays: number
  preferredSupplierId: string
  warehouseLocation: string
  lots: Lot[]
  isSerialized: boolean
  type: 'raw_material' | 'sub_assembly' | 'finished_good'
}

export interface Supplier {
  id: string
  name: string
  rating: number // 1-5
  onTimeDeliveryPct: number
  leadTimeDays: number
  contact: string
}

// --- Purchase Orders / Procurement -----------------------------------------

/**
 * The full PO lifecycle. 'partially_received' and 'fully_completed' replace
 * the old single 'received' status now that receiving happens line-by-line
 * over one or more intake events instead of all-at-once.
 */
export type PurchaseOrderStatus = 'suggested' | 'drafted' | 'approved' | 'in_transit' | 'partially_received' | 'fully_completed' | 'cancelled'

export interface PurchaseOrderLine {
  id: string
  itemId: string
  sku: string
  itemName: string
  quantity: number
  /** Cumulative quantity physically received against this line so far (<= quantity). */
  quantityReceived: number
  unitCost: number
  requiredBy: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  createdDate: string
  expectedDate: string
  lines: PurchaseOrderLine[]
  totalValue: number
  sourceMrpRunId?: string
  /**
   * The currency this PO was actually negotiated/priced in. `totalValue` and
   * every line's `unitCost` are always stored in USD (the app's base
   * currency) regardless of this — `bookingRateUsd` is the USD value of one
   * unit of `bookingCurrency` at the time the PO was booked, which is what
   * the FX Variance Ledger compares against the *current* live rate.
   */
  bookingCurrency: CurrencyCode
  bookingRateUsd: number
}

/** One warehouse intake event against a PO — may cover only some lines, and only part of a line's ordered quantity. */
export interface PoReceiptEvent {
  id: string
  poId: string
  poNumber: string
  receivedAt: string
  receivedBy: string
  lines: { itemId: string; sku: string; itemName: string; quantityReceived: number; unitCost: number }[]
  totalValueReceived: number
}

// --- Globalization / Multi-currency ------------------------------------------

export type CurrencyCode = 'USD' | 'EUR' | 'GBP'

// --- MRP ---------------------------------------------------------------------

export interface MrpShortfall {
  itemId: string
  sku: string
  itemName: string
  requiredQty: number
  availableQty: number
  shortfallQty: number
  demandSources: string[] // production order numbers driving demand
  suggestedSupplierId: string
  suggestedOrderQty: number
  leadTimeDays: number
  neededBy: string
}

export interface MrpRunResult {
  id: string
  runAt: string
  ordersEvaluated: number
  itemsEvaluated: number
  shortfalls: MrpShortfall[]
  suggestedPOs: PurchaseOrder[]
}

// --- Production / Scheduler ---------------------------------------------------

export type ProductionOrderStatus = 'planned' | 'in_progress' | 'quality_hold' | 'completed' | 'cancelled'
export type Priority = 'low' | 'normal' | 'high' | 'critical'

export interface ProductionOrder {
  id: string
  orderNumber: string
  productId: string
  productName: string
  productSku: string
  quantityOrdered: number
  quantityCompleted: number
  quantityScrapped: number
  status: ProductionOrderStatus
  priority: Priority
  productionLine: ProductionLine
  machineId: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  standardCost: number
  actualCost: number
  qualityHoldReason?: string
  /** True while this order's machine is down/in-maintenance — set by the shop-floor simulator (or manual downtime logging) and cleared when the machine comes back. */
  isFrozen?: boolean
  frozenReason?: string
}

export type MachineStatus = 'running' | 'idle' | 'down' | 'maintenance'

export interface DowntimeEvent {
  id: string
  machineId: string
  reason: string
  start: string
  end?: string
  category: 'planned_maintenance' | 'breakdown' | 'changeover' | 'material_shortage'
}

export interface Machine {
  id: string
  name: string
  productionLine: ProductionLine
  status: MachineStatus
  capacityHoursPerDay: number
  utilizationPct: number
  downtimeEvents: DowntimeEvent[]
}

// --- Quality -------------------------------------------------------------------

export type DefectType =
  | 'Dimensional Non-Conformance'
  | 'Surface Finish Defect'
  | 'Material Contamination'
  | 'Assembly Misalignment'
  | 'Electrical Failure'
  | 'Cosmetic Blemish'
  | 'Missing Component'

export interface DefectLog {
  id: string
  productionOrderId: string
  defectType: DefectType
  quantityAffected: number
  severity: 'minor' | 'major' | 'critical'
  loggedAt: string
  loggedBy: string
  notes?: string
}

export interface QualityHold {
  id: string
  productionOrderId: string
  orderNumber: string
  productName: string
  lotId?: string
  quantityOnHold: number
  reason: string
  raisedAt: string
  status: 'open' | 'approved' | 'rejected'
  defects: DefectLog[]
  resolvedAt?: string
  resolvedBy?: string
  disposition?: 'use_as_is' | 'rework' | 'scrap' | 'return_to_supplier'
}

// --- Analytics -----------------------------------------------------------------

export interface OeeRecord {
  date: string
  productionLine: ProductionLine
  availability: number
  performance: number
  quality: number
}

export interface YieldRecord {
  month: string
  productionLine: ProductionLine
  category: ProductCategory
  unitsPlanned: number
  unitsProduced: number
  unitsScrapped: number
}

export interface FinancialVarianceRecord {
  month: string
  productionLine: ProductionLine
  standardMaterialCost: number
  actualMaterialCost: number
  standardLaborCost: number
  actualLaborCost: number
}

export interface ScrapRecord {
  month: string
  productionLine: ProductionLine
  defectType: DefectType
  quantity: number
}

// --- Finance / General Ledger --------------------------------------------------

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

/**
 * One row of the chart of accounts. `normalBalance` says which side (debit or
 * credit) *increases* this account — assets/expenses are debit-normal,
 * liabilities/equity/revenue are credit-normal. The financial-statement
 * calculators use this to turn a raw debit/credit balance into a signed
 * amount that reads correctly on a statement.
 */
export interface Account {
  code: string
  name: string
  type: AccountType
  normalBalance: 'debit' | 'credit'
}

export interface LedgerLine {
  accountCode: string
  direction: 'debit' | 'credit'
  amount: number
}

/**
 * One journal entry. `lines` must always balance (sum of debits === sum of
 * credits) — every store action that creates an entry is responsible for
 * upholding that, and `assertBalanced` (ledgerCalculations.ts) checks it.
 */
export interface LedgerEntry {
  id: string
  date: string
  memo: string
  sourceModule: 'procurement' | 'production' | 'quality' | 'ap' | 'ar' | 'opening_balance' | 'fx_revaluation'
  lines: LedgerLine[]
}

export type InvoiceStatus = 'unpaid' | 'paid'

export interface ApInvoice {
  id: string
  invoiceNumber: string
  supplierName: string
  poNumber?: string
  /** Amount owed, stored in USD (the base currency) exactly like every other ledger figure. */
  amount: number
  issuedDate: string
  dueDate: string
  status: InvoiceStatus
  paidDate?: string
  /** The currency + rate this invoice was originally booked in — feeds the FX Variance Ledger when the reporting currency changes. Omitted for invoices booked natively in USD (no FX exposure). */
  bookingCurrency?: CurrencyCode
  bookingRateUsd?: number
}

export interface ArInvoice {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  issuedDate: string
  dueDate: string
  status: InvoiceStatus
  paidDate?: string
}

export type CostVarianceCategory = 'Material Waste' | 'Scrap Loss' | 'Labor Overtime'

export interface CostVarianceRecord {
  month: string
  category: CostVarianceCategory
  standardAmount: number
  actualAmount: number
}

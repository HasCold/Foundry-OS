import type { PoReceiptEvent, PurchaseOrder } from '@/types'

// All monetary fields (unitCost, totalValue) are stored in USD, the app's
// base currency, regardless of `bookingCurrency` — see the PurchaseOrder
// type for why. bookingRateUsd is "USD per 1 unit of bookingCurrency" at the
// time the PO was placed, which the FX Variance Ledger compares against the
// live rate the user has dialed in via the currency switcher.
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-po-9001', poNumber: 'PUR-9001', supplierId: 'sup-2', supplierName: 'Pacific Circuit Supply', status: 'in_transit',
    createdDate: '2026-08-10', expectedDate: '2026-08-24',
    lines: [
      { id: 'pol-1', itemId: 'inv-rm-igbt', sku: 'RM-IGBT-600', itemName: 'IGBT Power Module 600V', quantity: 300, quantityReceived: 0, unitCost: 6.2, requiredBy: '2026-08-24' },
    ],
    totalValue: 1860,
    bookingCurrency: 'USD', bookingRateUsd: 1,
  },
  {
    id: 'po-po-9002', poNumber: 'PUR-9002', supplierId: 'sup-1', supplierName: 'Meridian Metals Co.', status: 'approved',
    createdDate: '2026-08-14', expectedDate: '2026-08-29',
    lines: [
      { id: 'pol-2', itemId: 'inv-rm-alu-hsg', sku: 'RM-ALU-HSG', itemName: 'Die-Cast Aluminum Housing', quantity: 100, quantityReceived: 0, unitCost: 14.2, requiredBy: '2026-08-29' },
    ],
    totalValue: 1420,
    // Negotiated with a German supplier in EUR; booked into the USD ledger at the rate on the day it was approved.
    bookingCurrency: 'EUR', bookingRateUsd: 1.08,
  },
  {
    id: 'po-po-9003', poNumber: 'PUR-9003', supplierId: 'sup-5', supplierName: 'Vertex Precision Machining', status: 'drafted',
    createdDate: '2026-08-15', expectedDate: '2026-08-31',
    lines: [
      { id: 'pol-3', itemId: 'inv-rm-gear24', sku: 'RM-GEAR-24T', itemName: 'Hardened Spur Gear 24T', quantity: 150, quantityReceived: 0, unitCost: 11.5, requiredBy: '2026-08-31' },
    ],
    totalValue: 1725,
    // A UK supplier quoted in GBP; not yet approved, so still exposed to FX movement between now and approval.
    bookingCurrency: 'GBP', bookingRateUsd: 1.26,
  },
  {
    id: 'po-po-9004', poNumber: 'PUR-9004', supplierId: 'sup-2', supplierName: 'Pacific Circuit Supply', status: 'fully_completed',
    createdDate: '2026-07-28', expectedDate: '2026-08-14',
    lines: [
      { id: 'pol-4', itemId: 'inv-rm-pcb-06', sku: 'RM-PCB-06', itemName: 'FR4 PCB Blank, 6-Layer', quantity: 200, quantityReceived: 200, unitCost: 8.4, requiredBy: '2026-08-14' },
    ],
    totalValue: 1680,
    bookingCurrency: 'USD', bookingRateUsd: 1,
  },
  {
    id: 'po-po-9005', poNumber: 'PUR-9005', supplierId: 'sup-3', supplierName: 'Continental Polymer Works', status: 'drafted',
    createdDate: '2026-08-19', expectedDate: '2026-09-01',
    lines: [
      { id: 'pol-5', itemId: 'inv-rm-abs-shl', sku: 'RM-ABS-SHL', itemName: 'ABS Injection-Molded Shell', quantity: 400, quantityReceived: 0, unitCost: 3.6, requiredBy: '2026-09-01' },
    ],
    totalValue: 1440,
    bookingCurrency: 'USD', bookingRateUsd: 1,
  },
  {
    id: 'po-po-9006', poNumber: 'PUR-9006', supplierId: 'sup-4', supplierName: 'Summit Fastener & Hardware', status: 'cancelled',
    createdDate: '2026-08-01', expectedDate: '2026-08-08',
    lines: [
      { id: 'pol-6', itemId: 'inv-rm-fast-m4', sku: 'RM-FAST-M4', itemName: 'M4 Hex Socket Screw', quantity: 5000, quantityReceived: 0, unitCost: 0.08, requiredBy: '2026-08-08' },
    ],
    totalValue: 400,
    bookingCurrency: 'USD', bookingRateUsd: 1,
  },
  {
    id: 'po-po-9007', poNumber: 'PUR-9007', supplierId: 'sup-1', supplierName: 'Meridian Metals Co.', status: 'partially_received',
    createdDate: '2026-08-05', expectedDate: '2026-08-20',
    lines: [
      { id: 'pol-7a', itemId: 'inv-rm-cast-di', sku: 'RM-CAST-DI', itemName: 'Ductile Iron Gearbox Casing', quantity: 100, quantityReceived: 40, unitCost: 22.4, requiredBy: '2026-08-20' },
      { id: 'pol-7b', itemId: 'inv-rm-alu-hsg', sku: 'RM-ALU-HSG', itemName: 'Die-Cast Aluminum Housing', quantity: 50, quantityReceived: 50, unitCost: 14.2, requiredBy: '2026-08-20' },
    ],
    totalValue: 2950,
    bookingCurrency: 'USD', bookingRateUsd: 1,
  },
]

// The intake history behind PUR-9007's partial status — one warehouse receipt
// covering both lines' first delivery.
export const poReceiptEvents: PoReceiptEvent[] = [
  {
    id: 'rcpt-seed-1',
    poId: 'po-po-9007',
    poNumber: 'PUR-9007',
    receivedAt: '2026-08-18T14:30:00.000Z',
    receivedBy: 'Warehouse — J. Alvarez',
    lines: [
      { itemId: 'inv-rm-cast-di', sku: 'RM-CAST-DI', itemName: 'Ductile Iron Gearbox Casing', quantityReceived: 40, unitCost: 22.4 },
      { itemId: 'inv-rm-alu-hsg', sku: 'RM-ALU-HSG', itemName: 'Die-Cast Aluminum Housing', quantityReceived: 50, unitCost: 14.2 },
    ],
    totalValueReceived: 40 * 22.4 + 50 * 14.2,
  },
]

import type { PoReceiptEvent, ProductionOrder, PurchaseOrder, QualityHold } from './index'

/**
 * The full list of cross-module domain events used by `src/lib/appEvents.ts`.
 *
 * To wire a new module up to something that happens elsewhere in the app:
 *   1. Add the event shape here.
 *   2. `emit()` it from the store where the action actually happens.
 *   3. `on()` it in `src/app/domainIntegrations.ts` and react to it.
 * That's the entire integration contract — no other file needs to change.
 */
export interface AppEvents {
  /** A purchase order was approved (either directly, or converted from an MRP suggestion). */
  'po.approved': { po: PurchaseOrder }
  /** A warehouse intake was logged against a PO — may be partial. `isFullyReceived` tells listeners whether the PO just closed out. */
  'po.receiptRecorded': { po: PurchaseOrder; receipt: PoReceiptEvent; isFullyReceived: boolean }
  /** A production order finished (moved to the "completed" phase). */
  'production.completed': { order: ProductionOrder }
  /** A QA hold was closed out, either approved or rejected, with a disposition. */
  'quality.holdResolved': { hold: QualityHold; decision: 'approved' | 'rejected' }
  // Index signature so this satisfies createEventBus's generic constraint
  // (Record<string, unknown>) — every property above is still fully typed;
  // this only affects unknown/dynamic keys, which the bus never uses.
  [eventName: string]: unknown
}

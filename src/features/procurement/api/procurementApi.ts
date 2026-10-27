import type { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { mockNetwork } from '@/lib/mock-async'
import { useProcurementStore, type ReceiptLineInput } from '../store/procurementStore'

export const procurementApi = {
  fetchPOs: () => mockNetwork(() => useProcurementStore.getState().purchaseOrders),

  approveSuggested: (suggested: PurchaseOrder) =>
    mockNetwork(() => {
      useProcurementStore.getState().approveSuggested(suggested)
      return true
    }),

  advanceStatus: (args: { poId: string; status: PurchaseOrderStatus }) =>
    mockNetwork(() => {
      useProcurementStore.getState().advanceStatus(args.poId, args.status)
      return true
    }),

  recordReceipt: (args: { poId: string; lineInputs: ReceiptLineInput[]; receivedBy: string }) =>
    mockNetwork(() => {
      useProcurementStore.getState().recordReceipt(args.poId, args.lineInputs, args.receivedBy)
      return true
    }),
}

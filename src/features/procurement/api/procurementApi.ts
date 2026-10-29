import type { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { mockNetwork } from '@/lib/mock-async'
import { useProcurementStore, type ReceiptLineInput } from '../store/procurementStore'
import { authorize } from '@/features/rbac/api/authorize'

export const procurementApi = {
  fetchPOs: () => mockNetwork(() => useProcurementStore.getState().purchaseOrders),

  approveSuggested: (suggested: PurchaseOrder) =>
    mockNetwork(() => {
      authorize('procurement', 'approve')
      useProcurementStore.getState().approveSuggested(suggested)
      return true
    }),

  advanceStatus: (args: { poId: string; status: PurchaseOrderStatus }) =>
    mockNetwork(() => {
      // Moving a draft to "approved" is a sign-off; every other step is routine data entry.
      authorize('procurement', args.status === 'approved' ? 'approve' : 'write')
      useProcurementStore.getState().advanceStatus(args.poId, args.status)
      return true
    }),

  recordReceipt: (args: { poId: string; lineInputs: ReceiptLineInput[]; receivedBy: string }) =>
    mockNetwork(() => {
      authorize('procurement', 'write')
      useProcurementStore.getState().recordReceipt(args.poId, args.lineInputs, args.receivedBy)
      return true
    }),
}

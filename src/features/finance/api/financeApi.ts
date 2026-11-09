import { mockNetwork } from '@/lib/mock-async'
import { useFinanceStore } from '../store/financeStore'
import { authorize } from '@/features/rbac/api/authorize'

export const financeApi = {
  processApPayment: (invoiceId: string) =>
    mockNetwork(() => {
      // Paying a supplier releases cash, so it needs sign-off; recording incoming money doesn't.
      authorize('finance', 'approve')
      useFinanceStore.getState().processApPayment(invoiceId)
      return true
    }),

  processArPayment: (invoiceId: string) =>
    mockNetwork(() => {
      authorize('finance', 'write')
      useFinanceStore.getState().processArPayment(invoiceId)
      return true
    }),

  recordSale: (args: { customerName: string; saleAmount: number; cogsAmount: number }) =>
    mockNetwork(() => {
      authorize('finance', 'write')
      useFinanceStore.getState().recordSale(args.customerName, args.saleAmount, args.cogsAmount)
      return true
    }),
}

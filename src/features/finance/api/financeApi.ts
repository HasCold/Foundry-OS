import { mockNetwork } from '@/lib/mock-async'
import { useFinanceStore } from '../store/financeStore'

export const financeApi = {
  processApPayment: (invoiceId: string) =>
    mockNetwork(() => {
      useFinanceStore.getState().processApPayment(invoiceId)
      return true
    }),

  processArPayment: (invoiceId: string) =>
    mockNetwork(() => {
      useFinanceStore.getState().processArPayment(invoiceId)
      return true
    }),

  recordSale: (args: { customerName: string; saleAmount: number; cogsAmount: number }) =>
    mockNetwork(() => {
      useFinanceStore.getState().recordSale(args.customerName, args.saleAmount, args.cogsAmount)
      return true
    }),
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { useProcurementStore, type ReceiptLineInput } from '../store/procurementStore'
import { useMrpStore } from '@/features/inventory/store/mrpStore'
import { procurementApi } from '../api/procurementApi'
import { toast } from '@/components/ui/toast-store'

export function useProcurement() {
  const purchaseOrders = useProcurementStore((s) => s.purchaseOrders)
  const receiptEvents = useProcurementStore((s) => s.receiptEvents)
  const lastRun = useMrpStore((s) => s.lastRun)
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['procurement'] })

  const approveMutation = useMutation({
    mutationFn: procurementApi.approveSuggested,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Purchase order approved', description: 'On-order inventory balance updated.', variant: 'success' })
    },
  })

  const advanceMutation = useMutation({
    mutationFn: procurementApi.advanceStatus,
    onSuccess: (_d, vars) => {
      invalidate()
      toast({ title: `PO marked ${vars.status.replace('_', ' ')}`, variant: 'success' })
    },
  })

  const receiptMutation = useMutation({
    mutationFn: procurementApi.recordReceipt,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Receipt logged', description: 'On-hand inventory and the PO balance were updated.', variant: 'success' })
    },
  })

  return {
    purchaseOrders,
    receiptEvents,
    suggestedPOs: lastRun?.suggestedPOs ?? [],
    approveSuggested: (po: PurchaseOrder) => approveMutation.mutate(po),
    advanceStatus: (poId: string, status: PurchaseOrderStatus) => advanceMutation.mutate({ poId, status }),
    recordReceipt: (poId: string, lineInputs: ReceiptLineInput[], receivedBy: string) => receiptMutation.mutate({ poId, lineInputs, receivedBy }),
    isRecordingReceipt: receiptMutation.isPending,
  }
}

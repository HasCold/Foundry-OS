import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { DefectLog, QualityHold } from '@/types'
import { useQualityStore } from '../store/qualityStore'
import { qualityApi } from '../api/qualityApi'
import { toast } from '@/components/ui/toast-store'

export function useQuality() {
  const holds = useQualityStore((s) => s.holds)
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['quality'] })
    queryClient.invalidateQueries({ queryKey: ['scheduler'] })
  }

  const defectMutation = useMutation({
    mutationFn: qualityApi.logDefect,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Defect logged', variant: 'default' })
    },
  })

  const resolveMutation = useMutation({
    mutationFn: qualityApi.resolveHold,
    onSuccess: (_d, vars) => {
      invalidate()
      toast({
        title: vars.decision === 'approved' ? 'Batch approved' : 'Batch rejected',
        description: 'Inventory availability and order status updated.',
        variant: vars.decision === 'approved' ? 'success' : 'destructive',
      })
    },
  })

  return {
    holds,
    openHolds: holds.filter((h) => h.status === 'open'),
    resolvedHolds: holds.filter((h) => h.status !== 'open'),
    logDefect: (holdId: string, defect: Omit<DefectLog, 'id' | 'productionOrderId' | 'loggedAt'>) => defectMutation.mutate({ holdId, defect }),
    resolveHold: (holdId: string, decision: 'approved' | 'rejected', disposition: QualityHold['disposition'], resolvedBy: string) =>
      resolveMutation.mutate({ holdId, decision, disposition, resolvedBy }),
  }
}

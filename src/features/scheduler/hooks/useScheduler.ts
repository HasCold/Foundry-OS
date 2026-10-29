import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { DowntimeEvent, ProductionOrderStatus } from '@/types'
import { useSchedulerStore } from '../store/schedulerStore'
import { schedulerApi } from '../api/schedulerApi'
import { computeMachineLoad } from '../utils/capacity'
import { toast } from '@/components/ui/toast-store'

export const SCHEDULER_QUERY_KEY = ['scheduler']

export function useScheduler() {
  const orders = useSchedulerStore((s) => s.orders)
  const machines = useSchedulerStore((s) => s.machines)
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: SCHEDULER_QUERY_KEY })

  const statusMutation = useMutation({
    mutationFn: schedulerApi.setOrderStatus,
    onSuccess: (_data, vars) => {
      invalidate()
      toast({ title: `Order moved to ${vars.status.replace('_', ' ')}`, variant: 'success' })
    },
  })

  const downtimeMutation = useMutation({
    mutationFn: schedulerApi.startDowntime,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Downtime logged', description: 'Machine capacity gauge updated.', variant: 'warning' })
    },
  })

  const resolveDowntimeMutation = useMutation({
    mutationFn: schedulerApi.resolveDowntime,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Machine back online', variant: 'success' })
    },
  })

  const machineLoads = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeMachineLoad>>()
    machines.forEach((m) => map.set(m.id, computeMachineLoad(m, orders)))
    return map
  }, [machines, orders])

  // Live id -> display-name lookup, always derived from the current store state.
  // Components should use this instead of importing the static mock machine list,
  // which would silently go stale the moment a machine is edited (e.g. downtime).
  const machineNameById = useMemo(() => new Map(machines.map((m) => [m.id, m.name])), [machines])

  return {
    orders,
    machines,
    machineLoads,
    machineNameById,
    setOrderStatus: (orderId: string, status: ProductionOrderStatus) => statusMutation.mutate({ orderId, status }),
    startDowntime: (machineId: string, reason: string, category: DowntimeEvent['category']) =>
      downtimeMutation.mutate({ machineId, reason, category }),
    resolveDowntime: (machineId: string, downtimeId: string) => resolveDowntimeMutation.mutate({ machineId, downtimeId }),
  }
}

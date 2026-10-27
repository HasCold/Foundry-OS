import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useInventoryStore } from '../store/inventoryStore'
import { useMrpStore } from '../store/mrpStore'
import { inventoryApi } from '../api/inventoryApi'
import { toast } from '@/components/ui/toast-store'

export function useInventory() {
  const items = useInventoryStore((s) => s.items)
  const lastRun = useMrpStore((s) => s.lastRun)
  const queryClient = useQueryClient()

  const mrpMutation = useMutation({
    mutationFn: inventoryApi.runMrp,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] })
      if (result.shortfalls.length === 0) {
        toast({ title: 'MRP simulation complete', description: 'No shortfalls — all demand is covered.', variant: 'success' })
      } else {
        toast({
          title: 'MRP simulation complete',
          description: `${result.shortfalls.length} shortfall${result.shortfalls.length === 1 ? '' : 's'} found across ${result.ordersEvaluated} open orders.`,
          variant: 'warning',
        })
      }
    },
  })

  return {
    items,
    lastRun,
    runMrpSimulation: () => mrpMutation.mutate(),
    isRunningMrp: mrpMutation.isPending,
  }
}

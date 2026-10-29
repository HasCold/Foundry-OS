import type { DowntimeEvent, ProductionOrderStatus } from '@/types'
import { mockNetwork } from '@/lib/mock-async'
import { useSchedulerStore } from '../store/schedulerStore'
import { authorize } from '@/features/rbac/api/authorize'

export const schedulerApi = {
  fetchAll: () =>
    mockNetwork(() => ({
      orders: useSchedulerStore.getState().orders,
      machines: useSchedulerStore.getState().machines,
    })),

  setOrderStatus: (args: { orderId: string; status: ProductionOrderStatus }) =>
    mockNetwork(() => {
      authorize('scheduler', 'write')
      useSchedulerStore.getState().setOrderStatus(args.orderId, args.status)
      return true
    }, { delay: 220 }),

  startDowntime: (args: { machineId: string; reason: string; category: DowntimeEvent['category'] }) =>
    mockNetwork(() => {
      authorize('scheduler', 'write')
      useSchedulerStore.getState().startDowntime(args.machineId, args.reason, args.category)
      return true
    }),

  resolveDowntime: (args: { machineId: string; downtimeId: string }) =>
    mockNetwork(() => {
      authorize('scheduler', 'write')
      useSchedulerStore.getState().resolveDowntime(args.machineId, args.downtimeId)
      return true
    }),
}

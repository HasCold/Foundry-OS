import { mockNetwork } from '@/lib/mock-async'
import { useInventoryStore } from '../store/inventoryStore'
import { useMrpStore } from '../store/mrpStore'
import { authorize } from '@/features/rbac/api/authorize'

export const inventoryApi = {
  fetchItems: () => mockNetwork(() => useInventoryStore.getState().items),

  runMrp: () =>
    mockNetwork(() => {
      authorize('inventory', 'write')
      return useMrpStore.getState().runSimulation()
    }, { delay: 1100 }),
}

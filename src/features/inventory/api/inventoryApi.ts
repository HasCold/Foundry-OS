import { mockNetwork } from '@/lib/mock-async'
import { useInventoryStore } from '../store/inventoryStore'
import { useMrpStore } from '../store/mrpStore'

export const inventoryApi = {
  fetchItems: () => mockNetwork(() => useInventoryStore.getState().items),

  runMrp: () =>
    mockNetwork(() => useMrpStore.getState().runSimulation(), { delay: 1100 }),
}

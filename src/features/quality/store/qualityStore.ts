import { create } from 'zustand'
import type { DefectLog, QualityHold } from '@/types'
import { qualityHolds as initialHolds } from '@/mock/quality'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'
import { appEvents } from '@/lib/appEvents'
import { nextId } from '@/lib/utils'

interface QualityState {
  holds: QualityHold[]
  logDefect: (holdId: string, defect: Omit<DefectLog, 'id' | 'productionOrderId' | 'loggedAt'>) => void
  resolveHold: (holdId: string, decision: 'approved' | 'rejected', disposition: QualityHold['disposition'], resolvedBy: string) => void
}

export const useQualityStore = create<QualityState>((set, get) => ({
  holds: initialHolds,

  logDefect: (holdId, defect) =>
    set((state) => ({
      holds: state.holds.map((h) =>
        h.id === holdId
          ? { ...h, defects: [...h.defects, { ...defect, id: nextId('df'), productionOrderId: h.productionOrderId, loggedAt: new Date().toISOString() }] }
          : h,
      ),
    })),

  resolveHold: (holdId, decision, disposition, resolvedBy) => {
    const hold = get().holds.find((h) => h.id === holdId)
    if (!hold) return
    set((state) => ({
      holds: state.holds.map((h) =>
        h.id === holdId ? { ...h, status: decision, disposition, resolvedAt: new Date().toISOString(), resolvedBy } : h,
      ),
    }))
    // Direct calls: releasing inventory and closing out the production order are
    // both immediate, same-domain consequences of resolving a hold.
    useInventoryStore.getState().releaseQuantityByName(hold.productName, hold.quantityOnHold, disposition ?? 'scrap')
    // Approved batches clear the shop floor; rejected/scrapped batches are written off but the order still exits the hold queue.
    useSchedulerStore.getState().setOrderStatus(hold.productionOrderId, 'completed')

    // Event: Finance listens for this to book a scrap-loss expense when the
    // disposition is 'scrap' — Quality itself has no idea Finance exists.
    const resolvedHold = get().holds.find((h) => h.id === holdId)
    if (resolvedHold) appEvents.emit('quality.holdResolved', { hold: resolvedHold, decision })
  },
}))

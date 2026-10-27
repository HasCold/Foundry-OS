import { create } from 'zustand'
import type { MrpRunResult } from '@/types'
import { runMrpSimulation } from '../utils/mrpEngine'
import { useInventoryStore } from './inventoryStore'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'
import { useBomStore } from '@/features/bom/store/bomStore'

interface MrpState {
  lastRun: MrpRunResult | null
  runSimulation: () => MrpRunResult
  removeSuggestedPO: (poId: string) => void
}

export const useMrpStore = create<MrpState>((set) => ({
  lastRun: null,
  runSimulation: () => {
    const result = runMrpSimulation({
      productionOrders: useSchedulerStore.getState().orders,
      bomTrees: useBomStore.getState().trees,
      inventoryItems: useInventoryStore.getState().items,
    })
    set({ lastRun: result })
    return result
  },
  removeSuggestedPO: (poId) =>
    set((state) =>
      state.lastRun ? { lastRun: { ...state.lastRun, suggestedPOs: state.lastRun.suggestedPOs.filter((p) => p.id !== poId) } } : state,
    ),
}))

import { create } from 'zustand'

interface SimulatorState {
  /** Whether the background shop-floor tick loop is currently running. Toggled by
   *  the operator from the Scheduler page — off by default so the app starts calm. */
  isActive: boolean
  toggle: () => void
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  isActive: false,
  toggle: () => set((s) => ({ isActive: !s.isActive })),
}))

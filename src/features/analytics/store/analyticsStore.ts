import { create } from 'zustand'
import type { ProductCategory, ProductionLine } from '@/types'

export type DateRangePreset = 3 | 6

interface AnalyticsFilterState {
  months: DateRangePreset
  line: ProductionLine | 'all'
  category: ProductCategory | 'all'
  setMonths: (m: DateRangePreset) => void
  setLine: (l: ProductionLine | 'all') => void
  setCategory: (c: ProductCategory | 'all') => void
}

export const useAnalyticsFilterStore = create<AnalyticsFilterState>((set) => ({
  months: 6,
  line: 'all',
  category: 'all',
  setMonths: (months) => set({ months }),
  setLine: (line) => set({ line }),
  setCategory: (category) => set({ category }),
}))

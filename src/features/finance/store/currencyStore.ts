import { create } from 'zustand'
import type { CurrencyCode } from '@/types'

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', GBP: '£' }

/** USD value of one unit of each currency, on the day this app's mock POs were booked. Never changes — `liveRates` is what drifts. */
export const BASELINE_RATES_USD: Record<CurrencyCode, number> = { USD: 1, EUR: 1.08, GBP: 1.26 }

interface CurrencyState {
  /** Which currency the whole app formats monetary figures in — a pure display choice, never changes what's actually booked (everything is stored in USD). */
  activeCurrency: CurrencyCode
  /** Simulated "current market rate" (USD per unit), drifted by the shop-floor simulator's background tick — this is what creates FX variance against the fixed booking rate on foreign-currency POs/invoices. */
  liveRates: Record<CurrencyCode, number>
  setActiveCurrency: (currency: CurrencyCode) => void
  /** A small random walk (~±1%) on the non-USD rates — called by the simulator tick, or manually for a "refresh rates" affordance. */
  nudgeLiveRates: () => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  activeCurrency: 'USD',
  liveRates: { ...BASELINE_RATES_USD },

  setActiveCurrency: (activeCurrency) => set({ activeCurrency }),

  nudgeLiveRates: () =>
    set((state) => {
      const jitter = (rate: number) => Math.max(0.5, +(rate * (1 + (Math.random() - 0.5) * 0.02)).toFixed(4))
      return { liveRates: { USD: 1, EUR: jitter(state.liveRates.EUR), GBP: jitter(state.liveRates.GBP) } }
    }),
}))

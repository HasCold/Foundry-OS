import { useCallback } from 'react'
import { useCurrencyStore } from '../store/currencyStore'
import type { CurrencyCode } from '@/types'

/**
 * The one hook every money-displaying component in Finance, Inventory, and
 * Procurement uses instead of the static `formatCurrency` helper. Every
 * dollar figure in this app's state is stored in USD — `formatMoney` is
 * purely a display-time conversion using the currently selected currency's
 * live rate, so switching currencies never mutates any underlying data.
 */
export function useCurrency() {
  const activeCurrency = useCurrencyStore((s) => s.activeCurrency)
  const liveRates = useCurrencyStore((s) => s.liveRates)
  const setActiveCurrency = useCurrencyStore((s) => s.setActiveCurrency)
  const nudgeLiveRates = useCurrencyStore((s) => s.nudgeLiveRates)

  const formatMoney = useCallback(
    (amountUsd: number, opts: { compact?: boolean } = {}) => {
      const converted = amountUsd / liveRates[activeCurrency]
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: activeCurrency,
        maximumFractionDigits: opts.compact ? 1 : 2,
        notation: opts.compact ? 'compact' : 'standard',
      }).format(converted)
    },
    [activeCurrency, liveRates],
  )

  return {
    activeCurrency,
    liveRates,
    setActiveCurrency: (currency: CurrencyCode) => setActiveCurrency(currency),
    nudgeLiveRates,
    formatMoney,
  }
}

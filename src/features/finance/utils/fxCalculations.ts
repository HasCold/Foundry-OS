import type { ApInvoice, CurrencyCode } from '@/types'

/**
 * One outstanding foreign-currency payable's exposure: what it was booked at
 * vs. what today's live rate says it's actually worth in USD right now.
 */
export interface FxVarianceLine {
  invoiceNumber: string
  supplierName: string
  bookingCurrency: CurrencyCode
  amountUsd: number
  bookingRateUsd: number
  currentRateUsd: number
  /** Positive = favorable (the liability got cheaper in USD terms since booking); negative = unfavorable. */
  varianceUsd: number
}

/**
 * The FX Variance Ledger: every still-unpaid AP invoice that was booked in a
 * foreign currency, revalued at today's live rate. This is a live,
 * unrealized mark-to-market figure — it is intentionally never posted to the
 * permanent general ledger (see financeStore.ts), only surfaced here and on
 * the Income Statement as a supplementary disclosure, exactly like a real
 * company would footnote FX translation exposure without booking it until
 * the invoice is actually settled.
 */
export function computeFxVariance(apInvoices: ApInvoice[], liveRates: Record<CurrencyCode, number>): FxVarianceLine[] {
  return apInvoices
    .filter((inv): inv is ApInvoice & { bookingCurrency: CurrencyCode; bookingRateUsd: number } =>
      inv.status === 'unpaid' && !!inv.bookingCurrency && inv.bookingCurrency !== 'USD' && !!inv.bookingRateUsd,
    )
    .map((inv) => {
      const currentRateUsd = liveRates[inv.bookingCurrency]
      // The invoice's fixed face value in its own currency, back-calculated from what was booked in USD.
      const faceValueForeign = inv.amount / inv.bookingRateUsd
      const currentUsdValue = faceValueForeign * currentRateUsd
      return {
        invoiceNumber: inv.invoiceNumber,
        supplierName: inv.supplierName,
        bookingCurrency: inv.bookingCurrency,
        amountUsd: inv.amount,
        bookingRateUsd: inv.bookingRateUsd,
        currentRateUsd,
        varianceUsd: inv.amount - currentUsdValue,
      }
    })
}

export function sumFxVariance(lines: FxVarianceLine[]): number {
  return lines.reduce((sum, l) => sum + l.varianceUsd, 0)
}

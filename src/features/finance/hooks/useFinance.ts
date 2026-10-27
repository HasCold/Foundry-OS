import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFinanceStore } from '../store/financeStore'
import { useCurrencyStore } from '../store/currencyStore'
import { financeApi } from '../api/financeApi'
import { computeBalanceSheet, computeIncomeStatement } from '../utils/ledgerCalculations'
import { computeFxVariance, sumFxVariance } from '../utils/fxCalculations'
import { toast } from '@/components/ui/toast-store'

export const FINANCE_QUERY_KEY = ['finance']

/**
 * The one hook every Finance component uses. It exposes the raw ledger data
 * for the log/board views, plus the two statements — recomputed via
 * `useMemo` from `entries` on every change, so approving a PO or completing
 * a production run is reflected on the Balance Sheet/Income Statement
 * immediately, with no separate "recalculate" step anywhere.
 */
export function useFinance() {
  const accounts = useFinanceStore((s) => s.accounts)
  const entries = useFinanceStore((s) => s.entries)
  const apInvoices = useFinanceStore((s) => s.apInvoices)
  const arInvoices = useFinanceStore((s) => s.arInvoices)
  const costVariance = useFinanceStore((s) => s.costVariance)
  const liveRates = useCurrencyStore((s) => s.liveRates)
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY })

  const balanceSheet = useMemo(() => computeBalanceSheet(accounts, entries), [accounts, entries])
  const incomeStatement = useMemo(() => computeIncomeStatement(accounts, entries), [accounts, entries])
  // Unrealized mark-to-market on outstanding foreign-currency payables — recomputed whenever the
  // live FX rates drift (via the shop-floor simulator's background tick) or AP invoices change.
  const fxVarianceLines = useMemo(() => computeFxVariance(apInvoices, liveRates), [apInvoices, liveRates])
  const fxVarianceTotal = useMemo(() => sumFxVariance(fxVarianceLines), [fxVarianceLines])

  const payApMutation = useMutation({
    mutationFn: financeApi.processApPayment,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Payment sent', description: 'Cash and Accounts Payable updated.', variant: 'success' })
    },
  })

  const collectArMutation = useMutation({
    mutationFn: financeApi.processArPayment,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Payment received', description: 'Cash and Accounts Receivable updated.', variant: 'success' })
    },
  })

  const recordSaleMutation = useMutation({
    mutationFn: financeApi.recordSale,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Sale recorded', description: 'Revenue and COGS posted to the general ledger.', variant: 'success' })
    },
  })

  return {
    accounts,
    entries,
    apInvoices,
    arInvoices,
    costVariance,
    balanceSheet,
    incomeStatement,
    fxVarianceLines,
    fxVarianceTotal,

    processApPayment: (invoiceId: string) => payApMutation.mutate(invoiceId),
    processArPayment: (invoiceId: string) => collectArMutation.mutate(invoiceId),
    recordSale: (customerName: string, saleAmount: number, cogsAmount: number) =>
      recordSaleMutation.mutate({ customerName, saleAmount, cogsAmount }),
  }
}

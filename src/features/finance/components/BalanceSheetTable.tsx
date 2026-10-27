import type { BalanceSheet } from '../utils/ledgerCalculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '../hooks/useCurrency'
import { AlertTriangle } from 'lucide-react'

/** Renders one section (Assets, Liabilities, or Equity) as a list of account rows plus a bold total. */
function StatementSection({
  title,
  rows,
  total,
  formatMoney,
}: {
  title: string
  rows: { account: { name: string }; balance: number }[]
  total: number
  formatMoney: (amountUsd: number) => string
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.account.name} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.account.name}</span>
            <span className="font-medium tabular-nums">{formatMoney(row.balance)}</span>
          </div>
        ))}
      </div>
      <Separator className="my-1.5" />
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Total {title}</span>
        <span className="tabular-nums">{formatMoney(total)}</span>
      </div>
    </div>
  )
}

export function BalanceSheetTable({ balanceSheet }: { balanceSheet: BalanceSheet }) {
  const { formatMoney } = useCurrency()
  const isBalanced = Math.abs(balanceSheet.outOfBalanceBy) < 0.01

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Balance Sheet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatementSection title="Assets" rows={balanceSheet.assets} total={balanceSheet.totalAssets} formatMoney={formatMoney} />
        <StatementSection title="Liabilities" rows={balanceSheet.liabilities} total={balanceSheet.totalLiabilities} formatMoney={formatMoney} />
        <StatementSection title="Equity" rows={balanceSheet.equity} total={balanceSheet.totalEquity} formatMoney={formatMoney} />

        {!isBalanced && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Out of balance by {formatMoney(balanceSheet.outOfBalanceBy)} — this would indicate a bug in a ledger posting.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

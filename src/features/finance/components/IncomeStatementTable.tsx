import type { IncomeStatement } from '../utils/ledgerCalculations'
import type { FxVarianceLine } from '../utils/fxCalculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPercent } from '@/lib/utils'
import { useCurrency } from '../hooks/useCurrency'

export function IncomeStatementTable({
  incomeStatement,
  fxVarianceLines,
  fxVarianceTotal,
}: {
  incomeStatement: IncomeStatement
  fxVarianceLines: FxVarianceLine[]
  fxVarianceTotal: number
}) {
  const { formatMoney } = useCurrency()
  const opex = incomeStatement.expenses.filter((e) => e.account.code !== '5000')

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Income Statement (P&L)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {incomeStatement.revenue.map((r) => (
          <div key={r.account.name} className="flex items-center justify-between">
            <span className="text-muted-foreground">{r.account.name}</span>
            <span className="font-medium tabular-nums">{formatMoney(r.balance)}</span>
          </div>
        ))}

        <div className="flex items-center justify-between text-destructive">
          <span>Cost of Goods Sold</span>
          <span className="font-medium tabular-nums">({formatMoney(incomeStatement.cogs)})</span>
        </div>

        <Separator />
        <div className="flex items-center justify-between font-semibold">
          <span>Gross Profit</span>
          <span className="tabular-nums">{formatMoney(incomeStatement.grossProfit)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Gross Profit Margin</span>
          <span className="tabular-nums">{formatPercent(incomeStatement.grossMargin)}</span>
        </div>

        <Separator />
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operating Expenses</p>
        {opex.map((e) => (
          <div key={e.account.name} className="flex items-center justify-between text-destructive">
            <span>{e.account.name}</span>
            <span className="font-medium tabular-nums">({formatMoney(e.balance)})</span>
          </div>
        ))}

        <Separator />
        <div className="flex items-center justify-between text-base font-bold">
          <span>Net Income</span>
          <span className={`tabular-nums ${incomeStatement.netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatMoney(incomeStatement.netIncome)}
          </span>
        </div>

        {fxVarianceLines.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FX Gain / (Loss) — unrealized</p>
                <span className={`text-sm font-semibold tabular-nums ${fxVarianceTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatMoney(fxVarianceTotal)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Mark-to-market on {fxVarianceLines.length} outstanding foreign-currency payable{fxVarianceLines.length === 1 ? '' : 's'} at today's
                live rate — not posted to the ledger until settled. See the FX Variance Ledger tab for the line-by-line breakdown.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

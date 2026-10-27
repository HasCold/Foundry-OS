import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CostVarianceCategory, CostVarianceRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { CATEGORICAL, CHART_CHROME } from '@/lib/chartPalette'
import { useCurrency } from '../hooks/useCurrency'

const CATEGORIES: CostVarianceCategory[] = ['Material Waste', 'Scrap Loss', 'Labor Overtime']

/**
 * One small-multiple chart per variance category rather than one combined
 * chart — the three categories aren't naturally comparable on one axis, and
 * splitting them keeps each Standard-vs-Actual comparison legible.
 */
export function CostVarianceCharts({ data }: { data: CostVarianceRecord[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {CATEGORIES.map((category) => (
        <VarianceChart key={category} category={category} data={data.filter((d) => d.category === category)} />
      ))}
    </div>
  )
}

function VarianceChart({ category, data }: { category: CostVarianceCategory; data: CostVarianceRecord[] }) {
  const { formatMoney } = useCurrency()
  const latest = data[data.length - 1]
  const overrun = latest ? latest.actualAmount - latest.standardAmount : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{category}</CardTitle>
        <CardDescription>
          This month:{' '}
          <span className={overrun > 0 ? 'font-medium text-destructive' : 'font-medium text-success'}>
            {overrun >= 0 ? '+' : ''}
            {formatMoney(overrun, { compact: true })}
          </span>{' '}
          vs. standard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: CHART_CHROME.muted }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => formatMoney(v, { compact: true })}
            />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => formatMoney(v)} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Bar dataKey="standardAmount" name="Standard" fill={CATEGORICAL[0]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="actualAmount" name="Actual" fill={CATEGORICAL[1]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

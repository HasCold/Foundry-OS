import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { CATEGORICAL, CHART_CHROME } from '@/lib/chartPalette'
import { formatCurrency } from '@/lib/utils'
import type { FinancialPoint } from '../utils/aggregate'

export function FinancialVarianceChart({ data }: { data: FinancialPoint[] }) {
  const totalVariance = data.reduce((s, d) => s + (d.actualMaterial - d.standardMaterial) + (d.actualLabor - d.standardLabor), 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Financial Variance — Material vs. Labor</CardTitle>
        <CardDescription>
          Standard vs. actual cost by month.{' '}
          <span className={totalVariance > 0 ? 'font-medium text-destructive' : 'font-medium text-success'}>
            {totalVariance >= 0 ? '+' : ''}
            {formatCurrency(totalVariance, { compact: true })}
          </span>{' '}
          net variance in range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => formatCurrency(v, { compact: true })} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => formatCurrency(v)} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Bar dataKey="standardMaterial" name="Standard Material" fill={CATEGORICAL[0]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="actualMaterial" name="Actual Material" fill={CATEGORICAL[1]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="standardLabor" name="Standard Labor" fill={CATEGORICAL[2]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="actualLabor" name="Actual Labor" fill={CATEGORICAL[3]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

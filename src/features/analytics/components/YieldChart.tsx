import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { CATEGORICAL, CHART_CHROME } from '@/lib/chartPalette'
import { formatNumber } from '@/lib/utils'
import type { YieldPoint } from '../utils/aggregate'

export function YieldChart({ data }: { data: YieldPoint[] }) {
  const totalPlanned = data.reduce((s, d) => s + d.planned, 0)
  const totalProduced = data.reduce((s, d) => s + d.produced, 0)
  const overallYield = totalPlanned === 0 ? 0 : Math.round((totalProduced / totalPlanned) * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Monthly Production Yield</CardTitle>
        <CardDescription>Planned vs. produced vs. scrapped units. Overall yield in range: {overallYield}%.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => formatNumber(v)} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
            <Bar dataKey="planned" name="Planned" fill={CATEGORICAL[0]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="produced" name="Produced" fill={CATEGORICAL[2]} radius={[3, 3, 0, 0]} />
            <Bar dataKey="scrapped" name="Scrapped" fill={CATEGORICAL[7]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

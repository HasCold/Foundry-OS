import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { CATEGORICAL, CHART_CHROME } from '@/lib/chartPalette'
import { formatNumber } from '@/lib/utils'

export function ScrapTrendChart({ data, defectTypes }: { data: Record<string, number | string>[]; defectTypes: string[] }) {
  const total = data.reduce((sum, row) => sum + defectTypes.reduce((s, t) => s + (Number(row[t]) || 0), 0), 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Scrap / Defect Rate Trend</CardTitle>
        <CardDescription>Defective units logged by type, stacked monthly. {formatNumber(total)} total units in range.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => formatNumber(v)} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            {defectTypes.map((type, i) => (
              <Bar key={type} dataKey={type} name={type} stackId="scrap" fill={CATEGORICAL[i % CATEGORICAL.length]} radius={i === defectTypes.length - 1 ? [3, 3, 0, 0] : undefined} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

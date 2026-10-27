import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartTooltip } from '@/components/shared/chart-tooltip'
import { CATEGORICAL, CHART_CHROME } from '@/lib/chartPalette'
import type { OeePoint } from '../utils/aggregate'

export function OeeChart({ data }: { data: OeePoint[] }) {
  const avgOee = data.length ? Math.round(data.reduce((s, d) => s + d.oee, 0) / data.length) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Overall Equipment Effectiveness (OEE)</CardTitle>
        <CardDescription>Availability × Performance × Quality, trended monthly. Average OEE in range: {avgOee}%.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_CHROME.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={{ stroke: CHART_CHROME.axis }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: CHART_CHROME.muted }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
            <Line type="monotone" dataKey="oee" name="OEE Score" stroke={CATEGORICAL[0]} strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="availability" name="Availability" stroke={CATEGORICAL[1]} strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="performance" name="Performance" stroke={CATEGORICAL[2]} strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="quality" name="Quality" stroke={CATEGORICAL[3]} strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

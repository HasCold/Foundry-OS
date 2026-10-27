import type { TooltipContentProps } from 'recharts'

interface ChartTooltipProps extends Partial<TooltipContentProps<number, string>> {
  valueFormatter?: (value: number) => string
}

export function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label !== undefined && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
            <span className="flex-1 text-muted-foreground">{entry.name}</span>
            <span className="font-medium tabular-nums text-foreground">
              {valueFormatter && typeof entry.value === 'number' ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon?: LucideIcon
  trend?: { value: string; positive: boolean }
  tone?: 'default' | 'success' | 'warning' | 'destructive'
  subtitle?: string
}

const toneRing: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
}

export function StatCard({ label, value, icon: Icon, trend, tone = 'default', subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'mt-0.5 inline-flex w-fit items-center gap-0.5 text-xs font-medium',
                trend.positive ? 'text-success' : 'text-destructive',
              )}
            >
              {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', toneRing[tone])}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

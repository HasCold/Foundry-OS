import { DollarSign, TrendingDown, TrendingUp, Wrench, Boxes, Gauge } from 'lucide-react'
import type { CostRollup } from '@/types'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function BomCostSummary({ rollup }: { rollup: CostRollup | undefined }) {
  if (!rollup) return null
  const isOverStandard = rollup.varianceAmount > 0.005
  const isUnderStandard = rollup.varianceAmount < -0.005

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Standard Roll-Up Cost" value={formatCurrency(rollup.standardTotalCost)} icon={Gauge} tone="default" />
      <StatCard
        label="Actual Roll-Up Cost"
        value={formatCurrency(rollup.actualTotalCost)}
        icon={DollarSign}
        tone={isOverStandard ? 'destructive' : isUnderStandard ? 'success' : 'default'}
      />
      <StatCard
        label="Cost Variance"
        value={`${rollup.varianceAmount >= 0 ? '+' : ''}${formatCurrency(rollup.varianceAmount)}`}
        icon={isOverStandard ? TrendingUp : TrendingDown}
        tone={isOverStandard ? 'destructive' : isUnderStandard ? 'success' : 'default'}
        subtitle={`${formatPercent(rollup.variancePct)} vs. standard`}
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Boxes className="h-3.5 w-3.5" /> Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0 text-xs">
          <BreakdownRow label="Material" std={rollup.standardMaterialCost} act={rollup.actualMaterialCost} icon={Boxes} />
          <BreakdownRow label="Labor" std={rollup.standardLaborCost} act={rollup.actualLaborCost} icon={Wrench} />
          <BreakdownRow label="Overhead" std={rollup.standardOverheadCost} act={rollup.actualOverheadCost} icon={Gauge} />
        </CardContent>
      </Card>
    </div>
  )
}

function BreakdownRow({ label, std, act }: { label: string; std: number; act: number; icon: typeof Boxes }) {
  const diff = act - std
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {formatCurrency(act)}{' '}
        <span className={cn('text-[10px]', Math.abs(diff) < 0.005 ? 'text-muted-foreground' : diff > 0 ? 'text-destructive' : 'text-success')}>
          ({diff >= 0 ? '+' : ''}
          {formatCurrency(diff)})
        </span>
      </span>
    </div>
  )
}

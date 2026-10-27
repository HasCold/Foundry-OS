import { ChevronDown, ChevronRight, Box, Layers, Package, Cog, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { BomNode, CostRollup } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TYPE_ICON: Record<BomNode['type'], typeof Box> = {
  finished_good: Box,
  sub_assembly: Layers,
  raw_material: Package,
  routing_step: Cog,
}

const TYPE_LABEL: Record<BomNode['type'], string> = {
  finished_good: 'Finished Good',
  sub_assembly: 'Sub-Assembly',
  raw_material: 'Raw Material',
  routing_step: 'Routing Step',
}

const TYPE_BADGE_VARIANT: Record<BomNode['type'], 'default' | 'secondary' | 'muted' | 'outline'> = {
  finished_good: 'default',
  sub_assembly: 'secondary',
  raw_material: 'muted',
  routing_step: 'outline',
}

interface BomTreeRowProps {
  node: BomNode
  depth: number
  rollups: Map<string, CostRollup>
  onEdit: (node: BomNode) => void
  onAddChild: (parent: BomNode) => void
  onDelete: (node: BomNode) => void
  isRoot?: boolean
}

export function BomTreeRow({ node, depth, rollups, onEdit, onAddChild, onDelete, isRoot }: BomTreeRowProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = !!node.children?.length
  const Icon = TYPE_ICON[node.type]
  const rollup = rollups.get(node.id)
  const canHaveChildren = node.type === 'finished_good' || node.type === 'sub_assembly'
  const isOver = (rollup?.varianceAmount ?? 0) > 0.005
  const isUnder = (rollup?.varianceAmount ?? 0) < -0.005

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50',
          depth === 0 && 'bg-muted/30 font-medium',
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className={cn('flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground', !hasChildren && 'invisible')}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <Icon className={cn('h-4 w-4 shrink-0', node.type === 'finished_good' && 'text-primary')} />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">{node.sku}</span>
        <Badge variant={TYPE_BADGE_VARIANT[node.type]} className="hidden shrink-0 md:inline-flex">
          {TYPE_LABEL[node.type]}
        </Badge>
        {node.type !== 'finished_good' && (
          <span className="hidden w-20 shrink-0 text-right text-xs text-muted-foreground lg:inline">
            {node.quantityPer} {node.uom}
            {node.scrapFactorPct > 0 && ` (+${node.scrapFactorPct}%)`}
          </span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'w-24 shrink-0 text-right text-xs font-semibold tabular-nums',
                isOver && 'text-destructive',
                isUnder && 'text-success',
              )}
            >
              {rollup ? formatCurrency(rollup.actualTotalCost) : '—'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Standard: {rollup ? formatCurrency(rollup.standardTotalCost) : '—'} · Variance:{' '}
            {rollup ? formatPercent(rollup.variancePct) : '—'}
          </TooltipContent>
        </Tooltip>
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {canHaveChildren && (
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onAddChild(node)} title="Add component">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(node)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {!isRoot && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => onDelete(node)}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {expanded &&
        node.children?.map((child) => (
          <BomTreeRow key={child.id} node={child} depth={depth + 1} rollups={rollups} onEdit={onEdit} onAddChild={onAddChild} onDelete={onDelete} />
        ))}
    </div>
  )
}

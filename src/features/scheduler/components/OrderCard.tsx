import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertOctagon, Calendar, GripVertical, Snowflake, Wrench } from 'lucide-react'
import type { ProductionOrder } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, formatDate } from '@/lib/utils'

const PRIORITY_VARIANT: Record<ProductionOrder['priority'], 'muted' | 'default' | 'warning' | 'destructive'> = {
  low: 'muted',
  normal: 'default',
  high: 'warning',
  critical: 'destructive',
}

interface OrderCardProps {
  order: ProductionOrder
  /** Live machine display name, resolved by the parent from the scheduler store — never
   *  imported from the static mock module, since machine state (status, downtime) mutates. */
  machineName: string
  onOpen: (order: ProductionOrder) => void
}

export function OrderCard({ order, machineName, onOpen }: OrderCardProps) {
  // A frozen order's machine is down — dragging it to a new phase would misrepresent
  // work that physically cannot be progressing right now, so the drag handle is disabled.
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id, disabled: order.isFrozen })
  const pct = order.quantityOrdered ? Math.round((order.quantityCompleted / order.quantityOrdered) * 100) : 0

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-50',
        order.isFrozen && 'border-destructive/40 bg-destructive/5',
      )}
      onClick={() => onOpen(order)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{order.orderNumber}</p>
          <p className="truncate text-xs text-muted-foreground">{order.productName}</p>
        </div>
        {!order.isFrozen && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Badge variant={PRIORITY_VARIANT[order.priority]} className="text-[10px] capitalize">
          {order.priority}
        </Badge>
        {order.status === 'quality_hold' && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertOctagon className="h-2.5 w-2.5" /> Hold
          </Badge>
        )}
        {order.isFrozen && (
          <Badge variant="destructive" className="gap-1 text-[10px]" title={order.frozenReason}>
            <Snowflake className="h-2.5 w-2.5" /> Frozen — machine down
          </Badge>
        )}
      </div>

      <div className="mt-2.5 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {order.quantityCompleted}/{order.quantityOrdered} units
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Wrench className="h-3 w-3" /> {machineName}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> {formatDate(order.scheduledEnd)}
        </span>
      </div>
    </div>
  )
}

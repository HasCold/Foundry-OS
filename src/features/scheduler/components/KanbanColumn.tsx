import { useDroppable } from '@dnd-kit/core'
import type { ProductionOrder, ProductionOrderStatus } from '@/types'
import { cn } from '@/lib/utils'
import { OrderCard } from './OrderCard'

interface KanbanColumnProps {
  status: ProductionOrderStatus
  title: string
  accent: string
  orders: ProductionOrder[]
  machineNameById: Map<string, string>
  onOpenOrder: (order: ProductionOrder) => void
}

export function KanbanColumn({ status, title, accent, orders, machineNameById, onOpenOrder }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-w-64 flex-1 flex-col rounded-xl border border-border bg-muted/30 transition-colors',
        isOver && 'bg-primary/5 ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', accent)} />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <span className="rounded-full bg-background px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{orders.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5 scrollbar-thin" style={{ maxHeight: 560 }}>
        {orders.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">No orders</p>}
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} machineName={machineNameById.get(order.machineId) ?? order.machineId} onOpen={onOpenOrder} />
        ))}
      </div>
    </div>
  )
}

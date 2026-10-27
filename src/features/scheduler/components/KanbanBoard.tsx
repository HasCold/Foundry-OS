import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { ProductionOrder, ProductionOrderStatus } from '@/types'
import { KanbanColumn } from './KanbanColumn'

const COLUMNS: { status: ProductionOrderStatus; title: string; accent: string }[] = [
  { status: 'planned', title: 'Planned', accent: 'bg-slate-400' },
  { status: 'in_progress', title: 'In Progress', accent: 'bg-primary' },
  { status: 'quality_hold', title: 'Quality Hold', accent: 'bg-destructive' },
  { status: 'completed', title: 'Completed', accent: 'bg-success' },
]

interface KanbanBoardProps {
  orders: ProductionOrder[]
  machineNameById: Map<string, string>
  onOpenOrder: (order: ProductionOrder) => void
  onMove: (orderId: string, status: ProductionOrderStatus) => void
}

export function KanbanBoard({ orders, machineNameById, onOpenOrder, onMove }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as ProductionOrderStatus
    const order = orders.find((o) => o.id === active.id)
    if (order && order.status !== newStatus) onMove(order.id, newStatus)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            accent={col.accent}
            orders={orders.filter((o) => o.status === col.status)}
            machineNameById={machineNameById}
            onOpenOrder={onOpenOrder}
          />
        ))}
      </div>
    </DndContext>
  )
}

import { useState } from 'react'
import type { Machine, ProductionOrder } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useScheduler } from '../hooks/useScheduler'
import { KanbanBoard } from './KanbanBoard'
import { CapacityGauges } from './CapacityGauges'
import { DowntimeDialog } from './DowntimeDialog'
import { OrderDetailDialog } from './OrderDetailDialog'
import { SimulatorToggle } from '@/features/simulator/components/SimulatorToggle'

export function SchedulerPage() {
  const { orders, machines, machineLoads, machineNameById, setOrderStatus, startDowntime, resolveDowntime } = useScheduler()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [downtimeMachine, setDowntimeMachine] = useState<Machine | null>(null)

  // Re-derive the live order from the store on every render (instead of caching the
  // object reference at click-time) so the detail dialog reflects status changes
  // — including ones made from inside the dialog itself — without needing to reopen it.
  const selectedOrder: ProductionOrder | null = orders.find((o) => o.id === selectedOrderId) ?? null

  const cancelledOrders = orders.filter((o) => o.status === 'cancelled')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Production Scheduler & Capacity Planner"
          description="Drag a job card between phases (or open it to update status), log machine downtime, and watch capacity gauges react instantly."
        />
        <SimulatorToggle />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Machine Capacity — 3-Day Rolling Horizon</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityGauges machines={machines} loads={machineLoads} onLogDowntime={setDowntimeMachine} onResolveDowntime={(m) => resolveDowntime(m.id, m.downtimeEvents.find((e) => !e.end)!.id)} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-sm font-semibold">Production Order Board</p>
        <KanbanBoard orders={orders} machineNameById={machineNameById} onOpenOrder={(o) => setSelectedOrderId(o.id)} onMove={setOrderStatus} />
      </div>

      {cancelledOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cancelled Orders ({cancelledOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {cancelledOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {o.orderNumber} · {o.productName}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <OrderDetailDialog
        order={selectedOrder}
        machineName={selectedOrder ? (machineNameById.get(selectedOrder.machineId) ?? selectedOrder.machineId) : ''}
        onClose={() => setSelectedOrderId(null)}
        onSetStatus={setOrderStatus}
      />
      <DowntimeDialog
        machine={downtimeMachine}
        onClose={() => setDowntimeMachine(null)}
        onConfirm={(reason, category) => downtimeMachine && startDowntime(downtimeMachine.id, reason, category)}
      />
    </div>
  )
}

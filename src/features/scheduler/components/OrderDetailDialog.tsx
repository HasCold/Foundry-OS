import { Snowflake } from 'lucide-react'
import type { ProductionOrder, ProductionOrderStatus } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Can } from '@/features/rbac/components/Can'

const STATUS_FLOW: ProductionOrderStatus[] = ['planned', 'in_progress', 'quality_hold', 'completed']
const STATUS_LABEL: Record<ProductionOrderStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  quality_hold: 'Quality Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function OrderDetailDialog({
  order,
  machineName,
  onClose,
  onSetStatus,
}: {
  order: ProductionOrder | null
  /** Live machine display name, resolved by the parent — see OrderCard for why this isn't looked up here. */
  machineName: string
  onClose: () => void
  onSetStatus: (orderId: string, status: ProductionOrderStatus) => void
}) {
  if (!order) return null

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order.orderNumber}
            <Badge variant="outline">{STATUS_LABEL[order.status]}</Badge>
          </DialogTitle>
          <DialogDescription>
            {order.productName} ({order.productSku})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Info label="Production line" value={order.productionLine} />
          <Info label="Machine" value={machineName} />
          <Info label="Quantity ordered" value={String(order.quantityOrdered)} />
          <Info label="Completed / Scrapped" value={`${order.quantityCompleted} / ${order.quantityScrapped}`} />
          <Info label="Scheduled start" value={formatDateTime(order.scheduledStart)} />
          <Info label="Scheduled end" value={formatDateTime(order.scheduledEnd)} />
          <Info label="Standard cost / unit" value={formatCurrency(order.standardCost)} />
          <Info label="Actual cost / unit" value={formatCurrency(order.actualCost)} />
        </div>

        {order.qualityHoldReason && (
          <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
            <span className="font-medium">Hold reason: </span>
            {order.qualityHoldReason}
          </div>
        )}

        {order.isFrozen && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
            <Snowflake className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              <p className="font-medium">Frozen — machine is down</p>
              <p className="text-destructive/80">{order.frozenReason ?? 'This job cannot progress until the assigned machine is back online.'}</p>
            </div>
          </div>
        )}

        <Can resource="scheduler" action="write">
          <Separator />

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Move to phase</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FLOW.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={order.status === status ? 'default' : 'outline'}
                  disabled={order.status === status || order.isFrozen}
                  title={order.isFrozen ? 'This order is frozen while its machine is down' : undefined}
                  onClick={() => onSetStatus(order.id, status)}
                >
                  {STATUS_LABEL[status]}
                </Button>
              ))}
            </div>
          </div>
        </Can>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

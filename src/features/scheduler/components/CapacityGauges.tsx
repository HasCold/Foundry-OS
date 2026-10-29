import { AlertTriangle, Ban, CheckCircle2, Wrench } from 'lucide-react'
import type { Machine } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatDateTime } from '@/lib/utils'
import type { MachineLoad } from '../utils/capacity'
import { Can } from '@/features/rbac/components/Can'

const STATUS_CONFIG: Record<Machine['status'], { label: string; variant: 'success' | 'default' | 'destructive' | 'warning'; icon: typeof CheckCircle2 }> = {
  running: { label: 'Running', variant: 'success', icon: CheckCircle2 },
  idle: { label: 'Idle', variant: 'default', icon: Wrench },
  down: { label: 'Down', variant: 'destructive', icon: Ban },
  maintenance: { label: 'Maintenance', variant: 'warning', icon: AlertTriangle },
}

function gaugeColor(pct: number) {
  if (pct > 100) return 'bg-destructive'
  if (pct > 85) return 'bg-warning'
  return 'bg-primary'
}

export function CapacityGauges({
  machines,
  loads,
  onLogDowntime,
  onResolveDowntime,
}: {
  machines: Machine[]
  loads: Map<string, MachineLoad>
  onLogDowntime: (machine: Machine) => void
  onResolveDowntime: (machine: Machine) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {machines.map((machine) => {
        const load = loads.get(machine.id)
        const status = STATUS_CONFIG[machine.status]
        const StatusIcon = status.icon
        const activeDowntime = machine.downtimeEvents.find((e) => !e.end)
        return (
          <Card key={machine.id}>
            <CardContent className="space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{machine.name}</p>
                  <p className="text-xs text-muted-foreground">{machine.productionLine}</p>
                </div>
                <Badge variant={status.variant} className="gap-1 text-[10px]">
                  <StatusIcon className="h-2.5 w-2.5" /> {status.label}
                </Badge>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>3-day capacity load</span>
                  <span className={cn('font-semibold', (load?.utilizationPct ?? 0) > 100 && 'text-destructive')}>
                    {load?.utilizationPct ?? 0}%
                  </span>
                </div>
                <Progress value={Math.min(100, load?.utilizationPct ?? 0)} indicatorClassName={gaugeColor(load?.utilizationPct ?? 0)} />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {load?.scheduledHours ?? 0}h scheduled / {load?.capacityHours ?? 0}h available
                  {load && load.downtimeHours > 0 && ` · ${load.downtimeHours}h downtime`}
                </p>
              </div>

              {activeDowntime ? (
                <div className="rounded-md bg-destructive/10 p-2 text-[11px] text-destructive">
                  <p className="font-medium">{activeDowntime.reason}</p>
                  <p className="text-destructive/80">Since {formatDateTime(activeDowntime.start)}</p>
                  <Can resource="scheduler" action="write">
                    <Button size="xs" variant="outline" className="mt-1.5 h-6 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => onResolveDowntime(machine)}>
                      Mark resolved
                    </Button>
                  </Can>
                </div>
              ) : (
                <Can resource="scheduler" action="write">
                  <Button size="xs" variant="outline" className="w-full" onClick={() => onLogDowntime(machine)}>
                    Log downtime
                  </Button>
                </Can>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

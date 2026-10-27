import { AlertOctagon } from 'lucide-react'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'

/**
 * A persistent, app-wide banner for any machine currently down due to a
 * breakdown (as opposed to planned maintenance). Deliberately reads machine
 * state directly from schedulerStore instead of keeping its own list of
 * "active alerts" — the breakdown is already fully represented by a machine
 * with status "down" and an open downtime event, so a second copy of that
 * fact would just be redundant state to keep in sync.
 */
export function CriticalAlertBanner() {
  const machines = useSchedulerStore((s) => s.machines)

  const breakdowns = machines.filter(
    (m) => m.status === 'down' && m.downtimeEvents.some((e) => !e.end && e.category === 'breakdown'),
  )

  if (breakdowns.length === 0) return null

  return (
    <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive px-5 py-1.5 text-xs font-medium text-destructive-foreground">
      <AlertOctagon className="h-3.5 w-3.5 shrink-0 animate-pulse" />
      <span>
        {breakdowns.length} machine{breakdowns.length === 1 ? '' : 's'} in emergency shutdown:{' '}
        {breakdowns.map((m) => m.name).join(', ')} — dependent production orders are frozen.
      </span>
    </div>
  )
}

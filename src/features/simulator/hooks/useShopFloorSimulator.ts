import { useEffect } from 'react'
import { useSimulatorStore } from '../store/simulatorStore'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'
import { useCurrencyStore } from '@/features/finance/store/currencyStore'
import { toast } from '@/components/ui/toast-store'

const TICK_MS = 5000
const BREAKDOWN_CHANCE = 0.14
const MAINTENANCE_CHANCE = 0.08
const RECOVERY_CHANCE = 0.35
const IDLE_TO_RUNNING_THRESHOLD = 0.85
const RUNNING_TO_IDLE_THRESHOLD = 0.92

/**
 * The one background loop for the whole app: mounted once in AppLayout so it keeps
 * running no matter which page the operator is looking at. Every tick it nudges the
 * live FX rates (tying the globalization feature to "market conditions changing in
 * the background") and may cycle exactly one random machine's status.
 *
 * Deliberately holds no state of its own beyond the interval handle — every mutation
 * goes through the existing schedulerStore actions (startDowntime / resolveDowntime /
 * setMachineStatus), so there is exactly one source of truth for machine status and
 * this hook can never drift out of sync with what the Scheduler page shows.
 */
export function useShopFloorSimulator() {
  const isActive = useSimulatorStore((s) => s.isActive)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      const { machines, startDowntime, resolveDowntime, setMachineStatus } = useSchedulerStore.getState()
      useCurrencyStore.getState().nudgeLiveRates()

      const machine = machines[Math.floor(Math.random() * machines.length)]
      if (!machine) return

      // A machine already down recovers probabilistically each tick rather than on a
      // fixed timer, so breakdowns feel like real unplanned events, not a countdown.
      if (machine.status === 'down') {
        const activeEvent = machine.downtimeEvents.find((e) => !e.end)
        if (activeEvent && Math.random() < RECOVERY_CHANCE) {
          resolveDowntime(machine.id, activeEvent.id)
          toast({ title: `${machine.name} back online`, description: 'Downtime resolved — any frozen orders on this machine have resumed.', variant: 'success' })
        }
        return
      }

      if (machine.status === 'maintenance') {
        if (Math.random() < RECOVERY_CHANCE) setMachineStatus(machine.id, 'running')
        return
      }

      const roll = Math.random()
      if (roll < BREAKDOWN_CHANCE) {
        // The critical path: this is the one status change that must go through
        // startDowntime (not setMachineStatus) so it gets a real DowntimeEvent record
        // and freezes any in-progress order riding on this machine.
        startDowntime(machine.id, 'Machine Overheating — emergency thermal shutdown', 'breakdown')
        toast({
          title: `CRITICAL: ${machine.name} overheating`,
          description: `${machine.productionLine} has entered emergency shutdown. In-progress orders on this machine are now frozen.`,
          variant: 'destructive',
        })
      } else if (roll < BREAKDOWN_CHANCE + MAINTENANCE_CHANCE) {
        setMachineStatus(machine.id, 'maintenance')
        toast({ title: `${machine.name} entering planned maintenance`, variant: 'warning' })
      } else if (machine.status === 'idle' && roll > IDLE_TO_RUNNING_THRESHOLD) {
        setMachineStatus(machine.id, 'running')
      } else if (machine.status === 'running' && roll > RUNNING_TO_IDLE_THRESHOLD) {
        setMachineStatus(machine.id, 'idle')
      }
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [isActive])
}

import type { Machine, ProductionOrder } from '@/types'
import { clamp } from '@/lib/utils'

/** Rolling planning horizon (days) used to size available machine capacity. */
export const PLANNING_HORIZON_DAYS = 3
const HORIZON_MS = PLANNING_HORIZON_DAYS * 24 * 60 * 60 * 1000

export interface MachineLoad {
  machineId: string
  scheduledHours: number
  capacityHours: number
  downtimeHours: number
  utilizationPct: number
  isOverCapacity: boolean
  activeOrders: number
}

function overlapHours(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const start = Math.max(aStart, bStart)
  const end = Math.min(aEnd, bEnd)
  return Math.max(0, end - start) / (1000 * 60 * 60)
}

export function computeMachineLoad(machine: Machine, orders: ProductionOrder[], now = Date.now()): MachineLoad {
  const horizonEnd = now + HORIZON_MS

  const downtimeHours = machine.downtimeEvents.reduce((sum, evt) => {
    const start = new Date(evt.start).getTime()
    const end = evt.end ? new Date(evt.end).getTime() : horizonEnd
    return sum + overlapHours(start, end, now, horizonEnd)
  }, 0)

  const grossCapacity = machine.capacityHoursPerDay * PLANNING_HORIZON_DAYS
  const capacityHours = Math.max(0, grossCapacity - downtimeHours)

  const relevantOrders = orders.filter(
    (o) => o.machineId === machine.id && (o.status === 'planned' || o.status === 'in_progress' || o.status === 'quality_hold'),
  )

  const scheduledHours = relevantOrders.reduce((sum, o) => {
    const start = new Date(o.scheduledStart).getTime()
    const end = new Date(o.scheduledEnd).getTime()
    return sum + overlapHours(start, end, now, horizonEnd)
  }, 0)

  const utilizationPct = capacityHours === 0 ? (scheduledHours > 0 ? 100 : 0) : clamp((scheduledHours / capacityHours) * 100, 0, 999)

  return {
    machineId: machine.id,
    scheduledHours: +scheduledHours.toFixed(1),
    capacityHours: +capacityHours.toFixed(1),
    downtimeHours: +downtimeHours.toFixed(1),
    utilizationPct: +utilizationPct.toFixed(0),
    isOverCapacity: utilizationPct > 100,
    activeOrders: relevantOrders.length,
  }
}

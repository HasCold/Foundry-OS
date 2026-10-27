import { create } from 'zustand'
import type { DowntimeEvent, Machine, ProductionOrder, ProductionOrderStatus } from '@/types'
import { productionOrders as initialOrders } from '@/mock/productionOrders'
import { machines as initialMachines } from '@/mock/machines'
import { appEvents } from '@/lib/appEvents'
import { nextId } from '@/lib/utils'

interface SchedulerState {
  orders: ProductionOrder[]
  machines: Machine[]
  setOrderStatus: (orderId: string, status: ProductionOrderStatus, extra?: Partial<ProductionOrder>) => void
  startDowntime: (machineId: string, reason: string, category: DowntimeEvent['category']) => void
  resolveDowntime: (machineId: string, downtimeId: string) => void
  reassignOrderMachine: (orderId: string, machineId: string) => void
  /** Cosmetic running/idle cycling for machines that are neither down nor in maintenance — used
   *  only by the shop-floor simulator's background loop, never for breakdowns (those go through
   *  startDowntime so they get a DowntimeEvent record and freeze their orders). */
  setMachineStatus: (machineId: string, status: Machine['status']) => void
}

/** Shared by startDowntime/resolveDowntime: every in-progress order riding on a machine that just
 * went down (or came back up) needs its frozen flag flipped in the same update, so the Kanban board
 * never shows an "active" job silently running on a machine that isn't actually turning. */
function freezeOrdersOnMachine(orders: ProductionOrder[], machineId: string, frozenReason: string | undefined): ProductionOrder[] {
  return orders.map((o) => {
    if (o.machineId !== machineId || o.status !== 'in_progress') return o
    return frozenReason ? { ...o, isFrozen: true, frozenReason } : { ...o, isFrozen: false, frozenReason: undefined }
  })
}

export const useSchedulerStore = create<SchedulerState>((set) => ({
  orders: initialOrders,
  machines: initialMachines,

  setOrderStatus: (orderId, status, extra) => {
    const before = useSchedulerStore.getState().orders.find((o) => o.id === orderId)
    if (!before) return
    const wasAlreadyCompleted = before.status === 'completed'

    const patch: Partial<ProductionOrder> = { status, ...extra }
    if (status === 'in_progress' && !before.actualStart) patch.actualStart = new Date().toISOString()
    if (status === 'completed' && !before.actualEnd) {
      patch.actualEnd = new Date().toISOString()
      if (before.quantityCompleted === 0) patch.quantityCompleted = before.quantityOrdered
    }
    const updated: ProductionOrder = { ...before, ...patch }

    set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? updated : o)) }))

    // Only fire the "completed" event the first time an order crosses into
    // that phase, so Finance never double-posts the same production run.
    if (status === 'completed' && !wasAlreadyCompleted) {
      appEvents.emit('production.completed', { order: updated })
    }
  },

  startDowntime: (machineId, reason, category) =>
    set((state) => ({
      machines: state.machines.map((m) => {
        if (m.id !== machineId) return m
        const evt: DowntimeEvent = { id: nextId('dt'), machineId, reason, category, start: new Date().toISOString() }
        return { ...m, status: 'down', downtimeEvents: [evt, ...m.downtimeEvents] }
      }),
      // Any job actively running on this machine is frozen in place — it can't be
      // progressing if the machine it depends on just went down.
      orders: freezeOrdersOnMachine(state.orders, machineId, reason),
    })),

  resolveDowntime: (machineId, downtimeId) =>
    set((state) => ({
      machines: state.machines.map((m) => {
        if (m.id !== machineId) return m
        const stillDown = m.downtimeEvents.some((e) => e.id !== downtimeId && !e.end)
        return {
          ...m,
          status: stillDown ? 'down' : 'running',
          downtimeEvents: m.downtimeEvents.map((e) => (e.id === downtimeId ? { ...e, end: new Date().toISOString() } : e)),
        }
      }),
      // Only unfreeze if the machine actually has no other open downtime events left.
      orders: state.machines.find((m) => m.id === machineId)?.downtimeEvents.some((e) => e.id !== downtimeId && !e.end)
        ? state.orders
        : freezeOrdersOnMachine(state.orders, machineId, undefined),
    })),

  reassignOrderMachine: (orderId, machineId) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, machineId } : o)),
    })),

  setMachineStatus: (machineId, status) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === machineId ? { ...m, status } : m)),
    })),
}))

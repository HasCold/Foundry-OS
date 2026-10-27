/**
 * A minimal typed publish/subscribe bus.
 *
 * WHY THIS EXISTS
 * Several Zustand stores in this app need to react to things that happen in
 * OTHER stores — e.g. Finance needs to post a ledger entry whenever
 * Procurement approves a purchase order, Production completes a run, or
 * Quality resolves a hold. The naive way to do this is for every producing
 * store to `import { useFinanceStore } from '...'` and call it directly.
 *
 * That works, but it doesn't scale: every time a new cross-cutting module
 * (Finance today, maybe Reporting/Audit tomorrow) needs to know about an
 * action, you'd have to go back and edit Procurement, Scheduler, AND
 * Quality to add another direct import. The producing modules end up
 * knowing about every consumer, which is backwards — Procurement shouldn't
 * need to know Finance exists.
 *
 * Instead, producers `emit()` a small, named event describing WHAT
 * happened. Consumers `on()` the events they care about. The wiring that
 * connects them lives in ONE place — `src/app/domainIntegrations.ts` — so
 * that's the single file a developer reads to answer "what happens when a
 * PO is approved?" instead of grepping every store in the codebase.
 */
export type Listener<T> = (payload: T) => void
export type Unsubscribe = () => void

export function createEventBus<EventMap extends Record<string, unknown>>() {
  const listenersByEvent = new Map<keyof EventMap, Set<Listener<never>>>()

  function on<EventName extends keyof EventMap>(event: EventName, listener: Listener<EventMap[EventName]>): Unsubscribe {
    const listeners = listenersByEvent.get(event) ?? new Set()
    listeners.add(listener as Listener<never>)
    listenersByEvent.set(event, listeners)
    return () => listeners.delete(listener as Listener<never>)
  }

  function emit<EventName extends keyof EventMap>(event: EventName, payload: EventMap[EventName]): void {
    listenersByEvent.get(event)?.forEach((listener) => listener(payload as never))
  }

  return { on, emit }
}

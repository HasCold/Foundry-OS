/**
 * Simulates an async network round-trip around a synchronous in-memory
 * Zustand mutation/read. This lets every feature hook drive its data through
 * TanStack Query (loading/error/optimistic-update semantics) while the
 * actual state lives entirely in-memory — no server, no persistence.
 */
export function mockNetwork<T>(fn: () => T, opts: { delay?: number; failRate?: number } = {}): Promise<T> {
  const { delay = 280 + Math.random() * 260, failRate = 0 } = opts
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error('Simulated network error — please retry.'))
        return
      }
      try {
        resolve(fn())
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    }, delay)
  })
}

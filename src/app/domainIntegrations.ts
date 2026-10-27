import { appEvents } from '@/lib/appEvents'
import { useFinanceStore } from '@/features/finance/store/financeStore'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'

/**
 * The single place where cross-module side effects are wired up. Producers
 * (procurement, scheduler, quality) only know how to `emit()` a named event —
 * they have no idea Finance exists. This file is the only thing that knows
 * both sides, which is what keeps those stores decoupled.
 *
 * Import this module exactly once, for its side effects, near app startup
 * (see `src/main.tsx`). Adding a new cross-module reaction means adding one
 * `appEvents.on(...)` call here — nothing else changes.
 */
export function registerDomainIntegrations() {
  appEvents.on('po.approved', ({ po }) => {
    useFinanceStore.getState().recordPoApproved(po)
  })

  appEvents.on('po.receiptRecorded', ({ po, receipt }) => {
    useFinanceStore.getState().recordPoReceipt(po, receipt)
  })

  appEvents.on('production.completed', ({ order }) => {
    useFinanceStore.getState().recordProductionCompleted(order)
  })

  appEvents.on('quality.holdResolved', ({ hold, decision }) => {
    if (decision !== 'approved' || hold.disposition !== 'scrap') return
    // The hold only carries a product name and quantity — look up its unit
    // cost from Inventory so the write-off is booked at a real dollar value.
    const item = useInventoryStore.getState().items.find((i) => i.name === hold.productName)
    useFinanceStore.getState().recordQualityScrap(hold, item?.unitCost ?? 0)
  })
}

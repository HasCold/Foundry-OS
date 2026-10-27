import { create } from 'zustand'
import type { InventoryItem } from '@/types'
import { inventoryItems as initialItems } from '@/mock/inventory'
import { nextId } from '@/lib/utils'

interface InventoryState {
  items: InventoryItem[]
  incrementOnOrder: (itemId: string, qty: number) => void
  receiveOnOrder: (itemId: string, qty: number, supplier: string, poNumber: string) => void
  releaseQuantityByName: (productName: string, qty: number, disposition: 'use_as_is' | 'rework' | 'scrap' | 'return_to_supplier') => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: initialItems,

  incrementOnOrder: (itemId, qty) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, onOrder: i.onOrder + qty } : i)),
    })),

  receiveOnOrder: (itemId, qty, supplier, poNumber) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (i.id !== itemId) return i
        return {
          ...i,
          onHand: i.onHand + qty,
          onOrder: Math.max(0, i.onOrder - qty),
          lots: [
            {
              id: nextId('lot'),
              lotNumber: `LOT-${poNumber}`,
              quantity: qty,
              receivedDate: new Date().toISOString(),
              supplier,
              qualityStatus: 'released',
              warehouseLocation: i.warehouseLocation,
            },
            ...i.lots,
          ],
        }
      }),
    })),

  releaseQuantityByName: (productName, qty, disposition) =>
    set((state) => ({
      items: state.items.map((i) => {
        if (i.name !== productName) return i
        if (disposition === 'use_as_is' || disposition === 'rework') {
          return {
            ...i,
            onHand: i.onHand + qty,
            lots: i.lots.map((l) => (l.qualityStatus === 'quarantine' ? { ...l, qualityStatus: 'released' } : l)),
          }
        }
        // scrap / return_to_supplier: units are removed from any reserved/quarantined pool
        return {
          ...i,
          reserved: Math.max(0, i.reserved - qty),
          lots: i.lots.map((l) => (l.qualityStatus === 'quarantine' ? { ...l, qualityStatus: 'rejected' } : l)),
        }
      }),
    })),
}))

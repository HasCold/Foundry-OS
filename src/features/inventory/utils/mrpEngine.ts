import type { BomNode, InventoryItem, MrpRunResult, MrpShortfall, ProductionOrder, PurchaseOrder, PurchaseOrderLine } from '@/types'
import { nextId } from '@/lib/utils'
import { supplierById } from '@/mock/suppliers'

interface RawMaterialDemand {
  sku: string
  name: string
  qty: number
  demandSources: Set<string>
}

/** Recursively explodes a BOM tree's raw-material requirements for a given quantity of finished units. */
function explode(node: BomNode, unitsNeeded: number, orderNumber: string, acc: Map<string, RawMaterialDemand>) {
  for (const child of node.children ?? []) {
    if (child.type === 'routing_step') continue
    const childQty = unitsNeeded * child.quantityPer * (1 + child.scrapFactorPct / 100)
    if (child.type === 'raw_material') {
      const existing = acc.get(child.sku)
      if (existing) {
        existing.qty += childQty
        existing.demandSources.add(orderNumber)
      } else {
        acc.set(child.sku, { sku: child.sku, name: child.name, qty: childQty, demandSources: new Set([orderNumber]) })
      }
    } else {
      explode(child, childQty, orderNumber, acc)
    }
  }
}

export interface MrpInputs {
  productionOrders: ProductionOrder[]
  bomTrees: BomNode[]
  inventoryItems: InventoryItem[]
}

/**
 * Runs a full MRP simulation: explodes every open (planned) production
 * order's BOM down to raw materials, nets the gross requirement against
 * on-hand + incoming inventory, and generates suggested purchase orders for
 * any net shortfall.
 */
export function runMrpSimulation({ productionOrders, bomTrees, inventoryItems }: MrpInputs): MrpRunResult {
  const demand = new Map<string, RawMaterialDemand>()
  const openOrders = productionOrders.filter((o) => o.status === 'planned' || o.status === 'in_progress')

  for (const order of openOrders) {
    const tree = bomTrees.find((t) => t.id === order.productId)
    if (!tree) continue
    const remainingUnits = Math.max(0, order.quantityOrdered - order.quantityCompleted)
    if (remainingUnits === 0) continue
    explode(tree, remainingUnits, order.orderNumber, demand)
  }

  const shortfalls: MrpShortfall[] = []
  const suggestedPOs: PurchaseOrder[] = []

  for (const d of demand.values()) {
    const item = inventoryItems.find((i) => i.sku === d.sku)
    if (!item) continue
    const requiredQty = Math.ceil(d.qty)
    const availableQty = Math.max(0, item.onHand - item.reserved)
    const grossShortfall = requiredQty - availableQty
    if (grossShortfall <= 0) continue

    const netAfterIncoming = grossShortfall - item.onOrder
    const suggestedOrderQty = netAfterIncoming > 0 ? Math.max(netAfterIncoming, item.reorderQuantity) : 0

    const neededBy = new Date(Date.now() + item.leadTimeDays * 24 * 60 * 60 * 1000).toISOString()

    shortfalls.push({
      itemId: item.id,
      sku: item.sku,
      itemName: item.name,
      requiredQty,
      availableQty,
      shortfallQty: grossShortfall,
      demandSources: Array.from(d.demandSources),
      suggestedSupplierId: item.preferredSupplierId,
      suggestedOrderQty,
      leadTimeDays: item.leadTimeDays,
      neededBy,
    })

    if (suggestedOrderQty > 0) {
      const supplier = supplierById(item.preferredSupplierId)
      const line: PurchaseOrderLine = {
        id: nextId('pol'),
        itemId: item.id,
        sku: item.sku,
        itemName: item.name,
        quantity: suggestedOrderQty,
        quantityReceived: 0,
        unitCost: item.unitCost,
        requiredBy: neededBy,
      }
      suggestedPOs.push({
        id: nextId('po'),
        poNumber: `MRP-${1000 + suggestedPOs.length + Math.floor(Math.random() * 900)}`,
        supplierId: item.preferredSupplierId,
        supplierName: supplier?.name ?? 'Unknown Supplier',
        status: 'suggested',
        createdDate: new Date().toISOString(),
        expectedDate: neededBy,
        lines: [line],
        totalValue: line.quantity * line.unitCost,
        // MRP always suggests in the home currency — a human converts to a
        // foreign-currency PO explicitly when approving against an overseas supplier.
        bookingCurrency: 'USD',
        bookingRateUsd: 1,
      })
    }
  }

  shortfalls.sort((a, b) => b.shortfallQty - a.shortfallQty)

  return {
    id: nextId('mrp-run'),
    runAt: new Date().toISOString(),
    ordersEvaluated: openOrders.length,
    itemsEvaluated: demand.size,
    shortfalls,
    suggestedPOs,
  }
}

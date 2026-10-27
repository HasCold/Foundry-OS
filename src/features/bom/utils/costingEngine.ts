import type { BomNode, CostRollup } from '@/types'

/**
 * Assumed standard batch size used to amortize routing-step setup time across
 * units when no explicit batch size is modeled on the production order.
 * Kept as a single tunable constant so the assumption is visible and easy
 * to swap out once a real MES/scheduling integration supplies actual batch
 * sizes.
 */
export const ASSUMED_SETUP_BATCH_SIZE = 25

function emptyRollup(nodeId: string): CostRollup {
  return {
    nodeId,
    standardMaterialCost: 0,
    actualMaterialCost: 0,
    standardLaborCost: 0,
    actualLaborCost: 0,
    standardOverheadCost: 0,
    actualOverheadCost: 0,
    standardTotalCost: 0,
    actualTotalCost: 0,
    varianceAmount: 0,
    variancePct: 0,
  }
}

function finalize(r: CostRollup): CostRollup {
  r.standardTotalCost = r.standardMaterialCost + r.standardLaborCost + r.standardOverheadCost
  r.actualTotalCost = r.actualMaterialCost + r.actualLaborCost + r.actualOverheadCost
  r.varianceAmount = r.actualTotalCost - r.standardTotalCost
  r.variancePct = r.standardTotalCost === 0 ? 0 : (r.varianceAmount / r.standardTotalCost) * 100
  return r
}

/**
 * Computes the per-unit cost roll-up to produce exactly ONE unit of `node`,
 * independent of how many the node's parent actually needs. Callers scale
 * by the node's own `quantityPer` + scrap factor when aggregating into a
 * parent — see `rollupTree`.
 */
export function computeNodeUnitRollup(node: BomNode): CostRollup {
  const r = emptyRollup(node.id)

  if (node.type === 'raw_material') {
    r.standardMaterialCost = node.standardUnitCost
    r.actualMaterialCost = node.actualUnitCost
    return finalize(r)
  }

  if (node.type === 'routing_step' && node.routing) {
    const { setupTimeMinutes, runTimeMinutesPerUnit, standardLaborRatePerHour, actualLaborRatePerHour, machineRatePerHour, overheadRatePerHour } = node.routing
    const perUnitMinutes = setupTimeMinutes / ASSUMED_SETUP_BATCH_SIZE + runTimeMinutesPerUnit
    const perUnitHours = perUnitMinutes / 60
    r.standardLaborCost = perUnitHours * standardLaborRatePerHour
    r.actualLaborCost = perUnitHours * actualLaborRatePerHour
    // Machine run cost + overhead absorption both roll into the "overhead" bucket.
    r.standardOverheadCost = perUnitHours * (machineRatePerHour + overheadRatePerHour)
    r.actualOverheadCost = r.standardOverheadCost
    return finalize(r)
  }

  // sub_assembly / finished_good: sum scaled children roll-ups
  for (const child of node.children ?? []) {
    const childUnit = computeNodeUnitRollup(child)
    const scrapMultiplier = 1 + child.scrapFactorPct / 100
    const qty = child.quantityPer * scrapMultiplier
    r.standardMaterialCost += childUnit.standardMaterialCost * qty
    r.actualMaterialCost += childUnit.actualMaterialCost * qty
    r.standardLaborCost += childUnit.standardLaborCost * qty
    r.actualLaborCost += childUnit.actualLaborCost * qty
    r.standardOverheadCost += childUnit.standardOverheadCost * qty
    r.actualOverheadCost += childUnit.actualOverheadCost * qty
  }
  return finalize(r)
}

/** Computes roll-ups for every node in the tree, keyed by node id. */
export function rollupTree(root: BomNode): Map<string, CostRollup> {
  const map = new Map<string, CostRollup>()
  function walk(node: BomNode) {
    map.set(node.id, computeNodeUnitRollup(node))
    node.children?.forEach(walk)
  }
  walk(root)
  return map
}

/** Immutably updates a single node in a BOM tree by id. */
export function updateNodeInTree(root: BomNode, nodeId: string, patch: Partial<BomNode>): BomNode {
  if (root.id === nodeId) return { ...root, ...patch }
  if (!root.children) return root
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, nodeId, patch)),
  }
}

/** Immutably removes a node (and its subtree) from a BOM tree by id. */
export function removeNodeFromTree(root: BomNode, nodeId: string): BomNode {
  return {
    ...root,
    children: root.children
      ?.filter((c) => c.id !== nodeId)
      .map((c) => removeNodeFromTree(c, nodeId)),
  }
}

/** Immutably adds a child node under the given parent id. */
export function addNodeToTree(root: BomNode, parentId: string, newNode: BomNode): BomNode {
  if (root.id === parentId) {
    return { ...root, children: [...(root.children ?? []), newNode] }
  }
  if (!root.children) return root
  return {
    ...root,
    children: root.children.map((child) => addNodeToTree(child, parentId, newNode)),
  }
}

export function findNode(root: BomNode, nodeId: string): BomNode | undefined {
  if (root.id === nodeId) return root
  for (const child of root.children ?? []) {
    const found = findNode(child, nodeId)
    if (found) return found
  }
  return undefined
}

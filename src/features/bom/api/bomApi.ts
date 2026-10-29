import type { BomNode } from '@/types'
import { mockNetwork } from '@/lib/mock-async'
import { useBomStore } from '../store/bomStore'
import { authorize } from '@/features/rbac/api/authorize'

/**
 * Thin async wrapper around the synchronous Zustand store so the feature's
 * hooks can drive everything through TanStack Query (loading/error states,
 * cache invalidation, optimistic UI) exactly as they would against a real
 * REST/GraphQL backend — while all persistence stays in-memory.
 */
export const bomApi = {
  fetchTrees: () => mockNetwork(() => useBomStore.getState().trees),

  updateNode: (args: { treeId: string; nodeId: string; patch: Partial<BomNode> }) =>
    mockNetwork(() => {
      authorize('bom', 'write')
      useBomStore.getState().updateNode(args.treeId, args.nodeId, args.patch)
      return true
    }),

  addNode: (args: { treeId: string; parentId: string; node: BomNode }) =>
    mockNetwork(() => {
      authorize('bom', 'write')
      useBomStore.getState().addNode(args.treeId, args.parentId, args.node)
      return true
    }),

  removeNode: (args: { treeId: string; nodeId: string }) =>
    mockNetwork(() => {
      authorize('bom', 'write')
      useBomStore.getState().removeNode(args.treeId, args.nodeId)
      return true
    }),
}

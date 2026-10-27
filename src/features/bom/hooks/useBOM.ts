import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { BomNode } from '@/types'
import { useBomStore } from '../store/bomStore'
import { bomApi } from '../api/bomApi'
import { rollupTree } from '../utils/costingEngine'
import { toast } from '@/components/ui/toast-store'

export const BOM_QUERY_KEY = ['bom', 'trees']

/**
 * Orchestrates the BOM Builder & Costing Engine feature. Components should
 * only call this hook — never touch the Zustand store or costing utils
 * directly — keeping presentation fully decoupled from business logic.
 */
export function useBOM() {
  const trees = useBomStore((s) => s.trees)
  const selectedTreeId = useBomStore((s) => s.selectedTreeId)
  const setSelectedTreeId = useBomStore((s) => s.setSelectedTreeId)
  const queryClient = useQueryClient()

  const selectedTree = trees.find((t) => t.id === selectedTreeId) ?? trees[0]
  const rollups = selectedTree ? rollupTree(selectedTree) : new Map()
  const rootRollup = selectedTree ? rollups.get(selectedTree.id) : undefined

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BOM_QUERY_KEY })

  const updateNodeMutation = useMutation({
    mutationFn: bomApi.updateNode,
    onSuccess: invalidate,
    onError: () => toast({ title: 'Update failed', description: 'Could not save BOM change.', variant: 'destructive' }),
  })

  const addNodeMutation = useMutation({
    mutationFn: bomApi.addNode,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Component added', variant: 'success' })
    },
    onError: () => toast({ title: 'Add failed', variant: 'destructive' }),
  })

  const removeNodeMutation = useMutation({
    mutationFn: bomApi.removeNode,
    onSuccess: () => {
      invalidate()
      toast({ title: 'Component removed', variant: 'default' })
    },
    onError: () => toast({ title: 'Remove failed', variant: 'destructive' }),
  })

  return {
    trees,
    selectedTree,
    selectedTreeId,
    setSelectedTreeId,
    rollups,
    rootRollup,
    updateNode: (nodeId: string, patch: Partial<BomNode>) =>
      selectedTree && updateNodeMutation.mutate({ treeId: selectedTree.id, nodeId, patch }),
    addNode: (parentId: string, node: BomNode) =>
      selectedTree && addNodeMutation.mutate({ treeId: selectedTree.id, parentId, node }),
    removeNode: (nodeId: string) => selectedTree && removeNodeMutation.mutate({ treeId: selectedTree.id, nodeId }),
    isSaving: updateNodeMutation.isPending || addNodeMutation.isPending || removeNodeMutation.isPending,
  }
}

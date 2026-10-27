import { create } from 'zustand'
import type { BomNode } from '@/types'
import { bomTrees } from '@/mock/bom'
import { addNodeToTree, removeNodeFromTree, updateNodeInTree } from '../utils/costingEngine'

interface BomState {
  trees: BomNode[]
  selectedTreeId: string
  setSelectedTreeId: (id: string) => void
  updateNode: (treeId: string, nodeId: string, patch: Partial<BomNode>) => void
  addNode: (treeId: string, parentId: string, node: BomNode) => void
  removeNode: (treeId: string, nodeId: string) => void
}

export const useBomStore = create<BomState>((set) => ({
  trees: bomTrees,
  selectedTreeId: bomTrees[0].id,
  setSelectedTreeId: (id) => set({ selectedTreeId: id }),
  updateNode: (treeId, nodeId, patch) =>
    set((state) => ({
      trees: state.trees.map((t) => (t.id === treeId ? updateNodeInTree(t, nodeId, patch) : t)),
    })),
  addNode: (treeId, parentId, node) =>
    set((state) => ({
      trees: state.trees.map((t) => (t.id === treeId ? addNodeToTree(t, parentId, node) : t)),
    })),
  removeNode: (treeId, nodeId) =>
    set((state) => ({
      trees: state.trees.map((t) => (t.id === treeId ? removeNodeFromTree(t, nodeId) : t)),
    })),
}))

import { useState } from 'react'
import type { BomNode } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useBOM } from '../hooks/useBOM'
import { BomTreeRow } from './BomTreeRow'
import { BomCostSummary } from './BomCostSummary'
import { EditNodeDialog } from './EditNodeDialog'
import { AddNodeDialog } from './AddNodeDialog'
import { Loader2 } from 'lucide-react'

export function BomPage() {
  const { trees, selectedTree, selectedTreeId, setSelectedTreeId, rollups, rootRollup, updateNode, addNode, removeNode, isSaving } = useBOM()
  const [editingNode, setEditingNode] = useState<BomNode | null>(null)
  const [addParent, setAddParent] = useState<BomNode | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Multi-Level BOM Builder & Costing Engine"
        description="Build nested bills of material, define routing steps, and watch standard-vs-actual roll-up cost recalculate in real time."
        actions={
          <div className="flex items-center gap-2">
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <Select value={selectedTreeId} onValueChange={setSelectedTreeId}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {trees.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <BomCostSummary rollup={rootRollup} />

      {selectedTree && (
        <Card>
          <CardContent className="p-3">
            <div className="mb-1 flex items-center gap-2 px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span className="flex-1">Component</span>
              <Badge variant="outline" className="text-[10px]">
                Live costing engine
              </Badge>
            </div>
            <BomTreeRow
              node={selectedTree}
              depth={0}
              rollups={rollups}
              onEdit={setEditingNode}
              onAddChild={setAddParent}
              onDelete={(node) => removeNode(node.id)}
              isRoot
            />
          </CardContent>
        </Card>
      )}

      <EditNodeDialog node={editingNode} onClose={() => setEditingNode(null)} onSave={updateNode} />
      <AddNodeDialog parent={addParent} onClose={() => setAddParent(null)} onAdd={addNode} />
    </div>
  )
}

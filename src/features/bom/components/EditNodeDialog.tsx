import { useEffect, useState } from 'react'
import type { BomNode, RoutingStepDetail } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NameSkuFields } from './edit-node-fields/NameSkuFields'
import { QuantityScrapFields } from './edit-node-fields/QuantityScrapFields'
import { RawMaterialCostFields } from './edit-node-fields/RawMaterialCostFields'
import { RoutingStepFields } from './edit-node-fields/RoutingStepFields'

interface EditNodeDialogProps {
  node: BomNode | null
  onClose: () => void
  onSave: (nodeId: string, patch: Partial<BomNode>) => void
}

/**
 * Edits a single BOM node. Which fields are shown depends entirely on the
 * node's type — this component's only job is deciding *which* field group to
 * render and merging their patches into local form state; the fields
 * themselves live in `./edit-node-fields/*` so each stays small and testable
 * in isolation.
 */
export function EditNodeDialog({ node, onClose, onSave }: EditNodeDialogProps) {
  const [form, setForm] = useState<BomNode | null>(node)

  useEffect(() => setForm(node), [node])

  if (!form) return null

  const isRawMaterial = form.type === 'raw_material'
  const isRoutingStep = form.type === 'routing_step' && !!form.routing

  const patchForm = (patch: Partial<BomNode>) => setForm({ ...form, ...patch })
  const patchRouting = (patch: Partial<RoutingStepDetail>) => setForm({ ...form, routing: { ...form.routing!, ...patch } })

  return (
    <Dialog open={!!node} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {form.name}</DialogTitle>
          <DialogDescription>
            {isRawMaterial && 'Adjust unit cost to simulate a price change and see the roll-up variance update instantly.'}
            {isRoutingStep && 'Adjust the actual labor rate to simulate a wage change and see the roll-up variance update instantly.'}
            {!isRawMaterial && !isRoutingStep && 'Adjust quantity, scrap factor, and identifiers for this node.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <NameSkuFields name={form.name} sku={form.sku} onChange={patchForm} />

          {form.type !== 'finished_good' && (
            <QuantityScrapFields quantityPer={form.quantityPer} scrapFactorPct={form.scrapFactorPct} onChange={patchForm} />
          )}

          {isRawMaterial && (
            <RawMaterialCostFields standardUnitCost={form.standardUnitCost} actualUnitCost={form.actualUnitCost} onChange={patchForm} />
          )}

          {isRoutingStep && form.routing && <RoutingStepFields routing={form.routing} onChange={patchRouting} />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(form.id, form)
              onClose()
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

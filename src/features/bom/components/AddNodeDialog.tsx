import { useState } from 'react'
import type { BomNode, BomNodeType } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { nextId } from '@/lib/utils'

interface AddNodeDialogProps {
  parent: BomNode | null
  onClose: () => void
  onAdd: (parentId: string, node: BomNode) => void
}

const DEFAULT_TYPE: BomNodeType = 'raw_material'

export function AddNodeDialog({ parent, onClose, onAdd }: AddNodeDialogProps) {
  const [type, setType] = useState<BomNodeType>(DEFAULT_TYPE)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [quantityPer, setQuantityPer] = useState('1')
  const [unitCost, setUnitCost] = useState('1.00')

  if (!parent) return null

  const reset = () => {
    setType(DEFAULT_TYPE)
    setName('')
    setSku('')
    setQuantityPer('1')
    setUnitCost('1.00')
  }

  const handleAdd = () => {
    const id = nextId('node')
    const base = {
      id,
      name: name || 'New Component',
      sku: sku || id.toUpperCase(),
      quantityPer: Number(quantityPer) || 1,
      uom: 'ea' as const,
      scrapFactorPct: 0,
    }
    let node: BomNode
    if (type === 'raw_material') {
      node = { ...base, type, standardUnitCost: Number(unitCost) || 0, actualUnitCost: Number(unitCost) || 0 }
    } else if (type === 'routing_step') {
      node = {
        ...base,
        type,
        standardUnitCost: 0,
        actualUnitCost: 0,
        routing: {
          workCenter: 'New Work Center',
          machineId: '',
          setupTimeMinutes: 10,
          runTimeMinutesPerUnit: 2,
          standardLaborRatePerHour: 25,
          actualLaborRatePerHour: 25,
          machineRatePerHour: 20,
          overheadRatePerHour: 10,
        },
      }
    } else {
      node = { ...base, type, standardUnitCost: 0, actualUnitCost: 0, children: [] }
    }
    onAdd(parent.id, node)
    reset()
    onClose()
  }

  return (
    <Dialog open={!!parent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add component to {parent.name}</DialogTitle>
          <DialogDescription>Add a raw material, sub-assembly, or routing step beneath this node.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Component type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BomNodeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw_material">Raw Material</SelectItem>
                <SelectItem value="sub_assembly">Sub-Assembly</SelectItem>
                <SelectItem value="routing_step">Routing Step</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Copper Terminal Lug" />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Auto-generated if blank" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity per parent</Label>
              <Input type="number" step="0.01" value={quantityPer} onChange={(e) => setQuantityPer(e.target.value)} />
            </div>
            {type === 'raw_material' && (
              <div className="space-y-1.5">
                <Label>Unit cost ($)</Label>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add component</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

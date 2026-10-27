import { useState } from 'react'
import type { DefectType, QualityHold } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DEFECT_TYPES: DefectType[] = [
  'Dimensional Non-Conformance',
  'Surface Finish Defect',
  'Material Contamination',
  'Assembly Misalignment',
  'Electrical Failure',
  'Cosmetic Blemish',
  'Missing Component',
]

export function LogDefectDialog({
  hold,
  onClose,
  onLog,
}: {
  hold: QualityHold | null
  onClose: () => void
  onLog: (defectType: DefectType, quantityAffected: number, severity: 'minor' | 'major' | 'critical', notes: string) => void
}) {
  const [defectType, setDefectType] = useState<DefectType>('Dimensional Non-Conformance')
  const [quantity, setQuantity] = useState('1')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor')
  const [notes, setNotes] = useState('')

  if (!hold) return null

  return (
    <Dialog open={!!hold} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log defect — {hold.orderNumber}</DialogTitle>
          <DialogDescription>{hold.productName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Defect type</Label>
            <Select value={defectType} onValueChange={(v) => setDefectType(v as DefectType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFECT_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity affected</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the observed defect…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onLog(defectType, Number(quantity) || 1, severity, notes)
              onClose()
            }}
          >
            Log defect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

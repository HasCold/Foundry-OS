import { useState } from 'react'
import type { DowntimeEvent, Machine } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CATEGORY_OPTIONS: { value: DowntimeEvent['category']; label: string }[] = [
  { value: 'breakdown', label: 'Unplanned Breakdown' },
  { value: 'changeover', label: 'Changeover' },
  { value: 'material_shortage', label: 'Material Shortage' },
  { value: 'planned_maintenance', label: 'Planned Maintenance' },
]

export function DowntimeDialog({
  machine,
  onClose,
  onConfirm,
}: {
  machine: Machine | null
  onClose: () => void
  onConfirm: (reason: string, category: DowntimeEvent['category']) => void
}) {
  const [reason, setReason] = useState('')
  const [category, setCategory] = useState<DowntimeEvent['category']>('breakdown')

  if (!machine) return null

  return (
    <Dialog open={!!machine} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log downtime — {machine.name}</DialogTitle>
          <DialogDescription>This immediately marks the machine down and reduces its available capacity.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DowntimeEvent['category'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Spindle bearing failure" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(reason || 'Unspecified downtime', category)
              setReason('')
              onClose()
            }}
          >
            Log downtime
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

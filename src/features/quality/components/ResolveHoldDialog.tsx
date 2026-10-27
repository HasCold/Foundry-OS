import { useState } from 'react'
import type { QualityHold } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DISPOSITIONS: { value: NonNullable<QualityHold['disposition']>; label: string }[] = [
  { value: 'use_as_is', label: 'Use as-is' },
  { value: 'rework', label: 'Rework' },
  { value: 'scrap', label: 'Scrap' },
  { value: 'return_to_supplier', label: 'Return to supplier' },
]

export function ResolveHoldDialog({
  hold,
  decision,
  onClose,
  onConfirm,
}: {
  hold: QualityHold | null
  decision: 'approved' | 'rejected' | null
  onClose: () => void
  onConfirm: (disposition: NonNullable<QualityHold['disposition']>) => void
}) {
  const [disposition, setDisposition] = useState<NonNullable<QualityHold['disposition']>>('use_as_is')

  if (!hold || !decision) return null
  const isApprove = decision === 'approved'

  return (
    <Dialog open={!!hold} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isApprove ? 'Approve' : 'Reject'} batch — {hold.orderNumber}</DialogTitle>
          <DialogDescription>
            {hold.productName} · {hold.quantityOnHold} units on hold. This will update inventory availability and close the hold.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Disposition</Label>
          <Select value={disposition} onValueChange={(v) => setDisposition(v as typeof disposition)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISPOSITIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? 'success' : 'destructive'}
            onClick={() => {
              onConfirm(disposition)
              onClose()
            }}
          >
            Confirm {isApprove ? 'approval' : 'rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

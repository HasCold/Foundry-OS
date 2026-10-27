import { useEffect, useState } from 'react'
import type { PurchaseOrder } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/utils'
import type { ReceiptLineInput } from '../store/procurementStore'

interface PartialReceiptDialogProps {
  po: PurchaseOrder | null
  onClose: () => void
  onConfirm: (lineInputs: ReceiptLineInput[], receivedBy: string) => void
}

/**
 * The "Partial Material Intake" form: one row per PO line, defaulting the
 * input to whatever quantity is still outstanding (so a full receipt is just
 * "accept the defaults"), but editable down to log a partial delivery.
 */
export function PartialReceiptDialog({ po, onClose, onConfirm }: PartialReceiptDialogProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [receivedBy, setReceivedBy] = useState('Warehouse — Current User')

  // Reset the form to "receive everything outstanding" every time a new PO is opened.
  useEffect(() => {
    if (!po) return
    const defaults: Record<string, string> = {}
    po.lines.forEach((line) => {
      defaults[line.id] = String(line.quantity - line.quantityReceived)
    })
    setQuantities(defaults)
  }, [po])

  if (!po) return null

  const lineInputs: ReceiptLineInput[] = po.lines.map((line) => ({ lineId: line.id, quantity: Number(quantities[line.id]) || 0 }))
  const hasAnyQuantity = lineInputs.some((l) => l.quantity > 0)

  return (
    <Dialog open={!!po} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log receipt — {po.poNumber}</DialogTitle>
          <DialogDescription>
            Enter the quantity actually received for each line. Leave a field short of the outstanding amount to log a partial delivery — the
            remainder stays on order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Received by</Label>
          <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Ordered</TableHead>
              <TableHead className="text-right">Already received</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-right">Receive now</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.lines.map((line) => {
              const outstanding = line.quantity - line.quantityReceived
              return (
                <TableRow key={line.id}>
                  <TableCell>
                    <p className="font-medium">{line.itemName}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{line.sku}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(line.quantity)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatNumber(line.quantityReceived)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(outstanding)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      max={outstanding}
                      value={quantities[line.id] ?? ''}
                      onChange={(e) => setQuantities({ ...quantities, [line.id]: e.target.value })}
                      className="ml-auto w-24 text-right"
                      disabled={outstanding <= 0}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!hasAnyQuantity}
            onClick={() => {
              onConfirm(lineInputs, receivedBy)
              onClose()
            }}
          >
            Log receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

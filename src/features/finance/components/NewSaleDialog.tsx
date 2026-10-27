import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewSaleDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (customerName: string, saleAmount: number, cogsAmount: number) => void
}

/**
 * Records a customer sale: revenue in, Finished Goods relieved for its cost.
 * This is the one place in the Finance module where a user manually creates
 * a transaction rather than one being generated automatically by another
 * module — useful for demonstrating the AR side of the ledger on demand.
 */
export function NewSaleDialog({ open, onClose, onConfirm }: NewSaleDialogProps) {
  const [customerName, setCustomerName] = useState('')
  const [saleAmount, setSaleAmount] = useState('')
  const [cogsAmount, setCogsAmount] = useState('')

  const reset = () => {
    setCustomerName('')
    setSaleAmount('')
    setCogsAmount('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record a new sale</DialogTitle>
          <DialogDescription>Creates an AR invoice and posts both the revenue and COGS entries to the general ledger.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Customer name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Acme Industrial" />
          </div>
          <div className="space-y-1.5">
            <Label>Sale amount ($)</Label>
            <Input type="number" step="0.01" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} placeholder="45000" />
          </div>
          <div className="space-y-1.5">
            <Label>Cost of goods sold ($)</Label>
            <Input type="number" step="0.01" value={cogsAmount} onChange={(e) => setCogsAmount(e.target.value)} placeholder="27000" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!customerName || !saleAmount}
            onClick={() => {
              onConfirm(customerName, Number(saleAmount) || 0, Number(cogsAmount) || 0)
              reset()
              onClose()
            }}
          >
            Record sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

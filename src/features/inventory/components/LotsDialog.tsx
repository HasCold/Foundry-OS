import type { InventoryItem } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'

const QUALITY_VARIANT = {
  released: 'success',
  quarantine: 'warning',
  rejected: 'destructive',
} as const

export function LotsDialog({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lot &amp; Serial Tracking — {item.name}</DialogTitle>
          <DialogDescription>{item.sku} · {item.warehouseLocation}</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 space-y-2.5 overflow-y-auto">
          {item.lots.map((lot) => (
            <div key={lot.id} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold">{lot.lotNumber}</span>
                <Badge variant={QUALITY_VARIANT[lot.qualityStatus]} className="text-[10px] capitalize">
                  {lot.qualityStatus}
                </Badge>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Quantity: <span className="font-medium text-foreground">{formatNumber(lot.quantity)} {item.uom}</span></span>
                <span>Received: <span className="font-medium text-foreground">{formatDate(lot.receivedDate)}</span></span>
                <span className="col-span-2">Supplier: <span className="font-medium text-foreground">{lot.supplier}</span></span>
              </div>
              {lot.serialNumbers && lot.serialNumbers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {lot.serialNumbers.map((sn) => (
                    <span key={sn} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      {sn}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {item.lots.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No lots on record.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

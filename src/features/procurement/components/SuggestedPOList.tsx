import type { PurchaseOrder } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'
import { ShoppingCart } from 'lucide-react'

export function SuggestedPOList({ suggested, onApprove }: { suggested: PurchaseOrder[]; onApprove: (po: PurchaseOrder) => void }) {
  const { formatMoney } = useCurrency()
  if (suggested.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No pending MRP suggestions. Run an MRP simulation from the Inventory module to generate purchase order recommendations here.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {suggested.map((po) => (
        <div key={po.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold">{po.poNumber}</span>
              <Badge variant="muted" className="gap-1 text-[10px]">
                <ShoppingCart className="h-2.5 w-2.5" /> MRP Suggested
              </Badge>
            </div>
            <p className="mt-0.5 text-sm">
              {formatNumber(po.lines[0].quantity)} × {po.lines[0].itemName} from <span className="font-medium">{po.supplierName}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Est. value {formatMoney(po.totalValue)} · needed by {formatDate(po.expectedDate)}
            </p>
          </div>
          <Button size="sm" onClick={() => onApprove(po)}>
            Approve &amp; Convert to PO
          </Button>
        </div>
      ))}
    </div>
  )
}

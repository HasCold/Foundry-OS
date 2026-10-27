import type { PurchaseOrder, PurchaseOrderStatus } from '@/types'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'
import { PackageCheck } from 'lucide-react'

const STATUS_VARIANT: Record<PurchaseOrderStatus, 'muted' | 'warning' | 'default' | 'success' | 'destructive'> = {
  suggested: 'muted',
  drafted: 'muted',
  approved: 'default',
  in_transit: 'default',
  partially_received: 'warning',
  fully_completed: 'success',
  cancelled: 'destructive',
}

// Simple, non-receiving lifecycle moves — going from "partially_received" or
// "in_transit" to fully received is never a plain status flip, it's always
// computed from actual line quantities inside recordReceipt().
const NEXT_STATUS: Partial<Record<PurchaseOrderStatus, { next: PurchaseOrderStatus; label: string }>> = {
  drafted: { next: 'approved', label: 'Approve' },
  approved: { next: 'in_transit', label: 'Mark in transit' },
}

/** PO lifecycle stages where a warehouse receipt can be logged against the order. */
const RECEIVABLE_STATUSES: PurchaseOrderStatus[] = ['approved', 'in_transit', 'partially_received']

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[]
  onAdvance: (poId: string, status: PurchaseOrderStatus) => void
  onReceive: (po: PurchaseOrder) => void
}

export function PurchaseOrdersTable({ purchaseOrders, onAdvance, onReceive }: PurchaseOrdersTableProps) {
  const { formatMoney } = useCurrency()
  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'po',
      header: 'PO Number',
      sortValue: (r) => r.poNumber,
      accessor: (r) => <span className="font-mono text-xs font-semibold">{r.poNumber}</span>,
    },
    { id: 'supplier', header: 'Supplier', sortValue: (r) => r.supplierName, accessor: (r) => r.supplierName },
    {
      id: 'lines',
      header: 'Lines',
      accessor: (r) => <span className="text-xs">{r.lines.map((l) => `${l.quantity}× ${l.itemName}`).join(', ')}</span>,
    },
    {
      id: 'received',
      header: 'Received',
      accessor: (r) => {
        const ordered = r.lines.reduce((s, l) => s + l.quantity, 0)
        const received = r.lines.reduce((s, l) => s + l.quantityReceived, 0)
        if (ordered === 0) return <span className="text-muted-foreground">—</span>
        const pct = Math.round((received / ordered) * 100)
        return (
          <div className="w-28">
            <div className="mb-1 text-[11px] text-muted-foreground">
              {received} / {ordered} ({pct}%)
            </div>
            <Progress value={pct} indicatorClassName={pct >= 100 ? 'bg-success' : pct > 0 ? 'bg-warning' : 'bg-muted-foreground/30'} className="h-1.5" />
          </div>
        )
      },
    },
    {
      id: 'value',
      header: 'Value',
      className: 'text-right tabular-nums',
      headerClassName: 'text-right',
      sortValue: (r) => r.totalValue,
      accessor: (r) => formatMoney(r.totalValue),
    },
    { id: 'created', header: 'Created', sortValue: (r) => r.createdDate, accessor: (r) => formatDate(r.createdDate) },
    { id: 'expected', header: 'Expected', sortValue: (r) => r.expectedDate, accessor: (r) => formatDate(r.expectedDate) },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <Badge variant={STATUS_VARIANT[r.status]} className="text-[10px] capitalize">
          {r.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessor: (r) => {
        const advance = NEXT_STATUS[r.status]
        const canReceive = RECEIVABLE_STATUSES.includes(r.status)
        return (
          <div className="flex justify-end gap-1.5">
            {advance && (
              <Button size="xs" variant="outline" onClick={() => onAdvance(r.id, advance.next)}>
                {advance.label}
              </Button>
            )}
            {canReceive && (
              <Button size="xs" variant="outline" className="gap-1" onClick={() => onReceive(r)}>
                <PackageCheck className="h-3 w-3" /> Receive
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={purchaseOrders}
      rowKey={(r) => r.id}
      searchable
      searchAccessor={(r) => `${r.poNumber} ${r.supplierName}`}
      defaultSort={{ columnId: 'created', direction: 'desc' }}
      pageSize={8}
      emptyMessage="No purchase orders yet."
      toolbar={
        <ExportCsvButton
          filename="purchase-orders"
          rows={purchaseOrders.map((r) => ({
            poNumber: r.poNumber,
            supplier: r.supplierName,
            status: r.status,
            totalValueUsd: r.totalValue,
            createdDate: r.createdDate,
            expectedDate: r.expectedDate,
            quantityOrdered: r.lines.reduce((s, l) => s + l.quantity, 0),
            quantityReceived: r.lines.reduce((s, l) => s + l.quantityReceived, 0),
          }))}
        />
      }
    />
  )
}

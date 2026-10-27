import { useState } from 'react'
import { AlertTriangle, Boxes, PackageSearch } from 'lucide-react'
import type { InventoryItem } from '@/types'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { cn, formatNumber } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'
import { LotsDialog } from './LotsDialog'

const TYPE_LABEL: Record<InventoryItem['type'], string> = {
  raw_material: 'Raw Material',
  sub_assembly: 'Sub-Assembly',
  finished_good: 'Finished Good',
}

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const [lotsItem, setLotsItem] = useState<InventoryItem | null>(null)
  const { formatMoney } = useCurrency()

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      id: 'name',
      header: 'Item',
      sortValue: (r) => r.name,
      accessor: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      sortValue: (r) => r.type,
      accessor: (r) => (
        <Badge variant="outline" className="text-[10px]">
          {TYPE_LABEL[r.type]}
        </Badge>
      ),
    },
    {
      id: 'stock',
      header: 'Stock vs. Safety',
      sortValue: (r) => r.onHand - r.safetyStock,
      accessor: (r) => {
        const pct = r.safetyStock === 0 ? 100 : Math.min(150, (r.onHand / r.safetyStock) * 100)
        const below = r.onHand < r.safetyStock
        return (
          <div className="w-40">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className={cn('font-semibold tabular-nums', below && 'text-destructive')}>{formatNumber(r.onHand)} {r.uom}</span>
              <span className="text-[10px] text-muted-foreground">safety {formatNumber(r.safetyStock)}</span>
            </div>
            <Progress value={Math.min(100, pct)} indicatorClassName={below ? 'bg-destructive' : pct < 130 ? 'bg-warning' : 'bg-success'} className="h-1.5" />
          </div>
        )
      },
    },
    {
      id: 'reserved',
      header: 'Reserved',
      className: 'text-right tabular-nums',
      headerClassName: 'text-right',
      sortValue: (r) => r.reserved,
      accessor: (r) => formatNumber(r.reserved),
    },
    {
      id: 'availableForMfg',
      header: 'Available for Mfg.',
      className: 'text-right tabular-nums',
      headerClassName: 'text-right',
      sortValue: (r) => r.onHand - r.reserved,
      // Surfaces the exact pool the Quality Release Trigger moves units into/out of:
      // approving a Quality Hold increments this instantly, scrapping decrements it.
      accessor: (r) => <span className="font-medium">{formatNumber(Math.max(0, r.onHand - r.reserved))}</span>,
    },
    {
      id: 'onOrder',
      header: 'On Order',
      className: 'text-right tabular-nums',
      headerClassName: 'text-right',
      sortValue: (r) => r.onOrder,
      accessor: (r) => (r.onOrder > 0 ? <span className="text-primary">{formatNumber(r.onOrder)}</span> : <span className="text-muted-foreground">—</span>),
    },
    {
      id: 'unitCost',
      header: 'Unit Cost',
      className: 'text-right tabular-nums',
      headerClassName: 'text-right',
      sortValue: (r) => r.unitCost,
      accessor: (r) => formatMoney(r.unitCost),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) =>
        r.onHand < r.safetyStock ? (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="h-2.5 w-2.5" /> Below safety stock
          </Badge>
        ) : r.onHand < r.reorderPoint ? (
          <Badge variant="warning" className="text-[10px]">
            Near reorder point
          </Badge>
        ) : (
          <Badge variant="success" className="text-[10px]">
            Healthy
          </Badge>
        ),
    },
    {
      id: 'lots',
      header: '',
      accessor: (r) => (
        <Button size="xs" variant="ghost" onClick={() => setLotsItem(r)} className="gap-1">
          <PackageSearch className="h-3.5 w-3.5" /> {r.lots.length} lot{r.lots.length === 1 ? '' : 's'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        searchable
        searchPlaceholder="Search by name or SKU…"
        searchAccessor={(r) => `${r.name} ${r.sku}`}
        defaultSort={{ columnId: 'stock', direction: 'asc' }}
        pageSize={10}
        toolbar={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" /> {items.length} SKUs tracked
            </div>
            <ExportCsvButton
              filename="inventory"
              rows={items.map((i) => ({
                sku: i.sku,
                name: i.name,
                type: i.type,
                onHand: i.onHand,
                reserved: i.reserved,
                availableForManufacturing: Math.max(0, i.onHand - i.reserved),
                onOrder: i.onOrder,
                unitCostUsd: i.unitCost,
              }))}
            />
          </div>
        }
      />
      <LotsDialog item={lotsItem} onClose={() => setLotsItem(null)} />
    </>
  )
}

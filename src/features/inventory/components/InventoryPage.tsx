import { AlertTriangle, Boxes, DollarSign, PackageCheck, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { useInventory } from '../hooks/useInventory'
import { InventoryTable } from './InventoryTable'
import { MrpPanel } from './MrpPanel'
import { formatNumber } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'

export function InventoryPage() {
  const { items, lastRun, runMrpSimulation, isRunningMrp } = useInventory()
  const { formatMoney } = useCurrency()

  const belowSafety = items.filter((i) => i.onHand < i.safetyStock).length
  const totalValue = items.reduce((sum, i) => sum + i.onHand * i.unitCost, 0)
  const onOrderValue = items.reduce((sum, i) => sum + i.onOrder * i.unitCost, 0)
  const serializedCount = items.filter((i) => i.isSerialized).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Live Inventory, Serialization & MRP Simulation"
        description="Monitor real-time stock health, trace lots and serial numbers, and simulate material requirements against open production demand."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="On-Hand Inventory Value" value={formatMoney(totalValue, { compact: true })} icon={DollarSign} />
        <StatCard
          label="Below Safety Stock"
          value={String(belowSafety)}
          icon={AlertTriangle}
          tone={belowSafety > 0 ? 'destructive' : 'success'}
          subtitle={`of ${items.length} SKUs`}
        />
        <StatCard label="On-Order Value" value={formatMoney(onOrderValue, { compact: true })} icon={ShoppingCart} tone="default" />
        <StatCard label="Serialized / Lot-Tracked SKUs" value={`${formatNumber(serializedCount)}`} icon={PackageCheck} subtitle={`${items.length} total SKUs`} />
      </div>

      <MrpPanel lastRun={lastRun} onRun={runMrpSimulation} isRunning={isRunningMrp} />

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Boxes className="h-4 w-4" /> Inventory Ledger
        </p>
        <InventoryTable items={items} />
      </div>
    </div>
  )
}

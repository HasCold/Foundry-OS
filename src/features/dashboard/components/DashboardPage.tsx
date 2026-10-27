import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BarChart3, Boxes, Factory, Gauge, Network, ShieldCheck, ShoppingCart, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'
import { useInventoryStore } from '@/features/inventory/store/inventoryStore'
import { useQualityStore } from '@/features/quality/store/qualityStore'
import { useProcurementStore } from '@/features/procurement/store/procurementStore'
import { oeeRecords } from '@/mock/analytics'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'

const QUICK_LINKS = [
  { to: '/bom', title: 'BOM & Costing Engine', description: 'Multi-level bill of materials with live cost roll-ups.', icon: Network },
  { to: '/scheduler', title: 'Production Scheduler', description: 'Kanban job tracking and machine capacity planning.', icon: Factory },
  { to: '/inventory', title: 'Inventory & MRP', description: 'Stock health, lot tracking, and MRP simulation.', icon: Boxes },
  { to: '/quality', title: 'Quality Assurance', description: 'Quality holds, defect logs, and disposition workflow.', icon: ShieldCheck },
  { to: '/procurement', title: 'Procurement Hub', description: 'Convert MRP suggestions into approved purchase orders.', icon: ShoppingCart },
  { to: '/analytics', title: 'BI Analytics', description: 'OEE, yield, scrap, and financial variance reporting.', icon: BarChart3 },
]

export function DashboardPage() {
  const orders = useSchedulerStore((s) => s.orders)
  const machines = useSchedulerStore((s) => s.machines)
  const items = useInventoryStore((s) => s.items)
  const holds = useQualityStore((s) => s.holds)
  const purchaseOrders = useProcurementStore((s) => s.purchaseOrders)
  const { formatMoney } = useCurrency()

  const activeOrders = orders.filter((o) => o.status === 'planned' || o.status === 'in_progress').length
  const openHolds = holds.filter((h) => h.status === 'open')
  const belowSafety = items.filter((i) => i.onHand < i.safetyStock)
  const downMachines = machines.filter((m) => m.status === 'down')
  const pendingApprovalPOs = purchaseOrders.filter((p) => p.status === 'drafted')
  const inventoryValue = items.reduce((s, i) => s + i.onHand * i.unitCost, 0)

  const recentOee = oeeRecords.filter((r) => r.date === 'Aug 2026')
  const avgOee = recentOee.length ? Math.round(recentOee.reduce((s, r) => s + (r.availability * r.performance * r.quality) / 10000, 0) / recentOee.length) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Executive Dashboard"
        description="A single-glance view across engineering, production, inventory, and quality — all running on live in-memory state."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Production Orders" value={String(activeOrders)} icon={Factory} />
        <StatCard label="Open Quality Holds" value={String(openHolds.length)} icon={ShieldCheck} tone={openHolds.length > 0 ? 'warning' : 'success'} />
        <StatCard label="Items Below Safety Stock" value={String(belowSafety.length)} icon={AlertTriangle} tone={belowSafety.length > 0 ? 'destructive' : 'success'} />
        <StatCard label="Current-Month Avg OEE" value={`${avgOee}%`} icon={Gauge} tone={avgOee >= 80 ? 'success' : 'warning'} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Needs Attention</CardTitle>
            <CardDescription>Open quality holds, machines down, and inventory below safety stock.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {openHolds.slice(0, 3).map((h) => (
              <AttentionRow key={h.id} tone="destructive" title={`${h.orderNumber} — ${h.productName}`} detail={h.reason} to="/quality" />
            ))}
            {downMachines.map((m) => (
              <AttentionRow key={m.id} tone="destructive" title={`${m.name} is down`} detail={m.downtimeEvents.find((e) => !e.end)?.reason ?? 'Unplanned downtime'} to="/scheduler" />
            ))}
            {belowSafety.slice(0, 3).map((i) => (
              <AttentionRow key={i.id} tone="warning" title={`${i.name} below safety stock`} detail={`${i.onHand} on hand vs. ${i.safetyStock} safety stock`} to="/inventory" />
            ))}
            {pendingApprovalPOs.map((p) => (
              <AttentionRow key={p.id} tone="default" title={`${p.poNumber} awaiting approval`} detail={`${p.supplierName} · ${formatMoney(p.totalValue)}`} to="/procurement" />
            ))}
            {openHolds.length === 0 && downMachines.length === 0 && belowSafety.length === 0 && pendingApprovalPOs.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing needs attention right now — all systems nominal.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Snapshot</CardTitle>
            <CardDescription>Key figures across the plant.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <SnapshotRow icon={Boxes} label="On-hand inventory value" value={formatMoney(inventoryValue, { compact: true })} />
            <SnapshotRow icon={Wrench} label="Machines currently down" value={String(downMachines.length)} />
            <SnapshotRow icon={ShoppingCart} label="POs pending approval" value={String(pendingApprovalPOs.length)} />
            <SnapshotRow icon={Factory} label="Production lines tracked" value="4" />
            <p className="pt-1 text-[11px] text-muted-foreground">As of {formatDate(new Date().toISOString())}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Modules</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-primary/[0.03]">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <link.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      {link.title}
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function AttentionRow({ tone, title, detail, to }: { tone: 'destructive' | 'warning' | 'default'; title: string; detail: string; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5 text-sm hover:bg-muted/50">
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <Badge variant={tone === 'default' ? 'muted' : tone} className="shrink-0 text-[10px]">
        {tone === 'destructive' ? 'Critical' : tone === 'warning' ? 'Warning' : 'Info'}
      </Badge>
    </Link>
  )
}

function SnapshotRow({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

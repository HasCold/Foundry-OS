import { useState } from 'react'
import { Package, ShoppingCart, TrendingUp, Truck } from 'lucide-react'
import type { PurchaseOrder } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProcurement } from '../hooks/useProcurement'
import { PurchaseOrdersTable } from './PurchaseOrdersTable'
import { SuggestedPOList } from './SuggestedPOList'
import { PartialReceiptDialog } from './PartialReceiptDialog'
import { ReceiptHistoryLog } from './ReceiptHistoryLog'
import { useCurrency } from '@/features/finance/hooks/useCurrency'

export function ProcurementPage() {
  const { purchaseOrders, receiptEvents, suggestedPOs, approveSuggested, advanceStatus, recordReceipt } = useProcurement()
  const { formatMoney } = useCurrency()
  const [receivingPo, setReceivingPo] = useState<PurchaseOrder | null>(null)

  const openValue = purchaseOrders.filter((p) => p.status === 'approved' || p.status === 'in_transit' || p.status === 'partially_received').reduce((s, p) => s + p.totalValue, 0)
  const inTransit = purchaseOrders.filter((p) => p.status === 'in_transit').length
  const fullyCompleted = purchaseOrders.filter((p) => p.status === 'fully_completed').length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Procurement Hub"
        description="Convert MRP-generated purchase suggestions into approved operational orders and track them from Drafted through to Fully Completed."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending Suggestions" value={String(suggestedPOs.length)} icon={ShoppingCart} tone={suggestedPOs.length > 0 ? 'warning' : 'default'} />
        <StatCard label="Open PO Value" value={formatMoney(openValue, { compact: true })} icon={TrendingUp} />
        <StatCard label="In Transit" value={String(inTransit)} icon={Truck} />
        <StatCard label="Fully Completed (all-time)" value={String(fullyCompleted)} icon={Package} tone="success" />
      </div>

      <Tabs defaultValue="suggested">
        <TabsList>
          <TabsTrigger value="suggested">Suggested Purchase Orders</TabsTrigger>
          <TabsTrigger value="orders">All Purchase Orders</TabsTrigger>
          <TabsTrigger value="receipts">Receipt History</TabsTrigger>
        </TabsList>
        <TabsContent value="suggested">
          <SuggestedPOList suggested={suggestedPOs} onApprove={approveSuggested} />
        </TabsContent>
        <TabsContent value="orders">
          <PurchaseOrdersTable purchaseOrders={purchaseOrders} onAdvance={advanceStatus} onReceive={setReceivingPo} />
        </TabsContent>
        <TabsContent value="receipts">
          <ReceiptHistoryLog receiptEvents={receiptEvents} />
        </TabsContent>
      </Tabs>

      <PartialReceiptDialog
        po={receivingPo}
        onClose={() => setReceivingPo(null)}
        onConfirm={(lineInputs, receivedBy) => receivingPo && recordReceipt(receivingPo.id, lineInputs, receivedBy)}
      />
    </div>
  )
}

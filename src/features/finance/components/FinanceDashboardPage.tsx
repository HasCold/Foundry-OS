import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFinance } from '../hooks/useFinance'
import { useCurrency } from '../hooks/useCurrency'
import { BalanceSheetTable } from './BalanceSheetTable'
import { IncomeStatementTable } from './IncomeStatementTable'
import { GeneralLedgerLog } from './GeneralLedgerLog'
import { APBoard } from './APBoard'
import { ARBoard } from './ARBoard'
import { CostVarianceCharts } from './CostVarianceCharts'
import { FxVarianceLedger } from './FxVarianceLedger'
import { Wallet, TrendingUp, Receipt, ReceiptText } from 'lucide-react'

export function FinanceDashboardPage() {
  const {
    accounts,
    entries,
    apInvoices,
    arInvoices,
    costVariance,
    balanceSheet,
    incomeStatement,
    fxVarianceLines,
    fxVarianceTotal,
    processApPayment,
    processArPayment,
    recordSale,
  } = useFinance()
  const { formatMoney } = useCurrency()

  const cashBalance = balanceSheet.assets.find((a) => a.account.code === '1000')?.balance ?? 0
  const unpaidAp = apInvoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0)
  const unpaidAr = arInvoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Finance & Accounting Ledger Hub"
        description="Every posting below was generated automatically from shop-floor activity elsewhere in FoundryOS — approve a PO, complete a run, or scrap a hold and watch it land here."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cash on Hand" value={formatMoney(cashBalance, { compact: true })} icon={Wallet} />
        <StatCard label="Net Income (YTD)" value={formatMoney(incomeStatement.netIncome, { compact: true })} icon={TrendingUp} />
        <StatCard label="Accounts Payable (unpaid)" value={formatMoney(unpaidAp, { compact: true })} icon={Receipt} tone="warning" />
        <StatCard label="Accounts Receivable (unpaid)" value={formatMoney(unpaidAr, { compact: true })} icon={ReceiptText} tone="warning" />
      </div>

      <Tabs defaultValue="statements">
        <TabsList>
          <TabsTrigger value="statements">Financial Statements</TabsTrigger>
          <TabsTrigger value="ap-ar">AP & AR</TabsTrigger>
          <TabsTrigger value="fx">FX Variance Ledger</TabsTrigger>
          <TabsTrigger value="variance">Cost Variance</TabsTrigger>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="statements" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BalanceSheetTable balanceSheet={balanceSheet} />
          <IncomeStatementTable incomeStatement={incomeStatement} fxVarianceLines={fxVarianceLines} fxVarianceTotal={fxVarianceTotal} />
        </TabsContent>

        <TabsContent value="ap-ar" className="flex flex-col gap-4">
          <APBoard invoices={apInvoices} onProcessPayment={processApPayment} />
          <ARBoard invoices={arInvoices} onProcessPayment={processArPayment} onRecordSale={recordSale} />
        </TabsContent>

        <TabsContent value="fx">
          <FxVarianceLedger lines={fxVarianceLines} total={fxVarianceTotal} />
        </TabsContent>

        <TabsContent value="variance">
          <CostVarianceCharts data={costVariance} />
        </TabsContent>

        <TabsContent value="ledger">
          <GeneralLedgerLog entries={entries} accounts={accounts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

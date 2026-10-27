import { useMemo } from 'react'
import { Activity, Gauge, PackageX, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { useAnalytics } from '../hooks/useAnalytics'
import { aggregateFinancial, aggregateOee, aggregateScrap, aggregateYield, topDefectTypes } from '../utils/aggregate'
import { FilterBar } from './FilterBar'
import { OeeChart } from './OeeChart'
import { YieldChart } from './YieldChart'
import { ScrapTrendChart } from './ScrapTrendChart'
import { FinancialVarianceChart } from './FinancialVarianceChart'
import { formatCurrency, formatPercent } from '@/lib/utils'

export function AnalyticsPage() {
  const { isLoading, activeMonths, filters, setMonths, setLine, setCategory, oee, yields, scrap, financial } = useAnalytics()

  const oeeData = useMemo(() => aggregateOee(oee ?? [], activeMonths), [oee, activeMonths])
  const yieldData = useMemo(() => aggregateYield(yields ?? [], activeMonths), [yields, activeMonths])
  const defectTypes = useMemo(() => topDefectTypes(scrap ?? []), [scrap])
  const scrapData = useMemo(() => aggregateScrap(scrap ?? [], activeMonths, defectTypes), [scrap, activeMonths, defectTypes])
  const financialData = useMemo(() => aggregateFinancial(financial ?? [], activeMonths), [financial, activeMonths])

  const avgOee = oeeData.length ? Math.round(oeeData.reduce((s, d) => s + d.oee, 0) / oeeData.length) : 0
  const totalScrap = scrapData.reduce((sum, row) => sum + defectTypes.reduce((s, t) => s + (Number(row[t]) || 0), 0), 0)
  const overallYieldPct = (() => {
    const planned = yieldData.reduce((s, d) => s + d.planned, 0)
    const produced = yieldData.reduce((s, d) => s + d.produced, 0)
    return planned === 0 ? 0 : (produced / planned) * 100
  })()
  const netVariance = financialData.reduce((s, d) => s + (d.actualMaterial - d.standardMaterial) + (d.actualLabor - d.standardLabor), 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Executive BI Analytics & Financial Reporting"
        description="OEE, scrap trends, production yield, and cost variance — filterable by date range, production line, and product category."
      />

      <FilterBar months={filters.months} line={filters.line} category={filters.category} onMonthsChange={setMonths} onLineChange={setLine} onCategoryChange={setCategory} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Average OEE" value={`${avgOee}%`} icon={Gauge} tone={avgOee >= 80 ? 'success' : avgOee >= 65 ? 'warning' : 'destructive'} />
        <StatCard label="Overall Yield" value={formatPercent(overallYieldPct)} icon={TrendingUp} tone={overallYieldPct >= 95 ? 'success' : 'warning'} />
        <StatCard label="Scrapped Units" value={String(totalScrap)} icon={PackageX} tone={totalScrap > 0 ? 'warning' : 'success'} />
        <StatCard
          label="Net Cost Variance"
          value={`${netVariance >= 0 ? '+' : ''}${formatCurrency(netVariance, { compact: true })}`}
          icon={Activity}
          tone={netVariance > 0 ? 'destructive' : 'success'}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OeeChart data={oeeData} />
          <YieldChart data={yieldData} />
          <ScrapTrendChart data={scrapData} defectTypes={defectTypes} />
          <FinancialVarianceChart data={financialData} />
        </div>
      )}
    </div>
  )
}

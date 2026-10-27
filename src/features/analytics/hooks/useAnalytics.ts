import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { mockNetwork } from '@/lib/mock-async'
import { oeeRecords, yieldRecords, scrapRecords, financialVarianceRecords } from '@/mock/analytics'
import { useAnalyticsFilterStore } from '../store/analyticsStore'
import { useSchedulerStore } from '@/features/scheduler/store/schedulerStore'

const ALL_MONTHS = ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026']
// The most recent month is the only one "live" machine status can plausibly affect —
// everything before it is closed-book history.
const CURRENT_MONTH = ALL_MONTHS[ALL_MONTHS.length - 1]

async function fetchAnalyticsData() {
  return mockNetwork(() => ({ oeeRecords, yieldRecords, scrapRecords, financialVarianceRecords }), { delay: 350 })
}

export function useAnalytics() {
  const { months, line, category, setMonths, setLine, setCategory } = useAnalyticsFilterStore()
  // Read live machine state directly from the scheduler store rather than keeping a
  // separate "live OEE" store — the penalty below is derived fresh on every render,
  // so a simulator-triggered breakdown shows up on the OEE chart with no extra state.
  const machines = useSchedulerStore((s) => s.machines)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'raw'],
    queryFn: fetchAnalyticsData,
    staleTime: Infinity,
  })

  const activeMonths = useMemo(() => ALL_MONTHS.slice(ALL_MONTHS.length - months), [months])

  const filtered = useMemo(() => {
    if (!data) return null
    const inScope = (m: string) => activeMonths.includes(m)

    const oee = data.oeeRecords
      .filter((r) => inScope(r.date) && (line === 'all' || r.productionLine === line))
      .map((r) => {
        // Only the current month reflects live shop-floor state — prior months are
        // closed history and shouldn't shift just because a machine is down today.
        if (r.date !== CURRENT_MONTH) return r
        const lineMachines = machines.filter((m) => m.productionLine === r.productionLine)
        if (lineMachines.length === 0) return r
        const downCount = lineMachines.filter((m) => m.status === 'down' || m.status === 'maintenance').length
        const availabilityPenalty = (downCount / lineMachines.length) * 100
        return { ...r, availability: Math.max(0, +(r.availability - availabilityPenalty).toFixed(1)) }
      })
    const yields = data.yieldRecords.filter((r) => inScope(r.month) && (line === 'all' || r.productionLine === line) && (category === 'all' || r.category === category))
    const scrap = data.scrapRecords.filter((r) => inScope(r.month) && (line === 'all' || r.productionLine === line))
    const financial = data.financialVarianceRecords.filter((r) => inScope(r.month) && (line === 'all' || r.productionLine === line))

    return { oee, yields, scrap, financial }
  }, [data, activeMonths, line, category, machines])

  return {
    isLoading,
    activeMonths,
    filters: { months, line, category },
    setMonths,
    setLine,
    setCategory,
    ...filtered,
  }
}

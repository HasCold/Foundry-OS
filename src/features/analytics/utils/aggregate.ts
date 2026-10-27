import type { FinancialVarianceRecord, OeeRecord, ScrapRecord, YieldRecord } from '@/types'

export interface OeePoint {
  month: string
  availability: number
  performance: number
  quality: number
  oee: number
}

export function aggregateOee(records: OeeRecord[], months: string[]): OeePoint[] {
  return months.map((month) => {
    const rows = records.filter((r) => r.date === month)
    if (rows.length === 0) return { month, availability: 0, performance: 0, quality: 0, oee: 0 }
    const avg = (key: keyof OeeRecord) => rows.reduce((s, r) => s + (r[key] as number), 0) / rows.length
    const availability = avg('availability')
    const performance = avg('performance')
    const quality = avg('quality')
    return {
      month,
      availability: +availability.toFixed(1),
      performance: +performance.toFixed(1),
      quality: +quality.toFixed(1),
      oee: +((availability * performance * quality) / 10000).toFixed(1),
    }
  })
}

export interface YieldPoint {
  month: string
  planned: number
  produced: number
  scrapped: number
  yieldPct: number
}

export function aggregateYield(records: YieldRecord[], months: string[]): YieldPoint[] {
  return months.map((month) => {
    const rows = records.filter((r) => r.month === month)
    const planned = rows.reduce((s, r) => s + r.unitsPlanned, 0)
    const produced = rows.reduce((s, r) => s + r.unitsProduced, 0)
    const scrapped = rows.reduce((s, r) => s + r.unitsScrapped, 0)
    return { month, planned, produced, scrapped, yieldPct: planned === 0 ? 0 : +((produced / planned) * 100).toFixed(1) }
  })
}

export function topDefectTypes(records: ScrapRecord[], limit = 6): string[] {
  const totals = new Map<string, number>()
  records.forEach((r) => totals.set(r.defectType, (totals.get(r.defectType) ?? 0) + r.quantity))
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([type]) => type)
}

export function aggregateScrap(records: ScrapRecord[], months: string[], defectTypes: string[]): Record<string, number | string>[] {
  return months.map((month) => {
    const row: Record<string, number | string> = { month }
    defectTypes.forEach((type) => {
      row[type] = records.filter((r) => r.month === month && r.defectType === type).reduce((s, r) => s + r.quantity, 0)
    })
    return row
  })
}

export interface FinancialPoint {
  month: string
  standardMaterial: number
  actualMaterial: number
  standardLabor: number
  actualLabor: number
}

export function aggregateFinancial(records: FinancialVarianceRecord[], months: string[]): FinancialPoint[] {
  return months.map((month) => {
    const rows = records.filter((r) => r.month === month)
    return {
      month,
      standardMaterial: rows.reduce((s, r) => s + r.standardMaterialCost, 0),
      actualMaterial: rows.reduce((s, r) => s + r.actualMaterialCost, 0),
      standardLabor: rows.reduce((s, r) => s + r.standardLaborCost, 0),
      actualLabor: rows.reduce((s, r) => s + r.actualLaborCost, 0),
    }
  })
}

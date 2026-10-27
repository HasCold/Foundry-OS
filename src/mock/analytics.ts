import type { FinancialVarianceRecord, OeeRecord, ProductionLine, ScrapRecord, YieldRecord, DefectType, ProductCategory } from '@/types'

const LINES: ProductionLine[] = ['Line A – Assembly', 'Line B – Machining', 'Line C – Fabrication', 'Line D – Packaging']
const MONTHS = ['Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026']
const DEFECT_TYPES: DefectType[] = [
  'Dimensional Non-Conformance',
  'Surface Finish Defect',
  'Assembly Misalignment',
  'Electrical Failure',
  'Cosmetic Blemish',
  'Missing Component',
]
const LINE_CATEGORY: Record<ProductionLine, ProductCategory> = {
  'Line A – Assembly': 'Electronics',
  'Line B – Machining': 'Automotive',
  'Line C – Fabrication': 'Industrial Equipment',
  'Line D – Packaging': 'Consumer Goods',
}

// Deterministic pseudo-random generator (mulberry32) so the seeded dataset
// is stable across reloads within a session but still looks organic.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(42)

const LINE_BASE_OEE: Record<ProductionLine, { availability: number; performance: number; quality: number }> = {
  'Line A – Assembly': { availability: 89, performance: 91, quality: 97 },
  'Line B – Machining': { availability: 82, performance: 85, quality: 95 },
  'Line C – Fabrication': { availability: 86, performance: 88, quality: 93 },
  'Line D – Packaging': { availability: 93, performance: 94, quality: 98 },
}

export const oeeRecords: OeeRecord[] = MONTHS.flatMap((month) =>
  LINES.map((line) => {
    const base = LINE_BASE_OEE[line]
    const drift = (rand() - 0.5) * 6
    return {
      date: month,
      productionLine: line,
      availability: Math.max(60, Math.min(99, +(base.availability + drift).toFixed(1))),
      performance: Math.max(60, Math.min(99, +(base.performance + drift * 0.7).toFixed(1))),
      quality: Math.max(80, Math.min(100, +(base.quality + drift * 0.3).toFixed(1))),
    }
  }),
)

const LINE_BASE_VOLUME: Record<ProductionLine, number> = {
  'Line A – Assembly': 2200,
  'Line B – Machining': 1400,
  'Line C – Fabrication': 900,
  'Line D – Packaging': 3200,
}

export const yieldRecords: YieldRecord[] = MONTHS.flatMap((month, mi) =>
  LINES.map((line) => {
    const seasonal = 1 + Math.sin(mi / 2) * 0.06
    const planned = Math.round(LINE_BASE_VOLUME[line] * seasonal * (0.95 + rand() * 0.1))
    const scrapRate = 0.015 + rand() * 0.035
    const scrapped = Math.round(planned * scrapRate)
    return {
      month,
      productionLine: line,
      category: LINE_CATEGORY[line],
      unitsPlanned: planned,
      unitsProduced: planned - Math.round(rand() * planned * 0.03),
      unitsScrapped: scrapped,
    }
  }),
)

export const scrapRecords: ScrapRecord[] = MONTHS.flatMap((month) =>
  LINES.flatMap((line) =>
    DEFECT_TYPES.filter(() => rand() > 0.35).map((defectType) => ({
      month,
      productionLine: line,
      defectType,
      quantity: Math.round(4 + rand() * 40),
    })),
  ),
)

const LINE_BASE_MATERIAL: Record<ProductionLine, number> = {
  'Line A – Assembly': 148000,
  'Line B – Machining': 96000,
  'Line C – Fabrication': 71000,
  'Line D – Packaging': 52000,
}
const LINE_BASE_LABOR: Record<ProductionLine, number> = {
  'Line A – Assembly': 62000,
  'Line B – Machining': 58000,
  'Line C – Fabrication': 41000,
  'Line D – Packaging': 28000,
}

export const financialVarianceRecords: FinancialVarianceRecord[] = MONTHS.flatMap((month) =>
  LINES.map((line) => {
    const materialVariancePct = (rand() - 0.35) * 0.12
    const laborVariancePct = (rand() - 0.3) * 0.15
    const standardMaterialCost = LINE_BASE_MATERIAL[line]
    const standardLaborCost = LINE_BASE_LABOR[line]
    return {
      month,
      productionLine: line,
      standardMaterialCost,
      actualMaterialCost: Math.round(standardMaterialCost * (1 + materialVariancePct)),
      standardLaborCost,
      actualLaborCost: Math.round(standardLaborCost * (1 + laborVariancePct)),
    }
  }),
)

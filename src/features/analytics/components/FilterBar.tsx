import type { ProductCategory, ProductionLine } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'
import type { DateRangePreset } from '../store/analyticsStore'

const LINES: ProductionLine[] = ['Line A – Assembly', 'Line B – Machining', 'Line C – Fabrication', 'Line D – Packaging']
const CATEGORIES: ProductCategory[] = ['Electronics', 'Automotive', 'Industrial Equipment', 'Consumer Goods', 'Aerospace Components']

interface FilterBarProps {
  months: DateRangePreset
  line: ProductionLine | 'all'
  category: ProductCategory | 'all'
  onMonthsChange: (m: DateRangePreset) => void
  onLineChange: (l: ProductionLine | 'all') => void
  onCategoryChange: (c: ProductCategory | 'all') => void
}

export function FilterBar({ months, line, category, onMonthsChange, onLineChange, onCategoryChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2.5">
      <span className="flex items-center gap-1.5 pl-1 text-xs font-medium text-muted-foreground">
        <Filter className="h-3.5 w-3.5" /> Filters
      </span>
      <Select value={String(months)} onValueChange={(v) => onMonthsChange(Number(v) as DateRangePreset)}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">Last 3 months</SelectItem>
          <SelectItem value="6">Last 6 months</SelectItem>
        </SelectContent>
      </Select>
      <Select value={line} onValueChange={(v) => onLineChange(v as ProductionLine | 'all')}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Production Lines</SelectItem>
          {LINES.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={(v) => onCategoryChange(v as ProductCategory | 'all')}>
        <SelectTrigger className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Product Categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

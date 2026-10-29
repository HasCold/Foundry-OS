import { format, parseISO } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SetupFieldDef } from '../types'

interface SetupFieldGridProps<T> {
  fields: SetupFieldDef<T>[]
  values: T
  isEditing: boolean
  onChange: (key: keyof T & string, value: string) => void
}

const formatRangeDate = (iso: string) => (iso ? format(parseISO(iso), 'dd MMM yyyy') : '—')

/** Two-column grid of setup fields — read-only until the page switches into edit mode. */
export function SetupFieldGrid<T>({ fields, values, isEditing, onChange }: SetupFieldGridProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `setup-${field.key}`
        const value = String(values[field.key])
        return (
          <div key={field.key} className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
              {field.label}
            </label>
            {field.kind === 'select' ? (
              <Select value={value} onValueChange={(v) => onChange(field.key, v)} disabled={!isEditing}>
                <SelectTrigger id={id} className="disabled:opacity-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.kind === 'dateRange' ? (
              <DateRangeInput
                id={id}
                start={value}
                end={String(values[field.endKey])}
                isEditing={isEditing}
                onStartChange={(v) => onChange(field.key, v)}
                onEndChange={(v) => onChange(field.endKey, v)}
              />
            ) : (
              <Input id={id} value={value} readOnly={!isEditing} onChange={(e) => onChange(field.key, e.target.value)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface DateRangeInputProps {
  id: string
  start: string
  end: string
  isEditing: boolean
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}

function DateRangeInput({ id, start, end, isEditing, onStartChange, onEndChange }: DateRangeInputProps) {
  if (!isEditing) {
    return <Input id={id} value={`${formatRangeDate(start)} – ${formatRangeDate(end)}`} readOnly />
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        id={id}
        type="date"
        aria-label="Start date"
        value={start}
        max={end || undefined}
        onChange={(e) => onStartChange(e.target.value)}
        className="dark:[color-scheme:dark]"
      />
      <span className="text-muted-foreground">–</span>
      <Input
        type="date"
        aria-label="End date"
        value={end}
        min={start || undefined}
        onChange={(e) => onEndChange(e.target.value)}
        className="dark:[color-scheme:dark]"
      />
    </div>
  )
}

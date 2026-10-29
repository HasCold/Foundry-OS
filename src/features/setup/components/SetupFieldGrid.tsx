import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SetupFieldDef } from '../types'

interface SetupFieldGridProps<T> {
  fields: SetupFieldDef<T>[]
  values: T
  isEditing: boolean
  onChange: (key: keyof T & string, value: string) => void
}

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
            {field.options ? (
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
            ) : (
              <Input id={id} value={value} readOnly={!isEditing} onChange={(e) => onChange(field.key, e.target.value)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

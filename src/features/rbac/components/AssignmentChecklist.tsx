import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface AssignmentChecklistProps {
  label: string
  /** One line under the label explaining what ticking an option does. */
  hint?: string
  items: { id: string; name: string; description: string }[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  emptyMessage: string
}

/** A labelled multi-select of roles or groups, with each option's description underneath its name. */
export function AssignmentChecklist({ label, hint, items, selectedIds, onChange, emptyMessage }: AssignmentChecklistProps) {
  const toggle = (id: string, checked: boolean) => onChange(checked ? [...selectedIds, id] : selectedIds.filter((s) => s !== id))

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-1.5 scrollbar-thin">
          {items.map((item) => {
            const id = `assign-${item.id}`
            return (
              <label key={item.id} htmlFor={id} className="flex cursor-pointer items-start gap-2.5 rounded px-2 py-1.5 hover:bg-muted/60">
                <Checkbox id={id} checked={selectedIds.includes(item.id)} onCheckedChange={(c) => toggle(item.id, c === true)} className="mt-0.5" />
                <span className="text-sm leading-tight">
                  <span className="font-medium text-foreground">{item.name}</span>
                  {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

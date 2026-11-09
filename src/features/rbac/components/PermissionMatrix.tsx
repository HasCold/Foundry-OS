import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ACTION_HINTS, ACTION_LABELS, PERMISSION_ACTIONS, PERMISSION_CATALOG, type Permission } from '../types'
import { toPermission, togglePermission } from '../utils/permissions'

interface PermissionMatrixProps {
  value: Iterable<Permission>
  /** Omit to render the matrix read-only (e.g. a group's effective access). */
  onChange?: (next: Permission[]) => void
}

/**
 * Modules × actions grid for a role's permissions. Cells for actions a
 * resource doesn't support render as a dash rather than a disabled checkbox,
 * so it's obvious they don't exist — not that they're merely switched off.
 */
export function PermissionMatrix({ value, onChange }: PermissionMatrixProps) {
  const granted = new Set(value)
  const readOnly = !onChange

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">Module / Screen</th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="w-28 px-2 py-2 text-center font-medium">
                {ACTION_LABELS[action]}
                <span className="block text-[10px] font-normal text-muted-foreground/70">{ACTION_HINTS[action]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_CATALOG.map((module) => [
            <tr key={module.module} className="border-b border-border bg-muted/20">
              <td colSpan={PERMISSION_ACTIONS.length + 1} className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {module.module}
              </td>
            </tr>,
            ...module.resources.map((resource) => (
              <tr key={resource.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2 pl-6 text-foreground">{resource.label}</td>
                {PERMISSION_ACTIONS.map((action) => {
                  const supported = (resource.actions as readonly string[]).includes(action)
                  const checked = granted.has(toPermission(resource.key, action))
                  return (
                    <td key={action} className="px-2 py-2 text-center">
                      {supported ? (
                        <Checkbox
                          checked={checked}
                          disabled={readOnly}
                          aria-label={`${ACTION_LABELS[action]} ${resource.label}`}
                          onCheckedChange={(next) => onChange?.(togglePermission([...granted], resource.key, action, next === true))}
                          className={cn('align-middle', readOnly && 'disabled:opacity-100')}
                        />
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  )
}

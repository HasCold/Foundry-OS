import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Group, GroupInput, Role } from '../../types'
import { permissionsOfRoles } from '../../utils/permissions'
import { AssignmentChecklist } from '../AssignmentChecklist'
import { PermissionMatrix } from '../PermissionMatrix'

interface GroupDialogProps {
  /** `null` while closed; `'new'` to create; a group to edit it. */
  group: Group | 'new' | null
  roles: Role[]
  isSaving: boolean
  onClose: () => void
  onSave: (input: GroupInput) => void
}

export function GroupDialog({ group, ...props }: GroupDialogProps) {
  if (!group) return null
  // Keyed so the form resets whenever a different group (or "new") is opened.
  return <GroupForm key={group === 'new' ? 'new' : group.id} group={group} {...props} />
}

function GroupForm({ group, roles, isSaving, onClose, onSave }: Omit<GroupDialogProps, 'group'> & { group: Group | 'new' }) {
  const existing = group === 'new' ? null : group
  const [form, setForm] = useState<GroupInput>({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    roleIds: existing?.roleIds ?? [],
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existing ? `Edit group — ${existing.name}` : 'New group'}</DialogTitle>
          <DialogDescription>Everyone in this group gets every permission of the roles below.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Group name</Label>
            <Input id="group-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Finance" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group-description">Description</Label>
            <Input
              id="group-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Accounts and reporting team"
            />
          </div>
        </div>

        <AssignmentChecklist
          label="Roles in this group"
          hint="Tick the roles every member of this group should get."
          items={roles}
          selectedIds={form.roleIds}
          onChange={(roleIds) => setForm({ ...form, roleIds })}
          emptyMessage="No roles exist yet — create one under Roles first."
        />

        <div className="space-y-1.5">
          <Label>Preview — what members will get</Label>
          <p className="text-xs text-muted-foreground">Read-only. Calculated from the roles ticked above; change the roles to change this.</p>
          <PermissionMatrix value={permissionsOfRoles(form.roleIds, roles)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)} disabled={isSaving || !form.name.trim()}>
            {isSaving && <Loader2 className="animate-spin" />}
            {existing ? 'Save changes' : 'Create group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

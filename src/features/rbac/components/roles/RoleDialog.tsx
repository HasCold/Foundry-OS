import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Role, RoleInput } from '../../types'
import { PermissionMatrix } from '../PermissionMatrix'

interface RoleDialogProps {
  /** `null` while closed; `'new'` to create; a role to edit it. */
  role: Role | 'new' | null
  isSaving: boolean
  onClose: () => void
  onSave: (input: RoleInput) => void
}

export function RoleDialog({ role, isSaving, onClose, onSave }: RoleDialogProps) {
  if (!role) return null
  // Keyed so the form resets whenever a different role (or "new") is opened.
  return <RoleForm key={role === 'new' ? 'new' : role.id} role={role} isSaving={isSaving} onClose={onClose} onSave={onSave} />
}

function RoleForm({ role, isSaving, onClose, onSave }: Omit<RoleDialogProps, 'role'> & { role: Role | 'new' }) {
  const existing = role === 'new' ? null : role
  const [form, setForm] = useState<RoleInput>({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    permissions: existing?.permissions ?? [],
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existing ? `Edit role — ${existing.name}` : 'New role'}</DialogTitle>
          <DialogDescription>Pick exactly what this role can do. Granting Write or Approve also grants View.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Role name</Label>
            <Input id="role-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Finance User" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Finance view only"
            />
          </div>
        </div>

        <PermissionMatrix value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} />

        <DialogFooter className="items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">{form.permissions.length} permission(s) selected</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => onSave(form)} disabled={isSaving || !form.name.trim()}>
              {isSaving && <Loader2 className="animate-spin" />}
              {existing ? 'Save changes' : 'Create role'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

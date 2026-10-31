import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Organization, OrganizationLocation } from '@/features/setup/types'
import type { CreateUserInput, Group, Role, UserAccount, UserAssignment } from '../../types'
import { resolvePermissions } from '../../utils/permissions'
import { AssignmentChecklist } from '../AssignmentChecklist'
import { PermissionMatrix } from '../PermissionMatrix'

interface UserDialogProps {
  /** `null` while closed; `'new'` to create a user; an existing user to change their access. */
  user: UserAccount | 'new' | null
  groups: Group[]
  roles: Role[]
  organizations: Organization[]
  locations: OrganizationLocation[]
  isSaving: boolean
  onClose: () => void
  onCreate: (input: CreateUserInput) => void
  onUpdateAccess: (assignment: UserAssignment) => void
}

export function UserDialog({ user, ...props }: UserDialogProps) {
  if (!user) return null
  // Keyed so the form resets whenever a different user (or "new") is opened.
  return <UserForm key={user === 'new' ? 'new' : user.id} user={user} {...props} />
}

function UserForm({ user, groups, roles, organizations, locations, isSaving, onClose, onCreate, onUpdateAccess }: Omit<UserDialogProps, 'user'> & { user: UserAccount | 'new' }) {
  const existing = user === 'new' ? null : user
  const [identity, setIdentity] = useState({ fullName: '', email: '', password: '' })
  const primaryLocationOf = (organizationId: string | null) =>
    locations.find((l) => l.organizationId === organizationId && l.isPrimary)?.id ?? null
  const [assignment, setAssignment] = useState<UserAssignment>(() => {
    const organizationId = existing?.organizationId ?? organizations[0]?.id ?? null
    return {
      organizationId,
      locationId: existing?.locationId ?? primaryLocationOf(organizationId),
      groupIds: existing?.groupIds ?? [],
      roleIds: existing?.roleIds ?? [],
    }
  })

  const orgLocations = locations.filter((l) => l.organizationId === assignment.organizationId)
  const hasPlacement = Boolean(assignment.organizationId) && (orgLocations.length === 0 || Boolean(assignment.locationId))
  const hasIdentity = existing || (identity.fullName.trim() && identity.email.trim() && identity.password)
  const canSubmit = hasPlacement && hasIdentity
  const submit = () => (existing ? onUpdateAccess(assignment) : onCreate({ ...identity, ...assignment }))

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{existing ? `Manage user — ${existing.fullName}` : 'New user'}</DialogTitle>
          <DialogDescription>
            {existing
              ? existing.email
              : "The user signs in with your company's sign-in name, this email and the temporary password."}
          </DialogDescription>
        </DialogHeader>

        {!existing && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full name</Label>
              <Input id="user-name" value={identity.fullName} onChange={(e) => setIdentity({ ...identity, fullName: e.target.value })} placeholder="Muhammad Hasan Ali" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" value={identity.email} onChange={(e) => setIdentity({ ...identity, email: e.target.value })} placeholder="name@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="user-password">Temporary password</Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                value={identity.password}
                onChange={(e) => setIdentity({ ...identity, password: e.target.value })}
                placeholder="At least 8 characters"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="user-organization">Organization</Label>
            <Select
              value={assignment.organizationId ?? undefined}
              // Moving to another organization drops the old location — default to the new one's primary site.
              onValueChange={(organizationId) => setAssignment({ ...assignment, organizationId, locationId: primaryLocationOf(organizationId) })}
            >
              <SelectTrigger id="user-organization">
                <SelectValue placeholder="Choose organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-location">Location</Label>
            <Select
              value={assignment.locationId ?? undefined}
              onValueChange={(locationId) => setAssignment({ ...assignment, locationId })}
              disabled={orgLocations.length === 0}
            >
              <SelectTrigger id="user-location">
                <SelectValue placeholder={orgLocations.length === 0 ? 'This organization has no locations yet' : 'Choose location'} />
              </SelectTrigger>
              <SelectContent>
                {orgLocations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} · {l.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AssignmentChecklist
            label="Groups"
            hint="The user gets every role of each ticked group."
            items={groups}
            selectedIds={assignment.groupIds}
            onChange={(groupIds) => setAssignment({ ...assignment, groupIds })}
            emptyMessage="No groups exist yet."
          />
          <AssignmentChecklist
            label="Additional roles (direct)"
            hint="Extra roles for just this user, on top of their groups."
            items={roles}
            selectedIds={assignment.roleIds}
            onChange={(roleIds) => setAssignment({ ...assignment, roleIds })}
            emptyMessage="No roles exist yet."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Preview — what this user will get</Label>
          <p className="text-xs text-muted-foreground">Read-only. Groups and direct roles above, combined.</p>
          <PermissionMatrix value={resolvePermissions(assignment, groups, roles)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isSaving || !canSubmit}>
            {isSaving && <Loader2 className="animate-spin" />}
            {existing ? 'Save changes' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

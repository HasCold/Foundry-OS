import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import type { Role } from '../../types'
import { useAccessControl } from '../../hooks/useAccessControl'
import { RoleDialog } from './RoleDialog'

export function RolesPage() {
  const { roles, roleUsage, saveRole, deleteRole, isSavingRole, isDeletingRole } = useAccessControl()
  const [editing, setEditing] = useState<Role | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)

  const columns: DataTableColumn<Role>[] = [
    {
      id: 'name',
      header: 'Role',
      accessor: (r) => (
        <div>
          <p className="font-medium text-foreground">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.description}</p>
        </div>
      ),
      sortValue: (r) => r.name.toLowerCase(),
    },
    { id: 'permissions', header: 'Permissions', accessor: (r) => r.permissions.length, sortValue: (r) => r.permissions.length },
    {
      id: 'usage',
      header: 'Assigned to',
      accessor: (r) => {
        const usage = roleUsage(r.id)
        return (
          <span className="text-xs text-muted-foreground">
            {usage.groups} group(s) · {usage.users} user(s) directly
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-24',
      accessor: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)}>
            <Pencil />
          </Button>
          <Button size="icon" variant="ghost" aria-label={`Delete ${r.name}`} onClick={() => setDeleting(r)} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Roles"
        description="A role is a named set of permissions. Assign roles to groups, or straight to a user."
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus />
            New role
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={roles}
            rowKey={(r) => r.id}
            searchable
            searchPlaceholder="Search roles…"
            searchAccessor={(r) => `${r.name} ${r.description}`}
            defaultSort={{ columnId: 'name', direction: 'asc' }}
            emptyMessage="No roles yet — create one to start granting access."
          />
        </CardContent>
      </Card>

      <RoleDialog
        role={editing}
        isSaving={isSavingRole}
        onClose={() => setEditing(null)}
        onSave={(input) => saveRole(editing === 'new' || !editing ? null : editing.id, input, () => setEditing(null))}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete role "${deleting?.name}"?`}
        description="This can't be undone. A role that's still assigned to a group or user can't be deleted."
        confirmLabel="Delete role"
        isPending={isDeletingRole}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteRole(deleting.id, () => setDeleting(null))}
      />
    </div>
  )
}

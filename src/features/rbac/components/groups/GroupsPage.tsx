import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import type { Group } from '../../types'
import { useAccessControl } from '../../hooks/useAccessControl'
import { GroupDialog } from './GroupDialog'

export function GroupsPage() {
  const { groups, roles, memberCount, saveGroup, deleteGroup, isSavingGroup, isDeletingGroup } = useAccessControl()
  const [editing, setEditing] = useState<Group | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Group | null>(null)

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? 'Unknown role'

  const columns: DataTableColumn<Group>[] = [
    {
      id: 'name',
      header: 'Group',
      accessor: (g) => (
        <div>
          <p className="font-medium text-foreground">{g.name}</p>
          <p className="text-xs text-muted-foreground">{g.description}</p>
        </div>
      ),
      sortValue: (g) => g.name.toLowerCase(),
    },
    {
      id: 'roles',
      header: 'Roles',
      accessor: (g) =>
        g.roleIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">No roles</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {g.roleIds.map((id) => (
              <Badge key={id} variant="secondary">
                {roleName(id)}
              </Badge>
            ))}
          </div>
        ),
    },
    { id: 'members', header: 'Members', accessor: (g) => memberCount(g.id), sortValue: (g) => memberCount(g.id) },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-24',
      accessor: (g) => (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" aria-label={`Edit ${g.name}`} onClick={() => setEditing(g)}>
            <Pencil />
          </Button>
          <Button size="icon" variant="ghost" aria-label={`Delete ${g.name}`} onClick={() => setDeleting(g)} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Groups"
        description="Group users by team and give the whole team its roles at once."
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus />
            New group
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={groups}
            rowKey={(g) => g.id}
            searchable
            searchPlaceholder="Search groups…"
            searchAccessor={(g) => `${g.name} ${g.description}`}
            defaultSort={{ columnId: 'name', direction: 'asc' }}
            emptyMessage="No groups yet."
          />
        </CardContent>
      </Card>

      <GroupDialog
        group={editing}
        roles={roles}
        isSaving={isSavingGroup}
        onClose={() => setEditing(null)}
        onSave={(input) => saveGroup(editing === 'new' || !editing ? null : editing.id, input, () => setEditing(null))}
      />

      <ConfirmDialog
        open={!!deleting}
        title={`Delete group "${deleting?.name}"?`}
        description="This can't be undone. A group that still has members can't be deleted."
        confirmLabel="Delete group"
        isPending={isDeletingGroup}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteGroup(deleting.id, () => setDeleting(null))}
      />
    </div>
  )
}

import { useState } from 'react'
import { Crown, Plus, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import type { UserAccount } from '../../types'
import { useAccessControl } from '../../hooks/useAccessControl'
import { UserDialog } from './UserDialog'

export function UsersPage() {
  const { users, groups, roles, createUser, setUserAssignment, setUserStatus, isSavingUser } = useAccessControl()
  const [editing, setEditing] = useState<UserAccount | 'new' | null>(null)

  const nameOf = (items: { id: string; name: string }[], id: string) => items.find((i) => i.id === id)?.name ?? 'Unknown'

  const columns: DataTableColumn<UserAccount>[] = [
    {
      id: 'name',
      header: 'User',
      accessor: (u) => (
        <div>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            {u.fullName}
            {u.isSuperUser && (
              <Badge variant="warning">
                <Crown className="h-3 w-3" />
                Super User
              </Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
      sortValue: (u) => u.fullName.toLowerCase(),
    },
    {
      id: 'access',
      header: 'Groups & roles',
      accessor: (u) => {
        if (u.isSuperUser) return <span className="text-xs text-muted-foreground">Full access to everything</span>
        if (u.groupIds.length === 0 && u.roleIds.length === 0) return <Badge variant="muted">No access assigned</Badge>
        return (
          <div className="flex flex-wrap gap-1">
            {u.groupIds.map((id) => (
              <Badge key={id} variant="secondary">
                {nameOf(groups, id)}
              </Badge>
            ))}
            {u.roleIds.map((id) => (
              <Badge key={id} variant="outline">
                {nameOf(roles, id)}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (u) => <Badge variant={u.status === 'active' ? 'success' : 'muted'}>{u.status === 'active' ? 'Active' : 'Deactivated'}</Badge>,
      sortValue: (u) => u.status,
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-56',
      accessor: (u) =>
        u.isSuperUser ? null : (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
              <ShieldCheck />
              Manage access
            </Button>
            {u.status === 'active' ? (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setUserStatus(u.id, 'disabled')}>
                <UserX />
                Deactivate
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setUserStatus(u.id, 'active')}>
                <UserCheck />
                Reactivate
              </Button>
            )}
          </div>
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="User Administration"
        description="Add people to your organization and decide what each of them can access."
        actions={
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus />
            New user
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={users}
            rowKey={(u) => u.id}
            searchable
            searchPlaceholder="Search by name or email…"
            searchAccessor={(u) => `${u.fullName} ${u.email}`}
            defaultSort={{ columnId: 'name', direction: 'asc' }}
          />
        </CardContent>
      </Card>

      <UserDialog
        user={editing}
        groups={groups}
        roles={roles}
        isSaving={isSavingUser}
        onClose={() => setEditing(null)}
        onCreate={(input) => createUser(input, () => setEditing(null))}
        onUpdateAccess={(assignment) => editing && editing !== 'new' && setUserAssignment(editing.id, assignment, () => setEditing(null))}
      />
    </div>
  )
}

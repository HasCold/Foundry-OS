import { useState } from 'react'
import { Building, Crown, MapPin, Plus, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserAccount } from '../../types'
import { useAccessControl } from '../../hooks/useAccessControl'
import { UserDialog } from './UserDialog'

/** Organization filter value meaning "don't filter". */
const ALL_ORGANIZATIONS = 'all'

export function UsersPage() {
  const { users, groups, roles, organizations, locations, createUser, setUserAssignment, setUserStatus, isSavingUser } = useAccessControl()
  const [editing, setEditing] = useState<UserAccount | 'new' | null>(null)
  const [organizationFilter, setOrganizationFilter] = useState(ALL_ORGANIZATIONS)

  // The super user spans every organization, so they show under each filter.
  const visibleUsers =
    organizationFilter === ALL_ORGANIZATIONS ? users : users.filter((u) => u.isSuperUser || u.organizationId === organizationFilter)

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
      id: 'placement',
      header: 'Organization / Location',
      accessor: (u) => {
        if (u.isSuperUser) return <span className="text-xs text-muted-foreground">All organizations</span>
        if (!u.organizationId) return <Badge variant="muted">Not assigned</Badge>
        const location = locations.find((l) => l.id === u.locationId)
        return (
          <div className="space-y-0.5 text-xs">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              <Building className="h-3 w-3 text-muted-foreground" />
              {nameOf(organizations, u.organizationId)}
            </p>
            {location && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {location.name}
              </p>
            )}
          </div>
        )
      },
      sortValue: (u) => (u.organizationId ? nameOf(organizations, u.organizationId) : ''),
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
              Manage
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
        description="Add people, place them in an organization and location, and decide what each of them can access."
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
            data={visibleUsers}
            rowKey={(u) => u.id}
            searchable
            searchPlaceholder="Search by name or email…"
            searchAccessor={(u) => `${u.fullName} ${u.email}`}
            defaultSort={{ columnId: 'name', direction: 'asc' }}
            toolbar={
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger className="w-56" aria-label="Filter by organization">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ORGANIZATIONS}>All organizations</SelectItem>
                  {organizations.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>

      <UserDialog
        user={editing}
        groups={groups}
        roles={roles}
        organizations={organizations}
        locations={locations}
        isSaving={isSavingUser}
        onClose={() => setEditing(null)}
        onCreate={(input) => createUser(input, () => setEditing(null))}
        onUpdateAccess={(assignment) => editing && editing !== 'new' && setUserAssignment(editing.id, assignment, () => setEditing(null))}
      />
    </div>
  )
}

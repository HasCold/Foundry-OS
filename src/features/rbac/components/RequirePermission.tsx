import { Outlet } from 'react-router-dom'
import type { ResourceKey } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { AccessDenied } from './AccessDenied'

/** Route gate: renders the nested route only if the user can view `resource`. */
export function RequirePermission({ resource }: { resource: ResourceKey }) {
  const { can } = usePermissions()
  return can(resource) ? <Outlet /> : <AccessDenied />
}

/** Route gate for access management, which only the organization's super user may open. */
export function RequireSuperUser() {
  const { isSuperUser } = usePermissions()
  return isSuperUser ? <Outlet /> : <AccessDenied message="Only the organization super user can manage users, groups and roles." />
}

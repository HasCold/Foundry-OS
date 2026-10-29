import type { Group, Permission, PermissionAction, ResourceKey, Role, UserAssignment } from '../types'
import { PERMISSION_CATALOG } from '../types'

export const toPermission = (resource: ResourceKey, action: PermissionAction): Permission => `${resource}:${action}`

/** Every valid grant in the catalog — what a super user implicitly holds. */
export const ALL_PERMISSIONS: Permission[] = PERMISSION_CATALOG.flatMap((module) =>
  module.resources.flatMap((resource) => resource.actions.map((action) => toPermission(resource.key, action))),
)

/** The union of every permission granted by these roles. */
export function permissionsOfRoles(roleIds: string[], roles: Role[]): Set<Permission> {
  const granted = new Set<Permission>()
  roles.filter((r) => roleIds.includes(r.id)).forEach((r) => r.permissions.forEach((p) => granted.add(p)))
  return granted
}

/** A user's effective access: their direct roles plus every role of every group they're in. */
export function resolvePermissions(assignment: UserAssignment, groups: Group[], roles: Role[]): Set<Permission> {
  const viaGroups = groups.filter((g) => assignment.groupIds.includes(g.id)).flatMap((g) => g.roleIds)
  return permissionsOfRoles([...assignment.roleIds, ...viaGroups], roles)
}

/**
 * Toggles one cell of the permission matrix, keeping the set coherent:
 * `write` and `approve` imply `view` (you can't change what you can't open), and
 * revoking `view` revokes every other action on that resource with it.
 */
export function togglePermission(
  current: Permission[],
  resource: ResourceKey,
  action: PermissionAction,
  granted: boolean,
): Permission[] {
  const next = new Set(current)
  const target = toPermission(resource, action)

  if (granted) {
    next.add(target)
    next.add(toPermission(resource, 'view'))
  } else if (action === 'view') {
    ;[...next].filter((p) => p.startsWith(`${resource}:`)).forEach((p) => next.delete(p))
  } else {
    next.delete(target)
  }

  return [...next]
}

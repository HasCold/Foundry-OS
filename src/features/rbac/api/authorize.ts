import { useAuthStore } from '@/features/auth/store/authStore'
import type { PermissionAction, ResourceKey } from '../types'
import { assignmentOf, useRbacStore } from '../store/rbacStore'
import { resolvePermissions, toPermission } from '../utils/permissions'

/** Non-reactive permission check against the current session — for code outside React (api layers, stores). */
export function hasPermission(resource: ResourceKey, action: PermissionAction = 'view'): boolean {
  const user = useAuthStore.getState().currentUser
  if (!user) return false
  if (user.isSuperUser) return true
  const { groups, roles, assignments } = useRbacStore.getState()
  return resolvePermissions(assignmentOf(assignments, user.id), groups, roles).has(toPermission(resource, action))
}

/**
 * The "server-side" half of RBAC. Hiding a button isn't security — every
 * feature `api/` function that changes data calls this first, exactly where a
 * real backend would reject the request with a 403. Swapping in a real API
 * later just means deleting these calls; the server takes over the check.
 */
export function authorize(resource: ResourceKey, action: PermissionAction) {
  if (!hasPermission(resource, action)) throw new Error("You don't have permission to do that.")
}

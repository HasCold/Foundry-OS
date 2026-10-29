import { useCallback, useMemo } from 'react'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { Permission, PermissionAction, ResourceKey } from '../types'
import { assignmentOf, useRbacStore } from '../store/rbacStore'
import { ALL_PERMISSIONS, resolvePermissions, toPermission } from '../utils/permissions'

/**
 * The one hook every screen uses to ask "may the signed-in user do this?".
 * Re-renders automatically when the user's roles or groups change, so a
 * revoked permission disappears from the UI immediately.
 */
export function usePermissions() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const roles = useRbacStore((s) => s.roles)
  const groups = useRbacStore((s) => s.groups)
  const assignments = useRbacStore((s) => s.assignments)

  const permissions = useMemo<Set<Permission>>(() => {
    if (!currentUser) return new Set()
    if (currentUser.isSuperUser) return new Set(ALL_PERMISSIONS)
    return resolvePermissions(assignmentOf(assignments, currentUser.id), groups, roles)
  }, [currentUser, assignments, groups, roles])

  const can = useCallback(
    (resource: ResourceKey, action: PermissionAction = 'view') => permissions.has(toPermission(resource, action)),
    [permissions],
  )

  return {
    can,
    isSuperUser: currentUser?.isSuperUser ?? false,
  }
}

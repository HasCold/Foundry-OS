import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toPublicUser, useAuthStore } from '@/features/auth/store/authStore'
import { useSetupStore } from '@/features/setup/store/setupStore'
import type { UserStatus } from '@/features/auth/types'
import type { CreateUserInput, GroupInput, RoleInput, UserAccount, UserAssignment } from '../types'
import { assignmentOf, useRbacStore } from '../store/rbacStore'
import { rbacApi } from '../api/rbacApi'
import { toast } from '@/components/ui/toast-store'

/**
 * Everything the User Administration, Groups and Roles screens need. Users
 * are scoped to the signed-in user's organization; roles and groups follow
 * the rest of this demo and are shared.
 */
export function useAccessControl() {
  const roles = useRbacStore((s) => s.roles)
  const groups = useRbacStore((s) => s.groups)
  const assignments = useRbacStore((s) => s.assignments)
  const registeredUsers = useAuthStore((s) => s.registeredUsers)
  const currentUser = useAuthStore((s) => s.currentUser)
  // Read-only: users are placed in an organization and one of its locations, which Setup owns.
  const organizations = useSetupStore((s) => s.organizations)
  const locations = useSetupStore((s) => s.locations)
  const queryClient = useQueryClient()

  const users = useMemo<UserAccount[]>(
    () =>
      registeredUsers
        .filter((u) => u.organizationName === currentUser?.organizationName)
        .map((u) => ({ ...toPublicUser(u), ...assignmentOf(assignments, u.id) })),
    [registeredUsers, assignments, currentUser?.organizationName],
  )

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rbac'] })
  const onSuccess = (title: string) => () => {
    invalidate()
    toast({ title, variant: 'success' })
  }

  const createRole = useMutation({ mutationFn: rbacApi.createRole, onSuccess: onSuccess('Role created') })
  const updateRole = useMutation({ mutationFn: rbacApi.updateRole, onSuccess: onSuccess('Role updated') })
  const deleteRole = useMutation({ mutationFn: rbacApi.deleteRole, onSuccess: onSuccess('Role deleted') })

  const createGroup = useMutation({ mutationFn: rbacApi.createGroup, onSuccess: onSuccess('Group created') })
  const updateGroup = useMutation({ mutationFn: rbacApi.updateGroup, onSuccess: onSuccess('Group updated') })
  const deleteGroup = useMutation({ mutationFn: rbacApi.deleteGroup, onSuccess: onSuccess('Group deleted') })

  const createUser = useMutation({ mutationFn: rbacApi.createUser, onSuccess: onSuccess('User created') })
  const setUserAssignment = useMutation({ mutationFn: rbacApi.setUserAssignment, onSuccess: onSuccess('Access updated') })
  const setUserStatus = useMutation({
    mutationFn: rbacApi.setUserStatus,
    onSuccess: (_d, vars) => onSuccess(vars.status === 'active' ? 'User reactivated' : 'User deactivated')(),
  })

  return {
    roles,
    groups,
    users,
    organizations,
    locations,
    /** How many groups / users reference a role — shown in the roles list and used to explain blocked deletes. */
    roleUsage: (roleId: string) => ({
      groups: groups.filter((g) => g.roleIds.includes(roleId)).length,
      users: Object.values(assignments).filter((a) => a.roleIds.includes(roleId)).length,
    }),
    memberCount: (groupId: string) => users.filter((u) => u.groupIds.includes(groupId)).length,

    // Each save takes an `onSaved` callback so dialogs close only once the change actually went through.
    saveRole: (roleId: string | null, input: RoleInput, onSaved: () => void) =>
      roleId ? updateRole.mutate({ roleId, input }, { onSuccess: onSaved }) : createRole.mutate(input, { onSuccess: onSaved }),
    deleteRole: (roleId: string, onDeleted: () => void) => deleteRole.mutate(roleId, { onSuccess: onDeleted }),
    isSavingRole: createRole.isPending || updateRole.isPending,
    isDeletingRole: deleteRole.isPending,

    saveGroup: (groupId: string | null, input: GroupInput, onSaved: () => void) =>
      groupId ? updateGroup.mutate({ groupId, input }, { onSuccess: onSaved }) : createGroup.mutate(input, { onSuccess: onSaved }),
    deleteGroup: (groupId: string, onDeleted: () => void) => deleteGroup.mutate(groupId, { onSuccess: onDeleted }),
    isSavingGroup: createGroup.isPending || updateGroup.isPending,
    isDeletingGroup: deleteGroup.isPending,

    createUser: (input: CreateUserInput, onSaved: () => void) => createUser.mutate(input, { onSuccess: onSaved }),
    setUserAssignment: (userId: string, assignment: UserAssignment, onSaved: () => void) =>
      setUserAssignment.mutate({ userId, assignment }, { onSuccess: onSaved }),
    setUserStatus: (userId: string, status: UserStatus) => setUserStatus.mutate({ userId, status }),
    isSavingUser: createUser.isPending || setUserAssignment.isPending,
  }
}

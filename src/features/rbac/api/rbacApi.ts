import type { UserStatus } from '@/features/auth/types'
import { mockNetwork } from '@/lib/mock-async'
import type { CreateUserInput, GroupInput, RoleInput, UserAssignment } from '../types'
import { useRbacStore } from '../store/rbacStore'

export const rbacApi = {
  createRole: (input: RoleInput) => mockNetwork(() => useRbacStore.getState().createRole(input)),
  updateRole: (args: { roleId: string; input: RoleInput }) => mockNetwork(() => useRbacStore.getState().updateRole(args.roleId, args.input)),
  deleteRole: (roleId: string) => mockNetwork(() => useRbacStore.getState().deleteRole(roleId)),

  createGroup: (input: GroupInput) => mockNetwork(() => useRbacStore.getState().createGroup(input)),
  updateGroup: (args: { groupId: string; input: GroupInput }) => mockNetwork(() => useRbacStore.getState().updateGroup(args.groupId, args.input)),
  deleteGroup: (groupId: string) => mockNetwork(() => useRbacStore.getState().deleteGroup(groupId)),

  createUser: (input: CreateUserInput) => mockNetwork(() => useRbacStore.getState().createUser(input)),
  setUserAssignment: (args: { userId: string; assignment: UserAssignment }) =>
    mockNetwork(() => useRbacStore.getState().setUserAssignment(args.userId, args.assignment)),
  setUserStatus: (args: { userId: string; status: UserStatus }) => mockNetwork(() => useRbacStore.getState().setUserStatus(args.userId, args.status)),
}

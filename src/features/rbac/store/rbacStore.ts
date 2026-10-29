import { create } from 'zustand'
import type { CreateUserInput, Group, GroupInput, Role, RoleInput, UserAssignment } from '../types'
import { assignments as initialAssignments, groups as initialGroups, roles as initialRoles } from '@/mock/rbac'
import { useAuthStore } from '@/features/auth/store/authStore'
import type { UserStatus } from '@/features/auth/types'
import { nextId } from '@/lib/utils'

const NO_ASSIGNMENT: UserAssignment = { groupIds: [], roleIds: [] }

interface RbacState {
  roles: Role[]
  groups: Group[]
  /** userId -> the groups and roles that user has been given. Identity itself lives in the Auth store. */
  assignments: Record<string, UserAssignment>

  createRole: (input: RoleInput) => void
  updateRole: (roleId: string, input: RoleInput) => void
  deleteRole: (roleId: string) => void

  createGroup: (input: GroupInput) => void
  updateGroup: (groupId: string, input: GroupInput) => void
  deleteGroup: (groupId: string) => void

  createUser: (input: CreateUserInput) => void
  setUserAssignment: (userId: string, assignment: UserAssignment) => void
  setUserStatus: (userId: string, status: UserStatus) => void
}

// --- Guard rails --------------------------------------------------------------
// These run inside the store (not just the UI) so they hold no matter which
// screen — or, later, which API client — triggers the change. Each throws an
// Error whose message is safe to show the user; mockNetwork turns it into a
// rejected mutation and the hook toasts it.

/** Access management is reserved for the organization's super user. */
function assertSuperUser() {
  const actor = useAuthStore.getState().currentUser
  if (!actor?.isSuperUser) throw new Error('Only the organization super user can manage access.')
}

function assertName(name: string, existing: { id: string; name: string }[], selfId: string | null, kind: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error(`${kind} name is required.`)
  const clash = existing.find((e) => e.id !== selfId && e.name.trim().toLowerCase() === trimmed.toLowerCase())
  if (clash) throw new Error(`A ${kind.toLowerCase()} named "${clash.name}" already exists.`)
}

/** Super users can't be reassigned or deactivated — they'd lock the organization out of its own access management. */
function assertNotSuperUser(userId: string) {
  const user = useAuthStore.getState().registeredUsers.find((u) => u.id === userId)
  if (!user) throw new Error('User not found.')
  if (user.isSuperUser) throw new Error(`${user.fullName} is the organization super user — their access can't be changed.`)
}

function findOrThrow<T extends { id: string }>(items: T[], id: string, kind: string): T {
  const item = items.find((i) => i.id === id)
  if (!item) throw new Error(`${kind} not found.`)
  return item
}

export const useRbacStore = create<RbacState>((set, get) => ({
  roles: initialRoles,
  groups: initialGroups,
  assignments: initialAssignments,

  createRole: (input) => {
    assertSuperUser()
    assertName(input.name, get().roles, null, 'Role')
    const role: Role = { id: nextId('role'), name: input.name.trim(), description: input.description.trim(), permissions: input.permissions }
    set((state) => ({ roles: [...state.roles, role] }))
  },

  updateRole: (roleId, input) => {
    assertSuperUser()
    findOrThrow(get().roles, roleId, 'Role')
    assertName(input.name, get().roles, roleId, 'Role')
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId ? { ...r, name: input.name.trim(), description: input.description.trim(), permissions: input.permissions } : r,
      ),
    }))
  },

  deleteRole: (roleId) => {
    assertSuperUser()
    const { roles, groups, assignments } = get()
    const role = findOrThrow(roles, roleId, 'Role')
    // Block rather than cascade: silently stripping a role out of live
    // assignments would revoke people's access as a side effect of a cleanup.
    const groupNames = groups.filter((g) => g.roleIds.includes(roleId)).map((g) => g.name)
    const directUsers = Object.values(assignments).filter((a) => a.roleIds.includes(roleId)).length
    if (groupNames.length > 0 || directUsers > 0) {
      const usedBy = [...groupNames, ...(directUsers > 0 ? [`${directUsers} user(s) directly`] : [])]
      throw new Error(`"${role.name}" is still assigned to ${usedBy.join(', ')}. Unassign it first.`)
    }
    set({ roles: roles.filter((r) => r.id !== roleId) })
  },

  createGroup: (input) => {
    assertSuperUser()
    assertName(input.name, get().groups, null, 'Group')
    const group: Group = { id: nextId('grp'), name: input.name.trim(), description: input.description.trim(), roleIds: input.roleIds }
    set((state) => ({ groups: [...state.groups, group] }))
  },

  updateGroup: (groupId, input) => {
    assertSuperUser()
    findOrThrow(get().groups, groupId, 'Group')
    assertName(input.name, get().groups, groupId, 'Group')
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, name: input.name.trim(), description: input.description.trim(), roleIds: input.roleIds } : g,
      ),
    }))
  },

  deleteGroup: (groupId) => {
    assertSuperUser()
    const { groups, assignments } = get()
    const group = findOrThrow(groups, groupId, 'Group')
    const memberCount = Object.values(assignments).filter((a) => a.groupIds.includes(groupId)).length
    if (memberCount > 0) throw new Error(`"${group.name}" still has ${memberCount} member(s). Remove them from the group first.`)
    set({ groups: groups.filter((g) => g.id !== groupId) })
  },

  createUser: (input) => {
    assertSuperUser()
    if (!input.fullName.trim()) throw new Error('Full name is required.')
    if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) throw new Error('Enter a valid email address.')
    if (input.password.length < 8) throw new Error('Temporary password must be at least 8 characters.')

    // Direct call: creating the login is Auth's half of the same "add a user"
    // operation, not a cross-cutting reaction, so there's nothing to decouple.
    const user = useAuthStore.getState().registerUser(input)
    set((state) => ({ assignments: { ...state.assignments, [user.id]: { groupIds: input.groupIds, roleIds: input.roleIds } } }))
  },

  setUserAssignment: (userId, assignment) => {
    assertSuperUser()
    assertNotSuperUser(userId)
    set((state) => ({ assignments: { ...state.assignments, [userId]: assignment } }))
  },

  setUserStatus: (userId, status) => {
    assertSuperUser()
    assertNotSuperUser(userId)
    useAuthStore.getState().setUserStatus(userId, status)
  },
}))

/** A user's assignment, or an empty one if they've never been given anything. */
export const assignmentOf = (assignments: Record<string, UserAssignment>, userId: string) => assignments[userId] ?? NO_ASSIGNMENT

import type { AuthenticatedUser } from '@/features/auth/types'

// ---------------------------------------------------------------------------
// Role-based access control.
//
//   User ──< Group ──< Role ──< Permission
//     └──────────────< Role        (roles can also be assigned directly)
//
// A permission is one action on one resource ("finance:view"). Roles bundle
// permissions, groups bundle roles, and users get roles directly and/or
// through groups. A user's effective access is the union of everything
// reachable — there are no deny rules, so an extra assignment only widens it.
//
// The organization's super user (see `RegisteredUser.isSuperUser`) sits above
// all of this: they implicitly hold every permission and are the only person
// who can manage roles, groups and assignments. That's why access management
// itself is deliberately NOT in the permission catalog — it can't be delegated.
// ---------------------------------------------------------------------------

/**
 * Three levels per screen. `write` covers adding, editing and deleting
 * together — not every screen supports all three, so splitting them would
 * mostly produce checkboxes that guard nothing. `approve` stays separate
 * because sign-offs (payments, PO approval, QA dispositions) usually belong
 * to different people than the ones entering the data.
 */
export const PERMISSION_ACTIONS = ['view', 'write', 'approve'] as const
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  write: 'Write',
  approve: 'Approve',
}

/** Shown under the matrix headings so "Write" isn't ambiguous. */
export const ACTION_HINTS: Record<PermissionAction, string> = {
  view: 'Open and read',
  write: 'Add, edit, delete',
  approve: 'Sign off',
}

interface ResourceDef {
  key: string
  label: string
  /** Only these actions make sense for this resource — the matrix greys out the rest. */
  actions: readonly PermissionAction[]
}

/**
 * Every securable screen in the app, grouped the way the sidebar groups them.
 * Adding a module to RBAC means adding one entry here; the role editor, the
 * Administrator role and the type of `ResourceKey` all derive from this list.
 */
export const PERMISSION_CATALOG = [
  {
    module: 'Setup',
    resources: [
      { key: 'setup.companyProfile', label: 'Company Profile', actions: ['view', 'write'] },
      { key: 'setup.businessDetails', label: 'Business Details', actions: ['view', 'write'] },
    ],
  },
  {
    module: 'Overview',
    resources: [{ key: 'dashboard', label: 'Executive Dashboard', actions: ['view'] }],
  },
  {
    module: 'Engineering',
    resources: [{ key: 'bom', label: 'BOM & Costing Engine', actions: ['view', 'write'] }],
  },
  {
    module: 'Operations',
    resources: [
      { key: 'scheduler', label: 'Production Scheduler', actions: ['view', 'write'] },
      { key: 'inventory', label: 'Inventory & MRP', actions: ['view', 'write'] },
    ],
  },
  {
    module: 'Quality & Sourcing',
    resources: [
      { key: 'quality', label: 'Quality Assurance', actions: ['view', 'write', 'approve'] },
      { key: 'procurement', label: 'Procurement', actions: ['view', 'write', 'approve'] },
    ],
  },
  {
    module: 'Insights',
    resources: [
      { key: 'analytics', label: 'BI Analytics', actions: ['view'] },
      { key: 'finance', label: 'Finance & Ledger', actions: ['view', 'write', 'approve'] },
    ],
  },
] as const satisfies readonly { module: string; resources: readonly ResourceDef[] }[]

export type ResourceKey = (typeof PERMISSION_CATALOG)[number]['resources'][number]['key']

/** A single grant, e.g. `"procurement:approve"`. */
export type Permission = `${ResourceKey}:${PermissionAction}`

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface Group {
  id: string
  name: string
  description: string
  roleIds: string[]
}

/** What a single user has been given. Effective access = these roles + every role of these groups. */
export interface UserAssignment {
  groupIds: string[]
  roleIds: string[]
}

/** A user as User Administration sees it: identity from Auth joined with assignments from RBAC. */
export interface UserAccount extends AuthenticatedUser, UserAssignment {}

export interface RoleInput {
  name: string
  description: string
  permissions: Permission[]
}

export interface GroupInput {
  name: string
  description: string
  roleIds: string[]
}

export interface CreateUserInput extends UserAssignment {
  fullName: string
  email: string
  password: string
}

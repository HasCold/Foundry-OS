import type { Group, Role, UserAssignment } from '@/features/rbac/types'

export const roles: Role[] = [
  {
    id: 'role-finance-user',
    name: 'Finance User',
    description: 'Finance view only — reads the ledger, statements and reports.',
    permissions: ['dashboard:view', 'finance:view', 'analytics:view', 'setup.companyProfile:view'],
  },
  {
    id: 'role-finance-manager',
    name: 'Finance Manager',
    description: 'Posts and approves finance transactions.',
    permissions: ['dashboard:view', 'finance:view', 'finance:write', 'finance:approve', 'analytics:view', 'procurement:view'],
  },
  {
    id: 'role-production-planner',
    name: 'Production Planner',
    description: 'Plans production runs and maintains BOMs and inventory.',
    permissions: [
      'dashboard:view',
      'bom:view',
      'bom:write',
      'scheduler:view',
      'scheduler:write',
      'inventory:view',
      'inventory:write',
    ],
  },
  {
    id: 'role-company-admin',
    name: 'Company Settings Admin',
    description: 'Maintains the company profile and business details.',
    permissions: ['setup.companyProfile:view', 'setup.companyProfile:write', 'setup.businessDetails:view', 'setup.businessDetails:write'],
  },
]

export const groups: Group[] = [
  { id: 'grp-finance', name: 'Finance', description: 'Accounts and reporting team.', roleIds: ['role-finance-user'] },
  { id: 'grp-administration', name: 'Administration', description: 'Back-office staff.', roleIds: ['role-company-admin'] },
  { id: 'grp-production', name: 'Production', description: 'Planners and shop-floor supervisors.', roleIds: ['role-production-planner'] },
]

/** userId -> assignments for the seeded accounts in `authStore`. The super user needs none. */
export const assignments: Record<string, UserAssignment> = {
  'user-seed-2': { organizationId: 'org-1', locationId: 'loc-1', groupIds: ['grp-finance'], roleIds: [] },
}

/** Industries offered on the sign-up form; purely cosmetic (no logic branches on it). */
export const INDUSTRY_TYPES = [
  'Discrete Manufacturing',
  'Process Manufacturing',
  'Automotive & Heavy Equipment',
  'Electronics & Semiconductors',
  'Aerospace & Defense',
  'Consumer Packaged Goods',
  'Other',
] as const

export type IndustryType = (typeof INDUSTRY_TYPES)[number]

/** Deactivated accounts keep their history but can no longer sign in. */
export type UserStatus = 'active' | 'disabled'

/**
 * A registered account. Password is stored in plaintext in-memory — this is
 * an explicitly demo-only, no-backend auth simulation, never a real auth
 * system. Nothing here should be mistaken for production practice.
 */
export interface RegisteredUser {
  id: string
  fullName: string
  email: string
  password: string
  organizationName: string
  industry: IndustryType
  status: UserStatus
  /**
   * The organization's owner — whoever signed the organization up. A super
   * user bypasses every permission check and is the only one who can manage
   * roles, groups and users. Accounts created from User Administration never are.
   */
  isSuperUser: boolean
}

/** The subset of a registered user that's safe to keep around as "the current session". */
export type AuthenticatedUser = Omit<RegisteredUser, 'password'>

/** Which screen of the auth flow is currently showing. Drives routing inside `/auth`. */
export type AuthView = 'login' | 'signup' | 'verify' | 'forgot-password' | 'reset-success'

/** What an administrator supplies when creating a user inside an existing organization. */
export interface NewUserInput {
  fullName: string
  email: string
  password: string
}

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  organizationName: string
  industry: IndustryType
}

export interface LoginInput {
  organizationName: string
  email: string
  password: string
}

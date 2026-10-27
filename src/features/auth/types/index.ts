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
}

/** The subset of a registered user that's safe to keep around as "the current session". */
export type AuthenticatedUser = Omit<RegisteredUser, 'password'>

/** Which screen of the auth flow is currently showing. Drives routing inside `/auth`. */
export type AuthView = 'login' | 'signup' | 'verify' | 'forgot-password' | 'reset-success'

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

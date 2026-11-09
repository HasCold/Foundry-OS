import { create } from 'zustand'
import type { AuthenticatedUser, LoginInput, NewUserInput, RegisteredUser, SignUpInput, UserStatus } from '../types'
import { nextId } from '@/lib/utils'

/** Strips the password off a registered user before it's exposed as "the current session". */
export function toPublicUser(user: RegisteredUser): AuthenticatedUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Seeded accounts so the login page is usable on first load without having
 * to sign up first. The admin owns the organization (super user); the
 * analyst's access comes from the roles assigned in `src/mock/rbac.ts`. Entirely in-memory,
 * just like everything else — there is no real backend behind any of this.
 */
const SEEDED_ACCOUNTS: RegisteredUser[] = [
  {
    id: 'user-seed-1',
    fullName: 'Operations Admin',
    email: 'admin@foundryos.dev',
    password: 'foundry123',
    organizationName: 'Northbridge Fabrication',
    industry: 'Discrete Manufacturing',
    status: 'active',
    isSuperUser: true,
  },
  {
    id: 'user-seed-2',
    fullName: 'Sara Khan',
    email: 'finance@foundryos.dev',
    password: 'foundry123',
    organizationName: 'Northbridge Fabrication',
    industry: 'Discrete Manufacturing',
    status: 'active',
    isSuperUser: false,
  },
]

interface AuthState {
  isAuthenticated: boolean
  currentUser: AuthenticatedUser | null
  /** Everyone who has ever completed sign-up + verification or been created by an admin, plus the seeded accounts. */
  registeredUsers: RegisteredUser[]
  /** A sign-up that's been submitted but not yet verified — holds the form here until `verifyEmail` succeeds. */
  pendingSignUp: RegisteredUser | null

  /** Step 1 of sign-up: stash the form as "pending" and hand control to the verification screen. */
  beginSignUp: (input: SignUpInput) => void
  /** Step 2 of sign-up: any well-formed 4 or 6 digit code "confirms" the pending account and logs it in. */
  verifyEmail: (code: string) => { ok: boolean; error?: string }
  /** Matches org name + email + password against registered accounts (case-insensitive on name/email). */
  login: (input: LoginInput) => { ok: boolean; error?: string }
  logout: () => void

  /** Adds a user to the signed-in user's organization (admin-driven, no verification step). Throws if the email is taken in that org. */
  registerUser: (input: NewUserInput) => AuthenticatedUser
  /** Activates or deactivates an account. A deactivated account can no longer sign in. */
  setUserStatus: (userId: string, status: UserStatus) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  registeredUsers: SEEDED_ACCOUNTS,
  pendingSignUp: null,

  beginSignUp: (input) => {
    // Whoever creates an organization owns it.
    const pending: RegisteredUser = { id: nextId('user'), ...input, status: 'active', isSuperUser: true }
    set({ pendingSignUp: pending })
  },

  verifyEmail: (code) => {
    const isWellFormedCode = /^\d{4}$|^\d{6}$/.test(code.trim())
    if (!isWellFormedCode) return { ok: false, error: 'Enter the 4 or 6 digit code exactly as shown.' }

    const pending = get().pendingSignUp
    if (!pending) return { ok: false, error: 'No sign-up in progress — start again from the sign-up page.' }

    set((state) => ({
      registeredUsers: [...state.registeredUsers, pending],
      pendingSignUp: null,
      isAuthenticated: true,
      currentUser: toPublicUser(pending),
    }))
    return { ok: true }
  },

  login: ({ organizationName, email, password }) => {
    const match = get().registeredUsers.find(
      (u) => sameText(u.organizationName, organizationName) && sameText(u.email, email) && u.password === password,
    )
    if (!match) return { ok: false, error: 'No account matches that organization, email, and password.' }
    if (match.status === 'disabled') return { ok: false, error: 'This account has been deactivated. Contact your administrator.' }

    set({ isAuthenticated: true, currentUser: toPublicUser(match) })
    return { ok: true }
  },

  logout: () => set({ isAuthenticated: false, currentUser: null }),

  registerUser: (input) => {
    const owner = get().currentUser
    if (!owner) throw new Error('You must be signed in to create users.')

    const emailTaken = get().registeredUsers.some(
      (u) => sameText(u.organizationName, owner.organizationName) && sameText(u.email, input.email),
    )
    if (emailTaken) throw new Error(`A user with the email ${input.email.trim()} already exists in this organization.`)

    const user: RegisteredUser = {
      id: nextId('user'),
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      password: input.password,
      organizationName: owner.organizationName,
      industry: owner.industry,
      status: 'active',
      isSuperUser: false,
    }
    set((state) => ({ registeredUsers: [...state.registeredUsers, user] }))
    return toPublicUser(user)
  },

  setUserStatus: (userId, status) => {
    set((state) => ({
      registeredUsers: state.registeredUsers.map((u) => (u.id === userId ? { ...u, status } : u)),
    }))
  },
}))

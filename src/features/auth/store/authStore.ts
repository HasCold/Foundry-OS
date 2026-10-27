import { create } from 'zustand'
import type { AuthenticatedUser, LoginInput, RegisteredUser, SignUpInput } from '../types'
import { nextId } from '@/lib/utils'

/** Strips the password off a registered user before it's exposed as "the current session". */
function toPublicUser(user: RegisteredUser): AuthenticatedUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

/**
 * One seeded account so the login page is usable on first load without
 * having to sign up first. Entirely in-memory, just like everything else —
 * there is no real backend behind any of this.
 */
const FALLBACK_ACCOUNT: RegisteredUser = {
  id: 'user-seed-1',
  fullName: 'Operations Admin',
  email: 'admin@foundryos.dev',
  password: 'foundry123',
  organizationName: 'Northbridge Fabrication',
  industry: 'Discrete Manufacturing',
}

interface AuthState {
  isAuthenticated: boolean
  currentUser: AuthenticatedUser | null
  /** Everyone who has ever completed sign-up + verification, plus the seeded fallback account. */
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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  registeredUsers: [FALLBACK_ACCOUNT],
  pendingSignUp: null,

  beginSignUp: (input) => {
    const pending: RegisteredUser = { id: nextId('user'), ...input }
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
      (u) =>
        u.organizationName.trim().toLowerCase() === organizationName.trim().toLowerCase() &&
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password === password,
    )
    if (!match) return { ok: false, error: 'No account matches that organization, email, and password.' }

    set({ isAuthenticated: true, currentUser: toPublicUser(match) })
    return { ok: true }
  },

  logout: () => set({ isAuthenticated: false, currentUser: null }),
}))

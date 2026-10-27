import type { LoginInput, SignUpInput } from '../types'
import { mockNetwork } from '@/lib/mock-async'
import { useAuthStore } from '../store/authStore'

export const authApi = {
  signUp: (input: SignUpInput) =>
    mockNetwork(() => {
      useAuthStore.getState().beginSignUp(input)
      return true
    }),

  verifyEmail: (code: string) => mockNetwork(() => useAuthStore.getState().verifyEmail(code)),

  login: (input: LoginInput) => mockNetwork(() => useAuthStore.getState().login(input)),

  // No account state actually changes here — this simulates the "email sent,
  // link clicked, password reset" round-trip purely as a UI transition.
  requestPasswordReset: (_email: string) => mockNetwork(() => true, { delay: 500 }),
}

import { useMutation } from '@tanstack/react-query'
import type { LoginInput, SignUpInput } from '../types'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/authApi'
import { toast } from '@/components/ui/toast-store'

/**
 * The single entry point components use to read session state and drive the
 * auth flow. Every mutation below wraps a store action in the same
 * mockNetwork/react-query pattern the rest of the app uses, so sign-up,
 * verification, and login all exhibit real pending/error UX even though
 * nothing here talks to a server.
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useAuthStore((s) => s.currentUser)
  const pendingSignUpEmail = useAuthStore((s) => s.pendingSignUp?.email ?? null)
  const logout = useAuthStore((s) => s.logout)

  const signUpMutation = useMutation({ mutationFn: authApi.signUp })
  const verifyMutation = useMutation({ mutationFn: authApi.verifyEmail })
  const loginMutation = useMutation({ mutationFn: authApi.login })
  const resetMutation = useMutation({ mutationFn: authApi.requestPasswordReset })

  return {
    isAuthenticated,
    currentUser,
    pendingSignUpEmail,
    logout: () => {
      logout()
      toast({ title: 'Signed out', description: 'Your session has been cleared.' })
    },

    signUp: (input: SignUpInput, onDone: () => void) => signUpMutation.mutate(input, { onSuccess: onDone }),
    isSigningUp: signUpMutation.isPending,

    // verifyEmail/login return { ok, error } instead of throwing, since a
    // "wrong code" or "no match" is an expected outcome, not a network fault.
    verifyEmail: (code: string, onDone: (result: { ok: boolean; error?: string }) => void) =>
      verifyMutation.mutate(code, { onSuccess: onDone }),
    isVerifying: verifyMutation.isPending,

    login: (input: LoginInput, onDone: (result: { ok: boolean; error?: string }) => void) =>
      loginMutation.mutate(input, { onSuccess: onDone }),
    isLoggingIn: loginMutation.isPending,

    requestPasswordReset: (email: string, onDone: () => void) => resetMutation.mutate(email, { onSuccess: onDone }),
    isRequestingReset: resetMutation.isPending,
  }
}

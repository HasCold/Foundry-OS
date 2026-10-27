import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, MailCheck } from 'lucide-react'

/**
 * Simulated OTP screen. There's no real email being sent — any 4 or 6 digit
 * code is accepted (validated in `authStore.verifyEmail`) so the flow can be
 * exercised end-to-end without a mail server.
 */
export function VerifyEmailPage() {
  const { verifyEmail, isVerifying, pendingSignUpEmail } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  // No sign-up in progress (e.g. user navigated here directly) — nothing to verify.
  useEffect(() => {
    if (!pendingSignUpEmail) navigate('/signup', { replace: true })
  }, [pendingSignUpEmail, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    verifyEmail(code, (result) => {
      if (result.ok) navigate('/', { replace: true })
      else setError(result.error ?? 'Verification failed.')
    })
  }

  return (
    <AuthLayout title="Verify your email" description={`Enter the code we "sent" to ${pendingSignUpEmail ?? 'your email'} to finish setting up your account.`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
          <MailCheck className="h-4 w-4 shrink-0" />
          This is a simulated inbox — any 4 or 6 digit code will confirm your account.
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300">Confirmation code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            inputMode="numeric"
            required
            className="border-slate-700 bg-slate-800 text-center text-lg tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-slate-500"
          />
        </div>

        {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isVerifying}>
          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify & continue
        </Button>
      </form>
    </AuthLayout>
  )
}

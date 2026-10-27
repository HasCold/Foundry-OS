import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function ForgotPasswordPage() {
  const { requestPasswordReset, isRequestingReset } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requestPasswordReset(email, () => setSubmitted(true))
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email" description="We've simulated sending password reset instructions.">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-sm text-slate-300">
            If an account exists for <span className="font-medium text-white">{email}</span>, reset instructions have been "sent". In this
            in-memory demo, no real email goes out — just head back and sign in.
          </p>
          <Button asChild className="mt-2 w-full bg-blue-600 hover:bg-blue-500">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" description="Enter your account email and we'll simulate sending reset instructions.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@foundryos.dev"
            required
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isRequestingReset}>
          {isRequestingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset instructions
        </Button>

        <p className="text-center text-sm text-slate-400">
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

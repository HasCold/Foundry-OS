import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()

  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    login({ organizationName, email, password }, (result) => {
      if (result.ok) navigate('/', { replace: true })
      else setError(result.error ?? 'Login failed.')
    })
  }

  return (
    <AuthLayout title="Sign in to FoundryOS" description="Enter your organization credentials to access the shop floor.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300">Organization name</Label>
          <Input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Northbridge Fabrication"
            required
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>

        {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isLoggingIn}>
          {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>

        <p className="rounded-md border border-slate-800 bg-slate-800/50 px-3 py-2 text-xs text-slate-400">
          Demo account — org <span className="text-slate-200">Northbridge Fabrication</span>, email{' '}
          <span className="text-slate-200">admin@foundryos.dev</span>, password{' '}
          <span className="text-slate-200">foundry123</span>.
        </p>

        <p className="text-center text-sm text-slate-400">
          New to FoundryOS?{' '}
          <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { INDUSTRY_TYPES, type IndustryType } from '../types'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export function SignUpPage() {
  const { signUp, isSigningUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [industry, setIndustry] = useState<IndustryType>(INDUSTRY_TYPES[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signUp({ fullName, email, password, organizationName, industry }, () => navigate('/verify'))
  }

  return (
    <AuthLayout title="Create your FoundryOS account" description="Set up your organization to start simulating shop-floor operations.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300">Full name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jordan Reyes"
            required
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300">Company / organization name</Label>
          <Input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Acme Precision Works"
            required
            className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-300">Industry type</Label>
          <Select value={industry} onValueChange={(v) => setIndustry(v as IndustryType)}>
            <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isSigningUp}>
          {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

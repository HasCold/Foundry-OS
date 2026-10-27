import type { ReactNode } from 'react'
import { Factory } from 'lucide-react'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
}

/**
 * Shared shell for every screen in the auth flow (login, sign-up, verify,
 * forgot password). Centers a single card on a dark industrial gradient so
 * the FoundryOS brand is established before the user ever reaches the app.
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Factory className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold leading-tight tracking-tight text-white">FoundryOS</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Manufacturing Execution Platform</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

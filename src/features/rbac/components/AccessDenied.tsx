import { ShieldX } from 'lucide-react'

/** Shown in place of a page the signed-in user isn't allowed to open. */
export function AccessDenied({ message = "You don't have access to this page. Ask your super user to assign you a role that includes it." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-semibold text-foreground">Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

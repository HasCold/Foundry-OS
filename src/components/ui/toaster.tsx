import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from './toast-store'
import { cn } from '@/lib/utils'

const iconMap = {
  default: Info,
  success: CheckCircle2,
  destructive: XCircle,
  warning: AlertTriangle,
}

const colorMap = {
  default: 'border-border bg-card text-foreground',
  success: 'border-success/30 bg-success/10 text-success-foreground [&_svg]:text-success dark:text-foreground',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive-foreground [&_svg]:text-destructive dark:text-foreground',
  warning: 'border-warning/30 bg-warning/10 [&_svg]:text-warning dark:text-foreground',
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const Icon = iconMap[t.variant ?? 'default']
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border p-3.5 shadow-lg animate-in slide-in-from-bottom-3 fade-in-0',
              colorMap[t.variant ?? 'default'],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium leading-tight">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

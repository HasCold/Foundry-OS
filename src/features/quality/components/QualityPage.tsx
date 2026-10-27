import { useState } from 'react'
import { AlertOctagon, CheckCircle2, ClipboardList, FileWarning, ShieldAlert, XCircle } from 'lucide-react'
import type { QualityHold } from '@/types'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/utils'
import { useQuality } from '../hooks/useQuality'
import { LogDefectDialog } from './LogDefectDialog'
import { ResolveHoldDialog } from './ResolveHoldDialog'

const SEVERITY_VARIANT = { minor: 'muted', major: 'warning', critical: 'destructive' } as const

export function QualityPage() {
  const { openHolds, resolvedHolds, logDefect, resolveHold } = useQuality()
  const [defectHold, setDefectHold] = useState<QualityHold | null>(null)
  const [resolveTarget, setResolveTarget] = useState<{ hold: QualityHold; decision: 'approved' | 'rejected' } | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quality Assurance & Procurement Hub"
        description="Review batches on quality hold, log defects, and approve or reject dispositions that flow straight back into inventory availability."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open Quality Holds" value={String(openHolds.length)} icon={ShieldAlert} tone={openHolds.length > 0 ? 'warning' : 'success'} />
        <StatCard
          label="Units on Hold"
          value={String(openHolds.reduce((s, h) => s + h.quantityOnHold, 0))}
          icon={AlertOctagon}
          tone="warning"
        />
        <StatCard label="Resolved This Period" value={String(resolvedHolds.length)} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Total Defects Logged"
          value={String([...openHolds, ...resolvedHolds].reduce((s, h) => s + h.defects.length, 0))}
          icon={FileWarning}
        />
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldAlert className="h-4 w-4 text-warning" /> Open Quality Holds
        </p>
        {openHolds.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">No batches currently on quality hold.</CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {openHolds.map((hold) => (
            <Card key={hold.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {hold.orderNumber} · {hold.productName}
                  </CardTitle>
                  <Badge variant="destructive" className="text-[10px]">
                    {hold.quantityOnHold} units
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{hold.reason}</p>
                <p className="text-[11px] text-muted-foreground">Raised {formatDateTime(hold.raisedAt)}</p>

                {hold.defects.length > 0 && (
                  <div className="space-y-1.5">
                    {hold.defects.map((d) => (
                      <div key={d.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                        <span className="min-w-0 truncate">{d.defectType}</span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-muted-foreground">×{d.quantityAffected}</span>
                          <Badge variant={SEVERITY_VARIANT[d.severity]} className="text-[9px] capitalize">
                            {d.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => setDefectHold(hold)} className="gap-1">
                    <ClipboardList className="h-3.5 w-3.5" /> Log defect
                  </Button>
                  <Button size="sm" variant="success" onClick={() => setResolveTarget({ hold, decision: 'approved' })} className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setResolveTarget({ hold, decision: 'rejected' })} className="gap-1">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {resolvedHolds.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Resolution History</p>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {resolvedHolds.map((hold) => (
                <div key={hold.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {hold.orderNumber} · {hold.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hold.disposition?.replace(/_/g, ' ')} · resolved by {hold.resolvedBy} on {hold.resolvedAt && formatDateTime(hold.resolvedAt)}
                    </p>
                  </div>
                  <Badge variant={hold.status === 'approved' ? 'success' : 'destructive'} className="text-[10px] capitalize">
                    {hold.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <LogDefectDialog
        hold={defectHold}
        onClose={() => setDefectHold(null)}
        onLog={(defectType, quantityAffected, severity, notes) =>
          defectHold && logDefect(defectHold.id, { defectType, quantityAffected, severity, notes, loggedBy: 'QA – Current User' })
        }
      />
      <ResolveHoldDialog
        hold={resolveTarget?.hold ?? null}
        decision={resolveTarget?.decision ?? null}
        onClose={() => setResolveTarget(null)}
        onConfirm={(disposition) => resolveTarget && resolveHold(resolveTarget.hold.id, resolveTarget.decision, disposition, 'QA Lead – Current User')}
      />
    </div>
  )
}

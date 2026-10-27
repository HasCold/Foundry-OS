import { AlertOctagon, CheckCircle2, PlayCircle, ShoppingCart, Sparkles } from 'lucide-react'
import type { MrpRunResult } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber } from '@/lib/utils'
import { useProcurement } from '@/features/procurement/hooks/useProcurement'
import { useCurrency } from '@/features/finance/hooks/useCurrency'

export function MrpPanel({ lastRun, onRun, isRunning }: { lastRun: MrpRunResult | null; onRun: () => void; isRunning: boolean }) {
  const { approveSuggested } = useProcurement()
  const { formatMoney } = useCurrency()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" /> MRP Simulation
          </CardTitle>
          <CardDescription>
            Explodes every open production order's BOM against current stock and flags net shortfalls.
          </CardDescription>
        </div>
        <Button onClick={onRun} disabled={isRunning} className="gap-1.5">
          <PlayCircle className="h-4 w-4" />
          {isRunning ? 'Running simulation…' : 'Run MRP Simulation'}
        </Button>
      </CardHeader>
      <CardContent>
        {!lastRun && <p className="py-6 text-center text-sm text-muted-foreground">Run the simulation to evaluate material availability against open production orders.</p>}

        {lastRun && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Run at {formatDate(lastRun.runAt)}</span>
              <span>{lastRun.ordersEvaluated} open orders evaluated</span>
              <span>{lastRun.itemsEvaluated} materials assessed</span>
            </div>

            {lastRun.shortfalls.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> No shortfalls detected — all demand is covered by current stock and incoming orders.
              </div>
            ) : (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <AlertOctagon className="h-4 w-4" /> Shortfalls ({lastRun.shortfalls.length})
                </p>
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Required</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                        <TableHead className="text-right">Shortfall</TableHead>
                        <TableHead>Driven by</TableHead>
                        <TableHead>Needed by</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lastRun.shortfalls.map((s) => (
                        <TableRow key={s.sku}>
                          <TableCell>
                            <p className="font-medium">{s.itemName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{s.sku}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatNumber(s.requiredQty)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNumber(s.availableQty)}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-destructive">{formatNumber(s.shortfallQty)}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.demandSources.join(', ')}</TableCell>
                          <TableCell className="text-xs">{formatDate(s.neededBy)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {lastRun.suggestedPOs.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <ShoppingCart className="h-4 w-4 text-primary" /> Suggested Purchase Orders ({lastRun.suggestedPOs.length})
                </p>
                <div className="space-y-2">
                  {lastRun.suggestedPOs.map((po) => (
                    <div key={po.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold">{po.poNumber}</span>
                          <Badge variant="muted" className="text-[10px]">
                            Suggested
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm">
                          {formatNumber(po.lines[0].quantity)} × {po.lines[0].itemName} from <span className="font-medium">{po.supplierName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Est. value {formatMoney(po.totalValue)} · needed by {formatDate(po.expectedDate)}</p>
                      </div>
                      <Button size="sm" onClick={() => approveSuggested(po)}>
                        Approve &amp; Convert to PO
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

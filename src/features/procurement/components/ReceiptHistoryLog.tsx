import type { PoReceiptEvent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { useCurrency } from '@/features/finance/hooks/useCurrency'

export function ReceiptHistoryLog({ receiptEvents }: { receiptEvents: PoReceiptEvent[] }) {
  const { formatMoney } = useCurrency()
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Warehouse Intake History</CardTitle>
        <CardDescription>Every receipt logged against a PO, in full or in part, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {receiptEvents.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No receipts logged yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Received by</TableHead>
                <TableHead>Lines</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receiptEvents.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs font-semibold">{r.poNumber}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(r.receivedAt)}</TableCell>
                  <TableCell className="text-xs">{r.receivedBy}</TableCell>
                  <TableCell className="text-xs">{r.lines.map((l) => `${formatNumber(l.quantityReceived)}× ${l.itemName}`).join(', ')}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(r.totalValueReceived)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

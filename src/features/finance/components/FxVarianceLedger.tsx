import type { FxVarianceLine } from '../utils/fxCalculations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { useCurrency } from '../hooks/useCurrency'

/**
 * Line-by-line breakdown backing the Income Statement's "FX Gain / (Loss)"
 * disclosure. Purely a read-only view over `computeFxVariance` — nothing
 * here mutates state, so there is no risk of this screen ever touching the
 * permanent ledger.
 */
export function FxVarianceLedger({ lines, total }: { lines: FxVarianceLine[]; total: number }) {
  const { formatMoney } = useCurrency()

  const csvRows = lines.map((l) => ({
    invoiceNumber: l.invoiceNumber,
    supplier: l.supplierName,
    bookingCurrency: l.bookingCurrency,
    bookingRate: l.bookingRateUsd,
    currentRate: l.currentRateUsd,
    amountUsd: l.amountUsd,
    varianceUsd: l.varianceUsd,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm">FX Variance Ledger — unrealized</CardTitle>
          <CardDescription>
            Foreign-currency payables revalued at today's live rate. Never posted to the general ledger — purely a mark-to-market
            disclosure until each invoice is actually settled.
          </CardDescription>
        </div>
        <ExportCsvButton filename="fx-variance-ledger" rows={csvRows} />
      </CardHeader>
      <CardContent>
        {lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No outstanding foreign-currency payables right now — every unpaid AP invoice is booked in USD.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Booking Ccy</TableHead>
                  <TableHead className="text-right">Booked Rate</TableHead>
                  <TableHead className="text-right">Live Rate</TableHead>
                  <TableHead className="text-right">Booked Value</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.invoiceNumber}>
                    <TableCell className="font-medium">{line.invoiceNumber}</TableCell>
                    <TableCell>{line.supplierName}</TableCell>
                    <TableCell>{line.bookingCurrency}</TableCell>
                    <TableCell className="text-right tabular-nums">{line.bookingRateUsd.toFixed(4)}</TableCell>
                    <TableCell className="text-right tabular-nums">{line.currentRateUsd.toFixed(4)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatMoney(line.amountUsd)}</TableCell>
                    <TableCell
                      className={`text-right font-medium tabular-nums ${line.varianceUsd >= 0 ? 'text-success' : 'text-destructive'}`}
                    >
                      {line.varianceUsd >= 0 ? '+' : ''}
                      {formatMoney(line.varianceUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3 text-sm font-semibold">
              <span>Total unrealized:</span>
              <span className={`tabular-nums ${total >= 0 ? 'text-success' : 'text-destructive'}`}>
                {total >= 0 ? '+' : ''}
                {formatMoney(total)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

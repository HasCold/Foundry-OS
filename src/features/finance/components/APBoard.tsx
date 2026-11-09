import type { ApInvoice } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '../hooks/useCurrency'
import { Can } from '@/features/rbac/components/Can'

interface APBoardProps {
  invoices: ApInvoice[]
  onProcessPayment: (invoiceId: string) => void
}

/** Unpaid supplier invoices. "Process Payment" is the only mutation here — everything else is read-only. */
export function APBoard({ invoices, onProcessPayment }: APBoardProps) {
  const { formatMoney } = useCurrency()
  const unpaidTotal = invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm">Accounts Payable</CardTitle>
          <CardDescription>
            {formatMoney(unpaidTotal)} owed to suppliers across {invoices.filter((i) => i.status === 'unpaid').length} unpaid invoices.
          </CardDescription>
        </div>
        <ExportCsvButton
          filename="accounts-payable"
          rows={invoices.map((i) => ({
            invoiceNumber: i.invoiceNumber,
            supplier: i.supplierName,
            poNumber: i.poNumber ?? '',
            amountUsd: i.amount,
            bookingCurrency: i.bookingCurrency ?? 'USD',
            dueDate: i.dueDate,
            status: i.status,
          }))}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.supplierName}</TableCell>
                <TableCell className="tabular-nums">
                  {formatMoney(invoice.amount)}
                  {invoice.bookingCurrency && invoice.bookingCurrency !== 'USD' && (
                    <span className="ml-1 text-[10px] text-muted-foreground">({invoice.bookingCurrency}-booked)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>{invoice.status === 'paid' ? 'Paid' : 'Unpaid'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Can resource="finance" action="approve">
                    <Button size="sm" variant="outline" disabled={invoice.status === 'paid'} onClick={() => onProcessPayment(invoice.id)}>
                      Process Payment
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

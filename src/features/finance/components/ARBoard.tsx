import { useState } from 'react'
import type { ArInvoice } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { NewSaleDialog } from './NewSaleDialog'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { useCurrency } from '../hooks/useCurrency'
import { Plus } from 'lucide-react'

interface ARBoardProps {
  invoices: ArInvoice[]
  onProcessPayment: (invoiceId: string) => void
  onRecordSale: (customerName: string, saleAmount: number, cogsAmount: number) => void
}

/** Uncollected client payments. "Process Payment" collects an existing invoice; "New Sale" creates one. */
export function ARBoard({ invoices, onProcessPayment, onRecordSale }: ARBoardProps) {
  const { formatMoney } = useCurrency()
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const outstandingTotal = invoices.filter((i) => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm">Accounts Receivable</CardTitle>
          <CardDescription>
            {formatMoney(outstandingTotal)} outstanding across {invoices.filter((i) => i.status === 'unpaid').length} unpaid invoices.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5">
          <ExportCsvButton
            filename="accounts-receivable"
            rows={invoices.map((i) => ({
              invoiceNumber: i.invoiceNumber,
              customer: i.customerName,
              amountUsd: i.amount,
              dueDate: i.dueDate,
              status: i.status,
            }))}
          />
          <Button size="sm" onClick={() => setSaleDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Sale
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
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
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell className="tabular-nums">{formatMoney(invoice.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>{invoice.status === 'paid' ? 'Paid' : 'Unpaid'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled={invoice.status === 'paid'} onClick={() => onProcessPayment(invoice.id)}>
                    Process Payment
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <NewSaleDialog open={saleDialogOpen} onClose={() => setSaleDialogOpen(false)} onConfirm={onRecordSale} />
    </Card>
  )
}

import type { Account, LedgerEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ExportCsvButton } from '@/components/shared/export-csv-button'
import { formatDateTime } from '@/lib/utils'
import { useCurrency } from '../hooks/useCurrency'

const SOURCE_LABEL: Record<LedgerEntry['sourceModule'], string> = {
  procurement: 'Procurement',
  production: 'Production',
  quality: 'Quality',
  ap: 'Accounts Payable',
  ar: 'Accounts Receivable',
  opening_balance: 'Opening Balance',
  fx_revaluation: 'FX Revaluation',
}

function accountName(accounts: Account[], code: string): string {
  return accounts.find((a) => a.code === code)?.name ?? code
}

export function GeneralLedgerLog({ entries, accounts }: { entries: LedgerEntry[]; accounts: Account[] }) {
  const { formatMoney } = useCurrency()

  const csvRows = entries.map((entry) => ({
    date: entry.date,
    memo: entry.memo,
    source: SOURCE_LABEL[entry.sourceModule],
    debitAccounts: entry.lines
      .filter((l) => l.direction === 'debit')
      .map((l) => `${accountName(accounts, l.accountCode)} ${l.amount.toFixed(2)}`)
      .join(' | '),
    creditAccounts: entry.lines
      .filter((l) => l.direction === 'credit')
      .map((l) => `${accountName(accounts, l.accountCode)} ${l.amount.toFixed(2)}`)
      .join(' | '),
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-sm">General Ledger — Live Transaction Log</CardTitle>
          <CardDescription>Every entry below was generated automatically by an action in another module (or seeded as an opening balance).</CardDescription>
        </div>
        <ExportCsvButton filename="general-ledger" rows={csvRows} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Memo</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(entry.date)}</TableCell>
                <TableCell className="max-w-xs text-sm">{entry.memo}</TableCell>
                <TableCell>
                  <Badge variant="outline">{SOURCE_LABEL[entry.sourceModule]}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {entry.lines
                    .filter((l) => l.direction === 'debit')
                    .map((l) => (
                      <div key={l.accountCode}>
                        {accountName(accounts, l.accountCode)} <span className="font-medium tabular-nums">{formatMoney(l.amount)}</span>
                      </div>
                    ))}
                </TableCell>
                <TableCell className="text-xs">
                  {entry.lines
                    .filter((l) => l.direction === 'credit')
                    .map((l) => (
                      <div key={l.accountCode}>
                        {accountName(accounts, l.accountCode)} <span className="font-medium tabular-nums">{formatMoney(l.amount)}</span>
                      </div>
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

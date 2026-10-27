import { useCallback } from 'react'
import { downloadCsv } from './csvExport'
import { toast } from '@/components/ui/toast-store'

/** Shared across Finance and Inventory (and anywhere else that wants a one-click data export). */
export function useCsvExport() {
  return useCallback((filename: string, rows: Record<string, unknown>[]) => {
    if (rows.length === 0) {
      toast({ title: 'Nothing to export', description: 'There are no rows in this table right now.', variant: 'warning' })
      return
    }
    downloadCsv(filename, rows)
    toast({ title: 'Export started', description: `${filename}.csv (${rows.length} row${rows.length === 1 ? '' : 's'}) downloaded.`, variant: 'success' })
  }, [])
}

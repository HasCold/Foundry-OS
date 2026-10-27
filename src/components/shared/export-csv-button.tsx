import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCsvExport } from '@/lib/useCsvExport'

interface ExportCsvButtonProps {
  /** File name without extension — ".csv" is appended automatically. */
  filename: string
  /** The live in-memory rows to export, exactly as currently held in the Zustand store — no server round-trip. */
  rows: Record<string, unknown>[]
  label?: string
}

/** Drop into any DataTable's `toolbar` slot to give that table a one-click CSV download of whatever is on screen right now. */
export function ExportCsvButton({ filename, rows, label = 'Export to CSV' }: ExportCsvButtonProps) {
  const exportCsv = useCsvExport()
  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportCsv(filename, rows)} disabled={rows.length === 0}>
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

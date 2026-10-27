/**
 * Turns an array of flat objects into a CSV string and triggers a client-side
 * download — no backend, no library. This is genuinely reading whatever is
 * in memory at the moment it's called: since nothing here is persisted,
 * exporting is the only way to get a snapshot of the current session's data
 * out of the browser.
 */
export function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''

  const headers = Object.keys(rows[0])
  const escapeCell = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value)
    // RFC 4180: quote any field containing a comma, quote, or newline, and
    // double up embedded quotes.
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))]
  return lines.join('\r\n')
}

/** Builds the CSV and immediately triggers a browser download via a data: URL, no server round-trip. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  const csv = buildCsv(rows)
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

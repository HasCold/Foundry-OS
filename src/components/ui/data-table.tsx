import * as React from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  id: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  searchAccessor?: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  rowClassName?: (row: T) => string
  defaultSort?: { columnId: string; direction: 'asc' | 'desc' }
  toolbar?: React.ReactNode
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchable = false,
  searchPlaceholder = 'Search…',
  searchAccessor,
  onRowClick,
  emptyMessage = 'No records found.',
  rowClassName,
  defaultSort,
  toolbar,
  pageSize,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState('')
  const [sort, setSort] = React.useState<{ columnId: string; direction: 'asc' | 'desc' } | null>(defaultSort ?? null)
  const [page, setPage] = React.useState(0)

  const filtered = React.useMemo(() => {
    if (!query || !searchAccessor) return data
    const q = query.toLowerCase()
    return data.filter((row) => searchAccessor(row).toLowerCase().includes(q))
  }, [data, query, searchAccessor])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col?.sortValue) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = col.sortValue!(a)
      const bv = col.sortValue!(b)
      if (av === bv) return 0
      const result = av > bv ? 1 : -1
      return sort.direction === 'asc' ? result : -result
    })
    return copy
  }, [filtered, sort, columns])

  const paged = React.useMemo(() => {
    if (!pageSize) return sorted
    return sorted.slice(page * pageSize, page * pageSize + pageSize)
  }, [sorted, pageSize, page])

  const totalPages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortValue) return
    setSort((prev) => {
      if (!prev || prev.columnId !== col.id) return { columnId: col.id, direction: 'asc' }
      if (prev.direction === 'asc') return { columnId: col.id, direction: 'desc' }
      return null
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {searchable && (
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                className="pl-8 pr-7"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          {toolbar}
        </div>
      )}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(col.headerClassName, col.sortValue && 'cursor-pointer select-none')}
                  onClick={() => toggleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortValue &&
                      (sort?.columnId === col.id ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      ))}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && 'cursor-pointer', rowClassName?.(row))}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pageSize && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {page * pageSize + 1}–{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

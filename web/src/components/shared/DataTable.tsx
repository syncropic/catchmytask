import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type ParsedData, MAX_PREVIEW_BYTES, isSpreadsheetFile, parseXLSX } from '@/lib/data-parsers'

// ── Formatting helpers ───────────────────────────────────────────────────────

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString()
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  return String(value)
}

function detectColumnType(rows: Record<string, unknown>[], col: string): 'number' | 'string' {
  let numCount = 0
  const sample = rows.slice(0, 20)
  for (const row of sample) {
    const val = row[col]
    if (val === '' || val === null || val === undefined) continue
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) numCount++
  }
  return numCount > sample.length * 0.5 ? 'number' : 'string'
}

// ── DataTable component ──────────────────────────────────────────────────────

export function DataTable({ data, name, copyText }: { data: ParsedData; name: string; copyText?: string }) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [copied, setCopied] = useState(false)

  const colTypes = useMemo(() => {
    const types: Record<string, 'number' | 'string'> = {}
    data.columns.forEach(col => { types[col] = detectColumnType(data.rows, col) })
    return types
  }, [data])

  const sortedRows = useMemo(() => {
    if (!sortCol) return data.rows
    return [...data.rows].sort((a, b) => {
      const va = a[sortCol]
      const vb = b[sortCol]
      if (va === vb) return 0
      if (va === null || va === undefined || va === '') return 1
      if (vb === null || vb === undefined || vb === '') return -1
      if (colTypes[sortCol] === 'number') {
        return sortAsc ? Number(va) - Number(vb) : Number(vb) - Number(va)
      }
      return sortAsc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
  }, [data.rows, sortCol, sortAsc, colTypes])

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc)
    } else {
      setSortCol(col)
      setSortAsc(true)
    }
  }

  const handleCopy = () => {
    if (!copyText) return
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (data.error) {
    return (
      <div className="bg-bg-tertiary rounded border border-border-default p-3 text-xs text-red-400">
        {data.error}
      </div>
    )
  }

  if (data.columns.length === 0) {
    return (
      <div className="bg-bg-tertiary rounded border border-border-default p-3 text-xs text-text-muted">
        No data found
      </div>
    )
  }

  return (
    <div className="rounded border border-border-default overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1 bg-bg-tertiary border-b border-border-default">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide">
            {name.split('.').pop()?.toUpperCase()}
          </span>
          <span className="text-[10px] text-text-muted">
            {data.totalRows.toLocaleString()} rows x {data.columns.length} cols
          </span>
        </div>
        <div className="flex items-center gap-2">
          {copyText && (
            <button
              onClick={handleCopy}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border-default bg-bg-tertiary text-text-muted hover:text-text-secondary hover:bg-bg-secondary transition-all"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          {data.truncated && (
            <span className="text-[10px] text-amber-500">
              Showing {data.rows.length} of {data.totalRows.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-bg-tertiary">
              <th className="text-left text-[10px] font-medium text-text-muted px-2 py-1.5 border-b border-border-default w-8 text-center">
                #
              </th>
              {data.columns.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left text-[10px] font-medium text-text-muted px-2 py-1.5 border-b border-border-default cursor-pointer hover:text-text-secondary whitespace-nowrap select-none"
                >
                  {col}
                  {sortCol === col && (
                    <span className="ml-0.5 text-accent-text">{sortAsc ? '\u25B2' : '\u25BC'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i} className="hover:bg-bg-tertiary/50 border-b border-border-subtle/30 last:border-0">
                <td className="text-[10px] text-text-muted px-2 py-1 text-center tabular-nums">
                  {i + 1}
                </td>
                {data.columns.map(col => (
                  <td
                    key={col}
                    className={`px-2 py-1 text-text-secondary max-w-[200px] truncate ${colTypes[col] === 'number' ? 'text-right tabular-nums font-mono' : ''}`}
                    title={formatCell(row[col])}
                  >
                    {formatCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Too Large banner ─────────────────────────────────────────────────────────

export function TooLargeBanner({ name, size, url }: { name: string; size: number | null; url: string }) {
  const ext = name.split('.').pop()?.toUpperCase() ?? ''
  return (
    <div className="bg-bg-tertiary rounded border border-border-default p-4 text-center text-xs text-text-muted">
      <div className="text-2xl mb-2">&#x1F4CA;</div>
      <div className="font-medium text-text-secondary mb-1">{ext} file too large for preview</div>
      <div className="mb-3">{formatSize(size)} -- download to view in a dedicated application</div>
      <a
        href={url}
        download={name}
        className="inline-block bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded text-xs font-medium transition-colors"
      >
        Download {name}
      </a>
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

export function DataTableLoading() {
  return (
    <div className="rounded border border-border-default overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-tertiary border-b border-border-default">
        <div className="h-3 w-12 bg-bg-secondary rounded animate-pulse" />
        <div className="h-3 w-20 bg-bg-secondary rounded animate-pulse" />
      </div>
      <div className="p-2 space-y-1.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 bg-bg-tertiary/50 rounded animate-pulse" style={{ width: `${90 - i * 5}%` }} />
        ))}
      </div>
    </div>
  )
}

// ── Spreadsheet viewer (uses hook internally) ────────────────────────────────

export function SpreadsheetViewer({ url, name, size }: { url: string; name: string; size: number | null }) {
  const tooLarge = !!(size && size > MAX_PREVIEW_BYTES)

  const { data, isLoading } = useQuery({
    queryKey: ['spreadsheet', url],
    queryFn: async () => {
      const r = await fetch(url)
      if (!r.ok) throw new Error('Failed to fetch')
      const buf = await r.arrayBuffer()
      return parseXLSX(buf)
    },
    enabled: isSpreadsheetFile(name) && !tooLarge,
  })

  if (tooLarge) return <TooLargeBanner name={name} size={size} url={url} />
  if (isLoading) return <DataTableLoading />
  if (!data) return null
  return <DataTable data={data} name={name} />
}

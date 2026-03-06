import { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedData {
  columns: string[]
  rows: Record<string, unknown>[]
  totalRows: number
  truncated: boolean
  error?: string
}

interface DataTableProps {
  data: ParsedData
  name: string
  copyText?: string
}

// ── Size limits ──────────────────────────────────────────────────────────────

const MAX_PREVIEW_BYTES = 5 * 1024 * 1024 // 5MB
const MAX_PREVIEW_ROWS = 200

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseCSV(text: string): ParsedData {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  // Split by newlines, respecting quoted fields
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.length > 0 || lines.length > 0) lines.push(current)
      current = ''
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else {
      current += ch
    }
  }
  if (current.length > 0) lines.push(current)

  if (lines.length === 0) return { columns: [], rows: [], totalRows: 0, truncated: false }

  // Detect delimiter (comma, tab, semicolon, pipe)
  const firstLine = lines[0]
  const delimiters = [',', '\t', ';', '|']
  const counts = delimiters.map(d => {
    let count = 0
    let inQ = false
    for (const ch of firstLine) {
      if (ch === '"') inQ = !inQ
      else if (ch === d && !inQ) count++
    }
    return count
  })
  const delimiter = delimiters[counts.indexOf(Math.max(...counts))] || ','

  function splitRow(line: string): string[] {
    const fields: string[] = []
    let field = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQ = !inQ
        }
      } else if (ch === delimiter && !inQ) {
        fields.push(field.trim())
        field = ''
      } else {
        field += ch
      }
    }
    fields.push(field.trim())
    return fields
  }

  const columns = splitRow(lines[0])
  const totalRows = lines.length - 1
  const rowLimit = Math.min(totalRows, MAX_PREVIEW_ROWS)
  const rows: Record<string, unknown>[] = []

  for (let i = 1; i <= rowLimit; i++) {
    const fields = splitRow(lines[i])
    const row: Record<string, unknown> = {}
    columns.forEach((col, idx) => {
      row[col] = fields[idx] ?? ''
    })
    rows.push(row)
  }

  return { columns, rows, totalRows, truncated: totalRows > MAX_PREVIEW_ROWS }
}

function parseJSON(text: string): ParsedData {
  try {
    const parsed = JSON.parse(text)

    // Array of objects → table
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      const allKeys = new Set<string>()
      parsed.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(k => allKeys.add(k))
        }
      })
      const columns = Array.from(allKeys)
      const totalRows = parsed.length
      const rows = parsed.slice(0, MAX_PREVIEW_ROWS).map(item => {
        const row: Record<string, unknown> = {}
        columns.forEach(col => {
          const val = item[col]
          row[col] = typeof val === 'object' ? JSON.stringify(val) : val
        })
        return row
      })
      return { columns, rows, totalRows, truncated: totalRows > MAX_PREVIEW_ROWS }
    }

    // Single object → key/value table
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const columns = ['Key', 'Value']
      const rows = Object.entries(parsed).map(([k, v]) => ({
        Key: k,
        Value: typeof v === 'object' ? JSON.stringify(v) : v,
      }))
      return { columns, rows, totalRows: rows.length, truncated: false }
    }

    // Not tabular
    return { columns: [], rows: [], totalRows: 0, truncated: false, error: 'JSON is not tabular (not an array of objects)' }
  } catch {
    return { columns: [], rows: [], totalRows: 0, truncated: false, error: 'Invalid JSON' }
  }
}

function parseJSONL(text: string): ParsedData {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return { columns: [], rows: [], totalRows: 0, truncated: false }

  const allKeys = new Set<string>()
  const parsed: Record<string, unknown>[] = []
  const limit = Math.min(lines.length, MAX_PREVIEW_ROWS)

  for (let i = 0; i < limit; i++) {
    try {
      const obj = JSON.parse(lines[i])
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(k => allKeys.add(k))
        parsed.push(obj)
      }
    } catch {
      // skip malformed lines
    }
  }

  const columns = Array.from(allKeys)
  const rows = parsed.map(item => {
    const row: Record<string, unknown> = {}
    columns.forEach(col => {
      const val = item[col]
      row[col] = typeof val === 'object' ? JSON.stringify(val) : val
    })
    return row
  })

  return { columns, rows, totalRows: lines.length, truncated: lines.length > MAX_PREVIEW_ROWS }
}

function parseXLSX(buffer: ArrayBuffer): ParsedData {
  try {
    const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheetName = wb.SheetNames[0]
    if (!sheetName) return { columns: [], rows: [], totalRows: 0, truncated: false, error: 'No sheets found' }

    const sheet = wb.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false })
    const totalRows = json.length

    const allKeys = new Set<string>()
    json.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)))
    const columns = Array.from(allKeys)

    const rows = json.slice(0, MAX_PREVIEW_ROWS).map(item => {
      const row: Record<string, unknown> = {}
      columns.forEach(col => {
        const val = item[col]
        if (val instanceof Date) {
          row[col] = val.toISOString().replace('T', ' ').replace(/\.000Z$/, '')
        } else if (typeof val === 'object' && val !== null) {
          row[col] = JSON.stringify(val)
        } else {
          row[col] = val
        }
      })
      return row
    })

    return { columns, rows, totalRows, truncated: totalRows > MAX_PREVIEW_ROWS }
  } catch {
    return { columns: [], rows: [], totalRows: 0, truncated: false, error: 'Failed to parse spreadsheet' }
  }
}

// ── Detect if text content is tabular ────────────────────────────────────────

export function isTabularTextFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ['csv', 'tsv', 'jsonl', 'ndjson'].includes(ext)
}

export function isTabularJSON(name: string, content: string): boolean {
  if (!/\.json$/i.test(name)) return false
  try {
    const parsed = JSON.parse(content)
    return (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') ||
           (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed))
  } catch {
    return false
  }
}

export function isSpreadsheetFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return ['xlsx', 'xls', 'xlsb', 'ods'].includes(ext)
}

// ── Hook: parse text-based structured data ───────────────────────────────────

export function parseTextData(name: string, content: string): ParsedData | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'csv' || ext === 'tsv') return parseCSV(content)
  if (ext === 'jsonl' || ext === 'ndjson') return parseJSONL(content)
  if (ext === 'json') {
    const result = parseJSON(content)
    if (!result.error && result.columns.length > 0) return result
  }
  return null
}

// ── Hook: fetch and parse binary spreadsheet ─────────────────────────────────

export function useSpreadsheetData(url: string, name: string, size: number | null) {
  const [data, setData] = useState<ParsedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tooLarge, setTooLarge] = useState(false)

  useEffect(() => {
    if (!isSpreadsheetFile(name)) return
    if (size && size > MAX_PREVIEW_BYTES) {
      setTooLarge(true)
      return
    }

    setLoading(true)
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.arrayBuffer()
      })
      .then(buf => {
        setData(parseXLSX(buf))
      })
      .catch(() => {
        setData({ columns: [], rows: [], totalRows: 0, truncated: false, error: 'Failed to load file' })
      })
      .finally(() => setLoading(false))
  }, [url, name, size])

  return { data, loading, tooLarge }
}

// ── Formatting helpers ───────────────────────────────────────────────────────

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    // Format numbers nicely
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

export function DataTable({ data, name, copyText }: DataTableProps) {
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
      {/* Header bar */}
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

      {/* Table */}
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
                    <span className="ml-0.5 text-accent-text">{sortAsc ? '▲' : '▼'}</span>
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
      <div className="mb-3">{formatSize(size)} — download to view in a dedicated application</div>
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

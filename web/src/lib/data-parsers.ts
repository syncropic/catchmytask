import * as XLSX from 'xlsx'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ParsedData {
  columns: string[]
  rows: Record<string, unknown>[]
  totalRows: number
  truncated: boolean
  error?: string
}

// ── Size limits ──────────────────────────────────────────────────────────────

export const MAX_PREVIEW_BYTES = 5 * 1024 * 1024 // 5MB
export const MAX_PREVIEW_ROWS = 200

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseCSV(text: string): ParsedData {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

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

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const columns = ['Key', 'Value']
      const rows = Object.entries(parsed).map(([k, v]) => ({
        Key: k,
        Value: typeof v === 'object' ? JSON.stringify(v) : v,
      }))
      return { columns, rows, totalRows: rows.length, truncated: false }
    }

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

export function parseXLSX(buffer: ArrayBuffer): ParsedData {
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

// ── Detection helpers ────────────────────────────────────────────────────────

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

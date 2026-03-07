/**
 * Thin command parser for the Command Bar.
 * Strips optional `cmt` prefix, extracts verb + positional args + flags.
 * No shell quoting rules — just simple space-splitting with quoted strings.
 */

export interface ParsedCommand {
  verb: string
  args: string[]
  flags: Record<string, string | true>
  raw: string
}

export function parseCommand(input: string): ParsedCommand | null {
  const raw = input.trim()
  if (!raw) return null

  // Strip optional "cmt " prefix
  const cleaned = raw.replace(/^cmt\s+/, '')

  const tokens = tokenize(cleaned)
  if (tokens.length === 0) return null

  const verb = tokens[0].toLowerCase()
  const args: string[] = []
  const flags: Record<string, string | true> = {}

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.startsWith('--')) {
      const eqIdx = token.indexOf('=')
      if (eqIdx !== -1) {
        // --flag=value
        flags[token.slice(2, eqIdx)] = token.slice(eqIdx + 1)
      } else if (i + 1 < tokens.length && !tokens[i + 1].startsWith('--')) {
        // --flag value (peek next token)
        flags[token.slice(2)] = tokens[i + 1]
        i++
      } else {
        // --flag (boolean)
        flags[token.slice(2)] = true
      }
    } else if (token.startsWith('-') && token.length === 2) {
      // Short flags: -j, -q, etc.
      const shortMap: Record<string, string> = {
        j: 'json', q: 'quiet', e: 'edit', f: 'force',
      }
      const longName = shortMap[token[1]] ?? token[1]
      flags[longName] = true
    } else {
      args.push(token)
    }
  }

  return { verb, args, flags, raw }
}

/** Tokenize respecting quoted strings */
function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuote: string | null = null

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch
    } else if (ch === ' ' || ch === '\t') {
      if (current) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }

  if (current) tokens.push(current)
  return tokens
}

/** Known commands for autocomplete */
export const COMMANDS = [
  'add', 'list', 'show', 'open', 'done', 'status', 'edit',
  'delete', 'search', 'config', 'help', 'clear', 'history',
] as const

export type CommandVerb = (typeof COMMANDS)[number]

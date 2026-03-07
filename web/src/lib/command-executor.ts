import { type ParsedCommand } from './command-parser'
import { getHelp, type HelpEntry } from './command-help'
import { api } from './api'
import type { WorkItem, CreateItemRequest, EditItemRequest } from '@/types'

// ── Output types ─────────────────────────────────────────────────────────────

export type CommandOutput =
  | { type: 'items'; items: WorkItem[]; meta?: { total: number; query?: string } }
  | { type: 'item-created'; item: WorkItem }
  | { type: 'status-changed'; changes: { id: string; from: string; to: string }[] }
  | { type: 'item-deleted'; ids: string[] }
  | { type: 'search-results'; results: WorkItem[]; query: string }
  | { type: 'error'; message: string; suggestions?: string[] }
  | { type: 'help-all'; commands: Record<string, HelpEntry> }
  | { type: 'help-command'; command: string; help: HelpEntry }
  | { type: 'config'; config: unknown }
  | { type: 'text'; content: string }
  | { type: 'navigate'; id: string }
  | { type: 'clear' }
  | { type: 'history'; commands: string[] }
  | { type: 'recall'; command: string }

export interface CommandContext {
  selectedItem: string | null
  onNavigate: (id: string) => void
  getHistory: () => string[]
  prefix: string
}

// ── Executor ─────────────────────────────────────────────────────────────────

export async function executeCommand(
  cmd: ParsedCommand,
  ctx: CommandContext,
): Promise<CommandOutput> {
  try {
    switch (cmd.verb) {
      case 'add': return await execAdd(cmd)
      case 'list': case 'ls': return await execList(cmd)
      case 'show': case 'open': return execShow(cmd, ctx)
      case 'done': return await execDone(cmd, ctx)
      case 'status': return await execStatus(cmd, ctx)
      case 'edit': return await execEdit(cmd, ctx)
      case 'delete': case 'rm': return await execDelete(cmd, ctx)
      case 'search': return await execSearch(cmd)
      case 'config': return await execConfig()
      case 'help': return execHelp(cmd)
      case 'clear': return { type: 'clear' }
      case 'history': {
        const n = cmd.args[0]
        if (n && /^\d+$/.test(n)) {
          const history = ctx.getHistory()
          const idx = parseInt(n, 10) - 1
          if (idx >= 0 && idx < history.length) {
            return { type: 'recall', command: history[idx] }
          }
          return { type: 'error', message: `!${n}: event not found. History has ${history.length} entries.` }
        }
        return { type: 'history', commands: ctx.getHistory() }
      }
      default:
        return {
          type: 'error',
          message: `Unknown command: ${cmd.verb}`,
          suggestions: ['Type "help" to see available commands'],
        }
    }
  } catch (e) {
    return {
      type: 'error',
      message: e instanceof Error ? e.message : 'Command failed',
    }
  }
}

// ── Command implementations ──────────────────────────────────────────────────

async function execAdd(cmd: ParsedCommand): Promise<CommandOutput> {
  const title = cmd.args[0]
  if (!title) {
    return { type: 'error', message: 'Title required. Usage: add "My task title"' }
  }

  const tags = cmd.flags.tag
    ? String(cmd.flags.tag).split(',').map(t => t.trim())
    : []
  const depsRaw = cmd.flags['depends-on'] || cmd.flags.depends
  const depends_on = depsRaw
    ? String(depsRaw).split(',').map(d => d.trim())
    : []

  const req: CreateItemRequest = { title, tags, depends_on }
  if (cmd.flags.priority) req.priority = String(cmd.flags.priority)
  if (cmd.flags.assignee) req.assignee = String(cmd.flags.assignee)
  if (cmd.flags.type) req.type = String(cmd.flags.type)
  if (cmd.flags.status) req.status = String(cmd.flags.status)
  if (cmd.flags.parent) req.parent = String(cmd.flags.parent)
  if (cmd.flags.due) req.due = String(cmd.flags.due)
  if (cmd.flags.body) req.body = String(cmd.flags.body)

  const item = await api.items.create(req)
  return { type: 'item-created', item }
}

async function execList(cmd: ParsedCommand): Promise<CommandOutput> {
  const items = await api.items.list()

  let filtered = [...items]

  // Apply flags as filters
  if (cmd.flags.status) {
    const statuses = String(cmd.flags.status).split(',')
    filtered = filtered.filter(i => statuses.includes(i.status))
  }
  if (cmd.flags.priority) {
    filtered = filtered.filter(i => i.priority === String(cmd.flags.priority))
  }
  if (cmd.flags.assignee) {
    const a = String(cmd.flags.assignee)
    filtered = filtered.filter(i => {
      if (!i.assignee) return false
      if (typeof i.assignee === 'string') return i.assignee === a
      return i.assignee === a
    })
  }
  if (cmd.flags.tag) {
    const tag = String(cmd.flags.tag)
    filtered = filtered.filter(i => i.tags?.includes(tag))
  }
  if (cmd.flags.type) {
    filtered = filtered.filter(i => i.type === String(cmd.flags.type))
  }

  return { type: 'items', items: filtered, meta: { total: filtered.length } }
}

function execShow(cmd: ParsedCommand, ctx: CommandContext): CommandOutput {
  const id = resolveId(cmd.args[0], ctx)
  if (!id) {
    return { type: 'error', message: 'Item ID required. Usage: show CMT-3' }
  }
  ctx.onNavigate(id)
  return { type: 'navigate', id }
}

async function execDone(cmd: ParsedCommand, ctx: CommandContext): Promise<CommandOutput> {
  const ids = cmd.args.length > 0
    ? cmd.args.map(a => normalizeId(a, ctx.prefix))
    : ctx.selectedItem
      ? [ctx.selectedItem]
      : []

  if (ids.length === 0) {
    return { type: 'error', message: 'No item selected. Usage: done CMT-3 [CMT-4 ...]' }
  }

  const changes: { id: string; from: string; to: string }[] = []

  for (const id of ids) {
    try {
      const item = await api.items.get(id).catch(() => null)
      const from = item?.status ?? 'unknown'

      await api.items.changeStatus(id, { status: 'done', force: true })
      changes.push({ id, from, to: 'done' })
    } catch (e) {
      return {
        type: 'error',
        message: `Failed to mark ${id} as done: ${e instanceof Error ? e.message : 'unknown error'}`,
      }
    }
  }

  return { type: 'status-changed', changes }
}

async function execStatus(cmd: ParsedCommand, ctx: CommandContext): Promise<CommandOutput> {
  const id = resolveId(cmd.args[0], ctx)
  const newStatus = cmd.args.length >= 2 ? cmd.args[1] : cmd.args[0] && ctx.selectedItem ? cmd.args[0] : null

  if (!id || !newStatus) {
    return { type: 'error', message: 'Usage: status <id> <new-status>' }
  }

  const item = await api.items.get(id).catch(() => null)
  const from = item?.status ?? 'unknown'

  await api.items.changeStatus(id, {
    status: newStatus,
    force: cmd.flags.force === true,
    reason: cmd.flags.reason ? String(cmd.flags.reason) : undefined,
  })

  return { type: 'status-changed', changes: [{ id, from, to: newStatus }] }
}

async function execEdit(cmd: ParsedCommand, ctx: CommandContext): Promise<CommandOutput> {
  const id = resolveId(cmd.args[0], ctx)
  if (!id) {
    return { type: 'error', message: 'Item ID required. Usage: edit CMT-3 --priority=high' }
  }

  const req: EditItemRequest = {}
  if (cmd.flags.title) req.title = String(cmd.flags.title)
  if (cmd.flags.priority) req.priority = String(cmd.flags.priority)
  if (cmd.flags.assignee) req.assignee = String(cmd.flags.assignee)
  if (cmd.flags.due) req.due = String(cmd.flags.due)
  if (cmd.flags.type) req.type = String(cmd.flags.type)
  if (cmd.flags.body) req.body = String(cmd.flags.body)
  if (cmd.flags.parent) req.parent = String(cmd.flags.parent)

  // Handle tag additions/removals
  if (cmd.flags.tag) {
    const tagVal = String(cmd.flags.tag)
    if (tagVal.startsWith('+')) {
      req.add_tags = [tagVal.slice(1)]
    } else if (tagVal.startsWith('-')) {
      req.remove_tags = [tagVal.slice(1)]
    } else {
      req.add_tags = tagVal.split(',').map(t => t.trim())
    }
  }

  const hasFields = req.title || req.priority || req.assignee || req.due || req.type || req.body || req.parent || req.add_tags?.length || req.remove_tags?.length
  if (!hasFields) {
    return { type: 'error', message: 'No fields to edit. Use flags like --priority=high --tag=+urgent' }
  }

  const updated = await api.items.update(id, req)
  return { type: 'item-created', item: updated } // reuse item-created renderer
}

async function execDelete(cmd: ParsedCommand, ctx: CommandContext): Promise<CommandOutput> {
  if (cmd.args.length === 0) {
    return { type: 'error', message: 'Item ID(s) required. Usage: delete CMT-3' }
  }

  if (cmd.flags.force !== true) {
    return {
      type: 'error',
      message: `Delete ${cmd.args.join(', ')}? Re-run with --force to confirm.`,
    }
  }

  const deleted: string[] = []
  for (const raw of cmd.args) {
    const id = normalizeId(raw, ctx.prefix)
    await api.items.delete(id)
    deleted.push(id)
  }

  return { type: 'item-deleted', ids: deleted }
}

async function execSearch(cmd: ParsedCommand): Promise<CommandOutput> {
  const query = cmd.args.join(' ')
  if (!query) {
    return { type: 'error', message: 'Search query required. Usage: search "auth token"' }
  }

  const results = await api.search(query)
  return { type: 'search-results', results, query }
}

async function execConfig(): Promise<CommandOutput> {
  const config = await api.config()
  return { type: 'config', config }
}

function execHelp(cmd: ParsedCommand): CommandOutput {
  const command = cmd.args[0]
  if (command) {
    const help = getHelp(command) as HelpEntry | null
    if (!help) {
      return { type: 'error', message: `Unknown command: ${command}`, suggestions: ['Type "help" to see all commands'] }
    }
    return { type: 'help-command', command, help }
  }
  return { type: 'help-all', commands: getHelp() as Record<string, HelpEntry> }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeId(input: string, prefix: string): string {
  if (/^\d+$/.test(input)) {
    return `${prefix}-${input}`
  }
  return input.toUpperCase()
}

function resolveId(arg: string | undefined, ctx: CommandContext): string | null {
  if (arg) return normalizeId(arg, ctx.prefix)
  return ctx.selectedItem
}

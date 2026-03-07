import type { CommandOutput } from '@/lib/command-executor'
import type { HelpEntry } from '@/lib/command-help'
import { useUIStore } from '@/stores/ui'
import type { WorkItem } from '@/types'

export function CommandOutputView({ output }: { output: CommandOutput }) {
  switch (output.type) {
    case 'items': return <ItemsOutput items={output.items} total={output.meta?.total} />
    case 'item-created': return <ItemCreatedOutput item={output.item} />
    case 'status-changed': return <StatusChangedOutput changes={output.changes} />
    case 'item-deleted': return <ItemDeletedOutput ids={output.ids} />
    case 'search-results': return <SearchOutput results={output.results} query={output.query} />
    case 'error': return <ErrorOutput message={output.message} suggestions={output.suggestions} />
    case 'help-all': return <HelpAllOutput commands={output.commands} />
    case 'help-command': return <HelpCommandOutput command={output.command} help={output.help} />
    case 'config': return <ConfigOutput config={output.config} />
    case 'text': return <TextOutput content={output.content} />
    case 'navigate': return <NavigateOutput id={output.id} />
    case 'history': return <HistoryOutput commands={output.commands} />
    default: return null
  }
}

// ── Item list ────────────────────────────────────────────────────────────────

function ItemsOutput({ items, total }: { items: WorkItem[]; total?: number }) {
  const selectItem = useUIStore((s) => s.openDetailPanel)

  if (items.length === 0) {
    return <div className="text-[11px] text-text-muted font-mono">No items found.</div>
  }

  return (
    <div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onClick={() => selectItem(item.id)} />
        ))}
      </div>
      <div className="text-[10px] text-text-muted font-mono mt-1">
        {total ?? items.length} item{(total ?? items.length) !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function ItemRow({ item, onClick }: { item: WorkItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-0.5 text-[11px] font-mono rounded hover:bg-bg-tertiary transition-colors text-left group"
    >
      <span className="text-accent-text w-16 flex-shrink-0">{item.id}</span>
      <span className="text-text-secondary truncate flex-1">{item.title}</span>
      <StatusBadge status={item.status} />
      {item.priority && item.priority !== 'none' && (
        <span className="text-text-muted text-[10px]">{item.priority}</span>
      )}
      {item.assignee && (
        <span className="text-text-muted text-[10px]">{typeof item.assignee === 'string' ? item.assignee : ''}</span>
      )}
      <span className="text-text-muted opacity-0 group-hover:opacity-100">{'>'}</span>
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    inbox: 'text-blue-400',
    ready: 'text-orange-400',
    active: 'text-green-400',
    blocked: 'text-red-400',
    done: 'text-text-muted',
    cancelled: 'text-text-muted',
  }
  return (
    <span className={`text-[10px] w-14 flex-shrink-0 ${colors[status] ?? 'text-text-muted'}`}>
      {status}
    </span>
  )
}

// ── Item created ─────────────────────────────────────────────────────────────

function ItemCreatedOutput({ item }: { item: WorkItem }) {
  const selectItem = useUIStore((s) => s.openDetailPanel)

  return (
    <button
      onClick={() => selectItem(item.id)}
      className="flex items-center gap-2 text-[11px] font-mono text-left hover:bg-bg-tertiary rounded px-2 py-1 w-full transition-colors"
    >
      <span className="text-green-400">{'+'}</span>
      <span className="text-accent-text">{item.id}</span>
      <span className="text-text-secondary">{item.title}</span>
      <StatusBadge status={item.status} />
      {item.priority && item.priority !== 'none' && (
        <span className="text-text-muted text-[10px]">{item.priority}</span>
      )}
    </button>
  )
}

// ── Status changed ───────────────────────────────────────────────────────────

function StatusChangedOutput({ changes }: { changes: { id: string; from: string; to: string }[] }) {
  return (
    <div className="space-y-0.5">
      {changes.map((c) => (
        <div key={c.id} className="flex items-center gap-2 text-[11px] font-mono px-2">
          <span className="text-green-400">{'~'}</span>
          <span className="text-accent-text">{c.id}</span>
          <span className="text-text-muted">{c.from}</span>
          <span className="text-text-muted">{'>'}</span>
          <StatusBadge status={c.to} />
        </div>
      ))}
    </div>
  )
}

// ── Item deleted ─────────────────────────────────────────────────────────────

function ItemDeletedOutput({ ids }: { ids: string[] }) {
  return (
    <div className="space-y-0.5">
      {ids.map((id) => (
        <div key={id} className="flex items-center gap-2 text-[11px] font-mono px-2">
          <span className="text-red-400">{'-'}</span>
          <span className="text-text-muted line-through">{id}</span>
          <span className="text-text-muted">deleted</span>
        </div>
      ))}
    </div>
  )
}

// ── Search results ───────────────────────────────────────────────────────────

function SearchOutput({ results, query }: { results: WorkItem[]; query: string }) {
  const selectItem = useUIStore((s) => s.openDetailPanel)

  if (results.length === 0) {
    return <div className="text-[11px] text-text-muted font-mono px-2">No results for &quot;{query}&quot;</div>
  }

  return (
    <div>
      <div className="space-y-0.5">
        {results.map((item) => (
          <ItemRow key={item.id} item={item} onClick={() => selectItem(item.id)} />
        ))}
      </div>
      <div className="text-[10px] text-text-muted font-mono mt-1 px-2">
        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </div>
    </div>
  )
}

// ── Error ────────────────────────────────────────────────────────────────────

function ErrorOutput({ message, suggestions }: { message: string; suggestions?: string[] }) {
  return (
    <div className="px-2">
      <div className="text-[11px] font-mono text-red-400">{message}</div>
      {suggestions?.map((s, i) => (
        <div key={i} className="text-[10px] font-mono text-text-muted mt-0.5">{s}</div>
      ))}
    </div>
  )
}

// ── Help ─────────────────────────────────────────────────────────────────────

function HelpAllOutput({ commands }: { commands: Record<string, HelpEntry> }) {
  return (
    <div className="px-2 space-y-0.5">
      <div className="text-[11px] font-mono text-text-primary mb-1">Available commands:</div>
      {Object.entries(commands).map(([name, help]) => (
        <div key={name} className="flex items-start gap-3 text-[11px] font-mono">
          <span className="text-accent-text w-16 flex-shrink-0">{name}</span>
          <span className="text-text-muted">{help.description}</span>
        </div>
      ))}
      <div className="text-[10px] text-text-muted mt-2">Type &quot;help &lt;command&gt;&quot; for details</div>
    </div>
  )
}

function HelpCommandOutput({ command, help }: { command: string; help: HelpEntry }) {
  return (
    <div className="px-2 space-y-1.5">
      <div className="text-[11px] font-mono">
        <span className="text-accent-text">{command}</span>
        <span className="text-text-muted ml-2">{help.description}</span>
      </div>
      <div className="text-[11px] font-mono text-text-secondary">
        Usage: {help.usage}
      </div>
      {help.flags && help.flags.length > 0 && (
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono text-text-muted">Flags:</div>
          {help.flags.map((f) => (
            <div key={f.flag} className="flex items-start gap-3 text-[10px] font-mono pl-2">
              <span className="text-text-secondary w-24 flex-shrink-0">{f.flag}</span>
              <span className="text-text-muted">{f.description}</span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-0.5">
        <div className="text-[10px] font-mono text-text-muted">Examples:</div>
        {help.examples.map((ex, i) => (
          <div key={i} className="text-[10px] font-mono text-text-secondary pl-2">{ex}</div>
        ))}
      </div>
    </div>
  )
}

// ── Config ───────────────────────────────────────────────────────────────────

function ConfigOutput({ config }: { config: unknown }) {
  return (
    <pre className="text-[10px] font-mono text-text-secondary px-2 overflow-auto max-h-[200px]">
      {JSON.stringify(config, null, 2)}
    </pre>
  )
}

// ── Text / Navigate / History ────────────────────────────────────────────────

function TextOutput({ content }: { content: string }) {
  return <div className="text-[11px] font-mono text-text-secondary px-2 whitespace-pre-wrap">{content}</div>
}

function NavigateOutput({ id }: { id: string }) {
  return (
    <div className="text-[11px] font-mono text-text-muted px-2">
      Opened {id}
    </div>
  )
}

function HistoryOutput({ commands }: { commands: string[] }) {
  if (commands.length === 0) {
    return <div className="text-[11px] font-mono text-text-muted px-2">No command history</div>
  }
  return (
    <div className="px-2 space-y-0.5">
      {commands.slice(0, 20).map((cmd, i) => (
        <div key={i} className="text-[10px] font-mono text-text-muted">
          <span className="text-text-muted/50 w-4 inline-block text-right mr-2">{i + 1}</span>
          {cmd}
        </div>
      ))}
    </div>
  )
}

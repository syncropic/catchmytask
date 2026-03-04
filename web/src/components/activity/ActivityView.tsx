import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig, WorkItem } from '@/types'

interface Props {
  config: ProjectConfig | null
}

type ActivityFilter = 'all' | 'created' | 'started' | 'completed' | 'blocked'

interface ActivityEvent {
  item: WorkItem
  type: 'created' | 'started' | 'completed' | 'blocked' | 'updated'
  timestamp: string
}

export function ActivityView({ config }: Props) {
  const currentProject = useProjectStore((s) => s.currentProject)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)
  const [filter, setFilter] = useState<ActivityFilter>('all')

  const { data: items, isLoading } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  if (isLoading || !config) {
    return <div className="flex items-center justify-center h-full text-text-muted text-xs">Loading...</div>
  }

  const allItems = items ?? []

  // Build activity timeline from item timestamps
  const events: ActivityEvent[] = []
  for (const item of allItems) {
    events.push({ item, type: 'created', timestamp: item.created_at })
    if (item.started_at) events.push({ item, type: 'started', timestamp: item.started_at })
    if (item.completed_at) events.push({ item, type: 'completed', timestamp: item.completed_at })
    if (item.blocked_reason) events.push({ item, type: 'blocked', timestamp: item.updated_at ?? item.created_at })
  }

  // Sort by timestamp descending
  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Apply filter
  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)

  // Group by day
  const grouped = groupByDay(filtered)

  const filters: { key: ActivityFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'created', label: 'Created' },
    { key: 'started', label: 'Started' },
    { key: 'completed', label: 'Completed' },
    { key: 'blocked', label: 'Blocked' },
  ]

  return (
    <div className="h-full overflow-y-auto">
      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-border-default px-6 py-3 flex items-center gap-1">
        {filters.map((f) => {
          const count = f.key === 'all' ? events.length : events.filter((e) => e.type === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filter === f.key
                  ? 'bg-bg-active text-text-primary font-medium'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-text-muted">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 py-4">
        {filtered.length === 0 && (
          <div className="text-center text-text-muted text-xs py-12">No activity to show</div>
        )}

        {grouped.map(([day, dayEvents]) => (
          <div key={day} className="mb-6">
            <div className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-2 sticky top-12 bg-bg-primary py-1 z-[5]">
              {day}
            </div>

            <div className="space-y-px">
              {dayEvents.map((event, i) => (
                <ActivityRow
                  key={`${event.item.id}-${event.type}-${i}`}
                  event={event}
                  onClick={() => openDetailPanel(event.item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const EVENT_META: Record<string, { icon: string; color: string; label: string }> = {
  created: { icon: '+', color: 'text-accent-text bg-accent/10', label: 'created' },
  started: { icon: '▶', color: 'text-code bg-code/10', label: 'started' },
  completed: { icon: '✓', color: 'text-code bg-code/10', label: 'completed' },
  blocked: { icon: '!', color: 'text-red-400 bg-red-400/10', label: 'blocked' },
  updated: { icon: '~', color: 'text-text-muted bg-bg-tertiary', label: 'updated' },
}

function ActivityRow({ event, onClick }: { event: ActivityEvent; onClick: () => void }) {
  const meta = EVENT_META[event.type] ?? EVENT_META.updated

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-xs px-3 py-2.5 rounded-md hover:bg-bg-hover transition-colors text-left group"
    >
      {/* Event type badge */}
      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${meta.color}`}>
        {meta.icon}
      </span>

      {/* Item info */}
      <span className="font-mono text-text-muted flex-shrink-0">{event.item.id}</span>
      <span className="text-text-secondary truncate flex-1 min-w-0">{event.item.title}</span>

      {/* Event label + time */}
      <span className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${meta.color}`}>{meta.label}</span>
        <span className="text-text-muted w-14 text-right">{formatTime(event.timestamp)}</span>
      </span>
    </button>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDay(events: ActivityEvent[]): [string, ActivityEvent[]][] {
  const groups = new Map<string, ActivityEvent[]>()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const event of events) {
    const date = new Date(event.timestamp)
    let label: string
    if (isSameDay(date, today)) {
      label = 'Today'
    } else if (isSameDay(date, yesterday)) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(event)
  }

  return Array.from(groups.entries())
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays > 7) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const hours = d.getHours()
    const mins = d.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`
  } catch {
    return ''
  }
}

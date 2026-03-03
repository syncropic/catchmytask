import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig, WorkItem } from '@/types'

interface Props {
  config: ProjectConfig | null
}

const STATUS_COLORS: Record<string, string> = {
  inbox: 'bg-status-inbox',
  ready: 'bg-status-ready',
  active: 'bg-status-active',
  blocked: 'bg-status-blocked',
  done: 'bg-status-done',
  cancelled: 'bg-status-cancelled',
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-priority-critical',
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
  none: 'bg-text-muted',
}

export function DashboardView({ config }: Props) {
  const currentProject = useProjectStore((s) => s.currentProject)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)

  const { data: items, isLoading } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  if (isLoading || !config) {
    return <div className="flex items-center justify-center h-full text-text-muted text-xs">Loading...</div>
  }

  const allItems = items ?? []
  const stateMachine = config.state_machines?.default
  const states = stateMachine ? Object.keys(stateMachine.states) : []

  // Compute stats
  const byStatus: Record<string, WorkItem[]> = {}
  for (const s of states) byStatus[s] = []
  for (const item of allItems) {
    if (byStatus[item.status]) byStatus[item.status].push(item)
    else byStatus[item.status] = [item]
  }

  const byPriority: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, none: 0 }
  for (const item of allItems) byPriority[item.priority ?? 'none'] = (byPriority[item.priority ?? 'none'] ?? 0) + 1

  const assigneeCounts: Record<string, number> = {}
  for (const item of allItems) {
    const a = item.assignee || 'Unassigned'
    assigneeCounts[a] = (assigneeCounts[a] ?? 0) + 1
  }
  const topAssignees = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const now = new Date()
  const overdue = allItems.filter((i) => {
    if (!i.due) return false
    const terminal = stateMachine?.states[i.status]?.terminal
    if (terminal) return false
    return new Date(i.due) < now
  })

  const recentlyCreated = [...allItems]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  const recentlyCompleted = allItems
    .filter((i) => i.completed_at)
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''))
    .slice(0, 5)

  const activeStates = states.filter((s) => !stateMachine?.states[s]?.terminal)
  const terminalStates = states.filter((s) => stateMachine?.states[s]?.terminal)
  const openCount = activeStates.reduce((n, s) => n + (byStatus[s]?.length ?? 0), 0)
  const closedCount = terminalStates.reduce((n, s) => n + (byStatus[s]?.length ?? 0), 0)

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total" value={allItems.length} />
          <StatCard label="Open" value={openCount} accent="text-blue-400" />
          <StatCard label="Closed" value={closedCount} accent="text-green-400" />
          <StatCard
            label="Overdue"
            value={overdue.length}
            accent={overdue.length > 0 ? 'text-red-400' : undefined}
          />
        </div>

        {/* Status breakdown + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <Card title="By Status">
            <div className="space-y-2.5">
              {states.map((status) => {
                const count = byStatus[status]?.length ?? 0
                const pct = allItems.length > 0 ? (count / allItems.length) * 100 : 0
                return (
                  <div key={status} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-text-muted truncate">{status}</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[status] ?? 'bg-text-muted'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-text-secondary tabular-nums">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="By Priority">
            <div className="space-y-2.5">
              {['critical', 'high', 'medium', 'low', 'none'].map((p) => {
                const count = byPriority[p] ?? 0
                const pct = allItems.length > 0 ? (count / allItems.length) * 100 : 0
                return (
                  <div key={p} className="flex items-center gap-3 text-xs">
                    <span className="w-20 text-text-muted truncate">{p}</span>
                    <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${PRIORITY_COLORS[p] ?? 'bg-text-muted'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-text-secondary tabular-nums">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Assignees + Overdue */}
        <div className="grid grid-cols-2 gap-4">
          <Card title="By Assignee">
            {topAssignees.length === 0 ? (
              <p className="text-xs text-text-muted">No items</p>
            ) : (
              <div className="space-y-2">
                {topAssignees.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className={`text-text-secondary ${name === 'Unassigned' ? 'italic text-text-muted' : ''}`}>
                      {name}
                    </span>
                    <span className="text-text-muted tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Overdue (${overdue.length})`}>
            {overdue.length === 0 ? (
              <p className="text-xs text-text-muted">Nothing overdue</p>
            ) : (
              <div className="space-y-1">
                {overdue.slice(0, 6).map((item) => (
                  <ItemRow key={item.id} item={item} onClick={() => openDetailPanel(item.id)} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-2 gap-4">
          <Card title="Recently Created">
            {recentlyCreated.length === 0 ? (
              <p className="text-xs text-text-muted">No items</p>
            ) : (
              <div className="space-y-1">
                {recentlyCreated.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    meta={relativeDate(item.created_at)}
                    onClick={() => openDetailPanel(item.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Recently Completed">
            {recentlyCompleted.length === 0 ? (
              <p className="text-xs text-text-muted">No completed items yet</p>
            ) : (
              <div className="space-y-1">
                {recentlyCompleted.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    meta={relativeDate(item.completed_at ?? '')}
                    onClick={() => openDetailPanel(item.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg px-4 py-3">
      <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums ${accent ?? 'text-text-primary'}`}>{value}</div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
      <h3 className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-3">{title}</h3>
      {children}
    </div>
  )
}

function ItemRow({ item, meta, onClick }: { item: WorkItem; meta?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-bg-hover transition-colors text-left"
    >
      <span className="font-mono text-text-muted flex-shrink-0">{item.id}</span>
      <span className="text-text-secondary truncate flex-1 min-w-0">{item.title}</span>
      {meta && <span className="text-text-muted flex-shrink-0">{meta}</span>}
      {!meta && item.due && (
        <span className="text-red-400 flex-shrink-0">{formatShortDate(item.due)}</span>
      )}
    </button>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatShortDate(iso)
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

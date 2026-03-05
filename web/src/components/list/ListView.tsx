import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig, WorkItem } from '@/types'

interface Props {
  config: ProjectConfig | null
}

const PRIORITY_LABELS: Record<string, { text: string; color: string }> = {
  critical: { text: '●', color: 'text-priority-critical' },
  high: { text: '●', color: 'text-priority-high' },
  medium: { text: '●', color: 'text-priority-medium' },
  low: { text: '●', color: 'text-priority-low' },
  none: { text: '○', color: 'text-text-muted' },
}

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 }

type SortKey = 'id' | 'title' | 'status' | 'priority' | 'assignee' | 'due' | 'updated'
type SortDir = 'asc' | 'desc'

function compareFn(key: SortKey, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1
  return (a: WorkItem, b: WorkItem): number => {
    switch (key) {
      case 'id': return mul * a.id.localeCompare(b.id, undefined, { numeric: true })
      case 'title': return mul * a.title.localeCompare(b.title)
      case 'status': return mul * a.status.localeCompare(b.status)
      case 'priority': return mul * ((PRIORITY_ORDER[a.priority ?? 'none'] ?? 4) - (PRIORITY_ORDER[b.priority ?? 'none'] ?? 4))
      case 'assignee': return mul * (a.assignee ?? '').localeCompare(b.assignee ?? '')
      case 'due': return mul * (a.due ?? '9999').localeCompare(b.due ?? '9999')
      case 'updated': return mul * ((a.updated_at ?? a.created_at).localeCompare(b.updated_at ?? b.created_at))
      default: return 0
    }
  }
}

export function ListView({ config }: Props) {
  const queryClient = useQueryClient()
  const currentProject = useProjectStore((s) => s.currentProject)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)
  const openCreateDrawer = useUIStore((s) => s.openCreateDrawer)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const filterTag = useUIStore((s) => s.filterTag)

  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data: allItems, isLoading } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  const items = useMemo(() => {
    const filtered = allItems?.filter((i) => {
      if (filterStatus && i.status !== filterStatus) return false
      if (filterTag && !i.tags.includes(filterTag)) return false
      return true
    })
    return filtered?.slice().sort(compareFn(sortKey, sortDir))
  }, [allItems, filterStatus, filterTag, sortKey, sortDir])

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.items.changeStatus(id, { status, force: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const stateMachine = config?.state_machines?.default
  const states = stateMachine ? Object.keys(stateMachine.states) : []

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'updated' || key === 'due' ? 'desc' : 'asc')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading...</div>
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
        <div className="text-4xl">≡</div>
        <div>No work items yet</div>
        <button
          onClick={openCreateDrawer}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
        >
          Create first item
        </button>
      </div>
    )
  }

  const columns: { key: SortKey; label: string; width: string }[] = [
    { key: 'id', label: 'ID', width: 'w-24' },
    { key: 'title', label: 'Title', width: '' },
    { key: 'status', label: 'Status', width: 'w-24' },
    { key: 'priority', label: 'Priority', width: 'w-20' },
    { key: 'assignee', label: 'Assignee', width: 'w-24' },
    { key: 'due', label: 'Due', width: 'w-24' },
    { key: 'updated', label: 'Updated', width: 'w-28' },
  ]

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-bg-primary z-10">
          <tr className="border-b border-border-default text-text-muted text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-3 py-2 font-medium cursor-pointer select-none hover:text-text-secondary transition-colors ${col.width}`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-accent-text">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            <th className="px-3 py-2 w-32 font-medium">Tags</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => openDetailPanel(item.id)}
              className="border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors"
            >
              <td className="px-3 py-2 font-mono text-text-muted">{item.id}</td>
              <td className="px-3 py-2 text-text-primary">{item.title}</td>
              <td className="px-3 py-2">
                <StatusDropdown
                  value={item.status}
                  states={states}
                  onChange={(status) => statusMutation.mutate({ id: item.id, status })}
                />
              </td>
              <td className="px-3 py-2">
                <PriorityBadge priority={item.priority} />
              </td>
              <td className="px-3 py-2 text-text-muted">{item.assignee ?? '—'}</td>
              <td className="px-3 py-2 text-text-muted">{item.due ?? '—'}</td>
              <td className="px-3 py-2 text-text-muted">{relativeTime(item.updated_at ?? item.created_at)}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1 flex-wrap">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-[10px] text-text-muted">+{item.tags.length - 2}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusDropdown({
  value,
  states,
  onChange,
}: {
  value: string
  states: string[]
  onChange: (status: string) => void
}) {
  return (
    <select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border border-border-default rounded px-1.5 py-0.5 text-xs text-text-secondary cursor-pointer hover:border-text-muted transition-colors outline-none"
    >
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  )
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = priority ? PRIORITY_LABELS[priority] : PRIORITY_LABELS.none
  if (!p) return <span className="text-text-muted">—</span>
  return <span className={p.color}>{p.text} {priority ?? 'none'}</span>
}

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  } catch {
    return iso
  }
}

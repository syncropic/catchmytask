import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig } from '@/types'

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

export function ListView({ config }: Props) {
  const queryClient = useQueryClient()
  const currentProject = useProjectStore((s) => s.currentProject)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)
  const openCreateDrawer = useUIStore((s) => s.openCreateDrawer)

  const { data: items, isLoading } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.items.changeStatus(id, { status, force: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const stateMachine = config?.state_machines?.default
  const states = stateMachine ? Object.keys(stateMachine.states) : []

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
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
        >
          Create first item
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-bg-primary z-10">
          <tr className="border-b border-border-default text-text-muted text-left">
            <th className="px-3 py-2 w-24 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 w-24 font-medium">Status</th>
            <th className="px-3 py-2 w-20 font-medium">Priority</th>
            <th className="px-3 py-2 w-24 font-medium">Assignee</th>
            <th className="px-3 py-2 w-24 font-medium">Due</th>
            <th className="px-3 py-2 w-40 font-medium">Tags</th>
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

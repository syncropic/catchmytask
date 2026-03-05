import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useProjectStore } from '@/stores/project'
import { useUIStore } from '@/stores/ui'
import type { ProjectConfig } from '@/types'

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

export function Sidebar({ config }: Props) {
  const currentProject = useProjectStore((s) => s.currentProject)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const setFilterStatus = useUIStore((s) => s.setFilterStatus)
  const filterTag = useUIStore((s) => s.filterTag)
  const setFilterTag = useUIStore((s) => s.setFilterTag)

  const { data: items } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  const stateMachine = config?.state_machines?.default
  const states = stateMachine ? Object.keys(stateMachine.states) : []

  // Count items per status
  const statusCounts: Record<string, number> = {}
  for (const item of items ?? []) {
    statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1
  }

  // Collect all tags
  const tagCounts: Record<string, number> = {}
  for (const item of items ?? []) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1
    }
  }

  const totalItems = items?.length ?? 0

  return (
    <aside className="w-full h-full bg-bg-secondary border-r border-border-default overflow-y-auto py-3 px-2">
      {/* Status filters */}
      <div className="mb-4">
        <h3 className="text-text-muted text-[11px] uppercase tracking-wider font-medium px-2 mb-1.5">
          Status
        </h3>
        <button
          onClick={() => setFilterStatus(null)}
          className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
            filterStatus === null ? 'bg-bg-hover text-text-primary' : 'hover:bg-bg-hover text-text-secondary'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          All
          <span className="ml-auto text-text-muted">{totalItems}</span>
        </button>
        {states.map((state) => (
          <button
            key={state}
            onClick={() => setFilterStatus(filterStatus === state ? null : state)}
            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
              filterStatus === state ? 'bg-bg-hover text-text-primary' : 'hover:bg-bg-hover text-text-secondary'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[state] ?? 'bg-text-muted'}`} />
            {state}
            <span className="ml-auto text-text-muted">{statusCounts[state] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Tags */}
      {Object.keys(tagCounts).length > 0 && (
        <div>
          <h3 className="text-text-muted text-[11px] uppercase tracking-wider font-medium px-2 mb-1.5">
            Tags
          </h3>
          {Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                  filterTag === tag ? 'bg-bg-hover text-text-primary' : 'hover:bg-bg-hover text-text-secondary'
                }`}
              >
                <span className="text-text-muted">#</span>
                {tag}
                <span className="ml-auto text-text-muted">{count}</span>
              </button>
            ))}
        </div>
      )}
    </aside>
  )
}

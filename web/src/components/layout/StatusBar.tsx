import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig } from '@/types'

interface Props {
  config: ProjectConfig | null
}

export function StatusBar({ config }: Props) {
  const currentProject = useProjectStore((s) => s.currentProject)

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30000,
  })

  const { data: items } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  const activeCount = items?.filter((i) => i.status === 'active').length ?? 0
  const blockedCount = items?.filter((i) => i.status === 'blocked').length ?? 0
  const version = health?.version ?? '...'

  return (
    <footer className="h-7 flex-shrink-0 bg-bg-secondary border-t border-border-default flex items-center px-3 text-[11px] text-text-muted gap-4">
      <span>
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
        {config?.project.name ?? '...'}
      </span>

      <span className="border-l border-border-default h-3" />

      <span>
        Active: <span className="text-text-secondary">{activeCount}</span>
      </span>
      {blockedCount > 0 && (
        <span>
          Blocked: <span className="text-status-blocked">{blockedCount}</span>
        </span>
      )}

      <div className="flex-1" />

      <span>v{version}</span>
    </footer>
  )
}

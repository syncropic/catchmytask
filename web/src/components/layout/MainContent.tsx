import { useUIStore } from '@/stores/ui'
import { BoardView } from '@/components/board/BoardView'
import { ListView } from '@/components/list/ListView'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { ActivityView } from '@/components/activity/ActivityView'
import { SettingsView } from '@/components/settings/SettingsView'
import type { ProjectConfig } from '@/types'

interface Props {
  config: ProjectConfig | null
}

export function MainContent({ config }: Props) {
  const activeView = useUIStore((s) => s.activeView)

  return (
    <main className="flex-1 min-w-0 overflow-auto bg-bg-primary">
      {activeView === 'board' && <BoardView config={config} />}
      {activeView === 'list' && <ListView config={config} />}
      {activeView === 'dashboard' && <DashboardView config={config} />}
      {activeView === 'activity' && <ActivityView config={config} />}
      {activeView === 'settings' && <SettingsView config={config} />}
    </main>
  )
}

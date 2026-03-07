import { useUIStore } from '@/stores/ui'
import { BoardView } from '@/components/board/BoardView'
import { ListView } from '@/components/list/ListView'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { ActivityView } from '@/components/activity/ActivityView'
import { ArtifactsBrowser } from '@/components/artifacts/ArtifactsBrowser'
import { SettingsView } from '@/components/settings/SettingsView'
import { TerminalView } from '@/components/commandbar/TerminalView'
import type { ProjectConfig } from '@/types'

interface Props {
  config: ProjectConfig | null
}

export function MainContent({ config }: Props) {
  const activeView = useUIStore((s) => s.activeView)

  const fullWidth = activeView === 'board' || activeView === 'artifacts' || activeView === 'terminal'

  return (
    <main className="flex-1 min-w-0 overflow-auto bg-bg-primary">
      <div className={fullWidth ? 'h-full' : 'max-w-6xl mx-auto w-full h-full'}>
        {activeView === 'board' && <BoardView config={config} />}
        {activeView === 'list' && <ListView config={config} />}
        {activeView === 'dashboard' && <DashboardView config={config} />}
        {activeView === 'activity' && <ActivityView config={config} />}
        {activeView === 'artifacts' && <ArtifactsBrowser />}
        {activeView === 'terminal' && <TerminalView />}
        {activeView === 'settings' && <SettingsView config={config} />}
      </div>
    </main>
  )
}

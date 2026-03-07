import { lazy, Suspense } from 'react'
import { useUIStore } from '@/stores/ui'
import type { ProjectConfig } from '@/types'

const BoardView = lazy(() => import('@/components/board/BoardView').then(m => ({ default: m.BoardView })))
const ListView = lazy(() => import('@/components/list/ListView').then(m => ({ default: m.ListView })))
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })))
const ActivityView = lazy(() => import('@/components/activity/ActivityView').then(m => ({ default: m.ActivityView })))
const ArtifactsBrowser = lazy(() => import('@/components/artifacts/ArtifactsBrowser').then(m => ({ default: m.ArtifactsBrowser })))
const TerminalView = lazy(() => import('@/components/commandbar/TerminalView').then(m => ({ default: m.TerminalView })))
const SettingsView = lazy(() => import('@/components/settings/SettingsView').then(m => ({ default: m.SettingsView })))

function ViewLoading() {
  return (
    <div className="flex items-center justify-center h-full text-text-muted text-sm">
      Loading...
    </div>
  )
}

interface Props {
  config: ProjectConfig | null
}

export function MainContent({ config }: Props) {
  const activeView = useUIStore((s) => s.activeView)

  const fullWidth = activeView === 'board' || activeView === 'artifacts' || activeView === 'terminal'

  return (
    <main className="flex-1 min-w-0 overflow-auto bg-bg-primary">
      <div className={fullWidth ? 'h-full' : 'max-w-6xl mx-auto w-full h-full'}>
        <Suspense fallback={<ViewLoading />}>
          {activeView === 'board' && <BoardView config={config} />}
          {activeView === 'list' && <ListView config={config} />}
          {activeView === 'dashboard' && <DashboardView config={config} />}
          {activeView === 'activity' && <ActivityView config={config} />}
          {activeView === 'artifacts' && <ArtifactsBrowser />}
          {activeView === 'terminal' && <TerminalView />}
          {activeView === 'settings' && <SettingsView config={config} />}
        </Suspense>
      </div>
    </main>
  )
}

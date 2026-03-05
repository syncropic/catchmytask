import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import { useConnectionStore, detectBackend } from '@/stores/connection'
import { hasConfig } from '@/lib/storage/config-store'
import { ActivityRail } from '@/components/layout/ActivityRail'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatusBar } from '@/components/layout/StatusBar'
import { MainContent } from '@/components/layout/MainContent'
import { DetailPanel } from '@/components/detail/DetailPanel'
import { CreateDrawer } from '@/components/shared/CreateDrawer'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { OnboardingDrawer } from '@/components/shared/OnboardingDrawer'

export function AppPage() {
  useWebSocket()

  const mode = useConnectionStore((s) => s.mode)
  const currentProject = useProjectStore((s) => s.currentProject)
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

  // Wait for backend auto-detection, then check if we need onboarding
  useEffect(() => {
    detectBackend().then(() => {
      const currentMode = useConnectionStore.getState().mode
      if (currentMode === 'local') {
        hasConfig().then((exists) => setShowOnboarding(!exists))
      } else {
        setShowOnboarding(false)
      }
    })
  }, [mode])

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects,
    enabled: showOnboarding === false,
  })

  const { data: config } = useQuery({
    queryKey: ['config', currentProject],
    queryFn: api.config,
    enabled: showOnboarding === false,
  })

  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const createDrawerOpen = useUIStore((s) => s.createDrawerOpen)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useUIStore.getState().toggleCommandPalette()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        useUIStore.getState().toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Loading state
  if (showOnboarding === null) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Loading...
      </div>
    )
  }

  // Onboarding
  if (showOnboarding) {
    return <OnboardingDrawer onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <div className="flex h-full">
      <ActivityRail />

      <div className="flex flex-col flex-1 min-w-0">
        <Header config={config ?? null} projects={projectsData ?? null} />

        <div className="flex flex-1 min-h-0">
          {sidebarOpen && <Sidebar config={config ?? null} projects={projectsData ?? null} />}

          <MainContent config={config ?? null} />

          {detailPanelOpen && <DetailPanel config={config ?? null} />}
          {createDrawerOpen && <CreateDrawer config={config ?? null} />}
        </div>

        <StatusBar config={config ?? null} />
      </div>

      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}

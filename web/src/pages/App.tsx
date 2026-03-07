import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
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
import { CommandBar } from '@/components/commandbar/CommandBar'
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
    placeholderData: keepPreviousData,
  })

  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen)
  const createDrawerOpen = useUIStore((s) => s.createDrawerOpen)
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen)

  const [sidebarWidth, setSidebarWidth] = useState(224)
  const [detailWidth, setDetailWidth] = useState(() => {
    const w = window.innerWidth
    if (w >= 1920) return 520
    if (w >= 1440) return 440
    return 384
  })

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
          {sidebarOpen && (
            <>
              <div style={{ width: sidebarWidth }} className="flex-shrink-0">
                <Sidebar config={config ?? null} />
              </div>
              <ResizeHandle onResize={setSidebarWidth} min={160} max={400} currentWidth={sidebarWidth} side="left" />
            </>
          )}

          <MainContent config={config ?? null} />

          {detailPanelOpen && (
            <>
              <ResizeHandle onResize={setDetailWidth} min={280} max={600} currentWidth={detailWidth} side="right" />
              <div style={{ width: detailWidth }} className="flex-shrink-0">
                <DetailPanel config={config ?? null} />
              </div>
            </>
          )}
          {createDrawerOpen && <CreateDrawer config={config ?? null} />}
        </div>

        <CommandBar />
        <StatusBar config={config ?? null} />
      </div>

      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}

function ResizeHandle({
  onResize,
  min,
  max,
  currentWidth,
  side,
}: {
  onResize: (width: number) => void
  min: number
  max: number
  currentWidth: number
  side: 'left' | 'right'
}) {
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true
      startX.current = e.clientX
      startWidth.current = currentWidth

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return
        const delta = side === 'left'
          ? ev.clientX - startX.current
          : startX.current - ev.clientX
        const newWidth = Math.min(max, Math.max(min, startWidth.current + delta))
        onResize(newWidth)
      }

      const onMouseUp = () => {
        dragging.current = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    },
    [currentWidth, min, max, onResize, side]
  )

  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 flex-shrink-0 cursor-col-resize hover:bg-accent/30 active:bg-accent/50 transition-colors"
    />
  )
}

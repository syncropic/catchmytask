import { useUIStore } from '@/stores/ui'
import type { View } from '@/types'

const VIEW_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: 'list', icon: '≡', label: 'List' },
  { view: 'activity', icon: '↕', label: 'Activity' },
  { view: 'board', icon: '▦', label: 'Board' },
  { view: 'dashboard', icon: '▣', label: 'Dashboard' },
  { view: 'artifacts', icon: '⎘', label: 'Artifacts' },
  { view: 'terminal', icon: '⌘', label: 'Terminal' },
]

const BOTTOM_ITEMS: { view: View; icon: string; label: string }[] = [
  { view: 'settings', icon: '⚙', label: 'Settings' },
]

export function ActivityRail() {
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)

  return (
    <nav aria-label="Views" className="w-12 flex-shrink-0 bg-bg-secondary border-r border-border-default flex flex-col items-center py-2 gap-1">
      {VIEW_ITEMS.map(({ view, icon, label }) => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          aria-label={label}
          aria-current={activeView === view ? 'page' : undefined}
          title={label}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-colors ${
            activeView === view
              ? 'bg-bg-active text-text-primary'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
          }`}
        >
          {icon}
        </button>
      ))}

      <div className="flex-1" />

      {BOTTOM_ITEMS.map(({ view, icon, label }) => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          aria-label={label}
          aria-current={activeView === view ? 'page' : undefined}
          title={label}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-colors ${
            activeView === view
              ? 'bg-bg-active text-text-primary'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
          }`}
        >
          {icon}
        </button>
      ))}
    </nav>
  )
}

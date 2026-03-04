import { useQueryClient } from '@tanstack/react-query'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import { useThemeStore } from '@/stores/theme'
import type { ProjectConfig, ProjectsResponse } from '@/types'

interface Props {
  config: ProjectConfig | null
  projects: ProjectsResponse | null
}

export function Header({ config, projects }: Props) {
  const queryClient = useQueryClient()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const openCreateDrawer = useUIStore((s) => s.openCreateDrawer)
  const currentProject = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const { resolved: theme, toggle: toggleTheme } = useThemeStore()

  const projectName = config?.project.name ?? '...'
  const prefix = config?.project.prefix ?? ''
  const multiProject = projects && projects.projects.length > 1

  function handleProjectSwitch(name: string) {
    const isDefault = projects?.default_project === name
    setCurrentProject(isDefault ? null : name)
    useUIStore.getState().closeDetailPanel()
    queryClient.invalidateQueries()
  }

  return (
    <header className="h-10 flex-shrink-0 bg-bg-secondary border-b border-border-default flex items-center px-3 gap-3">
      <button
        onClick={toggleSidebar}
        className="text-text-muted hover:text-text-primary transition-colors"
        title="Toggle sidebar (Ctrl+B)"
      >
        &#9776;
      </button>

      <span className="text-text-primary font-medium">CatchMyTask</span>
      <span className="text-text-muted">&#9656;</span>

      {multiProject ? (
        <select
          value={currentProject ?? projects.default_project}
          onChange={(e) => handleProjectSwitch(e.target.value)}
          className="bg-bg-tertiary border border-border-default rounded px-2 py-0.5 text-xs text-text-secondary cursor-pointer hover:border-text-muted transition-colors outline-none"
        >
          {projects.projects.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} [{p.prefix}]
            </option>
          ))}
        </select>
      ) : (
        <span className="text-text-secondary">
          {projectName}
          {prefix && (
            <span className="ml-1.5 text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              {prefix}
            </span>
          )}
        </span>
      )}

      <div className="flex-1" />

      <button
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 text-text-muted hover:text-text-secondary bg-bg-tertiary px-3 py-1 rounded border border-border-default text-xs transition-colors"
      >
        Search...
        <kbd className="text-text-muted">&#8984;K</kbd>
      </button>

      <button
        onClick={() => {
          document.documentElement.classList.add('transitioning')
          toggleTheme()
          setTimeout(() => document.documentElement.classList.remove('transitioning'), 300)
        }}
        className="text-text-muted hover:text-text-primary transition-colors"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>

      <button
        onClick={openCreateDrawer}
        className="bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded text-xs font-medium transition-colors"
      >
        + New
      </button>
    </header>
  )
}

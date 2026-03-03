import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'

export function CommandPalette() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const currentProject = useProjectStore((s) => s.currentProject)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const openCreateDrawer = useUIStore((s) => s.openCreateDrawer)

  const { data: items } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Filter items by query
  const lowerQuery = query.toLowerCase()
  const matchedItems = (items ?? [])
    .filter(
      (item) =>
        item.id.toLowerCase().includes(lowerQuery) ||
        item.title.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10)

  // View commands
  const viewCommands = [
    { label: 'Board View', action: () => { setActiveView('board'); toggleCommandPalette() } },
    { label: 'List View', action: () => { setActiveView('list'); toggleCommandPalette() } },
    { label: 'Dashboard', action: () => { setActiveView('dashboard'); toggleCommandPalette() } },
    { label: 'Activity', action: () => { setActiveView('activity'); toggleCommandPalette() } },
    { label: 'Settings', action: () => { setActiveView('settings'); toggleCommandPalette() } },
    { label: 'New Item', action: () => { openCreateDrawer(); toggleCommandPalette() } },
  ].filter((cmd) => cmd.label.toLowerCase().includes(lowerQuery))

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      toggleCommandPalette()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleCommandPalette} />

      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[560px] max-h-[60vh] bg-bg-secondary border border-border-default rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border-default">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search items, views, commands..."
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="overflow-y-auto max-h-[50vh]">
          {/* View commands */}
          {viewCommands.length > 0 && (
            <div className="px-2 py-1">
              <div className="text-[10px] text-text-muted uppercase tracking-wider px-2 py-1">
                Commands
              </div>
              {viewCommands.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={cmd.action}
                  className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover rounded transition-colors"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          )}

          {/* Items */}
          {matchedItems.length > 0 && (
            <div className="px-2 py-1">
              <div className="text-[10px] text-text-muted uppercase tracking-wider px-2 py-1">
                Items
              </div>
              {matchedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    openDetailPanel(item.id)
                    toggleCommandPalette()
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs hover:bg-bg-hover rounded transition-colors"
                >
                  <span className="font-mono text-text-muted">{item.id}</span>
                  <span className="text-text-secondary">{item.title}</span>
                  <span className="ml-auto text-text-muted">{item.status}</span>
                </button>
              ))}
            </div>
          )}

          {query && matchedItems.length === 0 && viewCommands.length === 0 && (
            <div className="px-4 py-6 text-center text-text-muted text-xs">
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </>
  )
}

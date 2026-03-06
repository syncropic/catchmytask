import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useProjectStore } from '@/stores/project'
import { useUIStore } from '@/stores/ui'
import type { ProjectArtifactEntry } from '@/types'

type GroupBy = 'item' | 'type' | 'source'
type ViewMode = 'list' | 'grid'
type SortKey = 'name' | 'item' | 'type' | 'size' | 'modified'
type SortDir = 'asc' | 'desc'

const TYPE_CATEGORIES: Record<string, { label: string; color: string; extensions: string[] }> = {
  code: { label: 'Code', color: 'text-green-400', extensions: ['rs', 'ts', 'tsx', 'js', 'jsx', 'py', 'go', 'java', 'c', 'cpp', 'h', 'rb', 'sh', 'bash', 'zsh', 'fish', 'sql'] },
  docs: { label: 'Documents', color: 'text-blue-400', extensions: ['md', 'txt', 'pdf', 'doc', 'docx', 'rtf', 'tex'] },
  images: { label: 'Images', color: 'text-orange-400', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'] },
  data: { label: 'Data', color: 'text-purple-400', extensions: ['json', 'yaml', 'yml', 'toml', 'xml', 'csv', 'tsv'] },
  config: { label: 'Config', color: 'text-yellow-400', extensions: ['ini', 'conf', 'cfg', 'env', 'properties'] },
  other: { label: 'Other', color: 'text-text-muted', extensions: [] },
}

function getTypeCategory(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  for (const [cat, info] of Object.entries(TYPE_CATEGORIES)) {
    if (info.extensions.includes(ext)) return cat
  }
  return 'other'
}

function extToColor(name: string): string {
  const cat = getTypeCategory(name)
  return TYPE_CATEGORIES[cat]?.color ?? 'text-text-muted'
}

function formatSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '--'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`
}

function relativeTime(iso: string | null): string {
  if (!iso) return '--'
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  } catch {
    return iso
  }
}

function getExt(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

export function ArtifactsBrowser() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)
  const filterStatus = useUIStore((s) => s.filterStatus)
  const filterTag = useUIStore((s) => s.filterTag)

  const [search, setSearch] = useState('')
  const [groupBy, setGroupBy] = useState<GroupBy>('item')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<ProjectArtifactEntry | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['all-artifacts', currentProject],
    queryFn: () => api.artifacts(),
  })

  const { data: allItems } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  // Build a map of item_id -> item for status/tag filtering
  const itemMap = useMemo(() => {
    const map = new Map<string, { status: string; tags: string[] }>()
    for (const item of allItems ?? []) {
      map.set(item.id, { status: item.status, tags: item.tags })
    }
    return map
  }, [allItems])

  // Pre-filter artifacts by status/tag of their parent item
  const artifacts = useMemo(() => {
    let result = data?.artifacts ?? []
    if (filterStatus || filterTag) {
      result = result.filter((a) => {
        const item = itemMap.get(a.item_id)
        if (!item) return false
        if (filterStatus && item.status !== filterStatus) return false
        if (filterTag && !item.tags.includes(filterTag)) return false
        return true
      })
    }
    return result
  }, [data?.artifacts, filterStatus, filterTag, itemMap])

  // Compute sidebar counts
  const itemCounts = useMemo(() => {
    const map = new Map<string, { title: string; count: number }>()
    for (const a of artifacts) {
      const entry = map.get(a.item_id) ?? { title: a.item_title, count: 0 }
      entry.count++
      map.set(a.item_id, entry)
    }
    return Array.from(map.entries())
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => b.count - a.count)
  }, [artifacts])

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of artifacts) {
      const cat = getTypeCategory(a.name)
      map.set(cat, (map.get(cat) ?? 0) + 1)
    }
    return Object.entries(TYPE_CATEGORIES)
      .map(([key, info]) => ({ key, label: info.label, color: info.color, count: map.get(key) ?? 0 }))
      .filter((c) => c.count > 0)
  }, [artifacts])

  const sourceCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of artifacts) {
      map.set(a.source, (map.get(a.source) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([source, count]) => ({ source, count }))
  }, [artifacts])

  // Filter
  const filtered = useMemo(() => {
    let result = artifacts
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.item_id.toLowerCase().includes(q) ||
          a.item_title.toLowerCase().includes(q) ||
          (a.category?.toLowerCase().includes(q) ?? false)
      )
    }
    if (selectedCategory) {
      result = result.filter((a) => getTypeCategory(a.name) === selectedCategory)
    }
    if (selectedItem) {
      result = result.filter((a) => a.item_id === selectedItem)
    }
    if (selectedSource) {
      result = result.filter((a) => a.source === selectedSource)
    }
    return result
  }, [artifacts, search, selectedCategory, selectedItem, selectedSource])

  // Sort
  const sorted = useMemo(() => {
    const mul = sortDir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name': return mul * a.name.localeCompare(b.name)
        case 'item': return mul * a.item_id.localeCompare(b.item_id, undefined, { numeric: true })
        case 'type': return mul * getExt(a.name).localeCompare(getExt(b.name))
        case 'size': return mul * ((a.size ?? 0) - (b.size ?? 0))
        case 'modified': return mul * ((a.modified ?? '').localeCompare(b.modified ?? ''))
        default: return 0
      }
    })
  }, [filtered, sortKey, sortDir])

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prev
      }
      setSortDir(key === 'modified' || key === 'size' ? 'desc' : 'asc')
      return key
    })
  }, [])

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedItem(null)
    setSelectedSource(null)
    setSearch('')
  }

  const hasFilters = selectedCategory || selectedItem || selectedSource || search

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted text-sm">Loading artifacts...</div>
  }

  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
        <div className="text-4xl">⎘</div>
        <div>No artifacts found</div>
        <div className="text-xs max-w-sm text-center">
          Artifacts appear when work items use the complex format (folders with item.md + additional files)
          or reference external files via the <code className="text-accent-text">refs</code> frontmatter field.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-border-default overflow-y-auto p-3 space-y-4">
        {/* Browse By Item */}
        <SidebarSection title="By Item" defaultOpen={groupBy === 'item'}>
          {itemCounts.map((entry) => (
            <SidebarItem
              key={entry.id}
              label={entry.id}
              sublabel={entry.title}
              count={entry.count}
              active={selectedItem === entry.id}
              onClick={() => setSelectedItem(selectedItem === entry.id ? null : entry.id)}
            />
          ))}
        </SidebarSection>

        {/* Browse By Type */}
        <SidebarSection title="By Type" defaultOpen={groupBy === 'type'}>
          {typeCounts.map((entry) => (
            <SidebarItem
              key={entry.key}
              label={entry.label}
              count={entry.count}
              active={selectedCategory === entry.key}
              colorDot={entry.color}
              onClick={() => setSelectedCategory(selectedCategory === entry.key ? null : entry.key)}
            />
          ))}
        </SidebarSection>

        {/* Browse By Source */}
        <SidebarSection title="By Source" defaultOpen={groupBy === 'source'}>
          {sourceCounts.map((entry) => (
            <SidebarItem
              key={entry.source}
              label={entry.source.replace('_', ' ')}
              count={entry.count}
              active={selectedSource === entry.source}
              onClick={() => setSelectedSource(selectedSource === entry.source ? null : entry.source)}
            />
          ))}
        </SidebarSection>

        {hasFilters && (
          <button onClick={clearFilters} className="text-[11px] text-accent-text hover:underline w-full text-left px-1">
            Clear all filters
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border-default">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts..."
            className="flex-1 bg-bg-secondary border border-border-default rounded px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
          />
          <span className="text-[11px] text-text-muted whitespace-nowrap">
            {filtered.length} of {artifacts.length}
          </span>
          <div className="flex border border-border-default rounded overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs ${viewMode === 'list' ? 'bg-bg-active text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              ≡
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1 text-xs ${viewMode === 'grid' ? 'bg-bg-active text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              ⊞
            </button>
          </div>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="bg-bg-secondary border border-border-default rounded px-1.5 py-1 text-[11px] text-text-secondary outline-none"
          >
            <option value="item">Group: Item</option>
            <option value="type">Group: Type</option>
            <option value="source">Group: Source</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'list' ? (
            <ArtifactListView
              artifacts={sorted}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onSelect={setSelectedArtifact}
              selectedId={selectedArtifact?.path}
            />
          ) : (
            <ArtifactGridView
              artifacts={sorted}
              onSelect={setSelectedArtifact}
              selectedId={selectedArtifact?.path}
            />
          )}
        </div>
      </div>

      {/* Right Drawer */}
      {selectedArtifact && (
        <ArtifactPreviewDrawer
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onOpenItem={() => openDetailPanel(selectedArtifact.item_id)}
          onPrev={() => {
            const idx = sorted.findIndex((a) => a.path === selectedArtifact.path && a.item_id === selectedArtifact.item_id)
            if (idx > 0) setSelectedArtifact(sorted[idx - 1])
          }}
          onNext={() => {
            const idx = sorted.findIndex((a) => a.path === selectedArtifact.path && a.item_id === selectedArtifact.item_id)
            if (idx < sorted.length - 1) setSelectedArtifact(sorted[idx + 1])
          }}
        />
      )}
    </div>
  )
}

// ── Sidebar Components ────────────────────────────────────────────────────

function SidebarSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 w-full text-[11px] font-medium text-text-muted uppercase tracking-wide hover:text-text-secondary"
      >
        <span className="text-[9px]">{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  )
}

function SidebarItem({
  label,
  sublabel,
  count,
  active,
  colorDot,
  onClick,
}: {
  label: string
  sublabel?: string
  count: number
  active: boolean
  colorDot?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 w-full px-1.5 py-1 rounded text-left text-[11px] transition-colors ${
        active ? 'bg-bg-active text-text-primary' : 'text-text-secondary hover:bg-bg-hover'
      }`}
    >
      {colorDot && <span className={`${colorDot} text-[8px]`}>●</span>}
      <span className="truncate flex-1">
        {label}
        {sublabel && <span className="text-text-muted ml-1 text-[10px] truncate">{sublabel}</span>}
      </span>
      <span className="text-text-muted text-[10px] flex-shrink-0">{count}</span>
    </button>
  )
}

// ── List View ─────────────────────────────────────────────────────────────

function ArtifactListView({
  artifacts,
  sortKey,
  sortDir,
  onSort,
  onSelect,
  selectedId,
}: {
  artifacts: ProjectArtifactEntry[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  onSelect: (a: ProjectArtifactEntry) => void
  selectedId?: string
}) {
  const columns: { key: SortKey; label: string; width: string }[] = [
    { key: 'name', label: 'Name', width: '' },
    { key: 'item', label: 'Item', width: 'w-28' },
    { key: 'type', label: 'Type', width: 'w-16' },
    { key: 'size', label: 'Size', width: 'w-16' },
    { key: 'modified', label: 'Modified', width: 'w-24' },
  ]

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-bg-primary z-10">
        <tr className="border-b border-border-default text-text-muted text-left">
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => onSort(col.key)}
              className={`px-3 py-2 font-medium cursor-pointer select-none hover:text-text-secondary transition-colors ${col.width}`}
            >
              {col.label}
              {sortKey === col.key && (
                <span className="ml-1 text-accent-text">{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
          ))}
          <th className="px-3 py-2 w-20 font-medium">Source</th>
        </tr>
      </thead>
      <tbody>
        {artifacts.map((a, i) => {
          const ext = getExt(a.name)
          const isSelected = selectedId === a.path && selectedId !== undefined
          return (
            <tr
              key={`${a.item_id}-${a.path}-${i}`}
              onClick={() => onSelect(a)}
              className={`border-b border-border-subtle cursor-pointer transition-colors ${
                isSelected ? 'bg-bg-active' : 'hover:bg-bg-hover'
              }`}
            >
              <td className="px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] ${extToColor(a.name)}`}>●</span>
                  <span className="text-text-primary truncate">{a.name}</span>
                  {ext && (
                    <span className="text-[9px] text-text-muted bg-bg-tertiary px-1 rounded flex-shrink-0">
                      .{ext}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-1.5 font-mono text-text-muted text-[11px]">{a.item_id}</td>
              <td className="px-3 py-1.5 text-text-muted">{ext.toUpperCase() || '--'}</td>
              <td className="px-3 py-1.5 text-text-muted">{formatSize(a.size)}</td>
              <td className="px-3 py-1.5 text-text-muted">{relativeTime(a.modified)}</td>
              <td className="px-3 py-1.5">
                <span className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                  {a.source.replace('_', ' ')}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Grid View ─────────────────────────────────────────────────────────────

function ArtifactGridView({
  artifacts,
  onSelect,
  selectedId,
}: {
  artifacts: ProjectArtifactEntry[]
  onSelect: (a: ProjectArtifactEntry) => void
  selectedId?: string
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 p-3">
      {artifacts.map((a, i) => {
        const ext = getExt(a.name)
        const isImage = a.mime?.startsWith('image/')
        const isSelected = selectedId === a.path
        return (
          <div
            key={`${a.item_id}-${a.path}-${i}`}
            onClick={() => onSelect(a)}
            className={`border rounded-md p-2 cursor-pointer transition-all ${
              isSelected
                ? 'border-accent bg-bg-active'
                : 'border-border-default bg-bg-secondary hover:border-border-default hover:bg-bg-hover'
            }`}
          >
            <div className="h-20 flex items-center justify-center rounded bg-bg-tertiary mb-2 overflow-hidden">
              {isImage ? (
                <img
                  src={api.items.artifactUrl(a.item_id, a.path)}
                  alt={a.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span className={`text-2xl ${extToColor(a.name)}`}>
                  {ext === 'pdf' ? '⊡' : ext === 'md' || ext === 'txt' ? '≡' : '⎘'}
                </span>
              )}
            </div>
            <div className="text-[11px] text-text-primary truncate">{a.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-text-muted font-mono">{a.item_id}</span>
              <span className="text-[10px] text-text-muted ml-auto">{formatSize(a.size)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Preview Drawer ────────────────────────────────────────────────────────

function ArtifactPreviewDrawer({
  artifact,
  onClose,
  onOpenItem,
  onPrev,
  onNext,
}: {
  artifact: ProjectArtifactEntry
  onClose: () => void
  onOpenItem: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const ext = getExt(artifact.name)
  const isImage = artifact.mime?.startsWith('image/')
  const isPdf = artifact.mime === 'application/pdf'
  const url = api.items.artifactUrl(artifact.item_id, artifact.path)

  return (
    <div className="w-80 flex-shrink-0 border-l border-border-default bg-bg-secondary flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-default">
        <span className={`text-[8px] ${extToColor(artifact.name)}`}>●</span>
        <span className="text-xs text-text-primary truncate flex-1">{artifact.name}</span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm">✕</button>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto">
        <div className="p-3">
          {isImage && (
            <div className="rounded border border-border-default overflow-hidden bg-bg-tertiary mb-3">
              <img src={url} alt={artifact.name} className="w-full object-contain max-h-64" />
            </div>
          )}

          {isPdf && (
            <div className="rounded border border-border-default overflow-hidden mb-3">
              <embed src={url} type="application/pdf" className="w-full h-64" />
            </div>
          )}

          {artifact.is_text && !isImage && !isPdf && (
            <TextPreview url={url} />
          )}

          {!artifact.is_text && !isImage && !isPdf && (
            <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
              <span className="text-3xl">⎘</span>
              <span className="text-xs">Binary file ({ext.toUpperCase()})</span>
              <span className="text-[11px]">{formatSize(artifact.size)}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="border-t border-border-default px-3 py-2 space-y-1.5">
          <DetailRow label="Item">
            <button onClick={onOpenItem} className="text-accent-text hover:underline font-mono">
              {artifact.item_id}
            </button>
            <span className="text-text-muted ml-1 text-[10px] truncate">{artifact.item_title}</span>
          </DetailRow>
          <DetailRow label="Source">
            <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded">
              {artifact.source.replace('_', ' ')}
            </span>
          </DetailRow>
          {artifact.category && <DetailRow label="Category">{artifact.category}</DetailRow>}
          <DetailRow label="Size">{formatSize(artifact.size)}</DetailRow>
          <DetailRow label="Modified">{relativeTime(artifact.modified)}</DetailRow>
          {artifact.mime && <DetailRow label="MIME">{artifact.mime}</DetailRow>}
          <DetailRow label="Path">
            <span className="font-mono break-all">{artifact.path}</span>
          </DetailRow>
          {artifact.lines && <DetailRow label="Lines">{artifact.lines.toLocaleString()}</DetailRow>}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border-default">
        <a
          href={url}
          download={artifact.name}
          className="text-[11px] bg-bg-tertiary hover:bg-bg-hover px-2 py-1 rounded text-text-secondary transition-colors"
        >
          Download
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] bg-bg-tertiary hover:bg-bg-hover px-2 py-1 rounded text-text-secondary transition-colors"
        >
          Open
        </a>
        <div className="flex-1" />
        <button onClick={onPrev} className="text-[11px] text-text-muted hover:text-text-secondary px-1">Prev</button>
        <button onClick={onNext} className="text-[11px] text-text-muted hover:text-text-secondary px-1">Next</button>
      </div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      <span className="text-text-muted w-16 flex-shrink-0">{label}</span>
      <span className="text-text-secondary min-w-0">{children}</span>
    </div>
  )
}

function TextPreview({ url }: { url: string }) {
  const { data: text, isLoading } = useQuery({
    queryKey: ['artifact-text', url],
    queryFn: async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.text()
    },
  })

  if (isLoading) return <div className="text-[11px] text-text-muted py-2">Loading...</div>

  return (
    <pre className="text-[11px] font-mono text-text-secondary bg-bg-tertiary rounded border border-border-default p-2 overflow-x-auto max-h-64 mb-3 whitespace-pre-wrap break-words">
      {(text ?? '').slice(0, 5000)}
      {(text ?? '').length > 5000 && '\n\n... truncated'}
    </pre>
  )
}

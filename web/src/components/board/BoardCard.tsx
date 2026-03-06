import { useDraggable } from '@dnd-kit/core'
import { useUIStore } from '@/stores/ui'
import type { WorkItem } from '@/types'

interface Props {
  item: WorkItem
  isDragging?: boolean
}

const PRIORITY_INDICATORS: Record<string, { color: string; label: string }> = {
  critical: { color: 'bg-priority-critical', label: '●C' },
  high: { color: 'bg-priority-high', label: '●H' },
  medium: { color: 'bg-priority-medium', label: '●M' },
  low: { color: 'bg-priority-low', label: '●L' },
}

export function BoardCard({ item, isDragging }: Props) {
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  const priority = item.priority ? PRIORITY_INDICATORS[item.priority] : null
  const isAgent = item.assignee?.includes('agent') || item.assignee?.includes('bot')

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openDetailPanel(item.id)}
      className={`bg-bg-secondary border border-border-default rounded-md px-3 py-2 cursor-pointer transition-all hover:border-border-default hover:bg-bg-hover ${
        isDragging ? 'opacity-80 shadow-lg ring-1 ring-accent/50' : ''
      } ${isAgent ? 'border-l-2 border-l-agent' : ''}`}
    >
      {/* ID + Priority */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-text-muted text-[11px] font-mono">{item.id}</span>
        {priority && (
          <span className={`text-[10px] ${priority.color.replace('bg-', 'text-')}`}>
            {priority.label}
          </span>
        )}
        {item.due && (
          <span className="text-[10px] text-text-muted ml-auto">
            {item.due}
          </span>
        )}
      </div>

      {/* Title */}
      <div className="text-xs text-text-primary leading-snug">{item.title}</div>

      {/* Footer: tags + artifacts + assignee */}
      {(item.tags.length > 0 || item.assignee || item.artifact_count) && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-text-muted">+{item.tags.length - 3}</span>
          )}
          {item.artifact_count != null && item.artifact_count > 0 && (
            <span className="text-[10px] text-text-muted" title={`${item.artifact_count} artifact${item.artifact_count > 1 ? 's' : ''}`}>
              📎{item.artifact_count}
            </span>
          )}
          {item.assignee && (
            <span className={`text-[10px] ml-auto ${isAgent ? 'text-agent' : 'text-text-muted'}`}>
              {isAgent ? '🤖' : ''} {item.assignee}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

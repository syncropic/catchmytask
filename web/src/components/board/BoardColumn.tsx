import { useDroppable } from '@dnd-kit/core'
import { BoardCard } from './BoardCard'
import type { WorkItem, StateInfo } from '@/types'

interface Props {
  status: string
  items: WorkItem[]
  stateInfo: StateInfo
}

const STATUS_COLORS: Record<string, string> = {
  inbox: 'text-status-inbox',
  ready: 'text-status-ready',
  active: 'text-status-active',
  blocked: 'text-status-blocked',
  done: 'text-status-done',
  cancelled: 'text-status-cancelled',
}

export function BoardColumn({ status, items, stateInfo }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 flex flex-col rounded-lg transition-colors ${
        isOver ? 'bg-bg-hover' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]?.replace('text-', 'bg-') ?? 'bg-text-muted'}`} />
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {status}
        </span>
        <span className="text-xs text-text-muted">{items.length}</span>
        {stateInfo.terminal && (
          <span className="text-[10px] text-text-muted bg-bg-tertiary px-1 rounded">end</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 px-1">
        {items.map((item) => (
          <BoardCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <div className="text-text-muted text-xs text-center py-8 border border-dashed border-border-default rounded">
            No items
          </div>
        )}
      </div>
    </div>
  )
}

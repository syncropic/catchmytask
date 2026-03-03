import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import { BoardColumn } from './BoardColumn'
import { BoardCard } from './BoardCard'
import type { ProjectConfig, WorkItem } from '@/types'

interface Props {
  config: ProjectConfig | null
}

export function BoardView({ config }: Props) {
  const queryClient = useQueryClient()
  const currentProject = useProjectStore((s) => s.currentProject)
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null)

  const { data: items, isLoading } = useQuery({
    queryKey: ['items', currentProject],
    queryFn: () => api.items.list(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.items.changeStatus(id, { status, force: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const stateMachine = config?.state_machines?.default
  if (!stateMachine) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading...</div>
  }

  // Order states: initial first, then non-terminal, then terminal
  const stateEntries = Object.entries(stateMachine.states)
  const orderedStates = [
    ...stateEntries.filter(([, s]) => s.initial).map(([name]) => name),
    ...stateEntries.filter(([, s]) => !s.initial && !s.terminal).map(([name]) => name),
    ...stateEntries.filter(([, s]) => s.terminal).map(([name]) => name),
  ]

  // Group items by status
  const columns: Record<string, WorkItem[]> = {}
  for (const state of orderedStates) {
    columns[state] = []
  }
  for (const item of items ?? []) {
    if (columns[item.status]) {
      columns[item.status].push(item)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const item = items?.find((i) => i.id === event.active.id)
    setActiveItem(item ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const itemId = active.id as string
    const targetStatus = over.id as string

    const item = items?.find((i) => i.id === itemId)
    if (!item || item.status === targetStatus) return

    statusMutation.mutate({ id: itemId, status: targetStatus })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-muted">Loading items...</div>
  }

  if (!items || items.length === 0) {
    return <EmptyBoard />
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4 h-full overflow-x-auto">
        {orderedStates.map((state) => (
          <BoardColumn
            key={state}
            status={state}
            items={columns[state]}
            stateInfo={stateMachine.states[state]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && <BoardCard item={activeItem} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

function EmptyBoard() {
  const openCreateDrawer = useUIStore((s) => s.openCreateDrawer)

  return (
    <div className="flex flex-col items-center justify-center h-full text-text-muted gap-3">
      <div className="text-4xl">▦</div>
      <div>No work items yet</div>
      <button
        onClick={openCreateDrawer}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
      >
        Create first item
      </button>
    </div>
  )
}

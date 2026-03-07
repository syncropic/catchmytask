import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import type { ProjectConfig } from '@/types'

interface Props {
  config: ProjectConfig | null
}

export function CreateDrawer({ config }: Props) {
  const queryClient = useQueryClient()
  const closeCreateDrawer = useUIStore((s) => s.closeCreateDrawer)

  const [title, setTitle] = useState('')
  const [type, setType] = useState(config?.defaults.type ?? 'task')
  const [priority, setPriority] = useState(config?.defaults.priority ?? 'none')
  const [assignee, setAssignee] = useState('')
  const [tags, setTags] = useState('')
  const [due, setDue] = useState('')
  const [body, setBody] = useState('')

  const createMutation = useMutation({
    mutationFn: api.items.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      closeCreateDrawer()
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    createMutation.mutate({
      title: title.trim(),
      type: type || undefined,
      priority: priority || undefined,
      assignee: assignee || undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      due: due || undefined,
      body: body || undefined,
    })
  }

  return (
    <aside className="w-96 flex-shrink-0 bg-bg-secondary border-l border-border-default flex flex-col overflow-hidden" role="dialog" aria-label="Create new work item">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <h2 className="text-sm font-medium text-text-primary">New Work Item</h2>
        <button
          onClick={closeCreateDrawer}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          &#10005;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <FormField label="Title" required>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="task"
              className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
            />
          </FormField>

          <FormField label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
            >
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormField>
        </div>

        <FormField label="Assignee">
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Who is doing this?"
            className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
        </FormField>

        <FormField label="Tags">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags"
            className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
        </FormField>

        <FormField label="Due date">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the work..."
            rows={6}
            className="w-full bg-bg-tertiary border border-border-default rounded px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors resize-y"
          />
        </FormField>

        {createMutation.isError && (
          <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded">
            {(createMutation.error as Error).message}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={!title.trim() || createMutation.isPending}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium transition-colors"
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={closeCreateDrawer}
            className="text-text-muted hover:text-text-secondary px-4 py-1.5 rounded text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </aside>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1 block">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}

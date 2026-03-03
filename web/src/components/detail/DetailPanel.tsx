import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores/ui'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig } from '@/types'

interface Props {
  config?: ProjectConfig | null
}

export function DetailPanel({ config }: Props) {
  const queryClient = useQueryClient()
  const currentProject = useProjectStore((s) => s.currentProject)
  const selectedItemId = useUIStore((s) => s.selectedItemId)
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel)

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', currentProject, selectedItemId],
    queryFn: () => api.items.get(selectedItemId!),
    enabled: !!selectedItemId,
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.items.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', currentProject, selectedItemId] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      api.items.changeStatus(id, { status, reason, force: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item', currentProject, selectedItemId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.items.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      closeDetailPanel()
    },
  })

  if (!selectedItemId) return null

  const stateMachine = config?.state_machines?.default
  const states = stateMachine ? Object.keys(stateMachine.states) : []

  return (
    <aside className="w-96 flex-shrink-0 bg-bg-secondary border-l border-border-default flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <span className="font-mono text-xs text-text-muted">{selectedItemId}</span>
        <button
          onClick={closeDetailPanel}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          &#10005;
        </button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-text-muted text-xs">
          Loading...
        </div>
      )}

      {item && (
        <div className="flex-1 overflow-y-auto">
          {/* Editable title */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <EditableTitle
              value={item.title}
              onSave={(title) => editMutation.mutate({ id: item.id, data: { title } })}
            />
          </div>

          {/* Editable fields */}
          <div className="px-4 py-3 space-y-3 border-b border-border-subtle text-xs">
            <FieldRow label="Status">
              <select
                value={item.status}
                onChange={(e) => statusMutation.mutate({ id: item.id, status: e.target.value })}
                className="bg-bg-tertiary border border-border-default rounded px-2 py-0.5 text-xs text-text-secondary cursor-pointer hover:border-text-muted transition-colors outline-none"
              >
                {states.length > 0
                  ? states.map((s) => <option key={s} value={s}>{s}</option>)
                  : <option value={item.status}>{item.status}</option>
                }
              </select>
            </FieldRow>

            <FieldRow label="Priority">
              <select
                value={item.priority ?? 'none'}
                onChange={(e) => editMutation.mutate({ id: item.id, data: { priority: e.target.value } })}
                className="bg-bg-tertiary border border-border-default rounded px-2 py-0.5 text-xs text-text-secondary cursor-pointer hover:border-text-muted transition-colors outline-none"
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
                <option value="none">none</option>
              </select>
            </FieldRow>

            <FieldRow label="Type">
              <EditableText
                value={item.type ?? ''}
                placeholder="task"
                onSave={(val) => editMutation.mutate({ id: item.id, data: { type: val || 'task' } })}
              />
            </FieldRow>

            <FieldRow label="Assignee">
              <EditableText
                value={item.assignee ?? ''}
                placeholder="unassigned"
                onSave={(val) => editMutation.mutate({ id: item.id, data: { assignee: val } })}
              />
            </FieldRow>

            <FieldRow label="Due">
              <input
                type="date"
                value={item.due ?? ''}
                onChange={(e) => editMutation.mutate({ id: item.id, data: { due: e.target.value } })}
                className="bg-bg-tertiary border border-border-default rounded px-2 py-0.5 text-xs text-text-secondary cursor-pointer hover:border-text-muted transition-colors outline-none"
              />
            </FieldRow>

            <ReadonlyField label="Created" value={formatDate(item.created_at)} />
            {item.started_at && <ReadonlyField label="Started" value={formatDate(item.started_at)} />}
            {item.completed_at && <ReadonlyField label="Completed" value={formatDate(item.completed_at)} />}
            {item.blocked_reason && <ReadonlyField label="Blocked" value={item.blocked_reason} />}

            {/* Tags */}
            <EditableTags
              tags={item.tags ?? []}
              onAdd={(tag) => editMutation.mutate({ id: item.id, data: { add_tags: [tag] } })}
              onRemove={(tag) => editMutation.mutate({ id: item.id, data: { remove_tags: [tag] } })}
            />

            {/* Dependencies */}
            {(item.depends_on ?? []).length > 0 && (
              <FieldRow label="Depends on">
                <div className="flex flex-wrap gap-1">
                  {item.depends_on.map((dep) => (
                    <span key={dep} className="text-[10px] font-mono bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary">
                      {dep}
                    </span>
                  ))}
                </div>
              </FieldRow>
            )}

            {item.parent && <ReadonlyField label="Parent" value={item.parent} />}
          </div>

          {/* Editable body */}
          <EditableBody
            value={item.body ?? ''}
            onSave={(body) => editMutation.mutate({ id: item.id, data: { body } })}
          />

          {/* Mutation status */}
          {(editMutation.isError || statusMutation.isError) && (
            <div className="px-4 py-2 text-xs text-red-400 bg-red-400/10">
              {(editMutation.error as Error)?.message || (statusMutation.error as Error)?.message}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-t border-border-subtle">
            <button
              onClick={() => {
                if (confirm(`Delete ${item.id}?`)) {
                  deleteMutation.mutate(item.id)
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Delete item
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

// ── Editable components ──────────────────────────────────────────────────────

function EditableTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
  }

  if (!editing) {
    return (
      <h2
        onClick={() => setEditing(true)}
        className="text-sm font-medium text-text-primary cursor-pointer hover:bg-bg-hover rounded px-1 -mx-1 py-0.5 transition-colors"
        title="Click to edit"
      >
        {value}
      </h2>
    )
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      }}
      className="w-full text-sm font-medium text-text-primary bg-bg-tertiary border border-blue-500 rounded px-1 -mx-1 py-0.5 outline-none"
    />
  )
}

function EditableText({
  value,
  placeholder,
  onSave,
}: {
  value: string
  placeholder: string
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="text-text-secondary cursor-pointer hover:bg-bg-hover rounded px-1 py-0.5 -mx-1 transition-colors"
        title="Click to edit"
      >
        {value || <span className="text-text-muted">{placeholder}</span>}
      </span>
    )
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      }}
      placeholder={placeholder}
      className="bg-bg-tertiary border border-blue-500 rounded px-1 py-0.5 text-xs text-text-primary outline-none w-full"
    />
  )
}

function EditableTags({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed) onAdd(trimmed)
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="flex items-start gap-3">
      <span className="w-20 flex-shrink-0 text-text-muted">Tags</span>
      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary inline-flex items-center gap-1 group"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove tag"
            >
              &#10005;
            </button>
          </span>
        ))}
        {adding ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { if (draft.trim()) commit(); else setAdding(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setDraft(''); setAdding(false) }
            }}
            placeholder="tag name"
            className="bg-bg-tertiary border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-text-primary outline-none w-20"
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-[10px] text-text-muted hover:text-text-secondary bg-bg-tertiary px-1.5 py-0.5 rounded border border-dashed border-border-default hover:border-text-muted transition-colors"
          >
            + add
          </button>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markdownComponents: Record<string, React.ComponentType<any>> = {
  h1: ({ children }) => <h2 className="text-[13px] font-semibold text-text-primary mt-3 mb-1.5 first:mt-0">{children}</h2>,
  h2: ({ children }) => <h3 className="text-xs font-semibold text-text-primary mt-2.5 mb-1 first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="text-xs font-medium text-text-primary mt-2 mb-1 first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="text-xs leading-[1.65] text-text-secondary my-1.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="text-xs text-text-secondary my-1.5 pl-4 space-y-0.5 list-disc marker:text-text-muted/60">{children}</ul>,
  ol: ({ children }) => <ol className="text-xs text-text-secondary my-1.5 pl-4 space-y-0.5 list-decimal marker:text-text-muted/60">{children}</ol>,
  li: ({ children, ...props }) => {
    // GFM task list items get a className containing "task-list-item"
    const isTask = typeof props.className === 'string' && props.className.includes('task-list-item')
    return (
      <li className={`leading-[1.65] ${isTask ? 'list-none -ml-4 flex items-start gap-1.5' : ''}`}>
        {children}
      </li>
    )
  },
  input: ({ checked }) => (
    <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border flex-shrink-0 mt-[3px] ${checked ? 'bg-blue-500 border-blue-500' : 'border-text-muted/40 bg-transparent'}`}>
      {checked && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>
  ),
  code: ({ children, className }) => {
    const isBlock = typeof className === 'string' && className.startsWith('language-')
    if (isBlock) {
      return <code className="text-[11px] font-mono leading-[1.6] text-text-secondary">{children}</code>
    }
    return <code className="text-[11px] font-mono bg-bg-tertiary/80 text-text-primary px-1 py-[1px] rounded">{children}</code>
  },
  pre: ({ children }) => (
    <pre className="text-[11px] bg-bg-tertiary rounded-md border border-border-subtle px-3 py-2 my-2 overflow-x-auto">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a href={href} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300/50 transition-colors">{children}</a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-text-muted/25 pl-3 my-2 text-text-muted italic [&>p]:text-text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="border-none h-px bg-border-subtle my-3" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 rounded-md border border-border-subtle">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-bg-tertiary">{children}</thead>,
  th: ({ children }) => <th className="text-left text-[11px] font-medium text-text-primary px-2.5 py-1.5 border-b border-border-subtle">{children}</th>,
  td: ({ children }) => <td className="text-text-secondary px-2.5 py-1.5 border-b border-border-subtle/50">{children}</td>,
  strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic text-text-secondary">{children}</em>,
  del: ({ children }) => <del className="text-text-muted line-through">{children}</del>,
}

function EditableBody({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editing])

  function commit() {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
          Description
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
          >
            edit
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            }}
            className="w-full bg-bg-tertiary border border-blue-500 rounded px-2 py-1.5 text-xs text-text-primary outline-none resize-y min-h-[80px] font-sans leading-relaxed"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={commit}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setDraft(value); setEditing(false) }}
              className="text-text-muted hover:text-text-secondary px-3 py-1 rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="prose-detail cursor-pointer hover:bg-bg-hover/50 rounded-md p-2 -mx-2 transition-colors min-h-[24px]"
          title="Click to edit"
        >
          {value ? (
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {value}
            </Markdown>
          ) : (
            <span className="text-xs text-text-muted italic">No description. Click to add.</span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Layout helpers ───────────────────────────────────────────────────────────

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-text-muted">{label}</span>
      {children}
    </div>
  )
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 flex-shrink-0 text-text-muted">{label}</span>
      <span className="text-text-secondary">{value}</span>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

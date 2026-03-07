import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { parseCommand, COMMANDS } from '@/lib/command-parser'
import { executeCommand, type CommandOutput, type CommandContext } from '@/lib/command-executor'
import { useUIStore } from '@/stores/ui'
import { CommandOutputView } from './CommandOutput'

const HISTORY_KEY = 'cmt-command-history'
const MAX_HISTORY = 200

export function TerminalView() {
  const [input, setInput] = useState('')
  const [outputs, setOutputs] = useState<{ id: number; input: string; output: CommandOutput }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [running, setRunning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)
  const queryClient = useQueryClient()

  const selectedItem = useUIStore((s) => s.selectedItemId)
  const openDetailPanel = useUIStore((s) => s.openDetailPanel)

  const getHistory = useCallback((): string[] => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
    } catch {
      return []
    }
  }, [])

  const addToHistory = useCallback((cmd: string) => {
    const history = getHistory()
    const updated = [cmd, ...history.filter(h => h !== cmd)].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }, [getHistory])

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [outputs])

  const suggestions = useMemo(() => {
    if (!input.trim()) return []
    const cleaned = input.replace(/^cmt\s+/, '').trim()
    const parts = cleaned.split(/\s+/)
    if (parts.length === 1) {
      const matches = COMMANDS.filter(c => c.startsWith(parts[0].toLowerCase()))
      return matches.length > 0 && matches[0] !== parts[0].toLowerCase() ? [...matches] : []
    }
    return []
  }, [input])

  const insertCommand = useCallback((cmd: string) => {
    setInput(cmd)
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    // Handle bare number or !N as history recall
    const historyNum = trimmed.match(/^!?(\d+)$/)
    if (historyNum) {
      const history = getHistory()
      const idx = parseInt(historyNum[1], 10) - 1
      if (idx >= 0 && idx < history.length) {
        setInput(history[idx])
      } else {
        setOutputs(prev => [...prev, {
          id: idCounter.current++,
          input: trimmed,
          output: { type: 'error' as const, message: `History entry ${historyNum[1]} not found. History has ${history.length} entries.` },
        }])
        setInput('')
      }
      return
    }

    const parsed = parseCommand(trimmed)
    if (!parsed) return

    addToHistory(trimmed)
    setInput('')
    setHistoryIndex(-1)
    setSelectedSuggestion(0)

    const ctx: CommandContext = {
      selectedItem,
      onNavigate: (id: string) => {
        openDetailPanel(id)
      },
      getHistory,
    }

    setRunning(true)
    try {
      const output = await executeCommand(parsed, ctx)

      if (output.type === 'clear') {
        setOutputs([])
        return
      }
      if (output.type === 'recall') {
        setInput(output.command)
        inputRef.current?.focus()
        return
      }

      setOutputs(prev => [...prev, { id: idCounter.current++, input: trimmed, output }])

      if (['item-created', 'status-changed', 'item-deleted'].includes(output.type)) {
        queryClient.invalidateQueries({ queryKey: ['items'] })
      }
    } finally {
      setRunning(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        const cleaned = input.replace(/^cmt\s+/, '').trim()
        const parts = cleaned.split(/\s+/)
        parts[parts.length - 1] = suggestions[selectedSuggestion]
        const prefix = input.startsWith('cmt ') ? 'cmt ' : ''
        setInput(prefix + parts.join(' ') + ' ')
        setSelectedSuggestion(0)
        return
      }
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.max(0, prev - 1))
        return
      }
      const history = getHistory()
      if (historyIndex < history.length - 1) {
        const newIdx = historyIndex + 1
        setHistoryIndex(newIdx)
        setInput(history[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (suggestions.length > 0) {
        setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1))
        return
      }
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1
        setHistoryIndex(newIdx)
        setInput(getHistory()[newIdx])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (suggestions.length > 0) {
        const cleaned = input.replace(/^cmt\s+/, '').trim()
        const parts = cleaned.split(/\s+/)
        parts[parts.length - 1] = suggestions[selectedSuggestion]
        const prefix = input.startsWith('cmt ') ? 'cmt ' : ''
        setInput(prefix + parts.join(' ') + ' ')
        setSelectedSuggestion(0)
      }
    } else if (e.key === 'Escape') {
      if (suggestions.length > 0) {
        setInput('')
        setSelectedSuggestion(0)
      } else if (input) {
        setInput('')
      }
    }
  }

  const contextHint = selectedItem && !input.includes(selectedItem)
    ? `(${selectedItem})`
    : null

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-default">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">Terminal</span>
          <span className="text-[10px] text-text-muted font-mono">cmt</span>
        </div>
        <div className="flex items-center gap-2">
          {outputs.length > 0 && (
            <button
              onClick={() => setOutputs([])}
              className="text-[10px] text-text-muted hover:text-text-secondary px-1.5 py-0.5 rounded hover:bg-bg-tertiary"
            >
              clear
            </button>
          )}
          <kbd className="text-[9px] text-text-muted bg-bg-tertiary border border-border-subtle rounded px-1 py-0.5">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}J
          </kbd>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-auto px-4 py-3 space-y-3 min-h-0"
        onClick={() => inputRef.current?.focus()}
      >
        {outputs.length === 0 && (
          <div className="text-text-muted/40 text-xs font-mono space-y-1 pt-4">
            <div>Welcome to CatchMyTask terminal.</div>
            <div>Type <span className="text-text-muted">help</span> for available commands.</div>
          </div>
        )}
        {outputs.map((entry) => (
          <div key={entry.id}>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted mb-1">
              <span className="text-accent-text">{'>'}</span>
              <span>{entry.input}</span>
            </div>
            <CommandOutputView output={entry.output} onHistorySelect={insertCommand} />
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="relative border-t border-border-default px-4 py-2">
        <div className="flex items-center gap-2">
          {running
            ? <span className="text-accent-text text-sm font-mono flex-shrink-0 animate-pulse">...</span>
            : <span className="text-accent-text text-sm font-mono flex-shrink-0">{'>'}</span>
          }
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setHistoryIndex(-1) }}
            onKeyDown={handleKeyDown}
            placeholder={contextHint ? `Type a command... ${contextHint}` : 'Type a command...'}
            className="flex-1 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-muted/50 outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-full left-8 mb-1 bg-bg-secondary border border-border-default rounded shadow-lg py-1 min-w-[180px] z-50">
            {suggestions.map((s, i) => (
              <div
                key={s}
                className={`px-3 py-1.5 text-sm font-mono cursor-pointer ${i === selectedSuggestion ? 'bg-accent/20 text-accent-text' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                onClick={() => {
                  const cleaned = input.replace(/^cmt\s+/, '').trim()
                  const parts = cleaned.split(/\s+/)
                  parts[parts.length - 1] = s
                  const prefix = input.startsWith('cmt ') ? 'cmt ' : ''
                  setInput(prefix + parts.join(' ') + ' ')
                  setSelectedSuggestion(0)
                  inputRef.current?.focus()
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { create } from 'zustand'

interface ConnectionState {
  mode: 'local' | 'remote'
  remoteUrl: string
  setMode: (mode: 'local' | 'remote') => void
  setRemoteUrl: (url: string) => void
}

// Persist to localStorage
const STORAGE_KEY = 'catchmytask-connection'

function loadPersistedState(): { mode: 'local' | 'remote'; remoteUrl: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        mode: parsed.mode === 'remote' ? 'remote' : 'local',
        remoteUrl: parsed.remoteUrl ?? '',
      }
    }
  } catch {
    // ignore
  }
  // Default to local mode for standalone browser use
  return { mode: 'local', remoteUrl: '' }
}

// Auto-detect if served by cmt serve backend.
// Returns a promise that resolves when detection is complete.
let _detectPromise: Promise<void> | null = null

export function detectBackend(): Promise<void> {
  if (_detectPromise) return _detectPromise
  _detectPromise = (async () => {
    // If user already explicitly chose a mode, respect it
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return

    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'ok' && data.version) {
          // Backend detected on first visit — auto-connect
          useConnectionStore.getState().setMode('remote')
          useConnectionStore.getState().setRemoteUrl('')
        }
      }
    } catch {
      // No backend available, stay in local mode
    }
  })()
  return _detectPromise
}

function persist(state: { mode: string; remoteUrl: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const initial = loadPersistedState()

export const useConnectionStore = create<ConnectionState>((set) => ({
  mode: initial.mode,
  remoteUrl: initial.remoteUrl,
  setMode: (mode) => {
    set({ mode })
    const state = useConnectionStore.getState()
    persist({ mode, remoteUrl: state.remoteUrl })
  },
  setRemoteUrl: (remoteUrl) => {
    set({ remoteUrl })
    const state = useConnectionStore.getState()
    persist({ mode: state.mode, remoteUrl })
  },
}))

// Start backend detection immediately on module load
detectBackend()

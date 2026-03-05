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

const LOCALHOST_URL = 'http://127.0.0.1:3170'

async function probeHealth(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(2000) })
    if (res.ok) {
      const data = await res.json()
      return data.status === 'ok' && !!data.version
    }
  } catch {
    // Not available
  }
  return false
}

export function detectBackend(): Promise<void> {
  if (_detectPromise) return _detectPromise
  _detectPromise = (async () => {
    // If user already explicitly chose a mode, respect it
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return

    // 1. Try same-origin (works when served by cmt serve)
    if (await probeHealth('')) {
      useConnectionStore.getState().setMode('remote')
      useConnectionStore.getState().setRemoteUrl('')
      return
    }

    // 2. Try localhost:3170 (works from catchmytask.com or any other origin)
    //    Browsers allow HTTPS → HTTP localhost requests (W3C mixed content exception)
    if (await probeHealth(LOCALHOST_URL)) {
      useConnectionStore.getState().setMode('remote')
      useConnectionStore.getState().setRemoteUrl(LOCALHOST_URL)
      return
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

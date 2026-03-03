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

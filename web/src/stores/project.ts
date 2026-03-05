import { create } from 'zustand'

const STORAGE_KEY = 'catchmytask-project'

interface ProjectState {
  currentProject: string | null
  setCurrentProject: (name: string | null) => void
}

function loadProject(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || null
  } catch {
    return null
  }
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: loadProject(),
  setCurrentProject: (name) => {
    set({ currentProject: name })
    try {
      if (name) localStorage.setItem(STORAGE_KEY, name)
      else localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  },
}))

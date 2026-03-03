import { create } from 'zustand'

interface ProjectState {
  currentProject: string | null
  setCurrentProject: (name: string | null) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  setCurrentProject: (name) => set({ currentProject: name }),
}))

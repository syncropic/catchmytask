import { create } from 'zustand'

type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  /** Resolved theme (always 'light' or 'dark') */
  resolved: 'light' | 'dark'
  toggle: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(resolved: 'light' | 'dark') {
  const el = document.documentElement
  el.classList.toggle('dark', resolved === 'dark')
}

const stored = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('cmt-theme') as ThemeMode | null
  : null) ?? 'dark'

const initialResolved = resolve(stored)
// Apply immediately to avoid FOUC
if (typeof document !== 'undefined') applyTheme(initialResolved)

export const useThemeStore = create<ThemeState>((set) => ({
  mode: stored,
  resolved: initialResolved,

  setMode: (mode) => {
    const resolved = resolve(mode)
    localStorage.setItem('cmt-theme', mode)
    applyTheme(resolved)
    set({ mode, resolved })
  },

  toggle: () => {
    set((s) => {
      const next: ThemeMode = s.resolved === 'dark' ? 'light' : 'dark'
      const resolved = resolve(next)
      localStorage.setItem('cmt-theme', next)
      applyTheme(resolved)
      return { mode: next, resolved }
    })
  },
}))

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.mode === 'system') {
      const resolved = getSystemTheme()
      applyTheme(resolved)
      useThemeStore.setState({ resolved })
    }
  })
}

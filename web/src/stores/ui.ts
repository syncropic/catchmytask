import { create } from 'zustand'
import type { View } from '@/types'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void

  activeView: View
  setActiveView: (view: View) => void

  selectedItemId: string | null
  setSelectedItemId: (id: string | null) => void

  detailPanelOpen: boolean
  openDetailPanel: (id: string) => void
  closeDetailPanel: () => void

  createDrawerOpen: boolean
  openCreateDrawer: () => void
  closeCreateDrawer: () => void

  commandPaletteOpen: boolean
  toggleCommandPalette: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  activeView: 'board',
  setActiveView: (view) => set({ activeView: view }),

  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),

  detailPanelOpen: false,
  openDetailPanel: (id) => set({ selectedItemId: id, detailPanelOpen: true, createDrawerOpen: false }),
  closeDetailPanel: () => set({ detailPanelOpen: false, selectedItemId: null }),

  createDrawerOpen: false,
  openCreateDrawer: () => set({ createDrawerOpen: true, detailPanelOpen: false, selectedItemId: null }),
  closeCreateDrawer: () => set({ createDrawerOpen: false }),

  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
}))

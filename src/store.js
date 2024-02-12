import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set) => ({
      deck1Track: null,
      deck2Track: null,
      setDeck1Track: (track) => set((state) => ({ deck1Track: track })),
      setDeck2Track: (track) => set((state) => ({ deck2Track: track })),
      actionType: null,
      setActionType: (actionType) => set((state) => ({ actionType })),
      activeItem: null,
      setActiveItem: (activeItem) => set((state) => ({ activeItem })),
      activeActionOption: null,
      setActiveActionOption: (activeActionOption) =>
        set((state) => ({ activeActionOption })),
      opened: false,
      setOpened: (opened) => set((state) => ({ opened })),
      activeItem_2: null,
      setActiveItem_2: (activeItem_2) => set((state) => ({ activeItem_2 })),
      syncFiles: [],
      setSyncFiles: (syncFiles) => set((state) => ({ syncFiles })),
      text: "",
      dynamicSections: [], // { id, type, value, position }
      setText: (text) => set((state) => ({ ...state, text })),
      setDynamicSections: (sections) =>
        set((state) => ({ ...state, dynamicSections: sections })),
      selectedColumnType: "textinput", // default value
      setSelectedColumnType: (type) => set({ selectedColumnType: type }),
      selectedColumns: [], // { id, type, value, position }
      setSelectedColumns: (columns) =>
        set((state) => ({ ...state, selectedColumns: columns })),
      activeViews: [],
      setActiveViews: (view) =>
        set((state) => ({ ...state, activeViews: view })),
      activeViewStats: {},
      setActiveViewStats: (stats) =>
        set((state) => ({ ...state, activeViewStats: stats })),
    }),
    {
      name: "catchmytask-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAppStore };

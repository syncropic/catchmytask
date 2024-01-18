import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAppStore = create(
  persist(
    (set) => ({
      deck1Track: null,
      deck2Track: null,
      setDeck1Track: (track) => set((state) => ({ deck1Track: track })),
      setDeck2Track: (track) => set((state) => ({ deck2Track: track })),
    }),
    {
      name: "catchmytask-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAppStore };

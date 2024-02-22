import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Dexie from "dexie";

export const localStore = new Dexie("CacthmyvibeDB");

localStore.version(1).stores({
  fileMetadata:
    "++id, fileId, name, size, type, last_modified, title, artist, artists, album, genre, bpm, key, label, duration, comment, track, codec, codec_profile, container, sample_rate, bit_rate, channels, lossless, number_of_channels, tag_types, tool, track_info, track_peak_level",
  audioFiles: "++id, fileId, file, name",
  coverImages: "++id, fileId, image, format",
});

// export const excludeNonSerializable = (config) => (set, get, api) =>
//   config((nextSet) => {
//     return (partial, replace) => {
//       const nextState =
//         typeof partial === 'function' ? partial(get()) : partial;
//       // Exclude the non-serializable parts here, for example:
//       const { wavesurfer, ...serializable } = nextState;
//       nextSet(serializable, replace);
//     };
//   }, get, api);

export const useInstanceStore = create((set) => ({
  wavesurfer: null,
  setWavesurfer: (wsInstance) => set({ wavesurfer: wsInstance }),
  clearWavesurfer: () => set({ wavesurfer: null }),
  wavesurferMultiTrackInstance: null,
  setWavesurferMultiTrackInstance: (wsInstance) =>
    set({ wavesurferMultiTrackInstance: wsInstance }),
  clearWavesurferMultiTrackInstance: () =>
    set({ wavesurferMultiTrackInstance: null }),
}));

const useAppStore = create(
  persist(
    (set) => ({
      deck1Track: null,
      deck2Track: null,
      setDeck1Track: (track) => set((state) => ({ deck1Track: track })),
      setDeck2Track: (track) => set((state) => ({ deck2Track: track })),
      audioUrl: null,
      isPlaying: false,
      setAudioUrl: (url) => set({ audioUrl: url }),
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      channels: [
        {
          id: "channel_1",
          tracks: [{ id: "track_1", position: 0, audio_url: "audio_url" }],
        },
        {
          id: "channel_2",
          tracks: [{ id: "track_2", position: 0, audio_url: "audio_url_2" }],
        },
      ],
      actionType: null,
      setActionType: (actionType) => set((state) => ({ actionType })),
      activeItem: null,
      setActiveItem: (activeItem) => set((state) => ({ activeItem })),
      activeRecord: null,
      setActiveRecord: (activeRecord) => set((state) => ({ activeRecord })),
      activeActionOption: null,
      setActiveActionOption: (activeActionOption) =>
        set((state) => ({ activeActionOption })),
      activeDataModel: null,
      setActiveDataModel: (activeDataModel) =>
        set((state) => ({ activeDataModel })),
      activeRequestData: null,
      setActiveRequestData: (activeRequestData) =>
        set((state) => ({ activeRequestData })),
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

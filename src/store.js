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
      timeline: {
        currentTime: 0,
        duration: 60, // Let's assume a duration of 60 seconds for demonstration
        isPlaying: false,
      },
      setTimeline: (timeline) => set({ timeline }),
      setCurrentTime: (currentTime) =>
        set((state) => ({ timeline: { ...state.timeline, currentTime } })),
      toggleTimelinePlayPause: () =>
        set((state) => ({
          timeline: { ...state.timeline, isPlaying: !state.timeline.isPlaying },
        })),
      channel1: null,
      setChannel1: (channel) => set((state) => ({ channel1: channel })),
      channel2: null,
      setChannel2: (channel) => set((state) => ({ channel2: channel })),
      actionType: null,
      setActionType: (actionType) => set((state) => ({ actionType })),
      activeItem: null,
      setActiveItem: (activeItem) => set((state) => ({ activeItem })),
      activeLayout: {
        leftSection: {
          isDisplayed: true,
        },
        centerSection: {
          isDisplayed: true,
        },
        rightSection: {
          isDisplayed: true,
        },
      },
      setActiveLayout: (activeLayout) => set((state) => ({ activeLayout })),
      activeQuery: null,
      setActiveQuery: (activeQuery) => set((state) => ({ activeQuery })),
      activeQueryResults: null,
      setActiveQueryResults: (activeQueryResults) =>
        set((state) => ({ activeQueryResults })),
      activeRecord: null,
      setActiveRecord: (activeRecord) => set((state) => ({ activeRecord })),
      activeActionOption: null,
      setActiveActionOption: (activeActionOption) =>
        set((state) => ({ activeActionOption })),
      activeDataModel: null,
      setActiveDataModel: (activeDataModel) =>
        set((state) => ({ activeDataModel })),
      activeFile: null,
      setActiveFile: (activeFile) => set((state) => ({ activeFile })),
      activeRequestData: null,
      setActiveRequestData: (activeRequestData) =>
        set((state) => ({ activeRequestData })),
      opened: false,
      setOpened: (opened) => set((state) => ({ opened })),
      activeItem_2: null,
      setActiveItem_2: (activeItem_2) => set((state) => ({ activeItem_2 })),
      activeItem_3: null,
      setActiveItem_3: (activeItem_3) => set((state) => ({ activeItem_3 })),
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
      activeSessions: [],
      setActiveSessions: (view) =>
        set((state) => ({ ...state, activeSessions: view })),
      activeSessionStats: {},
      setActiveSessionStats: (stats) =>
        set((state) => ({ ...state, activeSessionStats: stats })),
      activeSession: {},
      setActiveSession: (session) =>
        set((state) => ({ ...state, activeSession: session })),
      activeColumnOptions: [],
      setActiveColumnOptions: (view) =>
        set((state) => ({ ...state, activeColumnOptions: view })),
    }),
    {
      name: "catchmytask-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAppStore };

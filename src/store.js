// src/store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// export const useInstanceStore = create((set) => ({
//   wavesurfer: null,
//   setWavesurfer: (wsInstance) => set({ wavesurfer: wsInstance }),
//   clearWavesurfer: () => set({ wavesurfer: null }),
//   wavesurferMultiTrackInstance: null,
//   setWavesurferMultiTrackInstance: (wsInstance) =>
//     set({ wavesurferMultiTrackInstance: wsInstance }),
//   clearWavesurferMultiTrackInstance: () =>
//     set({ wavesurferMultiTrackInstance: null }),
// }));

const useAppStore = create(
  persist(
    (set) => ({
      // deck1Track: null,
      // deck2Track: null,
      // setDeck1Track: (track) => set((state) => ({ deck1Track: track })),
      // setDeck2Track: (track) => set((state) => ({ deck2Track: track })),
      // audioUrl: null,
      // isPlaying: false,
      // setAudioUrl: (url) => set({ audioUrl: url }),
      // togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      // timeline: {
      //   currentTime: 0,
      //   duration: 60,
      //   isPlaying: false,
      // },
      // setTimeline: (timeline) => set({ timeline }),
      // setCurrentTime: (currentTime) =>
      //   set((state) => ({ timeline: { ...state.timeline, currentTime } })),
      // toggleTimelinePlayPause: () =>
      //   set((state) => ({
      //     timeline: { ...state.timeline, isPlaying: !state.timeline.isPlaying },
      //   })),
      // channel1: null,
      // setChannel1: (channel) => set((state) => ({ channel1: channel })),
      // channel2: null,
      // setChannel2: (channel) => set((state) => ({ channel2: channel })),
      // timeChannel: null,
      // setTimeChannel: (channel) => set((state) => ({ timeChannel: channel })),
      // actionType: null,
      // setActionType: (actionType) => set((state) => ({ actionType })),
      // activeItem: null,
      // setActiveItem: (activeItem) => set((state) => ({ activeItem })),
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
        searchSession: {
          isDisplayed: true,
        },
        searchInput: {
          isDisplayed: true,
        },
        quickActionsBar: {
          isDisplayed: true,
        },
        mobileStateView: {
          isDisplayed: false,
        },
        mobileCustomComponents: {
          isDisplayed: false,
        },
      },
      setActiveLayout: (activeLayout) => set((state) => ({ activeLayout })),
      activeSections: {
        query: {
          isPinned: true,
        },
        action_input: {
          isPinned: true,
        },
        action_plan: {
          isPinned: false,
        },
      },
      setActiveSections: (activeSections) =>
        set((state) => ({ activeSections })),
      colorScheme: {
        scheme: "auto",
      },
      setColorScheme: (colorScheme) => set((state) => ({ colorScheme })),
      // activeQuery: null,
      // setActiveQuery: (activeQuery) => set((state) => ({ activeQuery })),
      // activeQueryResults: null,
      // setActiveQueryResults: (activeQueryResults) =>
      //   set((state) => ({ activeQueryResults })),
      // activeQueryGraph: null,
      // setActiveQueryGraph: (activeQueryGraph) =>
      //   set((state) => ({ activeQueryGraph })),
      // touchedFields: [],
      // setTouchedFields: (touchedFields) =>
      //   set((state) => ({ touchedFields })),
      // activeStructuredQuery: null,
      // setActiveStructuredQuery: (activeStructuredQuery) =>
      //   set((state) => ({ activeStructuredQuery })),
      activeRecord: null,
      setActiveRecord: (activeRecord) => set((state) => ({ activeRecord })),
      // activeActionOption: null,
      // setActiveActionOption: (activeActionOption) =>
      //   set((state) => ({ activeActionOption })),
      // activeActionId: null,
      // setActiveActionId: (activeActionId) =>
      //   set((state) => ({ activeActionId })),
      // activeResultsSection: null,
      // setActiveResultsSection: (activeResultsSection) =>
      //   set((state) => ({ activeResultsSection })),
      // activeActionSelectionComponent: null,
      // setActiveActionSelectionComponent: (activeActionSelectionComponent) =>
      //   set((state) => ({ activeActionSelectionComponent })),
      activeMouseCoordinates: {
        x: 0,
        y: 0,
      },
      setActiveMouseCoordinates: (activeMouseCoordinates) =>
        set((state) => ({ activeMouseCoordinates })),
      // activeSessionId: null,
      // setActiveSessionId: (activeSessionId) =>
      //   set((state) => ({ activeSessionId })),
      // activeAction: null,
      // setActiveAction: (activeAction) => set((state) => ({ activeAction })),
      // isActionsSelectionOpen: false,
      // setIsActionsSelectionOpen: (isActionsSelectionOpen) =>
      //   set((state) => ({ isActionsSelectionOpen })),
      // isFloatingWindowOpen: false,
      // setIsFloatingWindowOpen: (isFloatingWindowOpen) =>
      //   set((state) => ({ isFloatingWindowOpen })),
      // activeFloatingWindow: null,
      // setActiveFloatingWindow: (activeFloatingWindow) =>
      //   set((state) => ({ activeFloatingWindow })),
      // activeDataset: null,
      // setActiveDataset: (activeDataset) => set((state) => ({ activeDataset })),
      // activeActionView: null,
      // setActiveActionView: (activeActionView) =>
      //   set((state) => ({ activeActionView })),
      // queryAction: null,
      // setQueryAction: (queryAction) => set((state) => ({ queryAction })),
      // activeDataModel: null,
      // setActiveDataModel: (activeDataModel) =>
      //   set((state) => ({ activeDataModel })),
      // activeFile: null,
      // setActiveFile: (activeFile) => set((state) => ({ activeFile })),
      // activeRequestData: null,
      // setActiveRequestData: (activeRequestData) =>
      //   set((state) => ({ activeRequestData })),
      // opened: false,
      // setOpened: (opened) => set((state) => ({ opened })),
      // activeItem_2: null,
      // setActiveItem_2: (activeItem_2) => set((state) => ({ activeItem_2 })),
      // activeItem_3: null,
      // setActiveItem_3: (activeItem_3) => set((state) => ({ activeItem_3 })),
      // syncFiles: [],
      // setSyncFiles: (syncFiles) => set((state) => ({ syncFiles })),
      // text: "",
      // dynamicSections: [], // { id, type, value, position }
      // setText: (text) => set((state) => ({ ...state, text })),
      // setDynamicSections: (sections) =>
      //   set((state) => ({ ...state, dynamicSections: sections })),
      // selectedColumnType: "textinput", // default value
      // setSelectedColumnType: (type) => set({ selectedColumnType: type }),
      // selectedColumns: [], // { id, type, value, position }
      // setSelectedColumns: (columns) =>
      //   set((state) => ({ ...state, selectedColumns: columns })),
      // activeViews: [],
      // setActiveViews: (view) =>
      //   set((state) => ({ ...state, activeViews: view })),
      // activeViewStats: {},
      // setActiveViewStats: (stats) =>
      //   set((state) => ({ ...state, activeViewStats: stats })),
      // activeSessions: [],
      // setActiveSessions: (view) =>
      //   set((state) => ({ ...state, activeSessions: view })),
      // activeSessionStats: {},
      // setActiveSessionStats: (stats) =>
      //   set((state) => ({ ...state, activeSessionStats: stats })),
      activeSession: null,
      setActiveSession: (session) =>
        set((state) => ({ ...state, activeSession: session })),
      activeTask: null,
      setActiveTask: (task) => set((state) => ({ ...state, activeTask: task })),
      activeActionStep: null,
      setActiveActionStep: (actionStep) =>
        set((state) => ({ ...state, activeActionStep: actionStep })),
      // activeActionActiveView: {},
      // setActiveActionActiveView: (view) =>
      //   set((state) => ({ ...state, activeActionActiveView: view })),
      // activeField: {},
      // setActiveField: (field) =>
      //   set((state) => ({ ...state, activeField: field })),
      // focusedFields: {},
      // setFocusedFields: (fields) =>
      //   set((state) => ({ ...state, focusedFields: fields })),
      // selectedItems: {},
      // setSelectedItems: (items) =>
      //   set((state) => ({ ...state, selectedItems: items })),
      // analytics: {},
      // setAnalytics: (analytics) => set((state) => ({ analytics })),
      // activeDataset: {},
      // setActiveDataset: (dataset) =>
      //   set((state) => ({ ...state, activeDataset: dataset })),
      activeApplication: null,
      setActiveApplication: (application) =>
        set((state) => ({ ...state, activeApplication: application })),
      // activeViewItem: {},
      // setActiveViewItem: (view_item) =>
      //   set((state) => ({ ...state, activeViewItem: view_item })),
      // activeColumnOptions: [],
      // setActiveColumnOptions: (view) =>
      //   set((state) => ({ ...state, activeColumnOptions: view })),
      // natural_language_query_form_values: {},
      // setNaturalLanguageQueryFormValues: (values) =>
      //   set((state) => ({
      //     ...state,
      //     natural_language_query_form_values: values,
      //   })),
      action_input_form_values: {},
      setActionInputFormValues: (values) =>
        set((state) => ({ ...state, action_input_form_values: values })),
      // action_steps: [],
      // setActionSteps: (steps) =>
      //   set((state) => ({ ...state, action_steps: steps })),
      // activeActionStep: null,
      // setActiveActionStep: (step) =>
      //   set((state) => ({ ...state, activeActionStep: step })),
      sessionConfig: {
        interaction_mode: "interactive",
      },
      setSessionConfig: (config) =>
        set((state) => ({ ...state, sessionConfig: config })),
      // global_variables: {},
      // setGlobalVariables: (variables) =>
      //   set((state) => ({ ...state, global_variables: variables })),
      runtimeConfig: null,
      setRuntimeConfig: (config) => set({ runtimeConfig: config }),
      fetchRuntimeConfig: async () => {
        const res = await fetch("/api/runtime-config");
        const data = await res.json();
        set({ runtimeConfig: data });
      },
      searchFilters: [
        {
          id: 1,
          name: "sessions",
          description: "sessions",
          is_selected: true,
        },
        {
          id: 2,
          name: "tasks",
          description: "tasks",
          is_selected: true,
        },
        {
          id: 3,
          name: "services",
          description: "services",
          is_selected: true,
        },
        {
          id: 4,
          name: "action steps",
          description: "action steps",
          is_selected: true,
        },
        {
          id: 5,
          name: "executable steps",
          description: "executable steps",
          is_selected: true,
        },
        {
          id: 6,
          name: "templates",
          description: "templates",
          is_selected: true,
        },
        {
          id: 7,
          name: "data models",
          description: "data models",
          is_selected: true,
        },
      ],
      setSearchFilters: (filters) =>
        set((state) => ({ ...state, searchFilters: filters })),
    }),
    {
      name: "catchmytask-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useAppStore };

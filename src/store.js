// src/store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTransientStore = create((set) => ({
  forms: {}, // This will store form instances and their submit functions

  // Set the submit handler for a specific form
  setFormSubmitHandler: (formId, submitForm) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...state.forms[formId],
          submitForm,
        },
      },
    })),

  // Set the form instance for a specific form
  setFormInstance: (formId, formInstance) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formId]: {
          ...state.forms[formId],
          formInstance,
        },
      },
    })),
}));

export const useAppStore = create(
  persist(
    (set) => ({
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
          isDisplayed: true,
        },
        mobileCustomComponents: {
          isDisplayed: false,
        },
      },
      setActiveLayout: (activeLayout) => set((state) => ({ activeLayout })),
      activeActionInputLayout: {
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
          isDisplayed: true,
        },
        mobileCustomComponents: {
          isDisplayed: false,
        },
      },
      setActiveActionInputLayout: (activeActionInputLayout) =>
        set((state) => ({ activeActionInputLayout })),
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
        summary: {
          isDisplayed: true,
        },
      },
      setActiveSections: (activeSections) =>
        set((state) => ({ activeSections })),
      entity_types: {
        action_steps: {
          inputMode: "display",
        },
      },
      views: {},
      setViews: (views) => set((state) => ({ views })),
      activeMainCustomComponent: {
        id: "components:h1ttsa94g3pcfbl278jq",
        name: "datagrid",
      },
      setActiveMainCustomComponent: (activeMainCustomComponent) =>
        set((state) => ({ activeMainCustomComponent })),
      activeSummaryCustomComponents: {},
      setActiveSummaryCustomComponents: (key, newData) =>
        set((state) => {
          const existingData = state.activeSummaryCustomComponents[key] || {};
          return {
            activeSummaryCustomComponents: {
              ...state.activeSummaryCustomComponents,
              [key]: newData,
            },
          };
        }),
      // setActiveSummaryCustomComponents: (activeSummaryCustomComponents) =>
      //   set((state) => ({ activeSummaryCustomComponents })),
      activeRecordCustomComponent: {
        id: "components:yazjrjexplgg74vcp5be",
        name: "json",
      },
      setActiveRecordCustomComponent: (activeRecordCustomComponent) =>
        set((state) => ({ activeRecordCustomComponent })),
      activity: {},
      setActivity: (activity) => set((state) => ({ activity })),
      focused_entities: {},
      setFocusedEntities: (focused_entities) =>
        set((state) => ({ ...state, focused_entities: focused_entities })),
      setEntityTypes: (entity_types) => set((state) => ({ entity_types })),
      colorScheme: {
        scheme: "auto",
      },
      setColorScheme: (colorScheme) => set((state) => ({ colorScheme })),

      activeRecord: null,
      setActiveRecord: (activeRecord) => set((state) => ({ activeRecord })),
      action_mode: "default",
      setActionMode: (actionMode) =>
        set((state) => ({ action_mode: actionMode })),
      default_action: "query",
      setDefaultAction: (defaultAction) =>
        set((state) => ({ default_action: defaultAction })),
      action_modes: ["default"],
      activeAgent: null,
      setActiveAgent: (actionAgent) =>
        set((state) => ({ activeAgent: actionAgent })),
      setActionModes: (actionModes) =>
        set((state) => ({ action_modes: actionModes })),
      navigationHistory: null,
      setNavigationHistory: (navigationHistory) =>
        set((state) => ({ navigationHistory })),
      activeMouseCoordinates: {
        x: 0,
        y: 0,
      },
      setActiveMouseCoordinates: (activeMouseCoordinates) =>
        set((state) => ({ activeMouseCoordinates })),

      activeSession: null,
      setActiveSession: (session) =>
        set((state) => ({ ...state, activeSession: session })),
      activeTask: null,
      setActiveTask: (task) => set((state) => ({ ...state, activeTask: task })),
      activeView: null,
      setActiveView: (view) => set((state) => ({ ...state, activeView: view })),
      activeActionStep: null,
      setActiveActionStep: (actionStep) =>
        set((state) => ({ ...state, activeActionStep: actionStep })),
      selectedRecords: {},
      setSelectedRecords: (records) =>
        set((state) => ({ ...state, selectedRecords: records })),
      sortedRecords: {},
      setSortedRecords: (records) =>
        set((state) => ({ ...state, sortedRecords: records })),
      component_input_mode: null,
      setComponentInputMode: (mode) =>
        set((state) => ({ ...state, component_input_mode: mode })),
      query_mode: null,
      setQueryMode: (mode) => set((state) => ({ ...state, query_mode: mode })),
      execute_mode: null,
      setExecuteMode: (mode) =>
        set((state) => ({ ...state, execute_mode: mode })),
      save_mode: null,
      setSaveMode: (mode) => set((state) => ({ ...state, save_mode: mode })),
      share_mode: null,
      setShareMode: (mode) => set((state) => ({ ...state, share_mode: mode })),
      cancel_mode: null,
      setCancelMode: (mode) =>
        set((state) => ({ ...state, cancel_mode: mode })),
      display_mode: null,
      setDisplayMode: (mode) =>
        set((state) => ({ ...state, display_mode: mode })),
      uploaded: {},
      setUploaded: (uploaded) => set((state) => ({ ...state, uploaded })),
      action: null,
      setAction: (action) => set((state) => ({ ...state, action: action })),
      fields: {},
      setFields: (fields) => set((state) => ({ ...state, fields })),
      dataFields: {},
      setDataFields: (code, fields) =>
        set((state) => ({
          dataFields: { ...state.dataFields, [code]: fields },
        })),
      activeApplication: null,
      setActiveApplication: (application) =>
        set((state) => ({ ...state, activeApplication: application })),
      action_input_form_values: {},
      setActionInputFormValues: (values) =>
        set((state) => ({ ...state, action_input_form_values: values })),
      sessionConfig: {
        interaction_mode: "interactive",
      },
      setSessionConfig: (config) =>
        set((state) => ({ ...state, sessionConfig: config })),

      runtimeConfig: null,
      setRuntimeConfig: (config) => set({ runtimeConfig: config }),
      fetchRuntimeConfig: async () => {
        const res = await fetch("/api/runtime-config");
        const data = await res.json();
        set({ runtimeConfig: data });
      },
      globalFilters: [],
      setGlobalFilters: (filters) =>
        set((state) => ({ ...state, globalFilters: filters })),
      globalFilterQuery: "",
      setGlobalFilterQuery: (query) =>
        set((state) => ({ ...state, globalFilterQuery: query })),
      globalQuery: {},
      setGlobalQuery: (query) =>
        set((state) => ({ ...state, globalQuery: query })),
      searchFilters: [],
      setSearchFilters: (filters) =>
        set((state) => ({ ...state, searchFilters: filters })),
      pinned_action_steps: {
        summary: {},
        activity: {},
        issues: {},
      },
      setPinnedActionSteps: (actionSteps) =>
        set((state) => ({ ...state, pinned_action_steps: actionSteps })),
      pinned_main_action: "search",
      setPinnedMainAction: (action) =>
        set((state) => ({ ...state, pinned_main_action: action })),
      live_generate: {},
      setLiveGenerate: (liveGenerate) =>
        set((state) => ({ ...state, live_generate: liveGenerate })),
      form_status: {},
      setFormStatus: (formStatus) =>
        set((state) => ({ ...state, form_status: formStatus })),
      local_db: {},
      setLocalDB: (local_db) => set((state) => ({ ...state, local_db })),
      // Function to update a specific part of the local_db
      updateLocalDB: (key, newData) =>
        set((state) => {
          const existingData = state.local_db[key] || {};
          return {
            local_db: {
              ...state.local_db,
              [key]: {
                ...existingData,
                ...newData,
              },
            },
          };
        }),
    }),
    {
      name: "catchmytask-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

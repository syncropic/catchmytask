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
      },
      setActiveSections: (activeSections) =>
        set((state) => ({ activeSections })),
      entity_types: {
        action_steps: {
          inputMode: "display",
        },
      },
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
      activeActionStep: null,
      setActiveActionStep: (actionStep) =>
        set((state) => ({ ...state, activeActionStep: actionStep })),
      selectedRecords: {},
      setSelectedRecords: (records) =>
        set((state) => ({ ...state, selectedRecords: records })),
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
      action: null,
      setAction: (action) => set((state) => ({ ...state, action: action })),
      fields: {},
      setFields: (fields) => set((state) => ({ ...state, fields })),
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
      searchFilters: [
        {
          id: 1,
          name: "sessions",
          description: "sessions",
          entity_type: "sessions",
          is_selected: true,
        },
        {
          id: 2,
          name: "tasks",
          description: "tasks",
          entity_type: "tasks",
          is_selected: true,
        },
        {
          id: 3,
          name: "services",
          description: "services",
          entity_type: "services",
          is_selected: true,
        },
        {
          id: 4,
          name: "action steps",
          description: "action steps",
          entity_type: "action_steps",
          is_selected: true,
        },
        {
          id: 5,
          name: "executable steps",
          description: "executable steps",
          entity_type: "executable_steps",
          is_selected: true,
        },
        {
          id: 6,
          name: "templates",
          description: "templates",
          entity_type: "templates",
          is_selected: true,
        },
        {
          id: 7,
          name: "data models",
          description: "data models",
          entity_type: "data_models",
          is_selected: true,
        },
        {
          id: 8,
          name: "credentials",
          description: "credentials",
          entity_type: "credentials",
          is_selected: true,
        },
        {
          id: 9,
          name: "mentions",
          description: "mentions",
          entity_type: "mentions",
          is_selected: true,
        },
        {
          id: 10,
          name: "users",
          description: "users",
          entity_type: "users",
          is_selected: true,
        },
        {
          id: 11,
          name: "display modes",
          description: "display modes",
          entity_type: "display modes",
          is_selected: true,
        },
        {
          id: 12,
          name: "share modes",
          description: "share modes",
          entity_type: "share modes",
          is_selected: true,
        },
        {
          id: 13,
          name: "save modes",
          description: "save modes",
          entity_type: "save modes",
          is_selected: true,
        },
        {
          id: 14,
          name: "query modes",
          description: "query modes",
          entity_type: "query modes",
          is_selected: true,
        },
        {
          id: 15,
          name: "profiles",
          description: "profiles",
          entity_type: "profiles",
          is_selected: true,
        },
        {
          id: 16,
          name: "file types",
          description: "file types",
          entity_type: "file_types",
          is_selected: true,
        },
        {
          id: 17,
          name: "actions",
          description: "actions",
          entity_type: "actions",
          is_selected: true,
        },
        {
          id: 18,
          name: "views",
          description: "views",
          entity_type: "views",
          is_selected: true,
        },
      ],
      setSearchFilters: (filters) =>
        set((state) => ({ ...state, searchFilters: filters })),
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

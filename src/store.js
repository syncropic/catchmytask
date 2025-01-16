// src/store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * @typedef {Object} CommentRange
 * @property {number} from - Starting position of comment
 * @property {number} to - Ending position of comment
 */

/**
 * @typedef {Object} CommentAuthor
 * @property {string} id - Author identifier
 * @property {string} name - Author name
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - Unique identifier
 * @property {string} formId - Form identifier
 * @property {string} content - Comment content
 * @property {CommentRange} range - Comment range in the document
 * @property {CommentAuthor} author - Comment author
 * @property {Date} createdAt - Creation timestamp
 * @property {boolean} resolved - Resolution status
 * @property {'comment'|'suggestion'|'ai_recommendation'} type - Comment type
 * @property {'active'|'resolved'|'deleted'} status - Comment status
 */

/**
 * @typedef {Object.<string, Object.<string, Comment>>} CommentsState
 */

export const useTransientStore = create((set, get) => ({
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
    (set, get) => ({
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
      sectionIsExpanded: null,
      setSectionIsExpanded: (sectionName) =>
        set((state) => {
          // If the section is already expanded, collapse it
          if (state.sectionIsExpanded === sectionName) {
            return {
              sectionIsExpanded: null,
              activeLayout: {
                ...state.activeLayout,
                leftSection: { isDisplayed: true },
                centerSection: { isDisplayed: true },
                rightSection: { isDisplayed: true },
                searchSession: { isDisplayed: true },
                searchInput: { isDisplayed: true },
                quickActionsBar: { isDisplayed: true },
                mobileStateView: { isDisplayed: true },
                mobileCustomComponents: { isDisplayed: false },
              },
            };
          }

          // If expanding a new section, hide others and show only the selected one
          const updatedLayout = {
            ...state.activeLayout,
            leftSection: { isDisplayed: sectionName === "leftSection" },
            centerSection: { isDisplayed: sectionName === "centerSection" },
            rightSection: { isDisplayed: sectionName === "rightSection" },
            searchSession: { isDisplayed: false },
            searchInput: { isDisplayed: false },
            quickActionsBar: { isDisplayed: false },
            mobileStateView: { isDisplayed: false },
            mobileCustomComponents: { isDisplayed: false },
          };

          return {
            sectionIsExpanded: sectionName,
            activeLayout: updatedLayout,
          };
        }),

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
      /** @type {CommentsState} */
      comments: {},

      /**
       * Add a new comment
       * @param {string} formId - Form identifier
       * @param {Comment} comment - Comment object
       */
      addComment: (formId, comment) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [formId]: {
              ...(state.comments[formId] || {}),
              [comment.id]: comment,
            },
          },
        })),

      /**
       * Update an existing comment
       * @param {string} formId - Form identifier
       * @param {string} commentId - Comment identifier
       * @param {Partial<Comment>} updates - Comment updates
       */
      updateComment: (formId, commentId, updates) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [formId]: {
              ...(state.comments[formId] || {}),
              [commentId]: {
                ...(state.comments[formId]?.[commentId] || {}),
                ...updates,
              },
            },
          },
        })),

      /**
       * Delete a comment
       * @param {string} formId - Form identifier
       * @param {string} commentId - Comment identifier
       */
      deleteComment: (formId, commentId) =>
        set((state) => {
          const newComments = { ...state.comments };
          const formComments = { ...newComments[formId] };
          delete formComments[commentId];
          newComments[formId] = formComments;
          return { comments: newComments };
        }),

      /**
       * Resolve a comment
       * @param {string} formId - Form identifier
       * @param {string} commentId - Comment identifier
       */
      resolveComment: (formId, commentId) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [formId]: {
              ...(state.comments[formId] || {}),
              [commentId]: {
                ...state.comments[formId][commentId],
                resolved: true,
                status: "resolved",
              },
            },
          },
        })),

      /**
       * Get all comments for a form
       * @param {string} formId - Form identifier
       * @returns {Object.<string, Comment>} Comments for the form
       */
      getCommentsForForm: (formId) => {
        const state = get();
        return state.comments[formId] || {};
      },

      /**
       * Clear all comments for a form
       * @param {string} formId - Form identifier
       */
      clearFormComments: (formId) =>
        set((state) => {
          const newComments = { ...state.comments };
          delete newComments[formId];
          return { comments: newComments };
        }),
      // Add this new state for locked sections
      lockedSections: {},

      // Add a locked section
      addLockedSection: (formId, section) => {
        set((state) => ({
          lockedSections: {
            ...state.lockedSections,
            [formId]: {
              ...state.lockedSections[formId],
              [section.id]: section,
            },
          },
        }));
      },

      // Remove a locked section
      removeLockedSection: (formId, sectionId) => {
        set((state) => {
          const formSections = { ...state.lockedSections[formId] };
          delete formSections[sectionId];

          return {
            lockedSections: {
              ...state.lockedSections,
              [formId]: formSections,
            },
          };
        });
      },

      // Get all locked sections for a form
      getLockedSections: (formId) => {
        const state = get();
        const formSections = state.lockedSections[formId] || {};
        return Object.values(formSections);
      },
      views: {},
      clearViews: (views) => set((state) => ({ views })),
      // setViews: (views) => set((state) => ({ views })),
      // setViews: (key, newData) =>
      //   set((state) => {
      //     const existingData = state.views[key] || {};
      //     return {
      //       views: {
      //         ...state.views,
      //         [key]: {
      //           ...existingData,
      //           ...newData,
      //         },
      //       },
      //     };
      //   }),
      setViews: (key, newData) =>
        set((state) => {
          if (newData === null) {
            const newViews = { ...state.views };
            delete newViews[key];
            return { views: newViews };
          }

          const existingData = state.views[key] || {};
          return {
            views: {
              ...state.views,
              [key]: {
                ...existingData,
                ...newData,
              },
            },
          };
        }),
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
      activeRecordCustomComponents: {},
      isFullWindowDisplay: false,
      setIsFullWindowDisplay: (setting) =>
        set((state) => ({ isFullWindowDisplay: setting })),
      setActiveRecordCustomComponents: (key, newData) =>
        set((state) => {
          const existingData = state.activeRecordCustomComponents[key] || {};
          return {
            activeRecordCustomComponents: {
              ...state.activeRecordCustomComponents,
              [key]: newData,
            },
          };
        }),
      activity: {},
      setActivity: (activity) => set((state) => ({ activity })),
      monitorComponents: ["messages"],
      setMonitorComponents: (item) =>
        set((state) => ({ monitorComponents: item })),
      activeInput: "info",
      setActiveInput: (item) => set((state) => ({ activeInput: item })),

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
      activeViewItem: null,
      setActiveViewItem: (item) => set((state) => ({ activeViewItem: item })),
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
      activeProfile: null,
      setActiveProfile: (task) =>
        set((state) => ({ ...state, activeProfile: task })),
      activeView: null,
      setActiveView: (view) => set((state) => ({ ...state, activeView: view })),
      activeActionStep: null,
      setActiveActionStep: (actionStep) =>
        set((state) => ({ ...state, activeActionStep: actionStep })),
      activeAction: null,
      setActiveAction: (action) =>
        set((state) => ({ ...state, activeAction: action })),
      activeInvalidateQueryKey: null,
      setActiveInvalidateQueryKey: (item) =>
        set((state) => ({ ...state, activeInvalidateQueryKey: item })),
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
      activeEvent: null,
      setActiveEvent: (event) =>
        set((state) => ({ ...state, activeEvent: event })),
      fields: {},
      setFields: (fields) => set((state) => ({ ...state, fields })),
      dataFields: {},
      setDataFields: (code, fields) =>
        set((state) => ({
          dataFields: { ...state.dataFields, [code]: fields },
        })),
      filter_form_values: {},
      setFilterFormValues: (values) =>
        set((state) => ({ ...state, filter_form_values: values })),

      filter_form_fields: {},
      setFilterFormFields: (key, newData) =>
        set((state) => ({
          ...state,
          filter_form_fields: {
            ...state.filter_form_fields,
            [key]: newData,
          },
        })),
      activeApplication: null,
      setActiveApplication: (application) =>
        set((state) => ({ ...state, activeApplication: application })),
      action_input_form_values: {},
      setActionInputFormValues: (values) =>
        set((state) => ({ ...state, action_input_form_values: values })),

      action_input_form_fields: {},
      showRequestResponseView: false,
      setShowRequestResponseView: (showRequestResponseView) =>
        set((state) => ({
          ...state,
          showRequestResponseView: showRequestResponseView,
        })),
      setActionInputFormFields: (key, newData) =>
        set((state) => {
          const existingData = state.action_input_form_fields[key] || [];
          return {
            action_input_form_fields: {
              ...state.action_input_form_fields,
              [key]: newData,
            },
          };
        }),

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
      request_response: null,
      setRequestResponse: (response) =>
        set((state) => ({ ...state, request_response: response })),
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
      open_new_items_in_window: "current",
      setOpenNewItemsInWindow: (action) =>
        set((state) => ({ ...state, open_new_items_in_window: action })),
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
      name: "dpw-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// src/store.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { isEqual } from "lodash";

/**
 * Editor Component Registry -
 * For persisting embedded components in the Natural Language Editor
 * @typedef {Object} EditorComponentRegistry
 * @property {Object.<string, Object>} components - Map of component ID to component data
 * @property {Object.<string, Object>} editorContent - Map of editor ID to editor content
 */

/**
 * Extend the existing AppStore with editor component registry
 */

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

/**
 * Helper function to enhance content with stored values
 * This function should be placed directly in your store.js file before the useAppStore definition,
 * or you can export it as a separate utility function and import it into your store.js
 *
 * @param {Object} content - The editor content to enhance
 * @param {Object} state - The current store state
 * @returns {Object} - Enhanced content with values from the store
 */
/**
 * Helper function to enhance content with stored values
 * This function ensures that editor content is properly enhanced with the latest component values
 */
const enhanceContentWithValues = (content, state) => {
  // Safety check
  if (!content || typeof content !== "object") {
    console.warn("Invalid content passed to enhanceContentWithValues");
    return content;
  }

  // Clone content to avoid mutating the original
  const enhancedContent = JSON.parse(JSON.stringify(content));

  // Function to process nodes recursively
  const processNode = (node) => {
    // Check if this is an embedded component node
    if (node.type === "embeddedComponent" && node.attrs) {
      const { id, type, props, formKey } = node.attrs;

      // Skip if component is marked as deleted
      const deletedComponentIds = state.editor_deleted_components || {};
      const editorId = node.attrs.editorId || "default";
      const isDeleted = deletedComponentIds[editorId]?.includes(id);

      if (isDeleted) {
        return;
      }

      // Handle FilterInputTriplet components
      if (type === "FilterInputTriplet" && props?.variable?.value) {
        const actualFormKey = formKey || `embedded-component-${id}`;
        const tripletFormKey = `${actualFormKey}_${props.variable.value}`;

        // Logging
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `Enhancing FilterInputTriplet component ${id} with formKey ${tripletFormKey}`
          );
        }

        // Check multiple locations for values (in order of freshness priority)
        // 1. Check action_input_form_values - primary storage for form values
        const storedValues = state.action_input_form_values?.[tripletFormKey];

        // 2. Check componentValues in editor_components - backup storage for values
        const componentValues =
          state.editor_components?.componentValues?.[tripletFormKey];

        // 3. Check if component itself already has values in props
        const hasExistingValues =
          props.values && Object.keys(props.values).length > 0;

        if (storedValues && Object.keys(storedValues).length > 0) {
          // Clone to avoid reference issues
          const safeValues = JSON.parse(JSON.stringify(storedValues));

          // Add metadata to track the source of these values
          safeValues._metadata = {
            ...(safeValues._metadata || {}),
            source: "action_input_form_values",
            enhancedAt: new Date().toISOString(),
          };

          // Store values in component props
          node.attrs.props = {
            ...props,
            values: safeValues,
          };

          if (process.env.NODE_ENV !== "production") {
            console.log(
              `Enhanced component ${id} with values from action_input_form_values`
            );
          }
        }
        // If not in action_input_form_values, try componentValues
        else if (componentValues && Object.keys(componentValues).length > 0) {
          // Clone to avoid reference issues
          const safeValues = JSON.parse(JSON.stringify(componentValues));

          // Add metadata to track the source of these values
          safeValues._metadata = {
            ...(safeValues._metadata || {}),
            source: "editor_components.componentValues",
            enhancedAt: new Date().toISOString(),
          };

          // Store values in component props
          node.attrs.props = {
            ...props,
            values: safeValues,
          };

          if (process.env.NODE_ENV !== "production") {
            console.log(
              `Enhanced component ${id} with values from componentValues`
            );
          }
        }
        // Keep existing values if they exist
        else if (hasExistingValues) {
          if (process.env.NODE_ENV !== "production") {
            console.log(`Component ${id} already has values, keeping them`);
          }
        }
        // No values found anywhere, create default values
        else {
          const defaultValues = {
            field: props.variable.value,
            operator: "equals",
            value: null,
            value2: null,
            _metadata: {
              createdAt: new Date().toISOString(),
              source: "defaultValues",
            },
          };

          // Store default values in component props
          node.attrs.props = {
            ...props,
            values: defaultValues,
          };

          if (process.env.NODE_ENV !== "production") {
            console.log(`Created default values for component ${id}`);
          }
        }

        // Ensure formKey is properly set
        if (!node.attrs.formKey) {
          node.attrs.formKey = `embedded-component-${id}`;
        }
      }
      // Handle other component types if needed
      else if (
        type === "DateInput" ||
        type === "NumberInput" ||
        type === "Select"
      ) {
        // Similar logic for other component types
        const actualFormKey = formKey || `embedded-component-${id}`;
        const storedValue =
          state.action_input_form_values?.[actualFormKey]?.value;

        if (storedValue !== undefined) {
          node.attrs.props = {
            ...props,
            value: storedValue,
          };
        }
      }
    }

    // Process children recursively
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(processNode);
    }
  };

  // Process the content recursively
  if (enhancedContent.content && Array.isArray(enhancedContent.content)) {
    enhancedContent.content.forEach(processNode);
  }

  return enhancedContent;
};

// Export the function if you're placing it in a separate file
export { enhanceContentWithValues };

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Filters state
      filters: {
        active_filters: [],
        search_results: [],
        available_items: [
          { id: "date_created", label: "Date Created", type: "date" },
          { id: "date_modified", label: "Date Modified", type: "date" },
          {
            id: "status",
            label: "Status",
            type: "select",
            options: ["Active", "Archived", "Draft"],
          },
          {
            id: "type",
            label: "Type",
            type: "select",
            options: ["Document", "Script", "Function"],
          },
          { id: "owner", label: "Owner", type: "text" },
        ],
      },

      // Filters functions
      setFilters: (filtersData) => {
        if (typeof filtersData === "function") {
          set((state) => ({ filters: filtersData(state.filters) }));
        } else {
          set({ filters: filtersData });
        }
      },

      toggleFilter: (filterId) => {
        set((state) => {
          const isActive = state.filters.active_filters.some(
            (f) => f.id === filterId
          );

          if (isActive) {
            // Remove filter if active
            return {
              filters: {
                ...state.filters,
                active_filters: state.filters.active_filters.filter(
                  (f) => f.id !== filterId
                ),
              },
            };
          } else {
            // Add filter if not active
            const filterItem = state.filters.available_items.find(
              (item) => item.id === filterId
            );
            const defaultValue =
              filterItem?.type === "select" && filterItem.options
                ? filterItem.options[0]
                : "";

            return {
              filters: {
                ...state.filters,
                active_filters: [
                  ...state.filters.active_filters,
                  { id: filterId, value: defaultValue },
                ],
              },
            };
          }
        });
      },
      // Add this to the main state object
      searchBoxFocused: false,

      // Add this to your store actions
      setSearchBoxFocused: (isFocused) =>
        set((state) => ({
          searchBoxFocused: isFocused,
        })),
      // Enhanced show, switches, and createItems state with better structure
      show: {
        selected_items: [], // IDs of currently selected sections
        search_results: [], // IDs of sections matching search query
        available_items: [
          { id: "selected_items", label: "Selected Items" },
          { id: "search_results", label: "Search Results" },
          { id: "active_item", label: "Active Item" },
        ],
      },

      // Set or update show state
      setShow: (updatedShow) =>
        set((state) => ({
          show: {
            ...state.show,
            ...(typeof updatedShow === "function"
              ? updatedShow(state.show)
              : updatedShow),
          },
        })),

      // Add a section to selected items
      addSelectedSection: (sectionId) =>
        set((state) => {
          if (state.show.selected_items.includes(sectionId)) return state;

          return {
            show: {
              ...state.show,
              selected_items: [...state.show.selected_items, sectionId],
            },
          };
        }),

      // Remove a section from selected items
      removeSelectedSection: (sectionId) =>
        set((state) => ({
          show: {
            ...state.show,
            selected_items: state.show.selected_items.filter(
              (id) => id !== sectionId
            ),
          },
        })),

      // Toggle a section's selection state
      toggleSelectedSection: (sectionId) =>
        set((state) => {
          const isSelected = state.show.selected_items.includes(sectionId);
          return {
            show: {
              ...state.show,
              selected_items: isSelected
                ? state.show.selected_items.filter((id) => id !== sectionId)
                : [...state.show.selected_items, sectionId],
            },
          };
        }),

      // Enhanced feature switches state
      switches: {
        enabled_items: [], // IDs of enabled features
        search_results: [], // IDs of features matching search query
        available_items: [
          { id: "developer", label: "Developer Mode", icon: "IconCode" },
        ],
      },

      // Set or update switches state
      setSwitches: (updatedSwitches) =>
        set((state) => ({
          switches: {
            ...state.switches,
            ...(typeof updatedSwitches === "function"
              ? updatedSwitches(state.switches)
              : updatedSwitches),
          },
        })),

      // Toggle a feature's enabled state
      toggleFeature: (featureId) =>
        set((state) => {
          const isEnabled = state.switches.enabled_items.includes(featureId);
          return {
            switches: {
              ...state.switches,
              enabled_items: isEnabled
                ? state.switches.enabled_items.filter((id) => id !== featureId)
                : [...state.switches.enabled_items, featureId],
            },
          };
        }),

      // Enhanced create items state
      createItems: {
        recent_items: [], // Recently created item types
        count: 0, // Total count of items created
        available_items: [
          { id: "document", label: "Session", icon: "IconDatabase" },
          { id: "script", label: "Function", icon: "IconTerminal" },
        ],
      },

      // Set or update createItems state
      setCreateItems: (updatedCreateItems) =>
        set((state) => ({
          createItems: {
            ...state.createItems,
            ...(typeof updatedCreateItems === "function"
              ? updatedCreateItems(state.createItems)
              : updatedCreateItems),
          },
        })),

      // Track a newly created item
      trackCreatedItem: (itemId) =>
        set((state) => {
          // Keep track of recently created items, limit to last 5
          const newRecentItems = [
            itemId,
            ...(state.createItems.recent_items || []),
          ].slice(0, 5);

          return {
            createItems: {
              ...state.createItems,
              recent_items: newRecentItems,
              count: (state.createItems.count || 0) + 1,
            },
          };
        }),

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
          isDisplayed: false,
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
      displayJSONView: false,
      toggleDisplayJSONView: () =>
        set((state) => ({
          displayJSONView: !state.displayJSONView,
        })),

      displaySidebar: false,
      toggleDisplaySidebar: () =>
        set((state) => ({
          displaySidebar: !state.displaySidebar,
        })),
      displaySessionActionInput: false,
      toggleDisplaySessionActionInput: () =>
        set((state) => ({
          displaySessionActionInput: !state.displaySessionActionInput,
        })),
      setDisplaySessionActionInput: (arg) =>
        set((state) => ({
          displaySessionActionInput: arg,
        })),
      global_developer_mode: false,
      toggleGlobalDeveloperMode: () =>
        set((state) => ({
          global_developer_mode: !state.global_developer_mode,
          showRequestResponseView: false,
        })),
      global_session_trace_mode: false,
      toggleGlobalSessionTraceMode: () =>
        set((state) => ({
          global_session_trace_mode: !state.global_session_trace_mode,
          showRequestResponseView: false,
          global_developer_mode: false,
        })),
      global_input_mode: "user",
      setGlobalInputMode: (mode) =>
        set((state) => ({
          global_input_mode: mode,
        })),
      showVariables: true,
      toggleShowVariables: () =>
        set((state) => ({
          showVariables: !state.showVariables,
        })),
      showFields: false,
      toggleShowFields: () =>
        set((state) => ({
          showFields: !state.showFields,
        })),
      showSchedule: false,
      toggleShowSchedule: () =>
        set((state) => ({
          showSchedule: !state.showSchedule,
        })),
      showSessionWorkingMemory: false,
      toggleShowSessionWorkingMemory: () =>
        set((state) => ({
          showSessionWorkingMemory: !state.showSessionWorkingMemory,
        })),
      views: {},
      clearViews: (views) => set((state) => ({ views: {} })),
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
            if (state.open_new_items_in_window == "current") {
              // const newViews = { ...state.views };
              // delete newViews[key];
              return { views: {} };
            } else {
              const newViews = { ...state.views };
              delete newViews[key];
              return { views: newViews };
            }
          }

          // const existingData = state.views[key] || {};
          if (state.open_new_items_in_window == "current") {
            return {
              views: {
                [key]: newData,
              },
            };
          } else {
            return {
              views: {
                ...state.views,
                [key]: newData,
              },
            };
          }
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
        scheme: "light",
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
      expandedRecordIds: [],
      setExpandedRecordIds: (item) =>
        set((state) => ({ expandedRecordIds: item })),
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
      deSelectedRecords: [],
      setDeSelectedRecords: (records) =>
        set((state) => ({ ...state, deSelectedRecords: records })),
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
      focusedEditor: "structured_query", // 'natural_language_query', 'structured_query', or null
      // Add a setter for the focused editor
      setFocusedEditor: (editorName) => set({ focusedEditor: editorName }),
      activeApplication: null,
      setActiveApplication: (application) =>
        set((state) => ({ ...state, activeApplication: application })),
      displaySessionEmbedMonitor: false,
      setDisplaySessionEmbedMonitor: (value) =>
        set((state) => ({ ...state, displaySessionEmbedMonitor: value })),
      action_input_form_values: {},
      /**
       * Improved version of setActionInputFormValues with better persistence
       */
      setActionInputFormValues: (values) => {
        set((state) => {
          let newValues;

          // Handle function or object updates
          if (typeof values === "function") {
            newValues = values(state.action_input_form_values);
          } else {
            newValues = values;
          }

          // Enhanced logging in development mode
          if (process.env.NODE_ENV !== "production") {
            // Find FilterInputTriplet form keys (they follow the pattern embedded-component-*_*)
            const tripletKeys = Object.keys(newValues).filter(
              (key) =>
                key.startsWith("embedded-component-") && key.includes("_")
            );

            if (tripletKeys.length > 0) {
              console.log(
                `Updating ${tripletKeys.length} filter triplet values in store`
              );
            }
          }

          // Update the main form values
          const updatedActionInputFormValues = {
            ...state.action_input_form_values,
            ...newValues,
          };

          // Also synchronize with editor_components.componentValues for better persistence
          const updatedComponentValues = {
            ...state.editor_components.componentValues,
          };

          // Check for filter triplet values and copy them to componentValues
          Object.entries(newValues).forEach(([key, value]) => {
            if (key.startsWith("embedded-component-") && key.includes("_")) {
              // This is likely a filter triplet form key - extract the component ID
              const [formKeyPart, variableValue] = key.split("_");
              const componentId = formKeyPart.replace(
                "embedded-component-",
                ""
              );

              if (componentId && variableValue) {
                // Store in component values with metadata
                updatedComponentValues[key] = {
                  ...value,
                  _persistence: {
                    lastUpdated: new Date().toISOString(),
                    formKey: key,
                    componentId,
                  },
                };
              }
            }
          });

          return {
            action_input_form_values: updatedActionInputFormValues,
            editor_components: {
              ...state.editor_components,
              componentValues: updatedComponentValues,
            },
          };
        });
      },

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

      // Add these new graph-related states and actions
      graph: {
        nodes: [], // Store graph nodes
        edges: [], // Store graph edges
        selectedNode: null,
        highlightedNodes: new Set(),
        highlightedEdges: new Set(),
        nodeData: {}, // Cache for detailed node data
        expandedNodes: new Set(), // Track which nodes are expanded
        zoomLevel: 1,
        viewPosition: { x: 0, y: 0 },
      },

      // Graph actions
      setGraphData: (nodes, edges) =>
        set((state) => ({
          graph: {
            ...state.graph,
            nodes,
            edges,
          },
        })),

      setSelectedNode: (nodeId) =>
        set((state) => ({
          graph: {
            ...state.graph,
            selectedNode: nodeId,
          },
        })),

      setHighlightedElements: (nodes, edges) =>
        set((state) => ({
          graph: {
            ...state.graph,
            highlightedNodes: new Set(nodes),
            highlightedEdges: new Set(edges),
          },
        })),

      expandNode: (nodeId) =>
        set((state) => ({
          graph: {
            ...state.graph,
            expandedNodes: new Set([...state.graph.expandedNodes, nodeId]),
          },
        })),

      collapseNode: (nodeId) =>
        set((state) => ({
          graph: {
            ...state.graph,
            expandedNodes: new Set(
              [...state.graph.expandedNodes].filter((id) => id !== nodeId)
            ),
          },
        })),

      updateNodeData: (nodeId, data) =>
        set((state) => ({
          graph: {
            ...state.graph,
            nodeData: {
              ...state.graph.nodeData,
              [nodeId]: data,
            },
          },
        })),

      setGraphView: (zoom, position) =>
        set((state) => ({
          graph: {
            ...state.graph,
            zoomLevel: zoom,
            viewPosition: position,
          },
        })),
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

      // NEW: Add tracking for deleted components
      editor_deleted_components: {},

      /**
       * Store deleted component IDs to prevent their restoration after refresh
       * @param {string} editorId - ID of the editor
       * @param {string[]} componentIds - Array of component IDs that were deleted
       */
      setEditorDeletedComponents: (editorId, componentIds) =>
        set((state) => ({
          editor_deleted_components: {
            ...state.editor_deleted_components,
            [editorId]: componentIds,
          },
        })),

      /**
       * Get deleted components for an editor
       * @param {string} editorId - ID of the editor
       * @returns {string[]} - Array of deleted component IDs
       */
      getEditorDeletedComponents: (editorId) => {
        const state = get();
        return state.editor_deleted_components[editorId] || [];
      },

      // PART 1: Enhance the editor_components state
      editor_components: {
        components: {}, // Map of component ID to component data
        editorContent: {}, // Map of editor ID to editor content
        // NEW: Add values storage specifically for components
        componentValues: {}, // Map of componentId_variableValue to component values
      },

      /**
       * Improved version of registerEditorComponent with better value handling
       * @param {string} editorId - Unique ID for the editor instance
       * @param {string} componentId - Unique ID for the component
       * @param {string} type - Component type (e.g., 'FilterInputTriplet', 'DateInput')
       * @param {Object} props - Component properties
       */
      registerEditorComponent: (editorId, componentId, type, props) => {
        try {
          set((state) => {
            const currentComponents = state.editor_components?.components || {};

            // Check for value data specifically for FilterInputTriplet components
            let enhancedProps = props;

            if (type === "FilterInputTriplet" && props?.variable?.value) {
              // Check if we have stored values for this triplet
              const tripletFormKey = `embedded-component-${componentId}_${props.variable.value}`;
              const existingValues =
                state.action_input_form_values?.[tripletFormKey];

              if (existingValues && Object.keys(existingValues).length > 0) {
                // If the component already has values in props, prefer those
                if (!props.values || Object.keys(props.values).length === 0) {
                  // Clone values to avoid reference issues
                  enhancedProps = {
                    ...props,
                    values: JSON.parse(JSON.stringify(existingValues)),
                  };

                  console.log(
                    `Found and attached values for component ${componentId} from form store`
                  );
                }
              }
            }

            // Only update if the component doesn't exist or props have changed
            if (
              !currentComponents[componentId] ||
              !isEqual(currentComponents[componentId].props, enhancedProps)
            ) {
              console.log(
                `Registering component ${componentId} for editor ${editorId}`
              );

              // Store in main component registry
              const updatedComponents = {
                ...currentComponents,
                [componentId]: {
                  editorId,
                  type,
                  props: JSON.parse(JSON.stringify(enhancedProps || {})),
                  lastUpdated: new Date().toISOString(),
                },
              };

              // Store special value mapping for filter triplets
              let updatedComponentValues = {
                ...state.editor_components.componentValues,
              };

              if (
                type === "FilterInputTriplet" &&
                enhancedProps?.variable?.value
              ) {
                const tripletFormKey = `embedded-component-${componentId}_${enhancedProps.variable.value}`;

                // If component has values, also store them in the special values storage
                if (enhancedProps.values) {
                  updatedComponentValues[tripletFormKey] = {
                    ...JSON.parse(JSON.stringify(enhancedProps.values)),
                    _persistence: {
                      lastUpdated: new Date().toISOString(),
                      componentId,
                      editorId,
                    },
                  };
                }
              }

              return {
                editor_components: {
                  ...state.editor_components,
                  components: updatedComponents,
                  componentValues: updatedComponentValues,
                },
              };
            }
            return state;
          });
        } catch (error) {
          console.error(`Error registering component ${componentId}:`, error);
        }
      },

      /**
       * Get all components for a specific editor with improved error handling
       * @param {string} editorId - Editor instance ID
       * @returns {Array} Array of component objects
       */
      getEditorComponents: (editorId) => {
        try {
          const state = get();
          const allComponents = state.editor_components?.components || {};

          return Object.entries(allComponents)
            .filter(([_, component]) => component.editorId === editorId)
            .map(([id, component]) => ({
              id,
              ...component,
            }));
        } catch (error) {
          console.error(
            `Error getting components for editor ${editorId}:`,
            error
          );
          return []; // Return empty array on error
        }
      },

      /**
       * Enhanced getSavedEditorContent with explicit deletion handling
       * @param {string} editorId - Editor instance ID
       * @returns {Object|null} Saved editor content or null
       */
      getSavedEditorContent: (editorId) => {
        try {
          const state = get();
          const savedContent =
            state.editor_components?.editorContent?.[editorId]?.content || null;

          if (!savedContent) return null;

          // Find all embedded components in the content
          const enhancedContent = enhanceContentWithValues(savedContent, state);

          // Remove any deleted components from the content
          const deletedComponentIds =
            state.editor_deleted_components[editorId] || [];
          if (deletedComponentIds.length > 0 && enhancedContent.content) {
            enhancedContent.content = removeDeletedComponentsFromContent(
              enhancedContent.content,
              deletedComponentIds
            );
          }

          return enhancedContent;
        } catch (error) {
          console.error(
            `Error getting saved content for editor ${editorId}:`,
            error
          );
          return null;
        }
      },

      /**
       * Enhanced saveEditorContent with better error handling and persistence guarantees
       * @param {string} editorId - Editor instance ID
       * @param {Object} content - Editor content to save
       */
      saveEditorContent: (editorId, content) => {
        try {
          // Skip if content is null or undefined
          if (!content) return;

          // Ensure we're saving a clean copy
          const contentToSave = JSON.parse(JSON.stringify(content));

          // Ensure deleted components are actually removed from the content
          const state = get();
          const deletedComponentIds =
            state.editor_deleted_components[editorId] || [];

          if (deletedComponentIds.length > 0 && contentToSave.content) {
            contentToSave.content = removeDeletedComponentsFromContent(
              contentToSave.content,
              deletedComponentIds
            );
          }

          set((state) => ({
            editor_components: {
              ...(state.editor_components || {}),
              editorContent: {
                ...(state.editor_components?.editorContent || {}),
                [editorId]: {
                  content: contentToSave,
                  lastSaved: new Date().toISOString(),
                },
              },
            },
          }));

          // Log successful save in development mode
          if (process.env.NODE_ENV !== "production") {
            console.log(`Editor ${editorId} content saved successfully`);
          }
        } catch (error) {
          console.error(`Error saving content for editor ${editorId}:`, error);
        }
      },

      /**
       * Improved removeEditorComponent that ensures complete cleanup and deletion tracking
       * @param {string} componentId - Component ID to remove
       */
      removeEditorComponent: (componentId) => {
        try {
          set((state) => {
            // Get the current state
            const editorComponents = state.editor_components || {};
            const components = editorComponents.components || {};
            const componentValues = editorComponents.componentValues || {};
            const actionInputFormValues = state.action_input_form_values || {};

            // Get the component data before removing it
            const component = components[componentId];
            console.log(`Removing component ${componentId} from store`);

            // Early exit if component doesn't exist
            if (!component) {
              return state;
            }

            // Get editor ID to track deletion
            const editorId = component.editorId || "default";

            // Create new objects to avoid mutating state
            const newComponents = { ...components };
            const newComponentValues = { ...componentValues };
            const newActionInputFormValues = { ...actionInputFormValues };

            // 1. Remove the component from components registry
            delete newComponents[componentId];

            // 2. Clean up component values
            // Find and remove all componentValues entries related to this component
            Object.keys(newComponentValues).forEach((key) => {
              if (key.includes(componentId)) {
                delete newComponentValues[key];
              }
            });

            // 3. Clean up form values
            // FormKeys for components follow the pattern: embedded-component-{componentId}
            // For filter triplets, we have embedded-component-{componentId}_{variableName}
            const formKeyPattern = `embedded-component-${componentId}`;

            Object.keys(newActionInputFormValues).forEach((key) => {
              if (key.startsWith(formKeyPattern)) {
                delete newActionInputFormValues[key];
              }
            });

            // 4. Add to deleted components tracking
            const currentDeletedComponents =
              state.editor_deleted_components[editorId] || [];
            const updatedDeletedComponents = [...currentDeletedComponents];

            if (!updatedDeletedComponents.includes(componentId)) {
              updatedDeletedComponents.push(componentId);
            }

            // 5. Update editor content to remove the deleted component
            const editorContent = state.editor_components?.editorContent || {};
            const editorData = editorContent[editorId];

            if (editorData && editorData.content) {
              // Deep clone to avoid mutation issues
              const updatedContent = JSON.parse(
                JSON.stringify(editorData.content)
              );

              // Filter out the deleted component
              if (
                updatedContent.content &&
                Array.isArray(updatedContent.content)
              ) {
                updatedContent.content = removeDeletedComponentsFromContent(
                  updatedContent.content,
                  [componentId]
                );

                // Update the stored editor content
                editorContent[editorId] = {
                  ...editorData,
                  content: updatedContent,
                  lastSaved: new Date().toISOString(),
                };
              }
            }

            console.log(
              `Component ${componentId} cleanup complete, marked as deleted`
            );

            // Return updated state
            return {
              editor_components: {
                ...editorComponents,
                components: newComponents,
                componentValues: newComponentValues,
                editorContent: editorContent,
              },
              action_input_form_values: newActionInputFormValues,
              editor_deleted_components: {
                ...state.editor_deleted_components,
                [editorId]: updatedDeletedComponents,
              },
            };
          });
        } catch (error) {
          console.error(`Error removing component ${componentId}:`, error);
        }
      },
    }),
    {
      name: "dpw-store",
      storage: createJSONStorage(() => localStorage),

      // Don't use partialize to ensure entire state is saved
      // This way everything is persisted except what the serializer excludes

      // Add better logging for debugging
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Zustand state successfully rehydrated");
          console.log(
            "Editor components:",
            Object.keys(state.editor_components?.components || {}).length
          );
        } else {
          console.warn("Failed to rehydrate Zustand state");
        }
      },

      // Improved serializer with better error handling
      serializer: {
        serialize: (state) => {
          try {
            return JSON.stringify(state, (key, value) => {
              // Skip functions - they can't be serialized
              if (typeof value === "function") {
                return undefined;
              }

              // Handle Date objects
              if (value instanceof Date) {
                return { __isDate: true, iso: value.toISOString() };
              }

              return value;
            });
          } catch (error) {
            console.error("Zustand serialization error:", error);
            return "{}";
          }
        },
        deserialize: (str) => {
          try {
            return JSON.parse(str, (key, value) => {
              // Restore Date objects
              if (
                value &&
                typeof value === "object" &&
                value.__isDate === true
              ) {
                return new Date(value.iso);
              }
              return value;
            });
          } catch (error) {
            console.error("Zustand deserialization error:", error);
            return {};
          }
        },
      },
    }
  )
);

/**
 * Helper function to remove deleted components from content
 * Works recursively through the content structure
 */
function removeDeletedComponentsFromContent(content, deletedIds) {
  if (!content || !Array.isArray(content) || deletedIds.length === 0) {
    return content;
  }

  // Filter out deleted components at this level
  const filteredContent = content.filter((node) => {
    if (
      node.type === "embeddedComponent" &&
      node.attrs &&
      deletedIds.includes(node.attrs.id)
    ) {
      return false; // Remove this node
    }
    return true; // Keep this node
  });

  // Process children recursively
  filteredContent.forEach((node) => {
    if (node.content && Array.isArray(node.content)) {
      node.content = removeDeletedComponentsFromContent(
        node.content,
        deletedIds
      );
    }
  });

  return filteredContent;
}

// Create a diagnostic helper function to check store health
const checkZustandStore = () => {
  if (typeof window === "undefined") return null;

  try {
    // Check if the store is available
    if (!window.__ZUSTAND_STORE__) {
      console.error("Zustand store not found on window");
      return { error: "Store not found" };
    }

    // Get current state
    const state = window.__ZUSTAND_STORE__.getState();

    // Check localStorage
    let localStorageState = null;
    try {
      const storeData = localStorage.getItem("dpw-store");
      localStorageState = storeData ? JSON.parse(storeData) : null;
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }

    // Return diagnostic information
    return {
      memoryState: {
        hasComponents: !!state.editor_components,
        componentCount: Object.keys(state.editor_components?.components || {})
          .length,
        editorCount: Object.keys(state.editor_components?.editorContent || {})
          .length,
      },
      localStorageState: {
        exists: !!localStorageState,
        version: localStorageState?.version,
        hasComponents: !!localStorageState?.state?.editor_components,
        componentCount: Object.keys(
          localStorageState?.state?.editor_components?.components || {}
        ).length,
        editorCount: Object.keys(
          localStorageState?.state?.editor_components?.editorContent || {}
        ).length,
      },
    };
  } catch (e) {
    console.error("Error checking store:", e);
    return { error: e.message };
  }
};

// Only attach to window in browser environment
if (typeof window !== "undefined") {
  window.checkZustandStore = checkZustandStore;
}

// Export the transient store (already in your code)
export const useTransientStore = create((set, get) => ({
  forms: {}, // This will store form instances and their submit functions

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

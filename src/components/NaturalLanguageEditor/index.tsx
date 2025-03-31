// src/components/NaturalLanguageEditor/index.tsx
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor, BubbleMenu, Editor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Mention from "@tiptap/extension-mention";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { EmbeddedComponent } from "./EmbeddedComponent";
import styles from "./NaturalLanguageEditor.module.css";
import suggestion from "./suggestion";
import { useAppStore } from "src/store";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { StoragePersistenceExtension } from "./storage-persistence";
import { isEqual, debounce, cloneDeep } from "lodash";
import { createPersistenceDebugger } from "./debug-tools";
import { createDebugPersistenceTool } from "./debug-persistence";
import { TextSelection } from "prosemirror-state"; // Import from prosemirror-state instead of @tiptap/react
import {
  Button,
  Group,
  Indicator,
  Modal,
  Popover,
  Select,
  Tooltip,
} from "@mantine/core";
import {
  IconAdjustments,
  IconClock,
  IconList,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import ExternalSubmitButton from "@components/SubmitButton";
import { IIdentity } from "@components/interfaces";
import { useDisclosure } from "@mantine/hooks";
import { useContextMenu } from "mantine-contextmenu";
import { TimeInput } from "@mantine/dates";

interface NaturalLanguageEditorProps {
  record?: Record<string, any>;
  height: string;
  action_input_form_values_key?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (content: any) => void;
}

interface MentionListRef {
  onKeyDown: (event: { key: string }) => boolean;
}

interface DebugState {
  isEmpty: boolean;
  contentLength: number;
  hasParagraph: boolean;
  updatingRef: boolean;
  selectionFrom: number;
  selectionTo: number;
}

/**
 * Enhanced debugging utility to trace persistence issues
 */
const usePersistenceDebugging = (editorId: string): void => {
  useEffect(() => {
    // Check if the store is accessible
    if (typeof window !== "undefined") {
      const zustandStore = window.__ZUSTAND_STORE__;
      const hasStoreOnWindow = !!zustandStore;
      console.log(
        `[Editor ${editorId}] Zustand store on window:`,
        hasStoreOnWindow
      );

      if (hasStoreOnWindow) {
        const state = zustandStore.getState();
        const hasComponents = !!state.editor_components;
        const hasRegisterFunction =
          typeof state.registerEditorComponent === "function";

        console.log(`[Editor ${editorId}] Store state check:`, {
          hasComponents,
          hasRegisterFunction,
          editorComponentsSize: hasComponents
            ? Object.keys(state.editor_components.components || {}).length
            : 0,
        });

        // Check localStorage
        try {
          const localStorageData = localStorage.getItem("dpw-store");
          console.log(
            `[Editor ${editorId}] localStorage has store data:`,
            !!localStorageData
          );
        } catch (e) {
          console.error(`[Editor ${editorId}] localStorage error:`, e);
        }
      }
    }
  }, [editorId]);
};

// Helper function to preserve cursor position during updates
const preserveCursorPosition = (editor: Editor, fn: () => void): void => {
  try {
    // Store the current cursor position before update
    const { from, to } = editor.state.selection;

    // Execute the update function
    fn();

    // Try to restore the cursor position after update
    try {
      const tr = editor.state.tr.setSelection(
        TextSelection.create(editor.state.doc, from, to)
      );
      editor.view.dispatch(tr);
    } catch (e) {
      console.warn("Could not restore cursor position:", e);
    }
  } catch (e) {
    // If anything fails, still execute the function
    fn();
  }
};

/**
 * Enhanced NaturalLanguageEditor with state persistence
 * across page refreshes using Zustand's persistence middleware
 */
const NaturalLanguageEditor: React.FC<NaturalLanguageEditorProps> = ({
  record,
  height = "50vh",
  action_input_form_values_key = "nlEditor",
  onFocus,
  onBlur,
  onChange,
}) => {
  // Get form values and persistence methods from Zustand store
  const {
    action_input_form_values,
    setActionInputFormValues,
    registerEditorComponent,
    removeEditorComponent,
    getEditorComponents,
    saveEditorContent,
    getSavedEditorContent,
    getEditorDeletedComponents,
    setEditorDeletedComponents,
    activeSession,
    showVariables,
    toggleShowVariables,
    showSchedule,
    toggleShowSchedule,
  } = useAppStore();

  const { data: user_session } = useSession();

  const hasPermission = (permission: string): boolean => {
    return Boolean(
      user_session?.userProfile?.permissions?.includes(permission)
    );
  };

  // Generate a stable ID for this editor instance
  const editorIdRef = useRef<string>(
    action_input_form_values_key || `editor-${uuidv4()}`
  );
  const editorId = editorIdRef.current;

  // Enable debugging for this editor
  usePersistenceDebugging(editorId);

  // Local state for editor content
  const [value, setValue] = useState<any>(null);
  const [lastSavedContent, setLastSavedContent] = useState<any>(null);
  const [initialContentRestored, setInitialContentRestored] =
    useState<boolean>(false);
  const [editorReady, setEditorReady] = useState<boolean>(false);

  const { data: identity } = useGetIdentity<IIdentity>();
  const [schedulePopoverOpened, setSchedulePopoverOpened] = useState(false);

  // For the schedule modal
  const [scheduleModalOpened, scheduleModalHandlers] = useDisclosure(false);

  // For context menus
  const { showContextMenu } = useContextMenu();

  // Refs for managing editor state and preventing loops
  const editorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const contentHasFilterTriplet = useRef<boolean>(false);
  const previousContentRef = useRef<any>(null);
  const previousContentStringRef = useRef<string>("");
  const firstRenderRef = useRef<boolean>(true);
  const restorationAttemptedRef = useRef<boolean>(false);
  const manualEditInProgressRef = useRef<boolean>(false);
  const editorLastFocusedRef = useRef<number>(Date.now());
  const lastTextChangeTimestampRef = useRef<number>(0);
  const lastSaveTimestampRef = useRef<number>(0);

  useEffect(() => {
    // Create debug tool for persistence diagnostics
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      createDebugPersistenceTool();
    }
  }, []);

  // Development-only logging
  const logEditorAction = (action: string, data?: any): void => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `NaturalLanguageEditor [${editorId}] ${action}${data ? ":" : ""}`,
        data || ""
      );
    }
  };

  // Check if content contains a filter triplet
  const hasFilterTriplet = useCallback((content: any): boolean => {
    if (!content) return false;
    return JSON.stringify(content).includes("FilterInputTriplet");
  }, []);

  // Safe component insertion with better error handling
  const safeInsertComponent = useCallback(
    (editor: Editor, component: any): boolean => {
      if (!editor || !component) return false;

      try {
        logEditorAction(
          `Attempting to insert component ${component.id}`,
          component
        );

        // Find a suitable insertion point
        let insertPosition = 1; // Default to document start

        try {
          // First try to find an existing paragraph
          editor.state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === "paragraph") {
              insertPosition = pos + 1; // Inside the paragraph
              return false; // Stop iteration once found
            }
            return true; // Continue searching
          });

          // If no paragraph was found, create one
          if (insertPosition === 1) {
            editor.commands.insertContent("<p></p>");

            // Find the newly created paragraph
            editor.state.doc.descendants((node: any, pos: number) => {
              if (node.type.name === "paragraph") {
                insertPosition = pos + 1;
                return false;
              }
              return true;
            });
          }

          const formKey = `embedded-component-${component.id}`;

          // Insert the component with formKey
          editor.commands.insertContentAt(insertPosition, {
            type: "embeddedComponent",
            attrs: {
              id: component.id,
              type: component.type,
              props: component.props || {},
              formKey: formKey,
              editorId: editorId, // Add editor ID for better tracking
            },
          });

          logEditorAction(
            `Component ${component.id} inserted successfully at position ${insertPosition}`
          );

          // Special handling for FilterInputTriplet - ensure values are in Zustand
          if (
            component.type === "FilterInputTriplet" &&
            component.props?.variable?.value &&
            window.__ZUSTAND_STORE__
          ) {
            try {
              const store = window.__ZUSTAND_STORE__;
              const state = store.getState();
              const setActionInputFormValues = state.setActionInputFormValues;

              if (setActionInputFormValues) {
                const tripletFormKey = `${formKey}_${component.props.variable.value}`;

                // Use existing values from props if available, or create defaults
                const values = component.props.values || {
                  field: component.props.variable.value,
                  operator: "equals",
                  value: null,
                  value2: null,
                  _metadata: {
                    createdAt: new Date().toISOString(),
                    componentId: component.id,
                  },
                };

                setActionInputFormValues((prev: Record<string, any>) => ({
                  ...prev,
                  [tripletFormKey]: values,
                }));

                logEditorAction(
                  `Registered values for restored component ${component.id}`
                );
              }
            } catch (e) {
              console.error(
                "Error registering values for restored component:",
                e
              );
            }
          }

          return true;
        } catch (posError) {
          console.error(
            `Error with position ${insertPosition} for component ${component.id}:`,
            posError
          );

          // Fallback: try direct component insertion without position
          try {
            const formKey = `embedded-component-${component.id}`;

            editor.commands.setEmbeddedComponent({
              id: component.id,
              type: component.type,
              props: component.props || {},
              formKey: formKey,
              editorId: editorId, // Add editor ID for better tracking
            });

            logEditorAction(
              `Component ${component.id} inserted using setEmbeddedComponent command`
            );

            // Ensure values are in Zustand for FilterInputTriplet
            if (
              component.type === "FilterInputTriplet" &&
              component.props?.variable?.value &&
              window.__ZUSTAND_STORE__
            ) {
              const store = window.__ZUSTAND_STORE__;
              const state = store.getState();
              const setActionInputFormValues = state.setActionInputFormValues;

              if (setActionInputFormValues) {
                const tripletFormKey = `${formKey}_${component.props.variable.value}`;

                // Use existing values from props if available, or create defaults
                const values = component.props.values || {
                  field: component.props.variable.value,
                  operator: "equals",
                  value: null,
                  value2: null,
                  _metadata: {
                    restoredAt: new Date().toISOString(),
                    componentId: component.id,
                  },
                };

                setActionInputFormValues((prev: Record<string, any>) => ({
                  ...prev,
                  [tripletFormKey]: values,
                }));
              }
            }

            return true;
          } catch (fallbackError) {
            console.error(
              `Failed all insertion attempts for ${component.id}:`,
              fallbackError
            );
            return false;
          }
        }
      } catch (error) {
        console.error(
          `Error in safeInsertComponent for ${component.id}:`,
          error
        );
        return false;
      }
    },
    [logEditorAction, editorId, setActionInputFormValues]
  );

  // Function to synchronize components between editor storage and Zustand
  const synchronizeComponentsWithStore = useCallback(
    (editor: Editor): void => {
      if (!editor || !editor.storage || !editor.storage.storagePersistence)
        return;

      try {
        // Get components from editor storage
        const registry = editor.storage.storagePersistence;
        const editorComponents = registry.getAllComponents();

        // Register all components in Zustand for persistence
        editorComponents.forEach((comp: any) => {
          registerEditorComponent(editorId, comp.id, comp.type, comp.props);
        });

        logEditorAction("Synchronized components with Zustand store", {
          componentCount: editorComponents.length,
        });
      } catch (error) {
        console.error("Error synchronizing components with store:", error);
      }
    },
    [editorId, registerEditorComponent, logEditorAction]
  );

  // Helper function to process embedded components when saving content
  const processContentForSave = useCallback(
    (content: any): any => {
      if (!content) return content;

      logEditorAction("Processing content for save");

      // Deep clone to avoid mutating original
      const processedContent = JSON.parse(JSON.stringify(content));

      const processNode = (node: any): void => {
        if (node.type === "embeddedComponent" && node.attrs) {
          logEditorAction("Processing node for save", node);

          // Ensure we save the form key for later rehydration
          if (node.attrs.id && !node.attrs.formKey) {
            node.attrs.formKey = `embedded-component-${node.attrs.id}`;
          }

          // Ensure we have the editorId for better tracking
          if (!node.attrs.editorId) {
            node.attrs.editorId = editorId;
          }

          // Special handling for date values
          if (
            node.attrs.props &&
            node.attrs.type === "DateInput" &&
            node.attrs.props.value
          ) {
            const value = node.attrs.props.value;

            // If it's a Date object, convert to ISO string
            if (value instanceof Date && !isNaN(value.getTime())) {
              node.attrs.props.value = value.toISOString();
            }
            // If it's already a string, make sure it's in a valid format
            else if (
              typeof value === "string" &&
              value.match(/^\d{4}-\d{2}-\d{2}/)
            ) {
              // It's already a valid date string, keep as is
            }
            // For any other format, set to null
            else {
              node.attrs.props.value = null;
            }
          }

          // Register/update this component in the Zustand store
          registerEditorComponent(
            editorId,
            node.attrs.id,
            node.attrs.type,
            node.attrs.props
          );
        }

        // Process children recursively
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(processNode);
        }
      };

      if (processedContent.content && Array.isArray(processedContent.content)) {
        processedContent.content.forEach(processNode);
      }

      return processedContent;
    },
    [editorId, registerEditorComponent, logEditorAction]
  );

  // Load persisted components into the content
  const loadPersistedComponents = useCallback(
    (content: any): any => {
      // Get components from the Zustand store
      const components = getEditorComponents(editorId);
      if (!components || components.length === 0) {
        return content;
      }

      // Get deleted components to avoid restoring them
      const deletedComponentIds = getEditorDeletedComponents(editorId);

      logEditorAction(`Loading ${components.length} persisted components`);

      // If no content provided, create a basic document structure
      const baseContent = content || {
        type: "doc",
        content: [{ type: "paragraph", content: [] }],
      };

      // Clone to avoid mutating the original
      const processedContent = JSON.parse(JSON.stringify(baseContent));

      // Find or create a paragraph node to insert components
      let targetParagraph = null;
      if (Array.isArray(processedContent.content)) {
        for (const node of processedContent.content) {
          if (node.type === "paragraph") {
            targetParagraph = node;
            break;
          }
        }
      }

      // If no paragraph found, create one
      if (!targetParagraph && Array.isArray(processedContent.content)) {
        targetParagraph = { type: "paragraph", content: [] };
        processedContent.content.push(targetParagraph);
      }

      // Check if components already exist in the content
      const contentStr = JSON.stringify(processedContent);
      let componentsAdded = 0;

      // Add each component if it doesn't already exist in the content and isn't deleted
      components.forEach((component) => {
        if (contentStr.includes(`"id":"${component.id}"`)) {
          return; // Component already exists in content
        }

        // Skip deleted components
        if (deletedComponentIds.includes(component.id)) {
          logEditorAction(`Skipping deleted component ${component.id}`);
          return;
        }

        // Create component node
        const componentNode = {
          type: "embeddedComponent",
          attrs: {
            id: component.id,
            type: component.type,
            props: component.props,
            formKey: `embedded-component-${component.id}`,
            editorId: editorId, // Add editor ID for better tracking
          },
        };

        // Add to paragraph content
        if (targetParagraph && targetParagraph.content) {
          targetParagraph.content.push(componentNode);
          componentsAdded++;
        }
      });

      logEditorAction(
        `Added ${componentsAdded} persisted components to content`
      );

      return processedContent;
    },
    [editorId, getEditorComponents, getEditorDeletedComponents, logEditorAction]
  );

  // Enhanced content restoration function with memoization
  const restoreComponents = useCallback(
    (editor: Editor, content: any): any => {
      if (
        !editor ||
        !editor.storage.storagePersistence ||
        !content ||
        !content.content
      ) {
        return content;
      }

      // Skip if we're currently updating
      if (isUpdatingRef.current) {
        return content;
      }

      // Get deleted components to avoid restoring them
      const deletedComponentIds = getEditorDeletedComponents(editorId);

      logEditorAction("Restoring components from storage");
      const registry = editor.storage.storagePersistence;

      // Deep clone content to avoid mutations
      const processedContent = JSON.parse(JSON.stringify(content));
      let hasRestoredComponents = false;

      // Find the first paragraph for insertion if needed
      let targetParagraph = null;
      if (Array.isArray(processedContent.content)) {
        for (const node of processedContent.content) {
          if (node.type === "paragraph") {
            targetParagraph = node;
            break;
          }
        }
      }

      // If no paragraph found, create one
      if (!targetParagraph && Array.isArray(processedContent.content)) {
        targetParagraph = { type: "paragraph", content: [] };
        processedContent.content.push(targetParagraph);
      }

      // Check for components in registry not in content
      const allComponentIds = registry.getAllComponentIds();

      // Only restore if needed - check content for existing components first
      const contentString = JSON.stringify(processedContent);

      for (const id of allComponentIds) {
        // Skip if component already exists in content
        if (contentString.includes(`"id":"${id}"`)) continue;

        // Skip deleted components
        if (deletedComponentIds.includes(id)) {
          logEditorAction(`Skipping deleted component ${id}`);
          continue;
        }

        const compData = registry.getComponent(id);
        if (!compData) continue;

        // Component doesn't exist in content but is in registry, add it back
        if (targetParagraph && targetParagraph.content) {
          logEditorAction(`Restoring component ${id} from storage`);

          const componentNode = {
            type: "embeddedComponent",
            attrs: {
              id: id,
              type: compData.type,
              props: compData.props,
              formKey: `embedded-component-${id}`,
              editorId: editorId, // Add editor ID for better tracking
            },
          };

          targetParagraph.content.push(componentNode);
          hasRestoredComponents = true;
        }
      }

      if (hasRestoredComponents) {
        logEditorAction("Components were restored from storage");
      }

      return processedContent;
    },
    [logEditorAction, editorId, getEditorDeletedComponents]
  );

  // Safely restore all components to the editor
  const restoreAllComponents = useCallback(
    (editor: Editor): boolean => {
      if (!editor || !editor.commands || isUpdatingRef.current) return false;

      // Set flag to prevent recursive updates
      isUpdatingRef.current = true;

      try {
        // Get components from Zustand store
        const components = getEditorComponents(editorId);
        if (!components || components.length === 0) {
          logEditorAction(`No components to restore`);
          isUpdatingRef.current = false;
          return false;
        }

        // Get deleted components to avoid restoring them
        const deletedComponentIds = getEditorDeletedComponents(editorId);

        // Filter out deleted components
        const componentsToRestore = components.filter(
          (component) => !deletedComponentIds.includes(component.id)
        );

        logEditorAction(
          `Attempting to restore ${componentsToRestore.length} components (${deletedComponentIds.length} deleted)`
        );

        // Approach 1: Set entire content with embedded components
        try {
          // First, register all components in editor storage
          componentsToRestore.forEach((component) => {
            if (editor.storage.storagePersistence) {
              editor.storage.storagePersistence.registerComponent(
                component.id,
                component.type,
                component.props
              );
            }
          });

          // Get or create base content
          let baseContent = editor.getJSON();
          if (
            !baseContent ||
            !baseContent.content ||
            baseContent.content.length === 0
          ) {
            baseContent = {
              type: "doc",
              content: [{ type: "paragraph", content: [] }],
            };
          }

          // Check for components already in content
          const contentString = JSON.stringify(baseContent);

          // Insert components that don't already exist in the content
          let anyInserted = false;
          for (const component of componentsToRestore) {
            if (!contentString.includes(`"id":"${component.id}"`)) {
              const success = safeInsertComponent(editor, component);
              if (success) anyInserted = true;
            }
          }

          if (anyInserted) {
            logEditorAction(`Successfully restored components`);
          } else {
            logEditorAction(`All components were already in content`);
          }

          // Save content after restoring components
          setTimeout(() => {
            const updatedContent = editor.getJSON();
            const processedContent = processContentForSave(updatedContent);
            saveEditorContent(editorId, processedContent);
            logEditorAction("Content saved after restoring components");
          }, 200);

          return true;
        } catch (error) {
          console.error("Error restoring components:", error);
          return false;
        } finally {
          // Reset the updating flag
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 200);
        }
      } catch (error) {
        console.error("Error in restoreAllComponents:", error);
        isUpdatingRef.current = false;
        return false;
      }
    },
    [
      editorId,
      getEditorComponents,
      getEditorDeletedComponents,
      safeInsertComponent,
      logEditorAction,
      processContentForSave,
      saveEditorContent,
    ]
  );

  // Initialize editor with saved content on first render
  const initialContent = useMemo(() => {
    // Try to get saved content from Zustand store
    const savedContent = getSavedEditorContent(editorId);
    if (savedContent) {
      logEditorAction("Found saved content in store", savedContent);
      // Make sure to load any persisted components into the content
      return loadPersistedComponents(savedContent);
    }
    return null;
  }, [
    editorId,
    getSavedEditorContent,
    loadPersistedComponents,
    logEditorAction,
  ]);

  // Define a better debouncedContentSaver for updating Zustand
  const debouncedContentSaver = useMemo(
    () =>
      debounce((editor: Editor, shouldSyncComponents = true) => {
        if (!editor || isUpdatingRef.current) return;

        try {
          // Track the save time
          lastSaveTimestampRef.current = Date.now();

          // Get current content
          const content = editor.getJSON();

          // We should save even empty content to ensure proper clearing works
          // Only skip completely invalid content
          if (!content) return;

          // If content hasn't changed, skip the update
          if (isEqual(previousContentRef.current, content)) return;

          // Update reference for future comparison
          previousContentRef.current = cloneDeep(content);

          // Process before saving
          const processedContent = processContentForSave(content);

          // Call the onChange prop if provided
          if (props.onChange) {
            props.onChange(processedContent);
          }

          // Save to Zustand
          saveEditorContent(editorId, processedContent);
          setLastSavedContent(processedContent);

          // Log the saved content for debugging
          logEditorAction(
            `Content saved to Zustand: Text and components (${editorId})`
          );

          if (shouldSyncComponents) {
            synchronizeComponentsWithStore(editor);
          }
        } catch (e) {
          console.error("Error in debouncedContentSaver:", e);
        }
      }, 300), // Reduced to 300ms for more responsive saving
    [
      editorId,
      processContentForSave,
      saveEditorContent,
      synchronizeComponentsWithStore,
      logEditorAction,
      onChange,
    ]
  );

  // Create editor with enhanced component persistence
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Highlight,
      Placeholder.configure({ placeholder: "What would you like to do?" }),
      Mention.configure({
        HTMLAttributes: {
          class: styles.mention,
        },
        // Change from '@' to ' /' (space followed by slash)
        suggestion: {
          ...suggestion,
          char: "/",
          // Adjust the command to avoid leaving the initial space
          command: ({ editor, range, props }) => {
            // Remove the space character that triggered this
            const newRange = {
              ...range,
              from: range.from - 1, // adjust to include the space
            };

            editor
              .chain()
              .focus()
              .deleteRange(newRange)
              .insertContent(props)
              .run();
          },
        },
      }),
      // Add the EmbeddedComponent extension
      EmbeddedComponent.configure({
        HTMLAttributes: {
          class: styles.embeddedComponent,
        },
      }),
      // Add our storage persistence extension
      StoragePersistenceExtension,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm w-full",
        "data-editor-id": editorId, // Add editor ID to the DOM element
      },
      // Track when the editor gets focus/loses focus
      handleClick: (view, pos, event) => {
        editorLastFocusedRef.current = Date.now();
        manualEditInProgressRef.current = true;
        return false; // Don't stop propagation
      },
      handleKeyDown: (view, event) => {
        editorLastFocusedRef.current = Date.now();
        manualEditInProgressRef.current = true;
        return false; // Don't stop propagation
      },
    },

    // Using Tiptap's performance optimization options
    immediatelyRender: true,
    shouldRerenderOnTransaction: true,

    // IMPROVED onUpdate handler to prevent conflicts
    onUpdate: ({ editor, transaction }) => {
      // Skip if we're currently updating programmatically
      if (isUpdatingRef.current) {
        logEditorAction(
          "Skipping onUpdate since editor is being updated programmatically"
        );
        return;
      }

      // Track user editing and content change time
      if (transaction.docChanged) {
        manualEditInProgressRef.current = true;
        lastTextChangeTimestampRef.current = Date.now();

        // Get current content
        const content = editor.getJSON();

        // Call the onChange prop if provided
        if (onChange) {
          onChange(content);
        }

        // Always save content changes immediately when document changes
        debouncedContentSaver(editor, true);

        logEditorAction("Content update triggered due to doc change");
      }
    },

    onCreate: ({ editor }) => {
      logEditorAction("Editor created");
      setEditorReady(true);

      // Set editor instance for global registration
      (window as any).editorInstance = editor;
      (window as any).editorInstance.isUpdatingRef = isUpdatingRef;

      // Create a variable to store the editor ID in window for global access
      if (typeof window !== "undefined") {
        window.currentEditorId = editorId;
      }

      // Add to the onFocus event handler in the onCreate method
      editor.on("focus", () => {
        editorLastFocusedRef.current = Date.now();
        manualEditInProgressRef.current = true;

        // Forward the focus event to the provided onFocus callback
        if (onFocus) {
          console.log(`NaturalLanguageEditor focused: ${editorId}`);
          onFocus();
        }
      });

      // Step 1: Add a blur event handler to the editor
      editor.on("blur", () => {
        // Handle the blur event
        if (onBlur) {
          console.log(`NaturalLanguageEditor blurred: ${editorId}`);
          onBlur();
        }

        // You might want to save content here as well
        const content = editor.getJSON();
        if (content) {
          const processedContent = processContentForSave(content);
          saveEditorContent(editorId, processedContent);
          logEditorAction("Content saved on blur");
        }
      });

      // Force an initial content save to ensure persistence is initialized
      setTimeout(() => {
        const initialContent = editor.getJSON();
        if (initialContent) {
          const processedContent = processContentForSave(initialContent);
          saveEditorContent(editorId, processedContent);
          logEditorAction("Initial content saved to store");
        }
      }, 500);

      // First, check if localStorage has persisted data
      let storageKey = `dpw-store`;
      try {
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          logEditorAction("Found stored data in localStorage");
        } else {
          logEditorAction("No stored data found in localStorage");
        }
      } catch (e) {
        console.error("Error checking localStorage:", e);
      }

      // Load persisted components into editor's storage
      if (editor && editor.storage && editor.storage.storagePersistence) {
        // First set the editorId in the storage extension
        if (
          typeof editor.storage.storagePersistence.setEditorId === "function"
        ) {
          editor.storage.storagePersistence.setEditorId(editorId);
        }

        // Initial sync with Zustand
        if (
          typeof editor.storage.storagePersistence.syncFromZustandOnLoad ===
          "function"
        ) {
          editor.storage.storagePersistence.syncFromZustandOnLoad();
        }

        // Get components from Zustand store
        const components = getEditorComponents(editorId);
        let componentsRegistered = 0;

        if (components && components.length > 0) {
          // Get deleted components to avoid restoring them
          const deletedComponentIds = getEditorDeletedComponents(editorId);

          // Filter out deleted components
          const componentsToRegister = components.filter(
            (component) => !deletedComponentIds.includes(component.id)
          );

          componentsToRegister.forEach((component) => {
            editor.storage.storagePersistence.registerComponent(
              component.id,
              component.type,
              component.props
            );
            componentsRegistered++;
          });

          logEditorAction(
            `Loaded ${componentsRegistered} components from Zustand store (${deletedComponentIds.length} deleted)`
          );
        } else {
          logEditorAction("No components found in Zustand store");
        }
      }

      // Set up a focus tracking listener
      editor.on("focus", () => {
        editorLastFocusedRef.current = Date.now();
        manualEditInProgressRef.current = true;
      });
    },

    // Add this to handle editor destruction cleanly
    onDestroy: () => {
      logEditorAction("Editor destroyed");

      // Save content one last time if needed
      if (editor) {
        try {
          const finalContent = editor.getJSON();
          if (finalContent) {
            // Force a final save without any checks
            const processedContent = processContentForSave(finalContent);
            saveEditorContent(editorId, processedContent);
            logEditorAction(
              "Final content saved to store on destroy",
              finalContent
            );
          }
        } catch (err) {
          console.error("Error saving final content:", err);
        }
      }

      // Cancel any pending operations
      if (editorUpdateTimeoutRef.current) {
        clearTimeout(editorUpdateTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      if (debouncedContentSaver) {
        debouncedContentSaver.cancel();
      }
    },
  });

  // Use Tiptap's useEditorState hook to prevent unnecessary re-renders
  const editorState = useEditorState({
    editor,
    // This will only re-render when these specific states change
    selector: ({ editor }) => {
      // Check if editor exists before calling methods
      if (!editor) {
        return {
          isEmpty: true,
          textContent: "",
          isFocused: false,
        };
      }
      return {
        isEmpty: editor.isEmpty,
        textContent: editor.getText(),
        isFocused: editor.isFocused,
      };
    },
  });

  // Effect to ensure the editor state is preserved when the component re-renders
  useEffect(() => {
    if (!editor) return;

    // Store a reference to ensure we can compare properly
    const editorInstance = editor;

    return () => {
      // Only cleanup if this is the same editor instance
      // This prevents state loss during React re-renders
      if (editor === editorInstance) {
        // Cancel any pending updates
        if (editorUpdateTimeoutRef.current) {
          clearTimeout(editorUpdateTimeoutRef.current);
        }
        if (typingDebounceRef.current) {
          clearTimeout(typingDebounceRef.current);
        }
        // Also cancel any debounced updates
        debouncedContentSaver.cancel();
      }
    };
  }, [editor, debouncedContentSaver]);

  // Effect to restore content and components on first render
  useEffect(() => {
    if (!editor || !editorReady || !firstRenderRef.current) return;

    // Mark first render as complete
    firstRenderRef.current = false;

    // Short delay to ensure editor is fully initialized
    const timer = setTimeout(() => {
      // First ensure storage has synced with Zustand
      if (editor.storage?.storagePersistence) {
        // Call syncFromZustandOnLoad to load all components
        editor.storage.storagePersistence.syncFromZustandOnLoad();

        // After a delay to allow sync to complete, restore components
        setTimeout(() => {
          try {
            // Set initial content if not already set
            const currentContent = editor.getJSON();
            const currentIsEmpty =
              !currentContent?.content ||
              currentContent.content.length === 0 ||
              (currentContent.content.length === 1 &&
                currentContent.content[0].type === "paragraph" &&
                (!currentContent.content[0].content ||
                  currentContent.content[0].content.length === 0));

            if (
              initialContent &&
              (currentIsEmpty || !isEqual(currentContent, initialContent))
            ) {
              logEditorAction("Setting initial content from store");
              isUpdatingRef.current = true;

              // Set content using preserveCursorPosition helper
              preserveCursorPosition(editor, () => {
                editor.commands.setContent(initialContent);
              });

              // Track that we've restored content
              setInitialContentRestored(true);
              previousContentRef.current = cloneDeep(initialContent);

              // After content is restored, ensure all components are present
              setTimeout(() => {
                restoreAllComponents(editor);
                isUpdatingRef.current = false;

                // Force a complete sync from Zustand to editor once more
                setTimeout(() => {
                  if (editor.storage?.storagePersistence) {
                    editor.storage.storagePersistence.syncFromZustandOnLoad();
                  }
                  setInitialContentRestored(true);
                }, 100);
              }, 100);
            } else {
              // No saved content, but still need to restore components
              setTimeout(() => {
                if (editor.storage?.storagePersistence) {
                  editor.storage.storagePersistence.syncFromZustandOnLoad();
                }

                restoreAllComponents(editor);
                setInitialContentRestored(true);
              }, 100);
            }
          } catch (error) {
            console.error("Error restoring editor content:", error);
            setInitialContentRestored(true); // Mark as complete even on error
          }
        }, 300);
      } else {
        // No storage persistence, handle gracefully
        if (initialContent) {
          try {
            editor.commands.setContent(initialContent);
          } catch (e) {
            console.error(
              "Error setting content without storage persistence:",
              e
            );
          }
        }
        setInitialContentRestored(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    editor,
    editorReady,
    initialContent,
    restoreAllComponents,
    logEditorAction,
  ]);

  // Effect to retry component restoration if it failed initially
  useEffect(() => {
    if (
      !editor ||
      !editorReady ||
      restorationAttemptedRef.current ||
      !initialContentRestored
    ) {
      return;
    }

    // Mark that we've attempted restoration
    restorationAttemptedRef.current = true;

    // Check if any components need to be restored
    const components = getEditorComponents(editorId);
    if (!components || components.length === 0) {
      return;
    }

    // Get deleted components to avoid restoring them
    const deletedComponentIds = getEditorDeletedComponents(editorId);

    // Get current content
    const currentContent = editor.getJSON();
    const contentStr = JSON.stringify(currentContent);

    // Check if any components are missing from the content
    const missingComponents = components.filter(
      (comp) =>
        !contentStr.includes(`"id":"${comp.id}"`) &&
        !deletedComponentIds.includes(comp.id)
    );

    if (missingComponents.length > 0) {
      logEditorAction(
        `Attempting to restore ${missingComponents.length} missing components`
      );

      // Delay to ensure editor is ready
      setTimeout(() => {
        // Set updating flag to prevent loops
        isUpdatingRef.current = true;

        // Restore each missing component
        missingComponents.forEach((component) => {
          safeInsertComponent(editor, component);
        });

        // Reset updating flag
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 200);
      }, 500);
    }
  }, [
    editor,
    editorReady,
    initialContentRestored,
    editorId,
    getEditorComponents,
    getEditorDeletedComponents,
    safeInsertComponent,
    logEditorAction,
  ]);

  // Enhanced content tracking with timing checks
  useEffect(() => {
    if (!editor || !editorReady) return;

    // Function to detect when content changes and save text content specifically
    const contentWatcher = () => {
      if (isUpdatingRef.current) return;

      // Get latest content
      const currentContent = editor.getJSON();

      // Make sure we have content to save
      if (!currentContent) return;

      // Skip if content hasn't changed
      const currentContentStr = JSON.stringify(currentContent);
      if (previousContentStringRef.current === currentContentStr) return;

      // Update our reference
      previousContentStringRef.current = currentContentStr;

      // Save the content to ensure text persistence
      const processedContent = processContentForSave(currentContent);
      saveEditorContent(editorId, processedContent);

      logEditorAction("Content saved by watcher");
    };

    // Set up periodic saving
    const watcherInterval = setInterval(() => {
      const timeSinceLastChange =
        Date.now() - lastTextChangeTimestampRef.current;
      const timeSinceLastSave = Date.now() - lastSaveTimestampRef.current;

      // If content changed recently but hasn't been saved in a while, force a save
      if (
        lastTextChangeTimestampRef.current > 0 &&
        timeSinceLastChange < 5000 &&
        timeSinceLastSave > 2000
      ) {
        contentWatcher();
      }
    }, 2000);

    return () => {
      clearInterval(watcherInterval);
    };
  }, [
    editor,
    editorReady,
    editorId,
    processContentForSave,
    saveEditorContent,
    logEditorAction,
  ]);

  // Add this effect to track content changes and detect component deletions
  useEffect(() => {
    if (!editor || !editorReady) return;

    // Function to compare contents and find deleted components
    const detectDeletedComponents = (
      oldContent: any,
      newContent: any
    ): string[] => {
      if (!oldContent || !newContent) return [];

      // Convert to strings for easier comparison
      const oldContentStr = JSON.stringify(oldContent);
      const newContentStr = JSON.stringify(newContent);

      // If no change, return empty array
      if (oldContentStr === newContentStr) return [];

      // Extract all component IDs from content
      const extractComponentIds = (content: any): string[] => {
        const ids: string[] = [];
        const traverse = (node: any) => {
          if (
            node.type === "embeddedComponent" &&
            node.attrs &&
            node.attrs.id
          ) {
            ids.push(node.attrs.id);
          }
          if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse);
          }
        };

        if (content.content && Array.isArray(content.content)) {
          content.content.forEach(traverse);
        }
        return ids;
      };

      const oldIds = extractComponentIds(oldContent);
      const newIds = extractComponentIds(newContent);

      // Find IDs that were in old content but not in new content
      return oldIds.filter((id) => !newIds.includes(id));
    };

    // Keep track of previous content
    let previousContent = editor.getJSON();

    // Define transaction handler function
    const handleTransaction = ({
      editor,
      transaction,
    }: {
      editor: Editor;
      transaction: any;
    }) => {
      // Skip if we're currently updating programmatically
      if (isUpdatingRef.current) return;

      // Get current content
      const currentContent = editor.getJSON();

      // Detect deleted components
      const deletedComponentIds = detectDeletedComponents(
        previousContent,
        currentContent
      );

      // Process deleted components
      if (deletedComponentIds.length > 0) {
        logEditorAction(
          `Detected ${
            deletedComponentIds.length
          } deleted components: ${deletedComponentIds.join(", ")}`
        );

        // Get existing deleted components
        const existingDeletedIds = getEditorDeletedComponents(editorId);
        const allDeletedIds = [...existingDeletedIds, ...deletedComponentIds];

        // Update the deleted components list in Zustand
        setEditorDeletedComponents(editorId, allDeletedIds);

        // Remove each deleted component from storage and Zustand
        deletedComponentIds.forEach((id) => {
          // Remove from editor storage persistence
          if (editor.storage.storagePersistence) {
            editor.storage.storagePersistence.removeComponent(id);
            logEditorAction(`Removed component ${id} from storage persistence`);
          }

          // Remove from Zustand store - CRITICAL for persistence between refreshes
          removeEditorComponent(id);
          logEditorAction(`Removed component ${id} from Zustand store`);
        });

        // After removing components, save the updated content
        setTimeout(() => {
          try {
            const updatedContent = editor.getJSON();
            const processedContent = processContentForSave(updatedContent);
            saveEditorContent(editorId, processedContent);
            logEditorAction("Content saved after component deletion");
          } catch (error) {
            console.error(
              "Error saving content after component deletion:",
              error
            );
          }
        }, 100);
      }

      // Update previous content for next comparison
      previousContent = cloneDeep(currentContent);
    };

    // Register the transaction handler
    editor.on("transaction", handleTransaction);

    return () => {
      // Clean up the event listener
      editor.off("transaction", handleTransaction);
    };
  }, [
    editor,
    editorReady,
    editorId,
    logEditorAction,
    processContentForSave,
    saveEditorContent,
    removeEditorComponent,
    getEditorDeletedComponents,
    setEditorDeletedComponents,
  ]);

  // Modified value update effect with improved checks
  useEffect(() => {
    if (!editor || !initialContentRestored) return;

    // Log info about the current state for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("Value update effect triggered", {
        editorHasContent: editor.getJSON()?.content?.length > 0,
        valueExists: !!value,
        isEqual: value && editor.getJSON() && isEqual(editor.getJSON(), value),
        isUpdating: isUpdatingRef.current,
        manualEditInProgress: manualEditInProgressRef.current,
        timeSinceLastFocus: Date.now() - editorLastFocusedRef.current,
      });
    }

    // IMPORTANT: Skip updates if user is actively editing
    if (manualEditInProgressRef.current) {
      // If user edited in the last 5 seconds, don't overwrite their edits
      const secondsSinceLastEdit =
        (Date.now() - editorLastFocusedRef.current) / 1000;
      if (secondsSinceLastEdit < 5) {
        logEditorAction(
          `Skipping content update during active editing (${secondsSinceLastEdit.toFixed(
            1
          )}s since edit)`
        );
        return;
      }
    }

    // Skip if we're already updating or if value is missing
    if (isUpdatingRef.current || !value) return;

    // Skip if editor already has this content
    if (editor.getJSON() && isEqual(editor.getJSON(), value)) {
      return;
    }

    // Set update flag to prevent loops
    isUpdatingRef.current = true;

    // Use setTimeout to ensure we don't conflict with React rendering
    setTimeout(() => {
      try {
        // Handle the case when current content has filter triplets but new content doesn't
        const currentHasFilterTriplet = hasFilterTriplet(editor.getJSON());
        const newHasFilterTriplet = hasFilterTriplet(value);

        if (currentHasFilterTriplet && !newHasFilterTriplet) {
          logEditorAction(
            "Current content has filter triplets but new content doesn't!"
          );

          // If we have filter triplets in current content that would be lost, restore them
          if (editor.storage.storagePersistence) {
            // Use our enhanced component restoration
            const restoredContent = restoreComponents(editor, value);

            // Use preserveCursorPosition helper
            preserveCursorPosition(editor, () => {
              editor.commands.setContent(restoredContent);
            });
          } else {
            preserveCursorPosition(editor, () => {
              editor.commands.setContent(value || "");
            });
          }
        } else {
          // Use preserveCursorPosition helper
          preserveCursorPosition(editor, () => {
            editor.commands.setContent(value || "");
          });
        }

        logEditorAction("Set editor content while preserving cursor");

        // Store this content for future comparisons
        previousContentRef.current = cloneDeep(value);
      } catch (error) {
        console.error("Error setting editor content:", error);
      } finally {
        // Reset manual edit flag since we have fresh content
        manualEditInProgressRef.current = false;

        // Reset flag after a delay to ensure completion
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 200);
      }
    }, 50);
  }, [
    editor,
    value,
    initialContentRestored,
    hasFilterTriplet,
    restoreComponents,
    logEditorAction,
  ]);

  // Make component registration function available globally
  useEffect(() => {
    if (editor) {
      // Create a stable reference that won't change between renders
      // Only register if it doesn't exist yet or if editor changed
      if (
        !(window as any).registerComponentInStorage ||
        (window as any).editorInstance !== editor
      ) {
        (window as any).editorInstance = editor;
        (window as any).editorInstance.isUpdatingRef = isUpdatingRef; // Expose the updating flag
        (window as any).registerComponentInStorage = (
          id: string,
          type: string,
          props: any
        ) => {
          // Register in editor storage
          if (editor.storage.storagePersistence) {
            editor.storage.storagePersistence.registerComponent(
              id,
              type,
              props
            );
          }

          // Also register in Zustand for persistence
          registerEditorComponent(editorId, id, type, props);

          // Log success
          logEditorAction(`Component ${id} registered globally`);
        };
        logEditorAction("Global component registration function created");
      }
    }

    return () => {
      // Only clean up if this editor instance created the function
      if ((window as any).editorInstance === editor) {
        delete (window as any).registerComponentInStorage;
        delete (window as any).editorInstance;
      }
    };
  }, [editor, editorId, registerEditorComponent, logEditorAction]);

  // Enhance storage persistence registration for window object
  useEffect(() => {
    if (editor && typeof window !== "undefined") {
      // Check if the global registration function exists
      if (!(window as any).registerComponentInStorage) {
        logEditorAction(`Creating global registration function`);

        (window as any).registerComponentInStorage = (
          id: string,
          type: string,
          props: any
        ) => {
          // First, try to register in editor's storage
          if (editor && editor.storage && editor.storage.storagePersistence) {
            editor.storage.storagePersistence.registerComponent(
              id,
              type,
              props
            );
            logEditorAction(`Registered component ${id} in editor storage`);
          } else {
            console.warn(
              `[Editor ${editorId}] Editor storage not available for component ${id}`
            );
          }

          // Then, try to register in Zustand for persistence
          if ((window as any).registerEditorComponentPersistence) {
            const success = (window as any).registerEditorComponentPersistence(
              editorId,
              id,
              type,
              props
            );
            logEditorAction(
              `Registered component ${id} in Zustand: ${success}`
            );
          } else {
            console.warn(
              `[Editor ${editorId}] Global persistenceFunction not available`
            );

            // Fallback: Try direct registration
            try {
              if ((window as any).__ZUSTAND_STORE__) {
                const store = (window as any).__ZUSTAND_STORE__;
                store
                  .getState()
                  .registerEditorComponent(editorId, id, type, props);
                logEditorAction(`Direct registration for ${id} successful`);
              }
            } catch (e) {
              console.error(
                `[Editor ${editorId}] Direct registration failed:`,
                e
              );
            }
          }
        };

        logEditorAction(`Global registration function created`);
      }
    }
  }, [editor, editorId, logEditorAction]);

  // Create debugging tool for this editor
  useEffect(() => {
    if (editor && typeof window !== "undefined") {
      createPersistenceDebugger(editorId);
    }
  }, [editor, editorId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (editorUpdateTimeoutRef.current) {
        clearTimeout(editorUpdateTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      if (debouncedContentSaver) {
        debouncedContentSaver.cancel();
      }
    };
  }, [debouncedContentSaver]);

  // Add this effect after your other initialization effects
  useEffect(() => {
    if (editorReady && editor && typeof window !== "undefined") {
      // Create debugger once editor is ready - using non-reserved variable name
      const debugTool = createPersistenceDebugger(editorId);
      console.log("Persistence debugger initialized for editor:", editorId);

      // Automatically clean up orphaned components on editor load
      setTimeout(() => {
        if (window.editorPersistenceDebugger) {
          console.log("Running automatic cleanup of orphaned components");
          window.editorPersistenceDebugger.cleanupOrphanedComponents();
        }
      }, 1000); // Short delay to ensure everything is fully loaded
    }
  }, [editor, editorReady, editorId]);

  // Access store state
  const { activeTask, focused_entities, filter_form_values } = useAppStore();
  let action = focused_entities[activeTask?.id]?.[`action`];
  const { params } = useParsed();

  const getActiveFiltersCount = (formKey: string) => {
    const filterKey = `${formKey}_filter`;
    const formValues = filter_form_values[filterKey] || {};

    return Object.entries(formValues).reduce((count, [key, value]) => {
      if (
        !key.includes("_operator") &&
        !key.includes("_value2") &&
        value !== null &&
        value !== ""
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  return (
    <div style={{ height, display: "flex", flexDirection: "column" }}>
      <RichTextEditor
        editor={editor}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <RichTextEditor.Toolbar sticky>
          {/* Left Group - Navigation arrows */}
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>

          {/* Middle Group - Variables */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <RichTextEditor.ControlsGroup>
              {activeSession?.variables?.length > 0 && (
                <Tooltip
                  // label={`${
                  //   showVariables ? "hide" : "show and provide"
                  // } variables`}
                  label="clear, generate variables"
                >
                  <Indicator
                    inline
                    label={getActiveFiltersCount(`form_${params.id}`)}
                    size={16}
                    disabled={getActiveFiltersCount(`form_${params.id}`) === 0}
                    color="blue"
                    offset={4}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      // Show context menu for variables
                      showContextMenu([
                        {
                          key: "clear",
                          onClick: () => {
                            // Handle clear variables
                            console.log("Clear variables");
                          },
                        },
                        {
                          key: "default",
                          onClick: () => {
                            // Handle clear variables
                            console.log("Use default variables");
                          },
                        },
                        {
                          key: "generate",
                          onClick: () => {
                            // Handle generate variables
                            console.log("Generate variables");
                          },
                        },
                      ])(event);
                    }}
                  >
                    <Button
                      size="compact-xs"
                      leftSection={<IconAdjustments size={14} />}
                      variant="outline"
                    >
                      Variables
                    </Button>
                  </Indicator>
                </Tooltip>
              )}
            </RichTextEditor.ControlsGroup>
          </div>

          {/* Right Group - Execution Steps, Schedule, and Query */}
          <RichTextEditor.ControlsGroup>
            {/* Execution Steps button with ContextMenu */}
            <div className="flex gap-2 items-end">
              <Tooltip
                // label={`${
                //   showVariables ? "hide" : "show and provide"
                // } variables`}
                label="execute step by step"
              >
                <Button
                  size="compact-xs"
                  variant="outline"
                  leftSection={<IconList size={14} />}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    // Show context menu for execution steps
                    showContextMenu([
                      {
                        key: "brainstorm",
                        onClick: () => {
                          // Handle brainstorm action
                          console.log("Brainstorm action");
                        },
                      },
                      {
                        key: "plan",
                        onClick: () => {
                          // Handle plan action
                          console.log("Plan action");
                        },
                      },
                      {
                        key: "execute plan",
                        onClick: () => {
                          // Handle plan action
                          console.log("Execute action plan");
                        },
                      },
                    ])(event);
                  }}
                >
                  Step
                </Button>
              </Tooltip>

              {(params?.id || true) &&
                hasPermission("schedule_action_input") &&
                activeSession?.features?.includes("can_schedule") && (
                  <Popover
                    opened={schedulePopoverOpened}
                    onChange={setSchedulePopoverOpened}
                    width={320}
                    position="bottom-start"
                    shadow="md"
                    withArrow
                    trapFocus // Add this
                    closeOnEscape={false} // Add this
                    closeOnClickOutside={false} // Add this - important to prevent closing when interacting with inputs
                  >
                    <Popover.Target>
                      <Tooltip
                        label={`${
                          showSchedule ? "hide" : "show and configure"
                        } schedule`}
                      >
                        <Indicator
                          inline
                          size={16}
                          disabled={true}
                          color="blue"
                          offset={4}
                        >
                          <Button
                            size="compact-xs"
                            leftSection={<IconClock size={14} />}
                            variant={showSchedule ? "filled" : "outline"}
                            onClick={() => setSchedulePopoverOpened((o) => !o)}
                          >
                            Schedule
                          </Button>
                        </Indicator>
                      </Tooltip>
                    </Popover.Target>

                    <Popover.Dropdown>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <h3 style={{ marginTop: 0, marginBottom: 0 }}>
                            Configure Schedule
                          </h3>
                          {/* Add explicit close button */}
                          <Button
                            size="compact-xs"
                            variant="subtle"
                            onClick={() => setSchedulePopoverOpened(false)}
                            style={{ marginLeft: "auto" }}
                          >
                            ✕
                          </Button>
                        </div>

                        <Select
                          label="Frequency"
                          placeholder="Select frequency"
                          data={[
                            { value: "hourly", label: "Hourly" },
                            { value: "daily", label: "Daily" },
                            { value: "weekly", label: "Weekly" },
                            { value: "monthly", label: "Monthly" },
                          ]}
                        />

                        <TimeInput
                          label="Time"
                          placeholder="Select time"
                          mt="md"
                        />

                        <Group justify="flex-end" mt="xl">
                          <Button
                            variant="default"
                            onClick={() => setSchedulePopoverOpened(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            color="blue"
                            onClick={() => {
                              console.log("Schedule submitted");
                              setSchedulePopoverOpened(false);
                              toggleShowSchedule();
                            }}
                          >
                            Submit
                          </Button>
                        </Group>
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                )}

              {/* Query button as icon */}
              {/* {(params?.id || true) &&
                ((hasPermission("query_action_input") &&
                  activeSession?.features?.includes("can_query")) ||
                  activeSession?.author_id === identity?.email ||
                  hasPermission("super_admin")) && (
                  <Tooltip label="submit">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="green"
                      onClick={() => {
                        const formKey = `form_${params?.id}`;
                      }}
                    >
                      <ExternalSubmitButton
                        record={{}}
                        entity_type="sessions"
                        action_form_key={`form_${params?.id}`}
                        action="query"
                      />
                    </Button>
                  </Tooltip>
                )} */}
              {(params?.id || true) &&
                ((hasPermission("query_action_input") &&
                  activeSession?.features?.includes("can_queue")) ||
                  activeSession?.author_id === identity?.email ||
                  hasPermission("super_admin")) && (
                  <Tooltip label="submit">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="green"
                      onClick={() => {
                        const formKey = `form_${params?.id}`;
                      }}
                    >
                      <ExternalSubmitButton
                        record={{}}
                        entity_type="sessions"
                        action_form_key={`form_${params?.id}`}
                        action="queue"
                      />
                    </Button>
                  </Tooltip>
                )}
              {(params?.id || true) &&
                ((hasPermission("query_action_input") &&
                  activeSession?.features?.includes("can_query")) ||
                  activeSession?.author_id === identity?.email ||
                  hasPermission("super_admin")) && (
                  <Tooltip label="submit">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="green"
                      onClick={() => {
                        const formKey = `form_${params?.id}`;
                      }}
                    >
                      <ExternalSubmitButton
                        record={{}}
                        entity_type="sessions"
                        action_form_key={`form_${params?.id}`}
                        action="query"
                      />
                    </Button>
                  </Tooltip>
                )}
              {(params?.id || true) &&
                ((hasPermission("query_action_input") &&
                  activeSession?.features?.includes("can_query")) ||
                  activeSession?.author_id === identity?.email ||
                  hasPermission("super_admin")) && (
                  <Tooltip label="submit">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="green"
                      onClick={() => {
                        const formKey = `form_${params?.id}`;
                      }}
                    >
                      <ExternalSubmitButton
                        record={{}}
                        entity_type="sessions"
                        action_form_key={`form_${params?.id}`}
                        action="nlq"
                      />
                    </Button>
                  </Tooltip>
                )}
              {(params?.id || true) &&
                ((hasPermission("query_action_input") &&
                  activeSession?.features?.includes("can_query")) ||
                  activeSession?.author_id === identity?.email ||
                  hasPermission("super_admin")) && (
                  <Tooltip label="submit">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="green"
                      onClick={() => {
                        const formKey = `form_${params?.id}`;
                      }}
                    >
                      <ExternalSubmitButton
                        record={{}}
                        entity_type="sessions"
                        action_form_key={`form_${params?.id}`}
                        action="plan"
                      />
                    </Button>
                  </Tooltip>
                )}
            </div>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        {editor && (
          <BubbleMenu editor={editor}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
            </RichTextEditor.ControlsGroup>
          </BubbleMenu>
        )}

        <div
          style={{
            flex: "1 1 auto",
            overflowY: "auto",
            background: "white",
            padding: "1rem",
          }}
        >
          <RichTextEditor.Content />
        </div>

        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup></RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup></RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      </RichTextEditor>

      {/* Debug component - only in development */}
      {/* {process.env.NODE_ENV !== "production" && (
        <EditorDebugInfo editor={editor} />
      )} */}
    </div>
  );
};

export default NaturalLanguageEditor;

export const NaturalLanguageEditorFormInput = (props: any): JSX.Element => {
  const fieldName =
    props?.schema?.title?.toLowerCase().replace(/ /g, "_") || props?.label;

  // Prepare focus and blur handlers
  const handleFocus = () => {
    props.onFocus(fieldName);
  };

  const handleBlur = () => {
    if (props.onBlur) {
      props.onBlur(fieldName);
    }
  };

  return (
    <>
      {/* {props?.title && <div>{props?.title}</div>} */}

      <NaturalLanguageEditor
        record={props?.record}
        onFocus={handleFocus}
        onBlur={handleBlur}
        height={props?.height || "200px"}
        action_input_form_values_key={props?.action_input_form_values_key}
        onChange={props?.onChange}
      />
    </>
  );
};

// Add type definitions for global functions
declare global {
  interface Window {
    blockEditorUpdates: boolean;
    registerComponentInStorage: (id: string, type: string, props: any) => void;
    registerEditorComponentPersistence?: (
      editorId: string,
      componentId: string,
      type: string,
      props: any
    ) => boolean;
    editorInstance: any;
    debugZustandStore: () => any;
    editorDebugTool: any;
    contentDebugger: any;
    currentEditorId?: string;
    editorPersistenceDebugger: any;
  }
}

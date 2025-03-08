// src/components/NaturalLanguageEditor/storage-persistence.ts
import { Node } from "@tiptap/core";
import { isEqual, cloneDeep } from "lodash";

/**
 * Enhanced StoragePersistenceExtension with more robust state tracking
 *
 * This extension maintains a registry of embedded components that persists
 * across editor rehydration cycles. It solves component disappearance issues
 * by ensuring components are preserved in the editor's storage.
 */
export const StoragePersistenceExtension = Node.create({
  name: "storagePersistence",

  // This extension doesn't render in the document
  group: "block",
  selectable: false,
  draggable: false,

  addStorage() {
    return {
      // Component registry that persists through editor lifecycle
      componentRegistry: new Map(),

      // Component update tracking to prevent redundant updates
      lastUpdateTime: new Map(),

      // Modification tracking
      modifiedSinceLastSync: new Set(),

      // Add debugging information
      editorId: null,

      // Delete state tracking to ensure deletions persist across refreshes
      deletedComponentIds: new Set(),

      // Set editor ID for debugging
      setEditorId(id) {
        this.editorId = id;
        this.log(`Editor ID set: ${id}`);

        // Try to load deleted components from Zustand when ID is set
        this.loadDeletedComponentsFromZustand();
      },

      // Load deleted components from Zustand store
      loadDeletedComponentsFromZustand() {
        if (
          !this.editorId ||
          typeof window === "undefined" ||
          !window.__ZUSTAND_STORE__
        ) {
          return;
        }

        try {
          const store = window.__ZUSTAND_STORE__;
          const state = store.getState();

          if (typeof state.getEditorDeletedComponents === "function") {
            const deletedIds = state.getEditorDeletedComponents(this.editorId);

            if (Array.isArray(deletedIds) && deletedIds.length > 0) {
              this.log(
                `Loaded ${deletedIds.length} deleted component IDs from Zustand`
              );

              // Add each ID to our set
              deletedIds.forEach((id) => this.deletedComponentIds.add(id));
            }
          } else {
            // Try fallback storage method
            const editorKey = `editor_deleted_components_${this.editorId}`;
            const fallbackIds = state.action_input_form_values?.[editorKey];

            if (Array.isArray(fallbackIds) && fallbackIds.length > 0) {
              this.log(
                `Loaded ${fallbackIds.length} deleted component IDs from fallback storage`
              );
              fallbackIds.forEach((id) => this.deletedComponentIds.add(id));
            }
          }
        } catch (error) {
          console.error(
            "Error loading deleted components from Zustand:",
            error
          );
        }
      },

      // Enhanced logging with timestamp
      log(message, data) {
        if (process.env.NODE_ENV !== "production") {
          const timestamp = new Date().toISOString().substring(11, 23);
          const prefix = this.editorId
            ? `[${timestamp}][Editor ${this.editorId}]`
            : `[${timestamp}][Editor]`;

          if (data) {
            console.log(`${prefix} ${message}`, data);
          } else {
            console.log(`${prefix} ${message}`);
          }
        }
      },

      // Track deleted components by comparing current document content with registry
      trackDeletedComponents(documentContent) {
        if (!documentContent) return [];

        const contentStr = JSON.stringify(documentContent);
        const deletedIds = [];

        // Check all registered components against the document content
        for (const id of this.componentRegistry.keys()) {
          // Skip if already marked as deleted
          if (this.deletedComponentIds.has(id)) continue;

          if (!contentStr.includes(`"id":"${id}"`)) {
            deletedIds.push(id);

            // Log the deletion
            this.log(
              `Component ${id} no longer exists in document and will be removed from registry`
            );

            // Add to deleted set to ensure permanent deletion
            this.deletedComponentIds.add(id);

            // Remove from registry
            this.removeComponent(id);

            // Sync deletion to Zustand
            if (typeof window !== "undefined" && window.__ZUSTAND_STORE__) {
              try {
                const store = window.__ZUSTAND_STORE__;
                const state = store.getState();

                if (typeof state.removeEditorComponent === "function") {
                  state.removeEditorComponent(id);
                  this.log(`Removed component ${id} from Zustand store`);

                  // Also cleanup the component values
                  this.cleanupComponentValues(id, state);
                }
              } catch (e) {
                console.error(
                  `Error syncing component deletion to Zustand:`,
                  e
                );
              }
            }
          }
        }

        if (deletedIds.length > 0) {
          this.log(
            `Removed ${deletedIds.length} components that were deleted from the document`
          );

          // Sync all deleted IDs to Zustand for persistence
          this.syncDeletedComponentsToZustand();
        }

        return deletedIds;
      },

      // Sync deleted component IDs to Zustand for persistence
      syncDeletedComponentsToZustand() {
        if (
          !this.editorId ||
          typeof window === "undefined" ||
          !window.__ZUSTAND_STORE__
        ) {
          return;
        }

        try {
          const store = window.__ZUSTAND_STORE__;
          const state = store.getState();

          // Convert Set to Array for storage
          const deletedIds = Array.from(this.deletedComponentIds);

          if (typeof state.setEditorDeletedComponents === "function") {
            state.setEditorDeletedComponents(this.editorId, deletedIds);
            this.log(
              `Synced ${deletedIds.length} deleted component IDs to Zustand`
            );
          } else {
            this.log(
              "No setEditorDeletedComponents function available in Zustand"
            );

            // Fallback: Store in action_input_form_values
            if (state.setActionInputFormValues) {
              const editorKey = `editor_deleted_components_${this.editorId}`;
              state.setActionInputFormValues({
                ...state.action_input_form_values,
                [editorKey]: deletedIds,
              });
              this.log(`Stored deleted components using fallback method`);
            }
          }
        } catch (error) {
          console.error("Error syncing deleted components to Zustand:", error);
        }
      },

      // Clean up component values from Zustand store
      cleanupComponentValues(componentId, state) {
        if (!state.action_input_form_values || !state.setActionInputFormValues)
          return;

        const formKey = `embedded-component-${componentId}`;
        const actionInputFormValues = state.action_input_form_values || {};

        // Find any keys that start with this component's formKey
        const keysToRemove = Object.keys(actionInputFormValues).filter((key) =>
          key.startsWith(formKey)
        );

        if (keysToRemove.length > 0) {
          // Create an updated values object without the removed component's values
          const updatedValues = { ...actionInputFormValues };
          keysToRemove.forEach((key) => delete updatedValues[key]);

          // Update the store
          state.setActionInputFormValues(updatedValues);
          this.log(
            `Removed ${keysToRemove.length} form values for component ${componentId}`
          );
        }
      },

      // Filter out deleted components during restoration
      filterRestoringComponents(components) {
        if (!components || !Array.isArray(components)) return [];

        return components.filter(
          (comp) => !this.deletedComponentIds.has(comp.id)
        );
      },

      // Register a component with improved error handling
      registerComponent(id, type, props) {
        try {
          // Skip if this component was previously deleted
          if (this.deletedComponentIds.has(id)) {
            this.log(`Skipping registration of deleted component ${id}`);
            return false;
          }

          const now = Date.now();
          const lastUpdate = this.lastUpdateTime.get(id) || 0;
          const existingComponent = this.componentRegistry.get(id);

          // Check if this is a duplicate update (happening too quickly)
          const isDuplicateUpdate = now - lastUpdate < 100; // 100ms threshold

          // Check if props haven't actually changed
          const propsUnchanged =
            existingComponent && isEqual(existingComponent.props, props);

          // Skip redundant updates that could cause loops
          if (existingComponent && (isDuplicateUpdate || propsUnchanged)) {
            return true; // Still return true to indicate component exists
          }

          // Deep clone props to avoid reference issues
          let safeProps = props;
          try {
            safeProps = cloneDeep(props || {});
          } catch (e) {
            this.log(`Warning: Could not deep clone props for ${id}`, e);
            // Fall back to JSON stringification if lodash cloneDeep fails
            try {
              safeProps = JSON.parse(JSON.stringify(props || {}));
            } catch (e2) {
              this.log(
                `Warning: Fallback JSON clone also failed for ${id}`,
                e2
              );
              // Continue with original props if deep clone fails
            }
          }

          // For FilterInputTriplet, check if we have values in the store
          if (
            type === "FilterInputTriplet" &&
            this.editorId &&
            typeof window !== "undefined" &&
            window.__ZUSTAND_STORE__
          ) {
            try {
              const zustandStore = window.__ZUSTAND_STORE__;
              const state = zustandStore.getState();

              // Get action_input_form_values from Zustand
              const actionInputFormValues =
                state.action_input_form_values || {};

              // Construct the form key that would be used for this triplet
              if (safeProps.variable && safeProps.variable.value) {
                const formKey = `embedded-component-${id}`;
                const tripletFormKey = `${formKey}_${safeProps.variable.value}`;

                // Check if we have values for this triplet in Zustand
                const storedValues = actionInputFormValues[tripletFormKey];
                if (storedValues && Object.keys(storedValues).length > 0) {
                  this.log(`Found values in Zustand for ${id}:`, storedValues);

                  // Merge the stored values into the props
                  safeProps = {
                    ...safeProps,
                    values: storedValues,
                  };
                }
              }
            } catch (e) {
              this.log(`Error checking Zustand for values for ${id}:`, e);
            }
          }

          // Store the component data with editorId for better tracking
          this.componentRegistry.set(id, {
            type,
            props: safeProps,
            editorId: this.editorId,
            registeredAt: now,
            lastUpdated: now,
          });

          this.lastUpdateTime.set(id, now);
          this.modifiedSinceLastSync.add(id);

          // Only log on first registration for cleaner logs
          if (!existingComponent) {
            this.log(`Component registered: ${id} (${type})`);
          }

          // Also register in global Zustand store if available
          this.syncToZustand(id);

          return true;
        } catch (e) {
          console.error(`Error registering component ${id}:`, e);
          return false;
        }
      },

      // IMPROVED: Sync a component to Zustand store with better error handling
      syncToZustand(id) {
        if (
          typeof window === "undefined" ||
          !this.editorId ||
          !window.registerEditorComponentPersistence
        ) {
          return false;
        }

        try {
          const component = this.componentRegistry.get(id);
          if (!component) return false;

          // Ensure component.props is properly cloned to avoid reference issues
          let safeProps;
          try {
            safeProps = cloneDeep(component.props || {});
          } catch (e) {
            this.log(`Warning: Could not clone props for syncing ${id}`, e);
            safeProps = component.props;
          }

          // Add additional metadata for debugging
          const enhancedProps = {
            ...safeProps,
            _sync: {
              timestamp: new Date().toISOString(),
              editorId: this.editorId,
            },
          };

          const result = window.registerEditorComponentPersistence(
            this.editorId,
            id,
            component.type,
            enhancedProps
          );

          if (result) {
            this.modifiedSinceLastSync.delete(id);
            this.log(`Component ${id} synced to Zustand successfully`);
          } else {
            this.log(`Component ${id} sync to Zustand failed (returned false)`);
          }

          return result;
        } catch (e) {
          console.error(`Error syncing component ${id} to Zustand:`, e);
          return false;
        }
      },

      // Sync all components to Zustand
      syncAllToZustand() {
        if (
          typeof window === "undefined" ||
          !this.editorId ||
          !window.registerEditorComponentPersistence
        ) {
          return false;
        }

        let successCount = 0;
        let errorCount = 0;

        for (const [id, component] of this.componentRegistry.entries()) {
          try {
            // Skip components that were deleted
            if (this.deletedComponentIds.has(id)) continue;

            // Clone props safely
            let safeProps;
            try {
              safeProps = cloneDeep(component.props || {});
            } catch (e) {
              safeProps = component.props;
            }

            const success = window.registerEditorComponentPersistence(
              this.editorId,
              id,
              component.type,
              safeProps
            );

            if (success) {
              successCount++;
              this.modifiedSinceLastSync.delete(id);
            } else {
              errorCount++;
            }
          } catch (e) {
            console.error(`Error syncing component ${id} to Zustand:`, e);
            errorCount++;
          }
        }

        if (successCount > 0) {
          this.log(
            `Synced ${successCount} components to Zustand store (${errorCount} errors)`
          );
        }

        return errorCount === 0;
      },

      // Get component data from registry
      getComponent(id) {
        return this.componentRegistry.get(id);
      },

      // Check if component exists in registry
      hasComponent(id) {
        return this.componentRegistry.has(id);
      },

      // Get all component IDs
      getAllComponentIds() {
        return Array.from(this.componentRegistry.keys());
      },

      // Get all components
      getAllComponents() {
        return Array.from(this.componentRegistry.entries()).map(
          ([id, data]) => ({ id, ...data })
        );
      },

      // Remove a component
      removeComponent(id) {
        if (this.componentRegistry.delete(id)) {
          this.lastUpdateTime.delete(id);
          this.log(`Component removed from storage: ${id}`);

          // Add to the deleted set for persistent tracking
          this.deletedComponentIds.add(id);

          // Sync deletions to Zustand
          this.syncDeletedComponentsToZustand();

          return true;
        }
        return false;
      },

      // Check for any orphaned components (in registry but not in document)
      findOrphanedComponents(documentContent) {
        if (!documentContent) return [];

        const contentStr = JSON.stringify(documentContent);
        const orphanedIds = [];

        for (const id of this.componentRegistry.keys()) {
          if (!contentStr.includes(`"id":"${id}"`)) {
            orphanedIds.push(id);
          }
        }

        if (orphanedIds.length > 0) {
          this.log(
            `Found ${orphanedIds.length} orphaned components`,
            orphanedIds
          );
        }

        return orphanedIds;
      },

      // Get components that need restoration
      getComponentsToRestore(documentContent) {
        if (!documentContent) return [];

        const contentStr = JSON.stringify(documentContent);
        const componentsToRestore = [];

        for (const [id, data] of this.componentRegistry.entries()) {
          // Skip components that were deleted
          if (this.deletedComponentIds.has(id)) continue;

          if (!contentStr.includes(`"id":"${id}"`)) {
            componentsToRestore.push({
              id,
              type: data.type,
              props: data.props,
            });
          }
        }

        if (componentsToRestore.length > 0) {
          this.log(`Found ${componentsToRestore.length} components to restore`);
        }

        return componentsToRestore;
      },

      // IMPROVED: More robust Zustand syncing on load
      syncFromZustandOnLoad() {
        if (
          typeof window === "undefined" ||
          !window.__ZUSTAND_STORE__ ||
          !this.editorId
        ) {
          return false;
        }

        try {
          const zustandStore = window.__ZUSTAND_STORE__;
          const state = zustandStore.getState();

          // First load the deleted components set to ensure we don't restore deleted components
          this.loadDeletedComponentsFromZustand();

          // Check for editor content first - this should contain both text and components
          if (
            state.getSavedEditorContent &&
            typeof state.getSavedEditorContent === "function"
          ) {
            const savedContent = state.getSavedEditorContent(this.editorId);
            this.log(
              `Found saved editor content for ${this.editorId}`,
              savedContent ? "Content found" : "No content found"
            );
          }

          if (!state.editor_components || !state.editor_components.components) {
            this.log("No components found in Zustand store");
            return false;
          }

          // Find components for this editor
          const components = Object.entries(state.editor_components.components)
            .filter(([_, comp]) => comp.editorId === this.editorId)
            .filter(([id]) => !this.deletedComponentIds.has(id)) // Filter out deleted components
            .map(([id, comp]) => ({
              id,
              type: comp.type,
              props: comp.props,
            }));

          if (components.length > 0) {
            this.log(
              `Found ${components.length} components in Zustand store for editor ${this.editorId}`
            );

            // Two-pass approach for more thorough value restoration
            // First pass: Register all components
            components.forEach((comp) => {
              this.registerComponent(comp.id, comp.type, comp.props);
            });

            // Second pass: Look for FilterInputTriplet components and find their values
            const filterTriplets = components.filter(
              (comp) =>
                comp.type === "FilterInputTriplet" &&
                comp.props?.variable?.value
            );

            if (filterTriplets.length > 0) {
              this.log(
                `Found ${filterTriplets.length} filter triplets to restore values for`
              );

              const actionInputFormValues =
                state.action_input_form_values || {};

              // Process each filter triplet to find its values
              filterTriplets.forEach((comp) => {
                try {
                  // Construct the form key for this triplet
                  const formKey = `embedded-component-${comp.id}`;
                  const tripletFormKey = `${formKey}_${comp.props.variable.value}`;

                  // Check if we have values for this triplet
                  const storedValues = actionInputFormValues[tripletFormKey];

                  if (storedValues && Object.keys(storedValues).length > 0) {
                    this.log(
                      `Found triplet values for ${comp.id}:`,
                      storedValues
                    );

                    // Update with stored values
                    const updatedProps = {
                      ...comp.props,
                      values: cloneDeep(storedValues),
                    };

                    // Re-register with updated values
                    this.registerComponent(comp.id, comp.type, updatedProps);

                    // Also force sync back to Zustand with the updated values
                    // This creates a complete cycle of restoration
                    if (window.registerEditorComponentPersistence) {
                      window.registerEditorComponentPersistence(
                        this.editorId,
                        comp.id,
                        comp.type,
                        updatedProps
                      );
                    }
                  }
                } catch (e) {
                  this.log(
                    `Error retrieving triplet values for ${comp.id}:`,
                    e
                  );
                }
              });
            }

            this.log(`Successfully restored components from Zustand store`);
            return true;
          } else {
            this.log(
              `No components found for editor ${this.editorId} in Zustand store`
            );
            return false;
          }
        } catch (e) {
          console.error("Error restoring components from Zustand:", e);
          return false;
        }
      },

      // Create a diagnostic log of component state
      diagnose() {
        const components = this.getAllComponents();
        const modified = Array.from(this.modifiedSinceLastSync);
        const deleted = Array.from(this.deletedComponentIds);

        return {
          editorId: this.editorId,
          componentCount: components.length,
          modifiedCount: modified.length,
          deletedCount: deleted.length,
          components: components.map((comp) => ({
            id: comp.id,
            type: comp.type,
            modified: modified.includes(comp.id),
            deleted: deleted.includes(comp.id),
            lastUpdated: new Date(comp.lastUpdated).toISOString(),
            hasValues: comp.props?.values !== undefined,
          })),
        };
      },
    };
  },

  // Enhanced onTransaction method that checks for deleted components
  onTransaction({ editor, transaction }) {
    if (!editor || !editor.storage.storagePersistence) return;

    try {
      // Try to get editor ID from the element
      const editorId = editor.options.element?.dataset?.editorId;
      if (editorId && !editor.storage.storagePersistence.editorId) {
        editor.storage.storagePersistence.setEditorId(editorId);

        // Attempt to restore components from Zustand
        setTimeout(() => {
          editor.storage.storagePersistence.syncFromZustandOnLoad();
        }, 100);
      }

      // IMPORTANT ADDITION: Check for deleted components after each transaction
      if (transaction.docChanged) {
        // Use setTimeout to ensure we get the latest document state
        setTimeout(() => {
          const currentContent = editor.getJSON();
          editor.storage.storagePersistence.trackDeletedComponents(
            currentContent
          );

          // Save deleted component IDs to Zustand store for persistence across page loads
          if (
            window.__ZUSTAND_STORE__ &&
            editor.storage.storagePersistence.editorId
          ) {
            try {
              const store = window.__ZUSTAND_STORE__;
              const state = store.getState();

              const deletedIds = Array.from(
                editor.storage.storagePersistence.deletedComponentIds
              );

              // If we have a setEditorDeletedComponents function, use it
              if (typeof state.setEditorDeletedComponents === "function") {
                state.setEditorDeletedComponents(
                  editor.storage.storagePersistence.editorId,
                  deletedIds
                );
              }
              // Otherwise try to add it to a custom property in the state
              else if (state.action_input_form_values) {
                const editorKey = `editor_deleted_components_${editor.storage.storagePersistence.editorId}`;
                state.setActionInputFormValues({
                  ...state.action_input_form_values,
                  [editorKey]: deletedIds,
                });
              }
            } catch (e) {
              console.error("Error syncing deleted components to Zustand:", e);
            }
          }
        }, 50);
      }

      // IMPROVED: Periodic sync with dynamic timing
      // More frequent initial syncs, then backing off
      if (typeof window !== "undefined" && !window.componentSyncInterval) {
        // Track sync attempts
        let syncAttempts = 0;

        window.componentSyncInterval = setInterval(() => {
          syncAttempts++;

          // Get current sync state
          const modifiedCount =
            editor.storage.storagePersistence.modifiedSinceLastSync.size;

          if (modifiedCount > 0) {
            editor.storage.storagePersistence.syncAllToZustand();
          }

          // Also check for any deleted components
          const currentContent = editor.getJSON();
          editor.storage.storagePersistence.trackDeletedComponents(
            currentContent
          );

          // After 10 attempts, if nothing to sync, reduce frequency
          if (syncAttempts > 10 && modifiedCount === 0) {
            clearInterval(window.componentSyncInterval);

            // Set up less frequent background sync
            window.componentSyncInterval = setInterval(() => {
              if (
                editor.storage.storagePersistence.modifiedSinceLastSync.size > 0
              ) {
                editor.storage.storagePersistence.syncAllToZustand();
              }

              // Still check for deleted components
              const currentContent = editor.getJSON();
              editor.storage.storagePersistence.trackDeletedComponents(
                currentContent
              );
            }, 5000); // Every 5 seconds
          }
        }, 1000); // Initially every second
      }
    } catch (e) {
      console.error("Error in storagePersistence onTransaction:", e);
    }
  },
});

// Add global type declarations
declare global {
  interface Window {
    componentSyncInterval?: NodeJS.Timeout;
    registerEditorComponentPersistence?: (
      editorId: string,
      componentId: string,
      type: string,
      props: any
    ) => boolean;
    __ZUSTAND_STORE__?: any;
  }
}

// src/components/NaturalLanguageEditor/debug-tools.js

/**
 * A debugging tool to help diagnose and fix persistence issues with the NaturalLanguageEditor
 */
export const createPersistenceDebugger = (editorId) => {
  if (typeof window === "undefined") return null;

  const debugTool = {
    /**
     * Get the current state of components in various storage systems
     */
    checkComponentState() {
      const results = {
        editorStorage: null,
        zustandStore: null,
        localStorage: null,
      };

      // 1. Check editor's storage persistence
      if (window.editorInstance?.storage?.storagePersistence) {
        const storage = window.editorInstance.storage.storagePersistence;
        results.editorStorage = {
          componentCount: storage.componentRegistry.size,
          components: Array.from(storage.componentRegistry.entries()).map(
            ([id, data]) => ({
              id,
              type: data.type,
              lastUpdated: new Date(data.lastUpdated).toISOString(),
            })
          ),
        };
      }

      // 2. Check Zustand store
      if (window.__ZUSTAND_STORE__) {
        const state = window.__ZUSTAND_STORE__.getState();

        if (state.editor_components) {
          const components = state.editor_components.components || {};
          const componentValues = state.editor_components.componentValues || {};
          const actionInputFormValues = state.action_input_form_values || {};

          // Find filter triplet values
          const filterTripletValues = Object.keys(actionInputFormValues)
            .filter(
              (key) => key.includes("embedded-component-") && key.includes("_")
            )
            .map((key) => ({
              key,
              componentId: key.split("_")[0].replace("embedded-component-", ""),
              values: actionInputFormValues[key],
            }));

          results.zustandStore = {
            componentCount: Object.keys(components).length,
            components: Object.entries(components).map(([id, data]) => ({
              id,
              type: data.type,
              editorId: data.editorId,
              lastUpdated: data.lastUpdated,
            })),
            componentValuesCount: Object.keys(componentValues).length,
            filterTripletValuesCount: filterTripletValues.length,
          };
        }
      }

      // 3. Check localStorage persistence
      try {
        const localStorageData = localStorage.getItem("dpw-store");
        if (localStorageData) {
          const parsed = JSON.parse(localStorageData);
          results.localStorage = {
            exists: true,
            hasEditorComponents: !!(
              parsed.state && parsed.state.editor_components
            ),
            componentCount: Object.keys(
              parsed.state?.editor_components?.components || {}
            ).length,
            timestamp: parsed.timestamp,
          };
        } else {
          results.localStorage = { exists: false };
        }
      } catch (e) {
        results.localStorage = { error: e.message };
      }

      return results;
    },

    /**
     * Scan document content to find components
     */
    scanEditorContent() {
      if (!window.editorInstance) return { error: "Editor instance not found" };

      try {
        const content = window.editorInstance.getJSON();
        const contentStr = JSON.stringify(content);

        // Extract component IDs from content
        const extractComponentIds = (content) => {
          const ids = [];
          const traverse = (node) => {
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

        const componentIds = extractComponentIds(content);

        return {
          documentHasComponents: contentStr.includes("embeddedComponent"),
          componentCount: componentIds.length,
          componentIds,
        };
      } catch (e) {
        return { error: e.message };
      }
    },

    /**
     * Find components in storage that aren't in the document
     */
    findOrphanedComponents() {
      if (!window.editorInstance) return { error: "Editor instance not found" };

      try {
        const content = window.editorInstance.getJSON();
        const components = this.checkComponentState();
        const documentScan = this.scanEditorContent();

        // Find components in storage but not in document
        const orphanedInEditor = [];
        if (components.editorStorage && components.editorStorage.components) {
          components.editorStorage.components.forEach((comp) => {
            if (!documentScan.componentIds.includes(comp.id)) {
              orphanedInEditor.push(comp.id);
            }
          });
        }

        // Find components in Zustand but not in document
        const orphanedInZustand = [];
        if (components.zustandStore && components.zustandStore.components) {
          components.zustandStore.components.forEach((comp) => {
            if (!documentScan.componentIds.includes(comp.id)) {
              orphanedInZustand.push(comp.id);
            }
          });
        }

        return {
          orphanedInEditor,
          orphanedInZustand,
          orphanedCount: {
            editor: orphanedInEditor.length,
            zustand: orphanedInZustand.length,
          },
        };
      } catch (e) {
        return { error: e.message };
      }
    },

    /**
     * Clean up orphaned components from all storage
     */
    cleanupOrphanedComponents() {
      const orphaned = this.findOrphanedComponents();
      if (orphaned.error) return { error: orphaned.error };

      let cleanupCount = 0;

      // Combine all orphaned IDs
      const allOrphaned = [
        ...new Set([
          ...(orphaned.orphanedInEditor || []),
          ...(orphaned.orphanedInZustand || []),
        ]),
      ];

      // Remove each orphaned component
      allOrphaned.forEach((id) => {
        // Remove from editor storage
        if (window.editorInstance?.storage?.storagePersistence) {
          window.editorInstance.storage.storagePersistence.removeComponent(id);
          cleanupCount++;
        }

        // Remove from Zustand
        if (window.__ZUSTAND_STORE__) {
          const state = window.__ZUSTAND_STORE__.getState();
          if (typeof state.removeEditorComponent === "function") {
            state.removeEditorComponent(id);
            cleanupCount++;
          }
        }
      });

      return {
        cleanupCount,
        orphanedCount: allOrphaned.length,
        message: `Cleaned up ${cleanupCount} references to ${allOrphaned.length} orphaned components`,
      };
    },

    /**
     * Force a full sync between editor and storage
     */
    forceSyncEditorToStorage() {
      if (!window.editorInstance) return { error: "Editor instance not found" };

      try {
        // Get current document content and component IDs
        const content = window.editorInstance.getJSON();
        const documentScan = this.scanEditorContent();

        // Sync each component found in document
        let syncCount = 0;
        documentScan.componentIds.forEach((id) => {
          // Find component in document
          let componentData = null;
          const traverse = (node) => {
            if (
              node.type === "embeddedComponent" &&
              node.attrs &&
              node.attrs.id === id
            ) {
              componentData = {
                id,
                type: node.attrs.type,
                props: node.attrs.props,
                formKey: node.attrs.formKey,
              };
              return true;
            }
            if (node.content && Array.isArray(node.content)) {
              for (const child of node.content) {
                if (traverse(child)) return true;
              }
            }
            return false;
          };

          if (content.content && Array.isArray(content.content)) {
            for (const node of content.content) {
              if (traverse(node)) break;
            }
          }

          // If component data was found, sync it
          if (componentData) {
            // Sync to editor storage
            if (window.editorInstance.storage.storagePersistence) {
              window.editorInstance.storage.storagePersistence.registerComponent(
                id,
                componentData.type,
                componentData.props
              );
              syncCount++;
            }

            // Sync to Zustand
            if (window.__ZUSTAND_STORE__) {
              const store = window.__ZUSTAND_STORE__;
              const state = store.getState();
              if (typeof state.registerEditorComponent === "function") {
                state.registerEditorComponent(
                  editorId,
                  id,
                  componentData.type,
                  componentData.props
                );
                syncCount++;
              }
            }
          }
        });

        // Also clean up any orphaned components
        const cleanup = this.cleanupOrphanedComponents();

        return {
          syncCount,
          componentCount: documentScan.componentCount,
          cleanup,
          message: `Synced ${syncCount} components from editor to storage`,
        };
      } catch (e) {
        return { error: e.message };
      }
    },

    /**
     * Run a comprehensive diagnostic and fix routine
     */
    runDiagnostic() {
      const state = this.checkComponentState();
      const documentScan = this.scanEditorContent();
      const orphaned = this.findOrphanedComponents();

      console.log("======= NATURAL LANGUAGE EDITOR DIAGNOSTIC =======");
      console.log("1. Current State:", state);
      console.log("2. Document Scan:", documentScan);
      console.log("3. Orphaned Components:", orphaned);

      // If there are orphaned components, clean them up
      if (
        orphaned.orphanedCount &&
        (orphaned.orphanedCount.editor > 0 ||
          orphaned.orphanedCount.zustand > 0)
      ) {
        console.log("Cleaning up orphaned components...");
        const cleanup = this.cleanupOrphanedComponents();
        console.log("Cleanup result:", cleanup);
      }

      // Force sync from editor to storage
      console.log("Forcing sync from editor to storage...");
      const sync = this.forceSyncEditorToStorage();
      console.log("Sync result:", sync);

      // Final check
      const finalState = this.checkComponentState();
      console.log("Final state after fixes:", finalState);

      return {
        initialState: state,
        documentScan,
        orphaned,
        syncResult: sync,
        finalState,
      };
    },
  };

  // Register the debugger globally for console access
  window.editorPersistenceDebugger = debugTool;
  console.log(
    "Editor persistence debugger attached to window.editorPersistenceDebugger"
  );

  return debugTool;
};

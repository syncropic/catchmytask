// src/components/utils/debug-persistence.ts
// Add this utility file to help debug and repair persistence issues

/**
 * Debug tool to help diagnose and fix persistence issues with embedded components
 */
export const createDebugPersistenceTool = () => {
  if (typeof window === "undefined") return null;

  const tool = {
    /**
     * Check the Zustand store for component data
     */
    checkComponentStore() {
      try {
        if (!window.__ZUSTAND_STORE__) {
          console.error("Zustand store not found on window");
          return { error: "Store not found" };
        }

        const state = window.__ZUSTAND_STORE__.getState();
        if (!state.editor_components) {
          console.error("No editor_components in store state");
          return { error: "No editor_components in store" };
        }

        return {
          components: Object.keys(state.editor_components.components || {})
            .length,
          content: Object.keys(state.editor_components.editorContent || {})
            .length,
          componentValues: Object.keys(
            state.editor_components.componentValues || {}
          ).length,
          actionValues: this.countFilterTripletValues(state),
        };
      } catch (e) {
        console.error("Error checking component store:", e);
        return { error: e.message };
      }
    },

    /**
     * Count FilterInputTriplet values in the action_input_form_values
     */
    countFilterTripletValues(state) {
      try {
        const formValues = state.action_input_form_values || {};
        const tripletKeys = Object.keys(formValues).filter(
          (key) => key.startsWith("embedded-component-") && key.includes("_")
        );

        return tripletKeys.length;
      } catch (e) {
        console.error("Error counting filter triplet values:", e);
        return 0;
      }
    },

    /**
     * Find orphaned values (values without components)
     */
    findOrphanedValues() {
      try {
        if (!window.__ZUSTAND_STORE__) return { error: "Store not found" };

        const state = window.__ZUSTAND_STORE__.getState();
        const components = state.editor_components?.components || {};
        const formValues = state.action_input_form_values || {};

        // Find all filter triplet form keys
        const tripletKeys = Object.keys(formValues).filter(
          (key) => key.startsWith("embedded-component-") && key.includes("_")
        );

        // Check if the component exists for each form key
        const orphaned = tripletKeys.filter((key) => {
          const [formKeyPart] = key.split("_");
          const componentId = formKeyPart.replace("embedded-component-", "");
          return !components[componentId];
        });

        return {
          total: tripletKeys.length,
          orphaned: orphaned.length,
          orphanedKeys: orphaned,
        };
      } catch (e) {
        console.error("Error finding orphaned values:", e);
        return { error: e.message };
      }
    },

    /**
     * Verify that all components have their values properly stored
     */
    verifyComponentValues() {
      try {
        if (!window.__ZUSTAND_STORE__) return { error: "Store not found" };

        const state = window.__ZUSTAND_STORE__.getState();
        const components = state.editor_components?.components || {};
        const formValues = state.action_input_form_values || {};

        // Find all FilterInputTriplet components
        const tripletComponents = Object.entries(components)
          .filter(([_, comp]) => comp.type === "FilterInputTriplet")
          .map(([id, comp]) => ({
            id,
            variableValue: comp.props?.variable?.value,
            hasValues: !!comp.props?.values,
          }))
          .filter((comp) => comp.variableValue); // Only include those with a variable

        // Check if values exist for each component
        const results = tripletComponents.map((comp) => {
          const formKey = `embedded-component-${comp.id}_${comp.variableValue}`;
          const hasFormValues = !!formValues[formKey];

          return {
            componentId: comp.id,
            variableValue: comp.variableValue,
            hasComponentValues: comp.hasValues,
            hasFormValues,
            formKey,
            isComplete: comp.hasValues || hasFormValues,
          };
        });

        return {
          total: tripletComponents.length,
          complete: results.filter((r) => r.isComplete).length,
          incomplete: results.filter((r) => !r.isComplete).length,
          details: results,
        };
      } catch (e) {
        console.error("Error verifying component values:", e);
        return { error: e.message };
      }
    },

    /**
     * Try to repair any issues found in the persistence
     */
    repairPersistence() {
      try {
        if (!window.__ZUSTAND_STORE__) return { error: "Store not found" };

        const state = window.__ZUSTAND_STORE__.getState();
        const setActionInputFormValues = state.setActionInputFormValues;

        if (!setActionInputFormValues) {
          return { error: "setActionInputFormValues function not found" };
        }

        // Find orphaned values and component issues
        const orphanedInfo = this.findOrphanedValues();
        const componentInfo = this.verifyComponentValues();

        let fixedCount = 0;

        // Fix incomplete components
        if (componentInfo.incomplete > 0) {
          const incomplete = componentInfo.details.filter((d) => !d.isComplete);

          // Create values for incomplete components
          const valuesToAdd = {};

          incomplete.forEach((item) => {
            // Create default values
            valuesToAdd[item.formKey] = {
              field: item.variableValue,
              operator: "equals",
              value: null,
              value2: null,
              _repaired: true,
              _repairedAt: new Date().toISOString(),
            };

            fixedCount++;
          });

          // Update the store
          if (Object.keys(valuesToAdd).length > 0) {
            setActionInputFormValues((prevValues) => ({
              ...prevValues,
              ...valuesToAdd,
            }));
          }
        }

        return {
          message: `Fixed ${fixedCount} persistence issues`,
          orphanedInfo,
          componentInfo,
          fixedCount,
        };
      } catch (e) {
        console.error("Error repairing persistence:", e);
        return { error: e.message };
      }
    },

    /**
     * Run a complete diagnostic
     */
    runDiagnostic() {
      return {
        storeStatus: this.checkComponentStore(),
        orphanedValues: this.findOrphanedValues(),
        componentValues: this.verifyComponentValues(),
      };
    },
  };

  // Expose the tool on the window object for console access
  window.componentPersistenceTool = tool;
  console.log(
    "Component persistence debug tool attached to window.componentPersistenceTool"
  );

  return tool;
};

// Add the type definition
declare global {
  interface Window {
    componentPersistenceTool?: any;
  }
}

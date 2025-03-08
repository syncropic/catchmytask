// src/components/NaturalLanguageEditor/EmbeddedComponentView.tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { getComponentByResourceType } from "@components/Utils";
import { useAppStore } from "src/store";
import FilterInputTriplet from "./FilterInputTriplet";
import { safeParseDate } from "../Utils/dateUtils";
import { isEqual, cloneDeep } from "lodash";

// Debug configuration - disabled in production
const DEBUG = process.env.NODE_ENV !== "production" && {
  ENABLE_ALL: true,
  LOG_LIFECYCLE: true,
  INSPECT_NODE: false,
  CHECK_DOM: false,
  TRACK_PARENT_CHANGES: false,
  LOG_TIMESTAMPS: true,
};

// Debug helper function to log with timestamps only in development
const debugLog = (message: string, data: any = null) => {
  if (process.env.NODE_ENV === "production" || !DEBUG?.ENABLE_ALL) return;

  const timestamp = DEBUG.LOG_TIMESTAMPS
    ? `[${new Date().toISOString().slice(11, 23)}] `
    : "";

  if (data) {
    console.log(`${timestamp}VIEW-DEBUG: ${message}`, data);
  } else {
    console.log(`${timestamp}VIEW-DEBUG: ${message}`);
  }
};

// Create a memoized version of the component to prevent unnecessary re-renders
export const EmbeddedComponentView = React.memo(
  (props: NodeViewProps) => {
    const { node, updateAttributes, editor, getPos } = props;
    const {
      type: componentType,
      props: componentProps,
      id,
      formKey,
    } = node.attrs;

    // Get the store values with a proper selector
    const { action_input_form_values, setActionInputFormValues } =
      useAppStore();

    // Store necessary refs for update tracking
    const componentRef = useRef<HTMLDivElement>(null);
    const isFilterTriplet = componentType === "FilterInputTriplet";
    const mountTimeRef = useRef(Date.now());
    const parentNodeRef = useRef<Element | null>(null);
    const initialRenderCompleteRef = useRef(false);
    const isUpdatingRef = useRef(false);
    const previousValueRef = useRef<any>(null);
    const rehydrationAttemptedRef = useRef(false);
    const valueRestoredRef = useRef(false);
    const lastValuesUpdateTimestampRef = useRef<number>(Date.now());
    const lastPropsUpdateTimestampRef = useRef<number>(Date.now());
    const componentWasRemovedRef = useRef(false);

    // Use local state to minimize reliance on the global store
    const [localValue, setLocalValue] = useState(componentProps?.value || null);

    // Get the component values from the store with safety checks
    const storedValues = useMemo(
      () => action_input_form_values?.[formKey] || {},
      [action_input_form_values, formKey]
    );

    // Helper function to check if node exists in the editor - memoized to prevent recreation
    const checkNodeExistence = useCallback(() => {
      if (!editor || typeof getPos !== "function") return;

      try {
        const position = getPos();
        const currentNode = editor.state.doc.nodeAt(position);

        if (currentNode) {
          debugLog(
            `Node at position ${position} still exists:`,
            currentNode.attrs
          );
        } else {
          debugLog(
            `Node at position ${position} no longer exists in document!`
          );
          componentWasRemovedRef.current = true;
        }
      } catch (error) {
        debugLog("Error checking node existence:", error);
      }
    }, [editor, getPos]);

    // Check for DOM parent changes - memoized to prevent recreation
    const checkParentChanges = useCallback(() => {
      if (!componentRef.current || !DEBUG?.TRACK_PARENT_CHANGES) return;

      const currentParent = componentRef.current.parentElement;

      if (!parentNodeRef.current) {
        parentNodeRef.current = currentParent;
        debugLog("Initial parent node:", currentParent);
      } else if (parentNodeRef.current !== currentParent) {
        debugLog("Parent node changed!", {
          oldParent: parentNodeRef.current,
          newParent: currentParent,
        });
        parentNodeRef.current = currentParent;
      }
    }, []);

    // IMPROVED: More robust triplet value restoration
    const restoreTripletValues = useCallback(() => {
      if (
        !isFilterTriplet ||
        !componentProps.variable ||
        valueRestoredRef.current ||
        componentWasRemovedRef.current
      )
        return false;

      const tripletFormKey = `${formKey}_${componentProps.variable.value}`;
      const storedTripletValues = action_input_form_values[tripletFormKey];

      if (storedTripletValues && Object.keys(storedTripletValues).length > 0) {
        debugLog(
          `Restoring stored values for triplet ${id}:`,
          storedTripletValues
        );

        // Skip update if we're already updating
        if (!isUpdatingRef.current) {
          isUpdatingRef.current = true;
          valueRestoredRef.current = true;
          lastValuesUpdateTimestampRef.current = Date.now();

          // Make a deep clone to avoid reference issues
          const safeValues = cloneDeep(storedTripletValues);

          // Update node attributes to reflect stored values
          updateAttributes({
            props: {
              ...componentProps,
              values: safeValues,
            },
          });

          // Also register in storage persistence
          if (editor && editor.storage && editor.storage.storagePersistence) {
            editor.storage.storagePersistence.registerComponent(
              id,
              componentType,
              {
                ...componentProps,
                values: safeValues,
              }
            );
            debugLog(`Values restored for ${id} in storage persistence`);
          }

          // Ensure global registration too if available
          if (
            window.registerEditorComponentPersistence &&
            editor.options.element?.dataset?.editorId
          ) {
            const editorId = editor.options.element.dataset.editorId;
            window.registerEditorComponentPersistence(
              editorId,
              id,
              componentType,
              {
                ...componentProps,
                values: safeValues,
              }
            );
          }

          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 50);

          return true;
        }
      } else {
        debugLog(`No stored values found for triplet ${id}`);
      }

      return false;
    }, [
      id,
      editor,
      componentType,
      componentProps,
      formKey,
      action_input_form_values,
      updateAttributes,
    ]);

    // Effect to rehydrate component values from Zustand store on mount
    useEffect(() => {
      if (rehydrationAttemptedRef.current || componentWasRemovedRef.current)
        return;
      rehydrationAttemptedRef.current = true;

      debugLog(`Attempting to rehydrate component values for ${id}`);

      // For filter triplet components, more aggressive restoration
      if (isFilterTriplet) {
        // First attempt immediate restoration
        const restored = restoreTripletValues();

        if (!restored) {
          // If not restored, try again after a delay to ensure store is loaded
          setTimeout(() => {
            if (!valueRestoredRef.current && !componentWasRemovedRef.current) {
              restoreTripletValues();
            }
          }, 500);
        }
      } else {
        // For regular components
        const storedValue = storedValues?.value;
        if (storedValue !== undefined && storedValue !== null) {
          debugLog(`Found stored value for component ${id}:`, storedValue);

          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true;
            valueRestoredRef.current = true;
            lastValuesUpdateTimestampRef.current = Date.now();

            // Set local value
            setLocalValue(storedValue);

            // Update node attributes
            updateAttributes({
              props: {
                ...componentProps,
                value: storedValue,
              },
            });

            // Register in storage persistence
            if (editor && editor.storage && editor.storage.storagePersistence) {
              editor.storage.storagePersistence.registerComponent(
                id,
                componentType,
                {
                  ...componentProps,
                  value: storedValue,
                }
              );
            }

            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 50);
          }
        }
      }
    }, [
      id,
      editor,
      componentType,
      componentProps,
      formKey,
      action_input_form_values,
      storedValues,
      restoreTripletValues,
    ]);

    // Register component in storage for persistence on mount - ONCE only
    useEffect(() => {
      // Skip if component was removed
      if (componentWasRemovedRef.current) return;

      // Register this component with the StoragePersistenceExtension - ONCE only
      if (editor && editor.storage && editor.storage.storagePersistence) {
        // If it's a filter triplet, check for existing values in Zustand
        if (isFilterTriplet && componentProps.variable) {
          const tripletFormKey = `${formKey}_${componentProps.variable.value}`;
          const existingValues = action_input_form_values[tripletFormKey];

          if (existingValues && Object.keys(existingValues).length > 0) {
            // Register with existing values
            editor.storage.storagePersistence.registerComponent(
              id,
              componentType,
              {
                ...componentProps,
                values: cloneDeep(existingValues),
              }
            );
            debugLog(
              `Component ${id} registered in storage with existing values`
            );
          } else {
            // Register with default props
            editor.storage.storagePersistence.registerComponent(
              id,
              componentType,
              componentProps
            );
            debugLog(
              `Component ${id} registered in storage with default props`
            );
          }
        } else {
          // Regular component registration
          editor.storage.storagePersistence.registerComponent(
            id,
            componentType,
            componentProps
          );
          debugLog(`Component ${id} registered in storage on mount`);
        }
      }

      // Check regularly if the component still exists in the document
      const checkExistenceInterval = setInterval(() => {
        if (editor && typeof getPos === "function") {
          try {
            const position = getPos();
            const currentNode = editor.state.doc.nodeAt(position);

            if (!currentNode) {
              componentWasRemovedRef.current = true;
              clearInterval(checkExistenceInterval);

              // Clean up component from Zustand store
              if (window.__ZUSTAND_STORE__) {
                const store = window.__ZUSTAND_STORE__;
                const state = store.getState();

                if (typeof state.removeEditorComponent === "function") {
                  state.removeEditorComponent(id);
                  debugLog(
                    `Removed component ${id} from Zustand store - detected absence`
                  );
                }
              }
            }
          } catch (error) {
            // If we can't get position, component likely doesn't exist anymore
            componentWasRemovedRef.current = true;
            clearInterval(checkExistenceInterval);
          }
        }
      }, 5000);

      return () => {
        clearInterval(checkExistenceInterval);
      };
    }, []);

    // Log component lifecycle events and initialize values
    useEffect(() => {
      const mountTime = mountTimeRef.current;
      const mountDuration = Date.now() - mountTime;

      debugLog(`EmbeddedComponent mounted/updated: ${componentType}`, {
        id,
        formKey,
        componentProps,
        mountDuration,
      });

      // For FilterInputTriplet components, ensure they're registered in the store
      if (isFilterTriplet && componentProps.variable) {
        const tripletFormKey = `${formKey}_${componentProps.variable.value}`;

        // Check if we need to initialize this filter triplet in the store
        if (!action_input_form_values[tripletFormKey]) {
          debugLog("Initializing filter triplet in store:", tripletFormKey);

          // Initialize with basic values to ensure it stays in the DOM
          const initialValues = {
            field: componentProps.variable.value,
            operator: "equals",
            value: null,
            value2: null,
            _debug: {
              mountTime,
              componentId: id,
            },
          };

          // Batch updates to avoid multiple re-renders
          setTimeout(() => {
            // Using a callback form to prevent referencing old state
            setActionInputFormValues((prev) => ({
              ...prev,
              [tripletFormKey]: initialValues,
            }));

            // Mark initial render as complete
            initialRenderCompleteRef.current = true;
          }, 0);
        } else {
          // Already exists in store, just mark render as complete
          initialRenderCompleteRef.current = true;
        }
      } else {
        // Not a filter triplet, mark render as complete immediately
        initialRenderCompleteRef.current = true;
      }

      // Setup periodic checking of components if debug is enabled
      let intervalId: any;
      if (DEBUG?.INSPECT_NODE || DEBUG?.TRACK_PARENT_CHANGES) {
        intervalId = setInterval(() => {
          if (DEBUG?.TRACK_PARENT_CHANGES) checkParentChanges();
          if (DEBUG?.INSPECT_NODE) checkNodeExistence();
        }, 1000);
      }

      // Cleanup function to handle component unmounting
      return () => {
        const unmountTime = Date.now();
        const lifetimeDuration = unmountTime - mountTime;

        debugLog(`EmbeddedComponent unmounting: ${componentType}`, {
          id,
          formKey,
          lifetimeDuration: `${lifetimeDuration}ms`,
        });

        // IMPORTANT: When a component is unmounted because of deletion,
        // ensure it's removed from all storage systems
        try {
          // 1. Remove from editor storage persistence
          if (editor && editor.storage && editor.storage.storagePersistence) {
            editor.storage.storagePersistence.removeComponent(id);
            debugLog(
              `Removed component ${id} from storage persistence during unmount`
            );
          }

          // 2. Remove from Zustand store
          if (typeof window !== "undefined" && window.__ZUSTAND_STORE__) {
            const store = window.__ZUSTAND_STORE__;
            const state = store.getState();

            if (typeof state.removeEditorComponent === "function") {
              state.removeEditorComponent(id);
              debugLog(
                `Removed component ${id} from Zustand store during unmount`
              );
            }
          }
        } catch (error) {
          console.error(
            `Error cleaning up component ${id} during unmount:`,
            error
          );
        }

        // Clean up any intervals
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, []);

    // Handle component value changes with careful equality checks to prevent loops
    const handleChange = useCallback(
      (value: any) => {
        // Skip if we're already updating or component was removed to prevent infinite loops
        if (isUpdatingRef.current || componentWasRemovedRef.current) return;

        // Check for actual value change to avoid unnecessary updates
        if (isEqual(previousValueRef.current, value)) return;

        debugLog(`Component value changed: ${componentType}`, { value });

        // Mark that we're updating to prevent loops
        isUpdatingRef.current = true;
        lastValuesUpdateTimestampRef.current = Date.now();

        // Update the local state first
        setLocalValue(value);
        previousValueRef.current = value;

        // Process different types of values
        let processedValue = value;

        // Special handling for date values
        if (componentType === "DateInput" && value instanceof Date) {
          try {
            processedValue = value.toISOString();
          } catch (e) {
            processedValue = null;
          }
        }

        // Update the Zustand store using callback form to ensure fresh state
        setActionInputFormValues((prevValues) => {
          // Only create a new object if the value is actually different
          if (!isEqual(prevValues[formKey]?.value, processedValue)) {
            return {
              ...prevValues,
              [formKey]: {
                ...(prevValues[formKey] || {}),
                value: processedValue,
                _updated: Date.now(),
              },
            };
          }
          return prevValues; // Return unchanged if values are equal
        });

        // Update component props in the node
        updateAttributes({
          props: {
            ...componentProps,
            value: processedValue,
          },
        });
        lastPropsUpdateTimestampRef.current = Date.now();

        // Update the storage persistence only when values actually change
        if (editor && editor.storage.storagePersistence) {
          const existingComponent =
            editor.storage.storagePersistence.getComponent(id);
          const existingValue = existingComponent?.props?.value;

          // Only update storage if the value has actually changed
          if (!isEqual(existingValue, processedValue)) {
            const updatedProps = {
              ...componentProps,
              value: processedValue,
            };
            editor.storage.storagePersistence.registerComponent(
              id,
              componentType,
              updatedProps
            );
          }
        }

        // Reset updating flag after a brief delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      },
      [componentType, formKey, componentProps, updateAttributes, editor, id]
    );

    // Special handler for FilterInputTriplet components that have more complex values
    const handleFilterTripletChange = useCallback(
      (values: any) => {
        // Skip if we're already updating to prevent infinite loops
        if (isUpdatingRef.current || componentWasRemovedRef.current) return;

        // Check if values actually changed to avoid unnecessary updates
        if (isEqual(previousValueRef.current, values)) return;

        debugLog("Filter triplet values changed:", values);

        // Skip updates until initial render is complete to prevent race conditions
        if (!initialRenderCompleteRef.current) {
          debugLog(
            "Skipping triplet update because initial render not complete"
          );
          return;
        }

        // Mark that we're updating to prevent loops
        isUpdatingRef.current = true;
        previousValueRef.current = cloneDeep(values); // Use deep clone to avoid reference issues
        valueRestoredRef.current = true; // Mark as having valid values
        lastValuesUpdateTimestampRef.current = Date.now();

        // The triplet form key includes the variable name
        const tripletFormKey = `${formKey}_${componentProps.variable.value}`;

        // IMPORTANT: Add debug info to track values
        const enhancedValues = {
          ...values,
          _debug: {
            updateTime: new Date().toISOString(),
            componentId: id,
          },
        };

        // Update the Zustand store using callback form to ensure fresh state
        setActionInputFormValues((prevValues) => {
          // Only create a new object if the values are actually different
          if (!isEqual(prevValues[tripletFormKey], enhancedValues)) {
            return {
              ...prevValues,
              [tripletFormKey]: cloneDeep(enhancedValues), // Deep clone to avoid reference issues
            };
          }
          return prevValues; // Return unchanged if values are equal
        });

        // Update component props in the node
        updateAttributes({
          props: {
            ...componentProps,
            values: cloneDeep(enhancedValues), // Deep clone to avoid reference issues
          },
        });
        lastPropsUpdateTimestampRef.current = Date.now();

        // Update the storage persistence only if values actually changed
        if (editor && editor.storage.storagePersistence) {
          const existingComponent =
            editor.storage.storagePersistence.getComponent(id);
          const existingValues = existingComponent?.props?.values;

          // Check if values have actually changed (basic comparison)
          const hasChanged =
            !existingValues || !isEqual(existingValues, enhancedValues);

          if (hasChanged) {
            const updatedProps = {
              ...componentProps,
              values: cloneDeep(enhancedValues), // Deep clone to avoid reference issues
              variable: componentProps.variable,
            };
            editor.storage.storagePersistence.registerComponent(
              id,
              componentType,
              updatedProps
            );
          }
        }

        // Also register in global persistence if available
        if (
          window.registerEditorComponentPersistence &&
          editor.options.element?.dataset?.editorId
        ) {
          const editorId = editor.options.element.dataset.editorId;
          window.registerEditorComponentPersistence(
            editorId,
            id,
            componentType,
            {
              ...componentProps,
              values: cloneDeep(enhancedValues), // Deep clone to avoid reference issues
              variable: componentProps.variable,
            }
          );
          debugLog(`Component ${id} synced to global persistence store`);
        }

        // Reset updating flag after a brief delay
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      },
      [formKey, componentProps, id, updateAttributes, editor]
    );

    // Handle clear for FilterInputTriplet
    const handleFilterTripletClear = useCallback(() => {
      // Skip if we're already updating to prevent infinite loops
      if (isUpdatingRef.current || componentWasRemovedRef.current) return;

      debugLog("Filter triplet cleared");

      // Mark that we're updating to prevent loops
      isUpdatingRef.current = true;
      lastValuesUpdateTimestampRef.current = Date.now();

      // The triplet form key includes the variable name
      const tripletFormKey = `${formKey}_${componentProps.variable.value}`;

      // Prepare reset values
      const resetValues = {
        field: componentProps.variable.value,
        operator: "equals",
        value: null,
        value2: null,
        _debug: {
          clearTime: new Date().toISOString(),
          componentId: id,
        },
      };
      previousValueRef.current = resetValues;

      // Clear values in the Zustand store using callback form
      setActionInputFormValues((prevValues) => ({
        ...prevValues,
        [tripletFormKey]: cloneDeep(resetValues), // Deep clone to avoid reference issues
      }));

      // Update component props in the node
      updateAttributes({
        props: {
          ...componentProps,
          values: {
            field: componentProps.variable.value,
            operator: "equals",
            value: null,
            value2: null,
          },
        },
      });
      lastPropsUpdateTimestampRef.current = Date.now();

      // Update storage persistence too
      if (editor && editor.storage.storagePersistence) {
        const updatedProps = {
          ...componentProps,
          values: {
            field: componentProps.variable.value,
            operator: "equals",
            value: null,
            value2: null,
          },
        };
        editor.storage.storagePersistence.registerComponent(
          id,
          componentType,
          updatedProps
        );
      }

      // Also update in global persistence if available
      if (
        window.registerEditorComponentPersistence &&
        editor.options.element?.dataset?.editorId
      ) {
        const editorId = editor.options.element.dataset.editorId;
        window.registerEditorComponentPersistence(editorId, id, componentType, {
          ...componentProps,
          values: {
            field: componentProps.variable.value,
            operator: "equals",
            value: null,
            value2: null,
          },
        });
        debugLog(`Component ${id} clear synced to global persistence store`);
      }

      // Reset updating flag after a brief delay
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }, [formKey, componentProps, id, updateAttributes, editor]);

    // Setup a watchdog to ensure values are persisted
    useEffect(() => {
      // Only for FilterInputTriplet components
      if (!isFilterTriplet || componentWasRemovedRef.current) return;

      const valueWatchdogInterval = setInterval(() => {
        // Check if we need to re-sync values to ensure persistence
        const timeSinceLastValuesUpdate =
          Date.now() - lastValuesUpdateTimestampRef.current;
        const timeSinceLastPropsUpdate =
          Date.now() - lastPropsUpdateTimestampRef.current;

        // If it's been more than 10 seconds since the last value update and
        // node attributes were updated more recently than values, sync to store
        if (
          timeSinceLastValuesUpdate > 10000 &&
          lastPropsUpdateTimestampRef.current >
            lastValuesUpdateTimestampRef.current
        ) {
          // Get the current values from node props
          const tripletFormKey = `${formKey}_${componentProps.variable.value}`;

          // If component has values in props, ensure they're in the store
          if (componentProps.values && !isUpdatingRef.current) {
            debugLog(`Watchdog: re-syncing values for ${id} to store`);

            // Update the store
            setActionInputFormValues((prevValues) => {
              if (!isEqual(prevValues[tripletFormKey], componentProps.values)) {
                return {
                  ...prevValues,
                  [tripletFormKey]: cloneDeep({
                    ...componentProps.values,
                    _debug: {
                      syncedByWatchdog: true,
                      timestamp: new Date().toISOString(),
                    },
                  }),
                };
              }
              return prevValues;
            });

            lastValuesUpdateTimestampRef.current = Date.now();
          }
        }
      }, 5000);

      return () => {
        clearInterval(valueWatchdogInterval);
      };
    }, [isFilterTriplet, componentProps, formKey, id]);

    const handleContainerEvents = useCallback((e: React.SyntheticEvent) => {
      // Only stop propagation for click and mouse events to prevent editor selection issues
      // DO NOT prevent propagation for keyboard events which are needed for typing
      if (e.type === "click" || e.type === "mousedown") {
        e.stopPropagation();
        // Only prevent default for mousedown to avoid selection issues
        // but allow other events to behave normally
        if (e.type === "mousedown") {
          e.preventDefault();
        }
      }
    }, []);

    // If component was flagged as removed, don't render it
    if (componentWasRemovedRef.current) {
      return null;
    }

    // Special handling for FilterInputTriplet with enhanced stability measures
    if (isFilterTriplet && componentProps.variable) {
      // Get stored values for this triplet
      const tripletFormKey = `${formKey}_${componentProps.variable.value}`;
      const storedTripletValues = action_input_form_values[tripletFormKey];

      // Use values from props if available (usually the case after state restoration)
      const initialValues = componentProps.values || storedTripletValues;

      return (
        <NodeViewWrapper
          className="embedded-component filter-triplet-wrapper"
          data-component-id={id}
          data-component-type="filter-triplet"
          onClick={handleContainerEvents}
          onMouseDown={handleContainerEvents}
        >
          <div
            ref={componentRef}
            onClick={handleContainerEvents}
            onMouseDown={handleContainerEvents}
            className="embedded-component-container"
            data-filter-triplet-id={id}
            style={{ minHeight: "24px", minWidth: "200px" }}
          >
            <FilterInputTriplet
              variable={componentProps.variable}
              formKey={formKey}
              onChange={handleFilterTripletChange}
              onClear={handleFilterTripletClear}
              compact={componentProps.compact || false}
              initialValues={initialValues} // Pass stored or props values as initialValues
            />
          </div>
        </NodeViewWrapper>
      );
    }

    // Get the component by its type for other component types
    const Component = getComponentByResourceType(componentType);

    if (!Component) {
      return (
        <NodeViewWrapper>Unknown component: {componentType}</NodeViewWrapper>
      );
    }

    // Handle different value types
    const value = useMemo(() => {
      let val =
        storedValues.value !== undefined
          ? storedValues.value
          : localValue !== null
          ? localValue
          : componentProps?.value;

      // Special handling for DateInput values
      if (componentType === "DateInput" && val) {
        return safeParseDate(val);
      }

      return val;
    }, [storedValues.value, localValue, componentProps?.value, componentType]);

    // Prepare props with proper values
    const safeProps = useMemo(
      () => ({
        ...componentProps,
        onChange: handleChange,
        value,
        action_input_form_values_key: formKey,

        // For DateInput components, ensure we include proper date-related props
        ...(componentType === "DateInput"
          ? {
              clearable: true,
              valueFormat: "YYYY-MM-DD",
              popoverProps: { withinPortal: true },
            }
          : {}),
      }),
      [componentProps, handleChange, value, formKey, componentType]
    );

    return (
      <NodeViewWrapper
        className="embedded-component"
        data-component-id={id}
        data-component-type={componentType}
        onClick={handleContainerEvents}
        onMouseDown={handleContainerEvents}
      >
        <div
          ref={componentRef}
          onClick={handleContainerEvents}
          onKeyDown={handleContainerEvents}
          onMouseDown={handleContainerEvents}
          className="embedded-component-container"
        >
          <Component {...safeProps} />
        </div>
      </NodeViewWrapper>
    );
  },
  // Custom equality function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if the node attributes have actually changed
    return isEqual(prevProps.node.attrs, nextProps.node.attrs);
  }
);

// Set display name for easier debugging
EmbeddedComponentView.displayName = "EmbeddedComponentView";

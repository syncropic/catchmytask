// src/components/NaturalLanguageEditor/FilterInputTriplet.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Box, Group, Select, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { getComponentByResourceType } from "@components/Utils";
import { useAppStore } from "src/store";
import { Variable } from "@components/DynamicFilter";
import { debounce, isEqual, cloneDeep } from "lodash";
import dayjs from "dayjs";
import { DateInputProps } from "@mantine/dates";
import { safeParseDate } from "../Utils/dateUtils";

// Import operator mappings from DynamicFilter
const OPERATOR_MAP: Record<string, string[]> = {
  string: ["equals", "notEquals", "contains", "startsWith", "endsWith"],
  number: ["equals", "notEquals", "gt", "lt", "between"],
  datetime: ["equals", "before", "after", "between"],
  date: ["equals", "before", "after", "between"],
  boolean: ["equals"],
  select: ["equals", "notEquals"],
  multiselect: ["equals", "notEquals"],
  search: ["equals", "notEquals"],
  multisearch: ["equals", "notEquals"],
  attachments: ["equals", "notEquals"],
};

const OPERATOR_LABELS: Record<string, string> = {
  equals: "=",
  notEquals: "!=",
  contains: "Contains",
  startsWith: "Starts with",
  endsWith: "Ends with",
  gt: ">",
  lt: "<",
  between: "Between",
  before: "Before",
  after: "After",
};

interface FilterInputTripletProps {
  variable: Variable;
  formKey: string;
  onChange?: (values: any) => void;
  onClear?: () => void;
  compact?: boolean;
  initialValues?: any;
}

// Using React.memo with a custom equality function to prevent unnecessary re-renders
const FilterInputTriplet = React.memo(
  (props: FilterInputTripletProps) => {
    const {
      variable,
      formKey,
      onChange,
      onClear,
      compact = false,
      initialValues,
    } = props;

    // Use useRef to track if we're currently updating to prevent feedback loops
    const isUpdatingRef = useRef(false);
    const formRef = useRef<any>(null);
    const debouncedUpdateRef = useRef<any>(null);
    const previousValuesRef = useRef<any>(null);
    const hasInitializedRef = useRef(false);
    const persistenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true); // Track if component is mounted
    const formValuesUpdateCountRef = useRef(0); // Track number of form updates
    const lastValueUpdateTimeRef = useRef(Date.now()); // Track last time values were updated

    const { action_input_form_values, setActionInputFormValues } =
      useAppStore();

    // Generate a unique and stable form key for this triplet
    const tripletFormKey = `${formKey}_${variable.value}`;

    // Get stored values if they exist
    const storedValues = action_input_form_values[tripletFormKey] || {};

    // Debug logging function - only in development
    const debugLog = (message: string, data?: any) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `FilterInputTriplet [${tripletFormKey}]: ${message}`,
          data || ""
        );
      }
    };

    // Log component mounting
    useEffect(() => {
      debugLog("Component mounted", {
        initialValues,
        storedValues:
          Object.keys(storedValues).length > 0 ? storedValues : "none",
      });

      return () => {
        mountedRef.current = false;
        debugLog("Component unmounting");
        if (persistenceTimeoutRef.current) {
          clearTimeout(persistenceTimeoutRef.current);
        }
      };
    }, []);

    // Create default values, prioritizing:
    // 1. Explicit initialValues from props
    // 2. Values from Zustand store
    // 3. Base default values
    const defaultValues = useMemo(() => {
      // Start with basic defaults
      const baseDefaults = {
        field: variable.value,
        operator: OPERATOR_MAP[variable.type]?.[0] || "equals",
        value: null,
        value2: null,
      };

      let result;

      // Apply values in order of priority
      if (initialValues && Object.keys(initialValues).length > 0) {
        // Use explicit initialValues as highest priority
        result = { ...baseDefaults, ...initialValues };
        debugLog("Using explicit initialValues", result);
      } else if (storedValues && Object.keys(storedValues).length > 0) {
        // Fall back to stored values if available
        result = { ...baseDefaults, ...storedValues };
        debugLog("Using storedValues", result);
      } else {
        // Use base defaults if nothing else available
        result = baseDefaults;
        debugLog("Using base defaults", result);
      }

      // Always ensure field matches the current variable
      return { ...result, field: variable.value };
    }, [variable.value, variable.type, storedValues, initialValues]);

    // Setup form with robust error handling
    const form = useForm({
      defaultValues,
      onSubmit: ({ value }) => {
        // Nothing to do on submit - we update as values change
        debugLog("Form submitted", value);
      },
    });

    // Store form reference
    useEffect(() => {
      formRef.current = form;
      hasInitializedRef.current = true;

      return () => {
        debugLog("Unsubscribing from form store");
      };
    }, []);

    // Date parser for DateInput components
    const dateParser: DateInputProps["dateParser"] = (input) => {
      if (input === "WW2") {
        return new Date(1939, 8, 1);
      }
      if (typeof input === "string") {
        return dayjs(input, "DD/MM/YYYY").toDate();
      }
      return input;
    };

    // Create component based on variable type
    const getComponent = () => {
      let componentType = "TextInput";

      switch (variable.type) {
        case "number":
          componentType = "NumberInput";
          break;
        case "datetime":
        case "date":
          componentType = "DateInput";
          break;
        case "select":
          componentType = "Select";
          break;
        case "boolean":
          componentType = "Checkbox";
          break;
        case "search":
          componentType = "SearchInput";
          break;
        case "multisearch":
          componentType = "MultiSearchInput";
          break;
        case "attachments":
          componentType = "FileInput";
          break;
        default:
          componentType = "TextInput";
      }

      return getComponentByResourceType(componentType);
    };

    // Create debounced function only once using useRef with improved equality checking
    if (!debouncedUpdateRef.current) {
      debouncedUpdateRef.current = debounce((values) => {
        try {
          // Skip updates if we're currently updating or component unmounted
          if (isUpdatingRef.current || !mountedRef.current) return;

          // Skip update if values haven't meaningfully changed
          if (isEqual(previousValuesRef.current, values)) {
            return;
          }

          debugLog("Updating filter triplet store with values", values);
          formValuesUpdateCountRef.current += 1;
          lastValueUpdateTimeRef.current = Date.now();

          // Set flag to prevent circular updates
          isUpdatingRef.current = true;

          // Add a timestamp and component information for debugging
          const enhancedValues = {
            ...values,
            _metadata: {
              updatedAt: new Date().toISOString(),
              formKey: tripletFormKey,
              variableType: variable.type,
              updateCount: formValuesUpdateCountRef.current,
            },
          };

          // Update state
          setActionInputFormValues((prev) => {
            // Create a new reference only if the values actually changed
            if (!isEqual(prev[tripletFormKey], enhancedValues)) {
              return {
                ...prev,
                [tripletFormKey]: enhancedValues,
              };
            }
            return prev; // Return previous state if no changes
          });

          if (onChange && mountedRef.current) {
            onChange(values);
          }

          // Store values for future comparison
          previousValuesRef.current = cloneDeep(values);

          // Reset update flag after a small delay
          persistenceTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              isUpdatingRef.current = false;

              // After the primary update, push another update to Zustand after a longer delay
              // This ensures values are available for persistence
              persistenceTimeoutRef.current = setTimeout(() => {
                if (!mountedRef.current) return;

                setActionInputFormValues((prev) => {
                  // Only update if the values still exist in the form and component is mounted
                  if (
                    formRef.current?.store?.state?.values &&
                    mountedRef.current
                  ) {
                    return {
                      ...prev,
                      [tripletFormKey]: {
                        ...enhancedValues,
                        _metadata: {
                          ...enhancedValues._metadata,
                          persistedAt: new Date().toISOString(),
                        },
                      },
                    };
                  }
                  return prev;
                });
              }, 500);
            }
          }, 50);
        } catch (error) {
          console.error("Error updating filter triplet store:", error);
          if (mountedRef.current) {
            isUpdatingRef.current = false;
          }
        }
      }, 300);
    }

    // Subscribe to form changes with error handling and reference equality checks
    useEffect(() => {
      if (!form.store || !hasInitializedRef.current) {
        return;
      }

      try {
        const unsubscribe = form.store.subscribe(() => {
          // Don't trigger updates if we're currently updating or unmounted
          if (isUpdatingRef.current || !mountedRef.current) return;

          const currentValues = form.store.state.values;

          // Only update if values have actually changed
          if (!isEqual(previousValuesRef.current, currentValues)) {
            debouncedUpdateRef.current(currentValues);
          }
        });

        return () => {
          unsubscribe();
          if (debouncedUpdateRef.current) {
            debouncedUpdateRef.current.cancel();
          }
        };
      } catch (error) {
        console.error("Error subscribing to form store:", error);
      }
    }, [form.store]);

    // Effect to set initial values when they change
    useEffect(() => {
      if (
        !hasInitializedRef.current ||
        isUpdatingRef.current ||
        !mountedRef.current
      )
        return;

      // Skip if no initialValues or if they match what we already have
      if (!initialValues || isEqual(initialValues, previousValuesRef.current)) {
        return;
      }

      debugLog("Applying new initialValues", initialValues);

      isUpdatingRef.current = true;

      // Use batch updates to set all values at once
      form.store.batch(() => {
        // Update each field individually
        if (initialValues.operator) {
          form.setFieldValue("operator", initialValues.operator);
        }

        if (initialValues.value !== undefined) {
          form.setFieldValue("value", initialValues.value);
        }

        if (initialValues.value2 !== undefined) {
          form.setFieldValue("value2", initialValues.value2);
        }
      });

      // Store for comparison
      previousValuesRef.current = cloneDeep(initialValues);

      // Force an update to Zustand with the new values
      if (mountedRef.current) {
        setActionInputFormValues((prev) => ({
          ...prev,
          [tripletFormKey]: {
            ...initialValues,
            _metadata: {
              initializedAt: new Date().toISOString(),
              source: "initialValues_update",
            },
          },
        }));
      }

      // Reset flag after a delay
      setTimeout(() => {
        if (mountedRef.current) {
          isUpdatingRef.current = false;
        }
      }, 50);
    }, [initialValues]);

    // Add effect to periodically check if values need to be re-synced with store
    useEffect(() => {
      // Create a watchdog interval to ensure values are in sync
      const watchdogInterval = setInterval(() => {
        if (!mountedRef.current || isUpdatingRef.current) return;

        const timeSinceLastUpdate = Date.now() - lastValueUpdateTimeRef.current;

        // If it's been more than 10 seconds since the last update, check for consistency
        if (timeSinceLastUpdate > 10000) {
          const currentFormValues = form.store?.state?.values;
          const currentStoreValues = action_input_form_values[tripletFormKey];

          // If values differ between form and store, and form has valid values
          if (
            currentFormValues &&
            currentStoreValues &&
            !isEqual(currentFormValues, currentStoreValues) &&
            currentFormValues.field === variable.value
          ) {
            debugLog("Watchdog detected inconsistency, re-syncing values");

            // Determine which values to use (prefer form values if they're newer)
            const valuesToUse = currentFormValues;

            // Update the store
            setActionInputFormValues((prev) => ({
              ...prev,
              [tripletFormKey]: {
                ...valuesToUse,
                _metadata: {
                  syncedByWatchdog: true,
                  timestamp: new Date().toISOString(),
                },
              },
            }));

            // Update the lastUpdate time
            lastValueUpdateTimeRef.current = Date.now();
          }
        }
      }, 5000);

      return () => {
        clearInterval(watchdogInterval);
      };
    }, [form.store, tripletFormKey, variable.value, action_input_form_values]);

    // Handle clearing the form with careful event handling
    const handleClear = (e: React.MouseEvent) => {
      // Stop propagation to prevent the editor from handling this event
      e.stopPropagation();
      e.preventDefault();

      debugLog("Clearing filter triplet");

      // Set updating flag to prevent infinite loops
      isUpdatingRef.current = true;

      // Reset values in form
      form.store.batch(() => {
        form.setFieldValue("value", null);
        form.setFieldValue("value2", null);
        form.setFieldValue("operator", OPERATOR_MAP[variable.type][0]);
      });

      // Create reset values object
      const resetValues = {
        field: variable.value,
        operator: OPERATOR_MAP[variable.type][0],
        value: null,
        value2: null,
        _metadata: {
          cleared: true,
          clearedAt: new Date().toISOString(),
        },
      };

      // Update store
      setActionInputFormValues((prev) => ({
        ...prev,
        [tripletFormKey]: resetValues,
      }));

      // Store for comparison
      previousValuesRef.current = cloneDeep(resetValues);
      lastValueUpdateTimeRef.current = Date.now();

      if (onClear && mountedRef.current) {
        onClear();
      }

      // Reset updating flag after a small delay
      setTimeout(() => {
        if (mountedRef.current) {
          isUpdatingRef.current = false;
        }
      }, 50);
    };

    // Get the component
    const Component = getComponent();

    // Event handler to aggressively stop propagation
    const stopPropagation = (e: React.SyntheticEvent) => {
      e.stopPropagation();
      e.preventDefault(); // Also prevent default if necessary
    };

    // Compact mode renders differently
    if (compact) {
      return (
        <Box
          className="filter-triplet-compact"
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
        >
          <Group spacing="xs" noWrap>
            <div className="field-name">{variable.label}</div>
            <form.Field name="operator">
              {(field) => (
                <Select
                  size="xs"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  data={OPERATOR_MAP[variable.type].map((op) => ({
                    value: op,
                    label: OPERATOR_LABELS[op],
                  }))}
                  styles={{ root: { width: 100 } }}
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                  withinPortal
                />
              )}
            </form.Field>
            <form.Field name="value">
              {(field) => {
                const isDateType =
                  variable.type === "date" || variable.type === "datetime";
                const processedValue = isDateType
                  ? field.state.value
                    ? safeParseDate(field.state.value)
                    : null
                  : field.state.value;

                return (
                  <Component
                    size="xs"
                    value={processedValue}
                    onChange={(newValue) => {
                      // If we're not currently updating, proceed with the change
                      if (!isUpdatingRef.current) {
                        field.handleChange(newValue);
                      }
                    }}
                    {...(variable.props || {})}
                    {...(isDateType
                      ? {
                          clearable: true,
                          dateParser,
                          popoverProps: { withinPortal: true },
                        }
                      : {})}
                    onClick={stopPropagation}
                    onMouseDown={stopPropagation}
                  />
                );
              }}
            </form.Field>
            <form.Field name="operator">
              {(operatorField) =>
                operatorField.state.value === "between" ? (
                  <form.Field name="value2">
                    {(field) => {
                      const isDateType =
                        variable.type === "date" ||
                        variable.type === "datetime";
                      const processedValue = isDateType
                        ? field.state.value
                          ? safeParseDate(field.state.value)
                          : null
                        : field.state.value;

                      return (
                        <Component
                          size="xs"
                          value={processedValue}
                          onChange={(newValue) => {
                            // If we're not currently updating, proceed with the change
                            if (!isUpdatingRef.current) {
                              field.handleChange(newValue);
                            }
                          }}
                          {...(variable.props || {})}
                          {...(isDateType
                            ? {
                                clearable: true,
                                dateParser,
                                popoverProps: { withinPortal: true },
                              }
                            : {})}
                          onClick={stopPropagation}
                          onMouseDown={stopPropagation}
                        />
                      );
                    }}
                  </form.Field>
                ) : null
              }
            </form.Field>
            <ActionIcon
              size="xs"
              onClick={handleClear}
              onMouseDown={stopPropagation}
            >
              <IconX size={12} />
            </ActionIcon>
          </Group>
        </Box>
      );
    }

    // Standard mode (not compact) - simplified for brevity
    return (
      <Box
        className="filter-triplet-standard p-2 border rounded mb-2"
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">{variable.label}</div>
          <form.Field name="operator">
            {(field) => (
              <Select
                size="xs"
                value={field.state.value}
                onChange={(value) => field.handleChange(value)}
                data={OPERATOR_MAP[variable.type].map((op) => ({
                  value: op,
                  label: OPERATOR_LABELS[op],
                }))}
                styles={{ root: { width: 120 } }}
                withinPortal
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
              />
            )}
          </form.Field>
        </div>

        {/* Value field */}
        <div className="mb-2">
          <form.Field name="value">
            {(field) => {
              const isDateType =
                variable.type === "date" || variable.type === "datetime";
              const processedValue = isDateType
                ? field.state.value
                  ? safeParseDate(field.state.value)
                  : null
                : field.state.value;

              return (
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Component
                      value={processedValue}
                      onChange={(newValue) => {
                        // If we're not currently updating, proceed with the change
                        if (!isUpdatingRef.current) {
                          field.handleChange(newValue);
                        }
                      }}
                      {...(variable.props || {})}
                      {...(isDateType
                        ? {
                            clearable: true,
                            dateParser,
                            popoverProps: { withinPortal: true },
                          }
                        : {})}
                      size="sm"
                      onClick={stopPropagation}
                      onMouseDown={stopPropagation}
                    />
                  </div>
                  {field.state.value !== null && field.state.value !== "" && (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={handleClear}
                      size="sm"
                      onMouseDown={stopPropagation}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )}
                </div>
              );
            }}
          </form.Field>
        </div>

        {/* Second value field for "between" operator */}
        <form.Field name="operator">
          {(operatorField) => {
            if (operatorField.state.value !== "between") {
              return null;
            }
            return (
              <div className="w-full">
                <form.Field name="value2">
                  {(field) => {
                    const isDateType =
                      variable.type === "date" || variable.type === "datetime";
                    const processedValue = isDateType
                      ? field.state.value
                        ? safeParseDate(field.state.value)
                        : null
                      : field.state.value;

                    return (
                      <Component
                        value={processedValue}
                        onChange={(newValue) => {
                          // If we're not currently updating, proceed with the change
                          if (!isUpdatingRef.current) {
                            field.handleChange(newValue);
                          }
                        }}
                        {...(variable.props || {})}
                        {...(isDateType
                          ? {
                              clearable: true,
                              dateParser,
                              popoverProps: { withinPortal: true },
                            }
                          : {})}
                        size="sm"
                        onClick={stopPropagation}
                        onMouseDown={stopPropagation}
                      />
                    );
                  }}
                </form.Field>
              </div>
            );
          }}
        </form.Field>
      </Box>
    );
  },
  // Custom equality function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if essential props have changed
    const propsEqual =
      prevProps.formKey === nextProps.formKey &&
      prevProps.compact === nextProps.compact &&
      isEqual(prevProps.variable, nextProps.variable);

    // For initialValues, we need to be more careful
    const initialValuesEqual = isEqual(
      prevProps.initialValues,
      nextProps.initialValues
    );

    return propsEqual && initialValuesEqual;
  }
);

// Make sure the component name is set for easier debugging
FilterInputTriplet.displayName = "FilterInputTriplet";

export default FilterInputTriplet;

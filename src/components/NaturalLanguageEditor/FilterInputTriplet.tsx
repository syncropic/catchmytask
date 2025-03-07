// src/components/NaturalLanguageEditor/FilterInputTriplet.tsx
import React, { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Box, Group, Select, ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { getComponentByResourceType } from "@components/Utils";
import { useAppStore } from "src/store";
import { Variable } from "@components/DynamicFilter";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { DateInputProps } from "@mantine/dates";
import { safeParseDate } from "../Utils/dateUtils";

// Import the operator mappings and labels from DynamicFilter
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
}

const FilterInputTriplet: React.FC<FilterInputTripletProps> = ({
  variable,
  formKey,
  onChange,
  onClear,
  compact = false,
}) => {
  const { action_input_form_values, setActionInputFormValues } = useAppStore();

  // Generate a unique form key for this triplet
  const tripletFormKey = `${formKey}_${variable.value}`;

  // Get stored values if they exist
  const storedValues = action_input_form_values[tripletFormKey] || {};

  // Create default values
  const defaultValues = {
    field: variable.value,
    operator: OPERATOR_MAP[variable.type]?.[0] || "equals",
    value: null,
    value2: null,
    ...storedValues,
  };

  // Setup form
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      // Nothing to do on submit - we update as values change
    },
  });

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

  // Debounced function to update store
  const debouncedUpdateStore = debounce((values) => {
    const newValues = {
      ...action_input_form_values,
      [tripletFormKey]: values,
    };
    setActionInputFormValues(newValues);

    if (onChange) {
      onChange(values);
    }
  }, 300);

  // Subscribe to form changes
  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const currentValues = form.store.state.values;
      debouncedUpdateStore(currentValues);
    });

    return () => {
      unsubscribe();
      debouncedUpdateStore.cancel();
    };
  }, [form.store]);

  // Handle clearing the form
  const handleClear = () => {
    form.store.batch(() => {
      form.setFieldValue("value", null);
      form.setFieldValue("value2", null);
    });

    if (onClear) {
      onClear();
    }
  };

  // Render the component
  const Component = getComponent();

  // Compact mode renders differently
  if (compact) {
    return (
      <Box className="filter-triplet-compact">
        <Group spacing="xs" noWrap>
          <div className="field-name">{variable.label}</div>
          <form.Field name="operator">
            {(field) => (
              <Select
                size="xs"
                value={field.state.value}
                onChange={field.handleChange}
                data={OPERATOR_MAP[variable.type].map((op) => ({
                  value: op,
                  label: OPERATOR_LABELS[op],
                }))}
                styles={{ root: { width: 100 } }}
              />
            )}
          </form.Field>
          <form.Field name="value">
            {(field) => (
              <Component
                size="xs"
                value={
                  variable.type === "date" || variable.type === "datetime"
                    ? field.state.value
                      ? safeParseDate(field.state.value)
                      : null
                    : field.state.value
                }
                onChange={field.handleChange}
                {...(variable.props || {})}
                {...(variable.type === "date" || variable.type === "datetime"
                  ? {
                      clearable: true,
                      dateParser,
                      popoverProps: { withinPortal: true },
                    }
                  : {})}
              />
            )}
          </form.Field>
          <form.Field name="operator">
            {(operatorField) =>
              operatorField.state.value === "between" ? (
                <form.Field name="value2">
                  {(field) => (
                    <Component
                      size="xs"
                      value={
                        variable.type === "date" || variable.type === "datetime"
                          ? field.state.value
                            ? safeParseDate(field.state.value)
                            : null
                          : field.state.value
                      }
                      onChange={field.handleChange}
                      {...(variable.props || {})}
                      {...(variable.type === "date" ||
                      variable.type === "datetime"
                        ? {
                            clearable: true,
                            dateParser,
                            popoverProps: { withinPortal: true },
                          }
                        : {})}
                    />
                  )}
                </form.Field>
              ) : null
            }
          </form.Field>
          <ActionIcon size="xs" onClick={handleClear}>
            <IconX size={12} />
          </ActionIcon>
        </Group>
      </Box>
    );
  }

  // Standard mode (not compact)
  return (
    <Box className="filter-triplet-standard p-2 border rounded mb-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">{variable.label}</div>
        <form.Field name="operator">
          {(field) => (
            <Select
              size="xs"
              value={field.state.value}
              onChange={field.handleChange}
              data={OPERATOR_MAP[variable.type].map((op) => ({
                value: op,
                label: OPERATOR_LABELS[op],
              }))}
              styles={{ root: { width: 120 } }}
            />
          )}
        </form.Field>
      </div>

      <div className="mb-2">
        <form.Field name="value">
          {(field) => (
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Component
                  value={
                    variable.type === "date" || variable.type === "datetime"
                      ? field.state.value
                        ? safeParseDate(field.state.value)
                        : null
                      : field.state.value
                  }
                  onChange={field.handleChange}
                  {...(variable.props || {})}
                  {...(variable.type === "date" || variable.type === "datetime"
                    ? {
                        clearable: true,
                        dateParser,
                        popoverProps: { withinPortal: true },
                      }
                    : {})}
                  size="sm"
                />
              </div>
              {field.state.value !== null && field.state.value !== "" && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleClear}
                  size="sm"
                >
                  <IconX size={16} />
                </ActionIcon>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="operator">
        {(operatorField) => {
          if (operatorField.state.value !== "between") {
            return null;
          }
          return (
            <div className="w-full">
              <form.Field name="value2">
                {(field) => (
                  <Component
                    value={
                      variable.type === "date" || variable.type === "datetime"
                        ? field.state.value
                          ? safeParseDate(field.state.value)
                          : null
                        : field.state.value
                    }
                    onChange={field.handleChange}
                    {...(variable.props || {})}
                    {...(variable.type === "date" ||
                    variable.type === "datetime"
                      ? {
                          clearable: true,
                          dateParser,
                          popoverProps: { withinPortal: true },
                        }
                      : {})}
                    size="sm"
                  />
                )}
              </form.Field>
            </div>
          );
        }}
      </form.Field>
    </Box>
  );
};

export default FilterInputTriplet;

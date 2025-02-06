import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Select, ActionIcon } from "@mantine/core";
import { useForm } from "@tanstack/react-form";
import { getComponentByResourceType, useIsMobile } from "@components/Utils";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useAppStore } from "src/store";
import _ from "lodash";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { DateInputProps } from "@mantine/dates";

export interface Variable {
  value: string;
  label: string;
  props?: any;
  location?: string;
  type:
    | "string"
    | "number"
    | "datetime"
    | "date"
    | "boolean"
    | "select"
    | "multiselect"
    | "search"
    | "multisearch"
    | "attachments";
}

export interface Filter {
  id: number;
  field: string;
  operator: Operator;
  value: string | number | boolean | Date | null;
  value2?: string | number | Date | null;
}

export interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean | Date | null;
  value2?: string | number | Date | null;
  fieldType: Variable["type"];
  location: Variable["location"];
}

export interface FilterOutput {
  whereClause: string;
  conditions: FilterCondition[];
  joinOperator: "AND" | "OR";
}

type Operator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "between"
  | "before"
  | "after";

interface DynamicFilterProps {
  variables: Variable[];
  onFilterChange: (output: FilterOutput) => void;
  action_form_key?: string;
}

const OPERATOR_MAP: Record<string, Operator[]> = {
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

const OPERATOR_LABELS: Record<Operator, string> = {
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

const SQL_OPERATORS: Record<Operator, string> = {
  equals: "=",
  notEquals: "!=",
  contains: "LIKE",
  startsWith: "LIKE",
  endsWith: "LIKE",
  gt: ">",
  lt: "<",
  between: "BETWEEN",
  before: "<",
  after: ">",
};

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  variables,
  onFilterChange,
  action_form_key = "default",
}) => {
  const filter_form_key = `${action_form_key}_filter`;
  const {
    filter_form_values,
    setFilterFormValues,
    filter_form_fields,
    setFilterFormFields,
  } = useAppStore();
  const previousIsValid = useRef(false);
  const isMobile = useIsMobile();

  const createFieldSchema = (variable: Variable) => {
    let component = "TextInput";
    switch (variable.type) {
      case "number":
        component = "NumberInput";
        break;
      case "datetime":
        component = "DateInput";
        break;
      case "date":
        component = "DateInput";
        break;
      case "select":
        component = "Select";
        break;
      case "boolean":
        component = "Checkbox";
        break;
      case "search":
        component = "SearchInput";
        break;
      case "multisearch":
        component = "MultiSearchInput";
        break;
      case "attachments":
        component = "FileInput";
        break;
    }

    return {
      title: variable.label,
      key: variable.value,
      type: variable.type,
      component,
      props: {
        placeholder: `Enter ${variable.label}`,
        label: variable.label,
        ...variable?.props,
      },
    };
  };

  const dateParser: DateInputProps["dateParser"] = (input) => {
    if (input === "WW2") {
      return new Date(1939, 8, 1);
    }
    return dayjs(input, "DD/MM/YYYY").toDate();
  };

  const form = useForm({
    defaultValues: {
      ...variables.reduce((acc, variable) => {
        acc[variable.value] = null;
        acc[`${variable.value}_operator`] = OPERATOR_MAP[variable.type][0];
        acc[`${variable.value}_value2`] = null;
        return acc;
      }, {} as Record<string, any>),
      ...(filter_form_values[filter_form_key] || {}),
    },
    onSubmit: async ({ value }) => {
      const output = generateFilterOutput(value);
      onFilterChange(output);
    },
  });

  const debouncedLog = debounce((values) => {
    const new_filter_form_values = {
      ...filter_form_values,
      [filter_form_key]: values,
    };
    setFilterFormValues(new_filter_form_values);

    const fields = variables.map(createFieldSchema);
    setFilterFormFields(filter_form_key, fields);
  }, 300);

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const currentValues = form.store.state.values;
      const isValid = form.store.state.isValid;

      if (!_.isEqual(filter_form_values[filter_form_key], currentValues)) {
        debouncedLog(currentValues);
      }

      previousIsValid.current = isValid;
    });

    return () => {
      unsubscribe();
      debouncedLog.cancel();
    };
  }, [form.store, filter_form_values, filter_form_key, setFilterFormValues]);

  const clearAllFilters = () => {
    form.store.batch(() => {
      variables.forEach((variable) => {
        form.setFieldValue(variable.value, null);
        form.setFieldValue(`${variable.value}_value2`, null);
        form.setFieldValue(
          `${variable.value}_operator`,
          OPERATOR_MAP[variable.type][0]
        );
      });
    });
  };

  // const handleValueChange = (field: any, value: any, fieldName: string) => {
  //   // Clear the field if value is empty string
  //   if (value === "") {
  //     clearFilterValues(fieldName);
  //   } else {
  //     field.handleChange(value);
  //   }
  // };

  const handleValueChange = (field: any, value: any, fieldName: string) => {
    if (value === null || value === "") {
      clearFilterValues(fieldName);
    } else {
      field.handleChange(value);
    }
  };

  const clearFilterValues = (fieldName: string) => {
    form.store.batch(() => {
      form.setFieldValue(fieldName, null);
      form.setFieldValue(`${fieldName}_value2`, null);
      form.setFieldValue(
        `${fieldName}_operator`,
        OPERATOR_MAP[
          variables.find((v) => v.value === fieldName)?.type || "string"
        ][0]
      );
    });
  };

  const renderMobileField = (fieldSchema: any) => {
    const Component = getComponentByResourceType(fieldSchema.component);
    const fieldName = fieldSchema.key;

    return (
      <div key={fieldName} className="py-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-medium text-gray-700 flex-1">
            {fieldSchema.title}
          </div>
          <form.Field name={`${fieldName}_operator`}>
            {(operatorField) => (
              <div className="w-32">
                <Select
                  value={operatorField.state.value}
                  onChange={(value) => operatorField.handleChange(value)}
                  data={OPERATOR_MAP[fieldSchema.type].map((op) => ({
                    value: op,
                    label: OPERATOR_LABELS[op],
                  }))}
                  placeholder="Operator"
                  size="sm"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="mb-2">
          <form.Field name={fieldName}>
            {(field) => (
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Component
                    onBlur={field.handleBlur}
                    onChange={
                      [
                        "NumberInput",
                        "MonacoEditorFormInput",
                        "NaturalLanguageEditorFormInput",
                        "SearchInput",
                        "DateInput",
                        "MultiSelect",
                        "Select",
                        "FileInput",
                        "RangeSlider",
                      ].includes(fieldSchema.component)
                        ? (value: any) =>
                            handleValueChange(field, value, fieldName)
                        : (e: any) =>
                            handleValueChange(
                              field,
                              e?.target?.value,
                              fieldName
                            )
                    }
                    {...(fieldSchema.props || {})}
                    value={
                      fieldSchema.component === "DateInput"
                        ? field.state.value
                          ? new Date(field.state.value)
                          : null
                        : field.state.value ?? ""
                    }
                    {...(fieldSchema.component === "DateInput"
                      ? {
                          clearable: true,
                          dateParser,
                        }
                      : {})}
                    action_form_key={`${action_form_key}_filter`}
                    label={null}
                  />
                </div>
                {field.state.value !== null && field.state.value !== "" && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => clearFilterValues(fieldName)}
                    size="sm"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name={`${fieldName}_operator`}>
          {(operatorField) => {
            if (operatorField.state.value !== "between") {
              return null;
            }
            return (
              <div className="w-full">
                <form.Field name={`${fieldName}_value2`}>
                  {(field) => (
                    <Component
                      onBlur={field.handleBlur}
                      onChange={
                        [
                          "NumberInput",
                          "MonacoEditorFormInput",
                          "NaturalLanguageEditorFormInput",
                          "SearchInput",
                          "DateInput",
                          "MultiSelect",
                          "Select",
                          "FileInput",
                          "RangeSlider",
                        ].includes(fieldSchema.component)
                          ? (value: any) =>
                              handleValueChange(field, value, fieldName)
                          : (e: any) =>
                              handleValueChange(
                                field,
                                e?.target?.value,
                                fieldName
                              )
                      }
                      {...(fieldSchema.props || {})}
                      value={
                        fieldSchema.component === "DateInput"
                          ? field.state.value
                            ? new Date(field.state.value)
                            : null
                          : field.state.value ?? ""
                      }
                      {...(fieldSchema.component === "DateInput"
                        ? {
                            clearable: true,
                            dateParser,
                          }
                        : {})}
                      action_form_key={`${action_form_key}_filter`}
                      label={null}
                    />
                  )}
                </form.Field>
              </div>
            );
          }}
        </form.Field>
      </div>
    );
  };

  const renderDesktopField = (fieldSchema: any) => {
    const Component = getComponentByResourceType(fieldSchema.component);
    const fieldName = fieldSchema.key;

    return (
      <div key={fieldName} className="flex gap-4 items-end py-1">
        <div>{fieldSchema.title}</div>

        <form.Field name={`${fieldName}_operator`}>
          {(operatorField) => (
            <div className="flex flex-col">
              <Select
                value={operatorField.state.value}
                onChange={(value) => operatorField.handleChange(value)}
                data={OPERATOR_MAP[fieldSchema.type].map((op) => ({
                  value: op,
                  label: OPERATOR_LABELS[op],
                }))}
                placeholder="Select operator"
                className="w-20"
              />
            </div>
          )}
        </form.Field>

        <div className="flex-1">
          <form.Field name={fieldName}>
            {(field) => (
              <Component
                onBlur={field.handleBlur}
                onChange={
                  [
                    "NumberInput",
                    "MonacoEditorFormInput",
                    "NaturalLanguageEditorFormInput",
                    "SearchInput",
                    "DateInput",
                    "MultiSelect",
                    "Select",
                    "FileInput",
                    "RangeSlider",
                  ].includes(fieldSchema.component)
                    ? field.handleChange
                    : (e: any) => field.handleChange(e?.target?.value)
                }
                {...(fieldSchema.props || {})}
                value={
                  fieldSchema.component === "DateInput"
                    ? field.state.value
                      ? new Date(field.state.value)
                      : null
                    : field.state.value ?? ""
                }
                {...(fieldSchema.component === "DateInput"
                  ? {
                      clearable: true,
                      dateParser,
                    }
                  : {})}
                action_form_key={`${action_form_key}_filter`}
                label={null}
              />
            )}
          </form.Field>
        </div>

        <form.Field name={`${fieldName}_operator`}>
          {(operatorField) =>
            operatorField.state.value === "between" ? (
              <div className="flex-1">
                <form.Field name={`${fieldName}_value2`}>
                  {(field) => (
                    <Component
                      onBlur={field.handleBlur}
                      onChange={
                        [
                          "NumberInput",
                          "MonacoEditorFormInput",
                          "NaturalLanguageEditorFormInput",
                          "SearchInput",
                          "DateInput",
                          "MultiSelect",
                          "Select",
                          "FileInput",
                          "RangeSlider",
                        ].includes(fieldSchema.component)
                          ? field.handleChange
                          : (e: any) => field.handleChange(e?.target?.value)
                      }
                      {...(fieldSchema.props || {})}
                      value={
                        fieldSchema.component === "DateInput"
                          ? field.state.value
                            ? new Date(field.state.value)
                            : null
                          : field.state.value ?? ""
                      }
                      {...(fieldSchema.component === "DateInput"
                        ? {
                            clearable: true,
                            dateParser,
                          }
                        : {})}
                      action_form_key={`${action_form_key}_filter`}
                      label={null}
                    />
                  )}
                </form.Field>
              </div>
            ) : null
          }
        </form.Field>

        <form.Field name={fieldName}>
          {(valueField) =>
            valueField.state.value !== null && valueField.state.value !== "" ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => clearFilterValues(fieldName)}
                size="sm"
              >
                <IconX size={16} />
              </ActionIcon>
            ) : null
          }
        </form.Field>
      </div>
    );
  };

  const formatValue = (value: any, type: string): string => {
    if (value === null) return "";

    if (type === "datetime") {
      return value instanceof Date
        ? value.toISOString().split("T")[0]
        : String(value);
    }
    if (type === "date") {
      return value instanceof Date
        ? value.toISOString().split("T")[0]
        : String(value);
    }

    if (type === "attachments") {
      // Changed from attachment to attachments
      return value.name || String(value);
    }

    return String(value);
  };

  const generateFilterOutput = (formValues: any): FilterOutput => {
    const conditions: FilterCondition[] = [];
    const sqlConditions: string[] = [];

    variables.forEach((variable) => {
      const value = formValues[variable.value];
      const operator = formValues[`${variable.value}_operator`] as Operator;
      const value2 = formValues[`${variable.value}_value2`];

      if (value === null || !operator) return;

      const condition: FilterCondition = {
        field: variable.value,
        operator,
        value,
        fieldType: variable.type,
        location: variable?.location || "pre",
      };

      if (operator === "between" && value2 !== null) {
        condition.value2 = value2;
      }

      conditions.push(condition);

      let sqlCondition: string;
      const formattedValue = formatValue(value, variable.type);

      switch (operator) {
        case "contains":
          sqlCondition = `${variable.value} ${SQL_OPERATORS[operator]} '%${formattedValue}%'`;
          break;
        case "startsWith":
          sqlCondition = `${variable.value} ${SQL_OPERATORS[operator]} '${formattedValue}%'`;
          break;
        case "endsWith":
          sqlCondition = `${variable.value} ${SQL_OPERATORS[operator]} '%${formattedValue}'`;
          break;
        case "between":
          if (value2 === null) return;
          const formattedValue2 = formatValue(value2, variable.type);
          if (variable.type === "datetime" || variable.type === "date") {
            // Update this line
            sqlCondition = `${variable.value} >= '${formattedValue}' AND ${variable.value} <= '${formattedValue2}'`;
          } else {
            sqlCondition = `${variable.value} ${SQL_OPERATORS["between"]} ${
              variable.type === "string"
                ? `'${formattedValue}' AND '${formattedValue2}'`
                : `${formattedValue} AND ${formattedValue2}`
            }`;
          }
          break;
        default:
          sqlCondition = `${variable.value} ${SQL_OPERATORS[operator]} ${
            variable.type === "string" ||
            variable.type === "datetime" ||
            variable.type === "date" ||
            variable.type === "attachments"
              ? `'${formattedValue}'`
              : formattedValue
          }`;
      }

      sqlConditions.push(sqlCondition);
    });

    return {
      whereClause: sqlConditions.length ? sqlConditions.join(" AND ") : "",
      conditions,
      joinOperator: "AND",
    };
  };

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const output = generateFilterOutput(form.store.state.values);
      onFilterChange(output);
    });

    return () => unsubscribe();
  }, [form.store, onFilterChange]);

  return (
    <Box className="mt-3 gap-2 space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconTrash size={16} />}
          onClick={clearAllFilters}
          size="sm"
        >
          Clear All Variables
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {variables.map((variable) =>
          isMobile
            ? renderMobileField(createFieldSchema(variable))
            : renderDesktopField(createFieldSchema(variable))
        )}
      </form>
    </Box>
  );
};

export default DynamicFilter;

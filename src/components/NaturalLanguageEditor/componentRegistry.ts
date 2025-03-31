// src/components/NaturalLanguageEditor/componentRegistry.ts
import { Variable } from "@components/DynamicFilter";

// Registry of embeddable components
export interface EmbeddableComponent {
  id: string;
  name: string;
  label: string;
  description: string;
  componentType: string;
  resultType: "component";
  componentProps: Record<string, any>;
  value: string; // Important: Add this to make it compatible with Select
  icon?: React.ReactNode;
}

// Generate filter triplet components from variables
export const generateFilterTriplets = (
  variables: Variable[] = []
): EmbeddableComponent[] => {
  // Safety check - ensure variables is an array
  if (!Array.isArray(variables)) {
    return [];
  }

  return variables.map((variable) => {
    return {
      id: `filter-triplet-${variable.value}`,
      name: variable.value,
      label: `${variable.label} Filter`,
      description: `Filter by ${variable.label}`,
      componentType: "FilterInputTriplet",
      resultType: "component",
      value: `filter-triplet-${variable.value}`, // Add value for compatibility with Select
      componentProps: {
        variable: variable,
        compact: true,
      },
    };
  });
};

// Generate input field components from DynamicFilter Variable definitions
export const generateInputComponents = (
  variables: Variable[] = []
): EmbeddableComponent[] => {
  // Safety check - ensure variables is an array
  if (!Array.isArray(variables)) {
    return [];
  }

  return variables.map((variable) => {
    // Map variable types to component types
    let componentType;
    let defaultProps: Record<string, any> = {
      label: variable.label,
      placeholder: `Enter ${variable.label}`,
      ...(variable.props || {}),
    };

    switch (variable.type) {
      case "string":
        componentType = "TextInput";
        break;
      case "number":
        componentType = "NumberInput";
        break;
      case "datetime":
      case "date":
        componentType = "DateInput";
        break;
      case "boolean":
        componentType = "Checkbox";
        break;
      case "select":
        componentType = "Select";
        break;
      case "multiselect":
        componentType = "MultiSelect";
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

    return {
      id: `input-${variable.value}`,
      name: variable.value,
      label: `${variable.label} Input`,
      description: `Input field for ${variable.label}`,
      componentType,
      resultType: "component",
      componentProps: defaultProps,
      value: `input-${variable.value}`, // Add value for compatibility with Select
    };
  });
};

// Predefined embeddable components
export const predefinedComponents: EmbeddableComponent[] = [
  {
    id: "date-picker",
    name: "date_picker",
    label: "Date Picker",
    description: "A date picker component",
    componentType: "DateInput",
    resultType: "component",
    value: "date-picker", // Add value for compatibility with Select
    componentProps: {
      label: "Select Date",
      placeholder: "Choose a date",
    },
  },
  {
    id: "number-input",
    name: "number_input",
    label: "Number Input",
    description: "A number input component",
    componentType: "NumberInput",
    resultType: "component",
    value: "number-input", // Add value for compatibility with Select
    componentProps: {
      label: "Enter Number",
      placeholder: "Type a number",
      min: 0,
    },
  },
  {
    id: "select-input",
    name: "select_input",
    label: "Select Input",
    description: "A dropdown select component",
    componentType: "Select",
    resultType: "component",
    value: "select-input", // Add value for compatibility with Select
    componentProps: {
      label: "Select Option",
      placeholder: "Choose an option",
      data: [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
      ],
    },
  },
  {
    id: "dynamic-filter",
    name: "dynamic_filter",
    label: "Dynamic Filter",
    description: "A dynamic filter component",
    componentType: "DynamicFilter",
    resultType: "component",
    value: "dynamic-filter", // Add value for compatibility with Select
    componentProps: {
      action_form_key: "embedded_filter",
      variables: [], // Will be populated from the record when used
    },
  },
];

// Function to get all available components
export const getAllComponents = (
  variables: Variable[] = []
): EmbeddableComponent[] => {
  // Safety check - ensure variables is an array
  if (!Array.isArray(variables)) {
    variables = [];
  }

  return [
    // ...predefinedComponents,
    // ...generateInputComponents(variables),
    // ...generateFilterTriplets(variables), // Add filter triplets
  ];
};

// src/services/variablesService.ts
import { Variable } from "@components/DynamicFilter";

// This mimics a service that would fetch variables from your API
// Replace this with your actual API call when ready

// Sample variables data
const sampleVariables: Variable[] = [
  {
    label: "file",
    type: "file",
    value: "file",
  },
];

// Function to get all available filter variables
export const getFilterVariables = async (): Promise<Variable[]> => {
  // In a real implementation, this would be an API call
  // For now, we'll just return the sample data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleVariables);
    }, 300);
  });
};

// Function to get specific variable by value
export const getVariableByValue = (value: string): Variable | undefined => {
  return sampleVariables.find((variable) => variable.value === value);
};

// Function to get multiple variables by their values
export const getVariablesByValues = (values: string[]): Variable[] => {
  return sampleVariables.filter((variable) => values.includes(variable.value));
};

export default {
  getFilterVariables,
  getVariableByValue,
  getVariablesByValues,
};

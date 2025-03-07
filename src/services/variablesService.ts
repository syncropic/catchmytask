// src/services/variablesService.ts
import { Variable } from "@components/DynamicFilter";

// This mimics a service that would fetch variables from your API
// Replace this with your actual API call when ready

// Sample variables data
const sampleVariables: Variable[] = [
  {
    label: "reporting_date",
    type: "date",
    value: "reporting_date",
  },
  {
    label: "reconciliation_result_comparison",
    location: "post",
    props: {
      clearable: true,
      data: ["red", "orange", "green", "gray"],
      searchable: true,
    },
    type: "select",
    value: "reconciliation_result_comparison",
  },
  {
    label: "reconciliation_result",
    location: "post",
    type: "string",
    value: "reconciliation_result",
  },
  {
    label: "supplier_name",
    props: {
      clearable: true,
      data: [
        "Easirent",
        "LOH",
        "W2M",
        "Sabre",
        "Smith",
        "Roomerang",
        "TRC",
        "Travelport",
        "PriceLine",
        "Ace",
        "HotelBeds",
      ],
      searchable: true,
    },
    type: "select",
    value: "supplier_name",
  },
  {
    label: "passenger_name",
    type: "string",
    value: "passenger_name",
  },
  {
    label: "booking_number",
    type: "string",
    value: "booking_number",
  },
  {
    label: "booking_type",
    props: {
      clearable: true,
      data: [
        "Flight",
        "Transfers",
        "AIGInsurance",
        "Excursion",
        "CBT",
        "Hotel",
        "Subscription",
        "Car",
      ],
      searchable: true,
    },
    type: "select",
    value: "booking_type",
  },
  {
    label: "internal_status",
    props: {
      clearable: true,
      data: [
        "Pending",
        "Confirmation Pending",
        "Pending Approval",
        "Ticketed",
        "Confirmed",
        "Cancelled",
        "Cancelled - Full Penalty",
        "Reservation Pending",
        "Pending Payment",
      ],
      searchable: true,
    },
    type: "select",
    value: "internal_status",
  },
  {
    label: "payment_status",
    props: {
      clearable: true,
      data: ["failed", "succeeded"],
      searchable: true,
    },
    type: "select",
    value: "payment_status",
  },
  {
    label: "payment_amount_usd_difference",
    location: "post",
    type: "number",
    value: "payment_amount_usd_difference",
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

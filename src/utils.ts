import { FilterCondition } from "@components/interfaces";
import { format, parseISO, set } from "date-fns";

export function removeSeparator(id) {
  const separator = ":";
  const separatorIndex = id.indexOf(separator);

  if (separatorIndex !== -1) {
    return id.slice(0, separatorIndex) + id.slice(separatorIndex + 1);
  }

  // Return original ID if separator is not found
  return id;
}

export function addSeparator(id, prefix) {
  const separator = ":";

  if (id?.startsWith(prefix)) {
    return id.slice(0, prefix.length) + separator + id.slice(prefix.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function removePrefix(id, prefix) {
  const separator = ":";
  const prefixWithSeparator = `${prefix}${separator}`;

  if (id?.startsWith(prefixWithSeparator)) {
    return id?.substring(prefixWithSeparator.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function addPrefix(id, prefix) {
  const separator = ":";
  return `${prefix}${separator}${id}`;
}

export function formatDateTimeAsDate(date) {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    // Handle as string
    return format(parseISO(date), "yyyy-MM-dd");
  } else {
    // Handle as Date object
    return format(date, "yyyy-MM-dd");
  }
}

export function formatDateTimeAsDateTime(date) {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    // Handle as string
    return format(parseISO(date), "yyyy-MM-dd hh:mm a");
  } else {
    // Handle as Date object
    return format(date, "yyyy-MM-dd hh:mm a");
  }
}

// Example options for the select, replace with actual data source
export const dateTypeOptions = [
  {
    value: "reporting_date",
    label: "reporting_date",
  },
  {
    value: "booking_date",
    label: "booking_date",
  },
  {
    value: "travelling_date",
    label: "travelling_date",
  },
];

export const emailTypeOptions = [
  {
    value: "default",
    label: "default",
  },
  {
    value: "personal",
    label: "personal",
  },
  {
    value: "internal",
    label: "internal",
  },
  {
    value: "company",
    label: "company",
  },
];

export const handleComingSoon = () => {
  alert("Coming Soon");
};

export const getCellStyle = (value: any, activeViews: any) => {
  // console.log(value);
  // Ensure that activeViews and activeViews.conditional_formatting are defined
  if (!activeViews || !activeViews.conditional_formatting) {
    return "";
  }

  // Find the formatting rule for the column
  const columnRule = activeViews.conditional_formatting.find(
    (r: any) => r.column === "sst_status_and_supplier_status_comparison"
  );
  // console.log(columnRule);

  // If columnRule is found, search for the specific rule based on value
  if (columnRule) {
    const rule = columnRule.rules.find((r: any) => r.value === value);
    return rule ? rule.class : "";
  }

  return "";
};

// Updated version to accept column name dynamically
export const getCellStyleInline = (
  value: any,
  activeViews: any,
  columnName: string
) => {
  if (!activeViews || !activeViews.conditional_formatting) {
    return {};
  }
  const columnRule = activeViews.conditional_formatting.find(
    (r: any) => r.column === columnName
  );
  if (columnRule) {
    const rule = columnRule.rules.find((r: any) => r.value === value);
    // Assuming you have a mapping from class names to actual styles
    return rule ? mapClassNameToStyle(rule.class) : {};
  }
  return {};
};

// Example mapping function (you need to define the actual CSS properties)
export const mapClassNameToStyle = (className: any) => {
  const styles: { [key: string]: { backgroundColor: string } } = {
    "bg-green-500": { backgroundColor: "#10B981" }, // Tailwind Green 500
    "bg-red-500": { backgroundColor: "#EF4444" }, // Tailwind Red 500
    "bg-gray-500": { backgroundColor: "#6B7280" }, // Tailwind Gray 500
    "bg-orange-500": { backgroundColor: "#F59E0B" }, // Tailwind Orange 500
  };
  return styles[className] || {};
};

export function evaluateCondition(
  item: any,
  condition: FilterCondition
): boolean {
  switch (condition.type) {
    case "exclude":
      // If condition.values is undefined, default to false to indicate the item does not match the exclusion criteria
      return condition.values
        ? !condition.values.includes(item[condition.field_name])
        : false;
    case "include":
      // If condition.values is undefined, default to false as there are no values to include the item by
      return condition.values
        ? condition.values.includes(item[condition.field_name])
        : false;
    case "not_equals":
      // Similar logic as "exclude"
      return condition.values
        ? !condition.values.includes(item[condition.field_name])
        : false;
    case "range":
      const value = new Date(item[condition.field_name]);
      const start = new Date(condition.range_start!); // Assuming range_start and range_end are always provided for "range" type
      const end = new Date(condition.range_end!);
      return value >= start && value <= end;
    default:
      return true; // Default case to include the item if condition type is unknown
  }
}

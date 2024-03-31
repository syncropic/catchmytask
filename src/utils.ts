import {
  ColumnConfig,
  FieldConfiguration,
  FilterCondition,
} from "@components/interfaces";
import { format, parseISO } from "date-fns";
import { MRT_TableInstance } from "mantine-react-table";

export function formatIdWithPrefix(
  id: string | number | undefined,
  prefix: string
): string {
  const separator = ":";
  // Return "undefined" as a string if id is actually undefined
  if (id === undefined) {
    return "undefined";
  }

  // Ensure id is treated as a string, accommodating for numbers or other types
  const idStr = id.toString();

  // First, check if id already starts with prefix, if so, handle separator logic
  if (idStr.startsWith(prefix)) {
    // Check if the correct separator is already placed after the prefix
    if (idStr.substring(prefix.length).startsWith(separator)) {
      return idStr; // Correctly formatted with prefix and separator
    } else {
      // Prefix is there, but separator is missing or not in the correct position
      return `${prefix}${separator}${idStr.substring(prefix.length)}`;
    }
  } else {
    // Prefix not present at the start, add prefix and separator
    return `${prefix}${separator}${idStr}`;
  }
}

export function removeSeparator(id: string | number | undefined): string {
  const separator = ":";
  // Return undefined immediately if id is undefined
  if (id === undefined) {
    return "undefined";
  }

  // Ensure id is treated as a string
  const idStr = id.toString();
  const separatorIndex = idStr.indexOf(separator);

  if (separatorIndex !== -1) {
    return idStr.slice(0, separatorIndex) + idStr.slice(separatorIndex + 1);
  }

  // Return original ID if separator is not found
  return idStr;
}

export function addSeparator(
  id: string | number | undefined,
  prefix: string
): string {
  const separator = ":";

  // Return undefined immediately if id is undefined
  if (id === undefined) {
    return "undefined";
  }

  // Ensure id is a string (if it's a number, convert it)
  const idStr = id.toString();

  if (idStr.startsWith(prefix)) {
    return (
      idStr.slice(0, prefix.length) + separator + idStr.slice(prefix.length)
    );
  }

  // Return original ID if prefix does not match
  return idStr;
}

export function removePrefix(id: string, prefix: string): string {
  const separator = ":";
  const prefixWithSeparator = `${prefix}${separator}`;

  if (id?.startsWith(prefixWithSeparator)) {
    return id.substring(prefixWithSeparator.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function addPrefix(id: string, prefix: string): string {
  const separator = ":";
  return `${prefix}${separator}${id}`;
}

export function formatDateTime(
  date: string | Date,
  formatStr: string
): string | undefined {
  if (!date) {
    return undefined;
  }

  try {
    if (typeof date === "string") {
      // If the date is a string, try parsing it as ISO first
      const parsedDate = parseISO(date);
      return format(parsedDate, formatStr);
    } else {
      // If the date is already a Date object, format it directly
      return format(date, formatStr);
    }
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return undefined;
  }
}

export function formatDateTimeAsDate(date: string | Date): string | undefined {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    return format(parseISO(date), "yyyy-MM-dd");
  } else {
    return format(date, "yyyy-MM-dd");
  }
}

export function formatDateTimeAsDateTime(
  date: string | Date
): string | undefined {
  if (!date) {
    return undefined;
  }
  if (typeof date === "string") {
    return format(parseISO(date), "yyyy-MM-dd hh:mm a");
  } else {
    return format(date, "yyyy-MM-dd hh:mm a");
  }
}

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

export const locationTypeOptions = [
  {
    value: "current_view",
    label: "current_view",
    name: "current_view",
  },
  {
    value: "local",
    label: "local",
    name: "local",
  },
];

export const testProgressOptions = [
  {
    value: "continue_until_checkout",
    label: "continue_until_checkout",
    name: "continue_until_checkout",
  },
  {
    value: "continue_until_confirmed_booking",
    label: "continue_until_confirmed_booking",
    name: "continue_until_confirmed_booking",
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

export const handleComingSoon = (): void => {
  alert("Coming Soon");
};

interface ActiveView {
  conditional_formatting: Array<{
    column: string;
    rules: Array<{
      value: string;
      class: string;
    }>;
  }>;
}

export const getCellStyle = (
  value: string,
  activeViews: ActiveView
): string => {
  if (!activeViews || !activeViews.conditional_formatting) {
    return "";
  }

  const columnRule = activeViews.conditional_formatting.find(
    (r) => r.column === "sst_status_and_supplier_status_comparison"
  );

  if (columnRule) {
    const rule = columnRule.rules.find((r) => r.value === value);
    return rule ? rule.class : "";
  }

  return "";
};

// export const getCellStyleInline = (
//   value: string,
//   activeViews: ActiveView,
//   columnName: string
// ): Record<string, string> => {
//   if (!activeViews || !activeViews.conditional_formatting) {
//     return {};
//   }
//   const columnRule = activeViews.conditional_formatting.find(
//     (r) => r.column === columnName
//   );
//   if (columnRule) {
//     const rule = columnRule.rules.find((r) => r.value === value);
//     return rule ? mapClassNameToStyle(rule.class) : {};
//   }
//   return {};
// };

// Function to get the inline style based on value and column definition
export const getCellStyleInline = (
  value: any,
  columnDefinition: FieldConfiguration
) => {
  if (!columnDefinition || !columnDefinition.conditional_formatting) {
    return {};
  }

  // Destructuring for clarity
  const {
    conditional_formatting: { rules },
  } = columnDefinition;

  // Find the matching rule based on the value
  const matchingRule = rules.find((rule) => rule.value === value);

  // Return the corresponding style if a match is found
  return matchingRule ? mapClassNameToStyle(matchingRule.class) : {};
};

export const mapClassNameToStyle = (
  className: string
): Record<string, string> => {
  const styles: { [key: string]: { backgroundColor: string } } = {
    "bg-green-500": { backgroundColor: "#10B981" },
    "bg-red-500": { backgroundColor: "#EF4444" },
    "bg-gray-500": { backgroundColor: "#6B7280" },
    "bg-orange-500": { backgroundColor: "#F59E0B" },
  };
  return styles[className] || {};
};

export function evaluateCondition(
  item: Record<string, any>,
  condition: FilterCondition
): boolean {
  switch (condition.type) {
    case "exclude":
      return condition.values
        ? !condition.values.includes(item[condition.field_name])
        : false;
    case "include":
      return condition.values
        ? condition.values.includes(item[condition.field_name])
        : false;
    case "not_equals":
      return condition.values
        ? !condition.values.includes(item[condition.field_name])
        : false;
    case "range":
      const value = new Date(item[condition.field_name]);
      const start = new Date(condition.range_start!);
      const end = new Date(condition.range_end!);
      return value >= start && value <= end;
    default:
      return true;
  }
}

// If TableInstance does not inherently support generics,
// you don't explicitly declare T here but ensure the usage is type-safe.
export function updateTableVisibility<T extends Record<string, any>>(
  tableInstance: MRT_TableInstance<T>,
  columnsConfig: ColumnConfig[] | null
) {
  let visibility: Record<string, boolean> = {};
  let pinning: Record<"left" | "right", string[]> = { left: [], right: [] };

  // Reset logic when columnsConfig is null
  if (columnsConfig === null) {
    visibility = tableInstance
      .getAllLeafColumns()
      .reduce<Record<string, boolean>>((acc, column) => {
        acc[column.id] = true; // Assuming you want all columns visible by default
        return acc;
      }, {});

    tableInstance.resetColumnPinning(); // This line may need to be adjusted based on the actual API of your table instance.
  } else {
    // Hide all columns initially
    visibility = tableInstance
      .getAllLeafColumns()
      .reduce<Record<string, boolean>>((acc, column) => {
        acc[column.id] = false;
        return acc;
      }, {});

    // Update visibility and construct pinning object based on config
    columnsConfig.forEach((columnConfig) => {
      const { field_name, visible, pin } = columnConfig;
      visibility[field_name] = !!visible;

      if (pin === "left" || pin === "right") {
        pinning[pin].push(field_name);
      }
    });

    // Update the table instance with the new visibility and pinning state
    tableInstance.setColumnVisibility(visibility);
    tableInstance.setColumnPinning(pinning);
  }
}

// src/components/Utils/dateUtils.ts - Create this helper file
import dayjs from "dayjs";

/**
 * Safely parses a value into a Date object
 * @param value Any value to attempt to convert to a Date
 * @returns A valid Date object or null if parsing fails
 */
export const safeParseDate = (value: any): Date | null => {
  // If it's already a Date object, validate it
  if (value instanceof Date) {
    return !isNaN(value.getTime()) ? value : null;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Try ISO format first (YYYY-MM-DD)
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const date = new Date(value);
        return !isNaN(date.getTime()) ? date : null;
      } catch (e) {
        return null;
      }
    }

    // Try with dayjs for more flexible parsing
    try {
      const parsedDate = dayjs(value).toDate();
      return !isNaN(parsedDate.getTime()) ? parsedDate : null;
    } catch (e) {
      return null;
    }
  }

  // If it's a number (timestamp), convert it
  if (typeof value === "number") {
    try {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? date : null;
    } catch (e) {
      return null;
    }
  }

  // For any other case, return null
  return null;
};

/**
 * Safely serializes a date value for storage
 * @param value Date value to serialize
 * @returns ISO string representation or null
 */
export const serializeDate = (value: any): string | null => {
  const date = safeParseDate(value);
  return date ? date.toISOString() : null;
};

/**
 * Checks if a value is a valid date
 * @param value Value to check
 * @returns True if the value represents a valid date
 */
export const isValidDate = (value: any): boolean => {
  return safeParseDate(value) !== null;
};

/**
 * Custom date parser for Mantine's DateInput component
 * @param input String input from DateInput
 * @returns Parsed Date object or null
 */
export const mantineDateParser = (input: string): Date | null => {
  // Try multiple formats
  const formats = ["YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY", "DD.MM.YYYY"];

  for (const format of formats) {
    const parsed = dayjs(input, format);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  // Special case handling
  if (input.toLowerCase() === "today") {
    return new Date();
  }

  if (input.toLowerCase() === "yesterday") {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }

  if (input.toLowerCase() === "tomorrow") {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }

  return null;
};

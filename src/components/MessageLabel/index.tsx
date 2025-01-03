import React from "react";
import {
  format,
  isValid,
  parseISO,
  isToday,
  isYesterday,
  differenceInYears,
} from "date-fns";
import { Tooltip, Text, Group } from "@mantine/core";

interface MessageLabelRecord {
  updated_datetime?: string | Date | null;
  created_datetime?: string | Date | null;
  title?: string;
  name?: string;
  excerpt?: string;
  description?: string;
  author_id?: string;
}

interface MessageLabelProps {
  record: MessageLabelRecord;
}

const MessageLabel: React.FC<MessageLabelProps> = ({ record }) => {
  // Helper function to get the first valid string from multiple options
  const getFirstValid = (...options: (string | undefined)[]): string => {
    return (
      options.find((opt) => typeof opt === "string" && opt.trim().length > 0) ||
      ""
    );
  };

  // Safely format date
  const formatDateTime = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "";

    try {
      const date =
        typeof dateValue === "string" ? parseISO(dateValue) : dateValue;

      if (!isValid(date)) return "";

      if (isToday(date)) {
        return format(date, "h:mm a");
      }

      if (isYesterday(date)) {
        return `Yesterday ${format(date, "h:mm a")}`;
      }

      const yearDiff = differenceInYears(new Date(), date);
      if (yearDiff === 0) {
        return format(date, "MMM d, h:mm a"); // e.g., "Jan 3, 2:30 PM"
      }

      return format(date, "MMM d, yyyy, h:mm a"); // e.g., "Jan 3, 2024, 2:30 PM"
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Get timestamp
  const timestamp = record.updated_datetime || record.created_datetime;
  const formattedTime = formatDateTime(timestamp);

  // Get heading - prioritize title, name, or truncated content
  const heading = getFirstValid(
    record.title,
    record.name,
    record.excerpt?.slice(0, 40),
    record.description?.slice(0, 40)
  );

  // Get subheading - prioritize excerpt or truncated description/content
  const subheading = getFirstValid(
    record.excerpt,
    record.description?.slice(0, 40)
  );

  // Truncate functions
  const truncateText = (text: string | undefined, length: number): string => {
    if (!text) return "";
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  return (
    <Tooltip
      multiline
      position="bottom-start"
      classNames={{
        tooltip: "max-w-lg",
      }}
      label={
        <div className="space-y-2">
          <div className="font-medium">{heading}</div>
          {subheading && (
            <div className="text-sm text-gray-600">{subheading}</div>
          )}
        </div>
      }
    >
      <div className="w-full flex flex-col py-2 px-3 gap-1 cursor-pointer hover:bg-gray-50">
        {/* Row 1: Author and Date */}
        <div className="flex items-center justify-between gap-4 min-w-0">
          <Text size="sm" className="text-gray-600 font-medium truncate flex-1">
            {record.author_id || ""}
          </Text>
          <Text
            size="sm"
            className="text-gray-500 whitespace-nowrap flex-shrink-0"
          >
            {formattedTime}
          </Text>
        </div>

        {/* Row 2: Heading */}
        <Text
          size="sm"
          className="font-medium text-gray-900 truncate w-full"
          lineClamp={1}
        >
          {truncateText(heading, 40)}
        </Text>

        {/* Row 3: Subheading */}
        {subheading && (
          <Text
            size="sm"
            className="text-gray-600 truncate w-full"
            lineClamp={1}
          >
            {truncateText(subheading, 40)}
          </Text>
        )}
      </div>
    </Tooltip>
  );
};

export default MessageLabel;

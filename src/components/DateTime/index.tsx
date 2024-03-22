import React from "react";
import { format as formatDate, parseISO } from "date-fns";
import { IFieldConfigurationWithValue } from "@components/interfaces";

const DateTime: React.FC<IFieldConfigurationWithValue> = ({
  value,
  display_format,
}) => {
  function displayDate(date: string | Date): string | undefined {
    if (!date) {
      return undefined;
    }
    if (typeof date === "string") {
      return formatDate(parseISO(date), display_format || "yyyy-MM-dd");
    } else {
      return formatDate(date, display_format || "yyyy-MM-dd");
    }
  }

  return <div>{displayDate(value)}</div>;
};

export default DateTime;

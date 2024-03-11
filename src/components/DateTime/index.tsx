import React from "react";
import { format as formatDate, parseISO } from "date-fns";

const DateTime = ({ value, displayFormat }) => {
  function displayDate(date: string | Date): string | undefined {
    if (!date) {
      return undefined;
    }
    if (typeof date === "string") {
      return formatDate(parseISO(date), displayFormat || "yyyy-MM-dd");
    } else {
      return formatDate(date, displayFormat || "yyyy-MM-dd");
    }
  }

  return <div>{displayDate(value, displayFormat)}</div>;
};

export default DateTime;

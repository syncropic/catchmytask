import { IFieldConfigurationWithValue } from "@components/interfaces";
import React from "react";

const Decimal: React.FC<IFieldConfigurationWithValue> = ({
  value,
  display_format,
}) => {
  // Function to format the number. Checks for null, undefined, or empty string values.
  const formatNumber = (number: any, format: any) => {
    // If the value is null, undefined, or an empty string, return an empty string
    if (number === null || number === undefined || number === "") {
      return "";
    }

    // If the displayFormat is an empty string, return the number as is
    if (format === "") {
      return number.toString();
    }

    // Otherwise, format the number with Intl.NumberFormat and prepend the format (symbol) if provided
    const formattedNumber = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2, // Adjust according to the required number of decimal places
      maximumFractionDigits: 2, // Can be customized
    }).format(number);

    return format ? `${format}${formattedNumber}` : formattedNumber;
  };

  return <div>{formatNumber(value, display_format)}</div>;
};

export default Decimal;

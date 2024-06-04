import { IAnalyticsComponentProps } from "@components/interfaces";
import React from "react";
import { Text } from "@mantine/core";
// const Analytics: React.FC<IAnalyticsComponentProps<T>> = ({ table }) => {
//   return <div>analytics</div>;
// };

// Make the component generic and pass the generic type to IAnalyticsComponentProps
const Analytics = <T extends Record<string, any>>({
  table,
}: IAnalyticsComponentProps<T>) => {
  return (
    <div className="flex gap-4">
      <Text>
        Total items:{" "}
        <Text span fw={500}>
          {table.getFilteredRowModel().flatRows.length}
        </Text>
      </Text>
      <Text>
        Pending:{" "}
        <Text span fw={500}>
          {
            table
              .getFilteredRowModel()
              .flatRows.filter(
                (item) => item.original?.queue_item_status == "pending"
              ).length
          }
        </Text>
      </Text>
      <Text>
        Awaiting Approval:{" "}
        <Text span fw={500}>
          {
            table
              .getFilteredRowModel()
              .flatRows.filter(
                (item) =>
                  item.original?.queue_item_status == "awaiting_approval"
              ).length
          }
        </Text>
      </Text>
      <Text>
        Escalate:{" "}
        <Text span fw={500}>
          {
            table
              .getFilteredRowModel()
              .flatRows.filter(
                (item) => item.original?.queue_item_status == "escalate"
              ).length
          }
        </Text>
      </Text>
      <Text>
        Resolved:{" "}
        <Text span fw={500}>
          {
            table
              .getFilteredRowModel()
              .flatRows.filter(
                (item) => item.original?.queue_item_status == "resolved"
              ).length
          }
        </Text>
      </Text>
      <Text>
        Selected items:{" "}
        <Text span fw={500}>
          {table.getSelectedRowModel().flatRows.length}{" "}
        </Text>
      </Text>
    </div>
  );
};

export default Analytics;

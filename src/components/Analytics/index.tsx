import { IAnalyticsComponentProps } from "@components/interfaces";
import React from "react";
import { Text } from "@mantine/core";
// const Analytics: React.FC<IAnalyticsComponentProps<T>> = ({ table }) => {
//   return <div>analytics</div>;
// };

// // Make the component generic and pass the generic type to IAnalyticsComponentProps
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

interface IFilteredRowModel<T> {
  flatRows: Array<{
    original: T;
  }>;
}

interface ITable<T> {
  getFilteredRowModel: () => IFilteredRowModel<T>;
}

const calculatePercentage = <T extends Record<string, any>>(
  table: ITable<T>,
  conditionKey: keyof T
): string => {
  const total = table.getFilteredRowModel().flatRows.length;
  const count = table
    .getFilteredRowModel()
    .flatRows.filter((item) => item.original[conditionKey] === "TRUE").length;
  return ((count / total) * 100).toFixed(2) + "%";
};

interface CategoryProps {
  label: string;
  value: string | number;
}

const Category: React.FC<CategoryProps> = ({ label, value }) => (
  <Text>
    {label}:{" "}
    <Text span fw={500}>
      {value}
    </Text>
  </Text>
);

export const CategoricalAnalytics = <T extends Record<string, any>>({
  table,
}: IAnalyticsComponentProps<T>) => {
  return (
    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <Category
        label="Total items"
        value={table.getFilteredRowModel().flatRows.length}
      />
      <Category
        label="is_not_test_booking"
        value={calculatePercentage(table, "is_not_test_booking")}
      />
      <Category
        label="is_not_partial_booking"
        value={calculatePercentage(table, "is_not_partial_booking")}
      />
      <Category
        label="crid_is_present"
        value={calculatePercentage(table, "crid_is_present")}
      />
      <Category
        label="prop_id_is_present"
        value={calculatePercentage(table, "prop_id_is_present")}
      />
      <Category
        label="pcc_hotel_is_correct"
        value={calculatePercentage(table, "pcc_hotel_is_correct")}
      />
      <Category
        label="flight_pcc_is_correct"
        value={calculatePercentage(table, "flight_pcc_is_correct")}
      />
      <Category
        label="currency_is_correct"
        value={calculatePercentage(table, "currency_is_correct")}
      />
      <Category
        label="number_of_rooms_is_one"
        value={calculatePercentage(table, "number_of_rooms_is_one")}
      />
      <Category
        label="number_of_comp_nights_is_correct"
        value={calculatePercentage(table, "number_of_comp_nights_is_correct")}
      />
    </div>
  );
};

export default Analytics;

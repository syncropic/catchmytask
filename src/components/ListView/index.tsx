import TableView from "@components/TableView";
import { useDataColumns } from "@components/Utils";
import { IListItem } from "@components/interfaces";
import { useCustom } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import { updateTableVisibility } from "src/utils";
import _ from "lodash";

export const ListView: React.FC<{ item: IListItem }> = ({ item }) => {
  // console.log("item", item);
  const data_columns_enhanced = useDataColumns(
    item?.fields_configuration,
    item?.id
  );

  const { data, isLoading, isError, error } = useCustom({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
    method: "post",
    config: {
      payload: item?.active_query,
    },
  });

  // Assuming this is your default configuration object
  const defaultConfig = {
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: {
        left: ["mrt-row-select", "mrt-row-expand", "mrt-row-actions"],
      },
      grouping: [],
    },
    enableGrouping: false,
    enableRowActions: true,
    enableRowSelection: true,
  };

  // Merge the defaultConfig with displayOptions, with displayOptions taking precedence
  const customTableConfig = _.merge(
    {},
    defaultConfig,
    item?.display_options || {}
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <>
      <TableView
        resource={item?.resource}
        data_columns={data_columns_enhanced}
        data_items={
          item?.data_field ? data?.data[0]?.[item.data_field] : data?.data
        }
        item={item}
        isLoadingDataItems={isLoading}
        customTableConfig={customTableConfig}
        updateTableVisibility={updateTableVisibility}
      />
    </>
  );
};

export default ListView;

import TableView from "@components/TableView";
import { useDataColumns } from "@components/Utils";
import { IListItem } from "@components/interfaces";
import { useCustom } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import { updateTableVisibility } from "src/utils";

export const ListView: React.FC<{ item: IListItem }> = ({ item }) => {
  const data_columns_enhanced = useDataColumns(
    item?.fields_configuration,
    item?.id
  );

  // Assuming `useCustom` does not automatically re-run when its config changes,
  // you need to manage it with a state and useEffect.
  const [queryConfig, setQueryConfig] = useState({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
    dataProviderName: "catchmytaskApiDataProvider",
    method: "post",
    config: {
      payload: item?.active_query,
    },
  });

  // Update queryConfig state whenever item changes
  useEffect(() => {
    setQueryConfig((prevConfig) => ({
      ...prevConfig,
      config: {
        ...prevConfig.config,
        payload: item?.active_query,
      },
    }));
  }, [item]);

  const { data, isLoading, isError, error } = useCustom(queryConfig);

  let customTableConfig = {
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: {
        left: ["mrt-row-select", "mrt-row-expand", "mrt-row-actions"],
      },
    },
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {JSON.stringify(error.response.data)}</div>;

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

import {
  HttpError,
  IResourceComponentsProps,
  useCustomMutation,
  useGo,
  useInvalidate,
  useList,
  useUpdate,
} from "@refinedev/core";
import React, { useMemo } from "react";

import { Anchor, Switch, Text } from "@mantine/core";
import { type MRT_ColumnDef } from "mantine-react-table";
import {
  addSeparator,
  formatDateTimeAsDateTime,
  updateTableVisibility,
} from "src/utils";
import { IAutomation } from "./interfaces";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate: mutateUpdate, isLoading: isLoadingMutateUpdate } =
    useUpdate();
  const { mutate: mutateCustom, isLoading: isLoadingMutateCustom } =
    useCustomMutation();
  const invalidate = useInvalidate();

  const data_columns = useMemo<MRT_ColumnDef<IAutomation>[]>(
    () => [
      {
        accessorKey: "automation_status",
        header: "automation_status",
        filterVariant: "multi-select",
        Cell: ({ row }) => (
          <Switch
            defaultChecked
            checked={row.original.automation_status === "active"}
            onChange={(event) =>
              handleChangeAutomationStatus(
                row.original,
                event.currentTarget.checked
              )
            }
          />
        ),
      },
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "automations", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.name}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "frequency",
        header: "frequency",
        filterVariant: "multi-select",
      },
      {
        accessorKey: "start_datetime",
        header: "start_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.start_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "end_datetime",
        header: "end_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.end_datetime)}
          </Text>
        ),
      },
      { accessorKey: "author", header: "author" },
      {
        accessorKey: "updated_at",
        header: "updated_at",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.updated_at)}
          </Text>
        ),
      },
      {
        accessorKey: "created_at",
        header: "created_at",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.created_at)}
          </Text>
        ),
      },
    ],
    []
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorReports,
  } = useList<IAutomation, HttpError>({
    resource: "automations",
    filters: [
      {
        field: "view_status",
        operator: "eq",
        value: "published",
      },
    ],
  });

  const data_items = data?.data ?? [];

  let customTableConfig = {
    initialState: {
      sorting: [{ id: "created_at", desc: true }],
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: {
        left: ["mrt-row-select", "mrt-row-expand", "mrt-row-actions"],
      },
    },
  };

  const handleChangeAutomationStatus = (record: any, e: any) => {
    mutateUpdate(
      {
        resource: "automations",
        values: {
          automation_status: e ? "active" : "inactive",
        },
        id: addSeparator(record?.id, "automations"),
        successNotification: (data, values) => {
          invalidate({
            resource: "automations",
            invalidates: ["list"],
          });
          // close();
          return {
            message: `successfully executed.`,
            description: "Success with no errors",
            type: "success",
          };
        },
        errorNotification: (data, values) => {
          return {
            message: `Something went wrong when executing`,
            description: "Error",
            type: "error",
          };
        },
      },
      {
        // onError: (error, variables, context) => {
        //   // An error occurred!
        // },
        onSuccess: (data, variables, context) => {
          // Let's celebrate!
          // console.log("call custom mutation here");
          handleActivateAutomation(data?.data);
          // console.log("variables", variables);
          // console.log("context", context);
        },
      }
    );
  };

  const handleActivateAutomation = (data: any) => {
    // let request_data = {
    //   ...activeActionOption,
    //   id: addSeparator(activeActionOption?.id, "action_options"),
    //   values: {
    //     ...record,
    //     ...values, // so i can override original in the form if not disabled
    //     action_options: [
    //       addSeparator(activeActionOption?.id, "action_options"),
    //     ],
    //   },
    // };
    mutateCustom({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/activate-automation`,
      method: "post",
      values: data,
      successNotification: (data, values) => {
        // invalidate({
        //   resource: "caesars_bookings",
        //   invalidates: ["list"],
        // });
        // close();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  return <div>automations list</div>;
};
export default PageList;

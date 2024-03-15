import { Button, Flex, Group, Text } from "@mantine/core";
import {
  IResourceComponentsProps,
  useCustomMutation,
  useList,
  useParsed,
  useShow,
} from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import {
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import React, { useMemo } from "react";
import CodeBlock from "src/components/codeblock/codeblock";
import { addSeparator } from "src/utils";
import ListSessions from "pages/sessions";

// Define the data structure
interface ICaesarsBooking {
  id: string;
  name: string;
  // lead_passenger_name: string;
  // pnr: string;
  // schedule_change_remarks: string;
  // old_pnr_text: string;
  // new_pnr_text: string;
  // package_id: string;
}

interface IActionStep {
  [key: string]: any;
}

const SaveFunctionCallInfoComponent = ({ data }: { data: any }) => {
  // Custom rendering logic for 'save_function_call_info'
  return (
    <div>
      {/* Render the details of the data in a user-friendly format */}
      <CodeBlock jsonData={data} />
    </div>
  );
};

const CreateAndSaveToRemoteComponent = (data_item: any) => {
  let data = data_item?.data;
  // Function to extract download_link and webUrl (remote_link)
  const extractLinks = (data: any) => {
    const downloadLink = data?.remote_file?.download_link || "";
    let remoteLink = "";

    if (data?.remote_file?.link?.webUrl) {
      remoteLink = data.remote_file.link.webUrl;
    } else if (data?.remote_file?.shareable_link) {
      remoteLink = data.remote_file.shareable_link;
    } else if (data?.remote_file?.upload_error?.webUrl) {
      remoteLink = data.remote_file.upload_error.webUrl;
    } else if (data?.remote_file?.shareable_link_error?.link?.webUrl) {
      remoteLink = data.remote_file.shareable_link_error.link.webUrl;
    }

    return { downloadLink, remoteLink };
  };

  const { downloadLink, remoteLink } = extractLinks(data);

  return (
    <div>
      <p>
        <strong>Name: </strong>
        {data?.name}
      </p>
      <p className="break-words">
        <strong>Download Link:</strong>{" "}
        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
          {downloadLink}
        </a>
      </p>
      <p className="break-words">
        <strong>Remote Link:</strong>{" "}
        <a href={remoteLink} target="_blank" rel="noopener noreferrer">
          {remoteLink}
        </a>
      </p>
    </div>
  );
};

const renderOperationDetails = (fileOperation: any, data: any) => {
  switch (fileOperation) {
    case "save_function_call_info":
      return <SaveFunctionCallInfoComponent data={data} />;
    case "create_and_save_to_remote":
      return <CreateAndSaveToRemoteComponent data={data} />;
    default:
      return <SaveFunctionCallInfoComponent data={data} />;
  }
};

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const {
    mutate,
    isLoading: isLoadingCustomMutation,
    isError,
  } = useCustomMutation();

  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  // additions
  const {
    data: executeData,
    isLoading: isLoadingExecuteData,
    isError: isErrorExecuteData,
  } = useList({
    resource: "execute",
    filters: [
      {
        field: "record",
        operator: "eq",
        value: addSeparator(id, "reports"),
      },
    ],
  });

  // EXECUTE
  const executeRequestData = {
    task: {
      id: "",
    },
    options: {
      sync_from_source_to_destination: true,
      delete_source_from_destination: false,
      plan_with_llm: false,
      rerun_execution_orders: [],
      execution_orders_range: [],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
      create_database_record: true,
      update_record: true,
      record_task_field_name: "onewurld_daily_bookings_and_charges_report",
    },
    task_input: {
      get_collection_info_01: {
        collection: "schedule_changes",
        filename: "schedule_changes",
        start_date: "2024-01-11",
        end_date: "2024-01-11",
        date_types: ["analysis_date"],
      },
      create_email_message_01: {
        email_type: "personal",
        personal_message: "",
        internal_message: "",
      },
      send_email_message_01: {
        mail_list: "personal",
      },
    },
  };
  // Example data
  const execute_data = executeData?.data ?? [];
  // console.log(execute_data);
  const columns = useMemo<MRT_ColumnDef<IActionStep>[]>(
    () => [
      // { accessorKey: "id", header: "id" },
      {
        id: "actions",
        accessorKey: "id",
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                mutate({
                  url: `http://localhost/execute`,
                  method: "post",
                  values: {
                    ...executeRequestData,
                    task: {
                      id: row.original.in,
                    },
                    options: {
                      ...executeRequestData.options,
                      execution_orders_range: [
                        row.original.execution_order,
                        row.original.execution_order,
                      ],
                    },
                  },
                  successNotification: (data, values) => {
                    return {
                      message: `${row.original.id} Successfully fetched.`,
                      description: "Success with no errors",
                      type: "success",
                    };
                  },
                  errorNotification: (data, values) => {
                    return {
                      message: `Something went wrong when getting ${row.original.id}`,
                      description: "Error",
                      type: "error",
                    };
                  },
                })
              }
            >
              {isLoadingCustomMutation ? "Loading..." : "Run"}
            </Button>
          </Group>
        ),
      },
      { accessorKey: "in", header: "task" },
      { accessorKey: "out", header: "function" },
      { accessorKey: "name", header: "name" },
      { accessorKey: "kind", header: "kind" },
      { accessorKey: "status", header: "status" },
      { accessorKey: "execution_order", header: "execution_order" },
      {
        accessorKey: "created_at",
        header: "created_at",
        Cell: ({ renderedCellValue, row }) => (
          <div>{row.original.created_at}</div>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "updated_at",
        Cell: ({ renderedCellValue, row }) => (
          <div>{row.original.created_at}</div>
        ),
      },
    ],
    []
  );
  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "md",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Actions",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      sorting: [
        {
          id: "execution_order", // Column ID to sort by
          desc: false, // false for ascending, true for descending
        },
      ],
    },
    data: execute_data,
    renderDetailPanel: ({ row }) => (
      <div className="w-full max-w-screen-xl mx-auto">
        {row.original.results && row.original.results.items ? (
          row.original.results.items.map((item: any, index: any) => (
            <div key={index} className="w-full">
              {renderOperationDetails(item.file_operation, item)}
            </div>
          ))
        ) : (
          <Text>No results available.</Text>
        )}
      </div>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("name"));
        });
      };

      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("deleting " + row.getValue("id"));
        });
      };
      const handleRun = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("running " + row.getValue("id"));
        });
      };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleDelete}
              variant="filled"
            >
              Delete
            </Button>
            <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleRun}
              variant="filled"
            >
              Run
            </Button>
          </Flex>
        </Flex>
      );
    },
  });

  // dymamic link
  // let baseURL = "https://snowstormtechnologyukltd.freshdesk.com/a/tickets/";
  // let ticketNumber = record?.schedule_change_freshdesk_ticket_number;
  // let freshdesk_shedule_change_url = baseURL + ticketNumber;

  return (
    <>
      <Show isLoading={isLoading}>
        <Text>
          <b>Id:</b> {record?.id}
        </Text>
        <Text>
          <b>Name:</b> {record?.name}
        </Text>
        <ListSessions></ListSessions>
        {/* <WriteForm /> */}
        {/* <CodeBlock jsonData={data} /> */}
        {/* <Accordion defaultValue="actions">
          <Accordion.Item key="details" value="details">
            <Accordion.Control icon={<IconList />}>
              More details
            </Accordion.Control>
            <Accordion.Panel>
              <CodeBlock jsonData={data} />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="actions" value="actions">
            <Accordion.Control icon={<IconMathFunction />}>
              Actions
            </Accordion.Control>
            <Accordion.Panel>
              <MantineProvider
                theme={{
                  colorScheme: "light",
                  primaryColor: "blue",
                }}
              >
                <MantineReactTable table={table} />
              </MantineProvider>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion> */}
      </Show>
    </>
  );
};
export default PageShow;

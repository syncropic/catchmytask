import { ResultsComponentProps } from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import { stepsToMarkdown } from "@components/Utils";
import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import {
  IconEdit,
  IconEye,
  IconPin,
  IconPlayCard,
  IconPlayerPlay,
  IconRobot,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
// import { useClipboard, useMediaQuery, useViewportSize } from "@mantine/hooks";
// import { flexRender } from "@tanstack/react-table";
// import { Table as TanStackTable, ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumn,
  DataTableSortStatus,
  useDataTableColumns,
} from "mantine-datatable";
import { useAppStore } from "src/store";
import Markdown from "react-markdown";
// import { useEffect, useState } from "react";
// import { getColumnIdWithoutResourceGroup } from "src/utils";
// import { Column } from "@tanstack/react-table";
// import React from "react";
// import { DebouncedInput, serializeBigInt } from "@components/Utils";
// import {
//   ActionIcon,
//   Box,
//   Button,
//   Card,
//   Group,
//   Tooltip,
//   Text,
//   CheckIcon,
// } from "@mantine/core";
// import { useAppStore } from "src/store";
// import RecordActionsWrapper from "@components/RecordActions";
// import { sortBy } from "lodash";
// import MonacoEditor from "@components/MonacoEditor";
// import { IconChevronRight, IconCopy, IconEye } from "@tabler/icons-react";
// import clsx from "clsx";
// import classes from "./NestedTablesExample.module.css";
// import { useContextMenu } from "mantine-contextmenu";
// import dynamic from "next/dynamic";
// import { format } from "date-fns";
// import { DatePicker } from "@mantine/dates";
// import "dayjs/locale/en"; // Adjust locale if needed
// import { showNotification } from "@mantine/notifications";
// import RecordSummaryView from "@components/RecordSummaryView";

// const PAGE_SIZES = [10, 15, 20];

export function TableView<T extends Record<string, any>>({
  // tableInstance,
  nested_data_items,
  data_items,
  resource_group,
  data_fields,
  ui,
  execlude_components,
  invalidate_queries_on_submit_success,
  setSorting,
  sorting,
  summary_view,
}: ResultsComponentProps<T>) {
  // Define the type for record_action
  type RecordAction = {
    action: string;
    record: any;
    e: React.MouseEvent<HTMLButtonElement>;
  };

  const { activeView, setActionInputFormValues, action_input_form_values } =
    useAppStore();

  const action_input_form_values_key = `query_${activeView?.id}`;

  // const globalSearchQuery = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[`${search_action_input_form_values_key}`]
  //       ?.query
  // );

  const handleAction = (record_action: RecordAction) => {
    record_action.e.stopPropagation();

    let new_action_input_form_values = {
      ...action_input_form_values,
      [action_input_form_values_key]: {
        ...action_input_form_values[action_input_form_values_key],
        query:
          record_action?.record?.content?.structured_content?.[0]?.final_answer,
      },
    };
    setActionInputFormValues(new_action_input_form_values);
    // alert(JSON.stringify(record_action.record));
  };
  return (
    <>
      {/* <MonacoEditor value={data_items} language="json" height="50vh" /> */}
      {/* <div>{JSON.stringify(tableInstance?.getVisibleFlatColumns())}</div> */}
      {/* <div>{JSON.stringify(data_fields)}</div> */}
      {/* <div>{resource_group}</div> */}
      {/* <div>{JSON.stringify(nested_data_items)}</div> */}
      {/* <div className="flex justify-end">
        <Button
          size="compact-xs"
          onClick={toggleAllRows}
          variant={expandedRecordIds.length === 0 ? "outline" : "filled"}
        >
          {expandedRecordIds.length === 0 ? "expand all" : "collapse all"}
        </Button>
      </div> */}
      {/* <div>{JSON.stringify(sorting)}</div> */}

      {data_items && (
        <DataTable<T>
          // page={1}
          // onPageChange={(page) => console.log(page)}
          // recordsPerPage={10}
          // storeColumnsKey={key}
          // columns={effectiveColumns as DataTableColumn<T>[]}
          columns={[
            ...data_fields.map((field) => {
              return {
                id: field?.name,
                accessor: field?.name,
                ellipsis: true,
                title: field?.name,
                render: (record: any) => {
                  if (field?.name === "author_id") {
                    return (
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                          p-1.5 
                          rounded-full 
                          flex 
                          items-center 
                          justify-center
                          ${
                            record?.author_type === "user"
                              ? "bg-orange-50 text-orange-500 border border-orange-200"
                              : "bg-blue-50 text-blue-500 border border-blue-200"
                          }`}
                        >
                          {record?.author_type === "user" ? (
                            <IconUser size={16} />
                          ) : (
                            <IconRobot size={16} />
                          )}
                        </div>
                        <span className="text-sm">{record[field?.name]}</span>
                      </div>
                    );
                  } else {
                    return <div>{record[field?.name]}</div>;
                  }
                },
              };
            }),
            {
              accessor: "actions",
              title: <Box mr={6}>actions</Box>,
              textAlign: "right",
              render: (record) => (
                <Group gap={4} justify="right" wrap="nowrap">
                  {/* <Tooltip key="edit" label={`edit`} position="top">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      // onClick={() => showModal({ company, action: "view" })}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip> */}
                  {/* {["user"]?.includes(record?.author_type) && (
                    <Tooltip key="query" label={`query`} position="top">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        // onClick={() => showModal({ company, action: "view" })}
                      >
                        <IconSearch size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )} */}
                  {["agent"]?.includes(record?.author_type) && (
                    <>
                      <Tooltip key="execute" label={`execute`} position="top">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="green"
                          onClick={(e) =>
                            handleAction({
                              record: record,
                              action: "execute",
                              e: e,
                            })
                          }
                        >
                          <IconPlayerPlay size={24} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip key="pin" label={`pin`} position="top">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          // color="green"
                          // onClick={() => showModal({ company, action: "edit" })}
                        >
                          <IconPin size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}

                  {/* <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => showModal({ company, action: "delete" })}
                  >
                    <IconTrash size={16} />
                  </ActionIcon> */}
                </Group>
              ),
            },
          ]}
          // records={tableInstance
          //   .getFilteredRowModel()
          //   .rows.map((row) => row.original)}
          // {...(resource_group !== "summary" && { height: "60vh" })} // dynamically include or exclude height
          // records={tableInstance
          //   .getSortedRowModel()
          //   .rows.map((row) => row.original)}
          // sortStatus={localSortStatus}
          // onSortStatusChange={customSetSorting}
          height="50vh"
          records={data_items}
          highlightOnHover={true}
          withColumnBorders={true}
          pinFirstColumn={true}
          // textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
          pinLastColumn={true}
          striped={true}
          // totalRecords={data_items.length}
          // height="70dvh"
          // minHeight={400}
          // 75% of the viewport height as the maximum height
          // maxHeight={height * 0.75}
          // fz="xs"
          // selectedRecords={selectedRecords[resource_group] ?? []}
          // onSelectedRecordsChange={handleSelectValue}
          // defaultColumnRender={(row, _, accessor) => {
          //   const data = row[accessor as keyof typeof row];
          //   return typeof data === "string" ? data : JSON.stringify(data);
          //   return <div>hello world</div>;
          // }}
          // onRowClick={({ record, index, event }) => {
          //   setActiveRecord(serializeBigInt(record));
          //   // if (resource_group === "action_steps") {
          //   //   setActiveAction(record);
          //   // }
          // }}
          // onRowContextMenu={({ record, event }) =>
          //   showContextMenu([
          //     {
          //       key: "copy-record-to-clipboard",
          //       icon: <IconCopy size={16} />,
          //       onClick: () => clipboard.copy(record),
          //       // showNotification({
          //       //   message: `Clicked on view context-menu action for ${record.name} company`,
          //       //   withBorder: true,
          //       // }),
          //     },
          //   ])(event)
          // }
          // onCellClick={({ event, record, index, column, columnIndex }) => {
          //   // console.log("cell value clicked", record[column?.accessor]);
          //   clipboard.copy(record[column?.accessor]);
          // }}
          rowExpansion={{
            allowMultiple: true,
            trigger: "always",
            // initiallyExpanded: ({ record: { entity_type } }) =>
            //   entity_type === "messages",
            // expanded: {
            //   recordIds: [
            //     "issues",
            //     "payment_analysis",
            //     "supplier_analysis",
            //     ...expandedRecordIds,
            //   ],
            //   onRecordIdsChange: setExpandedRecordIds,
            // },
            content: ({ record, collapse }) => (
              <>
                {/* <div className="pl-6">{record?.content}</div> */}
                {["agent"]?.includes(record?.author_type) && (
                  <div className="pl-6 max-w-xs">
                    <div className="markdown-wrapper overflow-hidden">
                      <Markdown className="prose prose-sm max-w-none break-words overflow-x-auto">
                        {stepsToMarkdown(
                          record?.content?.structured_content?.[0]?.steps
                        )}
                      </Markdown>
                    </div>
                    <MonacoEditor
                      value={
                        record?.content?.structured_content?.[0]?.final_answer
                      }
                      language="sql"
                      height="10vh"
                    />
                  </div>
                )}
                {["user"]?.includes(record?.author_type) && (
                  <div className="pl-6">
                    {record?.content &&
                    typeof record.content === "object" &&
                    record.content !== null
                      ? record.content?.text_content
                      : record?.content}
                  </div>
                )}
              </>
            ),
          }}
        />
      )}
    </>
  );
}

export default TableView;

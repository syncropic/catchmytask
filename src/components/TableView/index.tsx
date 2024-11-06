import {
  ActionComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import {
  formatDate,
  formatPythonTemplate,
  stepsToMarkdown,
} from "@components/Utils";
import {
  ActionIcon,
  Box,
  Group,
  LoadingOverlay,
  Tooltip,
  Text,
} from "@mantine/core";
import {
  IconEdit,
  IconEye,
  IconPaperclip,
  IconPin,
  IconPlayCard,
  IconPlayerPause,
  IconPlayerPlay,
  IconRobot,
  IconSearch,
  IconServer,
  IconUser,
  TablerIconsProps,
} from "@tabler/icons-react";
import { format, isValid, parseISO } from "date-fns";
import { MouseEvent } from "react";
import {
  DataTable,
  DataTableColumn,
  DataTableRowClickHandler,
  DataTableSortStatus,
  useDataTableColumns,
} from "mantine-datatable";
import { useAppStore } from "src/store";
import Markdown from "react-markdown";
import { useGo, useParsed } from "@refinedev/core";
import AccordionComponent from "@components/AccordionComponent";
import { contentAccordionConfig } from "@components/View/contentAccordionConfig";
import { useEffect, useRef } from "react";
import AuthorInfo, { authorInfoConfigs } from "./AuthorInfo";
import AutomationToggle from "./AutomationToggle";

export function TableView<T extends Record<string, any>>({
  data_items,
  data_fields,
  view_record,
  title,
  query_key,
}: ResultsComponentProps<T>) {
  // Define the type for record_action
  type RecordAction = {
    action: string;
    record: any;
    e: React.MouseEvent<HTMLButtonElement>;
  };
  const go = useGo();
  const {
    activeView,
    activeSession,
    activeProfile,
    activeTask,
    setActiveTask,
    setActiveEvent,
    setActionInputFormValues,
    action_input_form_values,
    setActionInputFormFields,
  } = useAppStore();

  // interface RowClickProps {
  //   record: any;
  //   index: number;
  //   event: React.MouseEvent<HTMLButtonElement>; // or React.MouseEvent<HTMLElement> if you want to be more specific
  // }
  // Update the RowClickProps to match Mantine's expected types
  interface RowClickProps<T> {
    record: T;
    index: number;
    event: MouseEvent<Element, MouseEvent>;
  }

  const { params } = useParsed();

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;

  const globalSearchQuery = useAppStore(
    (state) =>
      state.action_input_form_values[`${action_input_form_values_key}`]?.query
  );

  const handleAction = (record_action: RecordAction) => {
    record_action.e.stopPropagation();
    let record = record_action?.record;
    let action = record_action.action;
    // console.log(action);
    // console.log(record);
    let action_input_values = {
      number_of_results: 10,
    };
    let language = record?.content?.structured_content?.[0]?.language;
    let query = record?.content?.structured_content?.[0]?.final_answer || "";
    if (language === "python") {
      query = formatPythonTemplate(
        record?.content?.structured_content?.[0]?.final_answer,
        action_input_values || {}
      );
    }
    // console.log(record_action);
    let new_action_input_form_values = {
      ...action_input_form_values,
      [action_input_form_values_key]: {
        ...action_input_form_values[action_input_form_values_key],
        query_template: record?.content?.structured_content?.[0]?.final_answer,
        query: query,
      },
    };
    setActionInputFormValues(new_action_input_form_values);
    setActionInputFormFields(
      action_input_form_values_key,
      record?.content?.structured_content?.[0]?.arguments || []
    );
    if (record?.entity_type === "events") {
      setActiveEvent(record);
    }
  };
  // const handleRowClick = ({ record, index, event }: RowClickProps) => {
  //   // console.log(record);
  //   if (record?.entity_type == "tasks") {
  //     // console.log(record);
  //     setActiveTask(record); // improve this later
  //   }
  //   go({
  //     to: {
  //       resource: "tasks",
  //       action: "show",
  //       id: record?.id,
  //     },
  //     query: {
  //       session_id: activeSession?.id,
  //       profile_id: activeProfile?.id,
  //       ...record?.initial_state?.params,
  //     },
  //     type: "push",
  //   });
  // };
  // Update the handler to use generic type and match Mantine's expected signature
  const handleRowClick: DataTableRowClickHandler<T> = ({
    record,
    index,
    event,
  }) => {
    if (record?.entity_type === "tasks") {
      setActiveTask(record);
    }
    go({
      to: {
        resource: "tasks",
        action: "show",
        id: record?.id,
      },
      query: {
        session_id: activeSession?.id,
        profile_id: activeProfile?.id,
        ...record?.initial_state?.params,
      },
      type: "push",
    });
  };
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToRow = (selector: string) => {
    const el = document.querySelector<HTMLElement>(selector)!;
    viewportRef.current?.scrollTo({
      top: el.offsetTop - el.clientHeight - 1,
      behavior: "smooth",
    });
  };

  // Effect to scroll to last row
  useEffect(() => {
    if (
      data_items?.length &&
      view_record?.include_items?.includes("scroll_to_last_item")
    ) {
      const timeoutId = setTimeout(() => {
        scrollToRow(`[data-row-index="${title} - ${data_items.length - 1}"]`);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [data_items, scrollToRow]);
  let input_record_item = {
    id: "input_record",
    name: "input_record",
    description: "input_record",
    author_id: "system",
    created_datetime: new Date().toISOString(),
  };

  return (
    <>
      {/* <MonacoEditor
        value={{ query_key: query_key }}
        language="json"
        height="25vh"
      /> */}
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

      {data_items && data_fields && (
        <DataTable<T>
          columns={[
            // First spread the data fields columns
            ...data_fields.map(
              (field) =>
                ({
                  id: field?.name,
                  accessor: field?.name,
                  ellipsis: true,
                  title: ["name", "author_id"]?.includes(field?.name)
                    ? title
                    : null,
                  render: (record: any) => {
                    if (field?.name === "author_id") {
                      return (
                        <AuthorInfo
                          record={record}
                          onAction={handleAction}
                          displayConfig={authorInfoConfigs.compact}
                          formatDate={formatDate}
                        />
                      );
                    } else if (
                      field?.name === "name" &&
                      view_record?.include_items?.includes("name_and_details")
                    ) {
                      return (
                        <AuthorInfo
                          record={record}
                          onAction={handleAction}
                          displayConfig={authorInfoConfigs.full}
                          formatDate={formatDate}
                          AutomationToggle={AutomationToggle}
                          query_key={query_key}
                        />
                      );
                    } else {
                      return <div>{record[field?.name]}</div>;
                    }
                  },
                } as DataTableColumn<T>)
            ),

            // Then conditionally spread the actions column
            ...(view_record?.include_items?.includes("actions")
              ? [
                  {
                    accessor: "actions",
                    title: <Box mr={6}>actions</Box>,
                    textAlign: "right",
                    render: (record: any) => (
                      <Group gap={4} justify="right" wrap="nowrap">
                        {["user"]?.includes(record?.author_type) && (
                          // <Tooltip key="query" label={`query`} position="top">
                          //   <ActionIcon
                          //     size="sm"
                          //     variant="subtle"
                          //     color="blue"
                          //     // onClick={() => showModal({ company, action: "view" })}
                          //   >
                          //     <IconSearch size={16} />
                          //   </ActionIcon>
                          // </Tooltip>
                          <>
                            {/* {!["resolved", "closed"]?.includes(
                              record?.resolution_status
                            ) && (
                              <Tooltip label="running" position="top">
                                <span className="text-sm">
                                  <Box pos="relative">
                                    <LoadingOverlay
                                      visible={true}
                                      zIndex={1000}
                                      overlayProps={{ radius: "sm", blur: 8 }}
                                      loaderProps={{
                                        color: "blue",
                                        size: "xs",
                                        type: "dots",
                                      }}
                                    />
                                    loading
                                  </Box>
                                </span>
                              </Tooltip>
                            )} */}
                          </>
                        )}
                        {["agent"]?.includes(record?.author_type) && (
                          <>
                            <Tooltip key="view" label={`view`} position="top">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="green"
                                onClick={(e) =>
                                  handleAction({
                                    record: record,
                                    action: "view",
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
                                color="orange"
                                // onClick={() => showModal({ company, action: "edit" })}
                              >
                                <IconPin size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip
                              key="attachment"
                              label={`attachment`}
                              position="top"
                            >
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                // color="green"
                                // onClick={() => showModal({ company, action: "edit" })}
                              >
                                <IconPaperclip size={16} />
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
                  } as DataTableColumn<T>,
                ]
              : []),
          ]}
          // sortStatus={localSortStatus}
          // onSortStatusChange={customSetSorting}
          customRowAttributes={({ id }, recordIndex) => ({
            "data-row-first-name": id,
            "data-row-index": `${title} - ${recordIndex}`,
          })}
          scrollViewportRef={viewportRef}
          // height="100%"
          records={data_items}
          highlightOnHover={true}
          withColumnBorders={true}
          pinFirstColumn={true}
          {...(view_record?.include_items?.includes("row_click")
            ? { onRowClick: handleRowClick }
            : {})}
          // textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
          pinLastColumn={true}
          striped={true}
          {...(view_record?.include_items?.includes("row_expansion")
            ? {
                rowExpansion: {
                  allowMultiple: true,
                  trigger: "always",
                  content: ({ record, collapse }) => (
                    <>
                      {["agent"]?.includes(record?.author_type) && (
                        <div className="pl-12 max-w-lg">
                          <div className="pl-4">
                            {record?.content?.structured_content?.[0]?.title}
                          </div>
                          <div className="markdown-wrapper overflow-hidden">
                            {record?.content?.structured_content?.[0]
                              ?.steps && (
                              <AccordionComponent
                                sections={contentAccordionConfig}
                                action="reasoning"
                                defaultExpandedValues={["reasoning"]}
                                content={
                                  record?.content?.structured_content?.[0]
                                    ?.steps
                                }
                                language="markdown"
                              />
                            )}
                          </div>
                          <AccordionComponent
                            sections={contentAccordionConfig}
                            action="code"
                            content={
                              record?.content?.structured_content?.[0]
                                ?.final_answer
                            }
                            language={
                              record?.content?.structured_content?.[0]
                                ?.language || "sql"
                            }
                          />
                          {/* <div>
                            {JSON.stringify(
                              record?.content?.structured_content?.[0]
                                ?.arguments
                            )}
                          </div> */}
                        </div>
                      )}
                      {["user"]?.includes(record?.author_type) && (
                        <div className="pl-12">
                          {record?.content &&
                          typeof record.content === "object" &&
                          record.content !== null
                            ? record.content?.text_content
                            : record?.content}
                        </div>
                      )}
                      {["system"]?.includes(record?.author_type) && (
                        <div className="pl-12">
                          {/* {record?.content &&
                          typeof record.content === "object" &&
                          record.content !== null
                            ? record.content?.text_content
                            : record?.content} */}
                          <div>{record?.name}</div>
                          <div>
                            {record.content?.structured_content?.[0]?.name}
                          </div>
                        </div>
                      )}
                    </>
                  ),
                },
              }
            : {})}
        />
      )}
    </>
  );
}

export default TableView;

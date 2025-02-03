import {
  ActionComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import {
  buildSQLQuery,
  enrichFilters,
  extractKeys,
  formatDate,
  formatPythonTemplate,
  sanitizeFilters,
  stepsToMarkdown,
  useIsMobile,
} from "@components/Utils";
import {
  ActionIcon,
  Box,
  Group,
  LoadingOverlay,
  Tooltip,
  Text,
  Button,
} from "@mantine/core";
import {
  IconCopy,
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
  IconQuestionMark,
} from "@tabler/icons-react";
import { format, isValid, parseISO } from "date-fns";
import { MouseEvent, useState } from "react";
import { showNotification } from "@mantine/notifications";
import {
  DataTable,
  DataTableColumn,
  DataTableRowClickHandler,
  DataTableSortStatus,
  useDataTableColumns,
} from "mantine-datatable";
import { useContextMenu } from "mantine-contextmenu";
import { useAppStore, useTransientStore } from "src/store";
import Markdown from "react-markdown";
import { useGo, useParsed } from "@refinedev/core";
import AccordionComponent from "@components/AccordionComponent";
import { contentAccordionConfig } from "@components/View/contentAccordionConfig";
import { useEffect, useRef } from "react";
import AuthorInfo, { authorInfoConfigs } from "./AuthorInfo";
import AutomationToggle from "./AutomationToggle";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import {
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCircle,
} from "@tabler/icons-react";
import MessageLabel from "@components/MessageLabel";
import { useToggleView } from "@components/hooks/useToggleView";
import ExecutionStatus from "@components/ExecutionStatus";
import ResponseViewWrapper from "@components/View/ResponseView";

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
    setViews,
    views,
    expandedRecordIds,
    setExpandedRecordIds,
  } = useAppStore();

  interface RowClickProps<T> {
    record: T;
    index: number;
    event: MouseEvent<Element, MouseEvent>;
  }
  const clipboard = useClipboard({ timeout: 500 });
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const isMobile = useIsMobile();

  let view_ids = Object.keys(views);

  const { params } = useParsed();
  const { forms } = useTransientStore();
  const { showContextMenu, hideContextMenu } = useContextMenu();
  const isTouch = useMediaQuery("(pointer: coarse)");

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;

  const handleAction = (record_action: RecordAction, forms: any) => {
    record_action.e.stopPropagation();
    let record = record_action?.record;
    let action = record_action.action;
  };
  const { toggleView } = useToggleView();

  // Update the handler to use generic type and match Mantine's expected signature
  const handleRowClick: DataTableRowClickHandler<T> = ({
    record,
    index,
    event,
  }) => {
    // if (record?.entity_type === "actions") {
    //   toggleView(String(record?.id), record);
    // } else {
    //   // console.log(record);
    //   viewItem(String(record?.id), record);
    // }
    toggleView(String(record?.id), record);
  };

  interface Record {
    id?: string | number;
    entity_type?: string;
    [key: string]: any;
  }

  const handleView = (record: Record) => {
    toggleView(String(record?.id), record);
  };

  const viewportRef = useRef<HTMLDivElement>(null);

  // Move scrollToRow inside useEffect to avoid unnecessary recreations
  useEffect(() => {
    if (
      data_items?.length &&
      view_record?.include_items?.includes("scroll_to_last_item")
    ) {
      const scrollToRow = () => {
        const lastRowSelector = `[data-row-index="${title} - ${
          data_items.length - 1
        }"]`;
        const el = document.querySelector<HTMLElement>(lastRowSelector);
        if (el && viewportRef.current) {
          viewportRef.current.scrollTo({
            top: el.offsetTop - el.clientHeight - 1,
            behavior: "smooth",
          });
        }
      };

      const timeoutId = setTimeout(scrollToRow, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [data_items]); // Only depend on data_items
  let input_record_item = {
    id: "input_record",
    name: "input_record",
    description: "input_record",
    author_id: "system",
    created_datetime: new Date().toISOString(),
  };

  return (
    <Box className="w-full overflow-hidden">
      {data_items && data_fields && (
        <DataTable<T>
          noHeader={true}
          // scrollAreaProps={{ type: "scroll" }}
          columns={[
            // First spread the data fields columns
            ...data_fields.map(
              (field) =>
                ({
                  id: field?.name,
                  accessor: field?.name,
                  ellipsis: true,
                  title: field?.name,
                  width: 120,
                  render: (record: any) => {
                    if (field?.name === "author_id") {
                      return (
                        <AuthorInfo
                          record={record}
                          onAction={(e) => handleAction(e, forms)}
                          displayConfig={authorInfoConfigs.compact}
                          formatDate={formatDate}
                        />
                      );
                    } else if (
                      ["label", "heading", "items", "subject"].includes(
                        field?.name
                      )
                    ) {
                      return (
                        <MessageLabel
                          record={record}
                          onRerun={(record) => console.log("Rerun:", record)}
                          showCollapse={true}
                          onView={handleView}
                        />
                      );
                    } else if (field?.name === "name") {
                      return (
                        <NameAndResultSummaryInfo
                          record={record}
                          isSelected={view_ids.includes(String(record.id))}
                        />
                      );
                    } else if (field?.name === "action") {
                      return (
                        // <NameAndResultSummaryInfo
                        //   record={record}
                        //   isSelected={view_ids.includes(String(record.id))}
                        // />
                        <div className="flex flex-col gap-1">
                          {/* {record?.action_status == "running" ? (
                            <Button size="compact-xs" color="red">
                              pause
                            </Button>
                          ) : (
                            <Button size="compact-xs">play</Button>
                          )} */}
                        </div>
                      );
                    } else if (field?.name === "action_status") {
                      return <ActionStatusInfo record={record} />;
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
                        {["user"]?.includes(record?.author_type) && <></>}
                        {["agent"]?.includes(record?.author_type) && (
                          <>
                            <Tooltip key="view" label={`view`} position="top">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="green"
                                onClick={(e) =>
                                  handleAction(
                                    {
                                      record: record,
                                      action: "view",
                                      e: e,
                                    },
                                    forms
                                  )
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

                        {false && (
                          <>
                            <Tooltip key="view" label={`view`} position="top">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="green"
                                onClick={(e) =>
                                  handleAction(
                                    {
                                      record: record,
                                      action: "view",
                                      e: e,
                                    },
                                    forms
                                  )
                                }
                              >
                                <IconPlayerPlay size={24} />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}
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
          height="80vh"
          records={data_items}
          highlightOnHover={true}
          withColumnBorders={true}
          rowBackgroundColor={({ id }) => {
            if (view_ids.includes(String(id))) {
              return {
                light: "#ebf5ff", // Very light blue background
                dark: "#ebf5ff", // Keep consistent in both modes
              };
            }
            return undefined;
          }}
          // rowStyle={({ id }) => {
          //   if (view_ids.includes(String(id))) {
          //     return {
          //       borderLeft: "4px solid #3b82f6", // Medium blue border
          //       fontWeight: 500,
          //       "& td": {
          //         // Style all td elements within the row
          //         color: "#2563eb !important", // Blue text
          //       },
          //       "&:hover": {
          //         backgroundColor: "#dbeafe !important", // Slightly darker blue on hover
          //         "& td": {
          //           color: "#1e40af !important", // Darker blue text on hover
          //         },
          //       },
          //     };
          //   }
          //   return {
          //     "&:hover": {
          //       backgroundColor: "#f8fafc !important", // Very light gray for non-highlighted hover
          //     },
          //   };
          // }}
          rowStyle={({ id }) => ({
            maxWidth: "100%", // Ensure rows don't exceed container width
            ...(view_ids.includes(String(id))
              ? {
                  borderLeft: "4px solid #3b82f6",
                  fontWeight: 500,
                  "& td": {
                    color: "#2563eb !important",
                    maxWidth: "0", // Enable text truncation
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  "&:hover": {
                    backgroundColor: "#dbeafe !important",
                    "& td": {
                      color: "#1e40af !important",
                    },
                  },
                }
              : {
                  "&:hover": {
                    backgroundColor: "#f8fafc !important",
                  },
                }),
          })}
          // onRowClick={handleRowClick}
          onRowContextMenu={({ record, event }) =>
            showContextMenu([
              {
                key: `copy-${record?.entity_type}-id`,
                icon: <IconCopy size={16} />,
                onClick: () => {
                  {
                    clipboard.copy(record?.id);
                    showNotification({
                      message: `copied ${record?.entity_type} record id ${record.id}`,
                      withBorder: true,
                    });
                  }
                },
              },
            ])(event)
          }
          // 👇 make sure the context-menu is closed when the user scrolls the table
          onScroll={hideContextMenu}
          pinFirstColumn={true}
          // {...(view_record?.include_items?.includes("row_click")
          //   ? { onRowClick: handleRowClick }
          //   : {})}
          // textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
          pinLastColumn={true}
          // striped={true}
          // selectedRecords={selectedRecords}
          // onSelectedRecordsChange={setSelectedRecords}
          scrollAreaProps={
            {
              // type: "never",
              // offsetScrollbars: false,
              // scrollbarSize: 8,
              // scrollHideDelay: 0,
              // viewportProps: {
              //   style: {
              //     maxWidth: "100%",
              //     overflowX: "auto",
              //   },
              // },
            }
          }
          {...(view_record?.include_items?.includes("row_expansion")
            ? {
                rowExpansion: {
                  allowMultiple: false,
                  expanded: {
                    recordIds: expandedRecordIds,
                    onRecordIdsChange: setExpandedRecordIds,
                  },
                  trigger: "never",
                  content: ({ record, collapse }) => (
                    <div className="overflow-hidden">
                      <div>
                        {isMobile && view_ids.includes(String(record?.id)) && (
                          <div className="w-96">
                            <ResponseViewWrapper />
                          </div>
                        )}
                        {record?.actions ? (
                          <div className="w-96">
                            <Box
                              style={{
                                maxWidth: "100%",
                                overflowX: "auto",
                              }}
                            >
                              <ExecutionStatus
                                record={record?.actions}
                                parent_record={record}
                              />
                            </Box>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ),
                },
              }
            : {})}
        />
      )}
    </Box>
  );
}

export default TableView;

const NameAndResultSummaryInfo = ({
  record,
  isSelected,
}: {
  record: any;
  isSelected?: boolean;
}) => {
  let subheading_object = record?.variables
    ? extractKeys(
        record?.variables,
        [
          "application_id",
          "profile_id",
          "session_id",
          "task_id",
          "execution_mode",
          "breakpoint",
          "summary_message_code",
          "task_name",
        ],
        "exclude"
      )
    : {};

  const formatObject = (obj: any) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  const formattedJSON = formatObject(subheading_object);

  return (
    <Tooltip
      multiline
      w={250}
      withArrow
      transitionProps={{ duration: 200 }}
      label={
        <div className="whitespace-pre-wrap font-mono text-xs p-1">
          <div className="font-medium mb-1">click to toggle view:</div>
          <div className="break-all">{record?.name}</div>
        </div>
      }
    >
      <div className="flex flex-col">
        <span
          className={`text-sm font-medium ${
            isSelected ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {record.name}
        </span>
        <div className="whitespace-pre-wrap font-mono text-xs text-gray-500 mt-0.5">
          {formattedJSON}
        </div>
        {record.result_summary && (
          <span
            className={`text-sm ${isSelected ? "text-blue-600" : ""} mt-0.5`}
          >
            {record.result_summary}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

type ActionStatus =
  | "empty"
  | "pending"
  | "scheduled"
  | "running"
  | "failed"
  | "passed";

interface StatusConfig {
  icon: typeof IconQuestionMark;
  color: string;
  bgColor: string;
}

interface ActionStatusRecord {
  action_status: ActionStatus;
  updated_datetime?: string | Date;
  author_id?: string;
}

interface ActionStatusInfoProps {
  record: ActionStatusRecord;
}

const ActionStatusInfo: React.FC<ActionStatusInfoProps> = ({ record }) => {
  const getStatusConfig = (status: ActionStatus): StatusConfig => {
    const configs: Record<ActionStatus, StatusConfig> = {
      empty: {
        icon: IconCircle,
        color: "text-gray-400",
        bgColor: "bg-gray-50",
      },
      pending: {
        icon: IconClock,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      },
      scheduled: {
        icon: IconClock,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      },
      running: {
        icon: IconClock, // Using clock icon as a fallback, though it won't be shown
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      },
      failed: {
        icon: IconCircleX,
        color: "text-red-500",
        bgColor: "bg-red-50",
      },
      passed: {
        icon: IconCircleCheck,
        color: "text-green-500",
        bgColor: "bg-green-50",
      },
    };

    return configs[status] || configs.empty;
  };

  const config = getStatusConfig(record.action_status);
  const StatusIcon = config.icon;

  const renderContent = () => {
    if (record.action_status === "running") {
      return (
        <div className="flex items-center">
          <Tooltip label="running -> click to pause" position="top">
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
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded-full ${config.bgColor}`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} stroke={2} />
        </div>
        <span className={`text-sm ${config.color} font-medium`}>
          {record.action_status || "No status"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-1">
      {renderContent()}

      {record.updated_datetime && (
        <span className="text-xs text-gray-500">
          {formatDate(record.updated_datetime)}
        </span>
      )}

      {record.author_id && (
        <span className="text-xs text-gray-600">{record.author_id}</span>
      )}
    </div>
  );
};

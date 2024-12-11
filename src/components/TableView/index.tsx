import {
  ActionComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import {
  buildSQLQuery,
  enrichFilters,
  formatDate,
  formatPythonTemplate,
  sanitizeFilters,
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
} from "@tabler/icons-react";
import { format, isValid, parseISO } from "date-fns";
import { MouseEvent } from "react";
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
    setActiveAction,
    setActiveEvent,
    setActiveSession,
    setActionInputFormValues,
    action_input_form_values,
    setActionInputFormFields,
    setViews,
    views,
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
  const clipboard = useClipboard({ timeout: 500 });

  const { params } = useParsed();
  const { forms } = useTransientStore();
  const { showContextMenu, hideContextMenu } = useContextMenu();
  const isTouch = useMediaQuery("(pointer: coarse)");

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const query_action_input_form_values = useAppStore(
  //   (state) => state.action_input_form_values[action_input_form_values_key]
  // );

  // const globalSearchQuery = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[`${action_input_form_values_key}`]?.query
  // );

  const handleAction = (record_action: RecordAction, forms: any) => {
    record_action.e.stopPropagation();
    let record = record_action?.record;
    let action = record_action.action;
    // console.log(action);
    // console.log(record);
    // setViews(String(record?.id), record);

    // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
    // const formId = action_input_form_values_key;
    // const formInstance = forms[formId]?.formInstance;

    // let action_input_values = {
    //   number_of_results: 10,
    // };

    // let language = record?.content?.structured_content?.[0]?.language;
    // let query = record?.content?.structured_content?.[0]?.final_answer || "";
    // if (language === "python") {
    //   console.log("format python");
    //   query = formatPythonTemplate(
    //     record?.content?.structured_content?.[0]?.final_answer,
    //     action_input_values || {}
    //   );
    // }
    // if (language === "sql") {
    //   console.log("format sql");
    //   let active_view_query_model_data_data_model_query_filters =
    //     view_record?.data_model?.schema?.query_filters;
    //   let enriched_query_filters = enrichFilters(
    //     active_view_query_model_data_data_model_query_filters,
    //     query_action_input_form_values
    //   );

    //   let rendered_globalQuery = buildSQLQuery(
    //     record?.content?.structured_content?.[0]?.final_answer,
    //     sanitizeFilters(enriched_query_filters),
    //     { caseSensitive: false }
    //   )?.query;
    //   console.log("rendered_globalQuery", rendered_globalQuery);
    //   // query = formatPythonTemplate(
    //   //   record?.content?.structured_content?.[0]?.final_answer,
    //   //   action_input_values || {}
    //   // );
    // }
    // console.log(`query: ${query}`);
    // let new_action_input_form_values = {
    //   ...action_input_form_values,
    //   [action_input_form_values_key]: {
    //     ...action_input_form_values[action_input_form_values_key],
    //     query_template: record?.content?.structured_content?.[0]?.final_answer,
    //     query: query,
    //   },
    // };
    // setActionInputFormValues(new_action_input_form_values);
    // setActionInputFormFields(
    //   action_input_form_values_key,
    //   record?.content?.structured_content?.[0]?.arguments || []
    // );
    // if (record?.entity_type === "events") {
    //   setActiveEvent(record);
    // }
    // // add action and related records to array of actions
    // let new_action_input_form_values = {
    //   ...action_input_form_values,
    //   [action_input_form_values_key]: {
    //     ...action_input_form_values[action_input_form_values_key],
    //     [action]: [record],
    //   },
    // };
    // // console.log(new_action_input_form_values);
    // setActionInputFormValues(new_action_input_form_values);
    // setActionInputFormFields(
    //   action_input_form_values_key,
    //   record?.content?.structured_content?.[0]?.arguments || []
    // );
    // if (formInstance) {
    //   // console.log(formInstance);
    //   if (formInstance?.handleSubmit) {
    //     // set the action before submitting - passe to backend route
    //     if (action) {
    //       setActiveAction({
    //         id: action,
    //         name: action,
    //       });
    //     }
    //     // if (invalidate_query_key) {
    //     //   setActiveInvalidateQueryKey(invalidate_query_key);
    //     // }
    //     formInstance.handleSubmit();
    //     formInstance.reset();
    //   } else {
    //     console.error(`No submit handler found for form ID: ${formId}`);
    //   }
    // } else {
    //   console.log("no form instance available");
    // }
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

  const toggleView = (id: string, record: any) => {
    // Access the current views from your zustand store
    const currentViews = views;

    // Check if the item exists in views
    const existingView = currentViews[id];

    if (existingView) {
      // Remove the view if it exists
      // const { [id]: removedView, ...remainingViews } = currentViews;
      setViews(id, null);
    } else {
      // Add the view if it doesn't exist
      setViews(id, record);
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: {
          action_id: String(record?.id),
          session_id: String(record?.session_id),
          profile_id: String(activeProfile?.id),
        },
        type: "push",
      });
    }
  };

  // Update the handler to use generic type and match Mantine's expected signature
  const handleRowClick: DataTableRowClickHandler<T> = ({
    record,
    index,
    event,
  }) => {
    // console.log(record);
    // if (record?.entity_type === "tasks") {
    //   setActiveTask(record);
    // }
    // go({
    //   to: {
    //     resource: "tasks",
    //     action: "show",
    //     id: record?.id,
    //   },
    //   query: {
    //     session_id: activeSession?.id,
    //     profile_id: activeProfile?.id,
    //     ...record?.initial_state?.params,
    //   },
    //   type: "push",
    // });
    // if (record?.entity_type === "sessions") {
    //   setActiveSession(record);
    // }
    // go({
    //   to: {
    //     resource: "sessions",
    //     action: "show",
    //     id: record?.id,
    //   },
    //   query: {
    //     // session_id: activeSession?.id,
    //     profile_id: activeProfile?.id,
    //     ...record?.initial_state?.params,
    //   },
    //   type: "push",
    // });
    // if (record?.entity_type === "actions") {
    //   // setActiveSession(record);
    //   setViews(record?.id, record);
    // }
    if (record?.entity_type === "actions") {
      toggleView(String(record?.id), record);
    }
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
  // return (
  //   <>
  //     {/* <div>table</div> */}
  //     <MonacoEditor
  //       value={{
  //         // query_key: query_key,
  //         // data_fields: data_fields,
  //         data_items: data_items,
  //       }}
  //       language="json"
  //       height="25vh"
  //     />
  //   </>
  // );

  return (
    <>
      {/* <MonacoEditor
        value={{ query_key: query_key, data_fields: data_fields }}
        language="json"
        height="25vh"
      /> */}
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
                  title: field?.name,
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
                      // } else if (
                      //   field?.name === "name" &&
                      //   view_record?.include_items?.includes("name_and_details")
                      // ) {
                      //   return (
                      //     <AuthorInfo
                      //       record={record}
                      //       onAction={handleAction}
                      //       displayConfig={authorInfoConfigs.full}
                      //       formatDate={formatDate}
                      //       AutomationToggle={AutomationToggle}
                      //       query_key={query_key}
                      //     />
                      //   );
                    } else if (field?.name === "name") {
                      return <NameAndResultSummaryInfo record={record} />;
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
                            {/* <Tooltip
                                            key="pin"
                                            label={`pin`}
                                            position="top"
                                          >
                                            <ActionIcon
                                              size="sm"
                                              variant="subtle"
                                              color="orange"
                                            >
                                              <IconPin size={16} />
                                            </ActionIcon>
                                          </Tooltip> */}
                            {/* <Tooltip
                                            key="attachment"
                                            label={`attachment`}
                                            position="top"
                                          >
                                            <ActionIcon
                                              size="sm"
                                              variant="subtle"
                                            >
                                              <IconPaperclip size={16} />
                                            </ActionIcon>
                                          </Tooltip> */}
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
          height="65vh"
          records={data_items}
          highlightOnHover={true}
          withColumnBorders={true}
          onRowClick={handleRowClick}
          // onRowClick={({ record, event }) =>
          //   showContextMenu([
          //     {
          //       key: `copy-${record?.entity_type}-id`,
          //       icon: <IconCopy size={16} />,
          //       onClick: () => {
          //         {
          //           clipboard.copy(record?.id);
          //           showNotification({
          //             message: `copied ${record?.entity_type} record id ${record.id}`,
          //             withBorder: true,
          //           });
          //         }
          //       },
          //     },
          //     // {
          //     //   key: 'edit-company-information',
          //     //   icon: <IconEdit size={16} />,
          //     //   onClick: () =>
          //     //     showNotification({
          //     //       message: `Clicked on edit context-menu action for ${record.name} company`,
          //     //       withBorder: true,
          //     //     }),
          //     // },
          //     // { key: 'divider' },
          //     // {
          //     //   key: 'delete-company',
          //     //   icon: <IconTrash size={16} />,
          //     //   color: 'red',
          //     //   onClick: () =>
          //     //     showNotification({
          //     //       color: 'red',
          //     //       message: `Clicked on delete context-menu action for ${record.name} company`,
          //     //       withBorder: true,
          //     //     }),
          //     // },
          //   ])(event)
          // }
          // 👇 make sure the context-menu is closed when the user scrolls the table
          onScroll={hideContextMenu}
          pinFirstColumn={true}
          // {...(view_record?.include_items?.includes("row_click")
          //   ? { onRowClick: handleRowClick }
          //   : {})}
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
                      <DataTable<T>
                        columns={[
                          // First spread the data fields columns
                          ...data_fields.map(
                            (field) =>
                              ({
                                id: field?.name,
                                accessor: field?.name,
                                ellipsis: true,
                                title: ["name", "author_id"]?.includes(
                                  field?.name
                                )
                                  ? title
                                  : null,
                                render: (record: any) => {
                                  if (field?.name === "author_id") {
                                    return (
                                      <AuthorInfo
                                        record={record}
                                        onAction={(e) => handleAction(e, forms)}
                                        displayConfig={
                                          authorInfoConfigs.compact
                                        }
                                        formatDate={formatDate}
                                      />
                                    );
                                    // } else if (
                                    //   field?.name === "name" &&
                                    //   view_record?.include_items?.includes("name_and_details")
                                    // ) {
                                    //   return (
                                    //     <AuthorInfo
                                    //       record={record}
                                    //       onAction={handleAction}
                                    //       displayConfig={authorInfoConfigs.full}
                                    //       formatDate={formatDate}
                                    //       AutomationToggle={AutomationToggle}
                                    //       query_key={query_key}
                                    //     />
                                    //   );
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
                                    <Group
                                      gap={4}
                                      justify="right"
                                      wrap="nowrap"
                                    >
                                      {/* {["user"]?.includes(
                                        record?.author_type
                                      ) && <></>} */}
                                      {true && (
                                        <>
                                          <Tooltip
                                            key="view"
                                            label={`view`}
                                            position="top"
                                          >
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
                                          {/* <Tooltip
                                            key="pin"
                                            label={`pin`}
                                            position="top"
                                          >
                                            <ActionIcon
                                              size="sm"
                                              variant="subtle"
                                              color="orange"
                                            >
                                              <IconPin size={16} />
                                            </ActionIcon>
                                          </Tooltip> */}
                                          {/* <Tooltip
                                            key="attachment"
                                            label={`attachment`}
                                            position="top"
                                          >
                                            <ActionIcon
                                              size="sm"
                                              variant="subtle"
                                            >
                                              <IconPaperclip size={16} />
                                            </ActionIcon>
                                          </Tooltip> */}
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
                        noHeader
                        // sortStatus={localSortStatus}
                        // onSortStatusChange={customSetSorting}
                        customRowAttributes={({ id }, recordIndex) => ({
                          "data-row-first-name": id,
                          "data-row-index": `${title} - ${recordIndex}`,
                        })}
                        scrollViewportRef={viewportRef}
                        // height="100%"
                        records={data_items?.[0]?.actions || []}
                        highlightOnHover={true}
                        withColumnBorders={true}
                        pinFirstColumn={true}
                        {...(view_record?.include_items?.includes("row_click")
                          ? { onRowClick: handleRowClick }
                          : {})}
                        // textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
                        pinLastColumn={true}
                        striped={true}
                        // {...(view_record?.include_items?.includes(
                        //   "row_expansion"
                        // )
                        //   ? {
                        //       rowExpansion: {
                        //         allowMultiple: true,
                        //         // trigger: "always",
                        //         content: ({ record, collapse }) => (
                        //           <>
                        //             <div>nested table expansion</div>
                        //           </>
                        //         ),
                        //       },
                        //     }
                        //   : {})}
                      />
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

const NameAndResultSummaryInfo = ({ record }: { record: any }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-600">{record.name}</span>
      {record.result_summary && (
        <span className="text-sm">{record.result_summary}</span>
      )}
    </div>
  );
};

const ActionStatusInfo = ({ record }: { record: any }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-600">{record.action_status}</span>
      {record.updated_datetime && (
        <span className="text-xs">
          {
            <>
              {/* <Text c="dimmed" className="text-sm">
                {" "}
                •{" "}
              </Text> */}
              <Text size="xs" c="dimmed">
                {formatDate(record.updated_datetime)}
              </Text>
            </>
          }
        </span>
      )}
      <span className="text-xs text-gray-600">{record.author_id}</span>
    </div>
  );
};

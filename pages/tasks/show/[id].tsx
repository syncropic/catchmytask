import {
  Title,
  Text,
  useComputedColorScheme,
  Button,
  Accordion,
  Tooltip,
} from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "src/store";
import { useParsed, useNavigation } from "@refinedev/core";
import {
  getLabel,
  getTooltipLabel,
  useReadRecordByState,
} from "@components/Utils";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";
import View from "@components/View";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import MessagesWrapper from "@components/Messages";
import ActionInputWrapper from "@components/ActionInput";
import EventsWrapper from "@components/Events";
import ViewWrapper from "@components/View";
import AccordionComponent from "@components/AccordionComponent";
import { viewQueryAccordionConfig } from "@components/View/viewQueryAccordionConfig";
import { getDb } from "src/surreal";
import Surreal, { LiveHandler, Uuid } from "surrealdb";
import { viewSearchActionAccordionConfig } from "@components/Layout/viewSearchActionAccordionConfig";
import { viewFooterAccordionConfig } from "@components/View/viewFooterAccordionConfig";
import { IconCode, IconInfoCircle } from "@tabler/icons-react";
import MonacoEditor from "@components/MonacoEditor";
import WebAutomation from "@components/WebAutomation";
import { Tabs } from "@mantine/core";
import SearchInput from "@components/SearchInput";
import ExternalSubmitButton from "@components/SubmitButton";
import ActionsWrapper from "@components/Actions";
import Reveal from "@components/Reveal";
import CustomComponentsView from "@components/CustomComponentsView";
import ComponentsToolbar from "@components/ComponentsToolbar";
import Documentation from "@components/Documentation";
import { useViewportSize } from "@mantine/hooks";

export const ShowPage: React.FC = () => {
  const [activeInput, setActiveInput] = useState("natural_language_query");
  const [templateSearch, setTemplateSearch] = useState("");
  const { colorScheme, activeTask, request_response, views } = useAppStore();

  const { params } = useParsed();
  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const action_input_form_values = useAppStore(
  //   (state) => state.action_input_form_values[action_input_form_values_key]
  // );

  const globalQuery = useAppStore(
    (state) =>
      state.action_input_form_values[`${action_input_form_values_key}`]?.query
  );

  // const {
  //   data: events,
  //   error,
  //   loading,
  // } = useLiveQuery<Event>(
  //   "events",
  //   `task_id = "${params?.id}" ORDER BY created_datetime ASC`
  // );
  const {
    data: actions,
    error,
    loading,
  } = useLiveQuery<Event>(
    "actions",
    `session_id = "${params?.id}" AND visibility_scope = "result"`
  );

  // const { data: actions, error, loading } = useLiveQuery<Event>("actions");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Render the page content
  return (
    <>
      {/* <MonacoEditor
        value={activeTask}
        language="json"
        height="25vh"
      ></MonacoEditor> */}
      {/* <div>{JSON.stringify(events)}</div> */}
      {/* {!activeView && (<Title order={3}>Get Important Things Done.</Title>)} */}
      {/* <Breadcrumbs /> */}
      {/* <Text>Task Show Page</Text>
      <Title order={2}>{activeTask?.name || "No Task Name"}</Title> */}
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={0}>
          <div className="h-[85vh] flex flex-col">
            {" "}
            {/* Using 85% of viewport height */}
            {/* Top component */}
            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              {params?.id && actions && (
                // <EventsWrapper
                //   task_id={params?.id}
                //   title="events"
                //   data_items={events || []}
                // />
                <ActionsWrapper
                  task_id={params?.id}
                  title="actions"
                  data_items={actions || []}
                />
              )}
            </div>
            {/* Bottom component */}
            <div>
              <div>
                <AccordionComponent
                  sections={viewSearchActionAccordionConfig}
                  activeView={{}}
                  activeTask={{}}
                  defaultExpandedValues={[]}
                  action={"filters"}
                />
              </div>

              <div className="space-y-6">
                {/* Row 1: Form Display Area */}
                <div className="w-full">
                  {activeInput === "natural_language_query" && (
                    <ActionInputWrapper
                      data_model="natural language query input"
                      query_name="data_model"
                      record={{
                        id: params?.id,
                      }}
                      action="query"
                      action_form_key="query_general"
                      success_message_code="natural_language_query_input"
                    />
                  )}

                  {activeInput === "structured_query" && (
                    <ActionInputWrapper
                      data_model="structured query input"
                      query_name="data_model"
                      record={{
                        id: params?.id,
                      }}
                      action="query"
                      action_form_key="query_general"
                      success_message_code="structured_query_input"
                    />
                  )}
                </div>

                {/* Row 2: Action Input Bar */}
                <div className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Template Search Section */}
                  <div className="flex-1">
                    <SearchInput
                      placeholder="templates"
                      activeFilters={[
                        {
                          id: 1,
                          name: "tasks",
                          description: "tasks",
                          entity_type: "tasks",
                          is_selected: true,
                        },
                      ]}
                    />
                  </div>

                  {/* Toggle Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="compact-sm"
                      variant={
                        activeInput === "natural_language_query"
                          ? "outline"
                          : "default"
                      }
                      onClick={() => setActiveInput("natural_language_query")}
                      className="whitespace-nowrap"
                    >
                      Natural Language
                    </Button>

                    <Button
                      size="compact-sm"
                      variant={
                        activeInput === "structured_query"
                          ? "outline"
                          : "default"
                      }
                      onClick={() => setActiveInput("structured_query")}
                      className="whitespace-nowrap"
                    >
                      Structured Language
                    </Button>
                  </div>

                  {/* Submit Button */}

                  <ExternalSubmitButton
                    record={{}}
                    entity_type="tasks"
                    action_form_key={`query_${params?.id || activeTask?.id}`}
                    action={"query"}
                  />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle>
          <ResizeHandle />
        </PanelResizeHandle>

        <Panel defaultSize={50} minSize={0}>
          <div className="h-[85vh] flex flex-col">
            {" "}
            {/* Using 85% of viewport height */}
            {/* Top component */}
            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              {/* <WebAutomation></WebAutomation> */}

              {/* {params?.id && events && (
                <EventsWrapper
                  task_id={params?.id}
                  title="events"
                  data_items={events || []}
                />
              )} */}
              {/* {params?.view_id && <ViewWrapper></ViewWrapper>} */}
              {/* {<ViewWrapper></ViewWrapper>} */}
              <ViewsDisplay views={views} />
              {/* <MonacoEditor
                value={request_response}
                height="75vh"
                language="json"
              ></MonacoEditor> */}
            </div>
            {/* Bottom component */}
            <div>
              {/* <div>
                <AccordionComponent
                  sections={viewSearchActionAccordionConfig}
                  activeView={{}}
                  activeTask={{}}
                  defaultExpandedValues={[]}
                  action={"filters"}
                />
              </div> */}
              {/* <ActionInputWrapper
                name={"query"}
                query_name="data_model"
                record={{
                  id: params?.id,
                }}
                action={"query"}
                action_form_key="query_general"
                success_message_code="action_input_data_model_schema"
              /> */}
              {/* <div>
                <AccordionComponent
                  sections={viewFooterAccordionConfig}
                  globalQuery={globalQuery}
                  include_items={[]}
                  key="view_footer"
                  title={
                    <div className="flex gap-4 items-center">
                      <IconCode size={16} />
                      <Text>Code</Text>
                    </div>
                  }
                />
              </div> */}
            </div>
          </div>
        </Panel>

        {/* <Panel
          defaultSize={50}
          minSize={0}
          style={{
            display: true ? "block" : "none",
          }}
        >
          <div
            className={`${
              effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
            }`}
          >
            {params?.view_id && <ViewWrapper></ViewWrapper>}
          </div>
        </Panel> */}
      </PanelGroup>
    </>
  );
};

export default ShowPage;

type LiveQueryResult<T> = {
  data: T[];
  error: Error | null;
  loading: boolean;
};

type Action = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";
type CloseResult = "killed" | "disconnected";

export function useLiveQuery<T extends Record<string, any>>(
  table: string,
  where?: string
): LiveQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const dbRef = useRef<Surreal | null>(null);

  useEffect(() => {
    let queryUuid: Uuid;
    let mounted = true;

    const startLiveQuery = async () => {
      try {
        // Get DB connection
        dbRef.current = await getDb();
        const db = dbRef.current;

        const query = where
          ? `SELECT 
    task_id,
    task_id AS id,
    task_id.*.name AS name,
    task_id.*.view_id AS view_id,
    array::first(author_id) AS author_id,
    array::first(created_datetime) AS created_datetime,
    array::first(updated_datetime) AS updated_datetime,
    array::first(action_status) AS status,
    array::group({
        action_order: action_order,
        action_status: action_status,
        application_id: application_id,
        author_id: author_id,
        created_datetime: created_datetime,
        entity_type: entity_type,
        func_name: func_name,
        id: id,
        name: name,
        operation: operation,
        session_id: session_id,
        task_id: task_id,
        view_id: view_id,
        credential_id: credential_id,
        func_id: func_id,
        updated_datetime: updated_datetime
    }) AS actions
FROM ${table} 
WHERE ${where}
GROUP BY task_id, name, view_id;`
          : `SELECT 
    task_id,
    task_id AS id,
    task_id.*.name AS name,
    task_id.*.view_id AS view_id,
    array::first(author_id) AS author_id,
    array::first(created_datetime) AS created_datetime,
    array::first(action_status) AS status,
    array::group({
        action_order: action_order,
        action_status: action_status,
        application_id: application_id,
        author_id: author_id,
        created_datetime: created_datetime,
        entity_type: entity_type,
        func_name: func_name,
        id: id,
        name: name,
        operation: operation,
        session_id: session_id,
        task_id: task_id,
        view_id: view_id,
        credential_id: credential_id,
        func_id: func_id,
        updated_datetime: updated_datetime
    }) AS actions
FROM actions
GROUP BY task_id, name, view_id;`;

        const [result] = await db.query<T[]>(query);
        if (mounted) {
          // setData(result);
          if (Array.isArray(result)) {
            setData(result as T[]);
          } else {
            setData([result as T]);
          }
          setLoading(false);
        }

        queryUuid = await db.live<T>(
          table,
          (action: Action, result: T | CloseResult) => {
            if (!mounted) return;

            switch (action) {
              case "CREATE":
                setData((prevData) => {
                  const newRecord = result as T;
                  return [...prevData, newRecord];
                });
                break;
              case "UPDATE":
                setData((prevData) => {
                  const updatedRecord = result as T;
                  return prevData.map((item) =>
                    item.id === updatedRecord.id ? updatedRecord : item
                  );
                });
                break;
              case "DELETE":
                setData((prevData) => {
                  const deletedRecord = result as T;
                  return prevData.filter(
                    (item) => item.id !== deletedRecord.id
                  );
                });
                break;
              case "CLOSE":
                console.log(`Live query ${result as CloseResult}`);
                break;
            }
          }
        );
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Live query failed"));
          setLoading(false);
        }
      }
    };

    startLiveQuery();

    // Cleanup function
    return () => {
      mounted = false;

      // Kill the live query if it exists
      const cleanup = async () => {
        if (queryUuid && dbRef.current) {
          try {
            await dbRef.current.kill(queryUuid);
          } catch (error) {
            console.error("Error killing live query:", error);
          }
        }
      };

      cleanup();
    };
  }, [table, where]);

  return { data, error, loading };
}

const ViewsDisplay = ({ views }: { views: any }) => {
  const { setViews } = useAppStore();
  const { width } = useViewportSize();

  // Early return if data or views is missing
  if (!views) {
    return <div className="p-4 text-red-600">No views data available</div>;
  }
  let defaultExpandedValues = [];
  let include_items = ["toolbar"];

  const updateComponentAction = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log(record);
    if (action === "remove") {
      setViews(record?.id, null);
    }

    // if (focused_entities) {
    //   const new_focused_entities = { ...focused_entities };
    //   //   console.log("new_focused_entities", new_focused_entities);
    //   //   console.log("id", id);
    //   if (!new_focused_entities[record?.id]) {
    //     new_focused_entities[record?.id] = {};
    //   }
    //   if (new_focused_entities[record?.id].action === action) {
    //     new_focused_entities[record?.id].action = null;
    //   } else {
    //     new_focused_entities[record?.id].action = action;
    //   }
    //   setFocusedEntities(new_focused_entities);
    // }
  };
  return (
    <div className="p-4">
      <div className="space-y-4">
        <Accordion multiple defaultValue={[]}>
          {Object.entries(views).map(
            ([viewId, viewData]) =>
              true && ( // Only render if the section is visible
                <Accordion.Item value={viewId} key={viewId}>
                  <Accordion.Control
                  // icon={
                  //   iconMap[section?.icon || restProps?.action || section?.key]
                  //     ? React.createElement(
                  //         iconMap[
                  //           section?.icon || restProps?.action || section?.key
                  //         ],
                  //         { size: 16 }
                  //       )
                  //     : null
                  // }
                  >
                    <div className="flex justify-between items-center">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Reveal
                          trigger="click"
                          target={
                            <Tooltip
                              multiline
                              w={220}
                              withArrow
                              transitionProps={{ duration: 200 }}
                              label={getTooltipLabel(viewData || {})}
                            >
                              <div className="flex">
                                <Text
                                  size="sm"
                                  className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                                  style={{ maxWidth: width < 500 ? 100 : 500 }}
                                >
                                  {getLabel(viewData || {})}
                                </Text>
                                <IconInfoCircle size={18} />
                              </div>
                            </Tooltip>
                          }
                        >
                          {/* <Documentation record={viewData}></Documentation> */}
                          <MonacoEditor
                            value={{
                              view_item: viewData,
                            }}
                            height="25vh"
                            language="json"
                          ></MonacoEditor>
                        </Reveal>
                      </div>
                      {include_items?.includes("toolbar") && (
                        <>
                          <div
                            className="flex p-3 gap-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* <Reveal
                              trigger="click"
                              target={
                                <Tooltip
                                  multiline
                                  w={220}
                                  withArrow
                                  transitionProps={{ duration: 200 }}
                                  label={"set custom components"}
                                >
                                  <div className="flex">
                                    <Text
                                      size="sm"
                                      className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                                    >
                                      set custom components
                                    </Text>
                                    <IconInfoCircle size={18} />
                                  </div>
                                </Tooltip>
                              }
                            >
                              <CustomComponentsView
                              ></CustomComponentsView>
                            </Reveal> */}
                            {/* <ExternalSubmitButton
                              record={{}}
                              entity_type="views"
                              action={"save"}
                            /> */}
                            {/* <ExternalSubmitButton
                              record={{}}
                              entity_type="views"
                              action={"reset"}
                            /> */}

                            <ComponentsToolbar
                              include_components={[
                                {
                                  action: "remove",
                                  entity_type: "views",
                                  type: "action",
                                  record: viewData,
                                  onClick: updateComponentAction,
                                },
                                // {
                                //   action: "menu",
                                //   entity_type: "action_steps",
                                //   type: "action",
                                //   record: column,
                                //   onClick: updateComponentAction,
                                // },
                              ]}
                            ></ComponentsToolbar>
                          </div>
                        </>
                      )}
                    </div>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {/* <section.Component
                  activeTask={activeTask}
                  activeSession={activeSession}
                  {...restProps} // Spread any additional props
                /> */}
                    {/* <ViewWrapper
                      view_id_prop={viewData?.view_id}
                      view_item={viewData}
                    /> */}
                  </Accordion.Panel>
                </Accordion.Item>
              )
          )}
        </Accordion>

        {/* {Object.entries(views).map(([viewId, viewData]) => (
          <div
            key={viewId}
            className="border rounded p-4 bg-gray-50 hover:bg-gray-100"
          >
            <div className="grid gap-2">
              {Object.entries(viewData).map(([key, value]) => (
                <p key={key} className="text-gray-700">
                  <span className="font-semibold">{key}: </span>
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </p>
              ))}
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
};

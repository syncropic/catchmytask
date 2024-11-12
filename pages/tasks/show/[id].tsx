import { Title, Text, useComputedColorScheme } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "src/store";
import { useParsed, useNavigation } from "@refinedev/core";
import { useReadRecordByState } from "@components/Utils";
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
import { IconCode } from "@tabler/icons-react";
import MonacoEditor from "@components/MonacoEditor";

export const ShowPage: React.FC = () => {
  const { colorScheme, activeTask } = useAppStore();

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

  const {
    data: events,
    error,
    loading,
  } = useLiveQuery<Event>(
    "events",
    `task_id = "${params?.id}" ORDER BY created_datetime ASC`
  );

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
              {params?.id && events && (
                <EventsWrapper
                  task_id={params?.id}
                  title="events"
                  data_items={events || []}
                />
              )}
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
              <ActionInputWrapper
                name={"query"}
                query_name="data_model"
                record={{
                  id: params?.id,
                }}
                action={"query"}
                action_form_key="query_general"
                success_message_code="action_input_data_model_schema"
              />
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
              {/* {params?.id && events && (
                <EventsWrapper
                  task_id={params?.id}
                  title="events"
                  data_items={events || []}
                />
              )} */}
              {params?.view_id && <ViewWrapper></ViewWrapper>}
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
              <div>
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
              </div>
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
          ? `SELECT * FROM ${table} WHERE ${where}`
          : `SELECT * FROM ${table}`;

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

import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  extractKeys,
  getLabel,
  getTooltipLabel,
  useRunTask,
} from "@components/Utils";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { useAppStore, useTransientStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import DataGridView from "@components/DataGridView";
import {
  Accordion,
  Tooltip,
  Text,
  LoadingOverlay,
  Box,
  Loader,
} from "@mantine/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle } from "@tabler/icons-react";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { jsonify } from "surrealdb";
import ViewDocumentation from "@components/ViewDocumentation";

interface ResponseViewWrapperProps {}

const ResponseViewWrapper = ({}: ResponseViewWrapperProps) => {
  const { views } = useAppStore();
  const { params } = useParsed();
  const { width } = useViewportSize();
  const { showRequestResponseView } = useAppStore();
  const queryClient = useQueryClient();
  // const viewData = queryClient.getQueryData([view_query_key]);
  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  let view_items = params?.view_items?.split(",");

  return (
    <div className="flex flex-col">
      {!showRequestResponseView && !view_items && (
        <div className="flex justify-center items-center h-[65vh]">views</div>
      )}
      {showRequestResponseView && (
        <Accordion multiple defaultValue={["showRequestResponseView"]}>
          <Accordion.Item
            value={"showRequestResponseView"}
            key={"showRequestResponseView"}
          >
            <Accordion.Control>request response view</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  responseData: responseData,
                }}
                height="75vh"
                language="json"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {/* <div>{JSON.stringify(view_items)}</div> */}

      {view_items &&
        view_items?.map((view_item: any) => {
          return (
            <ViewItemWrapper
              key={view_item}
              view_item_id={view_item}
            ></ViewItemWrapper>
          );
        })}
    </div>
  );
};
export default ResponseViewWrapper;

const ViewItemWrapper = ({ view_item_id }: { view_item_id: string }) => {
  const { width } = useViewportSize();
  const { views } = useAppStore();
  let view_item_record = views[view_item_id];
  let run_task_state = {
    task: {
      id: view_item_record?.task_id,
      name: view_item_record?.task_id,
    },
  };
  const {
    data: runTaskData,
    isLoading: runTaskDataIsLoading,
    error: runTaskDataError,
  } = useRunTask(run_task_state);

  if (runTaskDataError) {
    return (
      <>
        <MonacoEditor
          value={{
            error: runTaskDataError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  let actionItem = runTaskData?.data?.find
    ? runTaskData?.data?.find(
        (item: any) => item?.action_step?.id === view_item_id
      )
    : {};

  let dataItems = actionItem?.data;
  // either read view from the response or retrieve view from external

  let view_record = actionItem?.view;
  let include_components = ["toolbar"];

  return (
    <div>
      {/* <MonacoEditor
        value={{
          error: runTaskDataError,
          runTaskData: runTaskData,
          runTaskDataIsLoading: runTaskDataIsLoading,
        }}
        language="json"
        height="25vh"
      ></MonacoEditor> */}
      {runTaskDataIsLoading && (
        <Accordion multiple>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>
              <div className="flex items-center gap-2">
                <Loader size={18} /> | {view_item_record?.name}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="flex justify-center items-center">
                loading content ...
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {!runTaskDataIsLoading && !dataItems && !view_record && (
        <Accordion multiple defaultValue={[view_item_id]}>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>{view_item_record?.name}</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  error: runTaskDataError,
                  runTaskData: runTaskData,
                  runTaskDataIsLoading: runTaskDataIsLoading,
                }}
                language="json"
                height="25vh"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {dataItems && view_record && (
        <ViewItem
          dataItems={dataItems}
          view_record={view_record}
          include_components={include_components}
          view_item_id={view_item_id}
          view_item_record={view_item_record}
          query_state={run_task_state}
        />
      )}
    </div>
  );
};

const ViewItem = ({
  dataItems,
  view_record,
  view_item_id,
  view_item_record,
  include_components,
  query_state,
}: {
  dataItems: any;
  view_record: any;
  view_item_id: string;
  view_item_record: any;
  include_components: any;
  query_state: any;
}) => {
  const { width } = useViewportSize();
  const { params } = useParsed();

  let view_documentation_record = {
    action: {
      id: view_item_record?.id,
      name: view_item_record?.name,
      function: view_item_record?.func_name,
    },
    session: {
      id: view_item_record?.session_id,
    },
    credential: {
      id: view_item_record?.credential_id,
    },
    task: {
      id: view_item_record?.task_id,
      variables: view_item_record?.variables,
    },
    author: {
      id: view_item_record?.author_id,
    },
    timestamp: {
      created_datetime: view_item_record?.created_datetime,
      updated_datetime: view_item_record?.updated_datetime,
    },
    view: {
      id: view_item_record?.view_id,
      fields: view_record?.fields || [],
    },
    status: {
      action_status: view_item_record?.action_status,
    },
  };

  let subheading_object = view_item_record?.variables
    ? extractKeys(
        view_item_record?.variables,
        [
          "application_id",
          "profile_id",
          "session_id",
          "task_id",
          "execution_mode",
          "breakpoint",
        ],
        "exclude"
      )
    : {};

  // Format the JSON string on a single line
  const formatObject = (obj: any) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("  •  "); // Using bullet point as separator for better readability
  };

  const subheading = formatObject(subheading_object);

  return (
    <Accordion multiple defaultValue={[view_item_id]}>
      <Accordion.Item value={view_item_id} key={view_item_id}>
        <Accordion.Control>
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
                    // label={getTooltipLabel(view_item_record || {})}
                    label={"click for details"}
                  >
                    <div className="flex items-center gap-2 p-2">
                      <div className="flex flex-col gap-1">
                        {/* Main Label - Made larger and bolder */}
                        <div
                          className="text-base font-semibold text-blue-600 truncate overflow-hidden whitespace-nowrap px-3"
                          style={{ maxWidth: width < 500 ? 100 : 500 }}
                        >
                          {getLabel(view_item_record || {})}
                        </div>

                        {/* Subheading - Smaller, lighter color and weight */}
                        <div
                          className="text-sm font-normal text-blue-400 truncate overflow-hidden whitespace-nowrap px-3"
                          style={{ maxWidth: width < 500 ? 100 : 500 }}
                        >
                          {subheading}
                        </div>
                      </div>
                      <IconInfoCircle
                        className="text-blue-500 flex-shrink-0"
                        size={18}
                      />
                    </div>
                  </Tooltip>
                }
              >
                {/* <Documentation record={view_record}></Documentation> */}
                <ViewDocumentation
                  record={view_documentation_record}
                ></ViewDocumentation>
              </Reveal>
            </div>
            {include_components?.includes("toolbar") && (
              <>
                <div
                  className="flex p-3 gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalSubmitButton
                    record={{}}
                    reference_record={{
                      id: view_item_id,
                      name: view_item_record?.name,
                      queryKey: `useRunTask_${JSON.stringify(query_state)}`,
                    }}
                    view_item={view_record}
                    entity_type="view"
                    action_form_key={`query_${params?.id}`}
                    action={"save"}
                  />
                </div>
              </>
            )}
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <DataGridView
            data_fields={view_record?.fields || []}
            data_items={dataItems || []}
            view_record={view_record}
          ></DataGridView>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

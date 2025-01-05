import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  getLabel,
  getTooltipLabel,
  useRunTask,
} from "@components/Utils";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { useAppStore, useTransientStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import { IIdentity } from "@components/interfaces";
import LocalDBView from "./LocalDBView";
import DataGridView from "@components/DataGridView";
import { Accordion, Tooltip, Text, LoadingOverlay, Box } from "@mantine/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle } from "@tabler/icons-react";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { jsonify } from "surrealdb";

interface ResponseViewWrapperProps {}

const ResponseViewWrapper = ({}: ResponseViewWrapperProps) => {
  const { views } = useAppStore();
  const { params } = useParsed();
  const { width } = useViewportSize();
  const {
    showRequestResponseView,
    // activeTask,
    // activeView,
    // activeSession,
    // activeProfile,
    // activeApplication,
    // action_input_form_fields,
    // activeEvent,
    // request_response,
    // activeMainCustomComponent,
  } = useAppStore();
  const queryClient = useQueryClient();
  // const viewData = queryClient.getQueryData([view_query_key]);
  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  // let action_id = params?.action_id;
  //   const { params } = useParsed();
  //   // const { width } = useViewportSize();
  //   const { data: identity } = useGetIdentity<IIdentity>();

  //   const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  //   // const fields = action_input_form_fields[action_input_form_values_key];

  //   const view_id = view_item?.view_id;
  //   // const task_id = params?.task_id;
  //   // const session_id = params?.session_id;

  //   let fetch_view_by_id_state = {
  //     credential: "surrealdb catchmytask dev",
  //     success_message_code: view_id,
  //     record: {
  //       id: view_id,
  //     },
  //     read_record_mode: "remote",
  //   };

  //   const {
  //     data: viewData,
  //     isLoading: viewIsLoading,
  //     error: viewError,
  //   } = useReadRecordByState(fetch_view_by_id_state);

  //   let view_record = viewData?.data?.find(
  //     (item: any) =>
  //       item?.message?.code ===
  //       String(fetch_view_by_id_state?.success_message_code)
  //   )?.data[0];
  //   // const { forms } = useTransientStore();

  //   // const query_action_input_form_values = useAppStore(
  //   //   (state) => state.action_input_form_values[action_input_form_values_key]
  //   // );

  //   // const globalSearchQuery = useAppStore(
  //   //   (state) =>
  //   //     state.action_input_form_values[`${action_input_form_values_key}`]?.query
  //   // );

  //   // fetch
  //   let fetch_by_state = {
  //     id: view_item?.id,
  //     items: [view_item],
  //     action: {
  //       name: "fetch",
  //       id: "fetch",
  //     },
  //     input_values: {
  //       // ...value,
  //       // action_input_form_values:
  //       //   action_input_form_values[action_input_form_values_key] ||
  //       //   {},
  //     },
  //     application: {
  //       id: activeApplication?.id,
  //       name: activeApplication?.name,
  //     },
  //     session: {
  //       id: params?.session_id || activeSession?.id,
  //       name: params?.session_id || activeSession?.name,
  //     },
  //     task: {
  //       id: params?.id || activeTask?.id,
  //       name: params?.id || activeTask?.name,
  //     },
  //     automation: {
  //       // frequency: "every 20 seconds",
  //     },
  //     view: {
  //       id: view_id,
  //       name: view_id,
  //     },
  //     profile: {
  //       id: params?.profile_id || activeProfile?.id || identity?.email,
  //       name: params?.profile_id || activeProfile?.name || identity?.email,
  //     },
  //     parents: {
  //       task_id: params?.id || activeTask?.id,
  //       profile_id: params?.profile_id || activeProfile?.id || identity?.email,
  //       view_id: params?.view_id || activeView?.id,
  //       session_id: params?.session_id || activeSession?.id,
  //       application_id: activeApplication?.id,
  //     },
  //   };
  // const {
  //   data: fetchData,
  //   isLoading: fetchIsLoading,
  //   error: fetchError,
  // } = useFetchByState(fetch_by_state);

  //   if (viewIsLoading) return <div>Loading...</div>;

  //   if (viewError) {
  //     return <ErrorComponent error={viewError} component={"Error"} />;
  //   }

  // let item_name = view_record?.actions[0]?.name;

  // let dataItems = fetchData?.data?.find(
  //   (item: any) => item?.message?.code === "wyndham_transactions"
  // )?.data;

  // let dataItems = responseData?.data?.find
  //   ? responseData?.data?.find(
  //       (item: any) =>
  //         item?.message?.code ===
  //         "fetch_onewurld_snowstorm_database_supplier_check"
  //     )?.data
  //   : null;

  // let dataFields = responseData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code === "fetch_onewurld_snowstorm_database_supplier_check"
  // )?.data_fields;

  // let view_record = responseData?.data?.find
  //   ? responseData?.data?.find(
  //       (item: any) =>
  //         item?.message?.code ===
  //         "fetch_onewurld_snowstorm_database_supplier_check"
  //     )?.view
  //   : null;

  // let response_status = responseData?.response?.status;

  let view_items = params?.view_items?.split(",");

  return (
    <div className="flex flex-col">
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

      {/* <div>response view wrapper</div>
      <div>{JSON.stringify(responseData)}</div> */}
      {/* {!action_id && response_status > 200 && (
        <MonacoEditor
          value={{
            response_status: responseData?.response?.status,
            response_status_text: responseData?.response?.statusText,
            response_data: responseData?.response?.data,
          }}
          height="25vh"
          language="json"
        ></MonacoEditor>
      )} */}

      {/* {!response_status && !action_id && (
        <MonacoEditor
          value={{
            responseData: responseData,
            //   dataItems: dataItems,
            //   dataFields: dataFields,
            // fetch_view_by_id_state: fetch_view_by_id_state,
            // item_name: item_name,
            // fetchData: fetchData,
            // viewData: viewData,
            // activeTask: activeTask,
            // view_item: view_item,
            // fetchIsLoading: fetchIsLoading,
            // fetchData: fetchData,
            // fetchError: fetchError,
            // dataItems: dataItems,
          }}
          height="80vh"
          language="json"
        ></MonacoEditor>
      )} */}

      {/* {view_record && dataItems && (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          view_mode={activeMainCustomComponent?.name || "datagrid"}
          view_record={view_record}
          data_fields={view_record?.fields}
        />
      )} */}
      {/* {view_record && (
        <LocalDBView view_record={view_record} view_item={view_item} />
      )} */}
      {/* {action_id && (
        <RunViewItemTask
          // response_data={responseData}
          view_item={views[action_id]}
          // views={views}
        />
      )} */}
      {/* {dataItems && view_record && (
        <Accordion
          multiple
          defaultValue={["fetch_onewurld_snowstorm_database_supplier_check"]}
        >
          <Accordion.Item
            value={"fetch_onewurld_snowstorm_database_supplier_check"}
            key={"fetch_onewurld_snowstorm_database_supplier_check"}
          >
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
                        label={getTooltipLabel(view_record || {})}
                      >
                        <div className="flex">
                          <Text
                            size="sm"
                            className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                            style={{ maxWidth: width < 500 ? 100 : 500 }}
                          >
                            {getLabel(view_record || {})}
                          </Text>
                          <IconInfoCircle size={18} />
                        </div>
                      </Tooltip>
                    }
                  >
                    <Documentation record={view_record}></Documentation>
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
                        // entity_type="views"
                        // action={"save"}
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
                data_fields={view_record?.fields}
                data_items={dataItems}
                view_record={view_record}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )} */}
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
    return <ErrorComponent error={runTaskDataError} component={"Error"} />;
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
                    label={getTooltipLabel(view_item_record || {})}
                  >
                    <div className="flex">
                      <Text
                        size="sm"
                        className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                        style={{ maxWidth: width < 500 ? 100 : 500 }}
                      >
                        {getLabel(view_item_record || {})}
                      </Text>
                      <IconInfoCircle size={18} />
                    </div>
                  </Tooltip>
                }
              >
                <Documentation record={view_record}></Documentation>
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

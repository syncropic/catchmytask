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
  sanitizeFilters,
  useFetchByState,
  useFetchExecutionData,
  useFetchQueryDataByState,
  useReadByState,
  useReadRecordByState,
} from "@components/Utils";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { useAppStore, useTransientStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import { IIdentity } from "@components/interfaces";
import LocalDBView from "./LocalDBView";
import DataGridView from "@components/DataGridView";
import { Accordion, Tooltip, Text } from "@mantine/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle } from "@tabler/icons-react";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";

interface ResponseViewWrapperProps {}

const ResponseViewWrapper = ({}: ResponseViewWrapperProps) => {
  const { params } = useParsed();
  const { width } = useViewportSize();
  const queryClient = useQueryClient();
  // const viewData = queryClient.getQueryData([view_query_key]);
  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  let action_id = params?.action_id;
  //   const { params } = useParsed();
  //   // const { width } = useViewportSize();
  //   const { data: identity } = useGetIdentity<IIdentity>();

  //   const {
  //     activeTask,
  //     activeView,
  //     activeSession,
  //     activeProfile,
  //     activeApplication,
  //     // action_input_form_fields,
  //     // activeEvent,
  //     // request_response,
  //     // activeMainCustomComponent,
  //   } = useAppStore();

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

  let response_status = responseData?.response?.status;

  return (
    <div className="flex flex-col">
      {/* <div>response view wrapper</div>
      <div>{JSON.stringify(responseData)}</div> */}
      {!action_id && response_status > 200 && (
        <MonacoEditor
          value={{
            response_status: responseData?.response?.status,
            response_status_text: responseData?.response?.statusText,
            response_data: responseData?.response?.data,
          }}
          height="25vh"
          language="json"
        ></MonacoEditor>
      )}

      {!response_status && !action_id && (
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
      )}

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
      {action_id && responseData && (
        <ViewItem response_data={responseData} action_id={action_id} />
      )}
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

const ViewItem = ({
  response_data,
  action_id,
}: {
  response_data: any;
  action_id: string;
}) => {
  const { width } = useViewportSize();
  const { params } = useParsed();

  let actionItem = response_data?.data?.find
    ? response_data?.data?.find(
        (item: any) => item?.action_step?.id === action_id
      )
    : {};

  let dataItems = actionItem?.data || [];
  // either read view from the response or retrieve view from external

  let view_record = actionItem?.view || {};
  let include_components = ["toolbar"];

  return (
    <div>
      {/* <MonacoEditor
        value={{
          dataItems: dataItems,
          // response_data: response_data,
          // action_id: action_id,
          view_record: view_record,
        }}
        height="65vh"
        language="json"
      ></MonacoEditor> */}
      {view_record && dataItems && (
        <Accordion multiple defaultValue={[action_id]}>
          <Accordion.Item value={action_id} key={action_id}>
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
                        reference_record={{
                          id: action_id,
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
      )}
    </div>
  );
};

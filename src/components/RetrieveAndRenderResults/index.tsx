import ListView from "@components/ListView";
import MonacoEditor from "@components/MonacoEditor";
import {
  useDataColumns,
  useFetchSessionById,
  useFetchViewById,
  useFetchViewByName,
} from "@components/Utils";
import {
  FieldConfiguration,
  IApplication,
  IDataset,
  IListItem,
  IView,
} from "@components/interfaces";
import {
  Accordion,
  Button,
  LoadingOverlay,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useCustom,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import React, { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { SpreadsheetComponent } from "@syncfusion/ej2-react-spreadsheet";
import SpreadsheetView from "@components/SpreadsheetView";
import { useQueryClient } from "@tanstack/react-query";
import WebBrowserView from "@components/WebBrowserView";
import QueryBar from "@components/QueryBar";
import Results from "@components/Results";
import SelectAction from "@components/SelectAction";
import { Item } from "@radix-ui/react-context-menu";
import FloatingWindow from "@components/FloatingWindow";
import config from "src/config";

export const RetrieveAndRenderResults: React.FC<
  IResourceComponentsProps
> = () => {
  const { params } = useParsed();
  const queryClient = useQueryClient();

  // get application from params
  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    isError: isErrorApplication,
  } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: `${params?.applicationId}`,
  });

  // get session from params
  const {
    data: session,
    isLoading: sessionIsLoading,
    error: sessionError,
  } = useFetchSessionById(params?.id);

  // // get default view by id
  // const {
  //   data: defaultView,
  //   isLoading: defaultViewIsLoading,
  //   error: defaultViewError,
  // } = useFetchViewById("views:⟨018fff37-21c0-707f-b7f0-928c4c9412b5⟩");

  // const sessionDataset = useOne<IDataset, HttpError>({
  //   resource: "datasets",
  //   id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
  // });

  // console.log("sessionDataset", sessionDataset);
  // const defaultDatasetListItem = sessionDataset.data?.data.list.find(
  //   (item) => item.name == "default"
  // );
  // console.log("defaultSessionListItem", defaultSessionListItem);

  // const actionsList = defaultDatasetListItem?.actions;
  // console.log("actionsList", actionsList);

  // const { queryResult } = useShow();
  const {
    setActiveSession,
    activeSession,
    setActiveApplication,
    // setActiveAction,
    setActiveRecord,
    setActiveViewItem,
    // setActiveDataset,
    activeQueryGraph,
  } = useAppStore();
  // use effect to set active dataset
  // useEffect(() => {
  //   if (sessionDataset?.data) {
  //     setActiveDataset(sessionDataset?.data?.data);
  //   }
  // }, [sessionDataset?.data]);

  // const { data, isLoading } = queryResult;

  // Invalidate query key when activeQueryGraph changes
  useEffect(() => {
    if (activeQueryGraph) {
      queryClient.invalidateQueries(["execute-query-graph-key"]);
    }
  }, [activeQueryGraph]);

  // const session = data?.data;
  // when session changes, set activeSession
  const { data, isLoading, isFetching } = useCustom({
    url: `${config.API_URL}/catch`,
    queryOptions: {
      queryKey: ["execute-query-graph-key", activeQueryGraph],
      enabled: true,
    },
    method: "post",
    config: {
      payload: {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "execute_query_graph",
            tool_arguments: {
              query_graph: activeQueryGraph[0],
            },
          },
        ],
      },
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // invalidate query

      // queryClient.invalidateQueries(["list_action_history_1"]);
      // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

      return {
        message: `successfully executed.`,
        description: "Success with no errors",
        type: "success",
      };
    },
    errorNotification: (data, values) => {
      // console.log("successNotification", data?.response.status);
      // console.log("errorNotification values", values);
      return {
        message: `${data?.response.status} : ${
          data?.response.statusText
        } : ${JSON.stringify(data?.response.data)}`,
        description: "Error",
        type: "error",
      };
    },
  });
  useEffect(() => {
    if (session?.data[0]) {
      setActiveSession(session?.data[0]);
      // also set activeAction, activeRecord, activeView to null when session changes
      // setActiveAction(null);
      setActiveRecord(null);
      setActiveViewItem(null);
    }
  }, [session?.data[0]]);

  // when session changes, set activeSession
  useEffect(() => {
    if (applicationData?.data) {
      setActiveApplication(applicationData?.data);
    }
  }, [applicationData?.data]);
  // console.log("activeSession", activeSession);
  // const setFieldValue = (field: string, value: any) => {
  //   console.log("field", field);
  // };

  return (
    <>
      {/* <div>{JSON.stringify(data?.data[0]?.main_query["select"]["data"])}</div> */}
      {/* {JSON.stringify(defaultView)} */}
      {/* <FloatingWindow></FloatingWindow> */}
      <Text>
        <b>name:</b>{" "}
        {activeSession?.name ||
          activeSession?.display_name ||
          activeSession?.title}
      </Text>
      {/* <SelectAction></SelectAction> */}
      {/* only render for unique items, i.e no duplicates so i dont make multiple requests */}
      <Accordion defaultValue="main_query">
        {data?.data[0]?.ctes["result_view_CTE"]?.["data"] &&
          data?.data[0]?.ctes["result_view_CTE"]?.["data"].map((item: any) => {
            return (
              <RetriveView view_definition={item} data={data}></RetriveView>
            );
          })}
      </Accordion>
    </>
  );
};
export default RetrieveAndRenderResults;

const RetriveView = ({
  view_definition,
  data,
}: // data_field_configurations,
// view_field_configurations,
// resource_group,
// results,

{
  view_definition: any;
  data: any;
  // data_field_configurations: any;
  // view_field_configurations: any;
  // resource_group: string;
  // results: any;
}) => {
  const {
    data: viewData,
    error: viewError,
    isLoading: viewIsLoading,
  } = useFetchViewByName(view_definition?.view);
  // console.log("viewData", viewData);
  // console.log("view_definition");
  return (
    <>
      {viewData &&
        data?.data[0]?.main_query &&
        view_definition.result_section === "main_query" && (
          <RenderResults
            resource_group="main_query"
            data_items={data?.data[0]?.main_query["data"].map((item: any) => {
              return { ...item, resultsSection: "main_query" };
            })}
            data_field_configurations={
              data?.data[0]?.main_query["field_configurations"]
            }
            view_field_configurations={viewData?.data[0]?.field_configurations}
            view_data={viewData}
            results={{ name: "main_query" }}
          />
        )}
      {/* render ctes */}
      {viewData &&
        data?.data[0]?.ctes &&
        view_definition.result_section !== "main_query" && (
          <>
            <RenderResults
              resource_group={view_definition?.result_section}
              data_items={data?.data[0]?.ctes[view_definition.result_section][
                "data"
              ].map((item: any) => {
                return {
                  ...item,
                  resultsSection: item.result_section,
                };
              })}
              data_field_configurations={
                data?.data[0]?.ctes[view_definition.result_section][
                  "field_configurations"
                ]
              }
              view_field_configurations={
                viewData?.data[0]?.field_configurations
              }
              view_data={viewData}
              results={{ name: view_definition?.result_section }}
            />
          </>
        )}
    </>
  );
};

// {Object.keys(data.data[0].ctes).map((key, index) => (
//   <RenderResults
//     resource_group={key}
//     data_items={data?.data[0]?.ctes[key]["data"].map(
//       (item: any) => {
//         return { ...item, resultsSection: key };
//       }
//     )}
//     data_field_configurations={
//       data?.data[0]?.ctes[key]["field_configurations"]
//     }
//     view_field_configurations={
//       defaultView?.data[0]?.field_configurations
//     }
//     results={{ name: key }}
//   />
// ))}

// default columns select, actions, details
const default_configurations: FieldConfiguration[] = [
  {
    name: "select",
    data_type: "boolean",
    visible: true,
    display_component: "RowSelect",
  },
  {
    name: "actions",
    data_type: "array",
    visible: true,
    display_component: "RowActionsSelect",
  },
  {
    name: "details",
    data_type: "any",
    visible: true,
    display_component: "ItemDetails",
  },
];

const RenderResults = ({
  data_items,
  data_field_configurations = [],
  view_field_configurations = [],
  resource_group,
  view_data,
  results,
}: {
  data_items: any;
  data_field_configurations: any;
  view_field_configurations: Array<any>;
  view_data: any;
  resource_group: string;
  results: any;
}) => {
  // console.log("view_data", view_data);
  // console.log("view_field_configurations", view_field_configurations);
  // enhance the data_items first i.e adding visible, display_component, etc
  let field_configurations_with_defaults = data_field_configurations.map(
    (field: FieldConfiguration) => {
      // find the field in view_field_configurations by name
      // const view_field = view_field_configurations.find(
      //   (view_field: any) => view_field.name
      // );
      // console.log("view_field", view_field);
      // console.log(
      //   "found field in view_field_configurations",
      //   view_field_configurations.find((item: any) => (item.name = field.name))
      // );
      let found_field = view_field_configurations.find(
        (item: any) => item.name === field.name
      );
      // console.log("field", field);
      // console.log("found_field", found_field);
      return {
        ...found_field, // default
        ...field, // data
        // user view configurations override default configurations
        // visible: field.visible || true,
      };
    }
  );
  // add default configurations
  field_configurations_with_defaults = [
    ...default_configurations,
    ...field_configurations_with_defaults,
  ];
  // console.log(
  //   "field_configurations_with_defaults",
  //   field_configurations_with_defaults
  // );
  const data_columns_enhanced = useDataColumns(
    field_configurations_with_defaults || [],
    resource_group
  );
  // console.log("data_items", data_items);
  // console.log("field_configurations", field_configurations);
  // console.log("data_columns_enhanced", data_columns_enhanced);
  // let action_configurations: Array<any> =
  //   view_data?.data[0]?.action_configurations || [];
  // console.log("action_configurations", action_configurations);
  return (
    <div>
      {/* {data_items && <div>{JSON.stringify(data_columns_enhanced)}</div>} */}
      {data_items && (
        <Accordion.Item key={resource_group} value={resource_group}>
          <Accordion.Control>{resource_group}</Accordion.Control>
          <Accordion.Panel className="h-full w-full">
            <div className="relative h-full w-full">
              <Results
                data_items={data_items}
                data_columns={data_columns_enhanced}
                isLoadingDataItems={false}
                results={results}
                resource_group={resource_group}
                view_data={view_data}
              ></Results>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      )}
    </div>
  );
};

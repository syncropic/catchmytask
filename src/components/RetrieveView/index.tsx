import ListView from "@components/ListView";
import MonacoEditor from "@components/MonacoEditor";
import {
  mergeEdgeWithEntityValues,
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

export const RetriveView = ({
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
  // const destructureFieldConfiguration = (field_configuration: any) => {
  //   // pop the key out from the object
  //   let { out, ...edge } = field_configuration;
  //   // pop the key id from rest object
  //   let { edge_id, ...edge_without_id } = edge;
  //   // return and merge the rest object with the out object
  //   return {
  //     ...out,
  //     edge_id,
  //     ...edge_without_id,
  //   };
  // };
  // let dataitems = data?.data[0]?.main_query["data"];
  // console.log("dataitems", dataitems);
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
            view_field_configurations={viewData?.data[0]?.field_configurations?.map(
              (nested_field: any) => mergeEdgeWithEntityValues(nested_field)
            )}
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
              view_field_configurations={viewData?.data[0]?.field_configurations?.map(
                (nested_field: any) => mergeEdgeWithEntityValues(nested_field)
              )}
              view_data={viewData}
              results={{ name: view_definition?.result_section }}
            />
          </>
        )}

      {/* {render any other} */}
      {viewData &&
        !data?.data[0]?.ctes &&
        view_definition.result_section !== "main_query" && (
          <>
            {/* <div>render other</div> */}
            <RenderResults
              resource_group={view_definition?.result_section}
              data_items={data?.data.map((item: any) => {
                return {
                  ...item,
                  resultsSection: item.result_section,
                };
              })}
              data_field_configurations={[]}
              view_field_configurations={viewData?.data[0]?.field_configurations?.map(
                (nested_field: any) => mergeEdgeWithEntityValues(nested_field)
              )}
              view_data={viewData}
              results={{ name: view_definition?.result_section }}
            />
          </>
        )}
    </>
  );
};

export default RetriveView;

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
  // if data_field_configurations is empty, use view_field_configurations
  if (data_field_configurations.length < 1) {
    data_field_configurations = view_field_configurations;
  }

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
      {/* <div>{JSON.stringify(data_field_configurations)}</div> */}
    </div>
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

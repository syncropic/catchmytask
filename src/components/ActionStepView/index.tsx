import DataDisplay from "@components/DataDisplay";
import { Accordion, Text } from "@mantine/core";
import { useCustom } from "@refinedev/core";
import React, { useEffect, useState } from "react";
// import { useAppStore } from "src/store";
import config from "src/config";

// import { SpreadsheetComponent } from "@syncfusion/ej2-react-spreadsheet";
// import SpreadsheetView from "@components/SpreadsheetView";
// import { useQueryClient } from "@tanstack/react-query";
// import WebBrowserView from "@components/WebBrowserView";
// import QueryBar from "@components/QueryBar";
// import Results from "@components/Results";
// import SelectAction from "@components/SelectAction";
// import { Item } from "@radix-ui/react-context-menu";
// import FloatingWindow from "@components/FloatingWindow";

export const ActionStepView = ({
  action_step,
}: // data,
// data_field_configurations,
// view_field_configurations,
// resource_group,
// results,

{
  action_step: any;
  // data: any;
  // data_field_configurations: any;
  // view_field_configurations: any;
  // resource_group: string;
  // results: any;
}) => {
  // const {
  //   data: viewData,
  //   error: viewError,
  //   isLoading: viewIsLoading,
  // } = useFetchViewByName(view_definition?.view);
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
      {/* <div>{JSON.stringify(action_step)}</div> */}
      <Accordion.Item key={action_step?.id} value={action_step?.name}>
        <Accordion.Control>
          {`${action_step.execution_order} / ${action_step?.description} / ${
            action_step?.service
          } / ${
            action_step?.select?.credential || action_step?.insert?.credential
          }`}
        </Accordion.Control>
        <Accordion.Panel className="h-full w-full">
          <div className="relative h-full w-full">
            {/* <Results
                data_items={data_items}
                data_columns={data_columns_enhanced}
                isLoadingDataItems={false}
                results={results}
                resource_group={resource_group}
                view_data={view_data}
              ></Results> */}
            {/* <div>{JSON.stringify(action_step)}</div> */}
            {/* <MonacoEditor
              value={action_step}
              language="json"
              // setFieldValue={setFieldValue}
            /> */}
            <ResultsWrapper action_step={action_step}></ResultsWrapper>
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </>
  );
};

export default ActionStepView;

const ResultsWrapper = ({ action_step }: { action_step: any }) => {
  // check if select key is in the action step
  // if it is, then render the select component
  // if not, render the results component
  // console.log("action_step", action_step);
  if (action_step?.select) {
    return <SelectComponent action_step={action_step}></SelectComponent>;
  }
  return (
    <div>
      <Text>{JSON.stringify(action_step)}</Text>
    </div>
  );
};

const SelectComponent = ({ action_step }: { action_step: any }) => {
  const { data, isLoading, error } = useCustom({
    url: `${config.API_URL}/read`,
    method: "post",
    config: {
      payload: {
        task_variables: {},
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            description: "Retrieve action step data",
            name: "retrieve_action_step_data",
            job: "retrieve action step data",
            action_step_query: action_step?.select?.query,
            method: "get",
            type: "main",
            credential:
              action_step?.select?.credential || "surrealdb catchmytask dev",
            select: {
              query: action_step?.select?.query,
              credential: action_step?.select?.credential,
            },
          },
        ],
      },
    },
    queryOptions: {
      queryKey: [`data_for_${action_step?.select?.query}`], // simply change the query key to trigger call for that field
      // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
      // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
      // enabled:
      //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
      // enabled:
      // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
      // enabled:
      //   activeField?.field_name && !focusedFields?.[activeField?.field_name]
      //     ? true
      //     : false, // as long as there is a activefield with field name, run the query
      // enabled: touchedFields.includes(field?.name),
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // data is the response from the query
      // setFocusedFields({
      //   ...focusedFields,
      //   [activeField?.field_name]: {
      //     ...activeField,
      //     data: data?.data,
      //   },
      // }); // Reset focused field after successful query
      return {
        message: `successfully retrieved data for ${action_step?.name}s.`,
        description: "Success with no errors",
        type: "success",
      };
    },
  });
  return (
    <div>
      {/* <Text>
        {JSON.stringify(
          data?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data_fields
        )}
      </Text> */}
      <DataDisplay
        data_items={
          data?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data
        }
        data_fields={
          data?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data_fields
        }
        isLoadingDataItems={isLoading}
      ></DataDisplay>
    </div>
  );
};

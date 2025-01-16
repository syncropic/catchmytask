import {
  buildSQLQuery,
  calculateColumnWidth,
  enrichFilters,
  excelToStandardizedJson,
  extractDefaultValues,
  extractIdentifier,
  extractLabelsFromDefaults,
  FieldInfo,
  formatPythonTemplate,
  getComponentByResourceType,
  inferDataTypes,
  sanitizeFilters,
  useFetchQueryDataByState,
  useQueryByState,
  useReadRecordByState,
  useSearchFilters,
} from "@components/Utils";
import { useAppStore, useTransientStore } from "src/store";
import {
  Accordion,
  Box,
  Button,
  Indicator,
  LoadingOverlay,
  Title,
  Tooltip,
} from "@mantine/core";
import dayjs from "dayjs";
// import { parseNSTLQuery } from "@components/Utils/ntslParser";
import { DateInputProps } from "@mantine/dates";
// import { ActionControlFormWrapper } from "@components/ActionControlForm";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { Children, useEffect, useRef, useState } from "react";
import {
  ActionInputWrapperProps,
  ActionStepsActionInputFormProps,
  ComponentKey,
  DynamicFormProps,
  Field,
  IIdentity,
  Schema,
  SchemaProperty,
} from "@components/interfaces";
import {
  BaseRecord,
  HttpError,
  useCustomMutation,
  useGetIdentity,
  useGo,
  useParsed,
} from "@refinedev/core";
import { debounce, update } from "lodash";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import ExternalSubmitButton from "@components/SubmitButton";
// import { initializeLocalDB } from "src/local_db";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { showNotification } from "@mantine/notifications";
import { saveToLocalDB } from "src/local_db";
import React from "react";
import { IconAdjustments, IconFilter, IconX } from "@tabler/icons-react";
import { ConsoleLogger } from "@duckdb/duckdb-wasm";
import DynamicFilter, {
  FilterOutput,
  Variable,
} from "@components/DynamicFilter";
import { useSession } from "next-auth/react";
import { useToggleView } from "@components/hooks/useToggleView";

// Function to map class names to ExcelJS ARGB colors
const getExcelJSStyleFromClass = (className: string) => {
  switch (className) {
    case "bg-green-500":
      return { fgColor: { argb: "FF4CAF50" } }; // Green background
    case "bg-red-500":
      return { fgColor: { argb: "FFFF0000" } }; // Red background
    case "bg-gray-500":
      return { fgColor: { argb: "FF9E9E9E" } }; // Gray background
    case "bg-orange-500":
      return { fgColor: { argb: "FFFFA500" } }; // Orange background
    default:
      return null;
  }
};
type ValidationError = string;

export const ActionInputForm: React.FC<DynamicFormProps> = ({
  data_model,
  record = {},
  action,
  success_message_code = "query_success_results",
  fields,
  title,
  action_form_key = "general",
}) => {
  const {
    activeSession,
    activeAction,
    activeApplication,
    activeTask,
    setActionInputFormValues,
    action_input_form_values,
    action_input_form_fields,
    focused_entities,
    setFocusedEntities,
    selectedRecords,
    activeLayout,
    setActiveLayout,
    // globalQuery,
    setGlobalQuery,
    views,
    setViews,
    form_status,
    setFormStatus,
    activeView,
    uploaded,
    setUploaded,
    action_mode,
    action_modes,
    activeAgent,
    activeSections,
    activeEvent,
    activeInvalidateQueryKey,
    activeProfile,
    setActionInputFormFields,
    setRequestResponse,
    activeViewItem,
    clearViews,
    activeInput,
    filter_form_values,
  } = useAppStore();
  const queryClient = useQueryClient();
  const go = useGo(); // Navigation function
  const { toggleView } = useToggleView();
  const { runtimeConfig: config } = useAppStore();
  const { data: user_session } = useSession();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { setFormSubmitHandler, setFormInstance } = useTransientStore();
  const { searchFilters } = useSearchFilters();
  const { params } = useParsed();
  // let actionInputId = record?.id || params?.id;
  // let action_input_form_values_key =
  //   action_form_key || `${action || "query"}_${actionInputId}`;

  const action_input_form_values_key = action_form_key;
  // action_input_form_values = action_form_key;
  // let action_input_form_fields_key = `${action || "query"}_${actionInputId}`;
  const [activeTemplateRecord, setActiveTemplateRecord] = useState<any>(null);

  // Define the response type for your specific data
  type CustomMutationResponse<T> = {
    data: T;
    headers: Record<string, string>;
  };

  // handle toggleDisplay
  const openDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

  const {
    mutate,
    data: mutationData,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation({
    mutationOptions: {
      // mutationKey: [action_input_form_values_key],
      mutationKey: ["main_form_request"],
    },
  });

  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  // get view_record for utilization across all action inputs
  // const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const fields = action_input_form_fields[action_input_form_values_key];

  // const view_id = activeViewItem?.view_id || params?.view_id;
  // const task_id = params?.task_id;
  // const session_id = params?.session_id;

  // let fetch_view_by_id_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: view_id,
  //   record: {
  //     id: view_id,
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: viewData,
  //   isLoading: viewIsLoading,
  //   error: viewError,
  // } = useReadRecordByState(fetch_view_by_id_state);

  // let view_record = viewData?.data?.find(
  //   (item: any) => item?.message?.code === view_id
  // )?.data[0];

  // let view_ids = Object.keys(views);

  // const toggleView = (id: string, record: any) => {
  //   // Access the current views from your zustand store
  //   const currentViews = views;

  //   // Check if the item exists in views
  //   const existingView = currentViews[id];

  //   const toggleItemInList = (list: any, itemId: any) => {
  //     // Check if item exists in list
  //     const exists = list.includes(itemId);

  //     if (exists) {
  //       // If exists, filter it out
  //       return list.filter((id: string) => id !== itemId);
  //     } else {
  //       // If doesn't exist, add it to the list (spreading the existing list)
  //       return [...list, itemId];
  //     }
  //   };

  //   if (existingView) {
  //     // Remove the view if it exists
  //     // const { [id]: removedView, ...remainingViews } = currentViews;
  //     setViews(id, null);
  //     let new_view_ids = toggleItemInList(view_ids, id);
  //     const queryParams: {
  //       profile_id: string;
  //       [key: string]: string;
  //     } = {
  //       profile_id: String(
  //         record?.profile_id || params?.profile_id || activeProfile?.id
  //       ),
  //     };

  //     if (new_view_ids?.length > 0) {
  //       queryParams.view_items = String(new_view_ids);
  //     }
  //     go({
  //       // to: {
  //       //   resource: "sessions",
  //       //   action: "show",
  //       //   id: record?.id,
  //       // },
  //       query: queryParams,
  //       type: "push",
  //     });
  //   } else {
  //     // Add the view if it doesn't exist
  //     setViews(id, record);
  //     let new_view_ids = [...view_ids, id];
  //     const queryParams: {
  //       profile_id: string;
  //       [key: string]: string;
  //     } = {
  //       profile_id: String(
  //         record?.profile_id || params?.profile_id || activeProfile?.id
  //       ),
  //     };

  //     if (new_view_ids?.length > 0) {
  //       queryParams.view_items = String(new_view_ids);
  //     }
  //     go({
  //       // to: {
  //       //   resource: "sessions",
  //       //   action: "show",
  //       //   id: record?.id,
  //       // },
  //       query: queryParams,
  //       type: "push",
  //     });
  //   }
  // };

  const view_id = activeViewItem?.view_id;
  // const task_id = params?.task_id;
  // const session_id = params?.session_id;

  let fetch_view_by_id_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: view_id,
    record: {
      id: view_id,
    },
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(fetch_view_by_id_state);

  let view_record = viewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      String(fetch_view_by_id_state?.success_message_code)
  )?.data[0];

  const [showVariables, setShowVariables] = useState(false);

  const toggleVariables = () => {
    setShowVariables((prev) => !prev);
  };

  // const globalQuery =
  //   useAppStore(
  //     (state) =>
  //       state.action_input_form_values[`${action_input_form_values_key}`]?.query
  //   ) || view_record?.query; // use query as default if nothing is in the global store

  const identity_object = {
    author_id: identity?.email,
  };

  // let active_view_search_model_state = {
  //   id: view_record?.id,
  //   query_name: "data_model",
  //   name: view_record?.["action_models"]?.["search"],
  //   success_message_code: "action_input_data_model_schema",
  // };

  // const {
  //   data: active_view_search_model_data,
  //   isLoading: active_view_search_model_isLoading,
  //   error: active_view_search_model_error,
  // } = useFetchQueryDataByState(active_view_search_model_state);

  const formId = action_input_form_values_key; // Unique form identifier

  const schemaDefaultValues = extractLabelsFromDefaults(
    extractDefaultValues(data_model)
  );
  let defaultRecord = {};
  // if action is save defaultRecord is the record.name + schemaDefaultValues
  if (action === "save") {
    defaultRecord = {
      name: record?.name,
      ...schemaDefaultValues,
    };
  } else {
    defaultRecord = record;
  }

  const defaultValueObjects = [
    // actionInputIds,
    identity_object,
    defaultRecord,
    action_input_form_values[action_input_form_values_key] || {},
    // action_input_form_values[proceed_action_input_form_values_key] || {},
  ];

  const defaultValues = _.merge({}, ...defaultValueObjects);
  // console.log("defaultValues");
  // console.log(defaultValues);

  // Add this function before your main code to handle date formatting
  const formatDateForExcel = (value: any, field: any) => {
    // Check if the value is a date string
    if (
      typeof value === "string" &&
      value.match(/^\d{4}-\d{2}-\d{2}/) &&
      field.type === "datetime"
    ) {
      // Parse the date string and create a proper Excel date
      const date = new Date(value + "Z"); // Append Z to treat as UTC
      return date;
    }
    return value;
  };
  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(
          record?.profile_id || params?.profile_id || activeProfile?.id
        ),
      },
      type: "push",
    });
    clearViews({});
  };
  // Helper function to find field type from data_fields

  // First, modify the getFieldType helper to be more precise
  const getFieldType = (fieldName: string, fields: any[]) => {
    const field = fields.find((f) => f.name === fieldName);
    return field?.data_type?.toLowerCase() || null;
  };

  // Create a ref to store previous default values for comparison
  const previousDefaultValuesRef = useRef(defaultValues);

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      let success_message_code_selected =
        value?.success_message_code ||
        success_message_code ||
        "query_success_results";

      const new_focused_entities = { ...focused_entities };
      //   console.log("new_focused_entities", new_focused_entities);
      //   console.log("id", id);
      if (!new_focused_entities["action_input"]) {
        new_focused_entities["action_input"] = {};
      } else {
        new_focused_entities["action_input"].action = action;
        new_focused_entities["action_input"].record = record;
      }
      setFocusedEntities(new_focused_entities);

      // const specialActions = ["save", "upload"]; // List of special actions
      // const action_url = specialActions.includes(action) ? "execute" : action; // Check if action is in the list and replace if necessary
      let action_url = "route";
      // let agent_actions = ["search", "query"];
      // if (agent_actions.includes(action)) {
      //   action_url = "agent";
      // }

      // if action is not special then perform the following otherwise alert the action name
      // if (activeAction?.name == "save") {
      //   // alert(JSON.stringify(activeAction));
      //   console.log("save");
      // }
      if (activeAction?.name === "reset") {
        // console.log("reset");
        let new_action_input_form_values = {
          ...action_input_form_values,
          [action_input_form_values_key]: {
            ...action_input_form_values[action_input_form_values_key],
            query_template: view_record?.query,
            query: view_record?.query,
          },
        };
        setActionInputFormValues(new_action_input_form_values);
        setActionInputFormFields(action_input_form_values_key, []);
      } else if (activeAction?.name === "save") {
        // console.log(activeViewItem);
        // console.log(view_record);
        // console.log("searchFilters", searchFilters);
        // alert(JSON.stringify(value));
        const fetchFromDuckDB = async () => {
          try {
            let reference_item_name = sanitizeSheetName(
              activeAction?.reference_record?.name
            );
            // console.log(`globalQuery: ${globalQuery}`);

            // let active_view_query_model_data_data_model_query_filters =
            //   view_record?.data_model?.schema?.query_filters;
            // let enriched_query_filters = enrichFilters(
            //   active_view_query_model_data_data_model_query_filters,
            //   action_input_form_values[action_input_form_values_key] || {}
            // );

            // let rendered_globalQuery = buildSQLQuery(
            //   globalQuery,
            //   sanitizeFilters(enriched_query_filters),
            //   { caseSensitive: false }
            // )?.query;

            // let downloadQuery = rendered_globalQuery;

            // console.log("downloadQuery", downloadQuery);

            // const downloadResult = await dbInstance.query(downloadQuery);

            // // Debugging logs
            // console.log("Download result:", downloadResult);
            // console.log("Download result schema:", downloadResult?.schema);
            // console.log(
            //   "Download result schema fields:",
            //   downloadResult?.schema?.fields
            // );

            // console.log(activeAction);

            // const downloadData = downloadResult.toArray();
            // console.log("downloadData", downloadData);
            const cachedData = queryClient.getQueryData([
              activeAction?.reference_record?.queryKey,
            ]) as any;
            // console.log("cachedData");
            // console.log(cachedData);
            // console.log("activeAction?.reference_record");
            // console.log(activeAction?.reference_record);

            let actionItem = cachedData?.data?.find
              ? cachedData?.data?.find(
                  (item: any) =>
                    item?.message?.code ===
                    activeAction?.reference_record?.summary_message_code
                )
              : {};

            // console.log(`actionItem:`);
            // console.log(actionItem);

            let downloadData = actionItem?.data || [];
            // either read view from the response or retrieve view from external

            let view_record = actionItem?.view || {};

            // Check if data exists
            if (!downloadData || downloadData.length === 0) {
              alert("No data available to download.");
              return;
            }

            // console.log(`downloadData ${downloadData}`);

            // // Ensure that downloadResult.schema and downloadResult.schema.fields are not undefined
            // if (!downloadResult?.schema || !downloadResult?.schema?.fields) {
            //   console.error("Schema information is not available.");
            //   return;
            // }

            // // Extract column names from the query result schema fields
            // const columnNames = downloadResult.schema.fields.map(
            //   (field: any) => field.name
            // );
            const columnNames = view_record?.fields.map(
              (field: any) => field?.name
            );
            // console.log(columnNames);

            // console.log("column names", columnNames);
            // console.log("view_record", view_record);

            // // Ensure the data is an array of arrays
            // const dataWithHeaders = [
            //   columnNames,
            //   ...downloadData.map((row: any) => Object.values(row)),
            // ];

            // Step 1: Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`${reference_item_name}`);

            // Step 2: Add headers and apply formatting to the headers
            // worksheet.columns = columnNames.map((col: any) => ({
            //   header: col,
            //   key: col,
            //   width: 20, // Adjust column width here
            // }));

            // Modify the column definition part

            // 1. Column definitions
            worksheet.columns = columnNames.map((col: any) => {
              const fieldType = getFieldType(col, view_record?.fields);
              return {
                header: col,
                key: col,
                width: fieldType === "datetime",
                style:
                  fieldType === "datetime"
                    ? { numFmt: "yyyy-mm-dd hh:mm:ss" }
                    : {},
              };
            });

            // Apply refined dark mode styling to the header row (first row)
            worksheet.getRow(1).eachCell((cell) => {
              cell.font = {
                bold: true,
                size: 14,
                color: { argb: "FFD3D3D3" }, // Light gray text color
              };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF2C2C2C" }, // Dark gray background color
              };
              cell.alignment = { horizontal: "center", vertical: "middle" }; // Center alignment

              // Make the border stand out more
              cell.border = {
                top: { style: "medium", color: { argb: "FFCCCCCC" } }, // Lighter gray for visibility
                left: { style: "medium", color: { argb: "FFCCCCCC" } },
                bottom: { style: "medium", color: { argb: "FFCCCCCC" } },
                right: { style: "medium", color: { argb: "FFCCCCCC" } },
              };
            });

            // 2. Data row handling
            downloadData.forEach((row: any) => {
              const convertedRow = Object.fromEntries(
                Object.entries(row).map(([key, value]) => {
                  // Handle BigInt
                  if (typeof value === "bigint") {
                    return [key, value.toString()];
                  }

                  // Check if field is datetime
                  const fieldType = getFieldType(key, view_record.fields);
                  if (fieldType === "datetime" && value) {
                    try {
                      // Handle different date string formats
                      // First ensure value is a string
                      if (
                        typeof value === "string" ||
                        typeof value === "number" ||
                        value instanceof Date
                      ) {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          return [key, date];
                        }
                      }
                    } catch (error) {
                      console.warn(
                        `Failed to parse date for column ${key}:`,
                        value
                      );
                    }
                  }

                  return [key, value];
                })
              );

              const newRow = worksheet.addRow(convertedRow);

              // Apply date format to datetime columns
              columnNames.forEach((colName: string, index: number) => {
                const fieldType = getFieldType(colName, view_record.fields);
                if (fieldType === "datetime") {
                  const cell = newRow.getCell(index + 1);
                  if (cell.value) {
                    // Only set format if there's a value
                    cell.numFmt = "yyyy-mm-dd hh:mm:ss";
                  }
                }
              });
            });

            console.log(
              "activeView to use in save, the record will be the active view being read directly from react query",
              record
            );

            view_record.fields.forEach((field: any) => {
              if (field.conditional_formatting) {
                const targetColumnIndex = columnNames.indexOf(field.name) + 1; // Get the index of the field to apply formatting
                const comparisonColumnIndex =
                  columnNames.indexOf(field.conditional_formatting.name) + 1; // Get the index of the comparison field

                if (targetColumnIndex > 0 && comparisonColumnIndex > 0) {
                  worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return; // Skip header row

                    const targetCell = row.getCell(targetColumnIndex); // Cell where formatting will be applied
                    const comparisonCell = row.getCell(comparisonColumnIndex); // Cell used for comparison
                    const comparisonCellValue = String(comparisonCell.value)
                      .toLowerCase()
                      .trim(); // Normalize comparison value

                    // Find the matching rule for conditional formatting
                    const matchingRule =
                      field.conditional_formatting.rules.find(
                        (rule: any) =>
                          String(rule.value).toLowerCase().trim() ===
                          comparisonCellValue
                      );

                    if (matchingRule) {
                      const style = getExcelJSStyleFromClass(
                        matchingRule.class
                      );
                      if (style) {
                        targetCell.fill = {
                          type: "pattern",
                          pattern: "solid",
                          ...style,
                        };
                        targetCell.font = { color: { argb: "FFFFFFFF" } }; // White text color
                      }
                    }
                  });
                }
              }
            });

            // Freeze the first row (header) and the first 3 columns by default
            worksheet.views = [
              { state: "frozen", ySplit: 1, xSplit: 3 }, // Freeze the first row and the specific column
            ];
            // Step 6: Adjust column widths
            // worksheet.columns.forEach((column, index) => {
            //   const header = columnNames[index];
            //   column.width = calculateColumnWidth(header);
            // });
            // Also modify the column definition part to set proper width for datetime columns:
            worksheet.columns = columnNames.map((col: any) => {
              const field = view_record?.fields.find(
                (f: any) => f.name === col
              );
              return {
                header: col,
                key: col,
                width:
                  field?.type === "datetime"
                    ? 25
                    : calculateColumnWidth(field?.name), // Make datetime columns wider
                style:
                  field?.type === "datetime"
                    ? { numFmt: "yyyy-mm-dd hh:mm:ss" }
                    : {},
              };
            });

            // Step 7: Add a summary sheet
            const summarySheet = workbook.addWorksheet("summary");

            // Add headers to the summary sheet (id, count) and format them like the main sheet
            summarySheet.columns = [
              { header: "id", key: "id", width: 20 },
              { header: "count", key: "count", width: 20 },
            ];

            summarySheet.getRow(1).eachCell((cell) => {
              cell.font = {
                bold: true,
                size: 14,
                color: { argb: "FFD3D3D3" }, // Light gray text color
              };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF2C2C2C" }, // Dark gray background color
              };
              cell.alignment = { horizontal: "center", vertical: "middle" };

              cell.border = {
                top: { style: "medium", color: { argb: "FFCCCCCC" } }, // Lighter gray for visibility
                left: { style: "medium", color: { argb: "FFCCCCCC" } },
                bottom: { style: "medium", color: { argb: "FFCCCCCC" } },
                right: { style: "medium", color: { argb: "FFCCCCCC" } },
              };
            });

            // Step 8: Add a row to the summary sheet with the id and count of rows from the main sheet
            summarySheet.addRow({
              id: reference_item_name || "Sheet Name",
              count: downloadData.length,
            });

            // Freeze the first row (header) and the first 3 columns by default
            summarySheet.views = [
              { state: "frozen", ySplit: 1, xSplit: 3 }, // Freeze the first row and the specific column
            ];

            // Step 9: Write the workbook to a Blob and trigger a download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, `${reference_item_name}.xlsx`);

            // Step 7: Show success notification after saving
            setTimeout(() => {
              showNotification({
                title: "Saved successfully",
                message: `${reference_item_name}.xlsx excel file created successfully.`,
                color: "green",
                autoClose: 2000, // Close notification after 2 seconds
              });
            }, 500); // Small delay to ensure file save is triggered first

            console.log(
              `${reference_item_name}.xlsx excel file created and downloaded successfully.`
            );
          } catch (err) {
            let errorMessage = "";
            errorMessage = `Error querying or generating excel file. ${err}`;
            console.error(errorMessage);
            alert(errorMessage);
          }
        };
        // alert(JSON.stringify(value));
        fetchFromDuckDB();
      } else if (action === "upload") {
        console.log("upload action");
      } else {
        // clear views and on success navigate to main view?
        // handleClearViews();

        return new Promise((resolve, reject) => {
          // let new_form_status = { ...form_status };
          // if (!new_form_status[action_input_form_values_key]) {
          //   new_form_status[action_input_form_values_key] = {};
          // }
          // new_form_status[action_input_form_values_key].is_submitting = true;
          // setFormStatus(new_form_status);
          // console.log("action", action);

          // Inside your form submit code, modify the mutation part:
          let new_form_status = { ...form_status };
          if (!new_form_status[action_input_form_values_key]) {
            new_form_status[action_input_form_values_key] = {};
          }
          new_form_status[action_input_form_values_key].is_submitting = true;
          setFormStatus(new_form_status);

          // Create the base mutation data

          // Create the base mutation data
          const baseData = {
            activeInput: activeInput,
            action: {
              operation: activeAction?.name,
              ...activeAction,
            },

            input_values: {
              action_input_form_values: {
                ...action_input_form_values[action_input_form_values_key],
                ...form.store.state.values, // Include current form values
              },
            },
            application: {
              id: activeApplication?.id,
              name: activeApplication?.name,
            },
            session: {
              id: params?.session_id || activeSession?.id,
              name: params?.session_id || activeSession?.name,
            },
            task: {
              id: params?.id || activeTask?.id,
              name: params?.id || activeTask?.name,
            },
            view: {
              id: params?.view_id || activeView?.id,
              name: params?.view_id || activeView?.name,
            },
            identity: identity,
            profile: {
              id: params?.profile_id || activeProfile?.id || identity?.email,
              name:
                params?.profile_id || activeProfile?.name || identity?.email,
            },
            parents: {
              task_id: params?.task_id || activeTask?.id,
              profile_id:
                params?.profile_id || activeProfile?.id || identity?.email,
              view_id: params?.view_id || activeView?.id,
              session_id: params?.id || activeSession?.id,
              application_id: params?.application_id || activeApplication?.id,
            },
          };

          // Check if we have attachments before creating FormData
          const hasAttachments =
            value.attachments &&
            Array.isArray(value.attachments) &&
            value.attachments.length > 0;

          let requestConfig = {};
          let requestValues;

          if (hasAttachments) {
            // Use FormData only when we have attachments
            const formData = new FormData();
            formData.append("data", JSON.stringify(baseData));

            Array.from(value.attachments).forEach((file: unknown) => {
              if (file instanceof File) {
                formData.append("attachments", file);
              }
            });

            requestConfig = {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            };
            requestValues = formData;
          } else {
            // Use regular JSON when no attachments
            requestConfig = {
              headers: {
                "Content-Type": "application/json",
              },
            };
            requestValues = baseData;
          }

          mutate(
            {
              url: `${config.API_URL}/${action_url}`,
              method: "post",
              values: requestValues,
              config: requestConfig,
            },
            {
              onError: (error) => {
                // console.error("Mutation error:", error);
                setRequestResponse(error);
                queryClient.setQueryData(["main_form_request"], error);
                reject(error);
                new_form_status[action_input_form_values_key].is_submitting =
                  false;
                setFormStatus(new_form_status);
              },
              onSuccess: (data) => {
                // success with error message i.e exit_code = 1 *object or list
                let response_data = data?.data;

                // First, let's ensure we have an array to work with
                const items = Array.isArray(response_data)
                  ? response_data
                  : [response_data];

                // console.log(items);

                // // Check if any item has exit_code = 1
                const errorItems = items.filter((item) => item.exit_code === 1);
                // console.log(errorItems);

                // Show error notification for each error item
                errorItems.forEach((item) => {
                  showNotification({
                    title: item?.message?.code,
                    message: JSON.stringify(item?.message?.details),
                    color: "red",
                    autoClose: 10000, // Giving more time to read error messages
                    // icon: <X size={18} />, // Optional: adds an X icon for errors
                    withCloseButton: true,
                    icon: <IconX size={18} />,
                    position: "top-center",
                  });
                });
                // console.log("Mutation success:", data);
                queryClient.setQueryData(["main_form_request"], data);
                resolve(data);
                new_form_status[action_input_form_values_key].is_submitting =
                  false;
                // console.log("hello");
                setFormStatus(new_form_status);
                // clear attachments so i don't have to send them again can just referenced uploaded items
                form.setFieldValue("attachments", null);
                // set views conditionally here depending on the execution_mode
                // get items with code == 'task_item'
                let taskItem = data?.data?.find
                  ? data?.data?.filter(
                      (item: any) => item?.message?.code === "task_item"
                    )?.[0]?.data
                  : {};
                // console.log("taskItem", taskItem);
                let taskActions = data?.data?.find
                  ? data?.data?.filter(
                      (item: any) => item?.message?.code === "save_actions"
                    )?.[0]?.data
                  : [];
                let messages = data?.data?.find
                  ? data?.data?.filter(
                      (item: any) => item?.message?.code === "messages"
                    )?.[0]?.data
                  : [];
                let initialize_message = data?.data?.find
                  ? data?.data?.filter(
                      (item: any) =>
                        item?.message?.code === "initialize_message"
                    )?.[0]?.data
                  : [];

                let display_items = [
                  ...(taskActions || []),
                  ...(messages || []),
                  ...(initialize_message || []),
                ];
                // console.log("taskActions");
                // console.log(taskActions);
                // console.log("messages");
                // console.log(messages);
                // console.log("initialize_message");
                // console.log(initialize_message);
                // console.log("display_items");
                // console.log(display_items);
                // // later account for multiple save_actions
                // console.log("display_items", display_items);
                // if (record?.entity_type === "actions") {
                //   toggleView(String(record?.id), record);
                // }

                let display_variables = [
                  taskItem?.variables?.execution_mode,
                  ...(taskItem?.variables?.on_queue || []),
                  ...(taskItem?.variables?.on_query || []),
                ];
                // console.log("display_variables");
                // console.log(display_variables);

                if (
                  display_variables.some((variable) =>
                    [
                      "display_message_after_query",
                      "display_results_after_query",
                      "display_message_after_queue",
                      "display_results_after_queue",
                    ].includes(variable)
                  )
                ) {
                  // console.log(
                  //   "taskItem?.variables?.execution_mode",
                  //   taskItem?.variables?.execution_mode
                  // );
                  display_items.map((record: any) => {
                    // console.log(item?.entity_type);
                    if (["messages"].includes(record?.entity_type)) {
                      toggleView(String(record?.id), record);
                    }
                  });
                }
              },
            }
          );
        });
      }
    },
  });

  // Effect to update form values when defaultValues change
  useEffect(() => {
    // Deep compare previous and current default values
    if (!_.isEqual(previousDefaultValuesRef.current, defaultValues)) {
      // Update form values for each changed field
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (!_.isEqual(previousDefaultValuesRef.current[key], value)) {
          form.setFieldValue(key, value);
        }
      });

      // Update the ref with new values
      previousDefaultValuesRef.current = defaultValues;
    }
  }, [defaultValues, form]);

  // const [templateUpdate, setTemplateUpdate] = useState(0);

  const debouncedLog = debounce((values) => {
    // render query if fields match
    // let view_fields = action_input_form_fields[action_input_form_fields_key];
    // let query_template =
    //   action_input_form_values[action_input_form_values_key]?.query_template;
    // let query = formatPythonTemplate(query_template, values);
    // // console.log(query);

    // let enriched_search_filters = enrichFilters(
    //   view_record?.data_model?.schema?.query_filters,
    //   values
    // );

    // console.log("enriched_search_filters");
    // console.log(enriched_search_filters);

    // let rendered_globalSearchQuery = buildSQLQuery(
    //   view_record?.query,
    //   sanitizeFilters(enriched_search_filters),
    //   { caseSensitive: false }
    // )?.query;

    // console.log("rendered_globalSearchQuery");
    // console.log(rendered_globalSearchQuery);
    // Parse the rendered_globalSearchQuery and extract syntax tree and fetch blocks
    // const { syntaxTree, fetchBlocks } = parseNSTLQuery(
    //   rendered_globalSearchQuery
    // );
    // console.log(`syntaxTree, ${syntaxTree}`);
    // console.log(`fetchBlocks, ${fetchBlocks}`);

    let new_action_input_form_values = {
      ...action_input_form_values,
      [action_input_form_values_key]: {
        ...action_input_form_values[action_input_form_values_key],
        ...values,
        // query_template: view_record?.query,
        // query: rendered_globalSearchQuery,
        // query: formatPythonTemplate(
        //   view_record?.query,
        //   action_input_values || {}
        // ),
      },
    };
    // setActionInputFormValues(new_action_input_form_values);
    // setActionInputFormFields(
    //   action_input_form_values_key,
    //   record?.content?.structured_content?.[0]?.arguments || []
    // );

    setActionInputFormValues(new_action_input_form_values);
  }, 300); // 300ms debounce delay, adjust as needed

  // Store the previous validity state
  const previousIsValid = useRef(false);

  // useEffect(() => {
  //   const unsubscribe = form.store.subscribe(() => {
  //     const currentValues = form.store.state.values;
  //     const isValid = form.store.state.isValid;

  //     // If form is valid, and the previous state was not valid or hasn't logged yet, log the values
  //     // if (isValid && !previousIsValid.current) {
  //     //   debouncedLog(currentValues);
  //     // }
  //     debouncedLog(currentValues);

  //     // Update the ref to track the current validity status for future reference
  //     previousIsValid.current = isValid;
  //   });

  //   return () => {
  //     unsubscribe();
  //     debouncedLog.cancel(); // Cancel any pending debounced calls on unmount
  //   };
  // }, [form.store, debouncedLog]);

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const currentValues = form.store.state.values;
      const isValid = form.store.state.isValid;

      // Only update if values actually changed
      if (
        !_.isEqual(
          action_input_form_values[action_input_form_values_key],
          currentValues
        )
      ) {
        const new_action_input_form_values = {
          ...action_input_form_values,
          [action_input_form_values_key]: currentValues, // Simplified update
        };
        setActionInputFormValues(new_action_input_form_values);
      }

      previousIsValid.current = isValid;
    });

    return () => {
      unsubscribe();
      debouncedLog.cancel();
    };
  }, [
    form.store,
    action_input_form_values,
    action_input_form_values_key,
    setActionInputFormValues,
  ]);

  // if a template field value changes, read the record from the server and update the form values
  // Fetch the template using the existing hook
  // Use useRef to store the previous value of the template
  // const previousTemplateValue = useRef<string | null>(null);

  // Extract the current template value from the form's state
  const currentTemplateValue = form.store.state.values.template;

  // Define the read record state for fetching the template
  let read_template_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: currentTemplateValue,
    record: { id: currentTemplateValue },
    read_record_mode: "remote",
  };

  // Fetch the template using the existing hook
  const {
    data: templateData,
    isLoading: templateIsLoading,
    error: templateError,
  } = useReadRecordByState(read_template_state);

  // Table name extraction logic integrated into debounced validation
  const debouncedValidation = debounce((value, resolve, reject) => {
    // const dbInstance = useDuckDB();
    // const { setTables } = useTableStore.getState();
    // dbInstance
    //   .query(`EXPLAIN ${value}`) // Validate the query
    //   .then((result: any) => {
    //     // Query is valid, resolve with no error
    //     resolve(undefined);
    //     // use simple regex to extract table names from the query value
    //     const tableRegex = /(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)/gi;
    //     const tables = [...value.matchAll(tableRegex)].map((match) => match[1]);
    //     console.log("Extracted tables:", tables);
    //     if (tables) {
    //       let new_global_query = { ...globalQuery };
    //       new_global_query["tables"] = tables;
    //       setGlobalQuery(new_global_query);
    //       // alert(`Extracted tables:, ${tables}`);
    //     }
    //     // // Store extracted table names in Zustand
    //     // setTables(tables);
    //     // console.log("Extracted tables:", tables);
    //   })
    //   .catch((error: any) => {
    //     const detailedErrorMessage = error.message || "Invalid SQL syntax"; // Detailed error message
    //     resolve(detailedErrorMessage); // Resolve with error message
    //   });
  }, 300);

  // Create a function that wraps debounced validation in a Promise
  const debouncedValidationPromise = (value: any) => {
    return new Promise((resolve, reject) => {
      debouncedValidation(value, resolve, reject); // Call the debounced function
    });
  };

  // Function to count active filters for the current form
  const getActiveFiltersCount = (formKey: string) => {
    const filterKey = `${formKey}_filter`;
    const formValues = filter_form_values[filterKey] || {};

    // Count fields that have a value and aren't null
    return Object.entries(formValues).reduce((count, [key, value]) => {
      // Only count main values, not operators or value2
      if (
        !key.includes("_operator") &&
        !key.includes("_value2") &&
        value !== null &&
        value !== ""
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  // Effect to handle template changes
  useEffect(() => {
    if (
      currentTemplateValue &&
      templateData &&
      !templateIsLoading &&
      !templateError
    ) {
      const templateRecord = templateData?.data?.find(
        (item: any) => item?.message?.code === currentTemplateValue
      )?.data[0];

      if (templateRecord) {
        // Batch update form values
        const keysToExclude = [
          "id",
          "author_id",
          "created_datetime",
          "updated_datetime",
          "deleted_datetime",
          "added_datetime",
          "author",
          "entity_type",
        ];

        const updates = Object.entries(templateRecord)
          .filter(([key]) => !keysToExclude.includes(key))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, any>);

        // Update each field individually since setValues is not available
        Object.entries(updates).forEach(([key, value]) => {
          form.setFieldValue(key, value);
        });

        // Update store values
        const new_action_input_form_values = {
          ...action_input_form_values,
          [action_input_form_values_key]: {
            ...action_input_form_values[action_input_form_values_key],
            ...templateRecord,
          },
        };
        setActionInputFormValues(new_action_input_form_values);

        // Update views
        const viewKey =
          templateRecord?.success_message_code
            ?.toLowerCase()
            .replace(/\s+/g, "_") ||
          templateRecord?.name?.toLowerCase().replace(/\s+/g, "_");
        setViews({ ...views, [viewKey]: templateRecord });
        setActiveTemplateRecord(templateRecord);
      }
    }
  }, [currentTemplateValue, templateData, templateIsLoading, templateError]);

  if (!data_model && !fields) return <div>No data model or fields </div>;
  // const { schema } = data_model;

  // Use useRef to keep a reference to the form instance
  const formRef = useRef(form);

  // Update formRef.current whenever form changes
  // useEffect(() => {
  //   formRef.current = form;
  // }, [form]);

  useEffect(() => {
    formRef.current = form;

    // Set form instance in store
    setFormInstance(formId, formRef.current);
    setFormSubmitHandler(formId, form.handleSubmit);

    return () => {
      setFormInstance(formId, undefined);
      setFormSubmitHandler(formId, undefined);
    };
  }, [formId, form, setFormInstance, setFormSubmitHandler]);

  // Set the form instance and submit handler in the store
  useEffect(() => {
    setFormSubmitHandler(formId, form.handleSubmit);
    setFormInstance(formId, formRef.current); // Use formRef.current for consistency

    return () => {
      // Cleanup when the form is unmounted
      setFormSubmitHandler(formId, undefined);
      setFormInstance(formId, undefined);
    };
  }, [formId, setFormSubmitHandler, setFormInstance]);

  // conditionally set include_items based on the name. read include items from the corresponding state variable. i.e query_mode.include_items for name = query
  // if data_model use the data_model.schema.required as the default include_items
  let include_items = fields
    ? fields?.map((field) => field?.title)
    : data_model?.schema?.required;

  // const dateParser: DateInputProps["dateParser"] = (input: string) => {
  //   // make sure to set time to 00:00:00
  //   return new Date(`${input}T00:00:00`); // Handles ISO string
  // };

  const dateParser: DateInputProps["dateParser"] = (input) => {
    if (input === "WW2") {
      return new Date(1939, 8, 1);
    }

    return dayjs(input, "DD/MM/YYYY").toDate();
  };

  // Helper function to determine which fields to include based on action_mode
  const getFieldsToInclude = (schema: any, action_mode: string) => {
    if (action_mode === "default") {
      return schema?.required || [];
    }
    return schema?.action_modes?.[action_mode] || [];
  };

  // const setActiveAccordionSections = (items: any) => {
  //   console.log(items);
  // };

  // Function to normalize schema properties into our fields format
  const normalizeSchemaFields = (schema: Schema): Field[] => {
    return Object.entries(schema.properties || {})
      .map(([key, prop]) => {
        // Type assertion here since we know the structure matches SchemaProperty
        const schemaProp = prop as SchemaProperty;
        return {
          ...schemaProp,
          key,
          fieldName: schemaProp.title?.toLowerCase().replace(/ /g, "_"),
        };
      })
      .sort((a, b) => {
        const idA = parseInt(a.id || "0", 10);
        const idB = parseInt(b.id || "0", 10);
        return idA - idB;
      });
  };

  // // Function to filter fields based on include_items and action_mode
  // const filterFields = (fields: Field[]): Field[] => {
  //   // const fieldsToInclude = getFieldsToInclude(data_model?.schema, action_mode);
  //   // const fieldsToInclude = include_items;
  //   if (data_model?.schema?.required) {
  //     return fields.filter(
  //       (field) => field.key && data_model?.schema?.required.includes(field.key)
  //     );
  //   }

  //   return fields;
  // };

  // Filter fields based on required fields in schema
  const filterFields = (fields: any) => {
    const requiredFields =
      view_record?.data_model?.schema?.required ||
      data_model?.schema?.required ||
      [];

    return fields.filter(
      (field: any) => field.key && requiredFields.includes(field.key)
    );
  };

  // Function to group fields by their group property
  const groupFields = (fields: Field[]): Record<string, Field[]> => {
    return fields.reduce((groups, field) => {
      const group = field.group || "main";
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
      return groups;
    }, {} as Record<string, Field[]>);
  };

  // Get normalized fields from either props or schema
  const normalizedFields = React.useMemo(() => {
    if (fields) {
      return fields.map((field, index) => ({
        ...field,
        key: field.key || `field-${index}`,
        fieldName:
          field.fieldName || field.title.toLowerCase().replace(/ /g, "_"),
      }));
    }
    const schema = view_record?.data_model?.schema || data_model?.schema;
    return schema ? normalizeSchemaFields(schema) : [];
  }, [fields, view_record?.data_model?.schema, data_model?.schema]);

  // // Filter and group the fields
  // const filteredFields = React.useMemo(
  //   () => filterFields(normalizedFields),
  //   [normalizedFields, include_items, action_mode]
  // );

  // const groupedFields = React.useMemo(
  //   () => groupFields(filteredFields),
  //   [filteredFields]
  // );
  // Filter and group the fields
  const filteredFields = React.useMemo(
    () => filterFields(normalizedFields),
    [normalizedFields]
  );

  const groupedFields = React.useMemo(
    () => groupFields(filteredFields),
    [filteredFields]
  );

  // let variables = [
  //   {
  //     label: "date",
  //     value: "date",
  //   },
  //   {
  //     label: "success_criteria",
  //     value: "success_criteria",
  //   },
  // ];

  // Render a single field
  const renderField = (fieldData: Field) => {
    const Component = getComponentByResourceType(fieldData.component);
    const fieldName =
      fieldData.name || fieldData?.title.toLowerCase().replace(/ /g, "_");

    return (
      <div key={fieldData.key || fieldData.title} className="mb-4">
        <form.Field
          name={fieldName}
          // validators={
          //   fieldName === "query"
          //     ? {
          //         onChangeAsync: async ({ value }) => {
          //           if (value) {
          //             const error = await debouncedValidationPromise(value);
          //             if (error) {
          //               return error as ValidationError;
          //             }
          //           }
          //           return undefined;
          //         },
          //       }
          //     : undefined
          // }
        >
          {(field) => (
            <>
              {["RangeSlider"].includes(fieldData.component) && (
                <div>{fieldData.label || fieldData.title}</div>
              )}
              <Component
                schema={fieldData}
                disabled={fieldData.readOnly}
                // value={
                //   fieldData.component === "DateInput" &&
                //   typeof field.state.value === "string"
                //     ? new Date(field.state.value)
                //     : field.state.value
                // }
                onBlur={field.handleBlur}
                action_input_form_values_key={action_input_form_values_key}
                form_id={formId}
                record={record}
                onChange={
                  [
                    "NumberInput",
                    "MonacoEditorFormInput",
                    "NaturalLanguageEditorFormInput",
                    "SearchInput",
                    "DateInput",
                    "MultiSelect",
                    "Select",
                    "FileInput",
                    "RangeSlider",
                  ].includes(fieldData.component)
                    ? field.handleChange
                    : (e: any) => field.handleChange(e?.target?.value)
                }
                form={form}
                isLoading={mutationIsLoading}
                {...(fieldData.props || {})}
                {...(!["MultiSelect", "DateInput"].includes(fieldData.component)
                  ? { value: field.state.value }
                  : {})}
                {...(["DateInput"].includes(fieldData.component) &&
                typeof field.state.value === "string"
                  ? { value: new Date(field.state.value) }
                  : {})}
                {...(fieldData.component === "MultiSelect"
                  ? {
                      data: Array.isArray(record[`${fieldData.title}_options`])
                        ? record[`${fieldData.title}_options`]
                        : [],
                      value: field.state.value || [],
                    }
                  : {})}
                {...(fieldData.component === "DateInput" ? { dateParser } : {})}
                {...(fieldData.component === "RangeSlider"
                  ? { label: (value: any) => `${value}` } // Remove the extra curly braces
                  : { label: fieldData.label || fieldData.title })}
              />
              {fieldName === "query" && <FieldInfo field={field} />}
              {/* {JSON.stringify(field.state.value)} */}
            </>
          )}
        </form.Field>
      </div>
    );
  };

  // Check if we should render the form based on required fields
  const hasRequiredFields =
    view_record?.data_model?.schema?.required?.length > 0 ||
    data_model?.schema?.required?.length > 0;

  if (!hasRequiredFields) return null;

  // const variables: Variable[] = [
  //   { value: "name", label: "Full Name", type: "string" },
  //   { value: "age", label: "Age", type: "number" },
  //   { value: "created_at", label: "Created Date", type: "datetime" },
  //   { value: "is_active", label: "Is Active", type: "boolean" },
  // ];

  const handleFilterChange = (output: FilterOutput) => {
    // console.log("Generated where clause:", whereClause);
    // if(whereClause){
    // }
    form.setFieldValue("variables_value", output.whereClause);
    form.setFieldValue("variables_output", output);
    // Do something with the where clause
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* {data_model?.schema?.required?.length === 1 &&
        (() => {
          const field_name = data_model?.schema?.required[0];
          const field = data_model?.schema?.properties?.[field_name];
          return field ? renderField(field) : null;
        })()} */}
      <div className="flex flex-col gap-2 p-3 h-[55vh]">
        {record?.variables_options?.length > 0 && (
          <div>
            {params?.id &&
              user_session?.userProfile?.permissions?.includes(
                "filter_action_input"
              ) && (
                <Tooltip
                  label={`${showVariables ? "hide" : "provide"} variables`}
                  key="variables"
                >
                  <Indicator
                    inline
                    label={getActiveFiltersCount(action_form_key)}
                    size={16}
                    disabled={getActiveFiltersCount(action_form_key) === 0}
                    color="blue"
                    offset={4}
                  >
                    <Button
                      size="compact-sm"
                      leftSection={<IconAdjustments size={20} />}
                      variant={showVariables ? "filled" : "outline"}
                      onClick={toggleVariables}
                    >
                      Variables
                    </Button>
                  </Indicator>
                </Tooltip>
              )}
            {showVariables && (
              <DynamicFilter
                variables={record?.variables_options?.filter((item: any) =>
                  (
                    action_input_form_values[action_input_form_values_key]
                      ?.variables || []
                  ).includes(item.value)
                )}
                action_form_key={action_form_key}
                onFilterChange={handleFilterChange}
              />
            )}
          </div>
        )}

        {hasRequiredFields &&
          data_model?.schema?.required.map((fieldName: string) => {
            const field = data_model?.schema?.properties?.[fieldName];
            if (
              ["variables", "variables_value"].includes(fieldName) &&
              !showVariables
            ) {
              return null;
            }
            return field ? renderField(field) : null;
          })}
      </div>
    </form>
  );
};

// export default ActionInput;

export const ActionInputWrapper: React.FC<ActionInputWrapperProps> = ({
  query_name,
  name,
  execution_record,
  action_type,
  entity,
  record,
  collection,
  record_query,
  exclude_components = [],
  children,
  data_model,
  nested_component,
  setExpandedRecordIds,
  success_message_code,
  invalidate_queries_on_submit_success,
  description,
  update_action_input_form_values_on_submit_success,
  endpoint,
  action_label,
  records,
  action,
  include_form_components,
  focused_item,
  read_record_mode,
  action_form_key,
}) => {
  // let data_model_state = {
  //   id: execution_record?.id,
  //   query_name: "data_model",
  //   name: data_model,
  //   action_type,
  //   entity,
  //   success_message_code,
  // };

  // record_data
  let read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: record?.id,
    record: record,
    read_record_mode: read_record_mode || "remote",
  };

  const {
    data: recordData,
    isLoading: recordIsLoading,
    error: recordError,
  } = useReadRecordByState(read_record_state);

  // data_model_data
  const data_model_query_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: data_model,
    name: data_model,
    id: data_model,
    query: `SELECT * FROM data_models WHERE name = '${data_model}'`,
    record: {
      name: data_model,
    },
    read_record_mode: "remote",
  };

  const {
    data: dataModelData,
    isLoading: dataModelIsLoading,
    error: dataModelError,
  } = useQueryByState(data_model_query_state);

  // if (dataModelError || recordError)
  //   return (
  //     <MonacoEditor
  //       value={{
  //         recordError: recordError?.response?.status,
  //         dataModelError: dataModelError?.response?.status,
  //       }}
  //       language="json"
  //       height="25vh"
  //     />
  //   );
  // if (dataModelIsLoading || recordIsLoading) return <div>Loading...</div>;
  let record_data = read_record_mode
    ? recordData
    : recordData?.data?.find((item: any) => item?.message?.code === record?.id)
        ?.data[0];
  // let data_model_data = dataModelData
  //   ? dataModelData?.data?.find(
  //       (item: any) =>
  //         item?.message?.code === data_model_state?.success_message_code
  //     )?.data[0]?.["data_model"]
  //   : {};

  // if (recordIsLoading || dataModelIsLoading) {
  //   return <>Loading...</> || null;
  // }
  if (dataModelError || recordError) {
    return (
      <MonacoEditor
        value={{
          recordError: recordError,
          dataModelError: dataModelError,
        }}
        height="25vh"
      ></MonacoEditor>
    );
  }
  let data_model_data = dataModelData?.data[0] || {};
  return (
    <div>
      {/* <MonacoEditor
        value={{
          // record: record,
          // recordData: recordData,
          // record_data: record_data,
          // data_model_data: data_model_data,
          record_data: record_data?.variables,
          // data: error?.response?.data,
          // status: error?.response?.status,
        }}
        language="json"
        height="25vh"
      /> */}
      <Box pos="relative">
        <LoadingOverlay
          visible={recordIsLoading || dataModelIsLoading}
          // visible={true}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        {(recordIsLoading || dataModelIsLoading) && (
          <div className="h-[75vh] flex items-center justify-center"></div>
        )}
        {record_data && data_model_data && (
          <ActionInputForm
            data_model={data_model_data}
            record={record_data}
            records={records}
            action={action}
            children={children}
            focused_item={focused_item}
            action_form_key={action_form_key}
          ></ActionInputForm>
        )}
      </Box>
    </div>
  );
};

export default ActionInputWrapper;

const sanitizeSheetName = (name: any) => {
  return (
    name
      // Convert to string in case of numbers or other types
      .toString()
      // Trim whitespace
      .trim()
      // Replace problematic Excel/Sheet special characters
      .replace(/[\*\?\:\/\\\[\]]/g, "")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Replace spaces with underscores
      .replace(/\s/g, "_")
      // Replace any remaining non-alphanumeric characters except underscores
      .replace(/[^a-zA-Z0-9_]/g, "")
      // Convert to lowercase for consistency
      .toLowerCase() ||
    // Handle case where string might be empty after sanitization
    "sheet"
  );
};

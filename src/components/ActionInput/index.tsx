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
  useFetchActionDataByName,
  useFetchActionStepDataByState,
  useFetchActionStepsDataByState,
  useFetchDataModelByState,
  useFetchQueryDataByState,
  useReadRecordByState,
  useSearchFilters,
} from "@components/Utils";
import { useAppStore, useTransientStore } from "src/store";
import { Accordion, Button, Title } from "@mantine/core";
import dayjs from "dayjs";
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
  useParsed,
} from "@refinedev/core";
import config from "src/config";
import { debounce, update } from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import ExternalSubmitButton from "@components/SubmitButton";
// import { initializeLocalDB } from "src/local_db";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useDuckDB } from "pages/_app";
import { showNotification } from "@mantine/notifications";
import { saveToLocalDB } from "src/local_db";
import React from "react";
import { IconFilter } from "@tabler/icons-react";

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
  action_form_key,
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
  } = useAppStore();
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { setFormSubmitHandler, setFormInstance } = useTransientStore();
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
  const { searchFilters } = useSearchFilters();
  const { params } = useParsed();
  let actionInputId = record?.id || params?.id;
  // let action_input_form_values_key =
  //   action_form_key || `${action || "query"}_${actionInputId}`;

  let action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
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
      mutationKey: [action_input_form_values_key],
    },
  });

  // get view_record for utilization across all action inputs
  // const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const fields = action_input_form_fields[action_input_form_values_key];

  const view_id = params?.view_id;
  const task_id = params?.task_id;
  const session_id = params?.session_id;

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
    (item: any) => item?.message?.code === view_id
  )?.data[0];

  const globalQuery =
    useAppStore(
      (state) =>
        state.action_input_form_values[`${action_input_form_values_key}`]?.query
    ) || view_record?.query; // use query as default if nothing is in the global store

  const identity_object = {
    author_id: identity?.email,
  };

  let active_view_search_model_state = {
    id: activeView?.id,
    query_name: "data_model",
    name: activeView?.["action_models"]?.["search"],
    success_message_code: "action_input_data_model_schema",
  };

  const {
    data: active_view_search_model_data,
    isLoading: active_view_search_model_isLoading,
    error: active_view_search_model_error,
  } = useFetchQueryDataByState(active_view_search_model_state);

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
  // Helper function to find field type from data_fields

  // First, modify the getFieldType helper to be more precise
  const getFieldType = (fieldName: string, fields: any[]) => {
    const field = fields.find((f) => f.name === fieldName);
    return field?.data_type?.toLowerCase() || null;
  };

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
        console.log("searchFilters", searchFilters);
        // alert(JSON.stringify(value));
        const fetchFromDuckDB = async () => {
          try {
            console.log(`globalQuery: ${globalQuery}`);
            // const conn = await initializeLocalDB();
            // let downloadQuery = "SELECT * FROM issues";
            // console.log(`Form values for ${formId}:`, value);
            // let downloadQuery = value?.query;
            // const search_action_input_form_values_key =
            //   action_form_key || `query_${activeView?.id}`;
            // console.log(search_action_input_form_values_key);
            // const search_action_input_form_values_key = `query_${
            //   params?.id || activeTask?.id
            // }`;

            // let search_action_input_form_values_key =
            //   action_input_form_values_key;
            // const globalSearchQuery =
            //   action_input_form_values[`${search_action_input_form_values_key}`]
            //     ?.query;
            // let active_view_search_model_data_data_model_search_filters =
            //   active_view_search_model_data?.data?.find(
            //     (item: any) =>
            //       item?.message?.code === "action_input_data_model_schema"
            //   )?.data[0]?.data_model?.schema?.search_filters;
            // // console.log("active_view_search_model_data_data_model_search_filters", active_view_search_model_data_data_model_search_filters)

            // let enriched_search_filters = enrichFilters(
            //   active_view_search_model_data_data_model_search_filters,
            //   globalQuery
            // );
            // console.log(
            //   "save enriched_search_filters",
            //   enriched_search_filters
            // );
            // let rendered_globalSearchQuery = buildSQLQuery(
            //   globalQuery,
            //   sanitizeFilters(enriched_search_filters),
            //   { caseSensitive: false }
            // )?.query;
            // console.log(
            //   "save rendererendered_globalSearchQuery",
            //   rendered_globalSearchQuery
            // );
            // // let downloadQuery =
            // //   rendered_globalSearchQuery || globalSearchQuery || value?.query;
            // let downloadQuery = rendered_globalSearchQuery || globalQuery; // fix later to include dynamic generation from above
            // console.log("Executing dowloadQuery:", downloadQuery);
            const downloadResult = await dbInstance.query(globalQuery);

            // Debugging logs
            console.log("Download result:", downloadResult);
            console.log("Download result schema:", downloadResult?.schema);
            console.log(
              "Download result schema fields:",
              downloadResult?.schema?.fields
            );

            const downloadData = downloadResult.toArray();
            // console.log("downloadData", downloadData);

            // Check if data exists
            if (!downloadData || downloadData.length === 0) {
              alert("No data available to download.");
              return;
            }

            // Ensure that downloadResult.schema and downloadResult.schema.fields are not undefined
            if (!downloadResult?.schema || !downloadResult?.schema?.fields) {
              console.error("Schema information is not available.");
              return;
            }

            // Extract column names from the query result schema fields
            const columnNames = downloadResult.schema.fields.map(
              (field: any) => field.name
            );

            console.log("column names", columnNames);
            console.log("view_record", view_record);

            // // Ensure the data is an array of arrays
            // const dataWithHeaders = [
            //   columnNames,
            //   ...downloadData.map((row: any) => Object.values(row)),
            // ];

            // Step 1: Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`${value?.name}`);

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
                width: fieldType === "datetime" ? 25 : 20,
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
            worksheet.columns.forEach((column, index) => {
              const header = columnNames[index];
              column.width = calculateColumnWidth(header);
            });
            // Also modify the column definition part to set proper width for datetime columns:
            worksheet.columns = columnNames.map((col: any) => {
              const field = downloadResult.schema.fields.find(
                (f: any) => f.name === col
              );
              return {
                header: col,
                key: col,
                width: field?.type === "datetime" ? 25 : 20, // Make datetime columns wider
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
              id: value?.name || "Sheet Name",
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
            saveAs(blob, `${value?.name}.xlsx`);

            // Step 7: Show success notification after saving
            setTimeout(() => {
              showNotification({
                title: "Saved successfully",
                message: `${value?.name}.xlsx excel file created successfully.`,
                color: "green",
                autoClose: 2000, // Close notification after 2 seconds
              });
            }, 500); // Small delay to ensure file save is triggered first

            console.log(
              `${value?.name}.xlsx excel file created and downloaded successfully.`
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
        let spreadsheet_type = [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        let file = value?.file;
        let file_type = file?.type;
        if (spreadsheet_type.includes(file_type)) {
          try {
            const jsonData = await excelToStandardizedJson(
              file,
              value?.section
            );
            console.log("Standardized JSON data:", jsonData);

            if (jsonData.length === 0) {
              throw new Error("No data found in the Excel file");
            }

            let init_new_uploaded = {
              ...uploaded,
              data: null,
            };
            setUploaded(init_new_uploaded);

            // Infer data types
            const dataFields = inferDataTypes(jsonData);
            // console.log("Inferred data fields:", dataFields);
            // set inferred data fields in the store
            // Set the updated state after a delay
            setTimeout(() => {
              let new_uploaded = {
                ...uploaded,
                data_fields: dataFields,
                data: jsonData.length > 0 ? jsonData.length : null,
              };
              setUploaded(new_uploaded);
            }, 1000); // 500ms delay, adjust as needed

            // Insert the JSON data into a DuckDB table
            const tableName = "uploaded_data"; // Use the provided name or a default
            // await insertJsonIntoDuckDB(dbInstance, jsonData, tableName);
            await saveToLocalDB(jsonData, tableName, dataFields, dbInstance);

            // Optionally, you can query the data to verify it was inserted correctly
            // const result = await dbInstance.query(`SELECT * FROM "${tableName}" LIMIT 5`);
            // console.log("Sample data from DuckDB table:", result);

            // Show success notification
            showNotification({
              title: "Upload successful",
              message: `Data from ${file.name} has been uploaded and inserted into table: ${tableName}`,
              color: "green",
              autoClose: 5000,
            });
          } catch (error) {
            console.error(
              "Error processing Excel file or inserting into DuckDB:",
              error
            );
            showNotification({
              title: "Upload failed",
              message: `Error: ${JSON.stringify(error)}`,
              color: "red",
              autoClose: 5000,
            });
          }
        } else {
          showNotification({
            title: "Invalid file type",
            message: "Please upload an Excel file (.xlsx)",
            color: "red",
            autoClose: 5000,
          });
        }
        // console.log("value", value);
      } else {
        return new Promise((resolve, reject) => {
          // let include_execution_orders = [];
          // // if action is save then include the execution_order value for the record
          // if (action === "save") {
          //   // include_execution_orders = [record?.execution_order || 1];
          //   console.log("implement save action");
          // } else {
          //   include_execution_orders = selectedRecords[
          //     `${action_input_form_values_key}`
          //   ]?.map((item: any) => item?.index) || [1];
          // }
          // set form status
          let new_form_status = { ...form_status };
          // if form status for action_input_form_values_key is not set then set it
          if (!new_form_status[action_input_form_values_key]) {
            new_form_status[action_input_form_values_key] = {};
          }
          // set is_submitting value to true
          new_form_status[action_input_form_values_key].is_submitting = true;
          setFormStatus(new_form_status);
          console.log("action", action);
          mutate(
            {
              // url: `${config.API_URL}/catch-${
              //   data_model?.name === "action_step_any" ? "any" : "action"
              // }`,
              // url: `${config.API_URL}/${endpoint ? endpoint : "execute-task"}`,
              url: `${config.API_URL}/${action_url}`,
              method: "post",
              // ...(action === "save" && {
              //   config: {
              //     headers: {
              //       responseType: "blob",
              //     },
              //   },
              // }),
              values: {
                action: activeAction,
                input_values: {
                  // ...value,
                  action_input_form_values:
                    action_input_form_values[action_input_form_values_key] ||
                    {},
                },
                // action_mode: {
                //   name: action_mode,
                //   id: "tasks:maigldp650smirgmie97",
                //   response_model: "ProposedSQLCodeResponse",
                //   entity_type: "sql",
                // },
                agent: activeAgent,
                // action_modes: action_modes,
                // credential: value?.credential || "surrealdb catchmytask dev",
                // data_model: data_model,
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
                event: {
                  name: action,
                },
                automation: {
                  frequency: "every 20 seconds",
                },
                view: {
                  id: params?.view_id || activeView?.id,
                  name: params?.view_id || activeView?.name,
                },
                profile: {
                  id:
                    params?.profile_id || activeProfile?.id || identity?.email,
                  name:
                    params?.profile_id ||
                    activeProfile?.name ||
                    identity?.email,
                },
                parents: {
                  task_id: params?.id || activeTask?.id,
                  profile_id:
                    params?.profile_id || activeProfile?.id || identity?.email,
                  view_id: params?.view_id || activeView?.id,
                  session_id: params?.session_id || activeSession?.id,
                  application_id: activeApplication?.id,
                },
              },
            },
            {
              onError: (error, variables, context) => {
                // console.log("onError", error);
                reject(error);
                // set is_submitting value to false
                new_form_status[action_input_form_values_key].is_submitting =
                  false;
                setFormStatus(new_form_status);
              },
              onSuccess: (data, variables, context) => {
                if (action === "query") {
                  // let activity_state = {
                  //   // id: record?.id,
                  //   query_name: "read activity",
                  //   task_id: activeTask?.id,
                  //   session_id: activeSession?.id,
                  //   view_id: activeView?.id,
                  //   success_message_code: "activity",
                  // };
                  // let query_key = `useFetchQueryDataByState_${JSON.stringify(
                  //   activity_state
                  // )}`;
                  queryClient.invalidateQueries({
                    queryKey: [activeInvalidateQueryKey],
                  });
                  console.log("invalidated", activeInvalidateQueryKey);
                }

                //   resolve(data);
                // }
                resolve(data);
                // set is_submitting value to false
                new_form_status[action_input_form_values_key].is_submitting =
                  false;
                setFormStatus(new_form_status);
              },
            }
          );
        });
      }
    },
  });

  // const [templateUpdate, setTemplateUpdate] = useState(0);

  const debouncedLog = debounce((values) => {
    // render query if fields match
    // let view_fields = action_input_form_fields[action_input_form_fields_key];
    // let query_template =
    //   action_input_form_values[action_input_form_values_key]?.query_template;
    // let query = formatPythonTemplate(query_template, values);
    // // console.log(query);

    let enriched_search_filters = enrichFilters(
      view_record?.data_model?.schema?.query_filters,
      values
    );

    console.log(enriched_search_filters);

    let rendered_globalSearchQuery = buildSQLQuery(
      view_record?.query,
      sanitizeFilters(enriched_search_filters),
      { caseSensitive: false }
    )?.query;

    let new_action_input_form_values = {
      ...action_input_form_values,
      [action_input_form_values_key]: {
        ...action_input_form_values[action_input_form_values_key],
        ...values,
        query_template: view_record?.query,
        query: rendered_globalSearchQuery,
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

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const currentValues = form.store.state.values;
      const isValid = form.store.state.isValid;

      // If form is valid, and the previous state was not valid or hasn't logged yet, log the values
      // if (isValid && !previousIsValid.current) {
      //   debouncedLog(currentValues);
      // }
      debouncedLog(currentValues);

      // Update the ref to track the current validity status for future reference
      previousIsValid.current = isValid;
    });

    return () => {
      unsubscribe();
      debouncedLog.cancel(); // Cancel any pending debounced calls on unmount
    };
  }, [form.store, debouncedLog]);

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

  // const debouncedValidation = debounce(async (value) => {
  //   try {
  //     await dbInstance.query(`EXPLAIN ${value}`); // Run a lightweight query to check syntax
  //     return undefined; // No errors, query is valid
  //   } catch (error) {
  //     return "Invalid SQL syntax"; // Return error message
  //   }
  // }, 300); // Adjust debounce time as needed
  // Create a debounced validation function using a wrapper to return a Promise
  // const debouncedValidation = debounce((value, resolve, reject) => {
  //   dbInstance
  //     .query(`EXPLAIN ${value}`)
  //     .then(() => resolve(undefined)) // Query is valid, resolve with no error
  //     .catch((error) => {
  //       const detailedErrorMessage = error.message || "Invalid SQL syntax"; // Detailed error
  //       resolve(detailedErrorMessage); // Resolve with error message
  //     });
  // }, 300);
  // Table name extraction logic integrated into debounced validation
  const debouncedValidation = debounce((value, resolve, reject) => {
    // const dbInstance = useDuckDB();
    // const { setTables } = useTableStore.getState();

    dbInstance
      .query(`EXPLAIN ${value}`) // Validate the query
      .then((result: any) => {
        // Query is valid, resolve with no error
        resolve(undefined);
        // use simple regex to extract table names from the query value
        const tableRegex = /(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)/gi;
        const tables = [...value.matchAll(tableRegex)].map((match) => match[1]);
        console.log("Extracted tables:", tables);

        if (tables) {
          let new_global_query = { ...globalQuery };
          new_global_query["tables"] = tables;
          setGlobalQuery(new_global_query);
          // alert(`Extracted tables:, ${tables}`);
        }
        // // Store extracted table names in Zustand
        // setTables(tables);
        // console.log("Extracted tables:", tables);
      })
      .catch((error: any) => {
        const detailedErrorMessage = error.message || "Invalid SQL syntax"; // Detailed error message
        resolve(detailedErrorMessage); // Resolve with error message
      });
  }, 300);

  // Create a function that wraps debounced validation in a Promise
  const debouncedValidationPromise = (value: any) => {
    return new Promise((resolve, reject) => {
      debouncedValidation(value, resolve, reject); // Call the debounced function
    });
  };

  useEffect(() => {
    // Only make the call if the template value has changed and is not null/undefined
    if (currentTemplateValue) {
      // Update the previous template value
      // previousTemplateValue.current = currentTemplateValue;

      // Check if data is fully fetched and available
      if (templateData && !templateIsLoading && !templateError) {
        const templateRecord = templateData?.data?.find(
          (item: any) => item?.message?.code === currentTemplateValue
        )?.data[0];

        if (templateRecord) {
          console.log(
            "Fetched Template data before setting form values:",
            templateRecord
          );
          // form.setFieldValue("name", templateRecord.name ?? "");
          // form.setFieldValue("query", templateRecord.query ?? "");
          // setTemplateUpdate((prev) => prev + 1);
          // set field values in bulk
          let keysToExclude = [
            "id",
            "author_id",
            "created_datetime",
            "updated_datetime",
            "deleted_datetime",
            "added_datetime",
            "author",
            "entity_type",
          ];
          Object.entries(templateRecord).forEach(([key, value]) => {
            if (!keysToExclude.includes(key)) {
              form.setFieldValue(key, value);
            }
          });
          // setViews
          let new_views = { ...views };
          // key is the value of success_message_code or name on the template in all lower case and underscored
          let key = templateRecord?.success_message_code
            ? templateRecord?.success_message_code
                .toLowerCase()
                .replace(/\s+/g, "_")
            : templateRecord?.name.toLowerCase().replace(/\s+/g, "_");
          new_views[key] = templateRecord;
          setViews(new_views);
          // also set active template
          setActiveTemplateRecord(templateRecord);
          // set activeaction to actually trigger global query change
          let new_action_input_form_values = {
            ...action_input_form_values,
            [action_input_form_values_key]: {
              ...action_input_form_values[action_input_form_values_key],
              ...templateRecord,
            },
          };
          setActionInputFormValues(new_action_input_form_values);
        }
      } else if (templateError) {
        console.error("Error fetching template data:", templateError);
      }
    }
  }, [
    currentTemplateValue,
    templateData,
    templateIsLoading,
    templateError,
    form,
  ]);

  if (!data_model && !fields) return <div>No data model or fields </div>;
  // const { schema } = data_model;

  // Use useRef to keep a reference to the form instance
  const formRef = useRef(form);

  // Update formRef.current whenever form changes
  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
  // const normalizedFields = React.useMemo(() => {
  //   if (fields) {
  //     // If fields are provided directly, ensure they have keys
  //     return fields.map((field, index) => ({
  //       ...field,
  //       key: field.key || `field-${index}`,
  //       fieldName:
  //         field.fieldName || field.title.toLowerCase().replace(/ /g, "_"),
  //     }));
  //   }
  //   return data_model?.schema ? normalizeSchemaFields(data_model?.schema) : [];
  //   // return normalized_schema_fields.filter(
  //   //   (item) => item?.key == data_model?.schema?.required?.
  //   // );
  // }, [fields, data_model?.schema]);

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

  // Render a single field
  const renderField = (fieldData: Field) => {
    const Component = getComponentByResourceType(fieldData.component);
    const fieldName =
      fieldData.fieldName || fieldData.title.toLowerCase().replace(/ /g, "_");

    return (
      <div key={fieldData.key || fieldData.title} className="mb-4">
        <form.Field
          name={fieldName}
          validators={
            fieldName === "query"
              ? {
                  onChangeAsync: async ({ value }) => {
                    if (value) {
                      const error = await debouncedValidationPromise(value);
                      if (error) {
                        return error as ValidationError;
                      }
                    }
                    return undefined;
                  },
                }
              : undefined
          }
        >
          {(field) => (
            <>
              <Component
                schema={fieldData}
                disabled={fieldData.readOnly}
                label={fieldData.label || fieldData.title}
                value={
                  fieldData.component === "DateInput" &&
                  typeof field.state.value === "string"
                    ? new Date(field.state.value)
                    : field.state.value
                }
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
                  ].includes(fieldData.component)
                    ? field.handleChange
                    : (e: any) => field.handleChange(e?.target?.value)
                }
                form={form}
                isLoading={mutationIsLoading}
                {...(fieldData.props || {})}
                {...(fieldData.component === "DateInput" ? { dateParser } : {})}
              />
              {fieldName === "query" && <FieldInfo field={field} />}
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* <div>form</div> */}
      {/* <MonacoEditor
        value={{
          // fields: fields,
          // normalizedFields: normalizedFields,
          // filteredFields: filteredFields,
          // groupedFields: groupedFields,
          formId: formId,
          // action_input_form_values_key: action_input_form_values_key,
          // action: action,
          // include_items: include_items,
          // view_record: view_record,
          // data_model: data_model?.schema.required.length,
        }}
        language="json"
        height="25vh"
      /> */}

      {/* {view_record?.data_model?.schema.required.length > 0 && (
        <Accordion defaultValue={["main"]} multiple={true}>
          {Object.entries(groupedFields).map(([groupName, groupFields]) => (
            <Accordion.Item value={groupName} key={groupName}>
              <Accordion.Control>
                {`${data_model?.name || ""} ${
                  data_model?.name ? "/" : ""
                } ${groupName}`}
              </Accordion.Control>
              <Accordion.Panel>
                {groupFields.map((field) => renderField(field))}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )} */}

      <Accordion defaultValue={[]} multiple={true}>
        {Object.entries(groupedFields).map(([groupName, groupFields]) => (
          <Accordion.Item value={groupName} key={groupName}>
            <Accordion.Control>
              <div className="flex items-center gap-3">
                <IconFilter size={16}></IconFilter>
                {`${view_record?.data_model?.name || data_model?.name || ""} ${
                  view_record?.data_model?.name || data_model?.name ? "/" : ""
                } filters`}
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              {groupFields.map((field) => renderField(field))}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      {activeAgent ||
        (data_model?.schema?.required &&
          data_model?.schema.required.length === 1 &&
          // Agent view - only show first required field
          (() => {
            // const field = filteredFields.find(
            //   (f) => f.key && data_model?.schema?.required?.includes(f.key)
            // );
            const field = data_model?.schema?.properties?.description;
            return field ? renderField(field) : null;
          })())}

      {/* {!activeAgent && data_model?.schema.required.length !== 1 && (
        <Accordion defaultValue={["main"]} multiple={true}>
          {Object.entries(groupedFields).map(([groupName, groupFields]) => (
            <Accordion.Item value={groupName} key={groupName}>
              <Accordion.Control>
                {`${data_model?.name || ""} ${
                  data_model?.name ? "/" : ""
                } ${groupName}`}
              </Accordion.Control>
              <Accordion.Panel>
                {groupFields.map((field) => renderField(field))}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )} */}
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
  record_query,
  exclude_components = [],
  children,
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
  let state = {
    id: execution_record?.id,
    query_name,
    name,
    action_type,
    entity,
    success_message_code,
  };
  let read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: record?.id,
    record: record,
    read_record_mode: read_record_mode || "remote",
  };

  const { data, isLoading, error } = useFetchQueryDataByState(state);
  const {
    data: recordData,
    isLoading: recordIsLoading,
    error: recordError,
  } = useReadRecordByState(read_record_state);

  if (error)
    return (
      <MonacoEditor
        value={{
          data: error?.response?.data,
          status: error?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div>
        {(!data?.data && !error && !isLoading && description) || null}

        {data?.data && query_name && (
          <ActionInputForm
            data_model={
              data?.data?.find(
                (item: any) => item?.message?.code === success_message_code
              )?.data[0]?.data_model
            }
            record={
              read_record_mode
                ? recordData
                : recordData?.data?.find(
                    (item: any) => item?.message?.code === record?.id
                  )?.data[0]
            }
            records={records}
            action={action}
            children={children}
            focused_item={focused_item}
            action_form_key={action_form_key}
          ></ActionInputForm>
        )}
      </div>
    </>
  );
};

export default ActionInputWrapper;

export const ActionStepsActionInputForm: React.FC<
  ActionStepsActionInputFormProps
> = ({
  action_steps,
  name,
  children,
  nested_component,
  action_icon,
  success_message_code,
  exclude_components,
}: ActionStepsActionInputFormProps) => {
  let state = {
    action_steps,
  };
  const { data, isLoading, error } = useFetchActionStepsDataByState(state);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error fetching action step data {JSON.stringify(error)}</div>;
  }
  return (
    <>
      {/* <div>{JSON.stringify(action_steps)}</div> */}
      {data?.data && (
        <ActionInputForm
          data_model={
            data?.data?.find(
              (item: any) => item?.message?.code === success_message_code
            )?.data[0]?.data_model
          }
          // record={record}
          execlude_components={exclude_components}
          name={name}
          children={children}
          nested_component={nested_component}
          // records={records}
          // action_icon={action_icon}
          // setExpandedRecordIds={setExpandedRecordIds}
        ></ActionInputForm>
      )}
    </>
  );
};

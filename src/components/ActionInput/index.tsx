import {
  buildSQLQuery,
  enrichFilters,
  extractDefaultValues,
  extractIdentifier,
  extractLabelsFromDefaults,
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
import type { FieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { Children, useEffect, useRef, useState } from "react";
import {
  ActionInputWrapperProps,
  ActionStepsActionInputFormProps,
  ComponentKey,
  DynamicFormProps,
  IIdentity,
} from "@components/interfaces";
import {
  BaseRecord,
  HttpError,
  useCustomMutation,
  useGetIdentity,
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

type ValidationError = string;

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em style={{ color: "red" }}>{field.state.meta.errors.join(",")}</em>
      ) : field.state.meta.isValidating ? (
        "Validating..."
      ) : (
        !field.state.meta.errors.length && (
          <em style={{ color: "green" }}>Looks good!</em>
        )
      )}
    </>
  );
}

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

// Utility function to calculate column width based on header length
const calculateColumnWidth = (header: any) => {
  return Math.max(header.length + 8, 15); // Add padding and set a minimum width
};

async function excelToStandardizedJson(
  file: File,
  section?: string
): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  let worksheet;
  if (section) {
    worksheet = workbook.getWorksheet(section);
    if (!worksheet) {
      throw new Error(`Worksheet "${section}" not found in the Excel file.`);
    }
  } else {
    worksheet = workbook.getWorksheet(1);
  }

  const jsonData: any[] = [];

  // Get headers and standardize them
  const headers = worksheet?.getRow(1).values as string[];
  const standardizedHeaders = headers
    .map((header) =>
      header
        ? header
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "")
        : ""
    )
    .filter(Boolean);

  // Process each row
  worksheet?.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip header row
      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = standardizedHeaders[colNumber - 1];
        if (header) {
          switch (cell.type) {
            case ExcelJS.ValueType.Date:
              rowData[header] =
                cell.value instanceof Date ? cell.value.toISOString() : null;
              break;
            // case ExcelJS.ValueType.Hyperlink:
            //   rowData[header] = (cell.value as ExcelJS.CellHyperlink).text || null;
            //   break;
            case ExcelJS.ValueType.Number:
              rowData[header] = Number(cell.value);
              break;
            case ExcelJS.ValueType.Boolean:
              rowData[header] = Boolean(cell.value);
              break;
            case ExcelJS.ValueType.Null:
              rowData[header] = null;
              break;
            default:
              rowData[header] = cell.text || null;
          }
        }
      });
      jsonData.push(rowData);
    }
  });

  return jsonData;
}

export const ActionInputForm: React.FC<DynamicFormProps> = ({
  data_model,
  record = {},
  action,
  setExpandedRecordIds,
  success_message_code = "query_success_results",
  endpoint,
  records,
  focused_item,
}) => {
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { setFormSubmitHandler, setFormInstance } = useTransientStore();
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
  const { searchFilters } = useSearchFilters();

  // Generate the ID once and persist it across re-renders
  // const generatedIdRef = useRef(uuidv4());

  // Access the persisted ID using generatedIdRef.current
  // const generatedId = generatedIdRef.current;
  // const actionInputId =
  //   record?.id || data_model?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  let actionInputId = record?.id;
  let action_input_form_values_key = `${action}_${actionInputId}`;
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

  const {
    activeSession,
    activeAction,
    activeApplication,
    activeTask,
    setActionInputFormValues,
    action_input_form_values,
    focused_entities,
    setFocusedEntities,
    selectedRecords,
    activeLayout,
    setActiveLayout,
    globalQuery,
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
  } = useAppStore();

  const identity_object = {
    author_id: identity?.email,
  };

  // let standardized_data_model_name = data_model?.name
  //   ?.replace(/\s+/g, "_")
  //   .toLowerCase();

  // Create the key with the transformed data_model.name
  // const action_input_form_values_key =
  //   action === "proceed_execute_with_action_input"
  //     ? "action_input"
  //     : `${action}_${standardized_data_model_name}_${actionInputId}`;

  // const action_input_form_values_key = `${action}_action_input`;
  // if focused_item == "actin_input" then use the action_input key
  // let action_input_form_values_key = "";
  // if (focused_item === "action_input") {
  //   action_input_form_values_key = "action_input";
  // } else {
  //   action_input_form_values_key = `${action}_action_input_${actionInputId}`;
  // }

  // let standardized_data_model_name = data_model?.name
  // ?.replace(/\s+/g, "_")
  // .toLowerCase();

  // Create the key with the transformed data_model.name
  // const proceed_action_input_form_values_key = `proceed_execute_with_action_input_${standardized_data_model_name}_${actionInputId}`;
  // const proceed_action_input_form_values_key = "action_input";

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
      let action_url = action;
      let agent_actions = ["search", "query"];
      if (agent_actions.includes(action)) {
        action_url = "agent";
      }

      // if action is not special then perform the following otherwise alert the action name
      if (action === "save") {
        console.log("searchFilters", searchFilters);
        // alert(JSON.stringify(value));
        const fetchFromDuckDB = async () => {
          try {
            // const conn = await initializeLocalDB();
            // let downloadQuery = "SELECT * FROM issues";
            // console.log(`Form values for ${formId}:`, value);
            // let downloadQuery = value?.query;
            const search_action_input_form_values_key = `query_${activeView?.id}`;
            const globalSearchQuery =
              action_input_form_values[`${search_action_input_form_values_key}`]
                ?.query;
            let active_view_search_model_data_data_model_search_filters =
              active_view_search_model_data?.data?.find(
                (item: any) =>
                  item?.message?.code === "action_input_data_model_schema"
              )?.data[0]?.data_model?.schema?.search_filters;
            // console.log("active_view_search_model_data_data_model_search_filters", active_view_search_model_data_data_model_search_filters)

            let enriched_search_filters = enrichFilters(
              active_view_search_model_data_data_model_search_filters,
              action_input_form_values[`${search_action_input_form_values_key}`]
            );
            console.log(
              "save enriched_search_filters",
              enriched_search_filters
            );
            let rendered_globalSearchQuery = buildSQLQuery(
              globalSearchQuery,
              sanitizeFilters(enriched_search_filters),
              { caseSensitive: false }
            )?.query;
            console.log(
              "save rendererendered_globalSearchQuery",
              rendered_globalSearchQuery
            );
            let downloadQuery =
              rendered_globalSearchQuery || globalSearchQuery || value?.query;
            console.log("Executing dowloadQuery:", downloadQuery);
            const downloadResult = await dbInstance.query(downloadQuery);

            // Debugging logs
            console.log("Download result:", downloadResult);
            console.log("Download result schema:", downloadResult?.schema);
            console.log(
              "Download result schema fields:",
              downloadResult?.schema?.fields
            );

            const downloadData = downloadResult.toArray();

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
              const fieldType = getFieldType(col, record.fields);
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

            // Step 3: Convert BigInt values and Add data rows
            // downloadData.forEach((row: any) => {
            //   const convertedRow = Object.fromEntries(
            //     Object.entries(row).map(([key, value]) => {
            //       if (typeof value === "bigint") {
            //         return [key, value.toString()]; // Convert BigInt to string
            //       }
            //       return [key, value];
            //     })
            //   );
            //   worksheet.addRow(convertedRow);
            // });

            // Modify the data rows part
            // downloadData.forEach((row: any) => {
            //   const convertedRow = Object.fromEntries(
            //     Object.entries(row).map(([key, value]) => {
            //       // Handle BigInt
            //       if (typeof value === "bigint") {
            //         return [key, value.toString()];
            //       }

            //       // Check if field is datetime
            //       const fieldType = getFieldType(key, record?.fields);
            //       if (fieldType === "datetime" && value) {
            //         // Parse the date string and create a proper Excel date
            //         const date = new Date(value + "Z"); // Append Z to treat as UTC
            //         return [key, date];
            //       }

            //       return [key, value];
            //     })
            //   );

            //   const newRow = worksheet.addRow(convertedRow);

            //   // Apply date format to datetime columns
            //   columnNames.forEach((colName: string, index: number) => {
            //     const fieldType = getFieldType(colName, record?.fields);
            //     if (fieldType === "datetime") {
            //       const cell = newRow.getCell(index + 1);
            //       cell.numFmt = "yyyy-mm-dd hh:mm:ss";
            //     }
            //   });
            // });
            // 2. Data row handling
            downloadData.forEach((row: any) => {
              const convertedRow = Object.fromEntries(
                Object.entries(row).map(([key, value]) => {
                  // Handle BigInt
                  if (typeof value === "bigint") {
                    return [key, value.toString()];
                  }

                  // Check if field is datetime
                  const fieldType = getFieldType(key, record.fields);
                  if (fieldType === "datetime" && value) {
                    try {
                      // Handle different date string formats
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        return [key, date];
                      }
                    } catch (error) {
                      console.warn(
                        `Failed to parse date for column ${key}:`,
                        value
                      );
                      return [key, value]; // Keep original value if parsing fails
                    }
                  }

                  return [key, value];
                })
              );

              const newRow = worksheet.addRow(convertedRow);

              // Apply date format to datetime columns
              columnNames.forEach((colName: string, index: number) => {
                const fieldType = getFieldType(colName, record.fields);
                if (fieldType === "datetime") {
                  const cell = newRow.getCell(index + 1);
                  if (cell.value) {
                    // Only set format if there's a value
                    cell.numFmt = "yyyy-mm-dd hh:mm:ss";
                  }
                }
              });
            });

            // Modify the part where you add data rows (replace the existing downloadData.forEach block):
            // downloadData.forEach((row: any) => {
            //   const convertedRow = Object.fromEntries(
            //     Object.entries(row).map(([key, value]) => {
            //       // Handle BigInt
            //       if (typeof value === "bigint") {
            //         return [key, value.toString()];
            //       }

            //       // Find the field definition from schema
            //       const field = downloadResult.schema.fields.find(
            //         (f: any) => f.name === key
            //       );

            //       // Format date if it's a datetime field
            //       return [key, formatDateForExcel(value, field)];
            //     })
            //   );

            //   const newRow = worksheet.addRow(convertedRow);

            //   // Apply date format to datetime columns
            //   downloadResult.schema.fields.forEach(
            //     (field: any, index: number) => {
            //       if (field.type === "datetime") {
            //         const cell = newRow.getCell(index + 1);
            //         cell.numFmt = "yyyy-mm-dd hh:mm:ss";
            //       }
            //     }
            //   );
            // });

            console.log(
              "activeView to use in save, the record will be the active view being read directly from react query",
              record
            );

            record.fields.forEach((field: any) => {
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
            // worksheet.columns = columnNames.map((col: any) => {
            //   const field = downloadResult.schema.fields.find(
            //     (f: any) => f.name === col
            //   );
            //   return {
            //     header: col,
            //     key: col,
            //     width: field?.type === "datetime" ? 25 : 20, // Make datetime columns wider
            //     style:
            //       field?.type === "datetime"
            //         ? { numFmt: "yyyy-mm-dd hh:mm:ss" }
            //         : {},
            //   };
            // });

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
                action: {
                  id: action || activeAction?.id,
                  name: action || activeAction?.name,
                },
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
                action_modes: action_modes,
                // credential: value?.credential || "surrealdb catchmytask dev",
                // data_model: data_model,
                application: {
                  id: activeApplication?.id,
                  name: activeApplication?.name,
                  profile_id: activeApplication?.profile_id,
                },
                session: {
                  id: activeSession?.id,
                  name: activeSession?.name,
                  profile_id: activeSession?.profile_id,
                },
                task: {
                  id: activeTask?.id,
                  name: activeTask?.name,
                  profile_id: activeTask?.profile_id,
                },
                view: {
                  id: activeView?.id,
                  name: activeView?.name,
                  profile_id: activeView?.profile_id,
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
                // const extendedData = data as CustomMutationResponse<any>;
                // // Extract the headers and content data
                // const contentDisposition =
                //   extendedData?.headers?.["content-disposition"];
                // // console.log("Content Disposition:", contentDisposition);
                // const contentType = extendedData?.headers?.["content-type"];

                // // console.log("Content Type:", contentType);
                // // console.log("Extended Headers:", extendedData?.headers);
                // // Check if the response is for a file download
                // if (
                //   contentDisposition &&
                //   contentDisposition.includes("attachment")
                // ) {
                //   // Create a JSON blob and trigger download
                //   // const jsonBlob = new Blob([JSON.stringify(extendedData.data)], {
                //   //   type: contentType,
                //   // });
                //   const blob = new Blob([extendedData.data], {
                //     type: contentType,
                //   });
                //   const link = document.createElement("a");
                //   link.href = window.URL.createObjectURL(blob);

                //   // Extract the filename from the content-disposition header
                //   const filename = contentDisposition
                //     ? contentDisposition
                //         .split("filename=")[1]
                //         .replace(/"/g, "")
                //         .trim()
                //     : "downloaded_file.json";

                //   link.download = filename;
                //   document.body.appendChild(link);
                //   link.click();
                //   document.body.removeChild(link);

                //   // Create a JSON object with information about the file
                //   const file = {
                //     filename: filename,
                //     type: contentType,
                //     size: blob.size,
                //   };
                //   console.log("File:", file);

                //   resolve(file);
                // } else {
                //   // if there execute_mode it means user is being prompted to provide required values
                //   let execute_mode_item = Array.isArray(data?.data)
                //     ? data.data.find(
                //         (item: any) => item?.message?.code === "execute_mode"
                //       )
                //     : null;

                //   if (execute_mode_item) {
                //     // we need to open and display the form for the user to provide the required values
                //     // console.log("open action input");
                //     openDisplay("rightSection");
                //     // let new_focused_entities = { ...focused_entities };
                //     // new_focused_entities["action_input"] = {
                //     //   ...new_focused_entities["action_input"],
                //     //   execute_mode: execute_mode_item["data"],
                //     //   action: `proceed_${action}`,
                //     // };
                //     // new_focused_entities[record?.id] = {
                //     //   ...new_focused_entities[record?.id],
                //     //   action: `proceed_${action}`,
                //     // };
                //     // setFocusedEntities(new_focused_entities);
                //   }

                //   // let action_step_items = Array.isArray(data?.data)
                //   //   ? data.data.filter(
                //   //       (item: any) =>
                //   //         item?.action_step?.id && item?.exit_code === 0
                //   //     )
                //   //   : [];
                //   // let query_state = action_step_items.map((item: any) => ({
                //   //   id: item?.action_step?.id,
                //   //   success_message_code: item?.message?.code,
                //   // }));

                // query_state.forEach((state) => {
                //   queryClient.invalidateQueries({
                //     queryKey: [
                //       `readByState_${JSON.stringify({
                //         success_message_code: state?.success_message_code,
                //       })}`,
                //     ],
                //   });
                // });
                if (action === "query") {
                  let activity_state = {
                    // id: record?.id,
                    query_name: "read activity",
                    task_id: activeTask?.id,
                    session_id: activeSession?.id,
                    view_id: activeView?.id,
                    success_message_code: "activity",
                  };
                  let query_key = `useFetchQueryDataByState_${JSON.stringify(
                    activity_state
                  )}`;
                  queryClient.invalidateQueries({
                    queryKey: [query_key],
                  });
                  console.log("invalidated", query_key);
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
    setActionInputFormValues({
      ...action_input_form_values,
      [action_input_form_values_key]: values,
    });
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

  if (!data_model) return <div>No data model </div>;
  const { schema } = data_model;

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
  let include_items: string[] = [];
  // if data_model use the data_model.schema.required as the default include_items
  include_items = schema?.required || [];

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

  const setActiveAccordionSections = (items: any) => {
    console.log(items);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // form.handleSubmit();
        }}
      >
        {/* Include templateUpdate to force re-render */}
        {/* <div>Template Update Count: {templateUpdate}</div> */}
        {/* <MonacoEditor
          value={{
            formId: formId,
            // action_input_form_values_key: action_input_form_values_key,
            // action: action,
            // include_items: include_items,
          }}
          language="json"
          height="25vh"
        /> */}
        {/* <MonacoEditor
          value={{
            action_mode: action_mode,
            record: record,
            // data_model: data_model,
          }}
          language="json"
          height="25vh"
        /> */}
        {/* <div>{JSON.stringify(focused_item)}</div> */}
        {/* <div>{JSON.stringify(include_items)}</div> */}
        {/* <div>{JSON.stringify(record?.list_items)}</div> */}
        {/* <div>{JSON.stringify(form?.store?.state.values)}</div> */}
        {/* <div>{JSON.stringify(form?.store?.state.values?.list_items)}</div> */}

        {activeAgent ? (
          // Agent view - only show description field without accordion
          (() => {
            const key = "description";
            // Ensure we have a valid string for the field name
            const fieldName = schema.properties[key]?.title
              ? schema.properties[key].title.toLowerCase().replace(/ /g, "_")
              : "description"; // Fallback to "description" if title is undefined

            const Component = getComponentByResourceType(
              schema.properties[key]?.component as ComponentKey
            );

            if (!schema.properties[key]) {
              return null; // Return null if the description field is not found in schema
            }

            return (
              <div className="mb-4">
                <form.Field name={fieldName}>
                  {(field) => (
                    <Component
                      schema={schema.properties[key]}
                      disabled={schema.properties[key]?.readOnly}
                      label={
                        schema.properties[key]?.label ||
                        schema.properties[key]?.title
                      }
                      value={
                        schema.properties[key]?.component === "DateInput" &&
                        typeof field.state.value === "string"
                          ? new Date(field.state.value)
                          : field.state.value
                      }
                      onBlur={field.handleBlur}
                      action_input_form_values_key={
                        action_input_form_values_key
                      }
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
                        ].includes(schema.properties[key]?.component)
                          ? field.handleChange
                          : (e: any) => field.handleChange(e?.target?.value)
                      }
                      form={form}
                      isLoading={mutationIsLoading}
                      {...(schema.properties[key]?.props || {})}
                      {...(schema.properties[key]?.component === "DateInput"
                        ? { dateParser }
                        : {})}
                    />
                  )}
                </form.Field>
              </div>
            );
          })()
        ) : (
          // Regular view - show all fields with accordion
          <Accordion defaultValue={["main"]} multiple={true}>
            {Object.entries(
              Object.keys(schema?.properties)
                .sort((a, b) => {
                  const idA = parseInt(schema.properties[a]?.id, 10) || 0;
                  const idB = parseInt(schema.properties[b]?.id, 10) || 0;
                  return idA - idB;
                })
                .filter((key) => {
                  const fieldsToInclude = getFieldsToInclude(
                    schema,
                    action_mode
                  );
                  return (
                    include_items.includes(key) && fieldsToInclude.includes(key)
                  );
                })
                .reduce((groups, key) => {
                  const group = schema.properties[key]?.group || "fields";
                  if (!groups[group]) groups[group] = [];
                  groups[group].push(key);
                  return groups;
                }, {} as Record<string, string[]>)
            ).map(([groupName, groupFields]) => (
              <Accordion.Item value={groupName} key={groupName}>
                <Accordion.Control>{`${
                  data_model?.name || ""
                } / ${groupName}`}</Accordion.Control>
                <Accordion.Panel>
                  {groupFields.map((key) => {
                    const fieldName = schema.properties[key]?.title
                      .toLowerCase()
                      .replace(/ /g, "_");
                    const Component = getComponentByResourceType(
                      schema.properties[key]?.component as ComponentKey
                    );
                    return (
                      <div key={schema.properties[key]?.title} className="mb-4">
                        <form.Field
                          name={fieldName}
                          validators={
                            fieldName === "query"
                              ? {
                                  onChangeAsync: async ({ value }) => {
                                    if (value) {
                                      const error =
                                        await debouncedValidationPromise(value);
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
                                schema={schema.properties[key]}
                                disabled={schema.properties[key]?.readOnly}
                                label={
                                  schema.properties[key]?.label ||
                                  schema.properties[key]?.title
                                }
                                value={
                                  schema.properties[key]?.component ===
                                    "DateInput" &&
                                  typeof field.state.value === "string"
                                    ? new Date(field.state.value)
                                    : field.state.value
                                }
                                onBlur={field.handleBlur}
                                action_input_form_values_key={
                                  action_input_form_values_key
                                }
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
                                  ].includes(schema.properties[key]?.component)
                                    ? field.handleChange
                                    : (e: any) =>
                                        field.handleChange(e?.target?.value)
                                }
                                form={form}
                                isLoading={mutationIsLoading}
                                {...(schema.properties[key]?.props || {})}
                                {...(schema.properties[key]?.component ===
                                "DateInput"
                                  ? { dateParser }
                                  : {})}
                              />
                              {fieldName === "query" && (
                                <FieldInfo field={field} />
                              )}
                            </>
                          )}
                        </form.Field>
                      </div>
                    );
                  })}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
        <div className="flex justify-end pt-3">
          <Button
            size="compact-sm"
            onClick={() => form.setFieldValue("query", record?.query)}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* // Reset to default values
form.reset(); */}
      {/* <div>{JSON.stringify(mutationError)}</div> */}
      {/* <div>{JSON.stringify(mutationData)}</div> */}
      {/* {mutationData && (
        <MonacoEditor
          value={mutationData?.data}
          language="json"
          height="50vh"
        />
      )} */}
      {/* if data.data contains at least one object with exit_code = 1 then show error message */}
      {/* {mutationData?.data?.find((item: any) => item?.exit_code === 1) && (
        <MonacoEditor value={mutationData} language="json" height="50vh" />
      )} */}
      {typeof mutationData?.data === "object" &&
      Array.isArray(mutationData?.data)
        ? mutationData?.data?.find((item: any) => item?.exit_code === 1) && (
            <MonacoEditor
              value={JSON.stringify(mutationData, null, 2)}
              language="json"
              height="50vh"
            />
          )
        : null}

      {mutationError && (
        <MonacoEditor
          value={{
            data: mutationError?.response?.data,
            status: mutationError?.response?.status,
            code: mutationError?.code,
            headers: mutationError?.response?.headers,
            statusText: mutationError?.response?.statusText,
            config: {
              headers: mutationError?.config?.headers,
              method: mutationError?.config?.method,
              data: mutationError?.config?.data,
              url: mutationError?.config?.url,
            },
          }}
          language="json"
          height="25vh"
        />
      )}

      {/* <div
        className="flex justify-end w-full p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalSubmitButton
          record={record}
          entity_type="action_steps"
          action={action}
        ></ExternalSubmitButton>
      </div> */}
    </>
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

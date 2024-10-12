import {
  extractDefaultValues,
  extractIdentifier,
  extractLabelsFromDefaults,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchActionStepDataByState,
  useFetchActionStepsDataByState,
  useFetchDataModelByState,
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import { useAppStore, useTransientStore } from "src/store";
import { Accordion, Button, Title } from "@mantine/core";
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
import { saveAs } from "file-saver";
import { useDuckDB } from "pages/_app";

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(",")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
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

  // Generate the ID once and persist it across re-renders
  // const generatedIdRef = useRef(uuidv4());

  // Access the persisted ID using generatedIdRef.current
  // const generatedId = generatedIdRef.current;
  const actionInputId =
    record?.id || data_model?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";

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
      mutationKey: [`action-input-${actionInputId}`],
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
    setSelectedRecords,
    activeLayout,
    setActiveLayout,
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
  let action_input_form_values_key = "";
  if (focused_item === "action_input") {
    action_input_form_values_key = "action_input";
  } else {
    action_input_form_values_key = `${action}_action_input_${actionInputId}`;
  }

  // let standardized_data_model_name = data_model?.name
  // ?.replace(/\s+/g, "_")
  // .toLowerCase();

  // Create the key with the transformed data_model.name
  // const proceed_action_input_form_values_key = `proceed_execute_with_action_input_${standardized_data_model_name}_${actionInputId}`;
  // const proceed_action_input_form_values_key = "action_input";

  const formId = `${action}_${actionInputId}`; // Unique form identifier

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

      const specialActions = ["save"]; // List of special actions
      const action_url = specialActions.includes(action) ? "execute" : action; // Check if action is in the list and replace if necessary

      // if action is not special then perform the following otherwise alert the action name
      if (action === "save") {
        // alert(JSON.stringify(value));
        const fetchFromDuckDB = async () => {
          try {
            // const conn = await initializeLocalDB();
            // let downloadQuery = "SELECT * FROM issues";
            // console.log(`Form values for ${formId}:`, value);
            let downloadQuery = value?.query;
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

            // Ensure the data is an array of arrays
            const dataWithHeaders = [
              columnNames,
              ...downloadData.map((row: any) => Object.values(row)),
            ];

            // Step 1: Create a new workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);

            // Step 2: Optionally, apply styling or formatting to the worksheet
            // Example: Making the first row (headers) bold
            // const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
            // for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            //   const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            //   if (cell) {
            //     cell.s = {
            //       font: { bold: true },
            //       alignment: { horizontal: "center" },
            //       fill: { patternType: "solid", fgColor: { rgb: "FFFF00" } }, // Yellow background
            //     };
            //   }
            // }

            // Step 3: Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, `${value?.name}`);

            // Step 4: Write the workbook to a Blob and trigger a download
            const wbout = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "array",
            });
            const blob = new Blob([wbout], {
              type: "application/octet-stream",
            });
            saveAs(blob, `${value?.name}.xlsx`);

            console.log(
              `${value?.name}.xlsx excel file created and downloaded successfully.`
            );
          } catch (err) {
            let errorMessage = "";
            // if err is object then json stringify otherwise just display the error message
            // if (typeof err === "object") {
            //   errorMessage = `Error querying or generating excel file. ${JSON.stringify(
            //     err
            //   )}`;
            // } else {
            //   errorMessage = `Error querying or generating excel file. ${err}`;
            // }
            errorMessage = `Error querying or generating excel file. ${err}`;
            console.error(`Error querying or generating excel file.`, err);
            alert(errorMessage);
          }
        };
        // alert(JSON.stringify(value));
        fetchFromDuckDB();
      } else {
        return new Promise((resolve, reject) => {
          let include_execution_orders = [];
          // if action is save then include the execution_order value for the record
          if (action === "save") {
            include_execution_orders = [record?.execution_order || 1];
          } else {
            include_execution_orders = selectedRecords[
              `${action_input_form_values_key}`
            ]?.map((item: any) => item?.index) || [1];
          }
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
                  ...value,
                  action_input_form_values:
                    action_input_form_values["action_input"] || {},
                },
                // credential: value?.credential || "surrealdb catchmytask dev",
                // data_model: data_model,
                application: {
                  id: activeApplication?.id,
                  name: activeApplication?.name,
                },
                session: {
                  id: activeSession?.id,
                  name: activeSession?.name,
                },
                task: {
                  id: activeTask?.id,
                  name: activeTask?.name,
                },
                // task_variables: {},
                // global_variables: {
                //   ...global_variables,
                // },
                // include_execution_orders: [record?.execution_order || 1],
                include_execution_orders: include_execution_orders,
                action_steps: records || [
                  {
                    ...value,
                    execution_order: value?.execution_order || 1,
                    description: value?.description || "generic description",
                    name: value?.name || "generic name",
                    job: value?.description || "generic job",
                    method: value?.method || "select",
                    type: value?.type || "action_steps",
                    credential:
                      value?.credential || "surrealdb catchmytask dev",
                    implement: value?.implement,
                    success_message_code: success_message_code_selected,
                  },
                ],
              },
            },
            {
              onError: (error, variables, context) => {
                // console.log("onError", error);
                reject(error);
              },
              onSuccess: (data, variables, context) => {
                const extendedData = data as CustomMutationResponse<any>;
                // Extract the headers and content data
                const contentDisposition =
                  extendedData?.headers?.["content-disposition"];
                // console.log("Content Disposition:", contentDisposition);
                const contentType = extendedData?.headers?.["content-type"];

                // console.log("Content Type:", contentType);
                // console.log("Extended Headers:", extendedData?.headers);
                // Check if the response is for a file download
                if (
                  contentDisposition &&
                  contentDisposition.includes("attachment")
                ) {
                  // Create a JSON blob and trigger download
                  // const jsonBlob = new Blob([JSON.stringify(extendedData.data)], {
                  //   type: contentType,
                  // });
                  const blob = new Blob([extendedData.data], {
                    type: contentType,
                  });
                  const link = document.createElement("a");
                  link.href = window.URL.createObjectURL(blob);

                  // Extract the filename from the content-disposition header
                  const filename = contentDisposition
                    ? contentDisposition
                        .split("filename=")[1]
                        .replace(/"/g, "")
                        .trim()
                    : "downloaded_file.json";

                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Create a JSON object with information about the file
                  const file = {
                    filename: filename,
                    type: contentType,
                    size: blob.size,
                  };
                  console.log("File:", file);

                  resolve(file);
                } else {
                  // if there execute_mode it means user is being prompted to provide required values
                  let execute_mode_item = Array.isArray(data?.data)
                    ? data.data.find(
                        (item: any) => item?.message?.code === "execute_mode"
                      )
                    : null;

                  if (execute_mode_item) {
                    // we need to open and display the form for the user to provide the required values
                    // console.log("open action input");
                    openDisplay("rightSection");
                    // let new_focused_entities = { ...focused_entities };
                    // new_focused_entities["action_input"] = {
                    //   ...new_focused_entities["action_input"],
                    //   execute_mode: execute_mode_item["data"],
                    //   action: `proceed_${action}`,
                    // };
                    // new_focused_entities[record?.id] = {
                    //   ...new_focused_entities[record?.id],
                    //   action: `proceed_${action}`,
                    // };
                    // setFocusedEntities(new_focused_entities);
                  }

                  // let action_step_items = Array.isArray(data?.data)
                  //   ? data.data.filter(
                  //       (item: any) =>
                  //         item?.action_step?.id && item?.exit_code === 0
                  //     )
                  //   : [];
                  // let query_state = action_step_items.map((item: any) => ({
                  //   id: item?.action_step?.id,
                  //   success_message_code: item?.message?.code,
                  // }));

                  // query_state.forEach((state) => {
                  //   queryClient.invalidateQueries({
                  //     queryKey: [
                  //       `readByState_${JSON.stringify({
                  //         success_message_code: state?.success_message_code,
                  //       })}`,
                  //     ],
                  //   });
                  // });

                  resolve(data);
                }
              },
            }
          );
        });
      }
    },
  });

  // const [templateUpdate, setTemplateUpdate] = useState(0);

  const debouncedLog = debounce((values) => {
    // let form_input_values: { [key: string]: any } = {};
    // form_input_values[`${data_model?.name}_${record?.id || generatedId}`] =
    //   values;

    // const key = `${data_model?.name}_${actionInputId}`;
    // // replace all spaces with underscores and convert to lowercase the value of data_model.name
    // let standardized_data_model_name = data_model?.name
    // Convert the data_model.name by replacing spaces with underscores and converting to lowercase

    // console.log("key", key);
    // console.log(values);
    setActionInputFormValues({
      ...action_input_form_values,
      [action_input_form_values_key]: values,
    });
  }, 300); // 300ms debounce delay, adjust as needed

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      debouncedLog(form.store.state.values);
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

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* <div>{JSON.stringify(action_input_form_values_key)}</div> */}
        {/* Include templateUpdate to force re-render */}
        {/* <div>Template Update Count: {templateUpdate}</div> */}
        {/* <MonacoEditor
          value={{
            formId: formId,
            action_input_form_values_key: action_input_form_values_key,
            action: action,
            include_items: include_items,
            // record: record,
            // data_model: data_model,
          }}
          language="json"
          height="50vh"
        /> */}
        {/* <div>{JSON.stringify(focused_item)}</div> */}

        {/* <div>{JSON.stringify(include_items)}</div> */}
        {/* <div>{JSON.stringify(record?.list_items)}</div> */}
        {/* <div>{JSON.stringify(form?.store?.state.values)}</div> */}

        {/* <div>{JSON.stringify(form?.store?.state.values?.list_items)}</div> */}
        {/* <div>
          {JSON.stringify({
            formId: formId,
            action_input_form_values_key: action_input_form_values_key,
            action: action,
            include_items: include_items,
            record: record,
            data_model: data_model,
          })}
        </div> */}
        {/* <div>{JSON.stringify(record)}</div> */}
        {/* <div>{JSON.stringify(extractDefaultValues(data_model))}</div> */}

        <Accordion defaultValue={["main", "on local data"]} multiple={true}>
          {Object.entries(
            Object.keys(schema?.properties)
              .sort((a, b) => {
                const idA = parseInt(schema.properties[a]?.id, 10) || 0;
                const idB = parseInt(schema.properties[b]?.id, 10) || 0;
                return idA - idB;
              })
              .reduce((groups, key) => {
                const group = schema.properties[key]?.group || "fields"; // Default group if no group key
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
                {groupFields
                  .filter((key) => include_items.includes(key)) // Filter based on include_items state
                  .map((key) => {
                    const Component = getComponentByResourceType(
                      schema.properties[key]?.component as ComponentKey
                    );
                    return (
                      <div key={schema.properties[key]?.title} className="mb-4">
                        <form.Field
                          name={schema.properties[key]?.title
                            .toLowerCase()
                            .replace(/ /g, "_")}
                        >
                          {(field) => (
                            <>
                              {/* <div>
                                {JSON.stringify(
                                  form?.store?.state.values?.[key]
                                )}
                              </div> */}
                              <Component
                                schema={schema.properties[key]}
                                disabled={schema.properties[key]?.readOnly}
                                label={
                                  schema.properties[key]?.label ||
                                  schema.properties[key]?.title
                                }
                                searchable={true}
                                value={field.state.value}
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
                                  ].includes(schema.properties[key]?.component)
                                    ? field.handleChange
                                    : (e: any) =>
                                        field.handleChange(e?.target?.value)
                                }
                                form={form}
                                isLoading={mutationIsLoading}
                              />
                              <FieldInfo field={field} />
                            </>
                          )}
                        </form.Field>
                      </div>
                    );
                  })}
              </Accordion.Panel>
            </Accordion.Item>
          ))}

          {/* Handle implement Keys */}
          {record?.implement && include_items.includes("implement") && (
            <Accordion.Item value="implement" key="implement">
              <Accordion.Control>
                <Title c="orange" order={5}>
                  Implement
                </Title>
              </Accordion.Control>
              <Accordion.Panel>
                {Object.entries(record.implement).map(([key, value]) => {
                  const Component = getComponentByResourceType(
                    "MonacoEditorFormInput"
                  ); // Default to TextInput
                  let field_key = `implement.${key
                    .toLowerCase()
                    .replace(/ /g, "_")}`;
                  return (
                    <div key={field_key} className="mb-4">
                      <form.Field name={field_key}>
                        {(field) => (
                          <>
                            <Component
                              schema={{
                                component: "MonacoEditorFormInput",
                                default: null,
                                placeholder: `Enter ${field_key}`,
                                size: "lg",
                                title: field_key,
                                type: "string",
                                language: "python",
                                // ...value, // Use any additional properties from implement value
                              }}
                              action_input_form_values_key={
                                action_input_form_values_key
                              }
                              form_id={formId}
                              label={field_key}
                              record={record}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={field.handleChange}
                              form={form}
                              isLoading={mutationIsLoading}
                            />
                            <FieldInfo field={field} />
                          </>
                        )}
                      </form.Field>
                    </div>
                  );
                })}
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      </form>
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
      !Array.isArray(mutationData?.data)
        ? mutationData?.data?.find((item: any) => item?.exit_code === 1) && (
            <MonacoEditor
              value={JSON.stringify(mutationData, null, 2)}
              language="json"
              height="50vh"
            />
          )
        : null}
      {mutationError && (
        <MonacoEditor value={mutationError} language="json" height="50vh" />
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
      {/* <MonacoEditor
        value={
          recordData?.data?.find(
            (item: any) => item?.message?.code === record?.id
          )?.data[0]
        }
        language="json"
        height="50vh"
      /> */}

      {/* <div>
        {JSON.stringify(
          recordData?.data?.find(
            (item: any) => item?.message?.code === record?.id
          )?.data[0]
        )}
      </div> */}
      {/* <div>{JSON.stringify(execution_record)}</div>
    <div>{JSON.stringify(record)}</div> */}
      {/* <>{JSON.stringify(recordData)}</> */}
      {/* <div>
        {JSON.stringify(
          data?.data?.find(
            (item: any) => item?.message?.code === success_message_code
          )?.data[0]?.data_model
        )}
      </div> */}
      {/* <MonacoEditor
        value={
          data?.data?.find(
            (item: any) => item?.message?.code === success_message_code
          )?.data[0]?.data_model
        }
        language="json"
        height="50vh"
      /> */}

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

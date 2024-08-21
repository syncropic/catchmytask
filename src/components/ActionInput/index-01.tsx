import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  extractIdentifier,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchDataModelByState,
  useFetchQueryDataByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import { ActionIcon, Button, Text, TextInput } from "@mantine/core";
// import { ActionControlFormWrapper } from "@components/ActionControlForm";
import type { FieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { inputs } from "@data/index";
import { Combobox } from "@components/Combobox";
import { ComponentKey, IIdentity } from "@components/interfaces";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import config from "src/config";
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
// import { useIsMutating } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";

interface DataModel {
  data_model: {
    author_id: string;
    created_datetime: string;
    description: string;
    entity_type: string;
    id: string;
    name: string;
    schema: {
      properties: {
        [key: string]: {
          component: string;
          description: string;
          placeholder?: string;
          size?: string;
          title: string;
          type: string;
          readOnly?: boolean;
          format?: string;
          id: string;
        };
      };
      required: string[];
      title: string;
      type: string;
    };
    updated_datetime: string;
  };
}

interface DynamicFormProps {
  data_model: DataModel["data_model"];
  record?: any;
  execlude_components?: string[];
  name?: string;
}

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

const ActionInputForm: React.FC<DynamicFormProps> = ({
  data_model,
  record = {},
  execlude_components = [],
  name,
}) => {
  const [inputAsvalue, setInputAsValue] = useState("");
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity<IIdentity>();

  // Generate the ID once and persist it across re-renders
  // const generatedIdRef = useRef(uuidv4());

  // // Access the persisted ID using generatedIdRef.current
  // const generatedId = generatedIdRef.current;
  const generatedId = "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";

  const {
    mutate,
    data: mutationData,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation({
    mutationOptions: {
      mutationKey: [`catch-action-step-${generatedId}`],
    },
  });

  // How many mutations matching the action step prefix are fetching useful for loading state?
  // const isMutatingActionStep = useIsMutating({
  //   mutationKey: [`catch-action-step-${generatedId}`],
  // });

  const {
    activeSession,
    activeAction,
    activeApplication,
    setActionInputFormValues,
    global_variables,
    action_input_form_values,
  } = useAppStore();

  const generatedIds = {
    id: generatedId,
  };
  const identity_object = {
    author_id: identity?.email,
  };

  const defaultValueObjects = [
    generatedIds,
    identity_object,
    record,
    action_input_form_values[
      `${data_model?.name}_${record?.id || generatedId}`
    ],
  ];

  const defaultValues = _.merge({}, ...defaultValueObjects);

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      // Do something with form data
      mutate(
        {
          // url: `${config.API_URL}/catch-${
          //   data_model?.name === "action_step_any" ? "any" : "action"
          // }`,
          url: `${config.API_URL}/catch-${
            name === "task" ? "task" : "action-step"
          }`,
          method: "post",
          // values: generateRequestData(values),
          values: {
            action: {
              id: activeAction?.id,
              name: activeAction?.name,
            },
            input_values: value,
            credential: value?.credential || "surrealdb_catchmytask",
            data_model: data_model,
            application: {
              id: activeApplication?.id,
              name: activeApplication?.name,
            },
            session: {
              id: activeSession?.id,
              name: activeSession?.name,
            },
            task_variables: {},
            global_variables: {
              ...global_variables,
            },
            include_execution_orders: [1],
            active_action_step_data: [],
            active_action_step_selected_data: [],
            action_steps: [
              {
                ...value,
                id: value?.id || generatedId,
                execution_order: value?.execution_order || 1,
                description: value?.description || "generic description",
                name: value?.name || "generic name",
                job: value?.description || "generic job",
                method: value?.method || "select",
                type: value?.type || "action_steps",
                credential: value?.credential || "surrealdb_catchmytask",
              },
            ],
          },
        },
        {
          onError: (error, variables, context) => {
            // An error occurred!
          },
          onSuccess: (data, variables, context) => {
            // Let's celebrate!
            // Optionally update the query cache as well
            queryClient.setQueryData(
              [
                `useFetchActionStepDataByState_${JSON.stringify({
                  name: value?.name,
                  execution_order: value?.execution_order,
                  id: generatedId,
                })}`,
              ],
              (oldData = {}) => ({
                ...{},
                ...data,
              })
            );
          },
        }
      );
    },
  });

  // useEffect(() => {
  //   // Update the form state in the global store whenever it changes
  //   // setActionInputFormValues(form.state.values);
  //   // Subscribe to form state changes and update Zustand state
  //   const unsubscribe = form.Subscribe((state) => {
  //     setActionInputFormValues(state.values);
  //   });

  //   // Cleanup the subscription on unmount
  //   return () => unsubscribe();
  // }, [form]);
  // useEffect(() => {
  //   return form.store.subscribe(() => {
  //     console.log(form.store.state.values);
  //   });
  // }, [form.store]);
  // Debounce the logging function
  const debouncedLog = debounce((values) => {
    // let form_input_values: { [key: string]: any } = {};
    // form_input_values[`${data_model?.name}_${record?.id || generatedId}`] =
    //   values;
    const key = `${data_model?.name}_${record?.id || generatedId}`;
    console.log("key", key);
    // console.log(values);
    setActionInputFormValues({
      ...action_input_form_values,
      [key]: values,
    });
  }, 300); // 300ms debounce delay, adjust as needed

  // const debouncedLog = debounce((values) => {
  //   // Create the key using the data_model name and record ID or generatedId
  //   const key = `${data_model?.name}_${record?.id || generatedId}`;

  //   // Set the state by merging the existing state with the new key-value pair
  //   setActionInputFormValues((action_input_form_values: any) => ({
  //     ...action_input_form_values, // Spread the existing state
  //     [key]: values, // Update the specific key with the new values
  //   }));
  // }, 300); // 300ms debounce delay, adjust as needed

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      debouncedLog(form.store.state.values);
    });

    return () => {
      unsubscribe();
      debouncedLog.cancel(); // Cancel any pending debounced calls on unmount
    };
  }, [form.store, debouncedLog]);

  if (!data_model) return <div>No data model</div>;
  const { schema } = data_model;

  return (
    <>
      {/* <div>{JSON.stringify(action_input_form_values)}</div> */}
      {/* <div>{JSON.stringify(form.state.values)}</div> */}
      {/* <div>ActionInputForm</div>
      <div>{JSON.stringify(schema)}</div> */}
      {/* <div>predetermined forms or dynamic prompting from agent for action input / feedback. some llm prompts or clicking on buttons or selecting actions updates this section */}
      {/* render any pydantic model form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex justify-between">
          {execlude_components?.includes("submit_button") ? null : (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                // <button type="submit" disabled={!canSubmit}>
                //   {isSubmitting ? '...' : 'Submit'}
                // </button>
                <Button
                  size="xs"
                  type="submit"
                  loading={mutationIsLoading || isSubmitting}
                  disabled={!canSubmit}
                >
                  Act
                </Button>
              )}
            />
          )}

          {/* <Button size="xs" type="submit" loading={mutationIsLoading} disabled={!canSubmit}>
            Act
          </Button> */}
          {/* <Button
            size="xs"
            // type="submit"
            variant="outline"
            rightSection={<IconCaretDown size={14} />}
            // {...saveButtonProps}
            // loading={formLoading || mutationIsLoading}
          >
            Last Run
          </Button> */}
          {/* <ActionIcon variant="outline" aria-label="Settings">
            <IconArrowsVertical
              style={{ width: "70%", height: "70%" }}
              stroke={1.5}
            />
          </ActionIcon> */}
          {execlude_components?.includes("input_mode") ? null : (
            <Combobox
              data_items={inputs}
              resource="input"
              value={inputAsvalue}
              setValue={setInputAsValue}
            ></Combobox>
          )}
        </div>
        {data_model &&
          Object.keys(schema?.properties)
            .sort((a, b) => {
              const idA = parseInt(schema.properties[a]?.id, 10) || 0;
              const idB = parseInt(schema.properties[b]?.id, 10) || 0;
              return idA - idB;
            })
            .map((key) => {
              const Component = getComponentByResourceType(
                schema.properties[key]?.component as ComponentKey
              );
              // let data_query_key = `field_data_for_${schema.properties[key]?.title}`;
              // let fieldData: FieldData = queryClient.getQueryData([data_query_key]) || {data: []};
              // const fieldData =
              //   queryClient.getQueryData<FieldData>([data_query_key]) || {};
              // console.log("fieldData", fieldData);
              // console.log("field", field);
              // if there is a data_prop_query in a field, retrieve the data before rendering or on focus?// add on_focus to the field configuration
              // improve later to allow onfocus on search etc
              return (
                <>
                  <div key={schema.properties[key]?.title} className="mb-4">
                    <form.Field
                      name={schema.properties[key]?.title
                        .toLowerCase()
                        .replace(/ /g, "_")}
                      children={(field) => {
                        // Avoid hasty abstractions. Render props are great!
                        return (
                          <>
                            {/* <label htmlFor={field.name}>
                              {schema.properties[key]?.title}
                            </label>
                            <TextInput
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            /> */}

                            <Component
                              // {...getInputProps(
                              //   schema.properties[key]?.title
                              //     .toLowerCase()
                              //     .replace(" ", "_")
                              // )}
                              // {...field?.props}
                              schema={schema.properties[key]}
                              // value={
                              //   values[
                              //     schema.properties[key]?.title
                              //       .toLowerCase()
                              //       .replace(/ /g, "_")
                              //   ]
                              // }
                              // value="Hello"
                              // setFieldValue={setFieldValue}
                              disabled={schema.properties[key]?.readOnly}
                              label={schema.properties[key]?.title}
                              placeholder={schema.properties[key]?.placeholder}
                              searchable={true}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              // onChange={(e: any) =>
                              //   field.handleChange(e?.target?.value)
                              // }
                              onChange={
                                [
                                  "NumberInput",
                                  "MonacoEditorFormInput",
                                  "NaturalLanguageEditorFormInput",
                                ].includes(schema.properties[key]?.component)
                                  ? field.handleChange
                                  : (e: any) =>
                                      field.handleChange(e?.target?.value)
                              }
                              // setValue={field.handleChange}
                              // {...(field.on_change &&
                              // isFunctionMappingKey(field.on_change)
                              //   ? { onChange: functionMappings[field.on_change] }
                              //   : {})}
                              // {...(field?.data_prop_query && {
                              //   onFocus: (e: any) => handleFocus(e, field),
                              //   data: (fieldData?.data || []).map(
                              //     (data_item: any) => ({
                              //       value: data_item["id"],
                              //       label: data_item["name"],
                              //     })
                              //   ),
                              // })}
                            />
                            <FieldInfo field={field} />
                          </>
                        );
                      }}
                    />
                  </div>
                </>
              );
            })}

        {/* <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <>
              <button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "..." : "Submit"}
              </button>
              <button type="reset" onClick={() => form.reset()}>
                Reset
              </button>
            </>
          )}
        /> */}
      </form>
      {/* {activeAction && (
        <>
          <ActionControlFormWrapper
            action_name={activeAction.name}
          ></ActionControlFormWrapper>
        </>
      )} */}
    </>
  );
};

// export default ActionInput;

interface ActionInputWrapperProps {
  query_name?: string;
  name?: string;
  action_type?: string;
  entity?: string;
  record?: any;
  exclude_components?: string[];
}

export const ActionInputWrapper: React.FC<ActionInputWrapperProps> = ({
  query_name,
  name,
  action_type,
  entity,
  record,
  exclude_components = [],
}) => {
  let state = {
    query_name: query_name,
    name: name,
    action_type: action_type,
    entity: entity,
  };
  const {
    data: queryData,
    isLoading: queryDataIsLoading,
    error: queryDataError,
  } = useFetchQueryDataByState(state);

  // // console.log("actionFormFieldValues", actionFormFieldValues);
  if (queryDataError) return <div>Error: {JSON.stringify(queryDataError)}</div>;
  if (queryDataIsLoading) return <div>Loading...</div>;

  return (
    <>
      {/* <div>ActionInputWrapper</div> */}
      {/* <>{JSON.stringify(queryData)}</> */}
      <div>
        {/* <div>action input</div>
      {JSON.stringify(
        actionData?.data?.find(
          (item: any) => item?.message?.code === "query_success_results"
        )?.data
      )} */}
        {queryData?.data && (
          <ActionInputForm
            data_model={
              queryData?.data?.find(
                (item: any) => item?.message?.code === "query_success_results"
              )?.data[0]?.data_model
            }
            record={record}
            execlude_components={exclude_components}
            name={name}
          ></ActionInputForm>
        )}
      </div>
    </>
  );
};

export default ActionInputWrapper;

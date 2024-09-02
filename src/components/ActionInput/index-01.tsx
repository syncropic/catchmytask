import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  extractIdentifier,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchActionStepDataByState,
  useFetchActionStepsDataByState,
  useFetchDataModelByState,
  useFetchQueryDataByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
// import { ActionControlFormWrapper } from "@components/ActionControlForm";
import type { FieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { Children, useEffect, useRef, useState } from "react";
import { inputs } from "@data/index";
import { Combobox } from "@components/Combobox";
import { ComponentKey, IIdentity } from "@components/interfaces";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import config from "src/config";
import { debounce, update } from "lodash";
import { v4 as uuidv4 } from "uuid";
// import { useIsMutating } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { IconCode, IconPlayerPlay, IconTools } from "@tabler/icons-react";

function useConditionalFetch(
  query_name?: string,
  name?: string,
  action_type?: string,
  entity?: string,
  success_message_code?: string
) {
  const { action_input_form_values } = useAppStore();

  if (query_name) {
    const queryState = {
      query_name,
      name,
      action_type,
      entity,
      success_message_code,
    };
    return useFetchQueryDataByState(queryState);
  } else {
    // const taskRecord =
    //   action_input_form_values[`task_b79aaba2-a0d1-4fa7-9b68-0baebbd1b321`];
    // let activeActionStepRecord = {
    //   id: "has_action_step:055fz04qegaw0q8khpjc",
    //   name: "retrive booking from caesars snowstorm database by id",
    //   execution_order: 1,
    //   success_message_code: success_message_code,
    // };

    // const actionStepState = {
    //   action_steps: [activeActionStepRecord],
    // };
    let record =
      action_input_form_values[`task_b79aaba2-a0d1-4fa7-9b68-0baebbd1b321`];
    let actionStepRecord = {
      ...record,
      success_message_code: success_message_code,
    };
    let actionStepsAwaitingActionInputState = {
      action_steps: [actionStepRecord],
    };
    return useFetchActionStepDataByState(actionStepsAwaitingActionInputState);
  }
}

// interface DataModel {
//   data_model: {
//     author_id: string;
//     created_datetime: string;
//     description: string;
//     entity_type: string;
//     id: string;
//     name: string;
//     schema: {
//       properties: {
//         [key: string]: {
//           group: string;
//           component: string;
//           description: string;
//           placeholder?: string;
//           size?: string;
//           title: string;
//           type: string;
//           readOnly?: boolean;
//           format?: string;
//           id: string;
//         };
//       };
//       required: string[];
//       title: string;
//       type: string;
//     };
//     updated_datetime: string;
//   };
// }

interface DataModel {
  data_model: {
    author_id: string;
    created_datetime: string;
    description: string;
    entity_type: string;
    id: string;
    name: string;
    schema: {
      properties: Record<
        string,
        {
          group: string;
          component: string;
          description: string;
          placeholder?: string;
          size?: string;
          title: string;
          type: string;
          readOnly?: boolean;
          format?: string;
          id: string;
          // Allow any additional properties
          [key: string]: any;
        }
      >;
      required: string[];
      title: string;
      type: string;
    };
    updated_datetime: string;
  };
}

interface DynamicFormProps {
  data_model: DataModel["data_model"] | null;
  record?: any;
  action_steps?: any;
  execlude_components?: string[];
  name?: string;
  children?: any;
  nested_component?: any;
  action_icon?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
  invalidate_queries_on_submit_success?: string[];
  update_action_input_form_values_on_submit_success?: boolean;
  success_message_code?: string;
  endpoint?: string;
  action_label?: string;
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

export const ActionInputForm: React.FC<DynamicFormProps> = ({
  data_model,
  record = {},
  execlude_components = [],
  name,
  children,
  nested_component,
  action_icon,
  setExpandedRecordIds,
  action_steps,
  invalidate_queries_on_submit_success,
  update_action_input_form_values_on_submit_success = false,
  success_message_code = "query_success_results",
  action_label,
  endpoint,
}) => {
  const [inputAsvalue, setInputAsValue] = useState("");
  const queryClient = useQueryClient();
  const { data: identity } = useGetIdentity<IIdentity>();

  // Generate the ID once and persist it across re-renders
  // const generatedIdRef = useRef(uuidv4());

  // // Access the persisted ID using generatedIdRef.current
  // const generatedId = generatedIdRef.current;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";

  const {
    mutate,
    data: mutationData,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation({
    mutationOptions: {
      mutationKey: [`catch-action-step-${actionInputId}`],
    },
  });

  const {
    activeSession,
    activeAction,
    activeApplication,
    setActionInputFormValues,
    global_variables,
    action_input_form_values,
  } = useAppStore();

  // const actionInputIds = {
  //   id: actionInputId,
  // };
  const identity_object = {
    author_id: identity?.email,
  };

  const defaultValueObjects = [
    // actionInputIds,
    identity_object,
    record,
    action_input_form_values[`${data_model?.name}_${actionInputId}`],
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
          url: `${config.API_URL}/${endpoint ? endpoint : "execute-task"}`,
          method: "post",
          // values: generateRequestData(values),
          values: {
            action: {
              id: activeAction?.id,
              name: activeAction?.name,
            },
            input_values: value,
            credential: value?.credential || "surrealdb catchmytask dev",
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
            include_execution_orders: [],
            // active_action_step_data: [],
            // active_action_step_selected_data: [],
            action_steps: [
              {
                ...value,
                // id: value?.id || actionInputId,
                execution_order: value?.execution_order || 1,
                description: value?.description || "generic description",
                name: value?.name || "generic name",
                job: value?.description || "generic job",
                method: value?.method || "select",
                type: value?.type || "action_steps",
                credential: value?.credential || "surrealdb catchmytask dev",
                success_message_code:
                  success_message_code || "query_success_results",
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
            let data_item = data?.data?.find(
              (item: any) => item?.message?.code === "create_task_success"
            )?.data[0];

            console.log("data_item", data_item);
            if (update_action_input_form_values_on_submit_success) {
              const key = `${data_model?.name}_${actionInputId}`;
              console.log("key", key);
              // console.log(values);
              setActionInputFormValues({
                ...action_input_form_values,
                [key]: data_item,
              });
            }
            // Optionally update the query cache as well
            queryClient.setQueryData(
              [
                `useFetchActionStepDataByState_${JSON.stringify({
                  name: value?.name,
                  execution_order: value?.execution_order,
                  id: actionInputId,
                })}`,
              ],
              (oldData = {}) => ({
                ...{},
                ...data,
              })
            );
            console.log("onSuccess", data);
            if (invalidate_queries_on_submit_success) {
              console.log(
                "invalidate_queries_on_submit_success",
                invalidate_queries_on_submit_success
              );

              // Use invalidateQueries instead of refetchQueries
              // queryClient.invalidateQueries(

              //   {
              //     queryKey: invalidate_queries_on_submit_success,
              //     refetchActive: true, // This will trigger the query to refetch immediately
              //     refetchInactive: true, // This will trigger the query to refetch even if inactive
              //   }
              // );
              queryClient.refetchQueries({
                queryKey: [
                  'useFetchActionStepsDataByState_{"id":"tasks:hlw9ig5ncahfx8eaec7h"}',
                ],
                // type: "disabled",
                // exact: true,
              });
            }

            if (setExpandedRecordIds) {
              setExpandedRecordIds([actionInputId]);
              // console.log("actionInputId", actionInputId);
            }
            // console.log("setExpandedRecordIds", setExpandedRecordIds);
            // console.log("actionInputId", actionInputId);
          },
        }
      );
    },
  });

  const debouncedLog = debounce((values) => {
    // let form_input_values: { [key: string]: any } = {};
    // form_input_values[`${data_model?.name}_${record?.id || generatedId}`] =
    //   values;
    const key = `${data_model?.name}_${actionInputId}`;
    console.log("key", key);
    // console.log(values);
    setActionInputFormValues({
      ...action_input_form_values,
      [key]: values,
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

  if (!data_model) return <div>No data model </div>;
  const { schema } = data_model;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // form.handleSubmit();
  };
  const handleExecute = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };
  const handleImplement = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // form.handleSubmit();
  };
  const canSubmit = form.useStore((state) => state.canSubmit);
  const isSubmitting = form.useStore((state) => state.isSubmitting);

  return (
    <>
      {/* <div>{JSON.stringify(action_input_form_values)}</div> */}
      {/* <div>{JSON.stringify(form.state.values)}</div> */}
      {/* <div>ActionInputForm</div>
      <div>{JSON.stringify(schema)}</div> */}
      {/* <div>predetermined forms or dynamic prompting from agent for action input / feedback. some llm prompts or clicking on buttons or selecting actions updates this section */}
      {/* render any pydantic model form */}
      {action_icon && (
        <form onSubmit={handleSubmit}>
          <div className="flex gap-1">
            <Tooltip label="implement" position="left">
              <ActionIcon
                size="sm"
                variant="outline"
                color="orange"
                onClick={(e) => handleImplement(e)}
                // disabled={!canSubmit}
                // loading={mutationIsLoading || isSubmitting}
              >
                <IconCode size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="execute" position="left">
              <ActionIcon
                size="sm"
                variant="outline"
                color="green"
                onClick={(e) => handleExecute(e)}
                disabled={!canSubmit}
                loading={mutationIsLoading || isSubmitting}
              >
                <IconPlayerPlay size={16} />
              </ActionIcon>
            </Tooltip>
          </div>
        </form>
      )}
      {!action_icon && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="flex justify-between pl-3 pr-3">
            {execlude_components?.includes("submit_button") ? null : (
              // <form.Subscribe
              //   selector={(state) => [state.canSubmit, state.isSubmitting]}
              //   children={([canSubmit, isSubmitting]) => (
              //     <Button
              //       size="xs"
              //       type="submit"
              //       loading={mutationIsLoading || isSubmitting}
              //       disabled={!canSubmit}
              //     >
              //       Submit
              //     </Button>
              //   )}
              // />
              <Button
                size="xs"
                type="submit"
                loading={mutationIsLoading || isSubmitting}
                disabled={!canSubmit}
              >
                {action_label || "Submit"}
              </Button>
            )}

            {execlude_components?.includes("input_mode") ? null : (
              <Combobox
                data_items={inputs}
                resource="input"
                value={inputAsvalue}
                setValue={setInputAsValue}
              ></Combobox>
            )}
          </div>
          {data_model && (
            <Accordion
              defaultValue={["description", "general", "fields"]}
              multiple={true}
            >
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
                    {groupFields.map((key) => {
                      const Component = getComponentByResourceType(
                        schema.properties[key]?.component as ComponentKey
                      );
                      return (
                        <div
                          key={schema.properties[key]?.title}
                          className="mb-4"
                        >
                          <form.Field
                            name={schema.properties[key]?.title
                              .toLowerCase()
                              .replace(/ /g, "_")}
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
                                  // placeholder={
                                  //   schema.properties[key]?.placeholder
                                  // }
                                  // {...schema.properties[key]}
                                  searchable={true}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={
                                    [
                                      "NumberInput",
                                      "MonacoEditorFormInput",
                                      "NaturalLanguageEditorFormInput",
                                      "SearchInput",
                                    ].includes(
                                      schema.properties[key]?.component
                                    )
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
              {children && (
                <Accordion.Item
                  value={
                    nested_component?.data_model?.name || "nested_component"
                  }
                  key={nested_component?.data_model?.name || "nested_component"}
                >
                  <Accordion.Control>
                    {nested_component?.data_model?.name || "nested component"}
                  </Accordion.Control>
                  <Accordion.Panel>{children}</Accordion.Panel>
                </Accordion.Item>
              )}
            </Accordion>
          )}
        </form>
      )}
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
  children?: any;
  nested_component?: any;
  action_icon?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  description?: any;
  update_action_input_form_values_on_submit_success?: boolean;
  endpoint?: string;
  action_label?: string;
}

export const ActionInputWrapper: React.FC<ActionInputWrapperProps> = ({
  query_name,
  name,
  action_type,
  entity,
  record,
  exclude_components = [],
  children,
  nested_component,
  action_icon,
  setExpandedRecordIds,
  success_message_code,
  invalidate_queries_on_submit_success,
  description,
  update_action_input_form_values_on_submit_success,
  endpoint,
  action_label,
}) => {
  // let state = {
  //   query_name: query_name,
  //   name: name,
  //   action_type: action_type,
  //   entity: entity,
  // };
  // const {
  //   data: queryData,
  //   isLoading: queryDataIsLoading,
  //   error: queryDataError,
  // } = useFetchQueryDataByState(state);
  const { data, isLoading, error } = useConditionalFetch(
    query_name,
    name,
    action_type,
    entity,
    success_message_code
  );

  if (error) return <div>Error: {JSON.stringify(error)}</div>;
  if (isLoading) return <div>Loading...</div>;

  // console.log("actionFormFieldValues", actionFormFieldValues);
  // if (error) return <div>Error: {JSON.stringify(error)}</div>;
  // if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {/* <div>ActionInputWrapper</div> */}
      {/* <>{JSON.stringify(data)}</> */}
      <div>
        {/* <div>action input</div> */}
        {/* {JSON.stringify(
          data?.data?.find(
            (item: any) => item?.message?.code === success_message_code
          )?.data
        )} */}
        {/* {data?.data &&
          !query_name &&
          JSON.stringify(
            data?.data
              .find((item: any) => item?.message?.code === "action_plan")
              ?.data?.filter(
                (item: any) =>
                  item?.queue?.execution_status === "awaiting action input"
              )
          )} */}
        {(!data?.data && !error && !isLoading && description) || null}
        {/* {data?.data && !query_name && (
          <ActionStepsActionInputForm
            action_steps={data?.data
              .find((item: any) => item?.message?.code === "action_plan")
              ?.data?.filter(
                (item: any) =>
                  item?.queue?.execution_status === "awaiting action input"
              )}
            name={name}
            success_message_code={success_message_code}
            children={children}
          ></ActionStepsActionInputForm>
        )} */}

        {data?.data && query_name && (
          <ActionInputForm
            data_model={
              data?.data?.find(
                (item: any) => item?.message?.code === success_message_code
              )?.data[0]?.data_model
            }
            record={record}
            execlude_components={exclude_components}
            name={name}
            children={children}
            nested_component={nested_component}
            action_icon={action_icon}
            setExpandedRecordIds={setExpandedRecordIds}
            invalidate_queries_on_submit_success={
              invalidate_queries_on_submit_success
            }
            update_action_input_form_values_on_submit_success={
              update_action_input_form_values_on_submit_success
            }
            endpoint={endpoint}
            action_label={action_label}
          ></ActionInputForm>
        )}
      </div>
    </>
  );
};

export default ActionInputWrapper;

interface ActionStepsActionInputFormProps {
  action_steps?: any;
  name?: string;
  success_message_code?: string;
  children?: any;
  nested_component?: any;
  action_icon?: any;
  exclude_components?: string[];
}

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
          action_icon={action_icon}
          // setExpandedRecordIds={setExpandedRecordIds}
        ></ActionInputForm>
      )}
    </>
  );
};

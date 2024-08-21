import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  extractIdentifier,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchActionStepDataByState,
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
import { debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
// import { useIsMutating } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { IconPlayerPlay } from "@tabler/icons-react";

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
    let activeActionStepRecord = {
      id: "has_action_step:055fz04qegaw0q8khpjc",
      name: "retrive booking from caesars snowstorm database by id",
      execution_order: 1,
      success_message_code: success_message_code,
    };

    const actionStepState = {
      action_steps: [activeActionStepRecord],
    };
    return useFetchActionStepDataByState(actionStepState);
  }
}

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
  children?: any;
  nested_component?: any;
  action_icon?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
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
  children,
  nested_component,
  action_icon,
  setExpandedRecordIds,
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

  const actionInputIds = {
    id: actionInputId,
  };
  const identity_object = {
    author_id: identity?.email,
  };

  const defaultValueObjects = [
    actionInputIds,
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
                id: value?.id || actionInputId,
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
                  id: actionInputId,
                })}`,
              ],
              (oldData = {}) => ({
                ...{},
                ...data,
              })
            );
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

  if (!data_model) return <div>No data model</div>;
  const { schema } = data_model;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

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
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <>
                <Tooltip label="execute" position="left">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="green"
                    onClick={(e) => handleSubmit(e)}
                    disabled={!canSubmit}
                    loading={mutationIsLoading || isSubmitting}
                  >
                    <IconPlayerPlay size={16} />
                  </ActionIcon>
                </Tooltip>{" "}
              </>
            )}
          />
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
          <div className="flex justify-between">
            {execlude_components?.includes("submit_button") ? null : (
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
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
              defaultValue={["description", "general"]}
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
                                  label={schema.properties[key]?.title}
                                  placeholder={
                                    schema.properties[key]?.placeholder
                                  }
                                  searchable={true}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={
                                    [
                                      "NumberInput",
                                      "MonacoEditorFormInput",
                                      "NaturalLanguageEditorFormInput",
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
        {data?.data && (
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
          ></ActionInputForm>
        )}
      </div>
    </>
  );
};

export default ActionInputWrapper;

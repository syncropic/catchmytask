import {
  ActionIcon,
  Loader,
  MultiSelect,
  Select,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import {
  useFetchQueryDataByState,
  useIsMobile,
  useNavigation,
} from "@components/Utils";
import renderSearchItem from "@components/SearchItem";
import { useAppStore } from "src/store";
import {
  FilterItem,
  IIdentity,
  SearchInputComponentProps,
} from "@components/interfaces";
import {
  IconAffiliate,
  IconCopy,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconSquareRoundedPlusFilled,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import FilterComponent from "@components/Filter";
import {
  useCustomMutation,
  useGetIdentity,
  useGo,
  useParsed,
} from "@refinedev/core";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import Documentation from "@components/Documentation";
import ExternalSubmitButton from "@components/SubmitButton";
import { useSession } from "next-auth/react";
import { useExecuteFunctionWithArgs } from "@components/hooks/useExecuteFunctionWithArgs";
import { useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

function SearchInput<T extends Record<string, any>>({
  activeFilters,
  success_message_code,
  placeholder = "Search",
  label,
  credential_id,
  description,
  onChange,
  handleOptionSubmit,
  value,
  disabled,
  include_action_icons,
  schema,
  size,
  navigateOnSelect,
  navigateOnClear,
  multiselect,
  withinPortal = true,
  ref,
  handleEdit = () => console.log("Edit"),
  record,
  data_items,
  query_name,
  func_name,
  collections,
  action_form_key,
}: SearchInputComponentProps<T>) {
  const { data: user_session } = useSession();
  const [query, setQuery] = useState(value?.value || "");
  const go = useGo();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const abortController = useRef<AbortController>();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { params } = useParsed();
  const [componentSelectedItem, setComponentSelectedItem] = useState<any>(null);
  const [componentSelectedItems, setComponentSelectedItems] = useState<any[]>([
    null,
  ]);

  const {
    searchFilters,
    activeTask,
    activeApplication,
    activeSession,
    activeView,
    activeProfile,
    setGlobalInputMode,
    global_input_mode,
    setShowRequestResponseView,
    setDisplaySessionEmbedMonitor,
  } = useAppStore();
  const navigate = useNavigation();

  const globalActiveFilters = searchFilters.filter(
    (filter: FilterItem) => filter.is_selected
  );

  const { runtimeConfig: config, setRequestResponse } = useAppStore();
  const { mutate: mutateRerun, isLoading: isRerunning } = useCustomMutation();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const hasPermission = (permission: string): boolean => {
    return Boolean(
      user_session?.userProfile?.permissions?.includes(permission)
    );
  };

  const {
    mutate,
    data: createMutationData,
    isLoading: createMutationIsLoading,
    isError: createMutationIsError,
    error: createMutationError,
  } = useCustomMutation({
    mutationOptions: {
      mutationKey: ["create"],
    },
  });

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [query]);

  // let selected_filters =
  //   activeFilters || schema?.activeFilters || globalActiveFilters;
  let selected_filters = activeFilters || [];

  const state = {
    query_name: func_name || "search",
    func_name: func_name || "search",
    name: func_name || "search",
    search_term: debouncedQuery,
    success_message_code: action_form_key || success_message_code,
    session_id: params?.id || params?.session_id || activeSession?.id,
    // task_id: params?.id || activeTask?.id,
    application_id: params?.application_id || activeApplication?.id,
    view_id: params?.view_id || activeView?.id,
    profile_id: params?.profile_id || activeProfile?.id,
    author_id: identity?.email,
    user_id: String(user_session?.userProfile?.user?.id),
    credential_id: credential_id,
    tables:
      collections ||
      selected_filters
        .map((filter: { entity_type: any }) => filter.entity_type)
        .join(", "),
  };

  // Only fetch data if data_items is not provided
  const { data, isLoading, error, isError } = data_items
    ? { data: null, isLoading: false, error: null, isError: false }
    : useExecuteFunctionWithArgs(state);

  useEffect(() => {
    if (data_items) {
      // If data_items is provided, use it directly
      setAutocompleteData(
        data_items.map((item: any) => ({
          ...item,
          value: item.id,
          label: item.name,
        }))
      );
    } else if (data) {
      // Otherwise use the fetched data
      const results =
        data.data
          ?.find(
            (item: any) => item?.message?.code === state?.success_message_code
          )
          ?.data[0]?.search_results?.map((item: any) => ({
            ...item,
            value: item.id,
            label: item.name,
          })) || [];
      setAutocompleteData(results);
    }
  }, [data, data_items, state?.success_message_code]);

  const enhancedHandleOnChange = (value: any | null, option: any) => {
    if (value === null) {
      setTimeout(() => {
        if (handleOptionSubmit) handleOptionSubmit(null);
        if (onChange) onChange(null);
      }, 3000);
      if (handleOptionSubmit) handleOptionSubmit(false);
      if (onChange) onChange(false);
      setTimeout(() => {
        if (navigateOnClear) {
          navigate(navigateOnClear);
        }
      }, 0);
      return;
    } else {
      let selectedItem = option;
      if (selectedItem) {
        setComponentSelectedItem(selectedItem);
        if (handleOptionSubmit) handleOptionSubmit(selectedItem);
        if (onChange) onChange(selectedItem?.value);
        setTimeout(() => {
          if (navigateOnSelect) {
            navigate(navigateOnSelect);
          }
        }, 0);
      }
    }
  };

  const enhancedHandleOnChangeMultiple = (value: string[]) => {
    if (value === null || value?.length == 0) {
      if (handleOptionSubmit) handleOptionSubmit([]);
      return;
    } else {
      const selectedItems = autocompleteData.filter((item: any) =>
        value?.includes(item.value)
      );
      if (selectedItems) {
        setComponentSelectedItems(selectedItems);
        if (handleOptionSubmit) handleOptionSubmit(selectedItems);
      }
    }
  };

  const handleAddNew = (
    e: React.MouseEvent,
    record: any,
    action: string
  ): Promise<void> => {
    e.stopPropagation();
    const action_input_form_values_key = "create";

    return new Promise((resolve, reject) => {
      const requestConfig = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const request_object = {
        action: {
          name: action,
          entity_type: record?.entity_type,
        },
        application: {
          id: activeApplication?.id,
          name: activeApplication?.name,
        },
        session: {
          id: params?.session_id || activeSession?.id,
          name: params?.session_id || activeSession?.name,
        },
        // task: {
        //   id: params?.id || activeTask?.id,
        //   name: params?.id || activeTask?.name,
        // },
        // view: {
        //   id: params?.view_id || activeView?.id,
        //   name: params?.view_id || activeView?.name,
        // },
        identity: identity,
        profile: {
          id:
            params?.profile_id ||
            activeProfile?.id ||
            user_session?.userProfile?.user_profile?.id ||
            identity?.email,
          name: params?.profile_id || activeProfile?.name || identity?.email,
        },
        // create: {
        //   action_status: action,
        // },
        // task: {
        //   id: record?.task_id,
        // },
      };

      mutate(
        {
          url: `${config.API_URL}/create`,
          method: "post",
          values: request_object,
          config: requestConfig,
        },
        {
          onError: (error) => {
            setRequestResponse(error);
            const errorItems = Array.isArray(error) ? error : [error];
            queryClient.setQueryData(["create"], errorItems);

            if (errorItems?.length > 0) {
              // Show error notification for each error item
              errorItems.forEach((item) => {
                showNotification({
                  title: item?.message?.code,
                  message: JSON.stringify(item),
                  color: "red",
                  autoClose: 10000, // Giving more time to read error messages
                  withCloseButton: true,
                  icon: <IconX size={18} />,
                  position: "top-center",
                });
              });
            }

            reject(error);
          },
          onSuccess: (data) => {
            // success with error message i.e exit_code = 1 *object or list
            const response_data = data?.data;

            // First, let's ensure we have an array to work with
            const items = Array.isArray(response_data)
              ? response_data
              : [response_data];

            queryClient.setQueryData(["create"], items);

            // Check if any item has exit_code = 1
            const errorItems = items.filter((item) => item.exit_code === 1);
            if (errorItems?.length > 0) {
              // Show error notification for each error item
              errorItems.forEach((item) => {
                showNotification({
                  title: item?.message?.code,
                  message: JSON.stringify(item?.message?.details),
                  color: "red",
                  autoClose: 10000, // Giving more time to read error messages
                  withCloseButton: true,
                  icon: <IconX size={18} />,
                  position: "top-center",
                });
              });
            }

            let created_records = items?.find
              ? items?.find(
                  (item: any) => item?.message?.code === "execute_create"
                )?.data || []
              : null;
            let record = created_records ? created_records[0] : null;

            // console.log(created_record);
            //if created item push to the url
            if (record) {
              // Construct query parameters
              const queryParams: {
                profile_id: string;
                view_items?: string;
              } = {
                profile_id: String(
                  record?.profile_id || params?.profile_id || activeProfile?.id
                ),
              };

              // if (newViewIds?.length > 0) {
              //   queryParams.view_items = String(newViewIds);
              // }

              // Navigate with updated query parameters
              // go({
              //   query: queryParams,
              //   type: "push",
              // });

              go({
                to: {
                  resource: "sessions", // resource name or identifier
                  action: "show",
                  id: String(record?.id),
                },
                query: queryParams,
                type: "push",
              });

              setGlobalInputMode("developer");

              setShowRequestResponseView(true);
              setDisplaySessionEmbedMonitor(true);
            }

            resolve();
          },
        }
      );
    });
  };

  return (
    <div className="flex items-end w-full space-x-2">
      {/* <div>{JSON.stringify(autocompleteData)}</div> */}
      {/* <div>{JSON.stringify(state)}</div> */}

      <div className="flex-grow">
        {multiselect ? (
          <MultiSelect
            value={value ? value : []}
            onChange={enhancedHandleOnChangeMultiple}
            searchable={true}
            clearable={true}
            comboboxProps={{ withinPortal: withinPortal }}
            data={autocompleteData.filter((item) => {
              const entityTypeMatch = selected_filters
                .map((filter: FilterItem) => filter.entity_type)
                .includes(item.entity_type);

              if (!entityTypeMatch) return false;

              const matchingFilter = selected_filters.find(
                (filter: FilterItem) => filter.entity_type === item.entity_type
              );

              if (!matchingFilter?.metadata) return true;

              return Object.entries(matchingFilter?.metadata).every(
                ([key, value]) => item.metadata && item.metadata[key] === value
              );
            })}
            renderOption={(props) => renderSearchItem(props)}
            rightSection={isLoading ? <Loader size="xs" /> : null}
            placeholder={placeholder}
            label={label}
            description={description}
            error={isError ? error?.message : undefined}
            size={size}
            maxDropdownHeight={300}
            disabled={disabled}
          />
        ) : (
          <Select
            value={value ? value : null}
            searchable={true}
            clearable={true}
            onChange={enhancedHandleOnChange}
            comboboxProps={{ withinPortal: withinPortal }}
            ref={ref}
            data={
              data_items || selected_filters?.length < 1
                ? autocompleteData
                : autocompleteData.filter((item) => {
                    const entityTypeMatch = selected_filters
                      .map((filter: FilterItem) => filter.entity_type)
                      .includes(item.entity_type);

                    if (!entityTypeMatch) return false;

                    const matchingFilter = selected_filters.find(
                      (filter: FilterItem) =>
                        filter.entity_type === item.entity_type
                    );

                    if (!matchingFilter?.metadata) return true;

                    return Object.entries(matchingFilter?.metadata).every(
                      ([key, value]) =>
                        item.metadata && item.metadata[key] === value
                    );
                  })
            }
            renderOption={(props) => renderSearchItem(props)}
            rightSection={isLoading ? <Loader size="xs" /> : null}
            placeholder={placeholder}
            label={label}
            description={description}
            error={isError ? error?.message : undefined}
            size={size}
            maxDropdownHeight={300}
            disabled={disabled}
          />
        )}
      </div>

      {include_action_icons?.includes("filter") && (
        <Tooltip label="Filter results" position="top">
          <FilterComponent />
        </Tooltip>
      )}

      {/* {include_action_icons?.includes("info") && (
        <Reveal
          trigger="click"
          target={
            <Tooltip
              multiline
              w={220}
              withArrow
              transitionProps={{ duration: 200 }}
              label="info"
            >
              <ActionIcon size="xs" variant="default" aria-label="info">
                <IconInfoCircle size={18} />
              </ActionIcon>
            </Tooltip>
          }
        >
          <Documentation record={activeFilters}></Documentation>
        </Reveal>
      )} */}

      {include_action_icons?.includes("record_info") && (
        <Reveal
          trigger="click"
          target={
            <Tooltip
              multiline
              w={220}
              withArrow
              transitionProps={{ duration: 200 }}
              label="info"
            >
              <ActionIcon size="xs" variant="default" aria-label="info">
                <IconInfoCircle size={18} />
              </ActionIcon>
            </Tooltip>
          }
        >
          {data && (
            <MonacoEditor
              value={data.data
                ?.find(
                  (item: any) =>
                    item?.message?.code === state.success_message_code
                )
                ?.data[0]?.search_results?.map((item: any) => ({
                  ...item,
                  value: item.id,
                  label: item.name,
                }))
                .filter((item: any) => item?.id === value)}
              language="json"
              height="50vh"
            />
          )}
        </Reveal>
      )}

      {include_action_icons?.includes("explore") && (
        <Tooltip label="Explore" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Explore"
            onClick={() => console.log("Explore")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
          >
            <IconAffiliate size={18} />
          </ActionIcon>
          {/* <ExternalSubmitButton
            record={{}}
            entity_type="sessions"
            action_form_key={`query_${params?.id || activeTask?.id}`}
            action={"dublicate"}
            icon="copy"
          /> */}
        </Tooltip>
      )}

      {include_action_icons?.includes("dublicate") && (
        <Tooltip label="Dublicate" position="top">
          <ActionIcon
            size="sm"
            variant="filled"
            color="blue"
            radius="xl"
            aria-label="Dublicate"
            onClick={() => console.log("Dublicate")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
          >
            <IconCopy />
          </ActionIcon>
          {/* <ExternalSubmitButton
            record={value ? value : null}
            entity_type="sessions"
            action_form_key={`form_${params?.id}`}
            action={"dublicate"}
            icon="copy"
          /> */}
        </Tooltip>
      )}

      {include_action_icons?.includes("add_new") &&
        hasPermission("create_new") && (
          <Tooltip label="Add new" position="top">
            <ActionIcon
              size="sm"
              variant="filled"
              color="blue"
              radius="xl"
              aria-label="Add new"
              // onClick={() => console.log("Add new")}
              disabled={createMutationIsLoading}
              onClick={(e: any) =>
                handleAddNew(e, { entity_type: placeholder }, "create")
              }
              style={{ visibility: disabled ? "hidden" : "visible" }}
              // disabled={true}
            >
              <IconPlus />
            </ActionIcon>
            {/* <ExternalSubmitButton
            record={value ? value : null}
            entity_type="sessions"
            action_form_key={`form_${params?.id}`}
            action={"add_new"}
            icon="copy"
          /> */}
          </Tooltip>
        )}

      {/* {include_action_icons?.includes("add_new_large") && (
        <Tooltip label="Add new" position="top">
          <ActionIcon
            variant="outline"
            size="xl"
            color="blue"
            aria-label="Add new"
            onClick={() => console.log("Add new")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconSquareRoundedPlusFilled size={24} />
          </ActionIcon>
        </Tooltip>
      )} */}

      {include_action_icons?.includes("edit") && (
        <Tooltip label="Edit" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Edit"
            onClick={() => handleEdit(componentSelectedItem || record)}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconEdit size={18} />
          </ActionIcon>
        </Tooltip>
      )}

      {include_action_icons?.includes("delete_selected_item") && (
        <Tooltip label="Delete selected item" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="red"
            aria-label="Delete entity"
            onClick={() => console.log("Delete entity")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}

export default SearchInput;

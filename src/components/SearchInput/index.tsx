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

// Try to import the component registry if available
let getAllComponents;
try {
  // Using dynamic import to avoid errors if the module doesn't exist
  const componentRegistry = require("../NaturalLanguageEditor/componentRegistry");
  getAllComponents = componentRegistry.getAllComponents;
} catch (error) {
  // If the module doesn't exist, create a fallback
  getAllComponents = () => [];
}

function SearchInput<T extends Record<string, any>>(
  props: SearchInputComponentProps<T> & {
    includeComponents?: boolean;
    autoFocus?: boolean;
    compact?: boolean;
  }
) {
  const {
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
    // New props
    includeComponents = false,
    autoFocus = false,
    compact = false,
  } = props;

  const { data: user_session } = useSession();
  const [query, setQuery] = useState(value?.value || "");
  const go = useGo();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const [componentData, setComponentData] = useState<any[]>([]);
  const abortController = useRef<AbortController>();
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Setup debounced query
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [query]);

  // Auto-focus input when requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [autoFocus]);

  // Setup selected filters
  const selected_filters = activeFilters || [];

  // Setup query state
  const state = {
    query_name: func_name || "search",
    func_name: func_name || "search",
    name: func_name || "search",
    search_term: debouncedQuery,
    success_message_code: action_form_key || success_message_code,
    session_id: params?.id || params?.session_id || activeSession?.id,
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

  // Fetch data only if data_items is not provided
  const { data, isLoading, error, isError } = data_items
    ? { data: null, isLoading: false, error: null, isError: false }
    : useExecuteFunctionWithArgs(state);

  // Process fetched data or provided data_items
  useEffect(() => {
    if (data_items) {
      // If data_items is provided, use it directly
      setAutocompleteData(
        data_items.map((item: any) => ({
          ...item,
          value: item.id,
          label: item.name,
          resultType: "mention",
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
            resultType: "mention",
          })) || [];
      setAutocompleteData(results);
    }
  }, [data, data_items, state?.success_message_code]);

  // Load components if includeComponents is true
  useEffect(() => {
    if (includeComponents) {
      try {
        // Get standard components
        const components = getAllComponents([]);

        // Set components in state
        setComponentData(
          components.map((comp: any) => ({
            ...comp,
            resultType: "component",
          }))
        );

        // Add filter variables if available
        if (
          record?.variables_options &&
          Array.isArray(record.variables_options)
        ) {
          const filterComponents = record.variables_options.map(
            (variable: any) => ({
              id: `filter-triplet-${variable.value}`,
              // value: "values",
              value: `${variable.value}`,
              label: `${variable.label}`,
              // description: `${variable.label}`,
              description: "description",
              componentType: "FilterInputTriplet",
              resultType: "component",
              componentProps: {
                variable,
                compact: true,
              },
              variableType: variable.type,
            })
          );

          setComponentData((prevData) => [...prevData, ...filterComponents]);
        }
      } catch (error) {
        console.error("Error loading components:", error);
      }
    }
  }, [includeComponents, record?.variables_options]);

  /**
   * Handle selection for single select
   */
  const enhancedHandleOnChange = (value: any | null, option: any) => {
    if (value === null) {
      // Handle clearing the selection
      setTimeout(() => {
        if (handleOptionSubmit) handleOptionSubmit(null);
        if (onChange) onChange(null);
      }, 300);

      if (handleOptionSubmit) handleOptionSubmit(false);
      if (onChange) onChange(false);

      // Navigate if needed
      setTimeout(() => {
        if (navigateOnClear) {
          navigate(navigateOnClear);
        }
      }, 0);
      return;
    }

    // Find the selected item
    const combinedData = [...autocompleteData, ...componentData];
    let selectedItem =
      combinedData.find((item) => item.value === value) || option;

    if (selectedItem) {
      setComponentSelectedItem(selectedItem);

      // Special handling for component items
      if (selectedItem.resultType === "component") {
        // Special case for dynamic-filter
        if (selectedItem.id === "dynamic-filter" && record?.variables_options) {
          const enhancedItem = {
            ...selectedItem,
            componentProps: {
              ...selectedItem.componentProps,
              variables: record.variables_options,
            },
          };
          if (handleOptionSubmit) handleOptionSubmit(enhancedItem);
        }
        // Handle other component types
        else {
          if (handleOptionSubmit) handleOptionSubmit(selectedItem);
        }
      }
      // Handle regular mentions/items
      else {
        if (handleOptionSubmit) handleOptionSubmit(selectedItem);
      }

      if (onChange) onChange(selectedItem?.value);

      // Navigate if needed
      setTimeout(() => {
        if (navigateOnSelect) {
          navigate(navigateOnSelect);
        }
      }, 0);
    }
  };

  /**
   * Handle selection for multi-select
   */
  const enhancedHandleOnChangeMultiple = (value: string[]) => {
    if (value === null || value?.length === 0) {
      if (handleOptionSubmit) handleOptionSubmit([]);
      return;
    }

    // Combine both autocomplete data and component data for selection
    const combinedData = [...autocompleteData, ...componentData];
    const selectedItems = combinedData.filter((item: any) =>
      value?.includes(item.value)
    );

    if (selectedItems.length > 0) {
      setComponentSelectedItems(selectedItems);
      if (handleOptionSubmit) handleOptionSubmit(selectedItems);
    }
  };

  /**
   * Handle adding a new item
   */
  const handleAddNew = (
    e: React.MouseEvent,
    record: any,
    action: string
  ): Promise<void> => {
    e.stopPropagation();

    return new Promise((resolve, reject) => {
      const requestConfig = {
        headers: { "Content-Type": "application/json" },
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
        identity: identity,
        profile: {
          id:
            params?.profile_id ||
            activeProfile?.id ||
            user_session?.userProfile?.user_profile?.id ||
            identity?.email,
          name: params?.profile_id || activeProfile?.name || identity?.email,
        },
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

            // Show error notifications
            if (errorItems?.length > 0) {
              errorItems.forEach((item) => {
                showNotification({
                  title: item?.message?.code,
                  message: JSON.stringify(item),
                  color: "red",
                  autoClose: 10000,
                  withCloseButton: true,
                  icon: <IconX size={18} />,
                  position: "top-center",
                });
              });
            }

            reject(error);
          },
          onSuccess: (data) => {
            const response_data = data?.data;
            const items = Array.isArray(response_data)
              ? response_data
              : [response_data];

            queryClient.setQueryData(["create"], items);

            // Show error notifications if needed
            const errorItems = items.filter((item) => item.exit_code === 1);
            if (errorItems?.length > 0) {
              errorItems.forEach((item) => {
                showNotification({
                  title: item?.message?.code,
                  message: JSON.stringify(item?.message?.details),
                  color: "red",
                  autoClose: 10000,
                  withCloseButton: true,
                  icon: <IconX size={18} />,
                  position: "top-center",
                });
              });
            }

            // Handle successful record creation
            let created_records = items?.find
              ? items?.find(
                  (item: any) => item?.message?.code === "execute_create"
                )?.data || []
              : null;

            let record = created_records ? created_records[0] : null;

            if (record) {
              const queryParams = {
                profile_id: String(
                  record?.profile_id || params?.profile_id || activeProfile?.id
                ),
              };

              go({
                to: {
                  resource: "sessions",
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

  /**
   * Filter combined data based on entity types from active filters
   */
  const getCombinedData = () => {
    // Combine autocomplete data with component data if includeComponents is true
    const combinedData = includeComponents
      ? [...autocompleteData, ...componentData]
      : autocompleteData;

    // If no filters or using data_items directly, return all data
    if (data_items || selected_filters?.length < 1) {
      return combinedData;
    }

    // Filter the data
    return combinedData.filter((item) => {
      // Always include component items if includeComponents is true
      if (item.resultType === "component") return true;

      // Check if entity type matches
      const entityTypeMatch = selected_filters
        .map((filter: FilterItem) => filter.entity_type)
        .includes(item.entity_type);

      if (!entityTypeMatch) return false;

      // Check metadata
      const matchingFilter = selected_filters.find(
        (filter: FilterItem) => filter.entity_type === item.entity_type
      );

      if (!matchingFilter?.metadata) return true;

      return Object.entries(matchingFilter?.metadata).every(
        ([key, value]) => item.metadata && item.metadata[key] === value
      );
    });
  };

  // Render the component
  return (
    <div className="flex space-x-2 items-center">
      <div className="flex-grow">
        {multiselect ? (
          <MultiSelect
            value={value ? value : []}
            onChange={enhancedHandleOnChangeMultiple}
            searchable={true}
            clearable={true}
            comboboxProps={{ withinPortal: withinPortal }}
            data={getCombinedData()}
            renderOption={(props) => renderSearchItem(props)}
            rightSection={isLoading ? <Loader size="xs" /> : null}
            placeholder={placeholder}
            label={label}
            description={description}
            error={isError ? error?.message : undefined}
            size={size}
            maxDropdownHeight={300}
            disabled={disabled}
            ref={inputRef}
          />
        ) : (
          <Select
            value={value ? value : null}
            searchable={true}
            clearable={true}
            onChange={enhancedHandleOnChange}
            comboboxProps={{ withinPortal: withinPortal }}
            ref={inputRef}
            data={getCombinedData()}
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

      {/* Action icons */}
      {include_action_icons?.includes("filter") && (
        <Tooltip label="Filter results" position="top">
          <FilterComponent />
        </Tooltip>
      )}

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
          >
            <IconAffiliate size={18} />
          </ActionIcon>
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
          >
            <IconCopy />
          </ActionIcon>
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
              disabled={createMutationIsLoading}
              onClick={(e: any) =>
                handleAddNew(e, { entity_type: placeholder }, "create")
              }
              style={{ visibility: disabled ? "hidden" : "visible" }}
            >
              <IconPlus />
            </ActionIcon>
          </Tooltip>
        )}

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

import {
  ActionIcon,
  Loader,
  MultiSelect,
  Select,
  Tooltip,
  Group,
  Text,
  Box,
  Badge,
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
  IconBrandTailwind,
  IconComponents,
  IconForms,
  IconCalendar,
  IconFilter,
  IconNumber,
  IconSelect,
  IconCheckbox,
  IconSearch,
  IconLetterT,
  IconList,
  IconAt,
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
import variablesService from "src/services/variablesService";
import { Variable } from "@components/DynamicFilter";

// Import the component registry types and functions
import {
  getAllComponents,
  EmbeddableComponent,
} from "../NaturalLanguageEditor/componentRegistry";

/**
 * Helper function to get an appropriate icon for a variable type
 */
const getVariableIcon = (type: string) => {
  switch (type) {
    case "date":
    case "datetime":
      return <IconCalendar size={16} />;
    case "number":
      return <IconNumber size={16} />;
    case "string":
      return <IconLetterT size={16} />;
    case "select":
    case "multiselect":
      return <IconList size={16} />;
    case "boolean":
      return <IconCheckbox size={16} />;
    default:
      return <IconFilter size={16} />;
  }
};

/**
 * Helper function to get the appropriate icon for component types
 */
const getComponentIcon = (componentType: string) => {
  switch (componentType) {
    case "DateInput":
      return <IconCalendar size={16} />;
    case "NumberInput":
      return <IconNumber size={16} />;
    case "TextInput":
      return <IconForms size={16} />;
    case "Select":
      return <IconSelect size={16} />;
    case "MultiSelect":
      return <IconSelect size={16} />;
    case "Checkbox":
      return <IconCheckbox size={16} />;
    case "DynamicFilter":
      return <IconFilter size={16} />;
    case "SearchInput":
      return <IconSearch size={16} />;
    case "FilterInputTriplet":
      return <IconFilter size={16} />;
    default:
      return <IconComponents size={16} />;
  }
};

/**
 * Enhanced render function for components
 */
const renderComponent = (props: any) => {
  const {
    option,
    checked,
    onMouseOver,
    onMouseDown,
    className,
    classNames,
    styles,
    ...others
  } = props;

  const isFilterTriplet = option.componentType === "FilterInputTriplet";

  return (
    <Box
      className={className}
      onMouseOver={onMouseOver}
      onMouseDown={onMouseDown}
      sx={{
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        backgroundColor: checked ? "rgba(0, 0, 0, 0.08)" : "transparent",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        },
      }}
      {...others}
    >
      <Group position="apart" noWrap spacing="xs">
        <Group noWrap spacing="xs">
          {option.icon || getComponentIcon(option.componentType)}
          <div>
            <Text size="sm" weight={500}>
              {option.label}
            </Text>
            <Text size="xs" color="dimmed">
              {option.description}
            </Text>
          </div>
        </Group>
        {isFilterTriplet ? (
          <Badge color="blue" size="xs">
            Filter
          </Badge>
        ) : (
          <Badge color="green" size="xs">
            Component
          </Badge>
        )}
      </Group>
    </Box>
  );
};

/**
 * Enhanced render function combining both regular items and components
 */
const renderSearchOrComponentItem = (props: any) => {
  const { option } = props;

  // If it's a component, use the component renderer
  if (option.resultType === "component") {
    return renderComponent(props);
  }

  // Otherwise use the regular search item renderer
  return renderSearchItem(props);
};

/**
 * SearchInput component with support for embedding components
 */
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
  // New prop for component embedding
  includeComponents = false,
}: SearchInputComponentProps<T> & { includeComponents?: boolean }) {
  const { data: user_session } = useSession();
  const [query, setQuery] = useState(value?.value || "");
  const go = useGo();
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const [componentData, setComponentData] = useState<EmbeddableComponent[]>([]);
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

  /**
   * Load filter variables from the service
   */
  const loadFilterVariables = async () => {
    try {
      // If record already has variables_options, use those instead of fetching
      if (
        record?.variables_options &&
        Array.isArray(record.variables_options)
      ) {
        return createFilterComponents(record.variables_options);
      }

      // Otherwise, get filter variables from service
      const variables = await variablesService.getFilterVariables();
      return createFilterComponents(variables);
    } catch (error) {
      console.error("Error loading filter variables:", error);
      return [];
    }
  };

  /**
   * Convert variables to component format
   */
  const createFilterComponents = (variables: Variable[]) => {
    return variables.map((variable) => ({
      id: `filter-triplet-${variable.value}`,
      value: `filter-triplet-${variable.value}`,
      label: `${variable.label} Filter`,
      description: `Filter by ${variable.label}`,
      componentType: "FilterInputTriplet",
      resultType: "component",
      componentProps: {
        variable,
        compact: true,
      },
      icon: getVariableIcon(variable.type),
      variableType: variable.type,
    }));
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

  // Load filter variables when includeComponents is true
  useEffect(() => {
    if (includeComponents) {
      // Load filter variable components
      loadFilterVariables().then((filterComponents) => {
        setComponentData((prevData) => {
          // Avoid duplicates by filtering out existing items
          const newData = [...prevData];
          filterComponents.forEach((comp) => {
            if (!newData.some((existing) => existing.id === comp.id)) {
              newData.push(comp);
            }
          });
          return newData;
        });
      });
    }
  }, [includeComponents, record?.variables_options]);

  // Load standard components when includeComponents is true
  useEffect(() => {
    if (includeComponents) {
      // Get available standard components from registry (excluding filter triplets which we handle separately)
      const standardComponents = getAllComponents([]).filter(
        (comp) => comp.componentType !== "FilterInputTriplet"
      );

      // Filter components based on search query
      const filteredComponents = debouncedQuery
        ? standardComponents.filter(
            (comp) =>
              comp.label.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              comp.description
                .toLowerCase()
                .includes(debouncedQuery.toLowerCase())
          )
        : standardComponents;

      // Update component data with standard components
      setComponentData((prevData) => {
        // Keep filter triplet components
        const filterComponents = prevData.filter(
          (comp) => comp.componentType === "FilterInputTriplet"
        );

        // Add standard components
        return [...filterComponents, ...filteredComponents];
      });
    }
  }, [includeComponents, debouncedQuery]);

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
          icon: <IconAt size={16} />,
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
            icon: <IconAt size={16} />,
          })) || [];
      setAutocompleteData(results);
    }
  }, [data, data_items, state?.success_message_code]);

  // Combine autocomplete data with component data if includeComponents is true
  const combinedData = includeComponents
    ? [...autocompleteData, ...componentData]
    : autocompleteData;

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
    } else {
      // Find the selected item
      let selectedItem = combinedData.find((item) => item.value === value);
      if (selectedItem) {
        setComponentSelectedItem(selectedItem);

        // Special handling for component items
        if (selectedItem.resultType === "component") {
          // Special case for dynamic-filter
          if (
            selectedItem.id === "dynamic-filter" &&
            record?.variables_options
          ) {
            // Modify the component props to include the variables from the record
            const enhancedItem = {
              ...selectedItem,
              componentProps: {
                ...selectedItem.componentProps,
                variables: record.variables_options,
              },
            };
            if (handleOptionSubmit) handleOptionSubmit(enhancedItem);
          }
          // Special case for filter triplets
          else if (selectedItem.componentType === "FilterInputTriplet") {
            if (handleOptionSubmit) handleOptionSubmit(selectedItem);
          }
          // Any other component
          else {
            if (handleOptionSubmit) handleOptionSubmit(selectedItem);
          }
        }
        // Handle regular mentions
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
    }
  };

  /**
   * Handle selection for multi-select
   */
  const enhancedHandleOnChangeMultiple = (value: string[]) => {
    if (value === null || value?.length == 0) {
      if (handleOptionSubmit) handleOptionSubmit([]);
      return;
    } else {
      const selectedItems = combinedData.filter((item: any) =>
        value?.includes(item.value)
      );
      if (selectedItems) {
        setComponentSelectedItems(selectedItems);
        if (handleOptionSubmit) handleOptionSubmit(selectedItems);
      }
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
  const getFilteredData = () => {
    // Safety check for combinedData
    if (!combinedData || !Array.isArray(combinedData)) {
      return [];
    }

    // If no filters or using data_items directly, return all data
    if (data_items || selected_filters?.length < 1) {
      return combinedData;
    }

    // Filter the data
    return combinedData.filter((item) => {
      // Always include component items if includeComponents is true
      if (item.resultType === "component") return true;

      // Safety check for selected_filters
      if (!Array.isArray(selected_filters)) return true;

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

  /**
   * Group results by type
   */
  const getGroupedData = () => {
    const filteredData = getFilteredData();

    // Safety check
    if (!includeComponents || !filteredData || filteredData.length === 0) {
      return filteredData;
    }

    // Add groups for Select component
    const dataWithGroups = [];

    // Add regular items with a group header
    const regularItems = filteredData.filter(
      (item) => item.resultType !== "component"
    );
    if (regularItems.length > 0) {
      dataWithGroups.push({
        group: "Results",
        disabled: true,
        value: "group-results",
      });
      dataWithGroups.push(...regularItems);
    }

    // Add filter triplet components
    const filterItems = filteredData.filter(
      (item) =>
        item.resultType === "component" &&
        item.componentType === "FilterInputTriplet"
    );
    if (filterItems.length > 0) {
      dataWithGroups.push({
        group: "Filters",
        disabled: true,
        value: "group-filters",
      });
      dataWithGroups.push(...filterItems);
    }

    // Add other components
    const otherComponents = filteredData.filter(
      (item) =>
        item.resultType === "component" &&
        item.componentType !== "FilterInputTriplet"
    );
    if (otherComponents.length > 0) {
      dataWithGroups.push({
        group: "Components",
        disabled: true,
        value: "group-components",
      });
      dataWithGroups.push(...otherComponents);
    }

    return dataWithGroups;
  };

  // Render the component
  return (
    <div className="flex w-full space-x-2 items-center">
      <div className="flex-grow">
        {multiselect ? (
          <MultiSelect
            value={value ? value : []}
            onChange={enhancedHandleOnChangeMultiple}
            searchable={true}
            clearable={true}
            comboboxProps={{ withinPortal: withinPortal }}
            data={getFilteredData()}
            renderOption={(props) => renderSearchOrComponentItem(props)}
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
            data={getGroupedData()}
            renderOption={(props) => renderSearchOrComponentItem(props)}
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

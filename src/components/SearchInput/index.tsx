import {
  ActionIcon,
  Loader,
  MultiSelect,
  Select,
  Tooltip,
} from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useFetchQueryDataByState, useNavigation } from "@components/Utils";
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
} from "@tabler/icons-react";
import FilterComponent from "@components/Filter";
import { useGetIdentity, useGo, useParsed } from "@refinedev/core";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import Documentation from "@components/Documentation";
import ExternalSubmitButton from "@components/SubmitButton";
import { useSession } from "next-auth/react";

function SearchInput<T extends Record<string, any>>({
  activeFilters,
  success_message_code = "search query results",
  placeholder = "Search",
  label,
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
  collections,
  action_form_key,
}: SearchInputComponentProps<T>) {
  const { data: user_session } = useSession();
  const [query, setQuery] = useState(value?.value || "");
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
  } = useAppStore();
  const navigate = useNavigation();

  const globalActiveFilters = searchFilters.filter(
    (filter: FilterItem) => filter.is_selected
  );

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
    query_name: query_name || "search",
    search_term: debouncedQuery,
    success_message_code: action_form_key || success_message_code,
    session_id: params?.id || params?.session_id || activeSession?.id,
    // task_id: params?.id || activeTask?.id,
    application_id: params?.application_id || activeApplication?.id,
    view_id: params?.view_id || activeView?.id,
    profile_id: params?.profile_id || activeProfile?.id,
    author_id: identity?.email,
    user_id: String(user_session?.userProfile?.user?.id),
    tables:
      collections ||
      selected_filters
        .map((filter: { entity_type: any }) => filter.entity_type)
        .join(", "),
  };

  // Only fetch data if data_items is not provided
  const { data, isLoading, error, isError } = data_items
    ? { data: null, isLoading: false, error: null, isError: false }
    : useFetchQueryDataByState(state);

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

  return (
    <div className="flex items-end w-full space-x-2">
      {/* <div>{JSON.stringify(autocompleteData)}</div> */}
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
          {/* <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Dublicate"
            onClick={() => console.log("Dublicate")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
          >
            <IconCopy size={24} />
          </ActionIcon> */}
          <ExternalSubmitButton
            record={value ? value : null}
            entity_type="sessions"
            action_form_key={`form_${params?.id}`}
            action={"dublicate"}
            icon="copy"
          />
        </Tooltip>
      )}

      {include_action_icons?.includes("add_new") && (
        <Tooltip label="Add new" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Add new"
            onClick={() => console.log("Add new")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            disabled={true}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
      )}

      {include_action_icons?.includes("add_new_large") && (
        <Tooltip label="Add new" position="top">
          <ActionIcon
            variant="outline"
            color="blue"
            aria-label="Add new"
            onClick={() => console.log("Add new")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconSquareRoundedPlusFilled />
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

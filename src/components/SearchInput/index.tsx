import { ActionIcon, Autocomplete, Loader, Tooltip } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useFetchQueryDataByState, useNavigation } from "@components/Utils";
import renderSearchItem from "@components/SearchItem";
import { useAppStore } from "src/store";
import { FilterItem, SearchInputComponentProps } from "@components/interfaces";
import { IconCopy, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import FilterComponent from "@components/Filter";
import { useGo } from "@refinedev/core";

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
  navigateOnSelect = false,
}: SearchInputComponentProps<T>) {
  const [query, setQuery] = useState(value || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const abortController = useRef<AbortController>();
  const { searchFilters, activeTask, activeApplication, activeSession } =
    useAppStore();
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

  let selected_filters =
    activeFilters || schema?.activeFilters || globalActiveFilters;

  const state = {
    query_name: "search",
    search_term: debouncedQuery,
    success_message_code: success_message_code,
    session_id: activeSession?.id,
    task_id: activeTask?.id,
    application_id: activeApplication?.id,
    tables: selected_filters
      .map((filter: { entity_type: any }) => filter.entity_type)
      .join(", "),
  };

  const { data, isLoading, error, isError } = useFetchQueryDataByState(state);

  useEffect(() => {
    if (data) {
      const results =
        data.data
          ?.find((item: any) => item?.message?.code === success_message_code)
          ?.data[0]?.search_results?.map((item: any) => ({
            ...item,
            value: item.id,
            label: item.name,
          })) || [];
      // console.log("search results setting autocompletedata effect", results);
      setAutocompleteData(results);
      // console.log("results", results);
      // search results with query and set
      // replaceIdWithItem(query, results || []);
    }
  }, [data, success_message_code]);

  const enhancedHandleOptionSubmit = (value: string | null) => {
    // if value is null just run handleOptionSubmit
    if (value === "remove_from_state") {
      // setActiveTask(null);
      // alert("Task removed from state");
      // console.log("enhancedHandleOptionSubmit", value);
      setQuery("");
      if (navigateOnSelect) navigate({ entity_type: "tasks" }); // this will trigger navigating to url specified when there is no record?.id i.e null for instance go to /home
      // set to false to avoid triggering refetch and then after a while set back to null so it can be refetched when using links
      // Set a timeout to set the task to null after a delay
      setTimeout(() => {
        // setActiveTask(null); // Now set it to null after navigating
        if (handleOptionSubmit) handleOptionSubmit(null);
        if (onChange) onChange(null);
      }, 3000); // Adjust the delay time (500ms) as necessary
      if (handleOptionSubmit) handleOptionSubmit(false);
      if (onChange) onChange(false);
      return;
    } else {
      const selectedItem = autocompleteData.find(
        (item: any) => item.value === value
      );
      // console.log("selectedItem", selectedItem);
      if (selectedItem) {
        if (handleOptionSubmit) handleOptionSubmit(selectedItem);
        if (onChange) onChange(selectedItem?.value);
        if (navigateOnSelect) {
          navigate(selectedItem);
        }
      }
    }
  };

  return (
    <div className="flex items-end w-full space-x-2">
      {/* {JSON.stringify(state)} */}
      {/* {JSON.stringify(selected_filters)} */}
      <div className="flex-grow">
        <Autocomplete
          value={query}
          onChange={setQuery}
          data={autocompleteData.filter((item: any) =>
            selected_filters
              .map((filter: any) => filter.entity_type)
              .includes(item.entity_type)
          )}
          // data={autocompleteData}
          renderOption={(props) => renderSearchItem(props)}
          rightSection={isLoading ? <Loader size="xs" /> : null}
          placeholder={placeholder}
          label={label}
          description={description}
          error={isError ? error?.message : undefined}
          // limit={10}
          size={size}
          maxDropdownHeight={300}
          onOptionSubmit={enhancedHandleOptionSubmit}
          disabled={disabled}
        />
      </div>
      {include_action_icons?.includes("filter") && (
        <Tooltip label="Filter results" position="top">
          <FilterComponent />
        </Tooltip>
      )}
      {include_action_icons?.includes("remove_from_state") && (
        <Tooltip label="Remove from state" position="top">
          <ActionIcon
            size="xs"
            variant="default"
            aria-label="Clear from state"
            onClick={() => enhancedHandleOptionSubmit("remove_from_state")}
            // onClick={() => console.log("Clear from state")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {include_action_icons?.includes("dublicate") && (
        <Tooltip label="Dublicate" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Dublicate"
            onClick={() => console.log("Dublicate")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            disabled={true}
          >
            <IconCopy size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {include_action_icons?.includes("add_new_item") && (
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

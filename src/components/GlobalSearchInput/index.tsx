import { ActionIcon, Autocomplete, Loader, Tooltip } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useFetchQueryDataByState, useNavigation } from "@components/Utils";
import renderSearchItem from "@components/SearchItem";
import { useAppStore } from "src/store";
import {
  FilterItem,
  GlobalSearchInputComponentProps,
} from "@components/interfaces";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import FilterComponent from "@components/Filter";
import MonacoEditor from "@components/MonacoEditor";

function GlobalSearchInput<T extends Record<string, any>>({
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
}: GlobalSearchInputComponentProps<T>) {
  const [query, setQuery] = useState(value || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const abortController = useRef<AbortController>();
  const { searchFilters } = useAppStore();
  const navigate = useNavigation();

  // const globalActiveFilters = searchFilters.filter(
  //   (filter: FilterItem) => filter.is_selected
  // );

  // useEffect(() => {
  //   // console.log("search input effect", query);

  //   const handler = debounce(() => {
  //     setDebouncedQuery(query);
  //   }, 300);

  //   handler();
  //   return () => {
  //     handler.cancel();
  //   };
  // }, [query]);

  // let selected_filters =
  //   activeFilters || schema?.activeFilters || globalActiveFilters;

  // const state = {
  //   query_name: "search",
  //   search_term: debouncedQuery,
  //   success_message_code,
  //   // filters: selected_filters,
  //   tables: selected_filters
  //     .map((filter: { entity_type: any }) => filter.entity_type)
  //     .join(", "),
  // };

  // const { data, isLoading, error, isError } = useFetchQueryDataByState(state);

  // useEffect(() => {
  //   if (data) {
  //     const results =
  //       data.data
  //         ?.find((item: any) => item?.message?.code === success_message_code)
  //         ?.data[0]?.search_results?.map((item: any) => ({
  //           ...item,
  //           value: item.id,
  //           label: item.name,
  //         })) || [];
  //     // console.log("search results setting autocompletedata effect", results);
  //     setAutocompleteData(results);
  //     // console.log("results", results);
  //     // search results with query and set
  //     // replaceIdWithItem(query, results || []);
  //   }
  // }, [data, success_message_code]);

  // const enhancedHandleOptionSubmit = (value: string | null) => {
  //   // console.log("enhancedHandleOptionSubmit", value);
  //   const selectedItem = autocompleteData.find(
  //     (item: any) => item.value === value
  //   );
  //   // console.log("selectedItem", selectedItem);
  //   if (selectedItem) {
  //     if (handleOptionSubmit) handleOptionSubmit(selectedItem);
  //     if (onChange) onChange(selectedItem?.value);
  //     navigate(selectedItem);
  //   }
  // };

  // const replaceIdWithItem = (value: string | null, results: any) => {
  //   console.log("replaceIdWithItem", value);
  //   const selectedItem = results.find((item: any) => item.value === value);
  //   console.log("results", results);
  //   console.log("selectedItem", selectedItem);
  //   if (selectedItem) {
  //     if (handleOptionSubmit) handleOptionSubmit(selectedItem);
  //     if (onChange) onChange(selectedItem?.value);
  //     navigate(selectedItem);
  //   }
  // };

  // perform the initial search after render if the query is not empty
  // useEffect(() => {
  //   if (query) {
  //     setDebouncedQuery(query);
  //     // enhancedHandleOptionSubmit(query);
  //     enhancedHandleOptionSubmit(query);
  //   }
  // }, []);

  return (
    <div className="flex items-end w-full space-x-2">
      <div className="flex-grow">
        <MonacoEditor value={""} language="sql" height="60px" />
        {/* <Autocomplete
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
          maxDropdownHeight={300}
          onOptionSubmit={enhancedHandleOptionSubmit}
          disabled={disabled}
        /> */}
        {/* <div>global search input</div> */}
      </div>
      {include_action_icons?.includes("filter") && (
        <Tooltip label="Filter results" position="top">
          <FilterComponent />
        </Tooltip>
      )}
      {/* {include_action_icons?.includes("remove_from_state") && (
        <Tooltip label="Remove from state" position="top">
          <ActionIcon
            size="xs"
            variant="default"
            aria-label="Clear from state"
            onClick={() => enhancedHandleOptionSubmit(null)}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      )} */}
      {/* {include_action_icons?.includes("add_new_item") && (
        <Tooltip label="Add new item" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Add new entity"
            onClick={() => console.log("Add new entity")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
      )} */}
      {/* {include_action_icons?.includes("delete_selected_item") && (
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
      )} */}
    </div>
  );
}

export default GlobalSearchInput;

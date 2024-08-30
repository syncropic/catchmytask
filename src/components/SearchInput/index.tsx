import {
  Autocomplete,
  Loader,
  Group,
  Text,
  Spoiler,
  Badge,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { useFetchQueryDataByState } from "@components/Utils";
import renderSearchItem from "@components/SearchItem";
import { useAppStore } from "src/store";
import { FilterItem } from "@components/interfaces";

interface SearchInputComponentProps<T extends Record<string, any>> {
  sessions_list: T[];
  record: T;
  view_item: T;
}

function SearchInput<T extends Record<string, any>>({
  sessions_list,
  record,
  view_item,
}: SearchInputComponentProps<T>) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { searchFilters, setSearchFilters } = useAppStore();

  // Ensure TypeScript knows searchFilters is an array of FilterItem objects
  const activeFilters = searchFilters.filter(
    (filter: FilterItem) => filter.is_selected
  );

  // Update debounced query after a delay
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 300);

    handler();
    return () => {
      handler.cancel();
    };
  }, [query]);

  let success_message_code = "search query results";

  // Prepare the state object for your custom hook
  const state = {
    query_name: "search",
    search_term: debouncedQuery,
    success_message_code: success_message_code,
    filters: activeFilters,
  };

  const { data, isLoading, isError, error } = useFetchQueryDataByState(state);

  // Map the search results to the required structure
  const autocompleteData =
    data?.data
      ?.find((item: any) => item?.message?.code === success_message_code)
      ?.data[0]?.search_results?.map((item: any) => ({
        value: item.id, // Use the unique ID of the item as the value
        label: item.name, // Assign 'label' for the Autocomplete component to recognize
        description: item.description,
        table_name: item.table_name,
        entity_type: item.entity_type,
        author_id: item.author_id,
      })) || [];

  return (
    <Autocomplete
      value={query}
      onChange={setQuery}
      data={autocompleteData.filter((item: any) =>
        activeFilters
          .map((filter: any) => filter.name)
          .includes(item.entity_type)
      )}
      renderOption={(props) => renderSearchItem(props)} // Use custom render function
      rightSection={isLoading ? <Loader size="xs" /> : null}
      placeholder="Search"
      error={isError ? error?.message : undefined}
      limit={10} // Limit the number of items rendered at once
      maxDropdownHeight={300} // Control the maximum height of the dropdown
      comboboxProps={{ transitionProps: { transition: "pop", duration: 200 } }}
    />
  );
}

export default SearchInput;

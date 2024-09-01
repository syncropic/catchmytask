import { ActionIcon, Autocomplete, Loader, Tooltip } from "@mantine/core";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { useFetchQueryDataByState, useNavigation } from "@components/Utils";
import renderSearchItem from "@components/SearchItem";
import { useAppStore } from "src/store";
import { FilterItem, SearchInputComponentProps } from "@components/interfaces";
import { IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import FilterComponent from "@components/Filter";

function SearchInput<T extends Record<string, any>>({
  activeFilters,
  success_message_code = "search query results",
  placeholder = "Search",
  label,
  description,
  handleOptionSubmit = () => {},
  defaultValue,
  disabled,
  include_action_icons,
}: SearchInputComponentProps<T>) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { searchFilters } = useAppStore();

  // Ensure TypeScript knows searchFilters is an array of FilterItem objects
  const globalActiveFilters = searchFilters.filter(
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

  let selected_filters = activeFilters || globalActiveFilters;

  // Prepare the state object for your custom hook
  const state = {
    query_name: "search",
    search_term: debouncedQuery,
    success_message_code: success_message_code,
    filters: selected_filters,
  };

  const { data, isLoading, isError, error } = useFetchQueryDataByState(state);
  const navigate = useNavigation(); // Get the navigation function

  // Map the search results to the required structure
  const autocompleteData =
    data?.data
      ?.find((item: any) => item?.message?.code === success_message_code)
      ?.data[0]?.search_results?.map((item: any) => ({
        value: item.id, // Use the unique ID of the item as the value
        label: item.name, // Assign 'label' for the Autocomplete component to recognize
        description: item.description,
        entity_type: item.entity_type,
        author_id: item.author_id,
        id: item.id,
        name: item.name,
      })) || [];

  const enhancedHandleOptionSubmit = (value: string) => {
    // console.log(value);
    const selectedItem = autocompleteData.find(
      (item: any) => item.value === value
    );
    if (selectedItem) {
      handleOptionSubmit(selectedItem); // Pass the selected
      navigate(selectedItem); // Navigate using the session ID
    }
  };

  return (
    <div className="flex items-end w-full space-x-2">
      <div className="flex-grow">
        {/* <SearchInput
              placeholder={placeholder}
              description={description}
              activeFilters={activeFilters}
              disabled={disabled}
              defaultValue={defaultValue}
            /> */}
        <Autocomplete
          value={defaultValue || query}
          onChange={setQuery}
          data={autocompleteData.filter((item: any) =>
            selected_filters
              .map((filter: any) => filter.name)
              .includes(item.entity_type)
          )}
          renderOption={(props) => renderSearchItem(props)} // Use custom render function
          rightSection={isLoading ? <Loader size="xs" /> : null}
          placeholder={placeholder}
          label={label}
          description={description}
          error={isError ? error?.message : undefined}
          limit={10} // Limit the number of items rendered at once
          maxDropdownHeight={300} // Control the maximum height of the dropdown
          onOptionSubmit={enhancedHandleOptionSubmit} // Handle option submission
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
            onClick={() => handleOptionSubmit(null)}
            style={{ visibility: disabled ? "hidden" : "visible" }}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      {include_action_icons?.includes("add_new_item") && (
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

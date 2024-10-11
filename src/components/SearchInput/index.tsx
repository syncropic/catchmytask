import { ActionIcon, Autocomplete, Loader, Tooltip } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
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
  onChange,
  handleOptionSubmit,
  value,
  disabled,
  include_action_icons,
  schema,
  size,
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
    // console.log("search input effect", query);

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
    // console.log("enhancedHandleOptionSubmit", value);
    const selectedItem = autocompleteData.find(
      (item: any) => item.value === value
    );
    // console.log("selectedItem", selectedItem);
    if (selectedItem) {
      if (handleOptionSubmit) handleOptionSubmit(selectedItem);
      if (onChange) onChange(selectedItem?.value);
      console.log("navigate", selectedItem);
      navigate(selectedItem);
    }
  };

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

  // Define the read record state for fetching the template
  // let read_session_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: currentTemplateValue,
  //   record: { id: currentTemplateValue },
  //   read_record_mode: "remote",
  // };

  // Fetch the template using the existing hook
  // const {
  //   data: templateData,
  //   isLoading: templateIsLoading,
  //   error: templateError,
  // } = useReadRecordByState(read_session_state);

  // useEffect(() => {
  //   // Only make the call if the template value has changed and is not null/undefined
  //   if (currentTemplateValue) {
  //     // Update the previous template value
  //     // previousTemplateValue.current = currentTemplateValue;

  //     // Check if data is fully fetched and available
  //     if (templateData && !templateIsLoading && !templateError) {
  //       const templateRecord = templateData?.data?.find(
  //         (item: any) => item?.message?.code === currentTemplateValue
  //       )?.data[0];

  //       if (templateRecord) {
  //         console.log(
  //           "Fetched Template data before setting form values:",
  //           templateRecord
  //         );
  //         // form.setFieldValue("name", templateRecord.name ?? "");
  //         // form.setFieldValue("query", templateRecord.query ?? "");
  //         // setTemplateUpdate((prev) => prev + 1);
  //         // set field values in bulk
  //         let keysToExclude = [
  //           "id",
  //           "author_id",
  //           "created_datetime",
  //           "updated_datetime",
  //           "deleted_datetime",
  //           "added_datetime",
  //           "author",
  //           "entity_type",
  //         ];
  //         Object.entries(templateRecord).forEach(([key, value]) => {
  //           if (!keysToExclude.includes(key)) {
  //             form.setFieldValue(key, value);
  //           }
  //         });
  //       }
  //     } else if (templateError) {
  //       console.error("Error fetching template data:", templateError);
  //     }
  //   }
  // }, [
  //   currentTemplateValue,
  //   templateData,
  //   templateIsLoading,
  //   templateError,
  //   form,
  // ]);

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
            onClick={() => enhancedHandleOptionSubmit(null)}
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

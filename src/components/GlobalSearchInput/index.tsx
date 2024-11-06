import {
  ActionIcon,
  Autocomplete,
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
import { FilterItem, SearchInputComponentProps } from "@components/interfaces";
import {
  IconCopy,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import FilterComponent from "@components/Filter";
import { useGo } from "@refinedev/core";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import Documentation from "@components/Documentation";

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
}: SearchInputComponentProps<T>) {
  // const [query, setQuery] = useState(value || "");
  const [query, setQuery] = useState(value?.value || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [autocompleteData, setAutocompleteData] = useState<any[]>([]);
  const abortController = useRef<AbortController>();
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

  let selected_filters =
    activeFilters || schema?.activeFilters || globalActiveFilters;

  const state = {
    query_name: "search",
    search_term: debouncedQuery,
    success_message_code: success_message_code,
    session_id: activeSession?.id,
    task_id: activeTask?.id,
    application_id: activeApplication?.id,
    view_id: activeView?.id,
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

  // const enhancedHandleOptionSubmit = (
  //   value: string | null,
  //   componentSelectedItem: any
  // ) => {
  //   // if value is null just run handleOptionSubmit
  //   if (value === "remove_from_state") {
  //     // setActiveTask(null);
  //     // alert("Task removed from state");
  //     // console.log("enhancedHandleOptionSubmit", value);
  //     setQuery("");
  //     // if (navigateOnSelect)
  //     //   navigate({ entity_type: componentSelectedItem?.entity_type }); // this will trigger navigating to url specified when there is no record?.id i.e null for instance go to /home
  //     // // set to false to avoid triggering refetch and then after a while set back to null so it can be refetched when using links
  //     // Set a timeout to set the task to null after a delay
  //     setTimeout(() => {
  //       // setActiveTask(null); // Now set it to null after navigating
  //       if (handleOptionSubmit) handleOptionSubmit(null);
  //       if (onChange) onChange(null);
  //     }, 3000); // Adjust the delay time (500ms) as necessary
  //     if (handleOptionSubmit) handleOptionSubmit(false);
  //     if (onChange) onChange(false);
  //     setTimeout(() => {
  //       if (navigateOnClear) {
  //         navigate(navigateOnClear);
  //       }
  //     }, 0);
  //     return;
  //   } else {
  //     const selectedItem = autocompleteData.find(
  //       (item: any) => item.value === value
  //     );
  //     console.log("selectedItem", selectedItem);
  //     if (selectedItem) {
  //       setComponentSelectedItem(selectedItem);
  //       if (handleOptionSubmit) handleOptionSubmit(selectedItem);
  //       if (onChange) onChange(selectedItem?.value);
  //       // if (navigateOnSelect) {
  //       //   navigate(navigateOnSelect);
  //       // }
  //       // Navigate after a short delay to ensure state has updated
  //       setTimeout(() => {
  //         if (navigateOnSelect) {
  //           navigate(navigateOnSelect);
  //         }
  //       }, 0);
  //     }
  //   }
  // };

  const enhancedHandleOnChange = (value: any | null, option: any) => {
    // if value is null just run handleOptionSubmit
    if (value === null) {
      // // setActiveTask(null);
      // // alert("Task removed from state");
      // // console.log("enhancedHandleOptionSubmit", value);
      // setQuery("");
      // // if (navigateOnSelect)
      // //   navigate({ entity_type: componentSelectedItem?.entity_type }); // this will trigger navigating to url specified when there is no record?.id i.e null for instance go to /home
      // // // set to false to avoid triggering refetch and then after a while set back to null so it can be refetched when using links
      // // Set a timeout to set the task to null after a delay
      setTimeout(() => {
        // setActiveTask(null); // Now set it to null after navigating
        if (handleOptionSubmit) handleOptionSubmit(null);
        if (onChange) onChange(null);
      }, 3000); // Adjust the delay time (500ms) as necessary
      if (handleOptionSubmit) handleOptionSubmit(false);
      if (onChange) onChange(false);
      setTimeout(() => {
        if (navigateOnClear) {
          navigate(navigateOnClear);
        }
      }, 0);
      return;
    } else {
      // const selectedItem = autocompleteData.find(
      //   (item: any) => item.value === value
      // );
      // console.log("selectedItem", selectedItem);
      let selectedItem = option;
      if (selectedItem) {
        setComponentSelectedItem(selectedItem);
        if (handleOptionSubmit) handleOptionSubmit(selectedItem);
        if (onChange) onChange(selectedItem?.value);
        // if (navigateOnSelect) {
        //   navigate(navigateOnSelect);
        // }
        // Navigate after a short delay to ensure state has updated
        setTimeout(() => {
          if (navigateOnSelect) {
            navigate(navigateOnSelect);
          }
        }, 0);
      }
    }
  };

  const enhancedHandleOnChangeMultiple = (value: string[]) => {
    // if value is null just run handleOptionSubmit
    if (value === null || value?.length == 0) {
      // // setActiveTask(null);
      // // alert("Task removed from state");
      // // console.log("enhancedHandleOptionSubmit", value);
      // setQuery("");
      // // if (navigateOnSelect)
      // //   navigate({ entity_type: componentSelectedItem?.entity_type }); // this will trigger navigating to url specified when there is no record?.id i.e null for instance go to /home
      // // // set to false to avoid triggering refetch and then after a while set back to null so it can be refetched when using links
      // // Set a timeout to set the task to null after a delay
      // setTimeout(() => {
      //   // setActiveTask(null); // Now set it to null after navigating
      //   if (handleOptionSubmit) handleOptionSubmit(null);
      //   if (onChange) onChange(null);
      // }, 3000); // Adjust the delay time (500ms) as necessary
      // if (handleOptionSubmit) handleOptionSubmit(false);
      // if (onChange) onChange(false);
      // setTimeout(() => {
      //   if (navigateOnClear) {
      //     navigate(navigateOnClear);
      //   }
      // }, 0);
      // console.log(value);
      if (handleOptionSubmit) handleOptionSubmit([]);
      return;
    } else {
      const selectedItems = autocompleteData.filter((item: any) =>
        value?.includes(item.value)
      );
      // console.log("selectedItems", selectedItems);
      // let selectedItem = option;
      if (selectedItems) {
        setComponentSelectedItems(selectedItems);
        if (handleOptionSubmit) handleOptionSubmit(selectedItems);
        // if (onChange) onChange(selectedItem?.value);
        // // if (navigateOnSelect) {
        // //   navigate(navigateOnSelect);
        // // }
        // // Navigate after a short delay to ensure state has updated
        // setTimeout(() => {
        //   if (navigateOnSelect) {
        //     navigate(navigateOnSelect);
        //   }
        // }, 0);
      }
      // console.log(value);
    }
  };

  return (
    <div className="flex items-end w-full space-x-2">
      {/* {JSON.stringify(state)} */}
      {/* {JSON.stringify(selected_filters)} */}
      <div className="flex-grow">
        {/* <Autocomplete
          value={query}
          onChange={setQuery}
          // data={autocompleteData.filter((item: any) =>
          //   selected_filters
          //     .map((filter: any) => filter.entity_type)
          //     .includes(item.entity_type)
          // )}
          data={autocompleteData.filter((item) => {
            // First check if the entity_type matches
            const entityTypeMatch = selected_filters
              .map((filter: FilterItem) => filter.entity_type)
              .includes(item.entity_type);

            if (!entityTypeMatch) return false;

            // Then check if there are any metadata filters to apply
            const matchingFilter = selected_filters.find(
              (filter: FilterItem) => filter.entity_type === item.entity_type
            );

            // If there's no metadata field in the filter, just return the entity_type match
            if (!matchingFilter.metadata) return true;

            // If there is metadata, check if all metadata conditions match
            return Object.entries(matchingFilter.metadata).every(
              ([key, value]) => item.metadata && item.metadata[key] === value
            );
          })}
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
          onOptionSubmit={(item) =>
            enhancedHandleOptionSubmit(item, componentSelectedItem)
          }
          disabled={disabled}
        /> */}
        {/* {JSON.stringify(value)} */}
        {multiselect ? (
          <MultiSelect
            value={value ? value : []}
            // value={[]}
            onChange={enhancedHandleOnChangeMultiple}
            searchable={true}
            clearable={true}
            comboboxProps={{ withinPortal: withinPortal }}
            // onChange={enhancedHandleOnChange}
            // data={autocompleteData.filter((item: any) =>
            //   selected_filters
            //     .map((filter: any) => filter.entity_type)
            //     .includes(item.entity_type)
            // )}
            data={autocompleteData.filter((item) => {
              // First check if the entity_type matches
              const entityTypeMatch = selected_filters
                .map((filter: FilterItem) => filter.entity_type)
                .includes(item.entity_type);

              if (!entityTypeMatch) return false;

              // Then check if there are any metadata filters to apply
              const matchingFilter = selected_filters.find(
                (filter: FilterItem) => filter.entity_type === item.entity_type
              );

              // If there's no metadata field in the filter, just return the entity_type match
              if (!matchingFilter.metadata) return true;

              // If there is metadata, check if all metadata conditions match
              return Object.entries(matchingFilter.metadata).every(
                ([key, value]) => item.metadata && item.metadata[key] === value
              );
            })}
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
            // onOptionSubmit={(item) =>
            //   enhancedHandleOptionSubmit(item, componentSelectedItem)
            // }
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
            // data={autocompleteData.filter((item: any) =>
            //   selected_filters
            //     .map((filter: any) => filter.entity_type)
            //     .includes(item.entity_type)
            // )}
            data={autocompleteData.filter((item) => {
              // First check if the entity_type matches
              const entityTypeMatch = selected_filters
                .map((filter: FilterItem) => filter.entity_type)
                .includes(item.entity_type);

              if (!entityTypeMatch) return false;

              // Then check if there are any metadata filters to apply
              const matchingFilter = selected_filters.find(
                (filter: FilterItem) => filter.entity_type === item.entity_type
              );

              // If there's no metadata field in the filter, just return the entity_type match
              if (!matchingFilter.metadata) return true;

              // If there is metadata, check if all metadata conditions match
              return Object.entries(matchingFilter.metadata).every(
                ([key, value]) => item.metadata && item.metadata[key] === value
              );
            })}
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
            // onOptionSubmit={(item) =>
            //   enhancedHandleOptionSubmit(item, componentSelectedItem)
            // }
            disabled={disabled}
          />
        )}
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
            onClick={() =>
              enhancedHandleOptionSubmit(
                "remove_from_state",
                componentSelectedItem
              )
            }
            // onClick={() => console.log("Clear from state")}
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      )} */}
      {include_action_icons?.includes("info") && (
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
          <MonacoEditor value={activeView} language="json" height="50vh" />
        </Reveal>
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
      {include_action_icons?.includes("edit") && (
        <Tooltip label="Edit" position="top">
          <ActionIcon
            size="xs"
            variant="filled"
            color="blue"
            aria-label="Edit"
            onClick={() => handleEdit(componentSelectedItem || record)} // improve later to include plural, but check for empty and use records instead
            style={{ visibility: disabled ? "hidden" : "visible" }}
            // disabled={true}
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

import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { SearchInputComponentProps } from "@components/interfaces";
import { useAppStore } from "src/store";

export function CustomComponentsView() {
  const {
    activeMainCustomComponent,
    setActiveMainCustomComponent,
    activeRecordCustomComponent,
    setActiveRecordCustomComponent,
    setActiveSummaryCustomComponents,
    activeSummaryCustomComponents,
    activeView,
  } = useAppStore();
  // const navigateToSession = useSessionNavigation(); // Get the navigation function
  // const handleOptionSubmit = (value: string) => {
  //   // navigateToSession(value, autocompleteData); // Pass the actual sessions list
  // };
  const handleSetActiveSummaryCustomComponents = (item: any) => {
    // console.log("handleSetActiveSummaryCustomComponents");
    // console.log(item);
    setActiveSummaryCustomComponents(activeView?.id, item);
  };
  return (
    <>
      {/* <div>{JSON.stringify(activeApplication?.disabled_sections)}</div> */}
      {/* <SearchInput
        placeholder="Search for applications"
        description="applications"
        value={activeApplication?.id || ""}
        disabled={activeApplication?.disabled_sections?.includes(
          "select_application"
        )}
        activeFilters={[
          {
            id: 1,
            name: "applications",
            description: "applications",
            entity_type: "applications",
            is_selected: true,
          },
        ]}
        navigateOnSelect={{ resource: "applications" }}
      /> */}
      {/* <SearchInput
        placeholder="Search for sessions"
        description="sessions"
        handleOptionSubmit={setActiveSession}
        value={activeSession?.name || ""}
        disabled={activeApplication?.disabled_sections?.includes(
          "select_session"
        )}
        include_action_icons={[]}
        activeFilters={[
          {
            id: 1,
            name: "sessions",
            description: "sessions",
            entity_type: "sessions",
            is_selected: true,
          },
        ]}
        navigateOnSelect={{ resource: "sessions" }}
      /> */}
      {/* <SearchInput
        placeholder="Search for tasks"
        description="tasks"
        handleOptionSubmit={setActiveTask}
        value={activeTask?.id || ""}
        include_action_icons={["add_new_item", "dublicate"]}
        navigateOnSelect={{ resource: "tasks" }}
        navigateOnClear={{ resource: "home" }}
        activeFilters={[
          {
            id: 1,
            name: "tasks",
            description: "tasks",
            entity_type: "tasks",
            is_selected: true,
          },
        ]}
      /> */}
      <SearchInput
        placeholder="summaries"
        description="summaries"
        handleOptionSubmit={handleSetActiveSummaryCustomComponents}
        // value={
        //   activeSummaryCustomComponents?.[activeView?.id] ||
        //   []?.map((item: any) => item?.id)
        // }
        // value={activeSummaryCustomComponents?.[activeView?.id]}
        value={activeSummaryCustomComponents?.[activeView?.id]?.map(
          (item: any) => item?.id
        )}
        multiselect={true}
        // include_action_icons={["add_new_item", "dublicate"]}
        // navigateOnSelect={{ resource: "views" }}
        // navigateOnClear={{ resource: "home" }}
        activeFilters={[
          {
            id: 1,
            name: "components",
            description: "components",
            entity_type: "components",
            is_selected: true,
            metadata: {
              section: "summary",
            },
          },
        ]}
      />

      <SearchInput
        placeholder="main components"
        description="main"
        handleOptionSubmit={setActiveMainCustomComponent}
        value={activeMainCustomComponent?.id || ""}
        // include_action_icons={["add_new_item", "dublicate"]}
        // navigateOnSelect={{ resource: "views" }}
        // navigateOnClear={{ resource: "home" }}
        activeFilters={[
          {
            id: 1,
            name: "components",
            description: "components",
            entity_type: "components",
            is_selected: true,
            metadata: {
              section: "main",
            },
          },
        ]}
      />
      <SearchInput
        placeholder="record components"
        description="record"
        handleOptionSubmit={setActiveRecordCustomComponent}
        value={activeRecordCustomComponent?.id || ""}
        // include_action_icons={["add_new_item", "dublicate"]}
        // navigateOnSelect={{ resource: "views" }}
        // navigateOnClear={{ resource: "home" }}
        activeFilters={[
          {
            id: 1,
            name: "components",
            description: "components",
            entity_type: "components",
            is_selected: true,
            metadata: {
              section: "record",
            },
          },
        ]}
      />
      {/* <SearchInput
        placeholder="Search for records"
        description="records"
        // onChange={setActiveActionStep}
        // value={activeActionStep?.name}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "records",
            description: "records",
            entity_type: "records",
            is_selected: true,
          },
        ]}
      /> */}
    </>
  );
}

export default CustomComponentsView;

import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { SearchInputComponentProps } from "@components/interfaces";
import { useAppStore } from "src/store";

export function StateView() {
  const {
    activeApplication,
    setActiveSession,
    activeSession,
    activeTask,
    setActiveTask,
  } = useAppStore();
  // const navigateToSession = useSessionNavigation(); // Get the navigation function
  // const handleOptionSubmit = (value: string) => {
  //   // navigateToSession(value, autocompleteData); // Pass the actual sessions list
  // };
  return (
    <>
      {/* <div>{JSON.stringify(activeApplication?.disabled_sections)}</div> */}
      <SearchInput
        placeholder="Search for applications"
        description="applications"
        value={activeApplication?.name || ""}
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
      />
      <SearchInput
        placeholder="Search for sessions"
        description="sessions"
        handleOptionSubmit={setActiveSession}
        value={activeSession?.name || ""}
        disabled={activeApplication?.disabled_sections?.includes(
          "select_session"
        )}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "sessions",
            description: "sessions",
            entity_type: "sessions",
            is_selected: true,
          },
        ]}
      />
      <SearchInput
        placeholder="Search for tasks"
        description="tasks"
        handleOptionSubmit={setActiveTask}
        value={activeTask?.name || ""}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "tasks",
            description: "tasks",
            entity_type: "tasks",
            is_selected: true,
          },
        ]}
      />
      {/* <SearchInput
        placeholder="Search for action steps"
        description="action steps"
        handleOptionSubmit={setActiveActionStep}
        value={activeActionStep?.name || ""}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "action_steps",
            description: "action steps",
            entity_type: "action_steps",
            is_selected: true,
          },
        ]}
      /> */}
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

export default StateView;

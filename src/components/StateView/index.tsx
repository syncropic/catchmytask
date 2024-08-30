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
    activeActionStep,
    setActiveActionStep,
  } = useAppStore();
  // const navigateToSession = useSessionNavigation(); // Get the navigation function
  // const handleOptionSubmit = (value: string) => {
  //   // navigateToSession(value, autocompleteData); // Pass the actual sessions list
  // };
  return (
    <>
      <SearchInput
        placeholder="Search for applications"
        description="applications"
        defaultValue={activeApplication?.name || ""}
        disabled
        activeFilters={[
          {
            id: 1,
            name: "applications",
            description: "applications",
            is_selected: true,
          },
        ]}
      />
      <SearchInput
        placeholder="Search for sessions"
        description="sessions"
        handleOptionSubmit={setActiveSession}
        defaultValue={activeSession?.name || ""}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "sessions",
            description: "sessions",
            is_selected: true,
          },
        ]}
      />
      <SearchInput
        placeholder="Search for tasks"
        description="tasks"
        handleOptionSubmit={setActiveTask}
        defaultValue={activeTask?.name || ""}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "tasks",
            description: "tasks",
            is_selected: true,
          },
        ]}
      />
      <SearchInput
        placeholder="Search for action steps"
        description="action steps"
        handleOptionSubmit={setActiveActionStep}
        defaultValue={activeActionStep?.name || ""}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "action_steps",
            description: "action steps",
            is_selected: true,
          },
        ]}
      />
      <SearchInput
        placeholder="Search for records"
        description="records"
        // handleOptionSubmit={setActiveActionStep}
        // defaultValue={activeActionStep?.name}
        include_action_icons={["remove_from_state"]}
        activeFilters={[
          {
            id: 1,
            name: "records",
            description: "records",
            is_selected: true,
          },
        ]}
      />
    </>
  );
}

export default StateView;

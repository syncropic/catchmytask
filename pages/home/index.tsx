import SearchInput from "@components/SearchInput";
import { Text, Title } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
import React from "react";
import { useAppStore } from "src/store";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { activeApplication, activeTask, setActiveTask } = useAppStore();

  return (
    <div className="flex flex-col items-center">
      {/* <Title order={3}>Get Important Things Done.</Title> */}
      {/* as a default not task related, allow user to perform related search across all connected services with a given profile or dynamic filters */}
      {/* <SearchInput
          placeholder="Global search connected services"
          description="global search"
          handleOptionSubmit={setActiveTask}
          value={activeTask?.name || ""}
          include_action_icons={["filter"]}
          navigateOnSelect={true}
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
      {/* <div>results board</div> */}
    </div>
  );
};
export default PageList;

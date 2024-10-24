import { ActionIcon, Card, Text } from "@mantine/core";
import { IconX, IconPlus, IconTrash } from "@tabler/icons-react";
import SearchInput from "@components/SearchInput";
import { SearchInputComponentProps } from "@components/interfaces";
import { useAppStore } from "src/store";
import dynamic from "next/dynamic";

// Dynamically import Nivo components to support ESM
// const ResponsivePie = dynamic(
//   () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
//   { ssr: false }
// );
// const ResponsiveLine = dynamic(
//   () => import("@nivo/line").then((mod) => mod.ResponsiveLine),
//   { ssr: false }
// );
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((mod) => mod.ResponsiveBar),
  { ssr: false }
);

export function RecordSummaryView({ record }: { record: any }) {
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

      {/* <SearchInput
        placeholder="Search for tasks"
        description="tasks"
        handleOptionSubmit={setActiveTask}
        value={activeTask?.name || ""}
        include_action_icons={[
          "remove_from_state",
          "add_new_item",
          "dublicate",
        ]}
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
      <Card shadow="sm" p="lg" className="bg-white mb-8">
        <Text className="font-bold mb-4">Issues by Resolution Status</Text>
        <div className="h-80">
          <ResponsiveBar
            data={[
              { category: "closed", issues: 10 },
              { category: "open", issues: 16 },
              { category: "pending", issues: 4 },
            ]}
            keys={["issues"]}
            indexBy="category"
            margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
            colors={({ data }) => {
              if (data.category === "closed") return "#66BB6A"; // Pleasant green
              if (data.category === "open") return "#EF5350"; // Pleasant red
              if (data.category === "pending") return "#FFA726"; // Pleasant orange
              return "#888"; // Default color
            }}
            axisBottom={{
              legend: "Category",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{ legend: "Issues", legendOffset: -40 }}
          />
        </div>
      </Card>
    </>
  );
}

export default RecordSummaryView;

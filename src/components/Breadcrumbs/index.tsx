import {
  Breadcrumbs as MantineBreadcrumbs,
  Tooltip,
  Text,
} from "@mantine/core";
import { useAppStore } from "src/store";

function Breadcrumbs() {
  const { activeApplication, activeSession, activeTask } = useAppStore();

  // Build the breadcrumb items dynamically with tooltips
  const items = [];

  if (activeApplication) {
    items.push({
      title: activeApplication.name,
      type: "Application",
    });
  }

  if (activeSession) {
    items.push({
      title: activeSession.name,
      type: "Session",
    });
  }

  if (activeTask) {
    items.push({
      title: activeTask.name,
      type: "Task",
    });
  }

  const breadcrumbItems = items.map((item, index) => (
    <Tooltip key={index} label={item.type} withArrow>
      <Text size="sm" className="text-blue-500 whitespace-normal">
        {item.title}
      </Text>
    </Tooltip>
  ));

  return (
    <div className="flex flex-wrap items-start py-2">
      <MantineBreadcrumbs
        separator="→"
        separatorMargin="md"
        mt="xs"
        className="flex flex-wrap"
      >
        {breadcrumbItems}
      </MantineBreadcrumbs>
    </div>
  );
}

export default Breadcrumbs;

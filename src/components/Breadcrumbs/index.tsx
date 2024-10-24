import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { getLabel, getTooltipLabel } from "@components/Utils";
import {
  Breadcrumbs as MantineBreadcrumbs,
  Tooltip,
  Text,
} from "@mantine/core";
import { useAppStore } from "src/store";

function Breadcrumbs() {
  const { activeApplication, activeSession, activeTask, activeView } = useAppStore();

  // Build the breadcrumb items dynamically with tooltips
  const items = [];

  if (activeApplication) {
    items.push({
      ...activeApplication,
      title: activeApplication.name,
      type: "Application",
    });
  }

  if (activeSession) {
    items.push({
      ...activeSession,
      title: activeSession.name,
      type: "Session",
    });
  }

  if (activeTask) {
    items.push({
      ...activeTask,
      title: activeTask.name,
      type: "Task",
    });
  }

  if (activeView) {
    items.push({
      ...activeView,
      title: activeView.name,
      type: "View",
    });
  }

  const breadcrumbItems = items.map((item, index) => (
    <Reveal
      trigger="click"
      key={index}
      target={
        <Tooltip
          multiline
          w={220}
          withArrow
          transitionProps={{ duration: 200 }}
          label={getTooltipLabel(item)}
        >
          <Text size="sm" className="text-blue-500 whitespace-normal">
            {getLabel(item)}
          </Text>
        </Tooltip>
      }
    >
      <MonacoEditor value={item} language="json" height="50vh" />
    </Reveal>
  ));

  // do not propage the click event to the parent

  return (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      {/* <div>State</div> */}
      <div className="flex flex-wrap items-start py-2">
        <MantineBreadcrumbs
          separator="→"
          separatorMargin="md"
          mt="xs"
          className="flex flex-wrap"
        >
          State {breadcrumbItems}
        </MantineBreadcrumbs>
      </div>
    </div>
  );
}

export default Breadcrumbs;

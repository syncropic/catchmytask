import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  getLabel,
  getTooltipLabel,
  sanitizeFilters,
  useFetchExecutionData,
  useFetchQueryDataByState,
  useReadByState,
  useReadRecordByState,
} from "@components/Utils";
import { useParsed } from "@refinedev/core";
import { useDuckDB } from "pages/_app";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { viewQueryAccordionConfig } from "./viewQueryAccordionConfig";
import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
import { ActionInputForm } from "@components/ActionInput";
import { titleAccordionConfig } from "./titleAccordionConfig";
import { Tooltip, Text } from "@mantine/core";
import Reveal from "@components/Reveal";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { IconInfoCircle } from "@tabler/icons-react";
import { viewItemsAccordionConfig } from "./viewItemsAccordionConfig";

interface ExecutionDataFetcherProps {
  view: any;
  view_id: string;
  task_id: string;
  session_id: string;
  onStepFetched: () => void;
}

export function ExecutionDataFetcher({
  // step,
  view,
  onStepFetched,
  view_id,
  task_id,
  session_id,
}: ExecutionDataFetcherProps) {
  const { activeApplication, activeTask } = useAppStore();
  const { data, isLocalDBSuccess, isLoading } = useFetchExecutionData({
    success_message_code:
      view?.success_message_code || activeTask?.success_message_code,
    id: view_id || activeTask?.id,
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: session_id,
    },
    task: {
      id: task_id,
    },
    view: {
      id: view_id,
    },
    view_record: view,
    include_action_steps:
      view.initial_state?.action_steps ||
      activeTask?.initial_state?.action_steps,
    action: {
      name: "read",
    },
  });

  useEffect(() => {
    if (!isLoading && isLocalDBSuccess) {
      onStepFetched(); // Notify parent that this step is fetched
    }
  }, [isLoading, isLocalDBSuccess]);

  return null; // This component doesn't render any UI
}

export default ExecutionDataFetcher;

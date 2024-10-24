import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  aliasDataFields,
  createIssueIdSubquery,
  generateTableAlias,
  isAllLocalDBSuccess,
  useActionStepsData,
  useReadByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useDuckDB } from "pages/_app"; // Import the useDuckDB hook
import { set } from "lodash";

interface ViewProps {}

export function View({}: ViewProps) {
  const dbInstance = useDuckDB(); // Get DuckDB instance
  const {
    dataFields,
    activeTask,
    action_input_form_values,
    setActionInputFormValues,
    views,
  } = useAppStore(); // Zustand store access

  const [fetchedSteps, setFetchedSteps] = useState<Record<string, boolean>>({});
  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinInProgress, setIsJoinInProgress] = useState(false);

  const search_action_input_form_values_key = `search_${activeTask?.id}`;

  const globalSearchQuery = useAppStore(
    (state) =>
      state.action_input_form_values[`${search_action_input_form_values_key}`]
        ?.query
  );

  return (
    <>
      <div>view component</div>
      {/* {isLoading ? (
        <div>Loading...</div>
      ) : dataItems.length > 0 ? (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          display="datagridview"
          // data_fields={filteredDataFields}
          data_fields={views["catchmyvibe"]?.fields || []}
        />
      ) : (
        <div>No data available</div>
      )} */}
    </>
  );
}

export default View;

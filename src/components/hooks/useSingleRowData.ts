// hooks/useSingleRowData.ts

import { useState, useEffect, useCallback } from "react";
import { useDuckDB } from "pages/_app";
import { useAppStore } from "src/store";
import {
  buildSQLQuery,
  enrichFilters,
  replaceGlobalSearchQuery,
  sanitizeFilters,
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";

interface UseSingleRowDataProps<T> {
  record: any;
  rowIdentifier?: string; // e.g., "TOTAL" - if not provided, returns first row
  debug?: boolean;
}

interface UseSingleRowDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: any;
  componentRecord: any;
  queryDebugInfo?: {
    originalQuery: string;
    processedQuery: string;
    timestamp: number;
  };
}

export const useSingleRowData = <T = any>({
  record,
  rowIdentifier = "TOTAL",
  debug = false,
}: UseSingleRowDataProps<T>): UseSingleRowDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [queryDebugInfo, setQueryDebugInfo] =
    useState<UseSingleRowDataReturn<T>["queryDebugInfo"]>();

  const dbInstance = useDuckDB();
  const { activeView, action_input_form_values } = useAppStore();

  // Calculate the search form values key
  const search_action_input_form_values_key = `query_${activeView?.id}`;

  // Get global search query from store
  const globalSearchQuery = useAppStore(
    (state) =>
      state.action_input_form_values[`${search_action_input_form_values_key}`]
        ?.query
  );

  // Set up search model state
  const active_view_search_model_state = {
    id: activeView?.id,
    query_name: "data_model",
    name: activeView?.["action_models"]?.["search"],
    success_message_code: "action_input_data_model_schema",
  };

  // Fetch search model data using existing hook
  const {
    data: active_view_search_model_data,
    error: active_view_search_model_error,
  } = useFetchQueryDataByState(active_view_search_model_state);

  // Extract and process search filters
  const search_filters = active_view_search_model_data?.data?.find(
    (item: any) => item?.message?.code === "action_input_data_model_schema"
  )?.data[0]?.data_model?.schema?.search_filters;

  const enriched_search_filters = enrichFilters(
    search_filters,
    action_input_form_values[`${search_action_input_form_values_key}`]
  );

  // Build the SQL query
  const rendered_globalSearchQuery = buildSQLQuery(
    globalSearchQuery,
    sanitizeFilters(enriched_search_filters),
    { caseSensitive: false }
  )?.query;

  // Fetch component data using existing hook
  const {
    data: componentData,
    isLoading: componentIsLoading,
    error: componentError,
  } = useReadRecordByState({
    credential: "surrealdb catchmytask dev",
    success_message_code: record?.id,
    record: record,
    read_record_mode: "remote",
  });

  // Extract component record
  const componentRecord = componentData?.data?.find(
    (item: any) => item?.message?.code === record?.id
  )?.data[0];

  // Memoize the query execution
  const executeQuery = useCallback(async () => {
    if (!componentRecord?.query || !dbInstance) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let processedQuery = componentRecord.query;

      // Only process global search query if it exists
      if (rendered_globalSearchQuery) {
        processedQuery = replaceGlobalSearchQuery(
          componentRecord.query,
          rendered_globalSearchQuery
        );
      }

      if (debug) {
        setQueryDebugInfo({
          originalQuery: componentRecord.query,
          processedQuery,
          timestamp: Date.now(),
        });
        console.group("useSingleRowData Debug Info");
        console.log("Original Query:", componentRecord.query);
        console.log("Global Search Query:", rendered_globalSearchQuery);
        console.log("Processed Query:", processedQuery);
        console.log("Timestamp:", new Date().toISOString());
        console.groupEnd();
      }

      const result = await dbInstance.query(processedQuery);
      const rows = result.toArray();

      // Find the specific row or take the first one
      const targetRow = rowIdentifier
        ? rows.find((row: any) => row.group === rowIdentifier)
        : rows[0];

      if (targetRow) {
        setData(targetRow as T);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Error executing query:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    componentRecord?.query,
    dbInstance,
    rendered_globalSearchQuery,
    rowIdentifier,
    debug,
  ]);

  // Effect to execute query when dependencies change
  useEffect(() => {
    executeQuery();
  }, [
    executeQuery,
    globalSearchQuery,
    search_filters,
    action_input_form_values[search_action_input_form_values_key],
  ]);

  return {
    data,
    isLoading: isLoading || componentIsLoading,
    error: error || componentError || active_view_search_model_error,
    componentRecord,
    queryDebugInfo: debug ? queryDebugInfo : undefined,
  };
};

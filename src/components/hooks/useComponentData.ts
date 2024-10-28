// // hooks/useComponentData.ts

// import { useState, useEffect } from "react";
// import { useDuckDB } from "pages/_app";
// import { useAppStore } from "src/store";
// import {
//   buildSQLQuery,
//   enrichFilters,
//   replaceGlobalSearchQuery,
//   sanitizeFilters,
//   useFetchQueryDataByState,
//   useReadRecordByState,
// } from "@components/Utils";

// interface UseComponentDataProps {
//   record: any;
// }

// interface UseComponentDataReturn {
//   dataItems: any[];
//   isLoading: boolean;
//   error: any;
//   componentRecord: any;
// }

// export const useComponentData = ({
//   record,
// }: UseComponentDataProps): UseComponentDataReturn => {
//   const [dataItems, setDataItems] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const dbInstance = useDuckDB();
//   const { activeView, action_input_form_values } = useAppStore();

//   // Calculate the search form values key
//   const search_action_input_form_values_key = `query_${activeView?.id}`;

//   // Get global search query from store
//   const globalSearchQuery = useAppStore(
//     (state) =>
//       state.action_input_form_values[`${search_action_input_form_values_key}`]
//         ?.query
//   );

//   // Set up search model state
//   const active_view_search_model_state = {
//     id: activeView?.id,
//     query_name: "data_model",
//     name: activeView?.["action_models"]?.["search"],
//     success_message_code: "action_input_data_model_schema",
//   };

//   // Fetch search model data
//   const {
//     data: active_view_search_model_data,
//     isLoading: active_view_search_model_isLoading,
//     error: active_view_search_model_error,
//   } = useFetchQueryDataByState(active_view_search_model_state);

//   // Extract search filters
//   const active_view_search_model_data_data_model_search_filters =
//     active_view_search_model_data?.data?.find(
//       (item: any) => item?.message?.code === "action_input_data_model_schema"
//     )?.data[0]?.data_model?.schema?.search_filters;

//   // Enrich and process filters
//   const enriched_search_filters = enrichFilters(
//     active_view_search_model_data_data_model_search_filters,
//     action_input_form_values[`${search_action_input_form_values_key}`]
//   );

//   // Build the SQL query
//   const rendered_globalSearchQuery = buildSQLQuery(
//     globalSearchQuery,
//     sanitizeFilters(enriched_search_filters),
//     { caseSensitive: false }
//   )?.query;

//   // Set up record state for component data
//   const read_component_data_record_state = {
//     credential: "surrealdb catchmytask dev",
//     success_message_code: record?.id,
//     record: record,
//     read_record_mode: "remote",
//   };

//   // Fetch component data
//   const {
//     data: componentData,
//     isLoading: componentIsLoading,
//     error: componentError,
//   } = useReadRecordByState(read_component_data_record_state);

//   // Extract component record
//   const componentRecord = componentData?.data?.find(
//     (item: any) =>
//       item?.message?.code ===
//       read_component_data_record_state?.success_message_code
//   )?.data[0];

//   // Effect to execute query when dependencies change
//   useEffect(() => {
//     const executeQuery = async () => {
//       if (!componentRecord?.query || !dbInstance || !rendered_globalSearchQuery)
//         return;

//       try {
//         let query = replaceGlobalSearchQuery(
//           componentRecord.query,
//           rendered_globalSearchQuery
//         );
//         console.log("custom component query");
//         console.log(query);
//         const result = await dbInstance.query(query);
//         setDataItems(result.toArray());
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error executing query:", error);
//       }
//     };

//     executeQuery();
//   }, [componentRecord?.query, dbInstance, rendered_globalSearchQuery]);

//   return {
//     dataItems,
//     isLoading: isLoading || componentIsLoading,
//     error: componentError,
//     componentRecord,
//   };
// };

// hooks/useComponentData.ts

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

interface UseComponentDataProps {
  record: any;
  debug?: boolean;
}

interface UseComponentDataReturn {
  dataItems: any[];
  isLoading: boolean;
  error: any;
  componentRecord: any;
  queryDebugInfo?: {
    originalQuery: string;
    processedQuery: string;
    timestamp: number;
  };
}

export const useComponentData = ({
  record,
  debug = false,
}: UseComponentDataProps): UseComponentDataReturn => {
  const [dataItems, setDataItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryDebugInfo, setQueryDebugInfo] =
    useState<UseComponentDataReturn["queryDebugInfo"]>();
  const [error, setError] = useState<any>(null);

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

  // Fetch search model data
  const {
    data: active_view_search_model_data,
    isLoading: active_view_search_model_isLoading,
    error: active_view_search_model_error,
  } = useFetchQueryDataByState(active_view_search_model_state);

  // Extract search filters
  const search_filters = active_view_search_model_data?.data?.find(
    (item: any) => item?.message?.code === "action_input_data_model_schema"
  )?.data[0]?.data_model?.schema?.search_filters;

  // Enrich and process filters
  const enriched_search_filters = enrichFilters(
    search_filters,
    action_input_form_values[`${search_action_input_form_values_key}`]
  );

  // Build the SQL query - memoize this to prevent unnecessary rebuilds
  const rendered_globalSearchQuery = buildSQLQuery(
    globalSearchQuery,
    sanitizeFilters(enriched_search_filters),
    { caseSensitive: false }
  )?.query;

  // Set up record state for component data
  const read_component_data_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: record?.id,
    record: record,
    read_record_mode: "remote",
  };

  // Fetch component data
  const {
    data: componentData,
    isLoading: componentIsLoading,
    error: componentError,
  } = useReadRecordByState(read_component_data_record_state);

  // Extract component record
  const componentRecord = componentData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      read_component_data_record_state?.success_message_code
  )?.data[0];

  // Memoize the query execution to prevent unnecessary reruns
  const executeQuery = useCallback(async () => {
    if (!componentRecord?.query || !dbInstance || !rendered_globalSearchQuery) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let processedQuery = replaceGlobalSearchQuery(
        componentRecord.query,
        rendered_globalSearchQuery
      );

      if (debug) {
        setQueryDebugInfo({
          originalQuery: componentRecord.query,
          processedQuery,
          timestamp: Date.now(),
        });
        console.group("useComponentData Debug Info");
        console.log("Original Query:", componentRecord.query);
        console.log("Global Search Query:", rendered_globalSearchQuery);
        console.log("Processed Query:", processedQuery);
        console.log("Timestamp:", new Date().toISOString());
        console.groupEnd();
      }

      const result = await dbInstance.query(processedQuery);
      const resultArray = result.toArray();
      setDataItems(resultArray);
    } catch (error) {
      console.error("Error executing query:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [componentRecord?.query, dbInstance, rendered_globalSearchQuery, debug]);

  // Effect to execute query when dependencies change
  useEffect(() => {
    executeQuery();
  }, [
    executeQuery, // This includes all the dependencies we care about
    globalSearchQuery, // Explicitly add globalSearchQuery to ensure we catch all changes
    search_filters, // Add search filters changes
    action_input_form_values[search_action_input_form_values_key], // Add form values changes
  ]);

  return {
    dataItems,
    isLoading:
      isLoading || componentIsLoading || active_view_search_model_isLoading,
    error: error || componentError || active_view_search_model_error,
    componentRecord,
    queryDebugInfo: debug ? queryDebugInfo : undefined,
  };
};

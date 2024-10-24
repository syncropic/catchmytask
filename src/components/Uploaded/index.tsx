import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  aliasDataFields,
  concatenateAliasedDataFields,
  createIssueIdSubquery,
  enrichFilters,
  generateTableAlias,
  getPreferredColumn,
  getQueryFieldMetadata,
  isAllLocalDBSuccess,
  useActionStepsData,
  useFetchQueryDataByState,
  useReadByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useDuckDB } from "pages/_app"; // Import the useDuckDB hook
import { set } from "lodash";
import nunjucks from 'nunjucks';

interface AggregateActionStepResultsProps {
  action_steps?: any[];
}

export function AggregateActionStepResults({
  action_steps = [],
}: AggregateActionStepResultsProps) {
  const dbInstance = useDuckDB(); // Get DuckDB instance
  const {
    dataFields,
    activeTask,
    action_input_form_values,
    setActionInputFormValues,
    views,
    activeView
  } = useAppStore(); // Zustand store access

  const [fetchedSteps, setFetchedSteps] = useState<Record<string, boolean>>({});
  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinInProgress, setIsJoinInProgress] = useState(false);
  const previousActionSteps = useRef(action_steps);

  const search_action_input_form_values_key = `search_${activeView?.id}`;

  const globalSearchQuery = useAppStore(
    (state) =>
      state.action_input_form_values[`${search_action_input_form_values_key}`]
        ?.query
  );

  const search_action_input_form_values = useAppStore(
    (state) => state.action_input_form_values[search_action_input_form_values_key]
  );



  let active_view_search_model_state = {
    id: activeView?.id,
    query_name: "data_model",
    name: activeView?.["action_models"]?.["search"],
    success_message_code:"action_input_data_model_schema",
  };
 

  const { data: active_view_search_model_data, isLoading: active_view_search_model_isLoading, error: active_view_search_model_error } = useFetchQueryDataByState(active_view_search_model_state);


  useEffect(() => {
    const allFetched = action_steps.every(
      (step) => fetchedSteps[step.id] === true
    );
    console.log("All fetched:", allFetched);

    if (allFetched && !isJoinInProgress && !globalSearchQuery) {
      console.log("All steps fetched, executing join query...");
      setIsJoinInProgress(true);
      executeDynamicOuterJoin();
    }
    if (allFetched && !isJoinInProgress && globalSearchQuery) {
      console.log("All steps fetched, executing globalSearchQuery query...");
      // setIsJoinInProgress(true);
      // executeDynamicOuterJoin();
      executeQuery(globalSearchQuery);
    }
  }, [fetchedSteps, action_steps, globalSearchQuery]);

  const handleStepFetched = (stepId: string) => {
    setFetchedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const executeQuery = async (query: string) => {
    try {
      console.log("Executing query:\n", query);
      const result = await dbInstance.query(query);
      setDataItems(result.toArray());
      setIsLoading(false);
    } catch (error) {
      console.error("Error executing query:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const executeDynamicOuterJoin = async () => {
    try {
      let query;
      if (action_steps.length === 1) {
        const step = action_steps[0];
        const alias = generateTableAlias(step.success_message_code);
        const fields = dataFields[step.success_message_code] || [];

        const fieldSelections = fields
          .map(
            (field: any) => `${alias}.${field.name} AS ${alias}_${field.name}`
          )
          .join(",\n    ");

        query = `
          SELECT
            ${fieldSelections}
          FROM
            ${step.success_message_code} ${alias};
        `.trim();
      } else {
        const fieldSelections = action_steps.flatMap((step) => {
          const alias = generateTableAlias(step.success_message_code);
          const fields = dataFields[step.success_message_code] || [];
          const relationType =
            step.primary_step_relation?.cardinality || "one-to-one";

          if (relationType === "one-to-many") {
            const preferredColumn = getPreferredColumn(fields);
            return [
              `COUNT(${alias}.id) AS ${alias}_count`,
              `GROUP_CONCAT(${alias}.${preferredColumn}) AS ${alias}_${preferredColumn}`,
            ];
          } else {
            return fields.map(
              (field: any) => `${alias}.${field.name} AS ${alias}_${field.name}`
            );
          }
        });

        const joinClauses = action_steps.reduce((acc, step, index) => {
          const alias = generateTableAlias(step.success_message_code);
          if (index === 0) return `${step.success_message_code} ${alias}`;
          return `${acc} FULL OUTER JOIN ${step.success_message_code} ${alias} USING (issue_id)`;
        }, "");

        const groupByFields = action_steps.flatMap((step) => {
          const alias = generateTableAlias(step.success_message_code);
          const fields = dataFields[step.success_message_code] || [];
          const relationType =
            step.primary_step_relation?.cardinality || "one-to-one";

          if (relationType === "one-to-many") {
            return [`${alias}.issue_id`];
          } else {
            return fields.map((field: any) => `${alias}.${field.name}`);
          }
        });

        query = `
          SELECT
            ${fieldSelections.join(",\n    ")}
          FROM
            ${joinClauses}
          GROUP BY
            ${groupByFields.join(",\n    ")};
        `.trim();
      }

      executeQuery(query);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  const fieldMetadataList = getQueryFieldMetadata(action_steps, dataFields);
  const filteredDataFields = concatenateAliasedDataFields(
    fieldMetadataList,
    action_steps,
    dataFields
  );

  let active_view_search_model_data_data_model_search_filters = active_view_search_model_data?.data?.find(
    (item: any) => item?.message?.code === "action_input_data_model_schema"
  )?.data[0]?.data_model?.schema?.search_filters
  let enriched_search_filters = enrichFilters(active_view_search_model_data_data_model_search_filters, search_action_input_form_values)

  /**
   * Builds a WHERE clause from filters
   * @param {Array} filters - Array of filter objects
   * @returns {string} Rendered WHERE clause or empty string if no filters
   */
  function buildWhereClause(filters: any[]) {
    if (!filters || filters.length === 0) {
        return '';
    }

    const whereTemplate = `WHERE {% for filter in filters -%}
        {%- if not loop.first %} AND {% endif -%}
        {{ filter.name | sqlIdentifier }} {{ filter.operation }} {{ filter.value | sqlValue }}
    {%- endfor %}`;

    // Configure Nunjucks
    const env = nunjucks.configure({ autoescape: false });

    // Add custom filters for SQL safety
    env.addFilter('sqlIdentifier', function(str) {
        if (!str) return '';
        return `"${str.replace(/"/g, '""')}"`;
    });

    env.addFilter('sqlValue', function(value) {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        // return `'${value.toString().replace(/'/g, "''")}'`;
        // if value is date return the ISO string
        if (value instanceof Date) return value.toISOString();
        return value;
    });

    return nunjucks.renderString(whereTemplate, { filters }).trim();
  }

  /**
  * Substitutes the filters placeholder in a SQL template with the WHERE clause
  * @param {string} sqlTemplate - SQL template with {{filters}} placeholder
  * @param {Array} filters - Array of filter objects
  * @returns {string} Complete SQL query
  */
  function renderSQLTemplate(sqlTemplate: string, filters: any[]) {
    const whereClause = buildWhereClause(filters);
    
    // Handle the case where we have existing WHERE clause in the template
    if (sqlTemplate.toLowerCase().includes('where') && whereClause) {
        // If template already has WHERE, use AND instead
        return sqlTemplate.replace('{{filters}}', whereClause.replace('WHERE', 'AND'));
    }
    
    // Replace the placeholder with the WHERE clause
    return sqlTemplate.replace('{{filters}}', whereClause);
  }

  return (
    <>
      {/* <pre>{JSON.stringify(globalSearchQuery)}</pre>
      <div>{JSON.stringify(search_action_input_form_values_key)}</div> */}
      {/* <pre>{JSON.stringify(action_steps.map((step) => step.id))}</pre>
      <pre>{JSON.stringify(isLoading)}</pre> */}
      {/* <div>{JSON.stringify(action_steps)}</div> */}
      <MonacoEditor
        value={{
          // search_action_input_form_values: search_action_input_form_values,
          // active_view_search_model: activeView?.["action_models"]?.["search"],
          // active_view_search_model_data_data_model: active_view_search_model_data?.data?.find(
          //   (item: any) => item?.message?.code === "action_input_data_model_schema"
          // )?.data[0]?.data_model,
          // active_view_search_model_data_data_model_search_filters: active_view_search_model_data?.data?.find(
          //   (item: any) => item?.message?.code === "action_input_data_model_schema"
          // )?.data[0]?.data_model?.schema?.search_filters
          enriched_search_filters: enriched_search_filters,
          rendered_global_search_query: renderSQLTemplate(globalSearchQuery, enriched_search_filters)
        }}
        language="json"
        height="25vh"
      />
      {action_steps.map((step: any) => (
        <ActionStepFetcher
          key={step.id}
          step={step}
          onStepFetched={() => handleStepFetched(step.id)}
        />
      ))}
      {/* <div>{JSON.stringify(fetchedSteps)}</div> */}

      {isLoading ? (
        <div>Loading...</div>
      ) : dataItems.length > 0 ? (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          display="datagridview"
          // data_fields={filteredDataFields}
          data_fields={dataFields["supplier_analysis"] || []}
          // data_fields={views["catchmyvibe"]?.fields || []}
        />
      ) : (
        <div>No data available</div>
      )}
    </>
  );
}

export default AggregateActionStepResults;

interface ActionStepFetcherProps {
  step: any;
  onStepFetched: () => void;
}

function ActionStepFetcher({ step, onStepFetched }: ActionStepFetcherProps) {
  const {
    action_input_form_values,
    activeTask,
    activeApplication,
    activeSession,
  } = useAppStore();
  const { data, isLocalDBSuccess, isLoading } = useReadByState({
    success_message_code: step.success_message_code,
    id: step.id,
    action_steps: [step],
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: activeSession?.id,
      name: activeSession?.name,
    },
    task: {
      id: activeTask?.id,
      name: activeTask?.name,
    },
    input_values: {},
    include_action_steps: [step?.execution_order || 0],
  });

  useEffect(() => {
    if (!isLoading && isLocalDBSuccess) {
      onStepFetched(); // Notify parent that this step is fetched
    }
  }, [isLoading, isLocalDBSuccess]);

  return null; // This component doesn't render any UI
}

interface UploadedWrapperProps {
}

export const UploadedWrapper = ({
}: UploadedWrapperProps) => {

  const { uploaded, activeView } = useAppStore();
  const search_action_input_form_values_key = `search_${activeView?.id}`;

  const search_action_input_form_values = useAppStore(
    (state) => state.action_input_form_values[search_action_input_form_values_key]
  );
  const query = search_action_input_form_values?.query;

  return (
    <>
      {/* <div>uploaded wrapper</div> */}
      {/* <MonacoEditor
        value={{
          data_fields: uploaded?.data_fields,
          query: query
        }}
        language="json"
        height="75vh"
      /> */}
      {/* {query && (<QueryDataDisplay query={"SELECT DISTINCT ON (supplier_booking_ref) *, supplier_booking_ref AS id FROM uploaded_data"}/>)} */}
      {query && (<QueryDataDisplay query={"SELECT * FROM uploaded_data"}/>)}
      {/* <AggregateActionStepResults action_steps={filtered_action_steps} /> */}
      {/* <div>{JSON.stringify(record?.metadata?.query_run_location)}</div> */}
      {/* <AggregateAggregateActionStepResults record={record}></AggregateAggregateActionStepResults> */}
      {/* {record?.metadata?.query_run_location === "local_db" ? (
        <AggregateActionStepResultsLocalDB record={record} />
      ) : (
        <AggregateActionStepResults record={record}></AggregateActionStepResults>
      )} */}
      {/* {record?.metadata?.query_run_location !== "local_db" && (
        <ActionStepResults record={record}></ActionStepResults>
      )} */}
    </>
  );
};


interface QueryDataDisplayProps {
  query: string;
  // data_fields: any[];
  // table_name: string;
}

export const QueryDataDisplay = ({
query}: QueryDataDisplayProps) => {

  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dbInstance = useDuckDB(); // Get DuckDB instance
  const { uploaded } = useAppStore();

  // run the query on duckdb
  useEffect(() => {
    const fetchData = async () => {
      if (uploaded?.data) {
        try {
          console.log("Executing query:", query);
          const result = await dbInstance.query(query);
          console.log("Query result:", result);
          setDataItems(result.toArray());
          setError(null); // Clear any previous errors
        } catch (error) {
          console.error("Error executing query:", error);
          setError(`Error executing query: ${JSON.stringify(error)}`);
          // setDataItems([]); // Clear data items on error
        }
      }
    };

    fetchData();
  }, [query, uploaded?.data, dbInstance]);

  // if (error) {
  //   return <div>{error}</div>;
  // }
  // if (uploaded?.isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      {/* <div>QueryDataDisplay</div> */}
      {/* <MonacoEditor
        value={{
          data: uploaded?.data,
          data_fields: uploaded?.data_fields,
          query: query,
          error: error,
          dataItems: dataItems
        }}
        language="json"
        height="25vh"
      /> */}
      {dataItems.length > 0 && uploaded?.data_fields && (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          display="datagridview"
          data_fields={uploaded?.data_fields || []}
        />
      )}
    </>
  );
};


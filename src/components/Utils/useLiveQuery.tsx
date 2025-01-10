import { useEffect, useRef, useState } from "react";
import Surreal, { LiveHandler, Uuid } from "surrealdb";
import { getDb } from "src/surreal";

type LiveQueryResult<T> = {
  data: T[];
  error: Error | null;
  loading: boolean;
};

type Action = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";
type CloseResult = "killed" | "disconnected";
type SortOrder = "ASC" | "DESC";

interface SortConfig<T> {
  field: keyof T;
  order: SortOrder;
}

const DEBUG = false;

function parseOrderByClause<T extends Record<string, any>>(
  query: string,
  sampleData?: T // Optional sample data to validate field
): SortConfig<T> | null {
  const orderByMatch = query.match(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (!orderByMatch) return null;

  const fieldName = orderByMatch[1];
  const order = (orderByMatch[2]?.toUpperCase() as SortOrder) || "ASC";

  // Runtime check if sample data is provided
  if (sampleData && !(fieldName in sampleData)) {
    console.warn(`Warning: Field "${fieldName}" not found in data structure`);
    return null;
  }

  return {
    field: fieldName as keyof T,
    order,
  };
}

function sortData<T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig<T>
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortConfig.field];
    const bVal = b[sortConfig.field];

    if (aVal === null || aVal === undefined)
      return sortConfig.order === "ASC" ? -1 : 1;
    if (bVal === null || bVal === undefined)
      return sortConfig.order === "ASC" ? 1 : -1;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortConfig.order === "ASC" ? comparison : -comparison;
  });
}

export function useLiveQuery<T extends Record<string, any>>(
  query: string,
  table: string
): LiveQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const dbRef = useRef<Surreal | null>(null);
  const sortConfig = parseOrderByClause(query);

  useEffect(() => {
    let queryUuid: Uuid;
    let mounted = true;

    const startLiveQuery = async () => {
      try {
        dbRef.current = await getDb();
        const db = dbRef.current;

        DEBUG && console.log("SurrealDB connection established:", db);
        DEBUG && console.log("Executing query:", query);

        const [result] = await db.query<T[]>(query);
        if (mounted) {
          if (Array.isArray(result)) {
            DEBUG && console.log("Initial data loaded:", result);
            const processedResult = result.map((item) => ({
              ...item,
              id: String(item.id),
            })) as T[];
            setData(processedResult);
          } else if (result) {
            DEBUG && console.log("Initial single record loaded:", result);
            const processedResult = {
              ...result,
              id: String((result as T).id),
            } as T;
            setData([processedResult]);
          } else {
            setData([]);
          }
          setLoading(false);
        }

        DEBUG && console.log("Starting live query for table:", table);

        queryUuid = await db.live<T>(
          table,
          (action: Action, result: T | CloseResult) => {
            if (!mounted) return;

            DEBUG &&
              console.log("Live query notification received:", {
                action,
                result,
              });

            switch (action) {
              case "CREATE":
                setData((prevData) => {
                  const newRecord = {
                    ...(result as T),
                    id: String((result as T).id),
                  } as T;
                  DEBUG && console.log("Adding new record:", newRecord);
                  const newData = [...prevData, newRecord];
                  return sortConfig ? sortData(newData, sortConfig) : newData;
                });
                break;

              case "UPDATE":
                setData((prevData) => {
                  const updatedRecord = {
                    ...(result as T),
                    id: String((result as T).id),
                  } as T;
                  DEBUG && console.log("Updating record:", updatedRecord);
                  const newData = prevData.map((item) =>
                    String(item.id) === String(updatedRecord.id)
                      ? updatedRecord
                      : item
                  );
                  return sortConfig ? sortData(newData, sortConfig) : newData;
                });
                break;

              case "DELETE":
                setData((prevData) => {
                  const deletedRecord = result as T;
                  const deletedId = String(deletedRecord.id);
                  DEBUG && console.log("Deleting record:", deletedRecord);
                  return prevData.filter(
                    (item) => String(item.id) !== deletedId
                  );
                });
                break;

              case "CLOSE":
                DEBUG && console.log(`Live query ${result as CloseResult}`);
                break;
            }
          }
        );

        DEBUG && console.log("Live query started with UUID:", queryUuid);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Live query failed";
        console.error("Live query error:", errorMessage);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Live query failed"));
          setLoading(false);
        }
      }
    };

    startLiveQuery();

    return () => {
      DEBUG && console.log("Cleaning up live query...");
      mounted = false;

      const cleanup = async () => {
        if (queryUuid && dbRef.current) {
          try {
            await dbRef.current.kill(queryUuid);
            DEBUG && console.log("Live query killed successfully");
          } catch (error) {
            console.error("Error killing live query:", error);
          }
        }
      };

      cleanup();
    };
  }, [query, table]);

  return { data, error, loading };
}

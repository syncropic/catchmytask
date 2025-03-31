import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "lodash";
import Surreal, { LiveHandler, Uuid } from "surrealdb";
import { getDb, registerQuery, unregisterQuery } from "src/surreal";

type Action = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";
type CloseResult = "killed" | "disconnected";

export interface LiveQueryOptions {
  throttleTime?: number;
  limit?: number;
  fields?: string[];
  connectionId?: string;
  includeMetadata?: boolean;
}

export interface LiveQueryResult<T> {
  data: T[];
  error: Error | null;
  loading: boolean;
  meta: {
    total: number;
    hasMore: boolean;
    page: number;
  };
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

const DEFAULT_OPTIONS: LiveQueryOptions = {
  throttleTime: 300,
  limit: 20,
  fields: ["*"],
  connectionId: "default",
  includeMetadata: true,
};

/**
 * Enhanced useLiveQuery hook with pagination, connection pooling, and performance optimizations
 */
export function useLiveQuery<T extends Record<string, any>>(
  baseQuery: string,
  table: string,
  options: LiveQueryOptions = {}
): LiveQueryResult<T> {
  // Merge default options
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Refs to maintain between renders
  const queryUuidRef = useRef<Uuid | null>(null);
  const connectionIdRef = useRef<string>(opts.connectionId || "default");
  const isRefreshingRef = useRef<boolean>(false);

  // Prepare query with proper fields and pagination
  const getFormattedQuery = useCallback(
    (pageNum: number = 1) => {
      // Parse the base query to detect if it already has ORDER BY, LIMIT, etc.
      const hasOrderBy = baseQuery.toUpperCase().includes("ORDER BY");
      const hasLimit = baseQuery.toUpperCase().includes("LIMIT");
      const hasStart = baseQuery.toUpperCase().includes("START");

      // Start with the base query
      let query = baseQuery;

      // Add ORDER BY if not present (defaulting to created_datetime DESC)
      if (!hasOrderBy && table !== "") {
        query += " ORDER BY created_datetime DESC";
      }

      // Calculate offset
      const start = (pageNum - 1) * opts.limit!;

      // Add pagination
      if (!hasLimit && !hasStart) {
        query += ` LIMIT ${opts.limit} START ${start}`;
      }

      return query;
    },
    [baseQuery, opts.limit, table]
  );

  // Throttled update function to prevent too many re-renders
  const throttledSetData = useCallback(
    throttle((updater: (prev: T[]) => T[]) => {
      setData((prev) => updater(prev));
    }, opts.throttleTime),
    [opts.throttleTime]
  );

  // Function to refresh data
  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      setLoading(true);
      const db = await getDb(connectionIdRef.current);

      // Count total records
      const countQuery = `SELECT count() FROM ${table} WHERE ${
        baseQuery.includes("WHERE")
          ? baseQuery.split("WHERE")[1].split("ORDER BY")[0].trim()
          : "1=1"
      }`;

      // Execute query with pagination
      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query<T[]>(getFormattedQuery(1)),
      ]);

      // Set total count and data
      const count = countResult?.[0]?.count || 0;
      setTotal(count);
      setHasMore(count > opts.limit!);

      // Process data
      const processedData = Array.isArray(dataResult)
        ? (dataResult[0].map((item: any) => ({
            ...item,
            id: String(item.id),
          })) as T[])
        : [];

      setData(processedData);
      setPage(1);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to refresh data")
      );
      setLoading(false);
    }

    isRefreshingRef.current = false;
  }, [baseQuery, getFormattedQuery, opts.limit, table]);

  // Function to load more data
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const db = await getDb(connectionIdRef.current);

      const [result] = await db.query<T[]>(getFormattedQuery(nextPage));

      // Process and append new data
      if (Array.isArray(result) && result.length > 0) {
        const processedData = result.map((item: any) => ({
          ...item,
          id: String(item.id),
        })) as T[];

        setData((prev) => [...prev, ...processedData]);
        setPage(nextPage);
        setHasMore(processedData.length === opts.limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load more data")
      );
    }
  }, [getFormattedQuery, hasMore, loading, opts.limit, page]);

  // Setup live query
  useEffect(() => {
    let mounted = true;
    const queryId = `${table}_live_${Date.now()}`;

    const setupLiveQuery = async () => {
      try {
        setLoading(true);

        // Get connection from pool
        const db = await getDb(connectionIdRef.current);
        registerQuery(connectionIdRef.current, queryId);

        // Execute initial query
        const formattedQuery = getFormattedQuery();
        const [result] = await db.query<T[]>(formattedQuery);

        if (!mounted) return;

        // Count total records
        const countQuery = `SELECT count() FROM ${table} WHERE ${
          baseQuery.includes("WHERE")
            ? baseQuery.split("WHERE")[1].split("ORDER BY")[0].trim()
            : "1=1"
        }`;

        const [countResult] = await db.query(countQuery);
        const count = countResult?.[0]?.count || 0;

        // Set total count
        if (mounted) {
          setTotal(count);
          setHasMore(count > opts.limit!);
        }

        // Process initial data
        if (mounted && Array.isArray(result)) {
          const processedData = result.map((item: any) => ({
            ...item,
            id: String(item.id),
          })) as T[];

          setData(processedData);
          setLoading(false);
        }

        // Set up live query
        queryUuidRef.current = await db.live(
          table,
          (action: Action, result: T | CloseResult) => {
            if (!mounted) return;

            switch (action) {
              case "CREATE":
                throttledSetData((prevData) => {
                  // Only add if it would appear on the first page
                  // This assumes sorting by created_datetime DESC
                  const newRecord = {
                    ...(result as T),
                    id: String((result as T).id),
                  } as T;
                  return [newRecord, ...prevData].slice(0, prevData.length);
                });
                break;

              case "UPDATE":
                throttledSetData((prevData) => {
                  const updatedRecord = {
                    ...(result as T),
                    id: String((result as T).id),
                  } as T;
                  return prevData.map((item) =>
                    String(item.id) === String(updatedRecord.id)
                      ? updatedRecord
                      : item
                  );
                });
                break;

              case "DELETE":
                throttledSetData((prevData) => {
                  const deletedId = String((result as T).id);
                  return prevData.filter(
                    (item) => String(item.id) !== deletedId
                  );
                });
                break;

              case "CLOSE":
                // Handle connection close
                console.log(`Live query ${result as CloseResult}`);
                break;
            }
          }
        );
      } catch (err) {
        console.error("Live query error:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Live query failed"));
          setLoading(false);
        }
      }
    };

    setupLiveQuery();

    // Cleanup
    return () => {
      mounted = false;
      throttledSetData.cancel();

      const cleanup = async () => {
        if (queryUuidRef.current) {
          try {
            const db = await getDb(connectionIdRef.current);
            await db.kill(queryUuidRef.current);
            unregisterQuery(connectionIdRef.current, queryId);
          } catch (error) {
            console.error("Error killing live query:", error);
          }
        }
      };

      cleanup();
    };
  }, [baseQuery, getFormattedQuery, opts.limit, table, throttledSetData]);

  return {
    data,
    error,
    loading,
    meta: {
      total,
      hasMore,
      page,
    },
    refresh,
    loadMore,
  };
}

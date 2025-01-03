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

const DEBUG = false; // Toggle for debug logging

export function useLiveQuery<T extends Record<string, any>>(
  query: string,
  table: string
): LiveQueryResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const dbRef = useRef<Surreal | null>(null);

  useEffect(() => {
    let queryUuid: Uuid;
    let mounted = true;

    const startLiveQuery = async () => {
      try {
        // Get DB connection
        dbRef.current = await getDb();
        const db = dbRef.current;

        DEBUG && console.log("SurrealDB connection established:", db);
        DEBUG && console.log("Executing query:", query);

        const [result] = await db.query<T[]>(query);
        if (mounted) {
          if (Array.isArray(result)) {
            DEBUG && console.log("Initial data loaded:", result);
            // Ensure IDs are strings in initial data
            const processedResult = result.map((item) => ({
              ...item,
              id: String(item.id),
            })) as T[];
            setData(processedResult);
          } else if (result) {
            DEBUG && console.log("Initial single record loaded:", result);
            // Ensure ID is string for single record
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
                  return [...prevData, newRecord];
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
                  DEBUG && console.log("Updated data:", newData);
                  return newData;
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

// import { useEffect, useRef, useState } from "react";
// import Surreal, { LiveHandler, Uuid } from "surrealdb";
// import { getDb } from "src/surreal";

// type LiveQueryResult<T> = {
//   data: T[];
//   error: Error | null;
//   loading: boolean;
// };

// type Action = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";
// type CloseResult = "killed" | "disconnected";

// const DEBUG = false; // Toggle for debug logging

// export function useLiveQuery<T extends Record<string, any>>(
//   table: string,
//   where?: string
// ): LiveQueryResult<T> {
//   const [data, setData] = useState<T[]>([]);
//   const [error, setError] = useState<Error | null>(null);
//   const [loading, setLoading] = useState(true);
//   const dbRef = useRef<Surreal | null>(null);

//   useEffect(() => {
//     let queryUuid: Uuid;
//     let mounted = true;

//     const startLiveQuery = async () => {
//       try {
//         // Get DB connection
//         dbRef.current = await getDb();
//         const db = dbRef.current;

//         DEBUG && console.log("SurrealDB connection established:", db);

//         const query = where
//           ? `SELECT *
//   FROM ${table}
//   WHERE ${where} ORDER BY updated_datetime ASC;`
//           : `SELECT *
//   FROM ${table} ORDER BY updated_datetime ASC;`;

//         DEBUG && console.log("Executing initial query:", query);

//         const [result] = await db.query<T[]>(query);
//         if (mounted) {
//           if (Array.isArray(result)) {
//             DEBUG && console.log("Initial data loaded:", result);
//             // Ensure IDs are strings in initial data
//             const processedResult = result.map((item) => ({
//               ...item,
//               id: String(item.id),
//             })) as T[];
//             setData(processedResult);
//           } else if (result) {
//             DEBUG && console.log("Initial single record loaded:", result);
//             // Ensure ID is string for single record
//             const processedResult = {
//               ...result,
//               id: String((result as T).id),
//             } as T;
//             setData([processedResult]);
//           } else {
//             setData([]);
//           }
//           setLoading(false);
//         }

//         DEBUG && console.log("Starting live query for table:", table);

//         queryUuid = await db.live<T>(
//           table,
//           (action: Action, result: T | CloseResult) => {
//             if (!mounted) return;

//             DEBUG &&
//               console.log("Live query notification received:", {
//                 action,
//                 result,
//               });

//             switch (action) {
//               case "CREATE":
//                 setData((prevData) => {
//                   const newRecord = {
//                     ...(result as T),
//                     id: String((result as T).id),
//                   } as T;
//                   DEBUG && console.log("Adding new record:", newRecord);
//                   return [...prevData, newRecord];
//                 });
//                 break;

//               case "UPDATE":
//                 setData((prevData) => {
//                   const updatedRecord = {
//                     ...(result as T),
//                     id: String((result as T).id),
//                   } as T;
//                   DEBUG && console.log("Updating record:", updatedRecord);
//                   const newData = prevData.map((item) =>
//                     String(item.id) === String(updatedRecord.id)
//                       ? updatedRecord
//                       : item
//                   );
//                   DEBUG && console.log("Updated data:", newData);
//                   return newData;
//                 });
//                 break;

//               case "DELETE":
//                 setData((prevData) => {
//                   const deletedRecord = result as T;
//                   const deletedId = String(deletedRecord.id);
//                   DEBUG && console.log("Deleting record:", deletedRecord);
//                   return prevData.filter(
//                     (item) => String(item.id) !== deletedId
//                   );
//                 });
//                 break;

//               case "CLOSE":
//                 DEBUG && console.log(`Live query ${result as CloseResult}`);
//                 break;
//             }
//           }
//         );

//         DEBUG && console.log("Live query started with UUID:", queryUuid);
//       } catch (err) {
//         const errorMessage =
//           err instanceof Error ? err.message : "Live query failed";
//         console.error("Live query error:", errorMessage);
//         if (mounted) {
//           setError(err instanceof Error ? err : new Error("Live query failed"));
//           setLoading(false);
//         }
//       }
//     };

//     startLiveQuery();

//     return () => {
//       DEBUG && console.log("Cleaning up live query...");
//       mounted = false;

//       const cleanup = async () => {
//         if (queryUuid && dbRef.current) {
//           try {
//             await dbRef.current.kill(queryUuid);
//             DEBUG && console.log("Live query killed successfully");
//           } catch (error) {
//             console.error("Error killing live query:", error);
//           }
//         }
//       };

//       cleanup();
//     };
//   }, [table, where]);

//   return { data, error, loading };
// }

// services/local_db.js
import * as duckdb from "@duckdb/duckdb-wasm";

let localDBConnection = null; // Singleton to ensure only one connection
let dbInstance = null; // DuckDB instance

/**
 * Initializes the DuckDB instance if not already initialized.
 * Loads any saved database state from local storage if available.
 * @returns {Promise<any>} The DuckDB connection instance.
 */
export async function initializeLocalDB() {
  if (dbInstance) {
    console.log("DuckDB instance already initialized.");
    return localDBConnection;
  }

  try {
    console.log("Initializing DuckDB...");

    // Use DuckDB's jsdelivr bundles
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    // Create a worker URL for the async version of DuckDB-Wasm
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();

    // Initialize DuckDB with the Wasm bundle
    dbInstance = new duckdb.AsyncDuckDB(logger, worker);
    await dbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // Revoke the worker URL to avoid memory leaks
    URL.revokeObjectURL(worker_url);

    console.log("DuckDB-Wasm initialized.");

    // Check if there is a saved database state in local storage
    const savedDatabase = localStorage.getItem("duckdb_database");
    if (savedDatabase) {
      await dbInstance.loadFromBuffer(
        new Uint8Array(JSON.parse(savedDatabase))
      );
      console.log("DuckDB database loaded from local storage.");
    }

    // Establish the connection to DuckDB
    localDBConnection = await dbInstance.connect();
    return localDBConnection;
  } catch (error) {
    console.error("Error initializing DuckDB-Wasm:", error);
    throw error;
  }
}

/**
 * Saves the current state of the DuckDB database to local storage.
 * Ensures that any changes are persisted between sessions.
 */
export async function saveDatabaseToLocalStorage() {
  if (dbInstance) {
    try {
      const buffer = await dbInstance.serialize();
      localStorage.setItem(
        "duckdb_database",
        JSON.stringify(Array.from(buffer))
      );
      console.log("DuckDB database state saved to local storage.");
    } catch (error) {
      console.error("Error saving DuckDB database to local storage:", error);
    }
  } else {
    console.warn(
      "DuckDB instance not initialized. Cannot save to local storage."
    );
  }
}

/**
 * Clears the DuckDB database state from local storage.
 */
export function clearDatabaseFromLocalStorage() {
  localStorage.removeItem("duckdb_database");
  console.log("DuckDB database state cleared from local storage.");
}

// Type mapping between field types and DuckDB-compatible types
const typeMapping = {
  integer: "BIGINT",
  unsigned_integer: "UBIGINT",
  float: "DOUBLE",
  complex: "DOUBLE",
  string: "VARCHAR",
  boolean: "BOOLEAN",
  datetime: "TIMESTAMP",
  timedelta: "INTERVAL",
  category: "VARCHAR",
  sparse: "VARCHAR",
  period: "VARCHAR",
  interval: "INTERVAL",
  mixed: "VARCHAR",
  unknown: "VARCHAR",
};

/**
 * Saves data to the DuckDB instance within a managed transaction.
 * Handles rollback in case of errors and ensures robust transaction flow.
 * @param {Array} data - The data to be inserted.
 * @param {string} tableName - The name of the table.
 * @param {Array} dataFields - The fields that define the structure of the table.
 */
export async function saveToLocalDB(data, tableName, dataFields, dbInstance) {
  try {
    console.log(`Starting transaction to save data to table: ${tableName}`);

    // Start the transaction
    await dbInstance.query("BEGIN TRANSACTION;");

    // Drop the table if it exists to avoid conflicts
    const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
    await dbInstance.query(dropQuery);

    // Create table and insert data
    await createTableAndInsertData(data, tableName, dataFields, dbInstance);

    // Commit the transaction on success
    await dbInstance.query("COMMIT;");
    console.log(`Transaction committed successfully for table: ${tableName}`);
  } catch (error) {
    console.error(`Error during transaction for table ${tableName}:`, error);

    // Rollback transaction in case of error
    try {
      await dbInstance.query("ROLLBACK;");
      console.log(`Transaction rolled back for table: ${tableName}`);
    } catch (rollbackError) {
      console.error("Error during rollback:", rollbackError);
    }
    throw error; // Re-throw the original error
  }
}

async function createTableAndInsertData(
  data,
  tableName,
  dataFields,
  dbInstance
) {
  // Build the CREATE TABLE query dynamically based on the data fields
  const columns = dataFields.map((field) => {
    let type = typeMapping[field.data_type] || "VARCHAR"; // Default to VARCHAR
    // if (field.data_type === "integer") {
    //   const sampleValue = data.find((item) => item[field.name] !== undefined)?.[
    //     field.name
    //   ];
    //   if (sampleValue > 2147483647) type = "BIGINT"; // Handle large integers
    // }
    return `${field.name} ${type}`;
  });

  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            ${columns.join(",\n    ")}
        );
    `;
  console.log("Create Table Query:", createTableQuery);
  await dbInstance.query(createTableQuery);

  // Ensure there is data to insert
  if (data.length === 0) {
    console.warn(`No data to insert into table: ${tableName}`);
    return;
  }

  // Prepare the INSERT statement dynamically
  const columnNames = dataFields.map((field) => field.name);
  const valuesClauses = data.map((record) => {
    const values = columnNames.map((column) => {
      let value = record[column];

      // Serialize objects or arrays as JSON
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }

      // Escape single quotes to avoid SQL injection
      if (typeof value === "string") {
        if (value.trim() === "") {
          return "NULL"; // Treat empty strings as NULL
        }
        return `'${value.replace(/'/g, "''")}'`;
      }

      // Check for numeric fields and fallback to NULL for invalid data
      if (typeof value === "number") {
        if (isNaN(value)) {
          return "NULL"; // Handle invalid numbers as NULL
        }
        return value;
      }

      // Handle undefined values as NULL
      return value !== undefined ? value : "NULL";
    });
    return `(${values.join(", ")})`;
  });

  const insertQuery = `
        INSERT INTO ${tableName} (${columnNames.join(", ")})
        VALUES ${valuesClauses.join(",\n    ")};
    `;
  console.log("Insert Query:", insertQuery);
  await dbInstance.query(insertQuery);
}

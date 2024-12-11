// services/local_db.js
import { Surreal } from "surrealdb";
import { surrealdbWasmEngines } from "@surrealdb/wasm";
import { Mutex } from "async-mutex";

let dbInstance = null;
const mutex = new Mutex();

/**
 * Initializes the SurrealDB instance if not already initialized.
 * Uses IndexedDB for persistence.
 * @returns {Promise<Surreal>} The SurrealDB connection instance.
 */
export async function initializeLocalDB() {
  if (dbInstance) {
    console.log("SurrealDB instance already initialized.");
    return dbInstance;
  }

  try {
    console.log("Initializing SurrealDB...");

    dbInstance = new Surreal({
      engines: surrealdbWasmEngines(),
    });

    // Connect to the database with persistence
    await dbInstance.connect("indxdb://localdb");

    // Set the namespace and database name
    await dbInstance.use({ ns: "myapp", db: "local" });

    console.log("SurrealDB initialized successfully");
    return dbInstance;
  } catch (error) {
    console.error("Error initializing SurrealDB:", error);
    throw error;
  }
}

/**
 * Saves data to the SurrealDB instance within a managed transaction.
 * @param {Array} data - The data to be inserted.
 * @param {string} tableName - The name of the table.
 * @param {Array} dataFields - The fields that define the structure of the data.
 */
export async function saveToLocalDB(data, tableName, dataFields) {
  return mutex.runExclusive(async () => {
    try {
      if (!dbInstance) {
        await initializeLocalDB();
      }

      console.log(`Starting data save for table: ${tableName}`);

      // Begin a new transaction
      await dbInstance.query("BEGIN TRANSACTION;");

      try {
        // Delete existing records
        await dbInstance.delete(tableName);

        // Process and format the data
        const records = data.map((record) => {
          const formattedRecord = {};

          dataFields.forEach((field) => {
            let value = record[field.name];

            // Handle null/undefined/special values
            if (
              value === null ||
              value === undefined ||
              value === "None" ||
              value === "NULL" ||
              value === "null" ||
              (typeof value === "string" && value.trim() === "")
            ) {
              value = null;
            }
            // Handle objects and arrays
            else if (typeof value === "object") {
              if (Array.isArray(value) && value.length === 0) {
                value = null;
              } else if (value !== null) {
                value = JSON.stringify(value);
              }
            }
            // Handle numbers
            else if (typeof value === "number") {
              if (isNaN(value) || !isFinite(value)) {
                value = null;
              }
            }

            formattedRecord[field.name] = value;
          });

          return formattedRecord;
        });

        // Insert records in chunks to handle large datasets
        const CHUNK_SIZE = 1000;
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
          const chunk = records.slice(i, i + CHUNK_SIZE);
          await dbInstance.create(tableName, chunk);
        }

        // Commit the transaction
        await dbInstance.query("COMMIT TRANSACTION;");
        console.log(`Data saved successfully to table: ${tableName}`);
      } catch (error) {
        // Rollback on error
        await dbInstance.query("CANCEL TRANSACTION;");
        throw error;
      }
    } catch (error) {
      console.error(`Error during transaction for ${tableName}:`, error);
      throw error;
    }
  });
}

/**
 * Removes all data from the database and closes the connection.
 */
export async function clearDatabaseFromLocalStorage() {
  if (dbInstance) {
    try {
      // Close the connection
      await dbInstance.close();

      // Clear the instance
      dbInstance = null;

      console.log("SurrealDB connection closed and instance cleared.");
    } catch (error) {
      console.error("Error clearing SurrealDB database:", error);
      throw error;
    }
  }
}

/**
 * Executes a custom query on the database.
 * @param {string} query - The SurrealQL query to execute.
 * @param {Object} params - Query parameters.
 * @returns {Promise<any>} Query results.
 */
export async function executeQuery(query, params = {}) {
  if (!dbInstance) {
    await initializeLocalDB();
  }

  try {
    const result = await dbInstance.query(query, params);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

/**
 * Retrieves all records from a table.
 * @param {string} tableName - The name of the table.
 * @returns {Promise<Array>} Array of records.
 */
export async function getAllRecords(tableName) {
  if (!dbInstance) {
    await initializeLocalDB();
  }

  try {
    const records = await dbInstance.select(tableName);
    return records;
  } catch (error) {
    console.error(`Error retrieving records from ${tableName}:`, error);
    throw error;
  }
}

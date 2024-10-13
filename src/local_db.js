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
  string: "VARCHAR",
  integer: "INTEGER",
  float: "DOUBLE",
  boolean: "BOOLEAN",
  datetime: "TIMESTAMP",
  uuid: "UUID",
  date: "DATE",
  object: "JSON",
  array: "JSON",
  object_array: "JSON",
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

/**
 * Creates a table dynamically based on the provided data fields and inserts the data.
 * Handles large integers by using BIGINT.
 * @param {Array} data - The data to be inserted.
 * @param {string} tableName - The name of the table.
 * @param {Array} dataFields - The fields that define the structure of the table.
 */
async function createTableAndInsertData(
  data,
  tableName,
  dataFields,
  dbInstance
) {
  // Build the CREATE TABLE query dynamically based on the data fields
  const columns = dataFields.map((field) => {
    let type = typeMapping[field.data_type] || "VARCHAR"; // Default to VARCHAR
    if (field.data_type === "integer") {
      const sampleValue = data.find((item) => item[field.name] !== undefined)?.[
        field.name
      ];
      if (sampleValue > 2147483647) type = "BIGINT"; // Handle large integers
    }
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
        return `'${value.replace(/'/g, "''")}'`;
      }
      return value !== undefined ? value : "NULL"; // Handle undefined values as NULL
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

// // services/local_db.js
// import * as duckdb from "@duckdb/duckdb-wasm";

// let localDBConnection = null;
// let dbInstance = null;

// /**
//  * Initializes the DuckDB instance if not already initialized.
//  * If a saved state exists in local storage, it loads the database from the saved state.
//  * @returns {Promise<any>} The DuckDB connection instance.
//  */
// export async function initializeLocalDB() {
//   if (!localDBConnection) {
//     try {
//       // Use DuckDB's jsdelivr bundles
//       const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
//       const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

//       // Create a worker URL
//       const worker_url = URL.createObjectURL(
//         new Blob([`importScripts("${bundle.mainWorker}");`], {
//           type: "text/javascript",
//         })
//       );

//       // Initialize the asynchronous version of DuckDB-Wasm
//       const worker = new Worker(worker_url);
//       const logger = new duckdb.ConsoleLogger();
//       dbInstance = new duckdb.AsyncDuckDB(logger, worker);

//       // Instantiate the database with the Wasm bundle
//       await dbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);

//       // Revoke the worker URL to avoid memory leaks
//       URL.revokeObjectURL(worker_url);

//       // Check if there is a saved database state in local storage
//       const savedDatabase = localStorage.getItem("duckdb_database");
//       if (savedDatabase) {
//         // Load the saved state into the database
//         await dbInstance.loadFromBuffer(
//           new Uint8Array(JSON.parse(savedDatabase))
//         );
//         console.log("DuckDB database loaded from local storage.");
//       }

//       localDBConnection = await dbInstance.connect();
//     } catch (error) {
//       console.error("Error initializing DuckDB-Wasm:", error);
//       throw error;
//     }
//   }
//   return localDBConnection;
// }

// /**
//  * Saves the current state of the DuckDB database to local storage.
//  */
// export async function saveDatabaseToLocalStorage() {
//   if (dbInstance) {
//     try {
//       // Save the current state of the database to a buffer
//       const buffer = await dbInstance.serialize();
//       localStorage.setItem(
//         "duckdb_database",
//         JSON.stringify(Array.from(buffer))
//       );
//       console.log("DuckDB database state saved to local storage.");
//     } catch (error) {
//       console.error("Error saving DuckDB database to local storage:", error);
//     }
//   }
// }

// /**
//  * Clears the DuckDB database state from local storage.
//  */
// export function clearDatabaseFromLocalStorage() {
//   localStorage.removeItem("duckdb_database");
//   console.log("DuckDB database state cleared from local storage.");
// }

// const typeMapping = {
//   string: "VARCHAR",
//   integer: "INTEGER",
//   float: "DOUBLE",
//   boolean: "BOOLEAN",
//   datetime: "TIMESTAMP",
//   uuid: "UUID",
//   date: "DATE",
//   object: "JSON",
//   array: "JSON",
//   object_array: "JSON",
//   unknown: "VARCHAR",
// };

// /**
//  * Saves data to the DuckDB instance, creating a table if it doesn't already exist.
//  * @param {Array} data - The data to be inserted.
//  * @param {string} tableName - The name of the table.
//  * @param {Array} dataFields - The fields that define the structure of the table.
//  */
// // export async function saveToLocalDB(data, tableName, dataFields, dbInstance) {
// //   // Dynamically create the table based on data fields
// //   let columns = [];
// //   const primaryKey = "id";
// //   const columnNames = [];

// //   for (const field of dataFields) {
// //     const columnName = field.name;
// //     let inferredType = field.data_type;

// //     // If the data type is integer, check for large integers to use BIGINT
// //     if (inferredType === "integer") {
// //       const sampleValue = data.find(
// //         (record) => record[columnName] !== undefined
// //       )?.[columnName];
// //       if (typeof sampleValue === "number" && sampleValue > 2147483647) {
// //         inferredType = "BIGINT";
// //       } else {
// //         inferredType = typeMapping[inferredType];
// //       }
// //     } else {
// //       inferredType = typeMapping[inferredType] || "VARCHAR";
// //     }

// //     if (columnName === primaryKey) {
// //       columns.push(`${columnName} ${inferredType} PRIMARY KEY`);
// //     } else {
// //       columns.push(`${columnName} ${inferredType}`);
// //     }

// //     columnNames.push(columnName);
// //   }

// //   const columnsDefinition = columns.join(",\n    ");
// //   const createTableQuery = `
// //           CREATE TABLE IF NOT EXISTS ${tableName} (
// //               ${columnsDefinition}
// //           );
// //         `;
// //   console.log("Create Table Query:", createTableQuery);
// //   await dbInstance.query(createTableQuery);

// //   // Ensure there is at least one row to insert
// //   if (data.length === 0) {
// //     console.warn("No data to insert into table:", tableName);
// //     return;
// //   }

// //   // Prepare the batch insert statement
// //   const columnsList = columnNames.join(", ");
// //   const valuesClauses = data.map((record) => {
// //     const values = columnNames.map((columnName) => {
// //       let value = record[columnName];

// //       // Serialize objects or arrays as JSON
// //       if (typeof value === "object" && value !== null) {
// //         value = JSON.stringify(value);
// //       }

// //       // Properly escape string values to prevent SQL injection
// //       if (typeof value === "string") {
// //         return `'${value.replace(/'/g, "''")}'`;
// //       }
// //       return value;
// //     });
// //     return `(${values.join(", ")})`;
// //   });

// //   const insertQuery = `INSERT INTO ${tableName} (${columnsList}) VALUES ${valuesClauses.join(
// //     ", "
// //   )};`;
// //   console.log("Batch Insert Query:", insertQuery);

// //   // Execute the batch insert
// //   try {
// //     await dbInstance.query("BEGIN TRANSACTION;");
// //     await dbInstance.query(insertQuery);
// //     await dbInstance.query("COMMIT;");
// //     console.log(`Data inserted successfully into table: ${tableName}`);
// //   } catch (error) {
// //     await conn.query("ROLLBACK;");
// //     console.error(
// //       `Error executing the batch INSERT query to ${tableName}:`,
// //       error
// //     );
// //     throw error;
// //   }
// // }

// // /**
// //  * Drops a table if it exists in the DuckDB instance.
// //  * @param {string} tableName - The name of the table to drop.
// //  */
// // export async function dropTableIfExists(tableName) {
// //   const conn = await initializeLocalDB();
// //   const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
// //   await conn.query(dropQuery);
// //   console.log(`Table dropped successfully: ${tableName}`);
// // }

// async function saveToLocalDB(data, tableName, dataFields, dbInstance) {
//   try {
//       // Start the transaction
//       await dbInstance.query("BEGIN TRANSACTION;");

//       // Drop table if it exists
//       const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
//       await dbInstance.query(dropQuery);

//       // Create table and insert data as per the previous logic
//       await createTableAndInsertData(data, tableName, dataFields, dbInstance);

//       // Commit the transaction
//       await dbInstance.query("COMMIT;");
//       console.log(`Transaction committed successfully for table: ${tableName}`);
//   } catch (error) {
//       // Rollback the transaction on error
//       await dbInstance.query("ROLLBACK;");
//       console.error(`Error in transaction, rolled back: ${error}`);
//       throw error;
//   }
// }

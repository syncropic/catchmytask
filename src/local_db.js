// services/local_db.js
// services/local_db.js
import * as duckdb from "@duckdb/duckdb-wasm";

let localDBConnection = null;

export async function initializeLocalDB() {
  if (!localDBConnection) {
    try {
      // Use DuckDB's jsdelivr bundles
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      // Create a worker URL
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: "text/javascript",
        })
      );

      // Initialize the asynchronous version of DuckDB-Wasm
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);

      // Instantiate the database with the Wasm bundle
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      localDBConnection = await db.connect();

      // Revoke the worker URL to avoid memory leaks
      URL.revokeObjectURL(worker_url);
    } catch (error) {
      console.error("Error initializing DuckDB-Wasm:", error);
      throw error;
    }
  }
  return localDBConnection;
}

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

export async function saveToLocalDB(data, tableName, dataFields) {
  const conn = await initializeLocalDB();

  // Dynamically create the table based on data fields
  let columns = [];
  const primaryKey = "id";
  const columnNames = [];

  for (const field of dataFields) {
    const columnName = field.name;
    let inferredType = field.data_type;

    // If the data type is integer, check for large integers to use BIGINT
    if (inferredType === "integer") {
      const sampleValue = data.find(
        (record) => record[columnName] !== undefined
      )?.[columnName];
      if (typeof sampleValue === "number" && sampleValue > 2147483647) {
        inferredType = "BIGINT";
      } else {
        inferredType = typeMapping[inferredType];
      }
    } else {
      inferredType = typeMapping[inferredType] || "VARCHAR";
    }

    if (columnName === primaryKey) {
      columns.push(`${columnName} ${inferredType} PRIMARY KEY`);
    } else {
      columns.push(`${columnName} ${inferredType}`);
    }

    columnNames.push(columnName);
  }

  const columnsDefinition = columns.join(",\n    ");
  const createTableQuery = `
          CREATE TABLE IF NOT EXISTS ${tableName} (
              ${columnsDefinition}
          );
        `;
  console.log("Create Table Query:", createTableQuery);
  await conn.query(createTableQuery);

  // Ensure there is at least one row to insert
  if (data.length === 0) {
    console.warn("No data to insert into table:", tableName);
    return;
  }

  // Prepare the batch insert statement
  const columnsList = columnNames.join(", ");
  const valuesClauses = data.map((record) => {
    const values = columnNames.map((columnName) => {
      let value = record[columnName];

      // Serialize objects or arrays as JSON
      if (typeof value === "object" && value !== null) {
        value = JSON.stringify(value);
      }

      // Properly escape string values to prevent SQL injection
      if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
      }
      return value;
    });
    return `(${values.join(", ")})`;
  });

  const insertQuery = `INSERT INTO ${tableName} (${columnsList}) VALUES ${valuesClauses.join(
    ", "
  )};`;
  console.log("Batch Insert Query:", insertQuery);

  // Execute the batch insert
  try {
    await conn.query("BEGIN TRANSACTION;");
    await conn.query(insertQuery);
    await conn.query("COMMIT;");
    console.log(`Data inserted successfully into table: ${tableName}`);
  } catch (error) {
    await conn.query("ROLLBACK;");
    console.error(
      `Error executing the batch INSERT query to ${tableName}:`,
      error
    );
    throw error;
  }
}

// function to drop table if exists
export async function dropTableIfExists(tableName) {
  const conn = await initializeLocalDB();
  const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
  await conn.query(dropQuery);
  console.log(`Table dropped successfully: ${tableName}`);
  // close the connection
  // await conn.close();
}

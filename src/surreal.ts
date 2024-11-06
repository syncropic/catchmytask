import Surreal from "surrealdb";

// Define the database configuration interface
interface DbConfig {
  url: string;
  namespace: string;
  database: string;
}

// Define the default database configuration
const DEFAULT_CONFIG: DbConfig = {
  url: "wss://db.catchmytask.com/rpc",
  namespace: "catchmytask",
  database: "catchmytask_dev",
};

// Define the function to get the database instance
export async function getDb(
  config: DbConfig = DEFAULT_CONFIG
): Promise<Surreal> {
  const db = new Surreal();

  try {
    await db.connect(config.url);
    await db.use({ namespace: config.namespace, database: config.database });
    const token = await db.signin({
      username: "root",
      password: "Tz^ok%k1jpnU*jN2#YC0WvXfF17H",
    });
    return db;
  } catch (err) {
    console.error(
      "Failed to connect to SurrealDB:",
      err instanceof Error ? err.message : String(err)
    );
    await db.close();
    throw err;
  }
}

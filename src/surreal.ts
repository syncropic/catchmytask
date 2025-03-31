import Surreal from "surrealdb";

// Define the database configuration interface
interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  credentials: {
    username: string;
    password: string;
  };
}

// Default configuration - move to environment variables in production
const DEFAULT_CONFIG: DbConfig = {
  url: "wss://db.catchmytask.com/rpc",
  namespace: "catchmytask",
  database: "catchmytask_dev",
  credentials: {
    username: "root",
    password: "Tz^ok%k1jpnU*jN2#YC0WvXfF17H", // In a real app, use environment variables
  },
};

// Connection pool implementation
class SurrealConnectionPool {
  private static instance: SurrealConnectionPool;
  private pool: Map<string, Surreal>;
  private connectionPromises: Map<string, Promise<Surreal>>;
  private config: DbConfig;
  private maxConnections: number;
  private activeQueries: Map<string, Set<string>>;

  private constructor(config: DbConfig = DEFAULT_CONFIG, maxConnections = 5) {
    this.pool = new Map();
    this.connectionPromises = new Map();
    this.config = config;
    this.maxConnections = maxConnections;
    this.activeQueries = new Map();
  }

  public static getInstance(
    config?: DbConfig,
    maxConnections?: number
  ): SurrealConnectionPool {
    if (!SurrealConnectionPool.instance) {
      SurrealConnectionPool.instance = new SurrealConnectionPool(
        config,
        maxConnections
      );
    }
    return SurrealConnectionPool.instance;
  }

  // Get a connection, creating a new one if needed and under maxConnections
  public async getConnection(id = "default"): Promise<Surreal> {
    // If we already have this connection or it's being created, return it
    if (this.pool.has(id)) {
      return this.pool.get(id)!;
    }

    if (this.connectionPromises.has(id)) {
      return this.connectionPromises.get(id)!;
    }

    // If we've reached max connections, return least busy connection
    if (this.pool.size >= this.maxConnections) {
      return this.getLeastBusyConnection();
    }

    // Create a new connection
    const connectionPromise = this.createConnection(id);
    this.connectionPromises.set(id, connectionPromise);

    try {
      const connection = await connectionPromise;
      this.pool.set(id, connection);
      this.connectionPromises.delete(id);
      this.activeQueries.set(id, new Set());
      return connection;
    } catch (error) {
      this.connectionPromises.delete(id);
      console.error(`Failed to create connection ${id}:`, error);
      throw error;
    }
  }

  // Register a query with a connection for tracking
  public registerQuery(connectionId: string, queryId: string): void {
    const queries = this.activeQueries.get(connectionId) || new Set();
    queries.add(queryId);
    this.activeQueries.set(connectionId, queries);
  }

  // Unregister a query when it's done
  public unregisterQuery(connectionId: string, queryId: string): void {
    const queries = this.activeQueries.get(connectionId);
    if (queries) {
      queries.delete(queryId);
    }
  }

  // Release a connection when no longer needed
  public async releaseConnection(id: string): Promise<void> {
    const connection = this.pool.get(id);
    const queries = this.activeQueries.get(id);

    if (connection && (!queries || queries.size === 0)) {
      try {
        await connection.close();
        this.pool.delete(id);
        this.activeQueries.delete(id);
      } catch (error) {
        console.error(`Error closing connection ${id}:`, error);
      }
    }
  }

  // Release all connections
  public async releaseAllConnections(): Promise<void> {
    const closePromises = [];

    for (const [id, connection] of this.pool.entries()) {
      try {
        closePromises.push(connection.close());
      } catch (error) {
        console.error(`Error closing connection ${id}:`, error);
      }
    }

    await Promise.all(closePromises);
    this.pool.clear();
    this.activeQueries.clear();
  }

  // Private methods
  private async createConnection(id: string): Promise<Surreal> {
    const db = new Surreal();

    try {
      await db.connect(this.config.url);
      await db.use({
        namespace: this.config.namespace,
        database: this.config.database,
      });
      await db.signin(this.config.credentials);

      return db;
    } catch (err) {
      console.error(`Failed to connect to SurrealDB for ${id}:`, err);
      await db.close();
      throw err;
    }
  }

  private getLeastBusyConnection(): Surreal {
    let leastBusyId = "";
    let minQueries = Infinity;

    for (const [id, queries] of this.activeQueries.entries()) {
      if (queries.size < minQueries) {
        minQueries = queries.size;
        leastBusyId = id;
      }
    }

    return this.pool.get(leastBusyId)!;
  }
}

// Export a simplified function interface for getting a DB connection
export async function getDb(connectionId = "default"): Promise<Surreal> {
  const pool = SurrealConnectionPool.getInstance();
  return pool.getConnection(connectionId);
}

// Export function to register and unregister queries
export function registerQuery(connectionId: string, queryId: string): void {
  const pool = SurrealConnectionPool.getInstance();
  pool.registerQuery(connectionId, queryId);
}

export function unregisterQuery(connectionId: string, queryId: string): void {
  const pool = SurrealConnectionPool.getInstance();
  pool.unregisterQuery(connectionId, queryId);
}

// Clean up function for app shutdown
export async function cleanupConnections(): Promise<void> {
  const pool = SurrealConnectionPool.getInstance();
  await pool.releaseAllConnections();
}

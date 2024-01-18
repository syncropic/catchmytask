// db.js
import { Surreal } from "surrealdb.js";

let catchmytaskDb: any = null;

export async function initializeDb({
  namespace,
  database,
  username,
  password,
}: {
  namespace: string;
  database: string;
  username: string;
  password: string;
}) {
  if (!catchmytaskDb) {
    catchmytaskDb = new Surreal();
    await catchmytaskDb.connect("https://dpdb.dpwanjala.com/rpc", {
      auth: {
        namespace,
        database,
        username,
        password,
      },
    });
  }
  return catchmytaskDb;
}

export function getDb() {
  if (!catchmytaskDb) {
    throw new Error("DB has not been initialized. Call initializeDb first.");
  }
  return catchmytaskDb;
}

export default initializeDb;

// db.js
import { Surreal } from "surrealdb.js";

let db: any = null;

export async function initializeDb(email: any, pass: any) {
  if (!db) {
    db = new Surreal();
    await db.connect("https://dpdb.dpwanjala.com/rpc", {
      namespace: "catchmytask",
      database: "catchmytask",
      // Set the authentication details for the connection
      auth: {
        namespace: "catchmytask",
        database: "catchmytask",
        username: "catchmytask",
        password: "ao6xjEh#55Ojjkawe&C0Kdv",
      },
    });
  }
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("DB has not been initialized. Call initializeDb first.");
  }
  return db;
}

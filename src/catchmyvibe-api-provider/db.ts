// db.js
import { Surreal } from "surrealdb.js";

let catchmyvibeDb: any = null;

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
  if (!catchmyvibeDb) {
    catchmyvibeDb = new Surreal();
    await catchmyvibeDb.connect("https://dpdb.dpwanjala.com/rpc", {
      auth: {
        namespace,
        database,
        username,
        password,
      },
    });
  }
  return catchmyvibeDb;
}

// export async function initializeDb(
//   namespace: any,
//   database: any,
//   username: any,
//   password: any
// ) {
//   if (!db) {
//     db = new Surreal();
//     await db.connect("https://dpdb.dpwanjala.com/rpc", {
//       namespace: "catchmytask",
//       database: "catchmytask",
//       // Set the authentication details for the connection
//       // auth: {
//       //   namespace: namespace || "catchmytask",
//       //   database: database || "catchmytask",
//       //   username: username || "catchmytask",
//       //   password: password || "ao6xjEh#55Ojjkawe&C0Kdv",
//       // },
//       auth: {
//         namespace: "catchmytask",
//         database: "catchmytask",
//         username: "catchmytask",
//         password: "ao6xjEh#55Ojjkawe&C0Kdv",
//       },
//     });
//   }
//   return db;
// }

export function getDb() {
  if (!catchmyvibeDb) {
    throw new Error("DB has not been initialized. Call initializeDb first.");
  }
  return catchmyvibeDb;
}

export default initializeDb;

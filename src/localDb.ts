// db.ts
import Dexie, { Table } from "dexie";
// import Dexie from "dexie";

// export const localStore = new Dexie("catchmyvibe");

// localStore.version(1).stores({
//   file_handles: "++id, file_handle_id, record_id, file_handle, name, type",
// });

export interface FileHandle {
  id?: string;
  file_handle_id: string;
  record_id: string;
  file_handle: ArrayBuffer;
  name: string;
  type: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  file_handles!: Table<FileHandle>;

  constructor() {
    super("localDb");
    this.version(1).stores({
      file_handles: "++id, file_handle_id, record_id, file_handle, name, type",
    });
  }
}

export const localDb = new MySubClassedDexie();

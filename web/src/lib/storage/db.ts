import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface StoredEvent {
  id?: number
  itemId: string
  action: string
  detail: string
  timestamp: string
}

interface CatchMyTaskDB extends DBSchema {
  items: {
    key: string
    value: import('@/types').WorkItem
    indexes: {
      'by-status': string
      'by-priority': string
      'by-assignee': string
      'by-type': string
      'by-created': string
    }
  }
  config: {
    key: string
    value: import('@/types').ProjectConfig
  }
  idCounters: {
    key: string
    value: { prefix: string; counter: number }
  }
  events: {
    key: number
    value: StoredEvent
    indexes: {
      'by-itemId': string
      'by-timestamp': string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<CatchMyTaskDB>> | null = null

export function getDB(): Promise<IDBPDatabase<CatchMyTaskDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CatchMyTaskDB>('catchmytask', 1, {
      upgrade(db) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' })
        itemStore.createIndex('by-status', 'status')
        itemStore.createIndex('by-priority', 'priority')
        itemStore.createIndex('by-assignee', 'assignee')
        itemStore.createIndex('by-type', 'type')
        itemStore.createIndex('by-created', 'created_at')

        db.createObjectStore('config', { keyPath: 'id' })
        db.createObjectStore('idCounters', { keyPath: 'prefix' })

        const eventStore = db.createObjectStore('events', {
          keyPath: 'id',
          autoIncrement: true,
        })
        eventStore.createIndex('by-itemId', 'itemId')
        eventStore.createIndex('by-timestamp', 'timestamp')
      },
    })
  }
  return dbPromise
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['items', 'config', 'idCounters', 'events'], 'readwrite')
  await Promise.all([
    tx.objectStore('items').clear(),
    tx.objectStore('config').clear(),
    tx.objectStore('idCounters').clear(),
    tx.objectStore('events').clear(),
    tx.done,
  ])
}

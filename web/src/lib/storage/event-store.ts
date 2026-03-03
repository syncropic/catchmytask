import { getDB, type StoredEvent } from './db'

export async function recordEvent(
  itemId: string,
  action: string,
  detail: string,
): Promise<void> {
  const db = await getDB()
  await db.add('events', {
    itemId,
    action,
    detail,
    timestamp: new Date().toISOString(),
  })
}

export async function getEvents(filters?: {
  itemId?: string
  limit?: number
}): Promise<StoredEvent[]> {
  const db = await getDB()

  let events: StoredEvent[]
  if (filters?.itemId) {
    events = await db.getAllFromIndex('events', 'by-itemId', filters.itemId)
  } else {
    events = await db.getAll('events')
  }

  // Sort newest first
  events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  if (filters?.limit) {
    events = events.slice(0, filters.limit)
  }

  return events
}

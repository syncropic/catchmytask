import type { WorkItem, ProjectConfig, CreateItemRequest, EditItemRequest } from '@/types'
import { formatItemId } from '@/lib/engine/ids'
import { validateItem } from '@/lib/engine/validation'
import { applyTransitionEffects } from '@/lib/engine/state-machine'
import { searchItems as searchEngine } from '@/lib/engine/search'
import { getDB } from './db'
import { recordEvent } from './event-store'
import { getConfig } from './config-store'

async function nextId(prefix: string): Promise<string> {
  const db = await getDB()
  const tx = db.transaction('idCounters', 'readwrite')
  const store = tx.objectStore('idCounters')
  const existing = await store.get(prefix)
  const next = (existing?.counter ?? 0) + 1
  await store.put({ prefix, counter: next })
  await tx.done
  return formatItemId(prefix, next)
}

export async function listItems(params?: Record<string, string>): Promise<WorkItem[]> {
  const db = await getDB()
  let items = await db.getAll('items')

  if (params?.status) {
    items = items.filter((i) => i.status === params.status)
  }
  if (params?.priority) {
    items = items.filter((i) => i.priority === params.priority)
  }
  if (params?.assignee) {
    items = items.filter((i) => i.assignee === params.assignee)
  }
  if (params?.type) {
    items = items.filter((i) => i.type === params.type)
  }
  if (params?.tag) {
    items = items.filter((i) => i.tags.includes(params.tag!))
  }

  // Sort by created_at descending (newest first)
  items.sort((a, b) => b.created_at.localeCompare(a.created_at))
  return items
}

export async function getItem(id: string): Promise<WorkItem> {
  const db = await getDB()
  const item = await db.get('items', id)
  if (!item) throw new Error(`Item '${id}' not found`)
  return item
}

export async function createItem(
  data: CreateItemRequest,
  config: ProjectConfig,
): Promise<WorkItem> {
  const now = new Date().toISOString()
  const id = await nextId(config.project.prefix)

  const item: WorkItem = {
    id,
    title: data.title,
    status: data.status ?? config.defaults.status,
    type: data.type ?? config.defaults.type,
    priority: data.priority ?? config.defaults.priority,
    assignee: data.assignee,
    parent: data.parent,
    depends_on: data.depends_on ?? [],
    tags: data.tags ?? [],
    due: data.due,
    created_at: now,
    body: data.body,
  }

  const validation = validateItem(item, config)
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '))
  }

  const db = await getDB()
  await db.put('items', item)
  await recordEvent(id, 'created', `Created: ${item.title}`)
  return item
}

export async function updateItem(
  id: string,
  data: EditItemRequest,
): Promise<WorkItem> {
  const db = await getDB()
  const existing = await db.get('items', id)
  if (!existing) throw new Error(`Item '${id}' not found`)

  const updated: WorkItem = { ...existing, updated_at: new Date().toISOString() }

  if (data.title !== undefined) updated.title = data.title
  if (data.priority !== undefined) updated.priority = data.priority
  if (data.assignee !== undefined) updated.assignee = data.assignee
  if (data.parent !== undefined) updated.parent = data.parent
  if (data.due !== undefined) updated.due = data.due
  if (data.type !== undefined) updated.type = data.type
  if (data.body !== undefined) updated.body = data.body

  if (data.add_tags?.length) {
    updated.tags = [...new Set([...updated.tags, ...data.add_tags])]
  }
  if (data.remove_tags?.length) {
    updated.tags = updated.tags.filter((t) => !data.remove_tags!.includes(t))
  }
  if (data.add_deps?.length) {
    updated.depends_on = [...new Set([...updated.depends_on, ...data.add_deps])]
  }
  if (data.remove_deps?.length) {
    updated.depends_on = updated.depends_on.filter((d) => !data.remove_deps!.includes(d))
  }

  await db.put('items', updated)
  await recordEvent(id, 'updated', `Updated: ${updated.title}`)
  return updated
}

export async function changeStatus(
  id: string,
  status: string,
  reason?: string,
  force?: boolean,
  config?: ProjectConfig,
): Promise<WorkItem> {
  const db = await getDB()
  const existing = await db.get('items', id)
  if (!existing) throw new Error(`Item '${id}' not found`)

  // Get state machine — need config for this
  let machine = config?.state_machines?.default
  if (!machine) {
    // Fallback: read config from IDB
    const cfg = await getConfig()
    machine = cfg.state_machines.default
  }

  const result = applyTransitionEffects(existing, status, machine, reason, force)
  if (result.error) {
    throw new Error(result.error)
  }

  await db.put('items', result.item)
  await recordEvent(id, 'status_changed', `${existing.status} -> ${status}`)
  return result.item
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('items', id)
  if (!existing) throw new Error(`Item '${id}' not found`)
  await db.delete('items', id)
  await recordEvent(id, 'deleted', `Deleted: ${existing.title}`)
}

export async function searchItemsQuery(query: string): Promise<WorkItem[]> {
  const db = await getDB()
  const allItems = await db.getAll('items')
  return searchEngine(allItems, query)
}

export async function getItemCount(): Promise<number> {
  const db = await getDB()
  return db.count('items')
}

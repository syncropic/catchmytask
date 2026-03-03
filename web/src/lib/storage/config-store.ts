import type { ProjectConfig } from '@/types'
import { DEFAULT_CONFIG, validateConfig } from '@/lib/engine/config'
import { getDB } from './db'

const CONFIG_KEY = 'active'

// We store config with an extra `id` field for the IDB key
type StoredConfig = ProjectConfig & { id: string }

export async function getConfig(): Promise<ProjectConfig> {
  const db = await getDB()
  const stored = await db.get('config', CONFIG_KEY) as StoredConfig | undefined
  if (!stored) return DEFAULT_CONFIG
  // Strip the IDB key before returning
  const { id: _id, ...config } = stored
  return config as ProjectConfig
}

export async function saveConfig(config: ProjectConfig): Promise<void> {
  const result = validateConfig(config)
  if (!result.valid) {
    throw new Error(`Invalid config: ${result.errors.join('; ')}`)
  }
  const db = await getDB()
  await db.put('config', { ...config, id: CONFIG_KEY } as StoredConfig)
}

export async function resetConfig(): Promise<void> {
  const db = await getDB()
  await db.delete('config', CONFIG_KEY)
}

export async function hasConfig(): Promise<boolean> {
  const db = await getDB()
  const stored = await db.get('config', CONFIG_KEY)
  return !!stored
}

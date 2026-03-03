import JSZip from 'jszip'
import type { WorkItem, ProjectConfig } from '@/types'
import { getDB } from './db'
import { getConfig, saveConfig } from './config-store'
import { parseItemId } from '@/lib/engine/ids'

function itemToMarkdown(item: WorkItem): string {
  const frontmatter: Record<string, unknown> = {
    id: item.id,
    title: item.title,
    type: item.type ?? 'task',
    status: item.status,
    priority: item.priority ?? 'none',
  }

  if (item.assignee) frontmatter.assignee = item.assignee
  if (item.parent) frontmatter.parent = item.parent
  if (item.depends_on.length) frontmatter.depends_on = item.depends_on
  if (item.tags.length) frontmatter.tags = item.tags
  if (item.due) frontmatter.due = item.due
  frontmatter.created = item.created_at
  if (item.started_at) frontmatter.started = item.started_at
  if (item.completed_at) frontmatter.completed = item.completed_at
  if (item.updated_at) frontmatter.updated = item.updated_at
  if (item.blocked_reason) frontmatter.blocked_reason = item.blocked_reason

  // Simple YAML serialization (no library needed for flat structure)
  const yamlLines: string[] = []
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yamlLines.push(`${key}: [${value.map((v) => JSON.stringify(v)).join(', ')}]`)
    } else if (typeof value === 'string') {
      // Quote strings that contain special chars
      if (value.includes(':') || value.includes('#') || value.includes('"')) {
        yamlLines.push(`${key}: "${value.replace(/"/g, '\\"')}"`)
      } else {
        yamlLines.push(`${key}: ${value}`)
      }
    } else {
      yamlLines.push(`${key}: ${value}`)
    }
  }

  let content = `---\n${yamlLines.join('\n')}\n---\n`
  if (item.body) {
    content += `\n${item.body}\n`
  }
  return content
}

function configToYaml(config: ProjectConfig): string {
  const lines: string[] = ['version: 1', '', 'project:']
  lines.push(`  name: "${config.project.name}"`)
  lines.push(`  prefix: "${config.project.prefix}"`)
  if (config.project.description) {
    lines.push(`  description: "${config.project.description}"`)
  }
  lines.push('', 'defaults:')
  lines.push(`  priority: ${config.defaults.priority}`)
  lines.push(`  type: ${config.defaults.type}`)
  lines.push(`  status: ${config.defaults.status}`)
  return lines.join('\n') + '\n'
}

export async function exportToZip(): Promise<Blob> {
  const db = await getDB()
  const items = await db.getAll('items')
  const config = await getConfig()

  const zip = new JSZip()
  const workDir = zip.folder('.cmt')!

  // config.yml
  workDir.file('config.yml', configToYaml(config))

  // items/
  const itemsDir = workDir.folder('items')!
  for (const item of items) {
    itemsDir.file(`${item.id}.md`, itemToMarkdown(item))
  }

  return zip.generateAsync({ type: 'blob' })
}

// Simple YAML frontmatter parser
function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const yamlStr = match[1]
  const body = match[2].trim()
  const frontmatter: Record<string, unknown> = {}

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Parse arrays: [a, b, c]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1)
      value = inner
        ? inner.split(',').map((v) => v.trim().replace(/^"(.*)"$/, '$1'))
        : []
    }
    // Unquote strings
    else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    frontmatter[key] = value
  }

  return { frontmatter, body }
}

function parseSimpleYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  let currentSection = ''

  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue

    if (!line.startsWith(' ') && line.endsWith(':')) {
      currentSection = line.slice(0, -1).trim()
      result[currentSection] = {}
      continue
    }

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value: string = line.slice(colonIdx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }

    if (currentSection && typeof result[currentSection] === 'object') {
      (result[currentSection] as Record<string, unknown>)[key] = value
    } else {
      result[key] = value
    }
  }

  return result
}

export async function importFromZip(file: File): Promise<{ itemCount: number }> {
  const zip = await JSZip.loadAsync(file)

  // Find the .cmt directory (might be at root or nested)
  let prefix = ''
  for (const path of Object.keys(zip.files)) {
    if (path.endsWith('config.yml')) {
      prefix = path.replace('config.yml', '')
      break
    }
  }

  // Import config
  const configFile = zip.file(`${prefix}config.yml`)
  if (configFile) {
    const configText = await configFile.async('string')
    const parsed = parseSimpleYaml(configText)
    const project = (parsed.project ?? {}) as Record<string, string>
    const defaults = (parsed.defaults ?? {}) as Record<string, string>

    const config = await getConfig()
    if (project.name) config.project.name = project.name
    if (project.prefix) config.project.prefix = project.prefix
    if (project.description) config.project.description = project.description
    if (defaults.priority) config.defaults.priority = defaults.priority
    if (defaults.type) config.defaults.type = defaults.type
    if (defaults.status) config.defaults.status = defaults.status
    await saveConfig(config)
  }

  // Import items
  const db = await getDB()
  let itemCount = 0
  const itemFiles = Object.keys(zip.files).filter(
    (path) => path.includes('items/') && path.endsWith('.md'),
  )

  for (const path of itemFiles) {
    const content = await zip.file(path)!.async('string')
    const { frontmatter, body } = parseFrontmatter(content)

    const item: WorkItem = {
      id: (frontmatter.id as string) ?? '',
      title: (frontmatter.title as string) ?? '',
      status: (frontmatter.status as string) ?? 'inbox',
      type: (frontmatter.type as string) ?? 'task',
      priority: (frontmatter.priority as string) ?? 'none',
      assignee: frontmatter.assignee as string | undefined,
      parent: frontmatter.parent as string | undefined,
      depends_on: (frontmatter.depends_on as string[]) ?? [],
      tags: (frontmatter.tags as string[]) ?? [],
      due: frontmatter.due as string | undefined,
      created_at: (frontmatter.created as string) ?? new Date().toISOString(),
      started_at: frontmatter.started as string | undefined,
      completed_at: frontmatter.completed as string | undefined,
      updated_at: frontmatter.updated as string | undefined,
      blocked_reason: frontmatter.blocked_reason as string | undefined,
      body: body || undefined,
    }

    if (!item.id || !item.title) continue

    await db.put('items', item)
    itemCount++

    // Update ID counter if needed
    const parsed = parseItemId(item.id)
    if (parsed) {
      const existing = await db.get('idCounters', parsed.prefix)
      if (!existing || existing.counter < parsed.number) {
        await db.put('idCounters', { prefix: parsed.prefix, counter: parsed.number })
      }
    }
  }

  return { itemCount }
}

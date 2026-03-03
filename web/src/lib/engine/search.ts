import type { WorkItem } from '@/types'

interface SearchResult {
  item: WorkItem
  score: number
}

export function searchItems(items: WorkItem[], query: string): WorkItem[] {
  if (!query.trim()) return items

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  const results: SearchResult[] = []

  for (const item of items) {
    let score = 0
    const searchable = [
      item.id.toLowerCase(),
      item.title.toLowerCase(),
      item.body?.toLowerCase() ?? '',
      item.assignee?.toLowerCase() ?? '',
      ...item.tags.map((t) => t.toLowerCase()),
      item.status.toLowerCase(),
      item.type?.toLowerCase() ?? '',
    ].join(' ')

    for (const term of terms) {
      if (item.id.toLowerCase() === term) {
        score += 100
      } else if (item.title.toLowerCase().includes(term)) {
        score += 10
      } else if (searchable.includes(term)) {
        score += 1
      }
    }

    if (score > 0) {
      results.push({ item, score })
    }
  }

  return results.sort((a, b) => b.score - a.score).map((r) => r.item)
}

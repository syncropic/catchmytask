import type { WorkItem, ProjectConfig } from '@/types'
import { parseItemId } from './ids'

export interface ItemValidationResult {
  valid: boolean
  errors: string[]
}

export function validateItem(item: Partial<WorkItem>, config: ProjectConfig): ItemValidationResult {
  const errors: string[] = []

  // V-02: title required and non-empty
  if (!item.title || item.title.trim().length === 0) {
    errors.push('Title is required.')
  }

  // V-03: title length
  if (item.title && item.title.length > 200) {
    errors.push('Title must be 200 characters or fewer.')
  }

  // V-04: status must be valid in state machine
  if (item.status) {
    const machine = config.state_machines.default
    if (machine && !machine.states[item.status]) {
      errors.push(`Unknown status '${item.status}'.`)
    }
  }

  // V-05: priority must be valid
  if (item.priority) {
    const validPriorities = ['critical', 'high', 'medium', 'low', 'none']
    if (!validPriorities.includes(item.priority)) {
      errors.push(`Invalid priority '${item.priority}'.`)
    }
  }

  // V-06: id format
  if (item.id && !parseItemId(item.id)) {
    errors.push(`Invalid item ID format '${item.id}'.`)
  }

  // V-07: depends_on IDs must be valid format
  if (item.depends_on) {
    for (const dep of item.depends_on) {
      if (!parseItemId(dep)) {
        errors.push(`Invalid dependency ID '${dep}'.`)
      }
    }
  }

  // V-08: no self-dependency
  if (item.id && item.depends_on?.includes(item.id)) {
    errors.push('Item cannot depend on itself.')
  }

  // V-09: parent ID format
  if (item.parent && !parseItemId(item.parent)) {
    errors.push(`Invalid parent ID '${item.parent}'.`)
  }

  // V-10: no self-parent
  if (item.id && item.parent === item.id) {
    errors.push('Item cannot be its own parent.')
  }

  // V-11: due date format (ISO 8601 date)
  if (item.due && !/^\d{4}-\d{2}-\d{2}/.test(item.due)) {
    errors.push(`Invalid due date format '${item.due}'.`)
  }

  return { valid: errors.length === 0, errors }
}

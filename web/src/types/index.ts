export interface WorkItem {
  id: string
  title: string
  status: string
  type?: string
  priority?: string
  assignee?: string
  parent?: string
  depends_on: string[]
  tags: string[]
  due?: string
  created_at: string
  started_at?: string
  completed_at?: string
  updated_at?: string
  blocked_reason?: string
  body?: string
}

export interface StateInfo {
  initial: boolean
  terminal: boolean
}

export interface TransitionInfo {
  from: string
  to: string
}

export interface StateMachineInfo {
  states: Record<string, StateInfo>
  transitions: TransitionInfo[]
}

export interface ProjectConfig {
  project: {
    name: string
    prefix: string
    description: string
  }
  defaults: {
    priority: string
    type: string
    status: string
  }
  state_machines: Record<string, StateMachineInfo>
}

export interface CreateItemRequest {
  title: string
  type?: string
  priority?: string
  assignee?: string
  parent?: string
  depends_on?: string[]
  tags?: string[]
  due?: string
  status?: string
  body?: string
}

export interface EditItemRequest {
  title?: string
  priority?: string
  assignee?: string
  parent?: string
  due?: string
  type?: string
  add_tags?: string[]
  remove_tags?: string[]
  add_deps?: string[]
  remove_deps?: string[]
  body?: string
}

export interface StatusChangeRequest {
  status: string
  reason?: string
  force?: boolean
}

export interface ProjectListEntry {
  name: string
  prefix: string
  path: string
  is_default: boolean
  item_count: number
}

export interface ProjectsResponse {
  projects: ProjectListEntry[]
  default_project: string
}

export type View = 'board' | 'list' | 'timeline' | 'graph' | 'dashboard' | 'activity' | 'settings' | 'terminal'

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low', 'none']

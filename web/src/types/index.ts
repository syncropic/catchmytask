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
  artifact_count?: number
}

export interface Artifact {
  name: string
  path: string
  source: 'contained' | 'ref_local' | 'ref_remote'
  category: string | null
  label: string | null
  size: number | null
  mime: string | null
  modified: string | null
  lines: number | null
  is_text: boolean
}

export interface ArtifactList {
  item_id: string
  is_complex: boolean
  truncated: boolean
  artifacts: Artifact[]
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

export type View = 'board' | 'list' | 'dashboard' | 'activity' | 'artifacts' | 'settings'

export interface ProjectArtifactEntry {
  item_id: string
  item_title: string
  name: string
  path: string
  source: 'contained' | 'ref_local' | 'ref_remote'
  category: string | null
  label: string | null
  size: number | null
  mime: string | null
  modified: string | null
  lines: number | null
  is_text: boolean
}

export interface ProjectArtifactsResponse {
  artifacts: ProjectArtifactEntry[]
  total: number
}

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'none'

export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low', 'none']

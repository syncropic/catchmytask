import type { WorkItem, ProjectConfig, ProjectsResponse, CreateItemRequest, EditItemRequest, StatusChangeRequest, ArtifactList, ProjectArtifactsResponse, ContextResponse } from '@/types'
import { useConnectionStore } from '@/stores/connection'
import { useProjectStore } from '@/stores/project'
import { localApi } from './local-api'

// --- Remote API implementation (original HTTP-based) ---

function createRemoteApi(baseUrl: string) {
  const BASE = baseUrl ? `${baseUrl}/api` : '/api'

  function appendProject(path: string): string {
    const project = useProjectStore.getState().currentProject
    if (!project) return path
    const sep = path.includes('?') ? '&' : '?'
    return `${path}${sep}project=${encodeURIComponent(project)}`
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(body.error || res.statusText)
    }
    if (res.status === 204) return undefined as T
    return res.json()
  }

  return {
    health: () => request<{ status: string; version: string; work_dir: string }>('/health'),
    projects: () => request<ProjectsResponse>('/projects'),
    config: () => request<ProjectConfig>(appendProject('/config')),
    items: {
      list: async (params?: Record<string, string>) => {
        const project = useProjectStore.getState().currentProject
        const allParams: Record<string, string> = { ...params }
        if (project) allParams.project = project
        const qs = Object.keys(allParams).length ? '?' + new URLSearchParams(allParams).toString() : ''
        const res = await request<{ items: WorkItem[] }>(`/items${qs}`)
        return res.items
      },
      get: (id: string) =>
        request<WorkItem>(appendProject(`/items/${encodeURIComponent(id)}`)),
      create: (data: CreateItemRequest) =>
        request<WorkItem>(appendProject('/items'), { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: EditItemRequest) =>
        request<WorkItem>(appendProject(`/items/${encodeURIComponent(id)}`), {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      changeStatus: (id: string, data: StatusChangeRequest) =>
        request<WorkItem>(appendProject(`/items/${encodeURIComponent(id)}/status`), {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<void>(appendProject(`/items/${encodeURIComponent(id)}`), { method: 'DELETE' }),
      artifacts: (id: string) =>
        request<ArtifactList>(appendProject(`/items/${encodeURIComponent(id)}/artifacts`)),
      artifactUrl: (id: string, artifactPath: string) => {
        const project = useProjectStore.getState().currentProject
        const qs = project ? `?project=${encodeURIComponent(project)}` : ''
        return `${BASE}/items/${encodeURIComponent(id)}/artifacts/${artifactPath}${qs}`
      },
      context: (id: string) =>
        request<ContextResponse>(appendProject(`/items/${encodeURIComponent(id)}/context`)),
    },
    artifacts: () => request<ProjectArtifactsResponse>(appendProject('/artifacts')),
    search: async (q: string, params?: Record<string, string>) => {
      const project = useProjectStore.getState().currentProject
      const allParams: Record<string, string> = { q, ...params }
      if (project) allParams.project = project
      const qs = new URLSearchParams(allParams).toString()
      const res = await request<{ items: WorkItem[] }>(`/search?${qs}`)
      return res.items
    },
  }
}

// --- Dynamic API that delegates based on connection mode ---

type ApiInterface = ReturnType<typeof createRemoteApi>

function getActiveApi(): ApiInterface {
  const { mode, remoteUrl } = useConnectionStore.getState()
  if (mode === 'local') return localApi as unknown as ApiInterface
  return createRemoteApi(remoteUrl)
}

export const api = {
  health: (...args: Parameters<ApiInterface['health']>) => getActiveApi().health(...args),
  projects: (...args: Parameters<ApiInterface['projects']>) => getActiveApi().projects(...args),
  config: (...args: Parameters<ApiInterface['config']>) => getActiveApi().config(...args),
  items: {
    list: (...args: Parameters<ApiInterface['items']['list']>) => getActiveApi().items.list(...args),
    get: (...args: Parameters<ApiInterface['items']['get']>) => getActiveApi().items.get(...args),
    create: (...args: Parameters<ApiInterface['items']['create']>) => getActiveApi().items.create(...args),
    update: (...args: Parameters<ApiInterface['items']['update']>) => getActiveApi().items.update(...args),
    changeStatus: (...args: Parameters<ApiInterface['items']['changeStatus']>) =>
      getActiveApi().items.changeStatus(...args),
    delete: (...args: Parameters<ApiInterface['items']['delete']>) => getActiveApi().items.delete(...args),
    artifacts: (...args: Parameters<ApiInterface['items']['artifacts']>) =>
      getActiveApi().items.artifacts(...args),
    artifactUrl: (...args: Parameters<ApiInterface['items']['artifactUrl']>) =>
      getActiveApi().items.artifactUrl(...args),
    context: (...args: Parameters<ApiInterface['items']['context']>) =>
      getActiveApi().items.context(...args),
  },
  artifacts: (...args: Parameters<ApiInterface['artifacts']>) => getActiveApi().artifacts(...args),
  search: (...args: Parameters<ApiInterface['search']>) => getActiveApi().search(...args),
}

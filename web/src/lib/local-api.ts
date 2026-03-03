import type { WorkItem, ProjectConfig, ProjectsResponse, CreateItemRequest, EditItemRequest } from '@/types'
import * as itemStore from './storage/item-store'
import * as configStore from './storage/config-store'

export const localApi = {
  health: async () => ({
    status: 'ok',
    version: '0.1.1',
    work_dir: 'browser://local',
  }),

  projects: async (): Promise<ProjectsResponse> => {
    const config = await configStore.getConfig()
    const count = await itemStore.getItemCount()
    return {
      projects: [
        {
          name: config.project.name,
          prefix: config.project.prefix,
          path: 'browser://local',
          is_default: true,
          item_count: count,
        },
      ],
      default_project: config.project.name,
    }
  },

  config: async (): Promise<ProjectConfig> => {
    return configStore.getConfig()
  },

  items: {
    list: async (params?: Record<string, string>): Promise<WorkItem[]> => {
      return itemStore.listItems(params)
    },

    get: async (id: string): Promise<WorkItem> => {
      return itemStore.getItem(id)
    },

    create: async (data: CreateItemRequest): Promise<WorkItem> => {
      const config = await configStore.getConfig()
      return itemStore.createItem(data, config)
    },

    update: async (id: string, data: EditItemRequest): Promise<WorkItem> => {
      return itemStore.updateItem(id, data)
    },

    changeStatus: async (id: string, data: { status: string; reason?: string; force?: boolean }): Promise<WorkItem> => {
      const config = await configStore.getConfig()
      return itemStore.changeStatus(id, data.status, data.reason, data.force, config)
    },

    delete: async (id: string): Promise<void> => {
      return itemStore.deleteItem(id)
    },
  },

  search: async (q: string, _params?: Record<string, string>): Promise<WorkItem[]> => {
    return itemStore.searchItemsQuery(q)
  },
}

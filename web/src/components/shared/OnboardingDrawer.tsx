import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { saveConfig } from '@/lib/storage/config-store'
import { DEFAULT_CONFIG } from '@/lib/engine/config'
import * as itemStore from '@/lib/storage/item-store'
import type { ProjectConfig } from '@/types'

const SAMPLE_ITEMS = [
  {
    title: 'Set up project structure',
    type: 'task',
    priority: 'high',
    tags: ['setup'],
    status: 'done',
    body: 'Initialize the project with the basic directory structure and configuration files.',
  },
  {
    title: 'Design the API layer',
    type: 'task',
    priority: 'high',
    tags: ['architecture', 'api'],
    status: 'active',
    body: 'Define the REST API endpoints and data models for the work management system.',
  },
  {
    title: 'Implement authentication',
    type: 'task',
    priority: 'medium',
    tags: ['security', 'backend'],
    status: 'ready',
    body: 'Add JWT-based authentication for API access.',
  },
  {
    title: 'Write user documentation',
    type: 'task',
    priority: 'low',
    tags: ['docs'],
    status: 'inbox',
    body: 'Create comprehensive user guides and API documentation.',
  },
  {
    title: 'Fix timezone handling in due dates',
    type: 'bug',
    priority: 'medium',
    tags: ['bug', 'dates'],
    status: 'inbox',
    body: 'Due dates are not correctly handling timezone conversions.',
  },
]

interface Props {
  onComplete: () => void
}

export function OnboardingDrawer({ onComplete }: Props) {
  const queryClient = useQueryClient()
  const [projectName, setProjectName] = useState('My Project')
  const [prefix, setPrefix] = useState('CMT')
  const [loading, setLoading] = useState(false)

  async function handleStart(withSamples: boolean) {
    setLoading(true)
    try {
      const config: ProjectConfig = {
        ...DEFAULT_CONFIG,
        project: {
          name: projectName,
          prefix: prefix.toUpperCase(),
          description: '',
        },
      }
      await saveConfig(config)

      if (withSamples) {
        for (const sample of SAMPLE_ITEMS) {
          const item = await itemStore.createItem(
            {
              title: sample.title,
              type: sample.type,
              priority: sample.priority,
              tags: sample.tags,
              body: sample.body,
            },
            config,
          )
          // Move to the target status via transitions
          if (sample.status !== config.defaults.status) {
            await moveToStatus(item.id, sample.status, config)
          }
        }
      }

      queryClient.invalidateQueries()
      onComplete()
    } catch (err) {
      console.error('Onboarding failed:', err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-bg-secondary border border-border-default rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-text-primary">
            Welcome to CatchMyTask
          </h1>
          <p className="text-xs text-text-muted">
            A next-generation work management system for humans and AI agents.
            Everything runs in your browser — no server needed.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Project Name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded text-sm text-text-primary focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">ID Prefix</label>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="CMT"
              className="w-32 px-3 py-2 bg-bg-tertiary border border-border-default rounded text-sm text-text-primary font-mono focus:outline-none focus:border-accent"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Items will be numbered {prefix || 'CMT'}-0001, {prefix || 'CMT'}-0002, etc.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleStart(true)}
            disabled={loading || !projectName.trim()}
            className="flex-1 px-4 py-2 bg-accent text-white rounded text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Setting up...' : 'Start with samples'}
          </button>
          <button
            onClick={() => handleStart(false)}
            disabled={loading || !projectName.trim()}
            className="flex-1 px-4 py-2 bg-bg-tertiary border border-border-default text-text-secondary rounded text-sm hover:bg-bg-hover disabled:opacity-50 transition-colors"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper to transition an item through the state machine to reach a target status
async function moveToStatus(id: string, targetStatus: string, config: ProjectConfig) {
  const paths: Record<string, string[]> = {
    ready: ['ready'],
    active: ['ready', 'active'],
    blocked: ['ready', 'active', 'blocked'],
    done: ['ready', 'active', 'done'],
    cancelled: ['cancelled'],
  }
  const path = paths[targetStatus]
  if (!path) return

  for (const status of path) {
    try {
      await itemStore.changeStatus(id, status, undefined, false, config)
    } catch {
      // If transition fails, force it
      await itemStore.changeStatus(id, status, undefined, true, config)
    }
  }
}

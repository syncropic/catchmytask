import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useConnectionStore } from '@/stores/connection'
import { getConfig, saveConfig, resetConfig } from '@/lib/storage/config-store'
import { clearAllData } from '@/lib/storage/db'
import { exportToZip, importFromZip } from '@/lib/storage/export'
import type { ProjectConfig } from '@/types'

export function SettingsView({ config }: { config: ProjectConfig | null }) {
  const queryClient = useQueryClient()
  const mode = useConnectionStore((s) => s.mode)
  const remoteUrl = useConnectionStore((s) => s.remoteUrl)
  const setMode = useConnectionStore((s) => s.setMode)
  const setRemoteUrl = useConnectionStore((s) => s.setRemoteUrl)

  const [testResult, setTestResult] = useState<string | null>(null)
  const [editingConfig, setEditingConfig] = useState(false)
  const [projectName, setProjectName] = useState(config?.project.name ?? '')
  const [projectPrefix, setProjectPrefix] = useState(config?.project.prefix ?? 'WM')
  const [projectDesc, setProjectDesc] = useState(config?.project.description ?? '')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)

  async function testConnection() {
    setTestResult('Testing...')
    try {
      const url = remoteUrl || window.location.origin
      const res = await fetch(`${url}/api/health`)
      if (res.ok) {
        const data = await res.json()
        setTestResult(`Connected: v${data.version}`)
      } else {
        setTestResult(`Failed: ${res.status} ${res.statusText}`)
      }
    } catch (err) {
      setTestResult(`Error: ${(err as Error).message}`)
    }
  }

  async function handleSaveConfig() {
    try {
      const current = await getConfig()
      const updated: ProjectConfig = {
        ...current,
        project: {
          name: projectName,
          prefix: projectPrefix,
          description: projectDesc,
        },
      }
      await saveConfig(updated)
      setEditingConfig(false)
      queryClient.invalidateQueries()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  async function handleExport() {
    const blob = await exportToZip()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cmt-export-${new Date().toISOString().slice(0, 10)}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('Importing...')
    try {
      const result = await importFromZip(file)
      setImportStatus(`Imported ${result.itemCount} items`)
      queryClient.invalidateQueries()
    } catch (err) {
      setImportStatus(`Error: ${(err as Error).message}`)
    }
    e.target.value = ''
  }

  async function handleReset() {
    await clearAllData()
    await resetConfig()
    setResetConfirm(false)
    queryClient.invalidateQueries()
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
      <h1 className="text-lg font-semibold text-text-primary">Settings</h1>

      {/* Connection Mode */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          Connection Mode
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('local')
              queryClient.invalidateQueries()
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === 'local'
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover'
            }`}
          >
            Browser (Local)
          </button>
          <button
            onClick={() => {
              setMode('remote')
              queryClient.invalidateQueries()
            }}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === 'remote'
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-hover'
            }`}
          >
            Remote Server
          </button>
        </div>

        {mode === 'remote' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="http://localhost:3170"
                className="flex-1 px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={testConnection}
                className="px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Test
              </button>
            </div>
            {testResult && (
              <p className={`text-xs ${testResult.startsWith('Connected') ? 'text-code' : 'text-red-400'}`}>
                {testResult}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-text-muted">
          {mode === 'local'
            ? 'Data is stored in your browser using IndexedDB. Works offline.'
            : 'Connects to a `cmt serve` backend over HTTP.'}
        </p>
      </section>

      {/* Project Configuration — only in local mode */}
      {mode === 'local' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Project Configuration
            </h2>
            {!editingConfig && (
              <button
                onClick={() => {
                  setProjectName(config?.project.name ?? '')
                  setProjectPrefix(config?.project.prefix ?? 'WM')
                  setProjectDesc(config?.project.description ?? '')
                  setEditingConfig(true)
                }}
                className="text-xs text-accent-text hover:text-accent-hover"
              >
                Edit
              </button>
            )}
          </div>

          {editingConfig ? (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-text-muted mb-1">Project Name</label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Prefix</label>
                <input
                  value={projectPrefix}
                  onChange={(e) => setProjectPrefix(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-32 px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description</label>
                <input
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1.5 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingConfig(false)}
                  className="px-3 py-1.5 bg-bg-tertiary text-text-secondary rounded text-xs hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-bg-tertiary rounded p-3 space-y-1">
              <div className="flex gap-4 text-xs">
                <span className="text-text-muted">Name:</span>
                <span className="text-text-primary">{config?.project.name}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-text-muted">Prefix:</span>
                <span className="text-text-primary font-mono">{config?.project.prefix}</span>
              </div>
              {config?.project.description && (
                <div className="flex gap-4 text-xs">
                  <span className="text-text-muted">Description:</span>
                  <span className="text-text-primary">{config.project.description}</span>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* State Machine */}
      {config?.state_machines?.default && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            State Machine
          </h2>
          <div className="bg-bg-tertiary rounded p-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(config.state_machines.default.states).map(([name, info]) => (
                <span
                  key={name}
                  className={`px-2 py-0.5 rounded text-xs font-mono ${
                    info.initial
                      ? 'bg-accent/15 text-accent-text border border-accent/30'
                      : info.terminal
                        ? 'bg-bg-hover text-text-muted border border-border-default'
                        : 'bg-bg-hover text-text-secondary border border-border-default'
                  }`}
                >
                  {name}
                  {info.initial && ' (initial)'}
                  {info.terminal && ' (terminal)'}
                </span>
              ))}
            </div>
            <div className="space-y-0.5">
              {config.state_machines.default.transitions.map((t, i) => (
                <div key={i} className="text-xs text-text-muted font-mono">
                  {t.from} → {t.to}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Data Management — only in local mode */}
      {mode === 'local' && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Data Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Export (.cmt zip)
            </button>
            <label className="px-3 py-1.5 bg-bg-tertiary border border-border-default rounded text-xs text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
              Import (.cmt zip)
              <input
                type="file"
                accept=".zip"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-3 py-1.5 bg-bg-tertiary border border-red-900 rounded text-xs text-red-400 hover:bg-red-950 transition-colors"
              >
                Reset All Data
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-red-400">Are you sure?</span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-500 transition-colors"
                >
                  Yes, delete everything
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-3 py-1.5 bg-bg-tertiary text-text-secondary rounded text-xs hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {importStatus && (
            <p className={`text-xs ${importStatus.startsWith('Error') ? 'text-red-400' : 'text-code'}`}>
              {importStatus}
            </p>
          )}
        </section>
      )}

      {/* About */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
          About
        </h2>
        <div className="bg-bg-tertiary rounded p-3 space-y-1 text-xs text-text-muted">
          <p>
            <span className="text-text-secondary">CatchMyTask</span> v0.2.0
          </p>
          <p>
            A next-generation work management system for humans and AI agents.
          </p>
          <p>Plain text files. Git-native. Local-first.</p>
        </div>
      </section>
    </div>
  )
}

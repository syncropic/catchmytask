const FEATURES = [
  {
    title: '21 CLI Commands',
    description: 'add, list, show, edit, done, status, search, archive, serve, doctor, and more.',
  },
  {
    title: 'Configurable State Machines',
    description: 'Define custom workflows in YAML. Validate transitions at runtime.',
  },
  {
    title: 'SQLite Indexing',
    description: 'Fast queries over thousands of items. Auto-reindex on changes.',
  },
  {
    title: 'Layered Configuration',
    description: 'Global, project, local, and env overrides. Progressive complexity.',
  },
  {
    title: 'Agent Discovery',
    description: 'Progressive discovery system for AI agents. `cmt setup` for platform integrations.',
  },
  {
    title: 'Web UI',
    description: 'Board, list, dashboard, activity, and terminal views. Real-time updates via WebSocket.',
  },
  {
    title: 'Command Bar & Terminal',
    description: 'Embedded CLI in the browser (Ctrl+J). Full cmt command parity with rich output, autocomplete, and history.',
  },
  {
    title: 'Browser-Native Mode',
    description: 'Run entirely in the browser with IndexedDB. Zero installation needed.',
  },
  {
    title: 'Export / Import',
    description: 'Export to .cmt/ zip files compatible with the CLI. Full interoperability.',
  },
  {
    title: 'Multi-Project',
    description: 'Manage multiple projects from a single CLI or web interface.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-6 bg-bg-secondary">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Features</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            Production-grade work management that scales from a solo developer to a team
            with five AI agents working overnight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-4 bg-bg-primary border border-border-default rounded-lg space-y-2 hover:border-border-subtle transition-colors"
            >
              <h3 className="text-sm font-medium text-text-primary">{f.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

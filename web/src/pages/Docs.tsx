import { useState, useEffect } from 'react'
import { Navigation } from '@/sections/Navigation'
import { Footer } from '@/sections/Footer'

const SECTIONS = [
  ['overview', 'Overview'],
  ['commands', 'Commands'],
  ['state-machine', 'State Machine'],
  ['file-format', 'File Format'],
  ['agent-quickstart', 'Agent Quickstart'],
  ['configuration', 'Configuration'],
  ['web-ui', 'Web UI'],
  ['workflow', 'Multi-Context Workflow'],
  ['doctor', 'Doctor'],
] as const

function TOC() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (const [id] of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="space-y-1">
      {SECTIONS.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          className={`block px-3 py-1.5 rounded text-xs transition-colors ${
            active === id
              ? 'bg-accent/15 text-accent-text font-medium border-l-2 border-accent'
              : 'text-text-secondary hover:text-accent-text hover:bg-bg-hover'
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl md:text-2xl font-bold text-text-primary pt-8 scroll-mt-20">
      {children}
    </h2>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="text-xs font-mono text-code bg-bg-primary border border-border-default rounded-lg p-4 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  )
}

function Overview() {
  return (
    <div className="space-y-4">
      <SectionHeading id="overview">Overview</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        CatchMyTask (<code className="text-accent-text">cmt</code>) is a file-first work management system built in Rust.
        Work items are Markdown files with YAML frontmatter stored in <code className="text-accent-text">.cmt/items/</code>.
        Git is the history layer. AI agents and humans are equal first-class actors.
        Use it via the CLI, or <a href="/app" className="text-accent-text hover:underline font-medium">try the web UI</a> right
        in your browser — no installation needed.
      </p>
      <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
        <pre className="text-xs text-text-secondary font-mono text-center leading-loose">
{`┌─────────────────────────────────────────────┐
│   Interfaces: CLI · Web · MCP · API         │
├─────────────────────────────────────────────┤
│        File System (.cmt/)                  │
│        Source of truth: Markdown + YAML     │
├─────────────────────────────────────────────┤
│        Git Repository                       │
│        Event history & collaboration        │
├─────────────────────────────────────────────┤
│        SQLite Index (derived, gitignored)   │
│        Fast queries & search                │
└─────────────────────────────────────────────┘`}
        </pre>
      </div>
    </div>
  )
}

const COMMANDS = [
  { name: 'init', description: 'Initialize .cmt/ directory', flags: '--prefix, --global', example: 'cmt init --prefix ACME' },
  { name: 'add', description: 'Create a work item', flags: '-p, -t, --type, --assign', example: 'cmt add "Fix bug" -p high' },
  { name: 'list', description: 'List work items', flags: '-s, -p, --tag, --assignee', example: 'cmt list -s active -p high' },
  { name: 'show', description: 'Show item details', flags: '--raw', example: 'cmt show CMT-1' },
  { name: 'edit', description: 'Edit item fields', flags: '--set, --tag, --untag', example: 'cmt edit CMT-1 --set priority=high' },
  { name: 'status', description: 'Change item status', flags: '(positional: ID, STATUS)', example: 'cmt status CMT-1 active' },
  { name: 'done', description: 'Mark items complete', flags: '(positional: IDs)', example: 'cmt done CMT-1 CMT-2' },
  { name: 'search', description: 'Full-text search', flags: '-s, -p, --tag', example: 'cmt search "login"' },
  { name: 'archive', description: 'Archive completed items', flags: '--done, --cancelled', example: 'cmt archive --done' },
  { name: 'delete', description: 'Delete work items', flags: '-f, --force', example: 'cmt delete CMT-1 -f' },
  { name: 'log', description: 'Show item event history', flags: '-n, --actor', example: 'cmt log CMT-1' },
  { name: 'check', description: 'Validate project integrity', flags: '--fix', example: 'cmt check' },
  { name: 'doctor', description: 'Check system health', flags: '-v, --json', example: 'cmt doctor -v' },
  { name: 'reindex', description: 'Rebuild SQLite index', flags: '--force', example: 'cmt reindex --force' },
  { name: 'config', description: 'View/modify configuration', flags: 'show, get, set', example: 'cmt config set defaults.priority high' },
  { name: 'completions', description: 'Generate shell completions', flags: 'bash, zsh, fish', example: 'cmt completions bash' },
  { name: 'help-agent', description: 'Agent-optimized help (JSON)', flags: '--conventions, <cmd>', example: 'cmt help-agent add --json' },
  { name: 'setup', description: 'Configure agent integrations', flags: '--claude-code, --list, --all', example: 'cmt setup --claude-code' },
  { name: 'serve', description: 'Start the web UI server', flags: '--port, --host', example: 'cmt serve' },
  { name: 'projects', description: 'Manage project registry', flags: 'list, add, remove', example: 'cmt projects list' },
  { name: 'slugify', description: 'Rename item files to include title slugs', flags: '--dry-run', example: 'cmt slugify --dry-run' },
]

function Commands() {
  return (
    <div className="space-y-4">
      <SectionHeading id="commands">Commands</SectionHeading>
      <p className="text-sm text-text-secondary">
        All commands support <code className="text-accent-text">--json</code> for structured output
        and <code className="text-accent-text">--quiet</code> to suppress non-essential messages.
      </p>
      <div className="overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-left">
              <th className="px-3 py-2 font-semibold">Command</th>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 font-semibold hidden md:table-cell">Key Flags</th>
              <th className="px-3 py-2 font-semibold hidden lg:table-cell">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {COMMANDS.map((cmd) => (
              <tr key={cmd.name} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-mono text-accent-text">{cmd.name}</td>
                <td className="px-3 py-2 text-text-secondary">{cmd.description}</td>
                <td className="px-3 py-2 text-text-muted font-mono hidden md:table-cell">{cmd.flags}</td>
                <td className="px-3 py-2 text-code font-mono hidden lg:table-cell">{cmd.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StateMachine() {
  return (
    <div className="space-y-4">
      <SectionHeading id="state-machine">State Machine</SectionHeading>
      <p className="text-sm text-text-secondary">
        Items follow a configurable state machine. Transitions are validated at runtime.
        Custom machines can be defined per item type in <code className="text-accent-text">config.yml</code>.
      </p>
      <div className="bg-bg-secondary border border-border-default rounded-lg p-4">
        <pre className="text-xs text-text-secondary font-mono text-center leading-loose">
{`  inbox ──→ ready ──→ active ──→ done
                        │          ↑
                        ↓          │
                     blocked ──────┘
                        │
               (any) ──→ cancelled`}
        </pre>
      </div>
      <div className="overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-left">
              <th className="px-3 py-2 font-semibold">State</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Transitions To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {[
              ['inbox', 'initial', 'ready, cancelled'],
              ['ready', '', 'active, cancelled'],
              ['active', '', 'done, blocked, cancelled'],
              ['blocked', '', 'active, cancelled'],
              ['done', 'terminal', '—'],
              ['cancelled', 'terminal', '—'],
            ].map(([state, type_, transitions]) => (
              <tr key={state} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-mono text-accent-text">{state}</td>
                <td className="px-3 py-2 text-text-muted">{type_}</td>
                <td className="px-3 py-2 text-text-secondary">{transitions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FileFormat() {
  return (
    <div className="space-y-4">
      <SectionHeading id="file-format">File Format</SectionHeading>
      <p className="text-sm text-text-secondary">
        Work items are Markdown files with YAML frontmatter. Filenames include a title slug for
        readability (e.g., <code className="text-accent-text">CMT-42-fix-login-bug.md</code>).
        Everything is a file — read them, edit them, <code className="text-accent-text">grep</code> them, <code className="text-accent-text">git log</code> them.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-primary">Work Item Example</h3>
          <CodeBlock>
{`---
id: CMT-0042
title: Implement user authentication
type: task
status: active
priority: high
assignee: alice
created: 2026-02-15T10:30:00Z
tags: [security, backend]
depends_on: [CMT-0039]
parent: CMT-0010
---

## Description
Implement JWT-based authentication.

## Acceptance Criteria
- [ ] Users can log in
- [ ] Tokens expire after 24h`}
          </CodeBlock>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Required Fields</h3>
            <div className="bg-bg-secondary border border-border-default rounded-lg p-3 space-y-1 text-xs">
              {['id — PREFIX-N auto-assigned', 'title — item summary', 'type — task (default), bug, feature, etc.', 'status — from state machine', 'created — ISO 8601 timestamp'].map((f) => (
                <div key={f} className="text-text-secondary font-mono">{f}</div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Directory Structure</h3>
            <CodeBlock>
{`.cmt/
  config.yml        # Configuration
  config.local.yml  # Local overrides (gitignored)
  items/            # Active work items
  archive/          # Completed/cancelled
  templates/        # Item templates
  ABOUT.md          # Auto-generated summary
  CONVENTIONS.md    # Auto-generated conventions`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentQuickstart() {
  return (
    <div className="space-y-4">
      <SectionHeading id="agent-quickstart">Agent Quickstart</SectionHeading>
      <p className="text-sm text-text-secondary">
        See <a href="https://github.com/syncropic/catchmytask/blob/main/AGENT.md" className="text-accent-text hover:underline">AGENT.md</a> in
        the repo root for the complete agent entry point.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-primary">Environment Setup</h3>
          <CodeBlock>
{`# Identify yourself in event logs
export CMT_ACTOR=your-agent-name

# Always use --json for structured output
cmt help-agent --json
cmt list --json
cmt add "Fix the bug" -p high --json
cmt done CMT-1 --json`}
          </CodeBlock>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-text-primary">Discovery Tiers</h3>
          <div className="bg-bg-secondary border border-border-default rounded-lg divide-y divide-border-default text-xs">
            {[
              ['Tier 0', 'cmt help-agent --json', 'Capabilities overview'],
              ['Tier 1', 'cmt help-agent <cmd> --json', 'Per-command details'],
              ['Tier 2', 'cmt help-agent --conventions --json', 'Project conventions'],
              ['Tier 3', 'SKILL.md in repo root', 'Full reference'],
            ].map(([tier, cmd, desc]) => (
              <div key={tier} className="px-3 py-2 flex flex-col gap-0.5">
                <span className="text-text-primary font-semibold">{tier}</span>
                <span className="font-mono text-accent-text">{cmd}</span>
                <span className="text-text-muted">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Configuration() {
  return (
    <div className="space-y-4">
      <SectionHeading id="configuration">Configuration</SectionHeading>
      <p className="text-sm text-text-secondary">
        Configuration is layered from lowest to highest priority:
      </p>
      <div className="bg-bg-secondary border border-border-default rounded-lg divide-y divide-border-default text-xs">
        {[
          ['1. Built-in defaults', 'Sensible out of the box'],
          ['2. Global config', '~/.config/cmt/config.yml'],
          ['3. Project config', '.cmt/config.yml'],
          ['4. Local overrides', '.cmt/config.local.yml (gitignored)'],
          ['5. Environment vars', 'CMT_PREFIX, CMT_DEFAULT_PRIORITY, CMT_AUTO_COMMIT, etc.'],
        ].map(([layer, desc]) => (
          <div key={layer} className="px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-text-primary font-semibold min-w-[160px]">{layer}</span>
            <span className="text-text-muted font-mono">{desc}</span>
          </div>
        ))}
      </div>
      <CodeBlock>
{`# View all config
cmt config show

# Get a specific value
cmt config get project.prefix

# Set a value
cmt config set defaults.priority high`}
      </CodeBlock>
    </div>
  )
}

function WebUI() {
  return (
    <div className="space-y-4">
      <SectionHeading id="web-ui">Web UI</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        CatchMyTask includes a browser-based UI that works in two modes — <strong className="text-text-primary">local-first</strong> (no
        server needed, data in your browser) and <strong className="text-text-primary">remote</strong> (connected
        to <code className="text-accent-text">cmt serve</code>).
      </p>

      <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Quick Start (No Installation)</h3>
        <p className="text-sm text-text-secondary">
          Visit <a href="/app" className="text-accent-text hover:underline font-medium">catchmytask.com/app</a> to
          start immediately. Your data stays in your browser via IndexedDB — nothing is sent to any server.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {[
            ['1. Open /app', 'Set your project name and prefix in the onboarding flow'],
            ['2. Create items', 'Click + New or press Ctrl+K to open the command palette'],
            ['3. Manage work', 'Drag items on the board, filter from sidebar, click to edit'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-bg-primary border border-border-default rounded p-2 space-y-1">
              <div className="font-semibold text-accent-text">{title}</div>
              <div className="text-text-muted">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          ['Board View', 'Kanban board with drag-and-drop between status columns. Items auto-organize by state machine.'],
          ['List View', 'Table view with inline status dropdowns, priority badges, and sidebar filtering by status and tags.'],
          ['Dashboard', 'Summary stats, status/priority distribution, overdue items, recent activity at a glance.'],
          ['Activity Feed', 'Timeline of all events (created, started, completed, blocked) grouped by day.'],
          ['Detail Panel', 'Click any item to edit title, status, priority, type, assignee, due date, tags, and Markdown body.'],
          ['Search', 'Ctrl/Cmd+K opens a command palette with full-text search across all items.'],
          ['Dark/Light Mode', 'Toggle via the theme button in the header. Persists to localStorage.'],
          ['Export/Import', 'Export your data as a .cmt zip, import into another browser or restore from backup.'],
        ].map(([title, desc]) => (
          <div key={title} className="border border-border-default rounded-lg p-3 space-y-1">
            <h4 className="text-xs font-semibold text-text-primary">{title}</h4>
            <p className="text-xs text-text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Connected Mode</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        To connect the UI to your local <code className="text-accent-text">.cmt/</code> files, start the backend server:
      </p>
      <CodeBlock>
{`# Start the backend server (default port 3170)
cmt serve --open

# Or with a custom port
cmt serve --port 8080`}
      </CodeBlock>

      <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-semibold text-text-primary">Auto-Detection</h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          The web UI automatically detects a running <code className="text-accent-text">cmt serve</code> instance — no manual
          configuration needed. This works both when visiting <code className="text-accent-text">localhost:3170</code> directly
          and from <a href="/app" className="text-accent-text hover:underline">catchmytask.com/app</a>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            ['From localhost', 'The UI probes /api/health on the same origin. If cmt serve is running, it connects automatically.'],
            ['From catchmytask.com', 'The UI probes http://127.0.0.1:3170 as a fallback. If your local server responds, it connects to it.'],
          ].map(([title, desc]) => (
            <div key={title} className="bg-bg-primary border border-border-default rounded p-2 space-y-1">
              <div className="font-semibold text-accent-text">{title}</div>
              <div className="text-text-muted">{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          If no backend is detected, the UI falls back to local-only mode (IndexedDB).
          You can also manually set the connection in <strong className="text-text-secondary">Settings → Connection</strong>.
        </p>
      </div>

      <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-2">
        <h4 className="text-xs font-semibold text-text-primary">Privacy & Data Flow</h4>
        <div className="text-xs text-text-secondary leading-relaxed space-y-1">
          <p>
            <strong className="text-text-primary">Local-only mode:</strong> All data lives in your browser's IndexedDB.
            Nothing is sent to any server — not even catchmytask.com.
          </p>
          <p>
            <strong className="text-text-primary">Connected mode:</strong> The UI talks directly to <code className="text-accent-text">cmt serve</code> running
            on <em>your machine</em>. Data flows between your browser and localhost only.
            The catchmytask.com domain serves static HTML/JS/CSS — it never sees your work items.
          </p>
          <p>
            Your connection preference is saved in localStorage and persists across sessions.
          </p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Keyboard Shortcuts</h3>
      <div className="overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-left">
              <th className="px-3 py-2 font-semibold">Shortcut</th>
              <th className="px-3 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {[
              ['Ctrl/Cmd + K', 'Open command palette / search'],
              ['Ctrl/Cmd + B', 'Toggle sidebar'],
              ['Escape', 'Close panel / drawer / palette'],
            ].map(([key, action]) => (
              <tr key={key} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-mono text-accent-text">{key}</td>
                <td className="px-3 py-2 text-text-secondary">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Workflow() {
  return (
    <div className="space-y-4">
      <SectionHeading id="workflow">Multi-Context Workflow</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        CatchMyTask shines when you're juggling multiple roles — a day job, your own company,
        personal projects — switching contexts multiple times a day with agents running in parallel.
      </p>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Architecture: One Project Per Context</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        Each repo gets its own <code className="text-accent-text">.cmt/</code> directory. A global inbox at{' '}
        <code className="text-accent-text">~/.cmt</code> captures thoughts from anywhere.
      </p>
      <CodeBlock>
{`# Global inbox for quick captures
cd ~ && cmt init --prefix INBOX

# Per-project tracking
cd ~/projects/acme-workflows && cmt init --prefix ACME
cd ~/projects/my-saas-app && cmt init --prefix SAAS
cd ~/projects/personal-site && cmt init --prefix ME

# Register everything
cmt projects add ~/projects/acme-workflows
cmt projects add ~/projects/my-saas-app
cmt projects add ~`}
      </CodeBlock>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Daily Rhythm</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          ['Morning: Orient', 'cmt projects\ncmt list -s active', 'Scan what\'s hot across projects. Pick your focus.'],
          ['During: Capture', 'cmt add "idea" --dir ~/.cmt', 'Dump thoughts to inbox. Sort later. Never lose context.'],
          ['Evening: Sweep', 'cmt archive --done\ncmt list --dir ~/.cmt', 'Archive completed work. Sort inbox. Update blocked items.'],
        ].map(([title, code, desc]) => (
          <div key={title} className="bg-bg-secondary border border-border-default rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-accent-text">{title}</h4>
            <pre className="text-xs font-mono text-code leading-relaxed">{code}</pre>
            <p className="text-xs text-text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Context Switching</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        Before switching away, leave a breadcrumb. Before switching in, check what's active.
      </p>
      <CodeBlock>
{`# Leave a breadcrumb before switching
cmt edit ACME-12 --append "## Paused\\nStopped at: migration script. Next: test with staging."

# Switch context — orient immediately
cd ~/projects/my-saas-app
cmt list -s active          # What was I doing?
cmt list -s ready -p high   # What should I pick up?`}
      </CodeBlock>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Agent Delegation Patterns</h3>
      <div className="overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-left">
              <th className="px-3 py-2 font-semibold">Pattern</th>
              <th className="px-3 py-2 font-semibold">How</th>
              <th className="px-3 py-2 font-semibold hidden md:table-cell">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {[
              ['One agent per project', 'Each tab opens a different repo', 'Independent workstreams'],
              ['Multiple agents, same project', 'Assign items to agent-1, agent-2, etc.', 'Parallel tasks in one codebase'],
              ['Research + Execute', 'One agent researches (--complex), you review, another executes', 'Uncertain tasks needing exploration'],
            ].map(([pattern, how, when]) => (
              <tr key={pattern} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-medium text-text-primary">{pattern}</td>
                <td className="px-3 py-2 text-text-secondary">{how}</td>
                <td className="px-3 py-2 text-text-muted hidden md:table-cell">{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Tag Namespaces</h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        Tags let you slice across projects:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          ['scope:', 'frontend, backend, infra'],
          ['role:', 'dayjob, founder, personal'],
          ['energy:', 'deep, routine, quick'],
          ['waiting:', 'review, deploy, response'],
        ].map(([ns, examples]) => (
          <div key={ns} className="bg-bg-secondary border border-border-default rounded-lg p-2">
            <div className="text-xs font-mono text-accent-text">{ns}</div>
            <div className="text-xs text-text-muted">{examples}</div>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-text-primary pt-2">Shell Aliases</h3>
      <CodeBlock>
{`alias qi='cmt add --dir ~/.cmt'    # Quick inbox capture
alias wa='cmt list -s active'       # What's active
alias wr='cmt list -s ready'        # What's ready
alias morning='cmt projects'        # Morning dashboard`}
      </CodeBlock>

      <p className="text-sm text-text-secondary">
        Full guide:{' '}
        <a href="https://github.com/syncropic/catchmytask/blob/main/docs/guides/multi-context-workflow.md" className="text-accent-text hover:underline">
          docs/guides/multi-context-workflow.md
        </a>
      </p>
    </div>
  )
}

function Doctor() {
  return (
    <div className="space-y-4">
      <SectionHeading id="doctor">Doctor</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        The <code className="text-accent-text">cmt doctor</code> command validates your entire system setup —
        binary, global inbox, project registry, indexes, agent integrations, and shell aliases.
      </p>
      <CodeBlock>
{`$ cmt doctor
  [ok]  cmt binary: cmt 0.2.0 (in PATH)
  [ok]  global inbox: ~/.cmt with INBOX prefix
  [ok]  project registry: 6 projects registered, 6 ok, 0 stale
  [ok]  current project index: SQLite index valid, 12 item files
  [ok]  claude code skill: Installed and up to date
  [ok]  shell aliases: qi, wa, morning aliases configured

  All 6 checks passed`}
      </CodeBlock>
      <div className="overflow-x-auto border border-border-default rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bg-tertiary text-text-secondary text-left">
              <th className="px-3 py-2 font-semibold">Flag</th>
              <th className="px-3 py-2 font-semibold">Effect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {[
              ['-v, --verbose', 'Show per-project details'],
              ['--json', 'Structured output for agents'],
            ].map(([flag, effect]) => (
              <tr key={flag} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-mono text-accent-text">{flag}</td>
                <td className="px-3 py-2 text-text-secondary">{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 flex gap-8">
        {/* Sticky TOC sidebar — hidden on mobile */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-20 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3">
              On this page
            </h3>
            <TOC />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 max-w-4xl space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Documentation</h1>
            <p className="text-sm text-text-secondary">
              Comprehensive reference for CatchMyTask — the file-first work management CLI.
            </p>
          </div>
          {/* Mobile TOC — horizontal pills */}
          <nav className="flex flex-wrap gap-2 lg:hidden text-xs">
            {SECTIONS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 py-1.5 bg-bg-tertiary border border-border-default rounded hover:border-accent/50 hover:text-accent-text text-text-secondary transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <Overview />
          <Commands />
          <StateMachine />
          <FileFormat />
          <AgentQuickstart />
          <Configuration />
          <WebUI />
          <Workflow />
          <Doctor />
        </main>
      </div>
      <Footer />
    </div>
  )
}

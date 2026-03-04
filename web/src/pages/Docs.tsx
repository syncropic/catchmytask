import { Navigation } from '@/sections/Navigation'
import { Footer } from '@/sections/Footer'

function TOC() {
  const sections = [
    ['overview', 'Overview'],
    ['commands', 'Commands'],
    ['state-machine', 'State Machine'],
    ['file-format', 'File Format'],
    ['agent-quickstart', 'Agent Quickstart'],
    ['configuration', 'Configuration'],
  ]
  return (
    <nav className="flex flex-wrap gap-3 text-xs">
      {sections.map(([id, label]) => (
        <a
          key={id}
          href={`#${id}`}
          className="px-3 py-1.5 bg-bg-tertiary border border-border-default rounded hover:border-blue-500/50 hover:text-blue-400 text-text-secondary transition-colors"
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
    <pre className="text-xs font-mono text-green-400 bg-bg-primary border border-border-default rounded-lg p-4 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  )
}

function Overview() {
  return (
    <div className="space-y-4">
      <SectionHeading id="overview">Overview</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        CatchMyTask (<code className="text-blue-400">cmt</code>) is a file-first work management CLI built in Rust.
        Work items are Markdown files with YAML frontmatter stored in <code className="text-blue-400">.cmt/items/</code>.
        Git is the history layer. AI agents and humans are equal first-class actors.
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
  { name: 'reindex', description: 'Rebuild SQLite index', flags: '--force', example: 'cmt reindex --force' },
  { name: 'config', description: 'View/modify configuration', flags: 'show, get, set', example: 'cmt config set defaults.priority high' },
  { name: 'completions', description: 'Generate shell completions', flags: 'bash, zsh, fish', example: 'cmt completions bash' },
  { name: 'help-agent', description: 'Agent-optimized help (JSON)', flags: '--conventions, <cmd>', example: 'cmt help-agent add --json' },
  { name: 'setup', description: 'Configure agent integrations', flags: '--claude-code, --list, --all', example: 'cmt setup --claude-code' },
  { name: 'serve', description: 'Start the web UI server', flags: '--port, --host', example: 'cmt serve' },
  { name: 'projects', description: 'Manage project registry', flags: 'list, add, remove', example: 'cmt projects list' },
]

function Commands() {
  return (
    <div className="space-y-4">
      <SectionHeading id="commands">Commands</SectionHeading>
      <p className="text-sm text-text-secondary">
        All commands support <code className="text-blue-400">--json</code> for structured output
        and <code className="text-blue-400">--quiet</code> to suppress non-essential messages.
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
                <td className="px-3 py-2 font-mono text-blue-400">{cmd.name}</td>
                <td className="px-3 py-2 text-text-secondary">{cmd.description}</td>
                <td className="px-3 py-2 text-text-muted font-mono hidden md:table-cell">{cmd.flags}</td>
                <td className="px-3 py-2 text-green-400 font-mono hidden lg:table-cell">{cmd.example}</td>
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
        Custom machines can be defined per item type in <code className="text-blue-400">config.yml</code>.
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
            ].map(([state, type, transitions]) => (
              <tr key={state} className="hover:bg-bg-hover transition-colors">
                <td className="px-3 py-2 font-mono text-blue-400">{state}</td>
                <td className="px-3 py-2 text-text-muted">{type}</td>
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
        Work items are Markdown files with YAML frontmatter. Everything is a file — read them,
        edit them, <code className="text-blue-400">grep</code> them, <code className="text-blue-400">git log</code> them.
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
        See <a href="https://github.com/syncropic/catchmytask/blob/main/AGENT.md" className="text-blue-400 hover:underline">AGENT.md</a> in
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
                <span className="font-mono text-blue-400">{cmd}</span>
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

export function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-16 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Documentation</h1>
          <p className="text-sm text-text-secondary">
            Comprehensive reference for CatchMyTask — the file-first work management CLI.
          </p>
        </div>
        <TOC />
        <Overview />
        <Commands />
        <StateMachine />
        <FileFormat />
        <AgentQuickstart />
        <Configuration />
      </main>
      <Footer />
    </div>
  )
}

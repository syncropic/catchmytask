# CatchMyTask

A work management system for humans and AI agents.

- **Plain text files**: Work items are Markdown + YAML frontmatter in `.cmt/items/`
- **Git-native**: Every change is trackable. No database server required
- **Agent-first**: AI agents and humans are equal first-class actors
- **Self-contained**: Single binary CLI. No runtime dependencies, no accounts, no SaaS

## Documentation

- [AGENT.md](AGENT.md) — universal agent entry point (start here if you're an AI agent)
- [Online Docs](https://catchmytask.com/docs) — comprehensive reference with commands, state machine, file format, and configuration

## Install

```bash
# Quick install (Linux/macOS)
curl -fsSL https://get.syncropic.com/cmt | sh

# Install a specific version
curl -fsSL https://get.syncropic.com/cmt | VERSION=v0.1.0 sh

# Install to /usr/local/bin instead of ~/.local/bin
curl -fsSL https://get.syncropic.com/cmt | sh -s -- --global

# From source (requires Rust toolchain)
cargo install --git https://github.com/syncropic/catchmytask.git
```

Pre-built binaries are available for Linux (x86_64, aarch64), macOS (x86_64, aarch64), and Windows (x86_64) on the [Releases](https://github.com/syncropic/catchmytask/releases) page.

## Quick Start

```bash
# Initialize a project
cmt init --prefix PROJ

# Create work items
cmt add "Fix the login bug" -p high
cmt add "Update documentation" --tag team:docs

# View and manage
cmt list
cmt show PROJ-0001
cmt status PROJ-0001 active
cmt done PROJ-0001

# Search
cmt search "login"
```

## How It Works

Work items are Markdown files with YAML frontmatter stored in `.cmt/items/`:

```markdown
---
id: PROJ-0001
title: Fix the login bug
type: task
status: active
priority: high
assignee: alice
created: 2026-02-23T10:30:00Z
tags:
- team:backend
---

## Description
Users are getting timeout errors on the login page.
```

Everything is a file. Read them, edit them, `grep` them, `git log` them.

Items can be **simple** (a single `.md` file) or **complex** (a folder with `item.md` + artifacts):

```
.cmt/items/
  CMT-1-fix-login-bug.md              # simple item
  CMT-2-security-audit/               # complex item (folder)
    item.md                            # the work item
    evidence/screenshot.png            # contained artifacts
    queries/audit.sql
    handover/AI-HANDOVER.md
```

Artifacts are any supporting files — evidence, queries, logs, screenshots — browsable via the web UI's Artifact Browser or the CLI.

## Web UI

CatchMyTask includes a browser-based UI at [catchmytask.com/app](https://catchmytask.com/app):

- **Board View** — Kanban with drag-and-drop between status columns
- **List View** — Sortable table with inline status, priority, and artifact indicators
- **Dashboard** — Summary stats, distributions, overdue items, recent activity
- **Activity Feed** — Timeline of all events grouped by day
- **Artifact Browser** — Project-wide file browser with search, filtering by item/type/source, list/grid views, and inline preview for images, text, and PDF
- **Detail Panel** — Click any item to edit fields, view/browse artifacts, and edit Markdown body
- **Dark/Light Mode** — Toggle via header, persists to localStorage

Works in two modes: **local-only** (IndexedDB, no server) or **connected** to `cmt serve` (auto-detected on port 3170).

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize `.cmt/` directory | `cmt init --prefix ACME` |
| `add` | Create a work item | `cmt add "Fix bug" -p high` |
| `list` | List work items | `cmt list -s active` |
| `show` | Show item details | `cmt show CMT-0001` |
| `edit` | Edit item fields | `cmt edit CMT-0001 --set priority=high` |
| `status` | Change item status | `cmt status CMT-0001 active` |
| `done` | Mark items complete | `cmt done CMT-0001` |
| `search` | Full-text search | `cmt search "authentication"` |
| `archive` | Archive completed items | `cmt archive --done` |
| `delete` | Delete work items | `cmt delete CMT-0001 -f` |
| `log` | Show item event history | `cmt log CMT-0001` |
| `check` | Validate project integrity | `cmt check` |
| `reindex` | Rebuild SQLite index | `cmt reindex --force` |
| `config` | View/modify configuration | `cmt config set defaults.priority high` |
| `completions` | Generate shell completions | `cmt completions bash` |
| `setup` | Configure agent integrations | `cmt setup --claude-code` |
| `serve` | Start the web UI server | `cmt serve --open` |
| `help-agent` | Agent-optimized help (JSON) | `cmt help-agent --json` |

All commands support `--json` for machine-readable output and `--quiet` to suppress non-essential messages.

## Agent Integrations

Register `cmt` with your agent platform:

```bash
# See available integrations
cmt setup --list

# Install Claude Code skill
cmt setup --claude-code

# Install all detected integrations
cmt setup --all

# Remove an integration
cmt setup --remove claude-code
```

## For AI Agents

> **Agents**: See [AGENT.md](AGENT.md) for a concise, structured entry point with everything you need to get started.

Set `CMT_ACTOR` to identify yourself in event logs:

```bash
export CMT_ACTOR=claude-agent
```

Use `--json` on every command for structured output:

```bash
cmt list --json
cmt add "Task from agent" -p medium --json
cmt show PROJ-0001 --json
```

Discover capabilities progressively:

```bash
# Tier 0: What is this tool?
cmt help-agent --json

# Tier 1: How do I use a specific command?
cmt help-agent add --json

# Tier 2: What are the project conventions?
cmt help-agent --conventions --json

# Tier 3: Full reference
# See SKILL.md in the repo root
```

Discovery files are auto-generated in `.cmt/`:
- `.cmt/ABOUT.md` — one-line project summary for agents scanning repos
- `.cmt/CONVENTIONS.md` — state machine, defaults, tag namespaces

## Configuration

Configuration is layered (lowest to highest priority):

1. **Built-in defaults** — sensible out of the box
2. **Global config** — `~/.config/cmt/config.yml` (create with `cmt init --global`)
3. **Project config** — `.cmt/config.yml`
4. **Local overrides** — `.cmt/config.local.yml` (gitignored)
5. **Environment variables** — `CMT_PREFIX`, `CMT_DEFAULT_PRIORITY`, `CMT_AUTO_COMMIT`, etc.

View and modify configuration:

```bash
cmt config show
cmt config get project.prefix
cmt config set defaults.priority high
```

## State Machine

Items follow a configurable state machine. The default:

```
inbox -> ready -> active -> done
                    |         ^
                    v         |
                  blocked ----+
                    |
           (any) -> cancelled
```

States: `inbox` (initial) | `ready` | `active` | `blocked` | `done` (terminal) | `cancelled` (terminal)

Custom state machines can be defined per item type in `config.yml`.

## Architecture

```
.cmt/
  config.yml          # Project configuration
  config.local.yml    # Local overrides (gitignored)
  items/              # Active work items (simple .md or complex folders)
  archive/            # Completed/cancelled items
  templates/          # Work item templates
  ABOUT.md            # Auto-generated project summary
  CONVENTIONS.md      # Auto-generated conventions
  .index.db           # SQLite index (gitignored)
```

The CLI uses a SQLite index (`.cmt/.index.db`, gitignored) for fast search and queries. The Markdown files are always the source of truth — run `cmt reindex` to rebuild if needed.

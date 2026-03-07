# CatchMyTask - Claude Code Project Context

## What This Is

CatchMyTask (`cmt`) is a next-generation work management system designed from first principles
for the agentic AI era. It treats AI agents and humans as equal first-class actors, uses plain
text files as the universal interface, and git as the history layer.

This is **not** another Jira/Linear clone with AI bolted on. It is a ground-up rethinking of
how work is captured, organized, delegated, executed, monitored, and reviewed when actors
include autonomous AI agents that work for hours/days alongside humans.

## Project Status

**Phase: Implemented & Production-Hardened**

The CLI is fully implemented in Rust with 21 commands, configurable state machines, SQLite
indexing, layered configuration, a progressive agent discoverability system, and a `cmt setup`
command for installing agent platform integrations (Claude Code skills, etc.). The codebase
has 70 unit tests and 92 integration tests (162 total). Research documents live in `docs/research/`,
formal specifications in `docs/specs/`, and architecture decisions in `docs/design/`.

## Vision

A work management system that is:
- **Timeless**: Built on foundations that don't change (files, text, state machines, git)
- **Actor-agnostic**: Humans, AI agents, scripts, CI systems are all first-class actors
- **Progressive**: Useful with zero config (`cmt add "Fix the bug"`), powerful at scale
- **Portable**: No vendor lock-in. Plain text files you own forever
- **Observable**: Every action traced and auditable, especially agent work
- **Federated**: Works standalone, composes into larger systems, supports cross-org collaboration

## Core Design Principles

These are the 10 design principles distilled from first-principles research (see `docs/research/02-first-principles.md`):

1. **Atoms and Composition** - Work items are the fundamental unit. Everything composes from them.
2. **Actor Agnosticism** - No assumption about what kind of entity does the work.
3. **Events Over State** - State derived from events. Event log is source of truth.
4. **Context is King** - Work without context is work done wrong. Link everything.
5. **Async by Default** - Synchronous is the exception. Self-describing state.
6. **Pull Over Push** - Actors pull work by capability/capacity. WIP limits prevent overload.
7. **Progressive Capability** - Zero friction to start. Power features are opt-in.
8. **Files as Foundation** - Plain text Markdown+YAML files. Git is history. Everything else is a view.
9. **Convention Over Configuration** - Sensible defaults. Override when needed.
10. **Timelessness Over Trendiness** - Will this still make sense in 20 years?

## Architecture Overview

```
Interfaces (CLI, TUI, Web, MCP, API)
         |
         v
   File System (.cmt/)        <-- Source of truth
         |
         v
   Git Repository              <-- Event history
         |
         v
   Optional: Sync/Index layer  <-- For team features, dashboards, search at scale
```

### Work Item Format

Work items are Markdown files with YAML frontmatter:

```markdown
---
id: CMT-0042
title: Implement user authentication
type: task
status: active
priority: high
assignee: alice
created: 2026-02-15T10:30:00Z
parent: CMT-0010
depends_on: [CMT-0039, CMT-0040]
tags: [security, backend]
---

## Description
Implement JWT-based authentication for the API.

## Acceptance Criteria
- [ ] Users can log in with email and password
- [ ] Tokens expire after 24 hours

## Log
- 2026-02-15: Created by @alice during sprint planning
```

### Directory Structure

```
.cmt/
  config.yml          # Project configuration, state machine definitions
  templates/          # Work item templates
  items/              # Active work items (CMT-NNNN.md)
  archive/            # Completed/cancelled items
  views/              # Saved queries and views
  agents/             # Agent configurations and policies
  workflows/          # Automation and workflow definitions
```

## Key Research Documents

| Document | Contents |
|---|---|
| `docs/research/01-industry-landscape.md` | Comprehensive industry survey (80+ sources) |
| `docs/research/02-first-principles.md` | Philosophical/architectural foundations |
| `docs/design/artifacts.md` | Artifact system design (discovery, API, CLI, web UI) |

## Technology Decisions (Resolved)

- **Implementation language**: Rust — single binary, cold start <10ms, cross-platform
- **Storage format**: Markdown + YAML frontmatter. Schema in `docs/specs/01-work-item-schema.md`
- **ID format**: PREFIX-NNN with auto-increment via file scan. Accepts both `CMT-1` and `CMT-0001`
- **Index/query layer**: SQLite (`.cmt/.index.db`, gitignored). `cmt reindex --force` to rebuild
- **Agent integration**: CLI + `--json` with progressive discovery (not MCP). `cmt setup` installs platform-specific integrations (Claude Code skill, etc.). See `docs/design/agent-discoverability.md`
- **State machine**: YAML-defined in `config.yml`, validated at runtime. See `docs/specs/02-state-machine.md`
- **Artifacts**: Filesystem-based discovery. Complex items = folders with `item.md` + artifacts. Simple items reference via `refs` frontmatter. See `docs/design/artifacts.md`
- **Web UI**: React + Vite, embedded in release binary. Dual-mode: local-only (IndexedDB) or connected (`cmt serve`). Includes board, list, dashboard, activity, and artifact browser views

## Technology Decisions (Pending)

- **Sync mechanism**: Git-native for basic use. Optional coordination layer for teams TBD
- **MCP server**: Deferred until a web UI or remote agent platform needs network-accessible tools
- **Plugin/extension system**: Hook scripts, compiled plugins, or WASM — TBD

## Working Conventions

### For Claude Code Sessions

- **Read research first**: Before proposing designs, read the relevant research docs
- **Write to docs/**: New research, decisions, and designs go in `docs/`
- **Prefer editing over creating**: Build on existing docs rather than creating new ones
- **Show your reasoning**: Design decisions should reference principles and research
- **Think in files**: The file system is the API. Think about how an agent would interact with `.cmt/` files
- **Test with scenarios**: Consider how the system handles: a solo developer, a 10-person team, a team with 5 agents, an agent working overnight

### Git Conventions

- Commit messages: `<type>: <description>` (e.g., `docs: add industry landscape research`)
- Types: `docs`, `design`, `feat`, `fix`, `refactor`, `test`, `chore`
- Branch naming: `<type>/<short-description>` (e.g., `design/work-item-format`)

### Documentation Structure

```
docs/
  research/           # Background research and analysis
  design/             # Architecture and design decisions
  specs/              # Formal specifications
  guides/             # User and developer guides
```

## What NOT to Do

- Do not build a SaaS platform. This is a local-first, file-first tool.
- Do not require a database server. SQLite for indexing is fine; PostgreSQL is not.
- Do not assume GUI-only interaction. CLI is the primary interface.
- Do not hardcode workflows. State machines should be configurable.
- Do not ignore the agent use case. Every feature should work for both humans and agents.
- Do not over-engineer. Start simple, add complexity only when needed.
- Do not break the plain-text guarantee. A user should always be able to read/edit work items in any text editor.

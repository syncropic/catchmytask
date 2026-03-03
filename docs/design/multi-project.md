# Multi-Project Architecture

## The Problem

Work doesn't live in one place. A developer has:

```
~/repos/app-a/.cmt/          # API service
~/repos/app-b/.cmt/          # Frontend
~/repos/infra/.cmt/          # Infrastructure
~/repos/monorepo/.cmt/       # Large monorepo
~/.cmt/                      # Personal: career goals, reading list, life admin
```

Today each `.cmt/` is an island. Every command operates on exactly one directory
found by walking up from CWD. There's no way to ask "what am I working on across
everything?" or "what's blocked anywhere?"

### Scenarios That Must Work

1. **Single project** — `cd ~/repos/app-a && work list` — works today, must not regress
2. **Personal work** — `cmt add "Read DDIA chapter 5"` from `~` — needs `~/.cmt/`
3. **Cross-project overview** — "show all my active items everywhere"
4. **Monorepo** — one `.cmt/` at root covers all packages (no nesting)
5. **Web UI** — dashboard across multiple projects
6. **Agent working across repos** — agent assigned work in app-a and infra simultaneously

### Scenarios We Explicitly Don't Support

- **Nested `.cmt/` directories** — a `.cmt/` inside a directory that already has a
  parent `.cmt/`. This creates ambiguity. One repo = one `.cmt/`. Monorepos use one
  `.cmt/` at root with tags like `package:auth` for scoping.
- **Cross-project dependencies** — CMT-0045 in app-a depends on INFRA-0012 in infra.
  This is a future problem. For now, use a text reference in the description.
- **Shared state machines across projects** — each project owns its own. Global config
  provides defaults that new projects inherit, but they diverge freely.

---

## The Design

### Principle: Registry, Not Hierarchy

We don't create a "workspace" that contains projects. We create a **registry** —
a simple list of known `.cmt/` locations. Each project remains independent and
self-contained. The registry is a lightweight index for cross-project queries.

This follows our principles:
- **Files as Foundation** — the registry is a plain YAML file
- **Progressive Capability** — zero config for single project, opt-in for multi
- **Convention Over Configuration** — auto-registration, sensible defaults
- **Timelessness** — a list of paths in a file. Will work in 20 years.

### The Registry File

Location: `~/.config/cmt/projects.yml`

```yaml
# Auto-maintained by `cmt init` and `cmt register`.
# You can also edit this file directly.

projects:
  - path: /home/alice/repos/app-a/.work
    name: app-a
    prefix: API

  - path: /home/alice/repos/app-b/.work
    name: app-b
    prefix: WEB

  - path: /home/alice/repos/infra/.work
    name: infra
    prefix: INFRA

  - path: /home/alice/.work
    name: personal
    prefix: ME
```

That's it. A list of paths. Each entry caches `name` and `prefix` from the
project's `config.yml` for display without loading every project.

### Personal Work: `~/.cmt/`

`~/.cmt/` is just another `.cmt/` directory — in your home directory. No special
treatment. `cmt init` from `~` creates it. The upward directory search already
finds it (since `~` is the HOME boundary). It appears in the registry like any
other project.

```bash
cd ~
work init --prefix ME
work add "Read DDIA chapter 5" --tag reading
work add "Update resume" --tag career -p high
```

---

## How It Works

### Auto-Registration

`cmt init` automatically registers the new project:

```bash
cd ~/repos/new-service
work init --prefix SVC
# Creates .cmt/ in current directory
# Appends to ~/.config/cmt/projects.yml automatically
```

No extra step. The registry builds itself as you use the tool.

For existing projects discovered via `cd` + `cmt list`, the CLI can
auto-register on first use (with a one-line notice: "Registered new-service
in project registry").

### Cross-Project Queries: `cmt list --all`

New flag: `--all` (or `-a`). Queries every project in the registry.

```bash
$ work list --all -s active
PROJECT    ID         TITLE                    STATUS  PRI  ASSIGNEE
app-a      API-0012   Fix auth middleware      active  ●H   alice
app-b      WEB-0045   Update dashboard         active  ●M   alice
infra      INFRA-003  Rotate certificates      active  ●H   🤖agent
personal   ME-0007    Read DDIA chapter 5      active  ●L   —

$ work list --all -s blocked --json
[
  {"project": "app-a", "id": "API-0015", "title": "...", ...},
  {"project": "infra", "id": "INFRA-007", "title": "...", ...}
]
```

The output adds a `PROJECT` column (or `project` field in JSON) to distinguish
items across projects. IDs are already unique per project via their prefix.

### Project Switching

The `--dir` flag and `CMT_DIR` env already handle explicit project targeting:

```bash
# From anywhere, operate on a specific project
work list --dir ~/repos/infra/.work -s blocked

# Or set for a session
export CMT_DIR=~/repos/infra/.work
work list -s blocked
```

No new mechanism needed. The existing `--dir` flag is the escape hatch.

### Project Management Commands

```bash
# List registered projects
work projects
  app-a       API    ~/repos/app-a/.work        (24 items, 8 active)
  app-b       WEB    ~/repos/app-b/.work        (12 items, 3 active)
  infra       INFRA  ~/repos/infra/.work        (9 items, 2 active)
  personal    ME     ~/.work                    (15 items, 5 active)

# Register an existing project (if auto-registration missed it)
work projects add ~/repos/legacy-app/.work

# Remove a project from registry (does NOT delete .cmt/)
work projects remove legacy-app

# Show current project
work projects current
  app-a (API) — ~/repos/app-a/.work
```

### Monorepo Strategy

One `.cmt/` at the repo root. Use **tags** for package scoping:

```bash
cd ~/repos/monorepo
work init --prefix MONO

# Scope with tags
work add "Fix auth bug" --tag package:auth
work add "Update dashboard" --tag package:web
work add "Shared types" --tag package:core

# Filter by package
work list --tag package:auth
work list --tag package:web
```

The tag namespace `package:` is conventional, not enforced. The web UI sidebar
would show tag namespaces as collapsible groups, so `package:` naturally creates
a per-package view.

No nested `.cmt/` inside `packages/auth/`. One project, one `.cmt/`, tags for
internal scoping. This avoids all the ambiguity of nested discovery.

---

## Web UI Integration

### Single-Project Mode (Default)

`cmt serve` scopes to the `.cmt/` in the current directory, exactly as today.
No changes needed. The web UI shows one project.

### Multi-Project Dashboard

`cmt serve --all` reads the registry and serves a unified view.

```
┌─ ACTIVITY RAIL ──┐┌─ HEADER ──────────────────────────────────────────────────┐
│                  ││  ☰  CatchMyTask  ▸ All Projects     🔍 ⌘K      [+ New] │
│  ▦  Board        ││──────────────────────────────────────────────────────────── │
│  ≡  List         │├─ SIDEBAR ────────┬─ MAIN ────────────────────────────────── │
│  ▣  Dashboard    ││                  │                                         │
│  ↕  Activity     ││ ▾ Projects       │  ┌─ ALL PROJECTS LIST ───────────────┐ │
│                  ││   ● All (60)     │  │ PROJECT  ID         TITLE    STAT │ │
│                  ││   ○ app-a (24)   │  │ app-a    API-0012   Fix auth active│ │
│                  ││   ○ app-b (12)   │  │ app-b    WEB-0045   Update.. active│ │
│                  ││   ○ infra (9)    │  │ infra    INFRA-003  Rotate.. active│ │
│                  ││   ○ personal(15) │  │ personal ME-0007    Read..   active│ │
│                  ││                  │  │ ...                                │ │
│                  ││ ▾ Status         │  └─────────────────────────────────────┘ │
│                  ││   ☑ active (18)  │                                         │
│                  ││   ☑ blocked (5)  │                                         │
│                  ││   ...            │                                         │
└──────────────────┘└──────────────────┴─────────────────────────────────────────┘
```

The sidebar adds a **Projects** section. Click a project name to scope the view
to that project. Click "All" to see everything. The project column appears in
list view. Board view shows columns per status (across all projects) or can be
scoped to one project.

The Dashboard view in `--all` mode shows per-project breakdowns:

```
┌─ PROJECTS OVERVIEW ──────────────────────────────────────────────┐
│                                                                  │
│  app-a (API)          app-b (WEB)         infra (INFRA)         │
│  Active: 8            Active: 3           Active: 2              │
│  Blocked: 2           Blocked: 0          Blocked: 3             │
│  ▓▓▓▓▓▓▓▓░░ 67%      ▓▓▓▓▓▓▓░░░ 58%     ▓▓▓▓░░░░░░ 33%       │
│                                                                  │
│  personal (ME)                                                   │
│  Active: 5            [Open ▸]                                   │
│  Blocked: 0                                                      │
│  ▓▓▓▓▓░░░░░ 45%                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Architecture: Multi-Project Serve

```
                    ┌──────────────────────┐
                    │   work serve --all   │
                    │   (single process)   │
                    └───────┬──────────────┘
                            │ reads
               ┌────────────┼────────────────┐
               │            │                │
               ▼            ▼                ▼
        ~/repos/app-a  ~/repos/app-b    ~/.cmt/
        /.cmt/        /.cmt/          (personal)

Each .cmt/ has its own SQLite index.
Cross-project queries = parallel reads from each index.
File watcher monitors all registered .cmt/ directories.
```

`cmt serve --all` opens file watchers on all registered project directories.
Queries fan out to each project's SQLite index in parallel and merge results.
Each project remains fully independent — no shared database.

---

## Implementation Plan

### Phase 1: Registry (CLI only, no web changes)

1. **Registry file** at `~/.config/cmt/projects.yml`
2. **Auto-registration** on `cmt init` — append to registry
3. **`cmt projects`** command — list, add, remove, current
4. **`cmt list --all`** — cross-project query with `project` column
5. **Auto-register on first use** — when `discover_work_dir()` finds a `.cmt/`
   not in the registry, register it silently

### Phase 2: Web UI Integration

6. **`cmt serve --all`** — multi-project mode
7. **Project switcher** in sidebar
8. **Cross-project dashboard** with per-project breakdowns
9. **Project column** in list view
10. **Board scoping** — "All" or per-project

### Phase 3: Future (Not Now)

- Cross-project item references (click `INFRA-003` in app-a's description
  and navigate to infra's item)
- Shared saved views across projects
- Project groups / workspaces for large organizations
- Cross-project dependency tracking

---

## What This Means for the Files

```
~/.config/cmt/
  config.yml              # Global defaults (already exists)
  projects.yml            # NEW: project registry

~/repos/app-a/.cmt/      # Unchanged — independent project
  config.yml
  items/
  ...

~/repos/app-b/.cmt/      # Unchanged — independent project
  config.yml
  items/
  ...

~/.cmt/                  # Personal work (just another project)
  config.yml
  items/
  ...
```

No symlinks. No shared databases. No monolithic workspace file.
Just a list of paths and independent projects that can be queried together.

---

## FAQ

**Q: What if I move a project directory?**
A: The registry path becomes stale. `cmt projects` detects this and shows
"(not found)". Fix with `cmt projects remove old-name && work projects add /new/path`.
Auto-cleanup: `cmt projects --prune` removes stale entries.

**Q: What about teams? Does the registry sync via git?**
A: No. The registry is personal (`~/.config/cmt/`). Each team member has their
own registry pointing to their local checkouts of the same repos. The `.cmt/`
directories sync via git; the registry does not.

**Q: Can two projects have the same prefix?**
A: Yes, but `cmt list --all` will show both. Prefixes are per-project and
don't need to be globally unique. The `project` column disambiguates.

**Q: What about `cmt serve` without `--all`?**
A: Unchanged. Scoped to the single `.cmt/` in the current directory.
The web UI shows no project switcher, no project column. Simple.

**Q: How does the command palette work in multi-project mode?**
A: Fuzzy search matches across all projects. Results show `project: item`
format: "app-a: API-0012 Fix auth middleware". Selecting an item navigates
to it within its project context.

**Q: Performance with 10 projects and 1000+ items each?**
A: Each project has its own SQLite index. `cmt list --all` queries each
in parallel. SQLite queries are <10ms each. 10 parallel queries = <15ms
total (limited by slowest). Virtual scrolling handles the display.

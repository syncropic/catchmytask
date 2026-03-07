---
design: "03"
title: Command Bar — Embedded CLI for the Web UI
status: draft
version: 0.1.0
created: 2026-03-06
references:
  - docs/specs/03-cli-interface.md
  - docs/design/agent-discoverability.md
---

# Design 03: Command Bar — Embedded CLI for the Web UI

## 1. Problem Statement

The CatchMyTask web UI provides excellent visual workflows (board, list, detail panel) but
lacks the power-user and agentic capabilities of the CLI:

- **Bulk operations**: No way to `done CMT-3 CMT-4 CMT-5` in one action
- **Precise queries**: GUI filters are limited; CLI supports arbitrary combinations
- **Speed**: Power users reach for keyboards, not mice
- **Composability**: No way to chain actions or script workflows
- **Agent workflows**: No agentic interface for AI to execute multi-step plans

The Command Bar bridges this gap: a CLI-native input embedded in the web UI that produces
rich, interactive, GUI-native output.

## 2. Critical Analysis of Initial Design

### Strengths

- **Copy-paste parity** (`cmt` prefix optional) eliminates context-switching friction
- **Context awareness** (inheriting selected item/filters) reduces typing
- **Rich output** (clickable items, rendered cards) leverages the GUI medium
- **Bidirectional sync** keeps GUI and Command Bar in lockstep
- **Phased approach** delivers value incrementally

### Weaknesses

1. **Scope creep risk**: "Agent Mode" (Phase 3) is ambitious and could delay core utility.
   The Command Bar must be independently valuable without any AI features.

2. **Parsing complexity**: Re-implementing CLI argument parsing in JavaScript is error-prone.
   `cmt add "Fix the \"auth\" bug" --tag=p0 --assignee="alice bob"` has shell quoting rules
   that are hard to replicate faithfully.

3. **API coverage gaps**: The REST API doesn't expose `log`, `archive`, `check`, `reindex`,
   or `config` commands. Option B (frontend-only mapping) is limited by this.

4. **State divergence**: If the Command Bar calls APIs directly, it must manually trigger
   React Query cache invalidation for every mutation. Easy to miss, causing stale views.

5. **Mobile/responsive**: A fixed bottom bar consumes vertical space. On small screens
   this significantly reduces the usable area.

6. **Discoverability**: Users won't know the Command Bar exists unless it's surfaced well.
   Most web users don't expect CLI-like interfaces.

### Gaps

- **No undo**: CLI operations are fire-and-forget. The web should offer undo for
  status changes and edits, at minimum via event log replay.
- **No output persistence**: Closing the Command Bar loses history. Should history
  persist across sessions (localStorage)?
- **No piping/chaining**: `list --status=active | done` would be powerful but adds
  significant complexity. Defer or design a simpler alternative.
- **Error UX**: CLI errors are text strings. Web errors should be contextual — e.g.,
  "CMT-99 not found" should suggest nearby IDs.

## 3. Improved Design

### 3.1 Architecture Decision: Thin Parser + REST API

Instead of reimplementing clap argument parsing in JS, use a **thin command parser** that:
1. Strips optional `cmt ` prefix
2. Identifies the command verb (first word)
3. Extracts positional args and `--flag=value` / `--flag value` pairs
4. Maps to the appropriate REST API call

This avoids shell quoting complexity (no subshells, no pipes, no redirects) while
covering 95% of real usage. The parser handles:

```
add "Fix bug" --priority=high --tag=auth     → POST /api/items
list --status=active --assignee=alice         → GET /api/items?status=active&assignee=alice
done CMT-3 CMT-4                             → POST /api/items/CMT-3/status + CMT-4/status
status CMT-3 blocked --reason="waiting"      → POST /api/items/CMT-3/status
edit CMT-3 --priority=high --tag=+urgent     → PATCH /api/items/CMT-3
search "auth token"                          → GET /api/search?q=auth+token
show CMT-3                                   → navigate to item + open detail
open CMT-3                                   → same as show
log CMT-3                                    → GET /api/items/CMT-3/log (new endpoint)
help                                         → show command reference
help add                                     → show add command help
```

### 3.2 Command Mapping

| Command | REST API | New Backend? | Notes |
|---------|----------|-------------|-------|
| `add <title> [flags]` | `POST /api/items` | No | Returns created item card |
| `list [flags]` | `GET /api/items` | No | Clickable table rows |
| `show <id>` | Navigate | No | Opens detail panel, scrolls to item |
| `open <id>` | Navigate | No | Alias for show |
| `done <id...>` | `POST /api/items/{id}/status` | No | Bulk: loop over IDs |
| `status <id> <status>` | `POST /api/items/{id}/status` | No | With optional --reason |
| `edit <id> [flags]` | `PATCH /api/items/{id}` | No | Field updates |
| `delete <id...>` | `DELETE /api/items/{id}` | No | With confirmation prompt |
| `search <query>` | `GET /api/search` | No | Highlighted results |
| `log <id>` | `GET /api/items/{id}/log` | **Yes** | Event history |
| `archive [flags]` | `POST /api/archive` | **Yes** | Move done items |
| `check` | `GET /api/check` | **Yes** | Integrity validation |
| `config` | `GET /api/config` | No | Show current config |
| `help [cmd]` | Client-side | No | Built-in reference |
| `clear` | Client-side | No | Clear output history |

### 3.3 UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Navbar                                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Main content area (board/list/dashboard/etc)                   │
│   Height: calc(100vh - navbar - commandbar)                      │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│ ❯ _                                                ⌘J  ▴  clear │
└──────────────────────────────────────────────────────────────────┘
```

**Collapsed** (default): Single-line input bar at bottom. 32px tall. Always visible.
Shows placeholder "Type a command... (⌘J to expand)".

**Expanded** (⌘J or after first command): Grows upward to show output.
Max height: 50% of viewport. Resizable via drag handle.

**Maximized** (double-click bar or ⌘J⌘J): Full-height overlay, GUI underneath is dimmed.
For reviewing long output or extended command sessions.

**Hidden** (⌘J when collapsed): Bar disappears entirely. ⌘J brings it back.

### 3.4 Rich Output Components

Each command produces typed output that renders as interactive React components:

```typescript
type CommandOutput =
  | { type: 'items'; items: WorkItem[]; meta?: { total: number } }
  | { type: 'item-created'; item: WorkItem }
  | { type: 'status-changed'; id: string; from: string; to: string }
  | { type: 'item-deleted'; id: string; title: string }
  | { type: 'search-results'; results: SearchResult[]; query: string }
  | { type: 'error'; message: string; suggestions?: string[] }
  | { type: 'help'; command?: string; content: HelpContent }
  | { type: 'config'; config: ProjectConfig }
  | { type: 'text'; content: string }
```

Item rows in output are clickable → opens detail panel.
Created items show a success card with direct link.
Errors show suggestions when possible ("Did you mean CMT-3?").

### 3.5 Context Awareness

The Command Bar reads from a `CommandContext` provider:

```typescript
interface CommandContext {
  selectedItem: string | null      // from detail panel
  activeFilters: {                 // from sidebar
    status?: string
    tag?: string
    assignee?: string
  }
  currentView: View                // board, list, etc.
  currentProject: string | null
}
```

Rules:
- `done` / `status` / `edit` / `show` with no ID → uses selectedItem
- `list` with no filters → inherits activeFilters
- All commands use currentProject automatically
- Context is shown as a subtle hint: `❯ done  (CMT-3)`

### 3.6 Autocomplete

Three levels of autocomplete:
1. **Command names**: Tab after first word → list commands
2. **Item IDs**: After command that takes an ID → fuzzy-match item IDs + titles
3. **Flag values**: After `--status=` → list valid statuses from config
   After `--priority=` → list valid priorities
   After `--assignee=` → list known assignees

Autocomplete data comes from existing queries (items list, config) — no new APIs.

### 3.7 Keyboard Navigation

| Key | Action |
|-----|--------|
| `⌘J` | Toggle Command Bar (collapse/expand/hide cycle) |
| `Enter` | Execute command |
| `↑` / `↓` | Navigate command history |
| `Tab` | Autocomplete |
| `Escape` | Clear input or collapse bar |
| `⌘K` | Focus search (existing, distinct from Command Bar) |

### 3.8 Cache Invalidation Strategy

All mutations go through a `executeCommand()` function that:
1. Calls the appropriate REST API
2. On success, invalidates the relevant React Query keys
3. Renders the output component

```typescript
// After any item mutation:
queryClient.invalidateQueries({ queryKey: ['items'] })

// After status change specifically:
queryClient.invalidateQueries({ queryKey: ['items'] })
// GUI board/list updates automatically via React Query
```

This ensures the GUI always reflects Command Bar actions instantly.

### 3.9 History Persistence

- Command history stored in `localStorage` (last 200 commands)
- Output is ephemeral (not persisted) — keeps it fast
- `history` command shows recent commands
- `clear` clears current session output

## 4. Implementation Plan

### Phase 1: Core Command Bar (this implementation)

Components:
- `CommandBar.tsx` — main UI: input, output area, resize handle
- `command-parser.ts` — thin parser: verb + args + flags extraction
- `command-executor.ts` — maps parsed commands to API calls, returns typed output
- `command-help.ts` — built-in help text for each command
- `CommandOutput.tsx` — renders typed output as React components

Commands:
- `add`, `list`, `done`, `status`, `edit`, `delete`, `search`
- `show` / `open` (navigation)
- `config`, `help`, `clear`, `history`

Features:
- ⌘J toggle, collapsed/expanded/maximized states
- Command history (↑/↓, localStorage persistence)
- Context awareness (selected item, active filters)
- Rich interactive output (clickable items, success/error cards)
- Autocomplete for commands, IDs, flag values
- `cmt` prefix optional
- Cache invalidation for all mutations

### Phase 2: Bulk Operations & Polish

- Range syntax: `done CMT-3..CMT-9`
- Filter-based bulk: `done --filter status=active,tag=p0` with confirmation
- Undo for status changes (reverts via event log)
- New backend endpoints: `/api/items/{id}/log`, `/api/archive`, `/api/check`
- `log`, `archive`, `check` commands

### Phase 3: Agent Mode (future)

- Natural language input detection
- `/ask` prefix for AI queries about project state
- `/do` prefix for AI-executed multi-step workflows
- Backend: `POST /api/exec` for server-side command chaining
- Approval gates for destructive operations
- Streaming output for long-running agent workflows

## 5. Non-Goals

- Not a general-purpose terminal (no shell access, no file editing)
- Not a replacement for the GUI (board/list views remain primary)
- No pipe/redirect syntax (keep it simple)
- No shell quoting rules (use simple space-splitting with quoted strings)
- No custom scripting language (commands are 1:1 with cmt CLI)

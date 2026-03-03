# CatchMyTask Web UI — Research & Design Foundations

## 1. Why a Web UI?

The CLI is the primary interface for agents and power users. But work management is
inherently collaborative and visual. A web UI serves actors that the CLI cannot:

- **Non-technical stakeholders** who need visibility into work status
- **Managers/leads** who need dashboards and cross-cutting views
- **Teams** who need shared boards, filters, and real-time updates
- **Mobile users** who need quick status checks and triage on the go
- **Mixed human-agent teams** who need to observe agent work in real-time

The web UI is **complementary**, not a replacement. Both interfaces operate on the same
`.cmt/` filesystem and SQLite index. The CLI remains the source of truth.

### Design Constraint: Not a SaaS

Per our core principles, this is a local-first tool. The web UI runs as a local server
(`cmt serve`) reading directly from `.cmt/` — no cloud database, no account system,
no vendor dependency. Optional: expose over network for team use.

---

## 2. Industry Landscape — What Exists, What's Wrong

### 2.1 Project Management Tools (Jira, Linear, Asana, Notion)

**What they do well:**
- Board/Kanban views with drag-drop status transitions
- Rich filtering and saved views (Linear's "Views" concept)
- Keyboard shortcuts and command palettes (Linear: Cmd+K)
- Status-based color coding and visual hierarchy
- Inline editing of fields without opening detail views
- Markdown-rich descriptions with @mentions and linking
- Real-time collaboration and presence indicators
- Sprint/cycle planning with capacity and velocity
- Dependency visualization (Gantt charts, timeline views)

**What's broken:**
- **Vendor lock-in**: Data trapped in proprietary databases. Export is lossy.
- **Schema rigidity**: Jira's "project type" determines available fields. Changing
  project type is destructive. Linear's types are fixed.
- **Agent-hostile**: No CLI-first design. API is an afterthought bolted onto GUI.
  Jira's REST API requires 50+ lines to create an issue vs `cmt add "Fix bug"`.
- **Notification overload**: Push-based model creates noise. Linear improved this
  with inbox-style notifications, but the fundamental model is push.
- **Configuration bloat**: Jira's admin interface has 200+ settings pages. Most
  teams use 5% of the features but pay the complexity tax for 100%.
- **Performance**: Jira page loads are 3-8 seconds. Linear is fast but cloud-only.
- **Opaque history**: State changes are logged but events aren't first-class.
  "Who changed this and why?" requires clicking through audit logs.
- **Human-centric assumption**: Every UI assumes a human at a screen. No concept
  of an AI agent as a first-class actor with different interaction patterns.

### 2.2 IDE-Style Interfaces (VS Code, JetBrains)

**What they do well:**
- **Activity rail** (48px icon strip) for section switching
- **Collapsible sidebar** with context-aware content
- **Command palette** (Cmd+K/Cmd+P) for fast navigation
- **Multi-tab workspace** with pin/close/reorder
- **Status bar** at bottom with contextual information
- **Split pane** editing with drag-to-resize
- **Integrated terminal** for power users
- **Extensions/plugins** for customization
- **Keyboard-first** design — every action has a shortcut
- **Tree views** for hierarchical navigation

**What's relevant to us:**
- Activity rail + sidebar + main content is the perfect shell
- Command palette is essential for power users and agent discoverability
- Tabs allow multiple work items open simultaneously
- Status bar can show work context (active item count, blocked items)
- Terminal integration could embed `cmt` CLI directly

### 2.3 Ticket/Support Systems (Zendesk, ServiceNow, Freshdesk)

**What they do well:**
- **Conversation-style history** (messages, not just field changes)
- **Assignment with routing rules** (capability-based delegation)
- **SLA tracking** with visual countdown indicators
- **Macros/canned responses** for common actions
- **Customer-facing vs internal views** (different actors see different things)
- **Merge/link tickets** for deduplication
- **Status workflows** with required fields per transition

**What's broken:**
- Human support agent assumption — no concept of AI worker
- Closed ecosystems — can't work offline or with plain files
- Heavy "ticket" metaphor — everything becomes a ticket
- Over-engineered routing — most small teams just assign manually

**What's relevant to us:**
- Conversation/log as first-class UI element (our `## Log` section)
- Visual status workflows with transition validation
- The concept of "views" for different actor types
- Merge/link as relationship management

### 2.4 Text-First/Terminal Tools (Taskwarrior, GitHub Issues, Org-mode)

**What they do well:**
- **Speed**: No round-trip to server, instant operations
- **Composability**: Unix pipes, scriptable, automatable
- **Transparency**: Plain text, version controlled, auditable
- **Offline-first**: Works without network
- **Customizable views**: Filters as first-class (Taskwarrior reports)

**What's broken:**
- No spatial/visual overview (you can't "see" 50 items at once)
- No drag-drop for quick reorganization
- Collaboration requires git workflow knowledge
- Onboarding curve for non-technical users

**What's relevant to us:**
- Speed is non-negotiable — web UI must feel as fast as CLI
- File-first guarantee means web UI is always a view, never source of truth
- Git as sync mechanism means we get collaboration "for free"

---

## 3. Adjacent Tool Patterns Worth Borrowing

### 3.1 From Syncropel Web (Our Own)

| Pattern | How It Applies |
|---------|---------------|
| Compact typography (13px base) | Work items are data-dense; tight spacing works |
| Centered max-w-5xl container | Readable on ultrawide without stretching |
| Collapsible sections with summary | Sections like "Blocked Items" collapse when empty |
| SQL-as-filter with chips | Tag filter `team:backend AND sprint:w08` as removable chips |
| Multi-view auto-detection | Same item list renders as table, board, or timeline |
| Agent panel as sidebar conversation | Agent activity log as slide-out panel |
| Stats bar with key metrics | Top bar: Active (12), Blocked (3), Done today (5) |
| Connection status indicator | Git sync status, index freshness indicator |
| Virtualized table | Handle 1000+ work items smoothly |
| Theme: Geist font + HSL tokens | Consistent with existing design language |

### 3.2 From CatchMyVibe (Our Own)

| Pattern | How It Applies |
|---------|---------------|
| Activity rail (48px icon strip) | Section switching: Board, List, Timeline, Graph |
| Context-aware sidebar | Shows different content per section (filters, tree, etc.) |
| Command palette (Cmd+K) | Navigate to any item, run commands, filter |
| Workspace tabs | Multiple items open simultaneously |
| Dense table with virtual scroll | Large work item lists with sticky columns |
| Inline editing | Click field to edit directly in table view |
| Namespace-colored tags | `team:backend` = blue, `sprint:w08` = green |
| Drag-drop reorder | Board columns, priority ordering |
| Staging zone | "Working set" of pinned items you're focused on |
| Smart collections | "Overdue", "Assigned to me", "Blocked" as auto-filters |
| Context menu (right-click) | Quick actions on work items |
| Filter panel with ranges | Priority range, date range, status multi-select |
| Actions on hover | Reduce clutter; show edit/archive/delete on hover |
| Status bar | Bottom bar with selection count, active filters |
| Dark/light mode | HSL-based tokens for easy theming |

### 3.3 From Linear

| Pattern | How It Applies |
|---------|---------------|
| Cmd+K command palette | Essential — navigate, create, filter |
| Keyboard shortcuts for everything | `C` = create, `S` = status, `P` = priority |
| Inbox (pull-based notifications) | Agents pull work; humans pull notifications |
| Cycles/sprints as time boxes | Time-based views for planning |
| Sub-issues with progress | Parent items show child completion percentage |
| Views as saved filter+sort | Persistent named views for common queries |
| Breadcrumb navigation | Team > Project > Item hierarchy |
| Instant UI with optimistic updates | Don't wait for file write to update display |
| Triage workflow | Inbox items need explicit triage before entering pipeline |
| Bulk actions | Select multiple items, batch-change status/priority |

### 3.4 From VS Code

| Pattern | How It Applies |
|---------|---------------|
| Activity bar (left icon rail) | Primary navigation between views |
| Explorer tree | Work item hierarchy (parent/child) |
| Editor tabs with preview | Click item → preview tab; double-click → persistent tab |
| Minimap (overview) | Scrollbar with item density visualization |
| Status bar segments | Left: git/sync info. Right: item counts, active filters |
| Problems panel | `cmt check` results as bottom panel |
| Integrated terminal | Embedded `cmt` CLI for power users |
| Settings with search | Configuration accessible via UI with search |
| Extension sidebar | Plugin/integration management (like `cmt setup`) |

---

## 4. Anti-Patterns — What We Must NOT Bring

### 4.1 From Jira
- **NO** "project type" that locks your schema. Our state machines are always changeable.
- **NO** 200+ settings pages. Configuration is one YAML file.
- **NO** multi-second page loads. Target: <100ms for any view.
- **NO** mandatory cloud account. This runs locally.
- **NO** "board" as the only spatial view. Multiple view types are first-class.

### 4.2 From Asana/Monday
- **NO** "everything is a task in a project" rigidity. Items compose freely.
- **NO** forced project hierarchy. Flat lists and deep hierarchies coexist.
- **NO** premium feature gates. All features available always.
- **NO** push notifications by default. Pull-based, opt-in.

### 4.3 From Zendesk
- **NO** "ticket" metaphor that reduces everything to support requests.
- **NO** customer-facing vs agent dichotomy. All actors see the same data.
- **NO** routing engine complexity. Assignment is explicit or pull-based.
- **NO** SLA engine. Due dates exist; SLA calculation is a view concern.

### 4.4 From Traditional PM Tools (General)
- **NO** human-centric UI that assumes actors are humans at screens.
  The UI must show agent activity as naturally as human activity.
- **NO** real-time collaboration as a requirement. Git sync is the model.
  Real-time presence is nice-to-have, not architectural.
- **NO** server-side rendering dependency. The web UI must work as a
  static SPA served from the Rust binary.
- **NO** separate "API" and "UI" data models. The file system IS the API.
  The UI reads the same files the CLI writes.
- **NO** database migrations. SQLite index is disposable and rebuildable.
- **NO** user accounts or permissions (initially). The filesystem owns access control.

### 4.5 From Modal-Heavy UIs (General)
- **NO** modals that deactivate underlying content. Modals break spatial context,
  prevent referencing existing items, and feel interruptive. Use side drawers
  (slide-over panels), inline expansions, and anchored popovers instead.
- **NO** full-screen overlays for forms. Creation and editing happen in the same
  400px right-panel drawer used for item detail. Context is always preserved.
- **NO** blocking confirmation dialogs. Use popovers anchored to the trigger
  button, or inline confirmation bars. The only exception: type-to-confirm for
  bulk destructive actions (>5 items), which uses an inline bar, not a modal.

### 4.6 From Our Own Past
- **NO** over-abstracting early. Build concrete views first, extract patterns later.
- **NO** "two universes" wiring (Syncropic lesson). One data model, multiple views.
- **NO** config bloat. Every config option must earn its place.

---

## 5. Core Design Principles for the Web UI

These extend the 10 CLI design principles into visual/interactive space:

### P1. Views, Not Data Stores
The web UI is a **view layer** over `.cmt/` files. It never owns data. If you delete
the web UI, nothing is lost. The CLI still works. The files are unchanged.

### P2. Speed is a Feature
Every interaction must feel instant (<100ms perceived latency). Use optimistic updates,
local SQLite reads, and virtual scrolling. If Jira taught us anything, it's that slow
tools get abandoned.

### P3. Progressive Disclosure
- Level 0: Glance at board/list, see status at a glance
- Level 1: Click item, see detail in side panel
- Level 2: Open item in full tab, edit everything
- Level 3: Command palette for power operations
- Level 4: Integrated terminal for CLI fallback

### P4. Actor-Visible
Every action shows who did it. Agent actions are visually distinct from human actions
but not second-class. The UI naturally answers: "What has the agent been doing?"

### P5. Keyboard-First, Mouse-Friendly
Every action reachable by keyboard. Mouse/touch for spatial operations (drag-drop,
board manipulation). Command palette bridges both worlds.

### P6. Dense but Breathable
Inspired by IDE density — show many items per screen without feeling cramped.
Use whitespace strategically (between sections, not within rows). 13px base font
with 1.4 line-height is the target density.

### P7. One Data Model, Many Projections
The same work items render as:
- **List** (table with filters and sort)
- **Board** (Kanban columns by status)
- **Timeline** (Gantt-style with dependencies — items without dates excluded)
- **Graph** (dependency network visualization)

Same data, different spatial metaphors. User picks what helps them think.

### P8. File-System Parity
Anything you can do in the CLI, you can do in the UI. Anything you do in the UI
results in the same file changes the CLI would make. No UI-only state. No CLI-only
features (except `cmt serve` itself).

### P9. Graceful Emptiness
Every view has a meaningful empty state. Zero items, zero config, first run — these
are not error states. They are onboarding opportunities with clear CTAs. The system
should guide a new user from `cmt init` to productive use without documentation.

### P10. Resilience Over Fragility
File conflicts, stale indexes, validation errors, and concurrent CLI edits are normal
operating conditions, not crashes. The UI shows clear diagnostics and recovery actions
(reindex, resolve, retry) rather than generic error messages.

---

## 6. Technical Architecture

### 6.1 How It Runs

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser     │────▶│  work serve  │────▶│  .cmt/      │
│  (React SPA) │◀────│  (Rust HTTP) │◀────│  files + db  │
└──────────────┘     └──────────────┘     └──────────────┘
     Static SPA       localhost:4200       Source of truth
```

- `cmt serve` is a new CLI command that starts an HTTP server
- Serves static SPA assets (bundled into the binary via `include_dir!()`)
- Exposes REST API that maps 1:1 to CLI commands
- Reads/writes the same `.cmt/` files
- Uses the same SQLite index for queries
- File watcher (via `notify` crate) pushes change events over WebSocket
- Scoped to the `.cmt/` directory of the `cmt serve` invocation (single project)

### 6.2 API Design

The API mirrors the CLI exactly:

```
GET  /api/items                    → work list --json
GET  /api/items/:id                → work show :id --json
POST /api/items                    → work add --json (body = fields)
PUT  /api/items/:id                → work edit :id --json (body = changes)
PUT  /api/items/:id/status/:state  → work status :id :state --json
PUT  /api/items/:id/done           → work done :id --json
DEL  /api/items/:id                → work delete :id --json
POST /api/items/:id/archive        → work archive :id --json
GET  /api/search?q=...             → work search "..." --json
GET  /api/config                   → work config --json
GET  /api/events/:id               → work log :id --json
POST /api/check                    → work check --json
POST /api/reindex                  → work reindex --json
```

WebSocket endpoint for live updates:
```
WS   /api/ws                       → File watcher events (created, modified, deleted)
```

When the file watcher detects a change in `.cmt/items/` or `.cmt/config.yml`,
it pushes a JSON event over the WebSocket:
```json
{"type": "item_changed", "id": "CMT-0045", "action": "modified"}
{"type": "config_changed"}
{"type": "index_stale"}
```

The frontend uses React Query's `queryClient.invalidateQueries()` on these events
to trigger re-fetches. No polling needed.

### 6.3 Frontend Stack

**Critical decision: Vite + React, NOT Next.js.**

Next.js requires a Node.js server for its App Router, API routes, and SSR features.
This fundamentally conflicts with our architecture where the Rust binary IS the server.
We need a purely static SPA that can be built to a `dist/` directory and embedded
in the Rust binary. Vite + React produces exactly this.

The rest of the stack is aligned with existing projects for pattern reuse:

| Choice | Rationale |
|--------|-----------|
| **Vite + React** | Static SPA output. Embeddable in Rust binary. Fast HMR for dev. |
| React Router | Client-side routing for SPA. Hash or browser history mode. |
| Tailwind CSS | Same design token system. HSL variables. Proven in both projects. |
| Zustand | Lightweight state. Same as Syncropel + CatchMyVibe. |
| React Query | Server state management. Same as CatchMyVibe. |
| Radix UI primitives | Accessible, unstyled. Same as CatchMyVibe. |
| Lucide icons | Same icon set across all projects. |
| @tanstack/react-virtual | Virtual scrolling for large lists. Proven in both. |
| @dnd-kit | Drag-drop for board and reorder. Proven in CatchMyVibe. |
| cmdk | Command palette. Proven in CatchMyVibe. |
| CodeMirror 6 | Markdown editor with syntax highlighting. Lightweight. |
| Geist font | Consistent typography across all projects. |

### 6.4 Build & Distribution

Two modes:
1. **Embedded**: Vite builds to `dist/`. Rust binary embeds via `include_dir!()`.
   `cmt serve` serves from memory. Zero external dependencies. Single binary.
2. **Development**: `cmt serve --dev` proxies to Vite dev server running separately.
   Hot reload for UI development.

### 6.5 URL Routing

```
/                           → Redirect to /board (default view)
/board                      → Board (Kanban) view
/list                       → List (Table) view
/timeline                   → Timeline (Gantt) view
/graph                      → Graph (Dependency) view
/dashboard                  → Dashboard (Metrics) view
/activity                   → Activity (Event feed) view
/item/:id                   → Item detail (full tab)
/settings                   → Settings view
/terminal                   → Embedded terminal

Query params for filters:
/list?status=active&tag=backend&assignee=alice
/board?status=inbox,ready,active,blocked
```

Deep links are shareable within a team (everyone runs `cmt serve` against the
same git-synced `.cmt/` directory, so URLs resolve to the same items).

---

## 7. Information Architecture

### 7.1 Primary Navigation (Activity Rail)

```
╔══════╗
║  ▦   ║  Board (Kanban view)
║  ≡   ║  List (Table view)
║  ═══ ║  Timeline (Gantt view)
║  ◉─◉ ║  Graph (Dependency view)
╠══════╣
║  ▣   ║  Dashboard (Metrics)
║  ↕   ║  Activity (Event feed)
╠══════╣
║  ⚙   ║  Settings
║  >_  ║  Terminal
╚══════╝
```

### 7.2 Sidebar (Context-Aware, 220px, collapsible via Cmd+B)

**In Board/List/Timeline/Graph view:**
- Project name + prefix
- Item hierarchy tree (parent → children, collapsible)
- Status filter (checkboxes matching state machine states)
- Quick filters: My items, Overdue, Blocked, Unassigned
- Saved views (custom filter+sort combos, persisted in `.cmt/views/`)
- Tag tree (namespace-grouped, click to filter)
- Focus items (pinned working set — items you're actively focused on)

**In Dashboard view:**
- Time range selector
- Metric categories (toggle which charts to show)
- Actor filter (humans, agents, all)

**In Activity view:**
- Actor filter (all, human, agent, system)
- Action filter (created, transitions, edits, archive, delete)
- Date range

### 7.3 Main Content Area

Each view occupies the full main content area. Items can be opened in:
1. **Side panel** (slide-over from right, 400px) — click item to quick view/edit
2. **Full tab** (replaces main content) — double-click item for deep editing

**No modals.** We never use full-screen overlays that deactivate underlying content.
All secondary interactions use drawers (same 400px right panel), inline expansions,
or popovers anchored to their trigger. This keeps the board/list visible and
interactive at all times — you can reference existing items while creating new ones,
check statuses while editing, and maintain spatial context during any operation.
Destructive confirmations use popovers or inline bars, not blocking dialogs.

---

## 8. Key Screens (Conceptual)

Detailed ASCII mockups are in `docs/design/web-ui-screens.md`.

### 8.1 Board View (Default Landing)
Kanban columns mapped to state machine states. Drag items between columns
to trigger status transitions. Cards show: ID, title, priority indicator,
assignee avatar/badge, tags, dependency indicator. Columns horizontally scroll
when the state machine has more than 5 states. Done/cancelled columns are
collapsible to reduce noise.

### 8.2 List View
Dense table with configurable columns. Sort by any column. Filter chips
at top. Inline editing for quick field changes. Multi-select for bulk operations.
Virtual scrolling for 1000+ items.

### 8.3 Item Detail (Side Panel)
Slide-over panel showing: title (editable), status (dropdown with valid
transitions only), all frontmatter fields, Markdown body with preview/edit
toggle, event log with actor badges, dependency graph (mini), related items.

### 8.4 Item Detail (Full Tab)
Full editing with split Markdown editor (CodeMirror) and preview. Complete
metadata grid. Relationship sidebar (children, depends on, blocked by, related).
Event log with actor and action filtering.

### 8.5 Dashboard
Stats bar: Total active, by status breakdown, overdue count, blocked count.
Charts: Throughput (items completed per day/week), status distribution,
actor activity comparison (human vs agent), age distribution.
Agent summary: "What happened since you were last here" — critical panel.

### 8.6 Activity Feed
Chronological event stream. Each event shows: timestamp, actor (with
human/agent badge), action, item link. Filterable by actor type — critical
for answering "what did the agent do while I was away?"

### 8.7 Timeline View
Horizontal Gantt-style view. Items as bars from created→due (or started_at→due).
Dependency arrows between items. Drag to adjust dates. Color by status or
priority. Items without dates are excluded (with count shown: "12 items without
dates — switch to List view to see all").

### 8.8 Graph View
Network visualization of items and their relationships (parent/child,
depends_on). Items as nodes colored by status, directed edges for relationships.
Click node to open side panel. Hierarchical, force-directed, or radial layout.

### 8.9 Empty States
Every view has a designed empty state:
- **Board (no items)**: "No work items yet" + [Create your first item] button +
  link to CLI quick start
- **Board (all filtered out)**: "No items match your filters" + [Clear filters]
- **Dashboard (no data)**: Skeleton charts with "Add some items to see metrics"
- **First run (no .cmt/)**: Should not happen (`cmt serve` requires init'd project)

### 8.10 Error & Diagnostic States
- **Index stale**: Amber banner at top: "Index may be out of date. [Reindex now]"
- **Validation errors**: Bottom panel (like VS Code Problems) showing `cmt check`
  results with clickable item links
- **File conflict**: Item detail shows warning banner: "This file was modified
  externally. [Reload] [Overwrite]"
- **WebSocket disconnected**: Status bar shows "Disconnected — [Reconnect]"

---

## 9. Agent-Specific UI Considerations

### 9.1 Agent Activity Panel
When an agent (identified via `--actor`) creates/modifies items, those events
are tagged. The UI should:
- Show a distinct visual indicator for agent actions (icon + purple accent color)
- Allow filtering to "agent only" view in activity feed
- Provide a "since I last looked" summary on dashboard
- Never make agent actions feel "lesser" — they're equal actors

### 9.2 Agent Work in Progress
When an agent has items in `active` status:
- Show "Agent working on..." indicator on the board card (pulsing border)
- Display time-since-start on the card and in detail view
- Allow human to view item detail and see what the agent has done
- Provide "interrupt" capability (change status to blocked with reason)

### 9.3 Agent Delegation
The UI should make delegation to agents natural:
- Assign to agent just like assigning to human (same dropdown)
- Status transition from `ready` → `active` when agent picks up work
- Agent's event log shows reasoning/progress
- Human can review agent's work before marking `done`

### 9.4 Agent Review Workflow
After an agent marks an item `done`:
- Dashboard highlights items completed by agents that haven't been reviewed
- One-click "Approve & Archive" or "Reopen with feedback"
- Bulk review: select multiple agent-completed items, approve all

---

## 10. Interaction Patterns

### 10.1 Feedback System
Every mutation provides feedback via toast notifications:
- **Success**: "CMT-0055 created" (with link to open item)
- **Status change**: "CMT-0045: active → blocked" (with undo for 5 seconds)
- **Error**: "Cannot transition: blocked → done is not a valid transition"
- **Bulk**: "3 items archived" (with undo)

Toasts stack in the bottom-right corner, auto-dismiss after 5 seconds.

### 10.2 Destructive Confirmations
Destructive actions use non-modal confirmation (popovers or inline bars):
- **Delete**: Popover anchored to delete button: "Delete CMT-0045? [Cancel] [Delete]"
- **Bulk delete**: Inline bar replaces bulk actions bar. Type-to-confirm for >5 items.
- **Archive**: No confirmation needed (reversible). Toast with undo instead.

### 10.3 Loading States
- **Initial load**: Full-screen skeleton matching the current view layout
- **Navigation**: Skeleton in main content area; shell remains interactive
- **Inline edits**: Optimistic update (instant UI change, revert on error)
- **Data refresh**: No visible loading; data appears when ready

### 10.4 Markdown Editing
- Side panel: textarea with basic formatting toolbar (bold, italic, heading, list, link)
- Full tab: CodeMirror 6 with Markdown syntax highlighting, split preview (side-by-side),
  toolbar for formatting. Vim keybindings available via setting.
- Both: live preview of Markdown rendering. Acceptance criteria checkboxes are interactive.

### 10.5 Search System
Three levels of search:
1. **Quick search** (Cmd+K): Fuzzy match on ID and title. Navigate to item.
2. **Structured search** (search bar in list view): `status:active priority:high tag:backend`
   parsed into filter chips. Matches `cmt search` CLI syntax.
3. **Full-text search** (via search icon): Searches item bodies (Markdown content).
   Results show matched excerpt with highlighting.

### 10.6 Focus Mode (Working Set)
Borrowed from CatchMyVibe's staging zone concept:
- Pin items to your "Focus" list via right-click > "Add to Focus" or drag to sidebar
- Focus items appear as a persistent section at the top of the sidebar
- Quick-switch between focus items with keyboard shortcuts (Ctrl+1, Ctrl+2, etc.)
- Focus list persisted in browser localStorage (not in `.cmt/` — it's personal UI state)

---

## 11. Accessibility

### 11.1 Keyboard Navigation
- All interactive elements reachable via Tab
- Arrow keys navigate within lists, boards, and tables
- Focus ring visible on all focused elements (2px solid, accent color)
- Skip navigation link for screen readers

### 11.2 Screen Reader Support
- ARIA roles: `role="grid"` for table, `role="list"` for board columns
- ARIA labels: status badges, priority indicators, actor badges all have text labels
- Live regions: toast notifications use `aria-live="polite"`
- Board drag-drop announces: "CMT-0045 moved from ready to active"

### 11.3 Visual Accessibility
- Color is never the only indicator — status uses dot + text, priority uses dot + letter
- Minimum contrast ratio: 4.5:1 for text, 3:1 for UI elements (WCAG AA)
- Reduced motion: respect `prefers-reduced-motion` — disable animations, transitions
- Both light and dark themes meet contrast requirements

---

## 12. Decisions Resolved

These questions from the initial design phase are now resolved:

| Question | Decision | Rationale |
|----------|----------|-----------|
| Offline mode | Local server sufficient | `cmt serve` reads local files. No network needed. |
| Multi-project | Single project per server | `cmt serve` is scoped to one `.cmt/`. Run multiple instances on different ports for multi-project. |
| Real-time | File watcher + WebSocket | `notify` crate watches `.cmt/` directory, pushes events. React Query invalidates on event. |
| Mobile | Responsive web, not separate PWA | Same codebase, responsive breakpoints. Mobile-first for triage actions. |
| Theme | Light default, dark toggle | Light is more accessible for broader audiences. Both themes must meet WCAG AA. Dark toggle via Tailwind `class` strategy. |
| Auth | None for local; optional basic auth for network | `cmt serve --bind 0.0.0.0 --auth` for team use. No user accounts, just a shared password. |
| Framework | Vite + React (NOT Next.js) | Must produce static SPA for embedding in Rust binary. Next.js requires Node server. |
| Markdown editor | CodeMirror 6 | Lightweight, extensible, proven. Split preview for full tab editing. |

---

## References

- CatchMyTask CLI: `cmt --help`, `cmt help-agent --json`
- Design Principles: `docs/research/02-first-principles.md`
- Industry Landscape: `docs/research/01-industry-landscape.md`
- Agent Discoverability: `docs/design/agent-discoverability.md`
- State Machine Spec: `docs/specs/02-state-machine.md`
- Work Item Schema: `docs/specs/01-work-item-schema.md`
- Screen Designs: `docs/design/web-ui-screens.md`

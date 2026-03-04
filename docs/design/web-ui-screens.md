# CatchMyTask Web UI — Screen Designs

## App Shell

The shell is consistent across all views. Inspired by VS Code's activity bar +
sidebar + editor pattern, adapted for work management.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐ ┌──────────────────────────────────────────────────────────────────┐   │
│ │      │ │ HEADER                                                          │   │
│ │      │ │  ☰  CatchMyTask  ▸ my-project [WM]     🔍 ⌘K    [+ New]      │   │
│ │  A   │ ├────────────────┬─────────────────────────────────────────────────┤   │
│ │  C   │ │                │                                                │   │
│ │  T   │ │   SIDEBAR      │   MAIN CONTENT AREA                           │   │
│ │  I   │ │   (220px)      │                                               │   │
│ │  V   │ │                │   (flex-1, scrollable)                        │   │
│ │  I   │ │  Context-aware │                                               │   │
│ │  T   │ │  navigation,   │   Board / List / Timeline / Graph /           │   │
│ │  Y   │ │  filters,      │   Dashboard / Activity / Item Detail          │   │
│ │      │ │  saved views,  │                                               │   │
│ │  R   │ │  focus items   │                                               │   │
│ │  A   │ │                │                                               │   │
│ │  I   │ │                │                                               │   │
│ │  L   │ │                │                                               │   │
│ │      │ │                │                                               │   │
│ │(48px)│ │                │                                               │   │
│ │      │ ├────────────────┴─────────────────────────────────────────────────┤   │
│ │      │ │ STATUS BAR: ● git:main  │ Active: 24  Blocked: 3 │ Index: ok   │   │
│ └──────┘ └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Activity Rail (48px, always visible on desktop)

```
┌──────┐
│  ▦   │  Board view (Kanban)          /board
│      │
│  ≡   │  List view (Table)            /list
│      │
│  ═══ │  Timeline view (Gantt)        /timeline
│      │
│  ◉─◉ │  Graph view (Dependencies)   /graph
│      │
├──────┤
│  ▣   │  Dashboard (Metrics)          /dashboard
│      │
│  ↕   │  Activity (Event feed)        /activity
│      │
│      │
├──────┤
│  ⚙   │  Settings                     /settings
│      │
│  >_  │  Terminal (embedded CLI)      /terminal
└──────┘
```

### Header Bar (h-10, 40px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ☰  CatchMyTask  ▸ my-project [WM]    🔍 Search (⌘K)        [+ New] │
└─────────────────────────────────────────────────────────────────────────┘
 │    │                │                   │                      │
 │    Brand            Breadcrumb          Search triggers        Create
 Toggle sidebar        project+prefix      command palette        item
 (⌘B)
```

No user avatar — we don't have accounts. The actor identity is set via CLI
(`--actor` or `CMT_ACTOR` env). The header is for navigation, not identity.

### Status Bar (h-7, 28px, bottom)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ● git:main (clean)  │  Active: 24  Blocked: 3  │  Index: ok  │ v0.1.1│
└─────────────────────────────────────────────────────────────────────────┘
  │                       │                           │              │
  Git branch + status     Item counts (clickable      Index health   Version
  (● green=clean,         to filter by that status)   (ok/stale/
   ● amber=dirty)                                      reindexing)
```

Status bar states:
```
Normal:      ● git:main (clean)  │  Active: 24  Blocked: 3  │  Index: ok
Dirty git:   ● git:main (3 modified)  │  Active: 24  │  Index: ok
Stale index: ● git:main (clean)  │  Active: 24  │  ⚠ Index: stale [Reindex]
Disconnected:● git:main  │  Active: 24  │  ⚠ WebSocket disconnected [Reconnect]
```

---

## Screen 1: Board View (Default Landing)

Kanban columns mapped to the project's state machine. Each column is a state.
Items are cards that can be dragged between columns (triggering `cmt status`).
Columns scroll horizontally when state machine has >5 states.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: BOARD ────────────────────────────────────────────┐
│                    ││                                                           │
│ ▾ Focus (2)        ││  ┌─ INBOX (4) ─┐  ┌─ READY (6) ──┐  ┌─ ACTIVE (8) ─┐   │
│   CMT-0045 Refact.. ││  │             │  │              │  │              │   │
│   CMT-0048 Add au.. ││  │ ┌─────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │   │
│                    ││  │ │ CMT-0052 │ │  │ │ CMT-0048  │ │  │ │ CMT-0045  │ │   │
│ ── Hierarchy ──────││  │ │ Fix API │ │  │ │ Add auth │ │  │ │ Refactor │ │   │
│ ▾ CMT-0010 Epic     ││  │ │ ● high  │ │  │ │ ● crit   │ │  │ │ ● med    │ │   │
│   ├ CMT-0039 ✓      ││  │ │ 🏷 api  │ │  │ │ 🏷 auth  │ │  │ │ 🤖 agent │ │   │
│   ├ CMT-0040 ✓      ││  │ └─────────┘ │  │ │ 👤 alice  │ │  │ │ ⏱ 2h ago │ │   │
│   ├ CMT-0045 ◉      ││  │             │  │ └──────────┘ │  │ └──────────┘ │   │
│   └ CMT-0048 ░      ││  │ ┌─────────┐ │  │              │  │              │   │
│                    ││  │ │ CMT-0053 │ │  │ ┌──────────┐ │  │ ┌──────────┐ │   │
│ ▾ Status           ││  │ │ Update  │ │  │ │ CMT-0049  │ │  │ │ CMT-0046  │ │   │
│   ☑ inbox     (4)  ││  │ │ docs    │ │  │ │ Search   │ │  │ │ Index    │ │   │
│   ☑ ready     (6)  ││  │ │ ● low   │ │  │ │ ● med    │ │  │ │ perf     │ │   │
│   ☑ active    (8)  ││  │ └─────────┘ │  │ │ 🏷 search│ │  │ │ ● high   │ │   │
│   ☑ blocked   (3)  ││  │             │  │ └──────────┘ │  │ │ 🤖 agent │ │   │
│   ☐ done     (42)  ││  │ ┌─────────┐ │  │              │  │ └──────────┘ │   │
│   ☐ cancelled (2)  ││  │ │ ...     │ │  │ │  ...      │ │  │             │   │
│                    ││  │ └─────────┘ │  │ └──────────┘ │  │  ...        │   │
│ ▸ Priority         ││  └─────────────┘  └──────────────┘  └──────────────┘   │
│ ▸ Assignee         ││                                                           │
│                    ││  ┌─ BLOCKED (3) ─┐  ┌─ DONE (42) ─┐  ┌─ CANCEL (2) ─┐  │
│ ── Quick Filters ──││  │  ...          │  │  (collapsed) │  │  (collapsed) │  │
│   My items         ││  └──────────────┘  └──────────────┘  └──────────────┘  │
│   Overdue          ││                                                           │
│   Blocked          ││                                                           │
│   Unassigned       ││                                                           │
│                    ││                                                           │
│ ── Saved Views ────││                                                           │
│   Sprint W08       ││                                                           │
│   Backend team     ││                                                           │
│   Agent work       ││                                                           │
│                    ││                                                           │
│ ── Tags ───────────││                                                           │
│   ▸ team:          ││                                                           │
│   ▸ sprint:        ││                                                           │
│   ▸ domain:        ││                                                           │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

### Board Card (Expanded Detail)

```
┌──────────────────────────────┐
│ CMT-0045                  ●H  │  ← ID + priority dot (H=high, colored)
│                              │
│ Refactor storage layer       │  ← Title (truncated to 2 lines)
│                              │
│ 🤖 claude-agent    ⏱ 2h     │  ← Assignee (🤖=agent, 👤=human) + time
│                              │
│ ┌──────┐ ┌────────┐ ┌─────┐ │
│ │ api  │ │backend │ │perf │ │  ← Tags (namespace-colored pills)
│ └──────┘ └────────┘ └─────┘ │
│                              │
│ ⛓ 2 deps  📎 3 children     │  ← Dependency + child count
│ ▓▓▓▓▓▓░░░░ 2/3 children done│  ← Child completion progress bar
└──────────────────────────────┘
```

### Board Card States

```
Normal:          Hover:           Selected:        Agent-active:
┌──────────┐    ┌──────────┐    ┌══════════┐    ┌──────────┐
│ CMT-0045  │    │ CMT-0045  │    ║ CMT-0045  ║    │ CMT-0045  │
│ Refactor │    │ Refactor │    ║ Refactor ║    │ Refactor │
│          │    │    [⋮]   │    ║          ║    │ ◀── 🤖   │
│ ● med    │    │ ● med    │    ║ ● med    ║    │ ● med    │
└──────────┘    └──────────┘    └══════════┘    └─ ─ ─ ─ ─┘
  border-subtle   +context menu    accent border    pulsing purple
                   on hover                          dashed border
```

### Board: Empty State (New Project)

```
┌─ MAIN: BOARD ──────────────────────────────────────────────────────────────────┐
│                                                                                │
│  ┌─ INBOX ──────┐  ┌─ READY ──────┐  ┌─ ACTIVE ─────┐  ┌─ DONE ───────┐    │
│  │              │  │              │  │              │  │              │    │
│  │              │  │              │  │              │  │              │    │
│  │              │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                                │
│                     ┌──────────────────────────────────┐                       │
│                     │                                  │                       │
│                     │   No work items yet              │                       │
│                     │                                  │                       │
│                     │   [+ Create your first item]     │                       │
│                     │                                  │                       │
│                     │   or from the CLI:               │                       │
│                     │   $ cmt add "Fix the bug" -p h  │                       │
│                     │                                  │                       │
│                     └──────────────────────────────────┘                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Board: Filtered Empty State

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   No items match your filters                        │
│                                                      │
│   Active filters: │status:blocked│ │tag:frontend│    │
│                                                      │
│   [Clear all filters]                                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Screen 2: List View

Dense table inspired by CatchMyVibe's TrackTable.
Virtual scrolling, sortable columns, inline editing, configurable columns.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: LIST ─────────────────────────────────────────────┐
│                    ││                                                           │
│ (same as board)    ││ ┌─ TOOLBAR ─────────────────────────────────────────────┐ │
│                    ││ │ 🔍 status:active tag:backend     [+ Filter] [Columns] │ │
│                    ││ │                                                       │ │
│                    ││ │ Chips: │status:active│ │tag:backend│  [✕ Clear all]   │ │
│                    ││ └───────────────────────────────────────────────────────┘ │
│                    ││                                                           │
│                    ││ ┌─ TABLE ───────────────────────────────────────────────┐ │
│                    ││ │  ☐  ID       TITLE              STATUS  PRI  ASSIGN  │ │
│                    ││ │ ─── ──────── ────────────────── ─────── ──── ─────── │ │
│                    ││ │  ☐  CMT-0048  Add authentication  ready  ●C   alice   │ │
│                    ││ │  ☑  CMT-0045  Refactor storage    active ●M   🤖agent │ │
│                    ││ │  ☐  CMT-0046  Index performance   active ●H   🤖agent │ │
│                    ││ │  ☐  CMT-0049  Full-text search    ready  ●M   —       │ │
│                    ││ │  ☐  CMT-0050  Config validation   active ●L   bob     │ │
│                    ││ │  ☑  CMT-0051  State machine vis   active ●M   alice   │ │
│                    ││ │  ☐  CMT-0047  Git auto-commit     blocked●H   —       │ │
│                    ││ │  ☑  CMT-0052  Fix API timeout     inbox  ●H   —       │ │
│                    ││ │  ☐  CMT-0053  Update CLI docs     inbox  ●L   —       │ │
│                    ││ │  ☐  CMT-0054  Archive command     inbox  ●N   —       │ │
│                    ││ │  ...                                                  │ │
│                    ││ └──────────────────────────────────────────────────────┘ │
│                    ││                                                           │
│                    ││ Showing 24 items │ 3 selected                             │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

### Inline Editing (Click a status cell)

```
Before click:               After click:
┌─────────────────────┐     ┌─────────────────────┐
│  ready              │     │ ┌─────────────────┐ │
│                     │  →  │ │ ▾ active        │ │  ← Only valid transitions
│                     │     │ │   cancelled     │ │     from state machine
│                     │     │ └─────────────────┘ │
└─────────────────────┘     └─────────────────────┘

Note: "blocked" and "done" don't appear because
ready→blocked and ready→done are not valid transitions.
```

### Bulk Actions Bar (appears when items selected)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ☑ 3 selected  [✕]  │  [Status ▾]  [Priority ▾]  [Assign ▾]       │
│                      │  [Add Tag]   [Archive]      [Delete]         │
└─────────────────────────────────────────────────────────────────────┘
```

### Configurable Columns (Gear icon dropdown)

```
┌─ Columns ──────────────────┐
│  ☑ ID                      │
│  ☑ Title                   │
│  ☑ Status                  │
│  ☑ Priority                │
│  ☑ Assignee                │
│  ☐ Type                    │
│  ☐ Created                 │
│  ☐ Due date                │
│  ☐ Tags                    │
│  ☐ Parent                  │
│  ☐ Dependencies            │
│                            │
│  Density: [Compact ▾]      │
│                            │
│  [Reset to default]        │
└────────────────────────────┘
```

---

## Screen 3: Item Detail — Side Panel

Triggered by clicking an item in board or list. Slides in from right (400px).
Main content remains visible but not interactive (click outside to close).

```
                                           ┌─ SIDE PANEL (400px) ──────────┐
                                           │ ← Back              [↗] [✕]  │
                                           │                               │
 ┌─ MAIN (dimmed) ──────────────────────┐  │ CMT-0045                       │
 │                                      │  │ ┌───────────────────────────┐ │
 │  (Board or List view visible         │  │ │ Refactor storage layer    │ │
 │   behind the panel, slightly         │  │ └───────────────────────────┘ │
 │   dimmed)                            │  │                               │
 │                                      │  │ Status:   [active ▾]         │
 │                                      │  │ Priority: [● high  ▾]        │
 │                                      │  │ Assignee: [🤖 claude-agent ▾]│
 │                                      │  │ Type:     task                │
 │                                      │  │ Due:      [2026-03-10 📅]    │
 │                                      │  │ Parent:   CMT-0010 ▸          │
 │                                      │  │ Depends:  CMT-0039 ▸ CMT-0040 ▸│
 │                                      │  │ Tags:     [api] [backend] [+]│
 │                                      │  │ Children: ▓▓▓▓░░ 2/3 done   │
 │                                      │  │                               │
 │                                      │  │ ── Description ────────────  │
 │                                      │  │                               │
 │                                      │  │ Refactor the storage layer   │
 │                                      │  │ to support both simple and   │
 │                                      │  │ complex item formats with    │
 │                                      │  │ a unified interface.         │
 │                                      │  │                     [Edit ✎] │
 │                                      │  │                               │
 │                                      │  │ ## Acceptance Criteria       │
 │                                      │  │ ☑ Unified read/write API     │
 │                                      │  │ ☐ Migration for existing     │
 │                                      │  │ ☐ Performance benchmarks     │
 │                                      │  │                               │
 │                                      │  │ ── Event Log ─────────────  │
 │                                      │  │                               │
 │                                      │  │ 🤖 2h ago   status → active  │
 │                                      │  │    claude-agent               │
 │                                      │  │                               │
 │                                      │  │ 👤 1d ago   assigned to       │
 │                                      │  │    alice    claude-agent      │
 │                                      │  │                               │
 │                                      │  │ 👤 2d ago   created           │
 │                                      │  │    alice    priority: high    │
 └──────────────────────────────────────┘  │                               │
                                           │ [Open in Tab ↗]  [Archive]    │
                                           └───────────────────────────────┘
```

### Side Panel: Externally Modified Warning

```
┌─ SIDE PANEL ─────────────────────────────┐
│ ← Back                         [↗] [✕]  │
│                                          │
│ ┌─ ⚠ FILE MODIFIED EXTERNALLY ────────┐ │
│ │ This item was changed outside the   │ │
│ │ web UI (CLI or text editor).        │ │
│ │ [Reload latest]  [Keep my version]  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ CMT-0045                                  │
│ ...                                      │
```

---

## Screen 4: Item Detail — Full Tab

Double-click an item or click "Open in Tab" from side panel. Full editing
with Markdown editor (CodeMirror 6) and complete metadata.

```
┌─ TAB BAR ──────────────────────────────────────────────────────────────────┐
│  [▦ Board]  [CMT-0045 Refactor storage ×]  [CMT-0048 Add auth ×]          │
└────────────────────────────────────────────────────────────────────────────┘
┌─ ITEM DETAIL ──────────────────────────────────────────────────────────────┐
│                                                                            │
│  CMT-0045                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │ Refactor storage layer                                       │  [✎]    │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                            │
│  ┌─ METADATA (grid) ───────────────────────────────────────────┐          │
│  │ Status    [active ▾]   Priority  [● high ▾]    Type  task   │          │
│  │ Assignee  [🤖 claude-agent ▾]    Due  [2026-03-10 📅]       │          │
│  │ Parent    CMT-0010 ▸              Created  2026-02-15        │          │
│  │ Depends   CMT-0039 ▸ CMT-0040 ▸   Tags  [api] [backend] [+] │          │
│  └─────────────────────────────────────────────────────────────┘          │
│                                                                            │
│  ┌─ BODY ─────────────────────────────────────────┐ ┌─ RELATIONSHIPS ──┐ │
│  │                                                 │ │                  │ │
│  │  [Edit] [Preview] [Split]                       │ │ ▾ Children (3)  │ │
│  │                                                 │ │   CMT-0055 ▸     │ │
│  │  ## Description                                 │ │   CMT-0056 ▸     │ │
│  │                                                 │ │   CMT-0057 ▸     │ │
│  │  Refactor the storage layer to support both     │ │   ▓▓▓▓░░ 2/3   │ │
│  │  simple and complex item formats with a         │ │                  │ │
│  │  unified interface.                             │ │ ▾ Depends On    │ │
│  │                                                 │ │   CMT-0039 ✓done │ │
│  │  ## Acceptance Criteria                         │ │   CMT-0040 ◉activ│ │
│  │  - [x] Unified read/write API                   │ │                  │ │
│  │  - [ ] Migration for existing items             │ │ ▾ Blocks        │ │
│  │  - [ ] Performance benchmarks                   │ │   CMT-0046 ⚠blkd │ │
│  │                                                 │ │                  │ │
│  └─────────────────────────────────────────────────┘ └──────────────────┘ │
│                                                                            │
│  ┌─ EVENT LOG ─────────────────────────────────────────────────────────┐  │
│  │ Filter: [All ▾]  [All actors ▾]                                     │  │
│  │                                                                     │  │
│  │ 🤖 claude-agent   2h ago    status: ready → active                  │  │
│  │ 👤 alice          1d ago    assigned to claude-agent                │  │
│  │ 👤 alice          2d ago    created (priority: high, type: task)    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  [Archive]  [Delete]                                                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 5: Dashboard

Metrics and overview for project health. Answers: "How is the project doing?"
and "What happened while I was away?"

```
┌─ SIDEBAR ──────────┐┌─ MAIN: DASHBOARD ────────────────────────────────────────┐
│                    ││                                                           │
│ Time range         ││ ┌─ STATS BAR ─────────────────────────────────────────┐  │
│  ○ Today           ││ │  Total    Active   Blocked   Done      Overdue     │  │
│  ● This week       ││ │  65       24       3         42        2           │  │
│  ○ This month      ││ │          ▪▪▪▪▪▪   ▪▪▪       ▪▪▪▪▪▪▪▪  ▪▪          │  │
│  ○ All time        ││ └──────────────────────────────────────────────────────┘  │
│                    ││                                                           │
│ Actor filter       ││ ┌─ AGENT SUMMARY (since your last visit) ──────────────┐ │
│  ☑ All             ││ │                                                       │ │
│  ☑ Humans          ││ │  🤖 claude-agent completed 3 items overnight:         │ │
│  ☑ Agents          ││ │                                                       │ │
│  ☑ System          ││ │  ✅ CMT-0041 Fix serialization bug        (2h 14m)    │ │
│                    ││ │  ✅ CMT-0042 Add validation tests         (1h 38m)    │ │
│ Metrics            ││ │  ✅ CMT-0043 Update error messages        (45m)       │ │
│  ☑ Agent summary   ││ │                                                       │ │
│  ☑ Status dist.    ││ │  🔄 CMT-0045 Refactor storage layer       (in prog)   │ │
│  ☑ Throughput      ││ │  ⚠  CMT-0046 Index performance            (blocked)   │ │
│  ☑ Actor activity  ││ │     └─ "Needs CMT-0045 complete"                      │ │
│                    ││ │                                                       │ │
│                    ││ │  [Review all]  [Approve completed]                     │ │
│                    ││ └───────────────────────────────────────────────────────┘ │
│                    ││                                                           │
│                    ││ ┌─ STATUS DISTRIBUTION ────┐ ┌─ THROUGHPUT ────────────┐ │
│                    ││ │                          │ │                         │ │
│                    ││ │  inbox    ████ 4         │ │  Items completed/week   │ │
│                    ││ │  ready    ██████ 6       │ │                         │ │
│                    ││ │  active   ████████ 8     │ │  12 ╭─╮                │ │
│                    ││ │  blocked  ███ 3           │ │   8 │  ╰─╮     ╭─╮    │ │
│                    ││ │  done     ██████████42    │ │   4 │     ╰───╯   │   │ │
│                    ││ │  cancel   ██ 2           │ │   0 ╰─────────────╯   │ │
│                    ││ │                          │ │     W4  W5  W6  W7 W8 │ │
│                    ││ └──────────────────────────┘ └─────────────────────────┘ │
│                    ││                                                           │
│                    ││ ┌─ ACTOR ACTIVITY ─────────────────────────────────────┐ │
│                    ││ │  This week:                                           │ │
│                    ││ │                                                       │ │
│                    ││ │  👤 alice          ████████████ 12 actions            │ │
│                    ││ │  🤖 claude-agent   ██████████████████ 18 actions      │ │
│                    ││ │  👤 bob            ████ 4 actions                     │ │
│                    ││ │                                                       │ │
│                    ││ │  Agent vs Human:  🤖 58%  👤 42%                     │ │
│                    ││ └───────────────────────────────────────────────────────┘ │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

### Dashboard: Empty State

```
┌─ STATS BAR ─────────────────────────────────────────────────┐
│  Total: 0    Active: 0    Blocked: 0    Done: 0             │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                                                            │
│   Dashboard will populate as you create and                │
│   work through items.                                      │
│                                                            │
│   [+ Create an item]  [Go to Board]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Screen 6: Activity Feed

Chronological stream of all events. Critical for observability of agent work.
Answers: "What happened?" with full audit trail.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: ACTIVITY ─────────────────────────────────────────┐
│                    ││                                                           │
│ Actor              ││ ┌─ FILTERS ────────────────────────────────────────────┐  │
│  ● All             ││ │ [All actors ▾]  [All actions ▾]  [This week ▾]      │  │
│  ○ Humans only     ││ └──────────────────────────────────────────────────────┘  │
│  ○ Agents only     ││                                                           │
│                    ││  ── Today ────────────────────────────────────────────     │
│ Action             ││                                                           │
│  ☑ Created         ││  🤖 claude-agent                              10:32 AM   │
│  ☑ Status change   ││  ┌────────────────────────────────────────────────────┐   │
│  ☑ Edit            ││  │ status: ready → active on CMT-0045                 │   │
│  ☑ Assignment      ││  │ Refactor storage layer                     [▸]    │   │
│  ☐ Archive         ││  └────────────────────────────────────────────────────┘   │
│  ☐ Delete          ││                                                           │
│                    ││  👤 alice                                      9:15 AM   │
│ Since              ││  ┌────────────────────────────────────────────────────┐   │
│  ○ Last hour       ││  │ assigned claude-agent to CMT-0045            [▸]   │   │
│  ○ Today           ││  │ assigned claude-agent to CMT-0046            [▸]   │   │
│  ● This week       ││  └────────────────────────────────────────────────────┘   │
│  ○ All time        ││                                                           │
│                    ││  🤖 claude-agent                               8:45 AM   │
│                    ││  ┌────────────────────────────────────────────────────┐   │
│                    ││  │ ✅ completed CMT-0043 Update error messages   [▸]  │   │
│                    ││  │ status: active → done (duration: 45m)             │   │
│                    ││  └────────────────────────────────────────────────────┘   │
│                    ││                                                           │
│                    ││  ── Yesterday ────────────────────────────────────────     │
│                    ││                                                           │
│                    ││  🤖 claude-agent                              11:22 PM   │
│                    ││  ┌────────────────────────────────────────────────────┐   │
│                    ││  │ ✅ completed CMT-0042 Add validation tests    [▸]  │   │
│                    ││  │ status: active → done (duration: 1h 38m)          │   │
│                    ││  └────────────────────────────────────────────────────┘   │
│                    ││                                                           │
│                    ││  [Load more...]                                           │
└────────────────────┘└───────────────────────────────────────────────────────────┘

[▸] = click to open item in side panel
```

---

## Screen 7: Timeline View

Gantt-style horizontal timeline. Only shows items with dates. Items without
dates are excluded with a clear count and link to list view.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: TIMELINE ─────────────────────────────────────────┐
│                    ││                                                           │
│ Color by           ││  ⚠ 12 items without dates (not shown). [View in List]    │
│  ● Status          ││                                                           │
│  ○ Priority        ││  ◄ Feb 2026                         Mar 2026 ►           │
│  ○ Assignee        ││  17  18  19  20  21  24  25  26  27  28  03  04  05     │
│                    ││  │   │   │   │   │   │   │   │   │   │   │   │   │      │
│ Show               ││  CMT-0039 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██ done                   │
│  ☑ Dependencies    ││  │   │   │   │   │   │   │   │ ╲ │   │   │   │   │      │
│  ☑ Today line      ││  CMT-0040 │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██ done                   │
│  ☐ Completed       ││  │   │   │   │   │   │   │   │ ╲ │   │   │   │   │      │
│                    ││  CMT-0045 │   │   │   ░░░░░░░░░░░░░░▓▓▓▓ active          │
│ Group by           ││  │   │   │   │   │   │   │   │   │   │ ╲ │   │   │      │
│  ○ None            ││  CMT-0046 │   │   │   │   │   │   │   │  ░░░░░ blocked   │
│  ● Assignee        ││  │   │   │   │   │   │   │   │   │   │   │   │   │      │
│  ○ Priority        ││  CMT-0048 │   │   ░░░░░░░░░░░░░░░░░░░░░░ ready           │
│                    ││  │   │   │   │   │   │   │   │   │   │   │   │   │      │
│                    ││                                    ┃ today               │
│                    ││                                                           │
│                    ││  Legend: ▓▓ in progress  ░░ scheduled  ██ done            │
│                    ││          ╲  dependency                                    │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

---

## Screen 8: Graph View (Dependency Network)

Network visualization of items and their relationships. Items as nodes,
dependencies as directed edges. Uses @xyflow/react.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: GRAPH ────────────────────────────────────────────┐
│                    ││                                                           │
│ Layout             ││         ┌──────────┐                                     │
│  ● Hierarchical    ││         │ CMT-0010  │  (parent)                           │
│  ○ Force-directed  ││         │ Epic     │                                     │
│  ○ Radial          ││         └────┬─────┘                                     │
│                    ││              │                                            │
│ Show               ││    ┌────────┼────────┐                                   │
│  ☑ Parent/child    ││    │        │        │                                   │
│  ☑ Dependencies    ││    ▼        ▼        ▼                                   │
│  ☐ Related         ││ ┌────────┐┌────────┐┌────────┐                          │
│                    ││ │CMT-0039 ││CMT-0040 ││CMT-0048 │                          │
│ Depth              ││ │ ██done ││ ██done ││ ░ready │                          │
│  [2 ▾]             ││ └───┬────┘└───┬────┘└────────┘                          │
│                    ││     │         │                                          │
│ Filter             ││     └────┬────┘                                          │
│  [status ▾]        ││          │  depends_on                                   │
│                    ││          ▼                                                │
│                    ││     ┌─────────┐                                           │
│                    ││     │ CMT-0045 │                                           │
│                    ││     │ ▓▓active│  ◄── selected (highlighted)              │
│                    ││     └────┬────┘                                           │
│                    ││          │  blocks                                        │
│                    ││          ▼                                                │
│                    ││     ┌─────────┐                                           │
│                    ││     │ CMT-0046 │                                           │
│                    ││     │ ⚠blocked│                                           │
│                    ││     └─────────┘                                           │
│                    ││                                                           │
│                    ││  Click node → side panel. Drag to rearrange.             │
│                    ││  Scroll to zoom. Double-click → full tab.                │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

---

## Screen 9: Create Item Drawer

Triggered by [+ New] button or `C` keyboard shortcut. Slides in from the right
(400px), same position as the item detail panel. The main content stays visible
and interactive — you can reference existing items, check the board, or use the
sidebar while creating.

```
                                           ┌─ CREATE DRAWER (400px) ───────┐
                                           │ Create Work Item         [✕]  │
 ┌─ MAIN (remains interactive) ─────────┐  │                               │
 │                                      │  │ Title *                       │
 │  Board / List view stays usable.     │  │ ┌───────────────────────────┐ │
 │  You can:                            │  │ │ Fix API timeout on bulk   │ │
 │  - Click items to reference IDs      │  │ │ operations                │ │
 │  - Check existing statuses           │  │ └───────────────────────────┘ │
 │  - Use sidebar filters               │  │                               │
 │                                      │  │ Type       [task         ▾]  │
 │  This is why drawers beat modals:    │  │ Priority   [high         ▾]  │
 │  context is preserved.               │  │ Status     [inbox        ▾]  │
 │                                      │  │                               │
 │                                      │  │ Assignee   [—            ▾]  │
 │                                      │  │ Due date   [YYYY-MM-DD  📅]  │
 │                                      │  │                               │
 │                                      │  │ Parent     [Search items..▾] │
 │                                      │  │ Depends on [Search items..▾] │
 │                                      │  │            (multi-select)     │
 │                                      │  │ Tags       [type to add.. ]  │
 │                                      │  │            [api ×][backend ×]│
 │                                      │  │                               │
 │                                      │  │ ── Description (optional) ── │
 │                                      │  │ ┌───────────────────────────┐ │
 │                                      │  │ │                           │ │
 │                                      │  │ │                           │ │
 │                                      │  │ │                           │ │
 │                                      │  │ └───────────────────────────┘ │
 │                                      │  │                               │
 │                                      │  │        [Cancel] [Create ▸]   │
 └──────────────────────────────────────┘  │        creates CMT-0055       │
                                           └───────────────────────────────┘
```

The create drawer shares the same 400px right-panel slot as the item detail
panel. If the detail panel is open, creating a new item replaces it (with a
"back to CMT-0045" breadcrumb). After creation, the drawer can either close
(returning to the board/list) or transition into the detail panel for the
newly created item.

Quick-create variant: pressing `C` with a board column focused pre-fills
the status to that column's state (e.g. `C` while hovering the "ready" column
creates with status "ready" instead of "inbox").

---

## Screen 10: Command Palette

Cmd+K overlay. Fuzzy search across items, commands, and views.
Three modes: default (search everything), `>` prefix (commands only),
`#` prefix (tags/filters only).

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔍  CMT-004                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ── Items ──────────────────────────────────────────────────    │
│  ▸ CMT-0045  Refactor storage layer           active  ● high    │
│    CMT-0048  Add authentication               ready   ● crit    │
│    CMT-0046  Index performance                active  ● high    │
│    CMT-0049  Full-text search                 ready   ● med     │
│    CMT-0040  Dependency resolution            done    ● med     │
│    CMT-0041  Fix serialization bug            done    ● high    │
│    CMT-0042  Add validation tests             done    ● med     │
│    CMT-0043  Update error messages            done    ● low     │
│                                                                 │
│  ── Actions ────────────────────────────────────────────────    │
│    ▸ Create new item                                    C       │
│    ▸ Switch to Board                                   ⌘1      │
│    ▸ Switch to List                                    ⌘2      │
│    ▸ Validate project (cmt check)                              │
│    ▸ Rebuild index (cmt reindex)                               │
│                                                                 │
│  ── Saved Views ────────────────────────────────────────────    │
│    ▸ My items                                                   │
│    ▸ Sprint W08                                                 │
│    ▸ Backend team                                               │
│                                                                 │
│  Hint: Type > for commands, # for tags                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Screen 11: Confirmation Inline / Popover

Destructive actions use inline confirmation or popovers anchored to the
trigger button — never full-screen modals. Context is always preserved.

**Single item delete** (popover anchored to delete button):

```
                                   ┌───────────────────────────────┐
                                   │  Delete CMT-0045?              │
  [...other content stays          │                               │
   visible and interactive...]     │  "Refactor storage layer"     │
                                   │                               │
                                   │  Removes .cmt/items/CMT-0045.md│
                                   │  This cannot be undone.       │
                                   │                               │
                                   │     [Cancel]  [Delete]        │
                                   └──────────┬────────────────────┘
                                              │ anchored to
                                         [Delete] button
```

**Bulk delete (>5 items)** — inline bar replaces the bulk actions bar:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠ Delete 8 items? Type "delete 8" to confirm:                     │
│  ┌──────────────┐                                                  │
│  │              │  [Cancel]  [Delete 8 items]                      │
│  └──────────────┘            (disabled until typed)                │
└─────────────────────────────────────────────────────────────────────┘
```

**Archive** — no confirmation needed (reversible). Toast with undo instead.

---

## Screen 12: Toast Notifications

Bottom-right stack. Auto-dismiss after 5 seconds. Click to dismiss early.

```
                                          ┌────────────────────────────────┐
                                          │ ✅ CMT-0055 created       [✕]  │
                                          │    Fix API timeout             │
                                          │    [Open ▸]                    │
                                          └────────────────────────────────┘
                                          ┌────────────────────────────────┐
                                          │ ✅ CMT-0045: active → done [✕] │
                                          │    [Undo] (5s)                 │
                                          └────────────────────────────────┘

Error toast:
                                          ┌────────────────────────────────┐
                                          │ ❌ Cannot transition      [✕]  │
                                          │    blocked → done is not       │
                                          │    a valid transition          │
                                          └────────────────────────────────┘
```

---

## Screen 13: Settings

Configuration view matching the layered config system.

```
┌─ SIDEBAR ──────────┐┌─ MAIN: SETTINGS ─────────────────────────────────────────┐
│                    ││                                                           │
│ ▾ Project          ││  Project Settings                                        │
│ ▸ State Machine    ││                                                           │
│ ▸ Defaults         ││  ┌─ PROJECT ──────────────────────────────────────────┐   │
│ ▸ Tags             ││  │  Name      [my-project          ]                 │   │
│ ▸ Git              ││  │  Prefix    [WM                  ]                 │   │
│ ▸ Archive          ││  │  Desc      [Work management tool ]                │   │
│                    ││  └────────────────────────────────────────────────────┘   │
│ ▾ Display          ││                                                           │
│ ▸ Theme            ││  ┌─ STATE MACHINE ────────────────────────────────────┐   │
│ ▸ Columns          ││  │                                                   │   │
│ ▸ Density          ││  │  default:                                         │   │
│                    ││  │  ┌──────┐    ┌───────┐    ┌────────┐    ┌──────┐ │   │
│ ▾ Integrations     ││  │  │inbox │───▸│ ready │───▸│ active │───▸│ done │ │   │
│   Claude Code ✓    ││  │  └──────┘    └───────┘    └───┬────┘    └──────┘ │   │
│                    ││  │                               │                   │   │
│                    ││  │                          ┌────▼─────┐             │   │
│                    ││  │                          │ blocked  │             │   │
│                    ││  │                          └──────────┘             │   │
│                    ││  │                                                   │   │
│                    ││  │  [Edit YAML]  [Reset to default]                  │   │
│                    ││  └───────────────────────────────────────────────────┘   │
│                    ││                                                           │
│                    ││  ┌─ DEFAULTS ──────────────────────────────────────────┐  │
│                    ││  │  Priority   [none ▾]     Type   [task ▾]          │  │
│                    ││  │  Status     [inbox ▾]                              │  │
│                    ││  └────────────────────────────────────────────────────┘  │
│                    ││                                                           │
│                    ││  Config source: .cmt/config.yml  [Open in editor]       │
└────────────────────┘└───────────────────────────────────────────────────────────┘
```

---

## Screen 14: Terminal (Embedded CLI)

Power user feature. Embedded terminal running `cmt` commands directly.
Changes propagate to UI via WebSocket file watcher.

```
┌─ MAIN: TERMINAL ────────────────────────────────────────────────────────────┐
│                                                                             │
│  CatchMyTask Terminal                                    [Clear] [↗ Pop]  │
│                                                                             │
│  $ cmt list -s active --json                                               │
│  [                                                                          │
│    {"id": "CMT-0045", "title": "Refactor storage layer", ...},              │
│    {"id": "CMT-0046", "title": "Index performance", ...},                   │
│    ...                                                                      │
│  ]                                                                          │
│                                                                             │
│  $ cmt status CMT-0045 blocked --actor alice                               │
│  Status changed: active → blocked                                          │
│                                                                             │
│  $ cmt add "Review agent output for CMT-0041" -p high --tag review         │
│  Created CMT-0055: Review agent output for CMT-0041                          │
│                                                                             │
│  $ █                                                                        │
│                                                                             │
│  Changes made here appear in the UI automatically via file watcher.        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 15: Validation Diagnostics (Bottom Panel)

Triggered by `cmt check` or when errors are detected. Slides up from bottom
like VS Code's Problems panel. Can coexist with main content.

```
┌─ MAIN CONTENT (reduced height) ────────────────────────────────────────────┐
│                                                                            │
│  (Board / List / etc. still visible above)                                 │
│                                                                            │
├─ DIAGNOSTICS ──────────────────────────────────────────────────────────────┤
│  Problems (3)                                                   [─] [✕]   │
│                                                                            │
│  ⚠ CMT-0045  Missing due date (recommended for active items)         [▸]   │
│  ❌ CMT-0047  blocked_reason is required when status is "blocked"     [▸]  │
│  ⚠ CMT-0052  No assignee (recommended before leaving inbox)          [▸]   │
│                                                                            │
│  Run: cmt check --fix to auto-fix where possible                          │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `C` | Create new item |
| `⌘1` | Switch to Board view |
| `⌘2` | Switch to List view |
| `⌘3` | Switch to Timeline view |
| `⌘4` | Switch to Graph view |
| `⌘B` | Toggle sidebar |
| `` ⌘` `` | Toggle terminal |
| `↑↓` | Navigate items in list/board |
| `Enter` | Open selected item (side panel) |
| `⌘Enter` | Open selected item (full tab) |
| `Esc` | Close panel/modal/palette |
| `S` | Change status (when item focused) |
| `P` | Change priority (when item focused) |
| `A` | Change assignee (when item focused) |
| `D` | Mark done (when item focused) |
| `F` | Add to Focus (when item focused) |
| `⌘⌫` | Delete (with confirmation) |
| `?` | Show keyboard shortcuts overlay |

Single-key shortcuts (S, P, A, D, F, C) are only active when no text input is
focused. They are disabled inside the command palette, search bar, and edit fields.

---

## Responsive Breakpoints

### Mobile (<768px)

Optimized for triage: quick status checks, status transitions, item creation.

```
┌──────────────────────┐
│  ☰  CatchMyTask  [+]│  ← Compact header (hamburger, brand, create)
├──────────────────────┤
│                      │
│  ┌──────────────────┐│
│  │ CMT-0052 Fix API  ││  ← Card-based list (not table)
│  │ ● high   inbox   ││
│  │ 🏷 api           ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ CMT-0045 Refactor ││
│  │ ● med   active   ││
│  │ 🤖 claude-agent  ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ CMT-0048 Add auth ││
│  │ ● crit  ready    ││
│  │ 👤 alice         ││
│  └──────────────────┘│
│  ...                 │
│                      │
├──────────────────────┤
│ ▦  ≡  ▣  ↕  ⚙     │  ← Bottom nav (board, list, dashboard, activity, settings)
└──────────────────────┘
     44px tap targets
     Safe area padding
```

Mobile board: horizontal swipeable columns (one column visible at a time,
swipe left/right to switch between inbox → ready → active → etc.)

Mobile item detail: full-screen slide-up sheet replacing content.

### Tablet (768-1024px)

```
┌──────────────────────────────┐
│  HEADER                      │
├──────┬───────────────────────┤
│ RAIL │  MAIN CONTENT         │
│ 48px │  (sidebar hidden,     │
│      │   overlay on demand)  │
│      │                       │
└──────┴───────────────────────┘
```

### Desktop (>1024px)

Full layout as shown in all mockups above.

---

## Color Tokens (Extending Existing System)

```css
/* Surface layers (light default, dark via .dark class) */
:root {
  --surface-0: hsl(0, 0%, 100%);     /* page background */
  --surface-1: hsl(0, 0%, 97%);      /* cards, panels */
  --surface-2: hsl(0, 0%, 94%);      /* hover state */
  --surface-3: hsl(0, 0%, 90%);      /* active state */
  --text-primary: hsl(0, 0%, 10%);
  --text-secondary: hsl(0, 0%, 35%);
  --text-muted: hsl(0, 0%, 55%);
  --border-default: hsl(0, 0%, 85%);
  --border-subtle: hsl(0, 0%, 90%);
}
.dark {
  --surface-0: hsl(0, 0%, 6%);
  --surface-1: hsl(0, 0%, 9%);
  --surface-2: hsl(0, 0%, 12%);
  --surface-3: hsl(0, 0%, 16%);
  --text-primary: hsl(0, 0%, 95%);
  --text-secondary: hsl(0, 0%, 70%);
  --text-muted: hsl(0, 0%, 45%);
  --border-default: hsl(0, 0%, 18%);
  --border-subtle: hsl(0, 0%, 14%);
}

/* Status colors (mapped to state machine) */
--status-inbox:     hsl(210, 40%, 50%);   /* muted blue */
--status-ready:     hsl(45, 80%, 50%);    /* amber */
--status-active:    hsl(210, 100%, 50%);  /* bright blue */
--status-blocked:   hsl(0, 70%, 55%);     /* red */
--status-done:      hsl(140, 60%, 45%);   /* green */
--status-cancelled: hsl(0, 0%, 50%);      /* gray */

/* Priority colors */
--priority-critical: hsl(0, 85%, 55%);    /* red */
--priority-high:     hsl(25, 90%, 55%);   /* orange */
--priority-medium:   hsl(45, 80%, 50%);   /* amber */
--priority-low:      hsl(210, 40%, 55%);  /* blue-gray */
--priority-none:     hsl(0, 0%, 55%);     /* gray */

/* Actor colors */
--actor-human:  hsl(210, 60%, 55%);       /* blue */
--actor-agent:  hsl(270, 60%, 55%);       /* purple */
--actor-system: hsl(0, 0%, 55%);          /* gray */

/* Tag namespace colors (extensible) */
--tag-team:     hsl(210, 60%, 55%);       /* blue */
--tag-sprint:   hsl(140, 50%, 45%);       /* green */
--tag-domain:   hsl(270, 50%, 55%);       /* purple */
--tag-priority: hsl(25, 80%, 55%);        /* orange */
--tag-default:  hsl(0, 0%, 45%);          /* gray */
```

Note: All colors must meet WCAG AA contrast (4.5:1 text, 3:1 UI elements)
in both light and dark modes. Status and priority always pair color with
text label — color is never the sole indicator.

---

## Context Menu (Right-Click on Item)

```
┌─────────────────────────────┐
│ Open in side panel    Enter │
│ Open in new tab    ⌘Enter  │
│ ────────────────────────── │
│ Set status          ▸      │
│ Set priority        ▸      │
│ Assign to           ▸      │
│ ────────────────────────── │
│ Add to Focus          F    │
│ Add tag...                 │
│ ────────────────────────── │
│ Copy ID            ⌘C     │
│ Copy link                  │
│ ────────────────────────── │
│ Archive                    │
│ Delete             ⌘⌫     │
└─────────────────────────────┘
```

---

## Component Library (Key Components to Build)

### Atoms
- `StatusBadge` — colored dot + text label for status
- `PriorityIndicator` — colored dot + letter (C/H/M/L/N) for priority
- `ActorBadge` — 👤/🤖 icon + name with color
- `TagPill` — namespace-colored removable pill
- `ItemId` — monospace ID with click-to-navigate
- `TimeAgo` — relative timestamp ("2h ago")
- `ProgressBar` — child completion indicator (2/3 done)
- `Toast` — success/error/info notification

### Molecules
- `ItemCard` — board card with all metadata and states
- `ItemRow` — table row with configurable columns and inline edit
- `EventEntry` — activity feed entry with actor + action + item link
- `FilterChip` — removable filter indicator
- `MetadataField` — label + value with inline edit (dropdown, date, text)
- `ConfirmDialog` — destructive action confirmation with optional type-to-confirm
- `EmptyState` — icon + message + CTA for empty views

### Organisms
- `BoardColumn` — status column with cards, drop target, collapse toggle
- `ItemTable` — virtual-scrolled table with sort/filter/column config
- `ItemDetailPanel` — slide-over with full item view
- `ItemDetailTab` — full tab with editor + log + relationships
- `EventFeed` — filtered chronological event stream
- `StatsBar` — horizontal metric summary with clickable counts
- `CommandPalette` — fuzzy search overlay with modes
- `DiagnosticsPanel` — bottom panel for validation errors
- `FocusList` — sidebar section for pinned working set

### Templates
- `BoardView` — columns layout with drag-drop
- `ListView` — toolbar + table + bulk actions
- `TimelineView` — Gantt chart with dependencies
- `GraphView` — network visualization with @xyflow/react
- `DashboardView` — metric cards, charts, agent summary
- `ActivityView` — event feed with filters
- `SettingsView` — config editing with state machine visualization
- `TerminalView` — embedded CLI (xterm.js or similar)

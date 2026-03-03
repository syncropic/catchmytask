---
spec: "03"
title: CLI Interface
status: draft
version: 0.1.0
created: 2026-02-23
depends_on: ["01", "02", "04"]
---

# Spec 03: CLI Interface

## 1. Overview

The `cmt` command is the primary interface for catchmytask. It is a single, statically-linked
Rust binary that operates on the `.cmt/` directory structure defined in Spec 04. Every operation
that humans, agents, or scripts perform on work items flows through `cmt` or through direct file
manipulation (both are first-class; the CLI is the convenient, validated path).

### Design Principles

- **Unix composability**: Every command produces structured output that can be piped, parsed, or
  redirected. Exit codes are meaningful. `--json` enables machine consumption. Stderr is used for
  diagnostics; stdout is used for data.
- **Progressive disclosure**: A solo developer needs only `cmt add`, `cmt list`, and `cmt done`.
  Power features (custom types, tags, complex items, search) are available but never required.
- **Actor-agnostic**: The same CLI works for humans typing in a terminal and for AI agents
  invoking commands programmatically. The `--json` flag and structured exit codes bridge the
  gap between human-readable and machine-readable.
- **Fast**: Rust binary with no runtime dependencies. SQLite index for sub-millisecond queries.
  No JVM startup, no Python interpreter, no Node.js. Cold start under 10ms on modern hardware.

### References

- Research: `docs/research/06-first-principles.md` Section IX (Progressive Disclosure)
- Research: `docs/research/01-task-platform-analysis.md` Section 5 (CLI Interface)
- Research: `docs/research/00-synthesis.md` Section "7. CLI as Primary Interface"
- Design principles: Progressive Capability, Actor Agnosticism, Files as Foundation

---

## 2. Global Options

All global options apply to every subcommand and must appear between `cmt` and the subcommand name.

### Invocation Syntax

```
work [global-options] <command> [command-options] [args]
```

### Global Option Table

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--dir <path>` | | `PathBuf` | Search upward from cwd | Path to the `.cmt/` directory. Overrides `CMT_DIR` and directory discovery. |
| `--json` | `-j` | `bool` | `false` | Output as JSON. All commands produce a JSON object or array on stdout. Human-readable formatting is suppressed. |
| `--quiet` | `-q` | `bool` | `false` | Suppress non-essential output (progress messages, hints, tips). Errors and warnings still go to stderr. |
| `--verbose` | `-v` | `bool` | `false` | Show debug and trace information on stderr. Useful for troubleshooting config resolution, index behavior, and transition validation. |
| `--no-color` | | `bool` | `false` | Disable colored output. Also activated when the `NO_COLOR` environment variable is set (any value) or when stdout is not a TTY. |
| `--actor <name>` | | `String` | From `CMT_ACTOR` env, or system username | Actor identifier for event logging. Agents should set this to self-identify in the audit trail. |
| `--version` | `-V` | `bool` | | Print version string (`cmt 0.1.0`) and exit with code 0. |
| `--help` | `-h` | `bool` | | Print help text and exit with code 0. Available on every subcommand as well. |

### Mutual Exclusivity

- `--quiet` and `--verbose` are mutually exclusive. Specifying both is an argument error (exit code 2).
- `--json` implies `--no-color` (JSON output is never colorized).

### Stderr vs Stdout Convention

- **Stdout**: Data output only. Work item content, list results, JSON output. This is what you pipe.
- **Stderr**: Diagnostics. Errors, warnings, progress messages, hints. This is what you read.

When `--json` is active, stderr receives plain-text diagnostics and stdout receives the JSON payload.
When `--quiet` is active, stderr is silent except for errors and warnings.

---

## 3. Core Commands

### 3.1 `cmt init` -- Initialize a New Project

Creates the `.cmt/` directory structure and a minimal `config.yml`.

#### Syntax

```
work init [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--prefix <PREFIX>` | `-p` | `String` | `"CMT"` | Default ID prefix. Must match `^[A-Z][A-Z0-9]{0,7}$`. |
| `--name <NAME>` | `-n` | `String` | Parent directory name | Human-readable project name. |
| `--force` | | `bool` | `false` | Reinitialize if `.cmt/` already exists. Preserves `items/` and `archive/` contents. |

#### Behavior

1. Check if `.cmt/` exists in the current directory.
   - If it exists and `--force` is not set: print error to stderr and exit with code 1.
   - If it exists and `--force` is set: preserve `items/`, `archive/`, and their contents.
     Recreate missing subdirectories. Overwrite `config.yml` only if `--name` or `--prefix` is
     explicitly provided; otherwise preserve the existing config.
2. Create the directory structure:
   ```
   .cmt/
     config.yml
     items/
     archive/
     templates/
     .gitignore        # Contains: .index.db, .index.db-wal, .index.db-shm
   ```
3. Write `config.yml` with the `version` and `project` section (see Spec 04 Section 5.1).
4. Print confirmation to stderr: `Initialized catchmytask in .cmt/ with prefix {PREFIX}`

#### Output

- **Default**: Confirmation message to stderr.
- **`--json`**: JSON object with the created configuration:
  ```json
  {
    "work_dir": "/absolute/path/to/.cmt",
    "prefix": "CMT",
    "name": "my-project"
  }
  ```

---

### 3.2 `cmt add <title>` -- Create a New Work Item

Creates a new work item file in `.cmt/items/`, assigns an auto-incremented ID, and writes
the YAML frontmatter and optional body.

#### Syntax

```
work add <title> [options]
```

The `<title>` argument is required and positional. It is the work item title (max 200 characters,
per Spec 01 Section 3).

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--type <type>` | `-t` | `String` | From `defaults.type` in config | Work item type. Determines which state machine applies and which ID prefix to use. |
| `--priority <priority>` | `-p` | `String` | From `defaults.priority` in config | Priority level: `critical`, `high`, `medium`, `low`, `none`. |
| `--assignee <actor>` | `-a` | `String` | From `defaults.assignee` in config | Assignee identifier. Repeatable for multiple assignees: `-a alice -a bob`. |
| `--parent <ID>` | | `String` | None | Parent work item ID. Must be a valid ID format (not checked for existence). |
| `--depends-on <ID>` | `-d` | `String` | None | Dependency. Repeatable: `-d CMT-1 -d CMT-2`. |
| `--tag <tag>` | | `String` | None | Tag in `namespace:value` format. Repeatable: `--tag team:backend --tag sprint:2026-w09`. |
| `--due <date>` | | `String` | None | Due date in `YYYY-MM-DD` format. |
| `--status <status>` | `-s` | `String` | From `defaults.status` in config | Initial status. Must be an initial state in the applicable state machine. |
| `--complex` | | `bool` | `false` | Create as a complex item (folder with subdirectories). |
| `--edit` | `-e` | `bool` | `false` | Open the created file in `$EDITOR` / `$VISUAL` after creation. |
| `--template <name>` | | `String` | None | Apply a template from `.cmt/templates/{name}.md`. |
| `--body <text>` | `-b` | `String` | None | Markdown body content. If omitted and no template, body is empty. |

#### Behavior

1. Load configuration (Spec 04 Section 4 resolution order).
2. Resolve the ID prefix:
   a. If `--type` is given and `id.prefixes` has a mapping for that type, use the type-specific prefix.
   b. Otherwise, use `project.prefix` from config.
3. Auto-increment the ID number:
   a. Query the SQLite index `id_counters` table for the next number for this prefix.
   b. If no counter exists, scan all files in `items/` and `archive/` for the highest existing
      number with this prefix, then initialize the counter.
   c. Format as `PREFIX-NUMBER` (number stored without leading zeros in the file; display uses
      `id.pad_width` for zero-padding).
4. Validate the initial status against the applicable state machine (Spec 02 Section 5). The
   status must be an initial state. If it is not, emit an error and exit with code 5.
5. If `--template` is specified, read `.cmt/templates/{name}.md` and merge its frontmatter
   defaults (template values are overridden by explicit CLI flags).
6. Construct the `WorkItem` struct with all provided and default fields. Set `created_at` to `now()`.
   Set `updated_at` to `now()`.
7. Write the file:
   - Simple item: `.cmt/items/{ID}.md`
   - Complex item: `.cmt/items/{ID}/item.md` with `evidence/`, `queries/`, `handover/` subdirectories.
8. Update the SQLite index with the new item.
9. If `git.auto_commit` is true, commit the new file with message `{commit_prefix}: add {ID} - {title}`.
10. If `--edit` is specified, open the file in `$EDITOR` (fall back to `$VISUAL`, then `vi`).
11. Print the created ID to stdout. With `--json`, print the full item as JSON.

#### Output

- **Default**: The created ID printed to stdout: `CMT-0042`
- **`--json`**: Full work item as JSON:
  ```json
  {
    "id": "CMT-0042",
    "title": "Implement user authentication",
    "status": "inbox",
    "created_at": "2026-02-23T10:30:00Z",
    "type": "task",
    "priority": "none",
    "file_path": ".cmt/items/CMT-0042.md"
  }
  ```

---

### 3.3 `cmt list` -- List Work Items

List work items with filtering, sorting, and format options.

**Alias**: `cmt ls`

#### Syntax

```
work list [options]
```

#### Filter Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--status <status>` | `-s` | `String` | None (show non-terminal) | Filter by status. Comma-separated for multiple: `-s active,blocked`. Special value `all` shows all statuses. |
| `--type <type>` | `-t` | `String` | None | Filter by work item type. |
| `--priority <priority>` | `-p` | `String` | None | Filter by minimum priority. `--priority medium` shows medium, high, and critical. |
| `--assignee <actor>` | `-a` | `String` | None | Filter by assignee. Use `none` for unassigned items, `any` for items with any assignee. |
| `--tag <tag>` | | `String` | None | Filter by tag. Repeatable. Glob patterns supported: `--tag "team:*"` matches all team tags. Multiple `--tag` flags use AND logic. |
| `--parent <ID>` | | `String` | None | Show only children of this parent item. |
| `--no-parent` | | `bool` | `false` | Show only root-level items (items with no `parent` field). |
| `--overdue` | | `bool` | `false` | Show only items past their `due` date. |
| `--due-before <date>` | | `String` | None | Show only items with `due` date before the given date (YYYY-MM-DD). |
| `--blocked` | | `bool` | `false` | Show only items that depend on incomplete (non-terminal) items. |
| `--tag-ns <namespace>` | | `String` | None | Filter by tag namespace (e.g., `--tag-ns team` shows items with any `team:*` tag). |
| `--id <ID>` | | `String` | None | Filter by ID prefix match. `--id WM` shows all CMT-prefixed items. `--id BUG-00` shows BUG-001 through BUG-009. |

#### Sort Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--sort <field>` | | `String` | `priority` | Sort field: `priority`, `created_at`, `due`, `status`, `title`, `updated_at`, `id`. |
| `--reverse` | `-r` | `bool` | `false` | Reverse sort order. Default sort is descending for priority, ascending for everything else. |

#### Display Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--format <fmt>` | `-f` | `String` | `table` | Output format: `table`, `simple`, `json`, `csv`. |
| `--fields <f,...>` | | `String` | `id,title,status,priority` | Comma-separated column list: `id`, `title`, `status`, `priority`, `assignee`, `tags`, `due`, `created_at`, `updated_at`, `type`, `parent`. |
| `--all` | `-A` | `bool` | `false` | Include archived items in results. |
| `--limit <n>` | `-l` | `u32` | None (all results) | Maximum number of items to display. |

#### Default Filtering Behavior

When invoked with no filter flags, `cmt list` shows all items in non-terminal states (i.e.,
excludes `done` and `cancelled`). This default is intentional: the most common use case is
"what do I need to work on?" not "show me everything ever." To see all items including
completed ones, use `--status all` or `--all` (which includes archived).

#### Behavior

1. Load configuration and resolve state machines.
2. Query the SQLite index with the specified filters. If no index exists, build it first from
   files (transparent to the user, but may be slower on first run).
3. Apply sorting.
4. Apply `--limit` truncation.
5. Format output according to `--format`.

#### Output

- **`table`** (default): Rich terminal output with aligned columns, color-coded status and
  priority, and field truncation to fit terminal width. Example:
  ```
  ID        STATUS   PRI    TITLE                          ASSIGNEE
  CMT-0042   active   high   Implement user authentication  alice
  CMT-0041   blocked  med    Design database schema         bob
  CMT-0040   ready    low    Update documentation           --

  3 items
  ```
- **`simple`**: One line per item, tab-separated: `ID\tSTATUS\tTITLE`. Suitable for piping
  to `awk`, `cut`, or `grep`.
  ```
  CMT-0042	active	Implement user authentication
  CMT-0041	blocked	Design database schema
  CMT-0040	ready	Update documentation
  ```
- **`json`**: JSON array of objects with all fields (same as `--json` global flag applied to list):
  ```json
  [
    {
      "id": "CMT-0042",
      "title": "Implement user authentication",
      "status": "active",
      "priority": "high",
      "assignee": "alice",
      "created_at": "2026-02-23T10:30:00Z",
      "type": "task",
      "tags": ["team:backend", "sprint:2026-w09"]
    }
  ]
  ```
- **`csv`**: CSV with a header row. All fields from `--fields` are included. Values containing
  commas or newlines are quoted per RFC 4180.
  ```
  id,title,status,priority
  CMT-0042,Implement user authentication,active,high
  CMT-0041,Design database schema,blocked,medium
  CMT-0040,Update documentation,ready,low
  ```

#### Footer

In `table` format, a summary line is printed to stderr: `3 items` (or `3 items (42 total,
39 filtered out)` when filters are active). Other formats do not print the footer.

---

### 3.4 `cmt show <ID>` -- Display a Single Work Item

Displays the full content of a work item, including metadata and body.

#### Syntax

```
work show <ID> [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--no-body` | | `bool` | `false` | Show only the metadata table, suppress the body. Body is shown by default. |
| `--raw` | | `bool` | `false` | Print the raw file contents (frontmatter + body) without formatting. |
| `--children` | | `bool` | `false` | Also list child items (items where `parent` equals this ID). |

#### Behavior

1. Resolve the ID to a file path using the detection order from Spec 01 Section 6:
   `.cmt/items/{ID}.md` -> `.cmt/items/{ID}/item.md` -> `.cmt/archive/{ID}.md` ->
   `.cmt/archive/{ID}/item.md`.
2. If not found, print error and exit with code 3.
3. Parse the work item file.
4. Display formatted output.

#### Output

- **Default**: Metadata table followed by body:
  ```
  ╭─ CMT-0042 ────────────────────────────────────────╮
  │  Title:     Implement user authentication         │
  │  Status:    active                                │
  │  Priority:  high                                  │
  │  Type:      task                                  │
  │  Assignee:  alice                                 │
  │  Created:   2026-02-23 10:30 UTC                  │
  │  Due:       2026-03-01                            │
  │  Tags:      team:backend, sprint:2026-w09         │
  │  Parent:    CMT-0010                               │
  │  Depends:   CMT-0039, CMT-0040                      │
  │  File:      .cmt/items/CMT-0042.md                │
  ╰───────────────────────────────────────────────────╯

  ## Description

  Implement JWT-based authentication for the API.

  ## Acceptance Criteria

  - [ ] Users can log in with email and password  [0/3]
  - [ ] Tokens expire after 24 hours
  - [x] Database schema updated
  ```
  When `--children` is specified, a "Children" section appears after the metadata showing child
  items in a compact table (ID, status, title).
- **`--no-body`**: Only the metadata table, no body content.
- **`--raw`**: The raw file content, exactly as stored on disk, printed to stdout. Useful for
  piping: `cmt show CMT-42 --raw | pbcopy`.
- **`--json`**: Full work item as JSON including body:
  ```json
  {
    "id": "CMT-0042",
    "title": "Implement user authentication",
    "status": "active",
    "priority": "high",
    "type": "task",
    "assignee": "alice",
    "created_at": "2026-02-23T10:30:00Z",
    "due": "2026-03-01",
    "tags": ["team:backend", "sprint:2026-w09"],
    "parent": "CMT-0010",
    "depends_on": ["CMT-0039", "CMT-0040"],
    "body": "## Description\n\nImplement JWT-based authentication...",
    "file_path": ".cmt/items/CMT-0042.md",
    "checklist": { "total": 3, "checked": 1 }
  }
  ```

---

### 3.5 `cmt edit <ID>` -- Edit a Work Item

Edit a work item either interactively (open in `$EDITOR`) or programmatically (set fields from
the command line).

#### Syntax

```
work edit <ID> [options]
```

When invoked with no options other than the ID, the work item file is opened in `$EDITOR`.

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--set <key=value>` | | `String` | None | Set a frontmatter field. Repeatable: `--set priority=high --set assignee=alice`. |
| `--add-tag <tag>` | | `String` | None | Add a tag. Repeatable. If the tag already exists, no change. |
| `--remove-tag <tag>` | | `String` | None | Remove a tag. Repeatable. If the tag does not exist, no change. |
| `--add-dep <ID>` | | `String` | None | Add a dependency to `depends_on`. Repeatable. |
| `--remove-dep <ID>` | | `String` | None | Remove a dependency from `depends_on`. Repeatable. |
| `--complex` | | `bool` | `false` | Convert a simple item to a complex item (create folder, move file). |
| `--body <text>` | `-b` | `String` | None | Replace the entire Markdown body. |
| `--append <text>` | | `String` | None | Append text to the Markdown body. |

#### Behavior -- Interactive Mode

When `cmt edit <ID>` is called with no `--set`, `--add-tag`, `--remove-tag`, `--add-dep`,
`--remove-dep`, `--body`, `--append`, or `--complex` options:

1. Resolve the ID to a file path.
2. Open the file in `$EDITOR` (falling back to `$VISUAL`, then `vi`).
3. After the editor exits, re-parse the file and validate:
   - Check YAML frontmatter for parse errors.
   - Validate required fields (id, title, status, created_at).
   - If `status` changed, validate the transition against the state machine.
4. If validation passes, update the SQLite index and set `updated_at` to `now()`.
5. If validation fails, print errors and offer to re-open the editor (interactive only).

#### Behavior -- Programmatic Mode

When any `--set`, `--add-tag`, `--remove-tag`, `--add-dep`, `--remove-dep`, `--body`,
`--append`, or `--complex` option is provided:

1. Resolve the ID to a file path.
2. Parse the work item file.
3. Apply modifications in order:
   a. `--set` modifications are applied to the YAML frontmatter. The key is the field name, the
      value is the new value. Nested keys are not supported in Phase 1 (use `--set` only for
      top-level frontmatter fields). Setting a value to the empty string removes the field.
   b. `--add-tag` and `--remove-tag` modify the `tags` array.
   c. `--add-dep` and `--remove-dep` modify the `depends_on` array.
   d. `--body` replaces the Markdown body entirely.
   e. `--append` appends to the Markdown body with a preceding newline.
4. If the `status` field was changed via `--set`, validate the transition against the state
   machine and apply timestamp side effects (Spec 02 Section 7). This is equivalent to
   `cmt status <ID> <new-status>`.
5. Set `updated_at` to `now()`.
6. Write the file back (round-trip preserving extension fields per Spec 01 Section 5).
7. Update the SQLite index.
8. If `git.auto_commit` is true, commit with message `{commit_prefix}: edit {ID} - {title}`.

#### Conversion to Complex (`--complex`)

1. Check that the item is currently a simple file (`.cmt/items/{ID}.md`).
2. Create the directory `.cmt/items/{ID}/`.
3. Move the file to `.cmt/items/{ID}/item.md`.
4. Create subdirectories: `evidence/`, `queries/`, `handover/`.
5. Update the SQLite index with the new path.
6. Print confirmation: `Converted {ID} to complex item at .cmt/items/{ID}/`

#### Output

- **Default**: Confirmation message to stderr: `Updated CMT-0042`
- **`--json`**: The updated work item as JSON.

---

### 3.6 `cmt done <ID> [<ID>...]` -- Mark Items as Done

Shorthand for transitioning one or more items to the `done` state.

#### Syntax

```
work done <ID> [<ID>...] [options]
```

Accepts one or more IDs as positional arguments.

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--force` | | `bool` | `false` | Bypass state machine validation (see `cmt status --force`). |

#### Behavior

For each ID:

1. Resolve the ID to a file path.
2. Validate the transition from the current state to `done` using the applicable state machine.
3. If the transition is invalid and `--force` is not set, print error and continue to the next ID.
   The exit code reflects the first error encountered.
4. If valid (or `--force`), apply the transition:
   - Set `status` to `done`.
   - Set `completed_at` to `now()`.
   - Set `updated_at` to `now()`.
   - Clear `blocked_reason` if present.
5. Write the file.
6. Update the SQLite index.
7. If `git.auto_commit` is true, commit all changes in a single commit:
   `{commit_prefix}: done {ID1}, {ID2} - mark items complete`.

#### Output

- **Default**: One line per item to stderr: `CMT-0042: active -> done`
- **`--json`**: JSON array of result objects:
  ```json
  [
    { "id": "CMT-0042", "from": "active", "to": "done", "success": true },
    { "id": "CMT-0043", "from": "inbox", "to": "done", "success": false, "error": "Cannot transition from 'inbox' to 'done'. Valid transitions from 'inbox': ready, cancelled" }
  ]
  ```

---

### 3.7 `cmt status <ID> <new-status>` -- Change Item Status

Transition a work item to a new status, with state machine validation and automatic timestamp
management.

#### Syntax

```
work status <ID> <new-status> [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--reason <text>` | `-r` | `String` | None | Reason for the status change. Required when transitioning to `blocked`. Optional for other transitions. When provided for non-blocked transitions, appended to the body log. |
| `--force` | | `bool` | `false` | Bypass state machine validation. Prints a warning to stderr. Use for data repair only. |

#### Behavior

1. Resolve the ID to a file path. If not found, exit with code 3.
2. Parse the work item.
3. Resolve the applicable state machine (Spec 02 Section 5).
4. Validate the transition (Spec 02 Section 6):
   a. If `--force` is set, skip validation but print warning:
      `warning: Forced transition from '{current}' to '{target}' (bypassed state machine validation)`
   b. If the target state does not exist: exit with code 4.
   c. If no transition exists from current to target: exit with code 4.
5. If transitioning to `blocked` and `--reason` is not provided: exit with code 5:
   `error: --reason is required when transitioning to 'blocked'`
6. Apply timestamp side effects (Spec 02 Section 7):
   - Set `updated_at` to `now()`.
   - If entering a non-initial, non-triage state for the first time: set `started_at`.
   - If entering a terminal state: set `completed_at`.
   - If leaving a terminal state (via `--force`): clear `completed_at`.
   - If entering `blocked`: set `blocked_reason` to the `--reason` value.
   - If leaving `blocked`: clear `blocked_reason`.
7. Write the file.
8. Update the SQLite index.
9. If `git.auto_commit` is true, commit:
   `{commit_prefix}: transition {ID} {current} -> {target}`

#### Output

- **Default**: Transition confirmation to stderr: `CMT-0042: active -> done`
- **`--json`**: Transition result as JSON:
  ```json
  {
    "id": "CMT-0042",
    "from": "active",
    "to": "done",
    "machine": "default",
    "timestamps_set": ["completed_at", "updated_at"]
  }
  ```

---

### 3.8 `cmt archive` -- Archive Completed Items

Move items in terminal states from `.cmt/items/` to `.cmt/archive/`.

#### Syntax

```
work archive [<ID>...] [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--done` | | `bool` | `false` | Archive all items in terminal states (`done`, `cancelled`). |
| `--dry-run` | | `bool` | `false` | Show what would be archived without moving any files. |

#### Behavior

1. Determine which items to archive:
   - If specific `<ID>`s are given, resolve each to a file path. Verify each is in a terminal
     state. If any is not terminal, print error and skip that item.
   - If `--done` is given, query the index for all items in terminal states within `.cmt/items/`.
   - If neither IDs nor `--done` is given, print usage help and exit with code 2.
2. For each item to archive:
   - Move from `.cmt/items/{ID}.md` to `.cmt/archive/{ID}.md` (or directory equivalent).
   - Update the SQLite index with the new path.
3. If `--dry-run`, print the list of items that would be moved but do not move them.
4. If `git.auto_commit` is true, commit all moves in a single commit:
   `{commit_prefix}: archive {count} items`

#### Output

- **Default**: One line per archived item to stderr: `Archived CMT-0042 (done)`
- **`--dry-run`**: Prefix each line with `[dry-run]`: `[dry-run] Would archive CMT-0042 (done)`
- **`--json`**: JSON array of archived items:
  ```json
  [
    { "id": "CMT-0042", "status": "done", "from": ".cmt/items/CMT-0042.md", "to": ".cmt/archive/CMT-0042.md" }
  ]
  ```

---

### 3.9 `cmt search <query>` -- Full-Text Search

Search work item titles, bodies, and metadata using the SQLite FTS5 index.

#### Syntax

```
work search <query> [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--status <status>` | `-s` | `String` | None | Filter results by status. |
| `--type <type>` | `-t` | `String` | None | Filter results by type. |
| `--limit <n>` | `-l` | `u32` | `20` | Maximum number of results. |
| `--format <fmt>` | `-f` | `String` | `table` | Output format: `table`, `simple`, `json`. |
| `--all` | `-A` | `bool` | `false` | Include archived items in search. |

#### Behavior

1. Build the FTS5 query from the search string. The query supports SQLite FTS5 syntax:
   - Simple words: `authentication` (matches any item containing "authentication")
   - Phrases: `"user authentication"` (matches the exact phrase)
   - Boolean: `authentication AND jwt` (both terms must appear)
   - Prefix: `auth*` (matches words starting with "auth")
2. Execute the query against the FTS5 index.
3. Rank results by relevance (FTS5 `rank` function).
4. Apply post-query filters (`--status`, `--type`).
5. Display results with matching snippets highlighted.

#### Output

- **`table`** (default):
  ```
  ID        STATUS   TITLE                              MATCH
  CMT-0042   active   Implement user authentication      ...JWT-based [authentication] for the API...
  CMT-0038   done     Fix authentication bypass           ...[authentication] bypass in admin panel...

  2 results
  ```
- **`simple`**: `ID\tTITLE\tSNIPPET` (tab-separated).
- **`--json`**: JSON array with relevance scores and snippets:
  ```json
  [
    {
      "id": "CMT-0042",
      "title": "Implement user authentication",
      "status": "active",
      "score": 0.95,
      "snippet": "...JWT-based authentication for the API..."
    }
  ]
  ```

---

### 3.10 `cmt reindex` -- Rebuild the SQLite Index

Rebuild the SQLite index from the file system. Used when the index becomes stale or corrupted,
or after manual file edits outside the `cmt` CLI.

#### Syntax

```
work reindex [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--force` | | `bool` | `false` | Drop and recreate the entire database before scanning. Without `--force`, the index is incrementally updated. |

#### Behavior

1. If `--force`: delete `.cmt/.index.db` and recreate it with the schema from Spec 05.
2. Scan all files in `.cmt/items/` and `.cmt/archive/`:
   - Parse each file's YAML frontmatter.
   - Validate the `id` field matches the filename (warn on mismatch).
   - Insert or update the index row.
   - Remove index rows for files that no longer exist on disk.
3. Rebuild FTS5 index content.
4. Rebuild `id_counters` table by scanning all IDs and computing the max number per prefix.
5. Print summary to stderr: `Reindexed 42 items (2 archived) in 15ms`

#### Output

- **Default**: Summary to stderr.
- **`--json`**: JSON object:
  ```json
  {
    "items": 40,
    "archived": 2,
    "errors": 0,
    "warnings": 1,
    "duration_ms": 15
  }
  ```

---

### 3.11 `cmt check` -- Validate Project Integrity

Validate the entire `.cmt/` directory for consistency errors.

#### Syntax

```
work check [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--fix` | | `bool` | `false` | Attempt to fix automatically correctable issues (reindex, fix ID mismatches). |

#### Behavior

1. Load and validate `config.yml` (all rules from Spec 04 Section 9).
2. Scan all work item files and validate each against the schema (all rules from Spec 01 Section 10).
3. For each item, validate the `status` field against the applicable state machine.
4. Check for ID uniqueness across all files.
5. Check for orphaned dependencies (`depends_on` referencing non-existent IDs -- warning only,
   since the referenced item may be in another repo).
6. Check for circular dependencies (A depends on B, B depends on A).
7. Verify the SQLite index is consistent with files on disk.
8. Report all errors and warnings.

#### Output

- **Default**: One line per issue to stderr:
  ```
  error: CMT-0042.md: blocked_reason is required when status is 'blocked'
  warning: CMT-0043.md: tag 'urgent' does not follow namespace:value convention
  warning: CMT-0044.md: depends_on references CMT-9999 which does not exist
  ok: 38 items checked, 1 error, 2 warnings
  ```
- **`--json`**: JSON object:
  ```json
  {
    "items_checked": 41,
    "errors": [
      { "id": "CMT-0042", "file": "CMT-0042.md", "rule": "V-11", "message": "blocked_reason is required when status is 'blocked'" }
    ],
    "warnings": [
      { "id": "CMT-0043", "file": "CMT-0043.md", "rule": "V-08", "message": "tag 'urgent' does not follow namespace:value convention" }
    ]
  }
  ```

---

### 3.12 `cmt delete <ID> [<ID>...]` -- Delete Work Items

Permanently delete one or more work items from `.cmt/items/` or `.cmt/archive/`.

**Alias**: `cmt rm`

#### Syntax

```
work delete <ID> [<ID>...] [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--force` | `-f` | `bool` | `false` | Skip confirmation prompt. Required for non-interactive use (agents). |

#### Behavior

1. For each ID, resolve the file path.
2. If not found, print error to stderr and continue to the next ID.
3. If `--force` is not set and stdin is a TTY, prompt for confirmation:
   `Delete CMT-0042 "Implement user authentication"? [y/N]`
4. Delete the file (or directory for complex items).
5. Remove the item from the SQLite index.
6. If `git.auto_commit` is true, commit:
   `{commit_prefix}: delete {ID1}, {ID2}`

#### Output

- **Default**: One line per item to stderr: `Deleted CMT-0042`
- **`--json`**: JSON array of results:
  ```json
  [
    { "id": "CMT-0042", "deleted": true },
    { "id": "CMT-9999", "deleted": false, "error": "Not found" }
  ]
  ```

#### Safety

This is a destructive, non-recoverable operation (unless git history preserves the files).
The confirmation prompt and `--force` requirement protect against accidental deletion.
Agents must pass `--force` explicitly.

---

### 3.13 `cmt config` -- View and Modify Configuration

View and modify `.cmt/config.yml` settings.

#### Syntax

```
work config show [<section>]
work config set <key> <value>
work config get <key>
```

#### Subcommands

**`cmt config show [<section>]`**: Display the current resolved configuration. If `<section>`
is provided (e.g., `project`, `defaults`, `state_machines`, `git`), show only that section.
Without a section, show the full config with resolved values (including defaults for missing
fields). Unknown keys are annotated as `(unknown -- preserved)`.

**`cmt config get <key>`**: Get a single config value using dot notation (e.g.,
`cmt config get project.prefix` outputs `WM`). Returns the resolved value (CLI > env > config > default).

**`cmt config set <key> <value>`**: Set a single config value using dot notation (e.g.,
`cmt config set defaults.priority medium`). Reads the full config, modifies the value, writes
back. Round-trip preserves unknown keys. Boolean values accept `true`/`false`.

#### Output

- **`cmt config show`** (default): Human-readable YAML with annotations:
  ```yaml
  version: 1
  project:
    name: my-project
    prefix: WM
  defaults:
    priority: none
    type: task
    status: inbox
  # (remaining sections...)
  ```
- **`cmt config show --json`**: Full config as JSON object.
- **`cmt config get --json`**: The value as a JSON scalar.

---

### 3.14 `cmt log <ID>` -- Show Item Event History

Display the history of changes for a work item, derived from git history.

#### Syntax

```
work log <ID> [options]
```

#### Options

| Flag | Short | Type | Default | Description |
|---|---|---|---|---|
| `--limit <n>` | `-l` | `u32` | `20` | Maximum number of entries. |
| `--format <fmt>` | `-f` | `String` | `table` | Output format: `table`, `json`. |

#### Behavior

1. Resolve the ID to a file path.
2. If the events table exists in the SQLite index (see Spec 05 events table), query it for
   events related to this item.
3. If no events table or no events found, fall back to `git log --follow` on the item's file
   to reconstruct history from commits.
4. Display events in reverse chronological order.

#### Output

- **Default**:
  ```
  CMT-0042: Implement user authentication

  DATE                 ACTOR          ACTION
  2026-02-23 15:00     alice          status: active -> done
  2026-02-23 10:30     claude-agent   edit: updated acceptance criteria
  2026-02-22 09:00     alice          status: ready -> active
  2026-02-20 14:00     alice          created
  ```
- **`--json`**: JSON array of event objects:
  ```json
  [
    {
      "timestamp": "2026-02-23T15:00:00Z",
      "actor": "alice",
      "action": "transition",
      "details": { "from": "active", "to": "done" }
    }
  ]
  ```

#### Note

This command addresses **Principle 3 (Events Over State)** by providing a way to answer
"what happened to this item?" The events table in Spec 05 captures structured events from
CLI mutations, while git log provides a fallback for pre-events-table history and for changes
made by direct file edits.

---

### 3.15 `cmt completions <shell>` -- Generate Shell Completions

Generate shell completion scripts for the specified shell.

#### Syntax

```
work completions <shell>
```

Where `<shell>` is one of: `bash`, `zsh`, `fish`, `powershell`, `elvish`.

#### Behavior

1. Use `clap_complete` to generate the completion script for the specified shell.
2. Print the script to stdout.
3. Completions include:
   - All subcommand names.
   - All flag names for each subcommand.
   - Dynamic completions for item IDs (read from index).
   - Dynamic completions for status values (read from state machine).
   - Dynamic completions for tag values (read from index).
   - Dynamic completions for type values (read from config `id.prefixes` keys).

#### Installation Instructions

Printed to stderr along with the completion script:

```
# Bash: Add to ~/.bashrc:
eval "$(work completions bash)"

# Zsh: Add to ~/.zshrc:
eval "$(work completions zsh)"

# Fish: Run once:
work completions fish > ~/.config/fish/completions/work.fish
```

---

## 4. Output Formats

### 4.1 `table`

The default human-readable format. Uses box-drawing characters for borders and terminal colors
for status and priority highlighting.

**Characteristics**:
- Respects terminal width (detected via `$COLUMNS` or terminal ioctl). Truncates fields with
  `...` when necessary, prioritizing `title` truncation over `id` or `status`.
- Color scheme:
  - Status: `active` = green, `blocked` = red, `done` = dim/gray, `inbox` = yellow, `ready` = cyan, `cancelled` = strikethrough dim.
  - Priority: `critical` = bold red, `high` = red, `medium` = yellow, `low` = dim, `none` = default.
- When stdout is not a TTY (piped), automatically falls back to `simple` format unless
  `--format table` is explicitly specified.
- Column widths are computed dynamically based on content and terminal width.

### 4.2 `simple`

Minimal, pipe-friendly format. One line per item.

**Format**: `{ID}\t{STATUS}\t{TITLE}`

Fields are separated by tab characters (`\t`). No header row. No truncation. No color. Suitable
for piping to `awk`, `cut`, `grep`, `sort`, and other Unix text processing tools.

Example pipeline:
```bash
work list -f simple | grep active | cut -f1 | xargs -I{} work done {}
```

### 4.3 `json`

Machine-readable JSON format. Activated by `--format json` or the global `--json` flag.

**For list commands**: A JSON array of objects, where each object contains all fields of the work
item (both standard and extension fields). Optional fields that are absent (e.g., `assignee`,
`due`, `priority`) are **omitted** from the JSON output (not included as `null`). This applies
uniformly to both `--json` and `--format json` — there is no behavioral difference between
them for JSON output. The global `--json` flag is simply a shorthand for `--format json`.

**For single-item commands** (`show`, `add`, `edit`, `status`): A single JSON object.

**For action commands** (`done`, `archive`): A JSON array of result objects, each containing the
operation outcome.

All datetime values are formatted as RFC 3339 strings. All IDs are strings in their canonical
`PREFIX-NUMBER` form.

### 4.4 `csv`

Comma-separated values with a header row, conforming to RFC 4180.

**Characteristics**:
- First row is the column headers matching `--fields`.
- Values containing commas, double quotes, or newlines are enclosed in double quotes.
- Double quotes within values are escaped by doubling (`""`).
- Date fields are formatted as ISO 8601.
- Array fields (tags, depends_on) are serialized as semicolon-separated strings within the CSV
  cell: `team:backend;sprint:2026-w09`.

---

## 5. Exit Codes

Exit codes are meaningful and stable. Agents and scripts should rely on these codes for control flow.

| Code | Name | Meaning | Examples |
|---|---|---|---|
| 0 | Success | The operation completed successfully. | Any successful command. |
| 1 | General Error | An unexpected or unclassified error occurred. | IO failure, config parse error, internal bug. |
| 2 | Invalid Arguments | The command-line arguments are invalid. | Unknown flag, missing required arg, mutually exclusive flags. |
| 3 | Not Found | The specified work item or resource does not exist. | `cmt show CMT-9999` when CMT-9999 does not exist. |
| 4 | Invalid Transition | A state transition was rejected by the state machine. | `cmt status CMT-1 done` when current status is `inbox` (no direct transition). |
| 5 | Validation Error | Input data failed validation. | Creating item with empty title, missing `--reason` for blocked transition, invalid priority value. |

### Exit Code Behavior with Multiple Items

When a command operates on multiple items (e.g., `cmt done CMT-1 CMT-2 CMT-3`) and some succeed
while others fail:
- The command processes all items, printing errors for failures.
- The exit code reflects the **first** error encountered.
- With `--json`, the output includes results for all items (both successes and failures).

---

## 6. Environment Variables

Environment variables provide a layer of configuration between the config file and CLI flags.
They follow the precedence order defined in Spec 04 Section 4.

| Variable | Purpose | Default | Maps To |
|---|---|---|---|
| `CMT_DIR` | Override `.cmt/` directory location | Search upward from cwd | `--dir` flag |
| `CMT_PREFIX` | Override default ID prefix | From config `project.prefix` | `config.project.prefix` |
| `CMT_DEFAULT_PRIORITY` | Override default priority | From config `defaults.priority` | `config.defaults.priority` |
| `CMT_DEFAULT_TYPE` | Override default type | From config `defaults.type` | `config.defaults.type` |
| `CMT_AUTO_COMMIT` | Enable/disable git auto-commit | From config `git.auto_commit` | `config.git.auto_commit` |
| `CMT_COMMIT_PREFIX` | Override commit message prefix | From config `git.commit_prefix` | `config.git.commit_prefix` |
| `CMT_PAD_WIDTH` | Override ID display padding | From config `id.pad_width` | `config.id.pad_width` |
| `CMT_AUTO_ARCHIVE` | Enable/disable auto-archive | From config `archive.auto_archive` | `config.archive.auto_archive` |
| `CMT_ACTOR` | Actor identifier for event logging | System username | `--actor` flag |
| `EDITOR` | Editor for `cmt edit` (interactive mode) | `vi` | Standard Unix convention |
| `VISUAL` | Visual editor (preferred over `EDITOR`) | None | Standard Unix convention |
| `NO_COLOR` | Disable colored output (any value) | Unset | `--no-color` flag |

**Boolean parsing for `CMT_*` variables**: The values `true`, `1`, `yes` are truthy. The values
`false`, `0`, `no` are falsy. Case-insensitive. Any other value is a configuration error
(printed as a warning, treated as falsy).

**Editor resolution order**: `$VISUAL` -> `$EDITOR` -> `vi`. The first non-empty value is used.

---

## 7. Shell Completions

Shell completions are generated by the `cmt completions <shell>` command (Section 3.15). They
are powered by the `clap_complete` crate for static completions and custom completion logic for
dynamic values.

### Static Completions

Generated at build time from the `clap` command definitions:
- All subcommand names (`init`, `add`, `list`, `show`, `edit`, `done`, `status`, `archive`, `search`, `reindex`, `check`, `delete`, `config`, `log`, `completions`)
- All flag names for each subcommand
- Enum values for flags like `--priority` (`critical`, `high`, `medium`, `low`, `none`)
- Shell names for `cmt completions` (`bash`, `zsh`, `fish`, `powershell`, `elvish`)

### Dynamic Completions

Generated at completion time by querying the SQLite index and config:
- **Item IDs**: When completing `<ID>` arguments, query the index for all item IDs and present
  them as completion candidates. Prefix-filtered to match what the user has typed so far.
- **Status values**: Read from the resolved state machine. For `cmt status <ID> <TAB>`, show
  only the valid next states for the given item's current status.
- **Tag values**: Read from the index. For `--tag <TAB>`, show existing tag values.
- **Type values**: Read from `id.prefixes` keys in config. For `--type <TAB>`, show known types.
- **Template names**: Scan `.cmt/templates/` for `*.md` files. For `--template <TAB>`, show template names.

### Performance

Dynamic completions must complete within 100ms to feel responsive. The SQLite index ensures
this requirement is met even with thousands of items. If no index exists, dynamic completions
fall back to static-only (no item ID completion).

---

## 8. Discovery Behavior

How `cmt` finds the `.cmt/` directory on startup.

### Resolution Order

1. **`--dir` flag**: If provided, use this path directly. The path must contain a `config.yml`
   file (or be a valid `.cmt/` directory). If the path does not exist or is not a valid
   `.cmt/` directory, exit with code 1.

2. **`CMT_DIR` environment variable**: If set and `--dir` is not provided, use this path. Same
   validation as `--dir`.

3. **Upward search from cwd**: Starting from the current working directory, search upward
   through parent directories for a directory named `.cmt/` that contains a `config.yml` file:
   ```
   /home/user/projects/myapp/src/  -> check /home/user/projects/myapp/src/.cmt/config.yml
                                   -> check /home/user/projects/myapp/.cmt/config.yml      (found!)
   ```
   Stop at the filesystem root. On Unix, also stop at home directory boundaries (do not search
   above `$HOME`) to avoid accidentally discovering a `.cmt/` in an unrelated parent directory.

4. **Not found**: If no `.cmt/` directory is found, print a helpful error and exit with code 1:
   ```
   error: No .cmt/ directory found. Run 'work init' to create one, or use --dir to specify a path.
   ```

### Init Exception

The `cmt init` command does not require an existing `.cmt/` directory (it creates one). The
`cmt completions` and `cmt --version` commands also work without a `.cmt/` directory.

### Symlink Handling

If `.cmt/` is a symlink, it is followed. The resolved target is used for all operations. If
`config.yml` inside `.cmt/` is a symlink, it is also followed.

---

## 9. Agent Usage Patterns

AI agents interact with `cmt` through the same CLI as humans but use specific patterns to
maximize reliability and efficiency.

### Agent CLI Conventions

1. **Always use `--json`**: Agents parse structured JSON output, not human-formatted tables.
2. **Check exit codes**: Use exit codes (not output parsing) for error detection.
3. **Use `--set` for edits**: Agents use `cmt edit <ID> --set key=value` for programmatic
   modifications. They do not use `$EDITOR`-based editing.
4. **Capture created IDs**: `cmt add --json` returns the full item including the generated ID.
5. **Use `--quiet`**: Suppress informational messages that are irrelevant to agents.

### Example Agent Workflow

The following pseudocode illustrates how an AI agent would use `cmt` to pick up and complete
work:

```python
# 1. Discover available work
result = run("work list --json --status ready --assignee none --sort priority")
items = json.loads(result.stdout)

if not items:
    # No work available
    sleep(interval)
    continue

# 2. Claim a work item
item = items[0]
run(f"work edit {item['id']} --set assignee=agent-01")

# 3. Transition to active
result = run(f"work status {item['id']} active")
if result.exit_code != 0:
    # Transition failed (item may have been claimed by another actor)
    log_error(result.stderr)
    continue

# 4. Gather context
result = run(f"work show {item['id']} --json")
item_detail = json.loads(result.stdout)

# Check dependencies
for dep_id in item_detail.get("depends_on", []):
    dep = json.loads(run(f"work show {dep_id} --json").stdout)
    if dep["status"] not in ["done", "cancelled"]:
        # Dependency not met, block this item
        run(f"work status {item['id']} blocked --reason 'Waiting on {dep_id}'")
        continue

# 5. Execute the work
# (agent-specific logic here)
work_result = execute_work(item_detail)

# 6. Update the item with results
run(f"work edit {item['id']} --append '{work_result.summary}'")

# 7. Mark as done
if work_result.success:
    run(f"work done {item['id']}")
else:
    run(f"work status {item['id']} blocked --reason '{work_result.error}'")
```

### Agent-Friendly Error Messages

All error messages include the information an agent needs to recover:

- **Invalid transition**: Lists valid target states so the agent can choose an alternative.
- **Not found**: Includes the ID that was not found so the agent can verify.
- **Validation error**: Includes the specific field and constraint that failed.

### Concurrency Considerations for Agents

Multiple agents may operate on the same `.cmt/` directory simultaneously. The CLI uses
file-level atomic writes (write to temp file, then rename) to prevent partial reads. However,
there is no locking in Phase 1. If two agents attempt to modify the same item simultaneously,
the last write wins. Agents should:

1. Read the item, perform work, then write -- keeping the read-to-write window as short as
   possible.
2. Check that the item's `updated_at` timestamp has not changed between read and write. If it has,
   re-read and retry.
3. Use unique assignee identifiers to avoid claiming the same work.

---

## 10. Rust Implementation Notes

### 10.1 CLI Framework

The CLI is built with `clap` v4 using derive macros for type-safe argument parsing. The
command structure is defined as a nested enum.

```rust
use clap::{Parser, Subcommand, Args, ValueEnum};
use std::path::PathBuf;

/// work -- a work management system for humans and agents
#[derive(Parser, Debug)]
#[command(name = "work", version, about, long_about = None)]
#[command(propagate_version = true)]
pub struct Cli {
    /// Path to the .cmt/ directory
    #[arg(long, global = true, env = "CMT_DIR")]
    pub dir: Option<PathBuf>,

    /// Output as JSON
    #[arg(long, short = 'j', global = true)]
    pub json: bool,

    /// Suppress non-essential output
    #[arg(long, short = 'q', global = true, conflicts_with = "verbose")]
    pub quiet: bool,

    /// Show debug/trace information
    #[arg(long, short = 'v', global = true, conflicts_with = "quiet")]
    pub verbose: bool,

    /// Disable colored output.
    /// Also activated when the NO_COLOR env var is set (any value, including empty string)
    /// per https://no-color.org/, or when stdout is not a TTY.
    /// Note: NO_COLOR is handled via custom logic in main(), not via clap's env attribute,
    /// because clap's bool env parsing rejects empty strings while the NO_COLOR spec
    /// requires that any value (including "") disables color.
    #[arg(long, global = true)]
    pub no_color: bool,

    /// Actor identifier for event logging.
    /// Agents should set this (or CMT_ACTOR env) to self-identify in the audit trail.
    #[arg(long, global = true, env = "CMT_ACTOR")]
    pub actor: Option<String>,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Initialize a new .cmt/ directory
    Init(InitArgs),

    /// Create a new work item
    Add(AddArgs),

    /// List work items
    #[command(alias = "ls")]
    List(ListArgs),

    /// Show a work item
    Show(ShowArgs),

    /// Edit a work item
    Edit(EditArgs),

    /// Mark items as done
    Done(DoneArgs),

    /// Change item status
    Status(StatusArgs),

    /// Archive completed items
    Archive(ArchiveArgs),

    /// Full-text search
    Search(SearchArgs),

    /// Rebuild the SQLite index
    Reindex(ReindexArgs),

    /// Validate project integrity
    Check(CheckArgs),

    /// Delete work items
    #[command(alias = "rm")]
    Delete(DeleteArgs),

    /// View and modify configuration
    Config(ConfigCommand),

    /// Show item event history
    Log(LogArgs),

    /// Generate shell completions
    Completions(CompletionsArgs),
}
```

### 10.2 Subcommand Argument Structs

```rust
#[derive(Args, Debug)]
pub struct InitArgs {
    /// Default ID prefix
    #[arg(long, short = 'p', default_value = "CMT")]
    pub prefix: String,

    /// Project name
    #[arg(long, short = 'n')]
    pub name: Option<String>,

    /// Force reinitialize if .cmt/ exists
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct AddArgs {
    /// Work item title
    pub title: String,

    /// Work item type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Priority level
    #[arg(long, short = 'p', value_enum)]
    pub priority: Option<PriorityValue>,

    /// Assignee (repeatable)
    #[arg(long, short = 'a', action = clap::ArgAction::Append)]
    pub assignee: Vec<String>,

    /// Parent work item ID
    #[arg(long)]
    pub parent: Option<String>,

    /// Dependency (repeatable)
    #[arg(long = "depends-on", short = 'd', action = clap::ArgAction::Append)]
    pub depends_on: Vec<String>,

    /// Tag in namespace:value format (repeatable)
    #[arg(long, action = clap::ArgAction::Append)]
    pub tag: Vec<String>,

    /// Due date (YYYY-MM-DD)
    #[arg(long)]
    pub due: Option<String>,

    /// Initial status
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Create as complex item (folder with subdirectories)
    #[arg(long)]
    pub complex: bool,

    /// Open in editor after creation
    #[arg(long, short = 'e')]
    pub edit: bool,

    /// Apply template
    #[arg(long)]
    pub template: Option<String>,

    /// Markdown body content
    #[arg(long, short = 'b')]
    pub body: Option<String>,
}

#[derive(Args, Debug)]
pub struct ListArgs {
    /// Filter by status (comma-separated, or "all")
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Filter by type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Filter by minimum priority
    #[arg(long, short = 'p', value_enum)]
    pub priority: Option<PriorityValue>,

    /// Filter by assignee
    #[arg(long, short = 'a')]
    pub assignee: Option<String>,

    /// Filter by tag (repeatable)
    #[arg(long, action = clap::ArgAction::Append)]
    pub tag: Vec<String>,

    /// Filter children of this parent
    #[arg(long)]
    pub parent: Option<String>,

    /// Only root-level items
    #[arg(long)]
    pub no_parent: bool,

    /// Only overdue items
    #[arg(long)]
    pub overdue: bool,

    /// Show items with due date before this date (YYYY-MM-DD)
    #[arg(long)]
    pub due_before: Option<String>,

    /// Only items with incomplete dependencies
    #[arg(long)]
    pub blocked: bool,

    /// Filter by tag namespace (e.g., "team" matches all team:* tags)
    #[arg(long)]
    pub tag_ns: Option<String>,

    /// Filter by ID prefix
    #[arg(long)]
    pub id: Option<String>,

    /// Sort field
    #[arg(long, default_value = "priority")]
    pub sort: String,

    /// Reverse sort order
    #[arg(long, short = 'r')]
    pub reverse: bool,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,

    /// Columns to display (comma-separated)
    #[arg(long, default_value = "id,title,status,priority")]
    pub fields: String,

    /// Include archived items
    #[arg(long, short = 'A')]
    pub all: bool,

    /// Maximum items to show
    #[arg(long, short = 'l')]
    pub limit: Option<u32>,
}

#[derive(Args, Debug)]
pub struct ShowArgs {
    /// Work item ID
    pub id: String,

    /// Suppress body content (show metadata only).
    /// By default, body is shown. Pass --no-body to suppress it.
    #[arg(long)]
    pub no_body: bool,

    /// Print raw file contents
    #[arg(long)]
    pub raw: bool,

    /// Also list child items
    #[arg(long)]
    pub children: bool,
}

impl ShowArgs {
    /// Whether to show the body content. True unless --no-body was passed.
    pub fn show_body(&self) -> bool {
        !self.no_body
    }
}

#[derive(Args, Debug)]
pub struct EditArgs {
    /// Work item ID
    pub id: String,

    /// Set frontmatter field (repeatable)
    #[arg(long, action = clap::ArgAction::Append)]
    pub set: Vec<String>,

    /// Add a tag (repeatable)
    #[arg(long = "add-tag", action = clap::ArgAction::Append)]
    pub add_tag: Vec<String>,

    /// Remove a tag (repeatable)
    #[arg(long = "remove-tag", action = clap::ArgAction::Append)]
    pub remove_tag: Vec<String>,

    /// Add a dependency (repeatable)
    #[arg(long = "add-dep", action = clap::ArgAction::Append)]
    pub add_dep: Vec<String>,

    /// Remove a dependency (repeatable)
    #[arg(long = "remove-dep", action = clap::ArgAction::Append)]
    pub remove_dep: Vec<String>,

    /// Convert to complex item
    #[arg(long)]
    pub complex: bool,

    /// Replace body content
    #[arg(long, short = 'b')]
    pub body: Option<String>,

    /// Append to body content
    #[arg(long)]
    pub append: Option<String>,
}

#[derive(Args, Debug)]
pub struct DoneArgs {
    /// Work item IDs
    #[arg(required = true)]
    pub ids: Vec<String>,

    /// Bypass state machine validation
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct StatusArgs {
    /// Work item ID
    pub id: String,

    /// New status
    pub new_status: String,

    /// Reason for status change (required for blocked)
    #[arg(long, short = 'r')]
    pub reason: Option<String>,

    /// Bypass state machine validation
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct ArchiveArgs {
    /// Specific item IDs to archive
    pub ids: Vec<String>,

    /// Archive all items in terminal states
    #[arg(long)]
    pub done: bool,

    /// Show what would be archived
    #[arg(long)]
    pub dry_run: bool,
}

#[derive(Args, Debug)]
pub struct SearchArgs {
    /// Search query (FTS5 syntax)
    pub query: String,

    /// Filter by status
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Filter by type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Maximum results
    #[arg(long, short = 'l', default_value = "20")]
    pub limit: u32,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,

    /// Include archived items
    #[arg(long, short = 'A')]
    pub all: bool,
}

#[derive(Args, Debug)]
pub struct ReindexArgs {
    /// Drop and recreate the database
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct CheckArgs {
    /// Attempt to fix correctable issues
    #[arg(long)]
    pub fix: bool,
}

#[derive(Args, Debug)]
pub struct CompletionsArgs {
    /// Shell type
    pub shell: clap_complete::Shell,
}

#[derive(Args, Debug)]
pub struct DeleteArgs {
    /// Work item IDs
    #[arg(required = true)]
    pub ids: Vec<String>,

    /// Skip confirmation prompt
    #[arg(long, short = 'f')]
    pub force: bool,
}

#[derive(Subcommand, Debug)]
pub enum ConfigCommand {
    /// Show configuration
    Show {
        /// Section to show (project, defaults, state_machines, git, etc.)
        section: Option<String>,
    },
    /// Get a config value
    Get {
        /// Dot-notation key (e.g., project.prefix)
        key: String,
    },
    /// Set a config value
    Set {
        /// Dot-notation key
        key: String,
        /// New value
        value: String,
    },
}

#[derive(Args, Debug)]
pub struct LogArgs {
    /// Work item ID
    pub id: String,

    /// Maximum number of entries
    #[arg(long, short = 'l', default_value = "20")]
    pub limit: u32,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,
}
```

### 10.3 Shared Value Enums

```rust
#[derive(ValueEnum, Debug, Clone, Copy)]
pub enum PriorityValue {
    Critical,
    High,
    Medium,
    Low,
    None,
}

#[derive(ValueEnum, Debug, Clone, Copy)]
pub enum OutputFormat {
    Table,
    Simple,
    Json,
    Csv,
}
```

### 10.4 Key Crate Dependencies

| Crate | Purpose | Notes |
|---|---|---|
| `clap` (v4) | CLI argument parsing with derive macros | `features = ["derive", "env"]` |
| `clap_complete` | Shell completion generation | Supports bash, zsh, fish, powershell, elvish |
| `serde` / `serde_json` / `serde_yaml` | Serialization for JSON output and YAML parsing | |
| `tabled` | Table formatting for terminal output | Alternative: `comfy-table` |
| `owo-colors` or `colored` | Terminal color support | Must respect `NO_COLOR` |
| `chrono` | Date and time handling | RFC 3339 formatting |
| `rusqlite` | SQLite database for index and FTS5 | `features = ["bundled"]` for zero-dependency builds |
| `regex` | ID format validation | |
| `dirs` | Home directory detection for search boundary | |
| `atty` or `is-terminal` | TTY detection for color auto-disable | |

---

## 11. Examples

### 11.1 Solo Developer Workflow

A single developer using `cmt` for personal task management with zero configuration.

```bash
# Initialize a project
$ work init
Initialized catchmytask in .cmt/ with prefix WM

# Add some tasks
$ work add "Fix the login bug"
CMT-0001

$ work add "Update API documentation" --priority low
CMT-0002

$ work add "Implement password reset" --priority high --due 2026-03-01
CMT-0003

# List active tasks
$ work list
ID        STATUS   PRI    TITLE
CMT-0003   inbox    high   Implement password reset
CMT-0001   inbox    none   Fix the login bug
CMT-0002   inbox    low    Update API documentation

3 items

# Triage: move to ready
$ work status CMT-0001 ready
CMT-0001: inbox -> ready

# Start work
$ work status CMT-0001 active
CMT-0001: ready -> active

# Complete
$ work done CMT-0001
CMT-0001: active -> done

# Archive completed items
$ work archive --done
Archived CMT-0001 (done)

# Check what's left
$ work list
ID        STATUS   PRI    TITLE
CMT-0003   inbox    high   Implement password reset
CMT-0002   inbox    low    Update API documentation

2 items
```

### 11.2 Team Member with Tags and Dependencies

A developer on a team using typed items, tags, and dependencies.

```bash
# Initialize with custom prefix
$ work init --prefix ACME --name "acme-backend"
Initialized catchmytask in .cmt/ with prefix ACME

# Add a feature with tags
$ work add "User profile page" --type feature --priority medium \
    --tag team:frontend --tag sprint:2026-w09 \
    --depends-on ACME-0010 --assignee alice
FEAT-0001

# Add a bug with high priority
$ work add "Login crash on special characters" --type bug --priority critical \
    --assignee bob --tag team:backend
BUG-0001

# List items filtered by team
$ work list --tag "team:frontend"
ID          STATUS   PRI    TITLE                  ASSIGNEE
FEAT-0001   inbox    med    User profile page      alice

1 item

# List items sorted by due date
$ work list --sort due
ID          STATUS   PRI      TITLE                              DUE
BUG-0001    inbox    critical Login crash on special characters   --
FEAT-0001   inbox    med      User profile page                  --

2 items

# Transition with blocked reason
$ work status FEAT-0001 ready
FEAT-0001: inbox -> ready

$ work status FEAT-0001 active
FEAT-0001: ready -> active

$ work status FEAT-0001 blocked --reason "Waiting on ACME-0010 API endpoints"
FEAT-0001: active -> blocked

# Unblock and complete
$ work status FEAT-0001 active
FEAT-0001: blocked -> active

$ work done FEAT-0001
FEAT-0001: active -> done
```

### 11.3 AI Agent JSON Workflow

An AI agent using the CLI programmatically with JSON mode.

```bash
# Agent discovers available work
$ work list --json --status ready --assignee none --sort priority
[
  {
    "id": "CMT-0042",
    "title": "Implement JWT authentication",
    "status": "ready",
    "priority": "high",
    "type": "task",
    "tags": ["team:backend", "security"]
  },
  {
    "id": "CMT-0043",
    "title": "Write unit tests for auth module",
    "status": "ready",
    "priority": "medium",
    "type": "task",
    "tags": ["team:backend", "testing"]
  }
]

# Agent claims the highest-priority item
$ work edit CMT-0042 --set assignee=claude-agent-01
Updated CMT-0042

# Agent transitions to active
$ work status CMT-0042 active --json
{
  "id": "CMT-0042",
  "from": "ready",
  "to": "active",
  "machine": "default",
  "timestamps_set": ["started_at", "updated_at"]
}
# Exit code: 0

# Agent retrieves full context
$ work show CMT-0042 --json
{
  "id": "CMT-0042",
  "title": "Implement JWT authentication",
  "status": "active",
  "priority": "high",
  "type": "task",
  "assignee": "claude-agent-01",
  "created_at": "2026-02-20T09:00:00Z",
  "started_at": "2026-02-23T14:30:00Z",
  "depends_on": ["CMT-0039"],
  "tags": ["team:backend", "security"],
  "body": "## Description\n\nImplement JWT-based authentication...",
  "file_path": ".cmt/items/CMT-0042.md",
  "checklist": { "total": 4, "checked": 1 }
}

# Agent adds work notes
$ work edit CMT-0042 --append "## Agent Log

- 2026-02-23T14:30:00Z: Picked up by claude-agent-01
- 2026-02-23T14:35:00Z: Implementing JWT token generation
- 2026-02-23T15:00:00Z: Implementation complete, all tests passing"

# Agent marks as done
$ work done CMT-0042 --json
[
  { "id": "CMT-0042", "from": "active", "to": "done", "success": true }
]
# Exit code: 0

# Agent handles an error case
$ work status CMT-0043 done --json
{
  "id": "CMT-0043",
  "error": "Cannot transition from 'ready' to 'done'. Valid transitions from 'ready': active, cancelled",
  "exit_code": 4
}
# Exit code: 4
```

### 11.4 Power User: Search, Complex Items, Custom Types

An experienced user leveraging advanced features.

```bash
# Create a complex investigation
$ work add "Investigate points discrepancy for CS-P-310455" \
    --type investigation \
    --priority high \
    --assignee dpwanjala \
    --tag client:wyndham \
    --tag domain:loyalty/points \
    --complex \
    --edit
INV-0001
# Editor opens .cmt/items/INV-0001/item.md

# After editing, the complex item structure looks like:
$ ls .cmt/items/INV-0001/
item.md    evidence/    queries/    handover/

# Full-text search across all items
$ work search "points discrepancy"
ID          STATUS   TITLE                                         MATCH
INV-0001    inbox    Investigate points discrepancy for CS-P-31... ...[points] [discrepancy] for CS-P-310455...
INV-0003    active   Alayna points investigation                   ...multiple [points] [discrepancy] cases...

2 results

# Search with status filter
$ work search "authentication" --status active
ID        STATUS   TITLE                           MATCH
CMT-0042   active   Implement JWT authentication    ...JWT-based [authentication] for the API...

1 result

# Reindex after manual file edits
$ work reindex
Reindexed 45 items (5 archived) in 23ms

# Validate entire project
$ work check
warning: INV-0003.md: depends_on references INV-0099 which does not exist
warning: BUG-0012.md: tag 'urgent' does not follow namespace:value convention
ok: 45 items checked, 0 errors, 2 warnings

# Batch operations with shell pipelines
$ work list -f simple -s inbox | cut -f1 | xargs -I{} work status {} ready
CMT-0044: inbox -> ready
CMT-0045: inbox -> ready
CMT-0046: inbox -> ready

# CSV export for spreadsheet analysis
$ work list --format csv --fields id,title,status,priority,assignee,due --all > report.csv

# Generate shell completions
$ work completions zsh > ~/.zsh/completions/_work
```

---

## 12. Edge Cases and Error Handling

### No `.cmt/` Directory Found

When `cmt` cannot locate a `.cmt/` directory:
- Commands that require it (`add`, `list`, `show`, `edit`, `done`, `status`, `archive`,
  `search`, `reindex`, `check`) print an error and exit with code 1:
  ```
  error: No .cmt/ directory found. Run 'work init' to create one, or use --dir to specify a path.
  ```
- Commands that do not require it (`init`, `completions`, `--version`, `--help`) work normally.

### Empty Project

When `.cmt/` exists but contains no items:
- `cmt list` displays an empty table with the header and a `0 items` footer.
- `cmt list --json` outputs an empty JSON array: `[]`.
- `cmt search` returns no results with a `0 results` message.
- `cmt archive --done` reports `No items to archive.` and exits with code 0.
- `cmt check` reports `ok: 0 items checked, 0 errors, 0 warnings`.

### Invalid Status Transitions

When a transition is rejected:
- The error message includes the current state, the requested target, and the list of valid
  targets from the current state:
  ```
  error: Cannot transition from 'inbox' to 'done'.
         Valid transitions from 'inbox': ready, cancelled
  ```
- Exit code: 4.
- With `--json`: The error is included in the JSON output with the `error` field.

### Concurrent Access

When two processes modify the same file simultaneously:
- Phase 1 uses last-writer-wins semantics. No file locking.
- Atomic writes are used (write to temp file in the same directory, then `rename()`). This
  prevents partial reads but does not prevent lost updates.
- The SQLite index uses WAL mode for concurrent read access. Write operations serialize
  through SQLite's built-in locking.
- If `git.auto_commit` is true, git merge resolves conflicting changes on pull.

### Very Long Titles

- Titles exceeding 200 characters emit a warning (Spec 01 rule V-03) but are accepted.
- In `table` format, long titles are truncated with `...` to fit the terminal width.
- In `json`, `csv`, and `simple` formats, the full title is included without truncation.

### Special Characters in Titles

- Titles may contain any UTF-8 characters except null bytes.
- In YAML frontmatter, titles containing colons, quotes, or other YAML-special characters are
  automatically quoted by the YAML serializer.
- In filenames, only the ID is used (not the title), so special characters in titles do not
  affect file naming.

### Corrupted Index

If the SQLite index is corrupted or incompatible:
- The CLI detects the issue on first query and prints a warning:
  ```
  warning: SQLite index is corrupted or incompatible. Rebuilding...
  ```
- The index is automatically rebuilt from files (equivalent to `cmt reindex --force`).
- This rebuild is transparent to the user; the command proceeds after rebuilding.

### Missing Config File

If `.cmt/` exists but `config.yml` is missing:
- All configuration uses hardcoded defaults (Spec 04 Section 1).
- No error or warning is emitted (a missing config is normal for zero-config usage).

### Read-Only File System

If the `.cmt/` directory is on a read-only file system:
- Read operations (`list`, `show`, `search`) work normally.
- Write operations (`add`, `edit`, `done`, `status`, `archive`) fail with an IO error and
  exit code 1.
- The SQLite index cannot be created or updated. If the index does not exist, read operations
  fall back to file scanning (slower but functional).

### ID Collision

If a manually created file uses an ID that conflicts with the auto-increment counter:
- `cmt reindex` detects the collision and updates the counter to be above the highest existing ID.
- `cmt add` always queries the counter before creating, so collisions during normal usage are
  impossible. They can only occur when files are created outside the CLI.

### Items with `status` Not in State Machine

When the config changes and existing items have a status not recognized by the new state machine:
- `cmt list` displays the item with the unknown status as-is.
- `cmt show` displays the item normally.
- `cmt status <ID> <target>` emits a warning and allows the transition (Spec 02 Section 6,
  validation step 2).
- `cmt check` reports these as warnings: `"Item CMT-42 has status 'review' which is not in the
  active state machine."`

---

## Appendix: Cross-References

| Topic | Spec |
|---|---|
| Work item schema, required fields, extension fields | [Spec 01: Work Item Schema](01-work-item-schema.md) |
| State machine definitions, transitions, and timestamp side effects | [Spec 02: State Machine](02-state-machine.md) |
| Config file format, defaults, directory layout, and `cmt init` details | [Spec 04: Config Format](04-config-format.md) |
| SQLite index schema, FTS5, and `id_counters` table | [Spec 05: SQLite Index](05-sqlite-index.md) |
| Existing CLI design and lessons learned | `docs/research/01-task-platform-analysis.md` Section 5 |
| Progressive capability and progressive disclosure | `docs/research/06-first-principles.md` Section IX |
| Actor agnosticism and multi-actor design | `docs/research/06-first-principles.md` Section III |
| Synthesis of architectural decisions | `docs/research/00-synthesis.md` |

---
spec: "05"
title: SQLite Index
status: draft
version: 0.1.0
created: 2026-02-23
depends_on: ["01", "02", "04"]
---

# Spec 05: SQLite Index

## 1. Overview

The file `.cmt/.index.db` is a SQLite database that mirrors work item metadata for fast
queries. It is **always derived from the files** and can be rebuilt from scratch with
`cmt reindex`. It is **never the source of truth**. The Markdown files in `.cmt/items/`
and `.cmt/archive/` are the sole authoritative store.

The index file is always listed in `.cmt/.gitignore` and must never be committed to version
control. Any user or agent can delete `.index.db` at any time; the next `cmt` command will
transparently rebuild it.

### Purpose

- **Fast queries**: Avoid O(n) file scanning for `cmt list`, `cmt search`, and filtered views
- **Full-text search**: FTS5 index over item titles and body content
- **ID auto-increment**: Track the next available number per prefix
- **Schema metadata**: Track index schema version for forward-compatible migrations
- **Change detection**: SHA-256 hashes detect which files changed since last sync

### Guiding Principles

- **Derived, not authoritative**: If the index disagrees with a file, the file wins
- **Disposable**: Delete it and everything still works (just slower until rebuilt)
- **Local-only**: Never shared, never committed, never synced between machines
- **Transparent**: Users and agents interact with files; the index is an implementation detail
- **Fast**: Sub-10ms for listing 1000 items, sub-50ms for full-text search

### References

- Research: `docs/research/01-industry-landscape.md` Section 11.1 (YAML+SQLite dual-write)
- Research: `docs/research/02-first-principles.md` Section "1. Storage: YAML Frontmatter Files + SQLite Index"
- Research: `docs/research/01-industry-landscape.md` (O(n) scanning pain point)
- Design principles: Files as Foundation, Progressive Capability, Timelessness Over Trendiness

---

## 2. Schema

### 2.1 Complete DDL

The following SQL creates the full index schema. This DDL is executed when `.index.db` is
first created or when `cmt reindex` rebuilds from scratch.

```sql
-- ============================================================
-- Meta table: tracks schema version and index metadata
-- ============================================================
CREATE TABLE _meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Seed with initial schema version
INSERT INTO _meta (key, value) VALUES ('schema_version', '1');
INSERT INTO _meta (key, value) VALUES ('created_at', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

-- ============================================================
-- Items table: one row per work item (active or archived)
-- ============================================================
CREATE TABLE items (
    id             TEXT    PRIMARY KEY,          -- e.g. "CMT-42"
    title          TEXT    NOT NULL,             -- non-empty, max 200 chars
    status         TEXT    NOT NULL,             -- current state machine state
    type           TEXT,                         -- work item type (nullable)
    priority       TEXT,                         -- critical/high/medium/low/none (nullable)
    assignee       TEXT,                         -- single string or JSON array (nullable)
    parent         TEXT,                         -- parent work item ID (nullable)
    due            TEXT,                         -- ISO 8601 date YYYY-MM-DD (nullable)
    created_at     TEXT    NOT NULL,             -- RFC 3339 datetime
    started_at     TEXT,                         -- RFC 3339 datetime (nullable)
    completed_at   TEXT,                         -- RFC 3339 datetime (nullable)
    updated_at     TEXT,                         -- RFC 3339 datetime (nullable)
    blocked_reason TEXT,                         -- free text (nullable)
    body_text      TEXT,                         -- plain text of Markdown body (stripped of formatting), for FTS
    archived       INTEGER NOT NULL DEFAULT 0,   -- 0 = active, 1 = archived
    file_path      TEXT    NOT NULL,             -- relative path from .cmt/ (e.g. "items/CMT-42.md")
    body_hash      TEXT,                         -- SHA-256 hex of full file content
    file_mtime     TEXT,                         -- ISO 8601 file modification time (fast-path sync filter)
    indexed_at     TEXT    NOT NULL              -- RFC 3339 datetime of last index
);

-- ============================================================
-- Tags table: normalized many-to-many for tags
-- ============================================================
CREATE TABLE item_tags (
    item_id   TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag       TEXT NOT NULL,             -- full tag string (e.g. "team:backend")
    namespace TEXT,                      -- extracted namespace (e.g. "team"), NULL for bare tags
    value     TEXT,                      -- extracted value (e.g. "backend"), NULL for bare tags
    PRIMARY KEY (item_id, tag)
);

-- ============================================================
-- Dependencies table: normalized depends_on relationships
-- ============================================================
CREATE TABLE item_deps (
    item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    depends_on TEXT NOT NULL,            -- ID of the dependency target
    PRIMARY KEY (item_id, depends_on)
);

-- ============================================================
-- Relations table: typed relationships between items
-- ============================================================
CREATE TABLE item_relations (
    item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    related_id TEXT NOT NULL,            -- ID of the related item
    rel_type   TEXT NOT NULL,            -- relationship type (e.g. "duplicates", "implements")
    PRIMARY KEY (item_id, related_id, rel_type)
);

-- ============================================================
-- Full-text search: FTS5 virtual table over item content
-- ============================================================
-- Uses external content mode: FTS reads from the items table.
-- The body_text column stores the Markdown body stripped of formatting.
CREATE VIRTUAL TABLE items_fts USING fts5(
    id,
    title,
    body_text,
    content='items',
    content_rowid='rowid',
    tokenize='porter unicode61'
);

-- ============================================================
-- Events table: audit trail for work item mutations
-- Addresses Design Principle 3 (Events Over State).
-- Events are append-only. Rows are never updated or deleted
-- during normal operations. A `cmt reindex --force` (which drops
-- the entire database) will clear events. Future versions may
-- reconstruct events from git history.
-- ============================================================
CREATE TABLE events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id    TEXT    NOT NULL,              -- work item ID (preserved even after item deletion)
    timestamp  TEXT    NOT NULL,              -- RFC 3339 datetime of the event
    actor      TEXT,                          -- who performed the action (nullable for pre-events history)
    action     TEXT    NOT NULL,              -- event type: created, transition, edit, delete, archive
    detail     TEXT                           -- JSON object with action-specific data (nullable)
    -- No foreign key: events are an append-only audit trail and must survive item deletion.
    -- The item_id is informational, not a referential constraint.
);

CREATE INDEX idx_events_item_id ON events(item_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_actor ON events(actor);

-- ============================================================
-- ID counters: track next auto-increment number per prefix
-- ============================================================
CREATE TABLE id_counters (
    prefix      TEXT    PRIMARY KEY,     -- e.g. "CMT", "BUG", "FEAT"
    next_number INTEGER NOT NULL DEFAULT 1
);
```

### 2.2 Indexes

The following indexes accelerate the most common query patterns. They are created after
the tables during initial setup.

```sql
-- Status is the most common filter (cmt list --status active)
CREATE INDEX idx_items_status ON items(status);

-- Type filter (cmt list --type bug)
CREATE INDEX idx_items_type ON items(type);

-- Priority filter and sort (cmt list --priority high, cmt list --sort priority)
CREATE INDEX idx_items_priority ON items(priority);

-- Assignee filter (cmt list --assignee alice)
CREATE INDEX idx_items_assignee ON items(assignee);

-- Parent lookup for hierarchy queries (find all children of CMT-10)
CREATE INDEX idx_items_parent ON items(parent);

-- Archive flag for excluding archived items from default queries
CREATE INDEX idx_items_archived ON items(archived);

-- Created timestamp for date-range filtering and default sort order
CREATE INDEX idx_items_created ON items(created_at);

-- Due date for deadline queries (cmt list --overdue, cmt list --due-before 2026-03-01)
CREATE INDEX idx_items_due ON items(due);

-- Compound index for the most common default query:
-- "list active (non-archived) items sorted by created date"
CREATE INDEX idx_items_active_created ON items(archived, status, created_at);

-- Tag lookups by namespace (cmt list --tag team:backend)
CREATE INDEX idx_item_tags_tag ON item_tags(tag);

-- Tag lookups by namespace alone (cmt list --tag-ns team)
CREATE INDEX idx_item_tags_namespace ON item_tags(namespace);

-- Dependency reverse lookup: "what items depend on X?" (blocks query)
CREATE INDEX idx_item_deps_depends_on ON item_deps(depends_on);

-- Relations reverse lookup: "what items are related to X?"
CREATE INDEX idx_item_relations_related ON item_relations(related_id);
```

---

## 3. Column Mapping

This section defines how each work item field (spec 01) maps to SQLite columns.

### 3.1 Required Fields

| Work Item Field | SQL Column | SQL Type | Constraint | Notes |
|---|---|---|---|---|
| `id` | `id` | `TEXT` | `PRIMARY KEY` | Stored as-is from frontmatter (e.g., `"CMT-42"`) |
| `title` | `title` | `TEXT` | `NOT NULL` | Stored as-is, max 200 characters |
| `status` | `status` | `TEXT` | `NOT NULL` | Current state machine state name |
| `created_at` | `created_at` | `TEXT` | `NOT NULL` | RFC 3339 string, preserving timezone info |

### 3.2 Standard Optional Fields (Scalar)

| Work Item Field | SQL Column | SQL Type | Nullable | Notes |
|---|---|---|---|---|
| `type` | `type` | `TEXT` | Yes | Lowercase string (e.g., `"task"`, `"bug"`) |
| `priority` | `priority` | `TEXT` | Yes | One of: `critical`, `high`, `medium`, `low`, `none` |
| `assignee` (single) | `assignee` | `TEXT` | Yes | Stored as plain string (e.g., `"alice"`) |
| `assignee` (multiple) | `assignee` | `TEXT` | Yes | JSON-encoded array (e.g., `'["alice","bob"]'`) |
| `parent` | `parent` | `TEXT` | Yes | Parent work item ID string |
| `due` | `due` | `TEXT` | Yes | ISO 8601 date string (`"2026-03-15"`) |
| `started_at` | `started_at` | `TEXT` | Yes | RFC 3339 datetime string |
| `completed_at` | `completed_at` | `TEXT` | Yes | RFC 3339 datetime string |
| `updated_at` | `updated_at` | `TEXT` | Yes | RFC 3339 datetime string |
| `blocked_reason` | `blocked_reason` | `TEXT` | Yes | Free text string |

### 3.3 Assignee Encoding

The `assignee` field in the work item schema (spec 01) can be either a single string or an
array of strings. In SQLite, it is stored as a single `TEXT` column:

- **Single assignee**: Stored as the plain string value. Example: `"alice"`.
- **Multiple assignees**: Stored as a JSON array string. Example: `'["alice","bob"]'`.

Detection on read: If the value starts with `[` and ends with `]`, parse as JSON array.
Otherwise, treat as a single assignee string.

Queries against the assignee column use:

```sql
-- Single assignee match (plain string)
WHERE assignee = 'alice'

-- Match within a JSON array (also matches single string).
-- Uses json_each() for precise matching within arrays, avoiding LIKE
-- false positives (e.g., LIKE '%"alice"%' would incorrectly match "alice2").
WHERE assignee = ?1
   OR EXISTS (
       SELECT 1 FROM json_each(assignee)
       WHERE json_each.value = ?1
       AND assignee LIKE '[%'
   )
-- ?1 = 'alice'
```

**Note**: The `assignee LIKE '[%'` guard ensures `json_each()` is only called on
JSON arrays (strings starting with `[`), avoiding parse errors on plain string values.

### 3.4 Normalized (Multi-Value) Fields

These work item fields are stored in separate normalized tables rather than in the `items`
table, because they represent one-to-many or many-to-many relationships.

| Work Item Field | Normalized Table | Key Columns | Notes |
|---|---|---|---|
| `tags` | `item_tags` | `item_id`, `tag`, `namespace`, `value` | Each tag is a row. Namespace and value extracted from `namespace:value` format. Bare tags have `NULL` namespace and value. |
| `depends_on` | `item_deps` | `item_id`, `depends_on` | Each dependency ID is a row. |
| `related` | `item_relations` | `item_id`, `related_id`, `rel_type` | Each relationship is a row with its type. |

### 3.5 Tag Decomposition

When indexing a tag, the system extracts namespace and value components:

| Tag String | `tag` Column | `namespace` Column | `value` Column |
|---|---|---|---|
| `"team:backend"` | `"team:backend"` | `"team"` | `"backend"` |
| `"domain:auth/login"` | `"domain:auth/login"` | `"domain"` | `"auth/login"` |
| `"sprint:2026-w08"` | `"sprint:2026-w08"` | `"sprint"` | `"2026-w08"` |
| `"urgent"` | `"urgent"` | `NULL` | `NULL` |

The decomposition rule: if the tag contains a `:`, split on the first `:` into namespace
and value. Otherwise, namespace and value are both `NULL`.

### 3.6 Index-Only Fields

These columns exist only in the SQLite index and have no corresponding work item
frontmatter field:

| SQL Column | Purpose | Set By |
|---|---|---|
| `body_text` | Plain text of the Markdown body, stripped of formatting. Used by FTS5 for full-text search. | Extracted from the file during indexing: everything after the closing `---`, with Markdown syntax stripped. |
| `archived` | `INTEGER` flag: `0` for items in `items/`, `1` for items in `archive/` | Determined by file path during indexing |
| `file_path` | Relative path from `.cmt/` root (e.g., `"items/CMT-42.md"`, `"items/CMT-42/item.md"`, `"archive/CMT-42.md"`) | Determined by file location during indexing |
| `body_hash` | SHA-256 hex digest of the full file content (frontmatter + body) | Computed during indexing for change detection |
| `file_mtime` | ISO 8601 modification time of the file on disk | Recorded during indexing. Used as a fast-path filter during incremental sync: if mtime is unchanged, skip the SHA-256 hash computation. |
| `indexed_at` | RFC 3339 timestamp of when this row was last updated in the index | Set to `now()` during each index operation |

### 3.7 Extension Fields

Extension fields (spec 01, Section 5) are **not** stored in the SQLite index. They exist
only in the Markdown files. This is deliberate:

- Extension fields have arbitrary names and types, making SQL schema impractical
- The index is for fast queries on known fields; extension fields are accessed by reading the file
- If a future version needs to query extension fields, a separate key-value table can be added

When `cmt show CMT-42 --json` is invoked, the system reads the file directly to include
extension fields in the output.

---

## 4. Sync Protocol

The sync protocol ensures the SQLite index accurately reflects the state of the work item
files. The files are always authoritative.

### 4.1 Sync Triggers

| Trigger | Behavior |
|---|---|
| `.index.db` does not exist | Full reindex: scan all files, create database from scratch |
| `cmt reindex` command | Full reindex: drop all data, rescan all files, rebuild everything |
| Any mutation via CLI (`cmt add`, `cmt edit`, `cmt status`, `cmt done`, `cmt archive`) | Dual-write: update the file first, then update the corresponding SQLite row(s) |
| `cmt list`, `cmt search`, `cmt show`, or any read command | Incremental sync: compare file modification times and hashes, re-index only changed files |
| `cmt reindex` (without `--force`) | Incremental sync: same as read-triggered sync, but with verbose output |

### 4.2 Dual-Write Protocol (CLI Mutations)

When the CLI modifies a work item, it writes to both the file and the index in a single
operation. The file write happens first; if it fails, the index is not updated.

```
CLI command (e.g., cmt status CMT-42 done)
  |
  v
1. Read file from disk
2. Parse frontmatter + body
3. Apply mutation (change status to "done", set completed timestamp)
4. Validate (state machine check, field validation)
5. Serialize and write file to disk          <-- file is now updated
6. Compute SHA-256 of the written file
7. Upsert the items row in SQLite            <-- index is now updated
8. Update normalized tables (tags, deps, relations)
9. Update FTS index
```

If step 5 succeeds but step 7 fails (e.g., SQLite locked), the CLI prints a warning and
continues. The index is stale but not corrupt -- the next read operation will detect the
mismatch via hash comparison and re-index.

### 4.3 Change Detection

Each indexed file has its SHA-256 hash stored in the `body_hash` column. During incremental
sync, the system detects changes efficiently:

```
For each .md file in items/ and archive/:
  1. Compute relative path from .cmt/ root
  2. Read the file's modification time (mtime) from the filesystem
  3. Look up the path in the items table
  4. If not found: new file -- parse and insert
  5. If found:
     a. Compare file mtime with stored file_mtime
     b. If mtime is unchanged: skip (fast path -- no read, no hash)
     c. If mtime differs: read file content, compute SHA-256
        i.  If hash matches body_hash: update file_mtime only (content unchanged,
            mtime changed due to backup restore, git checkout, etc.)
        ii. If hash differs: re-parse and update all columns
  6. After scanning all files: any items in the table
     whose file_path does not match a scanned file
     are deleted from the index (file was removed)
```

The mtime fast-path avoids reading and hashing every file on each `cmt list`. For a
project with 1,000 items where only 5 changed, this reduces the sync from ~1,000 file
reads + SHA-256 computations to ~5. The `stat()` syscall to read mtime is orders of
magnitude cheaper than reading file contents.

### 4.4 Full Reindex Protocol (`cmt reindex`)

The `cmt reindex` command performs a complete rebuild:

```
1. BEGIN EXCLUSIVE TRANSACTION
2. DELETE FROM items_fts
3. DELETE FROM item_relations
4. DELETE FROM item_deps
5. DELETE FROM item_tags
6. DELETE FROM items
7. DELETE FROM id_counters
8. Scan .cmt/items/ for all .md files (simple and complex)
9. Scan .cmt/archive/ for all .md files (simple and complex)
10. For each file:
    a. Parse frontmatter + body
    b. Validate (warnings only -- do not reject files during reindex)
    c. INSERT into items table
    d. INSERT into item_tags, item_deps, item_relations
    e. INSERT into items_fts
    f. Track max ID number per prefix
11. For each prefix encountered:
    a. INSERT OR REPLACE into id_counters with next_number = max + 1
12. UPDATE _meta SET value = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE key = 'last_reindex'
13. COMMIT
```

If any individual file fails to parse, the error is reported as a warning and that file is
skipped. The reindex continues with remaining files. At the end, a summary is printed:

```
Reindexed 142 items (3 warnings, 0 errors) in 1.2s
```

### 4.5 Incremental Sync Protocol

On every read command, the index performs an incremental sync if the database exists:

```
1. BEGIN IMMEDIATE TRANSACTION
2. Walk .cmt/items/ and .cmt/archive/ to collect all .md file paths + mtimes
3. Load the set of (file_path, body_hash, file_mtime) tuples from the items table
4. For each file on disk:
   a. If file_path not in index: parse file, INSERT into all tables
   b. If file_path in index:
      i.   Compare file mtime with stored file_mtime
      ii.  If mtime unchanged: skip (fast path)
      iii. If mtime changed: read file content, compute SHA-256
           - If hash matches: UPDATE file_mtime only
           - If hash differs: parse file, UPDATE all tables
   c. Remove this file_path from the tracked set
5. For each remaining file_path in the tracked set (file was deleted):
   a. DELETE from items (CASCADE handles tags, deps, relations)
   b. DELETE from items_fts
6. Rebuild id_counters from current items
7. COMMIT
```

### 4.6 Sync Flow Diagram

```
                    .cmt/items/*.md
                    .cmt/archive/*.md
                          |
                    [File System]
                          |
              +-----------+-----------+
              |                       |
         [CLI Mutation]         [CLI Read/Query]
              |                       |
        (1) Write file          (1) Check .index.db exists?
        (2) Upsert index              |
              |                  No --+--> Full reindex
              v                  Yes -+--> Incremental sync
         .cmt/.index.db              |
              |                  (2) Walk files
              |                  (3) Compare hashes
              |                  (4) Update changed rows
              |                  (5) Remove deleted rows
              v                       |
         [Query Result]               v
                                [Query Result]
```

---

## 5. Query Patterns

This section documents how CLI commands translate to SQL queries. All queries assume the
incremental sync has already run (the index is up to date).

### 5.1 `cmt list` (Default)

List all active (non-archived) items in non-terminal states, sorted by priority
(highest first), then by creation date descending as tiebreaker. This matches the
CLI default `--sort priority` defined in Spec 03 Section 3.3.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND status NOT IN ('done', 'cancelled')
ORDER BY
  CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END ASC,
  created_at DESC;
```

Note: The `NOT IN ('done', 'cancelled')` clause uses the default terminal states.
When custom state machines are in use, the CLI resolves the terminal states from the
config and substitutes them into the `NOT IN` clause dynamically. For example, if the
`bug` machine has terminal states `verified` and `wontfix`, items of type `bug` in
those states are also excluded from the default list.

### 5.2 `cmt list --status active`

Filter by a single status value.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND status = ?1
ORDER BY created_at DESC;
-- ?1 = 'active'
```

### 5.3 `cmt list --status active --priority high`

Compound filter on multiple fields. The `--priority` flag is a **minimum** priority filter
(Spec 03 §3.3): `--priority medium` shows medium, high, and critical. This is implemented
as a range query using the same CASE expression used for sorting.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND status = ?1
  AND CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END <= CASE ?2
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END
ORDER BY
  CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END ASC,
  created_at DESC;
-- ?1 = 'active', ?2 = 'high'
-- This returns items with priority >= high (i.e., critical and high)
```

### 5.4 `cmt list --tag team:backend`

Filter by a specific tag. Requires a JOIN with the `item_tags` table.

```sql
SELECT i.id, i.title, i.status, i.type, i.priority, i.assignee, i.created_at, i.due
FROM items i
JOIN item_tags t ON i.id = t.item_id
WHERE i.archived = 0
  AND t.tag = ?1
ORDER BY i.created_at DESC;
-- ?1 = 'team:backend'
```

### 5.5 `cmt list --tag-ns team`

Filter by tag namespace (all tags in the "team" namespace).

```sql
SELECT DISTINCT i.id, i.title, i.status, i.type, i.priority, i.assignee, i.created_at, i.due
FROM items i
JOIN item_tags t ON i.id = t.item_id
WHERE i.archived = 0
  AND t.namespace = ?1
ORDER BY i.created_at DESC;
-- ?1 = 'team'
```

### 5.6 `cmt list --assignee alice`

Filter by assignee. Matches both single-assignee and multi-assignee items using
`json_each()` for precise array matching (see Section 3.3 for details).

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND (assignee = ?1
       OR EXISTS (
           SELECT 1 FROM json_each(assignee)
           WHERE json_each.value = ?1
           AND assignee LIKE '[%'
       ))
ORDER BY
  CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END ASC,
  created_at DESC;
-- ?1 = 'alice'
```

### 5.7 `cmt list --parent CMT-10`

Find all children of a parent item.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND parent = ?1
ORDER BY created_at DESC;
-- ?1 = 'CMT-10'
```

### 5.8 `cmt list --overdue`

Find items with a due date in the past that are not in a terminal state.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
  AND due IS NOT NULL
  AND due < date('now')
  AND status NOT IN ('done', 'cancelled')
ORDER BY due ASC;
```

Note: This query uses the default terminal states. When custom state machines are in use,
the CLI resolves the terminal states from the config and substitutes them into the `NOT IN`
clause dynamically.

### 5.9 `cmt list --blocked`

Find items that are blocked (depend on incomplete items).

```sql
SELECT DISTINCT i.id, i.title, i.status, i.type, i.priority, i.assignee, i.created_at, i.due
FROM items i
JOIN item_deps d ON i.id = d.item_id
JOIN items dep ON d.depends_on = dep.id
WHERE i.archived = 0
  AND dep.status NOT IN ('done', 'cancelled')
ORDER BY i.created_at DESC;
```

### 5.10 `cmt list --sort priority`

Sort by priority using a custom ordering expression.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due
FROM items
WHERE archived = 0
ORDER BY
  CASE priority
    WHEN 'critical' THEN 0
    WHEN 'high'     THEN 1
    WHEN 'medium'   THEN 2
    WHEN 'low'      THEN 3
    WHEN 'none'     THEN 4
    ELSE 5
  END ASC,
  created_at DESC;
```

### 5.11 `cmt list --all`

Include archived items.

```sql
SELECT id, title, status, type, priority, assignee, created_at, due, archived
FROM items
ORDER BY created_at DESC;
```

### 5.12 `cmt show CMT-42`

Fetch a single item by primary key. The CLI reads the file directly for full content
(including body and extension fields), but the index lookup confirms the item exists and
provides the file path.

```sql
SELECT id, file_path
FROM items
WHERE id = ?1;
-- ?1 = 'CMT-42'
```

### 5.13 `cmt search "auth login"`

Full-text search using FTS5.

```sql
SELECT i.id, i.title, i.status, i.type, i.priority,
       snippet(items_fts, 2, '**', '**', '...', 32) AS snippet,
       rank
FROM items_fts fts
JOIN items i ON i.rowid = fts.rowid
WHERE items_fts MATCH ?1
  AND i.archived = 0
ORDER BY rank;
-- ?1 = 'auth login'
```

The `snippet()` function highlights matching terms in the body with `**` markers (rendered
as bold in the terminal). The `rank` column provides relevance ordering (lower is better
in FTS5 default ranking).

### 5.14 `cmt list --type bug --status active --assignee alice --tag sprint:2026-w08`

Complex compound query with multiple filters.

```sql
SELECT DISTINCT i.id, i.title, i.status, i.type, i.priority, i.assignee, i.created_at, i.due
FROM items i
JOIN item_tags t ON i.id = t.item_id
WHERE i.archived = 0
  AND i.type = ?1
  AND i.status = ?2
  AND (i.assignee = ?3
       OR EXISTS (
           SELECT 1 FROM json_each(i.assignee)
           WHERE json_each.value = ?3
           AND i.assignee LIKE '[%'
       ))
  AND t.tag = ?4
ORDER BY i.created_at DESC;
-- ?1 = 'bug', ?2 = 'active', ?3 = 'alice', ?4 = 'sprint:2026-w08'
```

---

## 6. Full-Text Search (FTS5)

### 6.1 Configuration

The FTS5 virtual table uses **external content mode**, meaning it does not store its own
copy of the indexed text. Instead, it references the `items` table via `content='items'`
and `content_rowid='rowid'`.

```sql
CREATE VIRTUAL TABLE items_fts USING fts5(
    id,                          -- searchable: work item ID
    title,                       -- searchable: work item title
    body_text,                   -- searchable: plain text of Markdown body (stored in items.body_text)
    content='items',             -- external content source
    content_rowid='rowid',       -- rowid linkage
    tokenize='porter unicode61'  -- stemming + Unicode support
);
```

### 6.2 Tokenizer

The `porter unicode61` tokenizer provides:

- **Unicode support**: Handles non-ASCII characters (accented letters, CJK, etc.)
- **Porter stemming**: Matches word stems (e.g., searching "authentication" matches
  "authenticating", "authenticated", "auth")
- **Case folding**: Searches are case-insensitive

### 6.3 Indexed Fields

| FTS Column | Source | Notes |
|---|---|---|
| `id` | `items.id` | Allows searching by ID fragments (e.g., `CMT-4*`) |
| `title` | `items.title` | Primary search target for natural language queries |
| `body_text` | `items.body_text` | Plain text of Markdown body, stripped of formatting. Extracted from the file after the closing `---` delimiter. |

The `body_text` column on the `items` table is populated during indexing by reading the
full file content, extracting everything after the closing frontmatter delimiter, and
stripping Markdown syntax (`#`, `*`, `-`, `[`, etc.) to produce clean plain text. Since
`body_text` is a real column on `items`, the FTS5 external content mode can read it
directly during queries.

### 6.4 FTS Sync: Explicit Management (No Triggers)

Because the FTS5 table uses external content mode and the `body_text` column must be
populated from file content (not from another column), FTS is managed explicitly in the
Rust code rather than via SQL triggers. This avoids the complexity of triggers that would
need to fire with incomplete data and then be overwritten.

**On upsert** (insert or update a work item):

```sql
-- Step 1: Delete old FTS entry if it exists
INSERT INTO items_fts(items_fts, rowid, id, title, body_text)
VALUES ('delete', ?1, ?2, ?3, ?4);

-- Step 2: Insert new FTS entry with full body text
INSERT INTO items_fts(rowid, id, title, body_text)
VALUES (?1, ?2, ?3, ?4);
-- ?1 = rowid, ?2 = id, ?3 = title, ?4 = stripped Markdown body text
```

**On delete** (removing an item from the index):

```sql
INSERT INTO items_fts(items_fts, rowid, id, title, body_text)
VALUES ('delete', ?1, ?2, ?3, ?4);
```

**On full reindex**: The FTS table is emptied with a special command before rebuilding:

```sql
INSERT INTO items_fts(items_fts) VALUES ('delete-all');
```

All FTS operations are performed within the same transaction as the corresponding
`items` table mutation, ensuring atomicity.

### 6.5 FTS Query Syntax

FTS5 supports several query types:

| Query | FTS5 Syntax | Example CLI |
|---|---|---|
| Simple terms | `auth login` | `cmt search "auth login"` |
| Exact phrase | `"user authentication"` | `cmt search '"user authentication"'` |
| Prefix match | `auth*` | `cmt search "auth*"` |
| Boolean AND | `auth AND login` | `cmt search "auth AND login"` |
| Boolean OR | `auth OR login` | `cmt search "auth OR login"` |
| Boolean NOT | `auth NOT oauth` | `cmt search "auth NOT oauth"` |
| Column filter | `title:auth` | `cmt search "title:auth"` |

### 6.6 Ranking and Snippets

Search results are ranked by FTS5's built-in BM25 ranking function (accessed via the
`rank` column). Lower rank values indicate higher relevance.

Snippets are generated using the `snippet()` function to provide context around matches:

```sql
snippet(items_fts, 2, '**', '**', '...', 32)
```

- Column index `2` = `body_text` (the third FTS column, 0-indexed)
- `'**'` / `'**'` = markers around matching terms (bold in terminal output)
- `'...'` = ellipsis for truncated content
- `32` = maximum number of tokens in the snippet

For terminal display, the `**` markers are translated to ANSI bold escape codes.

---

## 7. ID Auto-Increment Protocol

### 7.1 Counter Table

The `id_counters` table stores the next available number for each ID prefix:

```sql
CREATE TABLE id_counters (
    prefix      TEXT    PRIMARY KEY,
    next_number INTEGER NOT NULL DEFAULT 1
);
```

Example contents:

| prefix | next_number |
|---|---|
| `WM` | `43` |
| `BUG` | `8` |
| `FEAT` | `15` |

### 7.2 Generating a New ID

When `cmt add` creates a new work item:

```
1. Determine the prefix:
   a. If --type is given and id.prefixes has an entry for that type, use the type prefix
   b. Otherwise, use project.prefix from config
   c. If no config, use "CMT"

2. Atomically claim the next number:
   BEGIN IMMEDIATE;
   UPDATE id_counters SET next_number = next_number + 1
   WHERE prefix = ?1
   RETURNING next_number - 1 AS claimed_number;
   COMMIT;

3. If no row was returned (prefix not in table):
   a. Bootstrap the counter (see Section 7.3)
   b. Retry step 2

4. Format the ID:
   "{prefix}-{claimed_number}"
   e.g., "CMT-43"

5. Zero-pad for display (not storage):
   pad_width from config (default 4)
   "CMT-43" displays as "CMT-0043"
```

### 7.3 Bootstrap Protocol

When a prefix is encountered for the first time (no row in `id_counters`), the system
must scan existing files to find the highest existing number:

```
1. BEGIN IMMEDIATE;
2. Check id_counters for the prefix (may have been inserted by another operation)
3. If still absent:
   a. Query: SELECT MAX(CAST(substr(id, instr(id, '-') + 1) AS INTEGER))
             FROM items WHERE id LIKE ?1
      -- ?1 = 'CMT-%' (prefix + dash + wildcard)
   b. If result is NULL (no existing items with this prefix): max_number = 0
   c. INSERT INTO id_counters (prefix, next_number) VALUES (?prefix, max_number + 1)
4. COMMIT;
```

If the index does not exist (no `.index.db`), the CLI falls back to scanning all files in
`.cmt/items/` and `.cmt/archive/` for files matching the prefix pattern. This is the
O(n) fallback that the index was designed to avoid.

### 7.4 Thread Safety

SQLite's transaction model provides atomicity for ID generation:

- `BEGIN IMMEDIATE` acquires a reserved lock, preventing other writers
- `UPDATE ... RETURNING` atomically increments and returns the value
- The transaction is held for the minimum duration (just the counter update)
- If two CLI processes race, one will succeed and the other will retry after a brief `BUSY` wait

The `PRAGMA busy_timeout` setting (see Section 10.2) ensures that the retrying process
waits rather than failing immediately.

### 7.5 Counter Recovery

If the `id_counters` table becomes inconsistent (e.g., a counter falls behind the actual
maximum ID), `cmt reindex` resets all counters by scanning every item:

```sql
-- During cmt reindex, step 11
DELETE FROM id_counters;
INSERT INTO id_counters (prefix, next_number)
SELECT
    substr(id, 1, instr(id, '-') - 1) AS prefix,
    MAX(CAST(substr(id, instr(id, '-') + 1) AS INTEGER)) + 1 AS next_number
FROM items
GROUP BY substr(id, 1, instr(id, '-') - 1);
```

---

## 8. Event Trail

### 8.1 Purpose

The `events` table implements **Design Principle 3 (Events Over State)** by recording
every mutation to work items as an append-only event log. This enables:

- **Audit**: "Who changed CMT-42 to done, and when?"
- **History**: `cmt log CMT-42` shows the full lifecycle (Spec 03 §3.14)
- **Analytics**: Time-in-state calculations, actor activity reports
- **Debugging**: Trace exactly what happened when an agent's behavior seems wrong

### 8.2 Event Types

| `action` | Fired When | `detail` JSON |
|---|---|---|
| `created` | `cmt add` creates a new item | `{"status": "inbox", "title": "..."}` |
| `transition` | `cmt status`, `cmt done` changes status | `{"from": "active", "to": "done", "forced": false}` |
| `edit` | `cmt edit --set`, `cmt edit --add-tag`, etc. | `{"fields_changed": ["priority", "assignee"]}` |
| `archive` | `cmt archive` moves item | `{"from_path": "items/CMT-42.md", "to_path": "archive/CMT-42.md"}` |
| `delete` | `cmt delete` removes item | `{"title": "...", "status": "...", "final_state": true}` |

### 8.3 Recording Events

Events are recorded within the same transaction as the file+index mutation. The event
insert is non-blocking: if it fails (e.g., schema mismatch after upgrade), a warning is
emitted but the mutation still succeeds. Events are best-effort, not transactional gates.

```rust
/// Record an event in the events table.
pub fn record_event(
    &self,
    item_id: &str,
    actor: Option<&str>,
    action: &str,
    detail: Option<&serde_json::Value>,
) -> Result<(), IndexError> {
    self.conn.execute(
        "INSERT INTO events (item_id, timestamp, actor, action, detail) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            item_id,
            Utc::now().to_rfc3339(),
            actor,
            action,
            detail.map(|d| d.to_string()),
        ],
    )?;
    Ok(())
}
```

### 8.4 Actor Identification

The `actor` field is populated from:
1. The `--actor` global flag (if provided) — available for agents to self-identify
2. The `CMT_ACTOR` environment variable
3. The system username (via `whoami` or equivalent)
4. `null` if none of the above are available

Agents should set `CMT_ACTOR=agent-name` in their environment for proper attribution.

### 8.5 Querying Events

```sql
-- Get all events for an item (cmt log CMT-42)
SELECT timestamp, actor, action, detail
FROM events
WHERE item_id = ?1
ORDER BY timestamp DESC
LIMIT ?2;

-- Get recent events across all items
SELECT item_id, timestamp, actor, action, detail
FROM events
ORDER BY timestamp DESC
LIMIT ?1;

-- Get events by actor (useful for agent activity reports)
SELECT item_id, timestamp, action, detail
FROM events
WHERE actor = ?1
ORDER BY timestamp DESC;
```

### 8.6 Events and Reindex

The events table is **not** rebuilt during `cmt reindex`. Events are independent of file
content — they record what happened, not the current state. However, `cmt reindex --force`
(which drops and recreates the entire database) will clear the events table. If git history
is available, a future `cmt reindex --rebuild-events` command could reconstruct events from
git commits, but this is not implemented in Phase 1.

---

## 9. Security Considerations

### 9.1 Path Traversal Prevention

When resolving work item IDs to file paths, the system must prevent path traversal attacks.
A malicious ID like `../../etc/passwd` in a `depends_on` or `parent` field must not cause
the system to read or write files outside `.cmt/`.

**Rule**: After constructing any file path, canonicalize it and verify it starts with the
canonical `.cmt/` directory path. If not, reject the operation with an error:
`"Path '{path}' resolves outside the .cmt/ directory"`.

```rust
fn safe_resolve(work_dir: &Path, relative: &str) -> Result<PathBuf, String> {
    let candidate = work_dir.join(relative);
    let canonical = candidate.canonicalize().map_err(|e| e.to_string())?;
    let work_canonical = work_dir.canonicalize().map_err(|e| e.to_string())?;
    if !canonical.starts_with(&work_canonical) {
        return Err(format!("Path '{}' resolves outside the .cmt/ directory", relative));
    }
    Ok(canonical)
}
```

### 9.2 Symlink Attack Prevention

When following symlinks in the `.cmt/` directory:

- **`.cmt/` itself may be a symlink**: This is supported (for shared directories). The
  target is validated at `cmt init` time.
- **Files within `.cmt/items/`**: Symlinks within `items/` or `archive/` are **not followed**
  during file scanning. If `items/CMT-42.md` is a symlink, it is skipped with a warning:
  `"Skipping symlink at items/CMT-42.md"`. This prevents symlink-based attacks where an
  attacker creates a symlink to a sensitive file.
- **Exception**: `.cmt/config.yml` may be a symlink (for shared config).

### 9.3 File Permission Guidance

- `.cmt/config.yml`: Should be readable by all users who need to use `cmt`. World-readable
  is safe (it contains no secrets).
- `.cmt/items/`: Should be writable by all actors. For multi-user setups, use group
  permissions with a shared group.
- `.cmt/.index.db`: Should be writable by all actors. Use the same permissions as `items/`.
- `.cmt/templates/`: Readable by all, writable by project maintainers.

### 9.4 Input Sanitization

- **YAML frontmatter**: Parsed by `serde_yaml` which does not execute arbitrary code. YAML
  anchors/aliases are supported (safe). YAML `!!python/object` and similar language-specific
  tags are ignored by `serde_yaml`.
- **FTS5 queries**: User-provided search queries are passed as parameters (not interpolated
  into SQL). FTS5 syntax injection is harmless — FTS5 queries cannot execute arbitrary SQL.
- **`--set key=value`**: The key is validated against known field names. Unknown keys are
  treated as extension fields. The value is stored as a YAML string, not evaluated.
- **Shell command injection**: The CLI never passes user-provided values to shell commands.
  Git operations use `Command::new("git")` with explicit arguments (not shell interpolation).

---

## 10. Performance

### 10.1 Targets

| Operation | Target | Items Count | Notes |
|---|---|---|---|
| `cmt list` (default, no filters) | < 10ms | 1,000 | Indexed query, no file I/O |
| `cmt list` (with filters) | < 15ms | 1,000 | Compound WHERE clause |
| `cmt list --tag team:backend` | < 15ms | 1,000 | JOIN with item_tags |
| `cmt search "query"` | < 50ms | 1,000 | FTS5 MATCH with ranking and snippets |
| `cmt show CMT-42` | < 5ms | Any | Primary key lookup + file read |
| `cmt add "title"` | < 20ms | Any | File write + index upsert + ID increment |
| `cmt reindex` | < 5s | 1,000 | Full scan + parse + insert |
| `cmt reindex` | < 30s | 10,000 | Linear scaling |
| Incremental sync (no changes) | < 50ms | 1,000 | File walk + hash comparison |
| Incremental sync (10 changed) | < 100ms | 1,000 | 10 file parses + 10 upserts |

### 10.2 SQLite PRAGMA Settings

These pragmas are set when opening the database connection:

```sql
-- Write-Ahead Logging for concurrent reads during writes
PRAGMA journal_mode = WAL;

-- Reduced sync guarantees (safe with WAL mode; data survives process crash,
-- may lose data on OS crash -- acceptable for a derived index)
PRAGMA synchronous = NORMAL;

-- Enable foreign key constraint enforcement
PRAGMA foreign_keys = ON;

-- Busy timeout: wait up to 5 seconds for locks before returning SQLITE_BUSY
PRAGMA busy_timeout = 5000;

-- Memory-mapped I/O: use up to 64MB of mmap for faster reads
PRAGMA mmap_size = 67108864;

-- Page cache: 2000 pages * 4KB = 8MB cache
PRAGMA cache_size = -8000;

-- Temporary store in memory (for intermediate query results)
PRAGMA temp_store = MEMORY;
```

### 10.3 Estimated Database Size

Based on average work item metadata:

| Component | Per-Item Size | 1,000 Items | 10,000 Items |
|---|---|---|---|
| `items` row | ~500 bytes | ~500 KB | ~5 MB |
| `item_tags` rows (avg 3 tags) | ~150 bytes | ~150 KB | ~1.5 MB |
| `item_deps` rows (avg 1 dep) | ~50 bytes | ~50 KB | ~500 KB |
| `item_relations` rows (avg 0.5) | ~30 bytes | ~30 KB | ~300 KB |
| `items_fts` index | ~300 bytes | ~300 KB | ~3 MB |
| Indexes | ~200 bytes | ~200 KB | ~2 MB |
| **Total** | **~1.2 KB** | **~1.2 MB** | **~12 MB** |

These are estimates. Actual sizes depend on title lengths, body sizes (for FTS), and
tag/dependency counts.

---

## 11. Schema Evolution

### 11.1 Version Tracking

The `_meta` table stores the current schema version:

```sql
SELECT value FROM _meta WHERE key = 'schema_version';
-- Returns: '1'
```

### 11.2 Version Check on Open

Every time the `Index` struct opens the database, it checks the schema version:

```
1. Open the SQLite database file
2. Set PRAGMA settings (Section 10.2)
3. Query: SELECT value FROM _meta WHERE key = 'schema_version'
4. Parse the version as an integer
5. If version == CURRENT_VERSION (compiled into the binary): proceed normally
6. If version < CURRENT_VERSION: run migrations from version+1 to CURRENT_VERSION
7. If version > CURRENT_VERSION: the database was created by a newer work version.
   Delete the database file and rebuild from scratch (it is just a derived index).
8. If the _meta table does not exist: the database is pre-versioning or corrupt.
   Delete and rebuild.
```

### 11.3 Migration Format

Migrations are forward-only (no downgrade support). Each migration is a numbered SQL
script embedded in the Rust binary:

```rust
const MIGRATIONS: &[(u32, &str)] = &[
    // (target_version, sql_statements)
    (2, include_str!("migrations/002.sql")),
    (3, include_str!("migrations/003.sql")),
    // ...
];
```

Each migration runs within a single transaction:

```
1. BEGIN EXCLUSIVE;
2. Execute the migration SQL
3. UPDATE _meta SET value = ?1 WHERE key = 'schema_version';
   -- ?1 = new version number as string
4. COMMIT;
```

If a migration fails, the transaction is rolled back and the error is reported. The user
can resolve the issue by deleting `.index.db` and running `cmt reindex`.

### 11.4 Migration Guidelines

- **Add columns with defaults**: `ALTER TABLE items ADD COLUMN new_col TEXT DEFAULT NULL`
- **Add new tables**: Safe to add at any time
- **Add new indexes**: Safe to add at any time
- **Drop columns**: Not supported by SQLite `ALTER TABLE` -- use the rebuild approach
  (create new table, copy data, drop old, rename)
- **Rename columns**: Supported since SQLite 3.25.0 via `ALTER TABLE ... RENAME COLUMN`
- **Never modify the _meta table structure**: It must remain stable across all versions

### 11.5 The Nuclear Option

If any schema issue arises that migrations cannot resolve, the user can always:

```bash
rm .cmt/.index.db
cmt reindex
```

This is safe because the index is entirely derived from files. The `cmt reindex` command
creates a fresh database with the current schema version.

---

## 12. Rust Type Mapping

### 12.1 Core Types

```rust
use std::path::{Path, PathBuf};
use rusqlite::{Connection, Transaction, params};
use chrono::{DateTime, Utc};

/// The SQLite index database.
/// Wraps a rusqlite::Connection and provides all index operations.
pub struct Index {
    /// The underlying SQLite connection.
    conn: Connection,

    /// Path to the .index.db file.
    db_path: PathBuf,

    /// Path to the .cmt/ directory root.
    work_dir: PathBuf,
}

/// A row from the items table, representing indexed metadata.
/// This is NOT the full work item -- it lacks the body and extension fields.
#[derive(Debug, Clone)]
pub struct IndexedItem {
    pub id: String,
    pub title: String,
    pub status: String,
    pub item_type: Option<String>,
    pub priority: Option<String>,
    pub assignee: Option<String>,
    pub parent: Option<String>,
    pub due: Option<String>,
    pub created_at: String,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub updated_at: Option<String>,
    pub blocked_reason: Option<String>,
    pub archived: bool,
    pub file_path: String,
    pub body_hash: Option<String>,
    pub file_mtime: Option<String>,
    pub indexed_at: String,
}

/// A tag with its decomposed components.
#[derive(Debug, Clone)]
pub struct IndexedTag {
    pub item_id: String,
    pub tag: String,
    pub namespace: Option<String>,
    pub value: Option<String>,
}

/// A dependency relationship.
#[derive(Debug, Clone)]
pub struct IndexedDep {
    pub item_id: String,
    pub depends_on: String,
}

/// A typed relation between items.
#[derive(Debug, Clone)]
pub struct IndexedRelation {
    pub item_id: String,
    pub related_id: String,
    pub rel_type: String,
}

/// A full-text search result.
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub item: IndexedItem,
    pub snippet: String,
    pub rank: f64,
}

/// An event from the audit trail.
#[derive(Debug, Clone)]
pub struct EventRecord {
    pub id: i64,
    pub item_id: String,
    pub timestamp: String,
    pub actor: Option<String>,
    pub action: String,
    pub detail: Option<serde_json::Value>,
}

/// Filter criteria for list queries.
#[derive(Debug, Clone, Default)]
pub struct QueryFilter {
    pub status: Option<String>,
    pub item_type: Option<String>,
    pub priority: Option<String>,
    pub assignee: Option<String>,
    pub parent: Option<String>,
    pub tag: Option<String>,
    pub tag_namespace: Option<String>,
    pub due_before: Option<String>,
    pub overdue: bool,
    pub include_archived: bool,
}

/// Sort criteria for list queries.
#[derive(Debug, Clone)]
pub enum SortField {
    CreatedAt,
    Priority,
    Due,
    Status,
    Title,
    UpdatedAt,
    Id,
}

#[derive(Debug, Clone)]
pub enum SortOrder {
    Asc,
    Desc,
}

#[derive(Debug, Clone)]
pub struct SortCriteria {
    pub field: SortField,
    pub order: SortOrder,
}
```

### 12.2 Index Methods

```rust
impl Index {
    /// Open or create the index database.
    ///
    /// - If .index.db does not exist, creates it with the full schema.
    /// - If it exists, checks the schema version and runs migrations if needed.
    /// - Sets all PRAGMA values.
    ///
    /// # Arguments
    /// * `work_dir` - Path to the .cmt/ directory
    ///
    /// # Returns
    /// A ready-to-use Index instance.
    pub fn open(work_dir: &Path) -> Result<Self, IndexError> {
        let db_path = work_dir.join(".index.db");
        let conn = Connection::open(&db_path)?;

        // Set PRAGMAs
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;
             PRAGMA busy_timeout = 5000;
             PRAGMA mmap_size = 67108864;
             PRAGMA cache_size = -8000;
             PRAGMA temp_store = MEMORY;"
        )?;

        let mut index = Index {
            conn,
            db_path,
            work_dir: work_dir.to_path_buf(),
        };
        index.ensure_schema()?;
        Ok(index)
    }

    /// Perform a full reindex: drop all data, scan all files, rebuild everything.
    ///
    /// This is the implementation of `cmt reindex`. It:
    /// 1. Deletes all rows from all tables (except _meta)
    /// 2. Walks .cmt/items/ and .cmt/archive/
    /// 3. Parses each file and inserts into the index
    /// 4. Rebuilds id_counters from observed IDs
    ///
    /// # Returns
    /// The number of items indexed and any warnings encountered.
    pub fn reindex(&mut self) -> Result<ReindexResult, IndexError> {
        todo!()
    }

    /// Perform an incremental sync: detect changed files and update the index.
    ///
    /// Compares file hashes with stored body_hash values. Only re-parses
    /// files that have changed. Removes index entries for deleted files.
    ///
    /// # Returns
    /// The number of items added, updated, and removed.
    pub fn incremental_sync(&mut self) -> Result<SyncResult, IndexError> {
        todo!()
    }

    /// Insert or update a single work item in the index.
    ///
    /// This is the dual-write target: after the CLI writes the file,
    /// it calls this method to update the index.
    ///
    /// # Arguments
    /// * `item` - The parsed work item
    /// * `body` - The Markdown body text (for FTS indexing)
    /// * `file_path` - Relative path from .cmt/ root
    /// * `file_hash` - SHA-256 hex digest of the full file content
    /// * `archived` - Whether the item is in the archive directory
    pub fn upsert_item(
        &mut self,
        item: &WorkItem,
        body: &str,
        file_path: &str,
        file_hash: &str,
        archived: bool,
    ) -> Result<(), IndexError> {
        todo!()
    }

    /// Delete a work item from the index.
    ///
    /// Called when a file is removed (e.g., during sync when a file
    /// is detected as missing).
    ///
    /// # Arguments
    /// * `id` - The work item ID to remove.
    pub fn delete_item(&self, id: &str) -> Result<(), IndexError> {
        todo!()
    }

    /// Query the index with optional filters and sorting.
    ///
    /// Builds a SELECT statement dynamically based on the provided
    /// filter criteria. Returns matching items.
    ///
    /// # Arguments
    /// * `filter` - Filter criteria (status, type, priority, tag, etc.)
    /// * `sort` - Sort criteria (field + order)
    /// * `limit` - Maximum number of results (default: 100)
    /// * `offset` - Number of results to skip (for pagination)
    pub fn query(
        &self,
        filter: &QueryFilter,
        sort: &SortCriteria,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<IndexedItem>, IndexError> {
        todo!()
    }

    /// Perform a full-text search.
    ///
    /// Uses FTS5 MATCH with BM25 ranking. Returns results with
    /// highlighted snippets.
    ///
    /// # Arguments
    /// * `query` - The search query (FTS5 syntax)
    /// * `include_archived` - Whether to search archived items
    /// * `limit` - Maximum number of results (default: 20)
    pub fn search(
        &self,
        query: &str,
        include_archived: bool,
        limit: u32,
    ) -> Result<Vec<SearchResult>, IndexError> {
        todo!()
    }

    /// Claim the next available ID for a given prefix.
    ///
    /// Atomically increments the counter and returns the claimed number.
    /// If no counter exists for the prefix, bootstraps it by scanning
    /// existing items.
    ///
    /// # Arguments
    /// * `prefix` - The ID prefix (e.g., "CMT", "BUG")
    ///
    /// # Returns
    /// The claimed number (e.g., 43 for "CMT-43").
    pub fn next_id(&mut self, prefix: &str) -> Result<u32, IndexError> {
        todo!()
    }

    /// Get the file path for a work item by ID.
    ///
    /// Returns the relative path from .cmt/ root, or None if the item
    /// is not in the index.
    pub fn file_path(&self, id: &str) -> Result<Option<String>, IndexError> {
        todo!()
    }

    /// Get tags for a work item.
    pub fn tags(&self, id: &str) -> Result<Vec<IndexedTag>, IndexError> {
        todo!()
    }

    /// Get dependencies for a work item.
    pub fn deps(&self, id: &str) -> Result<Vec<IndexedDep>, IndexError> {
        todo!()
    }

    /// Get items that depend on the given item ("blocks" query).
    pub fn blocked_by(&self, id: &str) -> Result<Vec<String>, IndexError> {
        todo!()
    }

    /// Get relations for a work item.
    pub fn relations(&self, id: &str) -> Result<Vec<IndexedRelation>, IndexError> {
        todo!()
    }

    /// Check if the index exists and is up to date.
    /// Returns false if the database file is missing.
    pub fn exists(&self) -> bool {
        self.db_path.exists()
    }

    // ── Private Methods ──────────────────────────────────────

    /// Ensure the schema is created and at the current version.
    /// Runs migrations if needed.
    fn ensure_schema(&mut self) -> Result<(), IndexError> {
        todo!()
    }

    /// Run schema migrations from the current version to the target.
    fn run_migrations(&mut self, from: u32, to: u32) -> Result<(), IndexError> {
        todo!()
    }

    /// Compute SHA-256 hash of file contents.
    fn hash_file(path: &Path) -> Result<String, IndexError> {
        todo!()
    }

    /// Strip Markdown formatting from body text for FTS indexing.
    fn strip_markdown(body: &str) -> String {
        todo!()
    }
}
```

### 12.3 Result Types

```rust
/// Result of a full reindex operation.
#[derive(Debug)]
pub struct ReindexResult {
    /// Number of items successfully indexed.
    pub indexed: u32,
    /// Number of files that produced warnings during parsing.
    pub warnings: u32,
    /// Warning messages for files that had issues.
    pub warning_messages: Vec<String>,
    /// Duration of the reindex operation.
    pub duration: std::time::Duration,
}

/// Result of an incremental sync operation.
#[derive(Debug)]
pub struct SyncResult {
    /// Number of new items added to the index.
    pub added: u32,
    /// Number of existing items updated in the index.
    pub updated: u32,
    /// Number of items removed from the index (file deleted).
    pub removed: u32,
    /// Number of items unchanged (hash matched).
    pub unchanged: u32,
}
```

### 12.4 Error Types

```rust
/// Errors that can occur during index operations.
#[derive(Debug)]
pub enum IndexError {
    /// SQLite database error.
    Sqlite(rusqlite::Error),

    /// File I/O error.
    Io(std::io::Error),

    /// Work item file could not be parsed.
    Parse {
        file_path: String,
        message: String,
    },

    /// Schema version mismatch that could not be resolved by migration.
    SchemaVersion {
        found: u32,
        expected: u32,
    },

    /// The database file is corrupt and should be rebuilt.
    Corrupt {
        message: String,
    },
}

impl From<rusqlite::Error> for IndexError {
    fn from(e: rusqlite::Error) -> Self {
        IndexError::Sqlite(e)
    }
}

impl From<std::io::Error> for IndexError {
    fn from(e: std::io::Error) -> Self {
        IndexError::Io(e)
    }
}
```

### 12.5 Crate Dependencies

The index implementation uses the `rusqlite` crate with the `bundled` feature flag, which
compiles SQLite from source and statically links it. This eliminates the need for a
system-installed SQLite library and guarantees a consistent SQLite version across platforms.

```toml
# Cargo.toml
[dependencies]
rusqlite = { version = "0.31", features = ["bundled", "column_decltype"] }
sha2 = "0.10"          # SHA-256 for file hashing
chrono = "0.4"          # Timestamp formatting
```

---

## 13. Validation Rules

These rules are testable invariants. Each maps to one or more unit tests.

### Index Consistency Rules

| Rule | Given | When | Then |
|---|---|---|---|
| IX-01 | `.index.db` does not exist | Any `cmt` command is run | Full reindex is triggered, database is created |
| IX-02 | `.index.db` exists with current schema version | Any `cmt` command is run | Database is opened normally, no migration |
| IX-03 | `.index.db` exists with older schema version | Any `cmt` command is run | Migrations run to bring schema to current version |
| IX-04 | `.index.db` exists with newer schema version | Any `cmt` command is run | Database is deleted and rebuilt from files |
| IX-05 | `_meta` table does not exist in database | Any `cmt` command is run | Database is deleted and rebuilt from files |
| IX-06 | A file exists in `items/` but not in the index | Incremental sync runs | File is parsed and inserted into the index |
| IX-07 | An index entry exists but the file is gone | Incremental sync runs | Index entry is deleted (CASCADE removes tags, deps, relations) |
| IX-08 | A file's hash differs from `body_hash` in index | Incremental sync runs | File is re-parsed and the index entry is updated |
| IX-09 | A file's hash matches `body_hash` in index | Incremental sync runs | File is skipped (no re-parse, no update) |

### Dual-Write Rules

| Rule | Given | When | Then |
|---|---|---|---|
| IX-10 | `cmt add "Fix bug"` is run | Command completes successfully | Both the file and the index contain the new item |
| IX-11 | `cmt status CMT-42 done` is run | Command completes successfully | Both the file and the index reflect `status: done` and `completed_at` timestamp |
| IX-12 | `cmt edit CMT-42 --set title="New title"` is run | Command completes successfully | Both the file and the index reflect the new title |
| IX-13 | File write succeeds but index update fails | Command completes with warning | File has the new content; index is stale. Next sync corrects the index. |
| IX-14 | `cmt archive CMT-42` is run | Command completes successfully | File moved to `archive/`, index row updated with `archived = 1` and new `file_path` |

### ID Counter Rules

| Rule | Given | When | Then |
|---|---|---|---|
| IX-20 | `id_counters` has `WM: 43` | `cmt add "task"` is run | Item gets ID `CMT-43`, counter becomes `WM: 44` |
| IX-21 | `id_counters` has no row for prefix `BUG` | `cmt add --type bug "crash"` is run | Counter is bootstrapped from existing `BUG-*` items, new ID assigned |
| IX-22 | No items exist with prefix `FEAT` | `cmt add --type feature "login"` is run | Counter initialized to `1`, item gets `FEAT-1` |
| IX-23 | `cmt reindex` is run | Reindex completes | All counters rebuilt from actual max IDs per prefix |
| IX-24 | Two processes call `next_id("CMT")` concurrently | Both complete | Each gets a unique number (no duplicates) |

### FTS Rules

| Rule | Given | When | Then |
|---|---|---|---|
| IX-30 | An item with title "Implement JWT authentication" is indexed | `cmt search "JWT"` is run | The item appears in search results |
| IX-31 | An item body contains "OAuth2 bearer tokens" | `cmt search "bearer"` is run | The item appears in search results with a body snippet |
| IX-32 | An item is deleted from the index | `cmt search` for its content is run | The item does not appear in search results |
| IX-33 | An item title is updated from "Old" to "New" | `cmt search "Old"` is run | The item does not appear (FTS reflects the update) |
| IX-34 | An item title is updated from "Old" to "New" | `cmt search "New"` is run | The item appears with the new title |
| IX-35 | An item body contains "authenticating" | `cmt search "authentication"` is run | The item appears (porter stemming matches) |

### Query Rules

| Rule | Given | When | Then |
|---|---|---|---|
| IX-40 | 5 items with `status: active`, 3 with `status: done` | `cmt list --status active` is run | Exactly 5 results returned |
| IX-41 | Item `CMT-10` has children `CMT-11`, `CMT-12` | `cmt list --parent CMT-10` is run | Exactly 2 results returned: `CMT-11` and `CMT-12` |
| IX-42 | Item tagged `team:backend` and `sprint:2026-w08` | `cmt list --tag team:backend` is run | Item appears in results |
| IX-43 | 10 archived items exist | `cmt list` (default) is run | No archived items in results |
| IX-44 | 10 archived items exist | `cmt list --all` is run | All 10 archived items included in results |
| IX-45 | Item assigned to `["alice", "bob"]` | `cmt list --assignee alice` is run | Item appears in results |

---

## 14. Edge Cases

### 14.1 Corrupt Database

| Scenario | Detection | Recovery |
|---|---|---|
| `.index.db` is a zero-byte file | SQLite returns "not a database" error on open | Delete the file, trigger full reindex |
| `.index.db` has corrupted pages | SQLite returns `SQLITE_CORRUPT` | Delete the file, trigger full reindex |
| `.index.db` has a partial write (process killed during write) | WAL mode protects against this; SQLite replays the WAL on open | Automatic recovery by SQLite |
| `.index.db` WAL file is corrupt | SQLite may fail to open | Delete both `.index.db` and `.index.db-wal`, trigger full reindex |

The general recovery strategy is always the same: delete the database file and rebuild.
Since the index is derived from files, no data is ever lost.

### 14.2 Missing Database

| Scenario | Behavior |
|---|---|
| `.index.db` does not exist at all | Created on first use with full schema + full reindex |
| `.index.db` is deleted between commands | Recreated transparently on next command |
| `.index.db` is deleted during a command (unlikely race) | SQLite holds a file descriptor; the command completes normally. Next command creates a new database. |

### 14.3 Concurrent Access

| Scenario | Behavior |
|---|---|
| Two `cmt list` commands run simultaneously | Safe. WAL mode allows concurrent readers. Both get consistent snapshots. |
| `cmt list` and `cmt add` run simultaneously | Safe. WAL mode allows readers concurrent with a single writer. The reader sees the state before or after the write, never a partial state. |
| Two `cmt add` commands run simultaneously | Safe but serialized. SQLite's write lock ensures only one writer at a time. The second writer waits up to `busy_timeout` (5s). Both get unique IDs from `id_counters`. |
| `cmt reindex` and `cmt add` run simultaneously | `cmt reindex` uses `BEGIN EXCLUSIVE` which blocks all other access. `cmt add` waits up to 5s. If reindex takes longer, `cmt add` fails with a busy error and the user must retry. |
| `cmt reindex` from two terminals | The second `cmt reindex` waits for the first to finish (EXCLUSIVE lock). It then runs its own full reindex, which is redundant but harmless. |

### 14.4 Race Conditions

| Scenario | Behavior |
|---|---|
| File is modified externally between read and index update | The next incremental sync detects the hash mismatch and re-indexes the file. The index may be momentarily stale. |
| File is deleted externally while `cmt show` reads it | `cmt show` gets the file path from the index, then fails to read the file. It reports: "Item CMT-42 is in the index but the file is missing. Run `cmt reindex` to fix." |
| Two processes call `next_id()` with the same prefix | SQLite's `BEGIN IMMEDIATE` serializes the counter increment. Both get unique, sequential numbers. |
| A file is created manually (not via `cmt add`) | Not detected until the next incremental sync. Once sync runs, the file is parsed and added to the index. Counter is not automatically updated; `cmt reindex` corrects counters. |

### 14.5 Large Bodies

| Scenario | Behavior |
|---|---|
| Work item body is >1MB | Valid. Full body is indexed for FTS. SHA-256 hashing and FTS indexing may be slower but there is no hard limit. |
| Work item body is >10MB | Valid but discouraged. FTS indexing may take >100ms per file. Reindex time increases proportionally. Consider extracting large content into `evidence/` subdirectory of a complex item. |
| Work item with binary content in body | UTF-8 parsing succeeds or fails at the file level. If the body contains invalid UTF-8, the file fails to parse (spec 01 edge case). |

### 14.6 ID Collisions

| Scenario | Detection | Recovery |
|---|---|---|
| Two files have the same `id` in their frontmatter | On reindex, the second file silently overwrites the first in the index (PRIMARY KEY conflict resolved by REPLACE). `cmt check` reports: "Duplicate ID 'CMT-42' found in files X and Y." | User must manually rename one of the items. |
| `id_counters` says next is 42, but `CMT-42.md` already exists | `cmt add` generates `CMT-42`, then attempts to write the file. File creation fails if the file already exists. The CLI reports the error and suggests running `cmt reindex` to fix the counter. | `cmt reindex` scans all files and resets the counter to max+1. |
| Manual file creation with an ID higher than the counter | The counter is stale. The next `cmt add` may generate a colliding ID. | `cmt reindex` corrects the counter. The `cmt add` command also checks for file existence before writing and reports a collision if detected. |

### 14.7 Empty and Degenerate Cases

| Scenario | Behavior |
|---|---|
| Zero work items (empty `items/` and `archive/`) | Index is valid with zero rows. `cmt list` returns empty results. `id_counters` is empty. |
| `items/` directory does not exist | Created by `cmt init`. If missing at sync time, treated as empty. |
| `archive/` directory does not exist | Treated as empty (no archived items). Created on first archive operation. |
| A `.md` file in `items/` that is not a valid work item | Skipped during reindex with a warning. Not added to the index. |
| A directory in `items/` without an `item.md` | Skipped during reindex with a warning: "Directory CMT-42/ exists but contains no item.md". |
| Non-`.md` files in `items/` (e.g., `.DS_Store`) | Silently ignored during file scanning. Only `.md` files are considered. |

---

## Appendix: Cross-References

| Topic | Spec |
|---|---|
| Work item schema, field definitions, types | [Spec 01: Work Item Schema](01-work-item-schema.md) |
| Status field semantics, state machine validation | [Spec 02: State Machine](02-state-machine.md) |
| CLI commands that trigger index operations | Spec 03: CLI Interface |
| Config format including `id.prefixes` and `project.prefix` | [Spec 04: Config Format](04-config-format.md) |
| YAML+SQLite dual-write pattern (origin) | `docs/research/01-industry-landscape.md` Section 11.1 |
| O(n) scanning problem motivating the index | `docs/research/01-industry-landscape.md` |
| Architectural decision for storage layer | `docs/research/02-first-principles.md` Section 1 |

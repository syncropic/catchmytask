---
spec: "01"
title: Work Item Schema
status: draft
version: 0.1.0
created: 2026-02-23
depends_on: []
---

# Spec 01: Work Item Schema

## 1. Overview

A **work item** is the fundamental unit of the catchmytask system. It is a Markdown file
with YAML frontmatter, stored in the `.cmt/items/` directory. The file is simultaneously
human-readable (open it in any text editor) and machine-parsable (structured YAML metadata
+ Markdown body).

### Guiding Principles

- **Four required fields; everything else optional** (`id`, `title`, `status`, `created_at`)
- **Extension fields preserved on round-trip** (no `extra="forbid"` -- lesson from task-platform)
- **Progressive disclosure**: Level 0 uses only required fields. Higher levels add optional fields.
- **The file is the source of truth**. The SQLite index (spec 05) is derived from files.

### References

- Research: `docs/research/06-first-principles.md` Section I (The Work Item as Atom)
- Research: `docs/research/01-task-platform-analysis.md` (data model, schema drift lessons)
- Design principles: Atoms and Composition, Files as Foundation, Progressive Capability

---

## 2. File Format

### Structure

A work item file consists of two parts:

```
---                          ← opening frontmatter delimiter
<YAML frontmatter>           ← structured metadata
---                          ← closing frontmatter delimiter
<Markdown body>              ← freeform content (description, notes, log)
```

### Encoding

- **Character encoding**: UTF-8
- **Line endings**: LF (`\n`). CRLF is accepted on read, normalized to LF on write.
- **Frontmatter delimiters**: Exactly `---` on its own line (three hyphens, no leading/trailing whitespace)
- **YAML version**: YAML 1.2 (as parsed by `serde_yaml`)

### Parsing Rules

1. Read the file as UTF-8 text. If the file begins with a UTF-8 BOM (byte sequence `0xEF 0xBB 0xBF`), strip it before further processing.
2. If the file starts with `---\n`, scan for the next `---\n` to delimit the frontmatter
3. Parse the content between delimiters as YAML into the `WorkItem` struct
4. Everything after the closing `---\n` is the Markdown body (preserved as a raw `String`)
5. If the file does not start with `---\n`, it is a parse error

### Round-Trip Guarantee

When the system reads a work item file and writes it back without modifications, the YAML
frontmatter keys and values must be preserved exactly (including unknown extension fields).
The Markdown body must be preserved byte-for-byte. Field ordering in YAML output uses
`BTreeMap` for deterministic order.

---

## 3. Required Fields

Every work item **must** have these four fields. A file missing any of them is invalid.

### `id`

- **Type**: `String`
- **Format**: `PREFIX-NUMBER` where PREFIX is 1-8 uppercase alphanumeric characters and NUMBER is 1-6 digits
- **Regex**: `^[A-Z][A-Z0-9]{0,7}-[0-9]{1,6}$`
- **Examples**: `CMT-1`, `CMT-0042`, `BUG-001`, `FEAT-12`, `PROJ2-100`
- **Uniqueness**: Must be unique within the `.cmt/` directory (enforced by filename convention)
- **Immutability**: Once assigned, an ID never changes
- **Auto-increment**: The next number for a given prefix is determined by the SQLite index (spec 05). If no index exists, scan all files for the given prefix.

### `title`

- **Type**: `String`
- **Constraints**: Non-empty, maximum 200 characters
- **Examples**: `"Fix the login bug"`, `"Implement JWT authentication"`
- **Usage**: The primary human-readable identifier. Displayed in lists, search results, and logs.

### `status`

- **Type**: `String`
- **Constraints**: Must be a valid state in the applicable state machine (spec 02)
- **Default states**: `inbox`, `ready`, `active`, `blocked`, `done`, `cancelled`
- **Validation**: At parse time, the status string is checked against the state machine resolved for this item's `type` field. If `type` is absent or has no matching state machine, the `default` state machine is used.

### `created_at`

- **Type**: `DateTime` (RFC 3339 / ISO 8601 with timezone)
- **Format**: `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+HH:MM`
- **Examples**: `2026-02-23T10:30:00Z`, `2026-02-23T03:30:00-07:00`
- **Immutability**: Set once at creation, never modified
- **Auto-set**: The CLI sets this to `now()` when creating an item

---

## 4. Standard Optional Fields

These fields are recognized by the system and have defined semantics. All are optional.
When absent, they are omitted from the YAML output (not written as `null`).

### `type`

- **Type**: `String`
- **Purpose**: Determines which state machine applies (spec 02) and which ID prefix to use (spec 04)
- **Convention**: Lowercase, hyphenated (e.g., `task`, `bug`, `feature`, `epic`, `investigation`)
- **No fixed enum**: Any string is valid. The system looks up the matching state machine by name.

### `priority`

- **Type**: `String` (enum)
- **Values**: `critical`, `high`, `medium`, `low`, `none`
- **Default**: `none` (when omitted, treated as `none` for sorting purposes)
- **Sort order**: critical > high > medium > low > none

### `assignee`

- **Type**: `String` or `String[]`
- **Purpose**: The actor(s) responsible for this work item
- **Format**: Freeform string identifiers (e.g., `"alice"`, `"claude-agent"`, `"ci-bot"`)
- **Single**: `assignee: alice`
- **Multiple**: `assignee: [alice, bob]`
- **Actor-agnostic**: No distinction between human and agent identifiers

### `parent`

- **Type**: `String` (WorkItemId)
- **Purpose**: Points to the parent work item for hierarchical composition
- **Format**: Same as `id` field (e.g., `CMT-0010`)
- **Inverse**: Children are discovered by querying items where `parent` equals this item's `id`

### `depends_on`

- **Type**: `String[]` (list of WorkItemId)
- **Purpose**: Items that must be completed before this one can start
- **Format**: `depends_on: [CMT-0039, CMT-0040]`
- **Inverse**: "blocks" relationships are derived -- if A depends on B, then B blocks A
- **Note**: Existence of referenced IDs is not validated at parse time (they may be in another repo or archived)

### `tags`

- **Type**: `String[]`
- **Format**: `namespace:value` with optional hierarchy via `/`
- **Pattern**: `[a-z0-9-]+:[a-z0-9-/]+` (recommended, not enforced as error -- emits warning)
- **Examples**: `["team:backend", "domain:auth/login", "sprint:2026-w08", "effort:large"]`
- **Bare tags**: Tags without a namespace (e.g., `"urgent"`) are valid but discouraged

### `due`

- **Type**: `Date` (ISO 8601)
- **Format**: `YYYY-MM-DD`
- **Example**: `due: 2026-03-15`

### `started_at`

- **Type**: `DateTime` (RFC 3339)
- **Auto-set**: Set automatically on the first transition to a non-initial, non-terminal state (typically `active`)
- **Manual override**: Can be set manually in the frontmatter

### `completed_at`

- **Type**: `DateTime` (RFC 3339)
- **Auto-set**: Set automatically on transition to a terminal state (`done`, `cancelled`)
- **Manual override**: Can be set manually in the frontmatter

### `updated_at`

- **Type**: `DateTime` (RFC 3339)
- **Auto-set**: Updated on every mutation via the `cmt` CLI
- **Manual edits**: Not updated when the user edits the file directly (only the CLI sets this)

### `blocked_reason`

- **Type**: `String`
- **Required when**: `status == "blocked"` (validation error if missing)
- **Cleared**: Automatically removed when transitioning out of `blocked`

### `related`

- **Type**: `Array of {id: String, type: String}`
- **Purpose**: Typed relationships to other work items
- **Relationship types**: `duplicates`, `related`, `implements`, `tests`, `documents`
- **Example**:
  ```yaml
  related:
    - id: CMT-0010
      type: implements
    - id: CMT-0055
      type: duplicates
  ```
- **Note**: `parent`/`depends_on` are separate fields because they have system-level semantics (hierarchy, blocking). `related` is for informational links.

---

## 5. Extension Fields

Any YAML key not in the standard set above is treated as an **extension field**. Extension
fields are preserved on round-trip (read and written back exactly).

### Rules

- Extension field names must be valid YAML keys
- The reserved prefix `_wm_` is reserved for future system use. Users should not create fields starting with `_wm_`.
- Extension fields are stored in the SQLite index only if they are scalar values (string, number, boolean). Complex values (maps, arrays) are not indexed but are preserved in the file.
- Extension fields appear in `cmt show --json` output under their original key names

### Use Cases

- Domain-specific metadata: `client: wyndham`, `environment: production`
- Integration fields: `jira_key: PROJ-123`, `github_pr: 456`
- Custom workflow data: `review_count: 3`, `approval: pending`

### Rust Implementation

Extension fields are captured using `serde(flatten)`:

```rust
#[serde(flatten)]
pub extra: BTreeMap<String, serde_yaml::Value>,
```

`BTreeMap` (not `HashMap`) ensures deterministic key ordering in serialized output.

---

## 6. File Naming and Path Conventions

### Simple Items

A simple work item is a single Markdown file:

```
.cmt/items/CMT-0042.md
```

The filename is the ID with `.md` extension. The ID in the filename **must** match the `id`
field in the frontmatter.

### Complex Items

A complex work item is a directory containing the item file plus supporting artifacts:

```
.cmt/items/CMT-0042/
  item.md              # The work item itself (required)
  evidence/            # Supporting artifacts (screenshots, logs, data)
  queries/             # Investigation queries (SQL, API calls)
  handover/            # Handoff documents between actors
```

The directory name is the ID. The item file is always named `item.md` inside the directory.

### Detection

When resolving an ID to a file path:

1. Check for `.cmt/items/{ID}.md` (simple item)
2. Check for `.cmt/items/{ID}/item.md` (complex item)
3. Check for `.cmt/archive/{ID}.md` (archived simple)
4. Check for `.cmt/archive/{ID}/item.md` (archived complex)
5. If none found, item does not exist

### Conversion

An item can be converted from simple to complex:

```
# Before: .cmt/items/CMT-0042.md
# After:  .cmt/items/CMT-0042/item.md
```

The CLI command `cmt edit CMT-0042 --complex` performs this conversion (creates directory,
moves file, creates subdirectories).

### Archive

When an item is archived, its file or directory is moved from `items/` to `archive/`:

```
.cmt/items/CMT-0042.md  →  .cmt/archive/CMT-0042.md
.cmt/items/CMT-0042/    →  .cmt/archive/CMT-0042/
```

---

## 7. ID Format and Auto-Increment

### Format

```
PREFIX-NUMBER

PREFIX:  1-8 uppercase ASCII letters/digits, starting with a letter
         Regex: [A-Z][A-Z0-9]{0,7}
NUMBER:  1-6 digit integer (no leading zeros required, but allowed)
         Regex: [0-9]{1,6}

Full regex: ^[A-Z][A-Z0-9]{0,7}-[0-9]{1,6}$
```

### Examples

| ID | Prefix | Number |
|---|---|---|
| `CMT-1` | `WM` | `1` |
| `CMT-0042` | `WM` | `42` |
| `BUG-001` | `BUG` | `1` |
| `FEAT-12` | `FEAT` | `12` |
| `PROJ2-100` | `PROJ2` | `100` |

### Display Normalization

IDs are stored as-is in the frontmatter. For display, the number portion is zero-padded
to 4 digits by default (configurable). So `CMT-1` displays as `CMT-0001` in lists but is
stored as `CMT-1` in the file.

### Auto-Increment

When creating a new item with `cmt add`:

1. Determine the prefix (from `--type` mapped to config prefix, or default prefix)
2. Query the `id_counters` table in the SQLite index for the next number (spec 05)
3. If no counter exists for this prefix, scan all files to find the max number, initialize counter
4. Format the ID as `PREFIX-NUMBER` (number zero-padded to match existing convention in the project)
5. Increment the counter

### Filename Matching

The ID in the filename must match the `id` field in the frontmatter. On `cmt reindex`,
mismatches are reported as validation warnings.

---

## 8. Markdown Body Convention

The Markdown body after the closing `---` is freeform. The system does not parse or
validate it. However, the following structure is **recommended** (not enforced):

```markdown
## Description

A clear description of what this work item is about.

## Acceptance Criteria

- [ ] First criterion
- [ ] Second criterion
- [x] Third criterion (completed)

## Log

- 2026-02-23: Created during sprint planning (@alice)
- 2026-02-24: Started implementation, discovered dependency on CMT-0039
- 2026-02-25: Blocked on CMT-0039, see blocked_reason in frontmatter

## Context

Related decisions: [ADR-005](../decisions/adr-005.md)
Architecture diagram: [auth-flow.png](evidence/auth-flow.png)
```

### Checklist Extraction

The CLI may parse `- [ ]` and `- [x]` patterns from the body to display progress
(e.g., "3/5 criteria met"). This is a display feature only -- the authoritative acceptance
state is determined by the `status` field, not checklist completion.

---

## 9. Rust Type Mapping

### Core Types

```rust
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// The fundamental work item structure.
/// Parsed from YAML frontmatter of a Markdown file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkItem {
    // ── Required ──────────────────────────────────────
    pub id: WorkItemId,
    pub title: String,
    pub status: String,
    pub created_at: DateTime<Utc>,

    // ── Standard Optional ─────────────────────────────
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub priority: Option<Priority>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<Assignee>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent: Option<WorkItemId>,

    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub depends_on: Vec<WorkItemId>,

    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub due: Option<NaiveDate>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub started_at: Option<DateTime<Utc>>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<DateTime<Utc>>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocked_reason: Option<String>,

    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub related: Vec<Relation>,

    // ── Extension Fields ──────────────────────────────
    /// Unknown fields are preserved on round-trip.
    /// BTreeMap ensures deterministic serialization order.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_yaml::Value>,
}

/// A work item ID in PREFIX-NUMBER format.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(try_from = "String", into = "String")]
pub struct WorkItemId {
    pub prefix: String,
    pub number: u32,
    pub raw: String,  // original string as written in the file
}

/// Priority levels with defined sort order.
///
/// Sort order: critical > high > medium > low > none.
///
/// **Note**: `Ord` is implemented manually (not derived) because the derived
/// `Ord` produces ascending variant order (Critical=0 < High=1 < ...), which
/// is the opposite of the desired semantic ordering. Our manual impl defines
/// `Critical` as the *greatest* priority so that `items.sort()` places the
/// highest priority first when using reverse ordering, and `CASE` expressions
/// in SQL use `critical=0` (numerically smallest = highest priority) for
/// `ORDER BY ... ASC` to achieve the same result.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Critical,
    High,
    Medium,
    Low,
    None,
}

impl Priority {
    /// Returns a numeric rank where lower values represent higher priority.
    /// Used for SQL CASE expressions and in-memory sorting.
    /// critical=0, high=1, medium=2, low=3, none=4.
    pub fn rank(&self) -> u8 {
        match self {
            Priority::Critical => 0,
            Priority::High => 1,
            Priority::Medium => 2,
            Priority::Low => 3,
            Priority::None => 4,
        }
    }
}

impl Ord for Priority {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // Lower rank = higher priority, so we reverse the comparison.
        // This makes Critical > High > Medium > Low > None.
        self.rank().cmp(&other.rank()).reverse()
    }
}

impl PartialOrd for Priority {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

/// An assignee can be a single actor or multiple actors.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Assignee {
    Single(String),
    Multiple(Vec<String>),
}

/// A typed relationship to another work item.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relation {
    pub id: WorkItemId,
    pub r#type: String,
}
```

### WorkItemId Parsing

```rust
impl TryFrom<String> for WorkItemId {
    type Error = String;

    fn try_from(s: String) -> Result<Self, String> {
        use std::sync::LazyLock;
        static RE: LazyLock<regex::Regex> = LazyLock::new(|| {
            regex::Regex::new(r"^([A-Z][A-Z0-9]{0,7})-([0-9]{1,6})$").unwrap()
        });
        match RE.captures(&s) {
            Some(caps) => Ok(WorkItemId {
                prefix: caps[1].to_string(),
                number: caps[2].parse().unwrap(),
                raw: s,
            }),
            None => Err(format!(
                "Invalid work item ID '{}'. Expected format: PREFIX-NUMBER (e.g., CMT-0042)",
                s
            )),
        }
    }
}

impl From<WorkItemId> for String {
    fn from(id: WorkItemId) -> String {
        id.raw
    }
}
```

### File Representation

```rust
/// A complete work item file: frontmatter + body.
pub struct WorkItemFile {
    pub item: WorkItem,
    pub body: String,        // Markdown content after the closing ---
    pub file_path: PathBuf,  // Relative path from .cmt/
}
```

---

## 10. Validation Rules

These rules are testable invariants. Each maps to one or more unit tests.

### Parse-Time Validation (on file read)

| Rule | Condition | Severity | Message |
|---|---|---|---|
| V-01 | `id` matches regex `^[A-Z][A-Z0-9]{0,7}-[0-9]{1,6}$` | Error | "Invalid ID format '{id}'. Expected PREFIX-NUMBER (e.g., CMT-0042)" |
| V-02 | `title` is non-empty | Error | "Title is required and must not be empty" |
| V-03 | `title` length <= 200 chars | Warning | "Title exceeds 200 characters, consider shortening" |
| V-04 | `status` is present | Error | "Status is required" |
| V-05 | `created_at` is a valid RFC 3339 datetime | Error | "Invalid created_at date. Expected ISO 8601 format (e.g., 2026-02-23T10:30:00Z)" |
| V-06 | `id` in frontmatter matches filename | Warning | "ID '{id}' does not match filename '{filename}'" |
| V-07 | File starts with `---\n` | Error | "Work item file must start with YAML frontmatter (---)" |
| V-08 | Tags match `[a-z0-9-]+:[a-z0-9-/]+` pattern | Warning | "Tag '{tag}' does not follow namespace:value convention" |

### Semantic Validation (requires state machine context)

| Rule | Condition | Severity | Message |
|---|---|---|---|
| V-10 | `status` is a valid state in the applicable state machine | Error | "Status '{status}' is not valid. Valid states: {states}" |
| V-11 | If `status == "blocked"`, `blocked_reason` is present | Error | "blocked_reason is required when status is 'blocked'" |
| V-12 | If `completed_at` is set, `status` is a terminal state | Warning | "completed_at timestamp is set but status '{status}' is not terminal" |
| V-13 | `depends_on` entries match ID format | Warning | "depends_on entry '{dep}' is not a valid work item ID" |
| V-14 | `parent` matches ID format | Warning | "parent '{parent}' is not a valid work item ID" |
| V-15 | `depends_on` does not create a cycle (requires full graph) | Warning | "Dependency cycle detected: {id} -> ... -> {id}" |

### Validation Severity

- **Error**: The file cannot be loaded. The CLI reports the error and refuses the operation.
- **Warning**: The file can be loaded, but the issue should be reported. The CLI prints warnings but proceeds.

---

## 11. Examples

### Level 0: Minimal (Solo Developer)

```markdown
---
id: CMT-1
title: Fix the login bug
status: inbox
created_at: 2026-02-23T10:30:00Z
---

The login form throws a 500 error when the email contains a `+` character.
```

### Level 1: Organized Individual

```markdown
---
id: CMT-42
title: Implement JWT authentication
status: active
created_at: 2026-02-15T10:30:00Z
type: feature
priority: high
assignee: alice
tags: [security, backend, sprint:2026-w08]
due: 2026-03-01
started_at: 2026-02-20T09:00:00Z
---

## Description

Implement JWT-based authentication for the API. Replace the current session-based auth.

## Acceptance Criteria

- [ ] Users can log in with email and password
- [ ] JWT tokens expire after 24 hours
- [ ] Refresh token rotation implemented
- [x] Database schema updated for token storage
```

### Level 2: Team with Dependencies

```markdown
---
id: FEAT-12
title: User profile page
status: blocked
created_at: 2026-02-10T14:00:00Z
type: feature
priority: medium
assignee: [bob, carol]
parent: EPIC-3
depends_on: [FEAT-10, FEAT-11]
blocked_reason: "Waiting on FEAT-10 (API endpoints) to be completed"
tags: [team:frontend, domain:user-management, sprint:2026-w09]
related:
  - id: BUG-5
    type: related
  - id: FEAT-10
    type: implements
---

## Description

Build the user profile page with editable fields and avatar upload.

## Acceptance Criteria

- [ ] Display user name, email, avatar
- [ ] Edit name and email with validation
- [ ] Upload avatar (max 2MB, jpg/png)
- [ ] Mobile-responsive layout

## Log

- 2026-02-10: Created during sprint planning
- 2026-02-15: Blocked on FEAT-10, API endpoints not ready yet
```

### Level 3: With Extension Fields

```markdown
---
id: WHR-6
title: Investigate points discrepancy for CS-P-294112
status: active
created_at: 2026-02-20T08:00:00Z
type: investigation
priority: high
assignee: dpwanjala
tags: [team:data-eng, client:wyndham, domain:loyalty/points]
client: wyndham
product: travel-bundle
stakeholder: alayna.martinez
jira_key: RI-7360
sla_hours: 48
---

## Description

Customer reports incorrect points balance after booking cancellation.

## Investigation Queries

See `queries/` directory for SQL investigation scripts.

## Log

- 2026-02-20: Received from CS, initial triage
- 2026-02-21: Identified root cause in cancellation ETL pipeline
```

### Complex Item (Folder Structure)

```
.cmt/items/WHR-6/
  item.md                           # The work item above
  evidence/
    customer-screenshot.png         # CS ticket screenshot
    points-audit-2026-02-20.csv     # Data export
  queries/
    find-booking.sql                # SQL to locate the booking
    check-points-flow.sql           # SQL to trace points transactions
  handover/
    AI-HANDOVER.md                  # Context for agent pickup
```

---

## 12. Edge Cases and Error Handling

| Scenario | Behavior |
|---|---|
| File has no frontmatter (no `---`) | Parse error: "Work item file must start with YAML frontmatter" |
| Frontmatter has duplicate YAML keys | Last value wins (YAML 1.2 spec), emit warning |
| File is not valid UTF-8 | Parse error: "File is not valid UTF-8" |
| File is empty (0 bytes) | Parse error: "Work item file is empty" |
| Frontmatter but no body | Valid (body is empty string) |
| Body but no frontmatter fields | Parse error for each missing required field |
| Very large file (>1MB body) | Valid, but frontmatter-only parsing is available for indexing |
| `id` in frontmatter doesn't match filename | Warning (not error -- the frontmatter is authoritative) |
| Extension field named `_wm_something` | Warning: "Fields starting with _wm_ are reserved for system use" |
| Tag without namespace (bare tag) | Warning: "Tag 'urgent' does not follow namespace:value convention" |
| Multiple `assignee` entries with duplicates | Valid (no dedup -- preserved as-is) |
| `depends_on` contains own ID (self-reference) | Warning: "Item depends on itself" |
| `created_at` with no timezone | Parse error: "created_at must include timezone (e.g., 2026-02-23T10:30:00Z)" |
| File starts with UTF-8 BOM (0xEF 0xBB 0xBF) | BOM is stripped before parsing. Frontmatter detection starts after the BOM. BOM is not written back on save. |
| `depends_on` creates a cycle (A→B→A) | Warning (V-15): "Dependency cycle detected: {cycle_path}". Cycles are detected by `cmt check` via graph traversal. Items with cyclic deps remain loadable but `cmt check` flags them. |
| `created_at` with non-UTC timezone (e.g., `-07:00`) | Preserved as-is in the file. The `created_at` field is stored verbatim (no normalization to UTC). The SQLite index stores the original string for faithful round-trip. Comparison queries normalize at query time via SQLite `datetime()`. |

---

## Appendix: Cross-References

| Topic | Spec |
|---|---|
| Status field validation and transitions | [Spec 02: State Machine](02-state-machine.md) |
| CLI commands for creating/editing items | [Spec 03: CLI Interface](03-cli-interface.md) |
| Default values and prefix configuration | [Spec 04: Config Format](04-config-format.md) |
| SQLite column mapping and indexing | [Spec 05: SQLite Index](05-sqlite-index.md) |

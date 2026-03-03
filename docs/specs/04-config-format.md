---
spec: "04"
title: Config Format
status: draft
version: 0.1.0
created: 2026-02-23
depends_on: ["01", "02"]
---

# Spec 04: Config Format

## 1. Overview

The file `.cmt/config.yml` is the project-level configuration for a catchmytask instance.
It defines project metadata, default values for new work items, ID prefix mappings, state
machine definitions, tag namespaces, archive policies, and git integration settings.

### Core Principle

**Every field has a sensible default.** A missing or empty `config.yml` produces a fully
functional configuration. Users add sections only when they need to override defaults.
This follows Principle 7 (Progressive Capability) and Principle 9 (Convention Over
Configuration) from the first-principles research.

### Guiding Principles

- **Progressive disclosure**: `cmt init` creates a minimal config. Users add complexity on demand.
- **Round-trip preservation**: Unknown top-level keys are preserved on read/write cycles (same
  pattern as work item extension fields in spec 01).
- **Single file**: All project-level configuration lives in one YAML file. No fragmentation.
- **Defaults in code**: The Rust binary carries all defaults. The config file contains only
  overrides. This means the file is optional -- `cmt` functions without it by using hardcoded
  defaults, though `cmt init` always creates one.

### References

- Research: `docs/research/06-first-principles.md` Section IX (Progressive Disclosure)
- Research: `docs/research/02-data-platform-analysis.md` Section 7 (Configuration Management)
- Research: `docs/research/00-synthesis.md` (Architectural Decisions)
- Design principles: Progressive Capability, Convention Over Configuration, Files as Foundation

---

## 2. Full Config Schema

The complete config file with all sections and their default values:

```yaml
# .cmt/config.yml -- Project configuration for catchmytask
# All sections are optional. Missing values use hardcoded defaults.

version: 1

project:
  name: "my-project"       # Inferred from directory name if omitted
  prefix: "CMT"             # Default ID prefix for new items
  description: ""           # Optional project description

defaults:
  priority: none            # Default priority for new items
  type: task                # Default type for new items
  status: inbox             # Default initial status for new items
  assignee: null            # No default assignee

id:
  prefixes:                 # Per-type prefix overrides
    bug: "BUG"
    feature: "FEAT"
    epic: "EPIC"
  pad_width: 4              # Zero-pad numbers to this width in display

state_machines:
  default:
    states:
      inbox: { initial: true }
      ready: {}
      active: {}
      blocked: {}
      done: { terminal: true }
      cancelled: { terminal: true }
    transitions:
      - { from: inbox, to: ready }
      - { from: inbox, to: cancelled }
      - { from: ready, to: active }
      - { from: ready, to: cancelled }
      - { from: active, to: blocked }
      - { from: active, to: done }
      - { from: active, to: cancelled }
      - { from: blocked, to: active }
      - { from: blocked, to: cancelled }

tags:
  namespaces: [team, domain, sprint, priority]

archive:
  auto_archive: false
  auto_archive_after_days: 7

git:
  auto_commit: false
  commit_prefix: "work"
```

---

## 3. Section Details

### 3.1 `version`

- **Type**: Integer
- **Default**: `1`
- **Purpose**: Config format version, used for forward-compatible migration. When the config
  format changes in a backward-incompatible way, the version number increments.
- **Behavior**: If the `version` field is greater than the version understood by the current
  binary, `cmt` prints an error and exits: `"Config version {v} is not supported. Maximum
  supported version is 1. Please upgrade work."`. If the field is absent, version `1` is assumed.
- **Migration**: Future versions of `cmt` will include migration logic from version N to N+1.
  Migrations are applied automatically on `cmt init --upgrade` or prompted on first use.

### 3.2 `project`

Project-level metadata. None of these fields affect work item behavior -- they are informational
and used for display and identification.

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `String` | Parent directory name | Human-readable project name. If omitted, derived from the name of the directory containing `.cmt/`. |
| `prefix` | `String` | `"CMT"` | Default ID prefix for new work items. Must match `^[A-Z][A-Z0-9]{0,7}$`. Used when no type-specific prefix is configured. |
| `description` | `String` | `""` (empty) | Optional project description. Displayed in `cmt status` output. |

**Prefix resolution**: When creating a new work item, the prefix is determined by:
1. If `--type` is given and `id.prefixes` has an entry for that type, use the type-specific prefix.
2. Otherwise, use `project.prefix`.
3. If `project.prefix` is not set, use `"CMT"`.

### 3.3 `defaults`

Default values applied to new work items when the corresponding field is not provided at
creation time.

| Field | Type | Default | Description |
|---|---|---|---|
| `priority` | `String` (Priority enum) | `"none"` | Default priority. Must be one of: `critical`, `high`, `medium`, `low`, `none`. |
| `type` | `String` | `"task"` | Default work item type. Any lowercase string is valid. |
| `status` | `String` | `"inbox"` | Default initial status. Must be a valid initial state in the applicable state machine. |
| `assignee` | `String` or `null` | `null` | Default assignee. When `null`, new items have no assignee. |

**Interaction with state machines**: The `defaults.status` value must be marked as `initial: true`
in the applicable state machine. If the user changes the default state machine's initial state
but forgets to update `defaults.status`, a validation warning is emitted at startup:
`"defaults.status '{status}' is not an initial state in the default state machine"`.

### 3.4 `id`

Configuration for work item ID generation and display.

#### `id.prefixes`

A map from work item type names to ID prefixes. When `cmt add --type bug "Something broke"` is
run and `id.prefixes` contains `bug: "BUG"`, the new item gets a `BUG-NNNN` ID instead of
the default prefix.

- **Key type**: `String` (work item type, lowercase)
- **Value type**: `String` (ID prefix, must match `^[A-Z][A-Z0-9]{0,7}$`)
- **Default**: Empty map (no type-specific prefixes; all items use `project.prefix`)

Each prefix maintains its own auto-increment counter. `BUG-0001` and `CMT-0001` are distinct
items. The counter for each prefix is stored in the SQLite index (spec 05) and initialized
by scanning existing files when the index is first built.

#### `id.pad_width`

- **Type**: Integer
- **Default**: `4`
- **Range**: `1` to `6`
- **Purpose**: Controls zero-padding of the numeric portion of IDs in display output. A
  `pad_width` of 4 displays `CMT-1` as `CMT-0001` in lists and search results. The stored
  value in the file is not affected -- `CMT-1` remains `CMT-1` in the frontmatter. Padding
  is a display-only concern.

### 3.5 `state_machines`

State machine definitions. Each key is a state machine name. The special name `default` is
the state machine used when a work item's type has no matching state machine.

Full state machine specification is in spec 02. This section covers the config format only.

#### Structure

```yaml
state_machines:
  <name>:
    extends: <parent_name>   # optional, inherits from another machine (spec 02 §4)
    states:
      <state_name>:
        initial: <bool>     # optional, default false
        terminal: <bool>    # optional, default false
    transitions:
      - { from: <state>, to: <state> }
      - { from: <state>, to: <state> }
```

#### State Machine Resolution

When validating or transitioning a work item's status:

1. If the item has a `type` field and `state_machines` has a key matching that type, use
   that state machine.
2. Otherwise, use the `default` state machine.
3. If no `default` state machine is defined in config, use the hardcoded default state
   machine (inbox -> ready -> active -> blocked -> done/cancelled).

#### Multiple State Machines Example

```yaml
state_machines:
  default:
    states:
      inbox: { initial: true }
      ready: {}
      active: {}
      blocked: {}
      done: { terminal: true }
      cancelled: { terminal: true }
    transitions:
      - { from: inbox, to: ready }
      - { from: inbox, to: cancelled }
      - { from: ready, to: active }
      - { from: ready, to: cancelled }
      - { from: active, to: blocked }
      - { from: active, to: done }
      - { from: active, to: cancelled }
      - { from: blocked, to: active }
      - { from: blocked, to: cancelled }

  bug:
    states:
      reported: { initial: true }
      triaged: {}
      fixing: {}
      testing: {}
      verified: { terminal: true }
      wontfix: { terminal: true }
    transitions:
      - { from: reported, to: triaged }
      - { from: reported, to: wontfix }
      - { from: triaged, to: fixing }
      - { from: triaged, to: wontfix }
      - { from: fixing, to: testing }
      - { from: testing, to: verified }
      - { from: testing, to: fixing }

  epic:
    states:
      proposed: { initial: true }
      accepted: {}
      in_progress: {}
      completed: { terminal: true }
      abandoned: { terminal: true }
    transitions:
      - { from: proposed, to: accepted }
      - { from: proposed, to: abandoned }
      - { from: accepted, to: in_progress }
      - { from: in_progress, to: completed }
      - { from: in_progress, to: abandoned }
```

### 3.6 `tags`

Configuration for the tag system.

| Field | Type | Default | Description |
|---|---|---|---|
| `namespaces` | `String[]` | `["team", "domain", "sprint", "priority"]` | Known tag namespaces for autocomplete and validation hints. |

**Not enforced**: Tags with namespaces not in this list are still valid. The namespace list
is used for:
- CLI autocomplete (tab-completion of `team:` when typing tags)
- `cmt check` warnings: "Tag namespace 'departmnt' is not in the known namespaces list. Did you mean 'department'?"
- Documentation and discoverability (`cmt config show tags`)

Tags themselves are stored on individual work items (spec 01). This config section only
configures the namespace registry.

### 3.7 `archive`

Settings for archiving terminal work items.

| Field | Type | Default | Description |
|---|---|---|---|
| `auto_archive` | `bool` | `false` | Whether to automatically move terminal items to `.cmt/archive/`. |
| `auto_archive_after_days` | `u32` | `7` | Number of days after entering a terminal state before auto-archiving. Only relevant when `auto_archive` is `true`. |

**Auto-archive behavior**: When `auto_archive` is `true`, the `cmt` CLI checks for items in
terminal states older than `auto_archive_after_days` during startup operations (`cmt list`,
`cmt add`, etc.) and moves them to `.cmt/archive/`. The move preserves the item's format
(simple file or complex directory). If `git.auto_commit` is also `true`, the archive move
is committed.

**Manual archiving**: Regardless of `auto_archive`, the command `cmt archive <ID>` manually
moves an item to the archive. Only items in terminal states can be archived.

### 3.8 `git`

Git integration settings.

| Field | Type | Default | Description |
|---|---|---|---|
| `auto_commit` | `bool` | `false` | Whether `cmt` automatically commits changes to git after each mutation (add, edit, transition, archive). |
| `commit_prefix` | `String` | `"work"` | Prefix for auto-generated commit messages. |

**Auto-commit message format**: When `auto_commit` is `true`, mutations produce commits with
messages in the format:

```
{commit_prefix}: {action} {item_id} - {title}
```

Examples:
```
work: add CMT-0042 - Implement user authentication
work: transition CMT-0042 inbox -> active
work: edit CMT-0042 - Update acceptance criteria
work: archive CMT-0042 - Implement user authentication
```

**Git detection**: If `auto_commit` is `true` but the `.cmt/` directory is not inside a git
repository, `cmt` prints a warning and proceeds without committing: `"auto_commit is enabled
but .cmt/ is not in a git repository. Changes will not be committed."`.

---

## 4. Config Resolution Order

Configuration values are resolved with the following precedence (highest wins):

```
CLI flags                      (highest priority)
    |
Environment variables          (CMT_* prefix)
    |
.cmt/config.yml               (project-level config)
    |
Hardcoded defaults in Rust     (lowest priority)
```

### 4.1 Environment Variables

Environment variables use the `CMT_` prefix and map to config fields using uppercase and
underscores:

| Environment Variable | Config Path | Example |
|---|---|---|
| `CMT_PREFIX` | `project.prefix` | `CMT_PREFIX=PROJ` |
| `CMT_DIR` | _(special)_ | `CMT_DIR=/path/to/.work` |
| `CMT_AUTO_COMMIT` | `git.auto_commit` | `CMT_AUTO_COMMIT=true` |
| `CMT_COMMIT_PREFIX` | `git.commit_prefix` | `CMT_COMMIT_PREFIX=task` |
| `CMT_DEFAULT_PRIORITY` | `defaults.priority` | `CMT_DEFAULT_PRIORITY=medium` |
| `CMT_DEFAULT_TYPE` | `defaults.type` | `CMT_DEFAULT_TYPE=bug` |
| `CMT_PAD_WIDTH` | `id.pad_width` | `CMT_PAD_WIDTH=6` |
| `CMT_AUTO_ARCHIVE` | `archive.auto_archive` | `CMT_AUTO_ARCHIVE=true` |

**`CMT_DIR`**: A special variable that overrides the `.cmt/` directory location. Instead of
searching upward from the current directory for a `.cmt/` directory, `cmt` uses the path
specified. This is useful for scripts and CI environments.

**Boolean parsing**: Environment variable boolean values accept `true`, `1`, `yes` (truthy)
and `false`, `0`, `no` (falsy). Case-insensitive.

### 4.2 CLI Flags

CLI flags override everything. They are documented in spec 03 (CLI Interface). Examples:

```bash
work add "Fix bug" --priority high      # overrides defaults.priority
work add "New feature" --type feature   # overrides defaults.type
work list --dir /other/project/.work    # overrides CMT_DIR
```

### 4.3 Resolution Example

Given:

- Hardcoded default: `priority = "none"`
- `config.yml`: `defaults.priority: "low"`
- Environment: `CMT_DEFAULT_PRIORITY=medium`
- CLI: (not specified)

Result: `priority = "medium"` (environment variable wins over config file).

Given:

- Hardcoded default: `priority = "none"`
- `config.yml`: `defaults.priority: "low"`
- Environment: (not set)
- CLI: `--priority high`

Result: `priority = "high"` (CLI flag wins over config file).

---

## 5. Initialization

### 5.1 What `cmt init` Creates

Running `cmt init` in a directory creates the `.cmt/` structure with a minimal configuration.

**Minimal config.yml** (created by `cmt init`):

```yaml
version: 1

project:
  name: "my-project"
  prefix: "CMT"
```

The config file intentionally omits all optional sections. Users add them when needed. This
follows the progressive capability principle: zero-friction start, power features on demand.

### 5.2 `cmt init` Options

```bash
work init                          # Basic init, infer project name from directory
work init --name "My Project"       # Set project name
work init --prefix PROJ             # Set custom prefix
work init --name "Bug Tracker" --prefix BUG
```

### 5.3 `cmt init` Behavior

1. Check if `.cmt/` already exists. If so, print error and exit: `"A .cmt/ directory
   already exists. Use 'work init --force' to reinitialize (preserves existing items)."`.
2. Create the `.cmt/` directory and subdirectories.
3. Write `config.yml` with version and project section.
4. Write `.gitignore` inside `.cmt/`.
5. Print confirmation: `"Initialized catchmytask in .cmt/ with prefix {PREFIX}"`.

If `--force` is specified and `.cmt/` exists:
1. Preserve `items/` and `archive/` directories and their contents.
2. Overwrite `config.yml` only if `--name` or `--prefix` is specified. Otherwise preserve it.
3. Recreate missing subdirectories.
4. Recreate `.gitignore` if missing.

---

## 6. Directory Layout

After `cmt init`, the `.cmt/` directory contains:

```
.cmt/
  config.yml           # Project configuration (created by work init)
  items/               # Active work items (empty after init)
  archive/             # Completed/cancelled items (empty after init)
  templates/           # Work item templates (empty after init)
  .gitignore           # Contains: .index.db
  .index.db            # SQLite index (created on first use, gitignored)
```

### 6.1 File Details

#### `config.yml`

The project configuration file, documented in full by this spec.

#### `items/`

Active work items. Files are named `{ID}.md` for simple items or organized as `{ID}/item.md`
for complex items (spec 01, Section 6).

#### `archive/`

Completed and cancelled work items, moved here from `items/`. Same file naming convention.
Archived items are excluded from default `cmt list` output but included with `cmt list --all`.

#### `templates/`

Work item templates. Each template is a Markdown file with YAML frontmatter (same format as
work items) but without `id`, `created_at`, or `status` fields. Templates provide default values
for fields and body content.

Example template `.cmt/templates/bug.md`:

```markdown
---
type: bug
priority: medium
tags: [team:backend]
---

## Description

[Describe the bug]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]
```

Usage: `cmt add "Login crash" --template bug`

#### `.gitignore`

Created with the contents:

```
.index.db
.index.db-wal
.index.db-shm
```

This ensures the SQLite index and its WAL (Write-Ahead Log) and SHM (shared memory) files
are not committed to git. WAL mode creates these companion files during database operation.
The index is rebuilt from files and is a local performance optimization, not a source of truth.

#### `.index.db`

The SQLite index file (spec 05). Created on first use by scanning all files in `items/` and
`archive/`. Not created by `cmt init` -- it is lazily initialized. If deleted, it is rebuilt
automatically on the next `cmt` command.

---

## 7. Reserved Future Sections

The following top-level keys in `config.yml` are reserved for future phases of development.
In Phase 1, they are not parsed or validated -- they are preserved on round-trip like any
unknown key, but they are documented here to establish their future purpose.

### 7.1 `agents`

Agent configurations and policies. Will define:
- Named agent identities and their capabilities
- Permission scopes (read, create, update, transition, archive)
- The Dial setting (autonomy level 0.0-1.0, from Syncropel research)
- WIP limits per agent
- Escalation rules

Placeholder structure:

```yaml
agents:
  triage-bot:
    capabilities: [read, create, transition]
    autonomy: 0.3
    wip_limit: 5
    types: [bug, task]
  dev-agent:
    capabilities: [read, create, update, transition]
    autonomy: 0.7
    wip_limit: 3
    types: [task, feature]
```

### 7.2 `workflows`

Automation triggers and actions. Will define event-driven workflows:
- Triggers based on state transitions, time, or field changes
- Actions such as creating items, sending notifications, or updating fields
- Conditional logic based on work item properties

Placeholder structure:

```yaml
workflows:
  auto-verify-bug:
    trigger:
      event: transition
      to: done
      when: "item.type == 'bug'"
    actions:
      - create_item:
          title: "Verify fix: ${item.title}"
          type: verification
          parent: "${item.id}"
```

### 7.3 `views`

Saved query definitions. Will define reusable views for `cmt list`:
- Named filters with field conditions
- Sort orders
- Column selections
- Grouping rules

Placeholder structure:

```yaml
views:
  my-active:
    filter: "status == 'active' AND assignee == '${user}'"
    sort: [priority:desc, created_at:asc]
    columns: [id, title, priority, tags]
  sprint-board:
    filter: "tags contains 'sprint:current'"
    group_by: status
    sort: [priority:desc]
```

### 7.4 `hooks`

Pre/post transition hooks. Will define shell commands or scripts executed around state
transitions:
- Pre-hooks can block transitions (non-zero exit = abort)
- Post-hooks run after successful transitions
- Hooks receive work item data via environment variables

Placeholder structure:

```yaml
hooks:
  pre_transition:
    - when: "to == 'done'"
      run: "scripts/check-acceptance-criteria.sh"
  post_transition:
    - when: "to == 'done'"
      run: "scripts/notify-stakeholders.sh"
```

### 7.5 Unknown Key Handling

Any top-level key not recognized by the current version of `cmt` (including the reserved
keys above in Phase 1) is:

1. Preserved in memory during parsing (stored in the `extra` field)
2. Written back to `config.yml` in its original position on save
3. Not validated or interpreted
4. Reported with an informational message on `cmt config show`: `"Unknown section '{key}' -- preserved but not used by this version of work"`

This ensures forward compatibility: a config file written by a future version of `cmt` is
not corrupted by an older version that does not understand new sections.

---

## 8. Rust Type Mapping

### 8.1 Top-Level Config Struct

```rust
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// The top-level project configuration.
/// Deserialized from `.cmt/config.yml`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    /// Config format version. Must be 1 for this version of work.
    #[serde(default = "default_version")]
    pub version: u32,

    /// Project metadata.
    #[serde(default)]
    pub project: ProjectConfig,

    /// Default values for new work items.
    #[serde(default)]
    pub defaults: DefaultsConfig,

    /// ID generation and display settings.
    #[serde(default)]
    pub id: IdConfig,

    /// State machine definitions, keyed by name.
    /// The key "default" is the fallback state machine.
    #[serde(default = "default_state_machines")]
    pub state_machines: BTreeMap<String, StateMachine>,

    /// Tag namespace configuration.
    #[serde(default)]
    pub tags: TagsConfig,

    /// Archive settings.
    #[serde(default)]
    pub archive: ArchiveConfig,

    /// Git integration settings.
    #[serde(default)]
    pub git: GitConfig,

    /// Unknown top-level keys, preserved on round-trip.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_yaml::Value>,
}

fn default_version() -> u32 {
    1
}
```

### 8.2 ProjectConfig

```rust
/// Project-level metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    /// Human-readable project name. Defaults to the parent directory name.
    #[serde(default)]
    pub name: String,

    /// Default ID prefix for new work items.
    #[serde(default = "default_prefix")]
    pub prefix: String,

    /// Optional project description.
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub description: String,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: String::new(),       // Resolved at runtime from directory name
            prefix: "CMT".to_string(),
            description: String::new(),
        }
    }
}

fn default_prefix() -> String {
    "CMT".to_string()
}
```

### 8.3 DefaultsConfig

```rust
/// Default values applied to new work items.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultsConfig {
    /// Default priority for new items.
    #[serde(default = "default_priority")]
    pub priority: String,

    /// Default work item type.
    #[serde(default = "default_type")]
    pub r#type: String,

    /// Default initial status.
    #[serde(default = "default_status")]
    pub status: String,

    /// Default assignee. None means no assignee.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<String>,
}

impl Default for DefaultsConfig {
    fn default() -> Self {
        Self {
            priority: "none".to_string(),
            r#type: "task".to_string(),
            status: "inbox".to_string(),
            assignee: None,
        }
    }
}

fn default_priority() -> String {
    "none".to_string()
}

fn default_type() -> String {
    "task".to_string()
}

fn default_status() -> String {
    "inbox".to_string()
}
```

### 8.4 IdConfig

```rust
/// ID generation and display configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdConfig {
    /// Per-type prefix overrides. Key is the work item type (lowercase),
    /// value is the ID prefix (uppercase, 1-8 chars).
    #[serde(default)]
    pub prefixes: BTreeMap<String, String>,

    /// Zero-pad width for displaying the numeric portion of IDs.
    #[serde(default = "default_pad_width")]
    pub pad_width: u32,
}

impl Default for IdConfig {
    fn default() -> Self {
        Self {
            prefixes: BTreeMap::new(),
            pad_width: 4,
        }
    }
}

fn default_pad_width() -> u32 {
    4
}
```

### 8.5 StateMachine

```rust
/// A state machine definition.
/// See spec 02 for full state machine specification.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateMachine {
    /// State definitions, keyed by state name.
    pub states: BTreeMap<String, StateConfig>,

    /// Allowed transitions between states.
    pub transitions: Vec<Transition>,

    /// Optional parent machine name for inheritance.
    /// Only used during loading; cleared after resolution.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extends: Option<String>,
}

/// Properties of a single state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateConfig {
    /// Whether this is an initial state (entry point).
    #[serde(default)]
    pub initial: bool,

    /// Whether this is a terminal state (no outgoing transitions).
    #[serde(default)]
    pub terminal: bool,
}

impl Default for StateConfig {
    fn default() -> Self {
        Self {
            initial: false,
            terminal: false,
        }
    }
}

/// A single allowed transition between states.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transition {
    /// Source state name.
    pub from: String,

    /// Target state name.
    pub to: String,
}
```

### 8.6 Default State Machine Constructor

```rust
/// Returns the hardcoded default state machine.
fn default_state_machines() -> BTreeMap<String, StateMachine> {
    let mut machines = BTreeMap::new();
    let mut states = BTreeMap::new();

    states.insert("inbox".into(), StateConfig { initial: true, terminal: false });
    states.insert("ready".into(), StateConfig::default());
    states.insert("active".into(), StateConfig::default());
    states.insert("blocked".into(), StateConfig::default());
    states.insert("done".into(), StateConfig { initial: false, terminal: true });
    states.insert("cancelled".into(), StateConfig { initial: false, terminal: true });

    let transitions = vec![
        Transition { from: "inbox".into(), to: "ready".into() },
        Transition { from: "inbox".into(), to: "cancelled".into() },
        Transition { from: "ready".into(), to: "active".into() },
        Transition { from: "ready".into(), to: "cancelled".into() },
        Transition { from: "active".into(), to: "blocked".into() },
        Transition { from: "active".into(), to: "done".into() },
        Transition { from: "active".into(), to: "cancelled".into() },
        Transition { from: "blocked".into(), to: "active".into() },
        Transition { from: "blocked".into(), to: "cancelled".into() },
    ];

    machines.insert("default".into(), StateMachine { states, transitions, extends: None });
    machines
}
```

### 8.7 TagsConfig

```rust
/// Tag namespace configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagsConfig {
    /// Known tag namespaces for autocomplete and lint hints.
    /// Not enforced -- tags with unknown namespaces are valid.
    #[serde(default = "default_namespaces")]
    pub namespaces: Vec<String>,
}

impl Default for TagsConfig {
    fn default() -> Self {
        Self {
            namespaces: default_namespaces(),
        }
    }
}

fn default_namespaces() -> Vec<String> {
    vec![
        "team".to_string(),
        "domain".to_string(),
        "sprint".to_string(),
        "priority".to_string(),
    ]
}
```

### 8.8 ArchiveConfig

```rust
/// Archive settings for terminal work items.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveConfig {
    /// Whether to auto-archive items in terminal states.
    #[serde(default)]
    pub auto_archive: bool,

    /// Days after entering a terminal state before auto-archiving.
    #[serde(default = "default_auto_archive_after_days")]
    pub auto_archive_after_days: u32,
}

impl Default for ArchiveConfig {
    fn default() -> Self {
        Self {
            auto_archive: false,
            auto_archive_after_days: 7,
        }
    }
}

fn default_auto_archive_after_days() -> u32 {
    7
}
```

### 8.9 GitConfig

```rust
/// Git integration settings.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitConfig {
    /// Whether to auto-commit after each work mutation.
    #[serde(default)]
    pub auto_commit: bool,

    /// Prefix for auto-generated commit messages.
    #[serde(default = "default_commit_prefix")]
    pub commit_prefix: String,
}

impl Default for GitConfig {
    fn default() -> Self {
        Self {
            auto_commit: false,
            commit_prefix: "work".to_string(),
        }
    }
}

fn default_commit_prefix() -> String {
    "work".to_string()
}
```

### 8.10 Config Loading

```rust
use std::path::{Path, PathBuf};

impl Config {
    /// Load configuration from a `.cmt/config.yml` file.
    /// If the file does not exist, returns default config.
    /// If the file is empty, returns default config.
    pub fn load(work_dir: &Path) -> Result<Self, ConfigError> {
        let config_path = work_dir.join("config.yml");
        if !config_path.exists() {
            return Ok(Self::default());
        }
        let contents = std::fs::read_to_string(&config_path)?;
        if contents.trim().is_empty() {
            return Ok(Self::default());
        }
        let config: Config = serde_yaml::from_str(&contents)?;
        config.validate()?;
        Ok(config)
    }

    /// Resolve the project name. If not set in config, derive from directory name.
    pub fn resolve_project_name(&mut self, work_dir: &Path) {
        if self.project.name.is_empty() {
            if let Some(parent) = work_dir.parent() {
                if let Some(name) = parent.file_name() {
                    self.project.name = name.to_string_lossy().to_string();
                }
            }
        }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            version: 1,
            project: ProjectConfig::default(),
            defaults: DefaultsConfig::default(),
            id: IdConfig::default(),
            state_machines: default_state_machines(),
            tags: TagsConfig::default(),
            archive: ArchiveConfig::default(),
            git: GitConfig::default(),
            extra: BTreeMap::new(),
        }
    }
}
```

### 8.11 ConfigError

```rust
/// Errors that can occur during config loading and validation.
#[derive(Debug)]
pub enum ConfigError {
    /// The config file could not be read from disk.
    Io(std::io::Error),

    /// The config file contains invalid YAML.
    Parse(serde_yaml::Error),

    /// The config file is valid YAML but fails semantic validation.
    Validation(Vec<String>),

    /// The config version is not supported by this binary.
    UnsupportedVersion { found: u32, max_supported: u32 },
}
```

---

## 9. Validation Rules

These rules are testable invariants. Each maps to one or more unit tests. Validation runs
during `Config::load()` after YAML deserialization.

### Config-Level Validation

| Rule | Condition | Severity | Message |
|---|---|---|---|
| C-01 | `version` equals `1` | Error | `"Config version {v} is not supported. Maximum supported version is 1. Please upgrade work."` |
| C-02 | `project.prefix` matches `^[A-Z][A-Z0-9]{0,7}$` | Error | `"Invalid project prefix '{prefix}'. Must be 1-8 uppercase alphanumeric characters starting with a letter."` |
| C-03 | `id.pad_width` is in range `1..=6` | Error | `"Invalid pad_width {w}. Must be between 1 and 6."` |
| C-04 | Every value in `id.prefixes` matches `^[A-Z][A-Z0-9]{0,7}$` | Error | `"Invalid type prefix '{prefix}' for type '{type}'. Must be 1-8 uppercase alphanumeric characters starting with a letter."` |
| C-05 | `defaults.priority` is one of `critical`, `high`, `medium`, `low`, `none` | Error | `"Invalid default priority '{p}'. Must be one of: critical, high, medium, low, none."` |
| C-06 | `archive.auto_archive_after_days` is `>= 0` | Error | `"auto_archive_after_days must be a non-negative integer."` |
| C-07 | `git.commit_prefix` is non-empty | Warning | `"git.commit_prefix is empty. Using default 'work'."` |
| C-08 | `git.commit_prefix` matches `^[a-z0-9-]+$` | Warning | `"git.commit_prefix '{p}' contains non-standard characters. Recommended: lowercase alphanumeric and hyphens."` |

### State Machine Validation

| Rule | Condition | Severity | Message |
|---|---|---|---|
| C-10 | Every state machine has at least one initial state | Error | `"State machine '{name}' has no initial state. At least one state must have 'initial: true'."` |
| C-11 | Every state machine has at least one terminal state | Error | `"State machine '{name}' must have at least one terminal state."` |
| C-12 | Every `transition.from` references a defined state | Error | `"State machine '{name}': transition from unknown state '{state}'."` |
| C-13 | Every `transition.to` references a defined state | Error | `"State machine '{name}': transition to unknown state '{state}'."` |
| C-14 | No transitions originate from a terminal state | Error | `"State machine '{name}': terminal state '{state}' must not have outgoing transitions."` |
| C-15 | The initial state is reachable (trivially true -- it is the entry point) | Info | _(always passes)_ |
| C-16 | Every non-terminal state has at least one outgoing transition | Warning | `"State machine '{name}': state '{state}' has no outgoing transitions but is not marked terminal."` |
| C-17 | No duplicate transitions (same from/to pair) | Warning | `"State machine '{name}': duplicate transition from '{from}' to '{to}'."` |
| C-18 | `defaults.status` is an initial state in the `default` state machine (if present) | Warning | `"defaults.status '{status}' is not an initial state in the default state machine."` |

### Cross-Config Validation

| Rule | Condition | Severity | Message |
|---|---|---|---|
| C-20 | If `state_machines` has a `default` key, `defaults.status` must be one of its states | Warning | `"defaults.status '{status}' is not a valid state in the default state machine."` |
| C-21 | Every type in `id.prefixes` keys that has a matching state machine key: the state machine is valid | Info | _(covered by C-10 through C-17)_ |
| C-22 | No prefix collision: no two entries in `id.prefixes` map to the same prefix value, and no entry collides with `project.prefix` | Warning | `"Prefix '{prefix}' is used by both type '{t1}' and type '{t2}'. Each type should have a unique prefix."` |

### Validation Severity

- **Error**: Config cannot be loaded. `cmt` prints the error and exits with non-zero status.
- **Warning**: Config is loaded, but the issue is reported to stderr. `cmt` proceeds.
- **Info**: Logged but not printed unless `--verbose` is used.

---

## 10. Examples

### 10.1 Empty Config (Everything Defaults)

```yaml
```

An empty file (or no `config.yml` at all) is valid. All values use hardcoded defaults:
- Version: `1`
- Prefix: `WM`
- Default status: `inbox`
- Default type: `task`
- Default priority: `none`
- State machine: the hardcoded default (inbox/ready/active/blocked/done/cancelled)
- No auto-archive, no auto-commit

### 10.2 Minimal Config (Just Prefix)

```yaml
version: 1

project:
  name: "acme-backend"
  prefix: "ACME"
```

This is what `cmt init --name "acme-backend" --prefix ACME` produces. All items get IDs
like `ACME-0001`, `ACME-0002`, etc. All other settings use defaults.

### 10.3 Full Config with Custom State Machines

```yaml
version: 1

project:
  name: "travel-platform"
  prefix: "TP"
  description: "Travel platform work tracking"

defaults:
  priority: low
  type: task
  status: inbox
  assignee: null

id:
  prefixes:
    bug: "BUG"
    feature: "FEAT"
    epic: "EPIC"
    investigation: "INV"
    spike: "SPK"
  pad_width: 4

state_machines:
  default:
    states:
      inbox: { initial: true }
      ready: {}
      active: {}
      blocked: {}
      done: { terminal: true }
      cancelled: { terminal: true }
    transitions:
      - { from: inbox, to: ready }
      - { from: inbox, to: cancelled }
      - { from: ready, to: active }
      - { from: ready, to: cancelled }
      - { from: active, to: blocked }
      - { from: active, to: done }
      - { from: active, to: cancelled }
      - { from: blocked, to: active }
      - { from: blocked, to: cancelled }

  bug:
    states:
      reported: { initial: true }
      triaged: {}
      fixing: {}
      testing: {}
      verified: { terminal: true }
      wontfix: { terminal: true }
    transitions:
      - { from: reported, to: triaged }
      - { from: reported, to: wontfix }
      - { from: triaged, to: fixing }
      - { from: triaged, to: wontfix }
      - { from: fixing, to: testing }
      - { from: testing, to: verified }
      - { from: testing, to: fixing }

  investigation:
    states:
      open: { initial: true }
      researching: {}
      blocked: {}
      concluded: { terminal: true }
      abandoned: { terminal: true }
    transitions:
      - { from: open, to: researching }
      - { from: open, to: abandoned }
      - { from: researching, to: blocked }
      - { from: researching, to: concluded }
      - { from: researching, to: abandoned }
      - { from: blocked, to: researching }
      - { from: blocked, to: abandoned }

tags:
  namespaces: [team, domain, sprint, client, effort, component]

archive:
  auto_archive: true
  auto_archive_after_days: 14

git:
  auto_commit: true
  commit_prefix: "tp"
```

### 10.4 Multi-Type Config with Different Prefixes per Type

```yaml
version: 1

project:
  name: "data-engineering"
  prefix: "DE"

id:
  prefixes:
    bug: "BUG"
    feature: "FEAT"
    epic: "EPIC"
    pipeline: "PIPE"
    dashboard: "DASH"
    investigation: "INV"
    analysis: "ALY"
  pad_width: 3

tags:
  namespaces: [team, client, domain, sprint, environment]
```

In this configuration:
- `cmt add "Fix ETL failure"` creates `DE-001` (default type `task`, uses project prefix)
- `cmt add "Fix ETL failure" --type bug` creates `BUG-001` (type-specific prefix)
- `cmt add "New dashboard" --type dashboard` creates `DASH-001`
- `cmt add "Analyze churn" --type analysis` creates `ALY-001`
- Each prefix maintains an independent counter

### 10.5 Solo Developer with Minimal Overhead

```yaml
version: 1

project:
  prefix: "T"

id:
  pad_width: 2

git:
  auto_commit: true
  commit_prefix: "todo"
```

A solo developer who wants short IDs (`T-01`, `T-02`, ...) and automatic git commits with
the prefix `todo:`.

---

## 11. Edge Cases and Error Handling

### 11.1 Invalid YAML

| Scenario | Behavior |
|---|---|
| `config.yml` contains invalid YAML syntax | Parse error: `"Failed to parse .cmt/config.yml: {yaml_error}"`. `cmt` exits with non-zero status. |
| `config.yml` is valid YAML but not a mapping (e.g., a list or scalar) | Parse error: `"config.yml must be a YAML mapping (key: value), not a {type}"`. |
| `config.yml` contains YAML anchors and aliases | Supported. `serde_yaml` handles YAML anchors transparently. |
| `config.yml` has trailing content after valid YAML | `serde_yaml` ignores trailing content (YAML spec behavior). |

### 11.2 Future Version

| Scenario | Behavior |
|---|---|
| `version: 2` (higher than supported) | Error: `"Config version 2 is not supported. Maximum supported version is 1. Please upgrade work."` |
| `version: 0` (lower than any valid version) | Error: `"Config version 0 is not valid. Minimum version is 1."` |
| `version` is not an integer (e.g., `version: "1.0"`) | Parse error from serde: `"version must be a positive integer"`. |
| `version` field is missing | Defaults to `1`. |

### 11.3 Unknown Keys

| Scenario | Behavior |
|---|---|
| Unknown top-level key (e.g., `workflows:`) | Preserved in `extra` field. No error or warning at load time. Reported as informational in `cmt config show`. |
| Unknown nested key inside a known section (e.g., `project.icon:`) | Silently ignored by serde (the struct does not have a `flatten` for nested unknowns within known sections). Lost on round-trip. |
| Unknown key conflicts with a reserved name | No special handling in Phase 1. The key is preserved like any other unknown key. |

**Design note**: Unknown keys inside known sections (like `project.icon`) are lost on
round-trip because the nested structs do not use `#[serde(flatten)]`. This is intentional
for Phase 1 -- adding `flatten` to every nested struct adds complexity. If users report
this as a pain point, flatten can be added to specific sections in a future version.

### 11.4 Multiple `.cmt/` Directories in Hierarchy

| Scenario | Behavior |
|---|---|
| Nested `.cmt/` directories (e.g., `/repo/.cmt/` and `/repo/subdir/.cmt/`) | `cmt` searches upward from the current directory and uses the first `.cmt/` found. Running `cmt` from `/repo/subdir/` uses `/repo/subdir/.cmt/`. Running from `/repo/other/` uses `/repo/.cmt/`. |
| `CMT_DIR` environment variable is set | Overrides directory search. Uses the specified path directly. |
| `.cmt/` is a symlink | Followed. `cmt` operates on the resolved target. |
| `.cmt/config.yml` is a symlink | Followed. The resolved file is read. Writes go to the resolved target. |

### 11.5 File Permissions

| Scenario | Behavior |
|---|---|
| `config.yml` is not readable | IO error: `"Cannot read .cmt/config.yml: Permission denied"`. |
| `config.yml` is read-only and a write operation is attempted | IO error on the write operation, not on config load. Config is loaded read-only. |
| `.cmt/` directory is not writable | Operations that modify files fail with IO errors. Config loading succeeds (read-only). |

### 11.6 Concurrent Access

| Scenario | Behavior |
|---|---|
| Two `cmt` processes read config simultaneously | Safe. Config is read-only during normal operations. |
| Two `cmt` processes write to config simultaneously | Not safe. No file locking in Phase 1. Users should not run concurrent `cmt config set` commands. Git merge handles conflicts if auto-commit is enabled. |

### 11.7 Config Modification

| Scenario | Behavior |
|---|---|
| User edits `config.yml` manually between `cmt` commands | Supported. Config is re-read on every `cmt` invocation. No caching across invocations. |
| `cmt config set` modifies a single value | Reads the full config, modifies the value, writes back. Round-trip preserves unknown keys. |
| State machine definition changes while items exist in now-invalid states | Warning on next `cmt list` or `cmt show`: `"Item {id} has status '{status}' which is not valid in the current state machine."` The item is still displayed and accessible. |

---

## Appendix: Cross-References

| Topic | Spec |
|---|---|
| Work item schema and field definitions | [Spec 01: Work Item Schema](01-work-item-schema.md) |
| State machine specification and transition rules | [Spec 02: State Machine](02-state-machine.md) |
| CLI commands including `cmt init` and `cmt config` | [Spec 03: CLI Interface](03-cli-interface.md) |
| SQLite index schema including `id_counters` table | [Spec 05: SQLite Index](05-sqlite-index.md) |
| Progressive capability design principle | `docs/research/06-first-principles.md` Section IX |
| YAML-as-source-of-truth + SQLite index pattern | `docs/research/02-data-platform-analysis.md` Section 11.1 |
| Configuration management patterns (three-tier) | `docs/research/02-data-platform-analysis.md` Section 7 |
| Architectural decisions synthesis | `docs/research/00-synthesis.md` |

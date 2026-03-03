---
spec: "02"
title: State Machine
status: draft
version: 0.1.0
created: 2026-02-23
depends_on: ["01"]
---

# Spec 02: State Machine

## 1. Overview

A **state machine** defines the valid states a work item can occupy and the valid transitions
between those states. Every work item has exactly one active state machine at any point in time.
The state machine is determined by the item's `type` field and the project configuration.

### Guiding Principles

- **State machines are the enforcement layer for the `status` field** defined in Spec 01
- **Configurable per work type**: A "bug" can have different states than a "feature"
- **Sensible defaults**: The system works without any configuration via a hardcoded default machine
- **No enforcement bypass**: Every `status` mutation goes through the state machine validator
- **Timestamps are side effects of transitions**: `started_at`, `completed_at`, `updated_at`, and `blocked_reason` are managed by the transition engine, not set directly

### References

- Research: `docs/research/06-first-principles.md` Section IV (State and Transitions)
- Research: `docs/research/01-task-platform-analysis.md` Section 6 (State Management and Lifecycle)
- Research: `docs/research/00-synthesis.md` Section "5. State Machine"
- Design principles: Events Over State, Convention Over Configuration, Progressive Capability

---

## 2. Default State Machine

The default state machine applies to any work item that does not have a `type`-specific
machine configured. It is also the base that custom machines can extend.

### States

| State | Kind | Description |
|---|---|---|
| `inbox` | Initial | Captured but not yet triaged. The entry point for new items. |
| `ready` | Normal | Triaged and ready to be started. All prerequisites are understood. |
| `active` | Normal | Currently being worked on by an assigned actor. |
| `blocked` | Normal | Work is suspended due to an external dependency or impediment. |
| `done` | Terminal | Work is complete. Acceptance criteria are met. |
| `cancelled` | Terminal | Work was abandoned or determined unnecessary. |

### Transitions

| From | To | Name | Description |
|---|---|---|---|
| `inbox` | `ready` | triage | Item has been reviewed and is ready for work |
| `inbox` | `cancelled` | reject | Item is not worth doing, rejected during triage |
| `ready` | `active` | start | An actor begins work on the item |
| `ready` | `cancelled` | reject | Item is cancelled before work begins |
| `active` | `blocked` | block | Work is impeded by an external dependency |
| `active` | `done` | complete | Work is finished and meets acceptance criteria |
| `active` | `cancelled` | abandon | Work is stopped and will not be completed |
| `blocked` | `active` | unblock | The impediment has been resolved, work resumes |
| `blocked` | `cancelled` | abandon | Blocked item is cancelled rather than resumed |

### ASCII State Diagram

```
                          +----------+
                     +--->| CANCELLED|
                     |    +----------+
                     |         ^   ^
                  reject       |   |
                     |      reject |
                     |         |  abandon
                +----+----+    |   |
   *---create-->|  INBOX  |    |   |
                +----+----+    |   |
                     |         |   |
                   triage      |   |
                     |         |   |
                +----v----+    |   |
                |  READY  +----+   |
                +----+----+        |
                     |             |
                   start           |
                     |             |
                +----v----+   abandon
         +----->|  ACTIVE  +-------+
         |      +----+-----+
         |           |    |
       unblock     block  complete
         |           |    |
    +----+----+      |    |
    | BLOCKED |<-----+  +-v-------+
    +----+----+      |  |  DONE   |
         |           |  +---------+
         +-----------+
              abandon
```

---

## 3. State Machine Definition Format

State machines are defined in the project configuration file `.cmt/config.yml` under the
`state_machines` key. Each key under `state_machines` is a machine name that corresponds to
a work item `type` value, or the special name `default`.

### YAML Format

```yaml
state_machines:
  default:
    states:
      inbox:     { initial: true }
      ready:     {}
      active:    {}
      blocked:   {}
      done:      { terminal: true }
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
```

### State Definition

Each state is a key under `states` with an optional configuration object:

| Field | Type | Default | Description |
|---|---|---|---|
| `initial` | `bool` | `false` | Whether this is a valid starting state for new items |
| `terminal` | `bool` | `false` | Whether this is a final state with no outgoing transitions |

If the configuration object is empty (`{}`), the state is a normal (non-initial, non-terminal) state.

A state name must be a non-empty string matching the regex `^[a-z][a-z0-9_-]{0,29}$`:
lowercase letters, digits, hyphens, and underscores, starting with a letter, maximum 30 characters.

### Transition Definition

Each transition is an object in the `transitions` array:

| Field | Type | Required | Description |
|---|---|---|---|
| `from` | `String` | Yes | The source state name (must exist in `states`) |
| `to` | `String` | Yes | The target state name (must exist in `states`) |

A transition `{ from: A, to: B }` means "an item in state A may move to state B."
Self-transitions (where `from == to`) are not permitted. Duplicate transitions (same `from`
and `to` pair appearing more than once) are ignored on load (deduplicated).

---

## 4. The `extends` Mechanism

A custom state machine can inherit from another machine using the `extends` field. This allows
teams to define specialized workflows without repeating the full default configuration.

### Syntax

```yaml
state_machines:
  bug:
    extends: default
    states:
      review:    {}                    # adds a new state
      done:      { terminal: true }   # overrides (same as parent, but explicit)
    transitions:
      - { from: active, to: review }
      - { from: review, to: done }
      - { from: review, to: active }
      - { from: review, to: cancelled }
```

### Resolution Rules

1. **Maximum depth is 1**: A machine can extend one parent. Chained inheritance (A extends B extends C) is a validation error. This keeps resolution simple and predictable.

2. **Parent must exist**: The value of `extends` must name another machine defined in the same `state_machines` map, or the special value `"_builtin_default"` to reference the hardcoded default (useful when the config redefines the `default` key).

3. **State merging**: Start with a copy of the parent's states. For each state defined in the child:
   - If the state name exists in the parent, the child's config **replaces** the parent's config for that state.
   - If the state name does not exist in the parent, it is **added**.
   - States in the parent that are not mentioned in the child are preserved unchanged.

4. **Transition merging**: Transitions are merged additively.
   - Start with a copy of the parent's transitions.
   - For each `from` state that appears in the child's transitions, **remove all** parent transitions originating from that `from` state.
   - Add all child transitions for that `from` state.
   - Parent transitions for `from` states not mentioned in the child's transitions are preserved unchanged.

   This rule means: if the child defines any transitions from a given state, it completely owns
   all transitions from that state. This prevents confusing partial overrides.

### Example: Full Resolution

Given this configuration:

```yaml
state_machines:
  default:
    states:
      inbox:     { initial: true }
      ready:     {}
      active:    {}
      blocked:   {}
      done:      { terminal: true }
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
    extends: default
    states:
      review: {}
    transitions:
      - { from: active, to: review }
      - { from: active, to: blocked }
      - { from: active, to: cancelled }
      - { from: review, to: done }
      - { from: review, to: active }
      - { from: review, to: cancelled }
```

The resolved `bug` machine has:

**States** (parent states + child's `review`):
- `inbox` (initial), `ready`, `active`, `blocked`, `review`, `done` (terminal), `cancelled` (terminal)

**Transitions** (parent transitions with `from: active` replaced by child's, plus child's `from: review`):
- `inbox -> ready` (from parent, `from: inbox` not overridden)
- `inbox -> cancelled` (from parent)
- `ready -> active` (from parent, `from: ready` not overridden)
- `ready -> cancelled` (from parent)
- `active -> review` (from child, replaces parent's `from: active` transitions)
- `active -> blocked` (from child)
- `active -> cancelled` (from child)
- `blocked -> active` (from parent, `from: blocked` not overridden)
- `blocked -> cancelled` (from parent)
- `review -> done` (from child, new state)
- `review -> active` (from child)
- `review -> cancelled` (from child)

Note that the parent's `active -> done` transition is gone because the child redefined all
transitions from `active`. If the child wants to preserve `active -> done`, it must explicitly
include it in its own transition list.

---

## 5. State Machine Resolution

When a work item's status needs to be validated or a transition needs to be checked, the
system must determine which state machine applies. The resolution follows a three-step
fallback chain.

### Resolution Order

1. **Type match**: If the work item has a `type` field, look for a key matching that type
   in the `state_machines` map of `config.yml`. If found, use that machine (resolving
   `extends` if present).

2. **Default config key**: If no type-specific machine exists (or the item has no `type`),
   look for the `default` key in the `state_machines` map. If found, use that machine.

3. **Hardcoded default**: If no `config.yml` exists, or it has no `state_machines` section,
   or the `state_machines` section has no `default` key, use the hardcoded default state
   machine (the one described in Section 2 of this spec).

### Resolution Examples

| Item `type` | Config has `bug` machine | Config has `default` machine | Config exists | Result |
|---|---|---|---|---|
| `bug` | Yes | Yes | Yes | Uses `bug` machine |
| `bug` | No | Yes | Yes | Uses `default` from config |
| `bug` | No | No | Yes | Uses hardcoded default |
| `bug` | No | No | No | Uses hardcoded default |
| (none) | Yes | Yes | Yes | Uses `default` from config |
| (none) | No | No | No | Uses hardcoded default |

### Caching

The resolved state machine for each type is computed once and cached in memory for the
duration of a CLI command invocation. The cache is invalidated between commands (since
config.yml may change between invocations).

---

## 6. Transition Validation

When a work item's `status` is being changed (via `cmt status`, `cmt done`, `cmt edit`, or
any other mutation), the state machine engine validates the transition.

### Validation Procedure

1. **Resolve the applicable state machine** for the work item (Section 5).
2. **Look up the current state** in the machine's states. If the current state is not in the machine, emit a warning and allow the transition (the item may have been created under a different machine configuration).
3. **Check that the target state exists** in the machine's states. If it does not, return an error: `"State '{target}' does not exist. Valid states: {list}"`.
4. **Check that a transition exists** from the current state to the target state. If it does not, return an error: `"Cannot transition from '{current}' to '{target}'. Valid transitions from '{current}': {list}"`.
5. **If valid**: proceed with the transition, update timestamps (Section 7), and write the file.

### Error Messages

Transition errors include the list of valid next states to help the user or agent
understand what options are available:

```
error: Cannot transition from 'active' to 'inbox'.
       Valid transitions from 'active': blocked, done, cancelled
```

```
error: State 'deployed' does not exist in the 'default' state machine.
       Valid states: inbox, ready, active, blocked, done, cancelled
```

### Bypass: `--force`

The CLI provides a `--force` flag that bypasses transition validation. When used:
- The transition proceeds regardless of the state machine
- A warning is emitted: `"Forced transition from '{current}' to '{target}' (bypassed state machine validation)"`
- The `updated_at` timestamp is still set
- The event is recorded normally

This exists for data repair scenarios (e.g., an item was manually edited into an invalid
state and needs to be corrected). It should not be used in normal workflows.

---

## 7. Automatic Timestamps

Certain timestamp fields on the work item (defined in Spec 01) are automatically managed by
the transition engine. These fields are set as side effects of valid transitions.

### Timestamp Rules

| Field | Set When | Cleared When | Details |
|---|---|---|---|
| `started_at` | First transition to a non-initial, non-terminal state | Never | Only set once. If already set, subsequent transitions do not overwrite it. Covers transitions to `active`, `blocked`, or any custom normal state. |
| `completed_at` | Transition to any terminal state | Transition away from a terminal state (via `--force`) | Set to `now()`. Overwritten if the item reaches a terminal state again (e.g., `--force` back to active, then completed again). |
| `updated_at` | Every transition | Never | Always set to `now()` on any status change. |
| `blocked_reason` | N/A (must be provided by user) | Transition away from `blocked` | Required when transitioning TO any state named `blocked`. Automatically removed from the frontmatter when transitioning OUT of `blocked`. |

### `started_at` Timestamp Logic

The `started_at` field records when work first began on an item. It is set on the first
transition to a state that is neither initial nor terminal:

```
inbox -> ready:     started_at NOT set (ready inherits from default machine where
                    it is not flagged, but readiness is not "started" -- see below)
ready -> active:    started_at SET to now() (first non-initial, non-terminal state after
                    ready that implies work has begun)
active -> blocked:  started_at unchanged (already set)
blocked -> active:  started_at unchanged (already set)
active -> done:     started_at unchanged (already set)
```

More precisely, `started_at` is set when transitioning to a state that satisfies ALL of:
- Not flagged as `initial`
- Not flagged as `terminal`
- The state is "beyond triage" -- specifically, it is not one of the states reachable
  exclusively by transitions from initial states

For the default machine, `started_at` is set on transition to `active` or `blocked` (since
`ready` is reachable directly from the initial state `inbox` and represents triage
completion, not work commencement).

**Implementation simplification**: In Phase 1, `started_at` is set on the first transition
to `active` specifically. If the item transitions directly from `inbox` to `blocked` via
a custom machine, `started_at` is also set. The rule is: `started_at` is set on first entry to
any state that is not `initial`, not `terminal`, and not reachable in a single transition
from an initial state.

For machines where this heuristic is unclear, users can set `started_at` manually in the
frontmatter and the engine will not overwrite it.

### `completed_at` Timestamp Logic

The `completed_at` field records when work reached a terminal state:

```
active -> done:       completed_at SET to now()
active -> cancelled:  completed_at SET to now()
blocked -> cancelled: completed_at SET to now()
```

If an item is forced out of a terminal state back to a non-terminal state, `completed_at` is
cleared:

```
done -> active (via --force):  completed_at CLEARED
```

If the item subsequently reaches a terminal state again, `completed_at` is set again to the
new timestamp.

### `blocked_reason` Logic

The `blocked_reason` field has special coupling with the `blocked` state:

- **On transition TO `blocked`**: The CLI requires a `--reason` argument (or the caller must
  provide it programmatically). If missing, the transition fails with:
  `"blocked_reason is required when transitioning to 'blocked'"`

- **On transition FROM `blocked`**: The `blocked_reason` field is automatically removed from
  the YAML frontmatter. It is not set to `null` or empty string; the key is omitted entirely.

- **For custom states**: The `blocked_reason` requirement applies to any state whose name is
  exactly `blocked`. Custom machines that use different state names (e.g., `waiting`,
  `on-hold`) do not trigger this behavior unless they are configured with a future
  metadata extension (reserved for Phase 2).

---

## 8. State Machine Constraints

Every state machine, whether hardcoded, configured, or resolved via `extends`, must satisfy
these universal invariants. These are validated when the configuration is loaded.

### Constraint C-01: At Least One Initial State

The machine must have at least one state with `initial: true`.

**Error**: `"State machine '{name}' has no initial state. At least one state must have 'initial: true'."`

### Constraint C-02: At Least One Terminal State

The machine must have at least one state with `terminal: true`.

**Error**: `"State machine '{name}' has no terminal state. At least one state must have 'terminal: true'."`

### Constraint C-03: Non-Terminal States Have Outgoing Transitions

Every state that is not terminal must have at least one outgoing transition.

**Error**: `"State machine '{name}': non-terminal state '{state}' has no outgoing transitions."`

### Constraint C-04: No Transitions From Terminal States

No transition may have a terminal state as its `from` value.

**Error**: `"State machine '{name}': terminal state '{state}' must not have outgoing transitions (found transition to '{target}')."`

### Constraint C-05: State Graph is Connected

Every state must be reachable from at least one initial state by following transitions. An
unreachable state is one that cannot be entered regardless of the sequence of transitions.

This is validated by performing a breadth-first traversal from all initial states and
checking that every state in the machine is visited.

**Error**: `"State machine '{name}': state '{state}' is unreachable from any initial state."`

### Constraint C-06: Transitions Reference Valid States

Every `from` and `to` value in the transitions list must name a state defined in the
`states` map.

**Error**: `"State machine '{name}': transition references unknown state '{state}'."`

### Constraint C-07: No Self-Transitions

No transition may have the same `from` and `to` value.

**Error**: `"State machine '{name}': self-transition on state '{state}' is not permitted."`

### Constraint C-08: State Names Are Valid

Every state name must match the regex `^[a-z][a-z0-9_-]{0,29}$`.

**Error**: `"State machine '{name}': invalid state name '{state}'. State names must be lowercase alphanumeric with hyphens/underscores, starting with a letter, max 30 characters."`

### Validation Ordering

Constraints are checked in the order listed above. On the first error, validation stops
and the error is reported. The CLI refuses to start if any configured state machine fails
validation.

The hardcoded default machine is assumed to always be valid (it is tested at compile time).

---

## 9. Side Effects (Future -- Reserved)

This section documents the planned architecture for transition-triggered side effects.
Side effects are **not implemented in Phase 1** but the design is specified here to ensure
the transition engine does not preclude them.

### Design Principles

- **Side effects are decoupled from transitions**: The state machine defines what transitions
  are valid. Side effects are reactions configured separately.
- **Side effects fire AFTER successful transition**: The state change and file write happen
  first. If the write fails, no side effects fire.
- **Side effects are best-effort**: A failing side effect does not roll back the transition.
  Errors are logged but do not block the workflow.
- **Side effects are idempotent**: If a side effect fires twice for the same transition
  (e.g., due to retry), the result should be the same.

### Planned Hook Points

```yaml
# Future config.yml syntax (NOT implemented in Phase 1)
state_machines:
  default:
    hooks:
      on_enter:
        done:
          - action: notify
            channel: slack
            message: "Item {id} completed by {assignee}"
        blocked:
          - action: notify
            assignee: true
            message: "Item {id} is blocked: {blocked_reason}"
      on_exit:
        blocked:
          - action: notify
            assignee: true
            message: "Item {id} is unblocked"
      on_transition:
        - from: active
          to: done
          action: archive
          delay: 7d
```

### Hook Types (Reserved)

| Hook | Fires When | Use Case |
|---|---|---|
| `on_enter:{state}` | After entering the named state | Notifications, auto-assignment |
| `on_exit:{state}` | After leaving the named state | Cleanup, counter updates |
| `on_transition:{from}->{to}` | After a specific transition | Specialized automation |

### Implementation Notes for Phase 2

- Hooks are defined per state machine, not globally
- Hook execution is asynchronous (spawned as a background task)
- Hook failures are logged to `.cmt/logs/hooks.log`
- A `--dry-run` flag on transitions shows which hooks would fire without executing them

---

## 10. Rust Type Mapping

### Core Types

```rust
use std::collections::{BTreeMap, BTreeSet, VecDeque};

/// A configured state in a state machine.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateConfig {
    /// Whether this is an initial state (valid for newly created items).
    #[serde(default)]
    pub initial: bool,

    /// Whether this is a terminal state (no outgoing transitions allowed).
    #[serde(default)]
    pub terminal: bool,
}

/// A single valid transition between two states.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Transition {
    /// The source state name.
    pub from: String,

    /// The target state name.
    pub to: String,
}

/// A complete state machine definition, as loaded from config.
/// After resolution (extends), this contains the fully merged states and transitions.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateMachine {
    /// Map of state name to state configuration.
    /// BTreeMap for deterministic serialization order.
    pub states: BTreeMap<String, StateConfig>,

    /// List of valid transitions.
    pub transitions: Vec<Transition>,

    /// Optional parent machine name for inheritance.
    /// Only used during loading; cleared after resolution.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extends: Option<String>,
}
```

### Engine

```rust
/// The state machine engine validates transitions and manages timestamp side effects.
pub struct StateMachineEngine {
    /// Resolved state machines keyed by type name.
    /// The "default" key holds the fallback machine.
    machines: BTreeMap<String, StateMachine>,

    /// Precomputed transition lookup: (from, to) -> bool for each machine.
    /// Enables O(1) transition validation.
    transition_index: BTreeMap<String, BTreeSet<(String, String)>>,
}

impl StateMachineEngine {
    /// Create a new engine from the state_machines section of config.yml.
    /// Resolves all `extends` references and validates all constraints.
    /// Returns Err if any machine fails validation.
    pub fn new(
        machines: BTreeMap<String, StateMachine>,
    ) -> Result<Self, StateMachineError> {
        // 1. Resolve extends for each machine
        // 2. Validate constraints C-01 through C-08 on each resolved machine
        // 3. Build transition_index for O(1) lookups
        todo!()
    }

    /// Create an engine with only the hardcoded default machine.
    /// Used when no config.yml exists.
    pub fn builtin_default() -> Self {
        todo!()
    }

    /// Resolve which state machine applies to a work item.
    /// Follows the resolution order: type match -> default key -> hardcoded default.
    pub fn resolve(&self, item_type: Option<&str>) -> &StateMachine {
        todo!()
    }

    /// Validate a proposed transition.
    /// Returns Ok(TransitionResult) if valid, Err(TransitionError) if not.
    pub fn validate_transition(
        &self,
        item_type: Option<&str>,
        current_state: &str,
        target_state: &str,
    ) -> Result<TransitionResult, TransitionError> {
        todo!()
    }

    /// Return the list of valid target states from the given current state.
    pub fn valid_transitions(
        &self,
        item_type: Option<&str>,
        current_state: &str,
    ) -> Vec<&str> {
        todo!()
    }

    /// Return all initial states for the given item type.
    pub fn initial_states(
        &self,
        item_type: Option<&str>,
    ) -> Vec<&str> {
        todo!()
    }

    /// Return all terminal states for the given item type.
    pub fn terminal_states(
        &self,
        item_type: Option<&str>,
    ) -> Vec<&str> {
        todo!()
    }
}

/// Describes what happened as a result of a valid transition.
pub struct TransitionResult {
    /// The state machine name that was used.
    pub machine_name: String,

    /// Whether `started_at` should be set (first time entering a work state).
    pub set_started_at: bool,

    /// Whether `completed_at` should be set (entering a terminal state).
    pub set_completed_at: bool,

    /// Whether `completed_at` should be cleared (leaving a terminal state via --force).
    pub clear_completed_at: bool,

    /// Whether `blocked_reason` should be cleared (leaving blocked state).
    pub clear_blocked_reason: bool,

    /// Whether `blocked_reason` is required (entering blocked state).
    pub require_blocked_reason: bool,
}

/// Error returned when a transition is invalid.
#[derive(Debug)]
pub enum TransitionError {
    /// The target state does not exist in the machine.
    UnknownState {
        target: String,
        valid_states: Vec<String>,
        machine_name: String,
    },

    /// No transition exists from current to target.
    InvalidTransition {
        current: String,
        target: String,
        valid_targets: Vec<String>,
        machine_name: String,
    },

    /// The current state is not in the machine (item may have been
    /// created under a different configuration).
    UnknownCurrentState {
        current: String,
        machine_name: String,
    },
}

/// Error returned when a state machine definition fails validation.
#[derive(Debug)]
pub enum StateMachineError {
    /// No initial state defined.
    NoInitialState { machine: String },

    /// No terminal state defined.
    NoTerminalState { machine: String },

    /// A non-terminal state has no outgoing transitions.
    DeadEndState { machine: String, state: String },

    /// A terminal state has outgoing transitions.
    TerminalHasTransitions {
        machine: String,
        state: String,
        target: String,
    },

    /// A state is unreachable from any initial state.
    UnreachableState { machine: String, state: String },

    /// A transition references an undefined state.
    UndefinedStateRef {
        machine: String,
        state: String,
    },

    /// A self-transition was defined.
    SelfTransition { machine: String, state: String },

    /// An invalid state name was used.
    InvalidStateName { machine: String, state: String },

    /// The extends target does not exist.
    UnknownParent {
        machine: String,
        parent: String,
    },

    /// Chained inheritance detected (parent also has extends).
    ChainedInheritance {
        machine: String,
        parent: String,
    },
}
```

### Default Machine Construction

```rust
impl StateMachine {
    /// Returns the hardcoded default state machine.
    pub fn builtin_default() -> Self {
        let mut states = BTreeMap::new();
        states.insert("inbox".into(), StateConfig { initial: true, terminal: false });
        states.insert("ready".into(), StateConfig { initial: false, terminal: false });
        states.insert("active".into(), StateConfig { initial: false, terminal: false });
        states.insert("blocked".into(), StateConfig { initial: false, terminal: false });
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

        StateMachine {
            states,
            transitions,
            extends: None,
        }
    }
}
```

---

## 11. Validation Rules

These rules are testable invariants. Each maps to one or more unit tests, expressed in
"Given/When/Then" format where applicable.

### State Machine Configuration Validation

| Rule | Given | When | Then |
|---|---|---|---|
| SM-01 | A state machine with no `initial: true` state | Engine loads the config | Error: "no initial state" |
| SM-02 | A state machine with no `terminal: true` state | Engine loads the config | Error: "no terminal state" |
| SM-03 | A non-terminal state with zero outgoing transitions | Engine loads the config | Error: "non-terminal state '{state}' has no outgoing transitions" |
| SM-04 | A terminal state with an outgoing transition | Engine loads the config | Error: "terminal state must not have outgoing transitions" |
| SM-05 | A state unreachable from any initial state | Engine loads the config | Error: "state '{state}' is unreachable" |
| SM-06 | A transition referencing an undefined state | Engine loads the config | Error: "transition references unknown state" |
| SM-07 | A self-transition `{ from: A, to: A }` | Engine loads the config | Error: "self-transition not permitted" |
| SM-08 | A state name like `"Active"` (uppercase) | Engine loads the config | Error: "invalid state name" |
| SM-09 | A state name longer than 30 characters | Engine loads the config | Error: "invalid state name" |
| SM-10 | `extends` pointing to a non-existent machine | Engine resolves extends | Error: "unknown parent" |
| SM-11 | Machine A extends B, and B extends C | Engine resolves extends | Error: "chained inheritance" |

### Transition Validation

| Rule | Given | When | Then |
|---|---|---|---|
| SM-20 | Item in state `active`, target `done` | `validate_transition()` called | Ok: transition is valid |
| SM-21 | Item in state `active`, target `inbox` | `validate_transition()` called | Error: "Cannot transition from 'active' to 'inbox'" with valid targets listed |
| SM-22 | Item in state `done` (terminal), target `active` | `validate_transition()` called | Error: no transitions from terminal state |
| SM-23 | Target state `deployed` not in machine | `validate_transition()` called | Error: "State 'deployed' does not exist" |
| SM-24 | Item in state `unknown_state` (not in machine) | `validate_transition()` called | Warning emitted, transition allowed |
| SM-25 | Item with `type: bug`, `bug` machine exists | `resolve()` called | Returns the `bug` machine |
| SM-26 | Item with `type: bug`, no `bug` machine, `default` exists in config | `resolve()` called | Returns `default` machine from config |
| SM-27 | Item with no `type`, no config | `resolve()` called | Returns hardcoded default |

### Timestamp Side Effects

| Rule | Given | When | Then |
|---|---|---|---|
| SM-30 | Item with `started_at: None`, transitioning to `active` | Transition succeeds | `started_at` set to `now()` |
| SM-31 | Item with `started_at: Some(...)`, transitioning to `blocked` | Transition succeeds | `started_at` unchanged |
| SM-32 | Item transitioning to `done` | Transition succeeds | `completed_at` set to `now()` |
| SM-33 | Item transitioning to `cancelled` | Transition succeeds | `completed_at` set to `now()` |
| SM-34 | Item transitioning from `done` to `active` via `--force` | Transition succeeds | `completed_at` cleared |
| SM-35 | Item transitioning to `blocked` without `blocked_reason` | Transition attempted | Error: "blocked_reason is required" |
| SM-36 | Item transitioning from `blocked` to `active` | Transition succeeds | `blocked_reason` removed from frontmatter |
| SM-37 | Any transition | Transition succeeds | `updated_at` set to `now()` |

### Extends Resolution

| Rule | Given | When | Then |
|---|---|---|---|
| SM-40 | Child adds state `review` not in parent | Extends resolved | Merged machine has all parent states plus `review` |
| SM-41 | Child overrides parent's `done` state config | Extends resolved | Child's config for `done` is used |
| SM-42 | Child defines transitions from `active` | Extends resolved | All parent transitions from `active` replaced by child's |
| SM-43 | Child does not define transitions from `inbox` | Extends resolved | Parent's transitions from `inbox` preserved |

---

## 12. Examples

### Example 1: Bug Workflow with Review State

A development team requires code review before bugs can be marked as done.

```yaml
state_machines:
  bug:
    extends: default
    states:
      review: {}
    transitions:
      - { from: active, to: review }
      - { from: active, to: blocked }
      - { from: active, to: cancelled }
      - { from: review, to: done }
      - { from: review, to: active }
      - { from: review, to: cancelled }
```

```
                     +----------+
                +--->| CANCELLED|
                |    +----------+
                |      ^ ^ ^ ^
             reject    | | | |
                |      | | | |
           +----+---+  | | | |
  *------->|  INBOX  |  | | | |
           +----+----+  | | | |
                |        | | | |
              triage     | | | |
                |        | | | |
           +----v----+   | | | |
           |  READY  +---+ | | |
           +----+----+     | | |
                |           | | |
              start         | | |
                |           | | |
           +----v----+     | | |
    +----->|  ACTIVE  +----+ | |
    |      +--+-+-----+     | |
    |         | |            | |
    |     block |  +---------+ |
    |         | |  |           |
    |    +----+ |  |  +--------+
    |    |      v  v  |
    |  +-v------+  +--v-----+
    |  | BLOCKED|  | REVIEW  |
    |  +--------+  +--+--+--+
    |    |            |  |
    |  unblock  rework|  | approve
    |    |            |  |
    +----+    +-------+  |
              |          |
              v     +----v----+
           (active) |  DONE   |
                    +---------+
```

Work item example:

```yaml
---
id: BUG-42
title: Fix null pointer in payment processing
status: review
type: bug
created_at: 2026-02-20T10:00:00Z
assignee: alice
started_at: 2026-02-21T09:00:00Z
---

Fix submitted, waiting for code review from Bob.
```

### Example 2: Deployment Pipeline

A continuous delivery workflow where items move through staged environments.

```yaml
state_machines:
  deployment:
    states:
      planned:    { initial: true }
      staging:    {}
      canary:     {}
      production: { terminal: true }
      rollback:   { terminal: true }
    transitions:
      - { from: planned, to: staging }
      - { from: staging, to: canary }
      - { from: staging, to: rollback }
      - { from: canary, to: production }
      - { from: canary, to: rollback }
```

```
  *----->+----------+
         | PLANNED  |
         +----+-----+
              |
         deploy to staging
              |
         +----v-----+
         | STAGING   +------+
         +----+------+      |
              |              |
         promote to      rollback
           canary            |
              |              |
         +----v-----+       |
         |  CANARY   +--+   |
         +----+------+  |   |
              |          |   |
         promote to   rollback
          production     |   |
              |          |   |
         +----v------+  |  +v--------+
         | PRODUCTION|  +->| ROLLBACK |
         +-----------+     +----------+
```

Work item example:

```yaml
---
id: DEPLOY-7
title: Release v2.3.1 to production
status: canary
type: deployment
created_at: 2026-02-22T14:00:00Z
assignee: ci-bot
started_at: 2026-02-22T14:05:00Z
tags: [release:v2.3.1, team:platform]
---

## Deployment Notes

- Canary at 5% traffic since 14:30 UTC
- Error rate: 0.02% (baseline: 0.01%)
- Latency p99: 245ms (baseline: 240ms)
- Decision: promote or rollback by 16:00 UTC
```

### Example 3: Minimal Machine

The simplest possible valid state machine, for quick personal task tracking.

```yaml
state_machines:
  default:
    states:
      todo: { initial: true }
      done: { terminal: true }
    transitions:
      - { from: todo, to: done }
```

```
  *----->+------+       +------+
         | TODO +------>| DONE |
         +------+       +------+
```

Work item example:

```yaml
---
id: CMT-1
title: Buy groceries
status: todo
created_at: 2026-02-23T08:00:00Z
---
```

### Example 4: Investigation Workflow

An investigation workflow with research and reporting phases, inspired by the task-platform
analysis patterns.

```yaml
state_machines:
  investigation:
    extends: default
    states:
      researching: {}
      reporting:   {}
    transitions:
      - { from: ready, to: researching }
      - { from: ready, to: active }
      - { from: ready, to: cancelled }
      - { from: researching, to: reporting }
      - { from: researching, to: blocked }
      - { from: researching, to: cancelled }
      - { from: reporting, to: done }
      - { from: reporting, to: researching }
      - { from: reporting, to: cancelled }
      - { from: active, to: researching }
      - { from: active, to: blocked }
      - { from: active, to: done }
      - { from: active, to: cancelled }
```

```
           +----------+
      +--->| CANCELLED|
      |    +----------+
      |      ^ ^ ^ ^ ^
      |      | | | | |
 +----+---+  | | | | |
 |  INBOX  |  | | | | |
 +----+----+  | | | | |
      |       | | | | |
    triage    | | | | |
      |       | | | | |
 +----v----+  | | | | |
 |  READY  +--+ | | | |
 +--+-+----+    | | | |
    | |         | | | |
    | +------+  | | | |
    |        |  | | | |
    v        v  | | | |
 +------+ +--+-+-+-+--+     +---------+
 |ACTIVE+>| RESEARCHING+---->REPORTING|
 +--+---+ +-----+------+<---+--+-----+
    |  ^        |               |
    |  |      block             |
    |  |        |               |
    | +-+-------v+              |
    | | BLOCKED  |              |
    | +----------+              |
    |                           |
    +----------+   +------------+
               |   |
            +--v---v--+
            |  DONE   |
            +---------+
```

Work item example:

```yaml
---
id: INV-12
title: Investigate points discrepancy for CS-P-310455
status: researching
type: investigation
created_at: 2026-02-22T09:00:00Z
assignee: dpwanjala
priority: high
started_at: 2026-02-22T09:30:00Z
tags: [client:wyndham, domain:loyalty/points]
---

## Description

Customer reports incorrect points balance after booking modification.

## Research Plan

1. Query booking details from transaction database
2. Trace points flow through ETL pipeline
3. Compare expected vs actual points calculation
4. Identify root cause

## Findings

(In progress)
```

---

## 13. Edge Cases

### Circular Machines

A machine where non-terminal states form a cycle is valid as long as all constraints are met:

```yaml
# Valid: circular between active states, with a terminal exit
state_machines:
  review-cycle:
    states:
      draft:     { initial: true }
      review:    {}
      revision:  {}
      approved:  { terminal: true }
      rejected:  { terminal: true }
    transitions:
      - { from: draft, to: review }
      - { from: review, to: revision }
      - { from: review, to: approved }
      - { from: review, to: rejected }
      - { from: revision, to: review }
```

The cycle `review -> revision -> review` is valid because:
- C-03 is met: all non-terminal states have outgoing transitions
- C-05 is met: all states are reachable from `draft`
- There is no constraint on cycle-free graphs

### Empty Transitions List

A machine with states but no transitions is invalid unless all states are both initial and
terminal (which would be an unusual but technically valid configuration):

```yaml
# Invalid: non-terminal state 'ready' has no outgoing transitions
state_machines:
  broken:
    states:
      inbox: { initial: true }
      ready: {}
      done:  { terminal: true }
    transitions: []
```

This fails constraint C-03 (`ready` has no outgoing transitions) and C-05 (`ready` and `done` are unreachable from `inbox`).

### Unknown Type Fallback

When a work item has a `type` that does not match any configured state machine:

```yaml
# config.yml
state_machines:
  bug:
    extends: default
    states:
      review: {}
    transitions:
      - { from: active, to: review }
      - { from: active, to: blocked }
      - { from: active, to: cancelled }
      - { from: review, to: done }
      - { from: review, to: active }
      - { from: review, to: cancelled }
```

```yaml
# CMT-5.md frontmatter
type: feature   # No "feature" machine configured
status: active
```

Resolution: no `feature` machine exists, so the engine falls back to the `default` key.
If `default` is not in the config either, the hardcoded default is used. The item is
validated against the fallback machine. No warning is emitted for a missing type-specific
machine (this is normal operation, not an error).

### Item Created Without Config, Later Config Added

A work item is created when no `config.yml` exists (using the hardcoded default), then
later a `config.yml` is added with different states:

```yaml
# Item was created with status: active (valid in hardcoded default)
# Later, config.yml is added:
state_machines:
  default:
    states:
      new:       { initial: true }
      working:   {}
      finished:  { terminal: true }
    transitions:
      - { from: new, to: working }
      - { from: working, to: finished }
```

The item's `status: active` is now not in the configured machine. When a transition is
attempted, the engine detects that the current state `active` is unknown (validation step 2
in Section 6). It emits a warning and allows the transition to proceed. The user can use
`cmt status CMT-1 working --force` to migrate the item to a valid state.

### Multiple Initial States

A machine can have more than one initial state. This is valid and useful for workflows where
items can enter from different origins:

```yaml
state_machines:
  support:
    states:
      email:     { initial: true }
      phone:     { initial: true }
      triaged:   {}
      resolved:  { terminal: true }
    transitions:
      - { from: email, to: triaged }
      - { from: phone, to: triaged }
      - { from: triaged, to: resolved }
```

When creating a new item of type `support`, the CLI can accept any initial state via
`cmt add --status email "Customer complaint"`.

### Terminal State as Only State

A machine with a single state that is both initial and terminal is technically valid:

```yaml
state_machines:
  log-entry:
    states:
      logged: { initial: true, terminal: true }
    transitions: []
```

This represents a work item that is created already complete (e.g., a log entry, a record).
No transitions are possible. Constraint C-03 is satisfied because the only state is terminal
(the constraint applies only to non-terminal states). Constraint C-04 is satisfied because
there are no outgoing transitions.

### Config Removed Mid-Project

If `config.yml` is deleted or the `state_machines` section is removed while items exist with
custom types:

- The engine falls back to the hardcoded default for all items
- Items with states not in the hardcoded default (e.g., `review`, `researching`) are in an
  unknown state
- Transition attempts from unknown states emit a warning and proceed
- The `cmt check` command (Spec 03) reports these as warnings: "Item CMT-42 has status
  'review' which is not in the active state machine"

### Race Condition: Two Actors Transition Simultaneously

Since catchmytask is file-based, two actors (e.g., a human and an agent) could attempt to
transition the same item at the same time. The second write wins (last-writer-wins). Git
merge will detect the conflict if both changes are committed. The resolution:

- Each actor reads the file, validates the transition, writes the file
- If the file changed between read and write, the CLI detects the modification timestamp
  mismatch and reports: `"Item {id} was modified since it was read. Re-read and retry."`
- In Phase 1, this is advisory (the write still proceeds). In Phase 2, optimistic locking
  can be added using the `updated_at` field as a version check.

---

## Appendix: Cross-References

| Topic | Spec |
|---|---|
| Work item `status` field definition and all timestamp fields | [Spec 01: Work Item Schema](01-work-item-schema.md) |
| CLI commands that trigger transitions (`cmt status`, `cmt done`) | [Spec 03: CLI Interface](03-cli-interface.md) |
| `state_machines` key placement within `config.yml` | [Spec 04: Config Format](04-config-format.md) |
| Indexing of `status` field for fast queries | [Spec 05: SQLite Index](05-sqlite-index.md) |

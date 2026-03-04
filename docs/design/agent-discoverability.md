---
design: "01"
title: Agent Discoverability & Documentation System
status: implemented
version: 0.1.0
created: 2026-02-23
implements: ["03-cli-interface"]
references:
  - docs/research/06-first-principles.md
  - docs/specs/03-cli-interface.md
sources:
  - https://blog.cloudflare.com/code-mode/
  - https://blog.cloudflare.com/code-mode-mcp/
  - https://www.anthropic.com/engineering/code-execution-with-mcp
  - https://github.com/microsoft/playwright-cli
---

# Design 01: Agent Discoverability & Documentation System

## 1. Problem Statement

AI agents need to discover and learn tool capabilities progressively. The dominant
approaches — MCP tool schemas and static documentation — both fail at this:

- **MCP tool schemas** dump all capabilities into context upfront. Cloudflare discovered
  that their 2,500+ API endpoints would require 1.17M tokens as MCP tools — exceeding
  most context windows entirely.
- **Static documentation** (README files, man pages) either loads too much context or
  too little. An agent reading a 5K-token README wastes budget on information irrelevant
  to its current task.

catchmytask needs a system where agents load ~150 tokens to understand the tool, ~350
tokens to learn a specific command, and never pay for capabilities they don't use.

## 2. Industry Analysis

### 2.1 Cloudflare Code Mode

**Key insight**: LLMs write better code against typed APIs than they do calling tools.
Cloudflare reduced their 2,500-endpoint API from 1.17M tokens to ~1,000 tokens (99.9%
reduction) by exposing just two operations: `search()` and `execute()`.

**What we borrow**:
- Composition over enumeration. Don't list every capability; let agents discover
  what they need.
- Token budget as a first-class design constraint. Measure everything in tokens.
- Code execution beats tool calling for complex multi-step operations.

**What we discard**:
- V8 sandbox execution model. We're a local CLI, not a cloud platform. Our "sandbox"
  is the filesystem with git as the undo mechanism.
- Two-tool abstraction. Our CLI has 15 commands, not 2,500 endpoints. The full
  command list fits in ~150 tokens as flat names. The search+execute pattern solves
  a scale problem we don't have.

### 2.2 Anthropic MCP Code Execution

**Key insight**: Moving data processing into the execution environment before returning
results to the model reduces token usage by 98.7% (150K to 2K tokens in one example).
Agents should filter and transform data locally, not route everything through the
context window.

**What we borrow**:
- Progressive disclosure through filesystem exploration. Agents discover tool
  definitions by navigating a hierarchy, not by receiving a catalog.
- Skill persistence. Agents can save reusable patterns as higher-level operations
  that improve over time.
- Privacy-preserving architecture. Intermediate results stay local by default.

**What we discard**:
- MCP protocol overhead. For a local CLI tool, MCP adds a network protocol layer
  (JSON-RPC, stdio transport, capability negotiation) that contradicts our "files as
  foundation" principle. The CLI with `--json` is strictly more direct.
- Server lifecycle management. MCP servers must be started, connected, and kept alive.
  A CLI binary is always available.

### 2.3 Playwright CLI (Skills Pattern)

**Key insight**: "Modern coding agents increasingly favor CLI-based workflows exposed
as SKILLs over MCP because CLI invocations are more token-efficient." Playwright
measured their CLI at 27K tokens vs 114K tokens for the equivalent MCP server — a 4x
improvement.

**What we borrow**:
- **Self-documenting CLI**: `--help` as the discovery mechanism. No external schema
  to maintain or sync.
- **Skill installation**: `playwright-cli install --skills` registers the CLI as a
  discoverable capability in agent environments. We adopt this with SKILL.md.
- **Snapshot-based state**: Each command returns essential state without embedding
  full internal structures. Our `--json` output follows this pattern.
- **Stateless invocations**: Each CLI call is self-contained. Agents compose flows
  through sequential calls, not persistent connections.

**What we discard**:
- Browser-specific concerns (DOM snapshots, visual monitoring, session management).
- The assumption that skills are installed from a package registry. Our SKILL.md
  ships with the repo.

### 2.4 Summary: CLI vs MCP for catchmytask

| Dimension | MCP | CLI + --json |
|-----------|-----|-------------|
| Token cost per invocation | Higher (schema + response framing) | Lower (command + stdout) |
| Discovery | Tool list in capabilities negotiation | `--help`, `help-agent --json` |
| State management | Server maintains state | Stateless; filesystem is state |
| Availability | Requires running server process | Binary always available |
| Security surface | JSON-RPC transport, capability negotiation | Shell execution (needs shell) |
| Scaling | Better at 100+ tools (search+execute) | Better at <50 tools (direct commands) |
| Offline | Requires server process | Works anywhere the binary exists |

**Decision**: CLI-first. catchmytask has 15 commands, operates on local files, and
targets environments where agents have shell access (Claude Code, Cursor, Copilot
Workspace). MCP adds complexity without benefit at this scale. Revisit when a web UI
or remote dashboard requires network-accessible tool invocation.

## 3. Design Principles

These principles derive from first-principles research (docs/research/06-first-principles.md)
applied specifically to the discoverability problem:

### P1. Self-Describing Over Static

The system describes itself at runtime. `cmt help-agent` introspects clap command
definitions — when a developer adds `--flag` to a command, it appears in agent help
automatically. No separate documentation to maintain, no drift.

*Rationale*: Principle 8 (Files as Foundation) applied to documentation. The code IS
the documentation. Static docs become stale; runtime introspection cannot.

*Measure*: Zero manual maintenance required when adding a new flag or command to the CLI.

### P2. Token Budget as Design Constraint

Every output tier has a token budget. Exceeding it is a bug, not a style preference.

| Tier | Budget | Mechanism |
|------|--------|-----------|
| 0: "What is this?" | ~150 tokens | `help-agent --json` overview |
| 1: "How do I use X?" | ~350 tokens | `help-agent <cmd> --json` |
| 2: "Project conventions" | ~400 tokens | `help-agent --conventions --json` |
| 3: "Full reference" | ~2K tokens | SKILL.md |

*Rationale*: Principle 7 (Progressive Capability). Agents should never pay for
information they don't need. A 150-token overview is enough to decide "should I use
this tool?" A 350-token command detail is enough to construct the right invocation.

*Measure*: Tier 0 JSON output < 1200 bytes (759 bytes actual, including global_flags). Enforced by test.

### P3. Flat Names, Deep on Demand

Tier 0 returns command names as a flat string array: `["add","list","show","done",...]`.
Not objects with descriptions. The agent knows what's available in minimal tokens, then
drills into specific commands only when needed.

*Rationale*: Cloudflare's key lesson. Their 2,500 endpoints collapsed to 2 tools.
Our 15 commands collapse to a flat list. The agent's context window is not a menu —
it's working memory.

*Contrast*: Many CLI tools expose `--help` with full descriptions of every command.
This is fine for humans (who scan visually) but wasteful for agents (who pay per token).

### P4. Committed Discovery Files

`.cmt/ABOUT.md` and `.cmt/CONVENTIONS.md` are committed to git, not gitignored.
An agent cloning a repo immediately discovers that `cmt` is the tool and how the
project is configured — without executing any commands.

*Rationale*: Principle 5 (Async by Default). The agent may not have `cmt` installed
yet. It may be scanning repos to understand them. The discovery files are readable
with `cat`, `grep`, or any file reader.

*Contrast*: MCP requires a running server to discover capabilities. Our discovery
works with just `git clone`.

### P5. Auto-Regeneration Over Manual Maintenance

Discovery files are regenerated from config automatically:
- `cmt init` generates ABOUT.md and CONVENTIONS.md
- `cmt config set` regenerates both after any config change
- `cmt init --force` regenerates everything

*Rationale*: Principle 9 (Convention Over Configuration). The config.yml is the
single source of truth. Discovery files are derived views. Manual editing of
auto-generated files is explicitly discouraged (header comment says so).

### P6. Works Without .cmt/

`cmt help-agent` and `cmt help-agent <cmd>` work in any directory, even without
a `.cmt/` folder. An agent can discover the CLI's capabilities before running
`cmt init`. Only `--conventions` requires an initialized project (because
conventions are project-specific).

*Rationale*: Principle 7 (Progressive Capability). Discovery before commitment.
An agent evaluating whether to use `cmt` should not need to initialize a project
first.

### P7. Human and Agent as Peers

Every output has two modes:
- Without `--json`: human-readable tables and prose
- With `--json`: compact, single-line JSON for agents

Both modes carry the same information. The JSON mode is not a degraded afterthought;
it's the primary design target with human formatting added on top.

*Rationale*: Principle 2 (Actor Agnosticism). The system doesn't privilege either
actor type.

## 4. Architecture

### 4.1 Four-Tier Progressive Discovery

```
Agent lands in a repo
         |
         v
Tier 0: .cmt/ABOUT.md or `cmt help-agent --json`     (~150 tokens)
         "This project uses work. Here are the commands."
         |
         v  (agent needs to add a task)
Tier 1: `cmt help-agent add --json`                     (~350 tokens)
         "add takes TITLE, --priority, --tag, --assignee..."
         |
         v  (agent needs to understand project conventions)
Tier 2: `cmt help-agent --conventions --json`            (~400 tokens)
         "States: inbox->ready->active->done. Default priority: none."
         |
         v  (agent is a persistent collaborator on this project)
Tier 3: SKILL.md loaded as agent skill                    (~2K tokens)
         Full workflow patterns, all commands, tips.
```

Each tier is self-contained. An agent that only needs Tier 0 never loads Tier 1-3.
An agent that needs Tier 1 doesn't also need Tier 0 (Tier 1 includes the command
name in its output).

### 4.2 Runtime Introspection (help-agent)

The `help-agent` command uses `clap::CommandFactory` to introspect the CLI at runtime:

```
Cli::command() → clap::Command
    .get_subcommands()     → iterate commands
    .get_positionals()     → positional args
    .get_opts()            → option flags
    .get_possible_values() → enum values
    .get_default_values()  → defaults
    .get_help()            → help strings
    .get_all_aliases()     → command aliases
    .has_subcommands()     → nested commands (e.g., config show/get/set)
```

This is augmented by a static `command_metadata()` lookup that provides examples
and exit codes — information clap cannot express. The lookup uses a match statement;
adding a new command without updating metadata doesn't cause a compile error (the
wildcard provides a safe fallback), but the function comment reminds developers to
grep for it.

### 4.3 Auto-Generated Discovery Files

```
cmt init / cmt config set
         |
         v
    Config::load()
         |
    +----+----+
    |         |
    v         v
ABOUT.md  CONVENTIONS.md
(~6 lines) (~30 lines)
```

Both files use `crate::storage::atomic_write()` for crash safety. Generation
errors are non-fatal (`let _ =`) — the CLI should never fail because a discovery
file couldn't be written.

**ABOUT.md** (~6 lines): Project summary with prefix and state flow. Designed for
agents scanning repos to understand "what tool manages work here?"

**CONVENTIONS.md** (~30 lines): Full project conventions including state machine,
defaults, tag namespaces, and git settings. Designed for agents that need to
understand the rules before modifying work items.

Both use BFS-ordered state listing (workflow order, not alphabetical) so states
appear in the order an item would traverse them: inbox, ready, active, blocked,
done, cancelled.

### 4.4 SKILL.md (Agent Skill Reference)

SKILL.md is a ~80-line Markdown file that ships with the repository root. It's
designed to be loaded as a "skill" by agent environments like Claude Code.

It contains:
1. Essential commands table (7 rows)
2. Agent workflow (5-step bash example)
3. State machine (one-line visual)
4. Key flags (4 items)
5. Discovery commands (how to learn more)

SKILL.md is the only file an agent loads when activating the skill. It stays
under 2K tokens and points to `help-agent` for deeper information.

## 5. What We Explicitly Do NOT Build

### 5.1 MCP Server (Deferred)

MCP adds value when:
- The agent doesn't have shell access (web-based agents, sandboxed environments)
- The tool surface is massive (100+ tools, like Cloudflare's 2,500 endpoints)
- Persistent state is needed between invocations (browser sessions, database connections)

None of these apply to catchmytask today. The CLI is faster, more token-efficient,
and simpler. Build an MCP server when a web UI, remote dashboard, or hosted agent
platform requires network-accessible tool invocation.

### 5.2 Dynamic Tool Generation (Deferred)

Cloudflare's Code Mode generates TypeScript APIs from OpenAPI specs. This is powerful
for large, frequently-changing APIs. catchmytask has 15 stable commands. The overhead
of maintaining generated API wrappers exceeds the benefit.

### 5.3 Package Registry Distribution (Deferred)

Playwright's `install --skills` installs from a registry. catchmytask is distributed
as a single binary. SKILL.md ships with each project repo. An install command makes
sense when distributed via crates.io or a Homebrew tap.

### 5.4 Adaptive Context (Future Consideration)

An advanced system could track which commands an agent has used and pre-load relevant
help. For example, after `cmt add`, proactively suggest `cmt list` and `cmt status`.
This is a nice-to-have that requires usage telemetry infrastructure we don't have.

## 6. Evaluation Criteria

Rate the implementation against these criteria:

| Criterion | Target | How to Measure | Actual |
|-----------|--------|----------------|--------|
| Tier 0 token budget | < 300 tokens (~1200 bytes) | `cmt help-agent --json \| wc -c` | 759 bytes |
| Tier 1 token budget | < 400 tokens (~1500 bytes) | `cmt help-agent add --json \| wc -c` | 1353 bytes |
| Zero-maintenance flags | New flags auto-appear | Add a flag, run help-agent, verify | PASS |
| Works without .cmt/ | help-agent succeeds in empty dir | `cd /tmp && cmt help-agent --json` | PASS |
| Discovery file freshness | Config changes propagate | `cmt config set ...` then `cat CONVENTIONS.md` | PASS |
| JSON compactness | Single-line output | `cmt help-agent --json \| wc -l` == 1 | PASS |
| Alias resolution | `ls` resolves to `list` | `cmt help-agent ls --json` | PASS |
| Conflict rejection | Contradictory flags fail | `cmt help-agent --conventions add` | PASS |
| Subcommand visibility | Nested commands exposed | `cmt help-agent config --json` shows show/get/set | PASS |
| Workflow state ordering | BFS order, terminals last | CONVENTIONS.md lists inbox before ready, done/cancelled last | PASS |
| Global flags discoverable | `global_flags` in tier 0 | `cmt help-agent --json` includes global_flags array | PASS |
| Padded ID resolution | PROJ-0001 works like PROJ-1 | `cmt show PROJ-0001` resolves correctly | PASS |

## 7. Lessons from Industry (Reference)

### From Cloudflare Code Mode
1. **Token budget is a design constraint, not a nice-to-have.** Measure it. Test it.
2. **Composition beats enumeration.** Let agents build up understanding incrementally.
3. **Code-against-APIs beats tool-calling** for complex operations (but our operations
   aren't complex enough to need this pattern).

### From Anthropic MCP Code Execution
1. **Move processing to the edge.** Filter data locally before sending to the model.
   Our `--json` output is already minimal; `list -s active` filters server-side.
2. **Progressive disclosure through hierarchy.** Tier 0 → 1 → 2 → 3 mirrors their
   filesystem exploration pattern.
3. **Skills persist and improve.** SKILL.md is the seed; agents can build on it.

### From Playwright CLI
1. **CLI is 4x more token-efficient than MCP** for agents with shell access. This
   validated our CLI-first decision.
2. **Self-documenting beats external schemas.** `--help` as the source of truth
   means zero drift between implementation and documentation.
3. **Skill installation pattern.** SKILL.md is our equivalent of `install --skills`.
4. **Stateless invocations compose better.** Each `cmt` command is self-contained.

### Anti-Patterns to Avoid
1. **Don't build MCP prematurely.** It adds protocol overhead without benefit at
   our scale. Wait for a concrete need (web UI, remote agents).
2. **Don't enumerate everything upfront.** Tier 0 is names only. Details on demand.
3. **Don't maintain separate documentation.** Auto-generate from the source of truth
   (clap definitions + config.yml). Manual docs drift.
4. **Don't assume persistent connections.** Each CLI invocation is independent. This
   is a feature, not a limitation — it matches how agents actually call tools.

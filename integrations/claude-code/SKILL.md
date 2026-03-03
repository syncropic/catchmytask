---
name: managing-work
description: |
  Manage work items using the catchmytask CLI (`cmt`). Items are Markdown files with YAML frontmatter in .cmt/items/.

  WHEN TO USE THIS SKILL:
  - User asks to create, track, or manage work items or tasks
  - User wants to search for or list work items
  - User asks to complete, block, or transition work items
  - User mentions: "cmt item", "cmt add", "cmt list", "track work"

  CRITICAL RULES:
  1. ALWAYS use the `cmt` CLI with --json flag for structured output
  2. Set CMT_ACTOR=claude-agent or use --actor to identify yourself
  3. Item IDs follow PREFIX-NNN format (e.g., CMT-0001)
  4. Use `cmt help-agent <cmd> --json` to learn any command's full options
  5. Check .cmt/CONVENTIONS.md for project-specific state machine and defaults
---

# catchmytask CLI

Work management for humans and AI agents. Items are Markdown files in `.cmt/items/`.

## Essential Commands

| Command | Usage | What it does |
|---------|-------|-------------|
| `init` | `cmt init --prefix PROJ` | Initialize `.cmt/` in current directory |
| `add` | `cmt add "Title" -p high` | Create a work item |
| `list` | `cmt list --json` | List items (excludes done by default) |
| `show` | `cmt show ID --json` | Show item details |
| `done` | `cmt done ID` | Mark item complete |
| `status` | `cmt status ID active` | Change item status |
| `search` | `cmt search "query" --json` | Full-text search |
| `edit` | `cmt edit ID --set key=value` | Modify item fields |

Aliases: `ls` = `list`, `rm` = `delete`.

## Agent Workflow

```bash
# 1. Find available work
cmt list -s ready --json

# 2. Pick up a task
cmt status CMT-0001 active

# 3. Read context
cmt show CMT-0001 --json

# 4. Do the work...

# 5. Complete it
cmt done CMT-0001
```

## State Machine

```
inbox -> ready -> active -> done
                    |
                    v
                  blocked -> active
           (any) -> cancelled
```

## Key Flags

- `--json` / `-j` — structured JSON output (use on every command)
- `--actor NAME` or `CMT_ACTOR` env — identify yourself in event logs
- `--quiet` / `-q` — suppress non-essential stderr output
- `--dir PATH` — specify `.cmt/` directory location

## Discovery

```bash
cmt help-agent --json              # Tool overview (~150 tokens)
cmt help-agent add --json          # Single command detail
cmt help-agent --conventions --json # Project state machine & defaults
```

Auto-generated files in `.cmt/`:
- `ABOUT.md` — project summary
- `CONVENTIONS.md` — states, transitions, defaults, tag namespaces

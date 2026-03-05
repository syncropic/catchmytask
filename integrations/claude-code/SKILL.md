---
name: managing-work
description: |
  Manage work items using CatchMyTask CLI (`cmt`). Items are Markdown
  files with YAML frontmatter in .cmt/items/.

  WHEN TO USE THIS SKILL:
  - User asks to create, track, or manage work items or tasks
  - User wants to search for or list work items
  - User asks to complete, block, or transition work items
  - User mentions: "work item", "cmt add", "cmt list", "track work", "catchmytask"

  CRITICAL RULES:
  1. ALWAYS use the `cmt` CLI with --json flag for structured output
  2. Set CMT_ACTOR=claude-agent or use --actor to identify yourself
  3. Item IDs follow PREFIX-NNN format (e.g., CMT-0001). Both CMT-1 and CMT-0001 work.
  4. Use `cmt help-agent <cmd> --json` to learn any command's full options
  5. Check .cmt/CONVENTIONS.md for project-specific state machine and defaults
---

# CatchMyTask CLI

Work management for humans and AI agents. Items are Markdown files in `.cmt/items/`.

## Essential Commands

| Command    | Usage                                | What it does                             |
| ---------- | ------------------------------------ | ---------------------------------------- |
| `init`     | `cmt init --prefix PROJ`            | Initialize `.cmt/` in current directory  |
| `add`      | `cmt add "Title" -p high`           | Create a work item                       |
| `list`     | `cmt list --json`                   | List items (excludes done by default)    |
| `show`     | `cmt show ID --json`                | Show item details                        |
| `done`     | `cmt done ID`                       | Mark item complete                       |
| `status`   | `cmt status ID active`              | Change item status                       |
| `search`   | `cmt search "query" --json`         | Full-text search                         |
| `edit`     | `cmt edit ID --set key=value`       | Modify item fields                       |
| `archive`  | `cmt archive --done`                | Archive completed/cancelled items        |
| `log`      | `cmt log ID`                        | Show event history for an item           |
| `check`    | `cmt check`                         | Validate items and find issues           |
| `doctor`   | `cmt doctor -v`                     | Check system health and configuration    |
| `reindex`  | `cmt reindex --force`               | Rebuild SQLite index                     |
| `serve`    | `cmt serve`                         | Start web UI on port 3170                |
| `projects` | `cmt projects`                      | Manage global project registry           |
| `setup`    | `cmt setup`                         | Install agent platform integrations      |

Aliases: `ls` = `list`, `rm` = `delete`.

## Agent Workflow

```bash
# 1. Find available work
CMT_ACTOR=claude-agent cmt list -s ready --json

# 2. Pick up a task
cmt status CMT-1 active --actor claude-agent

# 3. Read context
cmt show CMT-1 --json

# 4. Do the work...

# 5. Complete it
cmt done CMT-1
```

## Creating Items (Agent Tips)

```bash
# Simple task
cmt add "Fix login bug" -p high --json

# With body content (useful for agents providing context)
cmt add "Investigate API timeout" -p high -b "Seen in production logs at 14:00 UTC" --json

# With tags and assignee
cmt add "Refactor auth" -t task -p medium -a alice --tag team:backend --json

# Complex item (gets its own folder for evidence/attachments)
cmt add "Security audit" --complex --json
```

## Editing Items

```bash
cmt edit CMT-1 --set priority=critical     # Change a field
cmt edit CMT-1 --add-tag team:frontend      # Add a tag
cmt edit CMT-1 --remove-tag team:backend    # Remove a tag
cmt edit CMT-1 --add-dep CMT-2             # Add dependency
cmt edit CMT-1 --body "New description"     # Replace body
cmt edit CMT-1 --append "## Update\nDone"  # Append to body
```

## State Machine

```
inbox -> ready -> active -> done
                    |
                    v
                  blocked -> active
           (any) -> cancelled
```

Use `--reason` when blocking: `cmt status CMT-1 blocked --reason "Waiting on API"`

## Key Flags

- `--json` / `-j` — structured JSON output (use on every command)
- `--actor NAME` or `CMT_ACTOR` env — identify yourself in event logs
- `--quiet` / `-q` — suppress non-essential stderr output
- `--dir PATH` — specify `.cmt/` directory location

## Filtering & Search

```bash
cmt list -s active -p high --json          # Active, high priority
cmt list --assignee alice --json           # By assignee
cmt list --tag team:backend --json         # By tag
cmt list --overdue --json                  # Overdue items
cmt list --blocked --json                  # Items with unmet dependencies
cmt list -A --json                         # Include archived
cmt search "auth timeout" --json           # Full-text search
```

## Web UI & Server

```bash
cmt serve                     # Start on http://127.0.0.1:3170
cmt serve --port 8080         # Custom port
cmt serve --open              # Opens browser automatically
```

The web UI supports local mode (IndexedDB) and remote mode (connects to `cmt serve`).

## Discovery

```bash
cmt help-agent --json              # Tool overview (~150 tokens)
cmt help-agent add --json          # Single command detail
cmt help-agent --conventions --json # Project state machine & defaults
```

Auto-generated files in `.cmt/`:

- `ABOUT.md` — project summary
- `CONVENTIONS.md` — states, transitions, defaults, tag namespaces

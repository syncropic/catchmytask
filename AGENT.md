# CatchMyTask — Agent Entry Point

CatchMyTask (`cmt`) is a file-first work management CLI. Work items are Markdown + YAML frontmatter in `.cmt/items/`. Git is the history layer. Agents and humans are equal actors.

## 30-Second Start

```bash
export CMT_ACTOR=your-agent-name
cmt help-agent --json              # discover capabilities
cmt list --json                    # see current items
cmt add "Fix the bug" -p high --json
cmt done PROJ-0001 --json
```

## Rules

- **Always** set `CMT_ACTOR` or pass `--actor` — **always** pass `--json`
- **ID format**: `PREFIX-N` (e.g., `CMT-1` or `CMT-0001` — both accepted)
- **Read** `.cmt/CONVENTIONS.md` for project-specific state machine and defaults
- **Never edit** `.cmt/.index.db` — use `cmt reindex` if needed

## Discovery Tiers

| Tier | Command | Use When |
|------|---------|----------|
| 0 | `cmt help-agent --json` | First encounter |
| 1 | `cmt help-agent <cmd> --json` | Per-command details |
| 2 | `cmt help-agent --conventions --json` | Project conventions |
| 3 | Read `SKILL.md` in repo root | Full reference |

## Key Files

`.cmt/config.yml` (config) · `.cmt/items/*.md` (active items) · `.cmt/archive/*.md` (done/cancelled)
`.cmt/ABOUT.md` (project summary) · `.cmt/CONVENTIONS.md` (conventions) · `.cmt/templates/` (templates)

## Item Formats

- **Simple**: `.cmt/items/CMT-1-title.md` — single Markdown file
- **Complex**: `.cmt/items/CMT-2-title/item.md` — folder with artifacts (evidence, queries, handover files)

## Default State Machine

```
inbox → ready → active → done        States: inbox (initial) · ready · active
                  ↓        ↑          blocked · done (terminal) · cancelled (terminal)
               blocked ────┘
          (any) → cancelled
```

## Common Workflows

```bash
cmt add "Implement feature X" -p high --json    # create
cmt status PROJ-1 active --json                  # start working
cmt status PROJ-1 blocked --json                 # block
cmt search "authentication" --json               # search
cmt list -s active -p high --json                # filter
cmt check --json                                 # validate project
```

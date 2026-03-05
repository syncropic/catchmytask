# Multi-Context Workflow Guide

A practical guide for managing work across multiple roles, projects, and agent sessions
using CatchMyTask — designed for someone who switches between a day job, a founded
company, and personal projects multiple times per day.

## The Problem

You're context-switching across:
- **Day job** — workflows, reports, data engineering
- **Your company** — products, infrastructure, devops
- **Personal** — side projects, learning, open-source

Each context has its own priorities, its own agents running, its own in-progress threads.
The cost of a context switch isn't the switch itself — it's remembering where you left off.

## Architecture: One Project Per Context

CatchMyTask uses **per-directory `.cmt/` folders**, which means each git repo can have its
own work tracking. But for multi-context management, you want a **layered approach**:

```
~/.cmt/                              # Global inbox — captures anything, anytime
├── items/                           # Quick captures that haven't been sorted yet

~/projects/acme-workflows/.cmt/      # Day job context
~/projects/my-saas-app/.cmt/         # Your company: main product
~/projects/my-mobile-app/.cmt/       # Your company: mobile app
~/projects/company-infra/.cmt/       # Your company: company-wide tasks
~/projects/personal-site/.cmt/       # Personal projects
```

### Setting Up

```bash
# Global inbox (for quick captures from anywhere)
cd ~ && cmt init --prefix INBOX

# Day job
cd ~/projects/acme-workflows && cmt init --prefix ACME

# Your company's projects
cd ~/projects/my-saas-app && cmt init --prefix SAAS
cd ~/projects/my-mobile-app && cmt init --prefix MOB
cd ~/projects/company-infra && cmt init --prefix INFRA

# Personal
cd ~/projects/personal-site && cmt init --prefix ME
```

### Register Everything

```bash
cmt projects add ~/projects/acme-workflows
cmt projects add ~/projects/my-saas-app
cmt projects add ~/projects/my-mobile-app
cmt projects add ~/projects/company-infra
cmt projects add ~/projects/personal-site
cmt projects add ~  # Global inbox
```

Now `cmt projects` shows you everything at a glance.

## Daily Workflow

### Morning: Orient (2 minutes)

Before opening any editor or agent session, scan what's hot:

```bash
# What's active across all projects?
for d in ~/projects/acme-workflows ~/projects/my-saas-app ~/projects/company-infra ~; do
  echo "=== $(basename $d) ==="
  cmt list -s active --dir "$d/.cmt" 2>/dev/null || echo "  (none)"
done

# Or just check the projects dashboard
cmt projects
```

Pick your focus for the next block of time. Don't try to work on everything.

### Capturing: Never Lose a Thought

When something comes up that doesn't belong to your current context:

```bash
# Quick capture to global inbox (works from anywhere)
cmt add "Review PR for report framework" --dir ~/.cmt

# Or if you know the context
cmt add "Fix auth timeout" --dir ~/projects/my-saas-app/.cmt -p high
```

The global inbox (`~/.cmt/`) is the key — it's your "dump it here and sort later" zone.

### Context Switching: The 30-Second Handoff

When you need to switch contexts, leave a breadcrumb for your future self:

```bash
# Before switching away — note where you are
cmt edit ACME-12 --append "## Paused $(date +%Y-%m-%d\ %H:%M)\nStopped at: migration script for users table. Next: test with staging data."

# Switch context — check what's waiting
cd ~/projects/my-saas-app
cmt list -s active
cmt list -s ready -p high  # What should I pick up?
```

### Delegating to Agents

When you spin up a Claude Code session (or multiple tabs), give each agent clear scope:

```bash
# Create the task with full context
cmt add "Implement dark mode for settings page" \
  -p medium \
  -a claude-agent \
  -b "Settings page at src/components/SettingsView.tsx needs to respect theme store. Follow the pattern in Navigation.tsx." \
  --tag scope:frontend \
  --json

# Agent picks it up
CMT_ACTOR=claude-agent cmt status SAAS-42 active
# ... agent works ...
CMT_ACTOR=claude-agent cmt done SAAS-42
```

**Multiple agents in parallel:**

```bash
# Tab 1: Agent working on frontend
cmt add "Rebrand docs page colors" -a agent-tab-1 --tag scope:frontend

# Tab 2: Agent working on backend
cmt add "Add archive endpoint" -a agent-tab-2 --tag scope:backend

# Tab 3: Agent doing research
cmt add "Research WebSocket reconnection patterns" -a agent-tab-3 --tag scope:research --complex
```

Use `--complex` for research tasks — agents get a folder to dump findings into.

### End of Day: Sweep (3 minutes)

```bash
# 1. Sort the global inbox
cmt list --dir ~/.cmt
# Move items to their proper projects or just tag them

# 2. Archive what's done
for d in ~/projects/acme-workflows ~/projects/my-saas-app ~/projects/company-infra; do
  cmt archive --done --dir "$d/.cmt" 2>/dev/null
done

# 3. Block anything that's stuck
cmt status SAAS-15 blocked --reason "Waiting on DNS propagation"
```

## Tag Namespaces for Multi-Context

Tags help you slice across projects when needed:

| Namespace | Purpose | Examples |
|-----------|---------|----------|
| `scope:` | What area of the codebase | `scope:frontend`, `scope:backend`, `scope:infra` |
| `role:` | Which persona/hat you're wearing | `role:dayjob`, `role:founder`, `role:personal` |
| `energy:` | What kind of attention it needs | `energy:deep`, `energy:routine`, `energy:quick` |
| `waiting:` | External dependency | `waiting:review`, `waiting:deploy`, `waiting:response` |

This lets you do things like:

```bash
# "I have 20 minutes and low energy, what quick wins can I knock out?"
cmt list --tag energy:quick -s ready

# "What's blocked across my company projects?"
cmt list -s blocked --dir ~/projects/company-infra/.cmt
cmt list -s blocked --dir ~/projects/my-saas-app/.cmt
```

## Prefixes as Context Anchors

Each project gets a unique prefix. When you see `ACME-14`, you instantly know it's day job.
When you see `SAAS-42`, it's your product. This matters when agents report back or when
you're scanning across projects.

| Prefix | Context | Repository |
|--------|---------|------------|
| `INBOX` | Global capture | `~/.cmt` |
| `ACME` | Day job | `acme-workflows` |
| `SAAS` | Main product | `my-saas-app` |
| `MOB` | Mobile app | `my-mobile-app` |
| `INFRA` | Company infrastructure | `company-infra` |
| `ME` | Personal projects | `personal-site` |

## Working with Multiple Agent Tabs

When running multiple Claude Code instances simultaneously:

### Pattern 1: One Agent Per Project
Each tab opens a different repo. The agent naturally works in that project's `.cmt/`.

### Pattern 2: Multiple Agents, Same Project
Use distinct actor names and assign specific items:

```bash
# Assign work before spinning up agents
cmt add "Fix CSS on mobile" -a agent-1 -s ready
cmt add "Write API tests" -a agent-2 -s ready
cmt add "Update README" -a agent-3 -s ready
```

Each agent checks `cmt list -s ready --assignee agent-1 --json` to find its work.

### Pattern 3: Research + Execute
One agent researches, creates items with findings. You review. Another agent executes.

```bash
# Research agent
cmt add "Investigate auth options" --complex -a researcher
# Researcher dumps findings into the complex item folder

# You review, then create execution tasks
cmt add "Implement JWT auth per research in SAAS-50" -a executor -p high
```

## Shell Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Quick capture to global inbox
alias qi='cmt add --dir ~/.cmt'

# Check what's active in current project
alias wa='cmt list -s active'

# Check what's ready to pick up
alias wr='cmt list -s ready'

# Morning dashboard
alias morning='cmt projects && echo "---" && cmt list -s active --dir ~/.cmt 2>/dev/null'
```

## The Key Insight

CatchMyTask doesn't try to be a unified dashboard that shows everything everywhere.
Instead, it gives each **context its own space** (the `.cmt/` directory) while keeping
a **global registry** (`cmt projects`) so you can quickly orient.

The global inbox (`~/.cmt/`) is the bridge — capture anything from anywhere, sort later.
The prefix system means IDs are self-documenting across contexts.

The workflow is:
1. **Capture** — never lose a thought (global inbox)
2. **Orient** — start of each work block, check what's active
3. **Focus** — work in one context at a time
4. **Breadcrumb** — before switching, note where you stopped
5. **Delegate** — spin up agents with clear scope and assignments
6. **Sweep** — end of day, archive done, sort inbox, update blocked items

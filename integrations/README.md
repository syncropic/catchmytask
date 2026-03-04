# Agent Platform Integrations

This directory contains integration adapters for agent platforms. Each subdirectory holds the files needed to register `cmt` with a specific platform.

## Available Integrations

| Platform | Directory | Install Command |
|----------|-----------|-----------------|
| Claude Code | `claude-code/` | `cmt setup --claude-code` |

## How It Works

Integration files are **embedded in the `cmt` binary** at compile time via `include_str!()`. This means:

- The binary is self-contained — no runtime dependency on these files
- `cmt setup` writes the embedded content to the correct location
- Updates ship with new binary versions

## Adding a New Integration

1. Create a directory: `integrations/<platform-name>/`
2. Add the platform-specific files (e.g., `SKILL.md`, `tools.json`)
3. Register the integration in `src/commands/setup.rs`:
   - Add a constant with `include_str!()` for the embedded content
   - Add an entry to the `INTEGRATIONS` array
   - Add a CLI flag to `SetupArgs` in `src/cli.rs`
4. Add tests in `tests/cli_test.rs`

## Claude Code Integration

The `claude-code/SKILL.md` file follows the Claude Code skill format with YAML frontmatter. When installed, it's placed at `~/.claude/skills/managing-work/SKILL.md`.

The skill teaches Claude Code how to use the `cmt` CLI for managing work items, including the command table, agent workflow, state machine, and key flags.

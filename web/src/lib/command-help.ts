export interface HelpEntry {
  usage: string
  description: string
  examples: string[]
  flags?: { flag: string; description: string }[]
}

const helpData: Record<string, HelpEntry> = {
  add: {
    usage: 'add <title> [flags]',
    description: 'Create a new work item',
    examples: [
      'add "Fix login bug"',
      'add "API rate limiting" --priority=high --tag=backend',
      'add "Design review" --assignee=alice --type=task --status=ready',
    ],
    flags: [
      { flag: '--priority=<p>', description: 'none, low, medium, high, critical' },
      { flag: '--assignee=<name>', description: 'Assign to person' },
      { flag: '--tag=<t1,t2>', description: 'Comma-separated tags' },
      { flag: '--type=<type>', description: 'Item type (task, bug, feature, etc.)' },
      { flag: '--status=<s>', description: 'Initial status (must be initial state)' },
      { flag: '--parent=<id>', description: 'Parent item ID' },
      { flag: '--depends-on=<ids>', description: 'Comma-separated dependency IDs' },
      { flag: '--due=<date>', description: 'Due date (YYYY-MM-DD)' },
      { flag: '--body=<text>', description: 'Item body/description' },
    ],
  },
  list: {
    usage: 'list [flags]',
    description: 'List work items with optional filters',
    examples: [
      'list',
      'list --status=active',
      'list --assignee=alice --priority=high',
      'list --tag=backend --status=active,ready',
    ],
    flags: [
      { flag: '--status=<s>', description: 'Filter by status (comma-separated)' },
      { flag: '--priority=<p>', description: 'Filter by priority' },
      { flag: '--assignee=<name>', description: 'Filter by assignee' },
      { flag: '--tag=<tag>', description: 'Filter by tag' },
      { flag: '--type=<type>', description: 'Filter by type' },
    ],
  },
  show: {
    usage: 'show <id>',
    description: 'Open an item in the detail panel',
    examples: ['show CMT-3', 'show 3'],
  },
  open: {
    usage: 'open <id>',
    description: 'Open an item in the detail panel (alias for show)',
    examples: ['open CMT-3'],
  },
  done: {
    usage: 'done [id...]',
    description: 'Mark one or more items as done. Uses selected item if no ID given.',
    examples: ['done', 'done CMT-3', 'done CMT-3 CMT-4 CMT-5'],
  },
  status: {
    usage: 'status <id> <new-status> [flags]',
    description: 'Change item status',
    examples: [
      'status CMT-3 active',
      'status CMT-3 blocked --reason="waiting on API"',
    ],
    flags: [
      { flag: '--reason=<text>', description: 'Reason for status change (for blocked)' },
      { flag: '--force', description: 'Skip state machine validation' },
    ],
  },
  edit: {
    usage: 'edit <id> [flags]',
    description: 'Edit item fields. Uses selected item if no ID given.',
    examples: [
      'edit CMT-3 --priority=critical',
      'edit CMT-3 --assignee=bob --tag=+urgent',
      'edit --title="Updated title"',
    ],
    flags: [
      { flag: '--title=<text>', description: 'New title' },
      { flag: '--priority=<p>', description: 'New priority' },
      { flag: '--assignee=<name>', description: 'New assignee' },
      { flag: '--tag=+<t>', description: 'Add tag' },
      { flag: '--tag=-<t>', description: 'Remove tag' },
      { flag: '--due=<date>', description: 'Set due date' },
      { flag: '--body=<text>', description: 'Set description body' },
    ],
  },
  delete: {
    usage: 'delete <id...>',
    description: 'Delete work items (requires confirmation)',
    examples: ['delete CMT-3', 'delete CMT-3 CMT-4 --force'],
    flags: [
      { flag: '--force', description: 'Skip confirmation prompt' },
    ],
  },
  search: {
    usage: 'search <query> [flags]',
    description: 'Full-text search across all items',
    examples: [
      'search "auth token"',
      'search login --status=active',
      'search rate --limit=5',
    ],
    flags: [
      { flag: '--status=<s>', description: 'Filter results by status' },
      { flag: '--limit=<n>', description: 'Max results (default: 20)' },
    ],
  },
  config: {
    usage: 'config',
    description: 'Show current project configuration',
    examples: ['config'],
  },
  clear: {
    usage: 'clear',
    description: 'Clear command output history',
    examples: ['clear'],
  },
  history: {
    usage: 'history',
    description: 'Show recent command history',
    examples: ['history'],
  },
  help: {
    usage: 'help [command]',
    description: 'Show help for all commands or a specific command',
    examples: ['help', 'help add', 'help list'],
  },
}

export function getHelp(command?: string): HelpEntry | Record<string, HelpEntry> | null {
  if (!command) return helpData
  return helpData[command] ?? null
}

export function getCommandNames(): string[] {
  return Object.keys(helpData)
}

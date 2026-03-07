use clap::{Args, Parser, Subcommand, ValueEnum};
use std::path::PathBuf;

/// cmt -- CatchMyTask: a work management system for humans and agents
#[derive(Parser, Debug)]
#[command(name = "cmt", version, about, long_about = None)]
#[command(propagate_version = true)]
pub struct Cli {
    /// Path to the .cmt/ directory
    #[arg(long, global = true, env = "CMT_DIR")]
    pub dir: Option<PathBuf>,

    /// Output as JSON
    #[arg(long, short = 'j', global = true)]
    pub json: bool,

    /// Suppress non-essential output
    #[arg(long, short = 'q', global = true)]
    pub quiet: bool,

    /// Disable colored output
    #[arg(long, global = true)]
    pub no_color: bool,

    /// Actor identifier for event logging
    #[arg(long, global = true, env = "CMT_ACTOR")]
    pub actor: Option<String>,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Initialize a new .cmt/ directory
    Init(InitArgs),

    /// Create a new work item
    Add(AddArgs),

    /// List work items
    #[command(alias = "ls")]
    List(ListArgs),

    /// Show a work item
    Show(ShowArgs),

    /// Edit a work item
    Edit(EditArgs),

    /// Mark items as done
    Done(DoneArgs),

    /// Change item status
    Status(StatusArgs),

    /// Archive completed items
    Archive(ArchiveArgs),

    /// Full-text search
    Search(SearchArgs),

    /// Rebuild the SQLite index
    Reindex(ReindexArgs),

    /// Validate project integrity
    Check(CheckArgs),

    /// Delete work items
    #[command(alias = "rm")]
    Delete(DeleteArgs),

    /// View and modify configuration
    #[command(subcommand)]
    Config(ConfigCommand),

    /// Show item event history
    Log(LogArgs),

    /// Generate shell completions
    Completions(CompletionsArgs),

    /// Agent-optimized help and discovery (structured JSON output)
    #[command(name = "help-agent")]
    HelpAgent(HelpAgentArgs),

    /// Configure agent platform integrations
    Setup(SetupArgs),

    /// Start the web UI server
    Serve(ServeArgs),

    /// Manage the global project registry
    Projects(ProjectsArgs),

    /// Check system health and configuration
    Doctor(DoctorArgs),

    /// Rename item files to include title slugs
    Slugify(SlugifyArgs),

    /// Add or list comments on a work item
    Comment(CommentArgs),

    /// Manage saved views (named filter sets)
    View(ViewArgs),

    /// Bulk operations on multiple work items
    Bulk(BulkArgs),

    /// Manage outbound webhooks
    #[command(subcommand)]
    Webhook(WebhookCommand),

    /// Start MCP server (stdio transport for AI agents)
    Mcp(McpArgs),
}

#[derive(Args, Debug)]
pub struct McpArgs {
    // Currently no args needed -- stdio is the only transport
}

#[derive(Args, Debug)]
pub struct ServeArgs {
    /// Port to listen on
    #[arg(long, short = 'p', default_value = "3170")]
    pub port: u16,

    /// Host to bind to
    #[arg(long, default_value = "127.0.0.1")]
    pub host: String,

    /// Open browser on start
    #[arg(long)]
    pub open: bool,

    /// Serve frontend from this directory (dev mode)
    #[arg(long)]
    pub dev: Option<std::path::PathBuf>,
}

#[derive(Args, Debug)]
pub struct ProjectsArgs {
    #[command(subcommand)]
    pub command: Option<ProjectsCommand>,
}

#[derive(Subcommand, Debug)]
pub enum ProjectsCommand {
    /// Register a project directory
    Add {
        /// Path to the project (must contain .cmt/)
        path: PathBuf,
    },
    /// Remove a project from the registry
    Remove {
        /// Project name to remove
        name: String,
    },
    /// Show the current project
    Current,
    /// Remove stale entries (paths that no longer exist)
    Prune,
}

#[derive(Args, Debug)]
pub struct SetupArgs {
    /// Install Claude Code skill (~/.claude/skills/managing-work/)
    #[arg(long)]
    pub claude_code: bool,

    /// Install all detected integrations
    #[arg(long)]
    pub all: bool,

    /// List available and installed integrations
    #[arg(long)]
    pub list: bool,

    /// Remove a named integration
    #[arg(long)]
    pub remove: Option<String>,
}

#[derive(Args, Debug)]
pub struct HelpAgentArgs {
    /// Command to get help for (omit for overview)
    pub command: Option<String>,

    /// Include all commands with full detail
    #[arg(long)]
    pub all: bool,

    /// Output project conventions instead of command help
    #[arg(long)]
    pub conventions: bool,

    /// Single-line JSON (default; accepted for explicitness)
    #[arg(long)]
    pub compact: bool,
}

#[derive(Args, Debug)]
pub struct InitArgs {
    /// Default ID prefix
    #[arg(long, short = 'p', default_value = "CMT")]
    pub prefix: String,

    /// Project name
    #[arg(long, short = 'n')]
    pub name: Option<String>,

    /// Force reinitialize if .cmt/ exists
    #[arg(long)]
    pub force: bool,

    /// Initialize global user config (~/.config/cmt/config.yml)
    #[arg(long)]
    pub global: bool,
}

#[derive(Args, Debug)]
pub struct AddArgs {
    /// Work item title
    pub title: String,

    /// Work item type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Priority level
    #[arg(long, short = 'p', value_enum)]
    pub priority: Option<PriorityValue>,

    /// Assignee (repeatable)
    #[arg(long, short = 'a', action = clap::ArgAction::Append)]
    pub assignee: Vec<String>,

    /// Parent work item ID
    #[arg(long)]
    pub parent: Option<String>,

    /// Dependency (repeatable)
    #[arg(long = "depends-on", short = 'd', action = clap::ArgAction::Append)]
    pub depends_on: Vec<String>,

    /// Tag in namespace:value format (repeatable)
    #[arg(long, action = clap::ArgAction::Append)]
    pub tag: Vec<String>,

    /// Due date (YYYY-MM-DD)
    #[arg(long)]
    pub due: Option<String>,

    /// Initial status
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Create as complex item (folder with subdirectories)
    #[arg(long)]
    pub complex: bool,

    /// Open in editor after creation
    #[arg(long, short = 'e')]
    pub edit: bool,

    /// Apply template
    #[arg(long)]
    pub template: Option<String>,

    /// Markdown body content
    #[arg(long, short = 'b')]
    pub body: Option<String>,

    /// Custom slug for the filename (auto-generated from title if omitted)
    #[arg(long)]
    pub slug: Option<String>,
}

#[derive(Args, Debug)]
pub struct ListArgs {
    /// Filter by status (comma-separated, or "all")
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Filter by type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Filter by minimum priority
    #[arg(long, short = 'p', value_enum)]
    pub priority: Option<PriorityValue>,

    /// Filter by assignee
    #[arg(long, short = 'a')]
    pub assignee: Option<String>,

    /// Filter by tag (repeatable, AND logic)
    #[arg(long, action = clap::ArgAction::Append)]
    pub tag: Vec<String>,

    /// Filter children of this parent
    #[arg(long)]
    pub parent: Option<String>,

    /// Only root-level items
    #[arg(long)]
    pub no_parent: bool,

    /// Only overdue items
    #[arg(long)]
    pub overdue: bool,

    /// Show items with due date before this date (YYYY-MM-DD)
    #[arg(long)]
    pub due_before: Option<String>,

    /// Only items with incomplete dependencies
    #[arg(long)]
    pub blocked: bool,

    /// Filter by tag namespace
    #[arg(long)]
    pub tag_ns: Option<String>,

    /// Filter by ID prefix
    #[arg(long)]
    pub id: Option<String>,

    /// Sort field
    #[arg(long, default_value = "priority")]
    pub sort: String,

    /// Reverse sort order
    #[arg(long, short = 'r')]
    pub reverse: bool,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,

    /// Columns to display (comma-separated)
    #[arg(long, default_value = "id,title,status,priority")]
    pub fields: String,

    /// Include archived items
    #[arg(long, short = 'A')]
    pub all: bool,

    /// Maximum items to show
    #[arg(long, short = 'l')]
    pub limit: Option<u32>,

    /// Apply a saved view (load filters from .cmt/views/<name>.yml)
    #[arg(long)]
    pub view: Option<String>,
}

#[derive(Args, Debug)]
pub struct ShowArgs {
    /// Work item ID
    pub id: String,

    /// Suppress body content
    #[arg(long)]
    pub no_body: bool,

    /// Print raw file contents
    #[arg(long)]
    pub raw: bool,

    /// Also list child items
    #[arg(long)]
    pub children: bool,
}

impl ShowArgs {
    pub fn show_body(&self) -> bool {
        !self.no_body
    }
}

#[derive(Args, Debug)]
pub struct EditArgs {
    /// Work item ID
    pub id: String,

    /// Set frontmatter field (repeatable, key=value)
    #[arg(long, action = clap::ArgAction::Append)]
    pub set: Vec<String>,

    /// Add a tag (repeatable)
    #[arg(long = "add-tag", action = clap::ArgAction::Append)]
    pub add_tag: Vec<String>,

    /// Remove a tag (repeatable)
    #[arg(long = "remove-tag", action = clap::ArgAction::Append)]
    pub remove_tag: Vec<String>,

    /// Add a dependency (repeatable)
    #[arg(long = "add-dep", action = clap::ArgAction::Append)]
    pub add_dep: Vec<String>,

    /// Remove a dependency (repeatable)
    #[arg(long = "remove-dep", action = clap::ArgAction::Append)]
    pub remove_dep: Vec<String>,

    /// Convert to complex item
    #[arg(long)]
    pub complex: bool,

    /// Replace body content
    #[arg(long, short = 'b')]
    pub body: Option<String>,

    /// Append to body content
    #[arg(long)]
    pub append: Option<String>,
}

#[derive(Args, Debug)]
pub struct DoneArgs {
    /// Work item IDs
    #[arg(required = true)]
    pub ids: Vec<String>,

    /// Bypass state machine validation
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct StatusArgs {
    /// Work item ID
    pub id: String,

    /// New status
    pub new_status: String,

    /// Reason for status change (required for blocked)
    #[arg(long, short = 'r')]
    pub reason: Option<String>,

    /// Bypass state machine validation
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct ArchiveArgs {
    /// Specific item IDs to archive
    pub ids: Vec<String>,

    /// Archive all items in terminal states
    #[arg(long)]
    pub done: bool,

    /// Show what would be archived
    #[arg(long)]
    pub dry_run: bool,
}

#[derive(Args, Debug)]
pub struct SearchArgs {
    /// Search query (FTS5 syntax)
    pub query: String,

    /// Filter by status
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Filter by type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Maximum results
    #[arg(long, short = 'l', default_value = "20")]
    pub limit: u32,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,

    /// Include archived items
    #[arg(long, short = 'A')]
    pub all: bool,
}

#[derive(Args, Debug)]
pub struct ReindexArgs {
    /// Drop and recreate the database
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct CheckArgs {
    /// Attempt to fix correctable issues
    #[arg(long)]
    pub fix: bool,
}

#[derive(Args, Debug)]
pub struct CompletionsArgs {
    /// Shell type
    pub shell: clap_complete::Shell,
}

#[derive(Args, Debug)]
pub struct DeleteArgs {
    /// Work item IDs
    #[arg(required = true)]
    pub ids: Vec<String>,

    /// Skip confirmation prompt
    #[arg(long, short = 'f')]
    pub force: bool,
}

#[derive(Subcommand, Debug)]
pub enum ConfigCommand {
    /// Show configuration
    Show {
        /// Section to show
        section: Option<String>,
    },
    /// Get a config value
    Get {
        /// Dot-notation key (e.g., project.prefix)
        key: String,
    },
    /// Set a config value
    Set {
        /// Dot-notation key
        key: String,
        /// New value
        value: String,
    },
}

#[derive(Args, Debug)]
pub struct LogArgs {
    /// Work item ID
    pub id: String,

    /// Maximum number of entries
    #[arg(long, short = 'l', default_value = "20")]
    pub limit: u32,

    /// Output format
    #[arg(long, short = 'f', default_value = "table")]
    pub format: OutputFormat,
}

#[derive(Args, Debug)]
pub struct DoctorArgs {
    /// Show per-project details
    #[arg(long, short = 'v')]
    pub verbose: bool,
}

#[derive(Args, Debug)]
pub struct SlugifyArgs {
    /// Dry run — show what would be renamed without changing anything
    #[arg(long, short = 'n')]
    pub dry_run: bool,
}

#[derive(Args, Debug)]
pub struct CommentArgs {
    /// Work item ID
    pub id: String,

    /// Comment message (omit with --list to list comments)
    pub message: Option<String>,

    /// List existing comments
    #[arg(long, short = 'l')]
    pub list: bool,

    /// Reply to a specific comment ID (e.g., c1)
    #[arg(long)]
    pub reply_to: Option<String>,
}

#[derive(Args, Debug)]
pub struct ViewArgs {
    #[command(subcommand)]
    pub command: ViewCommand,
}

#[derive(Subcommand, Debug)]
pub enum ViewCommand {
    /// List saved views
    List,
    /// Save a named view
    Save(SaveViewArgs),
    /// Execute a saved view (show matching items)
    Show {
        /// View name
        name: String,
    },
    /// Delete a saved view
    Delete {
        /// View name
        name: String,
    },
}

#[derive(Args, Debug)]
pub struct SaveViewArgs {
    /// View name
    pub name: String,

    /// Description of this view
    #[arg(long, short = 'd')]
    pub description: Option<String>,

    /// Filter by status
    #[arg(long, short = 's')]
    pub status: Option<String>,

    /// Filter by type
    #[arg(long, short = 't')]
    pub r#type: Option<String>,

    /// Filter by priority
    #[arg(long, short = 'p')]
    pub priority: Option<String>,

    /// Filter by assignee
    #[arg(long, short = 'a')]
    pub assignee: Option<String>,

    /// Filter by tag
    #[arg(long)]
    pub tag: Option<String>,

    /// Sort field
    #[arg(long)]
    pub sort: Option<String>,

    /// Maximum items
    #[arg(long, short = 'l')]
    pub limit: Option<u32>,
}

#[derive(Args, Debug)]
pub struct BulkArgs {
    #[command(subcommand)]
    pub command: BulkCommand,
}

#[derive(Subcommand, Debug)]
pub enum BulkCommand {
    /// Change status of matching items
    Status(BulkStatusArgs),
    /// Mark matching items as done
    Done(BulkDoneArgs),
    /// Edit fields on matching items
    Edit(BulkEditArgs),
    /// Delete matching items
    Delete(BulkDeleteArgs),
}

#[derive(Args, Debug)]
pub struct BulkStatusArgs {
    /// Target status
    pub target: String,

    /// Filter expression (e.g., "status=active,priority=high")
    #[arg(long, short)]
    pub filter: String,

    /// Force transition even if not allowed
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct BulkDoneArgs {
    /// Filter expression (e.g., "status=active,assignee=agent-1")
    #[arg(long, short)]
    pub filter: String,

    /// Force transition even if not allowed
    #[arg(long)]
    pub force: bool,
}

#[derive(Args, Debug)]
pub struct BulkEditArgs {
    /// Filter expression (e.g., "tag=sprint-3")
    #[arg(long, short)]
    pub filter: String,

    /// Set field value (repeatable, key=value)
    #[arg(long, action = clap::ArgAction::Append)]
    pub set: Vec<String>,
}

#[derive(Args, Debug)]
pub struct BulkDeleteArgs {
    /// Filter expression (e.g., "status=cancelled")
    #[arg(long, short)]
    pub filter: String,

    /// Force deletion (required for bulk delete)
    #[arg(long)]
    pub force: bool,
}

#[derive(ValueEnum, Debug, Clone, Copy, PartialEq, Eq)]
pub enum PriorityValue {
    Critical,
    High,
    Medium,
    Low,
    None,
}

impl std::fmt::Display for PriorityValue {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PriorityValue::Critical => write!(f, "critical"),
            PriorityValue::High => write!(f, "high"),
            PriorityValue::Medium => write!(f, "medium"),
            PriorityValue::Low => write!(f, "low"),
            PriorityValue::None => write!(f, "none"),
        }
    }
}

#[derive(ValueEnum, Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputFormat {
    Table,
    Simple,
    Json,
    Csv,
}

#[derive(Subcommand, Debug)]
pub enum WebhookCommand {
    /// List configured webhooks
    List,
    /// Add a new webhook
    Add(WebhookAddArgs),
    /// Remove a webhook by ID
    Remove {
        /// Webhook ID to remove (e.g., wh-001)
        id: String,
    },
    /// Send a test payload to a webhook
    Test {
        /// Webhook ID to test (e.g., wh-001)
        id: String,
    },
}

#[derive(Args, Debug)]
pub struct WebhookAddArgs {
    /// URL to POST webhook payloads to
    #[arg(long)]
    pub url: String,

    /// Comma-separated list of events (e.g., item.created,item.done)
    #[arg(long)]
    pub events: String,

    /// HMAC-SHA256 secret for signing payloads
    #[arg(long)]
    pub secret: Option<String>,
}

use std::path::Path;

use crate::cli::ListArgs;
use cmt_core::config::Config;
use cmt_core::error::Result;
use cmt_core::format;
use cmt_core::model::{Priority, WorkItem};
use cmt_core::storage;
use cmt_core::parser;
use crate::cli::OutputFormat;

pub fn execute(args: &ListArgs, work_dir: &Path, json_global: bool, quiet: bool) -> Result<()> {
    let config = Config::load(work_dir)?;

    // If --view is specified, merge view filters into a new ListArgs
    let merged_args;
    let args = if let Some(ref view_name) = args.view {
        let view = cmt_core::views::load_view(work_dir, view_name)?;
        merged_args = merge_view_filters(args, &view.filters);
        &merged_args
    } else {
        args
    };

    // Try index first, fall back to file scan
    let mut items = load_items(work_dir, &config, args)?;

    // Sort
    sort_items(&mut items, &args.sort, args.reverse);

    // Apply limit
    if let Some(limit) = args.limit {
        items.truncate(limit as usize);
    }

    let total_count = items.len();

    // Determine output format
    let use_json = json_global || matches!(args.format, OutputFormat::Json);
    let fields: Vec<&str> = args.fields.split(',').map(|s| s.trim()).collect();

    if use_json {
        let output = format::format_json(&items)?;
        println!("{}", output);
    } else {
        match args.format {
            OutputFormat::Table => {
                let table = format::format_table(&items, &fields, config.id.pad_width);
                if !table.is_empty() {
                    print!("{}", table);
                }
                if !quiet {
                    eprintln!("\n{} items", total_count);
                }
            }
            OutputFormat::Simple => {
                let output = format::format_simple(&items, config.id.pad_width);
                if !output.is_empty() {
                    println!("{}", output);
                }
            }
            OutputFormat::Csv => {
                let output = format::format_csv(&items, &fields, config.id.pad_width);
                print!("{}", output);
            }
            OutputFormat::Json => unreachable!(),
        }
    }

    Ok(())
}

fn load_items(work_dir: &Path, config: &Config, args: &ListArgs) -> Result<Vec<WorkItem>> {
    // Try to use index
    if let Ok(index) = cmt_core::index::Index::open(work_dir) {
        cmt_core::index::warn_on_err(index.incremental_sync(), "sync");
        return load_from_index(&index, config, args);
    }

    // Fallback: scan files
    load_from_files(work_dir, config, args)
}

fn load_from_index(
    index: &cmt_core::index::Index,
    config: &Config,
    args: &ListArgs,
) -> Result<Vec<WorkItem>> {
    let terminal_states = config.terminal_states();

    // Build SQL query dynamically
    let mut conditions = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    // Default: exclude archived unless --all
    if !args.all {
        conditions.push("archived = 0".to_string());
    }

    // Default: exclude terminal states unless --status is specified or --all
    if let Some(ref status_filter) = args.status {
        if status_filter != "all" {
            let statuses: Vec<&str> = status_filter.split(',').map(|s| s.trim()).collect();
            let placeholders: Vec<String> = statuses.iter().enumerate()
                .map(|(i, _)| format!("?{}", params.len() + i + 1))
                .collect();
            conditions.push(format!("status IN ({})", placeholders.join(",")));
            for s in statuses {
                params.push(Box::new(s.to_string()));
            }
        }
    } else if !args.all {
        // Exclude terminal states (unless --all)
        if !terminal_states.is_empty() {
            let placeholders: Vec<String> = terminal_states.iter().enumerate()
                .map(|(i, _)| format!("?{}", params.len() + i + 1))
                .collect();
            conditions.push(format!("status NOT IN ({})", placeholders.join(",")));
            for s in &terminal_states {
                params.push(Box::new(s.clone()));
            }
        }
    }

    if let Some(ref t) = args.r#type {
        conditions.push(format!("type = ?{}", params.len() + 1));
        params.push(Box::new(t.clone()));
    }

    if let Some(ref a) = args.assignee {
        if a == "none" {
            conditions.push("assignee IS NULL".to_string());
        } else if a == "any" {
            conditions.push("assignee IS NOT NULL".to_string());
        } else {
            conditions.push(format!(
                "(assignee = ?{n} OR EXISTS (SELECT 1 FROM json_each(assignee) WHERE json_each.value = ?{n} AND assignee LIKE '[%'))",
                n = params.len() + 1
            ));
            params.push(Box::new(a.clone()));
        }
    }

    if let Some(ref p) = args.parent {
        conditions.push(format!("parent = ?{}", params.len() + 1));
        params.push(Box::new(p.clone()));
    }

    if args.no_parent {
        conditions.push("parent IS NULL".to_string());
    }

    if let Some(ref id_prefix) = args.id {
        conditions.push(format!("id LIKE ?{}", params.len() + 1));
        params.push(Box::new(format!("{}%", id_prefix)));
    }

    if let Some(ref due_before) = args.due_before {
        conditions.push(format!("due IS NOT NULL AND due < ?{}", params.len() + 1));
        params.push(Box::new(due_before.clone()));
    }

    if args.overdue {
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        conditions.push(format!("due IS NOT NULL AND due < ?{}", params.len() + 1));
        params.push(Box::new(today));
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!("SELECT id, title, status, type, priority, assignee, parent, due, created_at, started_at, completed_at, updated_at, blocked_reason, file_path FROM items {}", where_clause);

    let mut stmt = index.conn.prepare(&sql)?;
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();

    let rows = stmt.query_map(param_refs.as_slice(), |row| {
        Ok(IndexRow {
            id: row.get(0)?,
            title: row.get(1)?,
            status: row.get(2)?,
            item_type: row.get(3)?,
            priority: row.get(4)?,
            assignee: row.get(5)?,
            parent: row.get(6)?,
            due: row.get(7)?,
            created_at: row.get(8)?,
            started_at: row.get(9)?,
            completed_at: row.get(10)?,
            updated_at: row.get(11)?,
            blocked_reason: row.get(12)?,
            _file_path: row.get(13)?,
        })
    })?;

    let mut items = Vec::new();
    for row_result in rows {
        let row = row_result?;
        if let Ok(id) = cmt_core::model::WorkItemId::parse(&row.id) {
            let assignee = row.assignee.map(|a| {
                if a.starts_with('[') {
                    if let Ok(v) = serde_json::from_str::<Vec<String>>(&a) {
                        cmt_core::model::Assignee::Multiple(v)
                    } else {
                        cmt_core::model::Assignee::Single(a)
                    }
                } else {
                    cmt_core::model::Assignee::Single(a)
                }
            });

            // Load tags from index
            let tags: Vec<String> = index.conn.prepare(
                "SELECT tag FROM item_tags WHERE item_id = ?1"
            )?.query_map([&row.id], |r| r.get(0))?
                .filter_map(|r| r.ok())
                .collect();

            let depends_on: Vec<String> = index.conn.prepare(
                "SELECT depends_on FROM item_deps WHERE item_id = ?1"
            )?.query_map([&row.id], |r| r.get(0))?
                .filter_map(|r| r.ok())
                .collect();

            let item = WorkItem {
                id,
                title: row.title,
                status: row.status,
                created_at: row.created_at,
                r#type: row.item_type,
                priority: row.priority,
                assignee,
                parent: row.parent,
                depends_on,
                tags,
                due: row.due,
                started_at: row.started_at,
                completed_at: row.completed_at,
                updated_at: row.updated_at,
                blocked_reason: row.blocked_reason,
                related: Vec::new(),
                extra: std::collections::BTreeMap::new(),
            };
            items.push(item);
        }
    }

    // Apply only filters NOT already handled by SQL
    apply_post_sql_filters(&mut items, args);

    Ok(items)
}

fn load_from_files(work_dir: &Path, config: &Config, args: &ListArgs) -> Result<Vec<WorkItem>> {
    let files = storage::scan_item_files(work_dir)?;
    let terminal_states = config.terminal_states();
    let mut items = Vec::new();

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let (item, _) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        let file_str = file.to_string_lossy();
        let is_archived = file_str.contains("/archive/");

        // Skip archived unless --all
        if is_archived && !args.all {
            continue;
        }

        // Default filter: skip terminal states (unless --all)
        if !args.all && args.status.is_none() && terminal_states.contains(&item.status) {
            continue;
        }

        // Status filter
        if let Some(ref status_filter) = args.status {
            if status_filter != "all" {
                let statuses: Vec<&str> = status_filter.split(',').map(|s| s.trim()).collect();
                if !statuses.contains(&item.status.as_str()) {
                    continue;
                }
            }
        }

        items.push(item);
    }

    // Apply all in-memory filters (same as index path)
    apply_in_memory_filters(&mut items, args);

    Ok(items)
}

/// Apply filters NOT handled by SQL — used after index queries.
/// These are: blocked, priority, tags, tag namespace.
fn apply_post_sql_filters(items: &mut Vec<WorkItem>, args: &ListArgs) {
    // Blocked filter (has incomplete dependencies)
    if args.blocked {
        items.retain(|item| !item.depends_on.is_empty());
    }

    // Priority minimum filter
    if let Some(ref min_priority) = args.priority {
        let min_rank = crate::cli::PriorityValue::to_rank(min_priority);
        items.retain(|item| {
            let rank = item.priority.as_deref()
                .and_then(Priority::parse)
                .map(|p| p.rank())
                .unwrap_or(4);
            rank <= min_rank
        });
    }

    // Tag filters (AND logic)
    apply_tag_filters(items, args);
}

/// Apply ALL in-memory filters — used by file-scan path where no SQL filtering occurs.
fn apply_in_memory_filters(items: &mut Vec<WorkItem>, args: &ListArgs) {
    // Type filter
    if let Some(ref t) = args.r#type {
        items.retain(|item| item.r#type.as_deref() == Some(t.as_str()));
    }

    // Assignee filter
    if let Some(ref a) = args.assignee {
        if a == "none" {
            items.retain(|item| item.assignee.is_none());
        } else if a == "any" {
            items.retain(|item| item.assignee.is_some());
        } else {
            items.retain(|item| {
                item.assignee.as_ref().is_some_and(|assignee| {
                    assignee.as_vec().contains(&a.as_str())
                })
            });
        }
    }

    // Parent filter
    if let Some(ref p) = args.parent {
        items.retain(|item| item.parent.as_deref() == Some(p.as_str()));
    }

    // No-parent filter
    if args.no_parent {
        items.retain(|item| item.parent.is_none());
    }

    // ID prefix filter
    if let Some(ref id_prefix) = args.id {
        items.retain(|item| item.id.raw.starts_with(id_prefix.as_str()));
    }

    // Due-before filter
    if let Some(ref due_before) = args.due_before {
        items.retain(|item| {
            item.due.as_ref().is_some_and(|d| d.as_str() < due_before.as_str())
        });
    }

    // Overdue filter
    if args.overdue {
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        items.retain(|item| {
            item.due.as_ref().is_some_and(|d| d.as_str() < today.as_str())
        });
    }

    // Blocked filter + priority + tags (shared with post-SQL path)
    apply_post_sql_filters(items, args);
}

/// Apply tag and tag namespace filters.
fn apply_tag_filters(items: &mut Vec<WorkItem>, args: &ListArgs) {
    // Tag filters (AND logic)
    for tag_filter in &args.tag {
        if tag_filter.contains('*') {
            let pattern = glob_to_regex(tag_filter);
            let re = regex::Regex::new(&pattern).ok();
            items.retain(|item| {
                item.tags.iter().any(|t| {
                    re.as_ref().is_some_and(|r| r.is_match(t))
                })
            });
        } else {
            let tag = tag_filter.clone();
            items.retain(|item| item.tags.contains(&tag));
        }
    }

    // Tag namespace filter
    if let Some(ref ns) = args.tag_ns {
        let prefix = format!("{}:", ns);
        items.retain(|item| item.tags.iter().any(|t| t.starts_with(&prefix)));
    }
}

fn sort_items(items: &mut [WorkItem], sort_field: &str, reverse: bool) {
    items.sort_by(|a, b| {
        let cmp = match sort_field {
            "priority" => {
                let pa = a.priority_enum();
                let pb = b.priority_enum();
                pa.cmp(&pb)
            }
            "created_at" => a.created_at.cmp(&b.created_at),
            "due" => a.due.cmp(&b.due),
            "status" => a.status.cmp(&b.status),
            "title" => a.title.cmp(&b.title),
            "updated_at" => a.updated_at.cmp(&b.updated_at),
            "id" => {
                a.id.prefix.cmp(&b.id.prefix)
                    .then(a.id.number.cmp(&b.id.number))
            }
            _ => a.created_at.cmp(&b.created_at),
        };

        if sort_field == "priority" {
            // Priority: default ascending (critical first)
            if reverse { cmp.reverse() } else { cmp }
        } else {
            // Everything else: default ascending
            if reverse { cmp.reverse() } else { cmp }
        }
    });
}

fn glob_to_regex(pattern: &str) -> String {
    let mut regex = String::from("^");
    for ch in pattern.chars() {
        match ch {
            '*' => regex.push_str(".*"),
            '?' => regex.push('.'),
            '.' | '+' | '(' | ')' | '[' | ']' | '{' | '}' | '\\' | '^' | '$' | '|' => {
                regex.push('\\');
                regex.push(ch);
            }
            _ => regex.push(ch),
        }
    }
    regex.push('$');
    regex
}

struct IndexRow {
    id: String,
    title: String,
    status: String,
    item_type: Option<String>,
    priority: Option<String>,
    assignee: Option<String>,
    parent: Option<String>,
    due: Option<String>,
    created_at: String,
    started_at: Option<String>,
    completed_at: Option<String>,
    updated_at: Option<String>,
    blocked_reason: Option<String>,
    _file_path: String,
}

// Extension trait for PriorityValue to get rank
/// Merge view filters into ListArgs. Explicit CLI flags take precedence over view filters.
fn merge_view_filters(args: &ListArgs, filters: &cmt_core::views::ViewFilters) -> ListArgs {
    ListArgs {
        status: args.status.clone().or_else(|| filters.status.clone()),
        r#type: args.r#type.clone().or_else(|| filters.r#type.clone()),
        priority: args.priority.or_else(|| {
            filters.priority.as_deref().and_then(|p| match p {
                "critical" => Some(crate::cli::PriorityValue::Critical),
                "high" => Some(crate::cli::PriorityValue::High),
                "medium" => Some(crate::cli::PriorityValue::Medium),
                "low" => Some(crate::cli::PriorityValue::Low),
                "none" => Some(crate::cli::PriorityValue::None),
                _ => None,
            })
        }),
        assignee: args.assignee.clone().or_else(|| filters.assignee.clone()),
        tag: if args.tag.is_empty() {
            filters.tag.as_ref().map(|t| vec![t.clone()]).unwrap_or_default()
        } else {
            args.tag.clone()
        },
        sort: if args.sort != "priority" {
            args.sort.clone()
        } else {
            filters.sort.clone().unwrap_or_else(|| "priority".to_string())
        },
        limit: args.limit.or(filters.limit),
        // Pass through all other flags as-is
        parent: args.parent.clone(),
        no_parent: args.no_parent,
        overdue: args.overdue,
        due_before: args.due_before.clone(),
        blocked: args.blocked,
        tag_ns: args.tag_ns.clone(),
        id: args.id.clone(),
        reverse: args.reverse,
        format: args.format,
        fields: args.fields.clone(),
        all: args.all,
        view: None, // Prevent recursion
    }
}

impl crate::cli::PriorityValue {
    fn to_rank(pv: &crate::cli::PriorityValue) -> u8 {
        match pv {
            crate::cli::PriorityValue::Critical => 0,
            crate::cli::PriorityValue::High => 1,
            crate::cli::PriorityValue::Medium => 2,
            crate::cli::PriorityValue::Low => 3,
            crate::cli::PriorityValue::None => 4,
        }
    }
}

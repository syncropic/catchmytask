use std::collections::BTreeMap;
use std::path::Path;

use cmt_core::comments::{self, Comment};
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::index::Index;
use cmt_core::model::{Assignee, WorkItem, WorkItemId};
use cmt_core::storage;

/// Return the JSON Schema definitions for all MCP tools.
pub fn tool_definitions() -> Vec<serde_json::Value> {
    vec![
        serde_json::json!({
            "name": "cmt_list",
            "description": "List work items with optional filters. Returns an array of items with id, title, status, priority, and assignee.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "status": { "type": "string", "description": "Filter by status (e.g., 'active', 'blocked', 'all')" },
                    "type": { "type": "string", "description": "Filter by work item type" },
                    "priority": { "type": "string", "description": "Filter by minimum priority (critical, high, medium, low, none)" },
                    "assignee": { "type": "string", "description": "Filter by assignee ('none' for unassigned, 'any' for assigned)" },
                    "limit": { "type": "integer", "description": "Maximum number of items to return (default 50)", "default": 50 }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_add",
            "description": "Create a new work item. Returns the created item with its auto-generated ID.",
            "inputSchema": {
                "type": "object",
                "required": ["title"],
                "properties": {
                    "title": { "type": "string", "description": "Work item title (required)" },
                    "type": { "type": "string", "description": "Work item type (e.g., 'task', 'bug')" },
                    "priority": { "type": "string", "description": "Priority level (critical, high, medium, low, none)" },
                    "assignee": { "type": "string", "description": "Assignee username" },
                    "tags": { "type": "array", "items": { "type": "string" }, "description": "Tags in namespace:value format" },
                    "body": { "type": "string", "description": "Markdown body content" },
                    "template": { "type": "string", "description": "Template name to apply" }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_show",
            "description": "Show full details of a work item including its body content.",
            "inputSchema": {
                "type": "object",
                "required": ["id"],
                "properties": {
                    "id": { "type": "string", "description": "Work item ID (e.g., 'CMT-1')" }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_edit",
            "description": "Edit fields on an existing work item.",
            "inputSchema": {
                "type": "object",
                "required": ["id"],
                "properties": {
                    "id": { "type": "string", "description": "Work item ID (e.g., 'CMT-1')" },
                    "title": { "type": "string", "description": "New title" },
                    "priority": { "type": "string", "description": "New priority (critical, high, medium, low, none)" },
                    "assignee": { "type": "string", "description": "New assignee (empty string to unset)" },
                    "tags": { "type": "array", "items": { "type": "string" }, "description": "Replace tags with this list" },
                    "body": { "type": "string", "description": "Replace body content" }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_status",
            "description": "Change the status of a work item. Validates the transition against the state machine.",
            "inputSchema": {
                "type": "object",
                "required": ["id", "status"],
                "properties": {
                    "id": { "type": "string", "description": "Work item ID (e.g., 'CMT-1')" },
                    "status": { "type": "string", "description": "New status (e.g., 'active', 'blocked', 'done')" },
                    "force": { "type": "boolean", "description": "Bypass state machine validation", "default": false }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_done",
            "description": "Mark one or more work items as done.",
            "inputSchema": {
                "type": "object",
                "required": ["ids"],
                "properties": {
                    "ids": { "type": "array", "items": { "type": "string" }, "description": "Array of work item IDs to mark as done" }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_search",
            "description": "Full-text search across work items using FTS5 syntax.",
            "inputSchema": {
                "type": "object",
                "required": ["query"],
                "properties": {
                    "query": { "type": "string", "description": "Search query (FTS5 syntax)" },
                    "limit": { "type": "integer", "description": "Maximum results (default 20)", "default": 20 }
                }
            }
        }),
        serde_json::json!({
            "name": "cmt_comment",
            "description": "Add a comment to a work item.",
            "inputSchema": {
                "type": "object",
                "required": ["id", "message"],
                "properties": {
                    "id": { "type": "string", "description": "Work item ID (e.g., 'CMT-1')" },
                    "message": { "type": "string", "description": "Comment message text" },
                    "reply_to": { "type": "string", "description": "Comment ID to reply to (e.g., 'c1')" }
                }
            }
        }),
    ]
}

/// Dispatch a tool call by name.
pub fn call_tool(
    name: &str,
    args: &serde_json::Value,
    work_dir: &Path,
) -> Result<serde_json::Value> {
    match name {
        "cmt_list" => tool_list(args, work_dir),
        "cmt_add" => tool_add(args, work_dir),
        "cmt_show" => tool_show(args, work_dir),
        "cmt_edit" => tool_edit(args, work_dir),
        "cmt_status" => tool_status(args, work_dir),
        "cmt_done" => tool_done(args, work_dir),
        "cmt_search" => tool_search(args, work_dir),
        "cmt_comment" => tool_comment(args, work_dir),
        _ => Err(WorkError::General(format!("Unknown tool: {}", name))),
    }
}

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------

fn tool_list(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let config = Config::load(work_dir)?;
    let terminal_states = config.terminal_states();

    let status_filter = args.get("status").and_then(|v| v.as_str());
    let type_filter = args.get("type").and_then(|v| v.as_str());
    let priority_filter = args.get("priority").and_then(|v| v.as_str());
    let assignee_filter = args.get("assignee").and_then(|v| v.as_str());
    let limit = args
        .get("limit")
        .and_then(|v| v.as_u64())
        .unwrap_or(50) as usize;

    // Load items from files (works whether index exists or not)
    let files = storage::scan_item_files(work_dir)?;
    let mut items: Vec<WorkItem> = Vec::new();

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let (item, _body) = match cmt_core::parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        let file_str = file.to_string_lossy();
        let is_archived = file_str.contains("/archive/");
        if is_archived {
            continue;
        }

        // Default: skip terminal states unless status filter is given
        if status_filter.is_none() && terminal_states.contains(&item.status) {
            continue;
        }

        // Status filter
        if let Some(sf) = status_filter {
            if sf != "all" && item.status != sf {
                continue;
            }
        }

        // Type filter
        if let Some(tf) = type_filter {
            if item.r#type.as_deref() != Some(tf) {
                continue;
            }
        }

        // Assignee filter
        if let Some(af) = assignee_filter {
            match af {
                "none" => {
                    if item.assignee.is_some() {
                        continue;
                    }
                }
                "any" => {
                    if item.assignee.is_none() {
                        continue;
                    }
                }
                _ => {
                    let matches = item
                        .assignee
                        .as_ref()
                        .is_some_and(|a| a.as_vec().contains(&af));
                    if !matches {
                        continue;
                    }
                }
            }
        }

        items.push(item);
    }

    // Priority filter
    if let Some(pf) = priority_filter {
        if let Some(min_priority) = cmt_core::model::Priority::parse(pf) {
            let min_rank = min_priority.rank();
            items.retain(|item| {
                let rank = item.priority_enum().rank();
                rank <= min_rank
            });
        }
    }

    // Sort by priority
    items.sort_by_key(|a| a.priority_enum());

    // Apply limit
    items.truncate(limit);

    // Format output
    let result: Vec<serde_json::Value> = items
        .iter()
        .map(|item| {
            let mut obj = serde_json::json!({
                "id": item.id.raw,
                "title": item.title,
                "status": item.status,
            });
            if let (Some(map), Some(ref p)) = (obj.as_object_mut(), &item.priority) {
                map.insert("priority".to_string(), serde_json::Value::String(p.clone()));
            }
            if let (Some(map), Some(ref a)) = (obj.as_object_mut(), &item.assignee) {
                map.insert(
                    "assignee".to_string(),
                    serde_json::Value::String(a.display()),
                );
            }
            obj
        })
        .collect();

    Ok(serde_json::json!(result))
}

fn tool_add(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let config = Config::load(work_dir)?;

    let title = args
        .get("title")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("title is required".to_string()))?;

    if title.is_empty() {
        return Err(WorkError::ValidationError(
            "Title is required and must not be empty".to_string(),
        ));
    }

    let item_type = args.get("type").and_then(|v| v.as_str());
    let item_type_or_default = item_type.or(Some(config.defaults.r#type.as_str()));
    let prefix = config.resolve_prefix(item_type_or_default);

    let status = config.defaults.status.clone();

    // Get next ID
    let next_number = match Index::open(work_dir) {
        Ok(index) => index.next_id(prefix)?,
        Err(_) => storage::next_id_from_files(work_dir, prefix)?,
    };

    let id_str = format!("{}-{}", prefix, next_number);
    let id = WorkItemId::parse(&id_str)?;

    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);

    let priority = args
        .get("priority")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .or_else(|| Some(config.defaults.priority.clone()));

    let assignee = args
        .get("assignee")
        .and_then(|v| v.as_str())
        .map(|s| Assignee::Single(s.to_string()))
        .or_else(|| {
            config
                .defaults
                .assignee
                .as_ref()
                .map(|a| Assignee::Single(a.clone()))
        });

    let tags: Vec<String> = args
        .get("tags")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    let body = args
        .get("body")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let item = WorkItem {
        id,
        title: title.to_string(),
        status,
        created_at: now.clone(),
        r#type: item_type_or_default.map(|s| s.to_string()),
        priority,
        assignee,
        parent: None,
        depends_on: Vec::new(),
        tags,
        due: None,
        started_at: None,
        completed_at: None,
        updated_at: Some(now),
        blocked_reason: None,
        related: Vec::new(),
        extra: BTreeMap::new(),
    };

    item.validate()?;

    // Generate slug for filename
    let item_slug = cmt_core::slug::slugify(title, 50);
    let slugged_name = format!("{}-{}", id_str, item_slug);

    let file_path = work_dir
        .join("items")
        .join(format!("{}.md", slugged_name));

    storage::write_item(&file_path, &item, &body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let rel_path = file_path.to_string_lossy().to_string();
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &rel_path, false), "upsert");
        cmt_core::index::warn_on_err(
            index.record_event(
                &id_str,
                None,
                "created",
                Some(&serde_json::json!({"title": item.title, "source": "mcp"})),
            ),
            "event",
        );
    }

    // Git auto-commit
    let file_str = file_path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("add {} - {}", id_str, item.title),
    )?;

    Ok(cmt_core::format::item_to_json(&item, None))
}

fn tool_show(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let id = args
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("id is required".to_string()))?;

    let (item, body, _path) = storage::read_item(work_dir, id)?;
    Ok(cmt_core::format::item_to_json(&item, Some(&body)))
}

fn tool_edit(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let id = args
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("id is required".to_string()))?;

    let config = Config::load(work_dir)?;
    let (mut item, mut body, path) = storage::read_item(work_dir, id)?;

    // Apply edits
    if let Some(title) = args.get("title").and_then(|v| v.as_str()) {
        item.title = title.to_string();
    }
    if let Some(priority) = args.get("priority").and_then(|v| v.as_str()) {
        if priority.is_empty() {
            item.priority = None;
        } else {
            item.priority = Some(priority.to_string());
        }
    }
    if let Some(assignee) = args.get("assignee").and_then(|v| v.as_str()) {
        if assignee.is_empty() {
            item.assignee = None;
        } else {
            item.assignee = Some(Assignee::Single(assignee.to_string()));
        }
    }
    if let Some(tags) = args.get("tags").and_then(|v| v.as_array()) {
        item.tags = tags
            .iter()
            .filter_map(|v| v.as_str().map(|s| s.to_string()))
            .collect();
    }
    if let Some(new_body) = args.get("body").and_then(|v| v.as_str()) {
        body = new_body.to_string();
    }

    // Set updated_at
    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    item.updated_at = Some(now);

    storage::write_item(&path, &item, &body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, archived), "upsert");
        cmt_core::index::warn_on_err(
            index.record_event(&item.id.raw, None, "edit", Some(&serde_json::json!({"source": "mcp"}))),
            "event",
        );
    }

    // Git auto-commit
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("edit {} - {}", item.id.raw, item.title),
    )?;

    Ok(cmt_core::format::item_to_json(&item, Some(&body)))
}

fn tool_status(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let id = args
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("id is required".to_string()))?;
    let new_status = args
        .get("status")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("status is required".to_string()))?;
    let force = args
        .get("force")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let config = Config::load(work_dir)?;
    let (mut item, body, path) = storage::read_item(work_dir, id)?;

    let old_status = item.status.clone();

    let result = cmt_core::state_machine::validate_transition(
        &config,
        item.r#type.as_deref(),
        &item.status,
        new_status,
        force,
    )?;

    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    item.status = new_status.to_string();

    if result.set_updated_at {
        item.updated_at = Some(now.clone());
    }
    if result.set_started_at && item.started_at.is_none() {
        item.started_at = Some(now.clone());
    }
    if result.set_completed_at {
        item.completed_at = Some(now.clone());
    }
    if result.clear_completed_at {
        item.completed_at = None;
    }
    if result.clear_blocked_reason {
        item.blocked_reason = None;
    }

    storage::write_item(&path, &item, &body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, archived), "upsert");
        cmt_core::index::warn_on_err(
            index.record_event(
                &item.id.raw,
                None,
                "transition",
                Some(&serde_json::json!({"from": old_status, "to": new_status, "source": "mcp"})),
            ),
            "event",
        );
    }

    // Git auto-commit
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("transition {} {} -> {}", item.id.raw, old_status, new_status),
    )?;

    Ok(serde_json::json!({
        "id": item.id.raw,
        "from": old_status,
        "to": new_status,
    }))
}

fn tool_done(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let ids: Vec<String> = args
        .get("ids")
        .and_then(|v| v.as_array())
        .ok_or_else(|| WorkError::ValidationError("ids is required".to_string()))?
        .iter()
        .filter_map(|v| v.as_str().map(|s| s.to_string()))
        .collect();

    if ids.is_empty() {
        return Err(WorkError::ValidationError(
            "ids must not be empty".to_string(),
        ));
    }

    let config = Config::load(work_dir)?;
    let mut results = Vec::new();
    let mut files_changed = Vec::new();

    for id in &ids {
        match process_done_item(&config, work_dir, id) {
            Ok((old_status, path_str)) => {
                results.push(serde_json::json!({
                    "id": id,
                    "from": old_status,
                    "to": "done",
                    "success": true,
                }));
                files_changed.push(path_str);
            }
            Err(e) => {
                results.push(serde_json::json!({
                    "id": id,
                    "success": false,
                    "error": e.to_string(),
                }));
            }
        }
    }

    // Git auto-commit for all changes
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        let ids_str = ids.join(", ");
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("done {} - mark items complete", ids_str),
        )?;
    }

    Ok(serde_json::json!(results))
}

fn process_done_item(
    config: &Config,
    work_dir: &Path,
    id: &str,
) -> std::result::Result<(String, String), WorkError> {
    let (mut item, body, path) = storage::read_item(work_dir, id)?;
    let old_status = item.status.clone();

    let result = cmt_core::state_machine::validate_transition(
        config,
        item.r#type.as_deref(),
        &item.status,
        "done",
        false,
    )?;

    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    item.status = "done".to_string();
    item.updated_at = Some(now.clone());
    if result.set_completed_at {
        item.completed_at = Some(now.clone());
    }
    if result.set_started_at && item.started_at.is_none() {
        item.started_at = Some(now);
    }
    if result.clear_blocked_reason {
        item.blocked_reason = None;
    }

    storage::write_item(&path, &item, &body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, archived), "upsert");
        cmt_core::index::warn_on_err(
            index.record_event(
                &item.id.raw,
                None,
                "transition",
                Some(&serde_json::json!({"from": old_status, "to": "done", "source": "mcp"})),
            ),
            "event",
        );
    }

    let path_str = path.to_string_lossy().to_string();
    Ok((old_status, path_str))
}

fn tool_search(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let query = args
        .get("query")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("query is required".to_string()))?;
    let limit = args
        .get("limit")
        .and_then(|v| v.as_u64())
        .unwrap_or(20) as u32;

    let index = Index::open(work_dir)?;
    cmt_core::index::warn_on_err(index.incremental_sync(), "sync");

    let sql = "SELECT i.id, i.title, i.status, i.priority, rank,
               snippet(items_fts, -1, '**', '**', '...', 32) as snippet
               FROM items_fts
               JOIN items i ON i.id = items_fts.id
               WHERE items_fts MATCH ?1 AND i.archived = 0
               ORDER BY rank
               LIMIT ?2";

    let mut stmt = index.conn.prepare(sql).map_err(|e| {
        let msg = e.to_string();
        if msg.contains("fts5") || msg.contains("syntax") {
            WorkError::General(format!(
                "Search query '{}' contains special characters that FTS5 cannot parse.",
                query
            ))
        } else {
            WorkError::from(e)
        }
    })?;

    let results: Vec<serde_json::Value> = stmt
        .query_map(rusqlite::params![query, limit], |row| {
            let id: String = row.get(0)?;
            let title: String = row.get(1)?;
            let status: String = row.get(2)?;
            let priority: Option<String> = row.get(3)?;
            let score: f64 = row.get(4)?;
            let snippet: String = row.get(5)?;
            Ok(serde_json::json!({
                "id": id,
                "title": title,
                "status": status,
                "priority": priority,
                "score": score,
                "snippet": snippet,
            }))
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(serde_json::json!(results))
}

fn tool_comment(args: &serde_json::Value, work_dir: &Path) -> Result<serde_json::Value> {
    let id = args
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("id is required".to_string()))?;
    let message = args
        .get("message")
        .and_then(|v| v.as_str())
        .ok_or_else(|| WorkError::ValidationError("message is required".to_string()))?;
    let reply_to = args.get("reply_to").and_then(|v| v.as_str());

    let (item, body, path) = storage::read_item(work_dir, id)?;

    // Validate reply_to
    if let Some(reply_id) = reply_to {
        let existing = comments::parse_comments(&body);
        if !existing.iter().any(|c| c.id == reply_id) {
            return Err(WorkError::ValidationError(format!(
                "Comment '{}' not found on {}",
                reply_id, item.id.raw
            )));
        }
    }

    let comment_id = comments::next_comment_id(&body);
    let date = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);

    let comment = Comment {
        id: comment_id.clone(),
        author: "mcp-agent".to_string(),
        date,
        body: message.to_string(),
        reply_to: reply_to.map(|s| s.to_string()),
    };

    let new_body = comments::append_comment(&body, &comment);
    storage::write_item(&path, &item, &new_body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(
            index.upsert_item(&item, &new_body, &file_str, archived),
            "upsert",
        );
        cmt_core::index::warn_on_err(
            index.record_event(
                &item.id.raw,
                Some("mcp-agent"),
                "comment",
                Some(&serde_json::json!({"comment_id": comment_id})),
            ),
            "event",
        );
    }

    // Git auto-commit
    let config = Config::load(work_dir)?;
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("comment on {} by mcp-agent", item.id.raw),
    )?;

    Ok(serde_json::json!({
        "item_id": item.id.raw,
        "comment": comment,
    }))
}

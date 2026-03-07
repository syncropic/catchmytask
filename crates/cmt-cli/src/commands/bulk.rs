use std::collections::HashMap;
use std::path::Path;

use crate::cli::{BulkCommand, BulkDeleteArgs, BulkDoneArgs, BulkEditArgs, BulkStatusArgs};
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::model::WorkItem;
use cmt_core::parser;
use cmt_core::state_machine;
use cmt_core::storage;

/// Parse a filter expression like "status=active,priority=high" into key-value pairs.
fn parse_filter(filter: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for pair in filter.split(',') {
        let pair = pair.trim();
        if pair.is_empty() {
            continue;
        }
        if let Some((key, value)) = pair.split_once('=') {
            map.insert(key.trim().to_string(), value.trim().to_string());
        }
    }
    map
}

/// Load and filter items from the work directory based on a filter expression.
fn load_filtered_items(
    work_dir: &Path,
    filter: &str,
) -> Result<Vec<(WorkItem, String, std::path::PathBuf)>> {
    let filters = parse_filter(filter);
    let files = storage::scan_item_files(work_dir)?;
    let mut items = Vec::new();

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let (item, body) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        if matches_filter(&item, &filters) {
            items.push((item, body, file.clone()));
        }
    }

    Ok(items)
}

/// Check if a work item matches the given filter criteria.
fn matches_filter(item: &WorkItem, filters: &HashMap<String, String>) -> bool {
    for (key, value) in filters {
        match key.as_str() {
            "status" => {
                if item.status != *value {
                    return false;
                }
            }
            "type" => {
                if item.r#type.as_deref() != Some(value.as_str()) {
                    return false;
                }
            }
            "priority" => {
                if item.priority.as_deref() != Some(value.as_str()) {
                    return false;
                }
            }
            "assignee" => {
                let matches = item
                    .assignee
                    .as_ref()
                    .is_some_and(|a| a.as_vec().contains(&value.as_str()));
                if !matches {
                    return false;
                }
            }
            "tag" => {
                if !item.tags.contains(value) {
                    return false;
                }
            }
            _ => {
                // Unknown filter key — ignore
            }
        }
    }
    true
}

pub fn execute(
    command: &BulkCommand,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    match command {
        BulkCommand::Status(args) => execute_status(args, work_dir, json, quiet, actor),
        BulkCommand::Done(args) => execute_done(args, work_dir, json, quiet, actor),
        BulkCommand::Edit(args) => execute_edit(args, work_dir, json, quiet, actor),
        BulkCommand::Delete(args) => execute_delete(args, work_dir, json, quiet, actor),
    }
}

fn execute_status(
    args: &BulkStatusArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let items = load_filtered_items(work_dir, &args.filter)?;

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;
    let mut files_changed = Vec::new();

    for (mut item, body, path) in items {
        let id = item.id.raw.clone();
        let old_status = item.status.clone();

        match state_machine::validate_transition(
            &config,
            item.r#type.as_deref(),
            &item.status,
            &args.target,
            args.force,
        ) {
            Ok(result) => {
                let now =
                    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
                item.status = args.target.clone();
                item.updated_at = Some(now.clone());
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

                if let Err(e) = storage::write_item(&path, &item, &body) {
                    failed += 1;
                    results.push(serde_json::json!({
                        "id": id,
                        "success": false,
                        "error": e.to_string(),
                    }));
                    if !quiet && !json {
                        eprintln!("error: {}: {}", id, e);
                    }
                    continue;
                }

                // Update index
                if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                    let file_str = path.to_string_lossy().to_string();
                    let archived = file_str.contains("/archive/");
                    cmt_core::index::warn_on_err(
                        index.upsert_item(&item, &body, &file_str, archived),
                        "upsert",
                    );
                    cmt_core::index::warn_on_err(
                        index.record_event(
                            &id,
                            actor,
                            "transition",
                            Some(&serde_json::json!({"from": old_status, "to": args.target})),
                        ),
                        "event",
                    );
                }

                succeeded += 1;
                files_changed.push(path.to_string_lossy().to_string());
                results.push(serde_json::json!({
                    "id": id,
                    "from": old_status,
                    "to": args.target,
                    "success": true,
                }));
                if !quiet && !json {
                    eprintln!("{}: {} -> {}", id, old_status, args.target);
                }
            }
            Err(e) => {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id,
                    "success": false,
                    "error": e.to_string(),
                }));
                if !quiet && !json {
                    eprintln!("error: {}: {}", id, e);
                }
            }
        }
    }

    // Git auto-commit
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("bulk status -> {} ({} items)", args.target, succeeded),
        )?;
    }

    let processed = succeeded + failed;
    if json {
        let output = serde_json::json!({
            "processed": processed,
            "succeeded": succeeded,
            "failed": failed,
            "results": results,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("Bulk status: {} processed, {} succeeded, {} failed", processed, succeeded, failed);
    }

    Ok(())
}

fn execute_done(
    args: &BulkDoneArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let items = load_filtered_items(work_dir, &args.filter)?;

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;
    let mut files_changed = Vec::new();

    for (mut item, body, path) in items {
        let id = item.id.raw.clone();
        let old_status = item.status.clone();

        match state_machine::validate_transition(
            &config,
            item.r#type.as_deref(),
            &item.status,
            "done",
            args.force,
        ) {
            Ok(result) => {
                let now =
                    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
                item.status = "done".to_string();
                item.updated_at = Some(now.clone());
                if result.set_completed_at {
                    item.completed_at = Some(now.clone());
                }
                if result.set_started_at && item.started_at.is_none() {
                    item.started_at = Some(now.clone());
                }
                if result.clear_blocked_reason {
                    item.blocked_reason = None;
                }

                if let Err(e) = storage::write_item(&path, &item, &body) {
                    failed += 1;
                    results.push(serde_json::json!({
                        "id": id,
                        "success": false,
                        "error": e.to_string(),
                    }));
                    if !quiet && !json {
                        eprintln!("error: {}: {}", id, e);
                    }
                    continue;
                }

                // Update index
                if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                    let file_str = path.to_string_lossy().to_string();
                    let archived = file_str.contains("/archive/");
                    cmt_core::index::warn_on_err(
                        index.upsert_item(&item, &body, &file_str, archived),
                        "upsert",
                    );
                    cmt_core::index::warn_on_err(
                        index.record_event(
                            &id,
                            actor,
                            "transition",
                            Some(&serde_json::json!({"from": old_status, "to": "done"})),
                        ),
                        "event",
                    );
                }

                succeeded += 1;
                files_changed.push(path.to_string_lossy().to_string());
                results.push(serde_json::json!({
                    "id": id,
                    "from": old_status,
                    "to": "done",
                    "success": true,
                }));
                if !quiet && !json {
                    eprintln!("{}: {} -> done", id, old_status);
                }
            }
            Err(e) => {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id,
                    "success": false,
                    "error": e.to_string(),
                }));
                if !quiet && !json {
                    eprintln!("error: {}: {}", id, e);
                }
            }
        }
    }

    // Git auto-commit
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("bulk done ({} items)", succeeded),
        )?;
    }

    let processed = succeeded + failed;
    if json {
        let output = serde_json::json!({
            "processed": processed,
            "succeeded": succeeded,
            "failed": failed,
            "results": results,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("Bulk done: {} processed, {} succeeded, {} failed", processed, succeeded, failed);
    }

    Ok(())
}

fn execute_edit(
    args: &BulkEditArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let items = load_filtered_items(work_dir, &args.filter)?;

    // Parse --set values into key-value pairs
    let mut set_fields: Vec<(String, String)> = Vec::new();
    for kv in &args.set {
        let (key, value) = kv.split_once('=').ok_or_else(|| {
            WorkError::ValidationError(format!(
                "Invalid --set format '{}'. Expected key=value",
                kv
            ))
        })?;
        set_fields.push((key.to_string(), value.to_string()));
    }

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;
    let mut files_changed = Vec::new();

    for (mut item, body, path) in items {
        let id = item.id.raw.clone();

        // Apply field changes
        let mut item_failed = false;
        for (key, value) in &set_fields {
            if let Err(e) = apply_set_field(&mut item, key, value) {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id,
                    "success": false,
                    "error": e.to_string(),
                }));
                if !quiet && !json {
                    eprintln!("error: {}: {}", id, e);
                }
                item_failed = true;
                break;
            }
        }
        if item_failed {
            continue;
        }

        let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
        item.updated_at = Some(now);

        if let Err(e) = storage::write_item(&path, &item, &body) {
            failed += 1;
            results.push(serde_json::json!({
                "id": id,
                "success": false,
                "error": e.to_string(),
            }));
            if !quiet && !json {
                eprintln!("error: {}: {}", id, e);
            }
            continue;
        }

        // Update index
        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
            let file_str = path.to_string_lossy().to_string();
            let archived = file_str.contains("/archive/");
            cmt_core::index::warn_on_err(
                index.upsert_item(&item, &body, &file_str, archived),
                "upsert",
            );
            cmt_core::index::warn_on_err(
                index.record_event(&id, actor, "edit", Some(&serde_json::json!({"action": "bulk_edit"}))),
                "event",
            );
        }

        succeeded += 1;
        files_changed.push(path.to_string_lossy().to_string());
        results.push(serde_json::json!({
            "id": id,
            "success": true,
        }));
        if !quiet && !json {
            eprintln!("Updated {}", id);
        }
    }

    // Git auto-commit
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("bulk edit ({} items)", succeeded),
        )?;
    }

    let processed = succeeded + failed;
    if json {
        let output = serde_json::json!({
            "processed": processed,
            "succeeded": succeeded,
            "failed": failed,
            "results": results,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("Bulk edit: {} processed, {} succeeded, {} failed", processed, succeeded, failed);
    }

    Ok(())
}

fn execute_delete(
    args: &BulkDeleteArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let items = load_filtered_items(work_dir, &args.filter)?;

    if !args.force {
        return Err(WorkError::ValidationError(
            "Bulk delete requires --force flag".to_string(),
        ));
    }

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;
    let mut files_changed = Vec::new();

    for (item, _body, path) in items {
        let id = item.id.raw.clone();

        // Delete file or directory
        let delete_result = if path.file_name().is_some_and(|n| n == "item.md") {
            // Complex item: remove directory
            if let Some(dir) = path.parent() {
                std::fs::remove_dir_all(dir)
            } else {
                std::fs::remove_file(&path)
            }
        } else {
            std::fs::remove_file(&path)
        };

        match delete_result {
            Ok(()) => {
                // Remove from index
                if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                    cmt_core::index::warn_on_err(index.remove_item(&id), "remove");
                    cmt_core::index::warn_on_err(
                        index.record_event(&id, actor, "delete", None),
                        "event",
                    );
                }

                succeeded += 1;
                files_changed.push(path.to_string_lossy().to_string());
                results.push(serde_json::json!({
                    "id": id,
                    "deleted": true,
                    "success": true,
                }));
                if !quiet && !json {
                    eprintln!("Deleted {}", id);
                }
            }
            Err(e) => {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id,
                    "deleted": false,
                    "success": false,
                    "error": e.to_string(),
                }));
                if !quiet && !json {
                    eprintln!("error: {}: {}", id, e);
                }
            }
        }
    }

    // Git auto-commit
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("bulk delete ({} items)", succeeded),
        )?;
    }

    let processed = succeeded + failed;
    if json {
        let output = serde_json::json!({
            "processed": processed,
            "succeeded": succeeded,
            "failed": failed,
            "results": results,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("Bulk delete: {} processed, {} succeeded, {} failed", processed, succeeded, failed);
    }

    Ok(())
}

/// Apply a key=value field to a work item (same logic as edit.rs).
fn apply_set_field(
    item: &mut WorkItem,
    key: &str,
    value: &str,
) -> std::result::Result<(), WorkError> {
    match key {
        "title" => item.title = value.to_string(),
        "status" => item.status = value.to_string(),
        "priority" => {
            if value.is_empty() {
                item.priority = None;
            } else {
                item.priority = Some(value.to_string());
            }
        }
        "type" => {
            if value.is_empty() {
                item.r#type = None;
            } else {
                item.r#type = Some(value.to_string());
            }
        }
        "assignee" => {
            if value.is_empty() {
                item.assignee = None;
            } else {
                item.assignee = Some(cmt_core::model::Assignee::Single(value.to_string()));
            }
        }
        "parent" => {
            if value.is_empty() {
                item.parent = None;
            } else {
                item.parent = Some(value.to_string());
            }
        }
        "due" => {
            if value.is_empty() {
                item.due = None;
            } else {
                item.due = Some(value.to_string());
            }
        }
        "blocked_reason" => {
            if value.is_empty() {
                item.blocked_reason = None;
            } else {
                item.blocked_reason = Some(value.to_string());
            }
        }
        _ => {
            if value.is_empty() {
                item.extra.remove(key);
            } else {
                item.extra.insert(
                    key.to_string(),
                    serde_yml::Value::String(value.to_string()),
                );
            }
        }
    }
    Ok(())
}

/// Expand a range syntax like "CMT-3..CMT-9" into individual IDs.
/// Returns None if the input is not a range.
pub fn expand_range(input: &str) -> Option<Vec<String>> {
    let parts: Vec<&str> = input.split("..").collect();
    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].trim();
    let end = parts[1].trim();

    // Parse both IDs
    let start_id = cmt_core::model::WorkItemId::parse(start).ok()?;
    let end_id = cmt_core::model::WorkItemId::parse(end).ok()?;

    // Prefixes must match
    if start_id.prefix != end_id.prefix {
        return None;
    }

    if start_id.number > end_id.number {
        return None;
    }

    let mut ids = Vec::new();
    for n in start_id.number..=end_id.number {
        ids.push(format!("{}-{}", start_id.prefix, n));
    }
    Some(ids)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_filter_basic() {
        let filters = parse_filter("status=active,priority=high");
        assert_eq!(filters.get("status").unwrap(), "active");
        assert_eq!(filters.get("priority").unwrap(), "high");
    }

    #[test]
    fn test_parse_filter_empty() {
        let filters = parse_filter("");
        assert!(filters.is_empty());
    }

    #[test]
    fn test_parse_filter_single() {
        let filters = parse_filter("assignee=agent-1");
        assert_eq!(filters.len(), 1);
        assert_eq!(filters.get("assignee").unwrap(), "agent-1");
    }

    #[test]
    fn test_parse_filter_with_spaces() {
        let filters = parse_filter("status = active , priority = high");
        assert_eq!(filters.get("status").unwrap(), "active");
        assert_eq!(filters.get("priority").unwrap(), "high");
    }

    #[test]
    fn test_expand_range_basic() {
        let ids = expand_range("CMT-3..CMT-5").unwrap();
        assert_eq!(ids, vec!["CMT-3", "CMT-4", "CMT-5"]);
    }

    #[test]
    fn test_expand_range_single() {
        let ids = expand_range("CMT-3..CMT-3").unwrap();
        assert_eq!(ids, vec!["CMT-3"]);
    }

    #[test]
    fn test_expand_range_not_a_range() {
        assert!(expand_range("CMT-3").is_none());
    }

    #[test]
    fn test_expand_range_mismatched_prefix() {
        assert!(expand_range("CMT-3..TASK-5").is_none());
    }

    #[test]
    fn test_expand_range_reversed() {
        assert!(expand_range("CMT-5..CMT-3").is_none());
    }
}

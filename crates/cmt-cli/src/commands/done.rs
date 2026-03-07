use std::path::Path;

use crate::cli::DoneArgs;
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::state_machine;
use cmt_core::storage;

pub fn execute(
    args: &DoneArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let mut results = Vec::new();
    let mut first_error: Option<WorkError> = None;
    let mut files_changed = Vec::new();

    // Expand range syntax (e.g., CMT-3..CMT-9)
    let expanded_ids = expand_ids(&args.ids);

    for id in &expanded_ids {
        match process_done(&config, work_dir, id, args.force, actor) {
            Ok((old_status, path)) => {
                results.push(serde_json::json!({
                    "id": id,
                    "from": old_status,
                    "to": "done",
                    "success": true,
                }));
                files_changed.push(path);
                if !quiet && !json {
                    eprintln!("{}: {} -> done", id, old_status);
                }
            }
            Err(e) => {
                results.push(serde_json::json!({
                    "id": id,
                    "from": "",
                    "to": "done",
                    "success": false,
                    "error": e.to_string(),
                }));
                if !quiet && !json {
                    eprintln!("error: {}: {}", id, e);
                }
                if first_error.is_none() {
                    first_error = Some(e);
                }
            }
        }
    }

    // Git auto-commit for all changes
    if !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        let ids_str = expanded_ids.join(", ");
        cmt_core::git::auto_commit(&config, work_dir, &file_refs, &format!("done {} - mark items complete", ids_str))?;
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&results)?);
    }

    if let Some(err) = first_error {
        Err(err)
    } else {
        Ok(())
    }
}

fn process_done(
    config: &Config,
    work_dir: &Path,
    id: &str,
    force: bool,
    actor: Option<&str>,
) -> std::result::Result<(String, String), WorkError> {
    let (mut item, body, path) = storage::read_item(work_dir, id)?;
    let old_status = item.status.clone();

    // Validate transition to done
    let result = state_machine::validate_transition(
        config,
        item.r#type.as_deref(),
        &item.status,
        "done",
        force,
    )?;

    // Apply transition
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
    if let Ok(index) = cmt_core::index::Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, archived), "upsert");
        cmt_core::index::warn_on_err(index.record_event(
            &item.id.raw,
            actor,
            "transition",
            Some(&serde_json::json!({"from": old_status, "to": "done"})),
        ), "event");
    }

    let path_str = path.to_string_lossy().to_string();
    Ok((old_status, path_str))
}

/// Expand IDs, resolving any range syntax like "CMT-3..CMT-9".
fn expand_ids(ids: &[String]) -> Vec<String> {
    let mut expanded = Vec::new();
    for id in ids {
        if let Some(range_ids) = super::bulk::expand_range(id) {
            expanded.extend(range_ids);
        } else {
            expanded.push(id.clone());
        }
    }
    expanded
}

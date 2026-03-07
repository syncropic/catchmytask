use std::path::Path;

use crate::cli::StatusArgs;
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::state_machine;
use cmt_core::storage;

pub fn execute(
    args: &StatusArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let (mut item, body, path) = storage::read_item(work_dir, &args.id)?;

    let old_status = item.status.clone();

    // Validate transition
    let result = state_machine::validate_transition(
        &config,
        item.r#type.as_deref(),
        &item.status,
        &args.new_status,
        args.force,
    )?;

    if args.force && !quiet {
        eprintln!(
            "warning: Forced transition from '{}' to '{}' (bypassed state machine validation)",
            old_status, args.new_status
        );
    }

    // Check blocked reason requirement
    if result.require_blocked_reason && args.reason.is_none() {
        return Err(WorkError::ValidationError(
            "--reason is required when transitioning to 'blocked'".to_string(),
        ));
    }

    // Apply transition
    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    item.status = args.new_status.clone();

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
    if result.require_blocked_reason {
        item.blocked_reason = args.reason.clone();
    }
    if result.clear_blocked_reason {
        item.blocked_reason = None;
    }

    // Write file
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
            Some(&serde_json::json!({
                "from": old_status,
                "to": args.new_status,
            })),
        ), "event");
    }

    // Git auto-commit
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("transition {} {} -> {}", item.id.raw, old_status, args.new_status),
    )?;

    // Fire webhooks
    crate::webhooks::fire_webhooks(
        work_dir,
        "item.status_changed",
        &item.id.raw,
        &item.title,
        actor,
        Some(serde_json::json!({"from": old_status, "to": args.new_status})),
    );

    // Output
    if json {
        let mut timestamps_set = Vec::new();
        if result.set_started_at && item.started_at.is_some() {
            timestamps_set.push("started_at");
        }
        if result.set_completed_at {
            timestamps_set.push("completed_at");
        }
        timestamps_set.push("updated_at");

        let output = serde_json::json!({
            "id": item.id.raw,
            "from": old_status,
            "to": args.new_status,
            "machine": result.machine_name,
            "timestamps_set": timestamps_set,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("{}: {} -> {}", item.id.raw, old_status, args.new_status);
    }

    Ok(())
}

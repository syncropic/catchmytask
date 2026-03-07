use std::path::Path;

use crate::cli::EditArgs;
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::model::Assignee;
use cmt_core::storage;

pub fn execute(
    args: &EditArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let (mut item, mut body, path) = storage::read_item(work_dir, &args.id)?;

    let is_programmatic = !args.set.is_empty()
        || !args.add_tag.is_empty()
        || !args.remove_tag.is_empty()
        || !args.add_dep.is_empty()
        || !args.remove_dep.is_empty()
        || args.body.is_some()
        || args.append.is_some()
        || args.complex;

    if !is_programmatic {
        // Interactive mode: open in editor
        let editor = std::env::var("VISUAL")
            .or_else(|_| std::env::var("EDITOR"))
            .unwrap_or_else(|_| "vi".to_string());

        let status = std::process::Command::new(&editor)
            .arg(&path)
            .status()?;

        if !status.success() {
            return Err(WorkError::General("Editor exited with non-zero status".to_string()));
        }

        // Re-read and validate
        let content = std::fs::read_to_string(&path)?;
        let (new_item, new_body) = cmt_core::parser::parse_file(&content)?;

        // If status changed, validate transition
        if new_item.status != item.status {
            cmt_core::state_machine::validate_transition(
                &config,
                new_item.r#type.as_deref(),
                &item.status,
                &new_item.status,
                false,
            )?;
        }

        // Update index
        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
            let file_str = path.to_string_lossy().to_string();
            let archived = file_str.contains("/archive/");
            cmt_core::index::warn_on_err(index.upsert_item(&new_item, &new_body, &file_str, archived), "upsert");
            cmt_core::index::warn_on_err(index.record_event(&new_item.id.raw, actor, "edit", None), "event");
        }

        if !quiet {
            eprintln!("Updated {}", item.id.raw);
        }
        return Ok(());
    }

    // Programmatic mode
    let old_status = item.status.clone();

    // Apply --set modifications
    for kv in &args.set {
        let (key, value) = kv.split_once('=').ok_or_else(|| {
            WorkError::ValidationError(format!(
                "Invalid --set format '{}'. Expected key=value", kv
            ))
        })?;
        apply_set_field(&mut item, key, value)?;
    }

    // Apply tag modifications
    for tag in &args.add_tag {
        if !item.tags.contains(tag) {
            item.tags.push(tag.clone());
        }
    }
    for tag in &args.remove_tag {
        item.tags.retain(|t| t != tag);
    }

    // Apply dependency modifications
    for dep in &args.add_dep {
        if !item.depends_on.contains(dep) {
            item.depends_on.push(dep.clone());
        }
    }
    for dep in &args.remove_dep {
        item.depends_on.retain(|d| d != dep);
    }

    // Apply body modifications
    if let Some(ref new_body) = args.body {
        body = new_body.clone();
    }
    if let Some(ref append_text) = args.append {
        if !body.is_empty() && !body.ends_with('\n') {
            body.push('\n');
        }
        body.push_str(append_text);
    }

    // If status changed via --set, validate transition
    if item.status != old_status {
        let result = cmt_core::state_machine::validate_transition(
            &config,
            item.r#type.as_deref(),
            &old_status,
            &item.status,
            false,
        )?;

        // Apply timestamp side effects
        let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
        if result.set_started_at && item.started_at.is_none() {
            item.started_at = Some(now.clone());
        }
        if result.set_completed_at {
            item.completed_at = Some(now.clone());
        }
        if result.clear_completed_at {
            item.completed_at = None;
        }
        if result.require_blocked_reason && item.blocked_reason.is_none() {
            return Err(WorkError::ValidationError(
                "blocked_reason is required when status is 'blocked'. Use --set blocked_reason=<reason>".to_string(),
            ));
        }
        if result.clear_blocked_reason {
            item.blocked_reason = None;
        }
    }

    // Set updated_at
    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
    item.updated_at = Some(now);

    // Handle --complex conversion
    if args.complex {
        let simple_path = work_dir.join("items").join(format!("{}.md", item.id.raw));
        if simple_path.exists() {
            let dir = work_dir.join("items").join(&item.id.raw);
            std::fs::create_dir_all(&dir)?;
            let new_path = dir.join("item.md");
            storage::write_item(&new_path, &item, &body)?;
            std::fs::remove_file(&simple_path)?;
            std::fs::create_dir_all(dir.join("evidence"))?;
            std::fs::create_dir_all(dir.join("queries"))?;
            std::fs::create_dir_all(dir.join("handover"))?;

            if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                let file_str = new_path.to_string_lossy().to_string();
                cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, false), "upsert");
                cmt_core::index::warn_on_err(index.record_event(&item.id.raw, actor, "edit", Some(&serde_json::json!({"action": "convert_to_complex"}))), "event");
            }

            if !quiet {
                eprintln!("Converted {} to complex item at .cmt/items/{}/", item.id.raw, item.id.raw);
            }
            return Ok(());
        }
    }

    // Write file
    storage::write_item(&path, &item, &body)?;

    // Update index
    if let Ok(index) = cmt_core::index::Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, archived), "upsert");
        cmt_core::index::warn_on_err(index.record_event(&item.id.raw, actor, "edit", None), "event");
    }

    // Git auto-commit
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(&config, work_dir, &[&file_str], &format!("edit {} - {}", item.id.raw, item.title))?;

    if json {
        let json_val = cmt_core::format::item_to_json(&item, Some(&body));
        println!("{}", serde_json::to_string_pretty(&json_val)?);
    } else if !quiet {
        eprintln!("Updated {}", item.id.raw);
    }

    Ok(())
}

fn apply_set_field(item: &mut cmt_core::model::WorkItem, key: &str, value: &str) -> Result<()> {
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
                item.assignee = Some(Assignee::Single(value.to_string()));
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
            // Store as extra field
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

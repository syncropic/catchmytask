use std::path::Path;

use crate::cli::CheckArgs;
use crate::config::Config;
use crate::error::Result;
use crate::storage;
use crate::parser;

pub fn execute(args: &CheckArgs, work_dir: &Path, json: bool) -> Result<()> {
    let config = Config::load(work_dir)?;

    let mut errors: Vec<CheckIssue> = Vec::new();
    let mut warnings: Vec<CheckIssue> = Vec::new();
    let mut items_checked = 0u32;

    // Scan all item files
    let files = storage::scan_item_files(work_dir)?;
    let mut all_ids: Vec<String> = Vec::new();

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(e) => {
                errors.push(CheckIssue {
                    id: None,
                    file: file.to_string_lossy().to_string(),
                    rule: "IO".to_string(),
                    message: format!("Cannot read file: {}", e),
                });
                continue;
            }
        };

        let (item, _body) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(e) => {
                errors.push(CheckIssue {
                    id: None,
                    file: file.to_string_lossy().to_string(),
                    rule: "V-07".to_string(),
                    message: format!("Parse error: {}", e),
                });
                continue;
            }
        };

        items_checked += 1;
        let id = item.id.raw.clone();
        all_ids.push(id.clone());

        // V-02: title non-empty
        if item.title.is_empty() {
            errors.push(CheckIssue {
                id: Some(id.clone()),
                file: file.to_string_lossy().to_string(),
                rule: "V-02".to_string(),
                message: "Title is empty".to_string(),
            });
        }

        // V-03: title length warning
        if item.title.len() > 200 {
            warnings.push(CheckIssue {
                id: Some(id.clone()),
                file: file.to_string_lossy().to_string(),
                rule: "V-03".to_string(),
                message: format!("Title exceeds 200 characters ({} chars)", item.title.len()),
            });
        }

        // V-06: ID matches filename
        let expected_id = file.file_stem()
            .and_then(|s| s.to_str())
            .map(|s| if s == "item" {
                file.parent()
                    .and_then(|p| p.file_name())
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
            } else {
                s
            })
            .unwrap_or("");
        if !expected_id.is_empty() && expected_id != id {
            warnings.push(CheckIssue {
                id: Some(id.clone()),
                file: file.to_string_lossy().to_string(),
                rule: "V-06".to_string(),
                message: format!("ID '{}' does not match filename '{}'", id, expected_id),
            });
        }

        // V-08: tag format warning
        for tag in &item.tags {
            if !tag.contains(':') {
                warnings.push(CheckIssue {
                    id: Some(id.clone()),
                    file: file.to_string_lossy().to_string(),
                    rule: "V-08".to_string(),
                    message: format!("tag '{}' does not follow namespace:value convention", tag),
                });
            }
        }

        // V-10: status valid in state machine
        let machine = config.resolve_state_machine(item.r#type.as_deref());
        if !machine.states.contains_key(&item.status) {
            warnings.push(CheckIssue {
                id: Some(id.clone()),
                file: file.to_string_lossy().to_string(),
                rule: "V-10".to_string(),
                message: format!("status '{}' is not in the active state machine", item.status),
            });
        }

        // V-11: blocked_reason required when blocked
        if item.status == "blocked" && item.blocked_reason.is_none() {
            errors.push(CheckIssue {
                id: Some(id.clone()),
                file: file.to_string_lossy().to_string(),
                rule: "V-11".to_string(),
                message: "blocked_reason is required when status is 'blocked'".to_string(),
            });
        }

        // V-12: completed_at consistency
        if item.completed_at.is_some() {
            let terminal_states = config.terminal_states();
            if !terminal_states.contains(&item.status) {
                warnings.push(CheckIssue {
                    id: Some(id.clone()),
                    file: file.to_string_lossy().to_string(),
                    rule: "V-12".to_string(),
                    message: format!("completed_at is set but status '{}' is not terminal", item.status),
                });
            }
        }

        // V-13: depends_on format
        for dep in &item.depends_on {
            if crate::model::WorkItemId::parse(dep).is_err() {
                warnings.push(CheckIssue {
                    id: Some(id.clone()),
                    file: file.to_string_lossy().to_string(),
                    rule: "V-13".to_string(),
                    message: format!("depends_on entry '{}' is not a valid ID format", dep),
                });
            }
        }

        // Check for orphaned dependencies
        for dep in &item.depends_on {
            if !all_ids.contains(dep) {
                // Check again after all files processed (we accumulate this warning)
                warnings.push(CheckIssue {
                    id: Some(id.clone()),
                    file: file.to_string_lossy().to_string(),
                    rule: "V-15".to_string(),
                    message: format!("depends_on references {} which does not exist", dep),
                });
            }
        }
    }

    // Check for duplicate IDs
    let mut id_counts: std::collections::HashMap<String, u32> = std::collections::HashMap::new();
    for id in &all_ids {
        *id_counts.entry(id.clone()).or_insert(0) += 1;
    }
    for (id, count) in &id_counts {
        if *count > 1 {
            errors.push(CheckIssue {
                id: Some(id.clone()),
                file: String::new(),
                rule: "UNIQUE".to_string(),
                message: format!("ID '{}' appears {} times", id, count),
            });
        }
    }

    // Auto-fix if requested
    if args.fix {
        let terminal_states = config.terminal_states();

        for file in &files {
            let content = match std::fs::read_to_string(file) {
                Ok(c) => c,
                Err(_) => continue,
            };
            let (mut item, body) = match parser::parse_file(&content) {
                Ok(r) => r,
                Err(_) => continue,
            };

            let mut changed = false;

            // Fix: rename file if ID doesn't match filename
            let expected_id = file.file_stem()
                .and_then(|s| s.to_str())
                .map(|s| if s == "item" {
                    file.parent()
                        .and_then(|p| p.file_name())
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                } else {
                    s
                })
                .unwrap_or("");
            if !expected_id.is_empty() && expected_id != item.id.raw {
                // Rename the file to match the ID
                if file.file_name().is_some_and(|f| f == "item.md") {
                    if let (Some(parent), Some(grandparent)) = (file.parent(), file.parent().and_then(|p| p.parent())) {
                        let new_dir = grandparent.join(&item.id.raw);
                        if !new_dir.exists() {
                            if let Err(e) = std::fs::rename(parent, &new_dir) {
                                if !json { eprintln!("warning: could not rename directory: {}", e); }
                            } else if !json {
                                eprintln!("fix: renamed directory to match ID {}", item.id.raw);
                            }
                        }
                    }
                } else if let Some(parent) = file.parent() {
                    let new_path = parent.join(format!("{}.md", item.id.raw));
                    if !new_path.exists() {
                        if let Err(e) = std::fs::rename(file, &new_path) {
                            if !json { eprintln!("warning: could not rename file: {}", e); }
                        } else if !json {
                            eprintln!("fix: renamed {} -> {}", file.display(), new_path.display());
                        }
                    }
                }
                continue;
            }

            // Fix: clear completed_at on non-terminal items
            if item.completed_at.is_some() && !terminal_states.contains(&item.status) {
                item.completed_at = None;
                changed = true;
                if !json { eprintln!("fix: {}: cleared stale completed_at", item.id.raw); }
            }

            // Fix: set completed_at on terminal items that lack it
            if item.completed_at.is_none() && terminal_states.contains(&item.status) {
                item.completed_at = Some(
                    item.updated_at.clone().unwrap_or_else(|| item.created_at.clone())
                );
                changed = true;
                if !json { eprintln!("fix: {}: set missing completed_at", item.id.raw); }
            }

            if changed {
                if let Err(e) = storage::write_item(file, &item, &body) {
                    if !json { eprintln!("warning: could not write fix for {}: {}", item.id.raw, e); }
                }
            }
        }

        // Reindex
        if let Ok(index) = crate::index::Index::open(work_dir) {
            match index.full_reindex() {
                Ok(_) => {
                    if !json {
                        eprintln!("Rebuilt index");
                    }
                }
                Err(e) => {
                    if !json {
                        eprintln!("warning: failed to rebuild index: {}", e);
                    }
                }
            }
        }
    }

    // Output
    if json {
        let output = serde_json::json!({
            "items_checked": items_checked,
            "errors": errors.iter().map(|e| serde_json::json!({
                "id": e.id,
                "file": e.file,
                "rule": e.rule,
                "message": e.message,
            })).collect::<Vec<_>>(),
            "warnings": warnings.iter().map(|w| serde_json::json!({
                "id": w.id,
                "file": w.file,
                "rule": w.rule,
                "message": w.message,
            })).collect::<Vec<_>>(),
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else {
        for e in &errors {
            let prefix = e.id.as_deref().unwrap_or("?");
            eprintln!("error: {}: {}", prefix, e.message);
        }
        for w in &warnings {
            let prefix = w.id.as_deref().unwrap_or("?");
            eprintln!("warning: {}: {}", prefix, w.message);
        }
        let status = if errors.is_empty() { "ok" } else { "FAIL" };
        eprintln!("{}: {} items checked, {} errors, {} warnings",
            status, items_checked, errors.len(), warnings.len());
    }

    if !errors.is_empty() {
        Err(crate::error::WorkError::ValidationError(format!(
            "{} validation errors found", errors.len()
        )))
    } else {
        Ok(())
    }
}

struct CheckIssue {
    id: Option<String>,
    file: String,
    rule: String,
    message: String,
}

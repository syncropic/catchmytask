use std::path::Path;

use crate::cli::DeleteArgs;
use cmt_core::config::Config;
use cmt_core::error::Result;
use cmt_core::storage;

pub fn execute(
    args: &DeleteArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let mut results = Vec::new();
    let mut files_changed = Vec::new();

    for id in &args.ids {
        match storage::resolve_item_path(work_dir, id) {
            Ok(path) => {
                // Confirmation prompt unless --force
                if !args.force {
                    if !is_terminal::is_terminal(std::io::stdin()) {
                        // Non-interactive: refuse without --force
                        if !quiet && !json {
                            eprintln!("error: {} requires --force for non-interactive deletion", id);
                        }
                        results.push(serde_json::json!({
                            "id": id,
                            "deleted": false,
                            "error": "Requires --force for non-interactive deletion",
                        }));
                        continue;
                    }
                    let (item, _, _) = storage::read_item(work_dir, id)?;
                    eprint!("Delete {} \"{}\"? [y/N] ", id, item.title);
                    let mut input = String::new();
                    std::io::stdin().read_line(&mut input)?;
                    if !input.trim().eq_ignore_ascii_case("y") {
                        results.push(serde_json::json!({
                            "id": id,
                            "deleted": false,
                            "error": "Cancelled by user",
                        }));
                        continue;
                    }
                }

                // Delete file or directory
                if path.file_name().is_some_and(|n| n == "item.md") {
                    // Complex item: remove directory
                    if let Some(dir) = path.parent() {
                        std::fs::remove_dir_all(dir)?;
                    }
                } else {
                    std::fs::remove_file(&path)?;
                }

                // Remove from index (use canonical raw ID for consistency)
                let canonical_id = cmt_core::model::WorkItemId::parse(id)
                    .map(|parsed| format!("{}-{}", parsed.prefix, parsed.number))
                    .unwrap_or_else(|_| id.to_string());
                if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                    cmt_core::index::warn_on_err(index.remove_item(&canonical_id), "remove");
                    cmt_core::index::warn_on_err(index.record_event(&canonical_id, actor, "delete", None), "event");
                }

                if !quiet && !json {
                    eprintln!("Deleted {}", id);
                }
                files_changed.push(path.to_string_lossy().to_string());
                results.push(serde_json::json!({
                    "id": id,
                    "deleted": true,
                }));
            }
            Err(_) => {
                if !quiet && !json {
                    eprintln!("error: {} not found", id);
                }
                results.push(serde_json::json!({
                    "id": id,
                    "deleted": false,
                    "error": "Not found",
                }));
            }
        }
    }

    // Fire webhooks for each successfully deleted item
    for result in &results {
        if result["deleted"].as_bool() == Some(true) {
            if let Some(id) = result["id"].as_str() {
                crate::webhooks::fire_webhooks(
                    work_dir,
                    "item.deleted",
                    id,
                    id,
                    actor,
                    None,
                );
            }
        }
    }

    // Git auto-commit
    if !files_changed.is_empty() {
        let ids_str = args.ids.join(", ");
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(&config, work_dir, &file_refs, &format!("delete {}", ids_str))?;
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&results)?);
    }

    Ok(())
}

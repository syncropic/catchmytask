use std::path::Path;

use crate::cli::ArchiveArgs;
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::storage;

pub fn execute(
    args: &ArchiveArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;
    let terminal_states = config.terminal_states();

    if args.ids.is_empty() && !args.done {
        return Err(WorkError::General(
            "Specify item IDs to archive or use --done to archive all terminal items".to_string(),
        ));
    }

    let mut to_archive: Vec<(String, String, std::path::PathBuf)> = Vec::new();

    if args.done {
        // Find all terminal items in items/
        let files = storage::scan_item_files(work_dir)?;
        for file in &files {
            let file_str = file.to_string_lossy();
            if file_str.contains("/archive/") {
                continue;
            }
            let content = match std::fs::read_to_string(file) {
                Ok(c) => c,
                Err(_) => continue,
            };
            let (item, _) = match cmt_core::parser::parse_file(&content) {
                Ok(r) => r,
                Err(_) => continue,
            };
            if terminal_states.contains(&item.status) {
                to_archive.push((item.id.raw.clone(), item.status.clone(), file.clone()));
            }
        }
    } else {
        for id in &args.ids {
            let (item, _, path) = storage::read_item(work_dir, id)?;
            if !terminal_states.contains(&item.status) {
                if !quiet {
                    eprintln!("error: {} is in state '{}', not a terminal state. Cannot archive.", id, item.status);
                }
                continue;
            }
            // Only archive items in items/, not already archived
            if path.to_string_lossy().contains("/archive/") {
                if !quiet {
                    eprintln!("{} is already archived", id);
                }
                continue;
            }
            to_archive.push((item.id.raw.clone(), item.status.clone(), path));
        }
    }

    if to_archive.is_empty() {
        if !quiet {
            eprintln!("No items to archive.");
        }
        if json {
            println!("[]");
        }
        return Ok(());
    }

    let mut results = Vec::new();
    let mut files_changed = Vec::new();

    for (id, status, from_path) in &to_archive {
        // Compute destination path
        let to_path = if from_path.file_name().is_some_and(|n| n == "item.md") {
            // Complex item: move directory
            let from_dir = from_path.parent().ok_or_else(|| {
                WorkError::General(format!("Cannot determine parent directory for '{}'", from_path.display()))
            })?;
            let dir_name = from_dir.file_name().ok_or_else(|| {
                WorkError::General(format!("Cannot determine directory name for '{}'", from_dir.display()))
            })?;
            let to_dir = work_dir.join("archive").join(dir_name);
            if args.dry_run {
                if !quiet {
                    eprintln!("[dry-run] Would archive {} ({})", id, status);
                }
                results.push(serde_json::json!({
                    "id": id,
                    "status": status,
                    "from": from_path.to_string_lossy(),
                    "to": to_dir.join("item.md").to_string_lossy().to_string(),
                }));
                continue;
            }
            if to_dir.exists() {
                return Err(WorkError::General(format!(
                    "Archive destination already exists for '{}': {}", id, to_dir.display()
                )));
            }
            move_path(from_dir, &to_dir)?;
            to_dir.join("item.md")
        } else {
            // Simple item
            let filename = from_path.file_name().ok_or_else(|| {
                WorkError::General(format!("Cannot determine filename for '{}'", from_path.display()))
            })?;
            let to_path = work_dir.join("archive").join(filename);
            if args.dry_run {
                if !quiet {
                    eprintln!("[dry-run] Would archive {} ({})", id, status);
                }
                results.push(serde_json::json!({
                    "id": id,
                    "status": status,
                    "from": from_path.to_string_lossy(),
                    "to": to_path.to_string_lossy().to_string(),
                }));
                continue;
            }
            if to_path.exists() {
                return Err(WorkError::General(format!(
                    "Archive destination already exists for '{}': {}", id, to_path.display()
                )));
            }
            move_path(from_path, &to_path)?;
            to_path
        };

        // Update index
        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
            let content = std::fs::read_to_string(&to_path)?;
            let (item, body) = cmt_core::parser::parse_file(&content)?;
            let file_str = to_path.to_string_lossy().to_string();
            cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, true), "upsert");
            cmt_core::index::warn_on_err(index.record_event(id, actor, "archive", None), "event");
        }

        if !quiet {
            eprintln!("Archived {} ({})", id, status);
        }
        files_changed.push(to_path.to_string_lossy().to_string());
        results.push(serde_json::json!({
            "id": id,
            "status": status,
            "from": from_path.to_string_lossy(),
            "to": to_path.to_string_lossy().to_string(),
        }));
    }

    // Git auto-commit
    if !args.dry_run && !files_changed.is_empty() {
        let file_refs: Vec<&str> = files_changed.iter().map(|s| s.as_str()).collect();
        cmt_core::git::auto_commit(
            &config,
            work_dir,
            &file_refs,
            &format!("archive {} items", files_changed.len()),
        )?;
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&results)?);
    }

    Ok(())
}

/// Move a file or directory, falling back to copy+delete on cross-device errors.
fn move_path(from: &Path, to: &Path) -> Result<()> {
    match std::fs::rename(from, to) {
        Ok(()) => Ok(()),
        Err(e) if e.raw_os_error() == Some(18) /* EXDEV */ => {
            // Cross-device: copy then remove
            if from.is_dir() {
                copy_dir_recursive(from, to)?;
                std::fs::remove_dir_all(from)?;
            } else {
                std::fs::copy(from, to)?;
                std::fs::remove_file(from)?;
            }
            Ok(())
        }
        Err(e) => Err(e.into()),
    }
}

/// Recursively copy a directory.
fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    std::fs::create_dir_all(dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let dest_path = dst.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_recursive(&entry.path(), &dest_path)?;
        } else {
            std::fs::copy(entry.path(), &dest_path)?;
        }
    }
    Ok(())
}

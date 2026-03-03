use std::path::{Path, PathBuf};

use crate::error::{Result, WorkError};
use crate::model::WorkItem;
use crate::parser;

/// Resolve an item ID to a file path using the detection order:
/// 1. .cmt/items/{ID}.md
/// 2. .cmt/items/{ID}/item.md
/// 3. .cmt/archive/{ID}.md
/// 4. .cmt/archive/{ID}/item.md
pub fn resolve_item_path(work_dir: &Path, id: &str) -> Result<PathBuf> {
    // Validate ID doesn't contain path traversal characters
    if id.contains('/') || id.contains('\\') || id.contains("..") {
        return Err(WorkError::ValidationError(format!(
            "Invalid item ID '{}': must not contain path separators or '..'", id
        )));
    }

    // Normalize padded IDs: PROJ-0001 -> PROJ-1 (the storage format).
    // Try both the user-supplied form and the normalized form so both work.
    let mut ids_to_try = vec![id.to_string()];
    if let Ok(parsed) = crate::model::WorkItemId::parse(id) {
        let normalized = format!("{}-{}", parsed.prefix, parsed.number);
        if normalized != id {
            ids_to_try.push(normalized);
        }
    }

    for try_id in &ids_to_try {
        let candidates = [
            work_dir.join("items").join(format!("{}.md", try_id)),
            work_dir.join("items").join(try_id).join("item.md"),
            work_dir.join("archive").join(format!("{}.md", try_id)),
            work_dir.join("archive").join(try_id).join("item.md"),
        ];

        for candidate in &candidates {
            if candidate.exists() {
                // Verify the resolved path is inside work_dir
                if let (Ok(canonical_work), Ok(canonical_candidate)) =
                    (std::fs::canonicalize(work_dir), std::fs::canonicalize(candidate))
                {
                    if !canonical_candidate.starts_with(&canonical_work) {
                        return Err(WorkError::PathTraversal(candidate.clone()));
                    }
                }
                return Ok(candidate.clone());
            }
        }
    }

    Err(WorkError::ItemNotFound(id.to_string()))
}

/// Read and parse a work item from disk.
pub fn read_item(work_dir: &Path, id: &str) -> Result<(WorkItem, String, PathBuf)> {
    let path = resolve_item_path(work_dir, id)?;
    let content = std::fs::read_to_string(&path)?;
    let (item, body) = parser::parse_file(&content)?;
    Ok((item, body, path))
}

/// Write a work item to disk atomically (temp file + rename).
pub fn write_item(path: &Path, item: &WorkItem, body: &str) -> Result<()> {
    let content = parser::serialize_file(item, body)?;
    atomic_write(path, &content)
}

/// Atomic write: write to temp file in same directory, then rename.
pub fn atomic_write(path: &Path, content: &str) -> Result<()> {
    let dir = path.parent().ok_or_else(|| {
        WorkError::General("Cannot determine parent directory for atomic write".to_string())
    })?;

    // Ensure directory exists
    std::fs::create_dir_all(dir)?;

    // Use tempfile crate for safe temporary file creation (no PID collisions)
    let mut temp = tempfile::NamedTempFile::new_in(dir)?;
    std::io::Write::write_all(&mut temp, content.as_bytes())?;

    // persist_noclobber would fail if path exists; use persist which overwrites
    temp.persist(path).map_err(|e| {
        WorkError::Io(e.error)
    })?;
    Ok(())
}

/// Check that a path is safe (no path traversal).
#[allow(dead_code)]
pub fn safe_resolve(work_dir: &Path, relative: &str) -> Result<PathBuf> {
    let target = work_dir.join(relative);
    let canonical_work_dir = std::fs::canonicalize(work_dir)?;

    // If the file exists, canonicalize it directly
    if let Ok(canonical_target) = std::fs::canonicalize(&target) {
        if !canonical_target.starts_with(&canonical_work_dir) {
            return Err(WorkError::PathTraversal(target));
        }
        return Ok(canonical_target);
    }

    // File doesn't exist yet — reject any ".." components in the relative path
    if relative.contains("..") {
        return Err(WorkError::PathTraversal(target));
    }

    Ok(target)
}

/// Scan all item files in items/ and archive/ directories.
pub fn scan_item_files(work_dir: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();

    for subdir in &["items", "archive"] {
        let dir = work_dir.join(subdir);
        if !dir.exists() {
            continue;
        }
        scan_dir_recursive(&dir, &mut files)?;
    }

    Ok(files)
}

fn scan_dir_recursive(dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() && path.extension().is_some_and(|e| e == "md") {
            files.push(path);
        } else if path.is_dir() {
            // Complex item: look for item.md
            let item_file = path.join("item.md");
            if item_file.exists() {
                files.push(item_file);
            }
        }
    }
    Ok(())
}

/// Get the next available ID number by scanning files.
pub fn next_id_from_files(work_dir: &Path, prefix: &str) -> Result<u32> {
    let files = scan_item_files(work_dir)?;
    let mut max_number: u32 = 0;

    let prefix_with_dash = format!("{}-", prefix);
    for file in &files {
        if let Some(stem) = file.file_stem().and_then(|s| s.to_str()) {
            // For item.md files in directories, get the directory name
            let name = if stem == "item" {
                file.parent()
                    .and_then(|p| p.file_name())
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
            } else {
                stem
            };

            if let Some(num_str) = name.strip_prefix(&prefix_with_dash) {
                if let Ok(num) = num_str.parse::<u32>() {
                    if num > max_number {
                        max_number = num;
                    }
                }
            }
        }
    }

    Ok(max_number + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safe_resolve_valid() {
        let tmp = tempfile::tempdir().unwrap();
        let work_dir = tmp.path().join(".cmt");
        std::fs::create_dir_all(&work_dir.join("items")).unwrap();
        let result = safe_resolve(&work_dir, "items/CMT-1.md");
        assert!(result.is_ok());
    }
}

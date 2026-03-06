//! Artifact discovery, MIME detection, and metadata.

use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::error::{Result, WorkError};

/// Default file/directory patterns to exclude from artifact discovery.
const EXCLUDED_NAMES: &[&str] = &[
    ".DS_Store",
    ".gitkeep",
    ".cmtignore",
    "Thumbs.db",
    "__pycache__",
    "node_modules",
    ".git",
];

const MAX_DEPTH: usize = 2;
const MAX_FILES: usize = 100;

/// A discovered or declared artifact.
#[derive(Debug, Clone, Serialize)]
pub struct Artifact {
    pub name: String,
    pub path: String,
    pub source: ArtifactSource,
    pub category: Option<String>,
    pub label: Option<String>,
    pub size: Option<u64>,
    pub mime: Option<&'static str>,
    pub modified: Option<String>,
    pub lines: Option<usize>,
    pub is_text: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactSource {
    Contained,
    RefLocal,
    RefRemote,
}

#[derive(Debug, Serialize)]
pub struct ArtifactList {
    pub item_id: String,
    pub is_complex: bool,
    pub truncated: bool,
    pub artifacts: Vec<Artifact>,
}

/// Detect MIME type from file extension.
pub fn detect_mime(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("png") => "image/png",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        Some("webp") => "image/webp",
        Some("ico") => "image/x-icon",
        Some("bmp") => "image/bmp",
        Some("pdf") => "application/pdf",
        Some("json") => "application/json",
        Some("yaml" | "yml") => "text/yaml",
        Some("csv") => "text/csv",
        Some("tsv") => "text/tab-separated-values",
        Some("sql") => "text/x-sql",
        Some("md" | "markdown") => "text/markdown",
        Some("txt" | "text") => "text/plain",
        Some("log") => "text/plain",
        Some("html" | "htm") => "text/html",
        Some("xml") => "text/xml",
        Some("toml") => "text/toml",
        Some("ini" | "cfg" | "conf") => "text/plain",
        Some("sh" | "bash" | "zsh") => "text/x-shellscript",
        Some("py") => "text/x-python",
        Some("rs") => "text/x-rust",
        Some("js" | "mjs" | "cjs") => "text/javascript",
        Some("ts" | "mts" | "cts") => "text/typescript",
        Some("tsx" | "jsx") => "text/typescript",
        Some("css") => "text/css",
        Some("scss" | "sass" | "less") => "text/css",
        Some("c" | "h") => "text/x-c",
        Some("cpp" | "cc" | "cxx" | "hpp") => "text/x-c++",
        Some("java") => "text/x-java",
        Some("go") => "text/x-go",
        Some("rb") => "text/x-ruby",
        Some("php") => "text/x-php",
        Some("swift") => "text/x-swift",
        Some("kt" | "kts") => "text/x-kotlin",
        Some("r" | "R") => "text/x-r",
        Some("zip") => "application/zip",
        Some("gz" | "tgz") => "application/gzip",
        Some("tar") => "application/x-tar",
        Some("7z") => "application/x-7z-compressed",
        Some("rar") => "application/x-rar-compressed",
        Some("wasm") => "application/wasm",
        Some("doc" | "docx") => "application/msword",
        Some("xls" | "xlsx") => "application/vnd.ms-excel",
        Some("ppt" | "pptx") => "application/vnd.ms-powerpoint",
        _ => "application/octet-stream",
    }
}

/// Check if a file is a text file (viewable as text).
pub fn is_text(path: &Path) -> bool {
    let mime = detect_mime(path);
    if mime.starts_with("text/") || mime == "application/json" {
        return true;
    }
    // Fallback: read first 8KB and check for null bytes
    if let Ok(bytes) = std::fs::read(path) {
        let check = &bytes[..bytes.len().min(8192)];
        return !check.contains(&0);
    }
    false
}

/// Count lines in a text file (newline count).
fn count_lines(path: &Path) -> Option<usize> {
    let content = std::fs::read(path).ok()?;
    Some(content.iter().filter(|&&b| b == b'\n').count())
}

/// Check if a filename/dirname should be excluded.
fn is_excluded(name: &str) -> bool {
    name.starts_with('.') || EXCLUDED_NAMES.contains(&name)
}

/// Compute weak ETag from file metadata.
pub fn compute_etag(metadata: &std::fs::Metadata) -> String {
    let mtime = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let size = metadata.len();
    format!("W/\"{}-{}\"", mtime, size)
}

/// Discover artifacts for a work item.
///
/// If the item is a complex item (directory), scans the directory for non-item.md files.
/// Also parses `refs` from frontmatter extra fields if present.
pub fn discover(
    item_file: &Path,
    extra: &std::collections::BTreeMap<String, serde_yml::Value>,
) -> ArtifactList {
    let item_id = item_file
        .parent()
        .and_then(|p| {
            if item_file.file_name().is_some_and(|n| n == "item.md") {
                p.file_name().and_then(|n| n.to_str())
            } else {
                item_file.file_stem().and_then(|n| n.to_str())
            }
        })
        .unwrap_or("")
        .to_string();

    let is_complex =
        item_file.file_name().is_some_and(|n| n == "item.md") && item_file.parent().is_some();

    let mut artifacts = Vec::new();
    let mut truncated = false;

    // Scan directory for contained artifacts (complex items only)
    if is_complex {
        if let Some(item_dir) = item_file.parent() {
            scan_artifacts(item_dir, item_dir, 0, &mut artifacts, &mut truncated);
        }
    }

    // Parse refs from frontmatter
    if let Some(serde_yml::Value::Sequence(refs)) = extra.get("refs") {
        for ref_val in refs {
            if let serde_yml::Value::Mapping(map) = ref_val {
                let label = map
                    .get(&serde_yml::Value::String("label".into()))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                if let Some(url) = map
                    .get(&serde_yml::Value::String("url".into()))
                    .and_then(|v| v.as_str())
                {
                    artifacts.push(Artifact {
                        name: label.clone().unwrap_or_else(|| url.to_string()),
                        path: url.to_string(),
                        source: ArtifactSource::RefRemote,
                        category: None,
                        label,
                        size: None,
                        mime: None,
                        modified: None,
                        lines: None,
                        is_text: false,
                    });
                } else if let Some(path_str) = map
                    .get(&serde_yml::Value::String("path".into()))
                    .and_then(|v| v.as_str())
                {
                    // Check if this path matches a contained artifact (enrichment)
                    let already_contained = artifacts
                        .iter_mut()
                        .find(|a| a.path == path_str);

                    if let Some(existing) = already_contained {
                        // Enrich with label
                        if existing.label.is_none() {
                            existing.label = label;
                        }
                    } else {
                        // Ref-local: try to stat the file relative to repo root
                        let ref_artifact = make_ref_local_artifact(path_str, label);
                        artifacts.push(ref_artifact);
                    }
                }
            }
        }
    }

    // Sort: by category (alphabetical), then by name
    artifacts.sort_by(|a, b| {
        let cat_cmp = a.category.as_deref().unwrap_or("\u{FFFF}").cmp(
            b.category.as_deref().unwrap_or("\u{FFFF}"),
        );
        cat_cmp.then_with(|| a.name.cmp(&b.name))
    });

    ArtifactList {
        item_id,
        is_complex,
        truncated,
        artifacts,
    }
}

fn make_ref_local_artifact(path_str: &str, label: Option<String>) -> Artifact {
    let path = Path::new(path_str);
    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(path_str)
        .to_string();
    let mime = detect_mime(path);
    let is_text_file = mime.starts_with("text/") || mime == "application/json";

    // Try to stat the file (relative to CWD or absolute)
    let (size, modified, lines) = if let Ok(meta) = std::fs::metadata(path) {
        let mod_time = meta
            .modified()
            .ok()
            .and_then(|t| {
                chrono::DateTime::<chrono::Utc>::from(t)
                    .format("%Y-%m-%dT%H:%M:%SZ")
                    .to_string()
                    .into()
            });
        let line_count = if is_text_file { count_lines(path) } else { None };
        (Some(meta.len()), mod_time, line_count)
    } else {
        (None, None, None)
    };

    Artifact {
        name,
        path: path_str.to_string(),
        source: ArtifactSource::RefLocal,
        category: None,
        label,
        size,
        mime: if mime == "application/octet-stream" { None } else { Some(mime) },
        modified,
        lines,
        is_text: is_text_file,
    }
}

fn scan_artifacts(
    base_dir: &Path,
    dir: &Path,
    depth: usize,
    artifacts: &mut Vec<Artifact>,
    truncated: &mut bool,
) {
    if depth > MAX_DEPTH || artifacts.len() >= MAX_FILES {
        *truncated = artifacts.len() >= MAX_FILES;
        return;
    }

    let entries = match std::fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };

    let mut sorted: Vec<_> = entries.flatten().collect();
    sorted.sort_by_key(|e| e.file_name());

    for entry in sorted {
        if artifacts.len() >= MAX_FILES {
            *truncated = true;
            return;
        }

        let name = entry.file_name();
        let name_str = name.to_string_lossy();

        if is_excluded(&name_str) {
            continue;
        }

        let path = entry.path();

        if path.is_file() {
            // Skip item.md (the work item itself)
            if name_str == "item.md" {
                continue;
            }

            let rel_path = path
                .strip_prefix(base_dir)
                .unwrap_or(&path)
                .to_string_lossy()
                .to_string();

            let category = if depth > 0 {
                dir.strip_prefix(base_dir)
                    .ok()
                    .and_then(|p| p.components().next())
                    .and_then(|c| c.as_os_str().to_str())
                    .map(|s| s.to_string())
            } else {
                None
            };

            let mime = detect_mime(&path);
            let is_text_file = is_text(&path);
            let meta = std::fs::metadata(&path).ok();
            let size = meta.as_ref().map(|m| m.len());
            let modified = meta.as_ref().and_then(|m| {
                m.modified().ok().map(|t| {
                    chrono::DateTime::<chrono::Utc>::from(t)
                        .format("%Y-%m-%dT%H:%M:%SZ")
                        .to_string()
                })
            });
            let lines = if is_text_file {
                count_lines(&path)
            } else {
                None
            };

            artifacts.push(Artifact {
                name: name_str.to_string(),
                path: rel_path,
                source: ArtifactSource::Contained,
                category,
                label: None,
                size,
                mime: if mime == "application/octet-stream" {
                    None
                } else {
                    Some(mime)
                },
                modified,
                lines,
                is_text: is_text_file,
            });
        } else if path.is_dir() {
            scan_artifacts(base_dir, &path, depth + 1, artifacts, truncated);
        }
    }
}

/// Count artifacts for an item (fast — no content reads).
/// Returns (count, first_image_path).
pub fn count_artifacts(item_file: &Path) -> (u32, Option<String>) {
    let is_complex =
        item_file.file_name().is_some_and(|n| n == "item.md") && item_file.parent().is_some();

    if !is_complex {
        return (0, None);
    }

    let item_dir = match item_file.parent() {
        Some(d) => d,
        None => return (0, None),
    };

    let mut count: u32 = 0;
    let mut first_image: Option<String> = None;

    count_dir(item_dir, item_dir, 0, &mut count, &mut first_image);

    (count, first_image)
}

fn count_dir(
    base_dir: &Path,
    dir: &Path,
    depth: usize,
    count: &mut u32,
    first_image: &mut Option<String>,
) {
    if depth > MAX_DEPTH || *count >= MAX_FILES as u32 {
        return;
    }
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        if is_excluded(&name_str) {
            continue;
        }
        let path = entry.path();
        if path.is_file() && name_str != "item.md" {
            *count += 1;
            if first_image.is_none() {
                let mime = detect_mime(&path);
                if mime.starts_with("image/") {
                    let rel = path
                        .strip_prefix(base_dir)
                        .unwrap_or(&path)
                        .to_string_lossy()
                        .to_string();
                    *first_image = Some(rel);
                }
            }
        } else if path.is_dir() {
            count_dir(base_dir, &path, depth + 1, count, first_image);
        }
    }
}

/// Validate an artifact path for security (no traversal, no symlink escape).
pub fn validate_artifact_path(
    item_dir: &Path,
    requested_path: &str,
) -> Result<PathBuf> {
    if requested_path.contains("..") {
        return Err(WorkError::PathTraversal(PathBuf::from(requested_path)));
    }

    let full_path = item_dir.join(requested_path);
    let canonical = full_path
        .canonicalize()
        .map_err(|_| WorkError::ItemNotFound(requested_path.to_string()))?;
    let canonical_base = item_dir
        .canonicalize()
        .map_err(|_| WorkError::General("Cannot resolve item directory".to_string()))?;

    if !canonical.starts_with(&canonical_base) {
        return Err(WorkError::PathTraversal(full_path));
    }

    Ok(canonical)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_mime() {
        assert_eq!(detect_mime(Path::new("foo.png")), "image/png");
        assert_eq!(detect_mime(Path::new("foo.sql")), "text/x-sql");
        assert_eq!(detect_mime(Path::new("foo.xyz")), "application/octet-stream");
    }

    #[test]
    fn test_is_excluded() {
        assert!(is_excluded(".DS_Store"));
        assert!(is_excluded(".hidden"));
        assert!(is_excluded("node_modules"));
        assert!(!is_excluded("screenshot.png"));
    }

    #[test]
    fn test_compute_etag() {
        let tmp = tempfile::NamedTempFile::new().unwrap();
        std::io::Write::write_all(&mut tmp.as_file(), b"hello").ok();
        let meta = tmp.as_file().metadata().unwrap();
        let etag = compute_etag(&meta);
        assert!(etag.starts_with("W/\""));
        assert!(etag.ends_with('"'));
    }

    #[test]
    fn test_validate_artifact_path_traversal() {
        let tmp = tempfile::tempdir().unwrap();
        let result = validate_artifact_path(tmp.path(), "../../etc/passwd");
        assert!(result.is_err());
    }

    #[test]
    fn test_count_artifacts_simple_item() {
        let tmp = tempfile::tempdir().unwrap();
        let file = tmp.path().join("CMT-1.md");
        std::fs::write(&file, "---\nid: CMT-1\n---\n").unwrap();
        let (count, preview) = count_artifacts(&file);
        assert_eq!(count, 0);
        assert!(preview.is_none());
    }

    #[test]
    fn test_count_artifacts_complex_item() {
        let tmp = tempfile::tempdir().unwrap();
        let item_dir = tmp.path().join("CMT-1");
        std::fs::create_dir_all(item_dir.join("evidence")).unwrap();
        std::fs::write(item_dir.join("item.md"), "---\nid: CMT-1\n---\n").unwrap();
        std::fs::write(item_dir.join("evidence/screenshot.png"), "PNG").unwrap();
        std::fs::write(item_dir.join("evidence/log.txt"), "log data").unwrap();

        let (count, preview) = count_artifacts(&item_dir.join("item.md"));
        assert_eq!(count, 2);
        assert_eq!(preview, Some("evidence/screenshot.png".to_string()));
    }
}

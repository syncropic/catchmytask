use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::{Result, WorkError};

/// A saved view: a named set of filters persisted as YAML in `.cmt/views/`.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SavedView {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default)]
    pub filters: ViewFilters,
}

/// Filter criteria for a saved view.
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ViewFilters {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub priority: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assignee: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<u32>,
}

/// Validate that a view name contains only alphanumeric characters and hyphens.
fn validate_name(name: &str) -> Result<()> {
    if name.is_empty() {
        return Err(WorkError::ValidationError(
            "View name must not be empty".to_string(),
        ));
    }
    if !name
        .chars()
        .all(|c| c.is_alphanumeric() || c == '-' || c == '_')
    {
        return Err(WorkError::ValidationError(format!(
            "View name '{}' contains invalid characters. Use alphanumeric, hyphens, or underscores.",
            name
        )));
    }
    if name.contains('/') || name.contains('\\') || name.contains("..") {
        return Err(WorkError::ValidationError(format!(
            "View name '{}' contains path separators",
            name
        )));
    }
    Ok(())
}

fn views_dir(work_dir: &Path) -> std::path::PathBuf {
    work_dir.join("views")
}

/// List all saved views by scanning `.cmt/views/`.
pub fn list_views(work_dir: &Path) -> Result<Vec<SavedView>> {
    let dir = views_dir(work_dir);
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut views = Vec::new();
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().is_some_and(|e| e == "yml" || e == "yaml") {
            let content = std::fs::read_to_string(&path)?;
            match serde_yml::from_str::<SavedView>(&content) {
                Ok(view) => views.push(view),
                Err(_) => continue,
            }
        }
    }
    views.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(views)
}

/// Load a single saved view by name.
pub fn load_view(work_dir: &Path, name: &str) -> Result<SavedView> {
    validate_name(name)?;
    let path = views_dir(work_dir).join(format!("{}.yml", name));
    if !path.exists() {
        return Err(WorkError::General(format!("View '{}' not found", name)));
    }
    let content = std::fs::read_to_string(&path)?;
    let view: SavedView =
        serde_yml::from_str(&content).map_err(|e| WorkError::General(e.to_string()))?;
    Ok(view)
}

/// Save a view to `.cmt/views/{name}.yml`.
pub fn save_view(work_dir: &Path, view: &SavedView) -> Result<()> {
    validate_name(&view.name)?;
    let dir = views_dir(work_dir);
    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }
    let path = dir.join(format!("{}.yml", view.name));
    let content =
        serde_yml::to_string(view).map_err(|e| WorkError::General(e.to_string()))?;
    crate::storage::atomic_write(&path, &content)?;
    Ok(())
}

/// Delete a saved view by name.
pub fn delete_view(work_dir: &Path, name: &str) -> Result<()> {
    validate_name(name)?;
    let path = views_dir(work_dir).join(format!("{}.yml", name));
    if !path.exists() {
        return Err(WorkError::General(format!("View '{}' not found", name)));
    }
    std::fs::remove_file(&path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn setup() -> TempDir {
        let tmp = TempDir::new().unwrap();
        std::fs::create_dir_all(tmp.path().join("views")).unwrap();
        tmp
    }

    #[test]
    fn test_save_and_load_view() {
        let tmp = setup();
        let view = SavedView {
            name: "active-high".to_string(),
            description: Some("Active high-priority items".to_string()),
            filters: ViewFilters {
                status: Some("active".to_string()),
                priority: Some("high".to_string()),
                ..Default::default()
            },
        };
        save_view(tmp.path(), &view).unwrap();
        let loaded = load_view(tmp.path(), "active-high").unwrap();
        assert_eq!(loaded.name, "active-high");
        assert_eq!(loaded.filters.status, Some("active".to_string()));
        assert_eq!(loaded.filters.priority, Some("high".to_string()));
    }

    #[test]
    fn test_list_views() {
        let tmp = setup();
        save_view(
            tmp.path(),
            &SavedView {
                name: "beta".to_string(),
                description: None,
                filters: ViewFilters::default(),
            },
        )
        .unwrap();
        save_view(
            tmp.path(),
            &SavedView {
                name: "alpha".to_string(),
                description: None,
                filters: ViewFilters::default(),
            },
        )
        .unwrap();
        let views = list_views(tmp.path()).unwrap();
        assert_eq!(views.len(), 2);
        assert_eq!(views[0].name, "alpha");
        assert_eq!(views[1].name, "beta");
    }

    #[test]
    fn test_delete_view() {
        let tmp = setup();
        save_view(
            tmp.path(),
            &SavedView {
                name: "temp".to_string(),
                description: None,
                filters: ViewFilters::default(),
            },
        )
        .unwrap();
        assert!(load_view(tmp.path(), "temp").is_ok());
        delete_view(tmp.path(), "temp").unwrap();
        assert!(load_view(tmp.path(), "temp").is_err());
    }

    #[test]
    fn test_invalid_view_name() {
        let tmp = setup();
        let view = SavedView {
            name: "../etc/passwd".to_string(),
            description: None,
            filters: ViewFilters::default(),
        };
        assert!(save_view(tmp.path(), &view).is_err());
    }

    #[test]
    fn test_load_nonexistent_view() {
        let tmp = setup();
        assert!(load_view(tmp.path(), "nope").is_err());
    }
}

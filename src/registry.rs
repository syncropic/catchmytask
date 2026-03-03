use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::config::resolve_global_config_dir;
use crate::error::{Result, WorkError};
use crate::storage;

/// A registered project in the global registry.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ProjectEntry {
    pub name: String,
    pub path: PathBuf,
    pub prefix: String,
}

/// Global project registry stored at ~/.config/cmt/projects.yml.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Registry {
    #[serde(default)]
    pub projects: Vec<ProjectEntry>,
}

impl Registry {
    /// Path to the global registry file.
    pub fn registry_path() -> PathBuf {
        resolve_global_config_dir().join("projects.yml")
    }

    /// Load the registry from disk. Returns default (empty) if the file is missing.
    pub fn load() -> Result<Self> {
        let path = Self::registry_path();
        if !path.exists() {
            return Ok(Self::default());
        }
        let content = std::fs::read_to_string(&path)?;
        if content.trim().is_empty() {
            return Ok(Self::default());
        }
        let reg: Registry = serde_yml::from_str(&content)?;
        Ok(reg)
    }

    /// Save the registry to disk, creating parent dirs if needed.
    pub fn save(&self) -> Result<()> {
        let path = Self::registry_path();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let content = serde_yml::to_string(self)
            .map_err(|e| WorkError::General(format!("Failed to serialize registry: {}", e)))?;
        storage::atomic_write(&path, &content)?;
        Ok(())
    }

    /// Register a project entry. Deduplicates by canonical path;
    /// updates name/prefix if the path already exists.
    pub fn register(&mut self, entry: ProjectEntry) -> bool {
        let canonical = std::fs::canonicalize(&entry.path)
            .unwrap_or_else(|_| entry.path.clone());

        for existing in &mut self.projects {
            let existing_canonical = std::fs::canonicalize(&existing.path)
                .unwrap_or_else(|_| existing.path.clone());
            if existing_canonical == canonical {
                existing.name = entry.name;
                existing.prefix = entry.prefix;
                return false; // updated, not new
            }
        }
        self.projects.push(ProjectEntry {
            name: entry.name,
            path: canonical,
            prefix: entry.prefix,
        });
        true // newly added
    }

    /// Remove a project by name. Returns true if found and removed.
    pub fn remove_by_name(&mut self, name: &str) -> bool {
        let before = self.projects.len();
        self.projects.retain(|p| p.name != name);
        self.projects.len() < before
    }

    /// Find a project by name.
    pub fn find_by_name(&self, name: &str) -> Option<&ProjectEntry> {
        self.projects.iter().find(|p| p.name == name)
    }

    /// Find a project by path (canonicalized comparison).
    pub fn find_by_path(&self, path: &Path) -> Option<&ProjectEntry> {
        let canonical = std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
        self.projects.iter().find(|p| {
            let p_canonical = std::fs::canonicalize(&p.path)
                .unwrap_or_else(|_| p.path.clone());
            p_canonical == canonical
        })
    }

    /// Remove entries where the path no longer exists on disk.
    /// Returns the number of entries pruned.
    pub fn prune(&mut self) -> usize {
        let before = self.projects.len();
        self.projects.retain(|p| p.path.exists());
        before - self.projects.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn make_entry(name: &str, path: &Path, prefix: &str) -> ProjectEntry {
        ProjectEntry {
            name: name.to_string(),
            path: path.to_path_buf(),
            prefix: prefix.to_string(),
        }
    }

    #[test]
    fn test_register_new_project() {
        let tmp = TempDir::new().unwrap();
        let mut reg = Registry::default();
        let entry = make_entry("test", tmp.path(), "TST");
        assert!(reg.register(entry));
        assert_eq!(reg.projects.len(), 1);
        assert_eq!(reg.projects[0].name, "test");
    }

    #[test]
    fn test_register_duplicate_updates() {
        let tmp = TempDir::new().unwrap();
        let mut reg = Registry::default();
        let entry1 = make_entry("test", tmp.path(), "TST");
        assert!(reg.register(entry1));

        let entry2 = make_entry("test-renamed", tmp.path(), "NEW");
        assert!(!reg.register(entry2));
        assert_eq!(reg.projects.len(), 1);
        assert_eq!(reg.projects[0].name, "test-renamed");
        assert_eq!(reg.projects[0].prefix, "NEW");
    }

    #[test]
    fn test_remove_by_name() {
        let tmp = TempDir::new().unwrap();
        let mut reg = Registry::default();
        reg.register(make_entry("alpha", tmp.path(), "A"));
        assert!(reg.remove_by_name("alpha"));
        assert!(reg.projects.is_empty());
        assert!(!reg.remove_by_name("nonexistent"));
    }

    #[test]
    fn test_find_by_name() {
        let tmp = TempDir::new().unwrap();
        let mut reg = Registry::default();
        reg.register(make_entry("alpha", tmp.path(), "A"));
        assert!(reg.find_by_name("alpha").is_some());
        assert!(reg.find_by_name("beta").is_none());
    }

    #[test]
    fn test_find_by_path() {
        let tmp = TempDir::new().unwrap();
        let mut reg = Registry::default();
        reg.register(make_entry("alpha", tmp.path(), "A"));
        assert!(reg.find_by_path(tmp.path()).is_some());
    }

    #[test]
    fn test_prune_removes_missing_paths() {
        let mut reg = Registry::default();
        reg.projects.push(make_entry("gone", Path::new("/tmp/definitely-not-a-real-path-xyzzy"), "G"));
        let tmp = TempDir::new().unwrap();
        reg.projects.push(make_entry("exists", tmp.path(), "E"));

        let pruned = reg.prune();
        assert_eq!(pruned, 1);
        assert_eq!(reg.projects.len(), 1);
        assert_eq!(reg.projects[0].name, "exists");
    }

    #[test]
    fn test_default_registry_is_empty() {
        let reg = Registry::default();
        assert!(reg.projects.is_empty());
    }

    #[test]
    fn test_serialization_roundtrip() {
        let mut reg = Registry::default();
        let tmp = TempDir::new().unwrap();
        reg.register(make_entry("test", tmp.path(), "TST"));

        let yaml = serde_yml::to_string(&reg).unwrap();
        let loaded: Registry = serde_yml::from_str(&yaml).unwrap();
        assert_eq!(loaded.projects.len(), 1);
        assert_eq!(loaded.projects[0].name, "test");
    }
}

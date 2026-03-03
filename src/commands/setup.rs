use std::path::{Path, PathBuf};

use crate::cli::SetupArgs;
use crate::error::{Result, WorkError};

const CLAUDE_CODE_SKILL: &str = include_str!("../../integrations/claude-code/SKILL.md");

#[derive(Debug)]
struct Integration {
    name: &'static str,
    display_name: &'static str,
    skill_dir: &'static str,
    skill_file: &'static str,
    content: &'static str,
}

const INTEGRATIONS: &[Integration] = &[Integration {
    name: "claude-code",
    display_name: "Claude Code",
    skill_dir: "managing-work",
    skill_file: "SKILL.md",
    content: CLAUDE_CODE_SKILL,
}];

#[derive(Debug, PartialEq)]
enum Action {
    Created,
    Updated,
    AlreadyUpToDate,
}

fn home_dir() -> Result<PathBuf> {
    std::env::var("HOME")
        .map(PathBuf::from)
        .map_err(|_| WorkError::General("Could not determine home directory".into()))
}

fn integration_path(home: &Path, integration: &Integration) -> PathBuf {
    home.join(".claude")
        .join("skills")
        .join(integration.skill_dir)
        .join(integration.skill_file)
}

fn is_detected(home: &Path, integration: &Integration) -> bool {
    if integration.name == "claude-code" {
        home.join(".claude").exists()
    } else {
        false
    }
}

fn is_installed(home: &Path, integration: &Integration) -> bool {
    integration_path(home, integration).exists()
}

fn install(home: &Path, integration: &Integration) -> Result<Action> {
    let path = integration_path(home, integration);

    if path.exists() {
        let existing = std::fs::read_to_string(&path)?;
        if existing == integration.content {
            return Ok(Action::AlreadyUpToDate);
        }
        crate::storage::atomic_write(&path, integration.content)?;
        return Ok(Action::Updated);
    }

    crate::storage::atomic_write(&path, integration.content)?;
    Ok(Action::Created)
}

fn uninstall(home: &Path, integration: &Integration) -> Result<bool> {
    let path = integration_path(home, integration);
    let dir = path.parent().ok_or_else(|| {
        WorkError::General("Cannot determine skill directory".into())
    })?;

    if dir.exists() {
        std::fs::remove_dir_all(dir)?;
        Ok(true)
    } else {
        Ok(false)
    }
}

fn find_integration(name: &str) -> Result<&'static Integration> {
    INTEGRATIONS
        .iter()
        .find(|i| i.name == name)
        .ok_or_else(|| {
            let valid: Vec<&str> = INTEGRATIONS.iter().map(|i| i.name).collect();
            WorkError::General(format!(
                "Unknown integration '{}'. Available: {}",
                name,
                valid.join(", ")
            ))
        })
}

pub fn execute(args: &SetupArgs, json: bool, quiet: bool) -> Result<()> {
    let home = home_dir()?;

    if args.list {
        return list_integrations(&home, json);
    }

    if let Some(ref name) = args.remove {
        return remove_integration(&home, name, json, quiet);
    }

    if args.claude_code {
        return install_integration(&home, "claude-code", json, quiet);
    }

    if args.all {
        return install_all(&home, json, quiet);
    }

    // No flags: show status and suggest flags
    list_integrations(&home, json)
}

fn list_integrations(home: &Path, json: bool) -> Result<()> {
    if json {
        let entries: Vec<serde_json::Value> = INTEGRATIONS
            .iter()
            .map(|i| {
                let path = integration_path(home, i);
                serde_json::json!({
                    "name": i.name,
                    "display_name": i.display_name,
                    "detected": is_detected(home, i),
                    "installed": is_installed(home, i),
                    "path": path.display().to_string(),
                })
            })
            .collect();
        let output = serde_json::json!({ "integrations": entries });
        println!("{}", serde_json::to_string(&output)?);
    } else {
        println!(
            "{:<16} {:<10} {:<10} Path",
            "Integration", "Detected", "Installed"
        );
        for i in INTEGRATIONS {
            let path = integration_path(home, i);
            let path_str = path.display().to_string();
            let path_display = path_str.replacen(
                &home.display().to_string(),
                "~",
                1,
            );
            println!(
                "{:<16} {:<10} {:<10} {}",
                i.name,
                if is_detected(home, i) { "yes" } else { "no" },
                if is_installed(home, i) { "yes" } else { "no" },
                path_display,
            );
        }
    }
    Ok(())
}

fn install_integration(home: &Path, name: &str, json: bool, quiet: bool) -> Result<()> {
    let integration = find_integration(name)?;
    let action = install(home, integration)?;
    let path = integration_path(home, integration);

    if json {
        let action_str = match action {
            Action::Created => "created",
            Action::Updated => "updated",
            Action::AlreadyUpToDate => "up_to_date",
        };
        let output = serde_json::json!({
            "integration": integration.name,
            "action": action_str,
            "path": path.display().to_string(),
        });
        println!("{}", serde_json::to_string(&output)?);
    } else if !quiet {
        match action {
            Action::Created => {
                eprintln!(
                    "Installed {} skill to {}",
                    integration.display_name,
                    path.display()
                );
            }
            Action::Updated => {
                eprintln!(
                    "Updated {} skill at {}",
                    integration.display_name,
                    path.display()
                );
            }
            Action::AlreadyUpToDate => {
                eprintln!("{} skill already up to date.", integration.display_name);
            }
        }
    }
    Ok(())
}

fn install_all(home: &Path, json: bool, quiet: bool) -> Result<()> {
    if json {
        let mut results = Vec::new();
        for i in INTEGRATIONS {
            let action = install(home, i)?;
            let path = integration_path(home, i);
            let action_str = match action {
                Action::Created => "created",
                Action::Updated => "updated",
                Action::AlreadyUpToDate => "up_to_date",
            };
            results.push(serde_json::json!({
                "integration": i.name,
                "action": action_str,
                "path": path.display().to_string(),
            }));
        }
        let output = serde_json::json!({ "results": results });
        println!("{}", serde_json::to_string(&output)?);
    } else {
        for i in INTEGRATIONS {
            install_integration(home, i.name, false, quiet)?;
        }
    }
    Ok(())
}

fn remove_integration(home: &Path, name: &str, json: bool, quiet: bool) -> Result<()> {
    let integration = find_integration(name)?;
    let removed = uninstall(home, integration)?;

    if json {
        let action = if removed { "removed" } else { "not_installed" };
        let output = serde_json::json!({
            "integration": integration.name,
            "action": action,
        });
        println!("{}", serde_json::to_string(&output)?);
    } else if !quiet {
        if removed {
            let path = integration_path(home, integration);
            let parent = path.parent().unwrap_or(&path);
            eprintln!(
                "Removed {} skill from {}",
                integration.display_name,
                parent.display()
            );
        } else {
            eprintln!("{} skill is not installed.", integration.display_name);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_home() -> tempfile::TempDir {
        tempfile::TempDir::new().unwrap()
    }

    #[test]
    fn test_detect_no_claude_dir() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        assert!(!is_detected(home.path(), i));
    }

    #[test]
    fn test_detect_with_claude_dir() {
        let home = test_home();
        std::fs::create_dir_all(home.path().join(".claude")).unwrap();
        let i = &INTEGRATIONS[0];
        assert!(is_detected(home.path(), i));
    }

    #[test]
    fn test_install_creates_skill() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        let action = install(home.path(), i).unwrap();
        assert_eq!(action, Action::Created);
        assert!(is_installed(home.path(), i));

        let path = integration_path(home.path(), i);
        let content = std::fs::read_to_string(path).unwrap();
        assert_eq!(content, CLAUDE_CODE_SKILL);
    }

    #[test]
    fn test_install_idempotent() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        let first = install(home.path(), i).unwrap();
        assert_eq!(first, Action::Created);

        let second = install(home.path(), i).unwrap();
        assert_eq!(second, Action::AlreadyUpToDate);
    }

    #[test]
    fn test_install_detects_changed_content() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        install(home.path(), i).unwrap();

        let path = integration_path(home.path(), i);
        std::fs::write(&path, "old content").unwrap();

        let action = install(home.path(), i).unwrap();
        assert_eq!(action, Action::Updated);

        let content = std::fs::read_to_string(path).unwrap();
        assert_eq!(content, CLAUDE_CODE_SKILL);
    }

    #[test]
    fn test_remove_cleans_up() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        install(home.path(), i).unwrap();
        assert!(is_installed(home.path(), i));

        let removed = uninstall(home.path(), i).unwrap();
        assert!(removed);
        assert!(!is_installed(home.path(), i));
    }

    #[test]
    fn test_remove_when_not_installed() {
        let home = test_home();
        let i = &INTEGRATIONS[0];
        let removed = uninstall(home.path(), i).unwrap();
        assert!(!removed);
    }

    #[test]
    fn test_find_integration_valid() {
        assert!(find_integration("claude-code").is_ok());
    }

    #[test]
    fn test_find_integration_invalid() {
        let err = find_integration("nonexistent").unwrap_err();
        assert!(err.to_string().contains("Unknown integration"));
    }
}

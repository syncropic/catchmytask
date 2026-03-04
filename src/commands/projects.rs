use std::path::Path;

use crate::cli::{ProjectsArgs, ProjectsCommand};
use crate::config::Config;
use crate::error::{Result, WorkError};
use crate::registry::{ProjectEntry, Registry};
use crate::storage;

pub fn execute(
    args: &ProjectsArgs,
    current_work_dir: Option<&Path>,
    json: bool,
    quiet: bool,
) -> Result<()> {
    match &args.command {
        None => list_projects(current_work_dir, json),
        Some(ProjectsCommand::Add { path }) => add_project(path, json, quiet),
        Some(ProjectsCommand::Remove { name }) => remove_project(name, json, quiet),
        Some(ProjectsCommand::Current) => show_current(current_work_dir, json),
        Some(ProjectsCommand::Prune) => prune_projects(json, quiet),
    }
}

fn list_projects(current_work_dir: Option<&Path>, json: bool) -> Result<()> {
    let registry = Registry::load()?;

    if json {
        let entries: Vec<serde_json::Value> = registry
            .projects
            .iter()
            .map(|p| {
                let is_current = current_work_dir
                    .and_then(|wd| std::fs::canonicalize(wd).ok())
                    .map(|wd| {
                        std::fs::canonicalize(&p.path)
                            .map(|pp| pp == wd)
                            .unwrap_or(false)
                    })
                    .unwrap_or(false);
                let item_count = count_items(&p.path);
                serde_json::json!({
                    "name": p.name,
                    "prefix": p.prefix,
                    "path": p.path.display().to_string(),
                    "current": is_current,
                    "items": item_count,
                })
            })
            .collect();
        println!("{}", serde_json::to_string_pretty(&entries)?);
        return Ok(());
    }

    if registry.projects.is_empty() {
        eprintln!("No projects registered. Use 'cmt projects add <path>' or 'cmt init' to register.");
        return Ok(());
    }

    // Table header
    let headers = ["", "NAME", "PREFIX", "ITEMS", "PATH"];
    println!(
        "{:<2} {:<20} {:<8} {:<6} {}",
        headers[0], headers[1], headers[2], headers[3], headers[4]
    );
    println!("{}", "-".repeat(72));

    for p in &registry.projects {
        let is_current = current_work_dir
            .and_then(|wd| std::fs::canonicalize(wd).ok())
            .map(|wd| {
                std::fs::canonicalize(&p.path)
                    .map(|pp| pp == wd)
                    .unwrap_or(false)
            })
            .unwrap_or(false);
        let marker = if is_current { "*" } else { "" };
        let item_count = count_items(&p.path);
        println!(
            "{:<2} {:<20} {:<8} {:<6} {}",
            marker,
            p.name,
            p.prefix,
            item_count,
            p.path.display()
        );
    }

    Ok(())
}

fn add_project(path: &Path, json: bool, quiet: bool) -> Result<()> {
    let canonical = std::fs::canonicalize(path).map_err(|_| {
        WorkError::General(format!("Path '{}' does not exist", path.display()))
    })?;

    // Look for .cmt/ in the given path
    let work_dir = if canonical.ends_with(".cmt") {
        canonical.clone()
    } else {
        canonical.join(".cmt")
    };

    if !work_dir.exists() {
        return Err(WorkError::General(format!(
            "No .cmt/ directory found at '{}'. Run 'cmt init' there first.",
            canonical.display()
        )));
    }

    // Load config to get name and prefix
    let config = Config::load(&work_dir)?;
    let name = config.project.name.clone();
    let prefix = config.project.prefix.clone();

    let mut registry = Registry::load()?;
    let entry = ProjectEntry {
        name: name.clone(),
        path: work_dir,
        prefix: prefix.clone(),
    };
    let is_new = registry.register(entry);
    registry.save()?;

    if json {
        println!(
            "{}",
            serde_json::json!({
                "name": name,
                "prefix": prefix,
                "path": canonical.display().to_string(),
                "added": is_new,
            })
        );
    } else if !quiet {
        if is_new {
            eprintln!("Added project '{}' ({})", name, canonical.display());
        } else {
            eprintln!("Updated project '{}' ({})", name, canonical.display());
        }
    }

    Ok(())
}

fn remove_project(name: &str, json: bool, quiet: bool) -> Result<()> {
    let mut registry = Registry::load()?;
    if !registry.remove_by_name(name) {
        return Err(WorkError::ProjectNotFound(name.to_string()));
    }
    registry.save()?;

    if json {
        println!("{}", serde_json::json!({ "removed": name }));
    } else if !quiet {
        eprintln!("Removed project '{}'", name);
    }
    Ok(())
}

fn show_current(current_work_dir: Option<&Path>, json: bool) -> Result<()> {
    let work_dir = current_work_dir.ok_or(WorkError::WorkDirNotFound)?;
    let registry = Registry::load()?;

    match registry.find_by_path(work_dir) {
        Some(entry) => {
            if json {
                println!(
                    "{}",
                    serde_json::json!({
                        "name": entry.name,
                        "prefix": entry.prefix,
                        "path": entry.path.display().to_string(),
                    })
                );
            } else {
                println!("{}", entry.name);
            }
            Ok(())
        }
        None => {
            // Not registered but work_dir exists — show info from config
            let config = Config::load(work_dir)?;
            if json {
                println!(
                    "{}",
                    serde_json::json!({
                        "name": config.project.name,
                        "prefix": config.project.prefix,
                        "path": work_dir.display().to_string(),
                        "registered": false,
                    })
                );
            } else {
                println!("{} (not registered)", config.project.name);
            }
            Ok(())
        }
    }
}

fn prune_projects(json: bool, quiet: bool) -> Result<()> {
    let mut registry = Registry::load()?;
    let pruned = registry.prune();
    registry.save()?;

    if json {
        println!("{}", serde_json::json!({ "pruned": pruned }));
    } else if !quiet {
        eprintln!("Pruned {} stale project(s)", pruned);
    }
    Ok(())
}

/// Count .md files in items/ directory.
fn count_items(work_dir: &Path) -> usize {
    let items_dir = work_dir.join("items");
    match storage::scan_item_files(work_dir) {
        Ok(files) => files.len(),
        Err(_) => {
            // Fallback: just count .md files
            std::fs::read_dir(&items_dir)
                .map(|entries| {
                    entries
                        .filter_map(|e| e.ok())
                        .filter(|e| {
                            e.path()
                                .extension()
                                .is_some_and(|ext| ext == "md")
                        })
                        .count()
                })
                .unwrap_or(0)
        }
    }
}

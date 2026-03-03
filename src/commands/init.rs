use std::path::Path;

use crate::cli::InitArgs;
use crate::config::{Config, resolve_global_config_dir};
use crate::error::{Result, WorkError};

pub fn execute(args: &InitArgs, json: bool, quiet: bool) -> Result<()> {
    if args.global {
        return init_global(json, quiet);
    }

    let work_dir = Path::new(".cmt");

    // Validate prefix
    let prefix_re = regex::Regex::new(r"^[A-Z][A-Z0-9]{0,7}$").unwrap();
    if !prefix_re.is_match(&args.prefix) {
        return Err(WorkError::ValidationError(format!(
            "Invalid prefix '{}'. Must be 1-8 uppercase alphanumeric characters starting with a letter.",
            args.prefix
        )));
    }

    if work_dir.exists() && !args.force {
        return Err(WorkError::AlreadyInitialized);
    }

    if work_dir.exists() && args.force {
        // Preserve items/ and archive/, recreate missing subdirectories
        ensure_dir(&work_dir.join("items"))?;
        ensure_dir(&work_dir.join("archive"))?;
        ensure_dir(&work_dir.join("templates"))?;
        write_gitignore(work_dir)?;

        // Only overwrite config if --name or --prefix explicitly provided
        // We detect this by checking if either was explicitly set
        // (prefix has a default of "CMT", so we check if name was provided
        // or if prefix differs from default)
        if args.name.is_some() || args.prefix != "CMT" {
            let name = resolve_name(args);
            Config::write_minimal(work_dir, &name, &args.prefix)?;
        }
    } else {
        // Fresh initialization
        std::fs::create_dir_all(work_dir)?;
        ensure_dir(&work_dir.join("items"))?;
        ensure_dir(&work_dir.join("archive"))?;
        ensure_dir(&work_dir.join("templates"))?;
        write_gitignore(work_dir)?;

        let name = resolve_name(args);
        Config::write_minimal(work_dir, &name, &args.prefix)?;
    }

    // Generate discovery files (non-fatal if they fail)
    if let Ok(config) = Config::load(work_dir) {
        let _ = crate::discovery::generate_about_file(work_dir, &config);
        let _ = crate::discovery::generate_conventions_file(work_dir, &config);
    }

    let abs_work_dir = std::fs::canonicalize(work_dir)?;

    // Auto-register in global project registry (non-fatal)
    let name = resolve_name(args);
    if let Ok(mut registry) = crate::registry::Registry::load() {
        let entry = crate::registry::ProjectEntry {
            name: name.clone(),
            path: abs_work_dir.clone(),
            prefix: args.prefix.clone(),
        };
        let is_new = registry.register(entry);
        if registry.save().is_ok() && is_new && !quiet && !json {
            eprintln!(
                "Registered project in {}",
                crate::registry::Registry::registry_path().display()
            );
        }
    }

    if json {
        let output = serde_json::json!({
            "work_dir": abs_work_dir.to_string_lossy(),
            "prefix": args.prefix,
            "name": name,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!("Initialized catchmytask in .cmt/ with prefix {}", args.prefix);
    }

    Ok(())
}

fn resolve_name(args: &InitArgs) -> String {
    if let Some(ref name) = args.name {
        name.clone()
    } else {
        std::env::current_dir()
            .ok()
            .and_then(|p| p.file_name().map(|n| n.to_string_lossy().to_string()))
            .unwrap_or_else(|| "my-project".to_string())
    }
}

fn ensure_dir(path: &Path) -> Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }
    Ok(())
}

fn write_gitignore(work_dir: &Path) -> Result<()> {
    let content = "config.local.yml\n.index.db\n.index.db-wal\n.index.db-shm\n";
    crate::storage::atomic_write(&work_dir.join(".gitignore"), content)?;
    Ok(())
}

fn init_global(json: bool, quiet: bool) -> Result<()> {
    let config_dir = resolve_global_config_dir();
    std::fs::create_dir_all(&config_dir)?;
    let config_path = config_dir.join("config.yml");

    if config_path.exists() {
        return Err(WorkError::General(
            "Global config already exists. Edit it directly or remove it first.".to_string(),
        ));
    }

    let content = "\
# Global catchmytask configuration
# These defaults apply to all projects.

defaults:
  priority: none
  type: task

git:
  auto_commit: false
";
    crate::storage::atomic_write(&config_path, content)?;

    if json {
        println!(
            "{}",
            serde_json::json!({ "global_config": config_path.to_string_lossy() })
        );
    } else if !quiet {
        eprintln!("Created global config at {}", config_path.display());
    }
    Ok(())
}

use std::path::Path;

use crate::cli::SlugifyArgs;
use cmt_core::error::Result;
use cmt_core::slug;
use cmt_core::storage;

pub fn execute(args: &SlugifyArgs, work_dir: &Path, json: bool, _quiet: bool) -> Result<()> {
    let files = storage::scan_item_files(work_dir)?;
    let mut renames: Vec<(String, String, String)> = Vec::new(); // (id, old_name, new_name)

    for file in &files {
        // Read and parse the item to get its title
        let content = std::fs::read_to_string(file)?;
        let (item, _body) = match cmt_core::parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        let id_str = format!("{}-{}", item.id.prefix, item.id.number);
        let item_slug = slug::slugify(&item.title, 50);
        let slugged_name = format!("{}-{}", id_str, item_slug);

        // Determine what the current name is
        let is_complex = file.file_name().is_some_and(|n| n == "item.md");

        if is_complex {
            // Directory-based item: check parent dir name
            let dir = file.parent().unwrap();
            let dir_name = dir.file_name().unwrap().to_string_lossy();
            if dir_name.as_ref() == slugged_name {
                continue; // Already slugified
            }
            // Check it starts with the ID (avoid touching unrelated files)
            if !dir_name.starts_with(&id_str) {
                continue;
            }
            let new_dir = dir.parent().unwrap().join(&slugged_name);
            renames.push((id_str, dir.to_string_lossy().to_string(), new_dir.to_string_lossy().to_string()));
        } else {
            // Simple file: check stem
            let stem = file.file_stem().unwrap().to_string_lossy();
            let expected = format!("{}.md", slugged_name);
            let current_name = file.file_name().unwrap().to_string_lossy();
            if current_name.as_ref() == expected {
                continue; // Already slugified
            }
            if !stem.starts_with(&id_str) {
                continue;
            }
            let new_path = file.parent().unwrap().join(&expected);
            renames.push((id_str, file.to_string_lossy().to_string(), new_path.to_string_lossy().to_string()));
        }
    }

    if renames.is_empty() {
        if json {
            println!("{{\"renamed\":0,\"items\":[]}}");
        } else {
            println!("All items already have slugified filenames.");
        }
        return Ok(());
    }

    if json {
        let items: Vec<serde_json::Value> = renames.iter().map(|(id, old, new)| {
            serde_json::json!({"id": id, "old": old, "new": new})
        }).collect();
        if args.dry_run {
            println!("{}", serde_json::to_string_pretty(&serde_json::json!({
                "dry_run": true,
                "would_rename": renames.len(),
                "items": items,
            }))?);
        } else {
            for (_, old, new) in &renames {
                std::fs::rename(old, new)?;
            }
            println!("{}", serde_json::to_string_pretty(&serde_json::json!({
                "renamed": renames.len(),
                "items": items,
            }))?);
        }
    } else if args.dry_run {
        println!("Would rename {} items:\n", renames.len());
        for (id, old, new) in &renames {
            let old_name = Path::new(old).file_name().unwrap().to_string_lossy();
            let new_name = Path::new(new).file_name().unwrap().to_string_lossy();
            println!("  {} {} -> {}", id, old_name, new_name);
        }
        println!("\nRun without --dry-run to apply.");
    } else {
        for (id, old, new) in &renames {
            std::fs::rename(old, new)?;
            let new_name = Path::new(new).file_name().unwrap().to_string_lossy();
            println!("  {} -> {}", id, new_name);
        }
        println!("\nRenamed {} items. Run `cmt reindex --force` to update the index.", renames.len());
    }

    Ok(())
}

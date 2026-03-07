use std::path::Path;

use crate::cli::ShowArgs;
use cmt_core::config::Config;
use cmt_core::error::Result;
use cmt_core::format;
use cmt_core::storage;

pub fn execute(args: &ShowArgs, work_dir: &Path, json: bool) -> Result<()> {
    let config = Config::load(work_dir)?;
    let (item, body, path) = storage::read_item(work_dir, &args.id)?;

    if args.raw {
        let content = std::fs::read_to_string(&path)?;
        print!("{}", content);
        return Ok(());
    }

    if json {
        let mut json_val = format::item_to_json(&item, Some(&body));
        if let Some(obj) = json_val.as_object_mut() {
            let rel_path = path.strip_prefix(work_dir.parent().unwrap_or(work_dir))
                .unwrap_or(&path)
                .to_string_lossy()
                .to_string();
            obj.insert("file_path".to_string(), serde_json::Value::String(rel_path));

            // Checklist summary
            let (total, checked) = count_checklist(&body);
            if total > 0 {
                obj.insert("checklist".to_string(), serde_json::json!({
                    "total": total,
                    "checked": checked,
                }));
            }
        }
        println!("{}", serde_json::to_string_pretty(&json_val)?);
        return Ok(());
    }

    // Human-readable output
    let pad = config.id.pad_width;
    let id_display = item.id.display(pad);

    println!("--- {} {}", id_display, "-".repeat(50usize.saturating_sub(id_display.len() + 5)));
    println!("  Title:     {}", item.title);
    println!("  Status:    {}", item.status);
    if let Some(ref p) = item.priority {
        println!("  Priority:  {}", p);
    }
    if let Some(ref t) = item.r#type {
        println!("  Type:      {}", t);
    }
    if let Some(ref a) = item.assignee {
        println!("  Assignee:  {}", a.display());
    }
    println!("  Created:   {}", item.created_at);
    if let Some(ref d) = item.due {
        println!("  Due:       {}", d);
    }
    if !item.tags.is_empty() {
        println!("  Tags:      {}", item.tags.join(", "));
    }
    if let Some(ref p) = item.parent {
        println!("  Parent:    {}", p);
    }
    if !item.depends_on.is_empty() {
        println!("  Depends:   {}", item.depends_on.join(", "));
    }
    if let Some(ref s) = item.started_at {
        println!("  Started:   {}", s);
    }
    if let Some(ref c) = item.completed_at {
        println!("  Completed: {}", c);
    }
    if let Some(ref b) = item.blocked_reason {
        println!("  Blocked:   {}", b);
    }
    let rel_path = path.strip_prefix(work_dir.parent().unwrap_or(work_dir))
        .unwrap_or(&path)
        .to_string_lossy();
    println!("  File:      {}", rel_path);
    println!("{}", "-".repeat(55));

    if args.show_body() && !body.is_empty() {
        println!();
        print!("{}", body);
    }

    // Show children if requested
    if args.children {
        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
            let mut stmt = index.conn.prepare(
                "SELECT id, status, title FROM items WHERE parent = ?1 ORDER BY created_at"
            )?;
            let children: Vec<(String, String, String)> = stmt.query_map(
                [&item.id.raw],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )?.filter_map(|r| r.ok()).collect();

            if !children.is_empty() {
                println!("\nChildren:");
                for (id, status, title) in &children {
                    println!("  {} [{}] {}", id, status, title);
                }
            }
        }
    }

    Ok(())
}

fn count_checklist(body: &str) -> (u32, u32) {
    let mut total = 0u32;
    let mut checked = 0u32;
    for line in body.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("- [ ]") || trimmed.starts_with("- [x]") || trimmed.starts_with("- [X]") {
            total += 1;
            if trimmed.starts_with("- [x]") || trimmed.starts_with("- [X]") {
                checked += 1;
            }
        }
    }
    (total, checked)
}

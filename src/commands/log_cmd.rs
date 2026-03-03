use std::path::Path;

use crate::cli::LogArgs;
use crate::error::Result;
use crate::storage;
use crate::cli::OutputFormat;

pub fn execute(args: &LogArgs, work_dir: &Path, json: bool) -> Result<()> {
    // Verify item exists and get the canonical raw ID (e.g. CMT-1, not CMT-0001)
    let (item, _, _) = storage::read_item(work_dir, &args.id)?;
    let canonical_id = &item.id.raw;

    // Try events table first
    if let Ok(index) = crate::index::Index::open(work_dir) {
        let mut stmt = index.conn.prepare(
            "SELECT timestamp, actor, action, detail FROM events
             WHERE item_id = ?1
             ORDER BY timestamp DESC
             LIMIT ?2"
        )?;

        let events: Vec<EventRow> = stmt.query_map(
            rusqlite::params![canonical_id, args.limit],
            |row| {
                Ok(EventRow {
                    timestamp: row.get(0)?,
                    actor: row.get(1)?,
                    action: row.get(2)?,
                    detail: row.get(3)?,
                })
            },
        )?.filter_map(|r| r.ok()).collect();

        if !events.is_empty() {
            let use_json = json || matches!(args.format, OutputFormat::Json);

            if use_json {
                let json_events: Vec<serde_json::Value> = events.iter().map(|e| {
                    let mut obj = serde_json::json!({
                        "timestamp": e.timestamp,
                        "action": e.action,
                    });
                    if let (Some(ref a), Some(obj_map)) = (&e.actor, obj.as_object_mut()) {
                        obj_map.insert("actor".to_string(), serde_json::Value::String(a.clone()));
                    }
                    if let (Some(ref d), Some(obj_map)) = (&e.detail, obj.as_object_mut()) {
                        if let Ok(v) = serde_json::from_str::<serde_json::Value>(d) {
                            obj_map.insert("details".to_string(), v);
                        }
                    }
                    obj
                }).collect();
                println!("{}", serde_json::to_string_pretty(&json_events)?);
            } else {
                println!("{}: {}\n", item.id.raw, item.title);
                println!("{:<22} {:<16} ACTION", "DATE", "ACTOR");
                for e in &events {
                    let actor = e.actor.as_deref().unwrap_or("--");
                    let detail_str = e.detail.as_ref().and_then(|d| {
                        serde_json::from_str::<serde_json::Value>(d).ok()
                    }).map(|v| {
                        if let Some(from) = v.get("from") {
                            format!("{}: {} -> {}", e.action, from.as_str().unwrap_or(""), v.get("to").and_then(|t| t.as_str()).unwrap_or(""))
                        } else {
                            e.action.clone()
                        }
                    }).unwrap_or_else(|| e.action.clone());

                    let ts = if e.timestamp.len() >= 19 {
                        &e.timestamp[..19]
                    } else {
                        &e.timestamp
                    };
                    println!("{:<22} {:<16} {}", ts, actor, detail_str);
                }
            }
            return Ok(());
        }
    }

    // Fallback: git log (reuse canonical_id to avoid re-resolving)
    let (_, _, path) = storage::read_item(work_dir, canonical_id)?;
    let output = std::process::Command::new("git")
        .args(["log", "--follow", "--oneline", "-n", &args.limit.to_string(), "--"])
        .arg(&path)
        .current_dir(work_dir.parent().unwrap_or(work_dir))
        .output();

    match output {
        Ok(o) if o.status.success() => {
            let log = String::from_utf8_lossy(&o.stdout);
            if json {
                // Parse git log into JSON
                let entries: Vec<serde_json::Value> = log.lines().map(|line| {
                    serde_json::json!({"raw": line})
                }).collect();
                println!("{}", serde_json::to_string_pretty(&entries)?);
            } else {
                println!("{}: {}\n", item.id.raw, item.title);
                print!("{}", log);
            }
        }
        _ => {
            if json {
                println!("[]");
            } else {
                eprintln!("No history available for {}", canonical_id);
            }
        }
    }

    Ok(())
}

struct EventRow {
    timestamp: String,
    actor: Option<String>,
    action: String,
    detail: Option<String>,
}

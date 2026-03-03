use std::path::Path;

use crate::cli::SearchArgs;
use crate::error::Result;
use crate::cli::OutputFormat;

pub fn execute(args: &SearchArgs, work_dir: &Path, json_global: bool) -> Result<()> {
    let index = crate::index::Index::open(work_dir)?;
    crate::index::warn_on_err(index.incremental_sync(), "sync");

    // Build query
    let mut conditions = vec!["items_fts MATCH ?1".to_string()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(args.query.clone())];

    if !args.all {
        conditions.push("i.archived = 0".to_string());
    }

    if let Some(ref status) = args.status {
        conditions.push(format!("i.status = ?{}", params.len() + 1));
        params.push(Box::new(status.clone()));
    }

    if let Some(ref t) = args.r#type {
        conditions.push(format!("i.type = ?{}", params.len() + 1));
        params.push(Box::new(t.clone()));
    }

    let where_clause = conditions.join(" AND ");

    let sql = format!(
        "SELECT i.id, i.title, i.status, i.priority, rank,
                snippet(items_fts, -1, '**', '**', '...', 32) as snippet
         FROM items_fts
         JOIN items i ON i.id = items_fts.id
         WHERE {}
         ORDER BY rank
         LIMIT ?{}",
        where_clause,
        params.len() + 1
    );
    params.push(Box::new(args.limit));

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let mut stmt = match index.conn.prepare(&sql) {
        Ok(s) => s,
        Err(e) => {
            // FTS5 syntax errors give unhelpful messages; provide guidance
            let msg = e.to_string();
            if msg.contains("fts5") || msg.contains("syntax") {
                return Err(crate::error::WorkError::General(format!(
                    "Search query '{}' contains special characters that FTS5 cannot parse. \
                     Try quoting your search or removing special characters like +, -, *, :, (, ).",
                    args.query
                )));
            }
            return Err(e.into());
        }
    };

    let results: Vec<SearchResult> = stmt.query_map(param_refs.as_slice(), |row| {
        Ok(SearchResult {
            id: row.get(0)?,
            title: row.get(1)?,
            status: row.get(2)?,
            priority: row.get(3)?,
            score: row.get(4)?,
            snippet: row.get(5)?,
        })
    })?.filter_map(|r| r.ok()).collect();

    let use_json = json_global || matches!(args.format, OutputFormat::Json);

    if use_json {
        let json_results: Vec<serde_json::Value> = results.iter().map(|r| {
            let mut obj = serde_json::json!({
                "id": r.id,
                "title": r.title,
                "status": r.status,
                "score": r.score,
                "snippet": r.snippet,
            });
            if let (Some(ref p), Some(obj_map)) = (&r.priority, obj.as_object_mut()) {
                obj_map.insert("priority".to_string(), serde_json::Value::String(p.clone()));
            }
            obj
        }).collect();
        println!("{}", serde_json::to_string_pretty(&json_results)?);
    } else {
        match args.format {
            OutputFormat::Table => {
                if results.is_empty() {
                    eprintln!("0 results");
                    return Ok(());
                }
                // Header
                println!("{:<12} {:<10} {:<40} MATCH", "ID", "STATUS", "TITLE");
                for r in &results {
                    let title = truncate_str(&r.title, 38);
                    println!("{:<12} {:<10} {:<40} {}", r.id, r.status, title, r.snippet);
                }
                eprintln!("\n{} results", results.len());
            }
            OutputFormat::Simple => {
                for r in &results {
                    println!("{}\t{}\t{}", r.id, r.title, r.snippet);
                }
            }
            _ => {}
        }
    }

    Ok(())
}

struct SearchResult {
    id: String,
    title: String,
    status: String,
    priority: Option<String>,
    score: f64,
    snippet: String,
}

/// Truncate a string to at most `max_chars` characters, appending "..." if truncated.
/// Safe for multi-byte UTF-8 strings (never slices mid-character).
fn truncate_str(s: &str, max_chars: usize) -> String {
    if s.chars().count() <= max_chars {
        s.to_string()
    } else {
        let truncated: String = s.chars().take(max_chars.saturating_sub(3)).collect();
        format!("{}...", truncated)
    }
}

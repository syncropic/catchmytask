use std::sync::atomic::{AtomicBool, Ordering};

use owo_colors::OwoColorize;

use crate::model::WorkItem;

/// Global color toggle.
static COLOR_ENABLED: AtomicBool = AtomicBool::new(false);

/// Set whether color output is enabled.
pub fn set_color_enabled(enabled: bool) {
    COLOR_ENABLED.store(enabled, Ordering::Relaxed);
}

fn color_enabled() -> bool {
    COLOR_ENABLED.load(Ordering::Relaxed)
}

/// Colorize a priority string.
fn colorize_priority(s: &str) -> String {
    if !color_enabled() {
        return s.to_string();
    }
    match s {
        "critical" => s.red().bold().to_string(),
        "high" => s.yellow().to_string(),
        "medium" => s.blue().to_string(),
        "low" => s.dimmed().to_string(),
        _ => s.to_string(),
    }
}

/// Colorize a status string.
fn colorize_status(s: &str) -> String {
    if !color_enabled() {
        return s.to_string();
    }
    match s {
        "done" => s.green().to_string(),
        "blocked" => s.red().to_string(),
        "active" => s.cyan().to_string(),
        "cancelled" => s.dimmed().to_string(),
        _ => s.to_string(),
    }
}

/// Colorize a table header.
fn colorize_header(s: &str) -> String {
    if !color_enabled() {
        return s.to_string();
    }
    s.bold().to_string()
}

/// Format a list of items as a table string.
pub fn format_table(items: &[WorkItem], fields: &[&str], pad_width: u32) -> String {
    if items.is_empty() {
        return String::new();
    }

    // Calculate column widths (use plain values for width calculation)
    let mut columns: Vec<(String, Vec<String>, Vec<String>)> = Vec::new();

    for &field in fields {
        let header = field_header(field);
        let plain_values: Vec<String> = items.iter().map(|item| field_value(item, field, pad_width)).collect();
        let display_values: Vec<String> = plain_values.iter().map(|v| {
            match field {
                "priority" => colorize_priority(v),
                "status" => colorize_status(v),
                _ => v.clone(),
            }
        }).collect();
        columns.push((header, plain_values, display_values));
    }

    // Calculate max width per column (from plain, non-colored values)
    let widths: Vec<usize> = columns.iter().map(|(header, plain_values, _)| {
        let max_val = plain_values.iter().map(|v| v.len()).max().unwrap_or(0);
        header.len().max(max_val)
    }).collect();

    let mut output = String::new();

    // Header row
    let header_line: Vec<String> = columns.iter().zip(&widths).map(|((header, _, _), &w)| {
        let padded = format!("{:<width$}", header, width = w);
        colorize_header(&padded)
    }).collect();
    output.push_str(&header_line.join("  "));
    output.push('\n');

    // Data rows
    for i in 0..items.len() {
        let row: Vec<String> = columns.iter().zip(&widths).map(|((_, plain_values, display_values), &w)| {
            let plain_len = plain_values[i].len();
            let display_val = &display_values[i];
            // Pad based on plain text width, but use colored display value
            let padding = w.saturating_sub(plain_len);
            format!("{}{}", display_val, " ".repeat(padding))
        }).collect();
        output.push_str(&row.join("  "));
        output.push('\n');
    }

    output
}

/// Format items as simple tab-separated output.
pub fn format_simple(items: &[WorkItem], pad_width: u32) -> String {
    items.iter().map(|item| {
        format!("{}\t{}\t{}",
            item.id.display(pad_width),
            colorize_status(&item.status),
            item.title,
        )
    }).collect::<Vec<_>>().join("\n")
}

/// Format items as JSON array.
pub fn format_json(items: &[WorkItem]) -> crate::error::Result<String> {
    let values: Vec<serde_json::Value> = items.iter().map(|item| {
        item_to_json(item, None)
    }).collect();
    Ok(serde_json::to_string_pretty(&values)?)
}

/// Format items as CSV.
pub fn format_csv(items: &[WorkItem], fields: &[&str], pad_width: u32) -> String {
    let mut output = String::new();

    // Header
    output.push_str(&fields.join(","));
    output.push('\n');

    // Rows
    for item in items {
        let values: Vec<String> = fields.iter().map(|&f| {
            csv_escape(&field_value(item, f, pad_width))
        }).collect();
        output.push_str(&values.join(","));
        output.push('\n');
    }

    output
}

/// Convert a work item to JSON, optionally including body.
pub fn item_to_json(item: &WorkItem, body: Option<&str>) -> serde_json::Value {
    let mut map = serde_json::Map::new();
    map.insert("id".to_string(), serde_json::Value::String(item.id.raw.clone()));
    map.insert("title".to_string(), serde_json::Value::String(item.title.clone()));
    map.insert("status".to_string(), serde_json::Value::String(item.status.clone()));
    map.insert("created_at".to_string(), serde_json::Value::String(item.created_at.clone()));

    if let Some(ref t) = item.r#type {
        map.insert("type".to_string(), serde_json::Value::String(t.clone()));
    }
    if let Some(ref p) = item.priority {
        map.insert("priority".to_string(), serde_json::Value::String(p.clone()));
    }
    if let Some(ref a) = item.assignee {
        match a {
            crate::model::Assignee::Single(s) => {
                map.insert("assignee".to_string(), serde_json::Value::String(s.clone()));
            }
            crate::model::Assignee::Multiple(v) => {
                map.insert("assignee".to_string(), serde_json::json!(v));
            }
        }
    }
    if let Some(ref p) = item.parent {
        map.insert("parent".to_string(), serde_json::Value::String(p.clone()));
    }
    if !item.depends_on.is_empty() {
        map.insert("depends_on".to_string(), serde_json::json!(item.depends_on));
    }
    if !item.tags.is_empty() {
        map.insert("tags".to_string(), serde_json::json!(item.tags));
    }
    if let Some(ref d) = item.due {
        map.insert("due".to_string(), serde_json::Value::String(d.clone()));
    }
    if let Some(ref s) = item.started_at {
        map.insert("started_at".to_string(), serde_json::Value::String(s.clone()));
    }
    if let Some(ref c) = item.completed_at {
        map.insert("completed_at".to_string(), serde_json::Value::String(c.clone()));
    }
    if let Some(ref u) = item.updated_at {
        map.insert("updated_at".to_string(), serde_json::Value::String(u.clone()));
    }
    if let Some(ref b) = item.blocked_reason {
        map.insert("blocked_reason".to_string(), serde_json::Value::String(b.clone()));
    }
    if let Some(b) = body {
        map.insert("body".to_string(), serde_json::Value::String(b.to_string()));
    }

    serde_json::Value::Object(map)
}

fn field_header(field: &str) -> String {
    match field {
        "id" => "ID".to_string(),
        "title" => "TITLE".to_string(),
        "status" => "STATUS".to_string(),
        "priority" => "PRI".to_string(),
        "assignee" => "ASSIGNEE".to_string(),
        "type" => "TYPE".to_string(),
        "tags" => "TAGS".to_string(),
        "due" => "DUE".to_string(),
        "created_at" => "CREATED".to_string(),
        "updated_at" => "UPDATED".to_string(),
        "parent" => "PARENT".to_string(),
        other => other.to_uppercase(),
    }
}

fn field_value(item: &WorkItem, field: &str, pad_width: u32) -> String {
    match field {
        "id" => item.id.display(pad_width),
        "title" => item.title.clone(),
        "status" => item.status.clone(),
        "priority" => item.priority.clone().unwrap_or_else(|| "--".to_string()),
        "assignee" => item.assignee.as_ref().map(|a| a.display()).unwrap_or_else(|| "--".to_string()),
        "type" => item.r#type.clone().unwrap_or_else(|| "--".to_string()),
        "tags" => if item.tags.is_empty() { "--".to_string() } else { item.tags.join(", ") },
        "due" => item.due.clone().unwrap_or_else(|| "--".to_string()),
        "created_at" => item.created_at.clone(),
        "updated_at" => item.updated_at.clone().unwrap_or_else(|| "--".to_string()),
        "parent" => item.parent.clone().unwrap_or_else(|| "--".to_string()),
        _ => "--".to_string(),
    }
}

fn csv_escape(value: &str) -> String {
    if value.contains(',') || value.contains('"') || value.contains('\n') {
        format!("\"{}\"", value.replace('"', "\"\""))
    } else {
        value.to_string()
    }
}

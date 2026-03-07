use std::path::Path;

use crate::cli::{ViewArgs, ViewCommand, SaveViewArgs};
use cmt_core::error::Result;
use cmt_core::views::{self, SavedView, ViewFilters};

pub fn execute(args: &ViewArgs, work_dir: &Path, json: bool, quiet: bool) -> Result<()> {
    match &args.command {
        ViewCommand::List => cmd_list(work_dir, json),
        ViewCommand::Save(save_args) => cmd_save(save_args, work_dir, json, quiet),
        ViewCommand::Show { name } => cmd_show(name, work_dir, json, quiet),
        ViewCommand::Delete { name } => cmd_delete(name, work_dir, json, quiet),
    }
}

fn cmd_list(work_dir: &Path, json: bool) -> Result<()> {
    let views_list = views::list_views(work_dir)?;

    if json {
        println!("{}", serde_json::to_string_pretty(&views_list)?);
    } else if views_list.is_empty() {
        eprintln!("No saved views. Create one with: cmt view save <name> --status active");
    } else {
        for v in &views_list {
            let desc = v
                .description
                .as_deref()
                .map(|d| format!(" -- {}", d))
                .unwrap_or_default();
            let filters = summarize_filters(&v.filters);
            println!("  {}{}  [{}]", v.name, desc, filters);
        }
        eprintln!("\n{} view(s)", views_list.len());
    }
    Ok(())
}

fn cmd_save(args: &SaveViewArgs, work_dir: &Path, json: bool, quiet: bool) -> Result<()> {
    let view = SavedView {
        name: args.name.clone(),
        description: args.description.clone(),
        filters: ViewFilters {
            status: args.status.clone(),
            r#type: args.r#type.clone(),
            priority: args.priority.clone(),
            assignee: args.assignee.clone(),
            tag: args.tag.clone(),
            sort: args.sort.clone(),
            limit: args.limit,
        },
    };

    views::save_view(work_dir, &view)?;

    if json {
        println!("{}", serde_json::to_string_pretty(&view)?);
    } else if !quiet {
        eprintln!("Saved view '{}'", args.name);
    }
    Ok(())
}

fn cmd_show(name: &str, work_dir: &Path, json: bool, quiet: bool) -> Result<()> {
    let view = views::load_view(work_dir, name)?;

    // Build ListArgs from the view filters and execute list
    let list_args = crate::cli::ListArgs {
        status: view.filters.status.clone(),
        r#type: view.filters.r#type.clone(),
        priority: view.filters.priority.as_deref().and_then(|p| {
            match p {
                "critical" => Some(crate::cli::PriorityValue::Critical),
                "high" => Some(crate::cli::PriorityValue::High),
                "medium" => Some(crate::cli::PriorityValue::Medium),
                "low" => Some(crate::cli::PriorityValue::Low),
                "none" => Some(crate::cli::PriorityValue::None),
                _ => None,
            }
        }),
        assignee: view.filters.assignee.clone(),
        tag: view.filters.tag.as_ref().map(|t| vec![t.clone()]).unwrap_or_default(),
        parent: None,
        no_parent: false,
        overdue: false,
        due_before: None,
        blocked: false,
        tag_ns: None,
        id: None,
        sort: view.filters.sort.clone().unwrap_or_else(|| "priority".to_string()),
        reverse: false,
        format: crate::cli::OutputFormat::Table,
        fields: "id,title,status,priority".to_string(),
        all: false,
        limit: view.filters.limit,
        view: None,
    };

    if !quiet && !json {
        eprintln!("View: {}", name);
        if let Some(ref desc) = view.description {
            eprintln!("  {}", desc);
        }
        eprintln!();
    }

    super::list::execute(&list_args, work_dir, json, quiet)
}

fn cmd_delete(name: &str, work_dir: &Path, json: bool, quiet: bool) -> Result<()> {
    views::delete_view(work_dir, name)?;

    if json {
        println!("{}", serde_json::json!({ "deleted": name }));
    } else if !quiet {
        eprintln!("Deleted view '{}'", name);
    }
    Ok(())
}

fn summarize_filters(f: &ViewFilters) -> String {
    let mut parts = Vec::new();
    if let Some(ref s) = f.status {
        parts.push(format!("status={}", s));
    }
    if let Some(ref t) = f.r#type {
        parts.push(format!("type={}", t));
    }
    if let Some(ref p) = f.priority {
        parts.push(format!("priority={}", p));
    }
    if let Some(ref a) = f.assignee {
        parts.push(format!("assignee={}", a));
    }
    if let Some(ref t) = f.tag {
        parts.push(format!("tag={}", t));
    }
    if let Some(ref s) = f.sort {
        parts.push(format!("sort={}", s));
    }
    if let Some(l) = f.limit {
        parts.push(format!("limit={}", l));
    }
    if parts.is_empty() {
        "no filters".to_string()
    } else {
        parts.join(", ")
    }
}

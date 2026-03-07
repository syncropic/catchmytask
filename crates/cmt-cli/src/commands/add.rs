use std::path::Path;

use crate::cli::AddArgs;
use cmt_core::config::Config;
use cmt_core::error::{Result, WorkError};
use cmt_core::format;
use cmt_core::index::Index;
use cmt_core::model::{Assignee, WorkItem, WorkItemId};
use cmt_core::slug;
use cmt_core::storage;

pub fn execute(
    args: &AddArgs,
    work_dir: &Path,
    json: bool,
    _quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let config = Config::load(work_dir)?;

    // Resolve type
    let item_type = args.r#type.as_deref().or(Some(config.defaults.r#type.as_str()));

    // Resolve prefix
    let prefix = config.resolve_prefix(item_type);

    // Validate title
    if args.title.is_empty() {
        return Err(WorkError::ValidationError(
            "Title is required and must not be empty".to_string(),
        ));
    }

    // Resolve initial status
    let status = args.status.as_deref().unwrap_or(&config.defaults.status);

    // Validate initial status is an initial state
    let machine = config.resolve_state_machine(item_type);
    if let Some(state_config) = machine.states.get(status) {
        if !state_config.initial {
            return Err(WorkError::ValidationError(format!(
                "Status '{}' is not an initial state. Initial states: {}",
                status,
                machine.states.iter()
                    .filter(|(_, s)| s.initial)
                    .map(|(name, _)| name.as_str())
                    .collect::<Vec<_>>()
                    .join(", ")
            )));
        }
    }

    // Get next ID
    let next_number = match Index::open(work_dir) {
        Ok(index) => index.next_id(prefix)?,
        Err(_) => storage::next_id_from_files(work_dir, prefix)?,
    };

    let id_str = format!("{}-{}", prefix, next_number);
    let id = WorkItemId::parse(&id_str)?;

    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);

    // Resolve priority
    let priority = args.priority.as_ref()
        .map(|p| p.to_string())
        .or_else(|| Some(config.defaults.priority.clone()));

    // Resolve assignee
    let assignee = if !args.assignee.is_empty() {
        if args.assignee.len() == 1 {
            Some(Assignee::Single(args.assignee[0].clone()))
        } else {
            Some(Assignee::Multiple(args.assignee.clone()))
        }
    } else {
        config.defaults.assignee.as_ref().map(|a| Assignee::Single(a.clone()))
    };

    // Load template body if specified
    let mut body = String::new();
    if let Some(ref template_name) = args.template {
        if template_name.contains('/') || template_name.contains('\\') || template_name.contains("..") {
            return Err(WorkError::ValidationError(
                "Template name must not contain path separators or '..'".to_string(),
            ));
        }
        let template_path = work_dir.join("templates").join(format!("{}.md", template_name));
        if template_path.exists() {
            let content = std::fs::read_to_string(&template_path)?;
            if let Ok((_, template_body)) = cmt_core::parser::parse_file(&content) {
                body = template_body;
            } else {
                // Template without frontmatter - use as body directly
                body = content;
            }
        } else {
            return Err(WorkError::General(format!(
                "Template '{}' not found at {}",
                template_name,
                template_path.display()
            )));
        }
    }

    // CLI body overrides template
    if let Some(ref b) = args.body {
        body = b.clone();
    }

    let item = WorkItem {
        id,
        title: args.title.clone(),
        status: status.to_string(),
        created_at: now.clone(),
        r#type: item_type.map(|s| s.to_string()),
        priority,
        assignee,
        parent: args.parent.clone(),
        depends_on: args.depends_on.clone(),
        tags: args.tag.clone(),
        due: args.due.clone(),
        started_at: None,
        completed_at: None,
        updated_at: Some(now),
        blocked_reason: None,
        related: Vec::new(),
        extra: std::collections::BTreeMap::new(),
    };

    // Validate the constructed item
    item.validate()?;

    // Generate slug for filename
    let item_slug = match &args.slug {
        Some(s) => {
            slug::validate_slug(s).map_err(WorkError::ValidationError)?;
            s.clone()
        }
        None => slug::slugify(&args.title, 50),
    };
    let slugged_name = format!("{}-{}", id_str, item_slug);

    // Write file
    let file_path = if args.complex {
        let dir = work_dir.join("items").join(&slugged_name);
        std::fs::create_dir_all(&dir)?;
        std::fs::create_dir_all(dir.join("evidence"))?;
        std::fs::create_dir_all(dir.join("queries"))?;
        std::fs::create_dir_all(dir.join("handover"))?;
        dir.join("item.md")
    } else {
        work_dir.join("items").join(format!("{}.md", slugged_name))
    };

    storage::write_item(&file_path, &item, &body)?;

    // Update index
    if let Ok(index) = Index::open(work_dir) {
        let rel_path = file_path.to_string_lossy().to_string();
        cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &rel_path, false), "upsert");
        cmt_core::index::warn_on_err(index.record_event(
            &id_str,
            actor,
            "created",
            Some(&serde_json::json!({"title": item.title})),
        ), "event");
    }

    // Git auto-commit
    let file_str = file_path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(&config, work_dir, &[&file_str], &format!("add {} - {}", id_str, item.title))?;

    // Output
    if json {
        let mut json_val = format::item_to_json(&item, None);
        if let Some(obj) = json_val.as_object_mut() {
            obj.insert(
                "file_path".to_string(),
                serde_json::Value::String(file_path.strip_prefix(work_dir.parent().unwrap_or(work_dir))
                    .unwrap_or(&file_path)
                    .to_string_lossy()
                    .to_string()),
            );
        }
        println!("{}", serde_json::to_string_pretty(&json_val)?);
    } else {
        println!("{}", item.id.display(config.id.pad_width));
    }

    // Open editor if requested
    if args.edit {
        let editor = std::env::var("VISUAL")
            .or_else(|_| std::env::var("EDITOR"))
            .unwrap_or_else(|_| "vi".to_string());
        std::process::Command::new(&editor)
            .arg(&file_path)
            .status()?;
    }

    Ok(())
}

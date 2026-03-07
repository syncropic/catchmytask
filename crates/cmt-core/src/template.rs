use std::collections::HashMap;
use std::path::Path;

use crate::error::{Result, WorkError};

/// Parsed template: optional frontmatter defaults and a body.
#[derive(Debug, Clone, Default)]
pub struct TemplateDefaults {
    pub r#type: Option<String>,
    pub priority: Option<String>,
    pub tags: Vec<String>,
    pub assignee: Option<String>,
    pub status: Option<String>,
    pub parent: Option<String>,
    pub due: Option<String>,
}

/// A parsed template with frontmatter defaults and body content.
#[derive(Debug, Clone)]
pub struct ParsedTemplate {
    pub defaults: TemplateDefaults,
    pub body: String,
}

/// Parse a template file into defaults and body.
///
/// Templates use the same `---` YAML frontmatter format as work items,
/// but only a subset of fields are extracted as defaults.
/// Fields like `id`, `title`, `status`, `created_at` are ignored
/// since they are set by the system.
pub fn parse_template(content: &str) -> Result<ParsedTemplate> {
    // Strip UTF-8 BOM if present
    let content = content.strip_prefix('\u{feff}').unwrap_or(content);
    let content = content.replace("\r\n", "\n");

    if !content.starts_with("---\n") {
        // No frontmatter — entire content is the body
        return Ok(ParsedTemplate {
            defaults: TemplateDefaults::default(),
            body: content.to_string(),
        });
    }

    let rest = &content[4..]; // skip "---\n"

    // Handle empty frontmatter: "---\n---\n..."
    let (yaml_str, body) = if let Some(stripped) = rest.strip_prefix("---\n") {
        ("", stripped.to_string())
    } else if rest == "---" {
        ("", String::new())
    } else {
        let end_pos = rest
            .find("\n---\n")
            .or_else(|| {
                if rest.ends_with("\n---") {
                    Some(rest.len() - 3)
                } else {
                    None
                }
            });

        match end_pos {
            Some(pos) => {
                let yaml = &rest[..pos];
                let after = &rest[pos + 1..];
                let body = if let Some(stripped) = after.strip_prefix("---\n") {
                    stripped
                } else if after == "---" {
                    ""
                } else {
                    after
                };
                (yaml, body.to_string())
            }
            None => {
                return Err(WorkError::ValidationError(
                    "Missing closing '---' delimiter in template frontmatter".to_string(),
                ));
            }
        }
    };

    // Parse YAML into a generic map
    let yaml_map: HashMap<String, serde_yml::Value> =
        serde_yml::from_str(yaml_str).unwrap_or_default();

    let mut defaults = TemplateDefaults::default();

    if let Some(v) = yaml_map.get("type") {
        defaults.r#type = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("priority") {
        defaults.priority = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("assignee") {
        defaults.assignee = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("status") {
        defaults.status = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("parent") {
        defaults.parent = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("due") {
        defaults.due = v.as_str().map(|s| s.to_string());
    }
    if let Some(v) = yaml_map.get("tags") {
        if let Some(seq) = v.as_sequence() {
            defaults.tags = seq
                .iter()
                .filter_map(|item| item.as_str().map(|s| s.to_string()))
                .collect();
        }
    }

    Ok(ParsedTemplate { defaults, body })
}

/// Perform variable substitution on template body.
///
/// Supported variables:
/// - `{{date}}` — current date in YYYY-MM-DD format
/// - `{{actor}}` — actor identifier (or "unknown" if not set)
/// - `{{id}}` — work item ID (e.g., CMT-0001)
pub fn substitute_variables(body: &str, vars: &HashMap<String, String>) -> String {
    let mut result = body.to_string();
    for (key, value) in vars {
        let placeholder = format!("{{{{{}}}}}", key);
        result = result.replace(&placeholder, value);
    }
    result
}

/// Load and parse a template from the templates directory.
pub fn load_template(work_dir: &Path, template_name: &str) -> Result<ParsedTemplate> {
    if template_name.contains('/') || template_name.contains('\\') || template_name.contains("..") {
        return Err(WorkError::ValidationError(
            "Template name must not contain path separators or '..'".to_string(),
        ));
    }

    let template_path = work_dir.join("templates").join(format!("{}.md", template_name));
    if !template_path.exists() {
        return Err(WorkError::General(format!(
            "Template '{}' not found at {}",
            template_name,
            template_path.display()
        )));
    }

    let content = std::fs::read_to_string(&template_path)?;
    parse_template(&content)
}

/// List available template names in the templates directory.
pub fn list_templates(work_dir: &Path) -> Vec<String> {
    let templates_dir = work_dir.join("templates");
    if !templates_dir.is_dir() {
        return Vec::new();
    }

    let mut names = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&templates_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                names.push(name.trim_end_matches(".md").to_string());
            }
        }
    }
    names.sort();
    names
}

/// Content for the default bug template.
pub const DEFAULT_BUG_TEMPLATE: &str = r#"---
type: bug
priority: high
tags: [bug]
---

## Description


## Steps to Reproduce
1.

## Expected Behavior


## Actual Behavior


## Environment
- OS:
- Version:
"#;

/// Content for the default feature template.
pub const DEFAULT_FEATURE_TEMPLATE: &str = r#"---
type: feature
priority: medium
tags: [feature]
---

## Description


## Motivation


## Acceptance Criteria
- [ ]

## Notes

"#;

/// Content for the default task template.
pub const DEFAULT_TASK_TEMPLATE: &str = r#"---
type: task
priority: none
tags: []
---

## Description


## Acceptance Criteria
- [ ]

## Notes

"#;

/// Write the default templates to the templates directory.
/// Does not overwrite existing templates.
pub fn write_default_templates(work_dir: &Path) -> Result<()> {
    let templates_dir = work_dir.join("templates");
    std::fs::create_dir_all(&templates_dir)?;

    let defaults = [
        ("bug.md", DEFAULT_BUG_TEMPLATE),
        ("feature.md", DEFAULT_FEATURE_TEMPLATE),
        ("task.md", DEFAULT_TASK_TEMPLATE),
    ];

    for (name, content) in &defaults {
        let path = templates_dir.join(name);
        if !path.exists() {
            crate::storage::atomic_write(&path, content)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_template_with_frontmatter() {
        let content = "---\ntype: bug\npriority: high\ntags: [bug, critical]\n---\n\n## Description\n\n## Steps\n";
        let parsed = parse_template(content).unwrap();
        assert_eq!(parsed.defaults.r#type.as_deref(), Some("bug"));
        assert_eq!(parsed.defaults.priority.as_deref(), Some("high"));
        assert_eq!(parsed.defaults.tags, vec!["bug", "critical"]);
        assert!(parsed.body.contains("## Description"));
        assert!(parsed.body.contains("## Steps"));
    }

    #[test]
    fn test_parse_template_without_frontmatter() {
        let content = "## Just a body\n\nNo frontmatter here.\n";
        let parsed = parse_template(content).unwrap();
        assert!(parsed.defaults.r#type.is_none());
        assert!(parsed.defaults.priority.is_none());
        assert!(parsed.defaults.tags.is_empty());
        assert_eq!(parsed.body, content);
    }

    #[test]
    fn test_parse_template_all_defaults() {
        let content = "---\ntype: feature\npriority: medium\nassignee: alice\nstatus: active\nparent: CMT-1\ndue: '2026-04-01'\ntags: [frontend]\n---\nBody\n";
        let parsed = parse_template(content).unwrap();
        assert_eq!(parsed.defaults.r#type.as_deref(), Some("feature"));
        assert_eq!(parsed.defaults.priority.as_deref(), Some("medium"));
        assert_eq!(parsed.defaults.assignee.as_deref(), Some("alice"));
        assert_eq!(parsed.defaults.status.as_deref(), Some("active"));
        assert_eq!(parsed.defaults.parent.as_deref(), Some("CMT-1"));
        assert_eq!(parsed.defaults.due.as_deref(), Some("2026-04-01"));
        assert_eq!(parsed.defaults.tags, vec!["frontend"]);
    }

    #[test]
    fn test_parse_template_empty_frontmatter() {
        let content = "---\n---\nBody only\n";
        let parsed = parse_template(content).unwrap();
        assert!(parsed.defaults.r#type.is_none());
        assert_eq!(parsed.body, "Body only\n");
    }

    #[test]
    fn test_substitute_variables() {
        let body = "Created on {{date}} by {{actor}} for item {{id}}.";
        let mut vars = HashMap::new();
        vars.insert("date".to_string(), "2026-03-06".to_string());
        vars.insert("actor".to_string(), "alice".to_string());
        vars.insert("id".to_string(), "CMT-0042".to_string());

        let result = substitute_variables(body, &vars);
        assert_eq!(result, "Created on 2026-03-06 by alice for item CMT-0042.");
    }

    #[test]
    fn test_substitute_variables_no_match() {
        let body = "No variables here.";
        let vars = HashMap::new();
        let result = substitute_variables(body, &vars);
        assert_eq!(result, "No variables here.");
    }

    #[test]
    fn test_substitute_variables_multiple_occurrences() {
        let body = "{{date}} is today. Again: {{date}}";
        let mut vars = HashMap::new();
        vars.insert("date".to_string(), "2026-03-06".to_string());
        let result = substitute_variables(body, &vars);
        assert_eq!(result, "2026-03-06 is today. Again: 2026-03-06");
    }

    #[test]
    fn test_parse_default_bug_template() {
        let parsed = parse_template(DEFAULT_BUG_TEMPLATE).unwrap();
        assert_eq!(parsed.defaults.r#type.as_deref(), Some("bug"));
        assert_eq!(parsed.defaults.priority.as_deref(), Some("high"));
        assert_eq!(parsed.defaults.tags, vec!["bug"]);
        assert!(parsed.body.contains("## Steps to Reproduce"));
    }

    #[test]
    fn test_parse_default_feature_template() {
        let parsed = parse_template(DEFAULT_FEATURE_TEMPLATE).unwrap();
        assert_eq!(parsed.defaults.r#type.as_deref(), Some("feature"));
        assert_eq!(parsed.defaults.priority.as_deref(), Some("medium"));
        assert_eq!(parsed.defaults.tags, vec!["feature"]);
        assert!(parsed.body.contains("## Motivation"));
    }

    #[test]
    fn test_parse_default_task_template() {
        let parsed = parse_template(DEFAULT_TASK_TEMPLATE).unwrap();
        assert_eq!(parsed.defaults.r#type.as_deref(), Some("task"));
        assert_eq!(parsed.defaults.priority.as_deref(), Some("none"));
        assert!(parsed.defaults.tags.is_empty());
        assert!(parsed.body.contains("## Description"));
    }

    #[test]
    fn test_load_template_path_traversal() {
        let tmp = tempfile::TempDir::new().unwrap();
        let err = load_template(tmp.path(), "../etc/passwd").unwrap_err();
        assert!(err.to_string().contains("path separators"));
    }

    #[test]
    fn test_load_template_not_found() {
        let tmp = tempfile::TempDir::new().unwrap();
        std::fs::create_dir_all(tmp.path().join("templates")).unwrap();
        let err = load_template(tmp.path(), "nonexistent").unwrap_err();
        assert!(err.to_string().contains("not found"));
    }

    #[test]
    fn test_write_and_list_default_templates() {
        let tmp = tempfile::TempDir::new().unwrap();
        write_default_templates(tmp.path()).unwrap();

        let names = list_templates(tmp.path());
        assert!(names.contains(&"bug".to_string()));
        assert!(names.contains(&"feature".to_string()));
        assert!(names.contains(&"task".to_string()));
    }

    #[test]
    fn test_write_default_templates_no_overwrite() {
        let tmp = tempfile::TempDir::new().unwrap();
        let templates_dir = tmp.path().join("templates");
        std::fs::create_dir_all(&templates_dir).unwrap();

        // Write a custom bug template
        std::fs::write(templates_dir.join("bug.md"), "custom content").unwrap();

        write_default_templates(tmp.path()).unwrap();

        // Should not overwrite
        let content = std::fs::read_to_string(templates_dir.join("bug.md")).unwrap();
        assert_eq!(content, "custom content");

        // But should create the others
        assert!(templates_dir.join("feature.md").exists());
        assert!(templates_dir.join("task.md").exists());
    }
}

use crate::error::{Result, WorkError};
use crate::model::WorkItem;

/// Parse a work item file into frontmatter and body.
/// File format:
/// ```text
/// ---
/// key: value
/// ---
/// body content
/// ```
pub fn parse_file(content: &str) -> Result<(WorkItem, String)> {
    // Strip UTF-8 BOM if present
    let content = content.strip_prefix('\u{feff}').unwrap_or(content);

    // Normalize CRLF to LF
    let content = content.replace("\r\n", "\n");

    // V-07: File must start with ---
    if !content.starts_with("---\n") && !content.starts_with("---\r") {
        return Err(WorkError::ValidationError(
            "File must start with '---' (YAML frontmatter delimiter)".to_string(),
        ));
    }

    // Find the closing ---
    let rest = &content[4..]; // skip "---\n"
    let end_pos = rest.find("\n---\n")
        .or_else(|| rest.find("\n---\r\n"))
        .or_else(|| {
            // Handle case where --- is at the very end
            if rest.ends_with("\n---") {
                Some(rest.len() - 3)
            } else {
                None
            }
        });

    let (yaml_str, body) = match end_pos {
        Some(pos) => {
            let yaml = &rest[..pos];
            let after = &rest[pos + 1..]; // skip the \n before ---
            // Skip the closing --- and the newline after it
            let body = if let Some(stripped) = after.strip_prefix("---\n") {
                stripped
            } else if let Some(stripped) = after.strip_prefix("---\r\n") {
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
                "Missing closing '---' delimiter in YAML frontmatter".to_string(),
            ));
        }
    };

    let item: WorkItem = serde_yml::from_str(yaml_str)
        .map_err(WorkError::YamlParse)?;

    Ok((item, body))
}

/// Serialize a work item back to file content with frontmatter + body.
pub fn serialize_file(item: &WorkItem, body: &str) -> Result<String> {
    let yaml = serde_yml::to_string(item)
        .map_err(WorkError::YamlParse)?;

    let mut content = String::new();
    content.push_str("---\n");
    content.push_str(&yaml);
    content.push_str("---\n");
    if !body.is_empty() {
        content.push_str(body);
        if !body.ends_with('\n') {
            content.push('\n');
        }
    }

    Ok(content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_basic_file() {
        let content = "---\nid: CMT-1\ntitle: Test item\nstatus: inbox\ncreated_at: '2026-02-23T10:00:00Z'\n---\nBody content\n";
        let (item, body) = parse_file(content).unwrap();
        assert_eq!(item.title, "Test item");
        assert_eq!(item.status, "inbox");
        assert_eq!(body, "Body content\n");
    }

    #[test]
    fn test_parse_with_bom() {
        let content = "\u{feff}---\nid: CMT-1\ntitle: Test\nstatus: inbox\ncreated_at: '2026-02-23T10:00:00Z'\n---\n";
        let (item, _) = parse_file(content).unwrap();
        assert_eq!(item.title, "Test");
    }

    #[test]
    fn test_parse_no_body() {
        let content = "---\nid: CMT-1\ntitle: Test\nstatus: inbox\ncreated_at: '2026-02-23T10:00:00Z'\n---\n";
        let (item, body) = parse_file(content).unwrap();
        assert_eq!(item.title, "Test");
        assert_eq!(body, "");
    }

    #[test]
    fn test_parse_missing_frontmatter() {
        let content = "No frontmatter here";
        assert!(parse_file(content).is_err());
    }

    #[test]
    fn test_roundtrip() {
        let content = "---\nid: CMT-1\ntitle: Test item\nstatus: inbox\ncreated_at: '2026-02-23T10:00:00Z'\n---\nBody content\n";
        let (item, body) = parse_file(content).unwrap();
        let serialized = serialize_file(&item, &body).unwrap();
        let (item2, body2) = parse_file(&serialized).unwrap();
        assert_eq!(item.id, item2.id);
        assert_eq!(item.title, item2.title);
        assert_eq!(body, body2);
    }
}

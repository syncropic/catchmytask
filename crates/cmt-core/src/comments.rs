use serde::{Deserialize, Serialize};

/// A comment on a work item.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Comment {
    pub id: String,
    pub author: String,
    pub date: String,
    pub body: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reply_to: Option<String>,
}

/// Parse comments from a Markdown body.
///
/// Comments are stored in `<!-- comment:ID author:AUTHOR date:DATE [reply_to:ID] -->`
/// blocks followed by the comment body text, ending at the next comment marker or EOF.
pub fn parse_comments(body: &str) -> Vec<Comment> {
    let mut comments = Vec::new();
    let mut current: Option<(String, String, String, Option<String>)> = None;
    let mut current_body_lines: Vec<&str> = Vec::new();

    for line in body.lines() {
        if let Some(parsed) = parse_comment_marker(line) {
            // Flush previous comment
            if let Some((id, author, date, reply_to)) = current.take() {
                let body_text = trim_comment_body(&current_body_lines);
                comments.push(Comment {
                    id,
                    author,
                    date,
                    body: body_text,
                    reply_to,
                });
                current_body_lines.clear();
            }
            current = Some(parsed);
        } else if current.is_some() {
            current_body_lines.push(line);
        }
    }

    // Flush last comment
    if let Some((id, author, date, reply_to)) = current {
        let body_text = trim_comment_body(&current_body_lines);
        comments.push(Comment {
            id,
            author,
            date,
            body: body_text,
            reply_to,
        });
    }

    comments
}

/// Trim leading/trailing blank lines from comment body lines and join them.
fn trim_comment_body(lines: &[&str]) -> String {
    let start = lines.iter().position(|l| !l.trim().is_empty()).unwrap_or(lines.len());
    let end = lines.iter().rposition(|l| !l.trim().is_empty()).map(|i| i + 1).unwrap_or(start);
    lines[start..end].join("\n")
}

/// Parse a comment marker line like:
/// `<!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->`
/// or with reply_to:
/// `<!-- comment:c2 author:agent-1 date:2026-03-07T10:05:00Z reply_to:c1 -->`
fn parse_comment_marker(line: &str) -> Option<(String, String, String, Option<String>)> {
    let trimmed = line.trim();
    if !trimmed.starts_with("<!-- comment:") || !trimmed.ends_with("-->") {
        return None;
    }

    let inner = &trimmed["<!-- ".len()..trimmed.len() - "-->".len()].trim();
    let mut id = None;
    let mut author = None;
    let mut date = None;
    let mut reply_to = None;

    for token in inner.split_whitespace() {
        if let Some(val) = token.strip_prefix("comment:") {
            id = Some(val.to_string());
        } else if let Some(val) = token.strip_prefix("author:") {
            author = Some(val.to_string());
        } else if let Some(val) = token.strip_prefix("date:") {
            date = Some(val.to_string());
        } else if let Some(val) = token.strip_prefix("reply_to:") {
            reply_to = Some(val.to_string());
        }
    }

    match (id, author, date) {
        (Some(id), Some(author), Some(date)) => Some((id, author, date, reply_to)),
        _ => None,
    }
}

/// Format a comment as a Markdown block.
pub fn format_comment_block(comment: &Comment) -> String {
    let mut marker = format!(
        "<!-- comment:{} author:{} date:{}",
        comment.id, comment.author, comment.date
    );
    if let Some(ref reply_to) = comment.reply_to {
        marker.push_str(&format!(" reply_to:{}", reply_to));
    }
    marker.push_str(" -->");

    format!("{}\n{}", marker, comment.body)
}

/// Append a comment to a Markdown body, creating the `## Comments` section if needed.
/// Returns the new body text.
pub fn append_comment(body: &str, comment: &Comment) -> String {
    let block = format_comment_block(comment);

    // Check if there's already a ## Comments section
    if find_comments_section(body).is_some() {
        // Append to end of body (comments section is at end)
        let trimmed = body.trim_end();
        format!("{}\n\n{}\n", trimmed, block)
    } else {
        // Create a new ## Comments section at end
        let trimmed = body.trim_end();
        if trimmed.is_empty() {
            format!("## Comments\n\n{}\n", block)
        } else {
            format!("{}\n\n## Comments\n\n{}\n", trimmed, block)
        }
    }
}

/// Find the byte offset of the `## Comments` header, if present.
fn find_comments_section(body: &str) -> Option<usize> {
    for (i, line) in body.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed == "## Comments" {
            // Calculate byte offset
            let offset: usize = body.lines()
                .take(i)
                .map(|l| l.len() + 1) // +1 for newline
                .sum();
            return Some(offset);
        }
    }
    None
}

/// Determine the next comment ID based on existing comments.
/// Returns "c1", "c2", etc.
pub fn next_comment_id(body: &str) -> String {
    let comments = parse_comments(body);
    let max_num = comments.iter()
        .filter_map(|c| c.id.strip_prefix('c').and_then(|n| n.parse::<u32>().ok()))
        .max()
        .unwrap_or(0);
    format!("c{}", max_num + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_single_comment() {
        let body = "## Comments\n\n<!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->\nThis looks good.";
        let comments = parse_comments(body);
        assert_eq!(comments.len(), 1);
        assert_eq!(comments[0].id, "c1");
        assert_eq!(comments[0].author, "alice");
        assert_eq!(comments[0].date, "2026-03-07T10:00:00Z");
        assert_eq!(comments[0].body, "This looks good.");
        assert!(comments[0].reply_to.is_none());
    }

    #[test]
    fn test_parse_multiple_comments() {
        let body = "## Comments\n\n\
            <!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->\n\
            First comment.\n\n\
            <!-- comment:c2 author:bob date:2026-03-07T10:05:00Z reply_to:c1 -->\n\
            Reply to first.";
        let comments = parse_comments(body);
        assert_eq!(comments.len(), 2);
        assert_eq!(comments[0].id, "c1");
        assert_eq!(comments[0].body, "First comment.");
        assert_eq!(comments[1].id, "c2");
        assert_eq!(comments[1].body, "Reply to first.");
        assert_eq!(comments[1].reply_to, Some("c1".to_string()));
    }

    #[test]
    fn test_parse_no_comments() {
        let body = "Some body text\n\nNothing here.";
        let comments = parse_comments(body);
        assert!(comments.is_empty());
    }

    #[test]
    fn test_format_comment_block() {
        let comment = Comment {
            id: "c1".to_string(),
            author: "alice".to_string(),
            date: "2026-03-07T10:00:00Z".to_string(),
            body: "Looks good!".to_string(),
            reply_to: None,
        };
        let block = format_comment_block(&comment);
        assert_eq!(block, "<!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->\nLooks good!");
    }

    #[test]
    fn test_format_comment_block_with_reply() {
        let comment = Comment {
            id: "c2".to_string(),
            author: "bob".to_string(),
            date: "2026-03-07T10:05:00Z".to_string(),
            body: "Done.".to_string(),
            reply_to: Some("c1".to_string()),
        };
        let block = format_comment_block(&comment);
        assert!(block.contains("reply_to:c1"));
    }

    #[test]
    fn test_append_comment_empty_body() {
        let comment = Comment {
            id: "c1".to_string(),
            author: "alice".to_string(),
            date: "2026-03-07T10:00:00Z".to_string(),
            body: "First!".to_string(),
            reply_to: None,
        };
        let result = append_comment("", &comment);
        assert!(result.contains("## Comments"));
        assert!(result.contains("comment:c1"));
        assert!(result.contains("First!"));
    }

    #[test]
    fn test_append_comment_existing_body() {
        let body = "Some description here.";
        let comment = Comment {
            id: "c1".to_string(),
            author: "alice".to_string(),
            date: "2026-03-07T10:00:00Z".to_string(),
            body: "Nice.".to_string(),
            reply_to: None,
        };
        let result = append_comment(body, &comment);
        assert!(result.starts_with("Some description here."));
        assert!(result.contains("## Comments"));
        assert!(result.contains("Nice."));
    }

    #[test]
    fn test_append_comment_existing_comments_section() {
        let body = "Description.\n\n## Comments\n\n<!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->\nFirst.";
        let comment = Comment {
            id: "c2".to_string(),
            author: "bob".to_string(),
            date: "2026-03-07T10:05:00Z".to_string(),
            body: "Second.".to_string(),
            reply_to: None,
        };
        let result = append_comment(body, &comment);
        let comments = parse_comments(&result);
        assert_eq!(comments.len(), 2);
        assert_eq!(comments[0].id, "c1");
        assert_eq!(comments[1].id, "c2");
    }

    #[test]
    fn test_next_comment_id() {
        assert_eq!(next_comment_id("no comments here"), "c1");
        let body = "<!-- comment:c1 author:a date:d -->\nhi\n<!-- comment:c3 author:b date:d -->\nbye";
        assert_eq!(next_comment_id(body), "c4");
    }

    #[test]
    fn test_roundtrip() {
        let comment = Comment {
            id: "c1".to_string(),
            author: "alice".to_string(),
            date: "2026-03-07T10:00:00Z".to_string(),
            body: "Multi-line\ncomment body.".to_string(),
            reply_to: None,
        };
        let body = append_comment("", &comment);
        let parsed = parse_comments(&body);
        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].id, "c1");
        assert_eq!(parsed[0].author, "alice");
        assert_eq!(parsed[0].body, "Multi-line\ncomment body.");
    }

    #[test]
    fn test_multiline_comment_body() {
        let body = "## Comments\n\n\
            <!-- comment:c1 author:alice date:2026-03-07T10:00:00Z -->\n\
            Line one.\n\
            Line two.\n\
            \n\
            Line four.";
        let comments = parse_comments(body);
        assert_eq!(comments.len(), 1);
        assert_eq!(comments[0].body, "Line one.\nLine two.\n\nLine four.");
    }
}

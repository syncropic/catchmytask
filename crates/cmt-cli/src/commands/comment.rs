use std::path::Path;

use crate::cli::CommentArgs;
use cmt_core::comments::{self, Comment};
use cmt_core::config::Config;
use cmt_core::error::Result;
use cmt_core::storage;

pub fn execute(
    args: &CommentArgs,
    work_dir: &Path,
    json: bool,
    quiet: bool,
    actor: Option<&str>,
) -> Result<()> {
    let (item, body, path) = storage::read_item(work_dir, &args.id)?;

    if args.list {
        // List comments
        let comments = comments::parse_comments(&body);

        if json {
            let json_val = serde_json::json!({
                "item_id": item.id.raw,
                "comments": comments,
            });
            println!("{}", serde_json::to_string_pretty(&json_val)?);
        } else if comments.is_empty() {
            if !quiet {
                eprintln!("No comments on {}", item.id.raw);
            }
        } else {
            for c in &comments {
                let reply_info = c.reply_to.as_ref()
                    .map(|r| format!(" (reply to {})", r))
                    .unwrap_or_default();
                println!("[{}] @{} {}{}", c.id, c.author, c.date, reply_info);
                println!("{}", c.body);
                println!();
            }
        }
        return Ok(());
    }

    // Add a comment
    let message = match &args.message {
        Some(m) => m.clone(),
        None => {
            return Err(cmt_core::error::WorkError::ValidationError(
                "Message is required. Usage: cmt comment <ID> \"message\" or cmt comment <ID> --list".to_string(),
            ));
        }
    };

    // Determine author
    let author = actor.unwrap_or("unknown").to_string();

    // Generate comment ID
    let comment_id = comments::next_comment_id(&body);

    // Generate timestamp
    let date = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);

    let comment = Comment {
        id: comment_id.clone(),
        author: author.clone(),
        date,
        body: message.clone(),
        reply_to: args.reply_to.clone(),
    };

    // Validate reply_to if specified
    if let Some(ref reply_id) = args.reply_to {
        let existing = comments::parse_comments(&body);
        if !existing.iter().any(|c| c.id == *reply_id) {
            return Err(cmt_core::error::WorkError::ValidationError(
                format!("Comment '{}' not found on {}", reply_id, item.id.raw),
            ));
        }
    }

    // Append comment to body
    let new_body = comments::append_comment(&body, &comment);

    // Write the file
    storage::write_item(&path, &item, &new_body)?;

    // Update index
    if let Ok(index) = cmt_core::index::Index::open(work_dir) {
        let file_str = path.to_string_lossy().to_string();
        let archived = file_str.contains("/archive/");
        cmt_core::index::warn_on_err(
            index.upsert_item(&item, &new_body, &file_str, archived),
            "upsert",
        );
        cmt_core::index::warn_on_err(
            index.record_event(
                &item.id.raw,
                actor,
                "comment",
                Some(&serde_json::json!({
                    "comment_id": comment_id,
                    "reply_to": args.reply_to,
                })),
            ),
            "event",
        );
    }

    // Git auto-commit
    let config = Config::load(work_dir)?;
    let file_str = path.to_string_lossy().to_string();
    cmt_core::git::auto_commit(
        &config,
        work_dir,
        &[&file_str],
        &format!("comment on {} by {}", item.id.raw, author),
    )?;

    if json {
        let json_val = serde_json::json!({
            "item_id": item.id.raw,
            "comment": comment,
        });
        println!("{}", serde_json::to_string_pretty(&json_val)?);
    } else if !quiet {
        eprintln!("Added comment {} to {}", comment_id, item.id.raw);
    }

    Ok(())
}

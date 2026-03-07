use std::path::Path;

use crate::cli::WebhookCommand;
use cmt_core::error::{Result, WorkError};
use cmt_core::webhooks;

pub fn execute(
    cmd: &WebhookCommand,
    work_dir: &Path,
    json: bool,
    quiet: bool,
) -> Result<()> {
    match cmd {
        WebhookCommand::List => list_webhooks(work_dir, json),
        WebhookCommand::Add(args) => add_webhook(work_dir, args, json, quiet),
        WebhookCommand::Remove { id } => remove_webhook(work_dir, id, json, quiet),
        WebhookCommand::Test { id } => test_webhook(work_dir, id, json, quiet),
    }
}

fn list_webhooks(work_dir: &Path, json: bool) -> Result<()> {
    let hooks = webhooks::load_webhooks(work_dir)?;

    if json {
        println!("{}", serde_json::to_string_pretty(&hooks)?);
    } else if hooks.is_empty() {
        eprintln!("No webhooks configured. Use 'cmt webhook add' to add one.");
    } else {
        for hook in &hooks {
            let status = if hook.active { "active" } else { "inactive" };
            let signed = if hook.secret.is_some() { " [signed]" } else { "" };
            println!(
                "{} ({}) -> {}{}",
                hook.id,
                status,
                hook.url,
                signed,
            );
            println!("  events: {}", hook.events.join(", "));
        }
    }

    Ok(())
}

fn add_webhook(
    work_dir: &Path,
    args: &crate::cli::WebhookAddArgs,
    json: bool,
    quiet: bool,
) -> Result<()> {
    let events: Vec<String> = args.events.split(',').map(|s| s.trim().to_string()).collect();
    webhooks::validate_events(&events)?;

    if args.url.is_empty() {
        return Err(WorkError::ValidationError("URL is required".to_string()));
    }

    let mut hooks = webhooks::load_webhooks(work_dir)?;
    let id = webhooks::next_webhook_id(&hooks);

    let new_hook = webhooks::WebhookConfig {
        id: id.clone(),
        url: args.url.clone(),
        events,
        secret: args.secret.clone(),
        active: true,
    };

    hooks.push(new_hook.clone());
    webhooks::save_webhooks(work_dir, &hooks)?;

    if json {
        println!("{}", serde_json::to_string_pretty(&new_hook)?);
    } else if !quiet {
        eprintln!("Added webhook {} -> {}", id, args.url);
    }

    Ok(())
}

fn remove_webhook(work_dir: &Path, id: &str, json: bool, quiet: bool) -> Result<()> {
    let mut hooks = webhooks::load_webhooks(work_dir)?;
    let before = hooks.len();
    hooks.retain(|h| h.id != id);

    if hooks.len() == before {
        return Err(WorkError::ValidationError(format!(
            "Webhook '{}' not found",
            id
        )));
    }

    webhooks::save_webhooks(work_dir, &hooks)?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"removed": id}))?
        );
    } else if !quiet {
        eprintln!("Removed webhook {}", id);
    }

    Ok(())
}

fn test_webhook(work_dir: &Path, id: &str, json: bool, quiet: bool) -> Result<()> {
    let hooks = webhooks::load_webhooks(work_dir)?;
    let hook = hooks
        .iter()
        .find(|h| h.id == id)
        .ok_or_else(|| WorkError::ValidationError(format!("Webhook '{}' not found", id)))?;

    if !quiet && !json {
        eprintln!("Sending test payload to {} ({})...", hook.id, hook.url);
    }

    match crate::webhooks::send_test_webhook(hook) {
        Ok(status) => {
            if json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "webhook_id": id,
                        "url": hook.url,
                        "status": status,
                        "success": (200..300).contains(&status),
                    }))?
                );
            } else if !quiet {
                if (200..300).contains(&status) {
                    eprintln!("OK (HTTP {})", status);
                } else {
                    eprintln!("Warning: received HTTP {}", status);
                }
            }
        }
        Err(e) => {
            if json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "webhook_id": id,
                        "url": hook.url,
                        "error": e,
                        "success": false,
                    }))?
                );
            } else {
                eprintln!("Error: {}", e);
            }
        }
    }

    Ok(())
}

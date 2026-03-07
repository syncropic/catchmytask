use std::path::Path;

use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use crate::error::{Result, WorkError};

type HmacSha256 = Hmac<Sha256>;

/// A single webhook configuration entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookConfig {
    /// Unique identifier for this webhook (e.g., "wh-001").
    pub id: String,
    /// The URL to POST the payload to.
    pub url: String,
    /// List of event types this webhook listens for.
    pub events: Vec<String>,
    /// Optional HMAC-SHA256 secret for signing payloads.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub secret: Option<String>,
    /// Whether this webhook is active.
    #[serde(default = "default_active")]
    pub active: bool,
}

fn default_active() -> bool {
    true
}

/// Top-level webhooks file structure (`.cmt/webhooks.yml`).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhooksFile {
    #[serde(default)]
    pub webhooks: Vec<WebhookConfig>,
}

/// Payload sent to webhook endpoints.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookPayload {
    pub event: String,
    pub item_id: String,
    pub item_title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actor: Option<String>,
    pub timestamp: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<serde_json::Value>,
}

/// All recognized webhook event types.
pub const WEBHOOK_EVENTS: &[&str] = &[
    "item.created",
    "item.updated",
    "item.status_changed",
    "item.done",
    "item.deleted",
    "item.commented",
    "item.archived",
];

/// Load webhook configurations from `.cmt/webhooks.yml`.
/// Returns an empty list if the file doesn't exist.
pub fn load_webhooks(work_dir: &Path) -> Result<Vec<WebhookConfig>> {
    let path = work_dir.join("webhooks.yml");
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = std::fs::read_to_string(&path)?;
    let file: WebhooksFile =
        serde_yml::from_str(&content).map_err(|e| WorkError::General(format!("Failed to parse webhooks.yml: {}", e)))?;
    Ok(file.webhooks)
}

/// Save webhook configurations to `.cmt/webhooks.yml`.
pub fn save_webhooks(work_dir: &Path, webhooks: &[WebhookConfig]) -> Result<()> {
    let file = WebhooksFile {
        webhooks: webhooks.to_vec(),
    };
    let content =
        serde_yml::to_string(&file).map_err(|e| WorkError::General(format!("Failed to serialize webhooks: {}", e)))?;
    let path = work_dir.join("webhooks.yml");
    std::fs::write(&path, content)?;
    Ok(())
}

/// Check whether a webhook's event list matches a given event.
pub fn matches_event(webhook: &WebhookConfig, event: &str) -> bool {
    if !webhook.active {
        return false;
    }
    webhook.events.iter().any(|e| e == event || e == "*")
}

/// Compute HMAC-SHA256 signature for a payload body.
/// Returns the hex-encoded signature string.
pub fn sign_payload(secret: &str, body: &[u8]) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(body);
    let result = mac.finalize();
    hex::encode(result.into_bytes())
}

/// Generate the next webhook ID based on existing webhooks.
pub fn next_webhook_id(webhooks: &[WebhookConfig]) -> String {
    let max_num = webhooks
        .iter()
        .filter_map(|w| {
            w.id.strip_prefix("wh-")
                .and_then(|n| n.parse::<u32>().ok())
        })
        .max()
        .unwrap_or(0);
    format!("wh-{:03}", max_num + 1)
}

/// Validate that all events in a webhook config are recognized.
pub fn validate_events(events: &[String]) -> Result<()> {
    for event in events {
        if event != "*" && !WEBHOOK_EVENTS.contains(&event.as_str()) {
            return Err(WorkError::ValidationError(format!(
                "Unknown webhook event '{}'. Valid events: {}",
                event,
                WEBHOOK_EVENTS.join(", ")
            )));
        }
    }
    Ok(())
}

/// Build a webhook payload.
pub fn build_payload(
    event: &str,
    item_id: &str,
    item_title: &str,
    actor: Option<&str>,
    data: Option<serde_json::Value>,
) -> WebhookPayload {
    WebhookPayload {
        event: event.to_string(),
        item_id: item_id.to_string(),
        item_title: item_title.to_string(),
        actor: actor.map(|s| s.to_string()),
        timestamp: chrono::Utc::now()
            .to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
        data,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_load_webhooks_missing_file() {
        let dir = TempDir::new().unwrap();
        let result = load_webhooks(dir.path()).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_save_and_load_webhooks() {
        let dir = TempDir::new().unwrap();
        let webhooks = vec![
            WebhookConfig {
                id: "wh-001".to_string(),
                url: "https://example.com/hook".to_string(),
                events: vec!["item.created".to_string(), "item.done".to_string()],
                secret: Some("my-secret".to_string()),
                active: true,
            },
            WebhookConfig {
                id: "wh-002".to_string(),
                url: "https://example.com/hook2".to_string(),
                events: vec!["item.updated".to_string()],
                secret: None,
                active: false,
            },
        ];
        save_webhooks(dir.path(), &webhooks).unwrap();
        let loaded = load_webhooks(dir.path()).unwrap();
        assert_eq!(loaded.len(), 2);
        assert_eq!(loaded[0].id, "wh-001");
        assert_eq!(loaded[0].url, "https://example.com/hook");
        assert_eq!(loaded[0].events, vec!["item.created", "item.done"]);
        assert_eq!(loaded[0].secret.as_deref(), Some("my-secret"));
        assert!(loaded[0].active);
        assert_eq!(loaded[1].id, "wh-002");
        assert!(!loaded[1].active);
    }

    #[test]
    fn test_matches_event() {
        let wh = WebhookConfig {
            id: "wh-001".to_string(),
            url: "https://example.com".to_string(),
            events: vec!["item.created".to_string(), "item.done".to_string()],
            secret: None,
            active: true,
        };
        assert!(matches_event(&wh, "item.created"));
        assert!(matches_event(&wh, "item.done"));
        assert!(!matches_event(&wh, "item.updated"));
        assert!(!matches_event(&wh, "item.deleted"));
    }

    #[test]
    fn test_matches_event_wildcard() {
        let wh = WebhookConfig {
            id: "wh-001".to_string(),
            url: "https://example.com".to_string(),
            events: vec!["*".to_string()],
            secret: None,
            active: true,
        };
        assert!(matches_event(&wh, "item.created"));
        assert!(matches_event(&wh, "item.done"));
        assert!(matches_event(&wh, "item.whatever"));
    }

    #[test]
    fn test_matches_event_inactive() {
        let wh = WebhookConfig {
            id: "wh-001".to_string(),
            url: "https://example.com".to_string(),
            events: vec!["item.created".to_string()],
            secret: None,
            active: false,
        };
        assert!(!matches_event(&wh, "item.created"));
    }

    #[test]
    fn test_sign_payload() {
        let sig = sign_payload("test-secret", b"hello world");
        // Verify it's a valid hex string of correct length (SHA-256 = 64 hex chars)
        assert_eq!(sig.len(), 64);
        assert!(sig.chars().all(|c| c.is_ascii_hexdigit()));

        // Same input produces same output
        let sig2 = sign_payload("test-secret", b"hello world");
        assert_eq!(sig, sig2);

        // Different secret produces different output
        let sig3 = sign_payload("other-secret", b"hello world");
        assert_ne!(sig, sig3);

        // Different body produces different output
        let sig4 = sign_payload("test-secret", b"different body");
        assert_ne!(sig, sig4);
    }

    #[test]
    fn test_next_webhook_id() {
        assert_eq!(next_webhook_id(&[]), "wh-001");

        let webhooks = vec![WebhookConfig {
            id: "wh-003".to_string(),
            url: String::new(),
            events: vec![],
            secret: None,
            active: true,
        }];
        assert_eq!(next_webhook_id(&webhooks), "wh-004");
    }

    #[test]
    fn test_validate_events_valid() {
        let events = vec!["item.created".to_string(), "item.done".to_string()];
        assert!(validate_events(&events).is_ok());
    }

    #[test]
    fn test_validate_events_wildcard() {
        let events = vec!["*".to_string()];
        assert!(validate_events(&events).is_ok());
    }

    #[test]
    fn test_validate_events_invalid() {
        let events = vec!["item.unknown_event".to_string()];
        assert!(validate_events(&events).is_err());
    }

    #[test]
    fn test_build_payload() {
        let payload = build_payload(
            "item.created",
            "CMT-42",
            "Test item",
            Some("alice"),
            Some(serde_json::json!({"key": "value"})),
        );
        assert_eq!(payload.event, "item.created");
        assert_eq!(payload.item_id, "CMT-42");
        assert_eq!(payload.item_title, "Test item");
        assert_eq!(payload.actor.as_deref(), Some("alice"));
        assert!(!payload.timestamp.is_empty());
        assert!(payload.data.is_some());
    }
}

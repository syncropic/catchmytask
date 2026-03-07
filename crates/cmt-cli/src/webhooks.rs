use std::path::Path;

use cmt_core::webhooks::{self, WebhookPayload};

/// Fire webhooks for a given event in a background thread (non-blocking for CLI).
/// Loads webhook config, builds the payload, filters matching webhooks, and spawns
/// a thread that sends HTTP POST requests. Errors are silently ignored (fire-and-forget).
pub fn fire_webhooks(
    work_dir: &Path,
    event: &str,
    item_id: &str,
    item_title: &str,
    actor: Option<&str>,
    data: Option<serde_json::Value>,
) {
    let payload = webhooks::build_payload(event, item_id, item_title, actor, data);

    let hooks = match webhooks::load_webhooks(work_dir) {
        Ok(h) => h,
        Err(_) => return,
    };

    // Filter to matching webhooks
    let matching: Vec<_> = hooks
        .into_iter()
        .filter(|wh| webhooks::matches_event(wh, event))
        .collect();

    if matching.is_empty() {
        return;
    }

    // Spawn a thread so the CLI doesn't block
    std::thread::spawn(move || {
        send_webhooks(&matching, &payload);
    });
}

/// Send webhook HTTP POSTs synchronously (called from background thread).
fn send_webhooks(hooks: &[webhooks::WebhookConfig], payload: &WebhookPayload) {
    let body = match serde_json::to_vec(payload) {
        Ok(b) => b,
        Err(_) => return,
    };

    let client = match reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
    {
        Ok(c) => c,
        Err(_) => return,
    };

    for hook in hooks {
        let mut request = client
            .post(&hook.url)
            .header("Content-Type", "application/json")
            .header("X-CMT-Event", &payload.event);

        if let Some(ref secret) = hook.secret {
            let signature = webhooks::sign_payload(secret, &body);
            request = request.header("X-CMT-Signature", signature);
        }

        // Fire and forget — ignore errors
        let _ = request.body(body.clone()).send();
    }
}

/// Send a single test payload to a specific webhook (blocking, returns result).
pub fn send_test_webhook(
    hook: &webhooks::WebhookConfig,
) -> std::result::Result<u16, String> {
    let payload = webhooks::build_payload(
        "webhook.test",
        "CMT-0000",
        "Test webhook delivery",
        Some("cmt-webhook-test"),
        Some(serde_json::json!({"test": true})),
    );

    let body = serde_json::to_vec(&payload).map_err(|e| e.to_string())?;

    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let mut request = client
        .post(&hook.url)
        .header("Content-Type", "application/json")
        .header("X-CMT-Event", "webhook.test");

    if let Some(ref secret) = hook.secret {
        let signature = webhooks::sign_payload(secret, &body);
        request = request.header("X-CMT-Signature", signature);
    }

    let response = request.body(body).send().map_err(|e| e.to_string())?;
    Ok(response.status().as_u16())
}

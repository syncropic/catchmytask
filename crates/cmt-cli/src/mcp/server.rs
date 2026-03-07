use std::io::{self, BufRead, Write};
use std::path::Path;

use cmt_core::error::Result;

use super::tools;

/// Run the MCP stdio server. Reads JSON-RPC 2.0 messages from stdin (one per line),
/// dispatches to handlers, and writes responses to stdout (one per line).
pub fn run_stdio(work_dir: &Path) -> Result<()> {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let reader = stdin.lock();
    let mut writer = stdout.lock();

    for line in reader.lines() {
        let line = match line {
            Ok(l) => l,
            Err(_) => break, // EOF or read error
        };

        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let request: serde_json::Value = match serde_json::from_str(trimmed) {
            Ok(v) => v,
            Err(e) => {
                // JSON parse error
                let error_response = serde_json::json!({
                    "jsonrpc": "2.0",
                    "id": null,
                    "error": {
                        "code": -32700,
                        "message": format!("Parse error: {}", e)
                    }
                });
                writeln!(writer, "{}", serde_json::to_string(&error_response).unwrap_or_default())
                    .ok();
                writer.flush().ok();
                continue;
            }
        };

        let id = request.get("id").cloned();
        let method = request
            .get("method")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let params = request
            .get("params")
            .cloned()
            .unwrap_or(serde_json::Value::Object(serde_json::Map::new()));

        // Notifications (no id) -- just acknowledge silently
        if id.is_none() {
            // notifications/initialized and other notifications need no response
            eprintln!("[mcp] notification: {}", method);
            continue;
        }

        let response = handle_method(method, &params, work_dir);

        let json_response = match response {
            Ok(result) => serde_json::json!({
                "jsonrpc": "2.0",
                "id": id,
                "result": result
            }),
            Err((code, message)) => serde_json::json!({
                "jsonrpc": "2.0",
                "id": id,
                "error": {
                    "code": code,
                    "message": message
                }
            }),
        };

        writeln!(
            writer,
            "{}",
            serde_json::to_string(&json_response).unwrap_or_default()
        )
        .ok();
        writer.flush().ok();
    }

    Ok(())
}

fn handle_method(
    method: &str,
    params: &serde_json::Value,
    work_dir: &Path,
) -> std::result::Result<serde_json::Value, (i64, String)> {
    match method {
        "initialize" => Ok(serde_json::json!({
            "protocolVersion": "2024-11-05",
            "capabilities": { "tools": {} },
            "serverInfo": {
                "name": "catchmytask",
                "version": "0.2.2"
            }
        })),

        "tools/list" => {
            let tool_defs = tools::tool_definitions();
            Ok(serde_json::json!({ "tools": tool_defs }))
        }

        "tools/call" => {
            let tool_name = params
                .get("name")
                .and_then(|v| v.as_str())
                .ok_or_else(|| (-32602i64, "Missing tool name".to_string()))?;

            let arguments = params
                .get("arguments")
                .cloned()
                .unwrap_or(serde_json::Value::Object(serde_json::Map::new()));

            match tools::call_tool(tool_name, &arguments, work_dir) {
                Ok(result) => Ok(serde_json::json!({
                    "content": [{
                        "type": "text",
                        "text": serde_json::to_string_pretty(&result).unwrap_or_default()
                    }]
                })),
                Err(e) => Ok(serde_json::json!({
                    "content": [{
                        "type": "text",
                        "text": format!("Error: {}", e)
                    }],
                    "isError": true
                })),
            }
        }

        _ => Err((-32601, format!("Method not found: {}", method))),
    }
}

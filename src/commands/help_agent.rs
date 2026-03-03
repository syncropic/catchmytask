use std::path::Path;

use clap::CommandFactory;

use crate::cli::{Cli, HelpAgentArgs};
use crate::config::Config;
use crate::error::{Result, WorkError};

pub fn execute(args: &HelpAgentArgs, work_dir: Option<&Path>, json: bool) -> Result<()> {
    // Reject conflicting combinations
    if (args.conventions || args.all) && args.command.is_some() {
        return Err(WorkError::General(
            "Cannot combine --conventions or --all with a command name".into(),
        ));
    }

    if args.conventions {
        return output_conventions(work_dir, json);
    }

    if args.all {
        return output_all_commands(json);
    }

    if let Some(ref cmd_name) = args.command {
        return output_single_command(cmd_name, json);
    }

    output_overview(json)
}

fn output_overview(json: bool) -> Result<()> {
    let app = Cli::command();
    let version = app.get_version().unwrap_or("unknown");

    let command_names: Vec<String> = app
        .get_subcommands()
        .filter(|s| s.get_name() != "help" && s.get_name() != "help-agent")
        .map(|s| s.get_name().to_string())
        .collect();

    if json {
        // Tier 0: ~150 tokens. Just command names, not full descriptions.
        // Use `cmt help-agent <cmd> --json` for details on any command.
        let global_flags: Vec<serde_json::Value> = app
            .get_opts()
            .filter(|o| is_global_option(o))
            .map(|o| {
                let flag = format_flag(o);
                let help = o.get_help().map(|h| h.to_string()).unwrap_or_default();
                serde_json::json!({"flag": flag, "help": help})
            })
            .collect();

        let output = serde_json::json!({
            "tool": "cmt",
            "version": version,
            "description": "Work management CLI. Items are Markdown files in .cmt/items/.",
            "commands": command_names,
            "global_flags": global_flags,
            "usage": "cmt <command> [OPTIONS] --json",
            "quick_start": "cmt init && work add \"Fix bug\" -p high && work list --json",
            "tip": "cmt help-agent <cmd> --json for details. Set CMT_ACTOR env to identify yourself."
        });
        println!("{}", serde_json::to_string(&output)?);
    } else {
        println!("cmt v{} — Work management for humans and agents", version);
        println!();
        println!("Items are Markdown files in .cmt/items/.");
        println!("Use --json for machine-readable output.");
        println!();

        // Human output gets full descriptions — token budget doesn't apply
        println!("{:<16} DESCRIPTION", "COMMAND");
        println!("{:<16} -----------", "-------");
        for sub in app.get_subcommands() {
            let name = sub.get_name();
            if name == "help" {
                continue;
            }
            let summary = sub.get_about().map(|a| a.to_string()).unwrap_or_default();
            let alias = sub.get_all_aliases().next();
            let name_col = if let Some(a) = alias {
                format!("{} ({})", name, a)
            } else {
                name.to_string()
            };
            println!("{:<16} {}", name_col, summary);
        }
        println!();
        println!("Quick start:");
        println!("  work init");
        println!("  work add \"Fix the bug\" -p high");
        println!("  work list");
        println!("  work done CMT-0001");
        println!();
        println!("Tip: Set CMT_ACTOR env to identify yourself in event logs.");
    }

    Ok(())
}

fn output_single_command(cmd_name: &str, json: bool) -> Result<()> {
    let app = Cli::command();
    let sub = app
        .get_subcommands()
        .find(|s| s.get_name() == cmd_name || s.get_all_aliases().any(|a| a == cmd_name))
        .ok_or_else(|| {
            let valid: Vec<&str> = app
                .get_subcommands()
                .filter(|s| s.get_name() != "help")
                .map(|s| s.get_name())
                .collect();
            WorkError::General(format!(
                "Unknown command '{}'. Valid commands: {}",
                cmd_name,
                valid.join(", ")
            ))
        })?;

    let name = sub.get_name().to_string();
    let summary = sub.get_about().map(|a| a.to_string()).unwrap_or_default();

    let usage = format!("cmt {} {}", name, build_usage_string(sub))
        .trim()
        .to_string();

    let args: Vec<ArgDetail> = sub
        .get_positionals()
        .map(|a| ArgDetail {
            name: a.get_id().to_string(),
            required: a.is_required_set(),
            arg_type: infer_arg_type(a),
            help: a.get_help().map(|h| h.to_string()),
        })
        .collect();

    let options: Vec<OptionDetail> = sub
        .get_opts()
        .filter(|o| !is_global_option(o))
        .map(|o| {
            let flag = format_flag(o);

            let is_bool_flag = matches!(
                o.get_action(),
                clap::ArgAction::SetTrue | clap::ArgAction::SetFalse
            );

            let possible = if is_bool_flag {
                vec![]
            } else {
                o.get_possible_values()
                    .iter()
                    .map(|v| v.get_name().to_string())
                    .collect::<Vec<_>>()
            };

            let default = o
                .get_default_values()
                .first()
                .map(|v| v.to_string_lossy().to_string());

            let arg_type = if is_bool_flag {
                "bool".to_string()
            } else if !possible.is_empty() {
                "enum".to_string()
            } else {
                infer_arg_type_from_opt(o)
            };

            OptionDetail {
                flag,
                arg_type,
                values: if possible.is_empty() {
                    None
                } else {
                    Some(possible)
                },
                default,
                repeatable: matches!(
                    o.get_action(),
                    clap::ArgAction::Append | clap::ArgAction::Count
                ),
                help: o.get_help().map(|h| h.to_string()),
            }
        })
        .collect();

    // Introspect subcommands (e.g., config show/get/set)
    let subcommands: Vec<SubcommandDetail> = sub
        .get_subcommands()
        .filter(|s| s.get_name() != "help")
        .map(|s| SubcommandDetail {
            name: s.get_name().to_string(),
            summary: s.get_about().map(|a| a.to_string()).unwrap_or_default(),
            args: s
                .get_positionals()
                .map(|a| format!("{}{}{}",
                    if a.is_required_set() { "<" } else { "[" },
                    a.get_id().to_string().to_uppercase(),
                    if a.is_required_set() { ">" } else { "]" },
                ))
                .collect::<Vec<_>>()
                .join(" "),
        })
        .collect();

    let meta = command_metadata(&name);

    if json {
        let json_args: Vec<serde_json::Value> = args
            .iter()
            .map(|a| {
                let mut m = serde_json::json!({
                    "name": a.name,
                    "required": a.required,
                    "type": a.arg_type,
                });
                if let Some(ref h) = a.help {
                    m["help"] = serde_json::Value::String(h.clone());
                }
                m
            })
            .collect();

        let json_options: Vec<serde_json::Value> = options
            .iter()
            .map(|o| {
                let mut m = serde_json::Map::new();
                m.insert("flag".into(), serde_json::Value::String(o.flag.clone()));
                m.insert(
                    "type".into(),
                    serde_json::Value::String(o.arg_type.clone()),
                );
                if let Some(ref vals) = o.values {
                    m.insert(
                        "values".into(),
                        serde_json::Value::Array(
                            vals.iter()
                                .map(|v| serde_json::Value::String(v.clone()))
                                .collect(),
                        ),
                    );
                }
                if let Some(ref def) = o.default {
                    m.insert("default".into(), serde_json::Value::String(def.clone()));
                }
                if o.repeatable {
                    m.insert("repeatable".into(), serde_json::Value::Bool(true));
                }
                if let Some(ref h) = o.help {
                    m.insert("help".into(), serde_json::Value::String(h.clone()));
                }
                serde_json::Value::Object(m)
            })
            .collect();

        let mut output = serde_json::json!({
            "command": name,
            "summary": summary,
            "usage": usage,
            "args": json_args,
            "options": json_options,
        });

        if !subcommands.is_empty() {
            output["subcommands"] = serde_json::Value::Array(
                subcommands
                    .iter()
                    .map(|s| {
                        let mut m = serde_json::json!({
                            "name": s.name,
                            "summary": s.summary,
                        });
                        if !s.args.is_empty() {
                            m["args"] = serde_json::Value::String(s.args.clone());
                        }
                        m
                    })
                    .collect(),
            );
        }

        if !meta.examples.is_empty() {
            output["examples"] = serde_json::Value::Array(
                meta.examples
                    .iter()
                    .map(|e| serde_json::Value::String(e.to_string()))
                    .collect(),
            );
        }

        if !meta.exit_codes.is_empty() {
            let mut codes = serde_json::Map::new();
            for (code, desc) in &meta.exit_codes {
                codes.insert(code.to_string(), serde_json::Value::String(desc.to_string()));
            }
            output["exit_codes"] = serde_json::Value::Object(codes);
        }

        println!("{}", serde_json::to_string(&output)?);
    } else {
        println!("{} — {}", name, summary);
        println!();
        println!("Usage: {}", usage);

        if !subcommands.is_empty() {
            println!();
            println!("Subcommands:");
            for s in &subcommands {
                if s.args.is_empty() {
                    println!("  {:<20} {}", s.name, s.summary);
                } else {
                    println!("  {} {:<14} {}", s.name, s.args, s.summary);
                }
            }
        }

        if !args.is_empty() {
            println!();
            println!("Arguments:");
            for a in &args {
                let req = if a.required { "(required)" } else { "(optional)" };
                let help = a.help.as_deref().unwrap_or("");
                println!("  {:<20} {} {} {}", a.name.to_uppercase(), a.arg_type, req, help);
            }
        }

        if !options.is_empty() {
            println!();
            println!("Options:");
            for o in &options {
                let mut detail = o.arg_type.clone();
                if let Some(ref vals) = o.values {
                    detail = format!("[{}]", vals.join("|"));
                }
                if let Some(ref def) = o.default {
                    detail.push_str(&format!(" (default: {})", def));
                }
                if o.repeatable {
                    detail.push_str(" (repeatable)");
                }
                println!("  {:<24} {}", o.flag, detail);
            }
        }

        if !meta.examples.is_empty() {
            println!();
            println!("Examples:");
            for ex in &meta.examples {
                println!("  {}", ex);
            }
        }
    }

    Ok(())
}

fn output_all_commands(json: bool) -> Result<()> {
    let app = Cli::command();

    if json {
        let mut all_commands = Vec::new();
        for sub in app.get_subcommands() {
            let name = sub.get_name().to_string();
            if name == "help" || name == "help-agent" {
                continue;
            }
            let summary = sub.get_about().map(|a| a.to_string()).unwrap_or_default();
            let meta = command_metadata(&name);

            let options: Vec<serde_json::Value> = sub
                .get_opts()
                .filter(|o| !is_global_option(o))
                .map(|o| serde_json::json!({"flag": format_flag(o)}))
                .collect();

            all_commands.push(serde_json::json!({
                "name": name,
                "summary": summary,
                "options": options,
                "examples": meta.examples,
            }));
        }

        let output = serde_json::json!({
            "tool": "cmt",
            "commands": all_commands,
        });
        println!("{}", serde_json::to_string(&output)?);
    } else {
        for sub in app.get_subcommands() {
            let name = sub.get_name();
            if name == "help" || name == "help-agent" {
                continue;
            }
            let summary = sub.get_about().map(|a| a.to_string()).unwrap_or_default();
            println!("{:<16} {}", name, summary);
        }
    }

    Ok(())
}

fn output_conventions(work_dir: Option<&Path>, json: bool) -> Result<()> {
    let work_dir = work_dir.ok_or(WorkError::WorkDirNotFound)?;
    let config = Config::load(work_dir)?;

    let default_machine = config.state_machines.get("default");

    // Use workflow ordering (BFS from initial states) for consistent output
    let states: Vec<String> = default_machine
        .map(crate::discovery::workflow_ordered_states)
        .unwrap_or_default();

    let initial_states: Vec<String> = default_machine
        .map(|m| {
            m.states
                .iter()
                .filter(|(_, s)| s.initial)
                .map(|(n, _)| n.clone())
                .collect()
        })
        .unwrap_or_default();

    let terminal_states: Vec<String> = default_machine
        .map(|m| {
            m.states
                .iter()
                .filter(|(_, s)| s.terminal)
                .map(|(n, _)| n.clone())
                .collect()
        })
        .unwrap_or_default();

    let transitions: Vec<(String, String)> = default_machine
        .map(|m| {
            m.transitions
                .iter()
                .map(|t| (t.from.clone(), t.to.clone()))
                .collect()
        })
        .unwrap_or_default();

    if json {
        let output = serde_json::json!({
            "prefix": config.project.prefix,
            "pad_width": config.id.pad_width,
            "defaults": {
                "type": config.defaults.r#type,
                "priority": config.defaults.priority,
                "status": config.defaults.status,
            },
            "states": states,
            "initial_states": initial_states,
            "terminal_states": terminal_states,
            "transitions": transitions.iter().map(|(f, t)| {
                serde_json::json!({"from": f, "to": t})
            }).collect::<Vec<_>>(),
            "tag_namespaces": config.tags.namespaces,
            "git": {
                "auto_commit": config.git.auto_commit,
                "commit_prefix": config.git.commit_prefix,
            },
        });
        println!("{}", serde_json::to_string(&output)?);
    } else {
        println!("Project Conventions");
        println!();
        println!(
            "Prefix: {} (pad: {}, e.g., {}-{})",
            config.project.prefix,
            config.id.pad_width,
            config.project.prefix,
            "0".repeat(config.id.pad_width as usize - 1).to_string() + "1"
        );
        println!();
        println!(
            "Defaults: type={}, priority={}, status={}",
            config.defaults.r#type, config.defaults.priority, config.defaults.status,
        );
        println!();
        println!("States: {}", states.join(", "));
        println!("  Initial: {}", initial_states.join(", "));
        println!("  Terminal: {}", terminal_states.join(", "));
        println!();
        println!("Transitions:");
        for (from, to) in &transitions {
            println!("  {} -> {}", from, to);
        }
        println!();
        println!("Tag namespaces: {}", config.tags.namespaces.join(", "));
        println!();
        println!(
            "Git: auto_commit={}, commit_prefix={}",
            config.git.auto_commit, config.git.commit_prefix
        );
    }

    Ok(())
}

// --- Helper types ---

struct ArgDetail {
    name: String,
    required: bool,
    arg_type: String,
    help: Option<String>,
}

struct OptionDetail {
    flag: String,
    arg_type: String,
    values: Option<Vec<String>>,
    default: Option<String>,
    repeatable: bool,
    help: Option<String>,
}

struct SubcommandDetail {
    name: String,
    summary: String,
    args: String,
}

struct CommandMeta {
    examples: Vec<&'static str>,
    exit_codes: Vec<(i32, &'static str)>,
}

/// Static metadata for each command that clap can't express (examples, exit codes).
/// NOTE: When adding a new command to the Commands enum, add a case here too.
/// The wildcard arm provides a safe fallback but means you won't get a compile error
/// if you forget — grep for this function when adding commands.
fn command_metadata(name: &str) -> CommandMeta {
    match name {
        "init" => CommandMeta {
            examples: vec![
                "cmt init",
                "cmt init --prefix ACME --name my-project",
                "cmt init --force",
                "cmt init --global",
            ],
            exit_codes: vec![(0, "success"), (1, "already initialized")],
        },
        "add" => CommandMeta {
            examples: vec![
                "cmt add \"Fix login bug\"",
                "cmt add -t bug -p high -a alice \"Auth timeout\" --tag team:backend",
                "cmt add --complex \"Research caching\"",
            ],
            exit_codes: vec![(0, "success"), (5, "validation error")],
        },
        "list" | "ls" => CommandMeta {
            examples: vec![
                "cmt list",
                "cmt list -s active -p high",
                "cmt list --format json --all",
                "cmt ls --tag team:backend --sort priority",
            ],
            exit_codes: vec![(0, "success")],
        },
        "show" => CommandMeta {
            examples: vec![
                "cmt show CMT-0001",
                "cmt show CMT-0001 --json",
                "cmt show CMT-0001 --raw",
                "cmt show CMT-0001 --children",
            ],
            exit_codes: vec![(0, "success"), (3, "not found")],
        },
        "edit" => CommandMeta {
            examples: vec![
                "cmt edit CMT-0001 --set priority=high",
                "cmt edit CMT-0001 --add-tag team:frontend",
                "cmt edit CMT-0001 --body \"Updated description\"",
            ],
            exit_codes: vec![(0, "success"), (3, "not found"), (5, "validation error")],
        },
        "done" => CommandMeta {
            examples: vec![
                "cmt done CMT-0001",
                "cmt done CMT-0001 CMT-0002",
                "cmt done CMT-0001 --force",
            ],
            exit_codes: vec![(0, "success"), (3, "not found"), (4, "invalid transition")],
        },
        "status" => CommandMeta {
            examples: vec![
                "cmt status CMT-0001 active",
                "cmt status CMT-0001 blocked --reason \"Waiting on API\"",
                "cmt status CMT-0001 done --force",
            ],
            exit_codes: vec![(0, "success"), (3, "not found"), (4, "invalid transition")],
        },
        "archive" => CommandMeta {
            examples: vec![
                "cmt archive --done",
                "cmt archive CMT-0001",
                "cmt archive --done --dry-run",
            ],
            exit_codes: vec![(0, "success")],
        },
        "search" => CommandMeta {
            examples: vec![
                "cmt search authentication",
                "cmt search \"login bug\" -s active",
                "cmt search api --limit 5 --format json",
            ],
            exit_codes: vec![(0, "success")],
        },
        "reindex" => CommandMeta {
            examples: vec!["cmt reindex", "cmt reindex --force"],
            exit_codes: vec![(0, "success")],
        },
        "check" => CommandMeta {
            examples: vec!["cmt check", "cmt check --fix"],
            exit_codes: vec![(0, "success"), (5, "validation errors found")],
        },
        "delete" | "rm" => CommandMeta {
            examples: vec![
                "cmt delete CMT-0001 --force",
                "cmt rm CMT-0001 CMT-0002 -f",
            ],
            exit_codes: vec![(0, "success"), (3, "not found")],
        },
        "config" => CommandMeta {
            examples: vec![
                "cmt config show",
                "cmt config get project.prefix",
                "cmt config set defaults.priority high",
            ],
            exit_codes: vec![(0, "success"), (1, "invalid key/value")],
        },
        "log" => CommandMeta {
            examples: vec![
                "cmt log CMT-0001",
                "cmt log CMT-0001 --json",
                "cmt log CMT-0001 --limit 5",
            ],
            exit_codes: vec![(0, "success"), (3, "not found")],
        },
        "completions" => CommandMeta {
            examples: vec![
                "cmt completions bash",
                "cmt completions zsh",
                "cmt completions fish",
            ],
            exit_codes: vec![(0, "success")],
        },
        "help-agent" => CommandMeta {
            examples: vec![
                "cmt help-agent --json",
                "cmt help-agent add --json",
                "cmt help-agent --all --json",
                "cmt help-agent --conventions --json",
            ],
            exit_codes: vec![(0, "success"), (1, "unknown command")],
        },
        "setup" => CommandMeta {
            examples: vec![
                "cmt setup --list",
                "cmt setup --claude-code",
                "cmt setup --remove claude-code",
            ],
            exit_codes: vec![(0, "success"), (1, "error")],
        },
        _ => CommandMeta {
            examples: vec![],
            exit_codes: vec![(0, "success")],
        },
    }
}

fn build_usage_string(cmd: &clap::Command) -> String {
    let mut parts = Vec::new();

    if cmd.get_opts().any(|o| !is_global_option(o)) {
        parts.push("[OPTIONS]".to_string());
    }

    for arg in cmd.get_positionals() {
        let name = arg.get_id().to_string().to_uppercase();
        if arg.is_required_set() {
            parts.push(format!("<{}>", name));
        } else {
            parts.push(format!("[{}]", name));
        }
    }

    if cmd.has_subcommands() {
        parts.push("<COMMAND>".to_string());
    }

    parts.join(" ")
}

/// Extract the flag display string from a clap option.
fn format_flag(opt: &clap::Arg) -> String {
    let long = opt.get_long().map(|l| format!("--{}", l));
    let short = opt.get_short().map(|s| format!("-{}", s));
    match (long, short) {
        (Some(l), Some(s)) => format!("{}, {}", l, s),
        (Some(l), None) => l,
        (None, Some(s)) => s,
        (None, None) => opt.get_id().to_string(),
    }
}

fn is_global_option(opt: &clap::Arg) -> bool {
    matches!(
        opt.get_id().as_str(),
        "dir" | "json" | "quiet" | "no_color" | "actor"
    )
}

fn infer_arg_type(arg: &clap::Arg) -> String {
    if !arg.get_possible_values().is_empty() {
        "enum".to_string()
    } else {
        "string".to_string()
    }
}

fn infer_arg_type_from_opt(opt: &clap::Arg) -> String {
    if !opt.get_possible_values().is_empty() {
        return "enum".to_string();
    }
    match opt.get_action() {
        clap::ArgAction::SetTrue | clap::ArgAction::SetFalse => "bool".to_string(),
        clap::ArgAction::Count => "count".to_string(),
        _ => {
            let id = opt.get_id().as_str();
            if id.contains("limit") || id.contains("width") || id.contains("days") {
                "number".to_string()
            } else {
                "string".to_string()
            }
        }
    }
}

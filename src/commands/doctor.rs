use std::path::{Path, PathBuf};

use crate::cli::DoctorArgs;
use crate::error::Result;
use crate::registry::Registry;

const CLAUDE_CODE_SKILL: &str = include_str!("../../integrations/claude-code/SKILL.md");

#[derive(Debug)]
enum Status {
    Ok,
    Warn,
    Fail,
}

#[derive(Debug)]
struct CheckResult {
    name: String,
    status: Status,
    detail: String,
}

impl CheckResult {
    fn ok(name: &str, detail: &str) -> Self {
        Self { name: name.into(), status: Status::Ok, detail: detail.into() }
    }
    fn warn(name: &str, detail: &str) -> Self {
        Self { name: name.into(), status: Status::Warn, detail: detail.into() }
    }
    fn fail(name: &str, detail: &str) -> Self {
        Self { name: name.into(), status: Status::Fail, detail: detail.into() }
    }

    fn icon(&self) -> &str {
        match self.status {
            Status::Ok => "ok",
            Status::Warn => "!!",
            Status::Fail => "FAIL",
        }
    }

    fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "check": self.name,
            "status": match self.status {
                Status::Ok => "ok",
                Status::Warn => "warn",
                Status::Fail => "fail",
            },
            "detail": self.detail,
        })
    }
}

fn check_binary() -> CheckResult {
    let version = env!("CARGO_PKG_VERSION");
    match std::process::Command::new("cmt").arg("--version").output() {
        Ok(output) => {
            let out = String::from_utf8_lossy(&output.stdout);
            let installed = out.trim();
            if installed.contains(version) {
                CheckResult::ok("cmt binary", &format!("{} (in PATH)", installed))
            } else {
                CheckResult::warn("cmt binary", &format!(
                    "PATH has {}, but this binary is v{}",
                    installed, version
                ))
            }
        }
        Err(_) => CheckResult::fail("cmt binary", "cmt not found in PATH"),
    }
}

fn check_global_inbox() -> CheckResult {
    let home = match std::env::var("HOME") {
        Ok(h) => PathBuf::from(h),
        Err(_) => return CheckResult::fail("global inbox", "Cannot determine HOME"),
    };
    let cmt_dir = home.join(".cmt");
    if !cmt_dir.exists() {
        return CheckResult::warn("global inbox", "~/.cmt not found — run: cd ~ && cmt init --prefix INBOX");
    }
    let config_path = cmt_dir.join("config.yml");
    if !config_path.exists() {
        return CheckResult::fail("global inbox", "~/.cmt exists but config.yml is missing");
    }
    match std::fs::read_to_string(&config_path) {
        Ok(content) => {
            if content.contains("INBOX") {
                CheckResult::ok("global inbox", "~/.cmt with INBOX prefix")
            } else {
                CheckResult::warn("global inbox", "~/.cmt exists but prefix is not INBOX — consider updating")
            }
        }
        Err(e) => CheckResult::fail("global inbox", &format!("Cannot read config: {}", e)),
    }
}

fn check_registry() -> (CheckResult, Vec<CheckResult>) {
    let mut project_checks = Vec::new();

    let registry = match Registry::load() {
        Ok(r) => r,
        Err(e) => return (
            CheckResult::fail("project registry", &format!("Cannot load: {}", e)),
            vec![],
        ),
    };

    if registry.projects.is_empty() {
        return (
            CheckResult::warn("project registry", "No projects registered — run: cmt projects add <path>"),
            vec![],
        );
    }

    let mut ok_count = 0;
    let mut stale_count = 0;

    for project in &registry.projects {
        let cmt_path = &project.path;
        if !cmt_path.exists() {
            stale_count += 1;
            project_checks.push(CheckResult::fail(
                &format!("project:{}", project.name),
                &format!("{} — path missing, run: cmt projects prune", cmt_path.display()),
            ));
            continue;
        }

        // Check config.yml
        let config_path = cmt_path.join("config.yml");
        if !config_path.exists() {
            project_checks.push(CheckResult::fail(
                &format!("project:{}", project.name),
                &format!("{} — config.yml missing", cmt_path.display()),
            ));
            continue;
        }

        // Check index
        let index_path = cmt_path.join(".index.db");
        let index_status = if index_path.exists() {
            "indexed"
        } else {
            "no index (run: cmt reindex --force --dir <path>)"
        };

        // Count items
        let items_dir = cmt_path.join("items");
        let item_count = if items_dir.exists() {
            std::fs::read_dir(&items_dir).map(|d| d.count()).unwrap_or(0)
        } else {
            0
        };

        ok_count += 1;
        project_checks.push(CheckResult::ok(
            &format!("project:{}", project.name),
            &format!("[{}] {} items, {}", project.prefix, item_count, index_status),
        ));
    }

    let summary = format!(
        "{} projects registered, {} ok, {} stale",
        registry.projects.len(), ok_count, stale_count,
    );
    let reg_status = if stale_count > 0 {
        CheckResult::warn("project registry", &summary)
    } else {
        CheckResult::ok("project registry", &summary)
    };

    (reg_status, project_checks)
}

fn check_claude_code_skill() -> CheckResult {
    let home = match std::env::var("HOME") {
        Ok(h) => PathBuf::from(h),
        Err(_) => return CheckResult::warn("claude code skill", "Cannot determine HOME"),
    };

    let skill_path = home.join(".claude/skills/managing-work/SKILL.md");

    if !skill_path.exists() {
        return CheckResult::warn(
            "claude code skill",
            "Not installed — run: cmt setup --claude-code",
        );
    }

    match std::fs::read_to_string(&skill_path) {
        Ok(content) => {
            if content == CLAUDE_CODE_SKILL {
                CheckResult::ok("claude code skill", "Installed and up to date")
            } else {
                CheckResult::warn(
                    "claude code skill",
                    "Installed but outdated — run: cmt setup --claude-code",
                )
            }
        }
        Err(e) => CheckResult::fail("claude code skill", &format!("Cannot read: {}", e)),
    }
}

fn check_shell_aliases() -> CheckResult {
    let home = match std::env::var("HOME") {
        Ok(h) => PathBuf::from(h),
        Err(_) => return CheckResult::warn("shell aliases", "Cannot determine HOME"),
    };

    let shell = std::env::var("SHELL").unwrap_or_default();
    let rc_file = if shell.contains("zsh") {
        home.join(".zshrc")
    } else {
        home.join(".bashrc")
    };

    if !rc_file.exists() {
        return CheckResult::warn("shell aliases", &format!("{} not found", rc_file.display()));
    }

    match std::fs::read_to_string(&rc_file) {
        Ok(content) => {
            let has_qi = content.contains("alias qi=");
            let has_wa = content.contains("alias wa=");
            let has_morning = content.contains("alias morning=");

            if has_qi && has_wa && has_morning {
                CheckResult::ok("shell aliases", "qi, wa, morning aliases configured")
            } else {
                let missing: Vec<&str> = [
                    (!has_qi, "qi"),
                    (!has_wa, "wa"),
                    (!has_morning, "morning"),
                ].iter().filter(|(m, _)| *m).map(|(_, n)| *n).collect();
                CheckResult::warn(
                    "shell aliases",
                    &format!("Missing: {} — see docs/guides/multi-context-workflow.md", missing.join(", ")),
                )
            }
        }
        Err(_) => CheckResult::warn("shell aliases", "Cannot read shell config"),
    }
}

fn check_index(work_dir: Option<&Path>) -> CheckResult {
    let dir = match work_dir {
        Some(d) => d,
        None => return CheckResult::warn("current project index", "No .cmt/ in current directory"),
    };

    let index_path = dir.join(".index.db");
    if !index_path.exists() {
        return CheckResult::warn(
            "current project index",
            "No index — run: cmt reindex --force",
        );
    }

    // Try opening the index
    match crate::index::Index::open(dir) {
        Ok(_) => {
            let items_dir = dir.join("items");
            let file_count = if items_dir.exists() {
                std::fs::read_dir(&items_dir).map(|d| d.count()).unwrap_or(0)
            } else {
                0
            };
            CheckResult::ok(
                "current project index",
                &format!("SQLite index valid, {} item files", file_count),
            )
        }
        Err(e) => CheckResult::fail(
            "current project index",
            &format!("Cannot open index: {} — run: cmt reindex --force", e),
        ),
    }
}

pub fn execute(args: &DoctorArgs, work_dir: Option<&Path>, json: bool, quiet: bool) -> Result<()> {
    let mut checks: Vec<CheckResult> = Vec::new();

    // 1. Binary
    checks.push(check_binary());

    // 2. Global inbox
    checks.push(check_global_inbox());

    // 3. Project registry
    let (reg_check, project_checks) = check_registry();
    checks.push(reg_check);
    if args.verbose {
        checks.extend(project_checks);
    }

    // 4. Current project index
    checks.push(check_index(work_dir));

    // 5. Claude Code skill
    checks.push(check_claude_code_skill());

    // 6. Shell aliases
    checks.push(check_shell_aliases());

    // Output
    if json {
        let results: Vec<serde_json::Value> = checks.iter().map(|c| c.to_json()).collect();
        let ok = checks.iter().all(|c| matches!(c.status, Status::Ok));
        let output = serde_json::json!({
            "healthy": ok,
            "checks": results,
        });
        println!("{}", serde_json::to_string(&output)?);
    } else if !quiet {
        let mut ok_count = 0;
        let mut warn_count = 0;
        let mut fail_count = 0;

        for check in &checks {
            match check.status {
                Status::Ok => {
                    ok_count += 1;
                    eprintln!("  [{}]  {}: {}", check.icon(), check.name, check.detail);
                }
                Status::Warn => {
                    warn_count += 1;
                    eprintln!("  [{}]  {}: {}", check.icon(), check.name, check.detail);
                }
                Status::Fail => {
                    fail_count += 1;
                    eprintln!("  [{}] {}: {}", check.icon(), check.name, check.detail);
                }
            }
        }

        eprintln!();
        if fail_count > 0 {
            eprintln!("  {} ok, {} warnings, {} failures", ok_count, warn_count, fail_count);
        } else if warn_count > 0 {
            eprintln!("  {} ok, {} warnings", ok_count, warn_count);
        } else {
            eprintln!("  All {} checks passed", ok_count);
        }
    }

    Ok(())
}

use std::path::Path;
use std::process::Command;

use crate::config::Config;
use crate::error::Result;

/// Auto-commit changes if git.auto_commit is enabled.
pub fn auto_commit(config: &Config, work_dir: &Path, files: &[&str], message: &str) -> Result<()> {
    if !config.git.auto_commit {
        return Ok(());
    }

    // Check if we're in a git repo
    let status = Command::new("git")
        .arg("rev-parse")
        .arg("--is-inside-work-tree")
        .current_dir(work_dir.parent().unwrap_or(work_dir))
        .output();

    match status {
        Ok(output) if output.status.success() => {}
        _ => {
            eprintln!("warning: auto_commit is enabled but .cmt/ is not in a git repository. Changes will not be committed.");
            return Ok(());
        }
    }

    // Stage files (use "--" to prevent filenames being interpreted as flags)
    for file in files {
        let output = Command::new("git")
            .args(["add", "--", file])
            .current_dir(work_dir.parent().unwrap_or(work_dir))
            .output()?;
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            eprintln!("warning: git add failed for {}: {}", file, stderr.trim());
        }
    }

    // Commit
    let full_message = format!("{}: {}", config.git.commit_prefix, message);
    let output = Command::new("git")
        .args(["commit", "-m", &full_message])
        .current_dir(work_dir.parent().unwrap_or(work_dir))
        .output()?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        eprintln!("warning: git commit failed: {}", stderr.trim());
    }

    Ok(())
}

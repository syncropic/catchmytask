use assert_cmd::Command;
use predicates::prelude::*;
use tempfile::TempDir;
use std::path::{Path, PathBuf};

fn work_cmd() -> Command {
    Command::cargo_bin("cmt").unwrap()
}

fn init_work_dir(dir: &Path) {
    work_cmd()
        .current_dir(dir)
        .args(["init", "--prefix", "CMT", "--name", "test-project"])
        .assert()
        .success();
}

/// Find an item file by its ID prefix (e.g. "CMT-1") in items/ or archive/.
/// Handles both old-style (CMT-1.md) and slugified (CMT-1-fix-login.md) filenames.
fn find_item_file(base: &Path, id: &str, subdir: &str) -> PathBuf {
    let dir = base.join(".cmt").join(subdir);
    let prefix = format!("{}-", id);
    // Try exact match first
    let exact = dir.join(format!("{}.md", id));
    if exact.exists() { return exact; }
    // Try slugified
    for entry in std::fs::read_dir(&dir).unwrap() {
        let entry = entry.unwrap();
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with(&prefix) && name.ends_with(".md") {
            return entry.path();
        }
        // Complex item directory
        if name.starts_with(&prefix) || name == id {
            let item_md = entry.path().join("item.md");
            if item_md.exists() { return item_md; }
        }
    }
    panic!("Item file not found for {} in {}/", id, subdir);
}

/// Find a complex item directory by its ID prefix.
fn find_item_dir(base: &Path, id: &str) -> PathBuf {
    let dir = base.join(".cmt/items");
    let prefix = format!("{}-", id);
    for entry in std::fs::read_dir(&dir).unwrap() {
        let entry = entry.unwrap();
        let name = entry.file_name().to_string_lossy().to_string();
        if (name.starts_with(&prefix) || name == id) && entry.path().is_dir() {
            return entry.path();
        }
    }
    panic!("Item directory not found for {}", id);
}

// ============ cmt init ============

#[test]
fn test_init_creates_work_dir() {
    let tmp = TempDir::new().unwrap();
    work_cmd()
        .current_dir(tmp.path())
        .args(["init"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Initialized catchmytask in .cmt/ with prefix CMT"));

    assert!(tmp.path().join(".cmt/config.yml").exists());
    assert!(tmp.path().join(".cmt/items").is_dir());
    assert!(tmp.path().join(".cmt/archive").is_dir());
    assert!(tmp.path().join(".cmt/templates").is_dir());
    assert!(tmp.path().join(".cmt/.gitignore").exists());
}

#[test]
fn test_init_custom_prefix() {
    let tmp = TempDir::new().unwrap();
    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--prefix", "ACME", "--name", "acme-project"])
        .assert()
        .success()
        .stderr(predicate::str::contains("prefix ACME"));

    let config = std::fs::read_to_string(tmp.path().join(".cmt/config.yml")).unwrap();
    assert!(config.contains("prefix: \"ACME\""));
    assert!(config.contains("name: \"acme-project\""));
}

#[test]
fn test_init_already_exists() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["init"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("already exists"));
}

#[test]
fn test_init_force_reinitialize() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--force", "--prefix", "NEW"])
        .assert()
        .success();

    let config = std::fs::read_to_string(tmp.path().join(".cmt/config.yml")).unwrap();
    assert!(config.contains("prefix: \"NEW\""));
}

#[test]
fn test_init_json_output() {
    let tmp = TempDir::new().unwrap();
    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("\"prefix\": \"CMT\""));
}

#[test]
fn test_init_invalid_prefix() {
    let tmp = TempDir::new().unwrap();
    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--prefix", "lowercase"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Invalid prefix"));
}

// ============ cmt --version / --help ============

#[test]
fn test_version() {
    work_cmd()
        .args(["--version"])
        .assert()
        .success()
        .stdout(predicate::str::contains("cmt"));
}

#[test]
fn test_help() {
    work_cmd()
        .args(["--help"])
        .assert()
        .success()
        .stdout(predicate::str::contains("work management system"));
}

// ============ cmt add ============

#[test]
fn test_add_basic() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Fix the login bug"])
        .assert()
        .success()
        .stdout(predicate::str::contains("CMT-0001"));

    // Verify file exists (slugified filename)
    let path = find_item_file(tmp.path(), "CMT-1", "items");
    assert!(path.exists());
    assert!(path.to_string_lossy().contains("CMT-1-fix-login-bug"));
}

#[test]
fn test_add_with_options() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args([
            "add", "Implement auth",
            "--priority", "high",
            "--tag", "team:backend",
            "--due", "2026-03-01",
        ])
        .assert()
        .success();

    let path = find_item_file(tmp.path(), "CMT-1", "items");
    let content = std::fs::read_to_string(path).unwrap();
    assert!(content.contains("priority: high"));
    assert!(content.contains("team:backend"));
    assert!(content.contains("2026-03-01"));
}

#[test]
fn test_add_json_output() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("\"title\": \"Test item\""))
        .stdout(predicate::str::contains("\"status\": \"inbox\""));
}

#[test]
fn test_add_auto_increment() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "First item"])
        .assert()
        .success()
        .stdout(predicate::str::contains("CMT-0001"));

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Second item"])
        .assert()
        .success()
        .stdout(predicate::str::contains("CMT-0002"));
}

#[test]
fn test_add_complex() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Complex investigation", "--complex"])
        .assert()
        .success();

    let dir = find_item_dir(tmp.path(), "CMT-1");
    assert!(dir.join("item.md").exists());
    assert!(dir.join("evidence").is_dir());
    assert!(dir.join("queries").is_dir());
    assert!(dir.join("handover").is_dir());
}

// ============ cmt show ============

#[test]
fn test_show_basic() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-1"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Test item"));
}

#[test]
fn test_show_json() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-1", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("\"title\": \"Test item\""));
}

#[test]
fn test_show_raw() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-1", "--raw"])
        .assert()
        .success()
        .stdout(predicate::str::starts_with("---\n"));
}

#[test]
fn test_show_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    // File is stored as CMT-1.md but display ID is CMT-0001
    // Both forms should work
    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-0001"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Test item"));

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-1"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Test item"));
}

#[test]
fn test_status_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    // Transition using padded ID
    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-0001", "ready"])
        .assert()
        .success()
        .stderr(predicate::str::contains("inbox -> ready"));
}

#[test]
fn test_done_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-0001", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-0001", "active"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["done", "CMT-0001"])
        .assert()
        .success()
        .stderr(predicate::str::contains("active -> done"));
}

#[test]
fn test_edit_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["edit", "CMT-0001", "--set", "priority=high"])
        .assert()
        .success();

    let content = std::fs::read_to_string(find_item_file(tmp.path(), "CMT-1", "items")).unwrap();
    assert!(content.contains("priority: high"));
}

#[test]
fn test_log_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["log", "CMT-0001"])
        .assert()
        .success()
        .stdout(predicate::str::contains("created").or(predicate::str::contains("status_change")));
}

#[test]
fn test_delete_padded_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["delete", "CMT-0001", "--force"])
        .assert()
        .success();

    // Item should be gone - no file matching CMT-1 in items
    let items_dir = tmp.path().join(".cmt/items");
    assert!(!std::fs::read_dir(&items_dir).unwrap().any(|e| {
        e.unwrap().file_name().to_string_lossy().starts_with("CMT-1")
    }));
}

#[test]
fn test_show_not_found() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-9999"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("not found"))
        .code(3);
}

// ============ cmt status ============

#[test]
fn test_status_valid_transition() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "ready"])
        .assert()
        .success()
        .stderr(predicate::str::contains("inbox -> ready"));
}

#[test]
fn test_status_invalid_transition() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "done"])
        .assert()
        .failure()
        .code(4)
        .stderr(predicate::str::contains("Cannot transition"));
}

#[test]
fn test_status_blocked_requires_reason() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "blocked"])
        .assert()
        .failure()
        .code(5)
        .stderr(predicate::str::contains("--reason is required"));
}

#[test]
fn test_status_blocked_with_reason() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "blocked", "--reason", "Waiting on API"])
        .assert()
        .success();

    // Verify blocked_reason is set in file
    let content = std::fs::read_to_string(find_item_file(tmp.path(), "CMT-1", "items")).unwrap();
    assert!(content.contains("blocked_reason: Waiting on API"));
}

#[test]
fn test_status_force() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "done", "--force"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Forced transition"));
}

// ============ cmt done ============

#[test]
fn test_done_from_active() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["done", "CMT-1"])
        .assert()
        .success()
        .stderr(predicate::str::contains("active -> done"));
}

#[test]
fn test_done_invalid() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["done", "CMT-1"])
        .assert()
        .failure()
        .code(4);
}

// ============ cmt list ============

#[test]
fn test_list_empty() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["list"])
        .assert()
        .success()
        .stderr(predicate::str::contains("0 items"));
}

#[test]
fn test_list_with_items() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "First"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["add", "Second"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("First"))
        .stdout(predicate::str::contains("Second"));
}

#[test]
fn test_list_json() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["list", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("\"title\": \"Test item\""));
}

#[test]
fn test_list_simple() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["list", "--format", "simple"])
        .assert()
        .success()
        .stdout(predicate::str::contains("CMT-0001\tinbox\tTest item"));
}

#[test]
fn test_list_excludes_done() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Active item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["add", "Done item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-2", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-2", "active"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["done", "CMT-2"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["list", "--format", "simple"])
        .assert()
        .success()
        .stdout(predicate::str::contains("Active item"))
        .stdout(predicate::str::contains("Done item").not());
}

// ============ cmt delete ============

#[test]
fn test_delete_with_force() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["delete", "CMT-1", "--force"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Deleted CMT-1"));

    let items_dir = tmp.path().join(".cmt/items");
    assert!(!std::fs::read_dir(&items_dir).unwrap().any(|e| {
        e.unwrap().file_name().to_string_lossy().starts_with("CMT-1")
    }));
}

// ============ cmt reindex ============

#[test]
fn test_reindex() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "First"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["add", "Second"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["reindex", "--force"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Reindexed 2 items"));
}

// ============ cmt check ============

#[test]
fn test_check_valid_project() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["check"])
        .assert()
        .success()
        .stderr(predicate::str::contains("1 items checked"));
}

// ============ cmt completions ============

#[test]
fn test_completions_bash() {
    work_cmd()
        .args(["completions", "bash"])
        .assert()
        .success()
        .stdout(predicate::str::contains("_cmt"));
}

// ============ No .cmt/ dir ============

#[test]
fn test_no_work_dir() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .current_dir(tmp.path())
        .args(["list"])
        .assert()
        .failure()
        .code(1)
        .stderr(predicate::str::contains("No .cmt/ directory found"));
}

// ============ cmt edit ============

#[test]
fn test_edit_set_field() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["edit", "CMT-1", "--set", "priority=high"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Updated CMT-1"));

    let content = std::fs::read_to_string(find_item_file(tmp.path(), "CMT-1", "items")).unwrap();
    assert!(content.contains("priority: high"));
}

#[test]
fn test_edit_add_tag() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["edit", "CMT-1", "--add-tag", "team:backend"])
        .assert()
        .success();

    let content = std::fs::read_to_string(find_item_file(tmp.path(), "CMT-1", "items")).unwrap();
    assert!(content.contains("team:backend"));
}

// ============ cmt archive ============

#[test]
fn test_archive_done_items() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["done", "CMT-1"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["archive", "--done"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Archived CMT-1"));

    let archived = find_item_file(tmp.path(), "CMT-1", "archive");
    assert!(archived.exists());
    let items_dir = tmp.path().join(".cmt/items");
    assert!(!std::fs::read_dir(&items_dir).unwrap().any(|e| {
        e.unwrap().file_name().to_string_lossy().starts_with("CMT-1")
    }));
}

// ============ cmt config ============

#[test]
fn test_config_show() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["config", "show"])
        .assert()
        .success()
        .stdout(predicate::str::contains("prefix"));
}

#[test]
fn test_config_get() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["config", "get", "project.prefix"])
        .assert()
        .success()
        .stdout(predicate::str::contains("CMT"));
}

#[test]
fn test_config_set() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["config", "set", "defaults.priority", "medium"])
        .assert()
        .success();

    let config = std::fs::read_to_string(tmp.path().join(".cmt/config.yml")).unwrap();
    assert!(config.contains("medium"));
}

// ============ cmt search ============

#[test]
fn test_search_basic() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Implement authentication"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["add", "Update documentation"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["search", "authentication"])
        .assert()
        .success()
        .stdout(predicate::str::contains("authentication").or(predicate::str::contains("Implement")));
}

// ============ cmt log ============

#[test]
fn test_log_with_events() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["log", "CMT-1"])
        .assert()
        .success()
        .stdout(predicate::str::contains("created").or(predicate::str::contains("status_change")));
}

#[test]
fn test_log_json_output() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["log", "CMT-1", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("\"action\""));
}

#[test]
fn test_log_not_found() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["log", "CMT-9999"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("not found"));
}

#[test]
fn test_log_limit() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test item"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "ready"]).assert().success();
    work_cmd().current_dir(tmp.path()).args(["status", "CMT-1", "active"]).assert().success();

    // Limit to 1 event
    work_cmd()
        .current_dir(tmp.path())
        .args(["log", "CMT-1", "--limit", "1"])
        .assert()
        .success();
}

// ============ cmt init --global ============

#[test]
fn test_init_global() {
    let tmp = TempDir::new().unwrap();
    let xdg_dir = tmp.path().join("xdg_config");

    work_cmd()
        .env("XDG_CONFIG_HOME", xdg_dir.to_str().unwrap())
        .args(["init", "--global"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Created global config"));

    assert!(xdg_dir.join("cmt").join("config.yml").exists());
}

#[test]
fn test_init_global_already_exists() {
    let tmp = TempDir::new().unwrap();
    let xdg_dir = tmp.path().join("xdg_config");
    std::fs::create_dir_all(xdg_dir.join("cmt")).unwrap();
    std::fs::write(xdg_dir.join("cmt").join("config.yml"), "version: 1\n").unwrap();

    work_cmd()
        .env("XDG_CONFIG_HOME", xdg_dir.to_str().unwrap())
        .args(["init", "--global"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("already exists"));
}

#[test]
fn test_init_global_json_output() {
    let tmp = TempDir::new().unwrap();
    let xdg_dir = tmp.path().join("xdg_config");

    work_cmd()
        .env("XDG_CONFIG_HOME", xdg_dir.to_str().unwrap())
        .args(["init", "--global", "--json"])
        .assert()
        .success()
        .stdout(predicate::str::contains("global_config"));
}

// ============ config layering ============

#[test]
fn test_config_local_override() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    // Write a local override
    std::fs::write(
        tmp.path().join(".cmt/config.local.yml"),
        "defaults:\n  priority: high\n",
    )
    .unwrap();

    work_cmd()
        .current_dir(tmp.path())
        .args(["config", "get", "defaults.priority"])
        .assert()
        .success()
        .stdout(predicate::str::contains("high"));
}

#[test]
fn test_config_env_override() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .env("CMT_DEFAULT_PRIORITY", "critical")
        .args(["config", "get", "defaults.priority"])
        .assert()
        .success()
        .stdout(predicate::str::contains("critical"));
}

#[test]
fn test_config_gitignore_includes_local() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let gitignore = std::fs::read_to_string(tmp.path().join(".cmt/.gitignore")).unwrap();
    assert!(gitignore.contains("config.local.yml"));
}

// ============ cmt help-agent ============

#[test]
fn test_help_agent_overview() {
    let output = work_cmd()
        .args(["help-agent", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["tool"], "cmt");
    assert!(json["version"].is_string());
    assert!(json["commands"].is_array());
    // Commands should be a flat list of names (not objects with summaries)
    let commands = json["commands"].as_array().unwrap();
    assert!(commands[0].is_string());
    // help-agent should not list itself in the overview
    let cmd_strs: Vec<&str> = commands.iter().map(|c| c.as_str().unwrap()).collect();
    assert!(!cmd_strs.contains(&"help-agent"));
    assert!(cmd_strs.contains(&"add"));
    assert!(json["usage"].is_string());
    assert!(json["tip"].is_string());
    // global_flags should be present so agents discover --json, --dir, --actor, etc.
    let flags = json["global_flags"].as_array().unwrap();
    assert!(!flags.is_empty());
    let flag_strs: Vec<&str> = flags.iter().map(|f| f["flag"].as_str().unwrap()).collect();
    assert!(flag_strs.iter().any(|f| f.contains("--json")));
    assert!(flag_strs.iter().any(|f| f.contains("--dir")));
    assert!(flag_strs.iter().any(|f| f.contains("--actor")));
    // Each global flag should have a help string
    for f in flags {
        assert!(f["help"].is_string(), "global flag {:?} missing help", f["flag"]);
    }
    // Verify token budget: overview should be under 1200 bytes (~300 tokens)
    assert!(stdout.len() < 1200, "Overview JSON is {} bytes, should be under 1200", stdout.len());
}

#[test]
fn test_help_agent_single_command() {
    let output = work_cmd()
        .args(["help-agent", "add", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["command"], "add");
    assert!(json["options"].is_array());
    assert!(json["examples"].is_array());
    assert!(json["usage"].as_str().unwrap().contains("cmt add"));
}

#[test]
fn test_help_agent_unknown_command() {
    work_cmd()
        .args(["help-agent", "nonexistent"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Unknown command 'nonexistent'"));
}

#[test]
fn test_help_agent_human_output() {
    work_cmd()
        .args(["help-agent", "add"])
        .assert()
        .success()
        .stdout(predicate::str::contains("add"))
        .stdout(predicate::str::contains("Create a new work item"))
        .stdout(predicate::str::contains("Usage:"));
}

#[test]
fn test_help_agent_conventions() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["help-agent", "--conventions", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["prefix"], "CMT");
    assert!(json["states"].is_array());
    assert!(json["transitions"].is_array());
    assert!(json["tag_namespaces"].is_array());
}

#[test]
fn test_help_agent_conventions_requires_work_dir() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .current_dir(tmp.path())
        .args(["help-agent", "--conventions"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("No .cmt/ directory found"));
}

#[test]
fn test_help_agent_all() {
    let output = work_cmd()
        .args(["help-agent", "--all", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert!(json["commands"].is_array());
    let commands = json["commands"].as_array().unwrap();
    assert!(commands.len() >= 14);
    // help-agent should not list itself in --all (consistent with tier 0)
    let names: Vec<&str> = commands.iter().map(|c| c["name"].as_str().unwrap()).collect();
    assert!(!names.contains(&"help-agent"), "--all should not include help-agent");
    assert!(names.contains(&"add"));
}

// ============ discovery files ============

#[test]
fn test_init_generates_about() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let about_path = tmp.path().join(".cmt/ABOUT.md");
    assert!(about_path.exists());

    let content = std::fs::read_to_string(about_path).unwrap();
    assert!(content.contains("Auto-generated by catchmytask"));
    assert!(content.contains("Prefix: CMT"));
}

#[test]
fn test_init_generates_conventions() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let conv_path = tmp.path().join(".cmt/CONVENTIONS.md");
    assert!(conv_path.exists());

    let content = std::fs::read_to_string(conv_path).unwrap();
    assert!(content.contains("Auto-generated by catchmytask"));
    assert!(content.contains("Default prefix: CMT"));
    assert!(content.contains("inbox (initial)"));
    assert!(content.contains("done (terminal)"));
    assert!(content.contains("inbox -> ready"));
}

#[test]
fn test_config_set_regenerates_conventions() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    // Default priority is "none"
    let content = std::fs::read_to_string(tmp.path().join(".cmt/CONVENTIONS.md")).unwrap();
    assert!(content.contains("priority: none"));

    // Change default priority
    work_cmd()
        .current_dir(tmp.path())
        .args(["config", "set", "defaults.priority", "high"])
        .assert()
        .success();

    // Conventions file should be updated
    let content = std::fs::read_to_string(tmp.path().join(".cmt/CONVENTIONS.md")).unwrap();
    assert!(content.contains("priority: high"));
}

#[test]
fn test_init_force_regenerates_discovery() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    // Delete discovery files
    std::fs::remove_file(tmp.path().join(".cmt/ABOUT.md")).unwrap();
    std::fs::remove_file(tmp.path().join(".cmt/CONVENTIONS.md")).unwrap();

    // Force reinit
    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--force"])
        .assert()
        .success();

    // Files should be regenerated
    assert!(tmp.path().join(".cmt/ABOUT.md").exists());
    assert!(tmp.path().join(".cmt/CONVENTIONS.md").exists());
}

#[test]
fn test_help_agent_alias_resolution() {
    // Using alias "ls" should resolve to "list" command details
    let output = work_cmd()
        .args(["help-agent", "ls", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["command"], "list");
}

#[test]
fn test_help_agent_conflicting_flags() {
    // --conventions + command name should fail
    work_cmd()
        .args(["help-agent", "--conventions", "add"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Cannot combine"));

    // --all + command name should fail
    work_cmd()
        .args(["help-agent", "--all", "add"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Cannot combine"));
}

#[test]
fn test_help_agent_config_subcommands() {
    let output = work_cmd()
        .args(["help-agent", "config", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["command"], "config");
    // Config should expose subcommands (show, get, set)
    let subcmds = json["subcommands"].as_array().unwrap();
    let names: Vec<&str> = subcmds.iter().map(|s| s["name"].as_str().unwrap()).collect();
    assert!(names.contains(&"show"));
    assert!(names.contains(&"get"));
    assert!(names.contains(&"set"));
}

#[test]
fn test_help_agent_option_descriptions() {
    let output = work_cmd()
        .args(["help-agent", "add", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let options = json["options"].as_array().unwrap();
    // At least one option should have a help field
    let has_help = options.iter().any(|o| o.get("help").is_some());
    assert!(has_help, "Expected at least one option with a 'help' description");
}

#[test]
fn test_help_agent_compact_json() {
    // All JSON output should be compact (single line, no pretty printing)
    let output = work_cmd()
        .args(["help-agent", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let lines: Vec<&str> = stdout.trim().lines().collect();
    assert_eq!(lines.len(), 1, "Overview JSON should be a single compact line");

    // --compact flag should be accepted (JSON is already compact by default)
    let output2 = work_cmd()
        .args(["help-agent", "--json", "--compact"])
        .assert()
        .success();

    let stdout2 = String::from_utf8(output2.get_output().stdout.clone()).unwrap();
    let lines2: Vec<&str> = stdout2.trim().lines().collect();
    assert_eq!(lines2.len(), 1, "Compact JSON should be a single line");
}

// ============ JSON error output ============

#[test]
fn test_json_error_not_found() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-9999", "--json"])
        .assert()
        .failure()
        .code(3);

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert!(json["error"].as_str().unwrap().contains("not found"));
    assert_eq!(json["code"], 3);
}

#[test]
fn test_json_error_invalid_transition() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());
    work_cmd().current_dir(tmp.path()).args(["add", "Test"]).assert().success();

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["status", "CMT-1", "done", "--json"])
        .assert()
        .failure()
        .code(4);

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert!(json["error"].as_str().unwrap().contains("Cannot transition"));
    assert_eq!(json["code"], 4);
}

#[test]
fn test_json_error_no_work_dir() {
    let tmp = TempDir::new().unwrap();

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["list", "--json"])
        .assert()
        .failure()
        .code(1);

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert!(json["error"].as_str().unwrap().contains("No .cmt/ directory"));
    assert_eq!(json["code"], 1);
}

#[test]
fn test_plain_error_stays_on_stderr() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    // Without --json, error should be on stderr, not stdout
    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["show", "CMT-9999"])
        .assert()
        .failure();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    assert!(stdout.is_empty(), "Plain error should not produce stdout");
}

// ============ state ordering ============

#[test]
fn test_conventions_state_ordering() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let content = std::fs::read_to_string(tmp.path().join(".cmt/CONVENTIONS.md")).unwrap();
    // Terminal states (done, cancelled) should appear after non-terminal states
    let active_pos = content.find("- active").unwrap();
    let done_pos = content.find("- done (terminal)").unwrap();
    let cancelled_pos = content.find("- cancelled (terminal)").unwrap();
    assert!(active_pos < done_pos, "active should appear before done");
    assert!(active_pos < cancelled_pos, "active should appear before cancelled");
}

#[test]
fn test_conventions_json_state_ordering() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["help-agent", "--conventions", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let states: Vec<&str> = json["states"].as_array().unwrap()
        .iter().map(|s| s.as_str().unwrap()).collect();

    // Non-terminal states should come before terminal states
    let active_idx = states.iter().position(|&s| s == "active").unwrap();
    let done_idx = states.iter().position(|&s| s == "done").unwrap();
    let cancelled_idx = states.iter().position(|&s| s == "cancelled").unwrap();
    assert!(active_idx < done_idx, "active should be before done, got {:?}", states);
    assert!(active_idx < cancelled_idx, "active should be before cancelled, got {:?}", states);
}

// ============ template enhancements ============

#[test]
fn test_init_creates_default_templates() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    assert!(tmp.path().join(".cmt/templates/bug.md").exists());
    assert!(tmp.path().join(".cmt/templates/feature.md").exists());
    assert!(tmp.path().join(".cmt/templates/task.md").exists());

    let bug = std::fs::read_to_string(tmp.path().join(".cmt/templates/bug.md")).unwrap();
    assert!(bug.contains("type: bug"));
    assert!(bug.contains("priority: high"));
    assert!(bug.contains("## Steps to Reproduce"));
}

#[test]
fn test_add_template_applies_frontmatter_defaults() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["type"], "bug");
    assert_eq!(json["priority"], "high");

    let tags = json["tags"].as_array().unwrap();
    assert!(tags.iter().any(|t| t.as_str() == Some("bug")));
}

#[test]
fn test_add_template_cli_overrides_defaults() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug", "--priority", "critical", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["type"], "bug");
    assert_eq!(json["priority"], "critical");
}

#[test]
fn test_add_template_cli_overrides_type() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug", "-t", "incident", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["type"], "incident");
}

#[test]
fn test_add_template_body_applied() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug"])
        .assert()
        .success();

    let item_file = find_item_file(tmp.path(), "CMT-1", "items");
    let content = std::fs::read_to_string(&item_file).unwrap();
    assert!(content.contains("## Steps to Reproduce"));
    assert!(content.contains("## Expected Behavior"));
    assert!(content.contains("## Actual Behavior"));
}

#[test]
fn test_add_template_body_overridden_by_cli() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug", "--body", "Custom body"])
        .assert()
        .success();

    let item_file = find_item_file(tmp.path(), "CMT-1", "items");
    let content = std::fs::read_to_string(&item_file).unwrap();
    assert!(content.contains("Custom body"));
    assert!(!content.contains("## Steps to Reproduce"));
}

#[test]
fn test_add_template_variable_substitution() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let template_content = "---\ntype: task\n---\n\nCreated on {{date}} by {{actor}} for {{id}}.\n";
    std::fs::write(tmp.path().join(".cmt/templates/vartest.md"), template_content).unwrap();

    work_cmd()
        .current_dir(tmp.path())
        .env("CMT_ACTOR", "test-agent")
        .args(["add", "Variable test", "--template", "vartest"])
        .assert()
        .success();

    let item_file = find_item_file(tmp.path(), "CMT-1", "items");
    let content = std::fs::read_to_string(&item_file).unwrap();

    assert!(content.contains("by test-agent"));
    assert!(content.contains("for CMT-0001"));
    assert!(!content.contains("{{date}}"));
    assert!(!content.contains("{{actor}}"));
    assert!(!content.contains("{{id}}"));
}

#[test]
fn test_add_template_feature() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Dark mode", "--template", "feature", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["type"], "feature");
    assert_eq!(json["priority"], "medium");
}

#[test]
fn test_help_agent_conventions_includes_templates() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["help-agent", "--conventions", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();

    let templates = json["templates"].as_array().unwrap();
    let names: Vec<&str> = templates.iter().map(|v| v.as_str().unwrap()).collect();
    assert!(names.contains(&"bug"));
    assert!(names.contains(&"feature"));
    assert!(names.contains(&"task"));
}

#[test]
fn test_help_agent_conventions_human_includes_templates() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["help-agent", "--conventions"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    assert!(stdout.contains("Templates:"));
    assert!(stdout.contains("bug"));
}

#[test]
fn test_init_force_does_not_overwrite_custom_templates() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    std::fs::write(tmp.path().join(".cmt/templates/bug.md"), "custom bug").unwrap();

    work_cmd()
        .current_dir(tmp.path())
        .args(["init", "--force"])
        .assert()
        .success();

    let content = std::fs::read_to_string(tmp.path().join(".cmt/templates/bug.md")).unwrap();
    assert_eq!(content, "custom bug");
}

#[test]
fn test_add_template_with_assignee_default() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let template_content = "---\ntype: task\nassignee: default-user\ntags: [review]\n---\n\n## Review\n";
    std::fs::write(tmp.path().join(".cmt/templates/review.md"), template_content).unwrap();

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Review PR", "--template", "review", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["assignee"], "default-user");
    let tags = json["tags"].as_array().unwrap();
    assert!(tags.iter().any(|t| t.as_str() == Some("review")));
}

#[test]
fn test_add_template_cli_tags_override() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Login fails", "--template", "bug", "--tag", "team:backend", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let tags = json["tags"].as_array().unwrap();
    assert!(tags.iter().any(|t| t.as_str() == Some("team:backend")));
    assert!(!tags.iter().any(|t| t.as_str() == Some("bug")));
}

// ============ security edge cases ============

#[test]
fn test_add_template_path_traversal() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Bad item", "--template", "../../../etc/passwd"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("path separators"));
}

#[test]
fn test_show_path_traversal_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["show", "../../../etc/passwd"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("error"));
}

#[test]
fn test_delete_path_traversal_id() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    // Delete command handles not-found gracefully (returns Ok for batch operations)
    // but the item must not be deleted and an error must be reported
    work_cmd()
        .current_dir(tmp.path())
        .args(["delete", "../../../etc/passwd", "--force"])
        .assert()
        .success()
        .stderr(predicate::str::contains("not found"));
}

// ============ cmt setup ============

#[test]
fn test_setup_list_json() {
    let tmp = TempDir::new().unwrap();

    let output = work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--list", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert!(json["integrations"].is_array());
    let integrations = json["integrations"].as_array().unwrap();
    assert!(!integrations.is_empty());
    assert_eq!(integrations[0]["name"], "claude-code");
    assert!(integrations[0]["path"].is_string());
}

#[test]
fn test_setup_list_human() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("claude-code"));
}

#[test]
fn test_setup_claude_code_install() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--claude-code"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Installed Claude Code skill"));

    let skill_path = tmp.path().join(".claude/skills/managing-work/SKILL.md");
    assert!(skill_path.exists());

    let content = std::fs::read_to_string(&skill_path).unwrap();
    assert!(content.starts_with("---\nname: managing-work"));
}

#[test]
fn test_setup_claude_code_json() {
    let tmp = TempDir::new().unwrap();

    let output = work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--claude-code", "--json"])
        .assert()
        .success();

    let stdout = String::from_utf8(output.get_output().stdout.clone()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    assert_eq!(json["integration"], "claude-code");
    assert_eq!(json["action"], "created");
    assert!(json["path"].as_str().unwrap().contains("managing-work"));
}

#[test]
fn test_setup_claude_code_idempotent() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--claude-code"])
        .assert()
        .success();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--claude-code"])
        .assert()
        .success()
        .stderr(predicate::str::contains("already up to date"));
}

#[test]
fn test_setup_remove_claude_code() {
    let tmp = TempDir::new().unwrap();

    // Install first
    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--claude-code"])
        .assert()
        .success();

    let skill_path = tmp.path().join(".claude/skills/managing-work/SKILL.md");
    assert!(skill_path.exists());

    // Remove
    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--remove", "claude-code"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Removed Claude Code skill"));

    assert!(!skill_path.exists());
}

#[test]
fn test_setup_remove_not_installed() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--remove", "claude-code"])
        .assert()
        .success()
        .stderr(predicate::str::contains("not installed"));
}

#[test]
fn test_setup_remove_unknown_integration() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--remove", "nonexistent"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Unknown integration"));
}

#[test]
fn test_setup_all() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup", "--all"])
        .assert()
        .success();

    let skill_path = tmp.path().join(".claude/skills/managing-work/SKILL.md");
    assert!(skill_path.exists());
}

#[test]
fn test_setup_no_flags_shows_list() {
    let tmp = TempDir::new().unwrap();

    work_cmd()
        .env("HOME", tmp.path().to_str().unwrap())
        .args(["setup"])
        .assert()
        .success()
        .stdout(predicate::str::contains("claude-code"));
}

// ============ cmt comment ============

#[test]
fn test_comment_add() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item for comments"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "This is a comment", "--actor", "alice"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Added comment c1 to CMT-1"));
}

#[test]
fn test_comment_list() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "First comment", "--actor", "alice"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "--list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("[c1]"))
        .stdout(predicate::str::contains("@alice"))
        .stdout(predicate::str::contains("First comment"));
}

#[test]
fn test_comment_reply_to() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "First", "--actor", "alice"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "Reply here", "--reply-to", "c1", "--actor", "bob"])
        .assert()
        .success()
        .stderr(predicate::str::contains("Added comment c2 to CMT-1"));

    // Verify reply shows in list
    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "--list"])
        .assert()
        .success()
        .stdout(predicate::str::contains("(reply to c1)"));
}

#[test]
fn test_comment_list_json() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "JSON test comment", "--actor", "agent-1"])
        .assert()
        .success();

    let output = work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "--list", "--json"])
        .assert()
        .success()
        .get_output()
        .stdout
        .clone();

    let json: serde_json::Value = serde_json::from_slice(&output).unwrap();
    assert_eq!(json["item_id"], "CMT-1");
    let comments = json["comments"].as_array().unwrap();
    assert_eq!(comments.len(), 1);
    assert_eq!(comments[0]["id"], "c1");
    assert_eq!(comments[0]["author"], "agent-1");
    assert_eq!(comments[0]["body"], "JSON test comment");
}

#[test]
fn test_comment_persists_in_file() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "Persistent comment", "--actor", "alice"])
        .assert()
        .success();

    // Read the file directly and verify comment is there
    let file_path = find_item_file(tmp.path(), "CMT-1", "items");
    let content = std::fs::read_to_string(&file_path).unwrap();
    assert!(content.contains("## Comments"));
    assert!(content.contains("comment:c1"));
    assert!(content.contains("author:alice"));
    assert!(content.contains("Persistent comment"));
}

#[test]
fn test_comment_invalid_reply_to() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1", "Reply", "--reply-to", "c99", "--actor", "bob"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Comment 'c99' not found"));
}

#[test]
fn test_comment_no_message_no_list() {
    let tmp = TempDir::new().unwrap();
    init_work_dir(tmp.path());

    work_cmd()
        .current_dir(tmp.path())
        .args(["add", "Test item"])
        .assert()
        .success();

    work_cmd()
        .current_dir(tmp.path())
        .args(["comment", "CMT-1"])
        .assert()
        .failure()
        .stderr(predicate::str::contains("Message is required"));
}

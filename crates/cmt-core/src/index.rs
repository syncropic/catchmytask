use std::path::{Path, PathBuf};
use rusqlite::Connection;

use crate::error::Result;
use crate::model::WorkItem;

/// Log a warning to stderr if an index operation fails. Does not propagate the error.
pub fn warn_on_err<T>(result: Result<T>, op: &str) {
    if let Err(e) = result {
        eprintln!("warning: index {}: {}", op, e);
    }
}

pub struct Index {
    pub conn: Connection,
    #[allow(dead_code)]
    pub db_path: PathBuf,
    pub work_dir: PathBuf,
}

impl Index {
    /// Open or create the SQLite index.
    pub fn open(work_dir: &Path) -> Result<Self> {
        let db_path = work_dir.join(".index.db");
        let conn = Connection::open(&db_path)?;

        // Set PRAGMAs
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;
             PRAGMA busy_timeout = 5000;
             PRAGMA mmap_size = 67108864;
             PRAGMA cache_size = -8000;
             PRAGMA temp_store = MEMORY;"
        )?;

        let index = Self {
            conn,
            db_path,
            work_dir: work_dir.to_path_buf(),
        };

        index.ensure_schema()?;
        Ok(index)
    }

    fn ensure_schema(&self) -> Result<()> {
        // Check if schema exists
        let has_meta: bool = self.conn.query_row(
            "SELECT count(*) > 0 FROM sqlite_master WHERE type='table' AND name='_meta'",
            [],
            |row| row.get(0),
        )?;

        if !has_meta {
            self.create_schema()?;
        }

        Ok(())
    }

    fn create_schema(&self) -> Result<()> {
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS _meta (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            INSERT OR IGNORE INTO _meta (key, value) VALUES ('schema_version', '1');

            CREATE TABLE IF NOT EXISTS items (
                id             TEXT    PRIMARY KEY,
                title          TEXT    NOT NULL,
                status         TEXT    NOT NULL,
                type           TEXT,
                priority       TEXT,
                assignee       TEXT,
                parent         TEXT,
                due            TEXT,
                created_at     TEXT    NOT NULL,
                started_at     TEXT,
                completed_at   TEXT,
                updated_at     TEXT,
                blocked_reason TEXT,
                body_text      TEXT,
                archived       INTEGER NOT NULL DEFAULT 0,
                file_path      TEXT    NOT NULL,
                body_hash      TEXT,
                file_mtime     TEXT,
                indexed_at     TEXT    NOT NULL
            );

            CREATE TABLE IF NOT EXISTS item_tags (
                item_id   TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                tag       TEXT NOT NULL,
                namespace TEXT,
                value     TEXT,
                PRIMARY KEY (item_id, tag)
            );

            CREATE TABLE IF NOT EXISTS item_deps (
                item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                depends_on TEXT NOT NULL,
                PRIMARY KEY (item_id, depends_on)
            );

            CREATE TABLE IF NOT EXISTS item_relations (
                item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                related_id TEXT NOT NULL,
                rel_type   TEXT NOT NULL,
                PRIMARY KEY (item_id, related_id, rel_type)
            );

            CREATE TABLE IF NOT EXISTS events (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id    TEXT    NOT NULL,
                timestamp  TEXT    NOT NULL,
                actor      TEXT,
                action     TEXT    NOT NULL,
                detail     TEXT
            );

            CREATE TABLE IF NOT EXISTS id_counters (
                prefix      TEXT    PRIMARY KEY,
                next_number INTEGER NOT NULL DEFAULT 1
            );

            CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
            CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
            CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
            CREATE INDEX IF NOT EXISTS idx_items_assignee ON items(assignee);
            CREATE INDEX IF NOT EXISTS idx_items_parent ON items(parent);
            CREATE INDEX IF NOT EXISTS idx_items_archived ON items(archived);
            CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at);
            CREATE INDEX IF NOT EXISTS idx_items_due ON items(due);
            CREATE INDEX IF NOT EXISTS idx_items_active_created ON items(archived, status, created_at);
            CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag);
            CREATE INDEX IF NOT EXISTS idx_item_tags_namespace ON item_tags(namespace);
            CREATE INDEX IF NOT EXISTS idx_item_deps_depends_on ON item_deps(depends_on);
            CREATE INDEX IF NOT EXISTS idx_item_relations_related ON item_relations(related_id);
            CREATE INDEX IF NOT EXISTS idx_events_item_id ON events(item_id);
            CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
            CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor);

            CREATE TABLE IF NOT EXISTS comments (
                id         TEXT NOT NULL,
                item_id    TEXT NOT NULL,
                author     TEXT NOT NULL,
                body       TEXT NOT NULL,
                reply_to   TEXT,
                created_at TEXT NOT NULL,
                PRIMARY KEY (item_id, id)
            );
            CREATE INDEX IF NOT EXISTS idx_comments_item_id ON comments(item_id);
            CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author);"
        )?;

        // Create FTS5 table (regular mode, not external content)
        self.conn.execute_batch(
            "CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
                id,
                title,
                body_text,
                tokenize='porter unicode61'
            );"
        )?;

        Ok(())
    }

    /// Get the next ID for a prefix, atomically incrementing the counter.
    /// Uses IMMEDIATE transaction to prevent concurrent processes from getting the same ID.
    pub fn next_id(&self, prefix: &str) -> Result<u32> {
        self.conn.execute_batch("BEGIN IMMEDIATE")?;

        let result = (|| -> Result<u32> {
            // Try to increment existing counter
            let updated = self.conn.execute(
                "UPDATE id_counters SET next_number = next_number + 1 WHERE prefix = ?1",
                [prefix],
            )?;

            if updated > 0 {
                // Get the value we just incremented from (next_number - 1)
                let number: u32 = self.conn.query_row(
                    "SELECT next_number - 1 FROM id_counters WHERE prefix = ?1",
                    [prefix],
                    |row| row.get(0),
                )?;
                return Ok(number);
            }

            // Counter doesn't exist, bootstrap from files
            let next = crate::storage::next_id_from_files(&self.work_dir, prefix)?;
            self.conn.execute(
                "INSERT OR IGNORE INTO id_counters (prefix, next_number) VALUES (?1, ?2)",
                rusqlite::params![prefix, next],
            )?;
            // Atomically increment (handles concurrent bootstrap)
            self.conn.execute(
                "UPDATE id_counters SET next_number = next_number + 1 WHERE prefix = ?1",
                [prefix],
            )?;
            let number: u32 = self.conn.query_row(
                "SELECT next_number - 1 FROM id_counters WHERE prefix = ?1",
                [prefix],
                |row| row.get(0),
            )?;
            Ok(number)
        })();

        match result {
            Ok(n) => {
                self.conn.execute_batch("COMMIT")?;
                Ok(n)
            }
            Err(e) => {
                let _ = self.conn.execute_batch("ROLLBACK");
                Err(e)
            }
        }
    }

    /// Upsert a work item into the index.
    pub fn upsert_item(
        &self,
        item: &WorkItem,
        body: &str,
        file_path: &str,
        archived: bool,
    ) -> Result<()> {
        let now = chrono::Utc::now().to_rfc3339();
        let id_str = item.id.raw.as_str();

        let assignee_str = item.assignee.as_ref().map(|a| {
            match a {
                crate::model::Assignee::Single(s) => s.clone(),
                crate::model::Assignee::Multiple(v) => serde_json::to_string(v).unwrap_or_default(),
            }
        });

        // Compute body hash
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        hasher.update(body.as_bytes());
        let body_hash = format!("{:x}", hasher.finalize());

        // Get file mtime
        let file_mtime = std::fs::metadata(std::path::Path::new(file_path))
            .ok()
            .and_then(|m| m.modified().ok())
            .map(|t| {
                let dt: chrono::DateTime<chrono::Utc> = t.into();
                dt.to_rfc3339()
            });

        // Wrap all index writes in a savepoint for atomicity
        self.conn.execute_batch("SAVEPOINT upsert_item")?;

        let result = (|| -> Result<()> {
            self.conn.execute(
                "INSERT OR REPLACE INTO items (
                    id, title, status, type, priority, assignee, parent, due,
                    created_at, started_at, completed_at, updated_at, blocked_reason,
                    body_text, archived, file_path, body_hash, file_mtime, indexed_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
                rusqlite::params![
                    id_str,
                    item.title,
                    item.status,
                    item.r#type,
                    item.priority,
                    assignee_str,
                    item.parent,
                    item.due,
                    item.created_at,
                    item.started_at,
                    item.completed_at,
                    item.updated_at,
                    item.blocked_reason,
                    body,
                    archived as i32,
                    file_path,
                    body_hash,
                    file_mtime,
                    now,
                ],
            )?;

            // Update normalized tables
            self.conn.execute("DELETE FROM item_tags WHERE item_id = ?1", [id_str])?;
            for tag in &item.tags {
                let (namespace, value) = decompose_tag(tag);
                self.conn.execute(
                    "INSERT OR IGNORE INTO item_tags (item_id, tag, namespace, value) VALUES (?1, ?2, ?3, ?4)",
                    rusqlite::params![id_str, tag, namespace, value],
                )?;
            }

            self.conn.execute("DELETE FROM item_deps WHERE item_id = ?1", [id_str])?;
            for dep in &item.depends_on {
                self.conn.execute(
                    "INSERT OR IGNORE INTO item_deps (item_id, depends_on) VALUES (?1, ?2)",
                    rusqlite::params![id_str, dep],
                )?;
            }

            self.conn.execute("DELETE FROM item_relations WHERE item_id = ?1", [id_str])?;
            for rel in &item.related {
                self.conn.execute(
                    "INSERT OR IGNORE INTO item_relations (item_id, related_id, rel_type) VALUES (?1, ?2, ?3)",
                    rusqlite::params![id_str, rel.id, rel.r#type],
                )?;
            }

            // Update comments
            self.conn.execute("DELETE FROM comments WHERE item_id = ?1", [id_str])?;
            let parsed_comments = crate::comments::parse_comments(body);
            for c in &parsed_comments {
                self.conn.execute(
                    "INSERT OR IGNORE INTO comments (id, item_id, author, body, reply_to, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    rusqlite::params![c.id, id_str, c.author, c.body, c.reply_to, c.date],
                )?;
            }

            // Update FTS
            self.sync_fts_for_item(id_str)?;

            Ok(())
        })();

        match result {
            Ok(()) => {
                self.conn.execute_batch("RELEASE upsert_item")?;
                Ok(())
            }
            Err(e) => {
                let _ = self.conn.execute_batch("ROLLBACK TO upsert_item");
                Err(e)
            }
        }
    }

    fn sync_fts_for_item(&self, id: &str) -> Result<()> {
        // Delete old FTS entry
        self.conn.execute(
            "DELETE FROM items_fts WHERE id = ?1",
            [id],
        )?;
        // Insert new
        self.conn.execute(
            "INSERT INTO items_fts (id, title, body_text)
             SELECT id, title, body_text FROM items WHERE id = ?1",
            [id],
        )?;
        Ok(())
    }

    /// Record an event.
    pub fn record_event(
        &self,
        item_id: &str,
        actor: Option<&str>,
        action: &str,
        detail: Option<&serde_json::Value>,
    ) -> Result<()> {
        let now = chrono::Utc::now().to_rfc3339();
        let detail_str = detail.map(|d| serde_json::to_string(d).unwrap_or_default());
        self.conn.execute(
            "INSERT INTO events (item_id, timestamp, actor, action, detail)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![item_id, now, actor, action, detail_str],
        )?;
        Ok(())
    }

    /// Get comments for a work item from the index.
    pub fn get_comments(&self, item_id: &str) -> Result<Vec<crate::comments::Comment>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, author, body, reply_to, created_at FROM comments WHERE item_id = ?1 ORDER BY id"
        )?;
        let rows = stmt.query_map([item_id], |row| {
            Ok(crate::comments::Comment {
                id: row.get(0)?,
                author: row.get(1)?,
                body: row.get(2)?,
                reply_to: row.get(3)?,
                date: row.get(4)?,
            })
        })?;
        let mut comments = Vec::new();
        for row in rows {
            comments.push(row?);
        }
        Ok(comments)
    }

    /// Remove an item from the index.
    pub fn remove_item(&self, id: &str) -> Result<()> {
        self.conn.execute("DELETE FROM items_fts WHERE id = ?1", [id])?;
        self.conn.execute("DELETE FROM comments WHERE item_id = ?1", [id])?;
        self.conn.execute("DELETE FROM items WHERE id = ?1", [id])?;
        Ok(())
    }

    /// Perform a full reindex from files.
    pub fn full_reindex(&self) -> Result<(u32, u32, u32)> {
        let files = crate::storage::scan_item_files(&self.work_dir)?;

        // Clear everything
        self.conn.execute_batch(
            "DELETE FROM items_fts;
             DELETE FROM comments;
             DELETE FROM item_tags;
             DELETE FROM item_deps;
             DELETE FROM item_relations;
             DELETE FROM items;
             DELETE FROM id_counters;"
        )?;

        let mut items_count = 0u32;
        let mut archived_count = 0u32;
        let mut error_count = 0u32;

        // Track max IDs per prefix
        let mut max_ids: std::collections::HashMap<String, u32> = std::collections::HashMap::new();

        for file in &files {
            let content = match std::fs::read_to_string(file) {
                Ok(c) => c,
                Err(_) => { error_count += 1; continue; }
            };
            let (item, body) = match crate::parser::parse_file(&content) {
                Ok(r) => r,
                Err(_) => { error_count += 1; continue; }
            };

            let file_str = file.to_string_lossy().to_string();
            let archived = file_str.contains("/archive/");

            self.upsert_item(&item, &body, &file_str, archived)?;

            if archived {
                archived_count += 1;
            } else {
                items_count += 1;
            }

            // Track max ID per prefix
            let entry = max_ids.entry(item.id.prefix.clone()).or_insert(0);
            if item.id.number > *entry {
                *entry = item.id.number;
            }
        }

        // Rebuild id_counters
        for (prefix, max_num) in &max_ids {
            self.conn.execute(
                "INSERT OR REPLACE INTO id_counters (prefix, next_number) VALUES (?1, ?2)",
                rusqlite::params![prefix, max_num + 1],
            )?;
        }

        Ok((items_count, archived_count, error_count))
    }

    /// Incremental sync: check files for changes.
    pub fn incremental_sync(&self) -> Result<()> {
        let files = crate::storage::scan_item_files(&self.work_dir)?;

        // Build set of current files
        let mut current_files: std::collections::HashSet<String> = std::collections::HashSet::new();

        for file in &files {
            let file_str = file.to_string_lossy().to_string();
            current_files.insert(file_str.clone());

            // Check mtime
            let stored_mtime: Option<String> = self.conn.query_row(
                "SELECT file_mtime FROM items WHERE file_path = ?1",
                [&file_str],
                |row| row.get(0),
            ).ok();

            let current_mtime = std::fs::metadata(file)
                .ok()
                .and_then(|m| m.modified().ok())
                .map(|t| {
                    let dt: chrono::DateTime<chrono::Utc> = t.into();
                    dt.to_rfc3339()
                });

            if stored_mtime == current_mtime && stored_mtime.is_some() {
                continue; // Fast path: mtime unchanged
            }

            // Re-parse and update
            let content = match std::fs::read_to_string(file) {
                Ok(c) => c,
                Err(_) => continue,
            };
            let (item, body) = match crate::parser::parse_file(&content) {
                Ok(r) => r,
                Err(_) => continue,
            };

            let archived = file_str.contains("/archive/");
            self.upsert_item(&item, &body, &file_str, archived)?;
        }

        // Remove index entries for deleted files
        let mut stmt = self.conn.prepare("SELECT id, file_path FROM items")?;
        let indexed: Vec<(String, String)> = stmt.query_map([], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?.filter_map(|r| r.ok()).collect();

        for (id, path) in indexed {
            if !current_files.contains(&path) {
                self.remove_item(&id)?;
            }
        }

        Ok(())
    }
}

/// Decompose a tag into namespace and value.
/// "team:backend" -> (Some("team"), Some("backend"))
/// "urgent" -> (None, None)
fn decompose_tag(tag: &str) -> (Option<String>, Option<String>) {
    if let Some(pos) = tag.find(':') {
        let namespace = &tag[..pos];
        let value = &tag[pos + 1..];
        (Some(namespace.to_string()), Some(value.to_string()))
    } else {
        (None, None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_decompose_tag() {
        let (ns, val) = decompose_tag("team:backend");
        assert_eq!(ns.unwrap(), "team");
        assert_eq!(val.unwrap(), "backend");

        let (ns, val) = decompose_tag("urgent");
        assert!(ns.is_none());
        assert!(val.is_none());

        let (ns, val) = decompose_tag("domain:auth/login");
        assert_eq!(ns.unwrap(), "domain");
        assert_eq!(val.unwrap(), "auth/login");
    }
}

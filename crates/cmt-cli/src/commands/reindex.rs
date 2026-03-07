use std::path::Path;

use crate::cli::ReindexArgs;
use cmt_core::error::Result;
use cmt_core::index::Index;

pub fn execute(args: &ReindexArgs, work_dir: &Path, json: bool, quiet: bool) -> Result<()> {
    let start = std::time::Instant::now();

    if args.force {
        // Delete existing index
        let db_path = work_dir.join(".index.db");
        if db_path.exists() {
            std::fs::remove_file(&db_path)?;
        }
        // Also remove WAL and SHM files
        let wal = work_dir.join(".index.db-wal");
        let shm = work_dir.join(".index.db-shm");
        if wal.exists() { std::fs::remove_file(&wal)?; }
        if shm.exists() { std::fs::remove_file(&shm)?; }
    }

    let index = Index::open(work_dir)?;
    let (items, archived, errors) = index.full_reindex()?;

    let duration = start.elapsed();
    let duration_ms = duration.as_millis();

    if json {
        let output = serde_json::json!({
            "items": items,
            "archived": archived,
            "errors": errors,
            "warnings": 0,
            "duration_ms": duration_ms,
        });
        println!("{}", serde_json::to_string_pretty(&output)?);
    } else if !quiet {
        eprintln!(
            "Reindexed {} items ({} archived) in {}ms",
            items, archived, duration_ms
        );
    }

    Ok(())
}

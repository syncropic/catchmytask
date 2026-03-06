# Design: Artifact Browsing and Management

**Status**: Draft v2 — incorporates critical review of v1
**Created**: 2026-03-05
**References**: Spec 01 (Work Item Schema), Spec 05 (SQLite Index)

---

## 0. Critical Analysis of v1

This section captures the strengths, weaknesses, and gaps identified in the first draft,
and how v2 addresses each. Every improvement in v2 is traceable to a specific finding here.

### Strengths (retained in v2)

| # | Strength | Why it matters |
|---|---|---|
| S1 | Files as source of truth — no blob DB | Aligns with core principle; git-compatible; agents and editors work naturally |
| S2 | Zero-config discovery via directory scan | Progressive: works out of the box for any complex item |
| S3 | Size-tiered serving strategy | Right tool for each size class; avoids one-size-fits-all |
| S4 | Path traversal + symlink security model | Critical for a file-serving endpoint; well-specified |
| S5 | Extension field for optional `artifacts` metadata | No schema breaking change; opt-in richness |
| S6 | Reuse of existing file watcher for WS events | Low implementation cost; consistent architecture |
| S7 | CLI `cmt artifacts` as first-class command | Agents need structured access; humans need quick access |
| S8 | Browser-native caching (ETag + Cache-Control) | Avoids reinventing caching; works with CDNs if ever needed |
| S9 | No upload endpoint rationale | Avoids significant complexity; filesystem write path is natural |
| S10 | Taxonomy by structure/size/behavior/location | Good mental model; drives viewer and caching decisions |

### Weaknesses (fixed in v2)

| # | Weakness | Problem | v2 Fix |
|---|---|---|---|
| W1 | Simple items are invisible to artifacts | Only complex items (folders) have artifacts. A simple `.md` file with `![img](../assets/x.png)` has no artifact story. | v2 introduces **dataref** — a lightweight reference system that works for both simple and complex items. Any item can declare artifact refs without becoming complex. |
| W2 | No artifact count in list/item API responses | The web UI needs a second roundtrip to know if an item has artifacts. Artifact indicators (paperclip icon) require fetching every item's artifacts separately — O(n) requests. | v2 adds `artifact_count` to `ItemResponse` computed during item scan. For complex items: count non-`item.md` files. For simple items: count frontmatter `refs` entries. |
| W3 | SHA-256 ETag computed per-request, not cached | Hashing file content on every request is expensive for large files. OS `mtime` + `size` is a perfectly valid ETag for local-first tool. | v2 uses **weak ETag** from `mtime_ms:size` — zero I/O beyond stat. SHA-256 only when content-addressed caching is explicitly needed. |
| W4 | `?meta=true` query param overloads content endpoint | Same URL returns different shapes depending on query param. Breaks REST conventions, confuses caching proxies, makes client code awkward. | v2 removes `?meta=true`. Metadata is always included in the artifact list response. If you need one file's metadata, filter client-side from the list. |
| W5 | CSV viewer "first 1000 rows" is arbitrary | No way for client to request a specific range. No cursor. No way to know total rows without loading the whole file. | v2 specifies **line-range pagination** with `Range: lines=0-99` header (custom range unit) and `Content-Range: lines 0-99/5000` response. Total line count in list metadata for text files. |
| W6 | Frontmatter `artifacts` field duplicates filesystem | If both frontmatter and filesystem disagree, which wins? Merge strategy is underspecified. What if a declared file is deleted? What if an undeclared file exists? | v2 replaces frontmatter `artifacts` with lightweight `refs` for external/remote references only. Local files are always discovered from disk. No merge conflict possible. |
| W7 | No consideration of archived items | Archived complex items in `.cmt/archive/` also have artifacts. The API design doesn't mention how to serve them. | v2 explicitly scopes artifact endpoints to resolve items in both `items/` and `archive/`. Same path resolution as `storage::resolve_item_path`. |
| W8 | Markdown link resolution only handles `![](...)` | `[link](file.sql)` also references artifacts but gets different treatment than images. Internal links between items (`[CMT-43](../CMT-43/item.md)`) need resolution too. | v2 specifies a unified link resolver: images render inline, local files open viewer, item refs navigate to item, external links open in new tab. |
| W9 | No error states in web UI | What happens when an artifact fails to load? Network timeout? File deleted between list and open? Permission denied? | v2 specifies error states for each viewer type: placeholder with retry for images, error banner for text, fallback to download for any failure. |
| W10 | Phased implementation defers too much to "later" | Phase 1 has no artifact count indicator and no inline image rendering — two features that make artifacts feel integrated rather than bolted on. | v2 rebalances phases: MVP includes artifact count in item responses and inline image rendering. |

### Gaps (new in v2)

| # | Gap | What was missing | v2 Addition |
|---|---|---|---|
| G1 | No story for simple items referencing artifacts | A solo developer using simple items (`CMT-1.md`) can't attach files without converting to complex. But they can reference images in their repo. | v2 `refs` field in frontmatter: `refs: [{path: "docs/diagram.png", label: "Architecture"}]`. Works for simple items. Points anywhere in repo or external. |
| G2 | No project-level artifact browsing | Can only browse artifacts per-item. No way to see "all screenshots across all items" or "all SQL queries in this project". | v2 adds `GET /api/artifacts?project={name}` — project-wide artifact listing with filtering by mime, category, item. |
| G3 | No consideration of `catchmytask.com` (hosted) mode | The design assumes `cmt serve` (local). On `catchmytask.com` with local backend detected, artifact URLs need to point to the local server, not the hosted site. | v2 specifies that artifact content URLs use the same base URL as the API connection (from `useConnectionStore`). When connected to `127.0.0.1:3170`, artifact URLs resolve there. |
| G4 | No agent artifact workflow | How does a Claude Code agent attach an artifact? Create evidence? The CLI has `--complex` but no `cmt artifacts add` or guidance. | v2 specifies `cmt artifacts add CMT-42 path/to/file [--category evidence]` — copies or moves a file into the item's artifact directory, auto-converting to complex if needed. |
| G5 | Artifact preview in board/list cards | Artifact count indicator is nice but items with screenshots could show a tiny preview thumbnail in the card. | v2 includes optional preview: if item has exactly 1 image artifact, its URL is included in the list response as `preview_url`. Board cards can optionally show it. |
| G6 | No depth limit on directory scan | A complex item could contain deeply nested directories (e.g., `node_modules/` accidentally dropped in). | v2 limits scan to 2 levels deep and 100 files max per item. Deeper structures require explicit `refs`. |
| G7 | No `.cmtignore` or artifact exclusion | Binary build artifacts, `.DS_Store`, `__pycache__` could pollute the artifact list. | v2 specifies default exclusions (hidden files, common junk patterns) and optional `.cmtignore` in item directory. |
| G8 | File watcher only emits for `.md` files | Current watcher filters `p.extension() == "md"`. Non-markdown artifact changes are silently ignored. | v2 extends watcher to emit for all file changes within complex item directories, with event type `artifact_changed` for non-`.md` files. |
| G9 | No consideration of binary-safe text detection | How does the server decide if a file is text (syntax-highlight) vs binary (download)? Extension alone isn't reliable. | v2 specifies: check first 8KB for null bytes. If null bytes found → binary. Otherwise → text. Extension-based MIME is primary; null-byte check is fallback for unknown extensions. |

---

## 1. Problem Statement

CatchMyTask work items reference supporting files — screenshots, logs, SQL queries, CSV
exports, diagrams, handover documents. These live in complex item folders, elsewhere in the
repo, or at external URLs. Today:

- No way to browse or view artifacts in the web UI or CLI
- No API endpoints for serving artifact content
- No structured way for simple items to reference artifacts
- No distinction between artifact types for rendering/interaction
- No artifact awareness in list/board views (items with attachments look identical to bare items)

This design specifies how artifacts are discovered, served, displayed, and interacted with
across CLI, web UI, and plain-text files.

---

## 2. Design Principles

1. **Files remain source of truth** — artifacts are files on disk, not blobs in a database
2. **Discovery over declaration** — local artifacts are found by scanning; declaration is opt-in enrichment
3. **Simple items can reference, complex items can contain** — both have an artifact story
4. **Actor-agnostic** — agents and humans create artifacts the same way (write files)
5. **Git-compatible** — artifacts are versionable, diffable (where applicable)
6. **Read-heavy** — browsing and viewing vastly outnumber writes; optimize for reads
7. **Graceful degradation** — if an artifact fails to load, the item still works

---

## 3. Artifact Model

### 3.1 Two Sources of Artifacts

**Contained artifacts** (complex items only):
Files inside the item's directory that are not `item.md`.

```
.cmt/items/CMT-42-fix-login-bug/
  item.md
  evidence/screenshot.png       ← contained artifact
  queries/find-user.sql         ← contained artifact
```

Discovered automatically by directory scan. No frontmatter needed.

**Referenced artifacts** (any item, simple or complex):
Declared in frontmatter via the `refs` field. Points to files anywhere — in the repo,
in the item directory, or at external URLs.

```yaml
---
id: CMT-7
title: Update auth flow
status: active
refs:
  - path: docs/architecture/auth-flow.png
    label: Auth flow diagram
  - url: https://sentry.io/issues/12345
    label: Related Sentry issue
  - path: evidence/screenshot.png
    label: Error screenshot
---
```

**Key distinction**: `refs` uses `path` (repo-relative) or `url` (external). Contained
artifacts use item-relative paths. There is no merge conflict because they are different
address spaces.

### 3.2 Unified Artifact Object

Regardless of source, every artifact surfaces as the same shape:

```typescript
interface Artifact {
  // Identity
  name: string               // filename: "screenshot.png"
  path: string               // relative path: "evidence/screenshot.png"

  // Source
  source: "contained" | "ref-local" | "ref-remote"
  category: string | null     // directory name for contained; null otherwise
  label: string | null         // from refs declaration; null for discovered

  // Metadata (null for remote refs)
  size: number | null          // bytes
  mime: string | null          // auto-detected from extension
  modified: string | null      // ISO 8601
  lines: number | null         // for text files only
  is_text: boolean             // true if viewable as text
}
```

### 3.3 Exclusions

The following are excluded from artifact discovery:

- Hidden files (`.DS_Store`, `.gitkeep`, etc.)
- `item.md` (the work item itself)
- `.cmtignore` patterns (if file exists in item directory)
- Directories deeper than 2 levels from item root
- More than 100 files per item (excess reported as `truncated: true`)

Default exclusion patterns (built-in):
```
.*
__pycache__/
node_modules/
*.pyc
*.class
Thumbs.db
```

### 3.4 `refs` Field Specification

```yaml
refs:
  - path: relative/to/repo/root.png   # local file, resolved from repo root
    label: Optional description         # optional
  - url: https://example.com/report    # external URL
    label: External report              # optional
```

- `refs` is an **extension field** — no schema change, preserved by `serde(flatten)`
- `path` is relative to the **git repo root** (not the `.cmt/` directory). This matches how humans think about file paths and how agents reference files.
- `url` is an absolute URL. Server never fetches it — client renders as a link.
- Both `path` and `url` are mutually exclusive per entry. Exactly one must be present.
- For contained artifacts, `refs` entries can add labels/metadata to discovered files: a `refs` entry whose `path` resolves to a file inside the item directory enriches the discovered artifact with its `label`.

---

## 4. API Design

### 4.1 Item Artifact Count in Existing Responses

The existing `ItemResponse` gains two new optional fields:

```rust
struct ItemResponse {
    // ... existing fields ...

    #[serde(skip_serializing_if = "Option::is_none")]
    artifact_count: Option<u32>,      // total artifacts (contained + local refs)

    #[serde(skip_serializing_if = "Option::is_none")]
    preview_url: Option<String>,      // URL to first image artifact, if any
}
```

**Computing `artifact_count`**: During item listing, for each item:
- If item path is a directory (complex item): count non-`item.md` files (max depth 2), apply exclusions
- Add count of `refs` entries from frontmatter (if any)
- This is a fast `read_dir` + stat, not a content read

**Computing `preview_url`**: If exactly 1 image artifact exists (contained or ref-local with
image extension), include its content URL. If 0 or 2+, omit. This avoids expensive
multi-image handling while enabling useful card previews.

**Performance**: The `list_items` handler already reads every item file. Adding `read_dir`
per complex item is O(1) per item. For projects with 1000 items, most will be simple (no
scan needed). Budget: <5ms additional for typical projects.

### 4.2 Artifact Listing

```
GET /api/items/{id}/artifacts?project={name}
```

Response:

```json
{
  "item_id": "CMT-42",
  "is_complex": true,
  "truncated": false,
  "artifacts": [
    {
      "name": "screenshot.png",
      "path": "evidence/screenshot.png",
      "source": "contained",
      "category": "evidence",
      "label": "Login error screenshot",
      "size": 145230,
      "mime": "image/png",
      "modified": "2026-03-05T10:30:00Z",
      "lines": null,
      "is_text": false
    },
    {
      "name": "find-user.sql",
      "path": "queries/find-user.sql",
      "source": "contained",
      "category": "queries",
      "label": null,
      "size": 342,
      "mime": "text/x-sql",
      "modified": "2026-03-04T15:00:00Z",
      "lines": 28,
      "is_text": true
    },
    {
      "name": "auth-flow.png",
      "path": "docs/architecture/auth-flow.png",
      "source": "ref-local",
      "category": null,
      "label": "Auth flow diagram",
      "size": 89120,
      "mime": "image/png",
      "modified": "2026-02-20T12:00:00Z",
      "lines": null,
      "is_text": false
    },
    {
      "name": "Sentry issue",
      "path": "https://sentry.io/issues/12345",
      "source": "ref-remote",
      "category": null,
      "label": "Related Sentry issue",
      "size": null,
      "mime": null,
      "modified": null,
      "lines": null,
      "is_text": false
    }
  ]
}
```

**Resolving `ref-local` paths**: Server resolves `path` relative to the git repo root
(found by walking up from `.cmt/` to find `.git/`). If the file doesn't exist, the artifact
is still included with `size: null` and `source: "ref-local"` so the UI can show a
"file not found" state.

**Sorting**: Artifacts are sorted by category (alphabetical), then by name within category.
Uncategorized artifacts (root-level, refs) come last.

### 4.3 Artifact Content

```
GET /api/items/{id}/artifacts/{path...}?project={name}
```

Serves the raw file content. Works for both contained artifacts (path relative to item
directory) and ref-local artifacts (path relative to repo root, with `?scope=repo` param).

**Response headers**:

```
Content-Type: image/png                           # from MIME detection
Content-Length: 145230                             # from stat
Content-Disposition: inline; filename="file.png"  # inline for viewable, attachment for download
X-Content-Type-Options: nosniff                   # prevent MIME sniffing
Cache-Control: private, max-age=60                # short TTL — local tool, files change
ETag: W/"1709654400000-145230"                    # weak ETag from mtime_ms:size
Accept-Ranges: bytes                              # enable Range requests
```

**Size-aware behavior**:

| Size | Behavior |
|---|---|
| < 1 MB | Full response, all headers |
| 1 MB – 50 MB | Full response, `Accept-Ranges: bytes` for resumable download |
| > 50 MB | Requires `Range` header; full request returns `413 Content Too Large` with hint |

**Ref-local content**: For artifacts referenced via `refs[].path` (repo-relative), the
server resolves the path and serves the file. Path security still applies — the resolved
path must be within the git repo root.

```
GET /api/items/{id}/artifacts/docs/architecture/auth-flow.png?project={name}&scope=repo
```

### 4.4 Text File Line Ranges

For text artifacts, the client can request a specific line range:

```
GET /api/items/{id}/artifacts/queries/big-export.csv?project={name}
Range: lines=0-99
```

Response:

```
HTTP/1.1 206 Partial Content
Content-Type: text/csv
Content-Range: lines 0-99/5247
X-Total-Lines: 5247

<lines 0 through 99>
```

If no `Range` header is sent, the full file is returned (up to the size limit).

**Implementation**: Read file line-by-line with `BufReader`, skip to offset, collect
requested range. For total line count, count `\n` bytes without full parse.

### 4.5 Project-Wide Artifact Listing

```
GET /api/artifacts?project={name}&mime=image/*&category=evidence&limit=50&offset=0
```

Returns artifacts across all items in the project, with filtering and pagination.

Response:

```json
{
  "total": 127,
  "offset": 0,
  "limit": 50,
  "artifacts": [
    {
      "item_id": "CMT-42",
      "item_title": "Fix login bug",
      "name": "screenshot.png",
      "path": "evidence/screenshot.png",
      "source": "contained",
      "size": 145230,
      "mime": "image/png",
      "modified": "2026-03-05T10:30:00Z"
    }
  ]
}
```

**Use cases**: "Show me all screenshots", "Find all SQL queries", "What evidence do we have?"

**Performance**: Scans all complex item directories. For large projects, this could be slow
on first request. Mitigated by:
- `limit`/`offset` pagination (default limit 50)
- `mime` filter applied during scan (skip non-matching files early)
- Results not cached server-side (filesystem is cache; OS handles hot paths)

### 4.6 Writing Artifacts

No upload endpoint. Artifacts are written by actors with filesystem access.

**Agent workflow** (CLI):
```bash
# Add a file to an item (copies file, auto-converts to complex if needed)
cmt artifacts add CMT-42 /path/to/screenshot.png --category evidence

# Add with label
cmt artifacts add CMT-42 /path/to/report.pdf --label "Q1 audit report"

# Add a remote reference
cmt artifacts ref CMT-42 --url https://sentry.io/issues/12345 --label "Sentry issue"
```

**Human workflow**: Copy files directly into `.cmt/items/CMT-42-slug/evidence/`.

**Web UI workflow**: Not supported in v2. File creation is through filesystem access.
This is consistent with how items are created (via CLI, not web UI PATCH to write files).

---

## 5. CLI Design

### 5.1 `cmt artifacts` Command

```
cmt artifacts <ITEM_ID>                              # list artifacts
cmt artifacts <ITEM_ID> <PATH>                       # cat text artifact to stdout
cmt artifacts <ITEM_ID> <PATH> --open                # open with system viewer
cmt artifacts <ITEM_ID> <PATH> --path                # print absolute filesystem path
cmt artifacts add <ITEM_ID> <FILE> [--category CAT]  # copy file into item dir
cmt artifacts ref <ITEM_ID> --url URL [--label TEXT]  # add remote ref to frontmatter
cmt artifacts ref <ITEM_ID> --path PATH [--label TEXT] # add local ref to frontmatter
```

All subcommands support `--json` and `--quiet`.

### 5.2 Integration with `cmt show`

```
$ cmt show CMT-42

  CMT-42  Fix login bug
  Status: active | Priority: high | Assignee: alice
  Tags: security, backend
  Created: 2026-03-05

  Artifacts (3):
    evidence/screenshot.png     145 KB  image/png
    queries/find-user.sql       342 B   text/x-sql
    https://sentry.io/12345            (remote ref)

  ## Description
  The login form throws a 500 error when...
```

When `--json`, artifacts are included in the response object.

### 5.3 `cmt artifacts add` Behavior

1. Resolve item path. If simple item, convert to complex (`cmt edit CMT-42 --complex`).
2. Determine target directory: `--category evidence` → `{item_dir}/evidence/`.
   No category → `{item_dir}/`.
3. Copy (not move) the source file to the target directory.
4. If `--label` provided, add/update a `refs` entry in the item frontmatter.
5. Output the artifact path (or JSON metadata).

---

## 6. Web UI Design

### 6.1 Artifact Count in List and Board Views

Items with artifacts show a subtle indicator:

**List view** — new column or inline badge:
```
CMT-42  Fix login bug     📎 3  active  high  3h ago
```

**Board card** — small icon in footer:
```
┌─────────────────────┐
│ CMT-42              │
│ Fix login bug       │
│                     │
│ security  backend   │
│ 📎 3          alice │
└─────────────────────┘
```

Uses `artifact_count` from `ItemResponse` — no extra API call.

### 6.2 Detail Panel — Artifacts Section

Not a separate tab. Artifacts appear as a collapsible section within the detail panel,
below the body content. This keeps artifacts visible in context rather than hidden behind
a tab the user might not click.

```
┌──────────────────────────────────┐
│ CMT-42 Fix login bug        [x] │
│ ─────────────────────────────── │
│ Status: active  Priority: high  │
│ Assignee: alice                 │
│ ─────────────────────────────── │
│                                  │
│ ## Description                   │
│ The login form throws a 500...   │
│                                  │
│ ▾ Artifacts (3)                  │
│ ┌────────────────────────────┐  │
│ │ 📷 screenshot.png   145 KB │  │
│ │    Login error screenshot   │  │
│ ├────────────────────────────┤  │
│ │ 📄 find-user.sql     342 B │  │
│ ├────────────────────────────┤  │
│ │ 🔗 Sentry issue  (remote)  │  │
│ └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

**Interactions**:
- Click image artifact → opens lightbox overlay (full-size, zoom, pan)
- Click text artifact → opens syntax-highlighted viewer in the panel
- Click remote ref → opens URL in new browser tab
- Click any artifact → secondary action: download button, copy path

### 6.3 Artifact Viewer

Opens within the detail panel area (replaces content temporarily, with back button).

| Type | Viewer | Interaction |
|---|---|---|
| `image/*` | Scaled image, click to zoom | Pan, zoom, download |
| Text (`.sql`, `.json`, `.yaml`, `.py`, `.sh`, `.txt`, `.log`) | Syntax-highlighted with line numbers | Copy, download, line range if > 500 lines |
| `.csv` | Table view, sortable columns | Paginated rows (100 per page), column sort |
| `.md` | Rendered Markdown | Scroll |
| `.pdf` | Browser native `<embed>` | Scroll, zoom (browser-provided) |
| Unknown binary | Metadata card + download button | Download |

**Error states**:
- File not found → "This artifact was deleted or moved" with dismiss button
- Load timeout → "Failed to load" with retry button
- Binary detected as text → "Cannot display binary file" with download fallback

### 6.4 Inline Body Rendering

Markdown images in the item body resolve to artifact content URLs:

```markdown
![screenshot](evidence/screenshot.png)
→ <img src="/api/items/CMT-42/artifacts/evidence/screenshot.png?project=...">
```

**Link resolution rules** (applied in the Markdown renderer):

| Pattern | Resolution |
|---|---|
| `![alt](evidence/file.png)` | `<img>` pointing to artifact content endpoint |
| `[text](evidence/file.sql)` | Clickable link that opens artifact viewer |
| `[CMT-43](../CMT-43-slug/item.md)` | Internal navigation to item CMT-43 |
| `[text](https://...)` | External link, opens in new tab |
| `[text](#heading)` | Anchor link within the item body |

**Connection-aware URLs**: The base URL for artifact content is derived from
`useConnectionStore`. When connected to `http://127.0.0.1:3170`, all artifact URLs
use that origin. When same-origin (served from `cmt serve` directly), relative URLs work.

### 6.5 TanStack Query Integration

```typescript
// Artifact list — fetched when detail panel opens for a complex item
const { data: artifactData } = useQuery({
  queryKey: ['artifacts', itemId, currentProject],
  queryFn: () => api.items.artifacts(itemId),
  staleTime: 30_000,
  enabled: !!itemId,
})

// Text artifact content — fetched on demand when viewer opens
const { data: textContent } = useQuery({
  queryKey: ['artifact-content', itemId, artifactPath, currentProject],
  queryFn: () => api.items.artifactContent(itemId, artifactPath),
  staleTime: 60_000,
  enabled: !!artifactPath && isTextArtifact,
})
```

**Image content**: Not fetched via TanStack Query. Direct `<img src="...">` with
browser-native caching. `Cache-Control` and `ETag` headers drive browser cache behavior.

**Binary content**: Download via `<a href="..." download>`. No client-side caching.

---

## 7. Server Implementation

### 7.1 MIME Detection

Built-in extension-to-MIME table. No external crate dependency.

```rust
fn detect_mime(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()) {
        Some("png") => "image/png",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        Some("webp") => "image/webp",
        Some("pdf") => "application/pdf",
        Some("json") => "application/json",
        Some("yaml" | "yml") => "text/yaml",
        Some("csv") => "text/csv",
        Some("sql") => "text/x-sql",
        Some("md") => "text/markdown",
        Some("txt" | "log") => "text/plain",
        Some("html" | "htm") => "text/html",
        Some("xml") => "text/xml",
        Some("toml") => "text/toml",
        Some("sh" | "bash") => "text/x-shellscript",
        Some("py") => "text/x-python",
        Some("rs") => "text/x-rust",
        Some("js" | "mjs") => "text/javascript",
        Some("ts" | "mts") => "text/typescript",
        Some("css") => "text/css",
        Some("zip") => "application/zip",
        Some("gz" | "tgz") => "application/gzip",
        Some("tar") => "application/x-tar",
        _ => "application/octet-stream",
    }
}
```

### 7.2 Text Detection

```rust
fn is_text_file(path: &Path) -> bool {
    // First: check MIME from extension
    let mime = detect_mime(path);
    if mime.starts_with("text/") || mime == "application/json" {
        return true;
    }
    // Fallback: read first 8KB and check for null bytes
    if let Ok(bytes) = std::fs::read(path).map(|b| b.into_iter().take(8192).collect::<Vec<_>>()) {
        return !bytes.contains(&0);
    }
    false
}
```

### 7.3 ETag Strategy

Weak ETag from file metadata (no content hashing):

```rust
fn compute_etag(metadata: &std::fs::Metadata) -> String {
    let mtime = metadata.modified().ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let size = metadata.len();
    format!("W/\"{}-{}\"", mtime, size)
}
```

### 7.4 Path Security

```rust
fn validate_artifact_path(item_dir: &Path, requested_path: &str) -> Result<PathBuf, ApiError> {
    // Reject obvious traversal
    if requested_path.contains("..") {
        return Err(ApiError::bad_request("Path traversal not allowed"));
    }

    let full_path = item_dir.join(requested_path);
    let canonical = full_path.canonicalize()
        .map_err(|_| ApiError::not_found("Artifact not found"))?;
    let canonical_base = item_dir.canonicalize()
        .map_err(|_| ApiError::internal("Cannot resolve item directory"))?;

    if !canonical.starts_with(&canonical_base) {
        return Err(ApiError::bad_request("Path traversal not allowed"));
    }

    // Reject symlinks pointing outside
    if full_path.is_symlink() && !canonical.starts_with(&canonical_base) {
        return Err(ApiError::bad_request("Symlink escapes item directory"));
    }

    Ok(canonical)
}
```

### 7.5 File Watcher Extension

Current watcher (line 784 of `serve.rs`) filters to `.md` files only. Extend to emit
artifact events for all file changes in complex item directories:

```rust
// Current: only .md files
.filter(|p| p.extension().is_some_and(|e| e == "md"))

// Extended: .md files emit "file_change", other files emit "artifact_changed"
// Check: is the changed file inside a complex item directory (contains item.md)?
// If so, and it's not item.md itself, emit artifact_changed with item_id.
```

Event payload:
```json
{
  "type": "artifact_changed",
  "kind": "created",
  "project": "catchmytask",
  "item_id": "CMT-42",
  "path": "evidence/new-screenshot.png"
}
```

Client-side: invalidate `['artifacts', itemId]` query for the affected item.

---

## 8. Implementation Plan

### Phase 1: Core (MVP)

Server:
- [ ] `GET /api/items/{id}/artifacts` — directory scan + refs merge
- [ ] `GET /api/items/{id}/artifacts/{path...}` — content serving with MIME, ETag, security
- [ ] `artifact_count` and `preview_url` in `ItemResponse`
- [ ] MIME detection, text detection, ETag, path validation
- [ ] Default exclusion patterns

CLI:
- [ ] `cmt artifacts <ID>` — list artifacts
- [ ] `cmt artifacts <ID> <PATH>` — cat text to stdout
- [ ] `cmt artifacts add <ID> <FILE>` — copy file into item, auto-convert to complex
- [ ] Artifact summary in `cmt show` output

Web UI:
- [ ] Artifact count badge in list view and board cards
- [ ] Collapsible artifacts section in detail panel
- [ ] Click-to-view: images (lightbox), text (raw viewer), remote (new tab)
- [ ] Inline image rendering in item body Markdown

### Phase 2: Rich Viewing

- [ ] Syntax highlighting for code artifacts (lightweight — `<pre>` with CSS classes)
- [ ] CSV table viewer with sortable columns and pagination
- [ ] Rendered Markdown viewer for `.md` artifacts
- [ ] Unified link resolver in body Markdown (item refs, local files, external)
- [ ] Error states for all viewer types
- [ ] File watcher extension for `artifact_changed` WS events

### Phase 3: Scale

- [ ] `Range: bytes` support for large binary files
- [ ] `Range: lines` support for large text files
- [ ] `GET /api/artifacts` project-wide listing with mime/category filters
- [ ] `cmt artifacts ref` for adding remote/local refs to frontmatter
- [ ] `.cmtignore` per-item exclusion patterns
- [ ] `--json` artifact metadata in `cmt show` output

---

## 9. What We Do NOT Build

- **Upload API** — filesystem is the write path
- **Thumbnail generation** — CSS `object-fit` is sufficient
- **Artifact versioning UI** — `git log -- path/to/artifact` handles this
- **Remote artifact proxy** — external URLs are the client's responsibility
- **Artifact permissions** — filesystem permissions are access control
- **Server-side search of artifact content** — FTS5 indexes item titles/bodies, not artifacts
- **Drag-and-drop upload in web UI** — requires write endpoint; revisit if demand appears

---

## 10. Resolved Questions

| Question | Decision | Rationale |
|---|---|---|
| Should `cmt add --complex` create subdirs eagerly? | **Yes** — create `evidence/`, `queries/`, `handover/` on `--complex` | Convention over configuration. Empty dirs are cheap. Agents and humans see the structure immediately. |
| Should artifact content be indexed for FTS? | **No** — not in v2 | Index rebuild time would increase significantly. `grep` and `cmt search` over item bodies cover most needs. Revisit if users request it. |
| Git LFS integration? | **Detect but don't manage** | If a file is an LFS pointer, serve the pointer content and let the client/agent handle LFS fetch. `cmt` is not a git client. |
| How to handle catchmytask.com hosted mode? | **Connection-aware URLs** | Artifact content URLs use the same base as API connection. Local backend → local URLs. No proxy needed. |

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use axum::{
    extract::{Path as AxumPath, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json, Response},
    routing::{delete, get, patch, post},
    Router,
};
use include_dir::{include_dir, Dir};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

/// Embedded frontend assets (built from web/dist/)
static FRONTEND_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/../../web/dist");

use crate::cli::ServeArgs;
use cmt_core::config::Config;
use cmt_core::error::WorkError;
use cmt_core::index::Index;
use cmt_core::model::WorkItem;
use cmt_core::parser;
use cmt_core::registry::Registry;
use cmt_core::state_machine;
use cmt_core::storage;

/// Shared application state for all handlers.
struct AppState {
    default_project: String,
    projects: HashMap<String, PathBuf>,
}

impl AppState {
    fn resolve_work_dir(&self, project: Option<&str>) -> Result<&PathBuf, ApiError> {
        let name = project.unwrap_or(&self.default_project);
        self.projects.get(name).ok_or_else(|| ApiError {
            status: StatusCode::NOT_FOUND,
            message: format!("Project '{}' not found", name),
        })
    }

    fn load_config_for(&self, work_dir: &Path) -> Result<Config, ApiError> {
        Config::load(work_dir).map_err(ApiError::from)
    }

    fn open_index_for(&self, work_dir: &Path) -> Result<Index, ApiError> {
        Index::open(work_dir).map_err(ApiError::from)
    }
}

/// API error type that converts to HTTP responses.
#[derive(Debug)]
struct ApiError {
    status: StatusCode,
    message: String,
}

impl From<WorkError> for ApiError {
    fn from(e: WorkError) -> Self {
        let status = match &e {
            WorkError::ItemNotFound(_) => StatusCode::NOT_FOUND,
            WorkError::ProjectNotFound(_) => StatusCode::NOT_FOUND,
            WorkError::ValidationError(_) => StatusCode::BAD_REQUEST,
            WorkError::InvalidTransition { .. } => StatusCode::CONFLICT,
            WorkError::UnknownState { .. } => StatusCode::BAD_REQUEST,
            WorkError::WorkDirNotFound => StatusCode::SERVICE_UNAVAILABLE,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };
        ApiError {
            status,
            message: e.to_string(),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = serde_json::json!({
            "error": self.message,
        });
        (self.status, Json(body)).into_response()
    }
}

// ── Response types ──────────────────────────────────────────────────────────

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    version: &'static str,
    work_dir: String,
}

#[derive(Serialize)]
struct ConfigResponse {
    project: ProjectInfo,
    defaults: DefaultsInfo,
    state_machines: HashMap<String, StateMachineInfo>,
}

#[derive(Serialize)]
struct ProjectInfo {
    name: String,
    prefix: String,
    description: String,
}

#[derive(Serialize)]
struct DefaultsInfo {
    priority: String,
    r#type: String,
    status: String,
}

#[derive(Serialize)]
struct StateMachineInfo {
    states: HashMap<String, StateInfo>,
    transitions: Vec<TransitionInfo>,
}

#[derive(Serialize)]
struct StateInfo {
    initial: bool,
    terminal: bool,
}

#[derive(Serialize)]
struct TransitionInfo {
    from: String,
    to: String,
}

#[derive(Serialize)]
struct ItemResponse {
    id: String,
    title: String,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    r#type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    priority: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    assignee: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    parent: Option<String>,
    depends_on: Vec<String>,
    tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    due: Option<String>,
    created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    started_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    completed_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    updated_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    blocked_reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    body: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    artifact_count: Option<u32>,
}

impl ItemResponse {
    fn from_item(item: &WorkItem, body: Option<String>) -> Self {
        Self {
            id: item.id.raw.clone(),
            title: item.title.clone(),
            status: item.status.clone(),
            r#type: item.r#type.clone(),
            priority: item.priority.clone(),
            assignee: item.assignee.as_ref().map(|a| a.display()),
            parent: item.parent.clone(),
            depends_on: item.depends_on.clone(),
            tags: item.tags.clone(),
            due: item.due.clone(),
            created_at: item.created_at.clone(),
            started_at: item.started_at.clone(),
            completed_at: item.completed_at.clone(),
            updated_at: item.updated_at.clone(),
            blocked_reason: item.blocked_reason.clone(),
            body,
            artifact_count: None,
        }
    }

    fn from_item_with_path(item: &WorkItem, body: Option<String>, item_path: &Path) -> Self {
        let (count, _preview) = cmt_core::artifacts::count_artifacts(item_path);
        let artifact_count = if count > 0 { Some(count) } else { None };
        let mut resp = Self::from_item(item, body);
        resp.artifact_count = artifact_count;
        resp
    }
}

#[derive(Serialize)]
struct ProjectListEntry {
    name: String,
    prefix: String,
    path: String,
    is_default: bool,
    item_count: usize,
}

#[derive(Serialize)]
struct ProjectsResponse {
    projects: Vec<ProjectListEntry>,
    default_project: String,
}

// ── Request types ───────────────────────────────────────────────────────────

/// Common query parameter for project selection.
#[derive(Deserialize, Default)]
struct ProjectQuery {
    project: Option<String>,
}

#[derive(Deserialize)]
struct ListParams {
    project: Option<String>,
    status: Option<String>,
    r#type: Option<String>,
    priority: Option<String>,
    assignee: Option<String>,
    tag: Option<String>,
    parent: Option<String>,
    sort: Option<String>,
    limit: Option<u32>,
    page: Option<u32>,
    per_page: Option<u32>,
}

#[derive(Serialize)]
struct PaginatedResponse<T: Serialize> {
    items: Vec<T>,
    total: usize,
    page: u32,
    per_page: u32,
    has_more: bool,
}

#[derive(Deserialize)]
struct CreateItemRequest {
    title: String,
    #[serde(default)]
    r#type: Option<String>,
    #[serde(default)]
    priority: Option<String>,
    #[serde(default)]
    assignee: Option<String>,
    #[serde(default)]
    parent: Option<String>,
    #[serde(default)]
    depends_on: Vec<String>,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    due: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    body: Option<String>,
}

#[derive(Deserialize)]
struct EditItemRequest {
    #[serde(default)]
    title: Option<String>,
    #[serde(default)]
    priority: Option<String>,
    #[serde(default)]
    assignee: Option<String>,
    #[serde(default)]
    parent: Option<String>,
    #[serde(default)]
    due: Option<String>,
    #[serde(default)]
    r#type: Option<String>,
    #[serde(default)]
    add_tags: Vec<String>,
    #[serde(default)]
    remove_tags: Vec<String>,
    #[serde(default)]
    add_deps: Vec<String>,
    #[serde(default)]
    remove_deps: Vec<String>,
    #[serde(default)]
    body: Option<String>,
}

#[derive(Deserialize)]
struct StatusChangeRequest {
    status: String,
    #[serde(default)]
    reason: Option<String>,
    #[serde(default)]
    force: bool,
}

#[derive(Deserialize)]
struct SearchParams {
    project: Option<String>,
    q: String,
    status: Option<String>,
    limit: Option<u32>,
    page: Option<u32>,
    per_page: Option<u32>,
}

/// Item path params: item id + optional project query
#[derive(Deserialize)]
struct ItemPathQuery {
    project: Option<String>,
}

#[derive(Deserialize)]
struct BulkStatusRequest {
    filter: std::collections::HashMap<String, String>,
    target: String,
    #[serde(default)]
    force: bool,
}

#[derive(Deserialize)]
struct BulkDoneRequest {
    filter: std::collections::HashMap<String, String>,
    #[serde(default)]
    force: bool,
}

#[derive(Deserialize)]
struct AddCommentRequest {
    message: String,
    #[serde(default)]
    reply_to: Option<String>,
    #[serde(default)]
    author: Option<String>,
}

// ── Handlers ────────────────────────────────────────────────────────────────

async fn health(State(state): State<Arc<AppState>>) -> Result<Json<HealthResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(None)?;
    Ok(Json(HealthResponse {
        status: "ok",
        version: env!("CARGO_PKG_VERSION"),
        work_dir: work_dir.display().to_string(),
    }))
}

async fn get_projects(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ProjectsResponse>, ApiError> {
    let mut entries = Vec::new();
    for (name, work_dir) in &state.projects {
        let (prefix, item_count) = match Config::load(work_dir) {
            Ok(config) => {
                let count = storage::scan_item_files(work_dir)
                    .map(|f| f.len())
                    .unwrap_or(0);
                (config.project.prefix.clone(), count)
            }
            Err(_) => ("??".to_string(), 0),
        };
        entries.push(ProjectListEntry {
            name: name.clone(),
            prefix,
            path: work_dir.display().to_string(),
            is_default: name == &state.default_project,
            item_count,
        });
    }
    // Sort: default first, then alphabetical
    entries.sort_by(|a, b| {
        b.is_default
            .cmp(&a.is_default)
            .then_with(|| a.name.cmp(&b.name))
    });

    Ok(Json(ProjectsResponse {
        projects: entries,
        default_project: state.default_project.clone(),
    }))
}

async fn get_config(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
) -> Result<Json<ConfigResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let config = state.load_config_for(work_dir)?;

    let mut machines = HashMap::new();
    for (name, sm) in &config.state_machines {
        let states: HashMap<String, StateInfo> = sm
            .states
            .iter()
            .map(|(k, v)| {
                (
                    k.clone(),
                    StateInfo {
                        initial: v.initial,
                        terminal: v.terminal,
                    },
                )
            })
            .collect();
        let transitions: Vec<TransitionInfo> = sm
            .transitions
            .iter()
            .map(|t| TransitionInfo {
                from: t.from.clone(),
                to: t.to.clone(),
            })
            .collect();
        machines.insert(
            name.clone(),
            StateMachineInfo {
                states,
                transitions,
            },
        );
    }

    Ok(Json(ConfigResponse {
        project: ProjectInfo {
            name: config.project.name.clone(),
            prefix: config.project.prefix.clone(),
            description: config.project.description.clone(),
        },
        defaults: DefaultsInfo {
            priority: config.defaults.priority.clone(),
            r#type: config.defaults.r#type.clone(),
            status: config.defaults.status.clone(),
        },
        state_machines: machines,
    }))
}

async fn list_items(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ListParams>,
) -> Result<Json<PaginatedResponse<ItemResponse>>, ApiError> {
    let work_dir = state.resolve_work_dir(params.project.as_deref())?;
    let files = storage::scan_item_files(work_dir).map_err(ApiError::from)?;

    let mut items: Vec<(WorkItem, String, PathBuf)> = Vec::new();
    for file in &files {
        let content = std::fs::read_to_string(file)
            .map_err(WorkError::from)
            .map_err(ApiError::from)?;
        match parser::parse_file(&content) {
            Ok((item, body)) => items.push((item, body, file.clone())),
            Err(_) => continue,
        }
    }

    // Apply filters
    if let Some(ref status_filter) = params.status {
        let statuses: Vec<&str> = status_filter.split(',').collect();
        items.retain(|(item, _, _)| statuses.contains(&item.status.as_str()));
    }
    if let Some(ref type_filter) = params.r#type {
        items.retain(|(item, _, _)| item.r#type.as_deref() == Some(type_filter.as_str()));
    }
    if let Some(ref priority_filter) = params.priority {
        items.retain(|(item, _, _)| item.priority.as_deref() == Some(priority_filter.as_str()));
    }
    if let Some(ref assignee_filter) = params.assignee {
        items.retain(|(item, _, _)| {
            item.assignee
                .as_ref()
                .is_some_and(|a| a.as_vec().contains(&assignee_filter.as_str()))
        });
    }
    if let Some(ref tag_filter) = params.tag {
        let tags: Vec<&str> = tag_filter.split(',').collect();
        items.retain(|(item, _, _)| tags.iter().all(|t| item.tags.iter().any(|it| it == t)));
    }
    if let Some(ref parent_filter) = params.parent {
        items.retain(|(item, _, _)| item.parent.as_deref() == Some(parent_filter.as_str()));
    }

    // Sort
    let sort_field = params.sort.as_deref().unwrap_or("priority");
    match sort_field {
        "priority" => items.sort_by(|(a, _, _), (b, _, _)| a.priority_enum().cmp(&b.priority_enum())),
        "created" => items.sort_by(|(a, _, _), (b, _, _)| b.created_at.cmp(&a.created_at)),
        "status" => items.sort_by(|(a, _, _), (b, _, _)| a.status.cmp(&b.status)),
        "title" => items.sort_by(|(a, _, _), (b, _, _)| a.title.cmp(&b.title)),
        "due" => items.sort_by(|(a, _, _), (b, _, _)| a.due.cmp(&b.due)),
        _ => {}
    }

    // Legacy limit (applied before pagination if no page param)
    if let Some(limit) = params.limit {
        items.truncate(limit as usize);
    }

    // Pagination
    let total = items.len();
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = ((page - 1) as usize) * (per_page as usize);

    let paged_items: Vec<ItemResponse> = items
        .iter()
        .skip(offset)
        .take(per_page as usize)
        .map(|(item, _, path)| ItemResponse::from_item_with_path(item, None, path))
        .collect();

    let has_more = offset + paged_items.len() < total;

    Ok(Json(PaginatedResponse {
        items: paged_items,
        total,
        page,
        per_page,
        has_more,
    }))
}

async fn get_item(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Json<ItemResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let (item, body, path) = storage::read_item(work_dir, &id).map_err(ApiError::from)?;
    Ok(Json(ItemResponse::from_item_with_path(&item, Some(body), &path)))
}

async fn create_item(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    Json(req): Json<CreateItemRequest>,
) -> Result<(StatusCode, Json<ItemResponse>), ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let config = state.load_config_for(work_dir)?;
    let index = state.open_index_for(work_dir)?;

    let item_type = req.r#type.as_deref().unwrap_or(&config.defaults.r#type);
    let prefix = config.resolve_prefix(Some(item_type));
    let next_num = index.next_id(prefix).map_err(ApiError::from)?;
    let id_raw = format!("{}-{}", prefix, next_num);
    let id = cmt_core::model::WorkItemId::parse(&id_raw).map_err(ApiError::from)?;

    let now = chrono::Utc::now().to_rfc3339();
    let status = req
        .status
        .unwrap_or_else(|| config.defaults.status.clone());
    let priority = req
        .priority
        .or_else(|| Some(config.defaults.priority.clone()));

    let assignee = req.assignee.map(cmt_core::model::Assignee::Single);

    let item = WorkItem {
        id,
        title: req.title,
        status,
        created_at: now,
        r#type: Some(item_type.to_string()),
        priority,
        assignee,
        parent: req.parent,
        depends_on: req.depends_on,
        tags: req.tags,
        due: req.due,
        started_at: None,
        completed_at: None,
        updated_at: None,
        blocked_reason: None,
        related: Vec::new(),
        extra: std::collections::BTreeMap::new(),
    };

    item.validate().map_err(ApiError::from)?;

    let body = req.body.unwrap_or_default();
    let file_path = work_dir.join("items").join(format!("{}.md", id_raw));
    storage::write_item(&file_path, &item, &body).map_err(ApiError::from)?;

    // Update index
    let file_str = file_path.to_string_lossy().to_string();
    cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, false), "upsert");

    Ok((
        StatusCode::CREATED,
        Json(ItemResponse::from_item(&item, Some(body))),
    ))
}

async fn edit_item(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
    Json(req): Json<EditItemRequest>,
) -> Result<Json<ItemResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let (mut item, mut body, path) =
        storage::read_item(work_dir, &id).map_err(ApiError::from)?;

    if let Some(title) = req.title {
        item.title = title;
    }
    if let Some(priority) = req.priority {
        item.priority = Some(priority);
    }
    if let Some(assignee) = req.assignee {
        item.assignee = if assignee.is_empty() {
            None
        } else {
            Some(cmt_core::model::Assignee::Single(assignee))
        };
    }
    if let Some(parent) = req.parent {
        item.parent = if parent.is_empty() {
            None
        } else {
            Some(parent)
        };
    }
    if let Some(due) = req.due {
        item.due = if due.is_empty() { None } else { Some(due) };
    }
    if let Some(item_type) = req.r#type {
        item.r#type = Some(item_type);
    }

    for tag in &req.add_tags {
        if !item.tags.contains(tag) {
            item.tags.push(tag.clone());
        }
    }
    for tag in &req.remove_tags {
        item.tags.retain(|t| t != tag);
    }
    for dep in &req.add_deps {
        if !item.depends_on.contains(dep) {
            item.depends_on.push(dep.clone());
        }
    }
    for dep in &req.remove_deps {
        item.depends_on.retain(|d| d != dep);
    }
    if let Some(new_body) = req.body {
        body = new_body;
    }

    item.updated_at = Some(chrono::Utc::now().to_rfc3339());
    item.validate().map_err(ApiError::from)?;

    storage::write_item(&path, &item, &body).map_err(ApiError::from)?;

    // Update index
    let index = state.open_index_for(work_dir)?;
    let file_str = path.to_string_lossy().to_string();
    cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, false), "upsert");

    Ok(Json(ItemResponse::from_item(&item, Some(body))))
}

async fn change_status(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
    Json(req): Json<StatusChangeRequest>,
) -> Result<Json<ItemResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let config = state.load_config_for(work_dir)?;
    let (mut item, body, path) =
        storage::read_item(work_dir, &id).map_err(ApiError::from)?;

    let result = state_machine::validate_transition(
        &config,
        item.r#type.as_deref(),
        &item.status,
        &req.status,
        req.force,
    )
    .map_err(ApiError::from)?;

    if result.require_blocked_reason && req.reason.is_none() {
        return Err(ApiError {
            status: StatusCode::BAD_REQUEST,
            message: "Reason is required when transitioning to 'blocked'".to_string(),
        });
    }

    item.status = req.status;
    item.updated_at = Some(chrono::Utc::now().to_rfc3339());

    if result.set_started_at && item.started_at.is_none() {
        item.started_at = Some(chrono::Utc::now().to_rfc3339());
    }
    if result.set_completed_at {
        item.completed_at = Some(chrono::Utc::now().to_rfc3339());
    }
    if result.clear_completed_at {
        item.completed_at = None;
    }
    if result.require_blocked_reason {
        item.blocked_reason = req.reason;
    }
    if result.clear_blocked_reason {
        item.blocked_reason = None;
    }

    storage::write_item(&path, &item, &body).map_err(ApiError::from)?;

    // Update index
    let index = state.open_index_for(work_dir)?;
    let file_str = path.to_string_lossy().to_string();
    cmt_core::index::warn_on_err(index.upsert_item(&item, &body, &file_str, false), "upsert");

    Ok(Json(ItemResponse::from_item(&item, Some(body))))
}

async fn delete_item(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<StatusCode, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let path = storage::resolve_item_path(work_dir, &id).map_err(ApiError::from)?;
    std::fs::remove_file(&path)
        .map_err(WorkError::from)
        .map_err(ApiError::from)?;

    // Remove from index
    let index = state.open_index_for(work_dir)?;
    cmt_core::index::warn_on_err(index.remove_item(&id), "remove");

    Ok(StatusCode::NO_CONTENT)
}

async fn search_items(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchParams>,
) -> Result<Json<PaginatedResponse<ItemResponse>>, ApiError> {
    let work_dir = state.resolve_work_dir(params.project.as_deref())?;
    let index = state.open_index_for(work_dir)?;

    // Build the base query with optional status filter
    let mut count_sql = String::from(
        "SELECT COUNT(*)
         FROM items_fts f
         JOIN items i ON i.id = f.id
         WHERE items_fts MATCH ?1",
    );
    let mut search_sql = String::from(
        "SELECT i.id, i.title, i.status, i.type, i.priority, i.assignee,
                i.parent, i.due, i.created_at, i.started_at, i.completed_at,
                i.updated_at, i.blocked_reason, i.body_text
         FROM items_fts f
         JOIN items i ON i.id = f.id
         WHERE items_fts MATCH ?1",
    );

    if let Some(ref status) = params.status {
        let clause = format!(
            " AND i.status = '{}'",
            status.replace('\'', "''")
        );
        count_sql.push_str(&clause);
        search_sql.push_str(&clause);
    }

    // Apply legacy limit if set
    let legacy_limit = params.limit.unwrap_or(200);

    // Pagination
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 200);
    let offset = ((page - 1) as usize) * (per_page as usize);

    // Get total count
    let total: usize = index
        .conn
        .query_row(&count_sql, [&params.q], |row| row.get(0))
        .map_err(WorkError::from)
        .map_err(ApiError::from)?;

    // Clamp total by legacy limit
    let effective_total = total.min(legacy_limit as usize);

    search_sql.push_str(&format!(" LIMIT {} OFFSET {}", per_page, offset));

    let mut stmt = index
        .conn
        .prepare(&search_sql)
        .map_err(WorkError::from)
        .map_err(ApiError::from)?;
    let rows = stmt
        .query_map([&params.q], |row| {
            Ok(ItemResponse {
                id: row.get(0)?,
                title: row.get(1)?,
                status: row.get(2)?,
                r#type: row.get(3)?,
                priority: row.get(4)?,
                assignee: row.get(5)?,
                parent: row.get(6)?,
                due: row.get(7)?,
                created_at: row.get(8)?,
                started_at: row.get(9)?,
                completed_at: row.get(10)?,
                updated_at: row.get(11)?,
                blocked_reason: row.get(12)?,
                body: row.get(13)?,
                depends_on: Vec::new(),
                tags: Vec::new(),
                artifact_count: None,
            })
        })
        .map_err(WorkError::from)
        .map_err(ApiError::from)?;

    let results: Vec<ItemResponse> = rows.filter_map(|r| r.ok()).collect();
    let has_more = offset + results.len() < effective_total;

    Ok(Json(PaginatedResponse {
        items: results,
        total: effective_total,
        page,
        per_page,
        has_more,
    }))
}

// ── Comment handlers ────────────────────────────────────────────────────────

async fn list_comments(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Json<Vec<cmt_core::comments::Comment>>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let (_item, body, _path) = storage::read_item(work_dir, &id).map_err(ApiError::from)?;
    let comments = cmt_core::comments::parse_comments(&body);
    Ok(Json(comments))
}

async fn add_comment(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
    Json(req): Json<AddCommentRequest>,
) -> Result<(StatusCode, Json<cmt_core::comments::Comment>), ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let (item, body, path) = storage::read_item(work_dir, &id).map_err(ApiError::from)?;

    let comment_id = cmt_core::comments::next_comment_id(&body);
    let author = req.author.unwrap_or_else(|| "api".to_string());
    let date = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);

    // Validate reply_to
    if let Some(ref reply_id) = req.reply_to {
        let existing = cmt_core::comments::parse_comments(&body);
        if !existing.iter().any(|c| c.id == *reply_id) {
            return Err(ApiError {
                status: StatusCode::BAD_REQUEST,
                message: format!("Comment '{}' not found on {}", reply_id, id),
            });
        }
    }

    let comment = cmt_core::comments::Comment {
        id: comment_id,
        author,
        date,
        body: req.message,
        reply_to: req.reply_to,
    };

    let new_body = cmt_core::comments::append_comment(&body, &comment);
    storage::write_item(&path, &item, &new_body).map_err(ApiError::from)?;

    // Update index
    let index = state.open_index_for(work_dir)?;
    let file_str = path.to_string_lossy().to_string();
    cmt_core::index::warn_on_err(index.upsert_item(&item, &new_body, &file_str, false), "upsert");

    Ok((StatusCode::CREATED, Json(comment)))
}

// ── Artifact handlers ───────────────────────────────────────────────────────

#[derive(Serialize)]
struct ProjectArtifactEntry {
    item_id: String,
    item_title: String,
    #[serde(flatten)]
    artifact: cmt_core::artifacts::Artifact,
}

#[derive(Serialize)]
struct ProjectArtifactsResponse {
    artifacts: Vec<ProjectArtifactEntry>,
    total: usize,
}

// ── Context (cxl integration) ──────────────────────────────────────────────

#[derive(Serialize)]
struct ContextSource {
    node: String,
    tier: String,
    tokens: u64,
    is_seed: bool,
}

#[derive(Serialize)]
struct ContextCursor {
    id: String,
    task: Option<String>,
    window_items: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    actor: Option<String>,
    dial: f64,
}

#[derive(Serialize)]
struct ContextConcept {
    id: String,
    description: String,
}

#[derive(Serialize)]
struct ContextResponse {
    available: bool,
    cursor: Option<ContextCursor>,
    sources: Vec<ContextSource>,
    concepts: Vec<ContextConcept>,
    tokens_used: u64,
    items_loaded: usize,
}

async fn list_all_artifacts(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Json<ProjectArtifactsResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let files = storage::scan_item_files(work_dir).map_err(ApiError::from)?;

    let mut all_artifacts: Vec<ProjectArtifactEntry> = Vec::new();
    for file in &files {
        let content = std::fs::read_to_string(file)
            .map_err(WorkError::from)
            .map_err(ApiError::from)?;
        let (item, _body) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let artifact_list = cmt_core::artifacts::discover(file, &item.extra);
        if artifact_list.artifacts.is_empty() {
            continue;
        }
        for a in artifact_list.artifacts {
            all_artifacts.push(ProjectArtifactEntry {
                item_id: item.id.to_string(),
                item_title: item.title.clone(),
                artifact: a,
            });
        }
    }

    let total = all_artifacts.len();
    Ok(Json(ProjectArtifactsResponse {
        artifacts: all_artifacts,
        total,
    }))
}

async fn list_artifacts(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Json<cmt_core::artifacts::ArtifactList>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let (item, _body, item_path) = storage::read_item(work_dir, &id).map_err(ApiError::from)?;
    let artifact_list = cmt_core::artifacts::discover(&item_path, &item.extra);
    Ok(Json(artifact_list))
}

async fn serve_artifact(
    State(state): State<Arc<AppState>>,
    AxumPath((id, artifact_path)): AxumPath<(String, String)>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Response, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let item_path = storage::resolve_item_path(work_dir, &id).map_err(ApiError::from)?;

    // Determine the item directory
    let item_dir = if item_path.file_name().is_some_and(|n| n == "item.md") {
        item_path.parent().unwrap_or(&item_path)
    } else {
        // Simple item — no artifacts directory
        return Err(ApiError {
            status: StatusCode::NOT_FOUND,
            message: "Simple items do not have contained artifacts".to_string(),
        });
    };

    let resolved = cmt_core::artifacts::validate_artifact_path(item_dir, &artifact_path)
        .map_err(ApiError::from)?;

    if !resolved.is_file() {
        return Err(ApiError {
            status: StatusCode::NOT_FOUND,
            message: format!("Artifact not found: {}", artifact_path),
        });
    }

    let metadata = std::fs::metadata(&resolved)
        .map_err(WorkError::from)
        .map_err(ApiError::from)?;

    let mime = cmt_core::artifacts::detect_mime(&resolved);
    let etag = cmt_core::artifacts::compute_etag(&metadata);
    let size = metadata.len();

    let body = tokio::fs::read(&resolved)
        .await
        .map_err(|e| ApiError {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: format!("Failed to read artifact: {}", e),
        })?;

    Ok((
        StatusCode::OK,
        [
            (axum::http::header::CONTENT_TYPE, mime.to_string()),
            (axum::http::header::CONTENT_LENGTH, size.to_string()),
            (
                axum::http::header::CONTENT_DISPOSITION,
                format!(
                    "inline; filename=\"{}\"",
                    resolved
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("artifact")
                ),
            ),
            (
                axum::http::header::CACHE_CONTROL,
                "private, max-age=60".to_string(),
            ),
            (axum::http::header::ETAG, etag),
            (
                axum::http::HeaderName::from_static("x-content-type-options"),
                "nosniff".to_string(),
            ),
        ],
        body,
    )
        .into_response())
}

// ── Context handlers (cxl integration) ───────────────────────────────────────

/// Resolve the project root from a .cmt/ work directory (parent of .cmt/).
fn project_root_from_work_dir(work_dir: &Path) -> PathBuf {
    work_dir.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| work_dir.to_path_buf())
}

/// Check if a .contextually/ directory exists alongside .cmt/.
fn has_contextually(work_dir: &Path) -> bool {
    project_root_from_work_dir(work_dir).join(".contextually").exists()
}

/// Shell out to `cxl` and return parsed JSON. Returns None if cxl is not available.
async fn run_cxl(project_root: &Path, args: &[&str]) -> Option<serde_json::Value> {
    let output = tokio::process::Command::new("cxl")
        .args(args)
        .arg("--json")
        .current_dir(project_root)
        .output()
        .await
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(&stdout).ok()
}

async fn get_item_context(
    State(state): State<Arc<AppState>>,
    AxumPath(id): AxumPath<String>,
    Query(pq): Query<ItemPathQuery>,
) -> Result<Json<ContextResponse>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let project_root = project_root_from_work_dir(work_dir);

    // If no .contextually/ directory, return unavailable
    if !has_contextually(work_dir) {
        return Ok(Json(ContextResponse {
            available: false,
            cursor: None,
            sources: Vec::new(),
            concepts: Vec::new(),
            tokens_used: 0,
            items_loaded: 0,
        }));
    }

    // Find cursor linked to this task
    let cursors_json = run_cxl(&project_root, &["cursor", "list"]).await;
    let linked_cursor = cursors_json.as_ref().and_then(|v| {
        v.as_array()?.iter().find(|c| {
            c["task"].as_str() == Some(&id)
        }).cloned()
    });

    let cursor = linked_cursor.as_ref().map(|c| ContextCursor {
        id: c["id"].as_str().unwrap_or("").to_string(),
        task: c["task"].as_str().map(|s| s.to_string()),
        window_items: c["window_items"].as_u64().unwrap_or(0) as usize,
        actor: c["actor"].as_str().map(|s| s.to_string()),
        dial: c["dial"].as_f64().unwrap_or(0.5),
    });

    // If there's a linked cursor, get full details for sources
    let mut sources = Vec::new();
    let mut tokens_used = 0u64;
    let mut items_loaded = 0usize;

    if let Some(ref cur) = cursor {
        if let Some(detail) = run_cxl(&project_root, &["cursor", "show", &cur.id]).await {
            if let Some(window) = detail["cursor"]["window"].as_array() {
                for item in window {
                    let node = item["node"].as_str().unwrap_or("").to_string();
                    let tier = item["tier"].as_str().unwrap_or("T0").to_string();
                    let tokens = item["tokens"].as_u64().unwrap_or(0);
                    let relevance = item["relevance"].as_f64().unwrap_or(0.0);
                    sources.push(ContextSource {
                        node,
                        tier,
                        tokens,
                        is_seed: relevance >= 0.8,
                    });
                    tokens_used += tokens;
                }
                items_loaded = sources.len();
            }
        }
    }

    // Get concepts from the graph
    let mut concepts = Vec::new();
    if let Some(concept_list) = run_cxl(&project_root, &["concept", "list"]).await {
        if let Some(arr) = concept_list.as_array() {
            for c in arr {
                concepts.push(ContextConcept {
                    id: c["id"].as_str().unwrap_or("").to_string(),
                    description: c["description"].as_str().unwrap_or("").to_string(),
                });
            }
        }
    }

    Ok(Json(ContextResponse {
        available: true,
        cursor,
        sources,
        concepts,
        tokens_used,
        items_loaded,
    }))
}

// ── View handlers ────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct CreateViewRequest {
    name: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    filters: cmt_core::views::ViewFilters,
}

async fn api_list_views(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
) -> Result<Json<Vec<cmt_core::views::SavedView>>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let views = cmt_core::views::list_views(work_dir).map_err(ApiError::from)?;
    Ok(Json(views))
}

async fn api_create_view(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    Json(req): Json<CreateViewRequest>,
) -> Result<(StatusCode, Json<cmt_core::views::SavedView>), ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let view = cmt_core::views::SavedView {
        name: req.name,
        description: req.description,
        filters: req.filters,
    };
    cmt_core::views::save_view(work_dir, &view).map_err(ApiError::from)?;
    Ok((StatusCode::CREATED, Json(view)))
}

async fn api_delete_view(
    State(state): State<Arc<AppState>>,
    AxumPath(name): AxumPath<String>,
    Query(pq): Query<ProjectQuery>,
) -> Result<StatusCode, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    cmt_core::views::delete_view(work_dir, &name).map_err(ApiError::from)?;
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize, Default)]
struct ViewItemsParams {
    project: Option<String>,
    page: Option<u32>,
    per_page: Option<u32>,
}

async fn api_view_items(
    State(state): State<Arc<AppState>>,
    AxumPath(name): AxumPath<String>,
    Query(pq): Query<ViewItemsParams>,
) -> Result<Json<PaginatedResponse<ItemResponse>>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let view = cmt_core::views::load_view(work_dir, &name).map_err(ApiError::from)?;

    // Build a ListParams from the view filters, overriding with query params
    let params = ListParams {
        project: pq.project,
        status: view.filters.status,
        r#type: view.filters.r#type,
        priority: view.filters.priority,
        assignee: view.filters.assignee,
        tag: view.filters.tag,
        parent: None,
        sort: view.filters.sort,
        limit: view.filters.limit,
        page: pq.page,
        per_page: pq.per_page,
    };

    // Reuse list_items logic
    list_items(State(state), Query(params)).await
}

// ── Bulk handlers ────────────────────────────────────────────────────────────

fn matches_bulk_filter(item: &WorkItem, filters: &std::collections::HashMap<String, String>) -> bool {
    for (key, value) in filters {
        match key.as_str() {
            "status" => {
                if item.status != *value { return false; }
            }
            "type" => {
                if item.r#type.as_deref() != Some(value.as_str()) { return false; }
            }
            "priority" => {
                if item.priority.as_deref() != Some(value.as_str()) { return false; }
            }
            "assignee" => {
                let matches = item.assignee.as_ref()
                    .is_some_and(|a| a.as_vec().contains(&value.as_str()));
                if !matches { return false; }
            }
            "tag" => {
                if !item.tags.contains(value) { return false; }
            }
            _ => {}
        }
    }
    true
}

async fn bulk_status(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    Json(req): Json<BulkStatusRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let config = state.load_config_for(work_dir)?;
    let files = storage::scan_item_files(work_dir).map_err(ApiError::from)?;

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let (mut item, body) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        if !matches_bulk_filter(&item, &req.filter) {
            continue;
        }

        let id = item.id.raw.clone();
        let old_status = item.status.clone();

        match state_machine::validate_transition(
            &config, item.r#type.as_deref(), &item.status, &req.target, req.force,
        ) {
            Ok(result) => {
                let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
                item.status = req.target.clone();
                item.updated_at = Some(now.clone());
                if result.set_started_at && item.started_at.is_none() {
                    item.started_at = Some(now.clone());
                }
                if result.set_completed_at {
                    item.completed_at = Some(now.clone());
                }
                if result.clear_completed_at {
                    item.completed_at = None;
                }
                if result.clear_blocked_reason {
                    item.blocked_reason = None;
                }

                match storage::write_item(file, &item, &body) {
                    Ok(()) => {
                        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                            let file_str = file.to_string_lossy().to_string();
                            let archived = file_str.contains("/archive/");
                            cmt_core::index::warn_on_err(
                                index.upsert_item(&item, &body, &file_str, archived), "upsert",
                            );
                        }
                        succeeded += 1;
                        results.push(serde_json::json!({
                            "id": id, "from": old_status, "to": req.target, "success": true,
                        }));
                    }
                    Err(e) => {
                        failed += 1;
                        results.push(serde_json::json!({
                            "id": id, "success": false, "error": e.to_string(),
                        }));
                    }
                }
            }
            Err(e) => {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id, "success": false, "error": e.to_string(),
                }));
            }
        }
    }

    let processed = succeeded + failed;
    Ok(Json(serde_json::json!({
        "processed": processed,
        "succeeded": succeeded,
        "failed": failed,
        "results": results,
    })))
}

async fn bulk_done(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    Json(req): Json<BulkDoneRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let config = state.load_config_for(work_dir)?;
    let files = storage::scan_item_files(work_dir).map_err(ApiError::from)?;

    let mut results = Vec::new();
    let mut succeeded = 0u32;
    let mut failed = 0u32;

    for file in &files {
        let content = match std::fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let (mut item, body) = match parser::parse_file(&content) {
            Ok(r) => r,
            Err(_) => continue,
        };

        if !matches_bulk_filter(&item, &req.filter) {
            continue;
        }

        let id = item.id.raw.clone();
        let old_status = item.status.clone();

        match state_machine::validate_transition(
            &config, item.r#type.as_deref(), &item.status, "done", req.force,
        ) {
            Ok(result) => {
                let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true);
                item.status = "done".to_string();
                item.updated_at = Some(now.clone());
                if result.set_completed_at {
                    item.completed_at = Some(now.clone());
                }
                if result.set_started_at && item.started_at.is_none() {
                    item.started_at = Some(now.clone());
                }
                if result.clear_blocked_reason {
                    item.blocked_reason = None;
                }

                match storage::write_item(file, &item, &body) {
                    Ok(()) => {
                        if let Ok(index) = cmt_core::index::Index::open(work_dir) {
                            let file_str = file.to_string_lossy().to_string();
                            let archived = file_str.contains("/archive/");
                            cmt_core::index::warn_on_err(
                                index.upsert_item(&item, &body, &file_str, archived), "upsert",
                            );
                        }
                        succeeded += 1;
                        results.push(serde_json::json!({
                            "id": id, "from": old_status, "to": "done", "success": true,
                        }));
                    }
                    Err(e) => {
                        failed += 1;
                        results.push(serde_json::json!({
                            "id": id, "success": false, "error": e.to_string(),
                        }));
                    }
                }
            }
            Err(e) => {
                failed += 1;
                results.push(serde_json::json!({
                    "id": id, "success": false, "error": e.to_string(),
                }));
            }
        }
    }

    let processed = succeeded + failed;
    Ok(Json(serde_json::json!({
        "processed": processed,
        "succeeded": succeeded,
        "failed": failed,
        "results": results,
    })))
}

// ── Webhook management API ──────────────────────────────────────────────────

async fn api_list_webhooks(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let hooks = cmt_core::webhooks::load_webhooks(work_dir).map_err(ApiError::from)?;
    Ok(Json(serde_json::json!({ "webhooks": hooks })))
}

#[derive(Deserialize)]
struct AddWebhookRequest {
    url: String,
    events: Vec<String>,
    #[serde(default)]
    secret: Option<String>,
}

async fn api_add_webhook(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    Json(req): Json<AddWebhookRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    cmt_core::webhooks::validate_events(&req.events).map_err(ApiError::from)?;

    let mut hooks = cmt_core::webhooks::load_webhooks(work_dir).map_err(ApiError::from)?;
    let id = cmt_core::webhooks::next_webhook_id(&hooks);

    let new_hook = cmt_core::webhooks::WebhookConfig {
        id: id.clone(),
        url: req.url,
        events: req.events,
        secret: req.secret,
        active: true,
    };

    hooks.push(new_hook.clone());
    cmt_core::webhooks::save_webhooks(work_dir, &hooks).map_err(ApiError::from)?;

    Ok(Json(serde_json::json!(new_hook)))
}

async fn api_delete_webhook(
    State(state): State<Arc<AppState>>,
    Query(pq): Query<ProjectQuery>,
    AxumPath(id): AxumPath<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let work_dir = state.resolve_work_dir(pq.project.as_deref())?;
    let mut hooks = cmt_core::webhooks::load_webhooks(work_dir).map_err(ApiError::from)?;
    let before = hooks.len();
    hooks.retain(|h| h.id != id);

    if hooks.len() == before {
        return Err(ApiError {
            status: StatusCode::NOT_FOUND,
            message: format!("Webhook '{}' not found", id),
        });
    }

    cmt_core::webhooks::save_webhooks(work_dir, &hooks).map_err(ApiError::from)?;
    Ok(Json(serde_json::json!({ "removed": id })))
}

// ── WebSocket handler ───────────────────────────────────────────────────────

async fn ws_handler(
    ws: axum::extract::WebSocketUpgrade,
    State(tx): State<broadcast::Sender<String>>,
) -> Response {
    ws.on_upgrade(move |socket| handle_ws(socket, tx))
}

async fn handle_ws(
    mut socket: axum::extract::ws::WebSocket,
    tx: broadcast::Sender<String>,
) {
    let mut rx = tx.subscribe();
    while let Ok(msg) = rx.recv().await {
        if socket
            .send(axum::extract::ws::Message::Text(msg.into()))
            .await
            .is_err()
        {
            break;
        }
    }
}

/// Start a file watcher for a single project that broadcasts events to WebSocket clients.
fn start_file_watcher(project_name: &str, work_dir: &Path, tx: broadcast::Sender<String>) {
    use notify::{Config as NotifyConfig, RecommendedWatcher, RecursiveMode, Watcher};

    let items_dir = work_dir.join("items");
    let archive_dir = work_dir.join("archive");

    let tx_clone = tx.clone();
    let project = project_name.to_string();
    let mut watcher = RecommendedWatcher::new(
        move |res: std::result::Result<notify::Event, notify::Error>| {
            if let Ok(event) = res {
                let kind = match event.kind {
                    notify::EventKind::Create(_) => "created",
                    notify::EventKind::Modify(_) => "modified",
                    notify::EventKind::Remove(_) => "removed",
                    _ => return,
                };
                let paths: Vec<String> = event
                    .paths
                    .iter()
                    .filter(|p| p.extension().is_some_and(|e| e == "md"))
                    .map(|p| p.display().to_string())
                    .collect();
                if !paths.is_empty() {
                    let msg = serde_json::json!({
                        "type": "file_change",
                        "kind": kind,
                        "project": project,
                        "paths": paths,
                    });
                    let _ = tx_clone.send(msg.to_string());
                }
            }
        },
        NotifyConfig::default(),
    )
    .expect("Failed to create file watcher");

    if items_dir.exists() {
        watcher.watch(&items_dir, RecursiveMode::Recursive).ok();
    }
    if archive_dir.exists() {
        watcher.watch(&archive_dir, RecursiveMode::Recursive).ok();
    }

    // Keep watcher alive by moving it into a background task
    tokio::spawn(async move {
        let _watcher = watcher;
        // Park forever — watcher lives as long as the server
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(3600)).await;
        }
    });
}

// ── Embedded static file serving ─────────────────────────────────────────────

async fn serve_embedded(uri: axum::http::Uri) -> Response {
    let path = uri.path().trim_start_matches('/');

    // Try to find the file in embedded assets
    if let Some(file) = FRONTEND_DIR.get_file(path) {
        let mime = mime_guess::from_path(path).first_or_octet_stream();
        (
            StatusCode::OK,
            [(axum::http::header::CONTENT_TYPE, mime.as_ref())],
            file.contents(),
        )
            .into_response()
    } else if let Some(index) = FRONTEND_DIR.get_file("index.html") {
        // SPA fallback: serve index.html for client-side routing
        (
            StatusCode::OK,
            [(axum::http::header::CONTENT_TYPE, "text/html")],
            index.contents(),
        )
            .into_response()
    } else {
        (StatusCode::NOT_FOUND, "Not found").into_response()
    }
}

// ── Server entry point ──────────────────────────────────────────────────────

pub fn execute(args: &ServeArgs, work_dir: &Path) -> cmt_core::error::Result<()> {
    // Build project map: start with CWD project, then add registry entries
    let mut projects: HashMap<String, PathBuf> = HashMap::new();

    // Load current project config for its name
    let config = Config::load(work_dir)?;
    let default_project = config.project.name.clone();
    projects.insert(default_project.clone(), work_dir.to_path_buf());

    // Load registry and add other projects
    if let Ok(registry) = Registry::load() {
        for entry in &registry.projects {
            if entry.path.exists() && !projects.values().any(|p| {
                std::fs::canonicalize(p).ok() == std::fs::canonicalize(&entry.path).ok()
            }) {
                projects.insert(entry.name.clone(), entry.path.clone());
            }
        }
    }

    // Sync indexes for all projects
    for (name, proj_dir) in &projects {
        match Index::open(proj_dir) {
            Ok(index) => {
                if let Err(e) = index.incremental_sync() {
                    eprintln!("  Warning: failed to sync index for '{}': {}", name, e);
                }
            }
            Err(e) => {
                eprintln!("  Warning: failed to open index for '{}': {}", name, e);
            }
        }
    }

    let rt = tokio::runtime::Runtime::new().map_err(|e| {
        WorkError::General(format!("Failed to start async runtime: {}", e))
    })?;

    rt.block_on(async {
        let (ws_tx, _) = broadcast::channel::<String>(256);

        // Start file watchers for all projects
        for (name, proj_dir) in &projects {
            start_file_watcher(name, proj_dir, ws_tx.clone());
        }

        let state = Arc::new(AppState {
            default_project: default_project.clone(),
            projects,
        });

        let api = Router::new()
            .route("/api/health", get(health))
            .route("/api/projects", get(get_projects))
            .route("/api/config", get(get_config))
            .route("/api/items", get(list_items))
            .route("/api/items", post(create_item))
            .route("/api/items/{id}", get(get_item))
            .route("/api/items/{id}", patch(edit_item))
            .route("/api/items/{id}", delete(delete_item))
            .route("/api/items/{id}/status", post(change_status))
            .route("/api/items/{id}/comments", get(list_comments))
            .route("/api/items/{id}/comments", post(add_comment))
            .route("/api/search", get(search_items))
            .route("/api/artifacts", get(list_all_artifacts))
            .route("/api/items/{id}/artifacts", get(list_artifacts))
            .route("/api/items/{id}/artifacts/{*path}", get(serve_artifact))
            .route("/api/items/{id}/context", get(get_item_context))
            .route("/api/views", get(api_list_views))
            .route("/api/views", post(api_create_view))
            .route("/api/views/{name}", delete(api_delete_view))
            .route("/api/views/{name}/items", get(api_view_items))
            .route("/api/bulk/status", post(bulk_status))
            .route("/api/bulk/done", post(bulk_done))
            .route("/api/webhooks", get(api_list_webhooks))
            .route("/api/webhooks", post(api_add_webhook))
            .route("/api/webhooks/{id}", delete(api_delete_webhook))
            .with_state(state.clone());

        let ws_router = Router::new()
            .route("/ws", get(ws_handler))
            .with_state(ws_tx);

        let mut app = api.merge(ws_router);

        // Serve static files: dev mode from filesystem, otherwise embedded in binary
        if let Some(ref dev_dir) = args.dev {
            let serve_dir = tower_http::services::ServeDir::new(dev_dir)
                .fallback(tower_http::services::ServeFile::new(dev_dir.join("index.html")));
            app = app.fallback_service(serve_dir);
        } else {
            app = app.fallback(get(serve_embedded));
        }

        // CORS for dev mode (Vite dev server on different port)
        let cors = tower_http::cors::CorsLayer::permissive();
        let app = app.layer(cors);

        let addr = format!("{}:{}", args.host, args.port);
        let listener = tokio::net::TcpListener::bind(&addr).await.map_err(|e| {
            WorkError::General(format!("Failed to bind to {}: {}", addr, e))
        })?;

        let project_count = state.projects.len();
        eprintln!("CatchMyTask web UI");
        eprintln!("  Local:   http://{}:{}", args.host, args.port);
        eprintln!("  API:     http://{}:{}/api/health", args.host, args.port);
        eprintln!("  WS:      ws://{}:{}/ws", args.host, args.port);
        eprintln!(
            "  Projects: {} (default: {})",
            project_count, default_project
        );

        if args.open {
            let url = format!("http://{}:{}", args.host, args.port);
            std::thread::spawn(move || {
                // Small delay so the server is ready before the browser connects
                std::thread::sleep(std::time::Duration::from_millis(500));
                let _ = open::that(&url);
            });
        }

        axum::serve(listener, app).await.map_err(|e| {
            WorkError::General(format!("Server error: {}", e))
        })?;

        Ok(())
    })
}

use std::path::PathBuf;

/// Exit codes per Spec 03 Section 5.
pub const EXIT_SUCCESS: i32 = 0;
pub const EXIT_GENERAL_ERROR: i32 = 1;
#[allow(dead_code)]
pub const EXIT_INVALID_ARGS: i32 = 2;
pub const EXIT_NOT_FOUND: i32 = 3;
pub const EXIT_INVALID_TRANSITION: i32 = 4;
pub const EXIT_VALIDATION_ERROR: i32 = 5;

#[derive(Debug, thiserror::Error)]
pub enum WorkError {
    #[error("{0}")]
    Io(#[from] std::io::Error),

    #[error("Failed to parse YAML: {0}")]
    YamlParse(#[from] serde_yml::Error),

    #[error("Failed to parse JSON: {0}")]
    JsonParse(#[from] serde_json::Error),

    #[error("Failed to parse config.yml: {0}")]
    ConfigParse(String),

    #[error("{0}")]
    ConfigValidation(String),

    #[error("Config version {found} is not supported. Maximum supported version is {max_supported}. Please upgrade work.")]
    UnsupportedVersion { found: u32, max_supported: u32 },

    #[error("Config version {0} is not valid. Minimum version is 1.")]
    InvalidVersion(u32),

    #[error("No .cmt/ directory found. Run 'work init' to create one, or use --dir to specify a path.")]
    WorkDirNotFound,

    #[error("A .cmt/ directory already exists. Use 'work init --force' to reinitialize (preserves existing items).")]
    AlreadyInitialized,

    #[error("Item '{0}' not found")]
    ItemNotFound(String),

    #[error("Project '{0}' not found in registry")]
    ProjectNotFound(String),

    #[error("Cannot transition from '{current}' to '{target}'. Valid transitions from '{current}': {valid_targets}")]
    InvalidTransition {
        current: String,
        target: String,
        valid_targets: String,
    },

    #[error("Unknown state '{target}' in state machine '{machine}'. Valid states: {valid_states}")]
    UnknownState {
        target: String,
        machine: String,
        valid_states: String,
    },

    #[error("{0}")]
    ValidationError(String),

    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("Path traversal detected: {0}")]
    PathTraversal(PathBuf),

    #[error("{0}")]
    General(String),
}

impl WorkError {
    pub fn exit_code(&self) -> i32 {
        match self {
            WorkError::Io(_) => EXIT_GENERAL_ERROR,
            WorkError::YamlParse(_) => EXIT_GENERAL_ERROR,
            WorkError::JsonParse(_) => EXIT_GENERAL_ERROR,
            WorkError::ConfigParse(_) => EXIT_GENERAL_ERROR,
            WorkError::ConfigValidation(_) => EXIT_GENERAL_ERROR,
            WorkError::UnsupportedVersion { .. } => EXIT_GENERAL_ERROR,
            WorkError::InvalidVersion(_) => EXIT_GENERAL_ERROR,
            WorkError::WorkDirNotFound => EXIT_GENERAL_ERROR,
            WorkError::AlreadyInitialized => EXIT_GENERAL_ERROR,
            WorkError::ItemNotFound(_) => EXIT_NOT_FOUND,
            WorkError::ProjectNotFound(_) => EXIT_NOT_FOUND,
            WorkError::InvalidTransition { .. } => EXIT_INVALID_TRANSITION,
            WorkError::UnknownState { .. } => EXIT_INVALID_TRANSITION,
            WorkError::ValidationError(_) => EXIT_VALIDATION_ERROR,
            WorkError::Sqlite(_) => EXIT_GENERAL_ERROR,
            WorkError::PathTraversal(_) => EXIT_GENERAL_ERROR,
            WorkError::General(_) => EXIT_GENERAL_ERROR,
        }
    }
}

pub type Result<T> = std::result::Result<T, WorkError>;

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::sync::LazyLock;

use crate::error::{Result, WorkError};

/// Regex for validating work item IDs: PREFIX-NUMBER
/// PREFIX: 1-8 uppercase alphanumeric starting with letter
/// NUMBER: 1-6 digits
static ID_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| {
    regex::Regex::new(r"^[A-Z][A-Z0-9]{0,7}-[0-9]{1,6}$").unwrap()
});

/// A work item ID (e.g., CMT-42, BUG-001).
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct WorkItemId {
    pub prefix: String,
    pub number: u32,
    pub raw: String,
}

impl WorkItemId {
    pub fn parse(s: &str) -> Result<Self> {
        if !ID_REGEX.is_match(s) {
            return Err(WorkError::ValidationError(format!(
                "Invalid work item ID '{}'. Expected format: PREFIX-NUMBER (e.g., CMT-42)",
                s
            )));
        }
        let parts: Vec<&str> = s.splitn(2, '-').collect();
        let prefix = parts[0].to_string();
        let number: u32 = parts[1].parse().map_err(|_| {
            WorkError::ValidationError(format!("Invalid number in ID '{}'", s))
        })?;
        Ok(Self {
            prefix,
            number,
            raw: s.to_string(),
        })
    }

    /// Format the ID with zero-padding.
    pub fn display(&self, pad_width: u32) -> String {
        format!("{}-{:0>width$}", self.prefix, self.number, width = pad_width as usize)
    }
}

impl std::fmt::Display for WorkItemId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}-{}", self.prefix, self.number)
    }
}

impl Serialize for WorkItemId {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.raw)
    }
}

impl<'de> Deserialize<'de> for WorkItemId {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> std::result::Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        WorkItemId::parse(&s).map_err(serde::de::Error::custom)
    }
}

/// Priority levels with explicit ordering (critical=0 is highest).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Critical,
    High,
    Medium,
    Low,
    None,
}

impl Priority {
    pub fn rank(&self) -> u8 {
        match self {
            Priority::Critical => 0,
            Priority::High => 1,
            Priority::Medium => 2,
            Priority::Low => 3,
            Priority::None => 4,
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s {
            "critical" => Some(Priority::Critical),
            "high" => Some(Priority::High),
            "medium" => Some(Priority::Medium),
            "low" => Some(Priority::Low),
            "none" => Some(Priority::None),
            _ => Option::None,
        }
    }
}

impl Ord for Priority {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // Lower rank = higher priority
        self.rank().cmp(&other.rank())
    }
}

impl PartialOrd for Priority {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl std::fmt::Display for Priority {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Priority::Critical => write!(f, "critical"),
            Priority::High => write!(f, "high"),
            Priority::Medium => write!(f, "medium"),
            Priority::Low => write!(f, "low"),
            Priority::None => write!(f, "none"),
        }
    }
}

/// Assignee: either a single string or multiple strings.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Assignee {
    Single(String),
    Multiple(Vec<String>),
}

impl Assignee {
    pub fn as_vec(&self) -> Vec<&str> {
        match self {
            Assignee::Single(s) => vec![s.as_str()],
            Assignee::Multiple(v) => v.iter().map(|s| s.as_str()).collect(),
        }
    }

    pub fn display(&self) -> String {
        match self {
            Assignee::Single(s) => s.clone(),
            Assignee::Multiple(v) => v.join(", "),
        }
    }
}

/// A typed relationship to another work item.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relation {
    pub id: String,
    pub r#type: String,
}

/// The core work item struct.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkItem {
    pub id: WorkItemId,
    pub title: String,
    pub status: String,
    pub created_at: String,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub r#type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub priority: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<Assignee>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub depends_on: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub due: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub started_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub completed_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocked_reason: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub related: Vec<Relation>,

    /// Extension fields not part of the standard schema.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_yml::Value>,
}

impl WorkItem {
    /// Validate required fields.
    pub fn validate(&self) -> Result<Vec<String>> {
        let mut warnings = Vec::new();

        // V-02: title required, non-empty
        if self.title.is_empty() {
            return Err(WorkError::ValidationError(
                "Title is required and must not be empty".to_string(),
            ));
        }

        // V-03: title max 200 chars (warning)
        if self.title.len() > 200 {
            warnings.push(format!(
                "Title exceeds 200 characters ({} chars)",
                self.title.len()
            ));
        }

        // V-04: status required (enforced by struct)
        if self.status.is_empty() {
            return Err(WorkError::ValidationError(
                "Status is required".to_string(),
            ));
        }

        // V-11: blocked_reason required when status is blocked
        if self.status == "blocked" && self.blocked_reason.is_none() {
            return Err(WorkError::ValidationError(
                "blocked_reason is required when status is 'blocked'".to_string(),
            ));
        }

        Ok(warnings)
    }

    /// Get priority as enum, defaulting to None.
    pub fn priority_enum(&self) -> Priority {
        self.priority
            .as_deref()
            .and_then(Priority::parse)
            .unwrap_or(Priority::None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_valid_id() {
        let id = WorkItemId::parse("CMT-42").unwrap();
        assert_eq!(id.prefix, "CMT");
        assert_eq!(id.number, 42);
    }

    #[test]
    fn test_parse_id_with_padding() {
        let id = WorkItemId::parse("BUG-0001").unwrap();
        assert_eq!(id.prefix, "BUG");
        assert_eq!(id.number, 1);
    }

    #[test]
    fn test_parse_invalid_id() {
        assert!(WorkItemId::parse("lowercase-1").is_err());
        assert!(WorkItemId::parse("CMT").is_err());
        assert!(WorkItemId::parse("CMT-").is_err());
        assert!(WorkItemId::parse("CMT-0000000").is_err()); // 7 digits
        assert!(WorkItemId::parse("TOOLONGPREFIX-1").is_err()); // 14 chars prefix
    }

    #[test]
    fn test_display_id() {
        let id = WorkItemId::parse("CMT-1").unwrap();
        assert_eq!(id.display(4), "CMT-0001");
        assert_eq!(id.display(1), "CMT-1");
    }

    #[test]
    fn test_priority_ordering() {
        assert!(Priority::Critical < Priority::High);
        assert!(Priority::High < Priority::Medium);
        assert!(Priority::Medium < Priority::Low);
        assert!(Priority::Low < Priority::None);
    }

    #[test]
    fn test_assignee_single() {
        let a = Assignee::Single("alice".to_string());
        assert_eq!(a.as_vec(), vec!["alice"]);
        assert_eq!(a.display(), "alice");
    }

    #[test]
    fn test_assignee_multiple() {
        let a = Assignee::Multiple(vec!["alice".to_string(), "bob".to_string()]);
        assert_eq!(a.as_vec(), vec!["alice", "bob"]);
        assert_eq!(a.display(), "alice, bob");
    }
}

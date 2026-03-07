use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use crate::error::{WorkError, Result};

/// A single allowed transition between states.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transition {
    pub from: String,
    pub to: String,
}

/// Properties of a single state.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Default)]
pub struct StateConfig {
    #[serde(default)]
    pub initial: bool,
    #[serde(default)]
    pub terminal: bool,
}


/// A state machine definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateMachine {
    pub states: BTreeMap<String, StateConfig>,
    pub transitions: Vec<Transition>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extends: Option<String>,
}

/// Project-level metadata.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    #[serde(default)]
    pub name: String,
    #[serde(default = "default_prefix")]
    pub prefix: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub description: String,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: String::new(),
            prefix: "CMT".to_string(),
            description: String::new(),
        }
    }
}

fn default_prefix() -> String {
    "CMT".to_string()
}

/// Default values applied to new work items.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultsConfig {
    #[serde(default = "default_priority")]
    pub priority: String,
    #[serde(default = "default_type")]
    pub r#type: String,
    #[serde(default = "default_status")]
    pub status: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub assignee: Option<String>,
}

impl Default for DefaultsConfig {
    fn default() -> Self {
        Self {
            priority: "none".to_string(),
            r#type: "task".to_string(),
            status: "inbox".to_string(),
            assignee: None,
        }
    }
}

fn default_priority() -> String { "none".to_string() }
fn default_type() -> String { "task".to_string() }
fn default_status() -> String { "inbox".to_string() }

/// ID generation and display configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdConfig {
    #[serde(default)]
    pub prefixes: BTreeMap<String, String>,
    #[serde(default = "default_pad_width")]
    pub pad_width: u32,
}

impl Default for IdConfig {
    fn default() -> Self {
        Self {
            prefixes: BTreeMap::new(),
            pad_width: 4,
        }
    }
}

fn default_pad_width() -> u32 { 4 }

/// Tag namespace configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagsConfig {
    #[serde(default = "default_namespaces")]
    pub namespaces: Vec<String>,
}

impl Default for TagsConfig {
    fn default() -> Self {
        Self {
            namespaces: default_namespaces(),
        }
    }
}

fn default_namespaces() -> Vec<String> {
    vec![
        "team".to_string(),
        "domain".to_string(),
        "sprint".to_string(),
        "priority".to_string(),
    ]
}

/// Archive settings for terminal work items.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchiveConfig {
    #[serde(default)]
    pub auto_archive: bool,
    #[serde(default = "default_auto_archive_after_days")]
    pub auto_archive_after_days: u32,
}

impl Default for ArchiveConfig {
    fn default() -> Self {
        Self {
            auto_archive: false,
            auto_archive_after_days: 7,
        }
    }
}

fn default_auto_archive_after_days() -> u32 { 7 }

/// Git integration settings.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitConfig {
    #[serde(default)]
    pub auto_commit: bool,
    #[serde(default = "default_commit_prefix")]
    pub commit_prefix: String,
}

impl Default for GitConfig {
    fn default() -> Self {
        Self {
            auto_commit: false,
            commit_prefix: "cmt".to_string(),
        }
    }
}

fn default_commit_prefix() -> String { "work".to_string() }

/// The top-level project configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    #[serde(default = "default_version")]
    pub version: u32,
    #[serde(default)]
    pub project: ProjectConfig,
    #[serde(default)]
    pub defaults: DefaultsConfig,
    #[serde(default)]
    pub id: IdConfig,
    #[serde(default = "default_state_machines")]
    pub state_machines: BTreeMap<String, StateMachine>,
    #[serde(default)]
    pub tags: TagsConfig,
    #[serde(default)]
    pub archive: ArchiveConfig,
    #[serde(default)]
    pub git: GitConfig,
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_yml::Value>,
}

fn default_version() -> u32 { 1 }

/// Returns the hardcoded default state machine.
pub fn default_state_machines() -> BTreeMap<String, StateMachine> {
    let mut machines = BTreeMap::new();
    let mut states = BTreeMap::new();

    states.insert("inbox".into(), StateConfig { initial: true, terminal: false });
    states.insert("ready".into(), StateConfig::default());
    states.insert("active".into(), StateConfig::default());
    states.insert("blocked".into(), StateConfig::default());
    states.insert("done".into(), StateConfig { initial: false, terminal: true });
    states.insert("cancelled".into(), StateConfig { initial: false, terminal: true });

    let transitions = vec![
        Transition { from: "inbox".into(), to: "ready".into() },
        Transition { from: "inbox".into(), to: "cancelled".into() },
        Transition { from: "ready".into(), to: "active".into() },
        Transition { from: "ready".into(), to: "cancelled".into() },
        Transition { from: "active".into(), to: "blocked".into() },
        Transition { from: "active".into(), to: "done".into() },
        Transition { from: "active".into(), to: "cancelled".into() },
        Transition { from: "blocked".into(), to: "active".into() },
        Transition { from: "blocked".into(), to: "cancelled".into() },
    ];

    machines.insert("default".into(), StateMachine { states, transitions, extends: None });
    machines
}

impl Default for Config {
    fn default() -> Self {
        Self {
            version: 1,
            project: ProjectConfig::default(),
            defaults: DefaultsConfig::default(),
            id: IdConfig::default(),
            state_machines: default_state_machines(),
            tags: TagsConfig::default(),
            archive: ArchiveConfig::default(),
            git: GitConfig::default(),
            extra: BTreeMap::new(),
        }
    }
}

/// Resolve the global config file path.
/// Priority: $CMT_CONFIG > $XDG_CONFIG_HOME/cmt/config.yml > ~/.config/cmt/config.yml
pub fn global_config_path() -> Option<PathBuf> {
    // 1. Explicit override
    if let Ok(val) = std::env::var("CMT_CONFIG") {
        let p = PathBuf::from(val);
        if p.exists() {
            return Some(p);
        }
    }
    // 2. XDG
    if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        let p = PathBuf::from(xdg).join("cmt").join("config.yml");
        if p.exists() {
            return Some(p);
        }
    }
    // 3. Default ~/.config/cmt/config.yml
    if let Ok(home) = std::env::var("HOME") {
        let p = PathBuf::from(home)
            .join(".config")
            .join("cmt")
            .join("config.yml");
        if p.exists() {
            return Some(p);
        }
    }
    None
}

/// Resolve the global config directory for `cmt init --global`.
pub fn resolve_global_config_dir() -> PathBuf {
    if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        return PathBuf::from(xdg).join("cmt");
    }
    if let Ok(home) = std::env::var("HOME") {
        return PathBuf::from(home).join(".config").join("cmt");
    }
    PathBuf::from(".config").join("cmt")
}

/// Deep merge two YAML values. `overlay` values take precedence over `base`.
fn merge_yaml_values(base: &mut serde_yml::Value, overlay: serde_yml::Value) {
    match (base, overlay) {
        (serde_yml::Value::Mapping(base_map), serde_yml::Value::Mapping(overlay_map)) => {
            for (key, value) in overlay_map {
                if let Some(base_value) = base_map.get_mut(&key) {
                    merge_yaml_values(base_value, value);
                } else {
                    base_map.insert(key, value);
                }
            }
        }
        (base, overlay) => {
            *base = overlay;
        }
    }
}

impl Config {
    /// Load configuration with layered merging:
    /// built-in defaults < global config < project config < local config < env overrides
    pub fn load(work_dir: &Path) -> Result<Self> {
        let mut merged = serde_yml::Value::Mapping(serde_yml::Mapping::new());

        // Layer 1: Global config
        if let Some(global_path) = global_config_path() {
            if let Ok(contents) = std::fs::read_to_string(&global_path) {
                if !contents.trim().is_empty() {
                    match serde_yml::from_str(&contents) {
                        Ok(global_val) => merge_yaml_values(&mut merged, global_val),
                        Err(e) => eprintln!("warning: failed to parse {}: {}", global_path.display(), e),
                    }
                }
            }
        }

        // Layer 2: Project config
        let config_path = work_dir.join("config.yml");
        if config_path.exists() {
            let contents = std::fs::read_to_string(&config_path)?;
            if !contents.trim().is_empty() {
                let project_val: serde_yml::Value = serde_yml::from_str(&contents)
                    .map_err(|e| WorkError::ConfigParse(e.to_string()))?;
                merge_yaml_values(&mut merged, project_val);
            }
        }

        // Layer 3: Local overrides
        let local_path = work_dir.join("config.local.yml");
        if local_path.exists() {
            if let Ok(contents) = std::fs::read_to_string(&local_path) {
                if !contents.trim().is_empty() {
                    match serde_yml::from_str(&contents) {
                        Ok(local_val) => merge_yaml_values(&mut merged, local_val),
                        Err(e) => eprintln!("warning: failed to parse {}: {}", local_path.display(), e),
                    }
                }
            }
        }

        // Deserialize merged result (serde defaults fill any gaps)
        let mut config: Config =
            if merged.is_mapping() && merged.as_mapping().unwrap().is_empty() {
                Config::default()
            } else {
                serde_yml::from_value(merged)
                    .map_err(|e| WorkError::ConfigParse(e.to_string()))?
            };

        // Layer 4: Environment variable overrides (always applied)
        config.apply_env_overrides();

        // Resolve project name from directory if not set
        config.resolve_project_name(work_dir);

        config.validate()?;
        Ok(config)
    }

    /// Apply environment variable overrides.
    fn apply_env_overrides(&mut self) {
        if let Ok(val) = std::env::var("CMT_PREFIX") {
            self.project.prefix = val;
        }
        if let Ok(val) = std::env::var("CMT_DEFAULT_PRIORITY") {
            self.defaults.priority = val;
        }
        if let Ok(val) = std::env::var("CMT_DEFAULT_TYPE") {
            self.defaults.r#type = val;
        }
        if let Ok(val) = std::env::var("CMT_AUTO_COMMIT") {
            if let Some(b) = parse_bool_env(&val) {
                self.git.auto_commit = b;
            }
        }
        if let Ok(val) = std::env::var("CMT_COMMIT_PREFIX") {
            self.git.commit_prefix = val;
        }
        if let Ok(val) = std::env::var("CMT_PAD_WIDTH") {
            if let Ok(w) = val.parse::<u32>() {
                self.id.pad_width = w;
            }
        }
        if let Ok(val) = std::env::var("CMT_AUTO_ARCHIVE") {
            if let Some(b) = parse_bool_env(&val) {
                self.archive.auto_archive = b;
            }
        }
    }

    /// Resolve the project name from directory if not set.
    fn resolve_project_name(&mut self, work_dir: &Path) {
        if self.project.name.is_empty() {
            if let Some(parent) = work_dir.parent() {
                if let Some(name) = parent.file_name() {
                    self.project.name = name.to_string_lossy().to_string();
                }
            }
        }
    }

    /// Validate the configuration.
    pub fn validate(&self) -> Result<()> {
        // C-01: version must be 1
        if self.version == 0 {
            return Err(WorkError::InvalidVersion(0));
        }
        if self.version > 1 {
            return Err(WorkError::UnsupportedVersion { found: self.version, max_supported: 1 });
        }

        // C-02: project.prefix
        let prefix_re = regex::Regex::new(r"^[A-Z][A-Z0-9]{0,7}$").unwrap();
        if !prefix_re.is_match(&self.project.prefix) {
            return Err(WorkError::ConfigValidation(format!(
                "Invalid project prefix '{}'. Must be 1-8 uppercase alphanumeric characters starting with a letter.",
                self.project.prefix
            )));
        }

        // C-03: pad_width
        if self.id.pad_width < 1 || self.id.pad_width > 6 {
            return Err(WorkError::ConfigValidation(format!(
                "Invalid pad_width {}. Must be between 1 and 6.",
                self.id.pad_width
            )));
        }

        // C-04: id.prefixes values
        for (type_name, prefix) in &self.id.prefixes {
            if !prefix_re.is_match(prefix) {
                return Err(WorkError::ConfigValidation(format!(
                    "Invalid type prefix '{}' for type '{}'. Must be 1-8 uppercase alphanumeric characters starting with a letter.",
                    prefix, type_name
                )));
            }
        }

        // C-05: defaults.priority
        let valid_priorities = ["critical", "high", "medium", "low", "none"];
        if !valid_priorities.contains(&self.defaults.priority.as_str()) {
            return Err(WorkError::ConfigValidation(format!(
                "Invalid default priority '{}'. Must be one of: critical, high, medium, low, none.",
                self.defaults.priority
            )));
        }

        // C-06: auto_archive_after_days >= 0 (always true for u32, but check > 0 if auto_archive enabled)
        // (u32 guarantees >= 0, no additional check needed)

        // C-07: commit_prefix must be non-empty if auto_commit enabled
        if self.git.auto_commit && self.git.commit_prefix.is_empty() {
            return Err(WorkError::ConfigValidation(
                "git.commit_prefix must not be empty when git.auto_commit is enabled.".to_string(),
            ));
        }

        // C-18: defaults.status must be an initial state in the default state machine
        if let Some(default_machine) = self.state_machines.get("default") {
            if let Some(state_config) = default_machine.states.get(&self.defaults.status) {
                if !state_config.initial {
                    return Err(WorkError::ConfigValidation(format!(
                        "defaults.status '{}' is not an initial state in the default state machine.",
                        self.defaults.status
                    )));
                }
            } else if !self.defaults.status.is_empty() {
                return Err(WorkError::ConfigValidation(format!(
                    "defaults.status '{}' is not a valid state in the default state machine.",
                    self.defaults.status
                )));
            }
        }

        // C-22: prefix collision detection — project prefix must not collide with type prefixes
        for (type_name, type_prefix) in &self.id.prefixes {
            if type_prefix == &self.project.prefix {
                return Err(WorkError::ConfigValidation(format!(
                    "Type '{}' prefix '{}' collides with the project prefix.",
                    type_name, type_prefix
                )));
            }
        }

        // State machine validation (C-10 through C-17)
        for (name, machine) in &self.state_machines {
            self.validate_state_machine(name, machine)?;
        }

        Ok(())
    }

    fn validate_state_machine(&self, name: &str, machine: &StateMachine) -> Result<()> {
        // C-10: at least one initial state
        let has_initial = machine.states.values().any(|s| s.initial);
        if !has_initial {
            return Err(WorkError::ConfigValidation(format!(
                "State machine '{}' has no initial state. At least one state must have 'initial: true'.",
                name
            )));
        }

        // C-11: at least one terminal state
        let has_terminal = machine.states.values().any(|s| s.terminal);
        if !has_terminal {
            return Err(WorkError::ConfigValidation(format!(
                "State machine '{}' must have at least one terminal state.",
                name
            )));
        }

        // C-08: state name format
        let state_name_re = regex::Regex::new(r"^[a-z][a-z0-9_-]{0,29}$").expect("valid regex");
        for state_name in machine.states.keys() {
            if !state_name_re.is_match(state_name) {
                return Err(WorkError::ConfigValidation(format!(
                    "State machine '{}': invalid state name '{}'. Must be 1-30 lowercase alphanumeric with _ or -.",
                    name, state_name
                )));
            }
        }

        for t in &machine.transitions {
            // C-12: transition.from references a defined state
            if !machine.states.contains_key(&t.from) {
                return Err(WorkError::ConfigValidation(format!(
                    "State machine '{}': transition from unknown state '{}'.",
                    name, t.from
                )));
            }
            // C-13: transition.to references a defined state
            if !machine.states.contains_key(&t.to) {
                return Err(WorkError::ConfigValidation(format!(
                    "State machine '{}': transition to unknown state '{}'.",
                    name, t.to
                )));
            }
            // C-14: no transitions from terminal states
            if let Some(state) = machine.states.get(&t.from) {
                if state.terminal {
                    return Err(WorkError::ConfigValidation(format!(
                        "State machine '{}': terminal state '{}' must not have outgoing transitions.",
                        name, t.from
                    )));
                }
            }
            // C-15: no self-transitions
            if t.from == t.to {
                return Err(WorkError::ConfigValidation(format!(
                    "State machine '{}': self-transition from '{}' to itself is not allowed.",
                    name, t.from
                )));
            }
        }

        // C-16: non-terminal states must have at least one outgoing transition
        for (state_name, state_config) in &machine.states {
            if !state_config.terminal {
                let has_outgoing = machine.transitions.iter().any(|t| t.from == *state_name);
                if !has_outgoing {
                    return Err(WorkError::ConfigValidation(format!(
                        "State machine '{}': non-terminal state '{}' has no outgoing transitions.",
                        name, state_name
                    )));
                }
            }
        }

        Ok(())
    }

    /// Resolve the ID prefix for a given type.
    pub fn resolve_prefix(&self, item_type: Option<&str>) -> &str {
        if let Some(t) = item_type {
            if let Some(prefix) = self.id.prefixes.get(t) {
                return prefix;
            }
        }
        &self.project.prefix
    }

    /// Get terminal states from the default state machine.
    pub fn terminal_states(&self) -> Vec<String> {
        if let Some(machine) = self.state_machines.get("default") {
            machine.states.iter()
                .filter(|(_, s)| s.terminal)
                .map(|(name, _)| name.clone())
                .collect()
        } else {
            vec!["done".to_string(), "cancelled".to_string()]
        }
    }

    /// Resolve the state machine for a given item type, applying extends inheritance.
    pub fn resolve_state_machine(&self, item_type: Option<&str>) -> std::borrow::Cow<'_, StateMachine> {
        let machine = if let Some(t) = item_type {
            self.state_machines.get(t).or_else(|| self.state_machines.get("default"))
        } else {
            self.state_machines.get("default")
        };

        let machine = match machine {
            Some(m) => m,
            None => {
                // This should never happen with a validated config (default_state_machines always
                // provides "default"), but return a static fallback instead of panicking.
                return std::borrow::Cow::Owned(default_state_machines().remove("default")
                    .expect("hardcoded default always exists"));
            }
        };

        // Resolve extends (one level only per spec)
        if let Some(ref parent_name) = machine.extends {
            if let Some(parent) = self.state_machines.get(parent_name) {
                return std::borrow::Cow::Owned(merge_state_machines(parent, machine));
            }
        }

        std::borrow::Cow::Borrowed(machine)
    }

    /// Write a minimal config.yml for cmt init.
    pub fn write_minimal(work_dir: &Path, name: &str, prefix: &str) -> Result<()> {
        let content = format!(
            "version: 1\n\nproject:\n  name: \"{}\"\n  prefix: \"{}\"\n",
            name, prefix
        );
        crate::storage::atomic_write(&work_dir.join("config.yml"), &content)?;
        Ok(())
    }
}

/// Merge a parent state machine with a child (extends resolution).
/// Child states override parent states with the same name.
/// Child transitions override parent transitions with the same `from` state.
fn merge_state_machines(parent: &StateMachine, child: &StateMachine) -> StateMachine {
    let mut states = parent.states.clone();
    for (name, state) in &child.states {
        states.insert(name.clone(), state.clone());
    }

    // Build transitions: start with parent, replace for any `from` state the child defines
    let child_from_states: std::collections::HashSet<&str> = child.transitions.iter()
        .map(|t| t.from.as_str())
        .collect();

    let mut transitions: Vec<Transition> = parent.transitions.iter()
        .filter(|t| !child_from_states.contains(t.from.as_str()))
        .cloned()
        .collect();
    transitions.extend(child.transitions.iter().cloned());

    StateMachine {
        states,
        transitions,
        extends: None, // Resolved; no further chaining
    }
}

/// Parse a boolean from an environment variable value.
fn parse_bool_env(val: &str) -> Option<bool> {
    match val.to_lowercase().as_str() {
        "true" | "1" | "yes" => Some(true),
        "false" | "0" | "no" => Some(false),
        _ => None,
    }
}

/// Discover the .cmt/ directory by searching upward from the given path.
pub fn discover_work_dir(start: &Path) -> Option<std::path::PathBuf> {
    let home = std::env::var("HOME").ok().map(std::path::PathBuf::from);
    let mut current = start.to_path_buf();

    loop {
        let candidate = current.join(".cmt");
        if candidate.join("config.yml").exists() || candidate.is_dir() {
            return Some(candidate);
        }

        // Stop at home directory boundary
        if let Some(ref home_dir) = home {
            if current == *home_dir {
                return None;
            }
        }

        if !current.pop() {
            return None;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert_eq!(config.version, 1);
        assert_eq!(config.project.prefix, "CMT");
        assert_eq!(config.defaults.priority, "none");
        assert_eq!(config.defaults.r#type, "task");
        assert_eq!(config.defaults.status, "inbox");
        assert!(config.state_machines.contains_key("default"));
    }

    #[test]
    fn test_validate_valid_config() {
        let config = Config::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_validate_invalid_prefix() {
        let mut config = Config::default();
        config.project.prefix = "lowercase".to_string();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_invalid_pad_width() {
        let mut config = Config::default();
        config.id.pad_width = 0;
        assert!(config.validate().is_err());

        config.id.pad_width = 7;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_invalid_priority() {
        let mut config = Config::default();
        config.defaults.priority = "urgent".to_string();
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_validate_unsupported_version() {
        let mut config = Config::default();
        config.version = 2;
        assert!(matches!(
            config.validate(),
            Err(WorkError::UnsupportedVersion { found: 2, max_supported: 1 })
        ));
    }

    #[test]
    fn test_resolve_prefix() {
        let mut config = Config::default();
        config.id.prefixes.insert("bug".to_string(), "BUG".to_string());

        assert_eq!(config.resolve_prefix(Some("bug")), "BUG");
        assert_eq!(config.resolve_prefix(Some("task")), "CMT");
        assert_eq!(config.resolve_prefix(None), "CMT");
    }

    #[test]
    fn test_terminal_states() {
        let config = Config::default();
        let terminals = config.terminal_states();
        assert!(terminals.contains(&"done".to_string()));
        assert!(terminals.contains(&"cancelled".to_string()));
        assert_eq!(terminals.len(), 2);
    }

    #[test]
    fn test_parse_yaml_config() {
        let yaml = r#"
version: 1
project:
  name: "test-project"
  prefix: "TP"
defaults:
  priority: high
  type: bug
"#;
        let config: Config = serde_yml::from_str(yaml).unwrap();
        assert_eq!(config.project.name, "test-project");
        assert_eq!(config.project.prefix, "TP");
        assert_eq!(config.defaults.priority, "high");
        assert_eq!(config.defaults.r#type, "bug");
    }

    #[test]
    fn test_empty_yaml_config() {
        let config: Config = serde_yml::from_str("{}").unwrap();
        assert_eq!(config.version, 1);
        assert_eq!(config.project.prefix, "CMT");
    }

    #[test]
    fn test_unknown_keys_preserved() {
        let yaml = r#"
version: 1
project:
  prefix: "CMT"
agents:
  my_agent:
    capabilities: [read]
"#;
        let config: Config = serde_yml::from_str(yaml).unwrap();
        assert!(config.extra.contains_key("agents"));
    }

    #[test]
    fn test_merge_yaml_scalar_override() {
        let mut base: serde_yml::Value = serde_yml::from_str("key: base_value").unwrap();
        let overlay: serde_yml::Value = serde_yml::from_str("key: overlay_value").unwrap();
        merge_yaml_values(&mut base, overlay);
        assert_eq!(
            base["key"].as_str().unwrap(),
            "overlay_value"
        );
    }

    #[test]
    fn test_merge_yaml_deep_map() {
        let mut base: serde_yml::Value = serde_yml::from_str(
            "project:\n  name: base\n  prefix: WM\ndefaults:\n  priority: none\n",
        )
        .unwrap();
        let overlay: serde_yml::Value = serde_yml::from_str(
            "project:\n  name: overlay\ndefaults:\n  priority: high\n",
        )
        .unwrap();
        merge_yaml_values(&mut base, overlay);
        // Overlay wins for conflict keys
        assert_eq!(base["project"]["name"].as_str().unwrap(), "overlay");
        assert_eq!(base["defaults"]["priority"].as_str().unwrap(), "high");
        // Non-conflicting keys preserved from base
        assert_eq!(base["project"]["prefix"].as_str().unwrap(), "WM");
    }

    #[test]
    fn test_merge_yaml_array_replace() {
        let mut base: serde_yml::Value =
            serde_yml::from_str("tags:\n  namespaces:\n    - a\n    - b\n").unwrap();
        let overlay: serde_yml::Value =
            serde_yml::from_str("tags:\n  namespaces:\n    - x\n").unwrap();
        merge_yaml_values(&mut base, overlay);
        let ns = base["tags"]["namespaces"].as_sequence().unwrap();
        assert_eq!(ns.len(), 1);
        assert_eq!(ns[0].as_str().unwrap(), "x");
    }

    #[test]
    fn test_merge_yaml_new_key() {
        let mut base: serde_yml::Value = serde_yml::from_str("a: 1").unwrap();
        let overlay: serde_yml::Value = serde_yml::from_str("b: 2").unwrap();
        merge_yaml_values(&mut base, overlay);
        assert_eq!(base["a"].as_u64().unwrap(), 1);
        assert_eq!(base["b"].as_u64().unwrap(), 2);
    }

    #[test]
    fn test_layered_load_project_only() {
        let tmp = tempfile::tempdir().unwrap();
        let work_dir = tmp.path().join(".cmt");
        std::fs::create_dir_all(&work_dir).unwrap();
        std::fs::write(
            work_dir.join("config.yml"),
            "version: 1\nproject:\n  name: test\n  prefix: TP\n",
        )
        .unwrap();

        let config = Config::load(&work_dir).unwrap();
        assert_eq!(config.project.prefix, "TP");
        assert_eq!(config.project.name, "test");
    }

    #[test]
    fn test_layered_load_local_overrides_project() {
        let tmp = tempfile::tempdir().unwrap();
        let work_dir = tmp.path().join(".cmt");
        std::fs::create_dir_all(&work_dir).unwrap();
        std::fs::write(
            work_dir.join("config.yml"),
            "version: 1\nproject:\n  name: test\n  prefix: TP\ndefaults:\n  priority: low\n",
        )
        .unwrap();
        std::fs::write(
            work_dir.join("config.local.yml"),
            "defaults:\n  priority: high\n",
        )
        .unwrap();

        let config = Config::load(&work_dir).unwrap();
        assert_eq!(config.project.prefix, "TP");
        assert_eq!(config.defaults.priority, "high");
    }

    #[test]
    fn test_layered_load_empty_work_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let work_dir = tmp.path().join(".cmt");
        std::fs::create_dir_all(&work_dir).unwrap();

        let config = Config::load(&work_dir).unwrap();
        assert_eq!(config.version, 1);
        assert_eq!(config.project.prefix, "CMT");
        assert_eq!(config.defaults.priority, "none");
    }

    #[test]
    fn test_global_config_path_no_files() {
        // With non-existent paths, global_config_path should return None
        std::env::remove_var("CMT_CONFIG");
        let saved_xdg = std::env::var("XDG_CONFIG_HOME").ok();
        let saved_home = std::env::var("HOME").ok();

        std::env::set_var("XDG_CONFIG_HOME", "/nonexistent/xdg/path");
        std::env::set_var("HOME", "/nonexistent/home/path");

        let result = global_config_path();
        assert!(result.is_none());

        // Restore
        if let Some(val) = saved_xdg {
            std::env::set_var("XDG_CONFIG_HOME", val);
        } else {
            std::env::remove_var("XDG_CONFIG_HOME");
        }
        if let Some(val) = saved_home {
            std::env::set_var("HOME", val);
        }
    }

    #[test]
    fn test_global_config_path_work_config_env() {
        let tmp = tempfile::tempdir().unwrap();
        let config_file = tmp.path().join("my-config.yml");
        std::fs::write(&config_file, "version: 1\n").unwrap();

        std::env::set_var("CMT_CONFIG", config_file.to_str().unwrap());
        let result = global_config_path();
        std::env::remove_var("CMT_CONFIG");

        assert_eq!(result.unwrap(), config_file);
    }

    #[test]
    fn test_resolve_global_config_dir_xdg() {
        let saved = std::env::var("XDG_CONFIG_HOME").ok();
        std::env::set_var("XDG_CONFIG_HOME", "/tmp/test-xdg");
        let dir = resolve_global_config_dir();
        assert_eq!(dir, PathBuf::from("/tmp/test-xdg/cmt"));

        if let Some(val) = saved {
            std::env::set_var("XDG_CONFIG_HOME", val);
        } else {
            std::env::remove_var("XDG_CONFIG_HOME");
        }
    }
}

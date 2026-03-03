use crate::config::{Config, StateMachine};
use crate::error::{Result, WorkError};

/// Result of validating a transition.
pub struct TransitionResult {
    pub machine_name: String,
    #[allow(dead_code)]
    pub from: String,
    #[allow(dead_code)]
    pub to: String,
    pub set_started_at: bool,
    pub set_completed_at: bool,
    pub clear_completed_at: bool,
    pub clear_blocked_reason: bool,
    pub require_blocked_reason: bool,
    pub set_updated_at: bool,
}

/// Validate and compute the result of a state transition.
pub fn validate_transition(
    config: &Config,
    item_type: Option<&str>,
    current_status: &str,
    target_status: &str,
    force: bool,
) -> Result<TransitionResult> {
    let machine = config.resolve_state_machine(item_type);
    let machine_name = if let Some(t) = item_type {
        if config.state_machines.contains_key(t) {
            t.to_string()
        } else {
            "default".to_string()
        }
    } else {
        "default".to_string()
    };

    // Check target state exists
    if !machine.states.contains_key(target_status) {
        let valid_states: Vec<&str> = machine.states.keys().map(|s| s.as_str()).collect();
        return Err(WorkError::UnknownState {
            target: target_status.to_string(),
            machine: machine_name,
            valid_states: valid_states.join(", "),
        });
    }

    if !force {
        // Check transition exists
        let valid_targets = get_valid_targets(&machine, current_status);
        if !valid_targets.contains(&target_status.to_string()) {
            return Err(WorkError::InvalidTransition {
                current: current_status.to_string(),
                target: target_status.to_string(),
                valid_targets: if valid_targets.is_empty() {
                    "(none)".to_string()
                } else {
                    valid_targets.join(", ")
                },
            });
        }
    }

    // Compute timestamp side effects
    let target_config = machine.states.get(target_status);
    let current_config = machine.states.get(current_status);

    let is_target_initial = target_config.is_some_and(|s| s.initial);
    let is_target_terminal = target_config.is_some_and(|s| s.terminal);
    let is_current_terminal = current_config.is_some_and(|s| s.terminal);

    // started_at: set on first entry to non-initial, non-terminal state
    let set_started_at = !is_target_initial && !is_target_terminal;

    // completed_at: set on terminal entry
    let set_completed_at = is_target_terminal;

    // clear completed_at: when leaving terminal via --force
    let clear_completed_at = is_current_terminal && !is_target_terminal;

    // blocked_reason: required for blocked, cleared on exit
    let require_blocked_reason = target_status == "blocked";
    let clear_blocked_reason = current_status == "blocked" && target_status != "blocked";

    Ok(TransitionResult {
        machine_name,
        from: current_status.to_string(),
        to: target_status.to_string(),
        set_started_at,
        set_completed_at,
        clear_completed_at,
        clear_blocked_reason,
        require_blocked_reason,
        set_updated_at: true,
    })
}

/// Get valid target states from a given state.
pub fn get_valid_targets(machine: &StateMachine, from_state: &str) -> Vec<String> {
    machine
        .transitions
        .iter()
        .filter(|t| t.from == from_state)
        .map(|t| t.to.clone())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::Config;

    #[test]
    fn test_valid_transition() {
        let config = Config::default();
        let result = validate_transition(&config, None, "inbox", "ready", false);
        assert!(result.is_ok());
        let r = result.unwrap();
        assert_eq!(r.from, "inbox");
        assert_eq!(r.to, "ready");
        assert!(!r.set_completed_at);
    }

    #[test]
    fn test_invalid_transition() {
        let config = Config::default();
        let result = validate_transition(&config, None, "inbox", "done", false);
        assert!(matches!(result, Err(WorkError::InvalidTransition { .. })));
    }

    #[test]
    fn test_force_transition() {
        let config = Config::default();
        let result = validate_transition(&config, None, "inbox", "done", true);
        assert!(result.is_ok());
    }

    #[test]
    fn test_terminal_transition() {
        let config = Config::default();
        let result = validate_transition(&config, None, "active", "done", false).unwrap();
        assert!(result.set_completed_at);
    }

    #[test]
    fn test_blocked_requires_reason() {
        let config = Config::default();
        let result = validate_transition(&config, None, "active", "blocked", false).unwrap();
        assert!(result.require_blocked_reason);
    }

    #[test]
    fn test_leave_blocked_clears_reason() {
        let config = Config::default();
        let result = validate_transition(&config, None, "blocked", "active", false).unwrap();
        assert!(result.clear_blocked_reason);
    }
}

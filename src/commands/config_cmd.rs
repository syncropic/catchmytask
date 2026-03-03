use std::path::Path;

use crate::cli::ConfigCommand;
use crate::config::Config;
use crate::error::{Result, WorkError};

pub fn execute(cmd: &ConfigCommand, work_dir: &Path, json: bool) -> Result<()> {
    match cmd {
        ConfigCommand::Show { section } => show_config(work_dir, section.as_deref(), json),
        ConfigCommand::Get { key } => get_config(work_dir, key, json),
        ConfigCommand::Set { key, value } => set_config(work_dir, key, value),
    }
}

fn show_config(work_dir: &Path, section: Option<&str>, json: bool) -> Result<()> {
    let config = Config::load(work_dir)?;

    if json {
        let json_val = serde_json::to_value(&config)?;
        if let Some(section_name) = section {
            if let Some(section_val) = json_val.get(section_name) {
                println!("{}", serde_json::to_string_pretty(section_val)?);
            } else {
                return Err(WorkError::General(format!("Unknown config section '{}'", section_name)));
            }
        } else {
            println!("{}", serde_json::to_string_pretty(&json_val)?);
        }
    } else {
        let yaml = serde_yml::to_string(&config)?;
        if let Some(section_name) = section {
            // Parse back and extract section
            let value: serde_yml::Value = serde_yml::from_str(&yaml)?;
            if let Some(section_val) = value.get(section_name) {
                let section_yaml = serde_yml::to_string(section_val)?;
                println!("{}:", section_name);
                for line in section_yaml.lines() {
                    println!("  {}", line);
                }
            } else {
                return Err(WorkError::General(format!("Unknown config section '{}'", section_name)));
            }
        } else {
            print!("{}", yaml);
        }
    }

    Ok(())
}

fn get_config(work_dir: &Path, key: &str, json: bool) -> Result<()> {
    let config = Config::load(work_dir)?;

    let json_val = serde_json::to_value(&config)?;
    let parts: Vec<&str> = key.split('.').collect();

    let mut current = &json_val;
    for part in &parts {
        current = current.get(part).ok_or_else(|| {
            WorkError::General(format!("Config key '{}' not found", key))
        })?;
    }

    if json {
        println!("{}", serde_json::to_string_pretty(current)?);
    } else {
        match current {
            serde_json::Value::String(s) => println!("{}", s),
            serde_json::Value::Number(n) => println!("{}", n),
            serde_json::Value::Bool(b) => println!("{}", b),
            serde_json::Value::Null => println!("null"),
            _ => println!("{}", serde_json::to_string_pretty(current)?),
        }
    }

    Ok(())
}

fn set_config(work_dir: &Path, key: &str, value: &str) -> Result<()> {
    let config_path = work_dir.join("config.yml");
    let content = if config_path.exists() {
        std::fs::read_to_string(&config_path)?
    } else {
        String::new()
    };

    let mut yaml_value: serde_yml::Value = if content.trim().is_empty() {
        serde_yml::Value::Mapping(serde_yml::Mapping::new())
    } else {
        serde_yml::from_str(&content)?
    };

    let parts: Vec<&str> = key.split('.').collect();
    set_nested_value(&mut yaml_value, &parts, value)?;

    // Validate the resulting config before writing to prevent bricking
    let test_config: Config = serde_yml::from_value(yaml_value.clone())
        .map_err(|e| WorkError::ConfigValidation(format!(
            "Setting {} = {} would produce invalid config: {}", key, value, e
        )))?;
    test_config.validate().map_err(|e| WorkError::ConfigValidation(format!(
        "Setting {} = {} would produce invalid config: {}", key, value, e
    )))?;

    let output = serde_yml::to_string(&yaml_value)?;
    crate::storage::atomic_write(&config_path, &output)?;

    // Regenerate discovery files (non-fatal)
    if let Ok(config) = Config::load(work_dir) {
        let _ = crate::discovery::generate_about_file(work_dir, &config);
        let _ = crate::discovery::generate_conventions_file(work_dir, &config);
    }

    eprintln!("Set {} = {}", key, value);
    Ok(())
}

fn set_nested_value(
    root: &mut serde_yml::Value,
    path: &[&str],
    value: &str,
) -> Result<()> {
    if path.is_empty() {
        return Err(WorkError::General("Empty config key".to_string()));
    }

    let mut current = root;
    for &part in &path[..path.len() - 1] {
        if !current.is_mapping() {
            *current = serde_yml::Value::Mapping(serde_yml::Mapping::new());
        }
        let key = serde_yml::Value::String(part.to_string());
        let mapping = current.as_mapping_mut().ok_or_else(|| {
            WorkError::General(format!("Config path element '{}' is not a mapping", part))
        })?;
        if !mapping.contains_key(&key) {
            mapping.insert(key.clone(), serde_yml::Value::Mapping(serde_yml::Mapping::new()));
        }
        current = mapping.get_mut(&key).ok_or_else(|| {
            WorkError::General(format!("Failed to access config key '{}'", part))
        })?;
    }

    let last_key = serde_yml::Value::String(path[path.len() - 1].to_string());
    if !current.is_mapping() {
        *current = serde_yml::Value::Mapping(serde_yml::Mapping::new());
    }

    // Parse value: try bool, int, then string
    let yaml_value = if value == "true" || value == "false" {
        serde_yml::Value::Bool(value == "true")
    } else if let Ok(n) = value.parse::<i64>() {
        serde_yml::Value::Number(n.into())
    } else {
        serde_yml::Value::String(value.to_string())
    };

    let mapping = current.as_mapping_mut().ok_or_else(|| {
        WorkError::General("Cannot set value: target is not a mapping".to_string())
    })?;
    mapping.insert(last_key, yaml_value);
    Ok(())
}

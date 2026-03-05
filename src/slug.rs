/// Generate a URL/filename-safe slug from a title string.
///
/// Rules:
/// - Lowercase
/// - Replace non-alphanumeric with hyphens
/// - Collapse consecutive hyphens
/// - Strip leading/trailing hyphens
/// - Truncate to `max_len` chars (at word boundary)
/// - Common stop words removed for brevity
pub fn slugify(title: &str, max_len: usize) -> String {
    let stop_words: &[&str] = &[
        "the", "a", "an", "is", "are", "was", "were", "be", "been",
        "and", "or", "but", "in", "on", "at", "to", "for", "of",
        "with", "by", "from", "as", "into", "this", "that",
    ];

    let slug: String = title
        .to_lowercase()
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
        .collect();

    // Split, remove stop words, rejoin
    let words: Vec<&str> = slug
        .split('-')
        .filter(|w| !w.is_empty() && !stop_words.contains(w))
        .collect();

    // Truncate to max_len at word boundary
    let mut result = String::new();
    for word in &words {
        if !result.is_empty() {
            if result.len() + 1 + word.len() > max_len {
                break;
            }
            result.push('-');
        } else if word.len() > max_len {
            result.push_str(&word[..max_len]);
            break;
        }
        result.push_str(word);
    }

    if result.is_empty() {
        // Fallback if title was all stop words or empty
        "item".to_string()
    } else {
        result
    }
}

/// Validate a user-provided slug.
pub fn validate_slug(slug: &str) -> Result<(), String> {
    if slug.is_empty() {
        return Err("Slug must not be empty".to_string());
    }
    if slug.len() > 60 {
        return Err("Slug must be 60 characters or less".to_string());
    }
    if !slug.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-') {
        return Err("Slug must contain only lowercase letters, digits, and hyphens".to_string());
    }
    if slug.starts_with('-') || slug.ends_with('-') {
        return Err("Slug must not start or end with a hyphen".to_string());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_slugify() {
        assert_eq!(slugify("Fix the login bug", 50), "fix-login-bug");
    }

    #[test]
    fn test_special_chars() {
        assert_eq!(slugify("Add user auth (JWT)", 50), "add-user-auth-jwt");
    }

    #[test]
    fn test_truncation() {
        assert_eq!(
            slugify("Implement the very long feature that does many things at once", 30),
            "implement-very-long-feature"
        );
    }

    #[test]
    fn test_all_stop_words() {
        assert_eq!(slugify("the a an is", 50), "item");
    }

    #[test]
    fn test_numbers() {
        assert_eq!(slugify("Fix bug #42 in API v2", 50), "fix-bug-42-api-v2");
    }

    #[test]
    fn test_validate_slug() {
        assert!(validate_slug("fix-login-bug").is_ok());
        assert!(validate_slug("").is_err());
        assert!(validate_slug("-leading").is_err());
        assert!(validate_slug("UPPER").is_err());
        assert!(validate_slug("has spaces").is_err());
    }
}

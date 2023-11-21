export function removeSeparator(id) {
  const separator = ":";
  const separatorIndex = id.indexOf(separator);

  if (separatorIndex !== -1) {
    return id.slice(0, separatorIndex) + id.slice(separatorIndex + 1);
  }

  // Return original ID if separator is not found
  return id;
}

export function addSeparator(id, prefix) {
  const separator = ":";

  if (id.startsWith(prefix)) {
    return id.slice(0, prefix.length) + separator + id.slice(prefix.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function removePrefix(id, prefix) {
  const separator = ":";
  const prefixWithSeparator = `${prefix}${separator}`;

  if (id.startsWith(prefixWithSeparator)) {
    return id.substring(prefixWithSeparator.length);
  }

  // Return original ID if prefix does not match
  return id;
}

export function addPrefix(id, prefix) {
  const separator = ":";
  return `${prefix}${separator}${id}`;
}

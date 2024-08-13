#!/bin/bash

# Check if depcheck-output.json exists
if [[ ! -f depcheck-output.json ]]; then
  echo "depcheck-output.json file not found. Please run depcheck first."
  exit 1
fi

# Parse the depcheck output to get the list of unused dependencies
UNUSED_DEPENDENCIES=$(jq -r '.dependencies[]' depcheck-output.json)

if [ -z "$UNUSED_DEPENDENCIES" ]; then
  echo "No unused dependencies found."
  exit 0
fi

# Loop through each unused dependency and remove it from package.json
for dep in $UNUSED_DEPENDENCIES; do
  echo "Removing unused dependency: $dep"
  npm uninstall "$dep"
done

# Clean up by removing the depcheck output file
rm depcheck-output.json

# Remove unused packages and update package-lock.json
npm prune
npm install

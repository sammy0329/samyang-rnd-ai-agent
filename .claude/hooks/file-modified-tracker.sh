#!/bin/bash
# File Modified Tracker Hook
# Tracks modified files after Edit/Write operations for later validation

# Skip if environment variable is set
if [ -n "$SKIP_FILE_TRACKING" ]; then
  exit 0
fi

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CACHE_DIR="$PROJECT_DIR/.claude/cache"

# Create cache directory if not exists
mkdir -p "$CACHE_DIR"

# Get tool name and modified file from environment
TOOL_NAME="${CLAUDE_TOOL_NAME:-}"
MODIFIED_FILE="${CLAUDE_FILE_PATH:-}"

# Only track specific tools
case "$TOOL_NAME" in
  Edit|Write|MultiEdit)
    ;;
  *)
    exit 0
    ;;
esac

# Skip if no file path
if [ -z "$MODIFIED_FILE" ]; then
  exit 0
fi

# Skip markdown files
if [[ "$MODIFIED_FILE" == *.md ]]; then
  exit 0
fi

# Get relative path
RELATIVE_PATH="${MODIFIED_FILE#$PROJECT_DIR/}"

# Determine file type
FILE_TYPE="unknown"
case "$RELATIVE_PATH" in
  src/app/*)
    FILE_TYPE="app"
    ;;
  src/components/*)
    FILE_TYPE="component"
    ;;
  src/lib/*)
    FILE_TYPE="lib"
    ;;
  src/hooks/*)
    FILE_TYPE="hook"
    ;;
  src/types/*)
    FILE_TYPE="type"
    ;;
esac

# Log to cache file
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%Y%m%d)}"
CACHE_FILE="$CACHE_DIR/modified-files-$SESSION_ID.log"

echo "$(date +%H:%M:%S) [$TOOL_NAME] [$FILE_TYPE] $RELATIVE_PATH" >> "$CACHE_FILE"

# Clean old cache files (older than 1 day)
find "$CACHE_DIR" -name "modified-files-*.log" -mtime +1 -delete 2>/dev/null || true

#!/bin/bash
# ESLint Check Hook
# Runs after Claude Code stops to verify code quality

set -e

# Skip if environment variable is set
if [ -n "$SKIP_LINT_CHECK" ]; then
  exit 0
fi

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# Check if package.json has lint script
if ! grep -q '"lint"' package.json 2>/dev/null; then
  exit 0
fi

# Run ESLint
echo "Running ESLint check..."

LINT_OUTPUT=$(pnpm lint 2>&1) || true
LINT_EXIT_CODE=$?

# Check for errors (not warnings)
ERROR_COUNT=$(echo "$LINT_OUTPUT" | grep -c "error" || true)

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo ""
  echo "ESLint errors detected!"
  echo "$LINT_OUTPUT" | grep "error" | head -20
  echo ""
  echo "Please fix the ESLint errors before committing."
  exit 1
else
  echo "ESLint check passed (warnings are acceptable)"
fi

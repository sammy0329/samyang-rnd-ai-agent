#!/bin/bash
# TypeScript Type Check Hook
# Runs after Claude Code stops to verify type safety

set -e

# Skip if environment variable is set
if [ -n "$SKIP_TSC_CHECK" ]; then
  exit 0
fi

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# Check if tsconfig.json exists
if [ ! -f "tsconfig.json" ]; then
  exit 0
fi

# Run TypeScript type check
echo "Running TypeScript type check..."

if pnpm type-check 2>&1; then
  echo "TypeScript check passed"
else
  echo ""
  echo "TypeScript errors detected!"
  echo "Please fix the type errors before committing."
  echo ""
  exit 1
fi

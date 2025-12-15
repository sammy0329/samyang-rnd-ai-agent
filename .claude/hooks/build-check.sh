#!/bin/bash
# Build Check Hook
# Verifies the project builds successfully before major changes

set -e

# Skip if environment variable is set
if [ -n "$SKIP_BUILD_CHECK" ]; then
  exit 0
fi

# Get project root directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# Check if package.json has build script
if ! grep -q '"build"' package.json 2>/dev/null; then
  exit 0
fi

# Run build
echo "Running build check..."

if pnpm build 2>&1; then
  echo "Build check passed"
else
  echo ""
  echo "Build failed!"
  echo "Please fix the build errors."
  echo ""
  exit 1
fi

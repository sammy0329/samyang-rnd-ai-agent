# Git Summary

Provide a comprehensive git status summary.

## Instructions

Run the following git commands and summarize the results:

### 1. Current Branch & Status
```bash
git branch --show-current
git status --short
```

### 2. Recent Commits
```bash
git log -5 --oneline --decorate
```

### 3. Uncommitted Changes
```bash
git diff --stat
git diff --cached --stat
```

### 4. Remote Status
```bash
git fetch --dry-run 2>&1
git log HEAD..origin/$(git branch --show-current) --oneline 2>/dev/null || echo "Up to date"
```

## Output Format

Provide a summary like:
```
Branch: develop
Status: 3 modified, 1 untracked

Recent Commits:
- abc1234 feat: Add new feature
- def5678 fix: Bug fix
- ...

Uncommitted Changes:
- src/file1.ts (+10, -5)
- src/file2.ts (+3, -1)

Remote: Up to date / Behind by X commits
```

# Pre-Deployment Check

Comprehensive validation before deploying to production.

## Instructions

Run the following checks to ensure the project is ready for deployment:

### 1. Code Quality Checks
```bash
pnpm type-check && pnpm lint
```

### 2. Build Verification
```bash
pnpm build
```

### 3. Environment Variables Check
Verify these environment variables are properly configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### 4. Git Status Check
```bash
git status
git log -3 --oneline
```
- Ensure all changes are committed
- Verify you're on the correct branch

### 5. CI/CD Status
Check if GitHub Actions CI passed for the latest commit.

## Output

Provide a deployment readiness report:
- [ ] TypeScript: No errors
- [ ] ESLint: No errors
- [ ] Build: Successful
- [ ] Environment: Configured
- [ ] Git: Clean working tree
- [ ] CI: Passing

If any check fails, explain and suggest fixes before deployment.

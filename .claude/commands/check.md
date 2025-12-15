# Full Project Check

Run all project checks to ensure code quality before commit/push.

## Instructions

Please run the following checks in sequence:

1. **TypeScript Type Check**
   ```bash
   pnpm type-check
   ```
   - Fix any type errors before proceeding

2. **ESLint Check**
   ```bash
   pnpm lint
   ```
   - Fix any ESLint errors (warnings are acceptable)

3. **Build Check**
   ```bash
   pnpm build
   ```
   - Ensure the project builds successfully

## Output Format

After running all checks, provide a summary:
- TypeScript: PASS/FAIL (number of errors)
- ESLint: PASS/FAIL (number of errors, warnings)
- Build: PASS/FAIL

If any check fails, explain the errors and suggest fixes.

# Phase 0.1: Learning Notes

**Date:** 2026-01-24

---

## Summary

Tool validation completed successfully. All required tools are installed and configured.

---

## Unexpected Findings

### 1. Nested Directory Structure

**Issue:** The repository has a nested structure where the React Native app is in `demo-react-native-app/demo-react-native-app/`.

**Impact:** Commands like `npx tsc --version` failed when run from the repo root because TypeScript is only installed in the app subfolder.

**Workaround:** Always run tool commands from the correct directory:
```bash
cd demo-react-native-app/demo-react-native-app
npx tsc --version  # Works
```

**Lesson:** When validating tools, verify the correct working directory first.

---

### 2. TypeScript Global vs Local

**Issue:** Running `npx tsc --version` from repo root shows error:
```
This is not the tsc command you are looking for
```

**Cause:** npx tries to install TypeScript globally when it's not found locally.

**Solution:** Run from the app directory where `node_modules` contains TypeScript.

---

### 3. Playwright Configuration Conflict

**Issue:** Running `npx playwright test --list` from repo root showed error about `test.describe()` being called in wrong context.

**Cause:** There's a Playwright test file (`e2e/favorites.spec.ts`) at the repo root level, separate from the app's E2E tests.

**Solution:** Run Playwright commands from the app directory:
```bash
cd demo-react-native-app/demo-react-native-app
npx playwright test --list  # Works correctly
```

---

### 4. Missing docker-compose.dev.yml

**Issue:** The `docker-compose.dev.yml` file doesn't exist.

**Expected:** This is expected - the file will be created in Phase 3.5 (Server Infrastructure).

**Action:** No action needed. Documented as "not applicable" rather than "failed".

---

## Tools Version Summary

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | v24.11.1 | Above v18 requirement |
| npm | 11.6.2 | Above v9 requirement |
| Expo CLI | 54.0.22 | Latest |
| TypeScript | 5.9.3 | In app dir |
| Playwright | 1.58.0 | 29 E2E tests |
| Maestro | 2.0.10 | 4 mobile flows |
| Docker | 29.1.3 | Ready for Phase 3.5 |
| Docker Compose | v2.40.3 | Ready for Phase 3.5 |
| EAS CLI | 16.28.0 | Logged in |
| Git | 2.52.0 | Remote configured |

---

## Quality Tool Status

| Tool | Result |
|------|--------|
| arch:test | 0 violations (119 modules, 274 deps) |
| lint:dead-code | Working (knip) - 1 config hint |
| lint:duplicates | Working (jscpd) - 4 clones found |
| security:scan | Working (semgrep) - 1063 rules |

---

## Recommendations

1. **Document directory structure** in developer guide to prevent confusion
2. **Consider consolidating** the repo root and app directories in future
3. **Add directory context** to npm scripts that may be run from wrong location

---

*Last Updated: 2026-01-24*

# Phase 0.1: Tool & Resource Validation

**Status:** 📋 PLANNED

**Goal:** Validate all tools and resources needed for Epic 04 are installed and configured

**Dependencies:** Phase 0 (Landing Page Deployment)

---

## Overview

Before starting feature development, verify that all tools and resources required throughout Epic 04 are properly installed and configured. This prevents blocking issues mid-development.

---

## Branching Strategy

**Branch Name:** `PHASE_0.1_TOOL_VALIDATION`

**Approach:**
- Create branch from `main`
- Single commit with validation results
- Commit format: `chore(phase0.1): validate tools and resources`

---

## Tool Instructions

This phase validates these tools - use the commands below to verify each one.

---

## Validation Checklist

### 1. Node.js & npm
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```
- [ ] Node.js installed (v18+)
- [ ] npm installed (v9+)

### 2. React Native / Expo
```bash
cd demo-react-native-app
npx expo --version
```
- [ ] Expo CLI accessible
- [ ] Can start dev server (`npm start` - just verify it starts, then Ctrl+C)

### 3. Unit Tests (Jest)
```bash
cd demo-react-native-app
npm test -- --listTests
```
- [ ] Jest configured
- [ ] Test files discovered

### 4. E2E Tests (Playwright)
```bash
cd demo-react-native-app
npx playwright --version
npx playwright test --list
```
- [ ] Playwright installed
- [ ] Test files discovered

### 5. Mobile E2E Tests (Maestro)
```bash
maestro --version
ls e2e/maestro/
```
- [ ] Maestro CLI installed
- [ ] Maestro test files exist

### 6. Docker (for Phase 3.5+)
```bash
docker --version
docker-compose --version
ls docker-compose.dev.yml
```
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] docker-compose.dev.yml exists

### 7. Quality Tools
```bash
cd demo-react-native-app

# Architecture tests
npm run arch:test -- --help 2>/dev/null || echo "arch:test not configured"

# Dead code detection
npm run lint:dead-code -- --help 2>/dev/null || echo "lint:dead-code not configured"

# Duplicate detection
npm run lint:duplicates -- --help 2>/dev/null || echo "lint:duplicates not configured"

# Security scan
npm run security:scan -- --help 2>/dev/null || echo "security:scan not configured"
```
- [ ] `arch:test` command exists
- [ ] `lint:dead-code` command exists
- [ ] `lint:duplicates` command exists
- [ ] `security:scan` command exists

### 8. TypeScript & Linting
```bash
cd demo-react-native-app
npx tsc --version
npm run lint -- --help
```
- [ ] TypeScript installed
- [ ] ESLint configured

### 9. EAS Build (Expo Application Services)
```bash
eas --version
eas whoami
```
- [ ] EAS CLI installed
- [ ] Logged in to EAS account

### 10. Git
```bash
git --version
git remote -v
```
- [ ] Git installed
- [ ] Remote configured

---

## Implementation Order

| Order | Task | Type | Effort | Status |
|-------|------|------|--------|--------|
| 1 | Validate Node.js & npm | Validation | ~2 min | not started |
| 2 | Validate Expo CLI | Validation | ~2 min | not started |
| 3 | Validate Jest (unit tests) | Validation | ~2 min | not started |
| 4 | Validate Playwright (E2E) | Validation | ~2 min | not started |
| 5 | Validate Maestro (mobile E2E) | Validation | ~2 min | not started |
| 6 | Validate Docker installation | Validation | ~2 min | not started |
| 7 | Validate quality tool commands | Validation | ~5 min | not started |
| 8 | Validate TypeScript & ESLint | Validation | ~2 min | not started |
| 9 | Validate EAS CLI | Validation | ~2 min | not started |
| 10 | Validate Git configuration | Validation | ~2 min | not started |
| 11 | Document any missing tools | Documentation | ~10 min | not started |
| 12 | Install/configure missing tools | Setup | ~30 min | not started |
| 13 | Re-validate after fixes | Validation | ~10 min | not started |

**Total Estimated Effort:** ~1 hour

---

## Success Criteria

Phase 0.1 is complete when:
- [ ] All validation checks pass
- [ ] Any missing tools are installed and configured
- [ ] Validation results documented

---

## Validation Results

Document validation results here after running checks:

```
Date: ____________________

Node.js:        [ ] Pass  [ ] Fail  Version: ________
npm:            [ ] Pass  [ ] Fail  Version: ________
Expo CLI:       [ ] Pass  [ ] Fail  Version: ________
Jest:           [ ] Pass  [ ] Fail
Playwright:     [ ] Pass  [ ] Fail  Version: ________
Maestro:        [ ] Pass  [ ] Fail  Version: ________
Docker:         [ ] Pass  [ ] Fail  Version: ________
Docker Compose: [ ] Pass  [ ] Fail  Version: ________
arch:test:      [ ] Pass  [ ] Fail  [ ] Not configured
lint:dead-code: [ ] Pass  [ ] Fail  [ ] Not configured
lint:duplicates:[ ] Pass  [ ] Fail  [ ] Not configured
security:scan:  [ ] Pass  [ ] Fail  [ ] Not configured
TypeScript:     [ ] Pass  [ ] Fail  Version: ________
ESLint:         [ ] Pass  [ ] Fail
EAS CLI:        [ ] Pass  [ ] Fail  Version: ________
Git:            [ ] Pass  [ ] Fail  Version: ________

Notes:
_________________________________________________
_________________________________________________
```

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during validation:

**[Phase 0.1 Learning Notes →](./PHASE0.1_LEARNING_NOTES.md)**

---

## Reference

### Developer Guides
- [Testing Guide](../../developer-guide/TESTING.md)
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md)
- [Troubleshooting](../../developer-guide/TROUBLESHOOTING.md)

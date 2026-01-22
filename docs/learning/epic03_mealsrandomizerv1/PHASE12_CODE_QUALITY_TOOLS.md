# Phase 12: Advanced Code Quality Tools

[← Back to Overview](./OVERVIEW.md) | [Learning Notes →](./PHASE12_LEARNING_NOTES.md)

---

## Goal

Add advanced ESLint plugins (sonarjs, import), security scanning (Semgrep), and reduce code duplication through shared style and utility extraction.

**Status:** COMPLETE (2026-01-22)

---

## Tools Added

### 1. eslint-plugin-sonarjs - Code Quality Rules

**What:** SonarQube-style rules for ESLint (cognitive complexity, code smells)

**Why:**
- Catches overly complex code
- Detects code smells (duplicate strings, redundant boolean checks)
- Enforces maintainability standards
- Industry-standard quality rules

**Configuration (in eslint.config.js):**
```javascript
{
  'sonarjs/cognitive-complexity': ['warn', 15],
  'sonarjs/no-duplicate-string': ['warn', { threshold: 3 }],
  'sonarjs/no-identical-functions': 'warn',
  'sonarjs/no-collapsible-if': 'warn',
  'sonarjs/no-collection-size-mischeck': 'error',
  'sonarjs/no-redundant-boolean': 'warn',
  'sonarjs/no-unused-collection': 'warn',
  'sonarjs/prefer-immediate-return': 'warn',
  'sonarjs/no-inverted-boolean-check': 'warn',
}
```

**Findings:**
- 5 duplicate string warnings (color hex codes like `#3e96ef`)
- These are advisory warnings, not blocking errors

### 2. eslint-plugin-import - Import Ordering

**What:** Enforces consistent import ordering and catches import issues

**Why:**
- Consistent import organization across codebase
- Alphabetized imports for easier navigation
- Groups by type (builtin, external, internal, etc.)
- Auto-fixable with `eslint --fix`

**Configuration (in eslint.config.js):**
```javascript
{
  'import/order': [
    'warn',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'index',
        'type',
      ],
      'newlines-between': 'never',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'import/no-duplicates': 'warn',
}
```

**Results:**
- Auto-fixed 38 files in one command
- Consistent import ordering across entire codebase

### 3. Semgrep - Security Scanning

**What:** Security-focused static analysis tool

**Why:**
- OWASP pattern detection
- XSS, injection vulnerability scanning
- Configurable security rules
- Industry-standard security tool

**npm Scripts:**
```json
{
  "security:scan": "semgrep scan --config auto app/ lib/",
  "security:scan:ci": "semgrep scan --config auto --error app/ lib/"
}
```

**Note:** Semgrep is a Python tool, not an npm package. Required adding `"ignoreBinaries": ["semgrep"]` to knip.json.

---

## Duplication Reduction

### Problem

jscpd identified 25 code clones (6.53% duplication), primarily in:
- Modal patterns across manage-categories.tsx, manage-ingredients.tsx, settings.tsx
- Date formatting logic in history.tsx and index.tsx

### Solution 1: Shared Styles

**Created:** `constants/shared-styles.ts`

```typescript
export const modalStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', ... },
  modalContent: { backgroundColor: '#1a1f25', borderRadius: 16, ... },
  modalTitle: { color: '#FFFFFF', fontSize: 20, ... },
  modalButtons: { flexDirection: 'row', marginTop: 24, ... },
  cancelButton: { flex: 1, paddingVertical: 14, ... },
  saveButton: { flex: 1, backgroundColor: '#3e96ef', ... },
});

export const screenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e14' },
  header: { flexDirection: 'row', ... },
  loadingContainer: { flex: 1, justifyContent: 'center', ... },
  emptyState: { flex: 1, justifyContent: 'center', ... },
});

export const actionButtonStyles = StyleSheet.create({
  editButton: { padding: 8, marginRight: 8 },
  deleteButton: { padding: 8 },
});
```

### Solution 2: Date Utilities

**Created:** `lib/utils/dateUtils.ts`

```typescript
export function isToday(dateString: string): boolean { ... }
export function isYesterday(dateString: string): boolean { ... }
export function getDaysAgo(dateString: string): number { ... }
```

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Clones | 25 | 19 | -6 |
| Duplication % | 6.53% | 3.98% | -2.55% |
| Lines saved | - | ~200 | - |

---

## Comparison: Saberloop vs SaborSpin (Updated)

| Tool | Saberloop | SaborSpin |
|------|-----------|-----------|
| Prettier | ✅ | ✅ |
| eslint-config-prettier | ✅ | ✅ |
| Husky | ✅ | ✅ |
| lint-staged | ✅ | ✅ |
| dependency-cruiser | ✅ | ✅ (Phase 9) |
| Stryker | ✅ | ✅ (Phase 8) |
| commitlint | ✅ | ✅ (Phase 10) |
| jscpd | ✅ | ✅ (Phase 10) |
| Knip | ✅ | ✅ (Phase 10) |
| **eslint-plugin-sonarjs** | ✅ | ✅ (Phase 12) |
| **eslint-plugin-import** | ✅ | ✅ (Phase 12) |
| **Semgrep** | ✅ | ✅ (Phase 12) |
| rollup-plugin-visualizer | ✅ | N/A (React Native) |

**SaborSpin now has feature parity with Saberloop's code quality tooling!**

---

## Implementation Summary

### Files Created
- `demo-react-native-app/constants/shared-styles.ts`
- `demo-react-native-app/lib/utils/dateUtils.ts`

### Files Modified
- `demo-react-native-app/eslint.config.js` (added sonarjs and import plugins)
- `demo-react-native-app/package.json` (dependencies + Semgrep scripts)
- `demo-react-native-app/knip.json` (added ignoreBinaries for semgrep)
- `demo-react-native-app/app/(tabs)/manage-categories.tsx` (use shared styles)
- `demo-react-native-app/app/(tabs)/manage-ingredients.tsx` (use shared styles)
- `demo-react-native-app/app/(tabs)/settings.tsx` (use shared styles)
- `demo-react-native-app/app/(tabs)/history.tsx` (use date utils)
- `demo-react-native-app/app/(tabs)/index.tsx` (use date utils)

### npm Scripts Added
```json
{
  "security:scan": "semgrep scan --config auto app/ lib/",
  "security:scan:ci": "semgrep scan --config auto --error app/ lib/"
}
```

---

## Git Strategy

**Branch:** `feature/phase12-code-quality-tools`

**Commits:**
1. `chore: add eslint-plugin-sonarjs and import plugins`
2. `refactor: extract shared modal and screen styles`
3. `refactor: extract date utilities to reduce duplication`
4. `style: fix import ordering`
5. `fix: add semgrep to knip ignoreBinaries`

**PR:** #8 (merged to main)

---

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation | ✅ Pass |
| ESLint (including new rules) | ✅ Pass |
| All 220 unit tests | ✅ Pass |
| All 23 E2E tests | ✅ Pass |
| jscpd duplication < 5% | ✅ 3.98% |
| CI pipeline | ✅ Pass |

---

## Remaining Work (Optional)

### SonarJS Warnings

5 duplicate string warnings for color hex codes:
- `#3e96ef` (3 occurrences)
- Other colors in various components

**Options:**
1. Extract to `constants/colors.ts` theme file
2. Accept as advisory (inline colors often more readable)

### Remaining Duplicates (Acceptable)

- Modal JSX structure (inherent pattern, not worth abstracting)
- `getIngredientNames` helper (8 lines, minimal benefit to extract)
- Config file patterns (JavaScript boilerplate)
- Validation query patterns (structural similarity)

---

## Learning Outcomes

1. **SonarJS rules** - Code quality beyond basic linting
2. **Import ordering** - Auto-fixable organization
3. **External binaries** - Knip ignoreBinaries for non-npm tools
4. **Style extraction** - React Native StyleSheet sharing
5. **Utility extraction** - Small functions worth extracting if duplicated
6. **Duplication targets** - Aim for <5%, not all duplication is bad

---

*Completed: 2026-01-22*

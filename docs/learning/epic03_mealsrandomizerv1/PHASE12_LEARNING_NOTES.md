# Phase 12: Learning Notes

[← Back to Phase 12 Plan](./PHASE12_CODE_QUALITY_TOOLS.md)

---

## Session: 2026-01-22

### eslint-plugin-sonarjs Configuration

**Purpose:** SonarQube-style code quality rules for ESLint.

**Rules enabled:**
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

**Key findings after enabling:**
- 5 duplicate string warnings (color hex codes like `#3e96ef`)
- These are advisory warnings, not errors
- Color constants could be extracted to theme, but inline colors are often more readable

**Lesson:** SonarJS rules are excellent for catching code smells. Set most rules to `warn` initially to avoid blocking CI, then tighten as you fix issues.

---

### eslint-plugin-import for Import Ordering

**Purpose:** Enforce consistent import ordering and catch import issues.

**Configuration:**
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

**Auto-fix capability:**
```bash
npx eslint --fix "app/**/*.tsx" "lib/**/*.ts"
```

This auto-fixed 38 files in one command.

**Lesson:** Import ordering is tedious to do manually. Let ESLint auto-fix it. The alphabetization makes finding imports much easier.

---

### Semgrep with External Binaries

**Problem:** Semgrep is a Python tool, not an npm package. Knip flagged it as an "unlisted binary."

**Error in CI:**
```
Unlisted binaries (1)
semgrep  package.json
```

**Fix:** Add to `ignoreBinaries` in knip.json:
```json
{
  "ignoreBinaries": ["semgrep"]
}
```

**Scripts added:**
```json
{
  "security:scan": "semgrep scan --config auto app/ lib/",
  "security:scan:ci": "semgrep scan --config auto --error app/ lib/"
}
```

**Lesson:** When using external tools (Python, Go, etc.) in npm scripts, tell Knip to ignore them via `ignoreBinaries`.

---

### Extracting Shared Styles in React Native

**Problem:** jscpd found 25 code clones (6.53% duplication), primarily in modal styles across 3 screens.

**Pattern identified:**
```typescript
// Duplicated in manage-categories.tsx, manage-ingredients.tsx, settings.tsx
modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', ... },
modalContent: { backgroundColor: '#1a1f25', borderRadius: 16, ... },
modalTitle: { color: '#FFFFFF', fontSize: 20, ... },
modalButtons: { flexDirection: 'row', marginTop: 24, ... },
cancelButton: { flex: 1, paddingVertical: 14, ... },
saveButton: { flex: 1, backgroundColor: '#3e96ef', ... },
```

**Solution:** Created `constants/shared-styles.ts`:
```typescript
export const modalStyles = StyleSheet.create({
  modalOverlay: { ... },
  modalContent: { ... },
  modalTitle: { ... },
  modalButtons: { ... },
  cancelButton: { ... },
  saveButton: { ... },
});

export const screenStyles = StyleSheet.create({
  container: { ... },
  header: { ... },
  loadingContainer: { ... },
  emptyState: { ... },
});

export const actionButtonStyles = StyleSheet.create({
  editButton: { ... },
  deleteButton: { ... },
});
```

**Usage in screens:**
```typescript
import { modalStyles, screenStyles } from '../../constants/shared-styles';

// In JSX
<View style={modalStyles.modalOverlay}>
  <View style={modalStyles.modalContent}>
```

**Result:** Reduced ~200 lines of duplicate code.

**Lesson:** React Native StyleSheets can be extracted and shared just like any other module. Group related styles (modal, screen, buttons) for easier maintenance.

---

### Date Utility Extraction

**Problem:** Similar date formatting logic duplicated in `history.tsx` and `index.tsx`.

**Pattern:**
```typescript
// Both files had similar today/yesterday check logic
const today = new Date();
today.setHours(0, 0, 0, 0);
const mealDate = new Date(dateString);
mealDate.setHours(0, 0, 0, 0);
if (mealDate.getTime() === today.getTime()) { ... }
```

**Solution:** Created `lib/utils/dateUtils.ts`:
```typescript
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
}

export function isYesterday(dateString: string): boolean { ... }
export function getDaysAgo(dateString: string): number { ... }
```

**Usage:**
```typescript
import { isToday, isYesterday, getDaysAgo } from '../../lib/utils/dateUtils';

const formatDate = (dateString: string): string => {
  if (isToday(dateString)) return t('date.today');
  if (isYesterday(dateString)) return t('date.yesterday');
  return t('date.daysAgo', { count: getDaysAgo(dateString) });
};
```

**Lesson:** Even small utilities (3 functions, ~50 lines) are worth extracting if they're duplicated and have clear semantics.

---

### Duplication Reduction Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Clones | 25 | 19 | -6 |
| Duplication % | 6.53% | 3.98% | -2.55% |
| Lines saved | - | ~200 | - |

**Remaining duplicates (acceptable):**
- Modal JSX structure (inherent pattern)
- `getIngredientNames` helper (8 lines, could extract but minimal benefit)
- Config file patterns (JavaScript)
- Validation query patterns (structural similarity)

**Lesson:** Aim for <5% duplication. Not all duplication is bad - some patterns are naturally similar and forcing abstraction would hurt readability.

---

### CI Integration Pattern

**Strategy:** Run new checks in advisory mode first, then tighten.

```yaml
# Advisory mode - won't fail CI
- name: Check dead code
  run: npm run lint:dead-code
  continue-on-error: true

# Blocking mode - after cleanup
- name: Check dead code
  run: npm run lint:dead-code
```

**Lesson:** New code quality checks should start as advisory. This lets you see issues without blocking the team. Once issues are fixed, remove `continue-on-error`.

---

## Tools Summary

| Tool | Purpose | Run Command |
|------|---------|-------------|
| eslint-plugin-sonarjs | Code quality rules | `npm run lint` |
| eslint-plugin-import | Import ordering | `npm run lint` / `npm run lint --fix` |
| Semgrep | Security scanning | `npm run security:scan` |

---

## Files Created/Modified

| File | Action |
|------|--------|
| `eslint.config.js` | Added sonarjs and import plugins |
| `package.json` | Added Semgrep scripts |
| `knip.json` | Added `ignoreBinaries: ["semgrep"]` |
| `constants/shared-styles.ts` | Created (shared modal/screen styles) |
| `lib/utils/dateUtils.ts` | Created (date utilities) |
| `app/(tabs)/manage-categories.tsx` | Refactored to use shared styles |
| `app/(tabs)/manage-ingredients.tsx` | Refactored to use shared styles |
| `app/(tabs)/settings.tsx` | Refactored to use shared styles |
| `app/(tabs)/history.tsx` | Refactored to use date utils |
| `app/(tabs)/index.tsx` | Refactored to use date utils |

---

*Notes created: 2026-01-22*

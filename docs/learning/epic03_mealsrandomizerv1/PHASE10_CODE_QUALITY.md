# Phase 10: Code Quality Enhancement

[← Back to Overview](./OVERVIEW.md)

---

## Goal

Add commitlint, Knip, and jscpd to SaborSpin's code quality tooling to enforce commit conventions, detect dead code, and identify duplicate code patterns.

**Status:** COMPLETE (2026-01-22)

---

## Tools Added

### 1. commitlint - Commit Message Linting

**What:** Enforces Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)

**Why:**
- Clean, consistent commit history
- Enables auto-changelog generation
- Better git log readability
- Industry-standard commit conventions

**Configuration:** `commitlint.config.js`
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'revert', 'ci',
    ]],
  },
};
```

**Husky Hook:** `.husky/commit-msg`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx --no -- commitlint --edit "$1"
```

### 2. Knip - Dead Code Detection

**What:** Detects unused files, dependencies, and exports

**Why:**
- Keeps codebase clean
- Finds forgotten/orphaned code
- Identifies unused dependencies (reduces bundle size)
- Finds unused exports (API surface cleanup)

**Configuration:** `knip.json`
```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["app/**/*.tsx", "lib/**/*.ts", "metro.config.js"],
  "project": ["app/**/*.tsx", "lib/**/*.ts", "components/**/*.tsx"],
  "ignore": ["**/__tests__/**", "**/__mocks__/**", "e2e/**"],
  "ignoreDependencies": [
    "babel-jest",
    "react-test-renderer",
    "baseline-browser-mapping",
    "eslint-config-prettier",
    "sharp",
    "expo-updates",
    "@expo/metro-config",
    "metro-minify-terser"
  ],
  "jest": true,
  "typescript": true
}
```

**npm Script:** `npm run lint:dead-code`

**Initial Findings:**
- 5 unused Expo template files in `components/`
- 3 potentially unused dependencies

### 3. jscpd - Duplicate Code Detection

**What:** Copy/paste detector, finds duplicate code blocks

**Why:**
- Reduces maintenance burden
- Encourages abstraction where appropriate
- Identifies refactoring opportunities
- Improves code consistency

**Configuration:** `.jscpd.json`
```json
{
  "threshold": 10,
  "reporters": ["console"],
  "ignore": ["**/__tests__/**", "**/__mocks__/**", "node_modules/**", "e2e/**"],
  "format": ["typescript", "tsx"]
}
```

**npm Script:** `npm run lint:duplicates`

**Initial Findings:**
- 25 code clones found
- 6.53% duplication rate
- Main areas: manage-ingredients.tsx, manage-categories.tsx, settings.tsx (shared modal patterns)

---

## Comparison: Saberloop vs SaborSpin

| Tool | Saberloop | SaborSpin |
|------|-----------|-----------|
| Prettier | ✅ | ✅ |
| eslint-config-prettier | ✅ | ✅ |
| Husky | ✅ | ✅ |
| lint-staged | ✅ | ✅ |
| dependency-cruiser | ✅ | ✅ (Phase 9) |
| Stryker | ✅ | ✅ (Phase 8) |
| **commitlint** | ✅ | ✅ (Phase 10) |
| **jscpd** | ✅ | ✅ (Phase 10) |
| **Knip** | ✅ | ✅ (Phase 10) |
| eslint-plugin-sonarjs | ✅ | ❌ (future) |
| eslint-plugin-import | ✅ | ❌ (future) |
| Semgrep | ✅ | ❌ (future) |

---

## Implementation Summary

### Files Created
- `demo-react-native-app/commitlint.config.js`
- `demo-react-native-app/.husky/commit-msg`
- `demo-react-native-app/knip.json`
- `demo-react-native-app/.jscpd.json`

### Files Modified
- `demo-react-native-app/package.json` (dependencies + scripts)
- `.github/workflows/ci.yml` (new checks)

### npm Scripts Added
```json
{
  "lint:dead-code": "knip",
  "lint:dead-code:fix": "knip --fix",
  "lint:duplicates": "jscpd app/ lib/ components/"
}
```

### CI Integration
```yaml
- name: Check dead code
  run: npm run lint:dead-code
  continue-on-error: true  # Advisory

- name: Check duplicates
  run: npm run lint:duplicates
  continue-on-error: true  # Advisory
```

---

## Git Strategy

**Branch:** `feature/phase10-code-quality`

**Commits:**
1. `chore: add commitlint for conventional commits`
2. `chore: add Knip for dead code detection`
3. `chore: add jscpd for duplicate code detection`
4. `ci: add dead code and duplicate checks`

---

## Verification Results

| Check | Result |
|-------|--------|
| commitlint rejects bad commits | ✅ Pass |
| commitlint accepts good commits | ✅ Pass |
| Knip runs and reports findings | ✅ Pass |
| jscpd runs and reports duplicates | ✅ Pass |
| All 220 unit tests pass | ✅ Pass |
| ESLint passes | ✅ Pass |

---

## Future Considerations

### Potential Next Tools

1. **eslint-plugin-sonarjs** - Quality/complexity rules
   - Cognitive complexity limits
   - Code smell detection
   - Effort: ~30 min

2. **eslint-plugin-import** - Import ordering/validation
   - Consistent import ordering
   - No unresolved imports
   - Effort: ~20 min

3. **Semgrep** - Security static analysis
   - OWASP patterns
   - Custom security rules
   - Effort: ~1 hour (requires Python)

### Addressing Knip Findings

The 5 unused Expo template files should be reviewed:
- `components/external-link.tsx`
- `components/hello-wave.tsx`
- `components/parallax-scroll-view.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/icon-symbol.ios.tsx`

### Addressing jscpd Findings

Top duplication areas to refactor:
1. Modal patterns in manage-ingredients/manage-categories/settings
2. History/index screen date handling
3. Validation patterns in lib/database/validation.ts

---

## Learning Outcomes

1. **Conventional Commits** - Standard commit message format
2. **Dead code detection** - Keeping codebase lean
3. **Duplicate detection** - Finding refactoring opportunities
4. **CI integration** - Advisory vs blocking checks
5. **Tool configuration** - Ignoring false positives

---

*Completed: 2026-01-22*

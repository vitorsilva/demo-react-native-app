# Phase 10: Learning Notes

[← Back to Phase 10 Plan](./PHASE10_CODE_QUALITY.md)

---

## Session: 2026-01-22

### Knip Configuration for Expo/React Native

**Problem:** Knip initially reported many false positives for Expo-specific dependencies.

**Error:**
```
Unlisted dependencies (2)
expo-updates        app.json
@expo/metro-config  metro.config.js

Unresolved imports (1)
metro-minify-terser  metro.config.js
```

**Root cause:** Expo/React Native uses many implicit dependencies that are loaded by the framework, not directly imported in code. These include:
- `@expo/metro-config` - Used in metro.config.js
- `expo-updates` - Referenced in app.json
- `metro-minify-terser` - Used internally by Metro
- `sharp` - Used by Expo for image processing
- `baseline-browser-mapping` - Used by Expo tooling

**Fix:** Added these to `ignoreDependencies` in knip.json:
```json
{
  "ignoreDependencies": [
    "babel-jest",
    "react-test-renderer",
    "baseline-browser-mapping",
    "eslint-config-prettier",
    "sharp",
    "expo-updates",
    "@expo/metro-config",
    "metro-minify-terser"
  ]
}
```

**Lesson:** When using Knip with Expo/React Native, expect to ignore several framework-specific dependencies that are used implicitly.

---

### jscpd Threshold Configuration

**Problem:** jscpd with `threshold: 0` failed immediately because any duplication causes an error.

**Error:**
```
ERROR: jscpd found too many duplicates (6.53%) over threshold (0%)
```

**Root cause:** Setting threshold to 0 means "fail on any duplication" which is too strict for an existing codebase.

**Fix:** Set threshold to 10% to allow reporting without failing:
```json
{
  "threshold": 10
}
```

**Lesson:** Start with a permissive threshold (like 10%) and gradually tighten it as you refactor duplicates. A 0% threshold is only practical for greenfield projects.

---

### Knip's Exit Code Behavior

**Problem:** Knip returns exit code 1 when it finds any issues, even legitimate findings meant for future cleanup.

**Impact:** CI would fail even when findings are advisory.

**Fix:** Added `continue-on-error: true` to CI:
```yaml
- name: Check dead code
  run: npm run lint:dead-code
  continue-on-error: true  # Advisory - shows findings to address
```

**Lesson:** Knip (and similar tools) are designed to fail when they find issues. In CI, use `continue-on-error: true` for advisory checks, or configure the tool to only report warnings.

---

### Unused Expo Template Files

**Discovery:** Knip found 5 unused component files:
```
components/external-link.tsx
components/hello-wave.tsx
components/parallax-scroll-view.tsx
components/ui/collapsible.tsx
components/ui/icon-symbol.ios.tsx
```

**Root cause:** These are default Expo template files that come with `create-expo-app`. They were never used in SaborSpin but weren't cleaned up.

**Action:** These should be deleted in a future cleanup PR. They're legitimate dead code.

**Lesson:** When starting a new Expo project, review and remove unused template files early.

---

### jscpd Duplication Patterns Found

**Discovery:** 25 code clones (6.53% duplication) mainly in:

1. **Modal patterns** - `manage-ingredients.tsx`, `manage-categories.tsx`, `settings.tsx` share similar modal code
2. **Date handling** - `history.tsx` and `index.tsx` have similar date formatting
3. **Validation patterns** - `lib/database/validation.ts` has repeated validation logic

**Insight:** Most duplicates are UI patterns (modals, forms) that could be extracted to shared components.

**Lesson:** High duplication in React Native often comes from repeated UI patterns. Consider creating shared modal/form components or custom hooks.

---

### Husky Hook for commitlint

**Setup:** Created `.husky/commit-msg` hook to run commitlint:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx --no -- commitlint --edit "$1"
```

**Key detail:** The `$1` argument passes the commit message file path to commitlint.

**Testing:**
```bash
# Bad commit - rejected
echo "bad" | npx commitlint
# ✖ subject may not be empty
# ✖ type may not be empty

# Good commit - accepted
echo "test: verify commitlint works" | npx commitlint
# (no output = success)
```

**Lesson:** Always test commitlint manually before relying on the hook. Use `echo "message" | npx commitlint` for quick testing.

---

### Conventional Commits Quick Reference

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance (deps, config) |
| `ci` | CI/CD changes |
| `revert` | Reverting a commit |

**Format:** `type(scope): description`
- `feat(auth): add login button`
- `fix: resolve null pointer in home screen`
- `docs: update README with setup instructions`

---

## Tools Summary

| Tool | Purpose | Run Command |
|------|---------|-------------|
| commitlint | Commit message linting | Automatic via Husky |
| Knip | Dead code detection | `npm run lint:dead-code` |
| jscpd | Duplicate code detection | `npm run lint:duplicates` |

---

*Notes created: 2026-01-22*

# Phase 7: i18n Learning Notes

This document captures problems, solutions, and lessons learned during Phase 7 (Internationalization) implementation.

---

## 2026-01-22 - Translation Text Mismatch ("Configurações" vs "Definições")

**Problem:** E2E and Maestro tests were failing because they expected "Configurações" for "Settings" in Portuguese, but the actual translation used "Definições".

**Error:**
```
Timed out 5000ms waiting for expect(locator).toBeVisible()
Locator: getByText('Configurações')
```

**Root cause:** When writing tests, I assumed "Settings" would translate to "Configurações" (which is more literal), but the actual Portuguese translation in `settings.json` used "Definições" (which is more commonly used in Portugal for app settings).

**Fix:** Updated all test files to use the correct translation:
- `e2e/i18n.spec.ts` - Changed assertions from "Configurações" to "Definições"
- `e2e/maestro/i18n/language-switch.yaml` - Updated expected text
- `e2e/maestro/i18n/full-flow-pt.yaml` - Updated expected text

**Lesson:** Always verify translations against the actual translation files before writing tests. Don't assume translations - check the source of truth.

---

## 2026-01-22 - Playwright Strict Mode Violations (Multiple Element Matches)

**Problem:** Playwright E2E tests failed with strict mode violations when trying to interact with elements that appeared multiple times on the page.

**Error:**
```
Error: locator.click: Error: strict mode violation: getByText('Definições') resolved to 2 elements:
1) <span class="css-text-146c3p1 r-...">Definições</span>
2) <span class="css-text-146c3p1 r-...">Definições</span>
```

**Root cause:** The text "Definições" appeared both as:
1. The screen title (header)
2. The Settings tab label in the bottom navigation

When using `getByText('Definições')`, Playwright found both elements and failed due to strict mode.

**Fix:** Added `.first()` to selectors to explicitly select the first matching element:
```typescript
// Before (fails)
await expect(page.getByText('Definições')).toBeVisible();

// After (works)
await expect(page.getByText('Definições').first()).toBeVisible();
```

**Lesson:** In React Native apps with tab navigation, screen titles often match tab labels. Always consider using `.first()`, `.nth()`, or more specific selectors (like `testID`) to avoid ambiguity.

---

## 2026-01-22 - Android Emulator Package Manager Service Not Working

**Problem:** When trying to list installed packages or install APKs, the emulator returned an error about the package manager service.

**Error:**
```
adb shell pm list packages
Can't find service: package
```

**Root cause:** The emulator was loaded from a corrupted snapshot state where the Android system services hadn't started properly.

**Fix:** Cold boot the emulator without loading snapshot:
```powershell
# Kill the running emulator first
# Then start with -no-snapshot-load flag
$env:LOCALAPPDATA/Android/Sdk/emulator/emulator -avd Medium_Phone_API_36 -no-snapshot-load
```

**Lesson:** When the Android emulator behaves strangely (services not responding, apps not installing), try a cold boot with `-no-snapshot-load`. This is documented in `docs/developer-guide/MAESTRO_TESTING.md`.

---

## 2026-01-22 - Maestro Tests Failing Due to Outdated APK

**Problem:** Maestro tests for i18n were failing because the installed APK was built before the i18n changes were added.

**Error:**
```
Unable to find element: "Definições"
```

**Root cause:** The APK on the emulator was from an older EAS build that didn't include the i18n implementation. Language switching UI wasn't present.

**Fix:** Build a new APK with i18n changes via EAS:
```bash
eas build --platform android --profile preview
```

Then download and install:
```bash
# Using the new helper script
./scripts/download-apk.ps1 -Install
```

**Lesson:** When testing new features with Maestro, always ensure the APK includes those features. EAS builds are asynchronous - the latest build might not have your most recent changes. Check build timestamps and commit hashes.

---

## 2026-01-22 - Maestro Test Selector for Meal Type Buttons

**Problem:** Maestro test tried to tap on "Pequeno-Almoço" (Portuguese for "Breakfast") but the meal type names are user-defined content that doesn't get translated.

**Error:**
```
Unable to find element: "Pequeno-Almoço"
```

**Root cause:** Meal type names (Breakfast, Lunch, Dinner, Snack) are user-created data stored in the database. They are NOT translation keys - they're just the default names. The i18n system only translates UI chrome, not user content.

**Fix:** Use `testID` attribute instead of text matching:
```yaml
# Before (fails - meal types aren't translated)
- tapOn: "Pequeno-Almoço"

# After (works - uses testID)
- tapOn:
    id: "breakfast-ideas-button"
```

The testID `breakfast-ideas-button` was already on the component and doesn't depend on the displayed text.

**Lesson:**
1. User-generated content (ingredient names, category names, meal type names) should NOT be translated
2. Use `testID` for Maestro tests when the visible text might vary or when testing language-specific features
3. The testID approach is more resilient to translation changes

---

## 2026-01-22 - Keeping APKs in Git Repository

**Problem:** Every time we need to run Maestro tests, we had to manually download the latest APK from EAS, which is tedious and error-prone.

**Considered solution:** Keep the APK in the git repository for easier access.

**Why we didn't do it:**
1. APK files are ~92MB - too large for git
2. Would bloat repository history
3. APK changes with every build

**Actual solution:** Created helper scripts to automate APK download:
- `scripts/download-apk.ps1` (Windows PowerShell)
- `scripts/download-apk.sh` (macOS/Linux Bash)

Usage:
```powershell
# Download only
./scripts/download-apk.ps1

# Download and install
./scripts/download-apk.ps1 -Install
```

Added `*.apk` to `.gitignore` to prevent accidental commits.

**Lesson:** For large binary artifacts, prefer download scripts over storing in git. This keeps the repository lean while still providing convenience.

---

## General Lessons Learned

### 1. Translation Testing Strategy
- Always create translation completeness tests first (verify key parity)
- Test with actual translations, not assumptions
- Use recursive key comparison to catch nested translation issues

### 2. E2E Test Selectors
- Prefer `testID` over text matching for reliability
- Use `.first()` when text might appear multiple times
- Tab navigation means screen titles often duplicate tab labels

### 3. Maestro Testing Workflow
- Keep `MAESTRO_TESTING.md` updated with troubleshooting steps
- Cold boot emulator if services aren't responding
- Verify APK version before testing new features
- Use helper scripts to streamline APK management

### 4. i18n Architecture Decisions
- User content (names, custom data) should NOT be translated
- Only UI chrome (labels, buttons, messages) gets translated
- Namespace-based organization (9 namespaces) keeps translations manageable
- AsyncStorage persistence works well for language preference

---

[← Back to Phase 7 Plan](./PHASE7_I18N.md)

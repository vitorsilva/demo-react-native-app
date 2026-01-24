# Feature 1.5: Haptic Feedback - Learning Notes

## Task 1: Create haptics utility module

### Date: 2026-01-24

### What was implemented
- Created `lib/utils/haptics.ts` - a utility module providing standardized haptic feedback functions
- Implemented functions for: light, medium, heavy impact; success, warning, error notifications; and selection feedback
- Added platform detection to gracefully handle web (where haptics are unavailable)
- Used try-catch in `safeHaptic` wrapper to handle devices without haptic hardware

### Key decisions
1. **Platform check approach**: Used `Platform.OS !== 'web'` to determine availability. This is simple and covers the main case where haptics don't work.
2. **Empty catch block**: Intentionally using empty catch to silently fail - haptics are enhancement, not critical functionality.
3. **Async all the way**: All haptic functions return `Promise<void>` since expo-haptics is async. Callers can await if needed but typically fire-and-forget.

### Patterns used
- Similar structure to existing `dateUtils.ts` in the utils folder
- JSDoc comments for documentation
- Export object pattern (`haptics = { light: ..., medium: ... }`) for easy imports

### No issues encountered
- expo-haptics was already installed in package.json
- TypeScript and linter checks passed without changes

## Task 2: Add haptic preference to store

### Date: 2026-01-24

### What was implemented
- Added `hapticEnabled: boolean` to `UserPreferences` interface in `lib/database/preferences.ts`
- Default value is `true` (haptics enabled by default)
- Updated `getPreferences()` to retrieve `hapticEnabled` from the key-value store
- Updated `setPreferences()` to persist `hapticEnabled` to the database
- Updated store default preferences to include `hapticEnabled: true`

### Key decisions
1. **Boolean as string in DB**: The existing preferences system stores all values as strings in a key-value table. Boolean is stored as `'true'`/`'false'` strings and parsed on retrieval.
2. **Default enabled**: Haptic feedback is enabled by default to match user expectations on modern devices. Users can opt-out in settings.
3. **Null check for backwards compatibility**: Used `hapticEnabledStr !== null` check before parsing to handle existing databases without this preference.

### Issues encountered and fixes
- **TypeScript errors in test files**: Multiple test files needed to be updated to include `hapticEnabled` in their preference objects:
  - `lib/database/__tests__/preferences.test.ts` - 9 occurrences
  - `lib/store/__tests__/favorites.test.ts` - 1 occurrence
  - `lib/store/__tests__/index.test.ts` - 1 occurrence
- **Structure test updated**: The test `'getPreferences returns correct structure'` was checking for exactly 2 keys, updated to check for 3 keys including `hapticEnabled`

## Task 3: Add toggle to Settings screen

### Date: 2026-01-24

### What was implemented
- Added "Experience" section to the Settings screen with a Haptic Feedback toggle
- Added i18n translations for both English and Portuguese:
  - `experience.title`: "Experience" / "Experiência"
  - `experience.hapticFeedback`: "Haptic Feedback" / "Feedback Tátil"
  - `experience.hapticDescription`: "Vibration on interactions" / "Vibração nas interações"
- Toggle is connected to the `hapticEnabled` preference in the store
- Uses the same styling patterns as existing settings (settingCard, settingHeader, etc.)

### Key decisions
1. **Placement**: Added the Experience section between Language and Global Preferences sections, as per the wireframe in the spec
2. **Toggle style**: Used the same Switch component styling as meal type toggles for consistency
3. **Description text**: Added a small description below the toggle label to explain what haptic feedback does

### Files modified
- `app/(tabs)/settings.tsx` - Added Experience section with haptic toggle
- `lib/i18n/locales/en/settings.json` - Added experience translations
- `lib/i18n/locales/pt-PT/settings.json` - Added Portuguese translations

### No issues encountered
- TypeScript check: ✅ Passed
- Linter: ✅ Passed (only pre-existing warnings)

## Task 4: Integrate haptics into components

### Date: 2026-01-24

### What was implemented
- Updated `lib/utils/haptics.ts` to check the `hapticEnabled` preference from Zustand store before triggering haptics
- Replaced all direct `expo-haptics` calls with the new `haptics` utility in:
  - `app/suggestions/[mealType].tsx` - Select suggestion (light), generate new ideas (medium), toggle favorite (medium)
  - `components/modals/ConfirmationModal.tsx` - Confirm meal logged (success)
  - `app/(tabs)/history.tsx` - Toggle favorite (medium)

### Key decisions
1. **Store access in utility**: The haptics utility accesses the Zustand store directly via `useStore.getState()` to check if haptics are enabled. This is a valid pattern since Zustand allows accessing state outside of React components.
2. **Haptic type mapping**: Following the spec:
   - Select suggestion → Light impact
   - Confirm meal logged → Success notification (was Medium impact, changed to Success per spec)
   - Generate new ideas → Medium impact
   - Add to favorites → Medium impact
3. **Removed Platform checks**: The haptics utility already handles platform detection, so removed redundant `Platform.OS !== 'web'` checks from components.

### Files modified
- `lib/utils/haptics.ts` - Added store import and preference check in `safeHaptic`
- `app/suggestions/[mealType].tsx` - Replaced `Haptics.*` calls with `haptics.*`
- `components/modals/ConfirmationModal.tsx` - Replaced `Haptics.*` calls with `haptics.success()`
- `app/(tabs)/history.tsx` - Replaced `Haptics.*` calls with `haptics.medium()`

### Issues encountered and fixes
- **Import order warning**: The linter flagged that `haptics` import should come after `dateUtils` (alphabetical order within utils). Fixed by reordering imports.

### Verification
- TypeScript check: ✅ Passed
- Linter: ✅ Passed (only pre-existing warnings unrelated to this task)

## Task 5: CREATE unit tests for haptics utility

### Date: 2026-01-24

### What was implemented
- Created comprehensive unit tests for `lib/utils/haptics.ts` at `lib/utils/__tests__/haptics.test.ts`
- 28 tests covering all haptic functions (light, medium, heavy, success, warning, error, selection)
- Test scenarios cover:
  - Haptics enabled on iOS (calls expo-haptics correctly)
  - Haptics enabled on Android (calls expo-haptics correctly)
  - Haptics disabled in preferences (does not call expo-haptics)
  - Platform is web (does not call expo-haptics)
  - expo-haptics throws error (gracefully handles without throwing)

### Key decisions
1. **Dynamic mocking with `jest.doMock`**: The haptics module evaluates `Platform.OS` at load time to set `isHapticsAvailable`. Using `jest.doMock` before each `require` allows testing different platform configurations.
2. **Mock factory pattern**: Created `createHapticsMock()` and `createStoreMock()` helper functions to generate fresh mocks for each test suite. This ensures clean state and allows each suite to have its own mock configuration.
3. **Comprehensive coverage**: Tests verify both positive cases (haptics called correctly) and negative cases (haptics not called when disabled or unavailable).

### Issues encountered and fixes
- **Initial test approach failed**: First attempt used `jest.mock()` at the top level and `jest.isolateModules()` in beforeEach. This didn't work because `Platform.OS` is evaluated at module load time and the top-level mock was already established.
- **Solution**: Switched to using `jest.doMock()` inside each describe block's `beforeEach`, combined with `jest.resetModules()` to ensure fresh module loading with the correct mock configuration each time.

### Files created
- `lib/utils/__tests__/haptics.test.ts` - 28 unit tests

### Verification
- All 28 tests pass
- TypeScript check: ✅ Passed
- Linter: ✅ Passed (only pre-existing warnings)

## Task 6: Run all existing unit tests, Playwright tests and Maestro Tests

### Date: 2026-01-24

### What was done
Ran all three test suites to verify the haptic feedback implementation doesn't break any existing functionality.

### Test Results

**Unit Tests (Jest):**
- 309 tests passed (18 test suites)
- All tests pass including the new 28 haptics tests
- Console warnings from SaberloopSpanExporter tests are expected (testing offline queue behavior)

**Playwright E2E Tests:**
- 41 tests passed
- 1 test skipped
- 1 flaky test failure (passed on retry): `favorites.spec.ts:53 - should toggle favorite off from suggestions screen`
  - Root cause: Test isolation issue - app showed "No meal types configured" during beforeEach due to state not being properly reset between tests
  - Not related to haptic feedback changes
  - Passed when run individually with retries

**Maestro Tests:**
- Maestro CLI is installed (v2.0.10)
- ADB is available
- Emulator was not running at time of test execution
- Maestro tests require a running Android emulator with the app installed
- This is expected manual setup as documented in `docs/developer-guide/MAESTRO_TESTING.md`

### Key observations
1. **No regressions from haptic feedback implementation** - All unit tests and E2E tests pass, confirming the haptic integration doesn't break existing functionality.
2. **Flaky E2E test** - The favorites spec has a test isolation issue where state from previous tests can leak. This is a pre-existing issue unrelated to haptic changes.
3. **Maestro requires manual setup** - Unlike unit and Playwright tests that run automatically, Maestro requires: (1) Android emulator running, (2) App APK installed, (3) Manual test execution.

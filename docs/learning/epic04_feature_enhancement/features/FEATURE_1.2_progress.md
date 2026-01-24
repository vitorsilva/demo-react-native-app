# Feature 1.2: New! Badge - Progress Log

## Task 1: Capture BEFORE Screenshot (2026-01-24)

**Status:** Done (Updated with actual screenshot)

**What was done:**
- Created `screenshots/` directory for feature documentation
- Created `BEFORE_SCREENSHOT_README.md` documenting the current state
- **Actual screenshot added:** `screenshots/BEFORE_suggestion_cards.png`
  - Screenshot from pre-Epic 04 showing original card layout
  - Shows cards without New! badge or Favorites toggle

**Note:** The BEFORE screenshot was captured from a pre-Epic 04 state (before Feature 1.1 Favorites and Feature 1.2 New! Badge).

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 238 passed, 0 failed

---

## Task 2: Create isNewCombination() Utility (2026-01-24)

**Status:** Done

**What was done:**
- Created `lib/utils/variety.ts` with the `isNewCombination()` function
- Reused existing `getDaysAgo()` from `lib/utils/dateUtils.ts` for date calculation
- Function checks if a combination of ingredient IDs is "new" (never logged OR not logged in 7+ days)
- Exported `NEW_COMBINATION_THRESHOLD_DAYS` constant (7) for use in tests and other features

**Implementation details:**
- Takes `ingredientIds: string[]` and `history: MealLog[]` as parameters
- Sorts ingredient IDs for consistent comparison (order-independent matching)
- Iterates through history to find the most recent log with matching ingredients
- Returns `true` if never logged or if 7+ days since last logged

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 238 passed, 0 failed

---

## Task 3: Create NewBadge Component (2026-01-24)

**Status:** Done

**What was done:**
- Created `components/NewBadge.tsx` component
- Added i18n translation keys for "New!" badge text:
  - English: `newBadge: "New!"` in `lib/i18n/locales/en/suggestions.json`
  - Portuguese: `newBadge: "Novo!"` in `lib/i18n/locales/pt-PT/suggestions.json`

**Component features:**
- Uses SaborSpin orange accent color (#FF6B35) for background
- Small pill-shaped badge with 12px font, bold white text
- Accepts `visible` prop to conditionally render
- Includes `testID="new-badge"` for E2E testing
- Extends `ViewProps` for flexible positioning by parent

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 238 passed, 0 failed

---

## Task 4: Integrate Badge into SuggestionCard (2026-01-24)

**Status:** Done

**What was done:**
- Integrated NewBadge component into `app/suggestions/[mealType].tsx`
- Added imports for `NewBadge` component and `isNewCombination` utility
- Added `isNew` property to suggestion transformation using `isNewCombination()`
- Added NewBadge to both native (LinearGradient) and web fallback card layouts
- Added `newBadge` style for absolute positioning (top-right, 12px offset)

**Implementation details:**
- Badge shows for combinations where `isNewCombination(ingredientIds, mealLogs)` returns true
- Badge is positioned absolutely at top: 12, right: 12 within the card
- Works on both native (with LinearGradient) and web platforms

**Note:** The spec mentioned modifying `components/SuggestionCard.tsx`, but suggestion cards are rendered inline in `app/suggestions/[mealType].tsx`, so modifications were made there instead.

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 238 passed, 0 failed

---

## Task 5: Create Unit Tests for isNewCombination() (2026-01-24)

**Status:** Done

**What was done:**
- Created `lib/utils/__tests__/variety.test.ts` with 13 comprehensive unit tests
- Created test helpers: `daysAgo()` and `createMealLog()`

**Test coverage:**
- Never-logged combinations (empty history, different combinations)
- Recent combinations (0, 1, 6 days ago)
- Old combinations (7, 8, 30 days ago)
- Edge cases: exactly 7 days (new) vs 6 days (not new)
- Order-independent matching
- Multiple logs for same combination (uses most recent)
- Constant export verification

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 251 passed, 0 failed (238 existing + 13 new)

---

## Task 6: Create E2E Test for Badge Visibility (2026-01-24)

**Status:** Done

**What was done:**
- Created `e2e/new-badge.spec.ts` with 3 Playwright E2E tests

**Test scenarios:**
1. `should show New! badge on suggestions for never-logged combinations` - verifies badge is visible on fresh suggestions
2. `should hide New! badge after logging a combination recently` - verifies badge behavior after logging
3. `should show New! badge text in correct language (English)` - verifies i18n text

**Test pattern:**
- Follows existing E2E test patterns from `favorites.spec.ts`
- Uses testID selectors (`new-badge`)
- Captures screenshots for documentation

**Verification:**
- Ran linting: passed (0 errors, 5 warnings - pre-existing)
- Ran unit tests: 251 passed, 0 failed

---

## Task 7: Run All Tests (2026-01-24)

**Status:** Done

**Test Results:**

**Unit Tests (Jest):**
- 17 test suites passed
- 251 tests passed, 0 failed
- Includes 13 new variety.test.ts tests

**E2E Tests (Playwright):**
- 32 tests passed, 1 skipped
- Skipped test: persistence test (web uses in-memory SQLite)
- Includes 3 new new-badge.spec.ts tests

**Maestro Tests:**
- Not executed (requires iOS/Android emulator)
- Existing Maestro tests remain unchanged

**All Tests Summary:**
- Unit: 251 passed
- E2E: 32 passed
- Linting: 0 errors (5 pre-existing warnings)

---

## Task 8: Capture AFTER Screenshot (2026-01-24)

**Status:** Done (Updated with actual screenshots)

**What was done:**
- Created `screenshots/AFTER_SCREENSHOT_README.md` documenting the implemented feature
- **Actual screenshots added:**
  - `screenshots/AFTER_new_badge_suggestions.png` - Shows New! badges on all suggestion cards
  - `screenshots/home_with_logged_meal.png` - Shows home screen with logged meal
- Documented the New! badge appearance and behavior
- Listed all files created and modified

**Screenshots captured using:**
- Started app with `npm run web`
- Used Playwright browser tools to navigate and capture
- Screenshots show the orange "New!" badges clearly visible on each card

---

## Feature 1.2: COMPLETE

**Summary:**
- All 8 tasks completed successfully
- Feature fully implemented with tests
- Total tests added: 13 unit + 3 E2E = 16 new tests
- All tests pass (251 unit, 32 E2E)

**Files Created:**
- `components/NewBadge.tsx`
- `lib/utils/variety.ts`
- `lib/utils/__tests__/variety.test.ts`
- `e2e/new-badge.spec.ts`
- `docs/learning/epic04_feature_enhancement/features/screenshots/BEFORE_SCREENSHOT_README.md`
- `docs/learning/epic04_feature_enhancement/features/screenshots/AFTER_SCREENSHOT_README.md`
- `docs/learning/epic04_feature_enhancement/features/screenshots/BEFORE_suggestion_cards.png`
- `docs/learning/epic04_feature_enhancement/features/screenshots/AFTER_new_badge_suggestions.png`
- `docs/learning/epic04_feature_enhancement/features/screenshots/home_with_logged_meal.png`

**Files Modified:**
- `app/suggestions/[mealType].tsx`
- `lib/i18n/locales/en/suggestions.json`
- `lib/i18n/locales/pt-PT/suggestions.json`

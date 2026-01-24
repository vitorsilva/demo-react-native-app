# Feature 1.2: New! Badge - Progress Log

## Task 1: Capture BEFORE Screenshot (2026-01-24)

**Status:** Done

**What was done:**
- Created `screenshots/` directory for feature documentation
- Created `BEFORE_SCREENSHOT_README.md` documenting the current state using Option B (ASCII wireframe reference)
- Documented the current suggestion card layout from `app/suggestions/[mealType].tsx`
- Noted that suggestion cards currently show:
  - Background image with gradient overlay
  - Ingredient combination text
  - Accept button and favorite toggle
  - No "New!" badge (to be added)

**Approach taken:**
- Used Option B from the feature spec (ASCII wireframe as "before" reference) since automated screenshot capture requires running the app
- Documented current implementation structure for reference

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

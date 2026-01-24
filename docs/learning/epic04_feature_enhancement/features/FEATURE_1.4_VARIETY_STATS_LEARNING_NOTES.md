# Feature 1.4: Variety Stats - Learning Notes

## Task 1: Create `calculateVarietyStats()` utility

### What was implemented

1. **Added date utility functions** (`lib/utils/dateUtils.ts`):
   - `isThisMonth(dateString)` - checks if date is in the current calendar month
   - `isThisWeek(dateString)` - checks if date is in the current calendar week (Sunday to Saturday)

2. **Added VarietyStats interface** (`lib/utils/variety.ts`):
   - `uniqueCombosThisMonth: number`
   - `mostCommonCombo: { ingredients: string[]; count: number } | null`
   - `ingredientsUsedThisWeek: number`
   - `totalIngredients: number`
   - `varietyScore: number` (0-100)

3. **Implemented `calculateVarietyStats()` function**:
   - Filters logs by current month for unique combo count
   - Calculates most common combo across all history
   - Counts unique ingredients used this week
   - Computes variety score using the formula:
     `(uniqueCombos / totalLogs) * (ingredientsUsed / totalIngredients) * 100`

### Design decisions

- `mostCommonCombo` can be `null` when there's no history (edge case handling)
- Only counts active ingredients for `totalIngredients`
- Week is defined as Sunday to Saturday (standard US calendar week)
- Most common combo looks at ALL history, not just this month (more meaningful stat)

### Notes

- No issues encountered during implementation
- TypeScript check and linter passed without new errors
- Existing variety.ts already imported `getDaysAgo` from dateUtils, so pattern was established

## Task 2: Create VarietyStats component

### What was implemented

1. **Created `components/VarietyStats.tsx`**:
   - Collapsible card component for displaying variety statistics
   - Shows unique combinations count, most common combo, ingredient usage, and variety score
   - Uses `useState` for expand/collapse state
   - Receives `VarietyStats` data and `ingredientNames` map as props
   - Includes testIDs for E2E testing: `variety-stats-card`, `variety-stats-toggle`, `variety-stats-content`

2. **Created i18n translations**:
   - `lib/i18n/locales/en/stats.json` - English translations for stats
   - `lib/i18n/locales/pt-PT/stats.json` - Portuguese translations for stats
   - Updated `lib/i18n/locales/index.ts` to import and export stats translations
   - Updated `lib/i18n/index.ts` to include 'stats' in the namespace list

### Design decisions

- Component receives pre-calculated stats rather than computing them internally (separation of concerns)
- `ingredientNames` prop is a Map for O(1) lookup when formatting combo display
- Card is expanded by default (`useState(true)`) for better first-time UX
- Empty state shows "No meals logged yet" when there's no data
- Uses emoji icons for visual appeal matching the spec wireframe

### Notes

- No issues encountered during implementation
- TypeScript check passed without errors
- Linter passed (only pre-existing warnings from other files)
- Followed existing component patterns from `NewBadge.tsx` and `VarietyIndicator.tsx`

## Task 3: Integrate stats card into Home screen

### What was implemented

1. **Modified `app/(tabs)/index.tsx`**:
   - Added imports for `VarietyStats` component and `calculateVarietyStats` function
   - Added `useMemo` import from React for performance optimization
   - Added `varietyStats` calculation using memoization to prevent unnecessary recalculations
   - Added `ingredientNames` Map creation (also memoized) for efficient ingredient name lookup
   - Inserted the `<VarietyStats>` component between the header and meal type buttons

### Design decisions

- Used `useMemo` for both `varietyStats` calculation and `ingredientNames` map to optimize performance
- Stats are recalculated when `mealLogs` or `ingredients` change (proper dependency array)
- Placed the stats card after the header and before the meal type buttons (matching the wireframe in the spec)
- Stats update automatically when screen comes into focus due to existing `useFocusEffect` reloading `mealLogs`

### Notes

- No issues encountered during implementation
- TypeScript check passed without errors
- Linter passed (only pre-existing warnings from other files)
- The component integration was straightforward since the Home screen already had the data available from the store

## Task 4: Create unit tests for `calculateVarietyStats()`

### What was implemented

1. **Added comprehensive tests to `lib/utils/__tests__/variety.test.ts`**:
   - Added `calculateVarietyStats` import and `Ingredient` type import
   - Created helper functions for testing:
     - `daysAgoThisMonth(days)` - creates date strings for this month
     - `previousMonth(dayOffset)` - creates date strings for last month
     - `createIngredient(id, name, isActive)` - creates test Ingredient objects
     - `createStatsMealLog(ingredientIds, dateString, id)` - creates test MealLog objects

2. **Test coverage includes**:
   - **uniqueCombosThisMonth tests**:
     - Correct unique combo count for this month
     - Duplicate combinations counted only once
     - Logs from previous month ignored
     - Same ingredients in different order treated as same combination
   - **mostCommonCombo tests**:
     - Returns correct most common combo across all history
     - Includes logs from all time (not just this month)
     - Returns null when history is empty
   - **ingredientsUsedThisWeek tests**:
     - Correct ingredient usage ratio for this week
     - Each ingredient counted only once
     - Only active ingredients counted in totalIngredients
   - **varietyScore tests**:
     - Correct variety score percentage calculation
     - Returns 0 when no logs this month
     - Returns 0 when no ingredients
     - Score is rounded to nearest integer
   - **Edge cases**:
     - Returns zeros/defaults when no history exists
     - Returns 1 unique combo when all logs have same combination
     - Handles empty ingredients list
     - Handles single ingredient combinations

### Design decisions

- Created separate helper functions (`daysAgoThisMonth`, `previousMonth`, `createIngredient`, `createStatsMealLog`) to avoid naming conflicts with existing helpers (`daysAgo`, `createMealLog`)
- Used `Date.setHours(12, 0, 0, 0)` for test dates to avoid timezone edge cases
- `previousMonth` uses day 15 as base to avoid month-end edge cases when going back a month
- Tests verify the formula: `(unique combos / total logs) * (ingredients used / total) * 100`

### Notes

- No issues encountered during implementation
- All 17 new tests pass (43 total tests in variety.test.ts)
- TypeScript check passed without errors
- Linter passed (only pre-existing warnings from other files)

## Task 5: Create Playwright E2E test

### What was implemented

1. **Created `e2e/variety-stats.spec.ts`** with 6 comprehensive E2E tests:
   - `should display variety stats card on home screen` - Verifies the stats card is visible on home
   - `should show stats content when expanded` - Verifies content is visible in expanded state
   - `should collapse and expand stats card when toggle is clicked` - Tests the collapse/expand functionality
   - `should update stats after logging a meal` - Verifies stats update after logging a meal
   - `should show stats in correct language (English)` - Verifies i18n text is correct
   - `should display all stat categories when meals are logged` - Verifies all 4 stat categories (🎯⭐🥗📈) are shown

2. **Test coverage includes**:
   - Stats card visibility on home screen
   - Stats content visible when expanded (default state)
   - Collapse/expand toggle functionality with screenshots
   - Stats update after logging a meal (navigates to suggestions, logs meal, returns to home)
   - English language verification for the title
   - All stat categories displayed (unique combos, most common, ingredients used, variety score)

### Design decisions

- Followed existing E2E test patterns from `new-badge.spec.ts` and `variety-indicator.spec.ts`
- Used same `beforeEach` setup for database initialization and app ready state
- Added multiple screenshots at various states (8 total) for documentation
- Tested both empty state handling and populated state with logged meals
- Used testIDs defined in the VarietyStats component: `variety-stats-card`, `variety-stats-toggle`, `variety-stats-content`

### Notes

- No issues encountered during implementation
- TypeScript check passed without errors
- Linter passed (only pre-existing warnings from other files)
- Test file follows the established patterns in the codebase for E2E testing

## Task 6: Create Maestro E2E test

### What was implemented

1. **Created `e2e/maestro/variety-stats.yaml`** with comprehensive mobile E2E tests:
   - Stats card visibility on home screen
   - Empty state verification when no meals logged
   - Collapse/expand toggle functionality
   - Stats update after logging a meal
   - 7 screenshots captured at key interaction points

2. **Test coverage includes**:
   - Verify stats card is visible on home screen using testID `variety-stats-card`
   - Verify title "Your Variety This Month" is displayed
   - Verify content is visible when expanded using testID `variety-stats-content`
   - Test collapse functionality - tap toggle and verify content is no longer visible
   - Test expand functionality - tap toggle again and verify content reappears
   - Log a meal and verify stats card updates after navigation

### Design decisions

- Used `clearState` at start for consistent testing (similar to favorites-empty-state.yaml pattern)
- Followed established Maestro patterns from existing test files (favorites-flow.yaml, favorites-empty-state.yaml)
- Used testIDs defined in VarietyStats component: `variety-stats-card`, `variety-stats-toggle`, `variety-stats-content`
- Added multiple screenshots (7 total) at key interaction points for documentation
- Tests both the empty state message ("No meals logged yet") and populated state after logging a meal

### Notes

- No issues encountered during implementation
- TypeScript check passed without errors
- Linter passed (only pre-existing warnings from other files)
- Test file follows the established patterns for Maestro tests in the codebase

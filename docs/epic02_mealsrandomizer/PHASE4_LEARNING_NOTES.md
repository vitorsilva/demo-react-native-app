# Phase 4: Navigation & User Flow - Learning Notes

**Date:** 2025-11-20
**Session Duration:** ~4-5 hours
**Focus:** History Screen, Settings Screen, Preferences System, Database Refactoring, E2E Testing

---

## Summary

This session focused on completing the navigation structure of the Meals Randomizer app by building History and Settings screens, implementing a user preferences system, and refactoring the entire database layer to use the adapter pattern consistently. We also created comprehensive E2E tests for all new features.

---

## Key Accomplishments

### 1. History Screen with SectionList

**Created:** `app/(tabs)/history.tsx`

- Built History screen to display all logged meals
- Used **SectionList** for grouped data (Today, Yesterday, specific dates)
- Implemented date formatting logic (relative dates)
- Added meal type icons (🌅 breakfast, 🍎 snack)
- Created empty state for when no meals are logged

**Key Concepts:**
- **SectionList vs FlatList**: SectionList is better for naturally grouped data
- **Data transformation**: Converting flat array into sections with reduce()
- **Date grouping**: Relative dates (Today, Yesterday) vs absolute dates

**Code Pattern:**
```typescript
const groupedMeals = mealLogs.reduce((sections, meal) => {
  const sectionTitle = formatDateSection(meal.date);
  let section = sections.find((s) => s.title === sectionTitle);
  if (!section) {
    section = { title: sectionTitle, data: [] };
    sections.push(section);
  }
  section.data.push(meal);
  return sections;
}, [] as { title: string; data: MealLog[] }[]);
```

### 2. Settings Screen with Sliders

**Created:** `app/(tabs)/settings.tsx`

- Built Settings screen with interactive sliders
- Installed `@react-native-community/slider` package
- Implemented two preferences:
  - **Cooldown Days** (1-7 days) - Variety enforcement
  - **Suggestions Count** (2-6) - Number of meal combinations
- Real-time preference updates to database
- Added informational card explaining settings

**Key Concepts:**
- **onSlidingComplete vs onValueChange**: Use onSlidingComplete to avoid hundreds of database writes during dragging
- **Math.round()**: Ensure whole number values from slider
- **Spread operator**: Update preferences while keeping other values unchanged

**Code Pattern:**
```typescript
const handleCooldownChange = async (value: number) => {
  await updatePreferences({
    ...preferences,
    cooldownDays: Math.round(value),
  });
};
```

### 3. Preferences Database System

**Created:** `lib/database/preferences.ts`

- Implemented key-value storage pattern for preferences
- Used existing `preferences` table (already in schema)
- Created `getPreferences()` and `setPreferences()` functions
- Default values: cooldownDays: 3, suggestionsCount: 4
- String storage with type conversion (parseInt/toString)

**Key Concepts:**
- **Key-value pattern**: Flexible storage (key TEXT, value TEXT)
- **INSERT OR REPLACE**: Upsert operation in SQLite
- **Type conversion**: Store numbers as strings, parse on retrieval
- **Default fallback**: Return defaults if preferences don't exist

**Code Pattern:**
```typescript
export async function getPreferences(db: DatabaseAdapter): Promise<UserPreferences> {
  const cooldownDaysStr = await getPreferenceValue(db, 'cooldownDays');
  const suggestionsCountStr = await getPreferenceValue(db, 'suggestionsCount');

  return {
    cooldownDays: cooldownDaysStr ? parseInt(cooldownDaysStr, 10) : DEFAULT_PREFERENCES.cooldownDays,
    suggestionsCount: suggestionsCountStr ? parseInt(suggestionsCountStr, 10) : DEFAULT_PREFERENCES.suggestionsCount,
  };
}
```

### 4. Database Layer Refactoring (Adapter Pattern)

**Major Refactoring:**
- Refactored **ingredients.ts** to use DatabaseAdapter pattern
- Refactored **mealLogs.ts** to use DatabaseAdapter pattern
- Updated **preferences.ts** to match the pattern
- All database functions now accept `db: DatabaseAdapter` as first parameter

**Files Modified:**
- `lib/database/ingredients.ts` - Added db parameter to all functions
- `lib/database/mealLogs.ts` - Added db parameter to all functions
- `lib/database/preferences.ts` - Added db parameter to all functions
- `lib/database/seed.ts` - Pass db to all database calls
- `lib/store/index.ts` - Call getDatabase() in each action
- `lib/database/__tests__/*.test.ts` - Updated all tests to pass db

**Why This Matters:**
- **Consistency**: All database modules follow the same pattern
- **Testability**: Tests can inject mock adapters
- **Flexibility**: Easy to swap database implementations (native, in-memory, test)
- **Separation of concerns**: Database functions don't know about global state

**Code Pattern (Before → After):**
```typescript
// BEFORE (ingredients.ts)
export async function getAllIngredients(): Promise<Ingredient[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync(...);
  return rows.map(...);
}

// AFTER (ingredients.ts)
export async function getAllIngredients(db: DatabaseAdapter): Promise<Ingredient[]> {
  const rows = await db.getAllAsync(...);
  return rows.map(...);
}

// Store usage
loadIngredients: async () => {
  const db = getDatabase();
  const ingredients = await ingredientsDb.getAllIngredients(db);
  set({ ingredients });
}
```

### 5. Zustand Store Updates

**Updated:** `lib/store/index.ts`

- Added `preferences` to state
- Added `loadPreferences()` action
- Added `updatePreferences()` action
- Updated `generateMealSuggestions()` to load fresh preferences from database
- All actions now call `getDatabase()` and pass db to database functions

**Critical Learning:**
- **Fresh database reads**: Always read preferences from database, not from cached state
- **Why?**: User might change settings in one screen, but store might have old values
- **Solution**: `const preferences = await preferencesDb.getPreferences(db);`

**Code Pattern:**
```typescript
generateMealSuggestions: async () => {
  const db = getDatabase();

  // Load FRESH preferences from database
  const preferences = await preferencesDb.getPreferences(db);
  const count = preferences.suggestionsCount;
  const cooldownDays = preferences.cooldownDays;

  // Use preferences in generation
  const recentMealLogs = await mealLogsDb.getRecentMealLogs(db, cooldownDays);
  const combinations = generateCombinations(ingredients, count, blockedIds);

  set({ suggestedCombinations: combinations });
}
```

### 6. Tab Navigation Completion

**Updated:** `app/(tabs)/_layout.tsx`

- Removed default "Explore" tab
- Added "History" tab with clock icon
- Added "Settings" tab with gear icon
- Complete 3-tab navigation structure

**Deleted:** `app/(tabs)/explore.tsx` (no longer needed)

### 7. Unit Testing for Preferences

**Created:** `lib/database/__tests__/preferences.test.ts`

- 7 comprehensive tests for preferences system
- Tests cover default values, updates, type conversion, min/max values
- Verified number type (not string) after retrieval
- Ensured individual preference updates don't affect others

**Tests:**
1. ✅ Returns default values when no preferences exist
2. ✅ Stores preferences in database
3. ✅ Updates existing preferences
4. ✅ Updates individual preference without affecting others
5. ✅ Values are numbers not strings
6. ✅ Supports minimum and maximum values
7. ✅ Returns correct structure

### 8. E2E Testing for Phase 4

**Updated:** `e2e/meal-logging.spec.ts`

- Added 5 new E2E tests for Phase 4 features
- Total: **12 E2E tests passing**
- Tests cover History, Settings, tab navigation, preferences integration

**New Tests:**
1. ✅ Display meals in History screen grouped by date
2. ✅ Change settings and apply new preferences
3. ✅ Generate correct number of suggestions based on settings
4. ✅ Show both breakfast and snack meals in History
5. ✅ Navigate between all three tabs

**E2E Testing Best Practices Learned:**
- **Strict mode violations**: Text appearing multiple times requires `.first()` or specific testIDs
- **Use testIDs over text selectors**: More stable and unique
- **Use `{ exact: true }`**: Prevents partial text matching
- **Use `getByRole('tab')`**: More semantic for tab navigation
- **Use `.or()`**: Fallback for conditional content (empty state or data)
- **Add delays for animations**: `await page.waitForTimeout(500)` for modals

**E2E Testing Challenges & Solutions:**
- **Challenge**: "No meals logged yet" appears on both Home and History screens
  - **Solution**: Use `.first()` or specific testIDs
- **Challenge**: "Settings" text appears multiple times (title, tab, info text)
  - **Solution**: Use `{ exact: true }` and `.first()`
- **Challenge**: Modal button testID was "done-button" not "modal-done-button"
  - **Solution**: Verify actual testIDs in components before writing tests

---

## Technical Concepts Learned

### 1. SectionList for Grouped Data

**What it is:** React Native component for rendering sectioned lists with headers

**When to use:**
- Data naturally groups (by date, category, etc.)
- Need section headers
- Better than FlatList for grouped data

**API:**
```typescript
<SectionList
  sections={[
    { title: 'Today', data: [...] },
    { title: 'Yesterday', data: [...] }
  ]}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <Component item={item} />}
  renderSectionHeader={({ section }) => <Header title={section.title} />}
/>
```

### 2. Slider Component

**Package:** `@react-native-community/slider`

**Key Props:**
- `minimumValue` / `maximumValue`: Range
- `step`: Increment (e.g., step={1} for integers)
- `value`: Current value
- `onSlidingComplete`: Fires when user releases (better for DB writes)
- `onValueChange`: Fires continuously during drag (use for UI updates only)

**Performance consideration:**
```typescript
// BAD - writes to DB hundreds of times while dragging
onValueChange={handleChange}

// GOOD - writes to DB once when user releases
onSlidingComplete={handleChange}
```

### 3. Key-Value Storage Pattern

**Schema:**
```sql
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

**Data:**
```
key              | value
-----------------|-------
cooldownDays     | "3"
suggestionsCount | "4"
```

**Pros:**
- Flexible - add new keys without schema changes
- Simple - just key-value pairs

**Cons:**
- No type safety in database
- Must parse/stringify values
- Harder to query complex data

### 4. TypeScript Interface Requirements

**Why interfaces matter:**
```typescript
interface StoreState {
  preferences: UserPreferences;
  loadPreferences: () => Promise<void>;  // Must declare!
  updatePreferences: (prefs: UserPreferences) => Promise<void>;  // Must declare!
}
```

**TypeScript requires:**
- All methods must be declared in interface
- Provides autocomplete and type checking
- Catches errors at compile time
- Documents what's available in the store

### 5. Fresh Database Reads vs Cached State

**Problem:**
```typescript
// BAD - uses potentially stale cached state
generateMealSuggestions: async () => {
  const { preferences } = get();  // Old values!
  const count = preferences.suggestionsCount;
}
```

**Solution:**
```typescript
// GOOD - reads fresh values from database
generateMealSuggestions: async () => {
  const db = getDatabase();
  const preferences = await preferencesDb.getPreferences(db);  // Fresh values!
  const count = preferences.suggestionsCount;
}
```

**When to use each:**
- **Cached state**: UI display, non-critical reads
- **Fresh DB reads**: Critical operations, ensure latest data

### 6. Reduce for Data Transformation

**Pattern:**
```typescript
const grouped = array.reduce((accumulator, currentItem) => {
  // Logic to add currentItem to accumulator
  return accumulator;
}, initialValue);
```

**Example (grouping meals by date):**
```typescript
const groupedMeals = mealLogs.reduce((sections, meal) => {
  const sectionTitle = formatDateSection(meal.date);

  // Find existing section or create new one
  let section = sections.find((s) => s.title === sectionTitle);
  if (!section) {
    section = { title: sectionTitle, data: [] };
    sections.push(section);
  }

  // Add meal to section
  section.data.push(meal);

  return sections;
}, [] as { title: string; data: MealLog[] }[]);
```

### 7. Expo Package Installation

**Command:** `npx expo install @package/name`

**Why not `npm install`?**
- Expo CLI checks SDK compatibility
- Installs correct version for your Expo SDK
- Prevents version conflicts
- Safer for React Native packages

---

## Files Created

### New Files
- `app/(tabs)/history.tsx` - History screen with SectionList
- `app/(tabs)/settings.tsx` - Settings screen with sliders
- `lib/database/preferences.ts` - Preferences database module
- `lib/database/__tests__/preferences.test.ts` - Preferences unit tests (7 tests)

### Files Modified
- `app/(tabs)/_layout.tsx` - Updated tab navigation (removed Explore, added History + Settings)
- `app/suggestions/[mealType].tsx` - Updated generateMealSuggestions() calls (removed parameters)
- `lib/store/index.ts` - Added preferences state/actions, refactored to use db adapter
- `lib/database/ingredients.ts` - Refactored to use DatabaseAdapter pattern
- `lib/database/mealLogs.ts` - Refactored to use DatabaseAdapter pattern
- `lib/database/seed.ts` - Updated to pass db parameter
- `lib/database/__tests__/ingredients.test.ts` - Updated to pass db parameter
- `lib/database/__tests__/mealLogs.test.ts` - Updated to pass db parameter
- `e2e/meal-logging.spec.ts` - Added 5 new E2E tests for Phase 4 features

### Files Deleted
- `app/(tabs)/explore.tsx` - Removed default Expo template tab

---

## Testing Summary

### Unit Tests
**Total:** 37+ tests passing
- 7 ingredient tests
- 7 meal log tests
- 8 adapter tests
- 8 combination generator tests
- 7 preferences tests

### E2E Tests
**Total:** 12 tests passing
- 7 original tests (Phase 3)
- 5 new tests (Phase 4)

**New E2E Test Coverage:**
1. History screen display with grouped meals
2. Settings screen rendering and slider presence
3. Suggestions count based on preferences
4. Multiple meals (breakfast + snack) in History
5. Tab navigation between all three screens

### Test Commands
```bash
# Run unit tests
npm test

# Run specific test file
npm test preferences.test.ts

# Run E2E tests
npm run test:e2e

# Run E2E with visible browser
npm run test:e2e:headed

# Run E2E with interactive UI
npm run test:e2e:ui
```

---

## Issues Encountered & Solutions

### Issue 1: Inconsistent Database Pattern

**Problem:**
- `preferences.ts` used adapter pattern with `db` parameter
- `ingredients.ts` and `mealLogs.ts` used `getDatabase()` internally
- Inconsistent patterns across database layer

**Solution:**
- Refactored all database modules to use adapter pattern consistently
- All functions now accept `db: DatabaseAdapter` as first parameter
- Store actions call `getDatabase()` once and pass to all database functions

**Learning:** Consistency in architecture makes code more maintainable and testable

### Issue 2: Stale Preferences in Store

**Problem:**
- Settings changed by user, but `generateMealSuggestions()` used cached preferences from store state
- Could result in generating wrong number of suggestions or using old cooldown

**Solution:**
- Changed `generateMealSuggestions()` to load fresh preferences from database
- Always read critical data from source of truth (database), not cache (store)

**Code:**
```typescript
// BEFORE - uses cached state
const { preferences } = get();

// AFTER - reads fresh from database
const preferences = await preferencesDb.getPreferences(db);
```

### Issue 3: E2E Strict Mode Violations

**Problem:**
- Text selectors matching multiple elements
- "No meals logged yet" appeared on both Home and History screens
- "Settings" appeared as title, tab label, and in info text

**Solution:**
- Use `.first()` to handle multiple matches
- Use `{ exact: true }` for exact text matching
- Add specific testIDs to components
- Use semantic selectors like `getByRole('tab')`

**Examples:**
```typescript
// BAD - matches 2 elements
page.getByText('Today')

// GOOD - takes first match
page.getByText('Today').first()

// BETTER - exact match + first
page.getByText('Today', { exact: true }).first()

// BEST - use testID
page.getByTestId('history-empty-state')
```

### Issue 4: TypeScript Interface Errors

**Problem:**
```
Property 'loadPreferences' does not exist on type 'StoreState'
```

**Solution:**
- Must declare all actions in the `StoreState` interface
- TypeScript requires explicit type definitions
- Provides compile-time safety and autocomplete

**Fix:**
```typescript
interface StoreState {
  preferences: UserPreferences;
  loadPreferences: () => Promise<void>;  // Add this!
  updatePreferences: (prefs: UserPreferences) => Promise<void>;  // Add this!
}
```

### Issue 5: Modal Button TestID Mismatch

**Problem:** Tests looked for `"modal-done-button"` but actual testID was `"done-button"`

**Solution:**
- Always verify actual testIDs in components before writing tests
- Use Find & Replace to fix all instances
- Lesson: Check implementation before assuming naming

---

## Key Learnings

### 1. Architecture Consistency

**Insight:** When refactoring, apply changes consistently across the entire layer, not just one module.

**Application:** We refactored all database modules (ingredients, mealLogs, preferences) to use the adapter pattern, ensuring consistency.

### 2. Performance with Event Handlers

**Insight:** Frequent database writes are expensive - batch or debounce when possible.

**Application:** Use `onSlidingComplete` (fires once) instead of `onValueChange` (fires hundreds of times) for slider-to-database updates.

### 3. Fresh Data Reads for Critical Operations

**Insight:** Cached state can be stale - always read from source of truth for important operations.

**Application:** `generateMealSuggestions()` loads fresh preferences from database to ensure it uses current user settings.

### 4. Test Selector Specificity

**Insight:** Generic text selectors break easily when text appears multiple times.

**Application:** Use testIDs for stable, unique element identification in E2E tests.

### 5. TypeScript Contracts

**Insight:** TypeScript interfaces are contracts - they document and enforce what's available.

**Application:** Always update interface when adding new state or actions to Zustand store.

---

## Connections to Previous Phases

### From Phase 1 (Database):
- Built on existing schema (preferences table already existed)
- Used same CRUD patterns for preferences
- Applied learned patterns: UUID, ISO dates, JSON storage

### From Phase 2 (State Management):
- Extended Zustand store with preferences state
- Used same action patterns (async functions, set/get)
- Connected preferences to business logic (generateMealSuggestions)

### From Phase 3 (UI):
- Built on tab navigation structure from Phase 3
- Used same styling patterns (dark theme, card layouts)
- Applied learned patterns: FlatList → SectionList (more advanced)
- Extended E2E testing patterns

---

## Next Steps (Phase 5)

According to `PHASE5_POLISH_TESTING.md`, next phase includes:

1. **APK Build & Distribution**
   - Build production APK with EAS Build
   - Test on real Android device
   - Prepare for Play Store (optional)

2. **Performance Optimization**
   - Measure and optimize render performance
   - Add loading states where missing
   - Optimize image loading

3. **Accessibility**
   - Add accessibility labels
   - Test with screen readers
   - Ensure proper contrast ratios

4. **Production Readiness**
   - Error boundary improvements
   - Crash reporting (Sentry)
   - Analytics validation
   - User feedback collection

---

## Commands Used This Session

```bash
# Install slider package
npx expo install @react-native-community/slider

# Run all unit tests
npm test

# Run specific test file
npm test preferences.test.ts

# Run E2E tests
npm run test:e2e

# Start dev server
npm run web

# Delete file (Windows)
rm "app/(tabs)/explore.tsx"
```

---

## Architecture Diagram

```
App Architecture (After Phase 4)
├── UI Layer
│   ├── Home Screen (index.tsx)
│   ├── Suggestions Screen ([mealType].tsx)
│   ├── History Screen (history.tsx) ← NEW
│   ├── Settings Screen (settings.tsx) ← NEW
│   └── Confirmation Modal
│
├── State Management (Zustand)
│   ├── ingredients
│   ├── mealLogs
│   ├── preferences ← NEW
│   ├── suggestedCombinations
│   ├── loadPreferences() ← NEW
│   ├── updatePreferences() ← NEW
│   └── generateMealSuggestions() ← UPDATED (reads fresh preferences)
│
├── Database Layer (Adapter Pattern) ← REFACTORED
│   ├── ingredients.ts (db: DatabaseAdapter)
│   ├── mealLogs.ts (db: DatabaseAdapter)
│   ├── preferences.ts (db: DatabaseAdapter) ← NEW
│   └── seed.ts
│
├── Business Logic
│   ├── combinationGenerator.ts
│   └── varietyEngine.ts
│
└── Testing
    ├── Unit Tests (37+ passing)
    └── E2E Tests (12 passing) ← 5 NEW TESTS
```

---

## Success Metrics

✅ **3 new screens built** (History, Settings, removed Explore)
✅ **User preferences system** implemented and persisted
✅ **Database refactoring** completed across all modules
✅ **37+ unit tests passing** (7 new for preferences)
✅ **12 E2E tests passing** (5 new for Phase 4)
✅ **Tab navigation complete** with all 3 screens
✅ **Real-time settings updates** working
✅ **Fresh preference reads** in suggestions generation

---

**Status:** Phase 4 Navigation & User Flow - 100% COMPLETE ✅

**Next:** Phase 5 - Polish & Production Readiness

---

[← Back to Overview](./OVERVIEW.md) | [Previous: Phase 3](./PHASE3_SESSION_NOTES.md) | [Next: Phase 5 →](./PHASE5_POLISH_TESTING.md)

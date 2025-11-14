# Epic 2: Current Session Status

**Last Updated:** 2025-01-14

---

## ✅ Phase 1: Data Foundation & SQLite - 100% COMPLETE

**Status:** ✅ COMPLETED (2025-01-05)

---

## 🔄 Phase 2: State Management & Core Logic - 65% COMPLETE

**Status:** 🔄 IN PROGRESS (Started 2025-01-13)

**Completed:**
- ✅ Step 2.1: Understanding State Management (conceptual)
- ✅ Step 2.2: Installing and Setting Up Zustand
- ✅ Step 2.3: Using Zustand Store in Components
- ✅ Step 2.4: Implementing Combination Generator Algorithm

**Next:**
- ⏳ Step 2.5: Implementing Variety Scoring Engine
- ⏳ Step 2.6: Adding OpenTelemetry Metrics

---

## 📅 Session History

### Session 4: 2025-01-14 - Combination Generator Algorithm (Step 2.4)

**Major Accomplishments:**
- ✅ Built combination generator algorithm using Test-Driven Development (TDD)
- ✅ Learned Red-Green-Refactor cycle in practice
- ✅ Implemented Fisher-Yates shuffle algorithm
- ✅ Created pure, testable business logic functions
- ✅ 18/18 tests passing (14 database + 4 algorithm)
- ✅ Removed obsolete UI tests from Epic 1

**What You Built:**
- `lib/business-logic/combinationGenerator.ts` - Core algorithm (~60 lines)
- `lib/business-logic/__tests__/combinationGenerator.test.ts` - 4 comprehensive tests
- Algorithm generates random meal combinations with intelligent filtering

**Details:**

#### 1. Test-Driven Development (TDD) - Red-Green-Refactor

**The Process:**
1. 🔴 **Red:** Write tests first → watch them fail
2. 🟢 **Green:** Write minimal code to pass tests
3. 🔧 **Refactor:** Improve code quality

**What happened:**
- Wrote 4 tests before any implementation
- Created stub function that returns `[]`
- Ran tests → 4 failures (expected!)
- Implemented real algorithm
- Ran tests → 18/18 passing! 🎉

**Key insight:** Tests that never fail are useless. We verified our tests work by watching them fail first.

#### 2. Test Quality Discovery

**Problem encountered:** Initially only 1 test failed when returning empty array.

**Root cause:** Tests 2-4 used `forEach` on empty array:
```typescript
[].forEach((item) => {
  expect(item)...  // Never runs! forEach on [] = 0 iterations
});
```

**Solution:** Added length assertions before forEach:
```typescript
expect(result).toHaveLength(5);  // Verify array has items FIRST
result.forEach((combo) => {
  // Then check contents
});
```

**Learning:** Always validate test prerequisites. A passing test must mean "feature works", not "test didn't run".

#### 3. Algorithm Implementation

**Function signature:**
```typescript
function generateCombinations(
  ingredients: Ingredient[],
  count: number,
  recentlyUsedIds: string[]
): Ingredient[][]
```

**Algorithm steps:**
1. **Filter:** Remove recently used ingredients
2. **Loop:** Generate N combinations
3. **Random size:** Pick 1-3 ingredients per combo
4. **Shuffle:** Randomize available ingredients
5. **Slice:** Take first X items (guarantees no duplicates within combo)
6. **Return:** Array of unique combinations

**Key design decisions:**
- Ingredients CAN repeat **across** combos (user-friendly when few ingredients)
- Ingredients CANNOT repeat **within** a combo (realistic meals)
- Pure function (no database calls, no mutations, easy to test)

#### 4. Fisher-Yates Shuffle Algorithm

**Purpose:** Unbiased random shuffling of arrays

**Implementation:**
```typescript
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Copy to avoid mutation

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }

  return shuffled;
}
```

**Why Fisher-Yates?**
- Proven unbiased algorithm (each permutation equally likely)
- O(n) time complexity (efficient)
- Industry standard for shuffling

#### 5. Key Programming Concepts Learned

**Spread Operator (`...`):**
```typescript
const copy = [...originalArray]; // Shallow copy
```
- Creates new array with same elements
- Prevents mutations to original data
- Essential for pure functions

**Array Destructuring for Swapping:**
```typescript
// Old way (3 lines):
const temp = a;
a = b;
b = temp;

// Modern way (1 line):
[a, b] = [b, a];
```
- More concise and readable
- No temporary variable needed
- ES6+ feature

**Math.min() for Edge Cases:**
```typescript
const size = Math.min(comboSize, availableIngredients.length);
```
- Prevents trying to take more items than exist
- Gracefully handles low-ingredient scenarios
- "Take up to N items, but no more than we have"

**Generic Functions:**
```typescript
function shuffleArray<T>(array: T[]): T[] {
  // Works with any array type!
}
```
- `<T>` means "type parameter" (like a variable for types)
- Makes function reusable for different data types
- TypeScript ensures type safety

#### 6. Testing Philosophy

**The 4 tests cover:**
1. **Happy path:** Generates requested number of combinations
2. **Constraints:** Each combination has 1-3 ingredients
3. **Filtering:** Recently used ingredients excluded
4. **Uniqueness:** No duplicates within combinations

**Example output (manual verification):**
```
Combo 1: [Bread, Jam]              ← 2 ingredients
Combo 2: [Milk, Bread, Apple]      ← 3 ingredients
Combo 3: [Milk, Bread, Cheese]     ← 3 ingredients
```

**Real meals generated:**
- Toast with jam 🍞🍓
- Milk with bread and apple 🥛🍞🍎
- Milk with bread and cheese 🥛🍞🧀

#### 7. Test Cleanup

**Removed:** `app/(tabs)/__tests__/index.test.tsx`

**Why:**
- Tests checked for "Hello World" UI from Epic 1
- UI was replaced in Phase 2 with Meals Randomizer interface
- Failing tests with no bugs = test noise

**Lesson learned:** Failing tests must indicate real problems. Delete obsolete tests immediately to maintain trust in test suite.

---

### Session 3: 2025-01-13 - Phase 2 Start (Steps 2.1-2.3)

**Major Accomplishments:**
- ✅ Connected Zustand store to UI components
- ✅ Implemented database initialization tracking
- ✅ Fixed race condition between database init and data loading
- ✅ Added loading/error states to home screen
- ✅ Deep understanding of `useEffect` and dependency arrays

**What You Built:**
- Enhanced Zustand store with `isDatabaseReady` flag
- Connected home screen to display ingredient count from store
- Proper async initialization flow

**Details:**

#### 1. Zustand Store Enhancement

**Added to `lib/store/index.ts`:**
- `isDatabaseReady: boolean` - tracks database initialization state
- `setDatabaseReady()` - action to mark database as ready

**Why:** Prevents race condition where components try to load data before database is initialized.

#### 2. Database Initialization Flow

**Updated `app/_layout.tsx`:**
```typescript
const setDatabaseReady = useStore((state) => state.setDatabaseReady);

useEffect(() => {
  async function setup() {
    await initDatabase();
    await seedDatabase();
    setDatabaseReady();  // Signal that database is ready
  }
  setup();
}, []);
```

**Flow:**
1. App starts → database initializes
2. When complete → `setDatabaseReady()` called
3. Store updates `isDatabaseReady: true`
4. Components waiting for database can now proceed

#### 3. Home Screen Integration

**Updated `app/(tabs)/index.tsx`:**

**Zustand Selectors (Performance Optimized):**
```typescript
const ingredients = useStore((state) => state.ingredients);
const isLoading = useStore((state) => state.isLoading);
const error = useStore((state) => state.error);
const isDatabaseReady = useStore((state) => state.isDatabaseReady);
const loadIngredients = useStore((state) => state.loadIngredients);
```

**Why multiple selectors?** Each subscribes to specific state - component only re-renders when that specific data changes.

**Data Loading Effect:**
```typescript
useEffect(() => {
  if (isDatabaseReady) {
    loadIngredients();
  }
}, [isDatabaseReady, loadIngredients]);
```

**Why this works:**
- Effect watches `isDatabaseReady`
- When it changes from `false` → `true`, effect re-runs
- Then loads ingredients from database

**UI States:**
- Database not ready: "Initializing database..."
- Loading: "Loading ingredients..."
- Error: Shows error message
- Success: "22 ingredients loaded"

#### 4. Key Learning: Understanding useEffect

**Deep dive on `useEffect` syntax:**

```typescript
useEffect(effectFunction, dependencyArray)
```

**Effect Function:**
- Can be inline arrow function: `() => { /* code */ }`
- Or named function reference
- Runs your "side effect" (data loading, subscriptions, etc.)

**Dependency Array:**
- **NOT** the data itself - it's a list of **values to watch**
- React compares old vs new values on each render
- If any value changes → re-run effect
- Can contain: numbers, strings, functions, objects, arrays

**Examples:**
- `[]` - Run once on mount, never again
- `[count]` - Re-run when `count` changes
- `[userId, filterType]` - Re-run when either changes
- No array - Re-runs on every render (usually bad!)

**Common Misconception Corrected:**
- Student thought `[loadIngredients]` was "the ingredients array loaded by Zustand"
- **Actually:** It's the function reference itself that React watches
- Effect re-runs if the function reference changes (doesn't in Zustand)

#### 5. Selector Pattern for Performance

**❌ Bad (re-renders on ANY state change):**
```typescript
const state = useStore();
const count = state.ingredients.length;
```

**✅ Good (re-renders only when ingredients change):**
```typescript
const ingredients = useStore((state) => state.ingredients);
const count = ingredients.length;
```

**Why:** Zustand uses the selector function to determine what data the component needs. Only subscribes to changes in that specific slice of state.

**Mental model:** "Tell Zustand: wake me up ONLY when THIS specific data changes"

---

### Session 2: 2025-01-05 - Phase 1 Completion

**Major Accomplishments:**
- ✅ Fixed React version conflicts (react-test-renderer 19.2.0 → 19.1.0)
- ✅ Migrated Sentry from deprecated `sentry-expo` to official `@sentry/react-native`
- ✅ Fixed crypto API (Node.js → expo-crypto)
- ✅ Removed deprecated testing packages
- ✅ All 14 tests passing
- ✅ Manual testing verified
- ✅ Sentry error tracking confirmed working
- ✅ Phase 1 marked complete!

**Details:**

#### 1. React Version Conflicts Resolution
**Problem:** `react-test-renderer@19.2.0` required `react@^19.2.0`, but Expo SDK 54 requires exactly `react@19.1.0`

**Root Cause:**
- `@testing-library/react-native` has peer dependency on `react-test-renderer@>=18.2.0`
- npm was selecting latest (19.2.0) which conflicts with React 19.1.0

**Solution:**
```bash
# Added explicit version pin in package.json
"react-test-renderer": "19.1.0"  # No ^ prefix = exact version
```

**Learning:** `react-test-renderer` MUST exactly match React version. Use exact version (no `^`) to prevent mismatches.

---

#### 2. Deprecated Package Removal
**Removed:**
- `@testing-library/jest-native@5.4.3` - Deprecated, matchers now built into `@testing-library/react-native` since v12.4+

**Updated:**
- Removed `setupFilesAfterEnv` from jest.config.js
- Matchers like `toBeOnTheScreen()`, `toHaveTextContent()` automatically available

**Learning:** Always check deprecation warnings - newer packages often consolidate features.

---

#### 3. Sentry Migration (Major Upgrade)

**Old Setup (deprecated):**
- Package: `sentry-expo@~7.0.0`
- Last maintained: Expo SDK 49 (2023)
- API: `Sentry.Native.captureException()` / `Sentry.Browser.captureException()`

**New Setup (official):**
- Package: `@sentry/react-native` (latest)
- Maintained by: Getsentry team (actively maintained)
- Supports: Expo SDK 50+ (including SDK 54)
- API: Unified `Sentry.captureException()` works everywhere

**Migration Steps Performed:**
1. Uninstalled `sentry-expo`
2. Installed `@sentry/react-native` via `npx expo install`
3. Updated `app.json` plugin: `"sentry-expo"` → `"@sentry/react-native/expo"`
4. Updated imports in `app/_layout.tsx` and `components/ErrorBoundary.tsx`
5. Simplified ErrorBoundary - removed platform checks
6. Updated Sentry.init() configuration:
   - Removed: `enableInExpoDevelopment: true` (doesn't exist in new SDK)
   - Added: `tracesSampleRate: 1.0` (performance monitoring)

**Verification:**
- ✅ Test error captured in Sentry dashboard (2 min response time)
- ✅ Full stack traces with file locations
- ✅ Device info and breadcrumbs captured
- ✅ Performance transactions tracked

**Learning:** Modern `@sentry/react-native` has unified API - no more platform-specific code needed.

---

#### 4. Crypto API Fix

**Problem:** `crypto.randomUUID()` used in database code doesn't exist in React Native (Node.js/Web API only)

**Error:**
```
ReferenceError: Property 'crypto' doesn't exist
```

**Solution:**
1. Installed `expo-crypto` (cross-platform crypto for React Native)
2. Updated `lib/database/ingredients.ts` and `lib/database/mealLogs.ts`:
   ```typescript
   import * as Crypto from 'expo-crypto';
   const id = Crypto.randomUUID(); // Works on iOS, Android, Web
   ```
3. Created mock for tests (`lib/database/__tests__/__mocks__/expo-crypto.ts`):
   ```typescript
   export const randomUUID = (): string => {
     return crypto.randomUUID(); // Node.js crypto in tests
   };
   ```
4. Added to jest.config.js moduleNameMapper

**Learning:** React Native ≠ Node.js. Platform-specific APIs require Expo modules or native bridges.

---

#### 5. Clean Dependency Reinstall

**Process:**
```bash
del package-lock.json
rmdir /s /q node_modules
npm install
```

**Why:** package-lock.json had cached incorrect versions. Clean reinstall forces npm to recalculate all dependencies.

**Result:** All peer dependencies resolved correctly, 0 vulnerabilities.

---

### Session 1: 2025-01-04 - Phase 1 Implementation

**Database Layer Implementation:**
- ✅ Installed `expo-sqlite` package
- ✅ Created TypeScript types (`types/database.ts`)
- ✅ Created database schema (`lib/database/schema.ts`)
- ✅ Implemented database initialization (`lib/database/index.ts`)
- ✅ Built ingredient CRUD operations (`lib/database/ingredients.ts`)
- ✅ Built meal log CRUD operations (`lib/database/mealLogs.ts`)
- ✅ Created seed data (`lib/database/seed.ts`) - 22 ingredients
- ✅ Integrated database initialization into app layout

**Testing Infrastructure:**
- ✅ Set up better-sqlite3 for testing
- ✅ Created test database helper with adapter pattern
- ✅ Created mock for expo-sqlite
- ✅ Wrote 14 comprehensive unit tests (all passing)
- ✅ Configured Jest with proper test patterns

**Test UI:**
- ✅ Added temporary test buttons to home screen
- ✅ Manual testing verified
- ✅ Test code removed (2025-01-05)

---

## 📊 Phase 1 Final Statistics

**Files Created:** 13
- 6 database implementation files
- 4 test files
- 2 mock files
- 1 types file

**Tests:** 14/14 passing ✅
- 7 ingredient operation tests
- 7 meal log operation tests
- 100% coverage of CRUD operations

**Seed Data:** 22 Portuguese breakfast/snack ingredients
- 6 proteins (milk, yogurt, cheese, eggs, etc.)
- 7 carbs (breads, cereals, etc.)
- 3 sweets (jam, cookies, marmalade)
- 3 fruits (apple, banana, pear)

**Lines of Code:** ~500+ lines (excluding tests)

---

## 🎓 Key Learnings - Phase 1

### 1. Dependency Management
- **Exact version matching:** `react-test-renderer` must exactly match React version
- **Peer dependencies:** npm selects latest version unless explicitly pinned
- **Version prefix meanings:**
  - `^19.1.0` = any 19.x.x version (>=19.1.0, <20.0.0)
  - `19.1.0` = exactly this version
  - `~19.1.0` = any 19.1.x version (patch updates only)
- **Expo-safe installs:** Use `npx expo install` for compatibility

### 2. Package Migration
- **Check deprecation warnings** - they're not just noise
- **Read migration guides** - API changes can be significant
- **Test after migration** - verify all features still work
- **Clean reinstall technique** - delete lock file + node_modules when stuck

### 3. Platform Differences
- **React Native ≠ Node.js ≠ Browser** - Different JavaScript runtimes
- **Global APIs differ:**
  - Node.js: `crypto`, `fs`, `path`, etc.
  - Browser: `window`, `document`, `localStorage`, etc.
  - React Native: Native bridges, limited globals
- **Use Expo modules** for cross-platform functionality
- **Mock differently per environment** (expo-crypto → Node crypto in tests)

### 4. Testing Patterns
- **better-sqlite3 for SQLite testing** - Industry standard 2025
- **Adapter pattern** - Bridge incompatible APIs
- **Environment-specific mocks** - Different implementations per runtime
- **Module state management** - Reset singletons between tests

### 5. Observability & Debugging
- **Modern error tracking** - Sentry provides real-time insights
- **Unified APIs** - Simpler than platform-specific code
- **Test in production-like conditions** - Always verify in real environment
- **Performance monitoring** - `tracesSampleRate` captures app performance

---

## 📁 Final File Structure

```
demo-react-native-app/
├── types/
│   └── database.ts                           # TypeScript interfaces
├── lib/database/
│   ├── index.ts                              # Database initialization
│   ├── schema.ts                             # SQL schema
│   ├── ingredients.ts                        # Ingredient CRUD
│   ├── mealLogs.ts                          # Meal log CRUD
│   ├── seed.ts                              # Seed data
│   └── __tests__/
│       ├── ingredients.test.ts              # 7 tests ✅
│       ├── mealLogs.test.ts                 # 7 tests ✅
│       ├── testDb.ts                        # better-sqlite3 adapter
│       └── __mocks__/
│           ├── expo-sqlite.ts               # SQLite mock
│           └── expo-crypto.ts               # Crypto mock (NEW)
├── components/
│   └── ErrorBoundary.tsx                     # Updated with new Sentry API
├── app/
│   ├── _layout.tsx                          # DB init + new Sentry SDK
│   └── (tabs)/
│       └── index.tsx                        # Cleaned up (Epic 1 state)
├── app.json                                  # Updated Sentry plugin
├── jest.config.js                           # Updated mocks + removed jest-native
├── package.json                             # Updated dependencies
└── package-lock.json                        # Regenerated
```

---

## ⚡ Problems Encountered & Solutions

| Problem | Root Cause | Solution | Lesson |
|---------|-----------|----------|--------|
| React version mismatch | npm selecting latest react-test-renderer | Pin exact version in package.json | Peer deps need exact matches for renderers |
| Sentry errors on startup | Using deprecated sentry-expo | Migrate to @sentry/react-native | Check package maintenance status |
| crypto.randomUUID() not found | Node.js API in React Native | Use expo-crypto with mocks | Platform-specific APIs need bridges |
| jest-native deprecated warning | Package no longer maintained | Remove - matchers built into RN testing lib | Consolidation reduces dependencies |
| npm install fails after changes | Cached versions in lock file | Clean reinstall (delete lock + node_modules) | Lock files can block updates |

---

## 🎯 Phase 2 Preview

**Phase 2: State Management & Core Logic** (Starting Next Session)

You'll learn:
1. **Zustand** - Lightweight global state management
2. **Algorithm design** - Combination generator for meals
3. **Business logic patterns** - Separation of concerns
4. **Variety enforcement** - Cooldown tracking to prevent repetition

**Estimated time:** 4-5 hours

**Start here:** [PHASE2_STATE_MANAGEMENT.md](./PHASE2_STATE_MANAGEMENT.md)

---

## 📈 Overall Epic 2 Progress

```
Phase 1: Data Foundation       - 100% ████████████████████ ✅ COMPLETE
Phase 2: State Management      - 65%  █████████████░░░░░░░ 🔄 IN PROGRESS
  Step 2.1: Concepts          - 100% ████████████████████ ✅
  Step 2.2: Zustand Setup     - 100% ████████████████████ ✅
  Step 2.3: UI Integration    - 100% ████████████████████ ✅
  Step 2.4: Algorithm         - 100% ████████████████████ ✅
  Step 2.5: Variety Engine    - 0%   ░░░░░░░░░░░░░░░░░░░░ ⏳ NEXT
  Step 2.6: Metrics           - 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 3: Building UI           - 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 4: Navigation            - 0%   ░░░░░░░░░░░░░░░░░░░░
Phase 5: Polish & Testing      - 0%   ░░░░░░░░░░░░░░░░░░░░

Overall Epic 2: ~33% complete
```

---

## 💡 Remember for Next Session

- **Phase 1 is bulletproof** - All tests passing, production-ready observability
- **Database layer is complete** - 22 ingredients seeded and ready
- **Combination generator working** - Pure algorithm with 4 passing tests
- **18 tests passing** - 14 database + 4 algorithm
- **TDD methodology learned** - Red-Green-Refactor cycle
- **Next: Variety Engine** - Track recent meals to prevent repetition!

---

*Session completed - excellent debugging and migration work! 🎉*

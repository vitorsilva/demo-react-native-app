# Phase 2: Data Model Evolution - Progress Log

This document tracks progress for Phase 2 implementation tasks.

---

## 2026-01-25

### Task 3: Add preparation_methods table + seed ✅

**Status:** COMPLETE

**What was done:**
- Created migration version 5 in `lib/database/migrations.ts`
- Added `preparation_methods` table with schema:
  - `id TEXT PRIMARY KEY`
  - `name TEXT NOT NULL UNIQUE`
  - `is_predefined INTEGER DEFAULT 1`
  - `created_at TEXT NOT NULL`
- Seeded 12 predefined preparation methods:
  1. fried
  2. grilled
  3. roasted
  4. boiled
  5. baked
  6. raw
  7. steamed
  8. sautéed
  9. stewed
  10. smoked
  11. poached
  12. braised

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 309/309 passed

---

### Task 4: Add meal_components table ✅

**Status:** COMPLETE

**What was done:**
- Created migration version 6 in `lib/database/migrations.ts`
- Added `meal_components` table with schema:
  - `id TEXT PRIMARY KEY`
  - `meal_log_id TEXT NOT NULL`
  - `ingredient_id TEXT NOT NULL`
  - `preparation_method_id TEXT` (nullable)
  - `created_at TEXT NOT NULL`
- Added foreign key constraints:
  - `meal_log_id` → `meal_logs(id)` with `ON DELETE CASCADE`
  - `ingredient_id` → `ingredients(id)`
  - `preparation_method_id` → `preparation_methods(id)`

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 309/309 passed

---

### Task 5: Add name column to meal_logs ✅

**Status:** COMPLETE

**What was done:**
- Created migration version 7 in `lib/database/migrations.ts`
- Added `name TEXT` column to `meal_logs` table (nullable)
- Column allows optional meal naming like "Mom's special"
- Used `columnExists` helper for idempotency

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 309/309 passed

---

### Task 6: Create unit tests for new migrations ✅

**Status:** COMPLETE

**What was done:**
- Created new test file: `lib/database/__tests__/migrations.phase2.test.ts`
- Added 22 unit tests organized into 4 describe blocks:
  - Migration Version 5: preparation_methods table (7 tests)
  - Migration Version 6: meal_components table (8 tests)
  - Migration Version 7: name column in meal_logs (5 tests)
  - Migration idempotency (2 tests)

**Test Coverage:**
- Table existence and schema validation
- Foreign key constraints verification
- Predefined methods seeding (12 methods)
- Null/non-null value handling
- Unicode character support in meal names
- Migration idempotency (no duplicate data on re-run)

**Issues Encountered:**
- Initially used wrong column name (`logged_at` instead of `date`/`created_at`) for meal_logs inserts
- Fixed by checking actual schema in `schema.ts`

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 331/331 passed (22 new tests added)

---

### Task 7: Update TypeScript types ✅

**Status:** COMPLETE

**What was done:**
- Updated `types/database.ts` with Phase 2 data model types
- Added `PreparationMethod` interface:
  - `id: string`
  - `name: string`
  - `isPredefined: boolean` (maps from INTEGER in SQLite)
  - `createdAt: string`
- Added `MealComponent` interface:
  - `id: string`
  - `mealLogId: string`
  - `ingredientId: string`
  - `preparationMethodId: string | null`
  - `createdAt: string`
- Updated `MealLog` interface:
  - Added optional `name?: string | null` for meal naming
  - Added optional `components?: MealComponent[]` for ingredient+preparation pairs

**Issues Encountered:**
- Initial implementation used required `name: string | null` which broke existing code
- Fixed by making it optional: `name?: string | null` for backward compatibility

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- All existing tests continue to compile and work

---

### Task 8: Update store with new actions ✅

**Status:** COMPLETE

**What was done:**
- Created new database operations file: `lib/database/preparationMethods.ts`
  - `getAllPreparationMethods(db)` - Retrieves all preparation methods sorted by predefined first, then by name
  - `getPreparationMethodById(db, id)` - Retrieves a single method by ID
  - `addPreparationMethod(db, name)` - Adds a custom (user-defined) method
  - `deletePreparationMethod(db, id)` - Deletes a custom method (blocks predefined deletion)
  - `preparationMethodExists(db, name)` - Checks if a method with given name exists (case-insensitive)
- Created new database operations file: `lib/database/mealComponents.ts`
  - `getMealComponents(db, mealLogId)` - Gets all components for a meal log
  - `createMealComponents(db, mealLogId, components)` - Creates meal components
  - `deleteMealComponents(db, mealLogId)` - Deletes all components for a meal
  - `logMealWithComponents(db, mealLog, components, name?)` - Logs a meal with components and optional name
  - `getMealLogWithComponents(db, mealLogId)` - Gets a meal with its components attached
  - `getRecentMealLogsWithComponents(db, days)` - Gets recent meals with components
- Updated `lib/store/index.ts` with new state and actions:
  - Added `preparationMethods: PreparationMethod[]` state
  - Added `loadPreparationMethods()` action
  - Added `addPreparationMethod(name)` action
  - Added `deletePreparationMethod(id)` action
  - Added `logMealWithComponents(mealTypeId, components, name?)` action
  - Added `getMealWithComponents(mealLogId)` action

**New Files Created:**
- `lib/database/preparationMethods.ts` (126 lines)
- `lib/database/mealComponents.ts` (181 lines)

**Files Modified:**
- `lib/store/index.ts` - Added imports, state, interface, and action implementations

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 331/331 passed (no new tests in this task, tests come in task 9)

---

### Task 9: Create unit tests for store actions ✅

**Status:** COMPLETE

**What was done:**
- Created new test file: `lib/store/__tests__/preparationMethods.test.ts`
- Added 24 unit tests organized into 6 describe blocks:
  - Preparation Methods - loadPreparationMethods (3 tests)
  - Preparation Methods - addPreparationMethod (4 tests)
  - Preparation Methods - deletePreparationMethod (5 tests)
  - Meal Components - logMealWithComponents (6 tests)
  - Meal Components - getMealWithComponents (4 tests)
  - Integration - Preparation Methods with Meal Components (2 tests)

**Test Coverage:**
- Load predefined methods from database
- Sorting (predefined first, then by name)
- Add custom preparation method with state update
- Duplicate name error handling
- Whitespace trimming in method names
- Delete custom method (not predefined)
- Block deletion of predefined methods
- Block deletion when method used in meal components
- Log meal with components (with/without name)
- Legacy ingredients array population for backward compatibility
- Get meal with components
- Handle non-existent meals
- Handle legacy meals without components
- End-to-end workflow integration
- Unicode character support in meal names

**Issues Encountered:**
- Initial test for duplicate method error used `rejects.toThrow()` which didn't work correctly
- Fixed by using try-catch pattern with explicit error assertions

**New Files Created:**
- `lib/store/__tests__/preparationMethods.test.ts` (315 lines)

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 355/355 passed (24 new tests added)

---

### Task 10: Migrate existing data ✅

**Status:** COMPLETE

**What was done:**
- Added migration version 8 to `lib/database/migrations.ts`
- Added import for `expo-crypto` module to generate UUIDs
- Migration converts legacy `meal_logs.ingredients` JSON array to `meal_components` entries
- Key features of the migration:
  - Uses LEFT JOIN to find meal logs that don't have components yet (idempotent)
  - Parses JSON ingredients array and creates `meal_components` for each ingredient
  - Sets `preparation_method_id` to NULL for migrated components
  - Validates ingredient existence before creating component
  - Logs warnings for malformed JSON or missing ingredients without failing
  - Inherits `created_at` timestamp from parent meal log

**Implementation Details:**
- Query finds meal logs without components: `LEFT JOIN meal_components mc ON mc.meal_log_id = ml.id WHERE mc.id IS NULL`
- Uses `recordExists` helper to verify each ingredient before creating component
- Uses `Crypto.randomUUID()` for generating component IDs
- Graceful error handling preserves migration integrity

**Files Modified:**
- `lib/database/migrations.ts` - Added import for expo-crypto and migration version 8

**Verification:**
- TypeScript check: ✅ Passed
- ESLint: ✅ Passed (only pre-existing warnings)
- Unit tests: ✅ 355/355 passed (no new tests in this task, tests come in task 11)

---

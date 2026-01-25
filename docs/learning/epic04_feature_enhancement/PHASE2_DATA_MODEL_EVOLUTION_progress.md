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

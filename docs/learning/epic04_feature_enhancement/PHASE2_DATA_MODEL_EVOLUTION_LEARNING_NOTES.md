# Phase 2: Data Model Evolution - Learning Notes

This document captures errors, problems, fixes, and workarounds encountered during Phase 2 implementation.

---

## Task 3: Add preparation_methods table + seed

**Date:** 2026-01-25

### Implementation Summary
- Added migration version 5 to `lib/database/migrations.ts`
- Created `preparation_methods` table with columns: `id`, `name`, `is_predefined`, `created_at`
- Seeded 12 predefined preparation methods: fried, grilled, roasted, boiled, baked, raw, steamed, sautéed, stewed, smoked, poached, braised

### Notes
- Migration follows existing pattern using `CREATE TABLE IF NOT EXISTS` for idempotency
- Uses `recordExists` helper to prevent duplicate seeding
- All 309 unit tests pass after implementation
- TypeScript check passes with no errors
- ESLint shows only pre-existing warnings (unrelated to this change)

### No Issues Encountered
- Implementation was straightforward following the established migration pattern
- No special handling required

---

## Task 4: Add meal_components table

**Date:** 2026-01-25

### Implementation Summary
- Added migration version 6 to `lib/database/migrations.ts`
- Created `meal_components` table with columns:
  - `id TEXT PRIMARY KEY`
  - `meal_log_id TEXT NOT NULL`
  - `ingredient_id TEXT NOT NULL`
  - `preparation_method_id TEXT` (nullable, for ingredients without preparation)
  - `created_at TEXT NOT NULL`
- Added foreign key constraints to `meal_logs`, `ingredients`, and `preparation_methods`
- Used `ON DELETE CASCADE` for meal_log_id foreign key to ensure components are deleted when parent meal is deleted

### Notes
- Migration follows existing pattern using `CREATE TABLE IF NOT EXISTS` for idempotency
- All 309 unit tests pass after implementation
- TypeScript check passes with no errors
- ESLint shows only pre-existing warnings (unrelated to this change)

### No Issues Encountered
- Implementation was straightforward following the established migration pattern
- No special handling required

---

## Task 5: Add name column to meal_logs

**Date:** 2026-01-25

### Implementation Summary
- Added migration version 7 to `lib/database/migrations.ts`
- Added `name TEXT` column to `meal_logs` table
- Column is nullable to allow optional meal naming (e.g., "Mom's special")

### Notes
- Migration uses `columnExists` helper to ensure idempotency
- All 309 unit tests pass after implementation
- TypeScript check passes with no errors
- ESLint shows only pre-existing warnings (unrelated to this change)

### No Issues Encountered
- Implementation was straightforward following the established migration pattern
- No special handling required

---

## Task 6: Create unit tests for new migrations

**Date:** 2026-01-25

### Implementation Summary
- Created new test file: `lib/database/__tests__/migrations.phase2.test.ts`
- Added 22 unit tests covering Phase 2 migrations (versions 5, 6, and 7)
- Tests organized into four describe blocks:
  1. Migration Version 5: preparation_methods table (7 tests)
  2. Migration Version 6: meal_components table (8 tests)
  3. Migration Version 7: name column in meal_logs (5 tests)
  4. Migration idempotency (2 tests)

### Test Coverage
- **Version 5 tests**: Table existence, schema validation, 12 predefined methods seeding, correct id format (prep-*), UNIQUE constraint on name, created_at population
- **Version 6 tests**: Table existence, schema validation, foreign keys to meal_logs/ingredients/preparation_methods, null preparation_method_id support, valid preparation_method_id references
- **Version 7 tests**: Column existence, null value support, meal name storage, update capability, unicode character support
- **Idempotency tests**: Migration recording in migrations table, re-running migrations doesn't duplicate data

### Issues Encountered

#### Issue 1: Wrong column name in meal_logs table
**Problem:** Initial test code used `logged_at` column for inserting test data into `meal_logs`, but the actual schema uses `date` and `created_at` columns.

**Error:**
```
SqliteError: table meal_logs has no column named logged_at
```

**Fix:** Updated all INSERT statements to use the correct columns:
```sql
-- Before (incorrect)
INSERT INTO meal_logs (id, meal_type, ingredients, logged_at) VALUES (...)

-- After (correct)
INSERT INTO meal_logs (id, date, meal_type, ingredients, created_at) VALUES (...)
```

**Lesson Learned:** Always verify the actual database schema (in `schema.ts`) before writing test queries. The schema showed `date TEXT NOT NULL` and `created_at TEXT NOT NULL`, not `logged_at`.

### Final Results
- All 22 new tests pass
- Total test count increased from 309 to 331
- TypeScript check passes with no errors
- ESLint shows only pre-existing warnings (unrelated to this change)

---

## Task 7: Update TypeScript types

**Date:** 2026-01-25

### Implementation Summary
- Updated `types/database.ts` to add Phase 2 types
- Added new `PreparationMethod` interface with fields:
  - `id: string`
  - `name: string`
  - `isPredefined: boolean` (maps from `is_predefined INTEGER` in SQLite)
  - `createdAt: string`
- Added new `MealComponent` interface with fields:
  - `id: string`
  - `mealLogId: string`
  - `ingredientId: string`
  - `preparationMethodId: string | null`
  - `createdAt: string`
- Updated `MealLog` interface:
  - Added optional `name?: string | null` field for meal naming
  - Added optional `components?: MealComponent[]` field for ingredient+preparation pairs

### Issues Encountered

#### Issue 1: Required vs optional `name` field
**Problem:** Initial implementation used `name: string | null` (required field). This caused TypeScript errors throughout the codebase where `MealLog` objects were created without the `name` field.

**Error:**
```
error TS2345: Argument of type '{ date: string; ingredients: string[]; mealType: string; }'
is not assignable to parameter of type '...'.
  Property 'name' is missing in type '...' but required in type 'Omit<MealLog, "id" | "createdAt" | "isFavorite">'.
```

**Fix:** Changed `name: string | null` to `name?: string | null` (optional field). This maintains backward compatibility with existing code while allowing new code to set meal names.

```typescript
// Before (incorrect - breaking change)
name: string | null;

// After (correct - backward compatible)
name?: string | null;
```

**Lesson Learned:** When adding new fields to existing interfaces that are used throughout the codebase, always consider backward compatibility. New fields should be optional (`?`) to avoid breaking existing code. The spec mentioned "backward compatibility" which should have prompted using optional fields from the start.

### Final Results
- TypeScript check passes with no errors
- ESLint shows only pre-existing warnings (unrelated to this change)
- Existing tests continue to compile and work

---

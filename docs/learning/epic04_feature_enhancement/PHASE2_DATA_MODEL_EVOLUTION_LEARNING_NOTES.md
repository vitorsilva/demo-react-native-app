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

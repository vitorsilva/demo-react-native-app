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

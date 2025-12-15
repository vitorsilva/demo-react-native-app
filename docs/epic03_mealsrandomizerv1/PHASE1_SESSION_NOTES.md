# Phase 1: User Customization - Session Notes

**Date:** 2025-11-26
**Session Duration:** ~1 hour
**Focus:** Database Migrations System (Step 1.1)

---

## Summary

This session focused on building a database migrations system to support schema evolution for user customization features. We created a versioned migration system with idempotent operations that safely adds new tables and columns.

---

## Key Accomplishments

### 1. Database Migrations System

**Created:** `lib/database/migrations.ts`

- Built migration runner with version tracking
- Created `migrations` table to track applied versions
- Implemented helper functions for idempotent operations:
  - `columnExists()` - Check if a column exists before adding
  - `recordExists()` - Check if a record exists before inserting
- Added Migration Version 1 with all safety checks

### 2. Migration Version 1 Contents

**New Tables:**
- `categories` - For organizing ingredients (id, name, created_at, updated_at)
- `meal_types` - For custom meal types beyond breakfast/snack (id, name, min_ingredients, max_ingredients, default_cooldown_days, is_active, created_at, updated_at)

**Modified Tables:**
- `ingredients` - Added columns: `category_id`, `is_active`, `is_user_added`, `updated_at`
- `meal_logs` - Added column: `updated_at` (for consistency)

**Seed Data:**
- Default meal types: "breakfast" and "snack"

### 3. Integration

**Modified:** `lib/database/index.ts`
- Added import for `runMigrations`
- Integrated migrations into app startup (runs after initial schema creation)

---

## Technical Concepts Learned

### 1. Database Migrations

**What it is:** A versioned approach to schema changes that:
- Tracks which version the database is at
- Applies changes incrementally
- Preserves existing data

**Why it matters:**
- Users already have data in their database
- Direct schema changes could lose data or cause mismatches
- Migrations allow safe, incremental updates

### 2. Idempotent Operations

**What it is:** Operations that can be run multiple times with the same result

**Why it matters:**
- Partial migration failures (crash halfway through)
- Manual database tampering during debugging
- Development testing scenarios

**Implementation:**
```typescript
// Check before adding column (SQLite has no IF NOT EXISTS for ALTER TABLE)
if (!(await columnExists(db, 'ingredients', 'category_id'))) {
  await db.runAsync(`ALTER TABLE ingredients ADD COLUMN category_id INTEGER`);
}

// Check before inserting record
if (!(await recordExists(db, 'meal_types', 'name = ?', ['breakfast']))) {
  await db.runAsync(`INSERT INTO meal_types ...`);
}
```

### 3. SQLite PRAGMA

**What it is:** SQLite-specific commands to query database metadata

**Usage:**
```typescript
// Get column information for a table
const columns = await db.getAllAsync<{ name: string }>(
  `PRAGMA table_info(${tableName})`
);
```

### 4. SQLite Type System

**Key insight:** SQLite doesn't have a native BOOLEAN type

**Solution:** Use INTEGER where:
- `0` = false
- `1` = true

Convert to boolean in TypeScript when reading from database.

### 5. Schema Consistency

**Discussion:** Existing tables lacked `updated_at` column that new tables had.

**Decision:** Add `updated_at` to existing tables for consistency:
- Useful for debugging ("when was this last modified?")
- Standard practice in production databases
- Better to be consistent across all tables

---

## Files Created

- `lib/database/migrations.ts` - Migration system with version 1

## Files Modified

- `lib/database/index.ts` - Added migration integration

---

## Testing Results

**Web Mode Test:**
```
Web platform detected - using in-memory database
Current database version: 0
Running migration 1...
Migration 1 complete
All migrations complete
Seeded 19 ingredients
Database ready
```

Migration runs successfully on app startup.

---

## Next Steps

Continue with Step 1.2: Category CRUD Operations
- Create `lib/database/categories.ts`
- Implement: `createCategory()`, `getCategories()`, `updateCategory()`, `deleteCategory()`
- Add tests in `__tests__/categories.test.ts`

---

## Questions Discussed

### Q: Why INTEGER instead of BOOLEAN in SQLite?
**A:** SQLite has a simplified type system (INTEGER, REAL, TEXT, BLOB, NULL). No native boolean - use INTEGER with 0/1.

### Q: Should we add `updated_at` to existing tables or remove from new tables?
**A:** Add to existing tables for consistency. More useful for debugging and standard practice.

### Q: Should migrations be idempotent even with versioning?
**A:** Yes - defensive programming handles edge cases like partial failures, manual tampering, and development testing.

---

**Status:** Step 1.1 COMPLETE

---

## Session 2: Step 1.2 - Category CRUD Operations

**Date:** 2025-12-15
**Session Duration:** ~1.5 hours
**Focus:** Category CRUD Operations

---

## Summary

This session focused on building the database layer for category management. We created full CRUD operations following established patterns from the codebase.

---

## Key Accomplishments

### 1. Added Category Type

**Modified:** `types/database.ts`

- Added `Category` interface with `id`, `name`, `created_at`, `updated_at`
- Used `string` for `id` (UUID) to match other entities

### 2. Updated Migrations for UUID Consistency

**Modified:** `lib/database/migrations.ts`

- Changed `categories` table from `INTEGER PRIMARY KEY AUTOINCREMENT` to `TEXT PRIMARY KEY`
- Changed `meal_types` table from `INTEGER PRIMARY KEY AUTOINCREMENT` to `TEXT PRIMARY KEY`
- Updated seed data to use readable IDs (`mt-breakfast-001`, `mt-snack-001`)

### 3. Created Category CRUD Module

**Created:** `lib/database/categories.ts`

Full CRUD operations following established patterns:
- `getAllCategories(db)` - Fetch all categories, ordered by name
- `getCategoryById(db, id)` - Fetch single category by ID
- `addCategory(db, { name })` - Create with UUID, returns full entity
- `updateCategory(db, id, { name })` - Update name and updated_at
- `deleteCategory(db, id)` - Delete with foreign key safety check

### 4. Updated Test Infrastructure

**Modified:** `lib/database/__mocks__/index.ts`

- Added import for `runMigrations`
- Added `await runMigrations(database)` after base schema creation
- Tests now properly create categories/meal_types tables

### 5. Created Category Tests

**Created:** `lib/database/__tests__/categories.test.ts`

7 unit tests covering:
- Empty state handling
- Category creation with UUID
- Alphabetical ordering
- Get by ID (found and not found)
- Update with timestamp change
- Delete when no ingredients assigned

---

## Technical Concepts Learned

### 1. Code Consistency & Standardization

**Discussion:** Noticed inconsistent naming patterns across modules:
- `addIngredient` vs `logMeal` vs `createCategory`
- Different parameter patterns (object vs individual args)

**Decision:** Standardized on:
- Method naming: `add[EntityName]`
- Parameter pattern: `Omit<Entity, 'auto-generated-fields'>`
- Return pattern: Construct object directly, don't re-query

### 2. UUID vs Auto-increment

**Discussion:** Categories table used `INTEGER PRIMARY KEY AUTOINCREMENT`, but other tables use UUID.

**Decision:** Changed to UUID (`TEXT PRIMARY KEY`) for consistency:
- All entities now use UUID
- IDs generated in code with `Crypto.randomUUID()`
- Seed data uses readable IDs for system records

### 3. Update Pattern

**Key insight:** `updateCategory` must query after update because:
- We don't have `created_at` in the input
- Need to return complete entity
- Different from `addCategory` where we have all values

### 4. Safe Delete Pattern

**Implementation:** Check foreign keys before delete:
```typescript
const count = await db.getFirstAsync<{ count: number }>(
  'SELECT COUNT(*) as count FROM ingredients WHERE category_id = ?',
  [id]
);
if (count && count.count > 0) {
  return { success: false, error: '...' };
}
```

### 5. Test Infrastructure Update

**Learning:** When adding new tables via migrations, the test mock must also run migrations to create those tables.

---

## Files Created

- `lib/database/categories.ts` - Category CRUD operations
- `lib/database/__tests__/categories.test.ts` - 7 unit tests

## Files Modified

- `types/database.ts` - Added Category interface
- `lib/database/migrations.ts` - Changed to UUID, updated seed data
- `lib/database/__mocks__/index.ts` - Added migration support

---

## Testing Results

**Unit Tests:** 47 passing (7 new)
**Web Mode:** App runs correctly, migrations execute

---

## Next Steps

Continue with Step 1.3: Meal Type CRUD Operations
- Create `lib/database/mealTypes.ts`
- Implement CRUD with additional fields (min/max ingredients, cooldown, is_active)
- Add tests in `__tests__/mealTypes.test.ts`

---

**Status:** Step 1.2 COMPLETE
**Next Session:** Step 1.3 - Meal Type CRUD Operations

---

[← Back to Overview](./OVERVIEW.md) | [Phase 1 Guide](./PHASE1_USER_CUSTOMIZATION.md)

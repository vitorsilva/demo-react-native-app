# Phase 3.2: Seed Data & App Reset - Learning Notes

This document captures unexpected errors, workarounds, and fixes encountered during Phase 3.2 implementation.

---

## Issues Encountered

| Task | Issue | Resolution |
|------|-------|------------|
| 16 | Playwright test `getByText(/no meals\|no entries\|empty/i)` matched 3 elements | Changed to `page.getByTestId('history-empty-state')` for unique selection |
| 18 | Unit tests failed after migration v10 with UNIQUE constraint on category names | Updated tests to use unique names like "Test Unique Category" |
| 18 | Tests assumed empty database state after seeded data migration | Changed tests to check relative changes instead of absolute counts |

---

## Key Lessons Learned

### 1. TestId Over Text Matching

**Problem:** Using regex text matching in E2E tests can match multiple elements.

**Solution:** Always prefer testIds for unique element identification:
```typescript
// Avoid
await expect(page.getByText(/no meals|no entries|empty/i)).toBeVisible();

// Prefer
await expect(page.getByTestId('history-empty-state')).toBeVisible();
```

### 2. Seed Data Impacts Test Assumptions

**Problem:** Tests written before seed data migrations assume empty state.

**Solution:** Update tests to:
- Check relative changes, not absolute counts
- Use unique test data names that don't conflict with seeds
- Get initial count before test operations

```typescript
// Before (assumes empty)
expect(categories).toHaveLength(1);

// After (relative change)
const initialCount = (await getAllCategories(db)).length;
expect(categories).toHaveLength(initialCount + 1);
```

### 3. Idempotent Migrations

**Pattern:** Use `INSERT OR IGNORE` for seed data:
```typescript
await db.runAsync(`
  INSERT OR IGNORE INTO categories (id, name, created_at, updated_at)
  VALUES (?, ?, datetime('now'), datetime('now'))
`, [cat.id, cat.name]);
```

This allows migrations to run multiple times without failure.

### 4. Confirmation Modal Pattern

**UI Pattern:** For destructive operations:
1. Button triggers modal visibility state
2. Modal shows clear warning about data loss
3. Cancel closes modal, Confirm executes action
4. Success feedback after completion
5. Both buttons have testIds for E2E testing

---

## Test Summary

| Type | Before | After | New |
|------|--------|-------|-----|
| Unit Tests | 504 | 572 | +68 |
| Playwright E2E | 97 | 106 | +9 |
| Maestro E2E | 25 | 28 | +3 |

## Quality Metrics (Baseline vs After)

| Metric | Baseline | After | Status |
|--------|----------|-------|--------|
| Architecture violations | 0 | 0 | ✅ |
| Modules | 147 | 152 | ✅ Expected growth |
| Dependencies | 388 | 401 | ✅ Expected growth |
| Dead code hints | 1 | 1 | ✅ Same |
| Duplicate clones | 26 (~3.7%) | 26 (~3.5%) | ✅ Same |
| Security findings | 0 | 0 | ✅ |

---

## Useful References

- [Phase 3 Learning Notes](./PHASE3_ENHANCED_VARIETY_LEARNING_NOTES.md) - Pairing rules patterns
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Table relationships

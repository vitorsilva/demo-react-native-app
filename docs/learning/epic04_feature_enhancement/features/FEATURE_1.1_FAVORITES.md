# Feature 1.1: Favorite Combinations ⭐

**Status:** 📋 PLANNED

**Effort:** ~4 hours implementation + ~4 hours testing

**Dependencies:** None

---

## Overview

Allow users to mark combinations as favorites for prioritized suggestions.

---

## UI Wireframes

### Suggestion Card (Before & After)

**BEFORE:**
```
┌─────────────────────────────────────┐
│                                     │
│  milk + cereals                     │
│                                     │
│              [Select]               │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │  ← Favorite button
│                                     │
└─────────────────────────────────────┘

Legend:
- ⭐ = tap to favorite (filled when favorited)
```

### History Screen (Before & After)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  History                            │
├─────────────────────────────────────┤
│                                     │
│  Today                              │
│  ┌─────────────────────────────────┐│
│  │ milk + cereals                  ││
│  │ Breakfast • 8:30 AM             ││
│  └─────────────────────────────────┘│
│                                     │
│  Yesterday                          │
│  ┌─────────────────────────────────┐│
│  │ bread + butter + cheese         ││
│  │ Breakfast • 8:15 AM             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  History                            │
├─────────────────────────────────────┤
│  [All] [⭐ Favorites]               │  ← Filter tabs
├─────────────────────────────────────┤
│                                     │
│  Today                              │
│  ┌─────────────────────────────────┐│
│  │ milk + cereals              [⭐]││  ← Favorite indicator
│  │ Breakfast • 8:30 AM             ││
│  └─────────────────────────────────┘│
│                                     │
│  Yesterday                          │
│  ┌─────────────────────────────────┐│
│  │ bread + butter + cheese     [☆]││  ← Not favorited
│  │ Breakfast • 8:15 AM             ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## User Flow

1. User logs a meal (existing flow)
2. After confirmation, show "Add to favorites?" option
3. Or: User can tap ⭐ icon on any suggestion card
4. Favorites appear more frequently in suggestions
5. New "Favorites" section in History tab

---

## Implementation

### Database Migration

This project uses a **versioned migration system** in `lib/database/migrations.ts`. Each migration has a version number and an idempotent `up` function.

**Current schema version:** 3

**Add migration version 4:**

```typescript
// In lib/database/migrations.ts - add to migrations array

{
  version: 4,
  up: async (db: DatabaseAdapter) => {
    // Add is_favorite column to meal_logs (idempotent)
    if (!(await columnExists(db, 'meal_logs', 'is_favorite'))) {
      await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN is_favorite INTEGER DEFAULT 0`);
    }
  },
}
```

**How the migration system works:**
1. `migrations` table tracks applied versions
2. `runMigrations(db)` runs on app startup
3. Only migrations with `version > currentVersion` are executed
4. `columnExists()` helper ensures idempotency (safe to re-run)
5. Each migration is recorded in `migrations` table after success

**Why this is safe:**
- New column has `DEFAULT 0`, so existing rows get the default value
- `columnExists()` check prevents errors if migration runs twice
- No data loss - purely additive change
- Old app versions ignore the new column

### Algorithm Update

```typescript
// In generateSuggestions()
// Favorites get 2x weight but still respect cooldown
const favoriteBonus = combination.isFavorite ? 20 : 0;
score += favoriteBonus;
```

### UI Changes

- Add ⭐ icon to suggestion cards (tap to favorite)
- Add ⭐ icon to history items
- Add "Favorites" filter in History screen
- Update suggestion algorithm to weight favorites higher

---

## Files to Create/Modify

**Modified Files:**
- `lib/database/migrations.ts` - Add `is_favorite` column
- `lib/store/index.ts` - Add favorite actions
- `components/SuggestionCard.tsx` - Add favorite icon
- `app/(tabs)/history.tsx` - Add favorites filter

---

## Acceptance Criteria

- [ ] Can mark/unmark combinations as favorites
- [ ] Favorites appear in suggestions more often
- [ ] Can filter history to show only favorites
- [ ] Favorites still respect cooldown period

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] Favorite toggle updates state correctly
- [ ] Algorithm boost applies to favorites
- [ ] Filter correctly shows only favorites

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Can mark a combination as favorite
- [ ] Favorites appear in filtered history
- [ ] Favorite persists after app restart

### Mobile E2E Tests - Maestro (🧪 CREATE new tests)
- [ ] Can mark a combination as favorite on mobile
- [ ] Favorites filter works on mobile

---

## Implementation Order

| Order | Task | Type | Effort | Status |
|-------|------|------|--------|--------|
| 1 | Database migration for `is_favorite` column | Implementation | ~30 min | done |
| 2 | Add favorite actions to Zustand store | Implementation | ~1 hour | done |
| 3 | Add favorite icon to SuggestionCard | Implementation | ~1 hour | done |
| 4 | Add favorites filter to History screen | Implementation | ~1.5 hours | done |
| 5 | 🧪 CREATE unit tests for favorites | Testing | ~1 hour | not started |
| 6 | 🧪 CREATE Playwright E2E tests | Testing | ~1.5 hours | not started |
| 7 | 🧪 CREATE Maestro tests | Testing | ~1.5 hours | not started |
| 8 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Database Schema](../../../architecture/DATABASE_SCHEMA.md)
- [State Management](../../../architecture/STATE_MANAGEMENT.md)

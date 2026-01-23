# Feature 1.2: "New!" Badge 🆕

**Status:** 📋 PLANNED

**Effort:** ~2 hours implementation + ~1 hour testing

**Dependencies:** None

---

## Overview

Visual indicator on combinations the user hasn't tried recently (or ever).

---

## Definition

- **"New!"** = combination never logged OR not logged in 7+ days

---

## UI Wireframe

### Suggestion Card

```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │  ← New badge (top-right)
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │
│                                     │
└─────────────────────────────────────┘

Legend:
- [New!] = never tried or 7+ days since last logged
```

---

## Implementation

### Utility Function

```typescript
// lib/utils/variety.ts

function isNewCombination(ingredients: string[], history: MealLog[]): boolean {
  const comboKey = ingredients.sort().join(',');
  const lastLogged = history.find(log =>
    log.ingredients.sort().join(',') === comboKey
  );

  if (!lastLogged) return true; // Never logged

  const daysSince = differenceInDays(new Date(), new Date(lastLogged.date));
  return daysSince >= 7;
}
```

### UI Changes

- Add "New!" badge component (small pill, accent color)
- Display on suggestion cards when `isNew === true`
- Badge positioned top-right of card

---

## Files to Create/Modify

**New Files:**
- `components/NewBadge.tsx` - "New!" badge component
- `lib/utils/variety.ts` - Variety utility functions (shared with 1.3)

**Modified Files:**
- `components/SuggestionCard.tsx` - Add badge display

---

## Acceptance Criteria

- [ ] Badge appears on never-tried combinations
- [ ] Badge appears on combinations not tried in 7+ days
- [ ] Badge does not appear on recently logged combinations

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] `isNewCombination()` returns `true` for never-logged combinations
- [ ] `isNewCombination()` returns `true` for 7+ days ago
- [ ] `isNewCombination()` returns `false` for recent combinations (< 7 days)
- [ ] Edge case: exactly 7 days returns `true`
- [ ] Edge case: 6 days returns `false`

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Badge visible on new combinations
- [ ] Badge not visible on recent combinations

---

## Implementation Order

| Order | Task | Type | Effort |
|-------|------|------|--------|
| 1 | Create `isNewCombination()` utility | Implementation | ~30 min | not started |
| 2 | Create NewBadge component | Implementation | ~30 min | not started |
| 3 | Integrate badge into SuggestionCard | Implementation | ~1 hour | not started |
| 4 | 🧪 CREATE unit tests for `isNewCombination()` | Testing | ~30 min | not started |
| 5 | 🧪 CREATE E2E test for badge visibility | Testing | ~30 min | not started |
| 6 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Feature 1.3: Variety Color Coding](./FEATURE_1.3_COLOR_CODING.md) - Shares utility file

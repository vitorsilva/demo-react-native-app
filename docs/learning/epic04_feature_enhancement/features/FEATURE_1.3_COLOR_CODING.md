# Feature 1.3: Variety Color Coding 🎨

**Status:** 📋 PLANNED

**Effort:** ~2 hours implementation + ~1 hour testing

**Dependencies:** None

---

## Overview

Color-coded visual indicators showing recency of each suggestion.

---

## Color Scheme

| Color | Meaning | Days Since Last Logged |
|-------|---------|------------------------|
| 🟢 Green | Fresh choice | 3+ days (or never) |
| 🟡 Yellow | Recent | 1-2 days ago |
| 🔴 Red | Very recent | Today (shouldn't appear normally) |

---

## UI Wireframe

### Suggestion Card

```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │  ← Color dot (top-left)
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │
│                                     │
└─────────────────────────────────────┘

Legend:
- 🟢 Green dot = fresh (3+ days)
- 🟡 Yellow dot = recent (1-2 days)
- 🔴 Red dot = very recent (today)
```

---

## Implementation

### Utility Function

```typescript
// lib/utils/variety.ts

function getVarietyColor(ingredients: string[], history: MealLog[]): 'green' | 'yellow' | 'red' {
  const comboKey = ingredients.sort().join(',');
  const lastLogged = history.find(log =>
    log.ingredients.sort().join(',') === comboKey
  );

  if (!lastLogged) return 'green';

  const daysSince = differenceInDays(new Date(), new Date(lastLogged.date));

  if (daysSince >= 3) return 'green';
  if (daysSince >= 1) return 'yellow';
  return 'red';
}
```

### UI Changes

- Add colored indicator (dot or border) to suggestion cards
- Color applied to left border or corner dot
- Optional: Add to Settings to toggle off

### Accessibility

Colors should not be the only indicator. Consider adding:
- Different shapes or icons for each state
- Screen reader labels

---

## Files to Create/Modify

**New Files:**
- `lib/utils/variety.ts` - Variety utility functions (shared with 1.2)

**Modified Files:**
- `components/SuggestionCard.tsx` - Add color indicator

---

## Acceptance Criteria

- [ ] Green indicator for 3+ days ago (or never)
- [ ] Yellow indicator for 1-2 days ago
- [ ] Red indicator for today (edge case)
- [ ] Colors are accessible (not just color, also icon/shape)

---

## Testing Strategy

### Unit Tests
- [ ] `getVarietyColor()` returns `'green'` for never-logged combinations
- [ ] `getVarietyColor()` returns `'green'` for 3+ days ago
- [ ] `getVarietyColor()` returns `'yellow'` for 1-2 days ago
- [ ] `getVarietyColor()` returns `'red'` for today
- [ ] Edge case: exactly 3 days returns `'green'`
- [ ] Edge case: exactly 1 day returns `'yellow'`

### E2E Tests (Playwright)
- [ ] Color indicator visible on suggestion cards
- [ ] Correct color based on recency

---

## Implementation Order

| Order | Task | Effort |
|-------|------|--------|
| 1 | Create `getVarietyColor()` utility | ~30 min |
| 2 | Add color indicator to SuggestionCard | ~1 hour |
| 3 | Add accessibility support (shapes/labels) | ~30 min |
| 4 | Write unit tests for `getVarietyColor()` | ~30 min |
| 5 | Write E2E test for color visibility | ~30 min |

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Feature 1.2: "New!" Badge](./FEATURE_1.2_NEW_BADGE.md) - Shares utility file

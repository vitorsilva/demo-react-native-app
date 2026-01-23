# Feature 1.4: Variety Stats 📊

**Status:** 📋 PLANNED

**Effort:** ~4 hours implementation + ~3 hours testing

**Dependencies:** None

---

## Overview

Personalization stats showing user's variety patterns over time.

---

## Stats to Calculate

- **Total unique combinations this month**
- **Most common combination** (with count)
- **Ingredients used vs total available**
- **Variety score percentage**

### Example Display

- "You've tried 15 different breakfast combinations this month!"
- "Your most common breakfast is milk + cereals (8 times)"
- "You've used 12 of your 18 ingredients this week"
- "Variety score: 78%"

---

## UI Wireframe

### Home Screen (Before & After)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  SaborSpin                     ☰    │
├─────────────────────────────────────┤
│                                     │
│  What would you like?               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │     🍳 Breakfast Ideas          ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     🥪 Snack Ideas              ││
│  └─────────────────────────────────┘│
│                                     │
│  Recent:                            │
│  • milk + cereals (today)           │
│  • bread + cheese (yesterday)       │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  SaborSpin                     ☰    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 📊 Your Variety This Month      ││  ← NEW: Stats card
│  │                                 ││
│  │ 🎯 15 unique combos             ││
│  │ ⭐ Top: milk + cereals (8x)     ││
│  │ 🥗 12/18 ingredients used       ││
│  │ 📈 Variety score: 78%           ││
│  │                            [▼]  ││  ← Collapsible
│  └─────────────────────────────────┘│
│                                     │
│  What would you like?               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │     🍳 Breakfast Ideas          ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     🥪 Snack Ideas              ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Implementation

### Type Definition

```typescript
interface VarietyStats {
  uniqueCombosThisMonth: number;
  mostCommonCombo: { ingredients: string[]; count: number };
  ingredientsUsedThisWeek: number;
  totalIngredients: number;
  varietyScore: number; // 0-100
}
```

### Calculation Function

```typescript
// lib/utils/variety.ts

function calculateVarietyStats(history: MealLog[], ingredients: Ingredient[]): VarietyStats {
  // Filter to this month
  const thisMonth = history.filter(log => isThisMonth(new Date(log.date)));

  // Count unique combinations
  const uniqueCombos = new Set(thisMonth.map(log => log.ingredients.sort().join(',')));

  // Find most common
  const comboCounts = new Map<string, number>();
  thisMonth.forEach(log => {
    const key = log.ingredients.sort().join(',');
    comboCounts.set(key, (comboCounts.get(key) || 0) + 1);
  });
  // ... find max

  // Calculate variety score
  // Score = (unique combos / total logs) * (ingredients used / total ingredients) * 100

  return { ... };
}
```

### UI Changes

- Add stats card to Home screen (collapsible)
- Or: Add "Stats" section in History tab
- Show key metrics with icons
- Update stats on each meal log

---

## Files to Create/Modify

**New Files:**
- `components/VarietyStats.tsx` - Stats display component
- `lib/utils/variety.ts` - Variety calculations (shared with 1.2, 1.3)

**Modified Files:**
- `app/(tabs)/index.tsx` - Add stats card

---

## Acceptance Criteria

- [ ] Shows unique combinations count for current month
- [ ] Shows most common combination
- [ ] Shows ingredient usage ratio
- [ ] Shows variety score percentage
- [ ] Stats update after logging a meal
- [ ] Stats card is collapsible

---

## Testing Strategy

### Unit Tests
- [ ] `calculateVarietyStats()` returns correct unique combo count
- [ ] `calculateVarietyStats()` returns correct most common combo
- [ ] `calculateVarietyStats()` returns correct ingredient usage ratio
- [ ] `calculateVarietyStats()` returns correct variety score
- [ ] Edge case: no history returns zeros/defaults
- [ ] Edge case: all same combo returns 1 unique, high count

### E2E Tests (Playwright)
- [ ] Stats display on home screen
- [ ] Stats update after logging a meal
- [ ] Stats card can be collapsed/expanded

### Mobile E2E Tests (Maestro)
- [ ] Stats visible on home screen on mobile
- [ ] Stats card collapse/expand works on mobile

---

## Implementation Order

| Order | Task | Effort |
|-------|------|--------|
| 1 | Create `calculateVarietyStats()` utility | ~1.5 hours |
| 2 | Create VarietyStats component | ~1.5 hours |
| 3 | Integrate stats card into Home screen | ~1 hour |
| 4 | Write unit tests for `calculateVarietyStats()` | ~1 hour |
| 5 | Write Playwright E2E test | ~1 hour |
| 6 | Write Maestro test | ~1 hour |

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Feature 1.2: "New!" Badge](./FEATURE_1.2_NEW_BADGE.md) - Shares utility file
- [Feature 1.3: Variety Color Coding](./FEATURE_1.3_COLOR_CODING.md) - Shares utility file

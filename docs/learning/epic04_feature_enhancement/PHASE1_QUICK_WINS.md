# Phase 1: Quick Wins (Polish)

**Status:** 📋 PLANNED

**Goal:** Low-effort, high-impact improvements with no architectural changes

**Dependencies:** None - can start immediately

---

## Overview

These features add immediate user value without requiring database migrations or architectural changes. They enhance the existing experience with visual feedback, personalization, and tactile polish.

---

## UI Wireframes: Before & After

### Suggestion Card

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
│ 🟢                           [New!] │  ← Color dot + New badge
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │  ← Favorite button
│                                     │
└─────────────────────────────────────┘

Legend:
- 🟢 Green dot = fresh (3+ days)
- 🟡 Yellow dot = recent (1-2 days)
- [New!] = never tried or 7+ days
- ⭐ = tap to favorite (filled when favorited)
```

### History Screen

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

### Home Screen (Stats Card)

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

### Settings Screen (Haptic Toggle)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Meal Settings                      │
│  ├─ Cooldown period: 3 days         │
│  └─ Suggestions count: 4            │
│                                     │
│  Data                               │
│  ├─ Manage Ingredients              │
│  ├─ Manage Categories               │
│  └─ Manage Meal Types               │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│                                     │
│  Meal Settings                      │
│  ├─ Cooldown period: 3 days         │
│  └─ Suggestions count: 4            │
│                                     │
│  Experience                         │  ← NEW section
│  └─ Haptic Feedback        [====○] │  ← Toggle
│                                     │
│  Data                               │
│  ├─ Manage Ingredients              │
│  ├─ Manage Categories               │
│  └─ Manage Meal Types               │
│                                     │
└─────────────────────────────────────┘
```

---

## Features

### 1.1 Favorite Combinations ⭐

**What:** Allow users to mark combinations as favorites for prioritized suggestions.

**User Flow:**
1. User logs a meal (existing flow)
2. After confirmation, show "Add to favorites?" option
3. Or: User can tap ⭐ icon on any suggestion card
4. Favorites appear more frequently in suggestions
5. New "Favorites" section in History tab

**Implementation:**

```sql
-- Add to meal_logs table
ALTER TABLE meal_logs ADD COLUMN is_favorite INTEGER DEFAULT 0;
```

**UI Changes:**
- Add ⭐ icon to suggestion cards (tap to favorite)
- Add ⭐ icon to history items
- Add "Favorites" filter in History screen
- Update suggestion algorithm to weight favorites higher

**Algorithm Update:**
```typescript
// In generateSuggestions()
// Favorites get 2x weight but still respect cooldown
const favoriteBonus = combination.isFavorite ? 20 : 0;
score += favoriteBonus;
```

**Acceptance Criteria:**
- [ ] Can mark/unmark combinations as favorites
- [ ] Favorites appear in suggestions more often
- [ ] Can filter history to show only favorites
- [ ] Favorites still respect cooldown period

---

### 1.2 "New!" Badge 🆕

**What:** Visual indicator on combinations the user hasn't tried recently (or ever).

**Definition:**
- "New!" = combination never logged OR not logged in 7+ days

**Implementation:**

```typescript
// In suggestion generation
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

**UI Changes:**
- Add "New!" badge component (small pill, accent color)
- Display on suggestion cards when `isNew === true`
- Badge positioned top-right of card

**Acceptance Criteria:**
- [ ] Badge appears on never-tried combinations
- [ ] Badge appears on combinations not tried in 7+ days
- [ ] Badge does not appear on recently logged combinations

---

### 1.3 Variety Color Coding 🎨

**What:** Color-coded visual indicators showing recency of each suggestion.

**Color Scheme:**
| Color | Meaning | Days Since Last Logged |
|-------|---------|------------------------|
| 🟢 Green | Fresh choice | 3+ days (or never) |
| 🟡 Yellow | Recent | 1-2 days ago |
| 🔴 Red | Very recent | Today (shouldn't appear normally) |

**Implementation:**

```typescript
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

**UI Changes:**
- Add colored indicator (dot or border) to suggestion cards
- Color applied to left border or corner dot
- Optional: Add to Settings to toggle off

**Acceptance Criteria:**
- [ ] Green indicator for 3+ days ago (or never)
- [ ] Yellow indicator for 1-2 days ago
- [ ] Red indicator for today (edge case)
- [ ] Colors are accessible (not just color, also icon/shape)

---

### 1.4 Variety Stats 📊

**What:** Personalization stats showing user's variety patterns over time.

**Stats to Calculate:**
- Total unique combinations this month
- Most common combination (with count)
- Ingredients used vs total available
- Variety score percentage

**Examples:**
- "You've tried 15 different breakfast combinations this month!"
- "Your most common breakfast is milk + cereals (8 times)"
- "You've used 12 of your 18 ingredients this week"
- "Variety score: 78%"

**Implementation:**

```typescript
interface VarietyStats {
  uniqueCombosThisMonth: number;
  mostCommonCombo: { ingredients: string[]; count: number };
  ingredientsUsedThisWeek: number;
  totalIngredients: number;
  varietyScore: number; // 0-100
}

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

**UI Changes:**
- Add stats card to Home screen (collapsible)
- Or: Add "Stats" section in History tab
- Show key metrics with icons
- Update stats on each meal log

**Acceptance Criteria:**
- [ ] Shows unique combinations count for current month
- [ ] Shows most common combination
- [ ] Shows ingredient usage ratio
- [ ] Shows variety score percentage
- [ ] Stats update after logging a meal

---

### 1.5 Haptic Feedback 📳

**What:** Subtle vibration feedback for key interactions.

**Haptic Mapping:**
| Action | Haptic Type | Expo Haptics Constant |
|--------|-------------|----------------------|
| Select suggestion | Light | `ImpactFeedbackStyle.Light` |
| Confirm meal logged | Success | `NotificationFeedbackType.Success` |
| Generate new ideas | Soft | `ImpactFeedbackStyle.Medium` |
| Add to favorites | Medium | `ImpactFeedbackStyle.Medium` |
| Error/rejection | Error | `NotificationFeedbackType.Error` |

**Implementation:**

```typescript
import * as Haptics from 'expo-haptics';

// Light tap for selection
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Success for confirmation
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Create utility
const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

**Settings Integration:**
- Add "Haptic Feedback" toggle in Settings
- Default: enabled
- Respect system accessibility settings

**Acceptance Criteria:**
- [ ] Haptic feedback on suggestion selection
- [ ] Haptic feedback on meal confirmation
- [ ] Haptic feedback on generate new ideas
- [ ] Haptic feedback on favorite toggle
- [ ] Can be disabled in settings
- [ ] Works on both iOS and Android

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit (101+), Playwright E2E (12), Maestro |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Haptic Feedback | ~1 hour | Add utility, sprinkle in components |
| 4 | Write unit tests for haptics utility | ~30 min | Test haptic function calls |
| 5 | Variety Color Coding | ~2 hours | Suggestion card, utility function |
| 6 | Write unit tests for `getVarietyColor()` | ~30 min | Test all color thresholds |
| 7 | "New!" Badge | ~2 hours | Suggestion card, utility function |
| 8 | Write unit tests for `isNewCombination()` | ~30 min | Test edge cases (never logged, 7+ days) |
| 9 | Favorite Combinations | ~4 hours | DB migration, store, UI components |
| 10 | Write unit tests for favorites | ~1 hour | Test toggle, filter, algorithm boost |
| 11 | Write Playwright E2E tests for favorites | ~1.5 hours | Test mark favorite, filter history |
| 12 | Write Maestro tests for favorites | ~1.5 hours | Mirror Playwright tests for mobile |
| 13 | Variety Stats | ~4 hours | New component, calculation logic |
| 14 | Write unit tests for `calculateVarietyStats()` | ~1 hour | Test all stat calculations |
| 15 | Write Playwright E2E test for stats | ~1 hour | Test stats visible on home screen |
| 16 | Write Maestro test for stats | ~1 hour | Mirror Playwright test for mobile |
| 17 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |
| 18 | Run quality checks and compare | ~30 min | Compare to baseline; create remediation plan if worse |
| 19 | Document learning notes | ~30 min | Capture unexpected errors, workarounds, fixes |

**Total Estimated Effort:** ~24.5 hours (including unit + Playwright + Maestro tests + quality checks)

---

## Testing Strategy

### Unit Tests
- [ ] `isNewCombination()` returns correct boolean
- [ ] `getVarietyColor()` returns correct color
- [ ] `calculateVarietyStats()` returns correct stats
- [ ] Favorite toggle updates state correctly

### E2E Tests
- [ ] Can mark a combination as favorite
- [ ] Favorites appear in filtered history
- [ ] Stats display on home screen
- [ ] Color coding visible on suggestion cards

---

## Deployment Strategy

### Release Type
**Standard Release** - Client-only features, no server dependencies

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Quality baseline comparison completed
- [ ] Manual QA on physical device
- [ ] Version bump in `app.json`

### Build & Release
```bash
# 1. Bump version
npm version patch  # or minor for feature release

# 2. Build preview APK for testing
eas build --platform android --profile preview

# 3. Test on physical devices

# 4. Build production release
eas build --platform android --profile production

# 5. Submit to Play Store (when ready)
eas submit --platform android
```

### Rollback Plan
- Revert to previous APK version via Play Store rollback
- No database migrations to revert (only adds nullable column)

### Post-Deployment
- Monitor OTel error spans for new errors
- Check telemetry for feature adoption (favorites usage, haptic toggles)

---

## Files to Create/Modify

**New Files:**
- `lib/utils/haptics.ts` - Haptic feedback utility
- `lib/utils/variety.ts` - Variety color and stats calculations
- `components/NewBadge.tsx` - "New!" badge component
- `components/VarietyStats.tsx` - Stats display component
- `docs/learning/epic04_feature_enhancement/PHASE1_LEARNING_NOTES.md` - Learning notes

**Modified Files:**
- `lib/database/migrations.ts` - Add `is_favorite` column
- `lib/store/index.ts` - Add favorite actions
- `components/SuggestionCard.tsx` - Add badge, color, favorite icon
- `app/(tabs)/index.tsx` - Add stats card
- `app/(tabs)/history.tsx` - Add favorites filter
- `app/(tabs)/settings.tsx` - Add haptic toggle

---

## Success Criteria

Phase 1 is complete when:
- [ ] All 5 features implemented and working
- [ ] Unit tests pass for new utility functions
- [ ] E2E tests pass for user flows
- [ ] No regressions in existing functionality
- [ ] Features feel polished and integrated

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 1 Learning Notes →](./PHASE1_LEARNING_NOTES.md)**

---

## Reference

See [Potential Enhancements](../../product_info/meals-randomizer-exploration.md#potential-enhancements-post-v1) in the exploration document for original feature descriptions.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Schema design patterns
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Zustand store patterns

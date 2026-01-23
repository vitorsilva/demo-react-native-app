# Phase 3: Enhanced Variety

**Status:** 📋 PLANNED

**Goal:** Smarter variety enforcement at ingredient level, not just combination level

**Dependencies:** Phase 2 helps but not required

---

## Overview

Currently, variety is enforced at the **combination level** - if you had "milk + cereals" yesterday, you won't get that exact combination today. But you might still get "milk + cookies" repeatedly.

This phase adds **ingredient-level** variety tracking:
- Track how often each ingredient is used
- Penalize frequently-used ingredients in suggestions
- Add pairing rules (what goes well together / should be avoided)

---

## Features

### 3.1 Ingredient Frequency Tracking

**What:** Track how often individual ingredients are used, not just combinations.

**Current Behavior:**
- "milk + cereals" yesterday → can't suggest "milk + cereals" today
- But "milk + cookies" is fine, even if milk was used yesterday

**Enhanced Behavior:**
- Track that "milk" was used yesterday
- Penalize suggestions containing "milk" (lower variety score)
- Encourage rotation at ingredient level

**Implementation:**

**Option A: Aggregate from meal_logs (no new table)**

```typescript
function getIngredientFrequency(ingredientId: string, history: MealLog[], days: number): number {
  const cutoff = subDays(new Date(), days);
  const recentMeals = history.filter(log => new Date(log.date) >= cutoff);

  let count = 0;
  for (const meal of recentMeals) {
    if (meal.ingredients.includes(ingredientId)) {
      count++;
    }
  }
  return count;
}
```

**Option B: Separate tracking table (better performance)**

```sql
CREATE TABLE ingredient_usage (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL,
  date TEXT NOT NULL,
  meal_log_id TEXT NOT NULL,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE CASCADE
);

CREATE INDEX idx_ingredient_usage_date ON ingredient_usage(ingredient_id, date);
```

**Recommendation:** Option A for simplicity. Switch to Option B if performance becomes an issue with large history.

---

**Updated Variety Scoring:**

```typescript
function calculateVarietyScore(
  candidateIngredients: string[],
  recentMeals: MealLog[],
  cooldownDays: number
): number {
  let score = 100;

  for (const ingredientId of candidateIngredients) {
    // Check combination-level (existing logic)
    // ... existing code ...

    // NEW: Check ingredient-level frequency
    const frequency = getIngredientFrequency(ingredientId, recentMeals, cooldownDays);

    // Penalize based on frequency
    if (frequency >= 3) score -= 30;      // Used 3+ times in cooldown period
    else if (frequency === 2) score -= 15; // Used twice
    else if (frequency === 1) score -= 5;  // Used once
    // frequency === 0 → no penalty (ingredient rotation!)
  }

  return Math.max(0, score);
}
```

---

### 3.2 Pairing Rules

**What:** Define which ingredients pair well together or should be avoided.

**Rule Types:**

| Type | Description | Example |
|------|-------------|---------|
| **Positive** | These go well together | milk + cereals |
| **Negative** | Avoid combining these | butter + yogurt |
| **Required** | If A, then must have B | (optional, for future) |

**Data Model:**

```sql
CREATE TABLE pairing_rules (
  id TEXT PRIMARY KEY,
  ingredient_a_id TEXT NOT NULL,
  ingredient_b_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,  -- 'positive' | 'negative'
  created_at TEXT NOT NULL,
  FOREIGN KEY (ingredient_a_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_b_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE(ingredient_a_id, ingredient_b_id)  -- One rule per pair
);
```

**Store Actions:**

```typescript
interface PairingRule {
  id: string;
  ingredientAId: string;
  ingredientBId: string;
  ruleType: 'positive' | 'negative';
  createdAt: string;
}

interface StoreActions {
  loadPairingRules: () => Promise<void>;
  addPairingRule: (ingredientAId: string, ingredientBId: string, ruleType: 'positive' | 'negative') => Promise<PairingRule>;
  deletePairingRule: (id: string) => Promise<void>;
  getPairingRulesForIngredient: (ingredientId: string) => PairingRule[];
}
```

---

**Applying Pairing Rules in Suggestions:**

```typescript
function applyPairingRules(
  candidateIngredients: string[],
  pairingRules: PairingRule[]
): { isValid: boolean; score: number } {
  let score = 0;

  // Check all pairs in the candidate
  for (let i = 0; i < candidateIngredients.length; i++) {
    for (let j = i + 1; j < candidateIngredients.length; j++) {
      const a = candidateIngredients[i];
      const b = candidateIngredients[j];

      const rule = pairingRules.find(r =>
        (r.ingredientAId === a && r.ingredientBId === b) ||
        (r.ingredientAId === b && r.ingredientBId === a)
      );

      if (rule) {
        if (rule.ruleType === 'negative') {
          return { isValid: false, score: -100 };  // Filter out
        }
        if (rule.ruleType === 'positive') {
          score += 10;  // Bonus for good pairing
        }
      }
    }
  }

  return { isValid: true, score };
}
```

---

### 3.3 Pairing Rules UI

**Where:** New section in Settings or dedicated "Pairing Rules" screen

**UI Flow:**
1. User navigates to "Pairing Rules" in Settings
2. Sees list of existing rules
3. Taps "Add Rule"
4. Selects two ingredients
5. Chooses rule type (pairs well / avoid together)
6. Saves rule

**Learning from History (Optional Enhancement):**
- Track which suggestions user rejects
- After N rejections of same combo, suggest "Add as negative pairing?"
- After N selections of same combo, suggest "Add as positive pairing?"

---

### 3.4 Updated Suggestion Algorithm

**Full Algorithm with All Enhancements:**

```typescript
function generateSuggestions(
  mealType: string,
  count: number,
  ingredients: Ingredient[],
  history: MealLog[],
  favorites: MealLog[],
  pairingRules: PairingRule[],
  cooldownDays: number
): Suggestion[] {
  const candidates: Suggestion[] = [];

  // Generate many candidates
  for (let i = 0; i < count * 10; i++) {
    const combo = generateRandomCombination(ingredients, 1, 3);

    // Apply pairing rules (filter invalid)
    const pairingResult = applyPairingRules(combo, pairingRules);
    if (!pairingResult.isValid) continue;

    // Calculate variety score
    let score = calculateVarietyScore(combo, history, cooldownDays);

    // Add pairing bonus
    score += pairingResult.score;

    // Add favorite bonus
    const isFavorite = favorites.some(f =>
      f.ingredients.sort().join(',') === combo.sort().join(',')
    );
    if (isFavorite) score += 20;

    // Add "new" bonus
    const isNew = isNewCombination(combo, history);
    if (isNew) score += 10;

    candidates.push({
      ingredients: combo,
      score,
      isFavorite,
      isNew,
      varietyColor: getVarietyColor(combo, history),
    });
  }

  // Sort by score (highest first)
  candidates.sort((a, b) => b.score - a.score);

  // Return top N
  return candidates.slice(0, count);
}
```

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Add ingredient frequency calculation | ~2 hours | Utility function |
| 2 | Update variety scoring with frequency | ~2 hours | Algorithm update |
| 3 | Add pairing_rules table | ~1 hour | Migration |
| 4 | Add pairing rules store actions | ~2 hours | Store |
| 5 | Add pairing rules to suggestion algorithm | ~2 hours | Algorithm |
| 6 | Create Pairing Rules UI | ~4 hours | New screen |
| 7 | Update suggestion generation | ~2 hours | Integration |

**Total Estimated Effort:** ~15 hours

---

## Testing Strategy

### Unit Tests
- [ ] `getIngredientFrequency()` returns correct count
- [ ] Variety score penalizes frequent ingredients
- [ ] `applyPairingRules()` filters negative pairs
- [ ] `applyPairingRules()` boosts positive pairs
- [ ] Full algorithm respects all factors

### E2E Tests
- [ ] Suggestions avoid frequently-used ingredients
- [ ] Can add positive pairing rule
- [ ] Can add negative pairing rule
- [ ] Negative pairs don't appear in suggestions
- [ ] Can delete pairing rules

---

## Files to Create/Modify

**New Files:**
- `app/(tabs)/pairing-rules.tsx` - Pairing rules management screen
- `components/PairingRuleItem.tsx` - List item component
- `components/AddPairingRuleModal.tsx` - Modal for adding rules

**Modified Files:**
- `lib/database/migrations.ts` - Add pairing_rules table
- `lib/database/operations.ts` - Pairing rules queries
- `lib/store/index.ts` - Pairing rules state and actions
- `lib/business-logic/suggestionGenerator.ts` - Enhanced algorithm
- `lib/business-logic/varietyEngine.ts` - Ingredient frequency
- `types/index.ts` - PairingRule type
- `app/(tabs)/settings.tsx` - Link to pairing rules

---

## Success Criteria

Phase 3 is complete when:
- [ ] Suggestions penalize frequently-used ingredients
- [ ] Users can add positive pairing rules
- [ ] Users can add negative pairing rules
- [ ] Negative pairs are filtered from suggestions
- [ ] Positive pairs get score bonus
- [ ] All tests pass

---

## Reference

See [Potential Enhancements - Ingredient Frequency Tracking](../../product_info/meals-randomizer-exploration.md#6-ingredient-frequency-tracking) and [Pairing Rules](../../product_info/meals-randomizer-exploration.md#7-pairing-rules) in the exploration document.

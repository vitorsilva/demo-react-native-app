# Phase 9: Lunch/Dinner Expansion

**Status:** 📋 PLANNED

**Goal:** Expand beyond breakfast/snacks to full meal planning

**Dependencies:** Phase 2 (Data Model), Phase 3 (Enhanced Variety)

---

## Overview

This phase extends SaborSpin to handle lunch and dinner:
1. Different variety rules per meal type
2. More complex meal structures (main + sides)
3. Building-block rotation (pasta → rice → potato)
4. Meal type-specific ingredient filtering

With the data model evolution (Phase 2), we can now handle:
- Preparation methods (fried chicken, roasted potatoes)
- Named meals ("Mom's chicken")
- Component-level tracking

---

## UI Wireframes: Before & After

### Suggestion Card (Main + Sides)

**BEFORE (simple ingredient list):**
```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │
│                                     │
│  milk + cereals + bread             │
│                                     │
│         [Select]    [⭐]            │
└─────────────────────────────────────┘
```

**AFTER (structured for lunch/dinner):**
```
┌─────────────────────────────────────┐
│ 🟢 Dinner                    [New!] │
├─────────────────────────────────────┤
│                                     │
│  Main                               │
│  ┌─────────────────────────────────┐│
│  │ 🍗 grilled chicken breast       ││
│  └─────────────────────────────────┘│
│                                     │
│  Sides                              │
│  ┌─────────────────────────────────┐│
│  │ 🥔 roasted potatoes             ││
│  │ 🥦 steamed broccoli             ││
│  └─────────────────────────────────┘│
│                                     │
│         [Select]    [⭐]            │
└─────────────────────────────────────┘

Note: Breakfast/snacks keep the simple
flat format. Main+sides only for lunch/dinner.
```

### Home Screen (Meal Type Selection)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  SaborSpin                          │
├─────────────────────────────────────┤
│                                     │
│  What are you having?               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🍳 Breakfast                    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🍪 Snack                        ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  SaborSpin                          │
├─────────────────────────────────────┤
│                                     │
│  What are you having?               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🍳 Breakfast                    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🥗 Lunch                        ││  ← NEW
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🍽️ Dinner                       ││  ← NEW
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🍪 Snack                        ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Meal Type Configuration

**BEFORE:**
```
┌─────────────────────────────────────┐
│  ← Meal Type Settings               │
├─────────────────────────────────────┤
│                                     │
│  Breakfast                          │
│  ┌─────────────────────────────────┐│
│  │ Cooldown: 3 days            [→] ││
│  │ Max ingredients: 3          [→] ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  ← Meal Type Settings               │
├─────────────────────────────────────┤
│                                     │
│  Dinner                             │
│  ┌─────────────────────────────────┐│
│  │ Cooldown: 7 days            [→] ││
│  │ Max ingredients: 5          [→] ││
│  │ ─────────────────────────────── ││
│  │ Rotation Settings               ││  ← NEW section
│  │ ─────────────────────────────── ││
│  │ Base rotation          [====○] ││  ← pasta/rice/potato
│  │ Protein rotation       [====○] ││  ← chicken/beef/fish
│  └─────────────────────────────────┘│
│                                     │
│  (Rotation ensures you don't have   │
│   pasta 3 days in a row)            │
│                                     │
└─────────────────────────────────────┘
```

### Ingredient Management (New Filters)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Manage Ingredients                 │
├─────────────────────────────────────┤
│  [All] [Dairy] [Cereals] [Fruit]    │
├─────────────────────────────────────┤
│                                     │
│  • milk                             │
│  • yogurt                           │
│  • cheese                           │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Manage Ingredients                 │
├─────────────────────────────────────┤
│  Meal Type: [All ▼]                 │  ← NEW filter
│  Category:  [All ▼]                 │
├─────────────────────────────────────┤
│                                     │
│  Proteins                           │  ← NEW category
│  ┌─────────────────────────────────┐│
│  │ 🍗 chicken breast    [Poultry]  ││
│  │ 🥩 beef steak        [Beef]     ││
│  │ 🐟 salmon fillet     [Fish]     ││
│  └─────────────────────────────────┘│
│                                     │
│  Carbs/Bases                        │  ← NEW category
│  ┌─────────────────────────────────┐│
│  │ 🍝 spaghetti         [Pasta]    ││
│  │ 🍚 white rice        [Rice]     ││
│  │ 🥔 potatoes          [Potato]   ││
│  └─────────────────────────────────┘│
│                                     │
│  Vegetables                         │  ← NEW category
│  ┌─────────────────────────────────┐│
│  │ 🥦 broccoli                     ││
│  │ 🥕 carrots                      ││
│  │ 🥬 spinach                      ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Add/Edit Ingredient (New Fields)

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Add Ingredient                     │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  ┌─────────────────────────────────┐│
│  │ chicken breast                  ││
│  └─────────────────────────────────┘│
│                                     │
│  Category                           │
│  ┌─────────────────────────────────┐│
│  │ Protein                     [▼] ││
│  └─────────────────────────────────┘│
│                                     │
│  [Cancel]              [Save]       │
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Add Ingredient                     │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  ┌─────────────────────────────────┐│
│  │ chicken breast                  ││
│  └─────────────────────────────────┘│
│                                     │
│  Category                           │
│  ┌─────────────────────────────────┐│
│  │ Protein                     [▼] ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│  Rotation Settings (optional)       │  ← NEW section
│  ─────────────────────────────────  │
│                                     │
│  Is protein source?         [====○]│
│  ┌─────────────────────────────────┐│
│  │ Protein type: Poultry       [▼] ││  ← Shown if protein
│  └─────────────────────────────────┘│
│                                     │
│  Is base ingredient?        [○====]│
│  (carb that provides meal base)     │
│                                     │
│  [Cancel]              [Save]       │
│                                     │
└─────────────────────────────────────┘
```

### Meal Logging (Main + Sides Selection)

**NEW FOR LUNCH/DINNER:**
```
┌─────────────────────────────────────┐
│  Log Dinner                         │
├─────────────────────────────────────┤
│                                     │
│  Name this meal (optional):         │
│  ┌─────────────────────────────────┐│
│  │ e.g., "Sunday roast"            ││
│  └─────────────────────────────────┘│
│                                     │
│  Main (select 1):                   │  ← NEW role selector
│  ┌─────────────────────────────────┐│
│  │ 🍗 grilled chicken breast   [●] ││  ← Selected as main
│  └─────────────────────────────────┘│
│                                     │
│  Sides (select 1-3):                │  ← NEW role selector
│  ┌─────────────────────────────────┐│
│  │ 🥔 roasted potatoes         [●] ││
│  │ 🥦 steamed broccoli         [●] ││
│  └─────────────────────────────────┘│
│                                     │
│  [+ Add Side]                       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### History Display (Main + Sides)

**BEFORE:**
```
┌─────────────────────────────────────┐
│ milk + cereals + bread              │
│ Breakfast • 8:30 AM                 │
└─────────────────────────────────────┘
```

**AFTER (for lunch/dinner):**
```
┌─────────────────────────────────────┐
│ "Sunday roast"                      │
│ ─────────────────────────────────── │
│ Main: grilled chicken breast        │
│ Sides: roasted potatoes, broccoli   │
│ ─────────────────────────────────── │
│ Dinner • 7:00 PM                    │
└─────────────────────────────────────┘

OR (unnamed meal):

┌─────────────────────────────────────┐
│ Main: grilled chicken breast        │
│ Sides: roasted potatoes, broccoli   │
│ Dinner • 7:00 PM                    │
└─────────────────────────────────────┘

Note: Breakfast/snacks keep flat format.
```

### Variety Warning (Rotation)

**NEW:**
```
┌─────────────────────────────────────┐
│ 🟡 Dinner                           │
├─────────────────────────────────────┤
│                                     │
│  Main                               │
│  ┌─────────────────────────────────┐│
│  │ 🍗 grilled chicken breast       ││
│  │ ⚠️ Poultry 2x this week         ││  ← Protein rotation warning
│  └─────────────────────────────────┘│
│                                     │
│  Sides                              │
│  ┌─────────────────────────────────┐│
│  │ 🍝 spaghetti                    ││
│  │ ⚠️ Pasta 3 days in a row        ││  ← Base rotation warning
│  │ 🥕 steamed carrots              ││
│  └─────────────────────────────────┘│
│                                     │
│         [Select]    [⭐]            │
└─────────────────────────────────────┘

Note: Warnings help user understand why
variety score is lower (yellow instead of green).
```

---

## Features

### 9.1 Meal Type-Specific Variety Rules

**Current (breakfast/snacks):**
- Same cooldown for all meal types
- Simple combination tracking

**Lunch/Dinner Needs:**
- Different cooldown periods per meal type
- Building-block rotation (base ingredients)
- Protein rotation (chicken → beef → fish → pork)

**Configuration:**

```typescript
interface MealTypeConfig {
  id: string;
  name: string;
  cooldownDays: number;
  baseIngredientRotation: boolean;  // Enable pasta/rice/potato rotation
  proteinRotation: boolean;          // Enable protein rotation
  maxIngredientsPerMeal: number;
}

// Example configurations
const mealTypeConfigs: MealTypeConfig[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    cooldownDays: 3,
    baseIngredientRotation: false,
    proteinRotation: false,
    maxIngredientsPerMeal: 3,
  },
  {
    id: 'lunch',
    name: 'Lunch',
    cooldownDays: 5,
    baseIngredientRotation: true,
    proteinRotation: true,
    maxIngredientsPerMeal: 4,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    cooldownDays: 7,
    baseIngredientRotation: true,
    proteinRotation: true,
    maxIngredientsPerMeal: 5,
  },
];
```

---

### 9.2 Building-Block Rotation

**Concept:** For lunch/dinner, rotate base carbohydrates to ensure variety.

**Base Ingredient Categories:**

| Category | Examples |
|----------|----------|
| Pasta | spaghetti, penne, fusilli, lasagna |
| Rice | white rice, brown rice, basmati, risotto |
| Potato | roasted, mashed, baked, fries |
| Bread | as side, as base (sandwiches) |
| Other | couscous, quinoa, bulgur |

**Rotation Logic:**

```typescript
function getBaseIngredientPenalty(
  ingredientId: string,
  history: MealLog[],
  mealType: string
): number {
  const ingredient = getIngredient(ingredientId);
  if (!ingredient.isBaseIngredient) return 0;

  const baseCategory = ingredient.baseCategory;  // 'pasta', 'rice', 'potato'

  // Check recent history for same base category
  const recentBaseMeals = history.filter(log => {
    if (log.mealTypeId !== mealType) return false;
    return log.components.some(comp => {
      const ing = getIngredient(comp.ingredientId);
      return ing.baseCategory === baseCategory;
    });
  });

  // Penalize if same base category used recently
  if (recentBaseMeals.length >= 2) return -40;  // Heavy penalty
  if (recentBaseMeals.length === 1) return -20; // Medium penalty
  return 0;
}
```

**Data Model Addition:**

```sql
ALTER TABLE ingredients ADD COLUMN is_base_ingredient INTEGER DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN base_category TEXT;  -- 'pasta', 'rice', 'potato', etc.
```

---

### 9.3 Protein Rotation

**Concept:** Rotate protein sources for variety and nutrition balance.

**Protein Categories:**

| Category | Examples |
|----------|----------|
| Poultry | chicken breast, chicken thigh, turkey |
| Beef | steak, ground beef, roast |
| Pork | pork chop, bacon, ham |
| Fish | salmon, cod, tuna |
| Seafood | shrimp, mussels, squid |
| Vegetarian | tofu, tempeh, legumes |

**Rotation Logic:**

```typescript
function getProteinPenalty(
  ingredientId: string,
  history: MealLog[],
  mealType: string
): number {
  const ingredient = getIngredient(ingredientId);
  if (!ingredient.isProtein) return 0;

  const proteinCategory = ingredient.proteinCategory;  // 'poultry', 'beef', etc.

  // Check recent history for same protein category
  const recentProteinMeals = history.filter(log => {
    if (log.mealTypeId !== mealType) return false;
    return log.components.some(comp => {
      const ing = getIngredient(comp.ingredientId);
      return ing.proteinCategory === proteinCategory;
    });
  });

  // Penalize if same protein category used recently
  const daysSinceLastUse = getDaysSinceLastUse(proteinCategory, history);

  if (daysSinceLastUse === 0) return -50;      // Same day = heavy penalty
  if (daysSinceLastUse === 1) return -30;      // Yesterday
  if (daysSinceLastUse === 2) return -15;      // 2 days ago
  return 0;                                     // 3+ days = no penalty
}
```

**Data Model Addition:**

```sql
ALTER TABLE ingredients ADD COLUMN is_protein INTEGER DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN protein_category TEXT;  -- 'poultry', 'beef', 'pork', etc.
```

---

### 9.4 Meal Structure: Main + Sides

**Lunch/Dinner Meal Structure:**

```
┌─────────────────────────────────────┐
│  Meal: Dinner                       │
├─────────────────────────────────────┤
│                                     │
│  Main:                              │
│  • grilled chicken breast           │
│                                     │
│  Sides:                             │
│  • roasted potatoes                 │
│  • steamed broccoli                 │
│                                     │
│  (Optional) Sauce/Seasoning:        │
│  • garlic herb butter               │
│                                     │
└─────────────────────────────────────┘
```

**Data Model:**

```typescript
interface MealComponent {
  id: string;
  mealLogId: string;
  ingredientId: string;
  preparationMethodId: string | null;
  role: 'main' | 'side' | 'sauce' | null;  // NEW
  createdAt: string;
}
```

**Suggestion Generation:**

```typescript
interface MealSuggestion {
  main: MealComponent[];      // Usually 1 protein
  sides: MealComponent[];     // 1-3 sides
  sauce?: MealComponent;      // Optional
  name?: string;              // Optional meal name
}

function generateLunchDinnerSuggestion(
  mealType: 'lunch' | 'dinner',
  ingredients: Ingredient[],
  history: MealLog[]
): MealSuggestion {
  // 1. Select main (protein)
  const proteins = ingredients.filter(i => i.isProtein);
  const mainProtein = selectWithRotation(proteins, history, 'protein');
  const mainPrep = selectPreparationMethod(mainProtein);

  // 2. Select base side (carb)
  const bases = ingredients.filter(i => i.isBaseIngredient);
  const baseSide = selectWithRotation(bases, history, 'base');
  const basePrep = selectPreparationMethod(baseSide);

  // 3. Select vegetable side
  const vegetables = ingredients.filter(i => i.category === 'vegetable');
  const vegSide = selectWithVariety(vegetables, history);
  const vegPrep = selectPreparationMethod(vegSide);

  return {
    main: [{ ingredientId: mainProtein.id, preparationMethodId: mainPrep.id, role: 'main' }],
    sides: [
      { ingredientId: baseSide.id, preparationMethodId: basePrep.id, role: 'side' },
      { ingredientId: vegSide.id, preparationMethodId: vegPrep.id, role: 'side' },
    ],
  };
}
```

---

### 9.5 Ingredient Category Expansion

**New Categories for Lunch/Dinner:**

| Category | Examples |
|----------|----------|
| Proteins | chicken, beef, pork, fish, tofu |
| Vegetables | broccoli, carrots, spinach, tomatoes |
| Carbs/Bases | pasta, rice, potatoes, bread |
| Sauces | tomato sauce, cream sauce, gravy |
| Seasonings | garlic, herbs, spices |
| Legumes | beans, lentils, chickpeas |

**Updated Category Type:**

```typescript
type IngredientCategory =
  | 'protein'    // milk, yogurt, cheese (breakfast) + meat, fish (lunch/dinner)
  | 'carb'       // cereals, bread (breakfast) + pasta, rice, potato (lunch/dinner)
  | 'vegetable'  // NEW
  | 'fruit'
  | 'sweet'      // jam, cookies (breakfast)
  | 'sauce'      // NEW
  | 'seasoning'; // NEW
```

---

### 9.6 UI Updates

**Suggestion Card (Lunch/Dinner):**

```
┌─────────────────────────────────────┐
│  🍽️ Dinner Suggestion               │
├─────────────────────────────────────┤
│                                     │
│  Main                               │
│  🍗 grilled chicken breast          │
│                                     │
│  Sides                              │
│  🥔 roasted potatoes                │
│  🥦 steamed broccoli                │
│                                     │
│  ┌─────────┐ ┌─────────┐            │
│  │ Select  │ │ Propose │            │
│  └─────────┘ └─────────┘            │
│                                     │
└─────────────────────────────────────┘
```

**Ingredient Management:**

Add filters for:
- Show/hide by meal type
- Filter by category
- Filter by base/protein status

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~15 min | Baseline: unit, Playwright E2E, Maestro |
| 2 | Run quality baseline | ~30 min | test:mutation, arch:test, lint:dead-code, lint:duplicates, security:scan |
| 3 | Add ingredient classification columns | ~2 hours | Migration |
| 4 | Write unit tests for migration | ~30 min | Test column additions |
| 5 | Classify existing ingredients | ~2 hours | Data work |
| 6 | Update meal type configuration | ~2 hours | Settings |
| 7 | Write unit tests for meal type config | ~30 min | Test rotation toggles |
| 8 | Implement building-block rotation | ~4 hours | Algorithm |
| 9 | Write unit tests for `getBaseIngredientPenalty()` | ~1.5 hours | Test rotation penalties |
| 10 | Implement protein rotation | ~4 hours | Algorithm |
| 11 | Write unit tests for `getProteinPenalty()` | ~1.5 hours | Test category rotation |
| 12 | Add component roles (main/side) | ~2 hours | Migration |
| 13 | Write unit tests for role assignment | ~30 min | Test main/side classification |
| 14 | Update suggestion generator | ~6 hours | Major rewrite |
| 15 | Write unit tests for `generateLunchDinnerSuggestion()` | ~2 hours | Test main + sides structure |
| 16 | Update suggestion card UI | ~4 hours | New layout |
| 17 | Write Playwright E2E test for lunch/dinner suggestions | ~2 hours | Test main + sides display |
| 18 | Write Maestro test for lunch/dinner suggestions | ~2 hours | Mirror Playwright test for mobile |
| 19 | Add lunch/dinner ingredients | ~2 hours | Seed data |
| 20 | Update ingredient management | ~3 hours | Filters, categories |
| 21 | Write Playwright E2E test for ingredient classification UI | ~1.5 hours | Test protein/base filters |
| 22 | Write Maestro test for ingredient classification UI | ~1.5 hours | Mirror Playwright test for mobile |
| 23 | Write Playwright E2E test for full lunch/dinner flow | ~2 hours | Test select → log → history |
| 24 | Write Maestro test for full lunch/dinner flow | ~2 hours | Mirror Playwright test for mobile |
| 25 | Run full test suites | ~20 min | Unit + Playwright + Maestro, verify no regressions |
| 26 | Run quality checks and compare | ~30 min | Compare to baseline; create remediation plan if worse |

**Total Estimated Effort:** ~55 hours (including unit + Playwright + Maestro tests + quality checks)

---

## Testing Strategy

### Unit Tests
- [ ] Building-block rotation penalty calculation
- [ ] Protein rotation penalty calculation
- [ ] Meal structure generation (main + sides)
- [ ] Variety scoring with rotations

### E2E Tests
- [ ] Can create lunch with main + sides
- [ ] Can create dinner with main + sides
- [ ] Suggestions respect protein rotation
- [ ] Suggestions respect base rotation
- [ ] Named meals work for lunch/dinner

---

## Files to Create/Modify

**Modified Files:**
- `lib/database/migrations.ts` - New columns
- `lib/database/seed.ts` - Lunch/dinner ingredients
- `lib/business-logic/suggestionGenerator.ts` - New algorithm
- `lib/business-logic/varietyEngine.ts` - Rotation logic
- `lib/store/index.ts` - Meal type config
- `types/index.ts` - Updated types
- `components/SuggestionCard.tsx` - Main + sides layout
- `app/(tabs)/settings.tsx` - Meal type configuration
- `app/(tabs)/manage-ingredients.tsx` - Category filters

---

## Success Criteria

Phase 9 is complete when:
- [ ] Can generate lunch suggestions with main + sides
- [ ] Can generate dinner suggestions with main + sides
- [ ] Building-block rotation works (pasta → rice → potato)
- [ ] Protein rotation works (chicken → beef → fish)
- [ ] Different cooldown periods per meal type
- [ ] Named meals work for lunch/dinner
- [ ] All tests pass

---

## Reference

See [Data Model Evolution](../../product_info/meals-randomizer-exploration.md#data-model-evolution-from-ingredients-to-meals) for the flexible meals design that enables this phase.

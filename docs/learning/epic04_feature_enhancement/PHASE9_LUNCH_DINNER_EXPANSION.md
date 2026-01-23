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
| 1 | Add ingredient classification columns | ~2 hours | Migration |
| 2 | Classify existing ingredients | ~2 hours | Data work |
| 3 | Update meal type configuration | ~2 hours | Settings |
| 4 | Implement building-block rotation | ~4 hours | Algorithm |
| 5 | Implement protein rotation | ~4 hours | Algorithm |
| 6 | Add component roles (main/side) | ~2 hours | Migration |
| 7 | Update suggestion generator | ~6 hours | Major rewrite |
| 8 | Update suggestion card UI | ~4 hours | New layout |
| 9 | Add lunch/dinner ingredients | ~2 hours | Seed data |
| 10 | Update ingredient management | ~3 hours | Filters, categories |
| 11 | Testing and refinement | ~4 hours | E2E tests |

**Total Estimated Effort:** ~35 hours

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

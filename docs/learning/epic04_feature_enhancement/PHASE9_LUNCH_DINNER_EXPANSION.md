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

> **Note:** See the [Database Migration Pattern](#database-migration-pattern) section below for implementation details.

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

### Database Migration Pattern

This project uses a **versioned migration system** in `lib/database/migrations.ts`. Each migration has a version number and an idempotent `up` function.

**Add migration for lunch/dinner ingredient columns:**

```typescript
// In lib/database/migrations.ts - add to migrations array
// Version number depends on which phases are implemented first

{
  version: 11,  // Adjust based on current version
  up: async (db: DatabaseAdapter) => {
    // 1. Add base ingredient columns (idempotent)
    if (!(await columnExists(db, 'ingredients', 'is_base_ingredient'))) {
      await db.runAsync(`ALTER TABLE ingredients ADD COLUMN is_base_ingredient INTEGER DEFAULT 0`);
    }
    if (!(await columnExists(db, 'ingredients', 'base_category'))) {
      await db.runAsync(`ALTER TABLE ingredients ADD COLUMN base_category TEXT`);
    }

    // 2. Add protein columns (idempotent)
    if (!(await columnExists(db, 'ingredients', 'is_protein'))) {
      await db.runAsync(`ALTER TABLE ingredients ADD COLUMN is_protein INTEGER DEFAULT 0`);
    }
    if (!(await columnExists(db, 'ingredients', 'protein_category'))) {
      await db.runAsync(`ALTER TABLE ingredients ADD COLUMN protein_category TEXT`);
    }
  },
}
```

**How the migration system works:**
1. `migrations` table tracks applied versions
2. `runMigrations(db)` runs on app startup
3. Only migrations with `version > currentVersion` are executed
4. `columnExists()` helper ensures idempotency
5. Each migration is recorded after success

**Why this is safe:**
- New columns have `DEFAULT 0` or allow NULL
- `columnExists()` check prevents errors if migration runs twice
- No data loss - purely additive changes
- Existing ingredients continue to work without these columns set

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

| Order | Task | Type | Effort | Notes |
|-------|------|------|--------|-------|
| 1 | ▶️ RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright E2E, Maestro | not started |
| 2 | ▶️ RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | not started |
| 3 | Add ingredient classification columns | Implementation | ~2 hours | Migration | not started |
| 4 | 🧪 CREATE unit tests for migration | Testing | ~30 min | Test column additions | not started |
| 5 | Classify existing ingredients | Implementation | ~2 hours | Data work | not started |
| 6 | Update meal type configuration | Implementation | ~2 hours | Settings | not started |
| 7 | 🧪 CREATE unit tests for meal type config | Testing | ~30 min | Test rotation toggles | not started |
| 8 | Implement building-block rotation | Implementation | ~4 hours | Algorithm | not started |
| 9 | 🧪 CREATE unit tests for `getBaseIngredientPenalty()` | Testing | ~1.5 hours | Test rotation penalties | not started |
| 10 | Implement protein rotation | Implementation | ~4 hours | Algorithm | not started |
| 11 | 🧪 CREATE unit tests for `getProteinPenalty()` | Testing | ~1.5 hours | Test category rotation | not started |
| 12 | Add component roles (main/side) | Implementation | ~2 hours | Migration | not started |
| 13 | 🧪 CREATE unit tests for role assignment | Testing | ~30 min | Test main/side classification | not started |
| 14 | Update suggestion generator | Implementation | ~6 hours | Major rewrite | not started |
| 15 | 🧪 CREATE unit tests for `generateLunchDinnerSuggestion()` | Testing | ~2 hours | Test main + sides structure | not started |
| 16 | Update suggestion card UI | Implementation | ~4 hours | New layout | not started |
| 17 | 🧪 CREATE Playwright E2E test for lunch/dinner suggestions | Testing | ~2 hours | Test main + sides display | not started |
| 18 | 🧪 CREATE Maestro test for lunch/dinner suggestions | Testing | ~2 hours | Mirror Playwright test for mobile | not started |
| 19 | Add lunch/dinner ingredients | Implementation | ~2 hours | Seed data | not started |
| 20 | Update ingredient management | Implementation | ~3 hours | Filters, categories | not started |
| 21 | 🧪 CREATE Playwright E2E test for ingredient classification UI | Testing | ~1.5 hours | Test protein/base filters | not started |
| 22 | 🧪 CREATE Maestro test for ingredient classification UI | Testing | ~1.5 hours | Mirror Playwright test for mobile | not started |
| 23 | 🧪 CREATE Playwright E2E test for full lunch/dinner flow | Testing | ~2 hours | Test select → log → history | not started |
| 24 | 🧪 CREATE Maestro test for full lunch/dinner flow | Testing | ~2 hours | Mirror Playwright test for mobile | not started |
| 25 | ▶️ RUN full test suites | Testing | ~20 min | Unit + Playwright + Maestro, verify no regressions | not started |
| 26 | ▶️ RUN quality checks and compare | Quality | ~30 min | Compare to baseline; create remediation plan if worse | not started |
| 27 | Document learning notes | Documentation | ~30 min | Capture unexpected errors, workarounds, fixes | not started |
| 28 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |

**Total Estimated Effort:** ~55.5 hours (including unit + Playwright + Maestro tests + quality checks)

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] Building-block rotation penalty calculation
- [ ] Protein rotation penalty calculation
- [ ] Meal structure generation (main + sides)
- [ ] Variety scoring with rotations

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Can create lunch with main + sides
- [ ] Can create dinner with main + sides
- [ ] Suggestions respect protein rotation
- [ ] Suggestions respect base rotation
- [ ] Named meals work for lunch/dinner

### Mobile E2E Tests - Maestro (🧪 CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (▶️ RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions
- Existing breakfast/snack tests must still pass

---

## Deployment Strategy

### Release Type
**Major Feature Release** - Expands app from breakfast/snacks to full meal planning

### Prerequisites
- Phase 2 (Data Model) deployed for flexible meals
- Phase 3 (Enhanced Variety) deployed for rotation logic

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Lunch/dinner suggestions tested
- [ ] Main + sides structure tested
- [ ] Base rotation (pasta/rice/potato) tested
- [ ] Existing breakfast/snack functionality unaffected
- [ ] Quality baseline comparison completed
- [ ] Manual QA on physical device
- [ ] Version bump in `app.json`

### Build & Release
```bash
# 1. Bump version (minor - major feature expansion)
npm version minor

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Test scenarios:
#    - Generate lunch suggestions
#    - Generate dinner suggestions
#    - Main + 2 sides structure
#    - Base rotation across days
#    - Named meals for lunch/dinner
#    - Breakfast/snack still works

# 4. Build production release
eas build --platform android --profile production

# 5. Submit to Play Store
eas submit --platform android
```

### Migration
```typescript
// New meal types added to seed data
// Users can enable/disable meal types in settings
// Default: breakfast + snack enabled, lunch/dinner available
```

### Rollback Plan
- Revert to previous APK
- Lunch/dinner data in new columns, ignored by older version
- Breakfast/snack functionality unaffected

### Post-Deployment
- Monitor lunch/dinner feature adoption
- Track meal type configuration changes
- Check variety scores for new meal types
- Monitor suggestion generation performance

---

## Files to Create/Modify

**New Files:**
- `docs/learning/epic04_feature_enhancement/PHASE9_LEARNING_NOTES.md` - Learning notes

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

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 9 Learning Notes →](./PHASE9_LEARNING_NOTES.md)**

---

## Reference

See [Data Model Evolution](../../product_info/meals-randomizer-exploration.md#data-model-evolution-from-ingredients-to-meals) for the flexible meals design that enables this phase.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Meal type extensions
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Meal type state patterns

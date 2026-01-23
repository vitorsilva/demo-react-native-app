# Phase 2: Data Model Evolution

**Status:** 📋 PLANNED

**Goal:** Evolve data model to support preparation methods and named meals (Approach C: Flexible Meals)

**Dependencies:** None

---

## Overview

Currently, meals are simple ingredient combinations (`milk + bread + jam`). To support lunch/dinner and named meals like "Mom's chicken", we need to evolve the data model to:

1. Add preparation methods (fried, grilled, roasted, etc.)
2. Support optional meal naming
3. Track at component level (ingredient + preparation)

This follows **Approach C: Flexible Meals** from the exploration document.

---

## UI Wireframes: Before & After

### Meal Logging Flow

**BEFORE:**
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Your selection:                    │
│                                     │
│  • milk                             │
│  • bread                            │
│  • jam                              │
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│  Log Breakfast                      │
├─────────────────────────────────────┤
│                                     │
│  Name this meal (optional):         │  ← NEW
│  ┌─────────────────────────────────┐│
│  │ e.g., "Mom's special"           ││
│  └─────────────────────────────────┘│
│                                     │
│  Your selection:                    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ milk                    [None ▼]││  ← Prep method selector
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ bread               [Toasted ▼]││  ← Prep method selector
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ jam                     [None ▼]││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │         Confirm Meal            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Preparation Method Picker (Modal)

**NEW COMPONENT:**
```
┌─────────────────────────────────────┐
│  Preparation for "bread"            │
├─────────────────────────────────────┤
│                                     │
│  ○ None (as is)                     │
│  ○ Toasted                          │
│  ● Grilled                          │  ← Selected
│  ○ Fried                            │
│  ○ Baked                            │
│  ○ Steamed                          │
│  ─────────────────────────────────  │
│  ○ + Add custom...                  │  ← User can add
│                                     │
│  [Cancel]              [Apply]      │
│                                     │
└─────────────────────────────────────┘
```

### History Item Display

**BEFORE:**
```
┌─────────────────────────────────────┐
│ milk + bread + jam                  │
│ Breakfast • 8:30 AM                 │
└─────────────────────────────────────┘
```

**AFTER:**
```
┌─────────────────────────────────────┐
│ "Mom's special"                     │  ← Named meal shown first
│ milk + toasted bread + jam          │  ← Prep methods inline
│ Breakfast • 8:30 AM                 │
└─────────────────────────────────────┘

OR (unnamed meal):

┌─────────────────────────────────────┐
│ milk + toasted bread + jam          │  ← No name, show components
│ Breakfast • 8:30 AM                 │
└─────────────────────────────────────┘
```

### Settings: Manage Preparation Methods

**NEW SCREEN:**
```
┌─────────────────────────────────────┐
│  ← Preparation Methods              │
├─────────────────────────────────────┤
│                                     │
│  System (cannot delete):            │
│  ┌─────────────────────────────────┐│
│  │ fried                           ││
│  │ grilled                         ││
│  │ roasted                         ││
│  │ boiled                          ││
│  │ baked                           ││
│  │ raw                             ││
│  │ steamed                         ││
│  │ sautéed                         ││
│  │ ...                             ││
│  └─────────────────────────────────┘│
│                                     │
│  Custom:                            │
│  ┌─────────────────────────────────┐│
│  │ air-fried              [Delete] ││  ← User-added
│  │ smashed                [Delete] ││
│  └─────────────────────────────────┘│
│                                     │
│  [+ Add Custom Method]              │
│                                     │
└─────────────────────────────────────┘
```

---

## Current vs Target Data Model

### Current Model

```typescript
interface MealLog {
  id: string;
  mealType: string;
  ingredients: string[];  // Just ingredient IDs
  date: string;
}
```

### Target Model (Approach C)

```typescript
interface MealComponent {
  ingredientId: string;
  preparation: string | null;  // "fried", "grilled", null for no prep
}

interface MealLog {
  id: string;
  mealType: string;
  name: string | null;         // Optional: "Mom's chicken"
  components: MealComponent[]; // Ingredient + preparation pairs
  date: string;
  // ... other fields
}
```

---

## Design Decisions (From Exploration)

| Decision | Choice |
|----------|--------|
| Preparation methods | Hybrid: predefined list + custom additions |
| Naming prompt | Never auto-prompt (user-initiated only) |
| Ingredient granularity | Fine-grained (chicken breast ≠ chicken thigh) |
| Preparation inheritance | Strict - named meal must match exactly |

---

## Implementation Tasks

### 2.1 Add Preparation Methods Table

**New Table:**

```sql
CREATE TABLE preparation_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_predefined INTEGER DEFAULT 1,  -- 1 = system, 0 = user-added
  created_at TEXT NOT NULL
);

-- Seed predefined methods
INSERT INTO preparation_methods (id, name, is_predefined, created_at) VALUES
  ('prep-fried', 'fried', 1, datetime('now')),
  ('prep-grilled', 'grilled', 1, datetime('now')),
  ('prep-roasted', 'roasted', 1, datetime('now')),
  ('prep-boiled', 'boiled', 1, datetime('now')),
  ('prep-baked', 'baked', 1, datetime('now')),
  ('prep-raw', 'raw', 1, datetime('now')),
  ('prep-steamed', 'steamed', 1, datetime('now')),
  ('prep-sauteed', 'sautéed', 1, datetime('now')),
  ('prep-stewed', 'stewed', 1, datetime('now')),
  ('prep-smoked', 'smoked', 1, datetime('now')),
  ('prep-poached', 'poached', 1, datetime('now')),
  ('prep-braised', 'braised', 1, datetime('now'));
```

**Store Actions:**
- `getPreparationMethods()` - List all methods
- `addCustomPreparationMethod(name)` - Add user method
- `deleteCustomPreparationMethod(id)` - Remove user method (not predefined)

---

### 2.2 Add Meal Components Table

**New Table:**

```sql
CREATE TABLE meal_components (
  id TEXT PRIMARY KEY,
  meal_log_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  preparation_method_id TEXT,  -- NULL = no preparation (e.g., milk)
  created_at TEXT NOT NULL,
  FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
  FOREIGN KEY (preparation_method_id) REFERENCES preparation_methods(id)
);
```

---

### 2.3 Add Optional Name to Meal Logs

**Alter meal_logs table:**

```sql
ALTER TABLE meal_logs ADD COLUMN name TEXT;  -- Optional meal name
```

---

### 2.4 Migration Strategy

**Approach:** Keep `ingredients` column for backward compatibility during migration, then deprecate.

**Migration Steps:**

1. Add new columns and tables (non-breaking)
2. Migrate existing data:
   ```sql
   -- For each existing meal_log
   -- Create meal_components from ingredients JSON
   INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
   SELECT
     uuid(),
     ml.id,
     json_each.value,
     NULL,  -- No preparation for legacy data
     ml.created_at
   FROM meal_logs ml, json_each(ml.ingredients);
   ```
3. Update app to read from `meal_components`
4. Update app to write to `meal_components`
5. (Future) Remove `ingredients` column

**Migration Version:** Increment to next version in `migrations.ts`

---

### 2.5 Update TypeScript Types

**New Types:**

```typescript
// types/index.ts

export interface PreparationMethod {
  id: string;
  name: string;
  isPredefined: boolean;
  createdAt: string;
}

export interface MealComponent {
  id: string;
  mealLogId: string;
  ingredientId: string;
  preparationMethodId: string | null;
  createdAt: string;
}

// Updated MealLog
export interface MealLog {
  id: string;
  mealTypeId: string;
  name: string | null;  // NEW: optional name
  date: string;
  createdAt: string;
  updatedAt: string;
  // Computed/joined
  components?: MealComponent[];
  ingredients?: string[];  // Legacy, for backward compat
}
```

---

### 2.6 Update Store

**New State:**

```typescript
interface StoreState {
  // ... existing
  preparationMethods: PreparationMethod[];
}
```

**New Actions:**

```typescript
interface StoreActions {
  // Preparation methods
  loadPreparationMethods: () => Promise<void>;
  addPreparationMethod: (name: string) => Promise<PreparationMethod>;
  deletePreparationMethod: (id: string) => Promise<void>;

  // Updated meal logging
  logMealWithComponents: (
    mealTypeId: string,
    components: { ingredientId: string; preparationMethodId: string | null }[],
    name?: string
  ) => Promise<MealLog>;

  // Get meal with components
  getMealWithComponents: (mealLogId: string) => Promise<MealLog & { components: MealComponent[] }>;
}
```

---

### 2.7 Update UI Components

**Suggestion Generation:**
- For now, continue generating ingredient-only suggestions
- Preparation method selection is optional (user can add when logging)

**Meal Logging Flow:**
1. User selects suggestion OR picks ingredients manually
2. For each ingredient, optionally select preparation method
3. Optionally name the meal
4. Confirm and log

**New UI Components:**
- `PreparationMethodPicker` - Dropdown/modal to select prep method
- `MealNameInput` - Optional text input for naming
- `MealComponentRow` - Shows ingredient + preparation in logging flow

---

### 2.8 Display Logic

**When displaying a meal:**

```typescript
function formatMealDisplay(meal: MealLog, components: MealComponent[], ingredients: Ingredient[], prepMethods: PreparationMethod[]): string {
  if (meal.name) {
    return meal.name;  // "Mom's chicken"
  }

  // Build from components
  return components.map(comp => {
    const ingredient = ingredients.find(i => i.id === comp.ingredientId);
    const prep = comp.preparationMethodId
      ? prepMethods.find(p => p.id === comp.preparationMethodId)
      : null;

    if (prep) {
      return `${prep.name} ${ingredient?.name}`;  // "fried chicken"
    }
    return ingredient?.name;  // "milk"
  }).join(' + ');
}
```

---

## Implementation Order

| Order | Task | Effort | Notes |
|-------|------|--------|-------|
| 1 | Run existing test suites | ~10 min | Baseline: run unit tests (101+) and E2E tests (12) |
| 2 | Add preparation_methods table + seed | ~1 hour | Migration |
| 3 | Add meal_components table | ~1 hour | Migration |
| 4 | Add name column to meal_logs | ~30 min | Migration |
| 5 | Write unit tests for new migrations | ~1 hour | Test table creation, seeding |
| 6 | Update TypeScript types | ~1 hour | Types file |
| 7 | Update store with new actions | ~2 hours | Store |
| 8 | Write unit tests for store actions | ~1.5 hours | Test CRUD for prep methods, components |
| 9 | Migrate existing data | ~2 hours | Migration script |
| 10 | Write unit tests for data migration | ~1 hour | Test legacy data converts correctly |
| 11 | Update meal logging flow UI | ~4 hours | New components |
| 12 | Write unit tests for `formatMealDisplay()` | ~30 min | Test named/unnamed meal display |
| 13 | Write E2E tests for meal logging with prep methods | ~2 hours | Test full logging flow with prep selection |
| 14 | Update history/display to use components | ~2 hours | UI updates |
| 15 | Write E2E test for history display | ~1 hour | Test named meals show correctly |
| 16 | Add prep method management UI | ~2 hours | Settings screen |
| 17 | Write E2E test for prep method management | ~1 hour | Test add/delete custom prep methods |
| 18 | Run full test suites | ~15 min | Run all unit + E2E tests, verify no regressions |

**Total Estimated Effort:** ~24 hours (including unit + E2E tests)

---

## Testing Strategy

### Unit Tests
- [ ] Migration creates tables correctly
- [ ] Existing data migrates to components
- [ ] `formatMealDisplay()` returns correct string
- [ ] Store actions work for prep methods
- [ ] Store actions work for component-based logging

### E2E Tests
- [ ] Can log meal with preparation methods
- [ ] Can name a meal
- [ ] Named meal displays correctly in history
- [ ] Can add custom preparation method
- [ ] Legacy meals still display correctly

---

## Backward Compatibility

**During Migration:**
- Old meals without components still work
- App reads from `components` if available, falls back to `ingredients`
- New meals are written with components

**After Migration:**
- All meals have components
- `ingredients` column can be removed (or kept for quick queries)

---

## Files to Create/Modify

**New Files:**
- `components/PreparationMethodPicker.tsx`
- `components/MealNameInput.tsx`
- `components/MealComponentRow.tsx`

**Modified Files:**
- `lib/database/migrations.ts` - New migration
- `lib/database/operations.ts` - New queries
- `lib/store/index.ts` - New state and actions
- `types/index.ts` - New types
- `app/suggestions/[mealType].tsx` - Updated logging flow
- `app/(tabs)/history.tsx` - Display components
- `app/(tabs)/settings.tsx` - Prep method management
- `components/SuggestionCard.tsx` - Show prep methods
- `components/MealHistoryItem.tsx` - Show components

---

## Success Criteria

Phase 2 is complete when:
- [ ] Preparation methods table exists with predefined values
- [ ] Users can add custom preparation methods
- [ ] Meals can be logged with preparation methods per ingredient
- [ ] Meals can be optionally named
- [ ] Named meals display their name, unnamed show components
- [ ] Existing meals continue to work
- [ ] All tests pass

---

## Reference

See [Data Model Evolution](../../product_info/meals-randomizer-exploration.md#data-model-evolution-from-ingredients-to-meals) in the exploration document for full design rationale.

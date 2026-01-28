# Phase 3.2: Seed Data & App Reset

**Status:** Planning

**Goal:** Prepopulate categories and pairing rules on new installs, and add a settings option to reset/initialize app with predefined data.

**Dependencies:** Phase 3 (Enhanced Variety) - pairing rules table exists

---

## Branching Strategy

**Branch Name:** `FEATURE_3.2_SEED_DATA_RESET`

**Approach:**
- Create feature branch from `main`
- Make small, focused commits for each task
- Commit message format: `feat(phase3.2): <description>` or `test(phase3.2): <description>`
- Run tests before each commit
- Squash merge to `main` when complete

---

## Tool Instructions

### Running Tests
```bash
cd demo-react-native-app

# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Linting
npm run lint

# TypeScript check
npx tsc --noEmit
```

### Running Maestro Tests
```bash
# Download latest APK from EAS or build locally
# See: docs/developer-guide/MAESTRO_TESTING.md

# Start Android emulator
# Then run Maestro tests
maestro test e2e/maestro/
```

### Quality Checks
```bash
npm run arch:test
npm run lint:dead-code
npm run lint:duplicates
npm run security:scan
```

---

## I18N Considerations

### New Translation Keys

**English (`lib/i18n/locales/en/settings.json`):**

```json
{
  "dataManagement": {
    "title": "Data Management",
    "resetToDefaults": "Reset to Default Data",
    "resetDescription": "Replace all data with predefined ingredients, categories, and pairing rules",
    "resetWarning": "This will delete all your custom data including meal history, favorites, and custom ingredients.",
    "resetConfirmTitle": "Reset App Data?",
    "resetConfirmMessage": "All your data will be replaced with defaults. This cannot be undone.",
    "resetConfirmButton": "Reset Data",
    "resetCancelButton": "Cancel",
    "resetSuccess": "App data has been reset to defaults"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/settings.json`):**
```json
{
  "dataManagement": {
    "title": "Gestão de Dados",
    "resetToDefaults": "Repor Dados Predefinidos",
    "resetDescription": "Substituir todos os dados por ingredientes, categorias e regras predefinidas",
    "resetWarning": "Isto irá apagar todos os seus dados personalizados, incluindo histórico de refeições, favoritos e ingredientes personalizados.",
    "resetConfirmTitle": "Repor Dados da App?",
    "resetConfirmMessage": "Todos os seus dados serão substituídos pelos predefinidos. Esta ação não pode ser revertida.",
    "resetConfirmButton": "Repor Dados",
    "resetCancelButton": "Cancelar",
    "resetSuccess": "Os dados da app foram repostos para os predefinidos"
  }
}
```

---

## Overview

### Current Problem

Currently, when installing SaborSpin:
- **Ingredients:** Prepopulated with ~20 Portuguese breakfast/snack items ✅
- **Categories:** Empty - user must create manually ❌
- **Pairing Rules:** Empty - user must create manually ❌
- **Ingredients have no category association** - category_id is null ❌

This creates a poor first-run experience where:
1. Ingredients show as "Uncategorized"
2. Category filter on Manage Ingredients is useless
3. No pairing rules to demonstrate the feature
4. User must do significant setup before the app is useful

### Solution

**Part 1: Enhanced Seed Data**
- Add predefined categories (Fruits, Dairy, Grains, Proteins, Spreads, etc.)
- Associate existing seed ingredients with appropriate categories
- Add sensible default pairing rules (positive and negative)

**Part 2: Settings Reset Option**
- Add "Data Management" section to Settings
- "Reset to Default Data" button with confirmation
- Clears all user data and repopulates with seed data
- Useful for:
  - Users who want a fresh start
  - Testing/demo purposes
  - Recovering from bad data state

---

## Seed Data Definition

### Categories

| ID | Name (EN) | Name (PT-PT) |
|----|-----------|--------------|
| cat-fruits | Fruits | Frutas |
| cat-dairy | Dairy | Lacticínios |
| cat-grains | Grains & Cereals | Cereais e Grãos |
| cat-proteins | Proteins | Proteínas |
| cat-spreads | Spreads & Jams | Compotas e Cremes |
| cat-bakery | Bakery | Padaria |
| cat-nuts | Nuts & Seeds | Frutos Secos |

### Ingredient-Category Mapping

Based on existing seed ingredients in `lib/database/schema.ts`:

| Ingredient | Category |
|------------|----------|
| Milk | Dairy |
| Greek Yogurt | Dairy |
| Cheese | Dairy |
| Butter | Dairy |
| Eggs | Proteins |
| Ham | Proteins |
| Cereals | Grains & Cereals |
| Oats | Grains & Cereals |
| Bread | Bakery |
| Toast | Bakery |
| Croissant | Bakery |
| Apple | Fruits |
| Banana | Fruits |
| Orange | Fruits |
| Jam | Spreads & Jams |
| Honey | Spreads & Jams |
| Peanut Butter | Spreads & Jams |
| Nuts | Nuts & Seeds |

### Default Pairing Rules

**Positive (Good Pairs):**
| Ingredient A | Ingredient B | Rationale |
|--------------|--------------|-----------|
| Milk | Cereals | Classic breakfast combo |
| Bread | Butter | Traditional pairing |
| Bread | Jam | Traditional pairing |
| Toast | Butter | Traditional pairing |
| Greek Yogurt | Honey | Popular combination |
| Greek Yogurt | Banana | Healthy breakfast |
| Oats | Banana | Healthy breakfast |
| Oats | Honey | Classic oatmeal |
| Bread | Cheese | Sandwich base |
| Bread | Ham | Sandwich base |
| Croissant | Butter | French breakfast |
| Croissant | Jam | French breakfast |
| Apple | Peanut Butter | Popular snack |

**Negative (Avoid Together):**
| Ingredient A | Ingredient B | Rationale |
|--------------|--------------|-----------|
| Milk | Orange | Dairy + citrus |
| Greek Yogurt | Orange | Dairy + citrus |
| Cheese | Jam | Unusual combination |
| Ham | Honey | Sweet + savory clash |
| Eggs | Jam | Unusual combination |

---

## UI Wireframes: Before & After

### Settings Screen

**BEFORE:**
```
+-------------------------------------+
|  Settings                           |
+-------------------------------------+
|                                     |
|  Language                           |
|  [English v]                        |
|                                     |
|  Experience                         |
|  [Haptic Feedback toggle]           |
|                                     |
|  Global Preferences                 |
|  ...                                |
|                                     |
|  Preparation Methods                |
|  ...                                |
|                                     |
|  Pairing Rules                  [>] |
|                                     |
|  Meal Types                         |
|  ...                                |
|                                     |
+-------------------------------------+
```

**AFTER:**
```
+-------------------------------------+
|  Settings                           |
+-------------------------------------+
|                                     |
|  Language                           |
|  [English v]                        |
|                                     |
|  Experience                         |
|  [Haptic Feedback toggle]           |
|                                     |
|  Global Preferences                 |
|  ...                                |
|                                     |
|  Preparation Methods                |
|  ...                                |
|                                     |
|  Pairing Rules                  [>] |
|                                     |
|  Meal Types                         |
|  ...                                |
|                                     |
|  ─────────────────────────────────  |
|                                     |
|  Data Management                    |  <-- NEW SECTION
|                                     |
|  +-------------------------------+  |
|  |  Reset to Default Data        |  |
|  |  Replace all data with        |  |
|  |  predefined ingredients,      |  |
|  |  categories, and rules        |  |
|  +-------------------------------+  |
|                                     |
+-------------------------------------+
```

### Reset Confirmation Modal

**NEW MODAL:**
```
+-------------------------------------+
|                                     |
|  ⚠️ Reset App Data?                 |
|                                     |
|  All your data will be replaced     |
|  with defaults. This includes:      |
|                                     |
|  • Meal history                     |
|  • Favorites                        |
|  • Custom ingredients               |
|  • Custom categories                |
|  • Custom pairing rules             |
|                                     |
|  This cannot be undone.             |
|                                     |
|  +-------------+ +---------------+  |
|  |   Cancel    | | Reset Data    |  |
|  +-------------+ +---------------+  |
|                                     |
+-------------------------------------+
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Settings BEFORE | Before Data Management section | `screenshot_before_settings_data.png` |
| Settings AFTER | After Data Management section added | `screenshot_after_settings_data.png` |
| Reset Confirmation | Modal with warning | `screenshot_reset_confirmation.png` |
| Categories Populated | Manage Categories with seed data | `screenshot_categories_seeded.png` |
| Ingredients with Categories | Manage Ingredients showing category badges | `screenshot_ingredients_categorized.png` |
| Pairing Rules Populated | Pairing Rules with seed data | `screenshot_pairing_rules_seeded.png` |

### Capture Instructions
1. For BEFORE screenshots: capture existing Settings UI
2. For seeded data: reset app and show populated data
3. Save screenshots in `docs/learning/epic04_feature_enhancement/screenshots/`

---

## Features

### 3.2.1 Enhanced Seed Data Structure

**What:** Create a centralized seed data definition file.

**File:** `lib/database/seedData.ts`

```typescript
export interface SeedCategory {
  id: string;
  name: string;
  name_pt: string;
}

export interface SeedIngredient {
  id: string;
  name: string;
  name_pt: string;
  categoryId: string;
  mealTypes: string[];  // ['breakfast', 'snack']
}

export interface SeedPairingRule {
  ingredientAId: string;
  ingredientBId: string;
  ruleType: 'positive' | 'negative';
}

export const SEED_CATEGORIES: SeedCategory[] = [
  { id: 'cat-fruits', name: 'Fruits', name_pt: 'Frutas' },
  { id: 'cat-dairy', name: 'Dairy', name_pt: 'Lacticínios' },
  // ... etc
];

export const SEED_INGREDIENTS: SeedIngredient[] = [
  { id: 'ing-milk', name: 'Milk', name_pt: 'Leite', categoryId: 'cat-dairy', mealTypes: ['breakfast', 'snack'] },
  // ... etc
];

export const SEED_PAIRING_RULES: SeedPairingRule[] = [
  { ingredientAId: 'ing-milk', ingredientBId: 'ing-cereals', ruleType: 'positive' },
  // ... etc
];
```

---

### 3.2.2 Migration to Add Category IDs

**What:** Update existing seed ingredients to have category associations.

**Approach:**
- New migration that updates existing ingredients with category_id
- Uses ingredient name matching to apply categories
- Idempotent (won't duplicate if run multiple times)

```typescript
// Migration version 10 (or next available)
{
  version: 10,
  up: async (db: DatabaseAdapter) => {
    // First, ensure categories exist
    for (const cat of SEED_CATEGORIES) {
      await db.runAsync(`
        INSERT OR IGNORE INTO categories (id, name, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `, [cat.id, cat.name]);
    }

    // Then, update ingredients with category_id
    for (const ing of SEED_INGREDIENTS) {
      await db.runAsync(`
        UPDATE ingredients
        SET category_id = ?
        WHERE name = ? AND category_id IS NULL
      `, [ing.categoryId, ing.name]);
    }
  }
}
```

---

### 3.2.3 Seed Pairing Rules on New Install

**What:** Add default pairing rules during app initialization.

**Approach:**
- Check if pairing_rules table is empty
- If empty (new install), insert seed rules
- Migration or initialization check

---

### 3.2.4 Reset to Defaults Function

**What:** Database function to clear and repopulate all data.

**File:** `lib/database/resetData.ts`

```typescript
export async function resetToDefaults(db: DatabaseAdapter): Promise<void> {
  // 1. Clear all user data (order matters for foreign keys)
  await db.runAsync('DELETE FROM meal_components');
  await db.runAsync('DELETE FROM meal_logs');
  await db.runAsync('DELETE FROM pairing_rules');
  await db.runAsync('DELETE FROM ingredients');
  await db.runAsync('DELETE FROM categories');

  // 2. Re-seed categories
  for (const cat of SEED_CATEGORIES) {
    await db.runAsync(`
      INSERT INTO categories (id, name, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `, [cat.id, cat.name]);
  }

  // 3. Re-seed ingredients with category associations
  for (const ing of SEED_INGREDIENTS) {
    await db.runAsync(`
      INSERT INTO ingredients (id, name, category_id, meal_types, is_active, is_user_added, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, 0, datetime('now'), datetime('now'))
    `, [ing.id, ing.name, ing.categoryId, JSON.stringify(ing.mealTypes)]);
  }

  // 4. Re-seed pairing rules
  for (const rule of SEED_PAIRING_RULES) {
    await db.runAsync(`
      INSERT INTO pairing_rules (id, ingredient_a_id, ingredient_b_id, rule_type, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [generateUUID(), rule.ingredientAId, rule.ingredientBId, rule.ruleType]);
  }
}
```

---

### 3.2.5 Settings UI - Data Management Section

**What:** Add reset button to Settings screen.

**Components:**
1. Section header "Data Management"
2. Reset button with description
3. Confirmation modal with warning
4. Success toast after reset

**Store Action:**
```typescript
resetAppData: async () => {
  const db = get().db;
  if (!db) return;

  await resetToDefaults(db);

  // Reload all state
  await get().loadIngredients();
  await get().loadCategories();
  await get().loadPairingRules();
  await get().loadMealLogs();
  // etc.
}
```

---

## Implementation Order

| Order | Task | Type | Effort | Notes | Status |
|-------|------|------|--------|-------|--------|
| 1 | Create feature branch | Setup | ~5 min | Branch from main | done |
| 2 | Capture BEFORE screenshots | Documentation | ~10 min | Settings, Categories, Ingredients | done |
| 3 | RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright, Maestro | done |
| 4 | RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | done |
| 5 | Create seedData.ts with categories, ingredients, rules | Implementation | ~2 hours | Centralized seed data | done |
| 6 | CREATE unit tests for seed data structure (and make sure they pass) | Testing | ~30 min | Validate data integrity | done |
| 7 | Create migration to seed categories | Implementation | ~1 hour | Migration version N | done |
| 8 | Create migration to update ingredient category_id | Implementation | ~1 hour | Link ingredients to categories | done |
| 9 | Create migration to seed pairing rules | Implementation | ~1 hour | Default positive/negative rules | done |
| 10 | CREATE unit tests for migrations (and make sure they pass) | Testing | ~1 hour | Test idempotency, data integrity | done |
| 11 | Create resetData.ts function | Implementation | ~1.5 hours | Clear and repopulate | done |
| 12 | CREATE unit tests for reset function (and make sure they pass) | Testing | ~1 hour | Test complete reset flow | done |
| 13 | Add resetAppData store action | Implementation | ~30 min | Connect to store | not started |
| 14 | Add Data Management section to Settings UI | Implementation | ~1.5 hours | Button + modal | not started |
| 15 | Add i18n translations | Implementation | ~30 min | EN + PT-PT | not started |
| 16 | CREATE Playwright E2E tests (and make sure they pass) | Testing | ~2 hours | Reset flow, verify data | not started |
| 17 | CREATE Maestro E2E tests (delay execution to step 18) | Testing | ~2 hours | Mirror Playwright tests | not started |
| 18 | RUN full test suites | Testing | ~20 min | Verify no regressions | not started |
| 19 | RUN quality checks and compare | Quality | ~30 min | Compare to baseline | not started |
| 20 | Document learning notes | Documentation | ~30 min | Capture issues/fixes | not started |
| 21 | Capture AFTER screenshots | Documentation | ~15 min | All new UI + seeded data | not started |

**Total Estimated Effort:** ~18 hours

**Legend:**
- CREATE = Writing new tests
- RUN = Executing tests (baseline/verification)

---

## Testing Strategy

### Unit Tests (CREATE new tests)
- [ ] Seed data has valid structure (no missing IDs, valid references)
- [ ] Category-ingredient mapping is complete
- [ ] Pairing rules reference valid ingredient IDs
- [ ] Migration adds categories correctly
- [ ] Migration updates ingredient category_id
- [ ] Migration adds pairing rules
- [ ] Migrations are idempotent
- [ ] resetToDefaults clears all tables
- [ ] resetToDefaults repopulates correct data
- [ ] Reset preserves meal_types table

### E2E Tests - Playwright (CREATE new tests)
- [ ] Fresh app shows categories in Manage Categories
- [ ] Fresh app shows ingredients with category badges
- [ ] Fresh app shows pairing rules in Pairing Rules screen
- [ ] Reset button visible in Settings
- [ ] Reset confirmation modal appears
- [ ] Cancel closes modal without action
- [ ] Confirm resets all data
- [ ] After reset, categories are populated
- [ ] After reset, ingredients have categories
- [ ] After reset, pairing rules exist
- [ ] After reset, meal history is empty

### Mobile E2E Tests - Maestro (CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions

---

## Files to Create/Modify

**New Files:**
- `lib/database/seedData.ts` - Centralized seed data definitions
- `lib/database/resetData.ts` - Reset function
- `lib/database/__tests__/seedData.test.ts` - Seed data validation tests
- `lib/database/__tests__/resetData.test.ts` - Reset function tests
- `e2e/seed-data-reset.spec.ts` - Playwright E2E tests
- `e2e/maestro/seed-data-*.yaml` - Maestro E2E tests
- `docs/learning/epic04_feature_enhancement/PHASE3.2_SEED_DATA_AND_RESET_LEARNING_NOTES.md`
- `docs/learning/epic04_feature_enhancement/PHASE3.2_SEED_DATA_AND_RESET_progress.md`

**Modified Files:**
- `lib/database/migrations.ts` - Add new migrations
- `lib/database/schema.ts` - Update to use seedData.ts (DRY)
- `lib/store/index.ts` - Add resetAppData action
- `app/(tabs)/settings.tsx` - Add Data Management section
- `lib/i18n/locales/en/settings.json` - Add translations
- `lib/i18n/locales/pt-PT/settings.json` - Add translations

---

## Success Criteria

Phase 3.2 is complete when:
- [ ] New installs have prepopulated categories
- [ ] New installs have ingredients with category associations
- [ ] New installs have default pairing rules
- [ ] Settings shows "Data Management" section
- [ ] Reset button triggers confirmation modal
- [ ] Reset clears all user data
- [ ] Reset repopulates with seed data
- [ ] All tests pass (unit + Playwright + Maestro)
- [ ] Quality metrics equal or better than baseline
- [ ] i18n translations complete (EN + PT-PT)

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 3.2 Learning Notes](./PHASE3.2_SEED_DATA_AND_RESET_LEARNING_NOTES.md)**

---

## Progress Tracking

Track implementation progress:

**[Phase 3.2 Progress](./PHASE3.2_SEED_DATA_AND_RESET_progress.md)**

---

## Reference

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Table structure
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Zustand store patterns

### Related Phases

- [Phase 3: Enhanced Variety](./PHASE3_ENHANCED_VARIETY.md) - Pairing rules table
- [Phase 2: Data Model Evolution](./PHASE2_DATA_MODEL_EVOLUTION.md) - Meal components

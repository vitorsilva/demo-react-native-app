# Phase 2: Data Model Evolution

**Status:** 📋 PLANNED

**Goal:** Evolve data model to support preparation methods and named meals (Approach C: Flexible Meals)

**Dependencies:** None

---

## Branching Strategy

**Branch Name:** `FEATURE_2.0_DATA_MODEL_EVOLUTION`

**Approach:**
- Create feature branch from `main`
- Make small, focused commits for each task
- Commit message format: `feat(phase2): <description>` or `test(phase2): <description>`
- Run tests before each commit
- Squash merge to `main` when complete

**Example commits:**
```
feat(phase2): add preparation_methods table migration
feat(phase2): add meal_components table migration
test(phase2): add unit tests for migrations
feat(phase2): add PreparationMethodPicker component
```

---

## Tool Instructions

### Running Tests
```bash
cd demo-react-native-app

# Unit tests
npm test

# E2E tests (Playwright) - requires app running
npm run test:e2e

# Linting
npm run lint

# TypeScript check
npx tsc --noEmit
```

### Running Maestro Tests
```bash
# Install Maestro CLI (if not installed)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Start the app on emulator/device first
npm start

# Run Maestro tests
maestro test e2e/maestro/
```

### Quality Checks
```bash
# Architecture tests
npm run arch:test

# Dead code detection
npm run lint:dead-code

# Duplicate detection
npm run lint:duplicates

# Security scan
npm run security:scan
```

---

## I18N Considerations

### New Translation Keys Required

**English (`lib/i18n/locales/en/`):**
```json
// meals.json (or new file)
{
  "mealName": {
    "placeholder": "Name this meal (optional)",
    "example": "e.g., \"Mom's special\""
  },
  "preparation": {
    "title": "Preparation for \"{{ingredient}}\"",
    "none": "None (as is)",
    "addCustom": "+ Add custom...",
    "cancel": "Cancel",
    "apply": "Apply"
  },
  "prepMethods": {
    "fried": "fried",
    "grilled": "grilled",
    "roasted": "roasted",
    "boiled": "boiled",
    "baked": "baked",
    "raw": "raw",
    "steamed": "steamed",
    "sauteed": "sautéed",
    "stewed": "stewed",
    "smoked": "smoked",
    "poached": "poached",
    "braised": "braised"
  }
}

// settings.json
{
  "preparationMethods": {
    "title": "Preparation Methods",
    "system": "System (cannot delete)",
    "custom": "Custom",
    "addCustom": "+ Add Custom Method",
    "delete": "Delete"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/`):**
- Same structure with Portuguese translations
- Note: Some prep methods may need cultural adaptation

### Implementation Notes
- All user-facing strings must use `t()` function
- Prep method names stored in DB are keys, display via i18n
- Custom user-added prep methods stored as entered (not translated)

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

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Meal Logging BEFORE | Before implementation starts | `screenshot_before_meal_logging.png` |
| Meal Logging AFTER | After prep method selector added | `screenshot_after_meal_logging.png` |
| Preparation Method Picker | New modal component | `screenshot_prep_method_picker.png` |
| History Item BEFORE | Before named meals support | `screenshot_before_history_item.png` |
| History Item - Named | After implementation with named meal | `screenshot_after_history_named.png` |
| History Item - Unnamed | After implementation with prep methods | `screenshot_after_history_prep.png` |
| Prep Methods Settings | New management screen | `screenshot_prep_methods_settings.png` |

### Capture Instructions
1. For BEFORE screenshots: capture existing UI before any implementation
2. For AFTER screenshots: capture with actual data showing new features
3. Include both iOS and Android variants if significantly different
4. Save screenshots in `docs/learning/epic04_feature_enhancement/screenshots/`

### Capturing BEFORE screenshots after implementation
If the feature is already implemented, you can still capture BEFORE screenshots:
- **Option A**: `git checkout <commit-before-feature>`, run app, screenshot, then `git checkout -`
- **Option B**: Use the ASCII wireframe in this document as the "before" reference
- **Option C**: Skip BEFORE if not critical, document changes in AFTER caption

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

This project uses a **versioned migration system** in `lib/database/migrations.ts`. Each migration has a version number and an idempotent `up` function.

**Current schema version:** 3 (or 4 if Phase 1 Favorites is done first)

**Approach:** Keep `ingredients` column for backward compatibility during migration, then deprecate.

**Add migration version 5 (or next available):**

```typescript
// In lib/database/migrations.ts - add to migrations array

{
  version: 5,  // Adjust based on current version
  up: async (db: DatabaseAdapter) => {
    // 1. Create preparation_methods table (idempotent)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS preparation_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_predefined INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      )
    `);

    // 2. Seed predefined methods (idempotent via INSERT OR IGNORE)
    const now = new Date().toISOString();
    const predefinedMethods = [
      ['prep-fried', 'fried'], ['prep-grilled', 'grilled'],
      ['prep-roasted', 'roasted'], ['prep-boiled', 'boiled'],
      ['prep-baked', 'baked'], ['prep-raw', 'raw'],
      ['prep-steamed', 'steamed'], ['prep-sauteed', 'sautéed'],
      ['prep-stewed', 'stewed'], ['prep-smoked', 'smoked'],
      ['prep-poached', 'poached'], ['prep-braised', 'braised'],
    ];

    for (const [id, name] of predefinedMethods) {
      if (!(await recordExists(db, 'preparation_methods', 'id = ?', [id]))) {
        await db.runAsync(
          `INSERT INTO preparation_methods (id, name, is_predefined, created_at) VALUES (?, ?, 1, ?)`,
          [id, name, now]
        );
      }
    }

    // 3. Create meal_components table (idempotent)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS meal_components (
        id TEXT PRIMARY KEY,
        meal_log_id TEXT NOT NULL,
        ingredient_id TEXT NOT NULL,
        preparation_method_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (meal_log_id) REFERENCES meal_logs(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
        FOREIGN KEY (preparation_method_id) REFERENCES preparation_methods(id)
      )
    `);

    // 4. Add name column to meal_logs (idempotent)
    if (!(await columnExists(db, 'meal_logs', 'name'))) {
      await db.runAsync(`ALTER TABLE meal_logs ADD COLUMN name TEXT`);
    }
  },
},

{
  version: 6,  // Data migration in separate version for safety
  up: async (db: DatabaseAdapter) => {
    // Migrate existing meal_logs to meal_components
    // Only migrate logs that don't have components yet
    const logsToMigrate = await db.getAllAsync<{ id: string; ingredients: string; logged_at: string }>(
      `SELECT ml.id, ml.ingredients, ml.logged_at
       FROM meal_logs ml
       LEFT JOIN meal_components mc ON mc.meal_log_id = ml.id
       WHERE mc.id IS NULL AND ml.ingredients IS NOT NULL`
    );

    for (const log of logsToMigrate) {
      try {
        const ingredientIds = JSON.parse(log.ingredients);
        for (const ingredientId of ingredientIds) {
          await db.runAsync(
            `INSERT INTO meal_components (id, meal_log_id, ingredient_id, preparation_method_id, created_at)
             VALUES (?, ?, ?, NULL, ?)`,
            [Crypto.randomUUID(), log.id, ingredientId, log.logged_at]
          );
        }
      } catch (e) {
        // Skip malformed JSON - log but don't fail migration
        console.warn(`Skipping migration for meal_log ${log.id}: invalid ingredients JSON`);
      }
    }
  },
}
```

**How the migration system works:**
1. `migrations` table tracks applied versions
2. `runMigrations(db)` runs on app startup
3. Only migrations with `version > currentVersion` are executed
4. Helper functions (`columnExists`, `recordExists`) ensure idempotency
5. Each migration is recorded after success

**Why split into two versions:**
- Version 5: Schema changes (tables, columns) - safe to retry
- Version 6: Data migration - separate so schema is guaranteed first

**Backward Compatibility:**
- Old `ingredients` column kept for backward compat
- App reads from `meal_components` if available, falls back to `ingredients`
- New meals written with `meal_components`

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

| Order | Task | Type | Effort | Notes |
|-------|------|------|--------|-------|
| 1 | ▶️ RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright E2E, Maestro | done |
| 2 | ▶️ RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | done |
| 3 | Add preparation_methods table + seed | Implementation | ~1 hour | Migration | done |
| 4 | Add meal_components table | Implementation | ~1 hour | Migration | done |
| 5 | Add name column to meal_logs | Implementation | ~30 min | Migration | done |
| 6 | 🧪 CREATE unit tests for new migrations | Testing | ~1 hour | Test table creation, seeding | done |
| 7 | Update TypeScript types | Implementation | ~1 hour | Types file | done |
| 8 | Update store with new actions | Implementation | ~2 hours | Store | done |
| 9 | 🧪 CREATE unit tests for store actions | Testing | ~1.5 hours | Test CRUD for prep methods, components | done |
| 10 | Migrate existing data | Implementation | ~2 hours | Migration script | done |
| 11 | 🧪 CREATE unit tests for data migration | Testing | ~1 hour | Test legacy data converts correctly | done |
| 12 | Update meal logging flow UI | Implementation | ~4 hours | New components | done |
| 13 | 🧪 CREATE unit tests for `formatMealDisplay()` | Testing | ~30 min | Test named/unnamed meal display | done |
| 14 | 🧪 CREATE Playwright E2E tests for meal logging | Testing | ~2 hours | Test logging flow with prep selection | not started |
| 15 | 🧪 CREATE Maestro tests for meal logging | Testing | ~2 hours | Mirror Playwright tests for mobile | not started |
| 16 | Update history/display to use components | Implementation | ~2 hours | UI updates | not started |
| 17 | 🧪 CREATE Playwright E2E test for history | Testing | ~1 hour | Test named meals show correctly | not started |
| 18 | 🧪 CREATE Maestro test for history | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 19 | Add prep method management UI | Implementation | ~2 hours | Settings screen | not started |
| 20 | 🧪 CREATE Playwright E2E test for prep management | Testing | ~1 hour | Test add/delete custom prep methods | not started |
| 21 | 🧪 CREATE Maestro test for prep management | Testing | ~1 hour | Mirror Playwright test for mobile | not started |
| 22 | ▶️ RUN full test suites | Testing | ~20 min | Unit + Playwright + Maestro, verify no regressions | not started |
| 23 | ▶️ RUN quality checks and compare | Quality | ~30 min | Compare to baseline; create remediation plan if worse | not started |
| 24 | Document learning notes | Documentation | ~30 min | Capture unexpected errors, workarounds, fixes | not started |
| 25 | 📸 Capture BEFORE screenshots | Documentation | ~15 min | not started |
| 26 | 📸 Capture AFTER screenshots | Documentation | ~20 min | not started |

**Total Estimated Effort:** ~29.5 hours (including unit + Playwright + Maestro tests + quality checks)

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)
- 📸 = Screenshot capture for documentation

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] Migration creates tables correctly
- [ ] Existing data migrates to components
- [ ] `formatMealDisplay()` returns correct string
- [ ] Store actions work for prep methods
- [ ] Store actions work for component-based logging

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Can log meal with preparation methods
- [ ] Can name a meal
- [ ] Named meal displays correctly in history
- [ ] Can add custom preparation method
- [ ] Legacy meals still display correctly

### Mobile E2E Tests - Maestro (🧪 CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (▶️ RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions

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

## Deployment Strategy

### Release Type
**Migration Release** - Database schema changes require careful upgrade path

### Pre-Deployment Checklist
- [ ] All unit tests passing
- [ ] All E2E tests passing (Playwright + Maestro)
- [ ] Migration tested on fresh install
- [ ] Migration tested on existing data (upgrade path)
- [ ] Quality baseline comparison completed
- [ ] Manual QA on physical device
- [ ] Version bump in `app.json`

### Migration Safety
```typescript
// Migration is additive - new tables/columns only
// Existing data continues to work
// Background migration converts meal_logs to component format
```

### Build & Release
```bash
# 1. Bump version (minor - data model change)
npm version minor

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Test migration scenarios:
#    - Fresh install
#    - Upgrade from previous version with existing data
#    - Upgrade with large history (100+ meals)

# 4. Build production release
eas build --platform android --profile production

# 5. Staged rollout recommended (10% → 50% → 100%)
```

### Rollback Plan
- New tables/columns are additive - old version ignores them
- If critical issue: revert APK, new data in components table orphaned but not lost
- Consider keeping `ingredients` column as backup during transition

### Post-Deployment
- Monitor migration success rate via telemetry
- Check OTel error spans for migration errors
- Verify meal history displays correctly after upgrade

---

## Files to Create/Modify

**New Files:**
- `components/PreparationMethodPicker.tsx`
- `components/MealNameInput.tsx`
- `components/MealComponentRow.tsx`
- `docs/learning/epic04_feature_enhancement/PHASE2_LEARNING_NOTES.md` - Learning notes

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

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 2 Learning Notes →](./PHASE2_LEARNING_NOTES.md)**

---

## Reference

See [Data Model Evolution](../../product_info/meals-randomizer-exploration.md#data-model-evolution-from-ingredients-to-meals) in the exploration document for full design rationale.

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [Database Schema](../../architecture/DATABASE_SCHEMA.md) - Schema design patterns
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Zustand store patterns

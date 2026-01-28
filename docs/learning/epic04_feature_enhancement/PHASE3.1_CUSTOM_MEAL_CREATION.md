# Phase 3.1: Custom Meal Creation

**Status:** Planning

**Goal:** Allow users to create and log meals by manually selecting ingredients, rather than only choosing from generated suggestions.

**Dependencies:** Phase 2 (Data Model Evolution) - uses meal components and prep methods

---

## Branching Strategy

**Branch Name:** `FEATURE_3.1_CUSTOM_MEAL_CREATION`

**Approach:**
- Create feature branch from `main`
- Make small, focused commits for each task
- Commit message format: `feat(phase3.1): <description>` or `test(phase3.1): <description>`
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

**English (`lib/i18n/locales/en/`):**

```json
// home.json
{
  "customMeal": {
    "button": "Create Custom Meal",
    "title": "Create Your Meal"
  }
}

// suggestions.json (or new custom-meal.json)
{
  "customMeal": {
    "title": "Create Custom Meal",
    "selectIngredients": "Select Ingredients",
    "selectedCount": "{{count}} selected",
    "minRequired": "Select at least {{min}} ingredient",
    "maxAllowed": "Maximum {{max}} ingredients",
    "noIngredients": "No ingredients available",
    "filterByCategory": "Filter by category",
    "allCategories": "All",
    "clearSelection": "Clear",
    "createMeal": "Create Meal",
    "cancel": "Cancel"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/`):**
- Same structure with Portuguese translations

---

## Overview

Currently, SaborSpin only allows users to log meals by:
1. Tapping a meal type (Breakfast/Snack)
2. Viewing 4 generated suggestions
3. Selecting one of the suggestions

**Problem:** Users can't log meals when:
- They already know what they want to eat
- None of the suggestions appeal to them
- They want to track a meal eaten outside the app's suggestions

**Solution:** Add a "Create Custom Meal" option that allows users to:
1. Manually select ingredients from their ingredient list
2. Optionally add a meal name
3. Optionally select preparation methods
4. Log the custom meal to history

This custom meal will:
- Feed into the variety algorithm (affects future suggestions)
- Appear in meal history
- Support favorites functionality
- Use the same Phase 2 data model (meal components, prep methods)

---

## UI Wireframes: Before & After

### Home Screen

**BEFORE:**
```
+-------------------------------------+
|  SaborSpin                          |
+-------------------------------------+
|                                     |
|  What do you feel like?             |
|                                     |
|  +---------------+ +---------------+|
|  |   Breakfast   | |    Snack      ||
|  +---------------+ +---------------+|
|                                     |
|  Recent Meals                       |
|  +-------------------------------+  |
|  | Today - milk + cereals        |  |
|  +-------------------------------+  |
|  | Yesterday - bread + jam       |  |
|  +-------------------------------+  |
|                                     |
+-------------------------------------+
```

**AFTER:**
```
+-------------------------------------+
|  SaborSpin                          |
+-------------------------------------+
|                                     |
|  What do you feel like?             |
|                                     |
|  +---------------+ +---------------+|
|  |   Breakfast   | |    Snack      ||
|  +---------------+ +---------------+|
|                                     |
|  +-------------------------------+  |
|  |    + Create Custom Meal       |  |  <-- NEW
|  +-------------------------------+  |
|                                     |
|  Recent Meals                       |
|  +-------------------------------+  |
|  | Today - milk + cereals        |  |
|  +-------------------------------+  |
|                                     |
+-------------------------------------+
```

### Custom Meal Screen (NEW)

**NEW SCREEN:**
```
+-------------------------------------+
|  <- Create Custom Meal              |
+-------------------------------------+
|                                     |
|  Meal Name (optional)               |
|  +-------------------------------+  |
|  | e.g., "Sunday brunch"         |  |
|  +-------------------------------+  |
|                                     |
|  Select Ingredients (2 selected)    |
|                                     |
|  [All] [Fruits] [Proteins] [Grains] |  <-- Category filter
|                                     |
|  +-------------------------------+  |
|  | [ ] Apple                     |  |
|  | [x] Milk                      |  |  <-- Checkbox selection
|  | [x] Cereals                   |  |
|  | [ ] Greek Yogurt              |  |
|  | [ ] Bread                     |  |
|  | [ ] Jam                       |  |
|  | [ ] ...                       |  |
|  +-------------------------------+  |
|                                     |
|  [Clear]            [Create Meal]   |
|                                     |
+-------------------------------------+
```

### Preparation Method Selection (After Create Meal)

**After tapping "Create Meal":**
```
+-------------------------------------+
|  Your Selection                     |
+-------------------------------------+
|                                     |
|  Milk                               |
|  [None (as is)]  [v]                |  <-- Prep method picker
|                                     |
|  Cereals                            |
|  [None (as is)]  [v]                |
|                                     |
|  +-------------------------------+  |
|  |   [Cancel]    [Log Meal]      |  |
|  +-------------------------------+  |
|                                     |
+-------------------------------------+

Note: Reuses existing ConfirmationModal with
MealNameInput and MealComponentRow components from Phase 2.
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Home Screen BEFORE | Before adding custom meal button | `screenshot_before_home_custom.png` |
| Home Screen AFTER | After adding custom meal button | `screenshot_after_home_custom.png` |
| Custom Meal Screen | New screen with ingredient selection | `screenshot_custom_meal_screen.png` |
| Custom Meal - Filtered | Screen with category filter applied | `screenshot_custom_meal_filtered.png` |
| Custom Meal - Selected | Screen with multiple ingredients selected | `screenshot_custom_meal_selected.png` |
| Confirmation Modal | Prep method selection for custom meal | `screenshot_custom_meal_confirm.png` |

### Capture Instructions
1. For BEFORE screenshots: capture existing UI before any implementation
2. For custom meal screen: select various ingredients to show the UI
3. For filtered view: apply a category filter
4. Save screenshots in `docs/learning/epic04_feature_enhancement/screenshots/`

---

## Features

### 3.1.1 Custom Meal Button on Home Screen

**What:** Add a prominent "Create Custom Meal" button on the home screen.

**Location:** Between meal type buttons and recent meals section.

**Behavior:**
- Tapping navigates to new Custom Meal screen
- Button uses secondary styling (distinct from meal type buttons)
- Shows "+ Create Custom Meal" text with icon

---

### 3.1.2 Custom Meal Screen

**What:** New screen for selecting ingredients manually.

**Components:**
1. **Header:** Back button + title "Create Custom Meal"
2. **Meal Name Input:** Optional text field (reuse `MealNameInput` from Phase 2)
3. **Category Filter:** Horizontal scrollable chips for filtering ingredients
4. **Ingredient List:** Scrollable list with checkboxes
5. **Selection Counter:** Shows "X selected" with min/max validation
6. **Action Buttons:** "Clear" and "Create Meal"

**Behavior:**
- Load all active ingredients from store
- Filter by category when chip selected
- Track selected ingredients in local state
- Validate min/max ingredients (from settings or default 1-6)
- "Create Meal" disabled if selection invalid

---

### 3.1.3 Ingredient Selection Logic

**Selection Rules:**
- Minimum: 1 ingredient (always required)
- Maximum: 6 ingredients (configurable, default 6)
- Only active ingredients shown
- Disabled ingredients excluded

**State Management:**
```typescript
interface CustomMealState {
  selectedIngredients: string[];  // ingredient IDs
  mealName: string;
  categoryFilter: string | null;
}
```

---

### 3.1.4 Confirmation Flow

**After "Create Meal" is tapped:**
1. Show existing `ConfirmationModal` component
2. Reuse `MealNameInput` (already supports Phase 2)
3. Reuse `MealComponentRow` for prep method selection
4. On confirm, call `logMealWithComponents()` from store

**Key:** No new meal type required. Custom meals use a generic meal type or allow user to select.

**Decision Point:** Should custom meals:
- A) Require selecting a meal type (Breakfast/Snack/etc.)
- B) Use a "Custom" meal type
- C) Skip meal type entirely

**Recommendation:** Option A - Require meal type selection in the confirmation modal. This ensures:
- Custom meals affect variety for the correct meal type
- History shows meal type context
- Cooldown rules work correctly

---

### 3.1.5 Store Integration

**No new store actions needed.** Reuse existing:
- `loadIngredients()` - Get ingredient list
- `loadCategories()` - Get category list
- `loadPreparationMethods()` - Get prep methods
- `logMealWithComponents()` - Log the custom meal

**Verification:** Custom meals should appear in history and affect future suggestions.

---

## Implementation Order

| Order | Task | Type | Effort | Notes | Status |
|-------|------|------|--------|-------|--------|
| 1 | Create feature branch | Setup | ~5 min | Branch from main | done |
| 2 | Capture BEFORE screenshots | Documentation | ~10 min | Home screen | done |
| 3 | RUN existing test suites | Testing | ~15 min | Baseline: unit, Playwright, Maestro | done |
| 4 | RUN quality baseline | Quality | ~30 min | arch:test, lint:dead-code, lint:duplicates, security:scan | done |
| 5 | Create CustomMealScreen component | Implementation | ~3 hours | New screen with ingredient selection | done |
| 6 | Add category filter functionality | Implementation | ~1 hour | Filter chips | done (in Task 5) |
| 7 | Add selection validation | Implementation | ~1 hour | Min/max checks | done (in Task 5) |
| 8 | CREATE unit tests for selection logic (and make sure they pass) | Testing | ~1 hour | Test validation, filtering | done |
| 9 | Add "Create Custom Meal" button to home | Implementation | ~30 min | Button + navigation | done |
| 10 | Connect to ConfirmationModal | Implementation | ~1 hour | Reuse Phase 2 components | done (in Task 5) |
| 11 | Add meal type selector to flow | Implementation | ~1 hour | Required for variety tracking | done (in Task 5) |
| 12 | Add i18n translations | Implementation | ~30 min | EN + PT-PT | done |
| 13 | CREATE Playwright E2E tests (and make sure they pass) | Testing | ~2 hours | Full flow testing | not started |
| 14 | CREATE Maestro E2E tests (delay execution to step 14) | Testing | ~2 hours | Mirror Playwright tests | not started |
| 15 | RUN full test suites | Testing | ~20 min | Verify no regressions | not started |
| 16 | RUN quality checks and compare | Quality | ~30 min | Compare to baseline | not started |
| 17 | Document learning notes | Documentation | ~30 min | Capture issues/fixes | not started |
| 18 | Capture AFTER screenshots | Documentation | ~15 min | All new UI elements | not started |

**Total Estimated Effort:** ~16 hours

**Legend:**
- CREATE = Writing new tests
- RUN = Executing tests (baseline/verification)

---

## Testing Strategy

### Unit Tests (CREATE new tests)
- [ ] Selection state updates correctly
- [ ] Category filter works
- [ ] Min ingredient validation
- [ ] Max ingredient validation
- [ ] Clear selection resets state

### E2E Tests - Playwright (CREATE new tests)
- [ ] "Create Custom Meal" button visible on home
- [ ] Navigate to custom meal screen
- [ ] Select multiple ingredients
- [ ] Filter by category
- [ ] Clear selection
- [ ] Validation prevents create with 0 ingredients
- [ ] Full flow: select ingredients -> add prep methods -> log meal
- [ ] Custom meal appears in history
- [ ] Custom meal affects future suggestions (variety)

### Mobile E2E Tests - Maestro (CREATE new tests)
- [ ] Mirror all Playwright tests for mobile verification

### Existing Tests (RUN for regression check)
- Run before implementation to establish baseline
- Run after implementation to verify no regressions

---

## Files to Create/Modify

**New Files:**
- `app/(tabs)/custom-meal.tsx` - Custom meal creation screen
- `components/IngredientCheckbox.tsx` - Checkbox item for ingredient list
- `components/CategoryFilterChips.tsx` - Horizontal filter chips
- `e2e/custom-meal.spec.ts` - Playwright E2E tests
- `e2e/maestro/custom-meal-*.yaml` - Maestro E2E tests
- `docs/learning/epic04_feature_enhancement/PHASE3.1_CUSTOM_MEAL_CREATION_LEARNING_NOTES.md`
- `docs/learning/epic04_feature_enhancement/PHASE3.1_CUSTOM_MEAL_CREATION_progress.md`

**Modified Files:**
- `app/(tabs)/index.tsx` - Add "Create Custom Meal" button
- `app/(tabs)/_layout.tsx` - Add route (hidden from tab bar)
- `lib/i18n/locales/en/home.json` - Add translations
- `lib/i18n/locales/en/suggestions.json` - Add translations
- `lib/i18n/locales/pt-PT/home.json` - Add translations
- `lib/i18n/locales/pt-PT/suggestions.json` - Add translations

---

## Success Criteria

Phase 3.1 is complete when:
- [ ] "Create Custom Meal" button visible on home screen
- [ ] Users can select ingredients manually
- [ ] Category filter works correctly
- [ ] Min/max validation prevents invalid selections
- [ ] Meal name and prep methods can be added
- [ ] Custom meals logged to history
- [ ] Custom meals affect variety algorithm
- [ ] All tests pass (unit + Playwright + Maestro)
- [ ] Quality metrics equal or better than baseline
- [ ] i18n translations complete (EN + PT-PT)

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 3.1 Learning Notes](./PHASE3.1_CUSTOM_MEAL_CREATION_LEARNING_NOTES.md)**

---

## Progress Tracking

Track implementation progress:

**[Phase 3.1 Progress](./PHASE3.1_CUSTOM_MEAL_CREATION_progress.md)**

---

## Reference

### Developer Guides

- [Testing Guide](../../developer-guide/TESTING.md) - Unit testing patterns
- [Maestro Testing](../../developer-guide/MAESTRO_TESTING.md) - Mobile E2E testing
- [Architecture Rules](../../developer-guide/ARCHITECTURE_RULES.md) - Architecture testing
- [State Management](../../architecture/STATE_MANAGEMENT.md) - Zustand store patterns

### Related Phases

- [Phase 2: Data Model Evolution](./PHASE2_DATA_MODEL_EVOLUTION.md) - Meal components and prep methods
- [Phase 3: Enhanced Variety](./PHASE3_ENHANCED_VARIETY.md) - Variety algorithm

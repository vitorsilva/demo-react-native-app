# Phase 3: Enhanced Variety - Progress Log

This document tracks progress for Phase 3 implementation tasks.

---

## 2026-01-27

### Task 1: Capture BEFORE screenshots

**Status:** COMPLETE

**What was done:**
- Created feature branch `FEATURE_3.0_ENHANCED_VARIETY` from main
- Started web app with `npm run web`
- Used Playwright MCP to navigate and capture screenshots
- Captured 2 BEFORE screenshots:
  1. `screenshot_before_suggestion_variety.png` - Suggestions page showing:
     - Green checkmark variety indicator
     - "New!" badge on suggestion cards
     - No ingredient frequency warning (to be added in Phase 3)
  2. `screenshot_before_settings_pairing.png` - Settings page showing:
     - Language, Experience, Global Preferences sections
     - Preparation Methods section
     - Meal Types section
     - No "Pairing Rules" link (to be added in Phase 3)

**Files Created:**
- `docs/learning/epic04_feature_enhancement/screenshots/screenshot_before_suggestion_variety.png`
- `docs/learning/epic04_feature_enhancement/screenshots/screenshot_before_settings_pairing.png`

**Verification:**
- Both screenshots captured and saved successfully

---

### Task 2: RUN existing test suites

**Status:** COMPLETE

**What was done:**
- Started web app with `npm run web` for Playwright E2E tests
- Executed unit tests with `npm test`
- Executed Playwright E2E tests with `npm run test:e2e`
- Executed Maestro tests with `maestro test e2e/maestro/` on Android emulator

**Baseline Results (ALL EXECUTED):**

| Test Type | Command | Result |
|-----------|---------|--------|
| Unit tests (Jest) | `npm test` | **389 passed** in 22 suites |
| Playwright E2E | `npm run test:e2e` | **68 passed, 1 skipped** (4.4 min) |
| Maestro | `maestro test e2e/maestro/` | **16 passed** (7m 9s) |

**Playwright Test Results by Spec File:**
- favorites.spec.ts: 7 tests passed
- history-phase2.spec.ts: 6 tests passed
- i18n.spec.ts: 7 tests passed
- meal-logging-phase2.spec.ts: 8 tests passed
- meal-logging.spec.ts: 12 tests passed
- new-badge.spec.ts: 3 tests passed
- prep-methods-settings.spec.ts: 12 tests passed
- telemetry.spec.ts: 4 tests passed
- variety-indicator.spec.ts: 4 tests passed
- variety-stats.spec.ts: 6 tests passed

**Maestro Test Results:**
- favorites-empty-state: passed (29s)
- favorites-flow: passed (35s)
- history-phase2-multiple-meals: passed (32s)
- history-phase2-named-meal: passed (22s)
- history-phase2-prep-method: passed (21s)
- meal-logging-phase2-anonymous: passed (19s)
- meal-logging-phase2-custom-prep: passed (20s)
- meal-logging-phase2: passed (21s)
- new-badge: passed (27s)
- prep-methods-add-custom: passed (28s)
- prep-methods-delete-custom: passed (33s)
- prep-methods-full-workflow: passed (44s)
- prep-methods-settings: passed (19s)
- telemetry-flow: passed (26s)
- variety-indicator: passed (27s)
- variety-stats: passed (26s)

**Verification:**
- All 389 unit tests pass
- 68 Playwright E2E tests pass, 1 skipped
- All 16 Maestro tests pass on Android emulator (emulator-5554)

---

### Task 3: RUN quality baseline

**Status:** COMPLETE

**What was done:**
- Executed all 4 quality check commands from `demo-react-native-app/demo-react-native-app/`
- Captured baseline metrics for comparison after Phase 3 implementation

**Quality Baseline Results:**

| Check | Command | Result |
|-------|---------|--------|
| Architecture tests | `npm run arch:test` | ✅ No violations (138 modules, 339 dependencies) |
| Dead code | `npm run lint:dead-code` | ✅ 1 hint (expo-router/entry - expected) |
| Duplicates | `npm run lint:duplicates` | ⚠️ 24 clones found (4.6% duplication) |
| Security scan | `npm run security:scan` | ✅ 0 findings (217 rules, 90 files) |

**Duplicate Code Summary (Pre-existing):**
- JavaScript: 4 clones, 11.95% duplicated lines
- TSX: 8 clones, 4.29% duplicated lines
- TypeScript: 12 clones, 3.26% duplicated lines
- **Total: 24 clones, 4.6% duplication rate**

**Verification:**
- All quality checks executed successfully
- No security vulnerabilities found
- Architecture rules are being followed
- Duplication rate is acceptable baseline (4.6%)

---

### Task 4: Add ingredient frequency calculation

**Status:** COMPLETE

**What was done:**
- Added `getIngredientFrequency()` function to `lib/utils/variety.ts`
- Implemented Option A from the plan (aggregate from meal_logs, no new table)
- Function counts ingredient usage in the last N days for variety scoring

**File Modified:**
- `demo-react-native-app/lib/utils/variety.ts` - Added new function

**Function Implementation:**
```typescript
export function getIngredientFrequency(
  ingredientId: string,
  history: MealLog[],
  days: number
): number
```
- Filters meals within the specified day range using `getDaysAgo()`
- Counts meals containing the specified ingredient
- Returns count for use in variety penalty scoring

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings unrelated to this change)

---

### Task 5: CREATE unit tests for getIngredientFrequency()

**Status:** COMPLETE

**What was done:**
- Added 13 unit tests for `getIngredientFrequency()` to `lib/utils/__tests__/variety.test.ts`
- Followed existing test patterns in the file

**File Modified:**
- `demo-react-native-app/lib/utils/__tests__/variety.test.ts` - Added test suite

**Tests Added (13 tests in 3 categories):**
1. **Basic counting** (5 tests)
   - Returns 0 for empty history
   - Returns 0 when ingredient not in any meals
   - Counts ingredient used once
   - Counts ingredient used multiple times
   - Counts each meal separately even on same day

2. **Day range filtering** (5 tests)
   - Only counts meals within the specified day range
   - Includes meals from today (day 0)
   - Excludes meals at exactly the day boundary
   - Respects custom day ranges
   - Returns 0 for 0-day range

3. **Edge cases** (3 tests)
   - Handles meals with single ingredient
   - Handles meals with many ingredients
   - Handles large history efficiently

**Verification:**
- All 57 variety tests pass (13 new + 44 existing)
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors

---

### Task 6: Update variety scoring with frequency

**Status:** COMPLETE

**What was done:**
- Added `calculateVarietyScore()` function to `lib/utils/variety.ts`
- Added `FREQUENCY_PENALTY` constant for configurable penalty thresholds

**File Modified:**
- `demo-react-native-app/lib/utils/variety.ts` - Added new function and constant

**Function Implementation:**
```typescript
export function calculateVarietyScore(
  candidateIngredients: string[],
  recentMeals: MealLog[],
  cooldownDays: number
): number
```

**Penalty Thresholds (FREQUENCY_PENALTY):**
- HIGH: 30 (used 3+ times)
- MEDIUM: 15 (used 2 times)
- LOW: 5 (used 1 time)

**Algorithm:**
1. Start with score = 100
2. For each ingredient, get frequency using `getIngredientFrequency()`
3. Apply penalty based on frequency threshold
4. Return score (minimum 0)

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors

---

### Task 7: CREATE unit tests for frequency penalties

**Status:** COMPLETE

**What was done:**
- Added 18 unit tests for `calculateVarietyScore()` to `lib/utils/__tests__/variety.test.ts`
- Imported `calculateVarietyScore` and `FREQUENCY_PENALTY` from the variety module
- Tests follow existing patterns using `describe` blocks and helper functions

**File Modified:**
- `demo-react-native-app/lib/utils/__tests__/variety.test.ts` - Added test suite

**Tests Added (18 tests in 7 categories):**
1. **Penalty constants** (1 test): Verifies FREQUENCY_PENALTY values
2. **Basic scoring** (3 tests): empty candidates, never-used ingredients, empty history
3. **Single ingredient penalties** (4 tests): LOW/MEDIUM/HIGH thresholds
4. **Multiple ingredients penalties** (3 tests): cumulative penalties, mixed levels
5. **Score clamping** (2 tests): clamps to 0, boundary condition
6. **Cooldown period** (2 tests): respects days parameter, boundary exclusion
7. **Edge cases** (3 tests): single ingredient, many ingredients, 0-day cooldown

**Verification:**
- All 75 variety tests pass (57 existing + 18 new)
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)

---

### Task 8: Add pairing_rules table

**Status:** COMPLETE

**What was done:**
- Added migration version 9 to `lib/database/migrations.ts`
- Creates `pairing_rules` table for storing ingredient pairing rules

**File Modified:**
- `demo-react-native-app/lib/database/migrations.ts` - Added version 9 migration

**Table Schema:**
```sql
CREATE TABLE pairing_rules (
  id TEXT PRIMARY KEY,
  ingredient_a_id TEXT NOT NULL,
  ingredient_b_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,  -- 'positive' | 'negative'
  created_at TEXT NOT NULL,
  FOREIGN KEY (ingredient_a_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_b_id) REFERENCES ingredients(id) ON DELETE CASCADE,
  UNIQUE(ingredient_a_id, ingredient_b_id)
)
```

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)
- All 37 migration tests pass

---

### Task 9: CREATE unit tests for pairing rules migration

**Status:** COMPLETE

**What was done:**
- Created `lib/database/__tests__/migrations.phase3.test.ts`
- Added 12 unit tests for migration version 9 (pairing_rules table)

**File Created:**
- `demo-react-native-app/lib/database/__tests__/migrations.phase3.test.ts`

**Tests Added (12 tests in 4 categories):**
1. **Table structure** (5 tests): table exists, schema verification, foreign keys
2. **Rule types** (2 tests): positive and negative rule type storage
3. **Constraints** (3 tests): UNIQUE constraint, reverse order allowed, deletion
4. **Idempotency** (2 tests): migration recorded, no duplication on re-run

**Verification:**
- All 12 Phase 3 migration tests pass
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)

---

### Task 10: Add pairing rules store actions

**Status:** COMPLETE

**What was done:**
- Added `PairingRule` type to `types/database.ts`
- Created `lib/database/pairingRules.ts` with CRUD operations
- Added pairing rules state and actions to the Zustand store

**Files Created:**
- `demo-react-native-app/lib/database/pairingRules.ts`

**Files Modified:**
- `demo-react-native-app/types/database.ts` - Added PairingRule interface
- `demo-react-native-app/lib/store/index.ts` - Added state and 4 actions

**Store Actions:**
1. `loadPairingRules()` - Load all rules from database
2. `addPairingRule(ingredientAId, ingredientBId, ruleType)` - Add a rule
3. `deletePairingRule(id)` - Delete a rule
4. `getPairingRulesForIngredient(ingredientId)` - Get rules for ingredient

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)
- All 35 store tests pass

---

### Task 11: CREATE unit tests for pairing rules CRUD

**Status:** COMPLETE

**What was done:**
- Created `lib/database/__tests__/pairingRules.test.ts`
- Added 28 unit tests covering all CRUD operations for pairing rules

**File Created:**
- `demo-react-native-app/lib/database/__tests__/pairingRules.test.ts`

**Tests Added (28 tests in 7 categories):**
1. **getAllPairingRules** (3 tests)
   - Returns empty array when no rules exist
   - Returns all added rules
   - Returns rules sorted by creation date descending

2. **addPairingRule** (4 tests)
   - Creates rule with generated ID and timestamp
   - Creates positive rule type
   - Creates negative rule type
   - Rule is retrievable after creation

3. **getPairingRuleById** (2 tests)
   - Returns correct rule
   - Returns null for non-existent ID

4. **getPairingRulesForIngredient** (5 tests)
   - Returns rules where ingredient is A
   - Returns rules where ingredient is B
   - Returns all rules involving ingredient (as A or B)
   - Returns empty array when ingredient has no rules
   - Returns rules sorted by creation date descending

5. **deletePairingRule** (3 tests)
   - Removes rule from database
   - Returns error for non-existent rule
   - Only deletes specified rule

6. **pairingRuleExists** (4 tests)
   - Returns true when rule exists (A-B order)
   - Returns true when rule exists (B-A reverse lookup)
   - Returns false when no rule exists
   - Returns false for different ingredient pair

7. **getPairingRuleForPair** (5 tests)
   - Returns rule for exact pair match (A-B)
   - Returns rule for reversed pair (B-A)
   - Returns null when no rule exists for pair
   - Returns correct rule type (positive)
   - Returns correct rule type (negative)

8. **Rule structure and properties** (2 tests)
   - Rule has correct structure after retrieval
   - ruleType is properly typed as string union

**Verification:**
- All 28 pairing rules CRUD tests pass
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)

---

### Task 12: Add pairing rules to suggestion algorithm

**Status:** COMPLETE

**What was done:**
- Added `applyPairingRules()` function to `lib/utils/variety.ts`
- Added `PAIRING_RULE_SCORE` constant with scoring values
- Added `PairingRuleResult` interface for type safety

**File Modified:**
- `demo-react-native-app/lib/utils/variety.ts`

**Function Added:**
```typescript
export function applyPairingRules(
  candidateIngredients: string[],
  pairingRules: PairingRule[]
): PairingRuleResult
```

**Behavior:**
- Checks all pairs of ingredients against pairing rules
- Negative rules: Returns `{ isValid: false, score: -100 }` (combination filtered out)
- Positive rules: Adds +10 bonus per matched positive pair
- No matching rules: Returns `{ isValid: true, score: 0 }`

**Constants Added:**
- `PAIRING_RULE_SCORE.POSITIVE_BONUS = 10`
- `PAIRING_RULE_SCORE.NEGATIVE_PENALTY = -100`

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)
- All 75 variety tests pass

---

### Task 13: CREATE unit tests for applyPairingRules()

**Status:** COMPLETE

**What was done:**
- Added 16 unit tests for `applyPairingRules()` to `lib/utils/__tests__/variety.test.ts`
- Added `createPairingRule()` helper function for test data
- Updated imports to include `applyPairingRules`, `PAIRING_RULE_SCORE`, and `PairingRule`

**File Modified:**
- `demo-react-native-app/lib/utils/__tests__/variety.test.ts`

**Tests Added (16 tests in 5 categories):**
1. **Score constants** (1 test)
   - Exports PAIRING_RULE_SCORE with correct values

2. **Empty inputs** (3 tests)
   - Returns valid with score 0 for empty candidate ingredients
   - Returns valid with score 0 for empty rules
   - Returns valid with score 0 for single ingredient (no pairs)

3. **Positive rules** (3 tests)
   - Adds bonus (+10) for matching positive rule
   - Matches positive rule in reverse order (B-A)
   - Accumulates bonus for multiple positive pairs

4. **Negative rules** (3 tests)
   - Returns invalid for matching negative rule
   - Matches negative rule in reverse order (B-A)
   - Returns invalid immediately when first negative rule found

5. **Mixed rules** (2 tests)
   - Returns valid with bonus when only positive rules match
   - Returns valid with 0 score when no rules match

6. **Edge cases** (4 tests)
   - Handles many ingredients with multiple matching pairs
   - Handles duplicate ingredients in candidate
   - Handles no matching ingredients even with many rules
   - Correctly identifies pair regardless of ingredient position

**Verification:**
- All 91 variety tests pass (75 existing + 16 new)
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (7 pre-existing warnings)

---

### Task 14: Create Pairing Rules UI

**Status:** COMPLETE

**What was done:**
- Created new screen `app/(tabs)/pairing-rules.tsx` with tabbed interface for managing pairing rules
- Created `components/AddPairingRuleModal.tsx` component for adding new rules with ingredient selection
- Created `components/PairingRuleItem.tsx` component for displaying individual rules with delete functionality
- Added i18n translations for English (`lib/i18n/locales/en/settings.json`)
- Added i18n translations for Portuguese (`lib/i18n/locales/pt-PT/settings.json`)
- Updated `app/(tabs)/_layout.tsx` to hide pairing-rules from tab bar (href: null)
- Updated `app/(tabs)/settings.tsx` to add navigation link to Pairing Rules screen

**Files Created:**
- `demo-react-native-app/app/(tabs)/pairing-rules.tsx`
- `demo-react-native-app/components/AddPairingRuleModal.tsx`
- `demo-react-native-app/components/PairingRuleItem.tsx`

**Files Modified:**
- `demo-react-native-app/lib/i18n/locales/en/settings.json`
- `demo-react-native-app/lib/i18n/locales/pt-PT/settings.json`
- `demo-react-native-app/app/(tabs)/_layout.tsx`
- `demo-react-native-app/app/(tabs)/settings.tsx`

**UI Features Implemented:**
- Tab selector for "Good Pairs" (positive) and "Avoid" (negative) rule types
- List view of existing rules filtered by selected tab
- Delete functionality with confirmation dialog
- Add button that opens modal for creating new rules
- Modal with ingredient pickers (first/second ingredient)
- Validation: prevents duplicate rules, same ingredient selection
- Back navigation to Settings
- Full i18n support (English/Portuguese)

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (8 pre-existing warnings)
- All 477 unit tests pass

---

### Task 15: CREATE Playwright E2E tests for pairing rules

**Status:** COMPLETE

**What was done:**
- Created `e2e/pairing-rules.spec.ts` with 12 E2E tests for pairing rules functionality
- Tests follow existing patterns from `prep-methods-settings.spec.ts`

**File Created:**
- `demo-react-native-app/e2e/pairing-rules.spec.ts`

**Tests Added (12 tests):**
1. should display Pairing Rules link in Settings
2. should navigate to Pairing Rules screen
3. should show empty state for Good Pairs initially
4. should show empty state for Avoid tab
5. should open add pairing rule modal
6. should cancel adding a pairing rule
7. should show validation error when not selecting both ingredients
8. should add a positive (good pair) pairing rule
9. should add a negative (avoid) pairing rule
10. should delete a pairing rule
11. should navigate back to Settings
12. full workflow: add good pair, add avoid pair, verify tabs, delete rules

**Verification:**
- All 12 Playwright E2E tests pass
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (8 pre-existing warnings)

---

### Task 16: CREATE Maestro tests for pairing rules

**Status:** COMPLETE

**What was done:**
- Created 5 Maestro test files mirroring the Playwright E2E tests for pairing rules
- Tests follow the existing Maestro test patterns used in prep-methods tests

**Files Created:**
- `demo-react-native-app/e2e/maestro/pairing-rules-settings.yaml`
- `demo-react-native-app/e2e/maestro/pairing-rules-add-good.yaml`
- `demo-react-native-app/e2e/maestro/pairing-rules-add-avoid.yaml`
- `demo-react-native-app/e2e/maestro/pairing-rules-delete.yaml`
- `demo-react-native-app/e2e/maestro/pairing-rules-full-workflow.yaml`

**Tests Created (5 tests):**
1. `pairing-rules-settings` - Navigate to Pairing Rules from Settings, verify tabs
2. `pairing-rules-add-good` - Add a positive (good pair) pairing rule
3. `pairing-rules-add-avoid` - Add a negative (avoid) pairing rule
4. `pairing-rules-delete` - Add and delete a pairing rule
5. `pairing-rules-full-workflow` - Complete CRUD workflow with tab switching

**Notes:**
- Test execution deferred to Task 20 due to EAS build queue wait time
- New EAS build triggered (ID: 6677d842-3019-4f9c-8112-16a2a67d6d36) with commit 877f28e
- APK will include all Pairing Rules UI changes

**Verification:**
- TypeScript check: ✅ No errors (YAML files don't need TS check)
- Linter: ✅ No errors
- Test files follow existing Maestro patterns

---

### Task 17: Update suggestion generation

**Status:** COMPLETE

**What was done:**
- Updated `generateMealSuggestions()` function in `lib/store/index.ts`
- Integrated Phase 3 variety scoring and pairing rules into the suggestion algorithm
- Added imports for `applyPairingRules`, `calculateVarietyScore`, `isNewCombination`, `getVarietyColor` from variety.ts

**File Modified:**
- `demo-react-native-app/lib/store/index.ts`

**Algorithm Enhancement:**
1. Generate 10x candidates (e.g., 40 for 4 suggestions)
2. Filter: Skip combinations with negative pairing rules
3. Score: Calculate variety score (ingredient frequency penalties)
4. Bonus: Add positive pairing rule bonus (+10 per pair)
5. Bonus: Add favorite combination bonus (+20)
6. Bonus: Add new combination bonus (+10)
7. Sort by total score (highest first)
8. Return top N combinations

**Verification:**
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (8 pre-existing warnings)
- All 477 unit tests pass

---

### Task 18: CREATE Playwright E2E tests for suggestions with pairing rules

**Status:** COMPLETE

**What was done:**
- Created `e2e/suggestions-pairing.spec.ts` with 4 E2E tests
- Tests verify that pairing rules affect meal suggestions as expected

**File Created:**
- `demo-react-native-app/e2e/suggestions-pairing.spec.ts`

**Tests Added (4 tests):**
1. `should exclude negative pairing rules from suggestions` - Verifies negative pairs (e.g., Milk + Greek Yogurt) never appear together in suggestions
2. `should regenerate suggestions without negative pairs` - Verifies exclusion persists across regenerations
3. `should include positive pairing rules in suggestions with higher priority` - Verifies positive rules are applied
4. `full workflow: negative pairing prevents suggestion, delete rule allows it` - Complete CRUD workflow

**Challenges Overcome:**
- Multiple back-buttons in DOM due to Expo Router keeping screens mounted → Used `:visible` selector
- Tab bar hidden on full-screen suggestions page → Navigate back first, then use tabs
- Delete confirmation dialog handling → Used `waitForFunction` for dynamic UI

**Verification:**
- All 4 Playwright E2E tests pass (1.1 min)
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors (8 pre-existing warnings)

---

### Task 19: CREATE Maestro test for suggestions

**Status:** COMPLETE

**What was done:**
- Created 4 Maestro test files mirroring the Playwright E2E tests for suggestions with pairing rules
- Tests follow existing Maestro patterns from pairing-rules tests

**Files Created:**
- `demo-react-native-app/e2e/maestro/suggestions-pairing-negative.yaml`
- `demo-react-native-app/e2e/maestro/suggestions-pairing-regenerate.yaml`
- `demo-react-native-app/e2e/maestro/suggestions-pairing-positive.yaml`
- `demo-react-native-app/e2e/maestro/suggestions-pairing-workflow.yaml`

**Tests Created (4 tests):**
1. `suggestions-pairing-negative` - Test negative pairing rules exclude combinations from suggestions
2. `suggestions-pairing-regenerate` - Test regenerating suggestions still respects negative pairing rules
3. `suggestions-pairing-positive` - Test positive pairing rules are applied to suggestions
4. `suggestions-pairing-workflow` - Full workflow: add negative rule, verify exclusion, delete rule, verify allowed

**Notes:**
- Test execution deferred to Task 20 as per the plan instructions
- Tests follow existing Maestro patterns with appropriate timeouts (15000ms for suggestions)

**Verification:**
- TypeScript check: ✅ No errors (YAML files)
- Linter: ✅ 0 errors (8 pre-existing warnings)

---

### Task 20: RUN full test suites

**Status:** COMPLETE

**What was done:**
- Ran all unit tests (477 tests)
- Ran all Playwright E2E tests (84 tests)
- Ran all Maestro E2E tests (25 tests)
- Fixed multiple Maestro test issues discovered during execution

**Test Results:**

| Test Type | Baseline | After Phase 3 | Status |
|-----------|----------|---------------|--------|
| Unit tests (Jest) | 389 passed | 477 passed | ✅ +88 new tests |
| Playwright E2E | 68 passed, 1 skipped | 84 passed, 1 skipped | ✅ +16 new tests |
| Maestro | 16 passed | 25 passed | ✅ +9 new tests |

**Maestro Test Issues Fixed:**

1. **Element selector ambiguity** - Multiple "Pairing Rules" elements on Settings screen
   - Fix: Use `testID="pairing-rules-link"` instead of text matching

2. **Back button text prefix** - Button shows "← Back" with arrow
   - Fix: Use `testID="back-button"` instead of text matching

3. **Scroll visibility** - Elements not visible after scrolling to section header
   - Fix: Scroll to description text below header to ensure link is visible

4. **Ingredient picker scrolling** - Ingredients not visible without scrolling in picker
   - Fix: Add `scrollUntilVisible` before each ingredient `tapOn`

5. **Ingredient name case sensitivity** - Tests used lowercase but seed data has proper case
   - Fix: Update all ingredient names to match seed data exactly (e.g., "Milk", "Cereals", "Greek Yogurt")

6. **Screen tab persistence** - Screen remembers last active tab when navigating back
   - Fix: Wait for tab bar visibility instead of specific tab content

7. **Button visibility** - "Generate New Ideas" button needs scrolling
   - Fix: Add `scrollUntilVisible` before tapping regenerate button

**Files Modified:**
- e2e/maestro/pairing-rules-settings.yaml
- e2e/maestro/pairing-rules-add-good.yaml
- e2e/maestro/pairing-rules-add-avoid.yaml
- e2e/maestro/pairing-rules-delete.yaml
- e2e/maestro/pairing-rules-full-workflow.yaml
- e2e/maestro/suggestions-pairing-negative.yaml
- e2e/maestro/suggestions-pairing-regenerate.yaml
- e2e/maestro/suggestions-pairing-positive.yaml
- e2e/maestro/suggestions-pairing-workflow.yaml

**Verification:**
- Unit tests: ✅ 477 passed
- Playwright E2E: ✅ 84 passed, 1 skipped
- Maestro E2E: ✅ 25/25 passed

---

### Task 21: RUN quality checks and compare

**Status:** COMPLETE

**What was done:**
- Executed all 4 quality check commands: arch:test, lint:dead-code, lint:duplicates, security:scan
- Compared results to baseline from Task 3

**Quality Comparison:**

| Check | Baseline | After Phase 3 | Status |
|-------|----------|---------------|--------|
| Architecture tests | 138 modules, 339 deps | 144 modules, 372 deps | ✅ No violations |
| Dead code | 1 hint | 1 hint | ✅ Same |
| Duplicates | 24 clones (4.6%) | 25 clones (4.05%) | ✅ Better % |
| Security scan | 0 findings (90 files) | 0 findings (94 files) | ✅ Clean |

**Result:** No remediation plan needed - all metrics acceptable or improved.

**Verification:**
- All quality checks pass
- No security vulnerabilities
- Duplication rate decreased despite 1 new clone

---

### Task 22: Document learning notes

**Status:** COMPLETE

**What was done:**
- Reviewed and consolidated all learning notes from Phase 3 implementation
- Created comprehensive "Phase 3 Summary: Key Learnings" section covering:
  - Architecture patterns (store-only data access, migration patterns)
  - Testing patterns (Playwright E2E and Maestro best practices)
  - Common issues and solutions table
  - Algorithm design (suggestion generation, frequency penalties)
  - Quality metrics tracking (baseline vs final comparison)
  - Development environment notes (Windows-specific, test execution)
  - Files created/modified in Phase 3

**Key Learnings Documented:**
1. Store-only data access rule enforced by ESLint
2. Use testID selectors instead of text in E2E tests
3. Expo Router keeps screens mounted - use `:visible` pseudo-class
4. Maestro requires `scrollUntilVisible` for elements below fold
5. Case-sensitive ingredient names must match seed data exactly
6. Local Android builds fail on Windows due to path limits - use EAS

**Verification:**
- Learning notes file updated with comprehensive summary

---

# Phase 3: Enhanced Variety - Learning Notes

This document captures unexpected errors, workarounds, and fixes encountered during Phase 3 implementation.

---

## 2026-01-27

### Task 1: Capture BEFORE screenshots

**Status:** COMPLETE

**What was done:**
- Captured 2 BEFORE screenshots using Playwright MCP with web app
- Screenshots document the UI state before Phase 3 features are implemented

**Screenshots Captured:**
| # | Filename | Description |
|---|----------|-------------|
| 1 | `screenshot_before_suggestion_variety.png` | Suggestion cards showing current variety indicators (green checkmark, "New!" badge) - no ingredient frequency warning |
| 2 | `screenshot_before_settings_pairing.png` | Settings page showing current sections - no "Pairing Rules" link |

**No issues encountered.**

---

### Task 2: RUN existing test suites

**Status:** COMPLETE

**Baseline Results (ALL EXECUTED):**
| Test Type | Command | Result |
|-----------|---------|--------|
| Unit tests (Jest) | `npm test` | **389 passed** in 22 suites |
| Playwright E2E | `npm run test:e2e` | **68 passed, 1 skipped** in 10 spec files |
| Maestro | `maestro test e2e/maestro/` | **16 passed** in 7m 9s |

**Notes:**
- Unit tests ran successfully with expected console warnings from telemetry tests (mock network errors)
- Playwright tests executed against web app (started with `npm run web`)
- Maestro tests executed against Android emulator (emulator-5554) with installed APK

**Issue Encountered:**
- Initial implementation only listed tests without executing them
- Initially claimed Maestro "cannot run" without checking documentation
- **Fix:** Read MAESTRO_TESTING.md documentation, found emulator was already running, ran all tests

**Lesson Learned:**
Always read the linked documentation before claiming something cannot be done. The Maestro testing guide was linked in the plan document and contained all the information needed to run the tests.

---

### Task 3: RUN quality baseline

**Status:** COMPLETE

**Quality Baseline Results:**
| Check | Command | Result |
|-------|---------|--------|
| Architecture tests | `npm run arch:test` | ✅ No violations (138 modules, 339 dependencies) |
| Dead code | `npm run lint:dead-code` | ✅ 1 hint (expo-router/entry - expected Expo behavior) |
| Duplicates | `npm run lint:duplicates` | ⚠️ 24 clones found (4.6% duplication rate) |
| Security scan | `npm run security:scan` | ✅ 0 findings (217 rules, 90 files) |

**Notes:**
- All commands ran successfully from `demo-react-native-app/demo-react-native-app/` directory
- The duplication findings are pre-existing and not introduced by Phase 3
- Security scan uses Semgrep with auto config and found no vulnerabilities
- This baseline will be compared after Phase 3 implementation to verify no regressions

**Issue Encountered:**
- Quality scripts referenced in the plan are in the nested `demo-react-native-app/` subfolder, not the root directory
- Initial attempts to run from wrong directory failed with "Missing script" errors
- **Fix:** Identified correct directory from package.json location and ran commands from there

---

### Task 4: Add ingredient frequency calculation

**Status:** COMPLETE

**What was done:**
- Added `getIngredientFrequency()` function to `lib/utils/variety.ts`
- Function counts how many times a specific ingredient was used in the last N days
- Uses existing `getDaysAgo()` utility for date filtering
- Follows Option A from the plan (aggregate from meal_logs, no new table)

**Implementation Details:**
- Function signature: `getIngredientFrequency(ingredientId: string, history: MealLog[], days: number): number`
- Filters meals where `getDaysAgo(log.date) < days` (meals within the period)
- Counts meals where `meal.ingredients.includes(ingredientId)`

**No issues encountered.**

---

### Task 5: CREATE unit tests for getIngredientFrequency()

**Status:** COMPLETE

**What was done:**
- Added 13 unit tests for `getIngredientFrequency()` to `lib/utils/__tests__/variety.test.ts`
- Tests cover: basic counting, day range filtering, and edge cases

**Test Categories:**
1. **Basic counting** (5 tests): empty history, ingredient not found, single use, multiple uses, same-day meals
2. **Day range filtering** (5 tests): day boundary, today, custom ranges, edge cases
3. **Edge cases** (3 tests): single ingredient meals, many ingredients, large history

**Issue Encountered:**
- Initial "large history" test expected 50 meals but actual count was 51
- Off-by-one error in manual calculation of `i % 14` distribution
- **Fix:** Corrected expectation to 51 with detailed comment explaining the math

**Test Results:**
- All 57 variety tests pass (13 new + 44 existing)
- TypeScript check: ✅ No errors
- Linter: ✅ 0 errors

---

### Task 6: Update variety scoring with frequency

**Status:** COMPLETE

**What was done:**
- Added `calculateVarietyScore()` function to `lib/utils/variety.ts`
- Added `FREQUENCY_PENALTY` constant object with HIGH/MEDIUM/LOW thresholds
- Function scores candidate combinations based on ingredient frequency penalties

**Implementation Details:**
- Score starts at 100
- Each ingredient gets penalized based on usage frequency in cooldown period:
  - 3+ times: -30 (HIGH penalty)
  - 2 times: -15 (MEDIUM penalty)
  - 1 time: -5 (LOW penalty)
  - 0 times: no penalty (encourages rotation)
- Score is clamped to minimum 0

**Design Decision:**
- Added to `lib/utils/variety.ts` (not `varietyEngine.ts`) to keep it co-located with `getIngredientFrequency()` which it depends on
- Exported penalty constants for testability and documentation

**No issues encountered.**

---

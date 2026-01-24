# Feature 1.4: Variety Stats - Progress

## Task 1: Create `calculateVarietyStats()` utility - DONE

**Date:** 2026-01-24

**Summary:**
- Added `isThisMonth()` and `isThisWeek()` helper functions to `lib/utils/dateUtils.ts`
- Added `VarietyStats` interface to `lib/utils/variety.ts`
- Implemented `calculateVarietyStats(history, ingredients)` function that computes:
  - Unique combinations count for the current month
  - Most common combination (with ingredient IDs and count)
  - Ingredients used this week vs total active ingredients
  - Variety score percentage (0-100)

**Files modified:**
- `lib/utils/dateUtils.ts` - Added `isThisMonth()` and `isThisWeek()` functions
- `lib/utils/variety.ts` - Added `VarietyStats` interface and `calculateVarietyStats()` function

**Verification:**
- TypeScript check: PASSED
- ESLint: PASSED (only pre-existing warnings)

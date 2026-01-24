# Phase 0.2: Quality Baseline - Learning Notes

**Date:** 2026-01-24

---

## Issues Encountered

### 1. TypeScript Errors During Mutation Testing

**Problem:** When running mutation testing, TypeScript errors appeared because the `isFavorite` property was required in `MealLog` type but missing in test data.

**Error:**
```
error TS2345: Argument of type '{ date: string; mealType: string; ingredients: string[]; }'
is not assignable to parameter of type 'Omit<MealLog, "id" | "createdAt">'.
Property 'isFavorite' is missing in type...
```

**Root Cause:** The `logMeal` function signature required all `MealLog` properties except `id` and `createdAt`, but `isFavorite` was added later and wasn't included in existing tests.

**Solution:** Made `isFavorite` optional in the function signature:
```typescript
// lib/database/mealLogs.ts
export async function logMeal(
  db: DatabaseAdapter,
  mealLog: Omit<MealLog, 'id' | 'createdAt' | 'isFavorite'> & { isFavorite?: boolean }
): Promise<MealLog>
```

Also updated test files to include `isFavorite: false` in MealLog objects:
- `lib/business-logic/__tests__/varietyEngine.test.ts`
- `lib/database/__tests__/mealLogs.test.ts`
- `lib/store/index.ts` (type definition)

**Lesson:** When adding new required properties to types, check all test files and function signatures that use those types.

---

### 2. Mutation Testing Not in Original Baseline Plan

**Problem:** The original Phase 0.2 plan didn't include mutation testing, but it was added to Epic 03 Phase 10 and should be part of quality metrics.

**Solution:** Added mutation testing to:
- Phase 0.2 tool instructions
- Quality baseline report (EPIC04_QUALITY_BASELINE.md)
- Phase 10 Quality Validation plan

**Lesson:** When establishing quality baselines, include all quality metrics from previous epics to maintain consistency.

---

### 3. Branching Strategy Not Followed

**Problem:** Committed directly to `main` instead of creating feature branches as specified in the phase documents.

**Decision:** User chose to fix for future phases (Phase 1 onwards). Phase 0.1 and 0.2 commits remain on main.

**Lesson:** Always check branching strategy in phase documents before starting work.

---

## Mutation Testing Results Reference

| Wave | Target | Score |
|------|--------|-------|
| Core | combinationGenerator.ts | 65.00% |
| Validation | validation.ts | 94.34% |
| Database | 5 files | 87.04% |

These scores serve as the baseline for Phase 10 final validation.

---

*Created: 2026-01-24*

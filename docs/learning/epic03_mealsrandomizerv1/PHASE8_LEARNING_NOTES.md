# Phase 8: Mutation Testing - Learning Notes

This document captures problems, fixes, and lessons learned during Phase 8 implementation.

---

## 2026-01-22 - Stryker "extends" not supported

**Problem:** Created `stryker.core.json` with `"extends": "./stryker.config.json"` but got warning:
```
WARN OptionsValidator Unknown stryker config option "extends".
```

**Root cause:** StrykerJS v9.x does not support the `extends` property like ESLint configs do.

**Fix:** Made `stryker.core.json` a standalone config with all settings duplicated.

**Lesson:** Don't assume config inheritance patterns from other tools (ESLint, TypeScript) apply to Stryker. Check the Stryker schema before using.

---

## 2026-01-22 - All mutants timing out with perTest coverage

**Problem:** First mutation run showed all 52 mutants timing out:
```
All files                | 100.00 |  100.00 |        0 |        52 |          0 |        0 |        0
```

**Error indicators:**
- "Ran 1 tests in 10 seconds" - Only 1 test detected
- All mutants timed out

**Root cause:** `coverageAnalysis: "perTest"` wasn't working correctly with jest-expo. The coverage mapping between tests and source files wasn't being established.

**Fix:** Changed to `coverageAnalysis: "all"` which runs all tests for every mutant. Slower but reliable.

**Lesson:** Start with `coverageAnalysis: "all"` for unknown setups, then optimize to "perTest" once working. The "perTest" mode requires proper coverage instrumentation that may not work with all Jest presets.

---

## 2026-01-22 - Static mutants warning (90%)

**Problem:** Stryker warned:
```
WARN MutantTestPlanner Detected 47 static mutants (90% of total)
```

**Context:** Static mutants are mutations in code that runs once at module load time (e.g., constant assignments, function definitions). They require running ALL tests because coverage can't determine which specific test covers them.

**Current approach:** Ignored for now. Can enable `ignoreStatic: true` if it becomes a performance issue.

**Lesson:** High static mutant percentage is common in modules with many top-level constants or logger setups. Consider moving initialization code into functions if it becomes a bottleneck.

---

## 2026-01-22 - Initial Wave 1 Results Analysis

**Baseline Results:**
- Total: 55% mutation score (target >80%)
- Killed: 20, Timeout: 2, Survived: 14, No Coverage: 4, Errors: 12
- varietyEngine.ts: 2 errors (needs investigation)

**Surviving Mutant Categories:**

1. **Logging-related (acceptable survivors):**
   - `logger.child({ module: '' })` - Empty module name
   - `log.debug("", {...})` - Empty log message
   - `log.perf("", {...})` - Empty perf message
   - These don't affect business logic

2. **Test gaps (need fixing):**
   - Filter for recently used: `availableIngredients.filter(...) → availableIngredients`
   - Condition: `if (availableIngredients.length === 0) → if (false)`
   - Arithmetic: `Math.random() * range → Math.random() / range`

3. **Shuffle function (hard to test):**
   - Loop condition: `i > 0 → i >= 0` or `i <= 0`
   - Random swap: Various arithmetic mutations
   - These are tricky because shuffle is non-deterministic

**Lesson:** Distinguish between:
- Logging survivors (acceptable - don't affect behavior)
- Logic survivors (must kill - indicate weak tests)
- Algorithm survivors (may be equivalent mutants)

---

## Next Steps

1. Investigate varietyEngine.ts errors
2. Add tests to kill the filter-related survivors
3. Consider mocking Math.random for shuffle tests
4. Decide on logging mutant policy (ignore vs test)

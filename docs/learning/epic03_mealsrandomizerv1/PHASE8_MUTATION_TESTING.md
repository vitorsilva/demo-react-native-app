# Phase 8: Mutation Testing

[← Back to Overview](./OVERVIEW.md)

---

## ⚠️ SESSION START CHECKLIST (Read First!)

Before doing ANY work, complete these steps:

1. **Note your starting context level** - Ask the user or estimate based on conversation length
2. **Find "Current Progress" section below** - Identify the next pending task
3. **After EACH task completion:**
   - Mark task complete ([ ] → [x])
   - Commit your changes
   - Check context usage (if approaching 67%, STOP and checkpoint)
4. **If context ≥ 67%:**
   - Update "Current Progress" section with checkpoint info
   - Tell user: "Context is at ~X%. Recommend `/clear` and fresh session."
   - Do NOT continue working

**How to estimate context usage:**
- Session just started from `/clear` = ~5-10%
- After reading this plan = ~15-20%
- After 2-3 tasks completed = ~40-50%
- After 4-5 tasks completed = ~60-67%
- If conversation feels long or you're forgetting earlier details = likely >67%

**When in doubt, ask the user:** "What's the current context usage percentage?"

---

## Goal

Implement mutation testing to validate the effectiveness and quality of SaborSpin's test suite. Mutation testing systematically introduces small code changes (mutations) and verifies that tests catch them. Surviving mutants indicate gaps in test coverage or quality.

**Status:** PLAN COMPLETE - Ready for Implementation

---

## Research Summary

### What is Mutation Testing?

Mutation testing introduces small changes (mutations) to your codebase and checks if existing tests catch those changes:
- **Killed Mutant**: Test fails when mutation is applied (good - test caught it)
- **Survived Mutant**: Test passes despite mutation (gap - test didn't catch it)
- **No Coverage**: Mutant not covered by any test
- **Equivalent Mutant**: Mutation doesn't change behavior (acceptable survivor)

### Why Mutation Testing for SaborSpin?

1. **Validate test quality** - 139 tests exist, but are they catching real bugs?
2. **Find blind spots** - Identify untested code paths and edge cases
3. **Improve confidence** - Higher mutation score = more reliable codebase
4. **Learning opportunity** - Understand test effectiveness patterns

### Tool Selection: StrykerJS

**StrykerJS** (v9.x) is the only mature mutation testing framework for JavaScript/TypeScript. It offers:
- Full TypeScript support with type-safe mutations
- Jest runner integration (critical for jest-expo)
- Per-test coverage analysis for optimal performance
- Incremental mode for faster CI runs
- HTML reports for detailed analysis

**Alternatives Considered:**
- **mutode**: Abandoned, last release 2019
- **mutagen**: .NET only
- **PITest**: Java only

**Decision**: StrykerJS is the clear choice (no viable alternatives for JS/TS).

---

## LLM Context Management Protocol

### Problem

When executing long implementation sessions, LLM quality degrades significantly when:
1. **Auto-compact triggers** (~80% context) - summarization loses important details
2. **Session ends** - new session starts without prior context

### Solution: Checkpoint Before Compact

**Rule:** At ~67% context usage, STOP execution, mark progress in this plan, and start fresh session.

**Why this works:**
- This plan document IS the context - it contains everything needed
- Each task is self-contained with full context inline
- Fresh session reads plan → continues from marked progress
- Zero quality degradation (never reaches auto-compact)

### Execution Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. READ this plan → find next pending task (marked [ ])    │
│  2. EXECUTE task (all context is already in the task)       │
│  3. MARK complete ([ ] → [x]) and commit                    │
│  4. CHECK context usage                                      │
│     └─ If < 67%: continue to next task                      │
│     └─ If ≥ 67%: update progress below, then /clear         │
│  5. NEW SESSION reads plan → continues from step 1          │
└─────────────────────────────────────────────────────────────┘
```

### Current Progress

**Last checkpoint:** Not started
**Next action:** Begin Phase 8.1, Step 1 (Install Stryker packages)
**Blockers:** None

### Incremental Commits (Not at the End!)

**Rule:** Commit after each logical unit of work, NOT at the end of everything.

**Why:**
- Smaller commits are easier to review and revert
- Progress is saved even if session ends unexpectedly
- Each commit message documents what was done
- Enables checkpoint/resume workflow

**Pattern:**
```
1. Complete a task (or logical chunk)
2. Run verification (tests, lint, TypeScript)
3. Commit with descriptive message
4. Update progress marker if needed
5. Continue to next task
```

### Learning Notes (Document As You Go!)

**Rule:** Document problems, errors, and fixes IMMEDIATELY when they occur, not at the end.

**Location:** Create/update `PHASE8_LEARNING_NOTES.md` in this folder.

**What to document:**
- ❌ **Unexpected errors** - What went wrong, error messages
- 🔍 **Root cause** - Why it happened (if discovered)
- ✅ **Fix/Workaround** - How it was resolved
- 💡 **Gotcha** - Things that weren't obvious, future warnings
- 📚 **Lesson learned** - What to do differently next time

**Template:**
```markdown
### [Date] - [Brief title]

**Problem:** [What went wrong]

**Error:** [Exact error message if applicable]

**Root cause:** [Why it happened]

**Fix:** [How it was resolved]

**Lesson:** [What to remember for next time]
```

**When to write:**
- Immediately after encountering and fixing a problem
- Before moving to the next task
- Part of the commit cycle (problem → fix → document → commit)

### Self-Contained Task Requirements

Each task in this plan includes:
- ✅ **What to do** - Clear, actionable steps
- ✅ **Full code** - Complete code blocks, not snippets
- ✅ **File paths** - Exact locations for all files
- ✅ **Dependencies** - What must exist before this task
- ✅ **Verification** - How to confirm task is complete

A fresh LLM session should be able to execute ANY task by reading only that task's section.

---

## Technical Configuration

### Packages to Install

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner @stryker-mutator/typescript-checker
```

**Package Versions (as of Jan 2026):**
- `@stryker-mutator/core`: ^9.x
- `@stryker-mutator/jest-runner`: ^9.x
- `@stryker-mutator/typescript-checker`: ^9.x

### Stryker Configuration

Create `stryker.config.json` in `demo-react-native-app/`:

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "jest",
  "jest": {
    "projectType": "custom",
    "configFile": "jest.config.js"
  },
  "checkers": ["typescript"],
  "tsconfigFile": "tsconfig.json",
  "coverageAnalysis": "perTest",
  "reporters": ["html", "clear-text", "progress"],
  "htmlReporter": {
    "fileName": "reports/mutation/index.html"
  },
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": null
  },
  "timeoutMS": 15000,
  "concurrency": 4,
  "incremental": true,
  "incrementalFile": "reports/stryker-incremental.json"
}
```

**Key Configuration Decisions:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| `projectType` | `"custom"` | Required for jest-expo (not CRA) |
| `coverageAnalysis` | `"perTest"` | Only runs tests covering each mutant (fastest) |
| `checkers` | `["typescript"]` | Filters out mutations that don't compile |
| `incremental` | `true` | Reuses previous results for faster runs |
| `thresholds.break` | `null` | Don't fail builds initially (learning phase) |
| `concurrency` | `4` | Balance between speed and CPU usage |

### npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:mutation": "stryker run",
    "test:mutation:core": "stryker run stryker.core.json",
    "test:mutation:db": "stryker run stryker.db.json"
  }
}
```

---

## Scope Analysis

### Files to Mutate (Production Code)

Based on codebase analysis, here are the mutation testing candidates:

#### Wave 1: Core Business Logic (Highest Priority)

| File | Lines | Est. Mutants | Existing Tests |
|------|-------|--------------|----------------|
| `lib/business-logic/combinationGenerator.ts` | 108 | 35-50 | 6+ tests |
| `lib/business-logic/varietyEngine.ts` | 26 | 8-12 | 4+ tests |
| **Total Wave 1** | 134 | 43-62 | 10+ tests |

**Why Priority:**
- Core meal suggestion algorithm
- Pure functions (no side effects)
- Well-tested already
- Quick feedback loop

#### Wave 2: Validation Logic (Medium Priority)

| File | Lines | Est. Mutants | Existing Tests |
|------|-------|--------------|----------------|
| `lib/database/validation.ts` | 333 | 80-120 | 30+ tests |
| **Total Wave 2** | 333 | 80-120 | 30+ tests |

**Why Priority:**
- Critical for data integrity
- Complex conditional logic (good mutation targets)
- Comprehensive test suite exists

#### Wave 3: Database Operations (Lower Priority)

| File | Lines | Est. Mutants | Existing Tests |
|------|-------|--------------|----------------|
| `lib/database/ingredients.ts` | ~150 | 40-60 | 10+ tests |
| `lib/database/mealLogs.ts` | ~80 | 20-30 | 7+ tests |
| `lib/database/preferences.ts` | ~90 | 25-35 | 7+ tests |
| `lib/database/categories.ts` | ~80 | 20-30 | 7+ tests |
| `lib/database/mealTypes.ts` | ~100 | 25-40 | 9+ tests |
| **Total Wave 3** | ~500 | 130-195 | 40+ tests |

**Why Lower Priority:**
- CRUD operations (simpler logic)
- Integration-heavy (database calls)
- Slower mutation testing

#### Wave 4: Telemetry (Optional)

| File | Lines | Est. Mutants | Existing Tests |
|------|-------|--------------|----------------|
| `lib/telemetry/logger.ts` | ~170 | 40-60 | 50+ tests |
| `lib/telemetry/SaberloopSpanExporter.ts` | ~160 | 35-55 | 16+ tests |
| **Total Wave 4** | ~330 | 75-115 | 66+ tests |

**Why Optional:**
- Telemetry code is less critical
- External dependencies (harder to test)
- May have many equivalent mutants

### Files NOT to Mutate

| Category | Files | Reason |
|----------|-------|--------|
| UI Screens | `app/**/*.tsx` | Use E2E tests instead |
| Components | `components/**/*.tsx` | UI rendering (E2E coverage) |
| Type Definitions | `types/**/*.ts` | No runtime behavior |
| Adapters | `lib/database/adapters/*.ts` | Platform-specific, integration |
| Schema | `lib/database/schema.ts` | DDL statements only |
| Migrations | `lib/database/migrations.ts` | One-time operations |
| Store | `lib/store/index.ts` | Zustand wiring (integration) |
| Mocks | `**/__mocks__/**` | Test infrastructure |
| Test Files | `**/*.test.ts` | Not production code |

---

## Implementation Plan

### Phase 8.1: Setup (Est. 1-2 hours)

**Goal:** Configure Stryker and verify it works

**Steps:**
1. Install Stryker packages
2. Create `stryker.config.json` with Wave 1 scope only
3. Run initial mutation test on `varietyEngine.ts` (smallest file)
4. Verify Jest integration works with jest-expo
5. Review HTML report structure
6. Commit: "chore: add Stryker mutation testing configuration"

**Success Criteria:**
- `npm run test:mutation` executes without errors
- HTML report generated in `reports/mutation/`
- Initial mutation score visible

> **🔄 CHECKPOINT:** After completing Phase 8.1, check context usage. If ≥67%, update "Current Progress" and suggest `/clear`.

### Phase 8.2: Wave 1 - Core Logic (Est. 2-4 hours)

**Goal:** Achieve >80% mutation score for core business logic

**Files:**
- `lib/business-logic/combinationGenerator.ts`
- `lib/business-logic/varietyEngine.ts`

**Steps:**
1. Run mutation testing on Wave 1 files
2. Analyze surviving mutants
3. For each surviving mutant:
   - Determine if it's an equivalent mutant (can't be killed)
   - Or add/improve test to kill it
4. Re-run and verify improvement
5. Document patterns discovered
6. Commit: "test: improve business logic tests (mutation testing)"

**Expected Mutation Types:**
- Arithmetic operators (+, -, *, /)
- Comparison operators (>, <, >=, <=, ===)
- Boolean negation (!condition)
- Array bounds (off-by-one errors)
- Return value removal

> **🔄 CHECKPOINT:** After completing Phase 8.2, check context usage. If ≥67%, update "Current Progress" and suggest `/clear`.

**Stryker Config (Wave 1):**
```json
// stryker.core.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "extends": "./stryker.config.json",
  "mutate": [
    "lib/business-logic/combinationGenerator.ts",
    "lib/business-logic/varietyEngine.ts"
  ]
}
```

### Phase 8.3: Wave 2 - Validation (Est. 2-3 hours)

**Goal:** Achieve >75% mutation score for validation logic

**Files:**
- `lib/database/validation.ts`

**Steps:**
1. Create `stryker.validation.json` config
2. Run mutation testing
3. Focus on:
   - Boundary conditions (min <= max)
   - Empty string checks
   - Error message accuracy
4. Add tests for edge cases
5. Commit: "test: improve validation tests (mutation testing)"

> **🔄 CHECKPOINT:** After completing Phase 8.3, check context usage. If ≥67%, update "Current Progress" and suggest `/clear`.

### Phase 8.4: Wave 3 - Database (Est. 3-5 hours)

**Goal:** Achieve >70% mutation score for database operations

**Files:**
- `lib/database/ingredients.ts`
- `lib/database/mealLogs.ts`
- `lib/database/preferences.ts`
- `lib/database/categories.ts`
- `lib/database/mealTypes.ts`

**Steps:**
1. Create `stryker.db.json` config
2. Run mutation testing
3. Focus on:
   - SQL query correctness
   - Parameter handling
   - Return value types
4. Add tests for uncovered paths
5. Commit: "test: improve database tests (mutation testing)"

> **🔄 CHECKPOINT:** After completing Phase 8.4, check context usage. If ≥67%, update "Current Progress" and suggest `/clear`.

### Phase 8.5: Documentation & CI (Est. 1-2 hours)

**Goal:** Document learnings and optionally add to CI

**Steps:**
1. Create `MUTATION_TESTING.md` in `docs/developer-guide/`
2. Document:
   - How to run mutation tests
   - Interpreting results
   - Common patterns for killing mutants
3. Update `docs/README.md` navigation
4. (Optional) Add weekly mutation test CI job
5. Commit: "docs: add mutation testing guide"

---

## Success Criteria

| Metric | Target | Notes |
|--------|--------|-------|
| Wave 1 Mutation Score | >80% | Core algorithms |
| Wave 2 Mutation Score | >75% | Validation logic |
| Wave 3 Mutation Score | >70% | Database operations |
| Overall Mutation Score | >75% | All mutated files |
| New Tests Added | 10-30 | To kill surviving mutants |
| Documentation | Complete | Guide for future use |

---

## Estimated Effort

| Phase | Effort | Description |
|-------|--------|-------------|
| 8.1 Setup | 1-2 hours | Install, configure, verify |
| 8.2 Wave 1 | 2-4 hours | Core logic (highest value) |
| 8.3 Wave 2 | 2-3 hours | Validation logic |
| 8.4 Wave 3 | 3-5 hours | Database operations |
| 8.5 Docs | 1-2 hours | Documentation |
| **Total** | **9-16 hours** | Spread across sessions |

---

## Git Strategy

**Branch:** `feature/phase8-mutation-testing`

**Commits:**
1. `chore: add Stryker mutation testing configuration`
2. `test: improve business logic tests (mutation testing)`
3. `test: improve validation tests (mutation testing)`
4. `test: improve database tests (mutation testing)`
5. `docs: add mutation testing guide`

**PR Strategy:** Merge after each wave completion (or all at once)

---

## Key Learnings from Saberloop

Patterns that worked well in the Saberloop project (reference only):

1. **Start small** - Begin with 1-2 pure function files
2. **Use perTest coverage** - Much faster than other modes
3. **Separate configs** - Allow targeted mutation runs
4. **Accept equivalent mutants** - Not every mutant is worth killing
5. **Document patterns** - What test patterns kill which mutations
6. **Track progress** - Watch scores improve over time

**Key differences for SaborSpin:**
- Using Jest (not Vitest) - different runner config
- Using jest-expo preset - may need special handling
- Smaller codebase - can be more thorough

---

## Potential Challenges

### 1. Jest-Expo Integration

**Risk:** Stryker may have issues with jest-expo preset

**Mitigation:**
- Use `projectType: "custom"` with explicit config path
- Ensure `transformIgnorePatterns` are preserved
- Test on smallest file first

### 2. Slow Test Runs

**Risk:** Mutation testing can be slow (each mutant = full test run)

**Mitigation:**
- Use `coverageAnalysis: "perTest"` (only runs related tests)
- Use incremental mode for subsequent runs
- Split into waves for manageable sessions

### 3. Many Surviving Mutants

**Risk:** Initial run may show many survivors, overwhelming

**Mitigation:**
- Focus on one file at a time
- Categorize survivors: fixable vs equivalent
- Set realistic targets (80%, not 100%)

### 4. TypeScript Compilation

**Risk:** Some mutations may cause TypeScript errors

**Mitigation:**
- Enable TypeScript checker (`checkers: ["typescript"]`)
- Ensures only valid mutations are tested

---

## References

### Official Documentation
- [Stryker Mutator](https://stryker-mutator.io/)
- [StrykerJS Configuration](https://stryker-mutator.io/docs/stryker-js/configuration/)
- [Jest Runner](https://stryker-mutator.io/docs/stryker-js/jest-runner/)
- [Incremental Mode](https://stryker-mutator.io/docs/stryker-js/incremental/)
- [TypeScript Checker](https://stryker-mutator.io/docs/stryker-js/typescript-checker/)

### Tutorials
- [StrykerJS with Jest and TypeScript](https://yumasoft.pl/how-to-use-strykerjs-with-jest-and-typescript-3/)
- [Mutation Testing Tutorial](https://krython.com/tutorial/typescript/mutation-testing-stryker-mutator/)
- [Sentry's JS SDK Mutation Testing](https://sentry.engineering/blog/js-mutation-testing-our-sdks)

### Research (Jan 2026)
- StrykerJS v9.x is the only mature option for JS/TS
- Incremental mode significantly speeds up CI integration
- Per-test coverage analysis is the fastest mode
- TypeScript checker prevents invalid mutants

---

## Learning Outcomes

After completing Phase 8, you will understand:

1. **Mutation testing concepts** - Mutants, killing, survival, scores
2. **Test quality assessment** - What makes a test effective
3. **Coverage gaps** - Finding untested code paths
4. **Test patterns** - Which assertions catch which mutations
5. **Tool proficiency** - StrykerJS configuration and usage

---

*Plan created: 2026-01-22*
*Status: Ready for implementation*

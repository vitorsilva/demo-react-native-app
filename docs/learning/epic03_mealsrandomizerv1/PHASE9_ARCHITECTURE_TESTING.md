# Phase 9: Architecture Testing

[← Back to Overview](./OVERVIEW.md)

---

## Goal

Implement architecture testing to enforce and validate layer boundaries, ensuring SaborSpin's clean architecture is maintained as the codebase grows. Architecture tests act as "fitness functions" that automatically catch violations before they reach production.

**Status:** PLAN COMPLETE - Ready for Implementation

---

## Research Summary

### What is Architecture Testing?

Architecture testing automatically validates that code follows architectural rules:
- **Layer boundaries** - UI cannot import database directly
- **Dependency direction** - Dependencies flow one way (UI → Logic → Data)
- **No circular dependencies** - A → B → A patterns detected
- **Module isolation** - Components stay presentational

### Why Architecture Testing for SaborSpin?

1. **Prevent architectural drift** - As features are added, rules are enforced
2. **Protect clean architecture** - Current codebase has no violations (keep it that way!)
3. **Fast feedback** - IDE shows violations immediately
4. **Documentation** - Rules serve as living architecture documentation
5. **Learning** - Understand dependency management principles

### Current Architecture Analysis

SaborSpin has a clean, well-structured architecture:

```
┌─────────────────────────────────────────────────┐
│  UI LAYER (app/, components/)                   │
│  - Screens, components, hooks                   │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  STATE LAYER (lib/store/)                       │
│  - Zustand store (central hub)                  │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  BUSINESS LOGIC (lib/business-logic/)           │
│  - Pure functions (combinationGenerator, etc.)  │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  DATA LAYER (lib/database/)                     │
│  - CRUD operations, adapters, validation        │
│  ↓ imports from                                 │
├─────────────────────────────────────────────────┤
│  TYPES (types/)                                 │
│  - Shared TypeScript definitions                │
└─────────────────────────────────────────────────┘
│  TELEMETRY (lib/telemetry/) - Cross-cutting     │
│  - Can be imported from any layer               │
└─────────────────────────────────────────────────┘
```

**Current Status:** NO circular dependencies, clean layer separation

---

## Tool Selection

### Tools Evaluated

| Tool | Type | Pros | Cons |
|------|------|------|------|
| **dependency-cruiser** | CLI + Config | Mature, visualization, comprehensive | Config complexity |
| **ts-arch** | Test-based API | Fluent syntax, Jest integration | Less visualization |
| **ArchUnitTS** | Test-based API | Similar to ts-arch | Newer, less mature |
| **eslint-plugin-boundaries** | ESLint plugin | IDE integration, instant feedback | Less visualization |
| **eslint-plugin-import** | ESLint plugin | Already common, simple | Limited rule types |

### Recommendation: Dual-Tool Approach

For SaborSpin, I recommend using **two complementary tools**:

1. **dependency-cruiser** (v17.x) - For CI validation and visualization
2. **eslint-plugin-boundaries** - For real-time IDE feedback

**Rationale:**
- **IDE feedback** - eslint-plugin-boundaries catches violations as you type
- **CI validation** - dependency-cruiser provides comprehensive checks
- **Visualization** - dependency-cruiser generates architecture diagrams
- **Existing tooling** - SaborSpin already uses ESLint

This differs from Saberloop (which uses dependency-cruiser only) because:
- SaborSpin is smaller, simpler rules suffice for ESLint
- React Native developers benefit from IDE integration
- Dual approach provides defense in depth

---

## LLM Context Management Protocol

### Problem

When executing long implementation sessions, LLM quality degrades significantly when:
1. **Auto-compact triggers** (~80% context) - summarization loses important details
2. **Session ends** - new session starts without prior context

### Solution: Checkpoint Before Compact

**Rule:** At ~75% context usage, STOP execution, mark progress in this plan, and start fresh session.

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
│     └─ If < 75%: continue to next task                      │
│     └─ If ≥ 75%: update progress below, then /clear         │
│  5. NEW SESSION reads plan → continues from step 1          │
└─────────────────────────────────────────────────────────────┘
```

### Current Progress

**Last checkpoint:** Not started
**Next action:** Begin Phase 9.1, Step 1 (Install dependency-cruiser and eslint-plugin-boundaries)
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

**Location:** Create/update `PHASE9_LEARNING_NOTES.md` in this folder.

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

## Architecture Rules to Enforce

### Layer Boundaries

| From Layer | Can Import | Cannot Import |
|------------|-----------|---------------|
| **app/** (screens) | lib/store, lib/telemetry, components, types, hooks | lib/database, lib/business-logic directly |
| **components/** | lib/telemetry, types, hooks, constants | lib/store, lib/database, lib/business-logic, app/ |
| **lib/store/** | lib/database/*, lib/business-logic/*, lib/telemetry, types | app/, components/ |
| **lib/business-logic/** | types, lib/telemetry | lib/database, lib/store, app/, components/ |
| **lib/database/** | types, lib/telemetry, lib/database/adapters | lib/store, lib/business-logic, app/, components/ |
| **lib/telemetry/** | External packages only | All other lib/, app/, components/ |
| **types/** | Nothing (type definitions only) | All |

### Specific Rules

1. **no-circular** - No circular dependencies anywhere
2. **no-orphans** - No unused modules (except config files)
3. **screens-through-store** - Screens must use store, not database directly
4. **components-presentational** - Components cannot import store or database
5. **business-logic-pure** - Business logic cannot import database
6. **database-independent** - Database cannot import store or business logic
7. **telemetry-one-way** - Telemetry doesn't depend on app code

---

## Technical Configuration

### Package Installation

```bash
npm install --save-dev dependency-cruiser eslint-plugin-boundaries
```

**Package Versions (as of Jan 2026):**
- `dependency-cruiser`: ^17.x
- `eslint-plugin-boundaries`: ^4.x

### dependency-cruiser Configuration

Create `.dependency-cruiser.cjs` in `demo-react-native-app/`:

```javascript
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ═══════════════════════════════════════════════════════════════
    // STANDARD RULES (from dependency-cruiser defaults)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies cause maintainability issues',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Unused modules should be removed',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // Config files
          '\\.d\\.ts$',                              // Type definitions
          '(^|/)tsconfig\\.json$',
          '(^|/)jest\\.config\\.(js|ts)$',
          '__mocks__',
          '__tests__',
          'e2e/'
        ]
      },
      to: {}
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'Production code cannot import test files',
      from: { pathNot: ['__tests__', '__mocks__', '\\.test\\.ts$', 'e2e/'] },
      to: { path: ['__tests__', '__mocks__', '\\.test\\.ts$'] }
    },

    // ═══════════════════════════════════════════════════════════════
    // SABORSPIN ARCHITECTURE RULES
    // ═══════════════════════════════════════════════════════════════

    // Rule 1: Screens must use store, not database directly
    {
      name: 'screens-through-store',
      severity: 'error',
      comment: 'Screens must access data through the store, not database directly',
      from: { path: '^app/' },
      to: { path: '^lib/database/' }
    },

    // Rule 2: Screens should not import business logic directly
    {
      name: 'screens-through-store-logic',
      severity: 'error',
      comment: 'Screens must access business logic through the store',
      from: { path: '^app/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 3: Components are presentational (no store, no database)
    {
      name: 'components-no-store',
      severity: 'error',
      comment: 'Components should be presentational, receive data via props',
      from: { path: '^components/' },
      to: { path: '^lib/store/' }
    },
    {
      name: 'components-no-database',
      severity: 'error',
      comment: 'Components should not access database directly',
      from: { path: '^components/' },
      to: { path: '^lib/database/' }
    },
    {
      name: 'components-no-business-logic',
      severity: 'error',
      comment: 'Components should not import business logic',
      from: { path: '^components/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 4: Business logic must be pure (no database imports)
    {
      name: 'business-logic-pure',
      severity: 'error',
      comment: 'Business logic should be pure functions, no database access',
      from: { path: '^lib/business-logic/' },
      to: { path: '^lib/database/' }
    },
    {
      name: 'business-logic-no-store',
      severity: 'error',
      comment: 'Business logic should not depend on store',
      from: { path: '^lib/business-logic/' },
      to: { path: '^lib/store/' }
    },

    // Rule 5: Database layer is independent
    {
      name: 'database-no-store',
      severity: 'error',
      comment: 'Database layer should not depend on store',
      from: { path: '^lib/database/' },
      to: { path: '^lib/store/' }
    },
    {
      name: 'database-no-business-logic',
      severity: 'error',
      comment: 'Database layer should not depend on business logic',
      from: { path: '^lib/database/' },
      to: { path: '^lib/business-logic/' }
    },

    // Rule 6: Telemetry is independent (one-way dependencies)
    {
      name: 'telemetry-independent',
      severity: 'error',
      comment: 'Telemetry should not depend on app-specific code',
      from: { path: '^lib/telemetry/' },
      to: {
        path: ['^app/', '^components/', '^lib/store/', '^lib/database/', '^lib/business-logic/']
      }
    },

    // Rule 7: Types are pure definitions
    {
      name: 'types-no-imports',
      severity: 'error',
      comment: 'Type files should only contain type definitions',
      from: { path: '^types/' },
      to: {
        path: ['^app/', '^components/', '^lib/'],
        pathNot: ['\\.d\\.ts$']
      }
    }
  ],

  options: {
    doNotFollow: {
      path: ['node_modules', '\\.git']
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)'
      },
      text: {
        highlightFocused: true
      }
    }
  }
};
```

### eslint-plugin-boundaries Configuration

Add to `eslint.config.js`:

```javascript
import boundaries from 'eslint-plugin-boundaries';

export default [
  // ... existing config
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**/*' },
        { type: 'components', pattern: 'components/**/*' },
        { type: 'store', pattern: 'lib/store/**/*' },
        { type: 'business-logic', pattern: 'lib/business-logic/**/*' },
        { type: 'database', pattern: 'lib/database/**/*' },
        { type: 'telemetry', pattern: 'lib/telemetry/**/*' },
        { type: 'types', pattern: 'types/**/*' },
        { type: 'hooks', pattern: 'hooks/**/*' },
        { type: 'constants', pattern: 'constants/**/*' }
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/__mocks__/**', '**/e2e/**']
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // App can import: store, telemetry, components, types, hooks, constants
          {
            from: 'app',
            allow: ['store', 'telemetry', 'components', 'types', 'hooks', 'constants']
          },
          // Components can import: telemetry, types, hooks, constants
          {
            from: 'components',
            allow: ['telemetry', 'types', 'hooks', 'constants', 'components']
          },
          // Store can import: database, business-logic, telemetry, types
          {
            from: 'store',
            allow: ['database', 'business-logic', 'telemetry', 'types']
          },
          // Business logic can import: types, telemetry
          {
            from: 'business-logic',
            allow: ['types', 'telemetry']
          },
          // Database can import: types, telemetry, database (internal)
          {
            from: 'database',
            allow: ['types', 'telemetry', 'database']
          },
          // Telemetry can only import external packages
          {
            from: 'telemetry',
            allow: ['telemetry']
          },
          // Types import nothing
          {
            from: 'types',
            allow: []
          },
          // Hooks can import: types, constants
          {
            from: 'hooks',
            allow: ['types', 'constants']
          },
          // Constants import nothing
          {
            from: 'constants',
            allow: []
          }
        ]
      }],
      'boundaries/no-unknown': 'warn',
      'boundaries/no-unknown-files': 'warn'
    }
  }
];
```

### npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "arch:test": "depcruise app lib components types hooks constants --config .dependency-cruiser.cjs",
    "arch:graph": "depcruise app lib components types hooks constants --output-type dot --config .dependency-cruiser.cjs | dot -Tsvg > architecture.svg",
    "arch:report": "depcruise app lib components types hooks constants --output-type html --config .dependency-cruiser.cjs > reports/architecture/index.html"
  }
}
```

---

## Implementation Plan

### Phase 9.1: Setup (Est. 1-2 hours)

**Goal:** Install tools and create initial configuration

**Steps:**
1. Install dependency-cruiser and eslint-plugin-boundaries
2. Create `.dependency-cruiser.cjs` with basic rules
3. Run initial analysis to verify no existing violations
4. Add eslint-plugin-boundaries to ESLint config
5. Verify ESLint integration works
6. Commit: "chore: add architecture testing tools"

**Success Criteria:**
- `npm run arch:test` runs without errors
- No violations in current codebase
- ESLint shows no boundary violations

### Phase 9.2: Core Rules (Est. 2-3 hours)

**Goal:** Implement all layer boundary rules

**Steps:**
1. Add screens-through-store rule
2. Add components-presentational rules
3. Add business-logic-pure rules
4. Add database-independent rules
5. Add telemetry-one-way rule
6. Verify all rules pass on current codebase
7. Commit: "feat: add architecture layer boundary rules"

**Verification:**
```bash
# Should report 0 violations
npm run arch:test

# Should show clean architecture diagram
npm run arch:graph
```

### Phase 9.3: Visualization (Est. 1-2 hours)

**Goal:** Generate and document architecture diagrams

**Steps:**
1. Install Graphviz (for SVG generation)
2. Generate architecture diagram
3. Create `reports/architecture/` directory
4. Add HTML report generation
5. Document how to read the diagrams
6. Commit: "feat: add architecture visualization"

**Output:**
- `architecture.svg` - Visual dependency graph
- `reports/architecture/index.html` - Detailed HTML report

### Phase 9.4: CI Integration (Est. 1-2 hours)

**Goal:** Add architecture checks to CI/CD

**Steps:**
1. Add arch:test to pre-commit hook (optional)
2. Add arch:test to GitHub Actions workflow
3. Configure to fail on violations
4. Test with intentional violation (then revert)
5. Commit: "ci: add architecture validation to workflow"

**GitHub Actions Addition:**
```yaml
- name: Check architecture rules
  run: npm run arch:test
```

### Phase 9.5: Documentation (Est. 1-2 hours)

**Goal:** Document architecture rules and how to use them

**Steps:**
1. Create `docs/developer-guide/ARCHITECTURE_RULES.md`
2. Document all rules with examples
3. Document how to fix common violations
4. Add visualization instructions
5. Update `docs/README.md` navigation
6. Commit: "docs: add architecture rules documentation"

---

## Success Criteria

| Metric | Target | Notes |
|--------|--------|-------|
| Existing violations | 0 | Current codebase is clean |
| Rules implemented | 10+ | All layer boundaries covered |
| CI integration | Complete | Blocks PRs with violations |
| Documentation | Complete | Developer guide created |
| Visualization | Working | SVG diagram generated |

---

## Estimated Effort

| Phase | Effort | Description |
|-------|--------|-------------|
| 9.1 Setup | 1-2 hours | Install, basic config |
| 9.2 Core Rules | 2-3 hours | All boundary rules |
| 9.3 Visualization | 1-2 hours | Diagrams, reports |
| 9.4 CI Integration | 1-2 hours | GitHub Actions |
| 9.5 Documentation | 1-2 hours | Developer guide |
| **Total** | **6-11 hours** | Spread across sessions |

---

## Git Strategy

**Branch:** `feature/phase9-architecture-testing`

**Commits:**
1. `chore: add architecture testing tools`
2. `feat: add architecture layer boundary rules`
3. `feat: add architecture visualization`
4. `ci: add architecture validation to workflow`
5. `docs: add architecture rules documentation`

**PR Strategy:** Single PR after all phases complete

---

## Key Learnings from Saberloop

Patterns that worked well (reference only):

1. **Gradual enforcement** - Start with warnings, convert to errors
2. **Clear rule naming** - `screens-through-store` is self-documenting
3. **Multiple severity levels** - error (blocking), warn (advisory)
4. **Comprehensive documentation** - Rules serve as architecture docs
5. **CI integration** - Catch violations before merge

**Key differences for SaborSpin:**
- Using dual-tool approach (dep-cruiser + ESLint boundaries)
- Simpler architecture (fewer layers than Saberloop)
- No existing violations (start strict from day one)
- React Native/Expo specific considerations

---

## Potential Challenges

### 1. Graphviz Installation (Windows)

**Risk:** Graphviz needed for SVG generation may be tricky on Windows

**Mitigation:**
- Use `choco install graphviz` or download installer
- HTML report works without Graphviz
- Can generate DOT file and use online converter

### 2. ESLint Flat Config Compatibility

**Risk:** eslint-plugin-boundaries may need adjustment for flat config

**Mitigation:**
- Check plugin documentation for ESLint 9 support
- Fall back to dependency-cruiser only if needed
- Plugin supports ESLint 9 as of v4.x

### 3. Path Resolution in Expo

**Risk:** Expo's module resolution may confuse dependency-cruiser

**Mitigation:**
- Configure tsConfig option to use project's tsconfig.json
- Add path aliases to enhancedResolveOptions
- Test thoroughly with `npm run arch:test`

### 4. Test File Exclusions

**Risk:** Test files may trigger false positives

**Mitigation:**
- Exclude `__tests__`, `__mocks__`, `e2e/` from rules
- Configure `boundaries/ignore` in ESLint
- Use `pathNot` patterns in dependency-cruiser

---

## References

### Official Documentation
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)
- [dependency-cruiser Rules Reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md)
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [ts-arch](https://github.com/ts-arch/ts-arch) (alternative)
- [ArchUnitTS](https://lukasniessen.github.io/ArchUnitTS/) (alternative)

### Tutorials & Articles
- [Validate Dependencies According to Clean Architecture](https://betterprogramming.pub/validate-dependencies-according-to-clean-architecture-743077ea084c)
- [6 Tools for Enforcing Good Web Architecture](https://jmulholland.com/architecture-tools/)
- [Ensuring dependency rules with eslint-plugin-boundaries](https://medium.com/@taynan_duarte/ensuring-dependency-rules-in-a-nodejs-application-with-typescript-using-eslint-plugin-boundaries-68b70ce32437)

### Research (Jan 2026)
- dependency-cruiser v17.x is mature and actively maintained
- eslint-plugin-boundaries v4.x supports ESLint 9 flat config
- Dual-tool approach provides defense in depth
- Visualization helps communicate architecture to team

---

## Learning Outcomes

After completing Phase 9, you will understand:

1. **Architecture fitness functions** - Automated rule enforcement
2. **Layer boundaries** - Clean architecture principles
3. **Dependency management** - One-way dependency flow
4. **Visualization** - Communicating architecture visually
5. **CI/CD integration** - Preventing violations at merge time

---

## Architecture Diagram (Target)

```
                    ┌─────────────────┐
                    │     app/        │
                    │   (Screens)     │
                    └────────┬────────┘
                             │ imports
                             ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│ components/ │◄────│   lib/store/    │     │   hooks/    │
│(Presentat.) │     │   (Zustand)     │     │  constants/ │
└─────────────┘     └───┬─────────┬───┘     └─────────────┘
                        │         │
            ┌───────────┘         └───────────┐
            ▼                                 ▼
┌───────────────────┐               ┌─────────────────────┐
│ lib/business-     │               │    lib/database/    │
│ logic/            │               │                     │
│ (Pure functions)  │               │ ┌─────────────────┐ │
└─────────┬─────────┘               │ │    adapters/    │ │
          │                         │ │ (native/web)    │ │
          │                         │ └─────────────────┘ │
          │                         └──────────┬──────────┘
          │                                    │
          └──────────────┬─────────────────────┘
                         ▼
                 ┌───────────────┐
                 │    types/     │
                 │ (Definitions) │
                 └───────────────┘

    ┌─────────────────────────────────────────────────────┐
    │              lib/telemetry/ (Cross-cutting)         │
    │         Can be imported from any module             │
    └─────────────────────────────────────────────────────┘
```

---

*Plan created: 2026-01-22*
*Status: Ready for implementation*

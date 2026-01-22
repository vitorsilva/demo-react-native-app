# Phase 7: Internationalization (i18n)

[← Back to Overview](./OVERVIEW.md)

---

## Goal

Add multi-language support to SaborSpin, enabling users to experience the app in their preferred language.

**Status:** In Progress

---

## Research Summary

### Saberloop i18n Patterns (Reference Implementation)
**Saberloop** (`demo-pwa-app`) is a JavaScript PWA with comprehensive i18n. Key patterns to replicate:

| Pattern | Saberloop Implementation |
|---------|--------------------------|
| Library | **i18next** (v25.7.3) + browser language detector |
| Persistence | **localStorage** (`i18nextLng` key) |
| Translation files | `/public/locales/*.json` (namespace-based) |
| Module | Single `src/core/i18n.js` (207 lines) |
| Tests | `src/core/i18n.test.js` (484 lines, comprehensive) |
| Languages | 9 languages including pt-PT |

**Key Saberloop exports to replicate:**
- `initI18n()` - Initialize (called once at startup)
- `t(key, options)` - Translate with interpolation
- `changeLanguage(lang)` - Switch and persist
- `getCurrentLanguage()` - Get current
- `SUPPORTED_LANGUAGES` - Language metadata array

### Best Practices (2026)
Based on [Expo Documentation](https://docs.expo.dev/guides/localization/), [react-i18next](https://react.i18next.com/), and Saberloop patterns:

| Approach | Recommendation |
|----------|----------------|
| Translation framework | **i18next + react-i18next** (matches Saberloop) |
| Device locale detection | **expo-localization** (official Expo) |
| Language persistence | **AsyncStorage** (already in project) |
| Type safety | TypeScript module augmentation |

---

## Scope Analysis

### Strings to Translate: ~157

| File | Strings | Types |
|------|---------|-------|
| `settings.tsx` | ~45 | Labels, descriptions, errors |
| `manage-ingredients.tsx` | ~35 | Headers, placeholders, alerts |
| `manage-categories.tsx` | ~25 | Headers, labels, pluralization |
| `index.tsx` | ~15 | Headers, buttons, empty states |
| `history.tsx` | ~12 | Headers, date labels |
| `suggestions/[mealType].tsx` | ~15 | Headers, loading, errors |
| `_layout.tsx` | 5 | Tab titles |
| `ConfirmationModal.tsx` | 5 | Title, messages |

### Languages
- **English** (default)
- **Portuguese (Portugal) - pt-PT** - matches brand "SaborSpin" (sabor = flavor), same as Saberloop

### Decisions
- **RTL Support**: LTR only (English, Portuguese, Spanish). No RTL infrastructure needed.
- **Translation**: AI-assisted (Anthropic API) with human review for Portuguese strings.
- **Pattern**: Follow Saberloop's i18n.js module structure.

### Translation Workflow
Use Anthropic API for AI-assisted translation:
1. Create `.env` entry: `ANTHROPIC_API_KEY=your-key-here`
2. Use Claude to translate `en/*.json` → `pt-PT/*.json`
3. Human review and refinement
4. Automated completeness tests verify all keys exist

---

## Git Strategy

### Branch
```
feature/phase7-i18n
```

### Commit Strategy (Small, Focused Commits)
1. `chore(i18n): add i18next dependencies`
2. `feat(i18n): create i18n module with language detector`
3. `feat(i18n): add English translation files`
4. `test(i18n): add i18n module unit tests`
5. `feat(i18n): migrate tab layout translations`
6. `feat(i18n): migrate home screen translations`
7. `feat(i18n): migrate history screen with date formatting`
8. `feat(i18n): migrate confirmation modal`
9. `feat(i18n): add language picker to settings`
10. `feat(i18n): migrate settings screen translations`
11. `feat(i18n): migrate manage-ingredients screen`
12. `feat(i18n): migrate manage-categories screen`
13. `feat(i18n): migrate suggestions screen`
14. `feat(i18n): add Portuguese (pt-PT) translations`
15. `test(i18n): add translation completeness tests`
16. `test(e2e): add language switching E2E tests`
17. `docs(i18n): update PHASE7_I18N.md with implementation details`

### PR
- Create PR to `main` after all commits
- Include summary of changes and testing done

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

**Last checkpoint:** 2026-01-22 - Phase 7 COMPLETE
**Next action:** PR ready for review
**Commits this session:**
- feat(i18n): add language picker to settings and migrate translations
- feat(i18n): migrate manage-ingredients screen translations
- feat(i18n): migrate manage-categories screen translations
- feat(i18n): migrate suggestions screen translations
- feat(i18n): add Portuguese (pt-PT) translations
- docs(i18n): update progress marker for Phase 4
- test(i18n): add translation completeness tests
- test(e2e): add language switching E2E tests

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

**Location:** Create/update `PHASE7_LEARNING_NOTES.md` in this folder.

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

## Implementation Plan

### Folder Structure

```
lib/
└── i18n/
    ├── index.ts              # i18n configuration
    ├── languageDetector.ts   # Device locale detection
    ├── types.ts              # TypeScript types
    └── locales/
        ├── en/
        │   ├── common.json   # Buttons, labels
        │   ├── home.json
        │   ├── history.json
        │   ├── settings.json
        │   ├── ingredients.json
        │   ├── categories.json
        │   ├── suggestions.json
        │   └── errors.json
        ├── pt-PT/
        │   └── [same structure]
        └── index.ts          # Export all translations
hooks/
└── useLocale.ts              # Date formatting hook
types/
└── i18n.d.ts                 # Module augmentation
```

---

## Phased Execution

### Phase 0: Setup
- [x] Create branch: `git checkout -b feature/phase7-i18n`
- [x] Update this file with implementation plan
- [x] Commit: `docs(i18n): update PHASE7_I18N.md with implementation plan`

### Phase 1: Infrastructure (1-2 days)
- [x] Install: `npm install i18next react-i18next`
- [x] Commit: `chore(i18n): add i18next dependencies`
- [x] Create `lib/i18n/` folder structure (follow Saberloop pattern)
- [x] Implement `index.ts` (i18n config)
- [x] Implement `languageDetector.ts` (device locale + AsyncStorage)
- [x] Create `types.ts` (TypeScript types - in lib/i18n/)
- [x] Extract English strings to JSON files (9 namespaces)
- [x] Commit: `feat(i18n): create i18n module with language detector`
- [x] Add unit tests for i18n module (34 tests)
- [x] Commit: `test(i18n): add i18n module unit tests`
- **Verify:** `npm test` passes ✅ (173 tests, +34 new)

### Phase 2: Core Screens (2-3 days)
- [ ] Initialize i18n in `app/_layout.tsx`
- [ ] Migrate `app/(tabs)/_layout.tsx` (tab titles)
- [ ] Commit: `feat(i18n): migrate tab layout translations`
- [ ] Migrate `app/(tabs)/index.tsx` (home)
- [ ] Commit: `feat(i18n): migrate home screen translations`
- [ ] Create `hooks/useLocale.ts` for dates
- [ ] Migrate `app/(tabs)/history.tsx` (+ date formatting)
- [ ] Commit: `feat(i18n): migrate history screen with date formatting`
- [ ] Migrate `components/modals/ConfirmationModal.tsx`
- [ ] Commit: `feat(i18n): migrate confirmation modal`
- **Verify:** `npm test` passes, `npm run lint` passes

### Phase 3: Settings & Management (2-3 days)
- [ ] Add language picker to `settings.tsx`
- [ ] Commit: `feat(i18n): add language picker to settings`
- [ ] Migrate `app/(tabs)/settings.tsx`
- [ ] Commit: `feat(i18n): migrate settings screen translations`
- [ ] Migrate `app/(tabs)/manage-ingredients.tsx`
- [ ] Commit: `feat(i18n): migrate manage-ingredients screen`
- [ ] Migrate `app/(tabs)/manage-categories.tsx`
- [ ] Commit: `feat(i18n): migrate manage-categories screen`
- [ ] Migrate `app/suggestions/[mealType].tsx`
- [ ] Commit: `feat(i18n): migrate suggestions screen`
- **Verify:** `npm test` passes, all existing E2E tests pass

### Phase 4: Portuguese Translation (1-2 days)
- [ ] Create all `pt-PT/*.json` files (AI-assisted via Anthropic API)
- [ ] Review and refine translations
- [ ] Commit: `feat(i18n): add Portuguese (pt-PT) translations`
- [ ] Add translation completeness tests
- [ ] Commit: `test(i18n): add translation completeness tests`
- **Verify:** `npm test` passes, translation tests pass

### Phase 5: Testing & Polish (1-2 days)
- [ ] Add E2E tests for language switching (`e2e/i18n.spec.ts`)
- [ ] Commit: `test(e2e): add language switching E2E tests`
- [ ] Add Maestro tests (`maestro/i18n/`)
- [ ] Run full test suite: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run Maestro tests: `maestro test maestro/i18n/`
- [ ] Verify test coverage (must not decrease)
- [ ] Final documentation update
- [ ] Commit: `docs(i18n): finalize PHASE7_I18N.md`
- [ ] Create PR to `main`

---

## Key Implementation Details

### i18n Configuration (`lib/i18n/index.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { languageDetector } from './languageDetector';
import resources from './locales';

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
```

### Language Detector (uses expo-localization + AsyncStorage)
```typescript
// Detects: stored preference → device locale → fallback to 'en'
// Maps pt-* variants to 'pt-PT'
```

### Pluralization (i18next handles automatically)
```json
{
  "ingredientCount_one": "{{count}} ingredient",
  "ingredientCount_other": "{{count}} ingredients"
}
```

### Usage in Components
```typescript
const { t } = useTranslation('categories');
<Text>{t('title')}</Text>
<Text>{t('ingredientCount', { count: 5 })}</Text>
```

---

## Special Cases

| Pattern | Solution |
|---------|----------|
| Pluralization | i18next `_one`/`_other` suffixes |
| Interpolation | `{{variable}}` syntax |
| Dates | `hooks/useLocale.ts` with locale-aware `toLocaleDateString` |
| Alerts | `t('namespace:key')` for title/message/buttons |
| User content | NOT translated (ingredient/category/meal type names) |

---

## Critical Files to Modify

1. **`app/_layout.tsx`** - Add I18nextProvider wrapper
2. **`app/(tabs)/settings.tsx`** - Add language picker UI
3. **`app/(tabs)/manage-ingredients.tsx`** - Most complex migration
4. **`app/(tabs)/manage-categories.tsx`** - Pluralization examples
5. **`app/(tabs)/history.tsx`** - Date formatting refactor

---

## Settings Screen UI Changes

### Current UI (Before i18n)

```
┌─────────────────────────────────────┐
│           Settings                  │
├─────────────────────────────────────┤
│                                     │
│  Global Preferences                 │
│  ┌─────────────────────────────────┐│
│  │ Variety Cooldown        3 days ││
│  │ How many days to wait...       ││
│  │ [━━━━━━●━━━━━━━━━━━━━━━━━━━━━] ││
│  │ 1 day                   7 days ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Number of Suggestions       4  ││
│  │ How many meal combinations...  ││
│  │ [━━━━━━━━━━━━●━━━━━━━━━━━━━━━] ││
│  │ 2                           6  ││
│  └─────────────────────────────────┘│
│                                     │
│  Meal Types                 [+Add] │
│  Configure meal types and their...  │
│  ┌─────────────────────────────────┐│
│  │ Breakfast              [ON] ▼  ││
│  │ 2-4 ingredients | 3d cooldown  ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Snack                  [ON] ▼  ││
│  │ 2-4 ingredients | 3d cooldown  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ ℹ️ About These Settings         ││
│  │ Global Preferences: Apply to...││
│  │ Meal Types: Each type can...   ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Proposed UI (After i18n)

```
┌─────────────────────────────────────┐
│           Settings                  │
├─────────────────────────────────────┤
│                                     │
│  Language                           │  ◄── NEW SECTION
│  ┌─────────────────────────────────┐│
│  │ 🇬🇧 English              ✓     ││  ◄── Selected
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🇵🇹 Português                   ││
│  └─────────────────────────────────┘│
│                                     │
│  Global Preferences                 │
│  ┌─────────────────────────────────┐│
│  │ Variety Cooldown        3 days ││
│  │ How many days to wait...       ││
│  │ [━━━━━━●━━━━━━━━━━━━━━━━━━━━━] ││
│  │ 1 day                   7 days ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Number of Suggestions       4  ││
│  │ How many meal combinations...  ││
│  │ [━━━━━━━━━━━━●━━━━━━━━━━━━━━━] ││
│  │ 2                           6  ││
│  └─────────────────────────────────┘│
│                                     │
│  Meal Types                 [+Add] │
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

### Language Picker Component Details

```
┌─────────────────────────────────────┐
│  Language                           │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🇬🇧  English              ✓  │  │  ◄── Touch to select
│  └───────────────────────────────┘  │      Background: #1f2329
│                                     │      Selected: checkmark
│  ┌───────────────────────────────┐  │
│  │  🇵🇹  Português                │  │  ◄── Unselected
│  └───────────────────────────────┘  │      No checkmark
│                                     │
└─────────────────────────────────────┘

Styling:
- Section title: "Language" (same style as "Global Preferences")
- Cards: Same style as existing setting cards (#1f2329 background)
- Flag emoji: 24px, left aligned
- Language name: 16px, white text
- Checkmark: ✓ (#3e96ef blue), right aligned
- Touch feedback: opacity change on press
```

### Portuguese UI Preview

```
┌─────────────────────────────────────┐
│         Configurações               │  ◄── "Settings" in PT
├─────────────────────────────────────┤
│                                     │
│  Idioma                             │  ◄── "Language" in PT
│  ┌─────────────────────────────────┐│
│  │ 🇬🇧 English                     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🇵🇹 Português              ✓   ││  ◄── Selected
│  └─────────────────────────────────┘│
│                                     │
│  Preferências Globais               │  ◄── "Global Preferences"
│  ┌─────────────────────────────────┐│
│  │ Período de Variedade    3 dias ││  ◄── "Variety Cooldown"
│  │ Quantos dias esperar...        ││
│  │ [━━━━━━●━━━━━━━━━━━━━━━━━━━━━] ││
│  │ 1 dia                   7 dias ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Número de Sugestões         4  ││  ◄── "Number of Suggestions"
│  │ Quantas combinações...         ││
│  │ [━━━━━━━━━━━━●━━━━━━━━━━━━━━━] ││
│  └─────────────────────────────────┘│
│                                     │
│  Tipos de Refeição          [+Add] │  ◄── "Meal Types"
│  ...                                │
│                                     │
└─────────────────────────────────────┘
```

### Key UI Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Position | First section (above Global Preferences) | Language is a top-level setting, should be easy to find |
| Style | List of cards (not dropdown) | Clearer, more touch-friendly, shows available options |
| Selection | Single tap to switch | Immediate feedback, no confirmation needed |
| Flag display | Emoji flags | No image assets needed, works cross-platform |
| Language names | Native names | "Português" not "Portuguese" in the list |

---

## Testing Strategy

### Unit Tests (Keep Coverage ≥ Current)
**Reference:** Saberloop's `i18n.test.js` (484 lines)

1. **i18n module tests** (`lib/i18n/__tests__/i18n.test.ts`):
   - Initialization behavior
   - Language detection and normalization (pt → pt-PT)
   - Concurrent initialization handling
   - Interpolation (variable substitution)
   - Fallback behavior for missing translations
   - Language persistence in AsyncStorage
   - Language switching with caching
   - Event subscriptions
   - Network error graceful handling

2. **Translation completeness tests**:
   - All pt-PT keys match en keys
   - No missing translations
   - No extra keys in pt-PT

3. **Component tests**:
   - Render components in both languages
   - Verify interpolation works correctly

### E2E Tests (Playwright)
**Location:** `e2e/i18n.spec.ts`

```typescript
test.describe('i18n', () => {
  test('app loads with system language or fallback to English', async ({ page }) => {
    // Verify English text appears
  });

  test('user can switch language to Portuguese in Settings', async ({ page }) => {
    await page.goto('/settings');
    await page.click('text=Português');
    await expect(page.locator('text=Configurações')).toBeVisible();
  });

  test('language preference persists after app restart', async ({ page }) => {
    // Switch to Portuguese, reload, verify still Portuguese
  });

  test('all screens display correctly in Portuguese', async ({ page }) => {
    // Navigate through all tabs, verify no English leakage
  });
});
```

### Maestro Tests
**Location:** `maestro/i18n/`

```yaml
# maestro/i18n/language-switch.yaml
appId: com.saborspin.app
---
- launchApp
- tapOn: "Settings"
- tapOn: "Português"
- assertVisible: "Configurações"
- assertVisible: "Preferências Globais"
- tapOn: "Início"
- assertVisible: "Refeições Recentes"
```

```yaml
# maestro/i18n/full-flow-pt.yaml
appId: com.saborspin.app
---
- launchApp
- tapOn: "Settings"
- tapOn: "Português"
# Verify all screens in Portuguese
- tapOn: "Início"
- assertVisible: "Refeições Recentes"
- tapOn: "Histórico"
- assertVisible: "Hoje" # or Portuguese equivalent
- tapOn: "Ingredientes"
- assertVisible: "Gerenciar Ingredientes"
- tapOn: "Categorias"
- assertVisible: "Gerenciar Categorias"
```

### Test Requirements
- [ ] All existing 101+ unit tests still pass
- [ ] All existing 12 E2E tests still pass
- [ ] New i18n unit tests added (target: 20+ tests)
- [ ] New E2E tests for language switching (4+ tests)
- [ ] Maestro tests for language switching (2+ flows)
- [ ] Test coverage does not decrease

---

## Verification Checklist

### Automated (Run Before Each Commit)
```bash
npm test                    # Unit tests pass
npm run lint                # No lint errors
npx tsc --noEmit            # No TypeScript errors
npm run test:e2e            # E2E tests pass (when applicable)
```

### Automated (Per Phase Completion)
- [ ] Run full test suite: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run Maestro tests: `maestro test maestro/i18n/`
- [ ] Check coverage: `npm test -- --coverage`

### Final Verification (Phase 5)
- [ ] All unit tests pass (101+ existing + 20+ new)
- [ ] All E2E tests pass (12 existing + 4+ new)
- [ ] Maestro tests pass in both languages
- [ ] Test coverage ≥ previous level
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Language switch works on web
- [ ] Language switch works on Android (via EAS build)
- [ ] Language preference persists across restarts

---

## Estimated Effort

**Total: 7-12 days** (depending on translation quality)

| Phase | Days |
|-------|------|
| Infrastructure | 1-2 |
| Core screens | 2-3 |
| Settings & management | 2-3 |
| Portuguese translation | 1-2 |
| Testing & polish | 1-2 |

---

## Resources

### Reference Implementation
- **Saberloop i18n module:** `C:\Users\omeue\source\repos\demo-pwa-app\src\core\i18n.js`
- **Saberloop i18n tests:** `C:\Users\omeue\source\repos\demo-pwa-app\src\core\i18n.test.js`
- **Saberloop translations:** `C:\Users\omeue\source\repos\demo-pwa-app\public\locales\`

### Documentation
- [Expo Localization](https://docs.expo.dev/guides/localization/)
- [react-i18next](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)

---

## Learning Outcomes

After completing this phase:
- Understanding i18n/l10n patterns in React Native
- expo-localization integration
- Translation management workflows
- Type-safe translations with TypeScript
- E2E and Maestro testing for multi-language apps

---

[← Back to Overview](./OVERVIEW.md)

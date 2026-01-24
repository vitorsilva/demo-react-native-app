# Feature 1.2: "New!" Badge 🆕

**Status:** 📋 PLANNED

**Effort:** ~2 hours implementation + ~1 hour testing

**Dependencies:** None

---

## Branching Strategy

**Branch Name:** `FEATURE_1.2_NEW_BADGE`

**Approach:**
- Create feature branch from `main` (or from Phase 1 branch if in progress)
- Small, focused commits per task
- Commit format: `feat(1.2): <description>` or `test(1.2): <description>`

---

## Tool Instructions

```bash
cd demo-react-native-app

# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Maestro tests
maestro test e2e/maestro/

# Linting
npm run lint
```

---

## I18N Considerations

### New Translation Keys

**English (`lib/i18n/locales/en/suggestions.json`):**
```json
{
  "newBadge": "New!"
}
```

**Portuguese (`lib/i18n/locales/pt-PT/suggestions.json`):**
```json
{
  "newBadge": "Novo!"
}
```

---

## Overview

Visual indicator on combinations the user hasn't tried recently (or ever).

---

## Definition

- **"New!"** = combination never logged OR not logged in 7+ days

---

## UI Wireframe

### Suggestion Card

```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │  ← New badge (top-right)
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │
│                                     │
└─────────────────────────────────────┘

Legend:
- [New!] = never tried or 7+ days since last logged
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Suggestion Card BEFORE | Before implementation starts | `screenshot_before_suggestion_card.png` |
| Suggestion Card AFTER | After New! badge is implemented | `screenshot_after_new_badge.png` |

### Capture Instructions
1. Navigate to any meal type suggestions screen
2. Ensure there are suggestion cards visible
3. Capture the suggestion card area showing the badge (or its absence)
4. Save screenshots in `docs/learning/epic04_feature_enhancement/features/screenshots/`

### Capturing BEFORE screenshots after implementation
If the feature is already implemented, you can still capture BEFORE screenshots:
- **Option A**: `git checkout <commit-before-feature>`, run app, screenshot, then `git checkout -`
- **Option B**: Use the ASCII wireframe in this document as the "before" reference
- **Option C**: Skip BEFORE if not critical, document changes in AFTER caption

---

## Implementation

### Utility Function

```typescript
// lib/utils/variety.ts

function isNewCombination(ingredients: string[], history: MealLog[]): boolean {
  const comboKey = ingredients.sort().join(',');
  const lastLogged = history.find(log =>
    log.ingredients.sort().join(',') === comboKey
  );

  if (!lastLogged) return true; // Never logged

  const daysSince = differenceInDays(new Date(), new Date(lastLogged.date));
  return daysSince >= 7;
}
```

### UI Changes

- Add "New!" badge component (small pill, accent color)
- Display on suggestion cards when `isNew === true`
- Badge positioned top-right of card

---

## Files to Create/Modify

**New Files:**
- `components/NewBadge.tsx` - "New!" badge component
- `lib/utils/variety.ts` - Variety utility functions (shared with 1.3)

**Modified Files:**
- `components/SuggestionCard.tsx` - Add badge display

---

## Acceptance Criteria

- [ ] Badge appears on never-tried combinations
- [ ] Badge appears on combinations not tried in 7+ days
- [ ] Badge does not appear on recently logged combinations

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] `isNewCombination()` returns `true` for never-logged combinations
- [ ] `isNewCombination()` returns `true` for 7+ days ago
- [ ] `isNewCombination()` returns `false` for recent combinations (< 7 days)
- [ ] Edge case: exactly 7 days returns `true`
- [ ] Edge case: 6 days returns `false`

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Badge visible on new combinations
- [ ] Badge not visible on recent combinations

---

## Implementation Order

| Order | Task | Type | Effort |
|-------|------|------|--------|
| 1 | 📸 Capture BEFORE screenshot of suggestion card | Documentation | ~5 min | not started |
| 2 | Create `isNewCombination()` utility | Implementation | ~30 min | not started |
| 3 | Create NewBadge component | Implementation | ~30 min | not started |
| 4 | Integrate badge into SuggestionCard | Implementation | ~1 hour | not started |
| 5 | 🧪 CREATE unit tests for `isNewCombination()` | Testing | ~30 min | not started |
| 6 | 🧪 CREATE E2E test for badge visibility | Testing | ~30 min | not started |
| 7 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |
| 8 | 📸 Capture AFTER screenshot with New! badge | Documentation | ~5 min | not started |

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)
- 📸 = Screenshot capture for documentation

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Feature 1.3: Variety Color Coding](./FEATURE_1.3_COLOR_CODING.md) - Shares utility file

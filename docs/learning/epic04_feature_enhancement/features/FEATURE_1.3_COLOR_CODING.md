# Feature 1.3: Variety Color Coding 🎨

**Status:** 🚧 IN PROGRESS

**Effort:** ~2 hours implementation + ~1 hour testing

**Dependencies:** None

---

## Branching Strategy

**Branch Name:** `FEATURE_1.3_COLOR_CODING`

**Approach:**
- Create feature branch from `main` (or from Phase 1 branch if in progress)
- Small, focused commits per task
- Commit format: `feat(1.3): <description>` or `test(1.3): <description>`

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
  "varietyIndicator": {
    "fresh": "Fresh choice",
    "recent": "Had recently",
    "veryRecent": "Had today"
  }
}
```

**Portuguese (`lib/i18n/locales/pt-PT/suggestions.json`):**
```json
{
  "varietyIndicator": {
    "fresh": "Escolha fresca",
    "recent": "Consumido recentemente",
    "veryRecent": "Consumido hoje"
  }
}
```

### Notes
- Color indicators are visual, but accessibility labels need translation
- Consider adding aria-labels for screen readers

---

## Overview

Color-coded visual indicators showing recency of each suggestion.

---

## Color Scheme

| Color | Meaning | Days Since Last Logged |
|-------|---------|------------------------|
| 🟢 Green | Fresh choice | 3+ days (or never) |
| 🟡 Yellow | Recent | 1-2 days ago |
| 🔴 Red | Very recent | Today (shouldn't appear normally) |

---

## UI Wireframe

### Suggestion Card

```
┌─────────────────────────────────────┐
│ 🟢                           [New!] │  ← Color dot (top-left)
│                                     │
│  milk + cereals                     │
│                                     │
│         [Select]    [⭐]            │
│                                     │
└─────────────────────────────────────┘

Legend:
- 🟢 Green dot = fresh (3+ days)
- 🟡 Yellow dot = recent (1-2 days)
- 🔴 Red dot = very recent (today)
```

---

## Screenshot Capture

### Required Screenshots

| Screenshot | When to Capture | Filename |
|------------|-----------------|----------|
| Suggestion Card BEFORE | Before implementation starts | `screenshot_before_color_coding.png` |
| Suggestion Card - Green | After implementation, with green indicator | `screenshot_after_color_green.png` |
| Suggestion Card - Yellow | After implementation, with yellow indicator | `screenshot_after_color_yellow.png` |
| Suggestion Card - Red | After implementation, with red indicator (if testable) | `screenshot_after_color_red.png` |

### Capture Instructions
1. Navigate to any meal type suggestions screen
2. For BEFORE: capture current suggestion card without color indicators
3. For AFTER: manipulate meal log dates to show each color state
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

function getVarietyColor(ingredients: string[], history: MealLog[]): 'green' | 'yellow' | 'red' {
  const comboKey = ingredients.sort().join(',');
  const lastLogged = history.find(log =>
    log.ingredients.sort().join(',') === comboKey
  );

  if (!lastLogged) return 'green';

  const daysSince = differenceInDays(new Date(), new Date(lastLogged.date));

  if (daysSince >= 3) return 'green';
  if (daysSince >= 1) return 'yellow';
  return 'red';
}
```

### UI Changes

- Add colored indicator (dot or border) to suggestion cards
- Color applied to left border or corner dot
- Optional: Add to Settings to toggle off

### Accessibility

Colors should not be the only indicator. Consider adding:
- Different shapes or icons for each state
- Screen reader labels

---

## Files to Create/Modify

**New Files:**
- `lib/utils/variety.ts` - Variety utility functions (shared with 1.2)

**Modified Files:**
- `components/SuggestionCard.tsx` - Add color indicator

---

## Acceptance Criteria

- [ ] Green indicator for 3+ days ago (or never)
- [ ] Yellow indicator for 1-2 days ago
- [ ] Red indicator for today (edge case)
- [ ] Colors are accessible (not just color, also icon/shape)

---

## Testing Strategy

### Unit Tests (🧪 CREATE new tests)
- [ ] `getVarietyColor()` returns `'green'` for never-logged combinations
- [ ] `getVarietyColor()` returns `'green'` for 3+ days ago
- [ ] `getVarietyColor()` returns `'yellow'` for 1-2 days ago
- [ ] `getVarietyColor()` returns `'red'` for today
- [ ] Edge case: exactly 3 days returns `'green'`
- [ ] Edge case: exactly 1 day returns `'yellow'`

### E2E Tests - Playwright (🧪 CREATE new tests)
- [ ] Color indicator visible on suggestion cards
- [ ] Correct color based on recency

---

## Implementation Order

| Order | Task | Type | Effort |
|-------|------|------|--------|
| 1 | Create `getVarietyColor()` utility | Implementation | ~30 min | done |
| 2 | Add color indicator to SuggestionCard | Implementation | ~1 hour | done |
| 3 | Add accessibility support (shapes/labels) | Implementation | ~30 min | done |
| 4 | 🧪 CREATE unit tests for `getVarietyColor()` | Testing | ~30 min | done |
| 5 | 🧪 CREATE E2E test for color visibility | Testing | ~30 min | done |
| 6 | Run all existing unit tests, Playwright tests and Maestro Tests | Quality | ~0.5 hours | not started |
| 7 | 📸 Capture BEFORE screenshot of suggestion card | Documentation | ~5 min | not started |
| 8 | 📸 Capture AFTER screenshots showing color states | Documentation | ~10 min | not started |

**Legend:**
- 🧪 CREATE = Writing new tests
- 🔄 UPDATE = Modifying existing tests
- ▶️ RUN = Executing tests (baseline/verification)
- 📸 = Screenshot capture for documentation

---

## Reference

- [Phase 1 Overview](../PHASE1_QUICK_WINS.md)
- [Feature 1.2: "New!" Badge](./FEATURE_1.2_NEW_BADGE.md) - Shares utility file

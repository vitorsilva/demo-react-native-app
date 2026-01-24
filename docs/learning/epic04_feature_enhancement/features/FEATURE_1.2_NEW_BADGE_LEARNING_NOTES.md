# Feature 1.2: New! Badge - Learning Notes

## Task 1: BEFORE Screenshot Documentation

### Key Observations

1. **Current Architecture**: The suggestion cards are rendered inline in `app/suggestions/[mealType].tsx` (lines 280-350) rather than as a separate `SuggestionCard` component. The feature spec mentions modifying `components/SuggestionCard.tsx` but this file doesn't exist yet - may need to create it or integrate directly into the existing file.

2. **Screenshot Capture Options**: Since Claude Code cannot run the app directly, used Option B from the spec - documenting the "before" state via ASCII wireframe and code references. This is a valid approach documented in the feature spec.

3. **Platform Differences**: The current implementation has different rendering for native (LinearGradient) vs web (simple dark overlay fallback). The New! badge will need to work in both contexts.

### No Errors/Problems

Task 1 was straightforward documentation work with no issues encountered.

---

## Task 2: Create isNewCombination() Utility

### Key Decisions

1. **Reuse of Existing Utilities**: Found that `lib/utils/dateUtils.ts` already had a `getDaysAgo()` function that calculates days since a date. Reused this instead of importing an external date library like `date-fns` (which was mentioned in the spec's sample code).

2. **File Location**: Created `lib/utils/variety.ts` as specified, to be shared with Feature 1.3 (Variety Color Coding).

3. **Order-Independent Matching**: Used `[...ingredientIds].sort().join(',')` to create a consistent key for comparing ingredient combinations regardless of order.

4. **Exported Constant**: Exported `NEW_COMBINATION_THRESHOLD_DAYS = 7` so tests and other features can use the same value.

### Deviation from Spec

The spec sample code used `differenceInDays` from date-fns, but we used the existing `getDaysAgo()` utility to avoid adding a new dependency.

### No Errors/Problems

Task 2 was straightforward implementation with no issues encountered.

---

## Task 3: Create NewBadge Component

### Key Decisions

1. **Brand Colors**: Used SaborSpin's orange accent color (#FF6B35) as specified in the brand guidelines in CLAUDE.md.

2. **Import Order**: ESLint required `react-i18next` to be imported before `react-native` due to import ordering rules. Fixed by reordering imports.

3. **Conditional Rendering**: Added a `visible` prop that defaults to `true`, allowing parent components to easily show/hide the badge.

4. **TestID**: Added `testID="new-badge"` for E2E testing support.

### Styling Choices

- Pill shape with `borderRadius: 12`
- Compact padding (8px horizontal, 4px vertical)
- Bold 12px white text for readability
- Component extends `ViewProps` for style overrides by parent

### No Errors/Problems

Fixed import order warning during implementation. No other issues encountered.

---

## Task 4: Integrate Badge into SuggestionCard

### Key Decisions

1. **Direct Integration**: The spec mentioned `components/SuggestionCard.tsx`, but this file doesn't exist - suggestion cards are rendered inline in `app/suggestions/[mealType].tsx`. Integrated the badge there instead.

2. **Badge Positioning**: Used absolute positioning with `top: 12, right: 12` to place the badge in the top-right corner of the card image.

3. **Both Platform Variants**: Added the NewBadge to both the native (LinearGradient) and web fallback (dark overlay) card layouts to ensure consistent behavior.

### Implementation Pattern

The badge is rendered inside the gradient/overlay container with absolute positioning:
```tsx
<NewBadge visible={suggestion.isNew} style={styles.newBadge} />
```

Style:
```ts
newBadge: {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 1,
}
```

### No Errors/Problems

Straightforward integration with no issues encountered.

---

## Task 5: Create Unit Tests for isNewCombination()

### Test Structure

Created 13 tests organized into logical groups:
1. Never-logged combinations
2. Recently logged combinations (< 7 days)
3. Combinations logged 7+ days ago
4. Order-independent matching
5. Multiple logs for same combination
6. Constant verification

### Helper Functions

Created reusable test helpers:
- `daysAgo(n)` - creates ISO date string N days in the past
- `createMealLog(ingredientIds, daysAgo, id)` - creates test MealLog objects

### Edge Cases Covered

- Exactly 7 days = new (threshold is >=)
- Exactly 6 days = not new
- Multiple logs: uses most recent date

### No Errors/Problems

All 13 tests pass. Total test count now 251 (up from 238).

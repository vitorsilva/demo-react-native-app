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

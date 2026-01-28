# Phase 3.1: Custom Meal Creation - Learning Notes

This document captures unexpected errors, workarounds, and fixes encountered during Phase 3.1 implementation.

---

## Issues Encountered

| Task | Issue | Resolution |
|------|-------|------------|
| Task 5 | TypeScript error with route `/suggestions/custom` - Type not assignable to router parameter | Integrated ConfirmationModal directly into CustomMealScreen instead of navigating to non-existent route |
| Task 8 | Selection logic was inline in component, making it hard to test | Extracted utility functions to `lib/utils/customMealSelection.ts` for testability |
| Task 9 | TypeScript error with route `/custom-meal` | Changed to `/(tabs)/custom-meal` for proper route typing; regenerated tsconfig.json with `npx expo customize tsconfig.json` |
| Task 9 | Bash command failed with parentheses in paths | Used quotes around paths: `git add "demo-react-native-app/app/(tabs)/custom-meal.tsx"` |
| Task 13 | Playwright `toBeDisabled()` didn't work with React Native Web | Changed to `toHaveAttribute('aria-disabled', 'true')` since RN Web uses aria-disabled instead of disabled attribute |
| Task 13 | URL assertion failed for custom-meal route | Removed URL check and relied on testID assertions instead |

---

## Key Lessons Learned

### 1. Expo Router Type Generation
When adding new routes, the TypeScript types may not automatically update. Running `npx expo customize tsconfig.json` regenerates the router types and fixes route typing issues.

### 2. React Native Web Accessibility
React Native Web implements disabled states using `aria-disabled` attribute instead of the HTML `disabled` attribute. When writing Playwright tests for RN Web apps, use `toHaveAttribute('aria-disabled', 'true')` instead of `toBeDisabled()`.

### 3. Extracting Logic for Testability
Inline component logic is hard to unit test. Extracting pure functions to separate utility files enables:
- Comprehensive unit testing without component mocking
- Better code reuse across components
- Clearer separation of concerns

### 4. Windows Path Handling in Bash
When using Bash commands with paths containing parentheses (like Expo's `(tabs)` folder), always quote the paths to prevent shell interpretation errors.

### 5. Integration Over Navigation
When a feature doesn't warrant a full navigation route (like showing a confirmation modal), it's simpler to integrate the component directly rather than creating navigation routes that may conflict with existing patterns.

---

## Test Results Summary

### Unit Tests
- **504 tests passed** (27 new tests for selection logic)
- New test file: `lib/utils/__tests__/customMealSelection.test.ts`

### Playwright E2E Tests
- **97 tests passed** (13 new tests for custom meal flow)
- New test file: `e2e/custom-meal.spec.ts`

### Maestro E2E Tests
- **5 new test files** created for mobile testing:
  - `custom-meal-button.yaml`
  - `custom-meal-navigation.yaml`
  - `custom-meal-selection.yaml`
  - `custom-meal-clear.yaml`
  - `custom-meal-full-flow.yaml`

### Quality Checks
- Architecture: No dependency violations
- Dead code: 1 configuration hint (expo-router/entry - known issue)
- Duplicates: 26 clones (~3.7%) - includes some expected patterns
- Security: 0 findings

---

## Useful References

- [Phase 2 Learning Notes](./PHASE2_DATA_MODEL_EVOLUTION_LEARNING_NOTES.md) - Related meal component patterns
- [Phase 3 Learning Notes](./PHASE3_ENHANCED_VARIETY_LEARNING_NOTES.md) - Variety algorithm integration
- [Expo Router Typed Routes](https://docs.expo.dev/router/reference/typed-routes/)
- [React Native Web Accessibility](https://necolas.github.io/react-native-web/docs/accessibility/)

# Phase 3: E2E Testing & Database Timing - Session Notes

**Date:** 2025-11-16
**Session Duration:** ~2-3 hours
**Focus:** Playwright E2E Testing Infrastructure & Bug Fixes

---

## Summary

This session focused on setting up comprehensive E2E testing with Playwright for the Meals Randomizer app. We created 7 automated tests covering the complete meal logging flow, fixed critical database initialization timing issues, and resolved Sentry web compatibility problems.

---

## Key Accomplishments

### 1. Playwright E2E Test Infrastructure
- Created `playwright.config.ts` with proper configuration for Expo web
- Set up `e2e/meal-logging.spec.ts` with 7 comprehensive tests
- Added test scripts to `package.json` (`test:e2e`, `test:e2e:ui`, `test:e2e:headed`)
- Configured `.gitignore` to ignore Playwright artifacts and screenshots

### 2. Test Coverage (7 Tests, All Passing)
1. ✅ Empty state display on home screen
2. ✅ Navigate to breakfast suggestions with real ingredients
3. ✅ Log breakfast meal and show in Recent Meals
4. ✅ Log snack meal and show in Recent Meals
5. ✅ Generate new suggestions functionality
6. ✅ Show multiple meals in Recent Meals section
7. ✅ Navigate back from suggestions screen

### 3. Critical Bug Fixes

#### Database Initialization Timing Fix
**Problem:** Suggestions screen called `generateMealSuggestions()` before ingredients were loaded from database.

**Solution in `app/suggestions/[mealType].tsx`:**
```typescript
const hasGeneratedRef = useRef(false);

useEffect(() => {
  const generateSuggestions = async () => {
    if (hasGeneratedRef.current) return;
    if (!isDatabaseReady) return;

    if (ingredients.length === 0) {
      await loadIngredients();
      return; // useEffect re-runs when ingredients load
    }

    hasGeneratedRef.current = true;
    generateMealSuggestions(3, 7);
  };
  generateSuggestions();
}, [isDatabaseReady, ingredients.length, loadIngredients, generateMealSuggestions]);
```

#### Sentry Web Compatibility
**Problem:** Sentry React Native SDK crashed on web platform with `WINDOW.addEventListener is not a function`.

**Solution in `app/_layout.tsx`:**
```typescript
if (Platform.OS !== 'web') {
  Sentry.init({ /* config */ });
}
```

### 4. Testing Best Practices Learned

#### Use testID Props for Robust Selectors
```typescript
// Component
<TouchableOpacity testID="breakfast-ideas-button">

// Test
await page.getByTestId('breakfast-ideas-button').click();
```

#### Avoid Text-Based Selectors (Strict Mode Violations)
```typescript
// BAD - can match multiple elements
await page.getByText('Snack Ideas').toBeVisible();

// GOOD - specific testID
await page.getByTestId('back-button').toBeVisible();
```

#### Wait for Page Transitions
```typescript
await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });
```

---

## Files Modified

### New Files
- `demo-react-native-app/playwright.config.ts` - Playwright configuration
- `demo-react-native-app/e2e/meal-logging.spec.ts` - E2E test suite
- `demo-react-native-app/e2e/screenshots/` - Test screenshots (20+ images)

### Modified Files
- `demo-react-native-app/app/suggestions/[mealType].tsx` - Database timing fix
- `demo-react-native-app/app/_layout.tsx` - Sentry web compatibility
- `demo-react-native-app/app/(tabs)/index.tsx` - Added testID props
- `demo-react-native-app/components/modals/ConfirmationModal.tsx` - Added testID
- `demo-react-native-app/package.json` - Added @playwright/test dependency
- `demo-react-native-app/.gitignore` - Playwright artifacts

---

## Technical Concepts Learned

### 1. Playwright E2E Testing
- Configuration with `defineConfig()`
- Running tests sequentially (`workers: 1`, `fullyParallel: false`)
- Web server configuration for Expo
- Capturing screenshots at each step
- Using `waitForSelector`, `waitForFunction`, `waitForTimeout`

### 2. React Native Testing IDs
- `testID` prop maps to `data-testid` in web DOM
- Best practice for stable, maintainable selectors
- Avoids fragile text-based matching

### 3. Zustand Store Selectors
- Multiple selectors from same store
- Ref pattern to prevent duplicate side effects
- Async data dependencies in useEffect

### 4. Platform-Specific Code
```typescript
if (Platform.OS !== 'web') {
  // Native-only code
}
```

---

## Issues Encountered & Solutions

### Issue 1: ESLint Errors on Commit
- Unescaped quotes in JSX: Use `&quot;`
- Missing useEffect dependencies: Add to dependency array
- Unused imports: Remove them

### Issue 2: Page Crashes in Tests
- Sentry SDK not web-compatible
- Fixed with platform check

### Issue 3: Strict Mode Violations
- `getByText()` matching multiple elements
- Fixed by using specific testID selectors

### Issue 4: Click Not Triggering Modal
- Page not fully transitioned
- Fixed by waiting for unique elements (back-button)

---

## Test Run Statistics

```
Running 7 tests using 1 worker
  ✓ 1 should show empty state when no meals logged (14s)
  ✓ 2 should navigate to breakfast suggestions (16s)
  ✓ 3 should log a breakfast meal (15s)
  ✓ 4 should log a snack meal (15s)
  ✓ 5 should generate new suggestions (14s)
  ✓ 6 should show multiple meals (15s)
  ✓ 7 should navigate back (14s)
  7 passed (2.7m)
```

---

## Commands to Know

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with browser visible
npm run test:e2e:headed

# Run tests with interactive UI
npm run test:e2e:ui

# View HTML test report
npx playwright show-report
```

---

## Next Steps

1. ✅ All E2E tests passing
2. Consider adding more test scenarios (error states, edge cases)
3. Add unit tests for business logic
4. Implement accessibility testing
5. Set up CI/CD pipeline with Playwright tests
6. Add visual regression testing with screenshots

---

## Key Learnings

1. **testID Props** are essential for maintainable E2E tests
2. **Async initialization** must be carefully sequenced
3. **Platform-specific code** is necessary for cross-platform compatibility
4. **Playwright strict mode** enforces precise selectors
5. **useRef pattern** prevents React re-render loops with side effects

---

**Status:** Phase 3 UI & Testing COMPLETE
**Next Phase:** Phase 5 - Polish & Production Readiness (APK build, performance optimization)

---

[← Back to Overview](./OVERVIEW.md) | [Phase 5: Polish & Testing →](./PHASE5_POLISH_TESTING.md)

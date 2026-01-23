# Testing Guide

## Overview

SaborSpin has comprehensive test coverage:
- **220 unit tests** (Jest)
- **23 E2E tests** (Playwright)

## Unit Tests (Jest)

### Running Tests

```bash
cd demo-react-native-app

# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm test -- --watch

# Run specific test file
npm test -- ingredients.test.ts

# With coverage report
npm test -- --coverage
```

### Test Structure

```
demo-react-native-app/
├── lib/
│   ├── database/
│   │   ├── __tests__/
│   │   │   ├── ingredients.test.ts
│   │   │   ├── categories.test.ts
│   │   │   ├── mealTypes.test.ts
│   │   │   ├── mealLogs.test.ts
│   │   │   ├── validation.test.ts
│   │   │   └── database.integration.test.ts
│   │   └── __mocks__/
│   │       └── index.ts
│   ├── business-logic/
│   │   └── __tests__/
│   │       ├── combinationGenerator.test.ts
│   │       └── varietyEngine.test.ts
│   └── store/
│       └── __tests__/
│           └── store.test.ts
└── components/
    └── __tests__/
        └── ...
```

### Writing Unit Tests

```typescript
import { getAllIngredients, addIngredient } from '../ingredients';

describe('ingredients', () => {
  beforeEach(async () => {
    // Reset database before each test
    await resetDatabase();
  });

  it('should add an ingredient', async () => {
    const ingredient = await addIngredient({
      name: 'Apple',
      meal_type: 'breakfast'
    });

    expect(ingredient).toBeDefined();
    expect(ingredient.name).toBe('Apple');
  });

  it('should get all ingredients', async () => {
    await addIngredient({ name: 'Apple', meal_type: 'breakfast' });
    await addIngredient({ name: 'Banana', meal_type: 'snack' });

    const ingredients = await getAllIngredients();

    expect(ingredients).toHaveLength(2);
  });
});
```

### Mocking

Database mocks are in `lib/database/__mocks__/index.ts`. The mock uses `better-sqlite3` for synchronous SQLite in Node.js.

## E2E Tests (Playwright)

### Running E2E Tests

```bash
cd demo-react-native-app

# Headless (fast)
npm run test:e2e

# With visible browser
npm run test:e2e:headed

# Interactive UI mode
npm run test:e2e:ui
```

### E2E Test Structure

```
demo-react-native-app/
└── e2e/
    ├── meal-logging.spec.ts    # Core meal flows
    ├── i18n.spec.ts            # Language switching
    ├── telemetry.spec.ts       # Observability
    └── screenshots/
        └── ...
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Meal Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="home-screen"]');
  });

  test('should log a breakfast meal', async ({ page }) => {
    // Click breakfast button
    await page.getByTestId('breakfast-ideas-button').click();

    // Wait for suggestions
    await page.waitForSelector('[data-testid="suggestion-card"]');

    // Click first suggestion
    await page.getByTestId('suggestion-card').first().click();

    // Confirm in modal
    await page.getByTestId('confirm-meal-button').click();

    // Verify meal logged
    await expect(page.getByText('Meal logged!')).toBeVisible();
  });
});
```

### Test IDs

Use `testID` prop for stable selectors:

```tsx
// Component
<TouchableOpacity testID="breakfast-ideas-button">

// Test
await page.getByTestId('breakfast-ideas-button').click();
```

### Screenshots

E2E tests capture screenshots at key steps. Screenshots are saved to `e2e/screenshots/`.

## Test Coverage

Current coverage:
- Database operations: ~90%
- Business logic: ~95%
- Store actions: ~80%
- E2E flows: Main user journeys

### Checking Coverage

```bash
npm test -- --coverage
```

Coverage report is generated in `coverage/` directory.

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch

See `.github/workflows/` for CI configuration.

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use descriptive test names** - `it('should add ingredient to database')`
3. **One assertion per test** - Keep tests focused
4. **Use testID for E2E** - More stable than text selectors
5. **Clean up after tests** - Reset state in `beforeEach`

## Related Documentation

- [Installation Guide](./INSTALLATION.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

import { test, expect } from '@playwright/test';

test.describe('Custom Meal Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for database to be ready
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the app to fully render
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 30000 });

    // Wait for database initialization to complete
    await page.waitForFunction(
      () => {
        const hasEmptyState = document.querySelector('[data-testid="empty-state"]');
        const hasMealsList = document.querySelector('[data-testid="recent-meals-list"]');
        return hasEmptyState || hasMealsList;
      },
      { timeout: 10000 }
    );
  });

  test('should show Create Custom Meal button on home screen', async ({ page }) => {
    await expect(page.getByTestId('create-custom-meal-button')).toBeVisible();
    await expect(page.getByTestId('create-custom-meal-button')).toContainText('Create Custom Meal');

    // Screenshot: Home screen with custom meal button
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-01-home-button.png' });
  });

  test('should navigate to custom meal screen when button is clicked', async ({ page }) => {
    // Click Create Custom Meal button
    await page.getByTestId('create-custom-meal-button').click();

    // Wait for the screen to load
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Should show the custom meal screen
    await expect(page.getByTestId('custom-meal-screen')).toBeVisible();

    // Screenshot: Custom meal screen
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-02-screen.png' });
  });

  test('should display category filter chips', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Should show category chips including "All"
    await expect(page.getByTestId('category-chip-all')).toBeVisible();

    // Screenshot: Category filter chips
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-03-category-chips.png' });
  });

  test('should display ingredients from seeded database', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Should show at least one ingredient
    const ingredientItems = page.locator('[data-testid^="ingredient-item-"]');
    await expect(ingredientItems.first()).toBeVisible();

    // Screenshot: Ingredient list
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-04-ingredients.png' });
  });

  test('should select and deselect ingredients', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Get first ingredient
    const firstIngredient = page.locator('[data-testid^="ingredient-item-"]').first();

    // Click to select
    await firstIngredient.click();

    // Should show 1 selected in counter
    await expect(page.getByTestId('selection-counter')).toContainText('1 selected');

    // Screenshot: One ingredient selected
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-05-one-selected.png' });

    // Click again to deselect
    await firstIngredient.click();

    // Should show 0 selected
    await expect(page.getByTestId('selection-counter')).toContainText('0 selected');
  });

  test('should enforce minimum ingredient validation', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Create meal button should be disabled with 0 selections (check aria-disabled for React Native Web)
    const createButton = page.getByTestId('create-meal-button');
    await expect(createButton).toHaveAttribute('aria-disabled', 'true');

    // Screenshot: Create button disabled
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-06-button-disabled.png' });
  });

  test('should enable create button when minimum ingredients selected', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Select one ingredient
    const firstIngredient = page.locator('[data-testid^="ingredient-item-"]').first();
    await firstIngredient.click();

    // Create meal button should now be enabled
    const createButton = page.getByTestId('create-meal-button');
    await expect(createButton).toBeEnabled();

    // Screenshot: Create button enabled
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-07-button-enabled.png' });
  });

  test('should filter ingredients by category', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Count initial ingredients
    const initialCount = await page.locator('[data-testid^="ingredient-item-"]').count();

    // Click on a category chip (not "All")
    const categoryChips = page.locator('[data-testid^="category-chip-"]:not([data-testid="category-chip-all"])');
    const chipCount = await categoryChips.count();

    if (chipCount > 0) {
      await categoryChips.first().click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Filtered count should be different (unless category has all ingredients)
      const filteredCount = await page.locator('[data-testid^="ingredient-item-"]').count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Screenshot: Filtered ingredients
      await page.screenshot({ path: 'e2e/screenshots/custom-meal-08-filtered.png' });
    }
  });

  test('should clear selection when clear button is clicked', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Select first two ingredients
    const ingredients = page.locator('[data-testid^="ingredient-item-"]');
    await ingredients.nth(0).click();
    await ingredients.nth(1).click();

    // Verify 2 selected
    await expect(page.getByTestId('selection-counter')).toContainText('2 selected');

    // Click clear button
    await page.getByTestId('clear-selection-button').click();

    // Should show 0 selected
    await expect(page.getByTestId('selection-counter')).toContainText('0 selected');

    // Screenshot: Cleared selection
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-09-cleared.png' });
  });

  test('should show meal type selector when create meal is clicked', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Select one ingredient
    const firstIngredient = page.locator('[data-testid^="ingredient-item-"]').first();
    await firstIngredient.click();

    // Click create meal button
    await page.getByTestId('create-meal-button').click();

    // Should show meal type selector
    await expect(page.getByTestId('meal-type-selector')).toBeVisible();
    await expect(page.getByText('Select Meal Type')).toBeVisible();

    // Screenshot: Meal type selector
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-10-meal-type-selector.png' });
  });

  test('should show confirmation modal after selecting meal type', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Select one ingredient
    const firstIngredient = page.locator('[data-testid^="ingredient-item-"]').first();
    await firstIngredient.click();

    // Click create meal button
    await page.getByTestId('create-meal-button').click();

    // Wait for meal type selector
    await page.waitForSelector('[data-testid="meal-type-selector"]', { timeout: 5000 });

    // Select Breakfast meal type
    await page.getByTestId('meal-type-breakfast').click();

    // Should show confirmation modal
    await expect(page.getByTestId('confirmation-modal')).toBeVisible();

    // Screenshot: Confirmation modal
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-11-confirmation.png' });
  });

  test('full flow: create custom meal and log it', async ({ page }) => {
    // Screenshot: Initial home state
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-12-initial-home.png' });

    // Navigate to custom meal screen
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Wait for ingredients to load
    await page.waitForFunction(
      () => {
        const ingredients = document.querySelectorAll('[data-testid^="ingredient-item-"]');
        return ingredients.length > 0;
      },
      { timeout: 10000 }
    );

    // Select two ingredients
    const ingredients = page.locator('[data-testid^="ingredient-item-"]');
    await ingredients.nth(0).click();
    await ingredients.nth(1).click();

    // Screenshot: Ingredients selected
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-13-selected.png' });

    // Click create meal
    await page.getByTestId('create-meal-button').click();

    // Select meal type
    await page.waitForSelector('[data-testid="meal-type-selector"]', { timeout: 5000 });
    await page.getByTestId('meal-type-breakfast').click();

    // Wait for confirmation modal
    await page.waitForSelector('[data-testid="confirmation-modal"]', { timeout: 5000 });

    // Screenshot: Confirmation modal
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-14-confirm-modal.png' });

    // Click done to complete
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Screenshot: Home after logging meal
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-15-home-after.png' });

    // Recent meals list should now be visible (no longer empty state)
    await expect(page.getByTestId('recent-meals-list')).toBeVisible();
  });

  test('should navigate back to home when back button is clicked', async ({ page }) => {
    await page.getByTestId('create-custom-meal-button').click();
    await page.waitForSelector('[data-testid="custom-meal-screen"]', { timeout: 10000 });

    // Click back button
    await page.getByTestId('back-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Screenshot: Back on home
    await page.screenshot({ path: 'e2e/screenshots/custom-meal-16-back-home.png' });
  });
});

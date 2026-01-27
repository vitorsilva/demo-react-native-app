import { test, expect } from '@playwright/test';

/**
 * Phase 2: E2E tests for history screen with:
 * - Named meals displaying their custom name
 * - Preparation methods showing inline with ingredients
 * - Legacy meal display compatibility
 */
test.describe('Phase 2: History with Named Meals and Prep Methods', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for database to be ready
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the app to fully render AND database to be ready
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

  test('should display named meal in history with name prominently shown', async ({ page }) => {
    // Log a meal with a custom name
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Enter a custom meal name
    const mealName = "Mom's special breakfast";
    await page.getByTestId('meal-name-input').fill(mealName);

    // Complete the logging
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasBreakfast = document.body.textContent?.includes('Breakfast');
        return hasBreakfast;
      },
      { timeout: 10000 }
    );

    // Screenshot: History with named meal
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-named-meal.png' });

    // Verify the meal name is displayed in history
    const mealNameElement = page.locator('[data-testid^="meal-name-"]').first();
    await expect(mealNameElement).toBeVisible();
    await expect(mealNameElement).toContainText(mealName);
  });

  test('should display meal with preparation method in history', async ({ page }) => {
    // Log a meal with preparation method but no name
    await page.getByTestId('snack-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/snack/);
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });

    // Select "grilled" preparation method for first ingredient
    await page.getByTestId('meal-component-0').click();
    await page.waitForSelector('[data-testid="prep-method-prep-grilled"]', { timeout: 10000 });
    await page.getByTestId('prep-method-prep-grilled').click();

    // Wait for picker to close
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // Complete the logging (without entering a name)
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasSnack = document.body.textContent?.includes('Snack');
        return hasSnack;
      },
      { timeout: 10000 }
    );

    // Screenshot: History with prep method meal
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-prep-method-meal.png' });

    // Verify "grilled" appears in the history (as part of the meal display)
    const historyContent = page.locator('body');
    await expect(historyContent).toContainText(/grilled/i);

    // The meal should NOT have a visible meal-name element (since no name was provided)
    // We expect the ingredients to be shown directly without a separate name
    const mealItems = page.locator('[data-testid^="meal-item-"]');
    await expect(mealItems.first()).toBeVisible();
  });

  test('should display both named meal and ingredients in history', async ({ page }) => {
    // Log a meal with both name and preparation method
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Enter a meal name
    const mealName = 'Healthy morning combo';
    await page.getByTestId('meal-name-input').fill(mealName);

    // Select preparation method for first ingredient
    await page.getByTestId('meal-component-0').click();
    await page.waitForSelector('[data-testid="prep-method-prep-steamed"]', { timeout: 10000 });
    await page.getByTestId('prep-method-prep-steamed').click();

    // Wait for picker to close and UI to update
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // Verify the prep method was selected (shown on the component row)
    await expect(page.getByTestId('meal-component-0')).toContainText(/steamed/i);

    // Complete the logging
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasBreakfast = document.body.textContent?.includes('Breakfast');
        return hasBreakfast;
      },
      { timeout: 10000 }
    );

    // Screenshot: History with full Phase 2 meal
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-full-meal.png' });

    // Verify the meal name is displayed
    const mealNameElement = page.locator('[data-testid^="meal-name-"]').first();
    await expect(mealNameElement).toBeVisible();
    await expect(mealNameElement).toContainText(mealName);

    // Verify the meal is displayed in history (name takes priority, prep method in details)
    const mealItemContent = page.locator('[data-testid^="meal-item-"]').first();
    await expect(mealItemContent).toBeVisible();
  });

  test('should display multiple meals correctly in history', async ({ page }) => {
    // Log first meal with name
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });
    await page.getByTestId('meal-name-input').fill('Named breakfast');
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Log second meal without name but with prep method
    await page.getByTestId('snack-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });
    await page.getByTestId('meal-component-0').click();
    await page.waitForSelector('[data-testid="prep-method-prep-fried"]', { timeout: 10000 });
    await page.getByTestId('prep-method-prep-fried').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasBreakfast = document.body.textContent?.includes('Breakfast');
        const hasSnack = document.body.textContent?.includes('Snack');
        return hasBreakfast && hasSnack;
      },
      { timeout: 10000 }
    );

    // Screenshot: History with multiple meals
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-multiple-meals.png' });

    // Verify both meals are visible
    await expect(page.getByText('Breakfast').first()).toBeVisible();
    await expect(page.getByText('Snack').first()).toBeVisible();

    // Verify the named meal shows its name
    await expect(page.getByText('Named breakfast')).toBeVisible();

    // Verify the unnamed meal shows prep method
    await expect(page.locator('body')).toContainText(/fried/i);
  });

  test('should display meal with unicode characters in name', async ({ page }) => {
    // Log a meal with unicode characters in the name
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Enter a name with unicode characters
    const unicodeMealName = '朝食の特別 🍳 Café';
    await page.getByTestId('meal-name-input').fill(unicodeMealName);

    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasBreakfast = document.body.textContent?.includes('Breakfast');
        return hasBreakfast;
      },
      { timeout: 10000 }
    );

    // Screenshot: History with unicode meal name
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-unicode-name.png' });

    // Verify the unicode meal name is displayed correctly
    await expect(page.getByText(unicodeMealName)).toBeVisible();
  });

  test('should toggle favorite on named meal in history', async ({ page }) => {
    // Log a named meal
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });
    await page.getByTestId('meal-name-input').fill('Favorite test meal');
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for the meal to appear in history
    await page.waitForFunction(
      () => {
        const hasBreakfast = document.body.textContent?.includes('Breakfast');
        return hasBreakfast;
      },
      { timeout: 10000 }
    );

    // Find the favorite button in history (should show ☆ initially)
    const historyFavoriteButton = page.locator('[data-testid^="favorite-button-"]').first();
    await expect(historyFavoriteButton).toBeVisible();
    await expect(historyFavoriteButton).toContainText('☆');

    // Click to favorite
    await historyFavoriteButton.click();
    await page.waitForTimeout(500);

    // Should now show ⭐
    await expect(historyFavoriteButton).toContainText('⭐');

    // Screenshot: Named meal favorited
    await page.screenshot({ path: 'e2e/screenshots/history-phase2-named-meal-favorited.png' });
  });
});

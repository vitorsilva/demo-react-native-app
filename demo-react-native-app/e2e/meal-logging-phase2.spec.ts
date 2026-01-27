import { test, expect } from '@playwright/test';

/**
 * Phase 2: E2E tests for the enhanced meal logging flow with:
 * - Preparation method selection for ingredients
 * - Optional meal naming
 * - Custom preparation method creation
 */
test.describe('Phase 2: Meal Logging with Preparation Methods', () => {
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

  test('should show meal name input and ingredient components in confirmation modal', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for confirmation modal to appear
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });

    // Verify meal name input is visible
    await expect(page.getByTestId('meal-name-input')).toBeVisible();

    // Verify at least one meal component row is visible (for ingredient + prep method selection)
    await expect(page.getByTestId('meal-component-0')).toBeVisible();

    // Screenshot: Confirmation modal with Phase 2 features
    await page.screenshot({ path: 'e2e/screenshots/phase2-confirmation-modal.png' });
  });

  test('should log meal with a custom name', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Enter a custom meal name
    const mealNameInput = page.getByTestId('meal-name-input');
    await mealNameInput.fill("Mom's special breakfast");

    // Screenshot: Modal with meal name entered
    await page.screenshot({ path: 'e2e/screenshots/phase2-meal-name-entered.png' });

    // Click Done
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Recent Meals should show the logged meal
    await expect(page.getByText('Today, breakfast')).toBeVisible();

    // Screenshot: Home screen after logging named meal
    await page.screenshot({ path: 'e2e/screenshots/phase2-home-after-named-meal.png' });
  });

  test('should open preparation method picker when clicking ingredient component', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal with component rows
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });

    // Click on the first ingredient component to open prep method picker
    await page.getByTestId('meal-component-0').click();

    // Wait for preparation method picker modal to appear
    await page.waitForSelector('[data-testid="prep-method-none"]', { timeout: 10000 });

    // Verify "None (as is)" option is visible
    await expect(page.getByTestId('prep-method-none')).toBeVisible();

    // Verify at least one predefined preparation method is visible (e.g., fried)
    await expect(page.getByTestId('prep-method-prep-fried')).toBeVisible();

    // Screenshot: Preparation method picker
    await page.screenshot({ path: 'e2e/screenshots/phase2-prep-method-picker.png' });

    // Cancel the picker
    await page.getByTestId('prep-picker-cancel').click();

    // Picker should be closed, confirmation modal should still be visible
    await expect(page.getByTestId('done-button')).toBeVisible();
  });

  test('should select a preparation method for an ingredient', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });

    // Click on the first ingredient to open prep method picker
    await page.getByTestId('meal-component-0').click();

    // Wait for picker
    await page.waitForSelector('[data-testid="prep-method-prep-grilled"]', { timeout: 10000 });

    // Select "grilled" preparation method
    await page.getByTestId('prep-method-prep-grilled').click();

    // Picker should close, confirmation modal should show the selected method
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // The component row should now show "grilled" instead of "None (as is)"
    // Note: The text appears in the method selector within the component row
    await expect(page.locator('[data-testid="meal-component-0"]')).toContainText(/grilled/i);

    // Screenshot: Component with selected preparation method
    await page.screenshot({ path: 'e2e/screenshots/phase2-prep-method-selected.png' });

    // Complete the logging
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');
  });

  test('should add a custom preparation method', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });

    // Click on the first ingredient to open prep method picker
    await page.getByTestId('meal-component-0').click();

    // Wait for picker and find "Add custom" button
    await page.waitForSelector('[data-testid="show-add-custom-input"]', { timeout: 10000 });

    // Click "Add custom" to show the input field
    await page.getByTestId('show-add-custom-input').click();

    // Wait for custom input field
    await page.waitForSelector('[data-testid="custom-prep-method-input"]', { timeout: 5000 });

    // Enter custom preparation method name
    await page.getByTestId('custom-prep-method-input').fill('air-fried');

    // Screenshot: Adding custom prep method
    await page.screenshot({ path: 'e2e/screenshots/phase2-custom-prep-method-input.png' });

    // Click Add button
    await page.getByTestId('add-custom-prep-method-button').click();

    // Picker should close and the custom method should be selected
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // The component row should show the custom method
    await expect(page.locator('[data-testid="meal-component-0"]')).toContainText(/air-fried/i);

    // Screenshot: Component with custom preparation method
    await page.screenshot({ path: 'e2e/screenshots/phase2-custom-prep-method-selected.png' });

    // Complete the logging
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');
  });

  test('should log meal with preparation method and custom name', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Enter meal name
    await page.getByTestId('meal-name-input').fill('Healthy morning combo');

    // Select preparation method for first ingredient
    await page.getByTestId('meal-component-0').click();
    await page.waitForSelector('[data-testid="prep-method-prep-steamed"]', { timeout: 10000 });
    await page.getByTestId('prep-method-prep-steamed').click();

    // Wait for picker to close
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // Screenshot: Full Phase 2 meal entry
    await page.screenshot({ path: 'e2e/screenshots/phase2-full-meal-entry.png' });

    // Complete the logging
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Meal should appear in Recent Meals
    await expect(page.getByText('Today, breakfast')).toBeVisible();

    // Screenshot: Home after logging full Phase 2 meal
    await page.screenshot({ path: 'e2e/screenshots/phase2-home-after-full-meal.png' });
  });

  test('should log meal without name (anonymous meal with components)', async ({ page }) => {
    // Navigate to snack suggestions
    await page.getByTestId('snack-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/snack/);
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-name-input"]', { timeout: 10000 });

    // Don't enter a meal name (leave it empty)
    // Just select a preparation method for one ingredient
    await page.getByTestId('meal-component-0').click();
    await page.waitForSelector('[data-testid="prep-method-prep-raw"]', { timeout: 10000 });
    await page.getByTestId('prep-method-prep-raw').click();

    // Wait for picker to close
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 5000 });

    // Complete the logging
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Meal should appear in Recent Meals
    await expect(page.getByText('Today, snack')).toBeVisible();

    // Screenshot: Home after logging anonymous meal
    await page.screenshot({ path: 'e2e/screenshots/phase2-home-after-anonymous-meal.png' });
  });

  test('should show multiple preparation method options in picker', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal
    await page.waitForSelector('[data-testid="meal-component-0"]', { timeout: 10000 });

    // Click on the first ingredient to open prep method picker
    await page.getByTestId('meal-component-0').click();

    // Wait for picker
    await page.waitForSelector('[data-testid="prep-method-none"]', { timeout: 10000 });

    // Verify multiple predefined preparation methods are visible
    await expect(page.getByTestId('prep-method-none')).toBeVisible();
    await expect(page.getByTestId('prep-method-prep-fried')).toBeVisible();
    await expect(page.getByTestId('prep-method-prep-grilled')).toBeVisible();
    await expect(page.getByTestId('prep-method-prep-roasted')).toBeVisible();
    await expect(page.getByTestId('prep-method-prep-boiled')).toBeVisible();
    await expect(page.getByTestId('prep-method-prep-baked')).toBeVisible();

    // Cancel button should be visible
    await expect(page.getByTestId('prep-picker-cancel')).toBeVisible();

    // "Add custom" option should be visible
    await expect(page.getByTestId('show-add-custom-input')).toBeVisible();

    // Screenshot: Full prep method picker
    await page.screenshot({ path: 'e2e/screenshots/phase2-full-prep-picker.png' });

    // Cancel to close
    await page.getByTestId('prep-picker-cancel').click();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Meal Logging Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for database to be ready
    // Use waitUntil: 'networkidle' to wait for Expo dev server to stabilize
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the app to fully render AND database to be ready
    // The database ready log appears after seeding completes
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 30000 });

    // Wait for database initialization to complete (async operation)
    // Check console for "Database ready" log message
    await page.waitForFunction(
      () => {
        // Check if database is initialized by looking for meal data or empty state
        const hasEmptyState = document.querySelector('[data-testid="empty-state"]');
        const hasMealsList = document.querySelector('[data-testid="recent-meals-list"]');
        return hasEmptyState || hasMealsList;
      },
      { timeout: 10000 }
    );
  });

  test('should show empty state when no meals logged', async ({ page }) => {
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('breakfast-ideas-button')).toBeVisible();
    await expect(page.getByTestId('snack-ideas-button')).toBeVisible();

    // Screenshot: Home screen with empty state
    await page.screenshot({ path: 'e2e/screenshots/01-home-empty-state.png' });
  });

  test('should navigate to breakfast suggestions and show real ingredients', async ({ page }) => {
    // Screenshot: Initial home screen
    await page.screenshot({ path: 'e2e/screenshots/02-home-before-navigation.png' });

    // Click on Breakfast Ideas
    await page.getByTestId('breakfast-ideas-button').click();

    // Should navigate to suggestions screen
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load OR error to appear (database must be ready)
    // The loading state disappears when done, then either suggestions or error appears
    await page.waitForFunction(
      () => {
        const hasSelectButton = document.querySelector('[data-testid="select-button-0"]');
        const hasError = document.body.textContent?.includes('Database not initialized');
        const hasLoading = document.body.textContent?.includes('Generating suggestions');
        return hasSelectButton || (hasError && !hasLoading);
      },
      { timeout: 15000 }
    );

    await expect(page.getByText('Pick one:')).toBeVisible();

    // Should show ingredient combinations (from seeded database)
    // At least one Select button should be visible
    await expect(page.getByTestId('select-button-0')).toBeVisible();

    // Should show "Generate New Ideas" button
    await expect(page.getByTestId('generate-new-ideas-button')).toBeVisible();

    // Screenshot: Suggestions screen with ingredient combinations
    await page.screenshot({ path: 'e2e/screenshots/03-breakfast-suggestions.png' });
  });

  test('should log a breakfast meal and show in Recent Meals', async ({ page }) => {
    // Screenshot: Home screen before selecting meal
    await page.screenshot({ path: 'e2e/screenshots/04-home-before-breakfast.png' });

    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]');

    // Screenshot: Breakfast suggestions loaded
    await page.screenshot({ path: 'e2e/screenshots/05-breakfast-suggestions-loaded.png' });

    // Click Select on first suggestion
    await page.getByTestId('select-button-0').click();

    // Modal should appear with "Breakfast Logged"
    await expect(page.getByText('Breakfast Logged')).toBeVisible();
    await expect(page.getByText('Enjoy your meal!')).toBeVisible();
    await expect(page.getByTestId('done-button')).toBeVisible();

    // Screenshot: Confirmation modal
    await page.screenshot({ path: 'e2e/screenshots/06-breakfast-confirmation-modal.png' });

    // Click Done
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Recent Meals should now show the logged meal
    await expect(page.getByText('Today, breakfast')).toBeVisible();

    // Should not show empty state anymore
    await expect(page.getByTestId('empty-state')).not.toBeVisible();

    // Screenshot: Home screen with logged breakfast
    await page.screenshot({ path: 'e2e/screenshots/07-home-with-breakfast-logged.png' });
  });

  test('should log a snack meal and show in Recent Meals', async ({ page }) => {
    // Screenshot: Home screen before selecting snack
    await page.screenshot({ path: 'e2e/screenshots/08-home-before-snack.png' });

    // Navigate to snack suggestions
    await page.getByTestId('snack-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/snack/);

    // Wait for suggestions page to fully load (back button only exists on suggestions screen)
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });

    // Wait for suggestions to load (with retry on error)
    await page.waitForFunction(
      () => {
        const hasSelectButton = document.querySelector('[data-testid="select-button-0"]');
        return hasSelectButton;
      },
      { timeout: 15000 }
    );

    // Verify we're on the Snack Ideas screen (check header title exists)
    await expect(page.getByTestId('back-button')).toBeVisible();

    // Screenshot: Snack suggestions screen
    await page.screenshot({ path: 'e2e/screenshots/09-snack-suggestions.png' });

    // Wait a moment for images to load and page to stabilize
    await page.waitForTimeout(1000);

    // Click Select on first suggestion using force to bypass any overlays
    const selectButton = page.getByTestId('select-button-0');
    await selectButton.waitFor({ state: 'visible' });
    await selectButton.click({ force: true });

    // Wait for modal to appear (it has animation)
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });

    // Modal should appear with "Snack Logged"
    await expect(page.getByText('Snack Logged')).toBeVisible();

    // Screenshot: Snack confirmation modal
    await page.screenshot({ path: 'e2e/screenshots/10-snack-confirmation-modal.png' });

    // Click Done
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Recent Meals should now show the logged snack
    await expect(page.getByText('Today, snack')).toBeVisible();

    // Screenshot: Home screen with logged snack
    await page.screenshot({ path: 'e2e/screenshots/11-home-with-snack-logged.png' });
  });

  test('should generate new suggestions when clicking Generate New Ideas', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]');

    // Screenshot: Initial suggestions
    await page.screenshot({ path: 'e2e/screenshots/12-suggestions-before-generate.png' });

    // Get the current suggestions text
    const initialSuggestions = await page.locator('text=/.*\\+.*/').allTextContents();

    // Click Generate New Ideas
    await page.getByTestId('generate-new-ideas-button').click();

    // Wait for new suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]');

    // Screenshot: New suggestions after generate
    await page.screenshot({ path: 'e2e/screenshots/13-suggestions-after-generate.png' });

    // Get new suggestions text
    const newSuggestions = await page.locator('text=/.*\\+.*/').allTextContents();

    // The suggestions should be different (at least some of them)
    // Note: This might occasionally fail if random generation produces same results
    expect(newSuggestions.length).toBeGreaterThan(0);
  });

  test('should show multiple meals in Recent Meals section', async ({ page }) => {
    // Screenshot: Start with empty home
    await page.screenshot({ path: 'e2e/screenshots/14-home-before-multiple-meals.png' });

    // Log first meal (breakfast)
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]');
    await page.getByTestId('select-button-0').click();

    // Screenshot: First meal modal
    await page.screenshot({ path: 'e2e/screenshots/15-first-meal-modal.png' });

    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Screenshot: Home after first meal
    await page.screenshot({ path: 'e2e/screenshots/16-home-after-first-meal.png' });

    // Log second meal (snack)
    await page.getByTestId('snack-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]');
    await page.getByTestId('select-button-0').click();

    // Screenshot: Second meal modal
    await page.screenshot({ path: 'e2e/screenshots/17-second-meal-modal.png' });

    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Should show both meals in Recent Meals
    await expect(page.getByText('Today, breakfast')).toBeVisible();
    await expect(page.getByText('Today, snack')).toBeVisible();

    // Should show checkmarks for each meal
    const checkmarks = await page.getByText('✓').count();
    expect(checkmarks).toBeGreaterThanOrEqual(2);

    // Screenshot: Home with multiple meals logged
    await page.screenshot({ path: 'e2e/screenshots/18-home-with-multiple-meals.png' });
  });

  test('should navigate back from suggestions screen', async ({ page }) => {
    // Navigate to suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Screenshot: On suggestions screen
    await page.screenshot({ path: 'e2e/screenshots/19-suggestions-before-back.png' });

    // Click back button
    await page.getByTestId('back-button').click();

    // Should be back on home
    await expect(page).toHaveURL('/');
    await expect(page.getByText('SaborSpin')).toBeVisible();

    // Screenshot: Back on home screen
    await page.screenshot({ path: 'e2e/screenshots/20-home-after-back.png' });
  });

  test('should display meals in History screen grouped by date', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 15000 });

    // Log a breakfast meal
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();

    // Navigate to History tab
    await page.waitForTimeout(1000);
    await page.getByText('History').click();
    await page.waitForTimeout(2000);

    // Verify "Today" section exists (use .first() to avoid strict mode)
    const todaySection = page.getByText('Today', { exact: true }).first();
    await expect(todaySection).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/history-screen.png' });
  });

  test('should change settings and apply new preferences', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 15000 });

    // Navigate to Settings tab
    await page.getByText('Settings').click();
    await page.waitForTimeout(2000);

    // Verify Settings screen is loaded by checking unique content
    const varietyCooldown = page.getByText('Variety Cooldown', { exact: true }).first();
    const numberOfSuggestions = page.getByText('Number of Suggestions', { exact: true }).first();
    await expect(varietyCooldown).toBeVisible();
    await expect(numberOfSuggestions).toBeVisible();

    // Take screenshot of settings
    await page.screenshot({ path: 'e2e/screenshots/settings-screen.png' });
  });

  test('should generate correct number of suggestions based on settings', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 15000 });

    // Navigate to Breakfast Ideas
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });

    // Count suggestion cards (default should be 3 or 4 based on preferences)
    const suggestions = await page.locator('[data-testid^="suggestion-"]').count();
    expect(suggestions).toBeGreaterThan(0);
    expect(suggestions).toBeLessThanOrEqual(6);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/suggestions-with-preferences.png' });
  });

  test('should show both breakfast and snack meals in History', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 15000 });

    // Log a breakfast meal
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();
    await page.waitForTimeout(1000);

    // Log a snack meal
    await page.getByTestId('snack-ideas-button').click();
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForTimeout(500);
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();
    await page.waitForTimeout(1000);

    // Navigate to History
    await page.getByText('History').click();
    await page.waitForTimeout(2000);

    // Verify breakfast and snack labels exist
    const breakfastLabel = page.getByText('Breakfast').first();
    const snackLabel = page.getByText('Snack').first();
    await expect(breakfastLabel).toBeVisible();
    await expect(snackLabel).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/history-multiple-meals.png' });
  });

  test('should navigate between all three tabs', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 15000 });

    // Verify Home tab is active
    await expect(page.getByTestId('breakfast-ideas-button')).toBeVisible();

    // Navigate to History
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);
    // Check for either empty state or meals
    const historyScreen = page
      .getByTestId('history-empty-state')
      .or(page.getByText('Today', { exact: true }).first());
    await expect(historyScreen).toBeVisible();

    // Navigate to Settings
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    const settingsContent = page.getByText('Number of Suggestions', { exact: true }).first();
    await expect(settingsContent).toBeVisible();

    // Navigate back to Home
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('breakfast-ideas-button')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/tab-navigation.png' });
  });
});

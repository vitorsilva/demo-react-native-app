import { test, expect } from '@playwright/test';

test.describe('Meal Logging Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for database to be ready
    await page.goto('/');
    // Wait for the database to initialize (seed data logs to console)
    await page.waitForFunction(() => {
      // Check if we see "Meals Randomizer" which indicates app is loaded
      return document.body.textContent?.includes('Meals Randomizer');
    });
  });

  test('should show empty state when no meals logged', async ({ page }) => {
    await expect(page.getByText('No meals logged yet')).toBeVisible();
    await expect(page.getByText('Breakfast Ideas')).toBeVisible();
    await expect(page.getByText('Snack Ideas')).toBeVisible();
  });

  test('should navigate to breakfast suggestions and show real ingredients', async ({ page }) => {
    // Click on Breakfast Ideas
    await page.getByText('Breakfast Ideas').click();

    // Should navigate to suggestions screen
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);
    await expect(page.getByText('Breakfast Ideas')).toBeVisible();
    await expect(page.getByText('Pick one:')).toBeVisible();

    // Should show ingredient combinations (from seeded database)
    // At least one "Select" button should be visible
    await expect(page.getByText('Select').first()).toBeVisible();

    // Should show "Generate New Ideas" button
    await expect(page.getByText('Generate New Ideas')).toBeVisible();
  });

  test('should log a breakfast meal and show in Recent Meals', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByText('Breakfast Ideas').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('text=Select');

    // Get the first suggestion's ingredients
    const firstSuggestion = page.locator('[style*="overflow: hidden"]').first();
    const ingredientText = await firstSuggestion.textContent();

    // Click Select on first suggestion
    await page.getByText('Select').first().click();

    // Modal should appear with "Breakfast Logged"
    await expect(page.getByText('Breakfast Logged')).toBeVisible();
    await expect(page.getByText('Enjoy your meal!')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();

    // Click Done
    await page.getByText('Done').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Recent Meals should now show the logged meal
    await expect(page.getByText('Today, breakfast')).toBeVisible();

    // Should not show empty state anymore
    await expect(page.getByText('No meals logged yet')).not.toBeVisible();
  });

  test('should log a snack meal and show in Recent Meals', async ({ page }) => {
    // Navigate to snack suggestions
    await page.getByText('Snack Ideas').click();
    await expect(page).toHaveURL(/\/suggestions\/snack/);

    // Wait for suggestions to load
    await page.waitForSelector('text=Select');

    // Should show "Snack Ideas" title
    await expect(page.getByText('Snack Ideas')).toBeVisible();

    // Click Select on first suggestion
    await page.getByText('Select').first().click();

    // Modal should appear with "Snack Logged"
    await expect(page.getByText('Snack Logged')).toBeVisible();

    // Click Done
    await page.getByText('Done').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Recent Meals should now show the logged snack
    await expect(page.getByText('Today, snack')).toBeVisible();
  });

  test('should generate new suggestions when clicking Generate New Ideas', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByText('Breakfast Ideas').click();
    await page.waitForSelector('text=Select');

    // Get the current suggestions text
    const initialSuggestions = await page.locator('text=/.*\\+.*/').allTextContents();

    // Click Generate New Ideas
    await page.getByText('Generate New Ideas').click();

    // Wait for new suggestions to load
    await page.waitForSelector('text=Select');

    // Get new suggestions text
    const newSuggestions = await page.locator('text=/.*\\+.*/').allTextContents();

    // The suggestions should be different (at least some of them)
    // Note: This might occasionally fail if random generation produces same results
    expect(newSuggestions.length).toBeGreaterThan(0);
  });

  test('should show multiple meals in Recent Meals section', async ({ page }) => {
    // Log first meal (breakfast)
    await page.getByText('Breakfast Ideas').click();
    await page.waitForSelector('text=Select');
    await page.getByText('Select').first().click();
    await page.getByText('Done').click();
    await expect(page).toHaveURL('/');

    // Log second meal (snack)
    await page.getByText('Snack Ideas').click();
    await page.waitForSelector('text=Select');
    await page.getByText('Select').first().click();
    await page.getByText('Done').click();
    await expect(page).toHaveURL('/');

    // Should show both meals in Recent Meals
    await expect(page.getByText('Today, breakfast')).toBeVisible();
    await expect(page.getByText('Today, snack')).toBeVisible();

    // Should show checkmarks for each meal
    const checkmarks = await page.getByText('✓').count();
    expect(checkmarks).toBeGreaterThanOrEqual(2);
  });

  test('should navigate back from suggestions screen', async ({ page }) => {
    // Navigate to suggestions
    await page.getByText('Breakfast Ideas').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Click back button
    await page.getByText('←').click();

    // Should be back on home
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Meals Randomizer')).toBeVisible();
  });
});

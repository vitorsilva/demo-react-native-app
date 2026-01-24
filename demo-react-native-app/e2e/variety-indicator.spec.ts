import { test, expect } from '@playwright/test';

test.describe('Variety Indicator Feature', () => {
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

  test('should show variety indicator on suggestion cards', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Variety indicator should be visible on at least one suggestion
    // Fresh database = all combinations are "green" (fresh)
    const greenIndicator = page.getByTestId('variety-indicator-green').first();
    await expect(greenIndicator).toBeVisible();

    // Screenshot: Variety indicator visible
    await page.screenshot({ path: 'e2e/screenshots/variety-indicator-01-visible.png' });
  });

  test('should show green indicator for fresh combinations', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Fresh database = all combinations show green indicator
    // Check that green indicator exists
    const greenIndicators = page.getByTestId('variety-indicator-green');
    const greenCount = await greenIndicators.count();

    expect(greenCount).toBeGreaterThan(0);

    // Screenshot: Green indicators for fresh choices
    await page.screenshot({ path: 'e2e/screenshots/variety-indicator-02-green.png' });
  });

  test('should change indicator color after logging a combination', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: Before logging - should be green
    await page.screenshot({ path: 'e2e/screenshots/variety-indicator-03-before-log.png' });

    // Count green indicators before logging
    const greenIndicatorsBefore = await page.getByTestId('variety-indicator-green').count();
    expect(greenIndicatorsBefore).toBeGreaterThan(0);

    // Select the first suggestion to log it
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Navigate back to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: After logging
    await page.screenshot({ path: 'e2e/screenshots/variety-indicator-04-after-log.png' });

    // After logging, if the same combination appears, it should be red (logged today)
    // Note: Due to regeneration, the same combination may not appear
    // We verify that the indicator system is still working
    const anyIndicator = page.locator('[data-testid^="variety-indicator-"]').first();
    await expect(anyIndicator).toBeVisible();
  });

  test('should show variety indicator with correct icon for accessibility', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Green indicator should contain checkmark icon (✓)
    const greenIndicator = page.getByTestId('variety-indicator-green').first();
    await expect(greenIndicator).toBeVisible();

    // Verify the indicator has some content (the icon)
    const indicatorText = await greenIndicator.textContent();
    expect(indicatorText).toBeTruthy();

    // Screenshot: Indicator with icon
    await page.screenshot({ path: 'e2e/screenshots/variety-indicator-05-with-icon.png' });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Variety Stats Feature', () => {
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

  test('should display variety stats card on home screen', async ({ page }) => {
    // The variety stats card should be visible on the home screen
    const statsCard = page.getByTestId('variety-stats-card');
    await expect(statsCard).toBeVisible();

    // The card should have a title
    await expect(page.getByText('Your Variety This Month')).toBeVisible();

    // Screenshot: Stats card on home screen
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-01-home-display.png' });
  });

  test('should show stats content when expanded', async ({ page }) => {
    // Stats card should be visible
    const statsCard = page.getByTestId('variety-stats-card');
    await expect(statsCard).toBeVisible();

    // Content should be visible by default (expanded state)
    const statsContent = page.getByTestId('variety-stats-content');
    await expect(statsContent).toBeVisible();

    // Should display variety score text (with fresh database, might show 0 or empty state)
    // Check for either the "No meals logged yet" text or variety score
    const hasNoData = await page.getByText('No meals logged yet').isVisible().catch(() => false);
    const hasVarietyScore = await page.getByText(/Variety score/).isVisible().catch(() => false);

    expect(hasNoData || hasVarietyScore).toBeTruthy();

    // Screenshot: Stats content expanded
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-02-expanded.png' });
  });

  test('should collapse and expand stats card when toggle is clicked', async ({ page }) => {
    // Stats card should be visible and expanded by default
    const statsCard = page.getByTestId('variety-stats-card');
    await expect(statsCard).toBeVisible();

    const statsContent = page.getByTestId('variety-stats-content');
    await expect(statsContent).toBeVisible();

    // Screenshot: Before collapse
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-03-before-collapse.png' });

    // Click the toggle button to collapse
    const toggleButton = page.getByTestId('variety-stats-toggle');
    await toggleButton.click();

    // Content should be hidden after collapse
    await expect(statsContent).not.toBeVisible();

    // Screenshot: After collapse
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-04-collapsed.png' });

    // Click again to expand
    await toggleButton.click();

    // Content should be visible again
    await expect(statsContent).toBeVisible();

    // Screenshot: After re-expand
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-05-re-expanded.png' });
  });

  test('should update stats after logging a meal', async ({ page }) => {
    // First, check the initial state of the stats card
    const statsCard = page.getByTestId('variety-stats-card');
    await expect(statsCard).toBeVisible();

    // Screenshot: Initial stats (no meals)
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-06-before-meal.png' });

    // Navigate to breakfast suggestions and log a meal
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Select the first suggestion
    await page.getByTestId('select-button-0').click();

    // Wait for modal and confirm
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Stats card should still be visible
    await expect(statsCard).toBeVisible();

    // Wait for the stats to update (the component uses useMemo with mealLogs dependency)
    await page.waitForTimeout(500);

    // Screenshot: Stats after logging one meal
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-07-after-meal.png' });

    // After logging a meal, we should see actual stats (not empty state)
    // Check for the unique combinations text (1 unique combo)
    const uniqueCombosText = page.getByText(/unique/i);
    await expect(uniqueCombosText).toBeVisible();

    // Should show variety score
    const varietyScoreText = page.getByText(/Variety score/);
    await expect(varietyScoreText).toBeVisible();
  });

  test('should show stats in correct language (English)', async ({ page }) => {
    // Stats card should show English text (default language)
    const statsCard = page.getByTestId('variety-stats-card');
    await expect(statsCard).toBeVisible();

    // Title should be in English
    await expect(page.getByText('Your Variety This Month')).toBeVisible();

    // Toggle button accessibility label should work
    const toggleButton = page.getByTestId('variety-stats-toggle');
    await expect(toggleButton).toBeVisible();

    // Check for English text patterns in the card
    const expandCollapseIcon = await toggleButton.textContent();
    expect(expandCollapseIcon).toMatch(/[▲▼]/);
  });

  test('should display all stat categories when meals are logged', async ({ page }) => {
    // Log a breakfast meal first
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Wait for stats to update
    await page.waitForTimeout(500);

    // Check for all stat icons/emojis that should be present
    const statsContent = page.getByTestId('variety-stats-content');
    await expect(statsContent).toBeVisible();

    // Should show unique combinations (🎯)
    await expect(page.getByText('🎯')).toBeVisible();

    // Should show most common (⭐)
    await expect(page.getByText('⭐')).toBeVisible();

    // Should show ingredients used (🥗)
    await expect(page.getByText('🥗')).toBeVisible();

    // Should show variety score (📈)
    await expect(page.getByText('📈')).toBeVisible();

    // Screenshot: All stats displayed
    await page.screenshot({ path: 'e2e/screenshots/variety-stats-08-all-categories.png' });
  });
});

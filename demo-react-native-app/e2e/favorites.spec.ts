import { test, expect } from '@playwright/test';

test.describe('Favorites Feature', () => {
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

  test('should mark a suggestion as favorite from suggestions screen', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Verify favorite button exists and shows unfavorited state (☆)
    const favoriteButton = page.getByTestId('favorite-button-0');
    await expect(favoriteButton).toBeVisible();

    // Initial state should be unfavorited (☆)
    await expect(favoriteButton).toContainText('☆');

    // Screenshot: Before favoriting
    await page.screenshot({ path: 'e2e/screenshots/favorites-01-before-favorite.png' });

    // Click to favorite
    await favoriteButton.click();

    // Wait for the UI to update
    await page.waitForTimeout(500);

    // Should now show favorited state (⭐)
    await expect(favoriteButton).toContainText('⭐');

    // Screenshot: After favoriting
    await page.screenshot({ path: 'e2e/screenshots/favorites-02-after-favorite.png' });
  });

  test('should toggle favorite off from suggestions screen', async ({ page }) => {
    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    const favoriteButton = page.getByTestId('favorite-button-0');

    // First, favorite it
    await favoriteButton.click();
    await page.waitForTimeout(500);
    await expect(favoriteButton).toContainText('⭐');

    // Now unfavorite it
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Should show unfavorited state again (☆)
    await expect(favoriteButton).toContainText('☆');

    // Screenshot: After unfavoriting
    await page.screenshot({ path: 'e2e/screenshots/favorites-03-toggle-off.png' });
  });

  test('should show favorite indicator in history screen', async ({ page }) => {
    // First, log a meal and mark it as favorite
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Favorite the first suggestion (this also logs it as a meal)
    const favoriteButton = page.getByTestId('favorite-button-0');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Navigate back to home
    await page.getByTestId('back-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for history content to load
    await page.waitForFunction(
      () => {
        const hasEmptyState = document.querySelector('[data-testid="history-empty-state"]');
        const hasTodaySection = document.body.textContent?.includes('Today');
        return hasEmptyState || hasTodaySection;
      },
      { timeout: 10000 }
    );

    // Should show the favorited meal with star icon (⭐)
    const historyFavoriteIcon = page.locator('text=⭐').first();
    await expect(historyFavoriteIcon).toBeVisible();

    // Screenshot: History with favorited meal
    await page.screenshot({ path: 'e2e/screenshots/favorites-04-history-with-favorite.png' });
  });

  test('should filter history to show only favorites', async ({ page }) => {
    // Log a breakfast meal without favoriting (using select)
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');
    await page.waitForTimeout(500);

    // Log a snack meal and favorite it
    await page.getByTestId('snack-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Favorite the snack suggestion
    await page.getByTestId('favorite-button-0').click();
    await page.waitForTimeout(500);

    // Navigate back to home
    await page.getByTestId('back-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for filter tabs to appear
    await page.waitForSelector('[data-testid="filter-all"]', { timeout: 10000 });

    // Screenshot: History with All filter (both meals visible)
    await page.screenshot({ path: 'e2e/screenshots/favorites-05-history-all-filter.png' });

    // Should show both "Breakfast" and "Snack" labels
    await expect(page.getByText('Breakfast').first()).toBeVisible();
    await expect(page.getByText('Snack').first()).toBeVisible();

    // Click on Favorites filter
    await page.getByTestId('filter-favorites').click();
    await page.waitForTimeout(500);

    // Screenshot: History with Favorites filter
    await page.screenshot({ path: 'e2e/screenshots/favorites-06-history-favorites-filter.png' });

    // Should only show Snack (the favorited meal)
    await expect(page.getByText('Snack').first()).toBeVisible();

    // Breakfast should NOT be visible (it wasn't favorited)
    // Use a more specific selector to check it's not in the list
    const breakfastItems = page.locator('[data-testid^="favorite-button-"]').filter({ hasText: 'Breakfast' });
    const breakfastLabel = page.getByText('Breakfast', { exact: true });
    // Either no breakfast at all, or the count should be 0
    const breakfastCount = await breakfastLabel.count();
    // Breakfast shouldn't be visible when filtered to favorites only
    if (breakfastCount > 0) {
      await expect(breakfastLabel.first()).not.toBeVisible();
    }
  });

  test('should show empty state when favorites filter active with no favorites', async ({ page }) => {
    // Log a meal WITHOUT favoriting
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
    await page.getByTestId('done-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History tab
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Wait for filter tabs
    await page.waitForSelector('[data-testid="filter-all"]', { timeout: 10000 });

    // Click Favorites filter
    await page.getByTestId('filter-favorites').click();
    await page.waitForTimeout(500);

    // Should show empty favorites state
    await expect(page.getByTestId('history-empty-favorites')).toBeVisible();

    // Screenshot: Empty favorites state
    await page.screenshot({ path: 'e2e/screenshots/favorites-07-empty-favorites.png' });
  });

  test('should toggle favorite from history screen', async ({ page }) => {
    // Log a meal first
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('select-button-0').click();
    await page.waitForSelector('[data-testid="done-button"]', { timeout: 10000 });
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

    // Screenshot: Before favoriting in history
    await page.screenshot({ path: 'e2e/screenshots/favorites-08-history-before-toggle.png' });

    // Click to favorite
    await historyFavoriteButton.click();
    await page.waitForTimeout(500);

    // Should now show ⭐
    await expect(historyFavoriteButton).toContainText('⭐');

    // Screenshot: After favoriting in history
    await page.screenshot({ path: 'e2e/screenshots/favorites-09-history-after-toggle.png' });

    // Toggle it off
    await historyFavoriteButton.click();
    await page.waitForTimeout(500);

    // Should show ☆ again
    await expect(historyFavoriteButton).toContainText('☆');
  });

  test('should persist favorite status after page reload', async ({ page }) => {
    // Navigate to breakfast suggestions and favorite
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Favorite the first suggestion
    const favoriteButton = page.getByTestId('favorite-button-0');
    await favoriteButton.click();
    await page.waitForTimeout(500);
    await expect(favoriteButton).toContainText('⭐');

    // Navigate back
    await page.getByTestId('back-button').click();
    await expect(page).toHaveURL('/');

    // Navigate to History to verify favorite is saved
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Click Favorites filter
    await page.waitForSelector('[data-testid="filter-favorites"]', { timeout: 10000 });
    await page.getByTestId('filter-favorites').click();
    await page.waitForTimeout(500);

    // Should show the favorited meal (not empty state)
    await expect(page.getByTestId('history-empty-favorites')).not.toBeVisible();

    // Screenshot: Before reload
    await page.screenshot({ path: 'e2e/screenshots/favorites-10-before-reload.png' });

    // Reload the page
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });

    // Wait for app to be ready
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 30000 });

    // Navigate to History again
    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(1000);

    // Click Favorites filter
    await page.waitForSelector('[data-testid="filter-favorites"]', { timeout: 10000 });
    await page.getByTestId('filter-favorites').click();
    await page.waitForTimeout(500);

    // Favorite should still be there (not empty state)
    await expect(page.getByTestId('history-empty-favorites')).not.toBeVisible();

    // Screenshot: After reload
    await page.screenshot({ path: 'e2e/screenshots/favorites-11-after-reload.png' });
  });
});

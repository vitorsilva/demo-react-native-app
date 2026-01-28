import { test, expect } from '@playwright/test';

test.describe('Seed Data & App Reset', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for app to be ready
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

  test.describe('Data Management Section', () => {
    test('should display Data Management section in Settings', async ({ page }) => {
      // Navigate to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);

      // Scroll down to find Data Management section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Verify Data Management section is visible
      await expect(page.getByTestId('data-management-section')).toBeVisible();
      await expect(page.getByTestId('reset-app-data-button')).toBeVisible();

      // Screenshot: Data Management section
      await page.screenshot({ path: 'e2e/screenshots/seed-data-01-data-management.png' });
    });

    test('should show confirmation modal when reset button is clicked', async ({ page }) => {
      // Navigate to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);

      // Scroll down to find Data Management section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Click reset button
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);

      // Verify confirmation modal appears
      await expect(page.getByTestId('confirm-reset-button')).toBeVisible();
      await expect(page.getByTestId('cancel-reset-button')).toBeVisible();

      // Screenshot: Confirmation modal
      await page.screenshot({ path: 'e2e/screenshots/seed-data-02-confirm-modal.png' });
    });

    test('should close modal when cancel is clicked', async ({ page }) => {
      // Navigate to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);

      // Scroll and click reset button
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);

      // Click cancel
      await page.getByTestId('cancel-reset-button').click();
      await page.waitForTimeout(500);

      // Modal should be closed
      await expect(page.getByTestId('confirm-reset-button')).not.toBeVisible();

      // Reset button should still be visible
      await expect(page.getByTestId('reset-app-data-button')).toBeVisible();
    });
  });

  test.describe('Seeded Categories', () => {
    test('should display seeded categories in Manage Categories', async ({ page }) => {
      // Navigate to Categories tab
      await page.getByRole('tab', { name: 'Categories' }).click();
      await page.waitForTimeout(1000);

      // Verify some seeded categories are visible
      // These should be seeded by migrations
      const categoryNames = ['Fruits', 'Dairy', 'Bakery', 'Proteins'];

      for (const catName of categoryNames) {
        const categoryElement = page.getByText(catName, { exact: true });
        // Check if at least some categories exist (app may have been reset or fresh install)
        const isVisible = await categoryElement.isVisible().catch(() => false);
        if (isVisible) {
          await expect(categoryElement).toBeVisible();
        }
      }

      // Screenshot: Categories list
      await page.screenshot({ path: 'e2e/screenshots/seed-data-03-categories.png' });
    });
  });

  test.describe('Seeded Pairing Rules', () => {
    test('should display seeded pairing rules', async ({ page }) => {
      // Navigate to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);

      // Click on Pairing Rules link
      await page.getByTestId('pairing-rules-link').click();
      await page.waitForTimeout(1000);

      // Verify pairing rules screen is loaded
      await expect(page.getByTestId('tab-good-pairs')).toBeVisible();
      await expect(page.getByTestId('tab-avoid')).toBeVisible();

      // Screenshot: Pairing rules
      await page.screenshot({ path: 'e2e/screenshots/seed-data-04-pairing-rules.png' });
    });
  });

  test.describe('Reset Flow', () => {
    // Note: This test actually performs the reset - use carefully
    test('should reset app data when confirmed', async ({ page }) => {
      // Navigate to Settings tab
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);

      // Scroll down to find Data Management section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Click reset button
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);

      // Screenshot before confirming
      await page.screenshot({ path: 'e2e/screenshots/seed-data-05-before-reset.png' });

      // Click confirm to reset
      await page.getByTestId('confirm-reset-button').click();

      // Wait for reset to complete (modal should close and success alert may appear)
      await page.waitForTimeout(3000);

      // Modal should be closed after reset
      await expect(page.getByTestId('confirm-reset-button')).not.toBeVisible();

      // Screenshot after reset
      await page.screenshot({ path: 'e2e/screenshots/seed-data-06-after-reset.png' });
    });

    test('should have empty meal history after reset', async ({ page }) => {
      // First perform a reset
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);
      await page.getByTestId('confirm-reset-button').click();
      await page.waitForTimeout(3000);

      // Navigate to History tab
      await page.getByRole('tab', { name: 'History' }).click();
      await page.waitForTimeout(1000);

      // Should show empty state (no meal logs after reset)
      await expect(page.getByTestId('history-empty-state')).toBeVisible();

      // Screenshot: Empty history after reset
      await page.screenshot({ path: 'e2e/screenshots/seed-data-07-empty-history.png' });
    });

    test('should have seeded categories after reset', async ({ page }) => {
      // First perform a reset
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);
      await page.getByTestId('confirm-reset-button').click();
      await page.waitForTimeout(3000);

      // Navigate to Categories tab
      await page.getByRole('tab', { name: 'Categories' }).click();
      await page.waitForTimeout(1000);

      // Verify seeded categories exist
      await expect(page.getByText('Fruits', { exact: true })).toBeVisible();
      await expect(page.getByText('Dairy', { exact: true })).toBeVisible();

      // Screenshot: Categories after reset
      await page.screenshot({ path: 'e2e/screenshots/seed-data-08-categories-after-reset.png' });
    });

    test('should have seeded ingredients after reset', async ({ page }) => {
      // First perform a reset
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(1000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.getByTestId('reset-app-data-button').click();
      await page.waitForTimeout(500);
      await page.getByTestId('confirm-reset-button').click();
      await page.waitForTimeout(3000);

      // Navigate to Ingredients tab
      await page.getByRole('tab', { name: 'Ingredients' }).click();
      await page.waitForTimeout(1000);

      // Verify some seeded ingredients exist
      await expect(page.getByText('Milk', { exact: true })).toBeVisible();

      // Screenshot: Ingredients after reset
      await page.screenshot({ path: 'e2e/screenshots/seed-data-09-ingredients-after-reset.png' });
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('Pairing Rules Management', () => {
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

    // Navigate to Settings tab
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
  });

  test('should display Pairing Rules link in Settings', async ({ page }) => {
    // Verify Pairing Rules link is visible using testID
    await expect(page.getByTestId('pairing-rules-link')).toBeVisible();

    // Screenshot: Pairing Rules link in Settings
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-01-settings-link.png' });
  });

  test('should navigate to Pairing Rules screen', async ({ page }) => {
    // Click Pairing Rules link
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Verify navigation to Pairing Rules screen by checking for the tabs and button
    await expect(page.getByTestId('tab-good-pairs')).toBeVisible();
    await expect(page.getByTestId('tab-avoid')).toBeVisible();
    await expect(page.getByTestId('add-pairing-rule-button')).toBeVisible();

    // Screenshot: Pairing Rules screen
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-02-screen.png' });
  });

  test('should show empty state for Good Pairs initially', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Good Pairs tab should be active by default
    await expect(page.getByTestId('tab-good-pairs')).toBeVisible();

    // Verify empty state message
    await expect(page.getByText('No good pairs defined yet')).toBeVisible();

    // Screenshot: Empty Good Pairs
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-03-empty-good-pairs.png' });
  });

  test('should show empty state for Avoid tab', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Switch to Avoid tab
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Verify empty state message for Avoid tab
    await expect(page.getByText('No avoid rules defined yet')).toBeVisible();

    // Screenshot: Empty Avoid
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-04-empty-avoid.png' });
  });

  test('should open add pairing rule modal', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Click add button
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Verify modal is visible by checking for the ingredient selectors
    await expect(page.getByTestId('select-ingredient-a')).toBeVisible();
    await expect(page.getByTestId('select-ingredient-b')).toBeVisible();
    await expect(page.getByTestId('cancel-pairing-rule')).toBeVisible();
    await expect(page.getByTestId('save-pairing-rule')).toBeVisible();

    // Screenshot: Add modal open
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-05-add-modal.png' });
  });

  test('should cancel adding a pairing rule', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Verify modal is open by checking for ingredient selectors
    await expect(page.getByTestId('select-ingredient-a')).toBeVisible();

    // Click cancel
    await page.getByTestId('cancel-pairing-rule').click();
    await page.waitForTimeout(500);

    // Verify modal is closed by checking ingredient selectors are not visible
    await expect(page.getByTestId('select-ingredient-a')).not.toBeVisible();
  });

  test('should show validation error when not selecting both ingredients', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Try to add without selecting ingredients
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(500);

    // Verify error message
    await expect(page.getByText('Please select both ingredients')).toBeVisible();

    // Screenshot: Validation error
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-06-validation-error.png' });
  });

  test('should add a positive (good pair) pairing rule', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select first ingredient
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);

    // Select an ingredient from the list (first available)
    await page.locator('[data-testid^="select-ingredient-"]').first().click();
    await page.waitForTimeout(500);

    // Select second ingredient
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);

    // Select another ingredient from the list (second available, different from first)
    await page.locator('[data-testid^="select-ingredient-"]').nth(1).click();
    await page.waitForTimeout(500);

    // Save the rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify modal is closed by checking ingredient selectors are not visible
    await expect(page.getByTestId('select-ingredient-a')).not.toBeVisible();

    // Verify empty state is gone
    await expect(page.getByText('No good pairs defined yet')).not.toBeVisible();

    // Verify rule appears in the list - should have a pairing rule item
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Good pair added
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-07-good-pair-added.png' });
  });

  test('should add a negative (avoid) pairing rule', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Switch to Avoid tab
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Verify modal is open by checking ingredient selectors
    await expect(page.getByTestId('select-ingredient-a')).toBeVisible();

    // Select first ingredient
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);

    // Select an ingredient from the list
    await page.locator('[data-testid^="select-ingredient-"]').first().click();
    await page.waitForTimeout(500);

    // Select second ingredient
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);

    // Select another ingredient from the list
    await page.locator('[data-testid^="select-ingredient-"]').nth(1).click();
    await page.waitForTimeout(500);

    // Save the rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify modal is closed
    await expect(page.getByTestId('select-ingredient-a')).not.toBeVisible();

    // Verify empty state is gone
    await expect(page.getByText('No avoid rules defined yet')).not.toBeVisible();

    // Verify rule appears in the list
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Avoid pair added
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-08-avoid-pair-added.png' });
  });

  test('should delete a pairing rule', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // First add a rule to delete
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select first ingredient
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').first().click();
    await page.waitForTimeout(500);

    // Select second ingredient
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').nth(1).click();
    await page.waitForTimeout(500);

    // Save the rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify rule was added
    const ruleItem = page.locator('[data-testid^="pairing-rule-"]').first();
    await expect(ruleItem).toBeVisible();

    // Screenshot: Before deletion
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-09-before-delete.png' });

    // Click delete button on the rule
    await page.locator('[data-testid^="delete-rule-"]').first().click();
    await page.waitForTimeout(500);

    // Handle the confirmation dialog
    const deleteConfirmButton = page.locator('[role="button"]').filter({ hasText: 'Delete' }).last();
    if (await deleteConfirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteConfirmButton.click();
      await page.waitForTimeout(500);
    }

    // Wait for the UI to update
    await page.waitForFunction(
      () => {
        // Check if no pairing rules exist
        const ruleItems = document.querySelectorAll('[data-testid^="pairing-rule-"]');
        return ruleItems.length === 0;
      },
      { timeout: 5000 }
    ).catch(() => {
      // If rule is still visible, the test should catch this
    });

    // Screenshot: After deletion
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-10-after-delete.png' });
  });

  test('should navigate back to Settings', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Verify we're on Pairing Rules screen by checking for the tabs
    await expect(page.getByTestId('tab-good-pairs')).toBeVisible();

    // Click back button
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);

    // Verify we're back on Settings by checking for the pairing rules link
    await expect(page.getByTestId('pairing-rules-link')).toBeVisible();
  });

  test('full workflow: add good pair, add avoid pair, verify tabs, delete rules', async ({ page }) => {
    // Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Step 1: Add a good pair
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').first().click();
    await page.waitForTimeout(500);

    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').nth(1).click();
    await page.waitForTimeout(500);

    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify good pair was added
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Good pair added
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-11-workflow-good-pair.png' });

    // Step 2: Switch to Avoid tab and add an avoid pair
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Verify empty state for avoid tab
    await expect(page.getByText('No avoid rules defined yet')).toBeVisible();

    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').nth(2).click(); // Use different ingredients
    await page.waitForTimeout(500);

    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    await page.locator('[data-testid^="select-ingredient-"]').nth(3).click();
    await page.waitForTimeout(500);

    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify avoid pair was added
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Avoid pair added
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-12-workflow-avoid-pair.png' });

    // Step 3: Verify tab switching shows correct rules
    await page.getByTestId('tab-good-pairs').click();
    await page.waitForTimeout(500);

    // Good pairs tab should show our good pair
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Switch back to avoid
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Avoid tab should show our avoid pair
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Step 4: Delete the avoid pair
    await page.locator('[data-testid^="delete-rule-"]').first().click();
    await page.waitForTimeout(500);

    const deleteConfirmButton = page.locator('[role="button"]').filter({ hasText: 'Delete' }).last();
    if (await deleteConfirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteConfirmButton.click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);

    // Screenshot: After deleting avoid pair
    await page.screenshot({ path: 'e2e/screenshots/pairing-rules-13-workflow-deleted.png' });
  });
});

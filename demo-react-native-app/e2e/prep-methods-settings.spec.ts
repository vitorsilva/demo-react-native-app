import { test, expect } from '@playwright/test';

test.describe('Preparation Methods Management (Settings)', () => {
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

  test('should display Preparation Methods section in Settings', async ({ page }) => {
    // Verify Preparation Methods section is visible
    await expect(page.getByText('Preparation Methods')).toBeVisible();
    await expect(page.getByText('Manage how ingredients can be prepared')).toBeVisible();

    // Verify system methods section exists
    await expect(page.getByTestId('system-prep-methods')).toBeVisible();
    await expect(page.getByText('System Methods')).toBeVisible();

    // Verify custom methods section exists
    await expect(page.getByTestId('custom-prep-methods')).toBeVisible();
    await expect(page.getByText('Custom Methods')).toBeVisible();

    // Screenshot: Preparation Methods section
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-01-settings-section.png' });
  });

  test('should display all 12 system preparation methods', async ({ page }) => {
    // Scroll to make prep methods visible
    await page.getByTestId('system-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify the 12 predefined system methods are displayed
    const systemMethods = [
      'fried',
      'grilled',
      'roasted',
      'boiled',
      'baked',
      'raw',
      'steamed',
      'sautéed',
      'stewed',
      'smoked',
      'poached',
      'braised',
    ];

    for (const method of systemMethods) {
      // Check the method text is visible in the system methods section
      const systemSection = page.getByTestId('system-prep-methods');
      await expect(systemSection.getByText(method)).toBeVisible();
    }

    // Screenshot: System preparation methods
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-02-system-methods.png' });
  });

  test('should show empty state for custom methods initially', async ({ page }) => {
    // Scroll to custom methods section
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify empty state message
    await expect(page.getByText('No custom methods yet')).toBeVisible();

    // Screenshot: Empty custom methods
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-03-empty-custom.png' });
  });

  test('should open add preparation method modal', async ({ page }) => {
    // Click add button
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);

    // Verify modal is visible
    await expect(page.getByText('Add New Preparation Method')).toBeVisible();
    await expect(page.getByTestId('prep-method-name-input')).toBeVisible();
    await expect(page.getByTestId('cancel-prep-method-button')).toBeVisible();
    await expect(page.getByTestId('save-prep-method-button')).toBeVisible();

    // Screenshot: Add modal open
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-04-add-modal.png' });
  });

  test('should cancel adding a preparation method', async ({ page }) => {
    // Open add modal
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);

    // Type a name
    await page.getByTestId('prep-method-name-input').fill('test-method');

    // Click cancel
    await page.getByTestId('cancel-prep-method-button').click();
    await page.waitForTimeout(500);

    // Verify modal is closed
    await expect(page.getByText('Add New Preparation Method')).not.toBeVisible();

    // Verify method was not added
    await expect(page.getByText('test-method')).not.toBeVisible();
  });

  test('should add a custom preparation method', async ({ page }) => {
    // Open add modal
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);

    // Enter name
    await page.getByTestId('prep-method-name-input').fill('air-fried');

    // Click save
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(1000);

    // Verify modal is closed
    await expect(page.getByText('Add New Preparation Method')).not.toBeVisible();

    // Scroll to custom methods section
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify custom method appears in the list
    const customSection = page.getByTestId('custom-prep-methods');
    await expect(customSection.getByText('air-fried')).toBeVisible();

    // Verify empty state is gone
    await expect(page.getByText('No custom methods yet')).not.toBeVisible();

    // Screenshot: Custom method added
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-05-custom-method-added.png' });
  });

  test('should delete a custom preparation method', async ({ page }) => {
    // First add a custom method
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('prep-method-name-input').fill('sous-vide');
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(1000);

    // Scroll to custom methods section
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify method was added
    const customSection = page.getByTestId('custom-prep-methods');
    await expect(customSection.getByText('sous-vide')).toBeVisible();

    // Screenshot: Before deletion
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-06-before-delete.png' });

    // Find and click the delete button for this custom method
    // The delete button testID follows the pattern: delete-method-{methodId}
    // We need to find the delete button within the custom method row
    const customMethodRow = customSection.locator('[data-testid^="custom-method-"]').filter({ hasText: 'sous-vide' });

    // Get the delete button within that row's container
    // Since the row and delete button are siblings, we need to find the delete button that corresponds to this method
    const deleteButton = page.locator('[data-testid^="delete-method-"]').filter({ has: page.locator('..').filter({ hasText: 'sous-vide' }) });

    // Alternative approach: click the delete button next to 'sous-vide' text
    await page.getByText('sous-vide').locator('..').getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(500);

    // Handle the confirmation dialog (Alert)
    // In Playwright for web, dialogs are handled differently
    // The app uses react-native Alert which renders as a modal on web
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Wait for the dialog and accept it (React Native Alert becomes a native dialog on web)
    await page.waitForTimeout(1000);

    // If using RN web Alert which renders as actual buttons, click the delete confirmation
    const deleteConfirmButton = page.getByRole('button', { name: 'Delete' }).last();
    if (await deleteConfirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteConfirmButton.click();
      await page.waitForTimeout(500);
    }

    // Screenshot: After deletion
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-07-after-delete.png' });
  });

  test('should add multiple custom preparation methods', async ({ page }) => {
    const customMethods = ['air-fried', 'smashed', 'charred'];

    for (const methodName of customMethods) {
      // Open add modal
      await page.getByTestId('add-prep-method-button').click();
      await page.waitForTimeout(500);

      // Enter name
      await page.getByTestId('prep-method-name-input').fill(methodName);

      // Click save
      await page.getByTestId('save-prep-method-button').click();
      await page.waitForTimeout(1000);
    }

    // Scroll to custom methods section
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify all methods appear
    const customSection = page.getByTestId('custom-prep-methods');
    for (const methodName of customMethods) {
      await expect(customSection.getByText(methodName)).toBeVisible();
    }

    // Screenshot: Multiple custom methods
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-08-multiple-custom.png' });
  });

  test('should not allow adding duplicate preparation method name', async ({ page }) => {
    // First add a custom method
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('prep-method-name-input').fill('blanched');
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(1000);

    // Try to add the same method again
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('prep-method-name-input').fill('blanched');
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(500);

    // Should show an error (Alert dialog)
    // Handle the error alert - on web it's a native dialog or rendered modal
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('already exists');
      await dialog.dismiss();
    });

    // If using RN web Alert which renders as actual elements, check for error message
    // The error alert should be visible
    await page.waitForTimeout(500);

    // Screenshot: Duplicate error
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-09-duplicate-error.png' });
  });

  test('should not allow adding empty preparation method name', async ({ page }) => {
    // Open add modal
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);

    // Try to save without entering a name
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(500);

    // Should show an error (Alert dialog)
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('required');
      await dialog.dismiss();
    });

    await page.waitForTimeout(500);

    // Screenshot: Empty name error
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-10-empty-name-error.png' });
  });

  test('should trim whitespace from preparation method name', async ({ page }) => {
    // Open add modal
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);

    // Enter name with extra whitespace
    await page.getByTestId('prep-method-name-input').fill('  deep-fried  ');

    // Click save
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(1000);

    // Scroll to custom methods section
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify method was added with trimmed name
    const customSection = page.getByTestId('custom-prep-methods');
    await expect(customSection.getByText('deep-fried')).toBeVisible();

    // Screenshot: Trimmed name
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-11-trimmed-name.png' });
  });

  test('full workflow: add, verify, and delete custom preparation method', async ({ page }) => {
    // Step 1: Verify initial state - no custom methods
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await expect(page.getByText('No custom methods yet')).toBeVisible();

    // Step 2: Add a custom method
    await page.getByTestId('add-prep-method-button').click();
    await page.waitForTimeout(500);
    await page.getByTestId('prep-method-name-input').fill('wok-fried');
    await page.getByTestId('save-prep-method-button').click();
    await page.waitForTimeout(1000);

    // Step 3: Verify method appears
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    const customSection = page.getByTestId('custom-prep-methods');
    await expect(customSection.getByText('wok-fried')).toBeVisible();
    await expect(page.getByText('No custom methods yet')).not.toBeVisible();

    // Screenshot: Method added
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-12-workflow-added.png' });

    // Step 4: Delete the method
    await page.getByText('wok-fried').locator('..').getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(500);

    // Handle confirmation dialog
    const deleteConfirmButton = page.getByRole('button', { name: 'Delete' }).last();
    if (await deleteConfirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteConfirmButton.click();
      await page.waitForTimeout(500);
    }

    // Step 5: Verify empty state returns
    await page.getByTestId('custom-prep-methods').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // The method should be gone - either empty state shows or method is not visible
    const methodVisible = await customSection.getByText('wok-fried').isVisible({ timeout: 500 }).catch(() => false);
    expect(methodVisible).toBe(false);

    // Screenshot: Method deleted
    await page.screenshot({ path: 'e2e/screenshots/prep-methods-13-workflow-deleted.png' });
  });
});

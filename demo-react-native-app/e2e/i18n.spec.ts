import { test, expect } from '@playwright/test';

test.describe('i18n Language Switching', () => {
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

  test('should load with English as default language', async ({ page }) => {
    // Home screen should show English text
    await expect(page.getByText('SaborSpin')).toBeVisible();
    await expect(page.getByText('Recent Meals')).toBeVisible();

    // Tab bar should show English labels
    await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'History' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();

    // Screenshot: English home screen
    await page.screenshot({ path: 'e2e/screenshots/i18n-01-english-home.png' });
  });

  test('should show language picker in Settings', async ({ page }) => {
    // Navigate to Settings
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    // Language section should be visible
    await expect(page.getByText('Language')).toBeVisible();

    // Both language options should be visible
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('Português')).toBeVisible();

    // English should be selected (has checkmark)
    const englishOption = page.locator('[data-testid="language-option-en"]');
    await expect(englishOption).toBeVisible();

    // Screenshot: Settings with language picker
    await page.screenshot({ path: 'e2e/screenshots/i18n-02-settings-language-picker.png' });
  });

  test('should switch language to Portuguese', async ({ page }) => {
    // Navigate to Settings
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    // Screenshot: Before switching language
    await page.screenshot({ path: 'e2e/screenshots/i18n-03-before-portuguese-switch.png' });

    // Click on Portuguese option
    await page.getByTestId('language-option-pt-PT').click();
    await page.waitForTimeout(500);

    // Settings header should now be in Portuguese
    await expect(page.getByText('Configurações')).toBeVisible();

    // Language section label should be in Portuguese
    await expect(page.getByText('Idioma')).toBeVisible();

    // Other settings labels should be in Portuguese
    await expect(page.getByText('Preferências Globais')).toBeVisible();
    await expect(page.getByText('Período de Variedade')).toBeVisible();

    // Screenshot: Portuguese settings screen
    await page.screenshot({ path: 'e2e/screenshots/i18n-04-portuguese-settings.png' });
  });

  test('should display all tabs in Portuguese after switching', async ({ page }) => {
    // Switch to Portuguese
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await page.getByTestId('language-option-pt-PT').click();
    await page.waitForTimeout(500);

    // Tab bar should show Portuguese labels
    await expect(page.getByRole('tab', { name: 'Início' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Configurações' })).toBeVisible();

    // Navigate to Home tab (now "Início")
    await page.getByRole('tab', { name: 'Início' }).click();
    await page.waitForTimeout(1000);

    // Home screen should show Portuguese text
    await expect(page.getByText('SaborSpin')).toBeVisible();
    await expect(page.getByText('Refeições Recentes')).toBeVisible();

    // Screenshot: Portuguese home screen
    await page.screenshot({ path: 'e2e/screenshots/i18n-05-portuguese-home.png' });

    // Navigate to History tab (now "Histórico")
    await page.getByRole('tab', { name: 'Histórico' }).click();
    await page.waitForTimeout(1000);

    // History screen should show Portuguese text
    // Check for either empty state or date labels
    const historyContent = page
      .getByTestId('history-empty-state')
      .or(page.getByText('Hoje', { exact: true }).first());
    await expect(historyContent).toBeVisible();

    // Screenshot: Portuguese history screen
    await page.screenshot({ path: 'e2e/screenshots/i18n-06-portuguese-history.png' });
  });

  test('should switch back to English', async ({ page }) => {
    // First switch to Portuguese
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await page.getByTestId('language-option-pt-PT').click();
    await page.waitForTimeout(500);

    // Verify Portuguese is active
    await expect(page.getByText('Configurações')).toBeVisible();

    // Screenshot: Portuguese settings before switching back
    await page.screenshot({ path: 'e2e/screenshots/i18n-07-portuguese-before-switch-back.png' });

    // Switch back to English
    await page.getByTestId('language-option-en').click();
    await page.waitForTimeout(500);

    // Settings should be back in English
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();
    await expect(page.getByText('Global Preferences')).toBeVisible();

    // Screenshot: Back to English settings
    await page.screenshot({ path: 'e2e/screenshots/i18n-08-back-to-english.png' });
  });

  test('should persist language preference after reload', async ({ page }) => {
    // Switch to Portuguese
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await page.getByTestId('language-option-pt-PT').click();
    await page.waitForTimeout(500);

    // Verify Portuguese is active
    await expect(page.getByText('Configurações')).toBeVisible();

    // Reload the page
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });

    // Wait for app to be ready again
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 30000 });

    // Should still be in Portuguese after reload
    await expect(page.getByText('SaborSpin')).toBeVisible();
    await expect(page.getByText('Refeições Recentes')).toBeVisible();

    // Tab bar should still be in Portuguese
    await expect(page.getByRole('tab', { name: 'Início' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Configurações' })).toBeVisible();

    // Screenshot: Portuguese persisted after reload
    await page.screenshot({ path: 'e2e/screenshots/i18n-09-portuguese-persisted.png' });
  });

  test('should display suggestions screen in Portuguese', async ({ page }) => {
    // Switch to Portuguese
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await page.getByTestId('language-option-pt-PT').click();
    await page.waitForTimeout(500);

    // Go back to Home
    await page.getByRole('tab', { name: 'Início' }).click();
    await page.waitForTimeout(1000);

    // Navigate to breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="back-button"]', { timeout: 15000 });

    // Wait for suggestions to load
    await page.waitForFunction(
      () => {
        const hasSelectButton = document.querySelector('[data-testid="select-button-0"]');
        const hasError = document.body.textContent?.includes('Erro');
        return hasSelectButton || hasError;
      },
      { timeout: 15000 }
    );

    // Should show Portuguese text
    await expect(page.getByText('Escolha uma:')).toBeVisible();
    await expect(page.getByText('Gerar Novas Ideias')).toBeVisible();

    // Screenshot: Portuguese suggestions screen
    await page.screenshot({ path: 'e2e/screenshots/i18n-10-portuguese-suggestions.png' });
  });
});

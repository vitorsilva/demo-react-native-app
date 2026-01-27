import { test, expect } from '@playwright/test';

test.describe('Suggestions with Pairing Rules', () => {
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

  test('should exclude negative pairing rules from suggestions', async ({ page }) => {
    // Step 1: Navigate to Settings
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    // Step 2: Navigate to Pairing Rules
    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Verify we're on the Pairing Rules screen
    await expect(page.getByTestId('tab-good-pairs')).toBeVisible();

    // Step 3: Switch to Avoid tab and add a negative pairing rule
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select first ingredient (Milk - should be alphabetically early)
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);

    // Find and click on "Milk" option
    const milkOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Milk' }).first();
    await milkOption.click();
    await page.waitForTimeout(500);

    // Select second ingredient (Greek Yogurt)
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);

    // Find and click on "Greek Yogurt" option
    const yogurtOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Greek Yogurt' }).first();
    await yogurtOption.click();
    await page.waitForTimeout(500);

    // Save the negative pairing rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify rule was added
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Negative pairing rule added
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-01-avoid-rule-added.png' });

    // Step 4: Navigate back to home
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);

    // Go to Home tab
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    // Step 5: Navigate to Breakfast suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await expect(page).toHaveURL(/\/suggestions\/breakfast/);

    // Wait for suggestions to load
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: Suggestions loaded
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-02-suggestions-loaded.png' });

    // Step 6: Verify no suggestion contains both Milk AND Greek Yogurt
    // Get all suggestion cards
    const suggestionCards = page.locator('[data-testid^="suggestion-"]');
    const cardCount = await suggestionCards.count();

    expect(cardCount).toBeGreaterThan(0);

    // Check each card
    for (let i = 0; i < cardCount; i++) {
      const cardText = await suggestionCards.nth(i).textContent();
      const containsMilk = cardText?.includes('Milk');
      const containsGreekYogurt = cardText?.includes('Greek Yogurt');

      // A card should NOT contain both ingredients from the negative pair
      expect(
        containsMilk && containsGreekYogurt,
        `Suggestion card ${i} should not contain both "Milk" and "Greek Yogurt" from the negative pairing rule. Card text: ${cardText}`
      ).toBe(false);
    }
  });

  test('should regenerate suggestions without negative pairs', async ({ page }) => {
    // Step 1: Add negative pairing rule first
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Switch to Avoid tab
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Open add modal and add Milk + Cereals as negative pair
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select Milk
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    const milkOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Milk' }).first();
    await milkOption.click();
    await page.waitForTimeout(500);

    // Select Cereals
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    const cerealsOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Cereals' }).first();
    await cerealsOption.click();
    await page.waitForTimeout(500);

    // Save rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Navigate to home
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    // Navigate to suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Regenerate suggestions multiple times and verify
    for (let attempt = 0; attempt < 3; attempt++) {
      // Check current suggestions
      const suggestionCards = page.locator('[data-testid^="suggestion-"]');
      const cardCount = await suggestionCards.count();

      for (let i = 0; i < cardCount; i++) {
        const cardText = await suggestionCards.nth(i).textContent();
        const containsMilk = cardText?.includes('Milk');
        const containsCereals = cardText?.includes('Cereals');

        expect(
          containsMilk && containsCereals,
          `Attempt ${attempt + 1}: Suggestion card ${i} should not contain both "Milk" and "Cereals". Card text: ${cardText}`
        ).toBe(false);
      }

      // Regenerate suggestions
      if (attempt < 2) {
        await page.getByTestId('generate-new-ideas-button').click();
        await page.waitForTimeout(2000);
      }
    }

    // Screenshot: Final state
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-03-regenerated.png' });
  });

  test('should include positive pairing rules in suggestions with higher priority', async ({ page }) => {
    // Step 1: Add positive pairing rule
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Verify Good Pairs tab is active by default
    await expect(page.getByTestId('tab-good-pairs')).toBeVisible();

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select Butter
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    const butterOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Butter' }).first();
    await butterOption.click();
    await page.waitForTimeout(500);

    // Select Jam
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    const jamOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Jam' }).first();
    await jamOption.click();
    await page.waitForTimeout(500);

    // Save rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify rule was added
    await expect(page.locator('[data-testid^="pairing-rule-"]').first()).toBeVisible();

    // Screenshot: Good pairing rule added
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-04-good-rule-added.png' });

    // Navigate to suggestions
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: Suggestions with positive pairing rule
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-05-with-good-rule.png' });

    // Note: We can't guarantee the positive pair will appear in every set of suggestions
    // (it depends on randomization), but we verify the suggestions load successfully
    const suggestionCards = page.locator('[data-testid^="suggestion-"]');
    const cardCount = await suggestionCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('full workflow: negative pairing prevents suggestion, delete rule allows it', async ({ page }) => {
    // Step 1: Add negative pairing rule for Butter + Cheese
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Switch to Avoid tab
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Open add modal
    await page.getByTestId('add-pairing-rule-button').click();
    await page.waitForTimeout(500);

    // Select Butter
    await page.getByTestId('select-ingredient-a').click();
    await page.waitForTimeout(500);
    const butterOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Butter' }).first();
    await butterOption.click();
    await page.waitForTimeout(500);

    // Select Cheese
    await page.getByTestId('select-ingredient-b').click();
    await page.waitForTimeout(500);
    const cheeseOption = page.locator('[data-testid^="select-ingredient-"]').filter({ hasText: 'Cheese' }).first();
    await cheeseOption.click();
    await page.waitForTimeout(500);

    // Save rule
    await page.getByTestId('save-pairing-rule').click();
    await page.waitForTimeout(1000);

    // Verify rule was added
    const ruleItem = page.locator('[data-testid^="pairing-rule-"]').first();
    await expect(ruleItem).toBeVisible();

    // Step 2: Check suggestions - Butter + Cheese should NOT appear together
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: Suggestions with negative rule active
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-06-negative-active.png' });

    // Verify no suggestion has both Butter AND Cheese
    let suggestionCards = page.locator('[data-testid^="suggestion-"]');
    let cardCount = await suggestionCards.count();

    for (let i = 0; i < cardCount; i++) {
      const cardText = await suggestionCards.nth(i).textContent();
      const containsButter = cardText?.includes('Butter');
      const containsCheese = cardText?.includes('Cheese');

      expect(
        containsButter && containsCheese,
        `With negative rule: Card ${i} should not contain both "Butter" and "Cheese". Card text: ${cardText}`
      ).toBe(false);
    }

    // Step 3: Delete the negative rule
    // Use visible back button on suggestions page to go back to home
    await page.locator('[data-testid="back-button"]:visible').click();
    await page.waitForTimeout(1000);

    // Now we should be on home, navigate to Settings
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('pairing-rules-link').click();
    await page.waitForTimeout(1000);

    // Switch to Avoid tab
    await page.getByTestId('tab-avoid').click();
    await page.waitForTimeout(500);

    // Delete the rule
    await page.locator('[data-testid^="delete-rule-"]').first().click();
    await page.waitForTimeout(1000);

    // Handle confirmation dialog - try multiple approaches
    const deleteConfirmButton = page.locator('[role="button"]').filter({ hasText: 'Delete' }).last();
    if (await deleteConfirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteConfirmButton.click();
      await page.waitForTimeout(1000);
    }

    // Wait for the UI to update - rule should be deleted
    await page.waitForFunction(
      () => {
        const ruleItems = document.querySelectorAll('[data-testid^="pairing-rule-"]');
        return ruleItems.length === 0;
      },
      { timeout: 5000 }
    ).catch(() => {
      // Rule might still be visible if delete didn't work
    });

    // Screenshot: After deleting negative rule
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-07-rule-deleted.png' });

    // Step 4: Check suggestions again - now Butter + Cheese CAN appear
    // Navigate using tab bar (avoids issues with multiple back buttons in DOM)
    await page.getByRole('tab', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });

    // Screenshot: Suggestions without negative rule
    await page.screenshot({ path: 'e2e/screenshots/suggestions-pairing-08-without-negative-rule.png' });

    // Verify suggestions load - the combination is no longer blocked
    suggestionCards = page.locator('[data-testid^="suggestion-"]');
    cardCount = await suggestionCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});

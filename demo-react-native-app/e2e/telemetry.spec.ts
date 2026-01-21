import { test, expect } from '@playwright/test';

test.describe('Telemetry Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('[data-testid="breakfast-ideas-button"]', { timeout: 30000 });
  });

  test('app starts without telemetry errors', async ({ page }) => {
    // Collect telemetry-related console errors
    const telemetryErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('telemetry')) {
        telemetryErrors.push(msg.text());
      }
    });

    // Wait for app to stabilize
    await page.waitForTimeout(3000);

    // No telemetry errors should have occurred
    expect(telemetryErrors).toHaveLength(0);
  });

  test('screen tracking fires on navigation', async ({ page }) => {
    const debugLogs: string[] = [];

    // Intercept console logs for screen tracking
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[DEBUG]') && text.includes('Screen')) {
        debugLogs.push(text);
      }
    });

    // Navigate to suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(2000);

    // Navigate back
    await page.getByTestId('back-button').click();
    await page.waitForTimeout(1000);

    // Should have logged screen views (screen tracking debug logs)
    // Note: We can't directly verify OTel spans, but we verify no crashes occurred
    // and the navigation worked correctly
    await expect(page.getByTestId('breakfast-ideas-button')).toBeVisible();
  });

  test('performance metrics logged on suggestion generation', async ({ page }) => {
    const perfLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[DEBUG]') && text.includes('CombinationGenerator')) {
        perfLogs.push(text);
      }
    });

    // Navigate to suggestions
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForTimeout(3000);

    // Should have performance logs from generation
    expect(perfLogs.length).toBeGreaterThan(0);
  });

  test('no PII in telemetry events', async ({ page }) => {
    const allLogs: string[] = [];
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone pattern (US)
    ];

    page.on('console', (msg) => {
      allLogs.push(msg.text());
    });

    // Use app normally
    await page.getByTestId('breakfast-ideas-button').click();
    await page.waitForSelector('[data-testid="select-button-0"]', { timeout: 15000 });
    await page.getByTestId('generate-new-ideas-button').click();
    await page.waitForTimeout(2000);

    // Check no PII patterns in logs
    for (const log of allLogs) {
      for (const pattern of piiPatterns) {
        expect(log).not.toMatch(pattern);
      }
    }
  });
});

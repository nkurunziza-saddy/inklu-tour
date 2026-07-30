import { test, expect } from '@playwright/test';

test.describe('Inklu Tour', () => {
  test('should render tour and navigate between steps', async ({ page }) => {
    await page.goto('/');

    // Start the tour
    await page.getByTestId('start-tour').click();

    // Verify first step
    const cardTitle = page.locator('.inklu-tour-title');
    await expect(cardTitle).toHaveText('First Target');
    await expect(page.locator('.inklu-tour-content')).toHaveText('This is the first target.');

    // Visual assertion for the first step
    await expect(page).toHaveScreenshot('step-1.png', {
      mask: [page.locator('.inklu-tour-card')]
    });

    // Go to next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify second step
    await expect(cardTitle).toHaveText('Second Target');

    // Visual assertion for the second step
    await expect(page).toHaveScreenshot('step-2.png', {
      mask: [page.locator('.inklu-tour-card')]
    });

    // Close the tour
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify tour is closed
    await expect(page.locator('.inklu-tour-card')).not.toBeVisible();
  });
});

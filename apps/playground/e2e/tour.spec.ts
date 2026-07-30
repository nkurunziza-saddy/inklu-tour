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
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-tour').click();
    
    const cardTitle = page.locator('.inklu-tour-title');
    await expect(cardTitle).toHaveText('First Target');

    // Press ArrowRight to go to next step
    await page.keyboard.press('ArrowRight');
    await expect(cardTitle).toHaveText('Second Target');

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    await expect(cardTitle).toHaveText('First Target');
  });

  test('should dismiss on Escape and outside click', async ({ page }) => {
    await page.goto('/');
    
    // Test Escape
    await page.getByTestId('start-tour').click();
    await expect(page.locator('.inklu-tour-card')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.inklu-tour-card')).not.toBeVisible();

    // Test Outside Click (mask)
    await page.getByTestId('start-tour').click();
    await expect(page.locator('.inklu-tour-card')).toBeVisible();
    // The mask uses clip-path, but it covers the entire window. 
    // We can click somewhere at the top-left corner, outside the target.
    await page.mouse.click(10, 10);
    await expect(page.locator('.inklu-tour-card')).not.toBeVisible();
  });

  test('should skip missing targets if strategy is skip', async ({ page }) => {
    await page.goto('/');
    
    // Start skip demo
    await page.getByTestId('start-skip-demo').click();
    
    const cardTitle = page.locator('.inklu-tour-title');
    await expect(cardTitle).toHaveText('First');

    // Go next, it should skip the missing step and go to "Second"
    await page.getByRole('button', { name: 'Next' }).click();
    
    // It should jump straight to the third step (Second Target)
    await expect(cardTitle).toHaveText('Second');
  });
});

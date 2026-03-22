import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('page loads with 200', async ({ page }) => {
    const resp = await page.goto('/');
    expect(resp?.status()).toBe(200);
  });

  test('shows VIBECHECK headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    const text = await page.locator('h1').first().textContent();
    expect(text?.toLowerCase()).toContain('vibe');
  });

  test('textarea is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 15000 });
  });

  test('submit button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button').filter({ hasText: /vibe|read|check|submit/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('example chips are visible', async ({ page }) => {
    await page.goto('/');
    const chips = page.locator('button').filter({ hasText: /email|breakup|apology|salad|love/i });
    await expect(chips.first()).toBeVisible({ timeout: 15000 });
  });

  test('page title contains VibeCheck', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VibeCheck/i);
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('metadataBase'))).toHaveLength(0);
  });

  test('mobile viewport - no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

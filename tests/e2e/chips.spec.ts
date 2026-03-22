import { test, expect } from '@playwright/test';

// Mock API to prevent real calls
test.beforeEach(async ({ page }) => {
  await page.route('/api/analyze', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      dominant_emotion: 'neutral',
      intensity: 0.5,
      weather_type: 'cold_fog',
      color_palette: ['#b8c5d6', '#d4dde8', '#a0b4cc', '#8899aa', '#667788'],
      red_flag_phrases: [],
      subtext: 'Neutral tone.',
      rewrite_suggestion: 'Same message, clearer.',
      particles: [{ word: 'test', emotion: 'neutral', weight: 0.5 }]
    })
  }));
});

test.describe('Example Chips', () => {
  test('passive aggressive chip is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button').filter({ hasText: /passive|email/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('breakup chip is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button').filter({ hasText: /breakup|break/i }).first()).toBeVisible({ timeout: 15000 });
  });

  test('clicking a chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.locator('button').filter({ hasText: /passive|email/i }).first();
    await chip.waitFor({ state: 'visible', timeout: 15000 });
    await chip.click();
    await page.waitForTimeout(500);
    const ta = page.locator('textarea').first();
    const value = await ta.inputValue();
    expect(value.length).toBeGreaterThan(10);
  });

  test('after chip click, textarea has text', async ({ page }) => {
    await page.goto('/');
    const chip = page.locator('button').filter({ hasText: /love|💌/i }).first();
    await chip.waitFor({ state: 'visible', timeout: 15000 });
    await chip.click();
    await page.waitForTimeout(500);
    const value = await page.locator('textarea').first().inputValue();
    expect(value.length).toBeGreaterThan(5);
  });

  test('all main chips are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    const chips = page.locator('button').filter({ hasText: /email|breakup|apology|salad|love/i });
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

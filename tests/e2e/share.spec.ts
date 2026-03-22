import { test, expect } from '@playwright/test';

const MOCK = {
  dominant_emotion: 'joy',
  intensity: 0.7,
  weather_type: 'golden_sunrise',
  color_palette: ['#ff6b35', '#f7c59f', '#ffe8d6', '#ffd700', '#ffab40'],
  red_flag_phrases: [],
  subtext: 'Pure joy radiates from this.',
  rewrite_suggestion: 'Already perfect.',
  particles: [{ word: 'love', emotion: 'joy', weight: 0.9 }]
};

test.beforeEach(async ({ page }) => {
  await page.route('/api/analyze', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK)
  }));
});

test.describe('Share Functionality', () => {
  test('share button appears after analysis', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I love this so much it makes me incredibly happy and joyful');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.locator('button').filter({ hasText: /share|copy link/i }).first()).toBeVisible({ timeout: 20000 });
  });

  test('page loads with ?v= param and auto-analyzes', async ({ page }) => {
    const text = 'Hello world';
    const encoded = Buffer.from(encodeURIComponent(text)).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    let apiCalled = false;
    await page.route('/api/analyze', route => {
      apiCalled = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK)
      });
    });

    await page.goto(`/?v=${encoded}`);
    await page.waitForTimeout(5000);
    expect(apiCalled).toBe(true);
  });

  test('URL contains ?v= after share click', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I feel so happy and filled with joy today everything is wonderful');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    const shareBtn = page.locator('button').filter({ hasText: /share|copy link/i }).first();
    await shareBtn.waitFor({ state: 'visible', timeout: 20000 });
    await shareBtn.click();
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\?v=/);
  });

  test('share encodes non-empty text', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('Testing share link encoding with this text that is long enough');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    const shareBtn = page.locator('button').filter({ hasText: /share|copy link/i }).first();
    await shareBtn.waitFor({ state: 'visible', timeout: 20000 });
    await shareBtn.click();
    await page.waitForTimeout(500);
    const url = page.url();
    const vParam = new URL(url).searchParams.get('v');
    expect(vParam).toBeTruthy();
    expect(vParam!.length).toBeGreaterThan(5);
  });
});

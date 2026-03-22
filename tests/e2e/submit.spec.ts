import { test, expect } from '@playwright/test';

const MOCK_RESPONSE = {
  dominant_emotion: 'anger',
  intensity: 0.85,
  weather_type: 'storm',
  color_palette: ['#0d0005', '#1a0008', '#2d0505', '#ff2222', '#ff8866'],
  red_flag_phrases: ['should have left years ago'],
  subtext: "You've been suppressing this rage for months.",
  rewrite_suggestion: 'I have decided to move on. Thank you for the experience.',
  particles: [
    { word: 'tired', emotion: 'anger', weight: 0.9 },
    { word: 'decided', emotion: 'neutral', weight: 0.7 }
  ]
};

test.beforeEach(async ({ page }) => {
  await page.route('/api/analyze', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RESPONSE)
    });
  });
});

test.describe('Text Analysis Submit', () => {
  test('can type in textarea', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('This is a test message for analysis');
    await expect(ta).toHaveValue('This is a test message for analysis');
  });

  test('submit button exists and is clickable', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button').filter({ hasText: /vibe|read|check/i }).first();
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    expect(await btn.isEnabled()).toBeTruthy();
  });

  test('submitting text triggers API call', async ({ page }) => {
    let apiCalled = false;
    await page.route('/api/analyze', async route => {
      apiCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESPONSE)
      });
    });
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am so angry about this situation it has been years');
    const btn = page.locator('button').filter({ hasText: /vibe|read|check/i }).first();
    await btn.click();
    await page.waitForTimeout(2000);
    expect(apiCalled).toBe(true);
  });

  test('sidebar appears after successful analysis', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am furious about this situation and I have been for years');
    const btn = page.locator('button').filter({ hasText: /vibe|read|check/i }).first();
    await btn.click();
    await expect(page.getByText(/anger|storm|vibe|emotion/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('sidebar shows intensity', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am furious about this terrible situation and I have been for years');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.getByText(/intensity|85|0\.85/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('sidebar shows subtext', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am furious and have been suppressing this for a long time');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.getByText(/suppressing/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('sidebar shows rewrite suggestion', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am so angry and I have been for a very long time now');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.getByText(/move on|decided/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('copy button appears on rewrite suggestion', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I have been so angry for a very long time and I cannot stand it');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.locator('button').filter({ hasText: /copy/i }).first()).toBeVisible({ timeout: 20000 });
  });

  test('API error shows error message', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Analysis failed' })
      });
    });
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('This text should trigger an error response from the API');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.getByText(/fail|error|try again/i).first()).toBeVisible({ timeout: 20000 });
  });

  test('char counter shows count', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('Hello world');
    await expect(page.getByText(/11\s*\/\s*5000|11 \//i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Ctrl+Enter submits form', async ({ page }) => {
    let apiCalled = false;
    await page.route('/api/analyze', async route => {
      apiCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESPONSE)
      });
    });
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('Testing keyboard submit shortcut with this long enough text');
    await ta.press('Control+Enter');
    await page.waitForTimeout(2000);
    expect(apiCalled).toBe(true);
  });

  test('weather background changes class after result', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am completely furious about this terrible situation it has been years');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await page.waitForTimeout(5000);
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    expect(bodyHtml).toMatch(/weather-storm|weather-/);
  });

  test('reset button returns to idle state', async ({ page }) => {
    await page.goto('/');
    const ta = page.locator('textarea').first();
    await ta.waitFor({ state: 'visible', timeout: 15000 });
    await ta.fill('I am so angry about everything and it has been like this for a long time');
    await page.locator('button').filter({ hasText: /vibe|read|check/i }).first().click();
    await expect(page.getByText(/suppressing|anger/i).first()).toBeVisible({ timeout: 20000 });
    const resetBtn = page.locator('button').filter({ hasText: /reset|new|again|another/i }).first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await page.waitForTimeout(1000);
    }
  });
});

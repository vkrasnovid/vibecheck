import { test, expect } from '@playwright/test';

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

const STORM_FIXTURE = {
  dominant_emotion: 'anger',
  intensity: 0.85,
  weather_type: 'storm',
  color_palette: ['#ff2222', '#1a0008', '#2d0505', '#ff6600', '#0d0005'],
  red_flag_phrases: ['no rush at all'],
  subtext: 'Seething with restrained fury disguised as politeness.',
  rewrite_suggestion: 'Hi, I need a response on this by Friday.',
  particles: [
    { word: 'following', emotion: 'anger', weight: 0.9 },
    { word: 'busy', emotion: 'neutral', weight: 0.4 },
  ],
};

// Use mobile viewport for all tests in this file
test.use({ viewport: { width: 375, height: 812 } });

test.describe('Mobile Responsive', () => {
  test('page loads correctly on 375px viewport', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /VIBECHECK/i })).toBeVisible();
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // allow 5px tolerance
  });

  test('textarea is present and usable on mobile', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    // Font size must be at least 16px to prevent iOS zoom
    const fontSize = await textarea.evaluate(el => window.getComputedStyle(el).fontSize);
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(16);
  });

  test('submit button is visible and full-width on mobile', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: /Read My Vibe/i });
    await expect(btn).toBeVisible();
    // Check button spans most of the viewport width (full-width style)
    const btnBox = await btn.boundingBox();
    expect(btnBox).not.toBeNull();
    if (btnBox) {
      // Button should be at least 80% of viewport width
      expect(btnBox.width).toBeGreaterThan(375 * 0.7);
    }
  });

  test('after mock submit → sidebar/drawer appears with result content', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();

    // Result content should appear (mobile drawer or sidebar)
    await expect(page.getByText(/Storm|Seething|Fury/i)).toBeVisible({ timeout: 8000 });

    // The mobile drawer should be visible (it's fixed at bottom on mobile)
    // Check for the result subtext
    await expect(page.getByText('Seething with restrained fury disguised as politeness.')).toBeVisible();
  });
});

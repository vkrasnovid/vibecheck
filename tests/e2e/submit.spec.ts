import { test, expect } from '@playwright/test';

const STORM_FIXTURE = {
  dominant_emotion: 'anger',
  intensity: 0.85,
  weather_type: 'storm',
  color_palette: ['#ff2222', '#1a0008', '#2d0505', '#ff6600', '#0d0005'],
  red_flag_phrases: ['no rush at all', 'just following up'],
  subtext: 'Seething with restrained fury disguised as politeness.',
  rewrite_suggestion: 'Hi, I need a response on this by Friday. What do you need from me to make that happen?',
  particles: [
    { word: 'following', emotion: 'anger', weight: 0.9 },
    { word: 'busy', emotion: 'neutral', weight: 0.4 },
    { word: 'rush', emotion: 'anxiety', weight: 0.7 },
    { word: 'worries', emotion: 'fear', weight: 0.6 },
    { word: 'chance', emotion: 'neutral', weight: 0.3 },
  ],
};

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

test.describe('Input & Submission', () => {
  test('empty submit shows error message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/nothing here yet|paste something/i)).toBeVisible();
  });

  test('short text (<10 chars) shows error message', async ({ page }) => {
    await page.goto('/');
    await page.locator('textarea').fill('Hi');
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/something to work with|at least/i)).toBeVisible();
  });

  test('valid text + mock API → sidebar appears with result', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    // Use .first() to avoid strict mode violation (sidebar + mobile drawer both in DOM)
    await expect(page.getByText(/Storm|Seething|Sunrise|Fog|Neon|Ocean|Moon/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Ctrl+Enter submits and shows result', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill(VALID_TEXT);
    await textarea.press('Control+Enter');
    await expect(page.getByText(/Seething|Storm/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('character counter updates as user types', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('Hello');
    // Counter shows current / 5000
    await expect(page.getByText(/5\s*\/\s*5000/)).toBeVisible();
  });

  test('text over 5000 chars shows error', async ({ page }) => {
    await page.goto('/');
    const longText = 'a'.repeat(5001);
    await page.locator('textarea').fill(longText);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/too long|5,000|5000/i)).toBeVisible();
  });
});

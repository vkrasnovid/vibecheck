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
  particles: [{ word: 'following', emotion: 'anger', weight: 0.9 }],
};

test.describe('Share Mechanism', () => {
  test('share button is present in sidebar after mock submit', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });

    // Share button in sidebar
    await expect(page.getByRole('button', { name: /Share your vibe/i })).toBeVisible();
  });

  test('share button click adds ?v= to URL', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Share your vibe/i }).click();

    // URL should now contain ?v=
    await expect(page).toHaveURL(/\?v=/, { timeout: 5000 });
  });

  test('navigating to URL with ?v= param auto-fills and submits', async ({ page }) => {
    // Encode a simple text (base64url)
    const text = 'Hello this is a test text to share with vibecheck application';
    const encoded = Buffer.from(encodeURIComponent(text)).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    // Mock the API for auto-submit
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });

    await page.goto(`/?v=${encoded}`);

    // Result should appear (auto-submit fires)
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('share URL copies to clipboard', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });

    // Click share button
    await page.getByRole('button', { name: /Share your vibe/i }).click();
    
    // Wait for "Copied to clipboard" message
    await expect(page.getByText(/Copied to clipboard/i)).toBeVisible({ timeout: 3000 });
  });
});

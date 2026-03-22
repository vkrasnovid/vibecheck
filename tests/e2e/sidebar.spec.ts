import { test, expect } from '@playwright/test';

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

const FIXTURE_WITH_FLAGS = {
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
  ],
};

const FIXTURE_NO_FLAGS = {
  ...FIXTURE_WITH_FLAGS,
  red_flag_phrases: [],
  subtext: 'Peaceful and clear communication.',
  weather_type: 'calm_ocean',
};

async function submitWithMock(page: import('@playwright/test').Page, fixture: object) {
  await page.route('/api/analyze', async route => {
    await route.fulfill({ json: fixture, status: 200 });
  });
  await page.goto('/');
  await page.locator('textarea').fill(VALID_TEXT);
  await page.getByRole('button', { name: /Read My Vibe/i }).click();
  // Wait for result content (use .first() for strict mode)
  await expect(page.getByText(/Storm|Ocean|Sunrise|Fog|Neon|Moon|Seething|Peaceful/i).first()).toBeVisible({ timeout: 15000 });
}

test.describe('Vibe Report Sidebar', () => {
  test('sidebar appears after successful analysis', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    // The sidebar contains the subtext - use .first() for strict mode
    await expect(page.getByText('Seething with restrained fury disguised as politeness.').first()).toBeVisible();
  });

  test('weather label is visible in sidebar', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    // Storm label from WEATHER_CONFIG - use .first() for strict mode
    await expect(page.getByText(/⛈️\s*Storm/i).first()).toBeVisible();
  });

  test('subtext quote is visible', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    await expect(page.getByText('Seething with restrained fury disguised as politeness.').first()).toBeVisible();
  });

  test('intensity bar element exists', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    // IntensityBar renders a div with the fill width - check for the value - use .first() for strict mode
    await expect(page.getByText('85').first()).toBeVisible();
  });

  test('red flags section shown when phrases non-empty', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    // 🚩 emoji should be visible
    await expect(page.getByText('🚩').first()).toBeVisible();
  });

  test('red flags section NOT shown when array is empty', async ({ page }) => {
    await submitWithMock(page, FIXTURE_NO_FLAGS);
    // 🚩 emoji should NOT be visible
    await expect(page.getByText('🚩')).not.toBeVisible();
  });

  test('rewrite suggestion is visible', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    await expect(page.getByText(/I need a response on this by Friday/i).first()).toBeVisible();
  });

  test('copy button for rewrite is present', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    await expect(page.getByRole('button', { name: /Copy rewrite/i })).toBeVisible();
  });

  test('reset button returns to idle state', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    // Click reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    // Textarea should be visible again
    await expect(page.locator('textarea')).toBeVisible({ timeout: 15000 });
    // Submit button should be visible again
    await expect(page.getByRole('button', { name: /Read My Vibe/i })).toBeVisible();
  });

  test('dominant emotion is displayed in breakdown', async ({ page }) => {
    await submitWithMock(page, FIXTURE_WITH_FLAGS);
    await expect(page.getByText(/Dominant emotion:\s*anger/i).first()).toBeVisible();
  });
});

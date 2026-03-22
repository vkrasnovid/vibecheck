import { test, expect } from '@playwright/test';

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

function makeFixture(weatherType: string) {
  return {
    dominant_emotion: 'anger',
    intensity: 0.8,
    weather_type: weatherType,
    color_palette: ['#ff2222', '#1a0008', '#2d0505', '#ff6600', '#0d0005'],
    red_flag_phrases: [],
    subtext: 'Test subtext for vibe analysis.',
    rewrite_suggestion: 'A cleaner way to say this.',
    particles: [
      { word: 'hello', emotion: 'neutral', weight: 0.5 },
      { word: 'world', emotion: 'joy', weight: 0.7 },
    ],
  };
}

const WEATHER_TYPES = [
  { type: 'storm', cssClass: 'weather-storm' },
  { type: 'golden_sunrise', cssClass: 'weather-golden-sunrise' },
  { type: 'cold_fog', cssClass: 'weather-cold-fog' },
  { type: 'electric_neon', cssClass: 'weather-electric-neon' },
  { type: 'calm_ocean', cssClass: 'weather-calm-ocean' },
  { type: 'blood_moon', cssClass: 'weather-blood-moon' },
];

test.describe('Weather Background States', () => {
  for (const { type, cssClass } of WEATHER_TYPES) {
    test(`${type} → applies ${cssClass} class`, async ({ page }) => {
      await page.route('/api/analyze', async route => {
        await route.fulfill({ json: makeFixture(type), status: 200 });
      });
      await page.goto('/');
      await page.locator('textarea').fill(VALID_TEXT);
      await page.getByRole('button', { name: /Read My Vibe/i }).click();

      // Wait for sidebar/result to appear
      await expect(page.getByText(/Storm|Sunrise|Fog|Neon|Ocean|Moon|subtext|Test/i)).toBeVisible({ timeout: 8000 });

      // Check weather CSS class on the background div
      const weatherDiv = page.locator(`.${cssClass}`);
      await expect(weatherDiv).toBeVisible({ timeout: 5000 });
    });
  }

  test('loading overlay appears while request is pending', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      // Delay response by 800ms to catch loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.fulfill({ json: makeFixture('storm'), status: 200 });
    });
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();

    // Loading text should briefly appear
    await expect(
      page.getByText(/Reading the room|Calibrating|Feeling the feelings|Decoding|vibes are loading/i)
    ).toBeVisible({ timeout: 3000 });
  });
});

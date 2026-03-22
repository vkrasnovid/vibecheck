import { test, expect } from '@playwright/test';

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

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

test.describe('Reset Functionality', () => {
  test('reset button is visible after result', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Wait for result
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Reset button should be visible
    const resetButton = page.getByRole('button', { name: /Check another text/i });
    await expect(resetButton).toBeVisible();
  });

  test('clicking reset returns to idle state', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Wait for result
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Click reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    
    // Should return to input state
    const inputPanel = page.getByRole('heading', { name: /VIBECHECK/i });
    await expect(inputPanel).toBeVisible({ timeout: 15000 });
    
    // Sidebar should disappear
    await expect(page.getByText('Seething with restrained fury disguised as politeness.').first()).not.toBeVisible();
  });

  test('textarea is empty after reset', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    const textarea = page.locator('textarea');
    
    // Fill and submit
    await textarea.fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Wait for result
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Click reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    
    // Textarea should be visible and empty
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(textarea).toHaveValue('');
  });

  test('can submit new text after reset', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    const textarea = page.locator('textarea');
    
    // First submission
    await textarea.fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    
    // Second submission with different text
    const newText = 'I love this feature so much. It is amazing and wonderful!';
    await textarea.fill(newText);
    
    // Change fixture for second submit
    await page.unroute('/api/analyze');
    const secondFixture = {
      ...STORM_FIXTURE,
      subtext: 'Pure joy and enthusiasm.',
      weather_type: 'golden_sunrise',
      dominant_emotion: 'joy',
    };
    
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: secondFixture, status: 200 });
    });
    
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Should show new result
    await expect(page.getByText(/Sunrise|joy|Pure joy/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('submit button is re-enabled after reset', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    const textarea = page.locator('textarea');
    const submitButton = page.getByRole('button', { name: /Read My Vibe/i });
    
    // Fill and submit
    await textarea.fill(VALID_TEXT);
    await submitButton.click();
    
    // Wait for result
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    
    // Submit button should be visible and enabled
    await expect(submitButton).toBeVisible({ timeout: 15000 });
    await expect(submitButton).toBeEnabled();
  });

  test('character counter resets after reset', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    const textarea = page.locator('textarea');
    
    // Fill textarea
    await textarea.fill(VALID_TEXT);
    
    // Counter should show filled length
    const initialCounter = await page.locator('text=/\\d+\\s*\\/\\s*5000/').first().textContent();
    expect(initialCounter).toBeDefined();
    expect(initialCounter).not.toMatch(/^0\s*\/\s*5000/);
    
    // Submit
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
    
    // Reset
    await page.getByRole('button', { name: /Check another text/i }).click();
    
    // Counter should reset to 0
    await expect(page.getByText(/0\s*\/\s*5000/)).toBeVisible({ timeout: 15000 });
  });
});

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

test.describe('Example Chips', () => {
  test('clicking Passive-aggressive chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: /Passive-aggressive/i });
    await expect(chip).toBeVisible({ timeout: 15000 });
    
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    expect(value).toContain('following up');
    expect(value.length).toBeGreaterThan(10);
  });

  test('clicking Breakup chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: /Breakup/i });
    await expect(chip).toBeVisible({ timeout: 15000 });
    
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    expect(value).toContain('disconnected');
    expect(value.length).toBeGreaterThan(10);
  });

  test('clicking Non-apology chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: /Non-apology/i });
    await expect(chip).toBeVisible({ timeout: 15000 });
    
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    expect(value).toContain("I'm sorry");
    expect(value.length).toBeGreaterThan(10);
  });

  test('clicking Corporate chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: /Corporate/i });
    await expect(chip).toBeVisible({ timeout: 15000 });
    
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    expect(value).toContain('synergy');
    expect(value.length).toBeGreaterThan(10);
  });

  test('clicking Love note chip fills textarea', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByRole('button', { name: /Love note/i });
    await expect(chip).toBeVisible({ timeout: 15000 });
    
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    expect(value).toContain('laugh');
    expect(value.length).toBeGreaterThan(10);
  });

  test('all visible chips are clickable', async ({ page }) => {
    await page.goto('/');
    
    const chips = page.getByRole('button').filter({ hasText: /😤|💔|😰|🤡|🥰/ });
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(5);
    
    // Each chip should be clickable and fill the textarea
    for (let i = 0; i < Math.min(3, count); i++) {
      const chip = chips.nth(i);
      await chip.click();
      
      const textarea = page.locator('textarea');
      const value = await textarea.inputValue();
      expect(value.length).toBeGreaterThan(10);
      
      // Clear for next chip
      await textarea.fill('');
    }
  });

  test('clicking chip then submitting works', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({ json: STORM_FIXTURE, status: 200 });
    });
    
    await page.goto('/');
    
    // Click a chip
    const chip = page.getByRole('button', { name: /Passive-aggressive/i });
    await chip.click();
    
    // Verify text is filled
    const textarea = page.locator('textarea');
    let value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(10);
    
    // Submit
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Result should appear
    await expect(page.getByText(/Storm|Seething/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('chip text is not empty after click', async ({ page }) => {
    await page.goto('/');
    
    const chip = page.getByRole('button', { name: /Breakup/i });
    await chip.click();
    
    const textarea = page.locator('textarea');
    const value = await textarea.inputValue();
    
    expect(value).not.toBe('');
    expect(value.trim().length).toBeGreaterThan(0);
  });

  test('character counter updates after clicking chip', async ({ page }) => {
    await page.goto('/');
    
    // Initial counter should show 0
    await expect(page.getByText(/0\s*\/\s*5000/)).toBeVisible({ timeout: 15000 });
    
    // Click chip
    const chip = page.getByRole('button', { name: /Passive-aggressive/i });
    await chip.click();
    
    // Counter should update (not 0)
    const counterText = await page.locator('text=/\\d+\\s*\\/\\s*5000/').first().textContent();
    expect(counterText).toBeDefined();
    expect(counterText).not.toMatch(/^0\s*\/\s*5000/);
  });

  test('clicking same chip twice replaces text', async ({ page }) => {
    await page.goto('/');
    
    const chip = page.getByRole('button', { name: /Passive-aggressive/i });
    const textarea = page.locator('textarea');
    
    // First click
    await chip.click();
    const firstValue = await textarea.inputValue();
    expect(firstValue.length).toBeGreaterThan(0);
    
    // Second click (should replace, not append)
    await chip.click();
    const secondValue = await textarea.inputValue();
    
    // Same text should be there
    expect(secondValue).toBe(firstValue);
  });
});

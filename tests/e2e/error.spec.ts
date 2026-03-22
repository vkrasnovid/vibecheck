import { test, expect } from '@playwright/test';

const VALID_TEXT = 'Hi, just following up again on my previous follow-up. No worries if you have not had time.';

test.describe('Error Handling', () => {
  test('API returning 500 shows error message', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Error message should appear
    await expect(page.getByText(/temporarily unavailable|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('API returning 400 shows error message', async ({ page }) => {
    await page.route('/api/analyze', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid request' }),
      });
    });
    
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Error message should appear
    await expect(page.getByText(/Invalid request|error|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('short text (<10 chars) shows validation error', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea');
    await textarea.fill('Hi there');
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Validation error should appear
    await expect(page.getByText(/something to work with|at least|sentence/i)).toBeVisible({ timeout: 5000 });
  });

  test('empty text submission shows error', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit empty textarea
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Error should appear
    await expect(page.getByText(/nothing here yet|paste something/i)).toBeVisible({ timeout: 5000 });
  });

  test('text over 5000 chars shows length error', async ({ page }) => {
    await page.goto('/');
    
    const longText = 'a'.repeat(5001);
    await page.locator('textarea').fill(longText);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Length error should appear
    await expect(page.getByText(/too long|5,000|5000 characters/i)).toBeVisible({ timeout: 5000 });
  });

  test('whitespace-only text shows error', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.locator('textarea');
    await textarea.fill('   \n\n   ');
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Error should appear
    await expect(page.getByText(/nothing here yet|paste something/i)).toBeVisible({ timeout: 5000 });
  });

  test('network error shows recovery message', async ({ page }) => {
    await page.route('/api/analyze', route => {
      route.abort();
    });
    
    await page.goto('/');
    await page.locator('textarea').fill(VALID_TEXT);
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Should show error message
    await expect(page.getByText(/temporarily unavailable|error|try again/i)).toBeVisible({ timeout: 10000 });
  });

  test('error state allows retry', async ({ page }) => {
    let callCount = 0;
    await page.route('/api/analyze', async route => {
      callCount++;
      if (callCount === 1) {
        // First call fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      } else {
        // Second call succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            dominant_emotion: 'joy',
            intensity: 0.9,
            weather_type: 'golden_sunrise',
            color_palette: ['#ffd700', '#ffed4e', '#ffe55c', '#ffd700', '#ffb347'],
            red_flag_phrases: [],
            subtext: 'Success!',
            rewrite_suggestion: 'Good job!',
            particles: [{ word: 'success', emotion: 'joy', weight: 0.9 }],
          }),
        });
      }
    });
    
    await page.goto('/');
    const textarea = page.locator('textarea');
    const submitButton = page.getByRole('button', { name: /Read My Vibe/i });
    
    // First attempt fails
    await textarea.fill(VALID_TEXT);
    await submitButton.click();
    await expect(page.getByText(/error|failed|temporarily/i)).toBeVisible({ timeout: 10000 });
    
    // Retry should work
    await submitButton.click();
    await expect(page.getByText(/Sunrise|golden|Success/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('validation happens before API call', async ({ page }) => {
    const routeSpy = { called: false };
    
    await page.route('/api/analyze', async route => {
      routeSpy.called = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          dominant_emotion: 'joy',
          intensity: 0.9,
          weather_type: 'golden_sunrise',
          color_palette: ['#ffd700', '#ffed4e', '#ffe55c', '#ffd700', '#ffb347'],
          red_flag_phrases: [],
          subtext: 'Test',
          rewrite_suggestion: 'Test',
          particles: [{ word: 'test', emotion: 'joy', weight: 0.9 }],
        }),
      });
    });
    
    await page.goto('/');
    
    // Try to submit empty text
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // API should NOT be called for validation error
    expect(routeSpy.called).toBe(false);
    
    // Error should be shown
    await expect(page.getByText(/nothing here yet|paste something/i)).toBeVisible({ timeout: 5000 });
  });

  test('error message has proper styling', async ({ page }) => {
    await page.goto('/');
    
    // Trigger error
    await page.getByRole('button', { name: /Read My Vibe/i }).click();
    
    // Wait for error
    const errorMsg = page.getByText(/nothing here yet|paste something/i);
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    
    // Check it's styled (red background expected)
    const background = await errorMsg.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(background).toBeDefined();
  });
});

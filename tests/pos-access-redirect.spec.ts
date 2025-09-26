import { test, expect } from '@playwright/test';

// This test verifies a previous bug where the POSSystem page incorrectly
// redirected to POS Access when the tenant lookup returned no row.
// With HashRouter, we navigate using a hash-based URL.

test.describe('POS access guard', () => {
  test('does not redirect to POS Access when tenant is unknown', async ({ page }) => {
    await page.goto('/#/pos-system/unknown-slug', { waitUntil: 'domcontentloaded' });

    // Allow the app a brief moment to potentially navigate
    await page.waitForTimeout(1200);

    // Verify we are still on the POS System route and not redirected
    await expect.poll(() => page.url()).toContain('/#/pos-system/unknown-slug');
    expect(page.url()).not.toContain('/#/pos-access/');
  });
});

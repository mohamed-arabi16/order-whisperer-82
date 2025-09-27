import { test, expect } from '@playwright/test';

// These tests verify guards on the POSSystem route.
// - Unknown slug should not redirect to POS Access
// - During tenant lookup (slow network), we should not redirect early

test.describe('POS access guard', () => {
  test('does not redirect to POS Access when tenant is unknown', async ({ page }) => {
    await page.goto('/#/pos-system/unknown-slug', { waitUntil: 'domcontentloaded' });

    // Allow the app a brief moment to potentially navigate
    await page.waitForTimeout(1200);

    // Verify we are still on the POS System route and not redirected
    await expect.poll(() => page.url()).toContain('/#/pos-system/unknown-slug');
    expect(page.url()).not.toContain('/#/pos-access/');
  });

  test('does not redirect to POS Access during tenant lookup delay', async ({ page }) => {
    // Artificially delay the tenants request to simulate slow network/backend
    await page.route('**/rest/v1/tenants*', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });

    await page.goto('/#/pos-system/dummy-slug', { waitUntil: 'domcontentloaded' });

    // Shortly after navigation, ensure no premature redirect occurred
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain('/#/pos-access/');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Arabic Translation Functionality', () => {
  
  test('Arabic renders correctly on home page with header elements', async ({ page }) => {
    // Visit with Arabic locale parameter
    await page.goto('/?lang=ar');
    
    // Wait for translations to load
    await page.waitForLoadState('networkidle');
    
    // Check that page direction is RTL for Arabic
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');
    
    // Check that header brand is in Arabic (RestaurantOS should be displayed)
    const brandElement = await page.getByText('RestaurantOS').first();
    await expect(brandElement).toBeVisible();
    
    // Check for Arabic features text "المميزات"
    const featuresLink = page.getByRole('navigation').getByText('المميزات');
    await expect(featuresLink).toBeVisible();
    
    // Check for Arabic pricing text "الأسعار"
    const pricingLink = page.getByRole('navigation').getByText('الأسعار');
    await expect(pricingLink).toBeVisible();
  });

  test('English translations work correctly', async ({ page }) => {
    // Visit with English locale parameter
    await page.goto('/?lang=en');
    
    // Wait for translations to load
    await page.waitForLoadState('networkidle');
    
    // Check that page direction is LTR for English
    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('ltr');
    
    // Check that header brand is displayed
    const brandElement = await page.getByText('RestaurantOS').first();
    await expect(brandElement).toBeVisible();
    
    // Check for English features text
    const featuresLink = page.getByRole('navigation').getByText('Features');
    await expect(featuresLink).toBeVisible();
    
    // Check for English pricing text
    const pricingLink = page.getByRole('navigation').getByText('Pricing');
    await expect(pricingLink).toBeVisible();
  });

  test('Language switching preserves functionality', async ({ page }) => {
    // Start with English
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
    
    // Switch to Arabic via language switcher if available
    await page.goto('/?lang=ar');
    await page.waitForLoadState('networkidle');
    
    // Verify Arabic content is displayed
    await expect(page.getByRole('navigation').getByText('المميزات')).toBeVisible();
    
    // Switch back to English
    await page.goto('/?lang=en');
    await page.waitForLoadState('networkidle');
    
    // Verify English content is displayed
    await expect(page.getByRole('navigation').getByText('Features')).toBeVisible();
  });
});
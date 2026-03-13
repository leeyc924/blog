import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Navigation', () => {
  test('should navigate home from header title', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    const homeLink = page.locator('header a').filter({ hasText: 'leeyc blog' });
    await homeLink.click();
    await expect(page).toHaveURL(/\/leeyc-blog\/?$/);
  });

  test('should navigate to tags page', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.locator('header a').filter({ hasText: 'Tags' }).click();
    await expect(page).toHaveURL(/\/tags/);
  });

  test('should have skip-link for accessibility', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('should have RSS feed accessible', async ({ page }) => {
    const response = await page.goto(`${BASE}/rss.xml`);
    expect(response?.status()).toBe(200);
  });
});

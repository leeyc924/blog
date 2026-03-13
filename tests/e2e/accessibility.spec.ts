import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Accessibility', () => {
  test('all images should have alt text', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.*/);
    }
  });

  test('interactive elements should have proper aria labels', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const toggle = page.locator('#dark-mode-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
  });

  test('header should have navigation landmark', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('main content should have main landmark', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('page should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });
});

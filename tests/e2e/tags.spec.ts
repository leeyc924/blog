import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Tags Pages', () => {
  test('should display all tags on tags index', async ({ page }) => {
    await page.goto(`${BASE}/tags/`);
    await expect(page.locator('h1')).toContainText('Tags');
    const tags = page.locator('a[href*="/tags/"]');
    await expect(tags.first()).toBeVisible();
  });

  test('should show post count per tag', async ({ page }) => {
    await page.goto(`${BASE}/tags/`);
    await expect(page.getByText(/\(\d+\)/).first()).toBeVisible();
  });

  test('should navigate to tag page and show filtered posts', async ({ page }) => {
    await page.goto(`${BASE}/tags/`);
    const firstTag = page.locator('a[href*="/tags/"]').first();
    await firstTag.click();
    await expect(page.locator('h1')).toBeVisible();
  });
});

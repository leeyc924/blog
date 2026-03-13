import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Home Page', () => {
  test('should load and display blog title', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.locator('h1')).toContainText('Posts');
  });

  test('should display post list', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const posts = page.locator('[data-post-card]');
    await expect(posts).toHaveCount(4);
  });

  test('should have working tag filter pills', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const tagPills = page.locator('a[href*="/tags/"]');
    await expect(tagPills.first()).toBeVisible();
  });

  test('should filter posts by search', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const searchInput = page.locator('#search-input');
    await searchInput.fill('rust');
    await page.waitForTimeout(300);
    const hiddenCount = await page.locator('[data-post-card]').evaluateAll((cards) =>
      cards.filter((c) => (c as HTMLElement).style.display === 'none').length
    );
    expect(hiddenCount).toBeGreaterThan(0);
  });

  test('should clear search and show all posts', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const searchInput = page.locator('#search-input');
    await searchInput.fill('rust');
    await page.waitForTimeout(300);
    await searchInput.fill('');
    await page.waitForTimeout(300);
    const hiddenCount = await page.locator('[data-post-card]').evaluateAll((cards) =>
      cards.filter((c) => (c as HTMLElement).style.display === 'none').length
    );
    expect(hiddenCount).toBe(0);
  });

  test('should navigate to post when clicking title', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const firstPostLink = page.locator('[data-post-card] a').first();
    await firstPostLink.click();
    await expect(page).not.toHaveURL(/\/leeyc-blog\/?$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have RSS link', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const rssLink = page.locator('a[href*="rss"]');
    await expect(rssLink).toBeVisible();
  });
});

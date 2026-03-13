import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Post Page', () => {
  test('should display post title and content', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    await expect(page.locator('h1')).toContainText('Ownership');
    await expect(page.locator('article')).toBeVisible();
  });

  test('should display table of contents', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    const toc = page.locator('details');
    await expect(toc).toBeVisible();
    await expect(toc.locator('summary')).toContainText('Table of Contents');
  });

  test('should display tags', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    await expect(page.getByText('rust', { exact: true }).first()).toBeVisible();
  });

  test('should display series navigation', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    const seriesBox = page.locator('aside').filter({ hasText: 'Series' });
    await expect(seriesBox.first()).toBeVisible();
  });

  test('should display reading time', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    await expect(page.getByText(/min|분/).first()).toBeVisible();
  });

  test('should render code blocks with syntax highlighting', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    const codeBlocks = page.locator('pre code, .astro-code');
    await expect(codeBlocks.first()).toBeVisible();
  });

  test('should render callout components', async ({ page }) => {
    await page.goto(`${BASE}/rust/ownership/`);
    const callout = page.locator('[role="note"]');
    if (await callout.count() > 0) {
      await expect(callout.first()).toBeVisible();
    }
  });
});

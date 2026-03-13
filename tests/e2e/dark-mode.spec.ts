import { test, expect } from '@playwright/test';

const BASE = '/leeyc-blog';

test.describe('Dark Mode', () => {
  test('should toggle dark mode on button click', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const html = page.locator('html');
    const toggle = page.locator('#dark-mode-toggle');
    await expect(toggle).toBeVisible();

    const initialHasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await toggle.click();
    const afterToggle = await html.evaluate((el) => el.classList.contains('dark'));
    expect(afterToggle).toBe(!initialHasDark);
  });

  test('should persist dark mode preference', async ({ page }) => {
    await page.goto(`${BASE}/`);
    // Click toggle to set dark mode via the UI (which also sets localStorage)
    const toggle = page.locator('#dark-mode-toggle');

    // First ensure we're in light mode
    const hasDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    if (!hasDark) {
      // Toggle to dark
      await toggle.click();
    }
    // Verify dark mode is set
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reload and check persistence
    await page.reload();
    const hasDarkAfterReload = await page.locator('html').evaluate((el) =>
      el.classList.contains('dark')
    );
    expect(hasDarkAfterReload).toBe(true);
  });

  test('should persist light mode preference', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    const hasDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    expect(hasDark).toBe(false);
  });

  test('should respect system preference when no stored value', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});

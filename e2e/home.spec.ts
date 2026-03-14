import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display site title", async ({ page }) => {
    await page.goto("/blog/");
    await expect(page).toHaveTitle(/leeyc blog/);
  });

  test("should display recent posts section", async ({ page }) => {
    await page.goto("/blog/");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("should have working navigation", async ({ page }) => {
    await page.goto("/blog/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should have theme toggle button", async ({ page }) => {
    await page.goto("/blog/");
    const themeBtn = page.locator("#theme-btn");
    await expect(themeBtn).toBeVisible();
  });

  test("should toggle dark/light mode", async ({ page }) => {
    await page.goto("/blog/");
    const themeBtn = page.locator("#theme-btn");
    const html = page.locator("html");

    const themeBefore = await html.getAttribute("data-theme");
    await themeBtn.click();
    const themeAfter = await html.getAttribute("data-theme");
    expect(themeBefore).not.toBe(themeAfter);
  });
});

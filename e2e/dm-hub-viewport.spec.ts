import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function loginAndOpenDmHub(page: Page) {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
  await page.goto("/auth/register");
  await page.locator("#displayName").fill("Viewport Test DM");
  await page.locator("#email").fill(`dm-hub-viewport-${suffix}@example.com`);
  await page.locator("#password").fill(`dm-hub-viewport-password-${suffix}`);
  await page.locator("#confirmPassword").fill(`dm-hub-viewport-password-${suffix}`);
  await Promise.all([page.waitForURL(/\/home$/, { timeout: 15_000 }), page.locator('form button[type="submit"]').click()]);
  await page.goto("/dm");
  await expect(page.locator(".dm-hub-root")).toBeVisible({ timeout: 15_000 });
}

for (const viewport of [{ name: "390x844", width: 390, height: 844 }, { name: "360x640", width: 360, height: 640 }]) {
  test(`mobile mosaic fits and restores focus at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loginAndOpenDmHub(page);
    const mosaic = page.locator('[data-dm-hub-panel="mobile-dashboard"]');
    await expect(mosaic).toBeVisible();
    await expect(page.locator('[data-dm-hub-panel="board"]')).toHaveCount(0);
    const tiles = mosaic.locator(".dm-hub-mobile-tile");
    await expect(tiles).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height + 2);
    await tiles.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(tiles.first()).toBeFocused();
  });
}

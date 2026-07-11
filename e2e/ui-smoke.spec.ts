import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function expectAuthenticated(page: Page): Promise<void> {
  await expect.poll(async () => {
    const response = await page.request.get("/api/auth/status");
    if (!response.ok()) return false;
    const body = await response.json().catch(() => null);
    return Boolean(body?.sessionValid);
  }, {
    message: "The browser session should be authenticated",
    timeout: 15_000,
  }).toBe(true);
}

test.describe("Critical UI smoke flow", () => {
  test("creates an account, creates and opens a campaign, loads rules, and signs back in", async ({ page }) => {
    test.setTimeout(90_000);

    page.on("pageerror", (error) => console.error(`[browser pageerror] ${error.stack ?? error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") console.error(`[browser console] ${message.text()}`);
    });

    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const email = `ui-smoke-${suffix}@example.com`;
    const password = `ui-smoke-password-${suffix}`;
    const campaignTitle = `UI Smoke ${suffix}`;

    await page.goto("/dm/setup");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15_000 });
    await page.locator("#displayName").fill("UI Smoke DM");
    await page.locator("#email").fill(email);
    await page.locator("#secret").fill(password);
    await page.locator("#confirmSecret").fill(password);

    await Promise.all([
      page.waitForURL(/\/portal$/, { timeout: 15_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);
    await expectAuthenticated(page);

    await page.goto("/dm");
    await expect(page).toHaveURL(/\/dm$/, { timeout: 15_000 });
    await expect(page.locator(".dm-hub-root")).toBeVisible({ timeout: 15_000 });

    const campaignsSection = page.locator("#dm-campaigns-section");
    await expect(campaignsSection).toBeVisible({ timeout: 15_000 });
    await expect(campaignsSection.locator(".dm-empty-state--error")).toHaveCount(0);

    const createCampaignControl = campaignsSection
      .locator("button.btn-gold, .dm-campaign-card--create")
      .first();
    await expect(createCampaignControl).toBeVisible({ timeout: 15_000 });
    await createCampaignControl.click();

    const createDialog = page.getByRole("dialog").first();
    await expect(createDialog).toBeVisible({ timeout: 15_000 });
    await createDialog.locator("input.form-input").first().fill(campaignTitle);

    await Promise.all([
      page.waitForURL(/\/campaigns\/[^/]+\/dashboard$/, { timeout: 15_000 }),
      createDialog.locator('button[type="submit"]').click(),
    ]);

    const campaignId = page.url().match(/\/campaigns\/([^/]+)\/dashboard$/)?.[1];
    expect(campaignId).toBeTruthy();

    const rulesResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === "/api/rules/categories" && response.request().method() === "GET";
    });
    await page.goto(`/campaigns/${campaignId}/rules`);
    const rulesResponse = await rulesResponsePromise;
    expect(rulesResponse.ok()).toBe(true);
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/rules$`));
    await expect(page.locator("input.form-input").first()).toBeVisible({ timeout: 15_000 });

    const logoutResponse = await page.request.post("/api/auth/logout");
    expect(logoutResponse.ok()).toBe(true);

    await page.goto("/dm/login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15_000 });
    await page.locator("#email").fill(email);
    await page.locator("#secret").fill(password);

    await Promise.all([
      page.waitForURL(/\/portal$/, { timeout: 15_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);
    await expectAuthenticated(page);

    const campaignResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === `/api/campaigns/${campaignId}` && response.request().method() === "GET";
    });
    await page.goto(`/campaigns/${campaignId}/dashboard`);
    const campaignResponse = await campaignResponsePromise;
    expect(campaignResponse.ok()).toBe(true);
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/dashboard$`));
  });
});

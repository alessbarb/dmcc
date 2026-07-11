import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

test.describe("Critical UI smoke flow", () => {
  test("creates an account, creates and opens a campaign, loads rules, and signs back in", async ({ page }) => {
    test.setTimeout(90_000);

    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const email = `ui-smoke-${suffix}@example.com`;
    const password = `ui-smoke-password-${suffix}`;
    const campaignTitle = `UI Smoke ${suffix}`;

    await page.goto("/dm/setup");
    await expect(page.locator("#email")).toBeVisible();
    await page.locator("#displayName").fill("UI Smoke DM");
    await page.locator("#email").fill(email);
    await page.locator("#secret").fill(password);
    await page.locator("#confirmSecret").fill(password);

    await Promise.all([
      page.waitForURL(/\/portal$/),
      page.locator('form button[type="submit"]').click(),
    ]);

    await page.goto("/dm");
    const campaignsSection = page.locator("#dm-campaigns-section");
    await expect(campaignsSection).toBeVisible();

    const createCampaignButton = campaignsSection.locator("button.btn-gold").first();
    await expect(createCampaignButton).toBeVisible();
    await createCampaignButton.click();

    const createDialog = page.getByRole("dialog").first();
    await expect(createDialog).toBeVisible();
    await createDialog.locator("input.form-input").first().fill(campaignTitle);

    await Promise.all([
      page.waitForURL(/\/campaigns\/[^/]+\/dashboard$/),
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
    await expect(page.locator("input.form-input").first()).toBeVisible();

    const logoutResponse = await page.request.post("/api/auth/logout");
    expect(logoutResponse.ok()).toBe(true);

    await page.goto("/dm/login");
    await expect(page.locator("#email")).toBeVisible();
    await page.locator("#email").fill(email);
    await page.locator("#secret").fill(password);

    await Promise.all([
      page.waitForURL(/\/portal$/),
      page.locator('form button[type="submit"]').click(),
    ]);

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

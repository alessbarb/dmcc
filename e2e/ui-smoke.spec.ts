import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function expectAuthenticated(page: Page): Promise<void> {
  await expect.poll(async () => {
    const response = await page.request.get("/api/auth/session");
    if (!response.ok()) return false;
    const body = await response.json().catch(() => null);
    return Boolean(body?.user);
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

    await page.goto("/auth/register");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15_000 });
    await page.locator("#displayName").fill("UI Smoke DM");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("#confirmPassword").fill(password);

    await Promise.all([
      page.waitForURL(/\/home$/, { timeout: 15_000 }),
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
      page.waitForURL(/\/campaigns\/[^/]+\/command-center$/, { timeout: 15_000 }),
      createDialog.locator('button[type="submit"]').click(),
    ]);

    const campaignId = page.url().match(/\/campaigns\/([^/]+)\/command-center$/)?.[1];
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

    await page.goto("/auth/login");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15_000 });
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);

    await Promise.all([
      page.waitForURL(/\/home$/, { timeout: 15_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);
    await expectAuthenticated(page);

    const campaignResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === `/api/campaigns/${campaignId}` && response.request().method() === "GET";
    });
    await page.goto(`/campaigns/${campaignId}/command-center`);
    const campaignResponse = await campaignResponsePromise;
    expect(campaignResponse.ok()).toBe(true);
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/command-center$`));
  });
});

test.describe("Player invitation UI flow", () => {
  test("creates, lists, and revokes invitations without page errors", async ({ page }) => {
    test.setTimeout(90_000);
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") pageErrors.push(message.text());
    });

    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const email = `ui-invite-${suffix}@example.com`;
    const password = `ui-invite-password-${suffix}`;

    await page.goto("/auth/register");
    await expect(page.locator("#email")).toBeVisible({ timeout: 15_000 });
    await page.locator("#displayName").fill("UI Invite DM");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("#confirmPassword").fill(password);
    await Promise.all([
      page.waitForURL(/\/home$/, { timeout: 15_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);
    await expectAuthenticated(page);

    const campaignResponse = await page.request.post("/api/campaigns", {
      data: { title: `UI Invitation ${suffix}`, system: "custom" },
    });
    expect(campaignResponse.ok()).toBe(true);
    const campaign = await campaignResponse.json();
    const campaignId = campaign.campaignId as string;

    await page.goto(`/campaigns/${campaignId}/players`);
    await expect(page.getByRole("heading", {
      level: 1,
      name: /players and characters|jugadores y personajes/i,
    })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /invite player|invitar jugador/i }).click();
    await expect(page.getByRole("heading", { name: /player invitations|invitaciones de jugador/i })).toBeVisible();

    await page.getByRole("button", { name: /generate invitation link|generar enlace de invitación/i }).click();
    await expect(page.getByText(/\/invitations\//)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
    await expect(page.getByText(/cannot read properties of undefined \(reading 'slice'\)/i)).toHaveCount(0);
    await expect(page.getByText(/^(active|activa)$/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: /revoke invitation|revocar invitación/i }).click();
    await expect(page.getByText(/^(revoked|revocada)$/i)).toBeVisible({ timeout: 15_000 });

    expect(pageErrors.filter((message) => message.includes("Cannot read properties of undefined (reading 'slice')"))).toEqual([]);
  });
});

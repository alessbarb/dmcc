import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

function idempotencyHeaders(): Record<string, string> {
  return { "Idempotency-Key": randomUUID() };
}

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
      page.waitForURL(/\/campaigns\/[^/]+\/overview$/, { timeout: 15_000 }),
      createDialog.locator('button[type="submit"]').click(),
    ]);

    const campaignId = page.url().match(/\/campaigns\/([^/]+)\/overview$/)?.[1];
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
    await page.goto(`/campaigns/${campaignId}/overview`);
    const campaignResponse = await campaignResponsePromise;
    expect(campaignResponse.ok()).toBe(true);
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/overview$`));
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
      headers: idempotencyHeaders(),
      data: { title: `UI Invitation ${suffix}`, system: "custom" },
    });
    expect(campaignResponse.ok()).toBe(true);
    const campaign = await campaignResponse.json();
    const campaignId = campaign.campaignId as string;

    await page.goto(`/campaigns/${campaignId}/people/group`);
    await expect(page.getByRole("heading", {
      level: 1,
      name: /people|jugadores/i,
    })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: /player invitations|invitaciones de jugador/i }).click();
    await expect(page.getByRole("heading", { name: /player invitations|invitaciones de jugador/i, level: 3 })).toBeVisible();

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

test.describe("Player invitation acceptance and routed workspace", () => {
  test("returns to the invitation after login, then opens real routed player campaign tabs", async ({ page }) => {
    test.setTimeout(90_000);

    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const dmEmail = `ui-accept-dm-${suffix}@example.com`;
    const dmPassword = `ui-accept-dm-password-${suffix}`;
    const playerEmail = `ui-accept-player-${suffix}@example.com`;
    const playerPassword = `ui-accept-player-password-${suffix}`;

    // DM: register, create a campaign, and generate a player invitation.
    const dmRegisterRes = await page.request.post("/api/auth/register", {
      data: { email: dmEmail, password: dmPassword, displayName: "UI Accept DM" },
    });
    expect(dmRegisterRes.ok()).toBe(true);
    const campaignResponse = await page.request.post("/api/campaigns", {
      headers: idempotencyHeaders(),
      data: { title: `UI Accept ${suffix}`, system: "custom" },
    });
    expect(campaignResponse.ok()).toBe(true);
    const campaignId = (await campaignResponse.json()).campaignId as string;
    const invitationResponse = await page.request.post(`/api/campaigns/${campaignId}/invitations`, {
      headers: idempotencyHeaders(),
      data: { role: "player" },
    });
    expect(invitationResponse.ok()).toBe(true);
    const inviteToken = (await invitationResponse.json()).invitation.token as string;
    await page.request.post("/api/auth/logout");

    // Player: register a separate account, then log out so the invitation page shows the login prompt.
    const playerRegisterRes = await page.request.post("/api/auth/register", {
      data: { email: playerEmail, password: playerPassword, displayName: "UI Accept Player" },
    });
    expect(playerRegisterRes.ok()).toBe(true);
    await page.request.post("/api/auth/logout");

    await page.goto(`/invitations/${inviteToken}`);
    const loginToContinueButton = page.getByRole("button", { name: /sign in to continue|iniciar sesión para continuar/i });
    await expect(loginToContinueButton).toBeVisible({ timeout: 15_000 });
    await loginToContinueButton.click();
    await expect(page).toHaveURL(/\/auth\/login$/, { timeout: 15_000 });

    await page.locator("#email").fill(playerEmail);
    await page.locator("#password").fill(playerPassword);
    await Promise.all([
      page.waitForURL(new RegExp(`/invitations/${inviteToken}$`), { timeout: 15_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);

    await page.getByRole("button", { name: /accept invitation|aceptar invitación/i }).click();
    await page.waitForURL(/\/player$/, { timeout: 15_000 });

    await page.goto(`/player/campaigns/${campaignId}/character`);
    await expect(page).toHaveURL(new RegExp(`/player/campaigns/${campaignId}/character$`));
    await expect(page.getByRole("tab", { name: /character|personaje/i })).toHaveAttribute("aria-selected", "true", { timeout: 15_000 });

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/player/campaigns/${campaignId}/character$`));
    await expect(page.getByRole("tab", { name: /character|personaje/i })).toHaveAttribute("aria-selected", "true", { timeout: 15_000 });
  });
});

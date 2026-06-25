import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

// title set in beforeAll so it's available across all tests in the same worker
let CAMPAIGN_TITLE = "";

async function goHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DM Campaign Companion" })).toBeVisible({ timeout: 10000 });
}

async function openCampaign(page: Page, title: string) {
  await page.getByRole("heading", { name: title, level: 3 }).click();
  await expect(page.locator(".sidebar-logo")).toContainText(title, { timeout: 10000 });
}

async function clickNav(page: Page, text: string) {
  await page.getByRole("navigation").getByText(text).click();
}

async function createEntity(page: Page, entityType: string, title: string) {
  await page.getByRole("button", { name: "Create Entity" }).click();
  await expect(page.locator(".modal-content")).toBeVisible({ timeout: 5000 });
  await page.locator(".modal-content .form-select").first().selectOption(entityType);
  await page.locator(".modal-content input.form-input").first().fill(title);
  await page.locator(".modal-content").getByRole("button", { name: "Registrar" }).click();
  await expect(page.locator(".modal-content")).not.toBeVisible({ timeout: 10000 });
}

test.describe("Minimum flow", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    CAMPAIGN_TITLE = `E2E Campaign ${randomUUID().slice(0, 8)}`;
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const res = await p.request.get("http://localhost:4877/api/health");
    expect(res.ok()).toBeTruthy();
    await ctx.close();
  });

  test("1. Create campaign", async ({ page }) => {
    await goHome(page);
    await page.getByPlaceholder("e.g. Lost Mine of Phandelver").fill(CAMPAIGN_TITLE);
    await page.getByRole("button", { name: "Initialize Campaign Log" }).click();
    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, { timeout: 10000 });
  });

  test("2. Add player", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Jugadores y personajes");
    await page.getByRole("button", { name: "Add Player" }).click();
    await page.getByPlaceholder("e.g. Alice").fill("Alice");
    await page.getByPlaceholder("Apodo o alias mostrado en la app").fill("Alice the Brave");
    await page.locator("form").getByRole("button", { name: "Añadir jugador" }).click();
    await expect(page.getByText("Alice the Brave")).toBeVisible({ timeout: 5000 });
  });

  test("3. Create NPC (character entity)", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await createEntity(page, "npc", "Lord Malvus");
    await clickNav(page, "Entidades narrativas");
    await expect(page.getByText("Lord Malvus")).toBeVisible({ timeout: 5000 });
  });

  test("4. Create clue", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await createEntity(page, "clue", "Bloodstained Map");
    await clickNav(page, "Entidades narrativas");
    await expect(page.getByText("Bloodstained Map")).toBeVisible({ timeout: 5000 });
  });

  test("5. Create secret", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await createEntity(page, "secret", "True Identity of Malvus");
    await clickNav(page, "Entidades narrativas");
    await expect(page.getByText("True Identity of Malvus")).toBeVisible({ timeout: 5000 });
  });

  test("6. Create relation", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Grafo de relaciones");
    await page.getByRole("button", { name: "Add Relation" }).click();
    await expect(page.locator(".modal-content")).toBeVisible({ timeout: 5000 });
    const selects = page.locator(".modal-content select");
    await selects.nth(0).selectOption({ label: "[npc] Lord Malvus" });
    await selects.nth(2).selectOption({ label: "[clue] Bloodstained Map" });
    await page.locator(".modal-content").getByRole("button", { name: /Registrar/i }).click();
    await expect(page.locator(".modal-content")).not.toBeVisible({ timeout: 8000 });
  });

  test("7. Start session", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Sesión activa");
    await page.getByRole("button", { name: /Iniciar sesión/i }).click();
    await expect(page.locator(".badge-success")).toBeVisible({ timeout: 5000 });
  });

  test("8. Reveal clue during session", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Sesión activa");
    // Open reveal clue panel
    await page.locator("[aria-label='Acciones de sesión']").getByRole("button", { name: "Revelar pista" }).click();
    // Select the clue in the dropdown
    await page.locator("#pista-select").selectOption({ label: "Bloodstained Map" });
    // Click the submit button inside the panel
    await page.locator("form").getByRole("button", { name: "Revelar pista" }).click();
    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE);
  });

  test("9. Quick capture consequence", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Sesión activa");
    // Open create consequence panel
    await page.locator("[aria-label='Acciones de sesión']").getByRole("button", { name: "Crear consecuencia" }).click();
    // Fill the title input
    await page.locator("#cons-title").fill("Party chose to spare Lord Malvus");
    // Click the submit button inside the panel
    await page.locator("form").getByRole("button", { name: "Crear consecuencia" }).click();
    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE);
  });

  test("10. Close session with summary", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Sesión activa");
    // Open close session panel
    await page.locator("[aria-label='Acciones de sesión']").getByRole("button", { name: "Cerrar sesión" }).click();
    // Fill the close summary
    await page.locator("#close-summary").fill("Party explored the sunken ruins and encountered Lord Malvus.");
    // Click the submit button inside the panel
    await page.locator("form").getByRole("button", { name: "Cerrar sesión y guardar" }).click();
    // After closing, app navigates to dashboard — verify session badge is gone
    await expect(page.locator(".badge-success")).not.toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: /Iniciar nueva sesión/i })).toBeVisible({ timeout: 5000 });
  });

  test("11. Open Qué toca ahora", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Qué toca ahora");
    await expect(page.getByRole("heading", { name: /Current Location/i })).toBeVisible({ timeout: 5000 });
  });

  test("12. Search entities with Fuse.js", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Búsqueda");
    await page.getByPlaceholder("Buscar en entidades y hechos...").fill("Malvus");
    await expect(page.locator("text=Lord Malvus").first()).toBeVisible({ timeout: 5000 });
  });

  test("13. View boards", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Tableros");
    await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Clues" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "NPCs by Attitude" })).toBeVisible();
  });

  test("14. Export Markdown", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Ajustes y exportación");
    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.getByRole("button", { name: /Export Campaign to Markdown/i }).click();
    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, { timeout: 8000 });
  });

  test("15. Create backup", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);
    await clickNav(page, "Ajustes y exportación");
    page.once("dialog", async (dialog) => { await dialog.accept(); });
    await page.getByRole("button", { name: /Create Fresh Snapshot Backup/i }).click();
    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, { timeout: 5000 });
  });
});

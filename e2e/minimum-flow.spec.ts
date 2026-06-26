import type { Locator, Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";

// title set in beforeAll so it's available across all tests in the same worker
let CAMPAIGN_TITLE = "";

async function goHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DM Campaign Companion" })).toBeVisible({
    timeout: 10000,
  });
}

async function openCampaign(page: Page, title: string) {
  await page.getByRole("heading", { name: title, level: 3 }).click();
  await expect(page.locator(".sidebar-logo")).toContainText(title, { timeout: 10000 });
}

async function clickNav(page: Page, text: string) {
  await page.getByRole("navigation").getByText(text).click();
}

async function fillClueMetadata(modal: Locator) {
  await modal.getByTestId("clue-content-input").fill(
    "El mapa está manchado de sangre y revela una ruta oculta hacia las ruinas sumergidas.",
  );
}

async function fillSecretMetadata(modal: Locator) {
  await modal.getByTestId("secret-truth-input").fill(
    "Lord Malvus no es un noble legítimo: es una identidad falsa usada por el líder del culto.",
  );
}

async function createEntity(
  page: Page,
  entityType: string,
  title: string,
  fillSpecificFields?: (modal: Locator) => Promise<void>,
) {
  await page.getByRole("button", { name: "Nueva entidad" }).click();

  const modal = page.locator(".modal-content");
  await expect(modal).toBeVisible({ timeout: 5000 });

  await modal.locator(".form-select").first().selectOption(entityType);
  await modal.locator("input.form-input").first().fill(title);

  if (fillSpecificFields) {
    await fillSpecificFields(modal);
  }

  await modal.getByRole("button", { name: "Registrar" }).click();
  await expect(modal).not.toBeVisible({ timeout: 10000 });
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

    await page.getByPlaceholder("Ej: Las Sombras sobre Phandalin").fill(CAMPAIGN_TITLE);
    await page.getByRole("button", { name: "Iniciar archivo de campaña" }).click();

    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, {
      timeout: 10000,
    });
  });

  test("2. Add player", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Jugadores");

    await page.getByRole("button", { name: "Añadir jugador" }).click();
    await page.getByPlaceholder("Ej. Alicia").fill("Alice");
    await page.getByPlaceholder("Apodo o alias mostrado en la app").fill("Alice the Brave");
    await page.locator("form").getByRole("button", { name: "Añadir jugador" }).click();

    await expect(page.getByText("Alice the Brave")).toBeVisible({ timeout: 5000 });
  });

  test("3. Create NPC (character entity)", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await createEntity(page, "npc", "Lord Malvus");

    await clickNav(page, "Entidades");
    await expect(page.getByText("Lord Malvus")).toBeVisible({ timeout: 5000 });
  });

  test("4. Create clue", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await createEntity(page, "clue", "Bloodstained Map", fillClueMetadata);

    await clickNav(page, "Entidades");
    await expect(page.getByText("Bloodstained Map")).toBeVisible({ timeout: 5000 });
  });

  test("5. Create secret", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await createEntity(page, "secret", "True Identity of Malvus", fillSecretMetadata);

    await clickNav(page, "Entidades");
    await expect(page.getByText("True Identity of Malvus")).toBeVisible({ timeout: 5000 });
  });

  test("6. Create relation", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Grafo");

    await page.getByRole("button", { name: "Nueva relación" }).click();

    const modal = page.locator(".modal-content");
    await expect(modal).toBeVisible({ timeout: 5000 });

    const selects = modal.locator("select");

    await selects.nth(0).selectOption({ label: "[npc] Lord Malvus" });
    await selects.nth(2).selectOption({ label: "[clue] Bloodstained Map" });

    await modal.getByRole("button", { name: /Registrar/i }).click();
    await expect(modal).not.toBeVisible({ timeout: 8000 });
  });

  test("7. Start session", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Sesión");

    await page.getByRole("button", { name: /Iniciar sesión/i }).click();
    await expect(page.locator(".badge-success")).toBeVisible({ timeout: 5000 });
  });

  test("8. Reveal clue during session", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Sesión");

    await page
      .locator("[aria-label='Acciones de sesión']")
      .getByRole("button", { name: "Revelar pista" })
      .click();

    await page.locator("#pista-select").selectOption({ label: "Bloodstained Map" });

    const revealForm = page.locator("form").filter({ has: page.locator("#pista-select") });
    await revealForm.getByRole("button", { name: "Revelar pista" }).click();

    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE);
  });

  test("9. Quick capture consequence", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Sesión");

    await page
      .locator("[aria-label='Acciones de sesión']")
      .getByRole("button", { name: "Crear consecuencia" })
      .click();

    await page.locator("#cons-title").fill("Party chose to spare Lord Malvus");

    const consequenceForm = page.locator("form").filter({ has: page.locator("#cons-title") });
    await consequenceForm.getByRole("button", { name: "Crear consecuencia" }).click();

    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE);
  });

  test("10. Close session with summary", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Sesión");

    await page
      .locator("[aria-label='Acciones de sesión']")
      .getByRole("button", { name: "Cerrar sesión" })
      .click();

    await page
      .locator("#close-summary")
      .fill("Party explored the sunken ruins and encountered Lord Malvus.");

    const closeForm = page.locator("form").filter({ has: page.locator("#close-summary") });
    await closeForm.getByRole("button", { name: "Cerrar sesión y guardar" }).click();

    await expect(page.locator(".badge-success")).not.toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("button", { name: /Iniciar nueva sesión/i })).toBeVisible({
      timeout: 5000,
    });
  });

  test("11. Open Qué toca ahora", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "¿Qué toca?");

    await expect(page.getByRole("heading", { name: /Ubicación actual/i })).toBeVisible({
      timeout: 5000,
    });
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

    await expect(page.getByRole("heading", { name: "Tableros" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Misiones" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pistas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PNJs" })).toBeVisible();
  });

  test("14. Export Markdown", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Ajustes");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /Exportar campaña a Bóveda Markdown/i }).click();

    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, {
      timeout: 8000,
    });
  });

  test("15. Create backup", async ({ page }) => {
    await goHome(page);
    await openCampaign(page, CAMPAIGN_TITLE);

    await clickNav(page, "Ajustes");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.getByRole("button", { name: /Crear copia de seguridad/i }).click();

    await expect(page.locator(".sidebar-logo")).toContainText(CAMPAIGN_TITLE, {
      timeout: 5000,
    });
  });
});
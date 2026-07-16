import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";

function idempotencyHeaders(): Record<string, string> {
  return { "Idempotency-Key": randomUUID() };
}

test.describe("Campaign workspace regressions", () => {
  test("creates a notebook through the UI and renders the 2D network on desktop and mobile", async ({ page }) => {
    test.setTimeout(90_000);

    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const registerResponse = await page.request.post("/api/auth/register", {
      data: {
        email: `workspace-${suffix}@example.com`,
        password: `workspace-password-${suffix}`,
        displayName: "Workspace Regression DM",
      },
    });
    expect(registerResponse.ok()).toBe(true);

    const campaignResponse = await page.request.post("/api/campaigns", {
      headers: idempotencyHeaders(),
      data: { title: `Workspace Regression ${suffix}`, system: "custom" },
    });
    expect(campaignResponse.ok()).toBe(true);
    const campaignId = (await campaignResponse.json()).campaignId as string;

    const firstEntityId = `ent_first_${suffix}`;
    const secondEntityId = `ent_second_${suffix}`;
    const relationId = `rel_workspace_${suffix}`;

    for (const [entityId, title] of [[firstEntityId, "Aster"], [secondEntityId, "Bram"]] as const) {
      const response = await page.request.post(`/api/campaigns/${campaignId}/entities`, {
        headers: idempotencyHeaders(),
        data: {
          entityId,
          entityType: "npc",
          title,
          visibility: { kind: "dm_only" },
        },
      });
      expect(response.ok()).toBe(true);
    }

    const relationResponse = await page.request.post(`/api/campaigns/${campaignId}/relations`, {
      headers: idempotencyHeaders(),
      data: {
        relationId,
        sourceEntityId: firstEntityId,
        targetEntityId: secondEntityId,
        relationType: "knows",
        visibility: { kind: "dm_only" },
      },
    });
    expect(relationResponse.ok()).toBe(true);

    await page.goto(`/campaigns/${campaignId}/library/notebooks`);
    await expect(page.locator(".notebooks-workspace")).toBeVisible({ timeout: 15_000 });

    const createRootButton = page.locator(".notebooks-sidebar button[title]").filter({
      has: page.locator("svg"),
    }).first();
    await expect(createRootButton).toBeVisible();
    await createRootButton.click();

    const titleInput = page.locator(".notebooks-sidebar input[type='text']");
    await expect(titleInput).toBeVisible();
    await titleInput.fill("Session clues");

    const createResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith(`/api/campaigns/${campaignId}/notebooks`) && response.request().method() === "POST",
    );
    await page.locator(".notebooks-sidebar button.btn-primary").click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBe(true);
    await expect(page.getByText("Session clues", { exact: true })).toBeVisible({ timeout: 15_000 });

    const notebooksResponse = await page.request.get(`/api/campaigns/${campaignId}/notebooks`);
    expect(notebooksResponse.ok()).toBe(true);
    const notebooksPayload = await notebooksResponse.json();
    expect(notebooksPayload.notebooks).toContainEqual(expect.objectContaining({
      notebookId: expect.stringMatching(/^nbk_/),
      title: "Session clues",
    }));

    await page.goto(`/campaigns/${campaignId}/map/network`);
    const networkWorkspace = page.getByTestId("network-workspace-view");
    await expect(networkWorkspace).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".react-flow")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".react-flow__node")).toHaveCount(2, { timeout: 15_000 });

    const desktopBounds = await networkWorkspace.boundingBox();
    expect(desktopBounds?.width ?? 0).toBeGreaterThan(600);
    expect(desktopBounds?.height ?? 0).toBeGreaterThan(400);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/campaigns/${campaignId}/library/notebooks`);
    const mobileWorkspace = page.locator(".notebooks-workspace");
    const mobileSidebar = page.locator(".notebooks-sidebar");
    await expect(mobileWorkspace).toBeVisible({ timeout: 15_000 });
    const workspaceBounds = await mobileWorkspace.boundingBox();
    const sidebarBounds = await mobileSidebar.boundingBox();
    expect(workspaceBounds?.width ?? 0).toBeLessThanOrEqual(390);
    expect(sidebarBounds?.width ?? 0).toBeLessThanOrEqual(workspaceBounds?.width ?? 390);

    await page.goto(`/campaigns/${campaignId}/map/network`);
    await expect(page.locator(".react-flow")).toBeVisible({ timeout: 15_000 });
    const mobileNetworkBounds = await page.getByTestId("network-workspace-view").boundingBox();
    expect(mobileNetworkBounds?.width ?? 0).toBeLessThanOrEqual(390);
    expect(mobileNetworkBounds?.height ?? 0).toBeGreaterThan(450);
  });
});

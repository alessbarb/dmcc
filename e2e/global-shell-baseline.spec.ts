import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

const DM_ROUTES = [
  "overview",
  "sessions",
  "sessions/$sessionId",
  "sessions/$sessionId/map",
  "sessions/$sessionId/consequences",
  "library/list",
  "library/boards",
  "library/notebooks",
  "map/canvas",
  "map/network",
  "story/history",
  "people/group",
  "people/invitations",
  "people/knowledge",
  "messages",
  "rules",
  "settings",
] as const;

async function createCampaign(page: Page): Promise<{ campaignId: string; sessionId: string }> {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
  const registerResponse = await page.request.post("/api/auth/register", {
    data: {
      email: `shell-baseline-${suffix}@example.com`,
      password: `shell-baseline-password-${suffix}`,
      displayName: "Global Shell Baseline DM",
    },
  });
  expect(registerResponse.ok()).toBe(true);

  const campaignResponse = await page.request.post("/api/campaigns", {
    headers: { "Idempotency-Key": randomUUID() },
    data: { title: `Global Shell Baseline ${suffix}`, system: "custom" },
  });
  expect(campaignResponse.ok()).toBe(true);
  const campaignId = (await campaignResponse.json()).campaignId as string;
  const sessionId = `sess_${suffix}`;
  const sessionResponse = await page.request.post(`/api/campaigns/${campaignId}/sessions/planned`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: { sessionId, title: "Baseline session" },
  });
  expect(sessionResponse.ok()).toBe(true);
  return { campaignId, sessionId };
}

async function inspectRoute(page: Page, campaignId: string, sessionId: string, route: string, viewport: { name: string; width: number; height: number }, testInfo: TestInfo): Promise<Record<string, unknown>> {
  await page.setViewportSize(viewport);
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  };
  const onRequestFailed = (request: { url(): string; failure(): { errorText?: string } | null }) => {
    failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
  };
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);

  await page.goto(`/campaigns/${campaignId}/${route.replace("$sessionId", sessionId)}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#campaign-main-workspace")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(250);
  const result = await page.locator("body").evaluate((body) => {
    const rect = body.getBoundingClientRect();
    const measure = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      return {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
      };
    };
    return {
      url: window.location.pathname,
      h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim() ?? ""),
      h2: [...document.querySelectorAll("h2")].map((node) => node.textContent?.trim() ?? ""),
      shell: Boolean(document.querySelector(".app-container--campaign-shell")),
      sidebar: Boolean(document.querySelector(".app-container--campaign-shell .sidebar")),
      mobileNavigation: Boolean(document.querySelector(".app-container--campaign-shell .mobile-dock")),
      main: Boolean(document.querySelector("main#campaign-main-workspace")),
      footer: Boolean(document.querySelector(".app-container--campaign-shell .app-footer")),
      watermark: document.body.dataset.watermark ?? "default",
      bodyWidth: rect.width,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      measures: {
        shell: measure(".app-container--campaign-shell"),
        sidebar: measure(".app-container--campaign-shell .sidebar"),
        mobileNavigation: measure(".app-container--campaign-shell .mobile-dock"),
        main: measure("main#campaign-main-workspace"),
        content: measure("main#campaign-main-workspace .workspace-shell__content"),
      },
    };
  });
  await page.screenshot({ path: testInfo.outputPath(`global-shell-${route.replaceAll("/", "-")}-${viewport.name}.png`), fullPage: true });
  page.off("console", onConsole);
  page.off("requestfailed", onRequestFailed);
  return { route, viewport: viewport.name, ...result, consoleErrors, failedRequests };
}

test("captures the DM global-shell baseline across routes and viewports", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const { campaignId, sessionId } = await createCampaign(page);
  const results: Record<string, unknown>[] = [];

  for (const route of DM_ROUTES) {
    for (const viewport of [
      { name: "desktop-1440x900", width: 1440, height: 900 },
      { name: "desktop-1280x800", width: 1280, height: 800 },
      { name: "tablet-1024x768", width: 1024, height: 768 },
      { name: "mobile-390x844", width: 390, height: 844 },
      { name: "mobile-360x640", width: 360, height: 640 },
    ]) {
      const result = await inspectRoute(page, campaignId, sessionId, route, viewport, testInfo);
      expect(result.h1).toHaveLength(1);
      expect(result.footer).toBe(!route.startsWith("map/"));
      expect(result.scrollWidth).toBeLessThanOrEqual(result.viewportWidth);
      const expectedWatermark = route === "map/network"
        ? "network"
        : route === "map/canvas"
          ? "canvas"
          : route === "library/notebooks"
            ? "notebooks"
            : route === "rules"
              ? "hidden"
              : "default";
      expect(result.watermark).toBe(expectedWatermark);
      results.push(result);
    }
  }

  const baseline = JSON.stringify(results, null, 2);
  const reportPath = testInfo.outputPath("global-shell-baseline.json");
  await writeFile(reportPath, baseline, "utf8");
  await testInfo.attach("global-shell-baseline.json", { path: reportPath, contentType: "application/json" });
});

test("keeps the global shell contract while entering and leaving workspace fullscreen", async ({ page }) => {
  const { campaignId } = await createCampaign(page);
  await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
  const fullscreenButton = page.locator(".workspace-fullscreen-button").first();
  await expect(fullscreenButton).toBeVisible();

  await fullscreenButton.click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect.poll(() => page.locator(".app-container--campaign-shell").getAttribute("data-shell-fullscreen")).toBe("true");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".app-footer")).toBeHidden();
  await expect.poll(() => page.locator(".campaign-workspace__content").evaluate((element) => getComputedStyle(element).overflowY)).toBe("auto");

  await fullscreenButton.click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await expect.poll(() => page.locator(".app-container--campaign-shell").getAttribute("data-shell-fullscreen")).toBe("false");

  for (const route of ["map/canvas", "map/network"]) {
    await page.goto(`/campaigns/${campaignId}/${route}`, { waitUntil: "domcontentloaded" });
    const immersiveFullscreenButton = page.locator(".workspace-fullscreen-button").first();
    await expect(immersiveFullscreenButton).toBeVisible();
    await immersiveFullscreenButton.click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
    await expect(page.locator(".workspace-shell__content")).toBeVisible();
    const contentSize = await page.locator(".workspace-shell__content").evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      overflowY: getComputedStyle(element).overflowY,
    }));
    expect(contentSize.height).toBeGreaterThan(0);
    // Canvas and graph own their internal pan/scroll surface; the page subshell
    // must clip it rather than becoming a second competing scroll container.
    expect(contentSize.overflowY).toBe("hidden");
    await immersiveFullscreenButton.click();
    await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  }
});

test("validates the operational DM command center across desktop and mobile", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const { campaignId } = await createCampaign(page);

  for (const viewport of [
    { name: "desktop-1440x900", width: 1440, height: 900 },
    { name: "mobile-390x844", width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main#campaign-main-workspace")).toBeVisible();
    await expect(page.locator(".dashboard-status-strip")).toBeVisible();
    await expect(page.locator(".dashboard-command-grid")).toHaveCount(2);
    await expect(page.locator(".dashboard-entity-grids")).toHaveCount(0);
    await expect(page.locator(".dashboard-metrics-grid")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
    const firstCommandGridTop = await page.locator(".dashboard-command-grid").first().evaluate((element) => element.getBoundingClientRect().top);
    expect(firstCommandGridTop).toBeLessThan(viewport.height);

    const overflow = await page.locator("main#campaign-main-workspace").evaluate((main) => ({
      clientWidth: main.clientWidth,
      scrollWidth: main.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await page.getByRole("button", { name: /graph|grafo/i }).click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/map/network$`));
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".dashboard-attention-queue")).toBeVisible();
    await expect(page.locator(".dashboard-empty-message")).toBeVisible();

    const narrativePanel = page.locator("section[aria-labelledby='narrative-state-title']");
    await narrativePanel.getByRole("button").click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/library/list$`));
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });

    const cadencePanel = page.locator("section[aria-labelledby='session-cadence-title']");
    await cadencePanel.getByRole("button").click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/sessions$`));
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
    const activityPanel = page.locator("section[aria-labelledby='recent-activity-title']");
    await activityPanel.getByRole("button").click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/story/history$`));
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });

    await page.locator(".dashboard-status-strip__item").first().click();
    await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/library/list$`));

    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".dashboard-status-strip")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /search/i })).toBeVisible();
    const workspaceActions = page.locator(".workspace-shell__navigation-actions > *");
    expect(await workspaceActions.evaluateAll((nodes) => nodes.every((node) => {
      const rect = node.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth && rect.width > 0 && rect.height > 0;
    }))).toBe(true);
    await page.getByRole("button", { name: /retry/i }).focus();
    await page.keyboard.press("Tab");
    expect(await page.getByRole("button", { name: /search/i }).evaluate((node) => node.matches(":focus-visible"))).toBe(true);
    await page.getByRole("button", { name: /run active session/i }).click();
    await expect(page.locator(".live-table-modal[role=dialog]")).toBeVisible();
    await page.locator(".live-table-modal .modal-close-btn").click();
    await expect(page.locator(".live-table-modal[role=dialog]")).toHaveCount(0);

    await page.screenshot({
      path: testInfo.outputPath(`dm-command-center-${viewport.name}.png`),
      fullPage: true,
    });
    await page.locator(".dashboard-command-grid").first().scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`dm-command-center-${viewport.name}-operational.png`),
      fullPage: false,
    });

    await page.route(`**/api/campaigns/${campaignId}/command-center`, async (route) => {
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "forced baseline failure" }) });
    });
    await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".dashboard-card--error")).toBeVisible();
    await page.unroute(`**/api/campaigns/${campaignId}/command-center`);
  }

  const attentionEntityResponse = await page.request.post(`/api/campaigns/${campaignId}/entities`, {
    headers: { "Idempotency-Key": randomUUID() },
    data: {
      entityId: `ent_baseline_secret_${randomUUID().replace(/-/g, "")}`,
      entityType: "secret",
      title: "Baseline hidden secret",
      status: "hidden",
      importance: "critical",
      visibility: { kind: "dm_only" },
    },
  });
  expect(attentionEntityResponse.ok(), await attentionEntityResponse.text()).toBe(true);
  await page.goto(`/campaigns/${campaignId}/overview`, { waitUntil: "domcontentloaded" });
  const attentionRow = page.locator(".dashboard-attention-queue__row").first();
  await expect(attentionRow).toBeVisible();
  await attentionRow.click();
  await expect(page).toHaveURL(new RegExp(`/campaigns/${campaignId}/library/list$`));
});

test("exposes the declared page-subshell variants before page-specific migration", async ({ page }) => {
  const { campaignId, sessionId } = await createCampaign(page);
  const variants = [
    { route: "overview", variant: "operational" },
    { route: "library/list", variant: "library" },
    { route: "map/canvas", variant: "canvas" },
    { route: "story/history", variant: "narrative" },
    { route: `sessions/${sessionId}`, variant: "narrative" },
    { route: "people/group", variant: "operational" },
    { route: "messages", variant: "content" },
    { route: "rules", variant: "content" },
    { route: "settings", variant: "settings" },
  ];

  for (const entry of variants) {
    await page.goto(`/campaigns/${campaignId}/${entry.route}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(`.page-subshell[data-subshell-variant="${entry.variant}"]`)).toBeVisible();
  }

  await page.goto(`/campaigns/${campaignId}/sessions/${sessionId}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".workspace-tabs .workspace-tab")).toHaveCount(3);
  await expect(page.locator(".workspace-fullscreen-button")).toBeVisible();
});

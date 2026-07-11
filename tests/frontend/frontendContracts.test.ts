import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sessionStatusSchema } from "../../src/core/domain/session/types.js";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FRONTEND_ROOT = join(REPOSITORY_ROOT, "src/frontend");
const ROUTER_PATH = join(FRONTEND_ROOT, "router.tsx");

function listSourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(root, entry.name);
    if (entry.isDirectory()) return listSourceFiles(absolutePath);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [absolutePath] : [];
  });
}

function registeredCampaignDestinations(routerSource: string): Set<string> {
  const destinations = new Set<string>();
  const routeBlocks = routerSource.matchAll(
    /const\s+\w+Route\s*=\s*createRoute\(\{([\s\S]*?)^\}\);/gm,
  );

  for (const match of routeBlocks) {
    const block = match[1];
    const routePath = block.match(/\bpath:\s*"([^"]+)"/)?.[1];
    if (!routePath) continue;

    if (block.includes("getParentRoute: () => campaignRoute") && routePath !== "/") {
      destinations.add(routePath.replace(/^\//, ""));
    }

    const rootCampaignPrefix = "/campaigns/$campaignId/";
    if (
      block.includes("getParentRoute: () => rootRoute") &&
      routePath.startsWith(rootCampaignPrefix)
    ) {
      destinations.add(routePath.slice(rootCampaignPrefix.length));
    }
  }

  return destinations;
}

describe("frontend contracts", () => {
  it("keeps every campaign navigation target registered in the router", () => {
    const routerSource = readFileSync(ROUTER_PATH, "utf8");
    const registeredDestinations = registeredCampaignDestinations(routerSource);
    const unknownReferences: string[] = [];
    const campaignNavigationPattern =
      /(?<!\/api)(?<!\/player)\/campaigns\/(?:\$\{[^}]+\}|\$campaignId)\/([a-z0-9-]+)/g;

    for (const sourcePath of listSourceFiles(FRONTEND_ROOT)) {
      const source = readFileSync(sourcePath, "utf8");
      for (const match of source.matchAll(campaignNavigationPattern)) {
        const destination = match[1];
        if (!registeredDestinations.has(destination)) {
          unknownReferences.push(`${relative(REPOSITORY_ROOT, sourcePath)} -> ${destination}`);
        }
      }
    }

    expect(registeredDestinations).toContain("command-center");
    expect(registeredDestinations).toContain("rules");
    expect(registeredDestinations).not.toContain("dashboard");
    expect(registeredDestinations).not.toContain("what-now");
    expect(registeredDestinations).not.toContain("live");
    expect(registeredDestinations).not.toContain("player-portal");
    expect(unknownReferences).toEqual([]);
  });

  it("does not retain duplicate campaign home modules", () => {
    expect(existsSync(join(FRONTEND_ROOT, "dm/pages/DashboardPage.tsx"))).toBe(false);
    expect(existsSync(join(FRONTEND_ROOT, "dm/pages/WhatNowPage.tsx"))).toBe(false);

    const routerSource = readFileSync(ROUTER_PATH, "utf8");
    expect(routerSource).not.toContain("DashboardPage");
    expect(routerSource).not.toContain("WhatNowPage");
    expect(routerSource).not.toMatch(/path:\s*"\/(?:dashboard|what-now|live)"/);
  });

  it("keeps /portal as the only player workspace", () => {
    const routerSource = readFileSync(ROUTER_PATH, "utf8");
    expect(routerSource).toMatch(/path:\s*"\/portal"/);
    expect(routerSource).not.toContain("PlayerPortalPage");
    expect(routerSource).not.toContain("WebPlayerPortalPage");
    expect(routerSource).not.toContain("PlayerConstellationPage");
    expect(routerSource).not.toMatch(/path:\s*"\/player\/campaigns\//);
    expect(routerSource).not.toMatch(/path:\s*"\/campaigns\/\$campaignId\/player-portal"/);

    for (const path of [
      "player/pages/PlayerPortalPage.tsx",
      "player/pages/WebPlayerPortalPage.tsx",
      "player/pages/PlayerConstellationPage.tsx",
      "player/components/PlayerPortalView.tsx",
    ]) {
      expect(existsSync(join(FRONTEND_ROOT, path)), path).toBe(false);
    }
  });

  it("uses the domain session-status contract in all prepared-session consumers", () => {
    expect(sessionStatusSchema.options).toEqual([
      "planned",
      "active",
      "closed",
      "cancelled",
      "archived",
    ]);
    expect(sessionStatusSchema.parse("planned")).toBe("planned");

    const consumers: Array<[string, RegExp]> = [
      ["src/frontend/dm/canvas/pages/CanvasPage.tsx", /session\.status === "planned"/],
      ["src/frontend/dm/pages/CommandCenterPage.tsx", /session\.status === "planned"/],
      ["src/frontend/dm/sessions/SessionPage.tsx", /session\.status === "planned"/],
      ["src/frontend/dm/hub/useDmHubDashboard.ts", /raw\?\.status === "planned"/],
      ["src/frontend/dm/hub/dmHubTypes.ts", /"running" \| "paused" \| "planned"/],
    ];

    for (const [sourcePath, expectedUsage] of consumers) {
      const source = readFileSync(join(REPOSITORY_ROOT, sourcePath), "utf8");
      expect(source, sourcePath).toMatch(expectedUsage);
    }
  });
});

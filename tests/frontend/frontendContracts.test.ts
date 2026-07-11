import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sessionStatusSchema } from "../../src/core/domain/session/types.js";
import { dictionaries, SUPPORTED_LOCALE_CODES } from "../../src/shared/i18n/locales.js";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FRONTEND_ROOT = join(REPOSITORY_ROOT, "src/frontend");
const ROUTER_PATH = join(FRONTEND_ROOT, "router.tsx");
const SMART_LANDING_PATH = join(FRONTEND_ROOT, "SmartLanding.tsx");

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
  it("keeps unified player portal copy in the six official dictionaries", () => {
    const source = readFileSync(SMART_LANDING_PATH, "utf8");
    const keys = [...source.matchAll(/playerPortal\.[A-Za-z0-9_.]+/g)].map((match) => match[0]);
    expect(keys.length).toBeGreaterThan(20);

    for (const locale of SUPPORTED_LOCALE_CODES) {
      for (const key of keys) {
        const value = key.split(".").reduce<unknown>((current, part) => {
          if (current && typeof current === "object" && part in current) {
            return (current as Record<string, unknown>)[part];
          }
          return undefined;
        }, dictionaries[locale]);
        expect(value, `${locale}:${key}`).toEqual(expect.any(String));
        expect(value, `${locale}:${key}`).not.toBe(key);
      }
    }

    expect(source).not.toMatch(/label:\s*"[^"]+"/);
    expect(source).not.toMatch(/Buscar en lo que sabe|Sin resumen visible|Portal jugador|Cambiar campaña|Cargando constelación/);
  });

  it("keeps portal i18n on the official dictionary path only", () => {
    const translateSource = readFileSync(join(REPOSITORY_ROOT, "src/shared/i18n/translate.ts"), "utf8");
    expect(translateSource).toContain('from "./locales.js"');
    expect(translateSource).not.toContain("dictionaries/");
    expect(translateSource).not.toContain(`p1${"Dictionaries"}`);

    const i18nFiles = listSourceFiles(join(REPOSITORY_ROOT, "src/shared/i18n"));
    const unexpectedPortalFiles = i18nFiles.filter((path) =>
      /player.*portal|portal.*player|p1/i.test(relative(REPOSITORY_ROOT, path)) &&
      !/dictionaries\/(?:en|es|fr|de|it|pt)\.ts$/.test(path)
    );
    expect(unexpectedPortalFiles.map((path) => relative(REPOSITORY_ROOT, path))).toEqual([]);
  });

  it("keeps the unified player portal tabs structurally accessible", () => {
    const source = readFileSync(SMART_LANDING_PATH, "utf8");
    expect(source).toContain('role="tablist"');
    expect(source).toContain('role="tab"');
    expect(source).toContain('role="tabpanel"');
    expect(source).toContain("aria-selected");
    expect(source).toContain("aria-controls");
    expect(source).toContain("aria-labelledby");
    expect(source).toContain("ArrowRight");
    expect(source).toContain("ArrowLeft");
    expect(source).toContain('tabIndex={0}');
    expect(source).not.toContain('role="listbox"');
  });

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

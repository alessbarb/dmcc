import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ROUTES = join(ROOT, "src/backend/server/web/routes");
const portalRoutePath = join(ROUTES, "playerPortalWebRoutes.ts");
const migrationPath = join(ROOT, "src/backend/db/migrations/0006_player_portal_state.sql");
const drizzleConfigPath = join(ROOT, "drizzle.config.ts");

describe("canonical player portal synchronization", () => {
  it("persists status and resources in dedicated canonical tables", () => {
    const routeSource = readFileSync(portalRoutePath, "utf8");
    const migrationSource = readFileSync(migrationPath, "utf8");

    expect(routeSource).toContain("playerPortalStates");
    expect(routeSource).toContain("playerPortalResources");
    expect(routeSource).toContain("onConflictDoUpdate");
    expect(migrationSource).toContain('CREATE TABLE IF NOT EXISTS "player_portal_states"');
    expect(migrationSource).toContain('CREATE TABLE IF NOT EXISTS "player_portal_resources"');
  });

  it("does not retain synchronization wrappers or no-op resource endpoints", () => {
    const routeSource = readFileSync(portalRoutePath, "utf8");

    expect(existsSync(join(ROUTES, "playerPortalSynchronizationWebRoutes.ts"))).toBe(false);
    expect(routeSource).not.toContain('player-portal/resources", async () => ({ ok: true })');
    expect(routeSource).not.toContain("addHook(\"preSerialization\"");
    expect(routeSource).not.toContain("addHook(\"onResponse\"");
  });

  it("keeps one canonical player-character read endpoint", () => {
    const routeSource = readFileSync(portalRoutePath, "utf8");
    expect(existsSync(join(ROUTES, "playerCharacterSelectionWebRoutes.ts"))).toBe(false);
    expect(routeSource).toContain('"/api/player/campaigns/:campaignId/character"');
    expect(routeSource).not.toContain("character-selection");
  });

  it("keeps the portal schema visible to Drizzle Kit", () => {
    const configSource = readFileSync(drizzleConfigPath, "utf8");
    expect(configSource).toContain("playerPortalSchema.ts");
  });
});

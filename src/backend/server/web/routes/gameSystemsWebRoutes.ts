import type { FastifyInstance } from "fastify";
import { db } from "../../../db/client.js";
import { gameSystemSettings } from "../../../db/catalogSettingsSchema.js";

/** Canonical built-in game systems with their display labels. */
const BUILT_IN_GAME_SYSTEMS = [
  { systemId: "dnd_5e" as const, label: "D&D 5e (SRD 5.2.1)" },
  { systemId: "pathfinder_2e" as const, label: "Pathfinder 2e" },
  { systemId: "shadowdark" as const, label: "Shadowdark" },
  { systemId: "custom" as const, label: "Custom System" },
];

export async function registerGameSystemsWebRoutes(server: FastifyInstance): Promise<void> {
  /**
   * GET /api/game-systems — public endpoint.
   * Returns the list of available game systems, merged with any admin-configured
   * settings (enabled/disabled state, sort order). The `custom` system is always
   * enabled regardless of the database setting.
   */
  server.get("/api/game-systems", async () => {
    const dbSettings = await db.select().from(gameSystemSettings);
    const settingsMap = new Map(dbSettings.map((row) => [row.systemId, row]));

    const systems = BUILT_IN_GAME_SYSTEMS.map(({ systemId, label }) => {
      const settings = settingsMap.get(systemId);
      return {
        systemId,
        label,
        isEnabledForNewCampaigns: systemId === "custom" ? true : (settings?.isEnabledForNewCampaigns ?? true),
        sortOrder: settings?.sortOrder ?? 0,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

    return { systems };
  });
}

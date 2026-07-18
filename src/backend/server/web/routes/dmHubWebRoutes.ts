import type { FastifyInstance } from "fastify";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { getRequiredWebUser } from "../webSession.js";
import { isDmRole, listAccessibleCampaigns } from "../webAccess.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function campaignMetadata(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export async function registerDmHubWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/dm/dashboard", async (request) => {
    const user = getRequiredWebUser(request);
    const accessibleCampaigns = (await listAccessibleCampaigns(user.userId))
      .filter((campaign) => isDmRole(campaign.role));
    const now = new Date();

    const campaigns = await Promise.all(accessibleCampaigns.map(async (campaign) => {
      const [players, entities, sessions, liveTables] = await Promise.all([
        db.select().from(schema.playerProfiles)
          .where(eq(schema.playerProfiles.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignEntities)
          .where(eq(schema.campaignEntities.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignSessions)
          .where(eq(schema.campaignSessions.campaignId, campaign.campaignId)),
        db.select().from(schema.liveTables).where(and(
          eq(schema.liveTables.campaignId, campaign.campaignId),
          eq(schema.liveTables.status, "active"),
          gt(schema.liveTables.expiresAt, now),
        )),
      ]);
      const metadata = campaignMetadata(campaign.metadata);
      const activeSession = sessions.find((session) => session.status === "active");
      const activeTable = liveTables[0] ?? null;

      return {
        campaignId: campaign.campaignId,
        title: campaign.title,
        summary: campaign.summary ?? undefined,
        status: campaign.status,
        system: typeof metadata.system === "string" ? metadata.system : undefined,
        coverUrl: typeof metadata.coverUrl === "string" ? metadata.coverUrl : undefined,
        metadata,
        role: campaign.role,
        playerId: campaign.playerId,
        createdAt: campaign.createdAt?.toISOString?.() ?? String(campaign.createdAt),
        updatedAt: campaign.updatedAt?.toISOString?.() ?? String(campaign.updatedAt),
        stats: {
          playersCount: players.filter((player) => player.status === "active").length,
          npcsCount: entities.filter((entity) => entity.type === "npc" && entity.status !== "archived").length,
          locationsCount: entities.filter((entity) => entity.type === "location" && entity.status !== "archived").length,
          questsCount: entities.filter((entity) => entity.type === "quest" && entity.status !== "archived").length,
          secretsCount: entities.filter((entity) => entity.type === "secret" && entity.status !== "archived").length,
          cluesCount: entities.filter((entity) => entity.type === "clue" && entity.status !== "archived").length,
          sessionsCount: sessions.filter((session) => session.status !== "archived").length,
          activeSession: activeSession?.title ?? (activeTable ? "Active table" : null),
        },
        activeTable,
      };
    }));

    const activeTables = campaigns
      .filter((campaign) => campaign.activeTable || campaign.stats.activeSession)
      .map((campaign) => ({
        id: campaign.activeTable?.liveTableId ?? campaign.campaignId,
        campaignId: campaign.campaignId,
        tableName: campaign.title,
        campaignTitle: campaign.title,
        sessionTitle: campaign.stats.activeSession ?? "Active session",
        status: "running" as const,
        elapsed: "",
        playersPresent: campaign.stats.playersCount,
        playersTotal: campaign.stats.playersCount,
      }));

    return {
      campaigns,
      activeTables,
      alerts: [],
      recentActivity: [],
      totals: {
        campaigns: campaigns.length,
        activeTables: activeTables.length,
        players: campaigns.reduce((total, campaign) => total + campaign.stats.playersCount, 0),
        sessions: campaigns.reduce((total, campaign) => total + campaign.stats.sessionsCount, 0),
        npcs: campaigns.reduce((total, campaign) => total + campaign.stats.npcsCount, 0),
        entities: campaigns.reduce((total, campaign) => total
          + campaign.stats.npcsCount
          + campaign.stats.locationsCount
          + campaign.stats.questsCount
          + campaign.stats.secretsCount
          + campaign.stats.cluesCount, 0),
        completedCampaigns: campaigns.filter((campaign) => campaign.status === "completed").length,
        playtimeLast30DaysLabel: "0h",
      },
    };
  });
}

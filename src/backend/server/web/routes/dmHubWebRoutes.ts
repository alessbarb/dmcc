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
      const [players, entities, sessions, liveTables, clues, objectives] = await Promise.all([
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
        db.select().from(schema.campaignClues)
          .where(eq(schema.campaignClues.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignObjectives)
          .where(eq(schema.campaignObjectives.campaignId, campaign.campaignId)),
      ]);
      const metadata = campaignMetadata(campaign.metadata);
      const activeSession = sessions.find((session) => session.status === "active");
      const activeTable = liveTables[0] ?? null;
      const nextSession = sessions
        .filter((session) => session.status === "planned" && session.plannedDate)
        .sort((left, right) => String(left.plannedDate).localeCompare(String(right.plannedDate)))[0] ?? null;

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
        nextSession: nextSession ? {
          campaignId: campaign.campaignId,
          campaignTitle: campaign.title,
          title: nextSession.title,
          plannedDate: nextSession.plannedDate,
          href: `/campaigns/${campaign.campaignId}/sessions`,
        } : null,
        preparation: {
          plannedSessions: sessions.filter((session) => session.status === "planned").length,
          hiddenClues: clues.filter((clue) => clue.status === "hidden").length,
          openObjectives: objectives.filter((objective) => objective.status === "open").length,
          changedEntities: entities.filter((entity) => entity.updatedAt && entity.updatedAt > new Date(Date.now() - 7 * 86400000)).length,
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

    const nextSession = campaigns
      .map((campaign) => campaign.nextSession)
      .filter((session): session is NonNullable<typeof session> => Boolean(session))
      .sort((left, right) => String(left.plannedDate).localeCompare(String(right.plannedDate)))[0] ?? null;
    const preparation = campaigns.reduce((summary, campaign) => ({
      plannedSessions: summary.plannedSessions + campaign.preparation.plannedSessions,
      hiddenClues: summary.hiddenClues + campaign.preparation.hiddenClues,
      openObjectives: summary.openObjectives + campaign.preparation.openObjectives,
      changedEntities: summary.changedEntities + campaign.preparation.changedEntities,
    }), { plannedSessions: 0, hiddenClues: 0, openObjectives: 0, changedEntities: 0 });
    const recentActivity = campaigns
      .filter((campaign) => campaign.updatedAt)
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
      .slice(0, 3)
      .map((campaign) => ({
        id: `campaign-${campaign.campaignId}`,
        icon: "campaign" as const,
        text: `${campaign.title} updated`,
        time: campaign.updatedAt ?? "",
        href: `/campaigns/${campaign.campaignId}/overview`,
      }));

    return {
      campaigns,
      activeTables,
      alerts: [],
      recentActivity,
      nextSession,
      preparation,
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

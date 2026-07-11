import type { FastifyInstance } from "fastify";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { getRequiredWebUser } from "../webSession.js";
import { isDmRole, listAccessibleCampaigns, requireCampaignRole } from "../webAccess.js";

function campaignMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function registerDmDashboardWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get("/api/dm/dashboard", async (request) => {
    const user = getRequiredWebUser(request);
    const accessibleCampaigns = (await listAccessibleCampaigns(user.userId)).filter((campaign) => isDmRole(campaign.role));
    const now = new Date();

    const dashboardCampaigns = await Promise.all(accessibleCampaigns.map(async (campaign) => {
      const [players, entities, sessions, liveTables] = await Promise.all([
        db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaign.campaignId)),
        db.select().from(schema.liveTables).where(and(
          eq(schema.liveTables.campaignId, campaign.campaignId),
          eq(schema.liveTables.status, "active"),
          gt(schema.liveTables.expiresAt, now),
        )),
      ]);
      const metadata = campaignMetadata(campaign.metadata);
      const activeSession = sessions.find((session) => session.status === "live");
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

    const activeTables = dashboardCampaigns
      .filter((campaign) => campaign.activeTable || campaign.stats.activeSession)
      .map((campaign) => ({
        id: campaign.activeTable?.liveTableId ?? campaign.campaignId,
        campaignId: campaign.campaignId,
        tableName: campaign.title,
        campaignTitle: campaign.title,
        sessionTitle: campaign.stats.activeSession ?? "Active session",
        status: "running",
        elapsed: "",
        playersPresent: campaign.stats.playersCount,
        playersTotal: campaign.stats.playersCount,
      }));

    return {
      campaigns: dashboardCampaigns.map(({ activeTable: _activeTable, ...campaign }) => campaign),
      activeTables,
      alerts: [],
      recentActivity: [],
      totals: {
        campaigns: dashboardCampaigns.length,
        activeTables: activeTables.length,
        players: dashboardCampaigns.reduce((total, campaign) => total + campaign.stats.playersCount, 0),
        sessions: dashboardCampaigns.reduce((total, campaign) => total + campaign.stats.sessionsCount, 0),
        npcs: dashboardCampaigns.reduce((total, campaign) => total + campaign.stats.npcsCount, 0),
        entities: dashboardCampaigns.reduce((total, campaign) => total
          + campaign.stats.npcsCount
          + campaign.stats.locationsCount
          + campaign.stats.questsCount
          + campaign.stats.secretsCount
          + campaign.stats.cluesCount, 0),
        completedCampaigns: dashboardCampaigns.filter((campaign) => campaign.status === "completed").length,
        playtimeLast30DaysLabel: "0h",
      },
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/command-center", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const campaignId = request.params.campaignId;
    const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
    const [entities, facts, relations, sessions, clues, objectives, proposals, activity] = await Promise.all([
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
      db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
      db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId)),
      db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)),
      db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
      db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, campaignId)),
      db.select().from(schema.activityFeed).where(eq(schema.activityFeed.campaignId, campaignId)).orderBy(desc(schema.activityFeed.occurredAt)).limit(12),
    ]);
    const lastCompletedSession = sessions
      .filter((session) => session.status === "completed")
      .sort((a, b) => String(b.playedDate ?? b.createdAt).localeCompare(String(a.playedDate ?? a.createdAt)))[0] ?? null;
    const nextSession = sessions
      .filter((session) => session.status === "planned" || session.status === "live")
      .sort((a, b) => String(a.plannedDate ?? a.createdAt).localeCompare(String(b.plannedDate ?? b.createdAt)))[0] ?? null;
    const hiddenSecrets = facts.filter((fact) => fact.kind === "dm_secret" && fact.status !== "archived");
    const unresolvedClues = clues.filter((clue) => clue.status !== "revealed" && clue.status !== "archived");
    const openObjectives = objectives.filter((objective) => objective.status === "open");
    const pendingProposals = proposals.filter((proposal) => proposal.status === "submitted" || proposal.status === "draft");
    return {
      campaign,
      recap: lastCompletedSession?.recapPublic ?? lastCompletedSession?.recapDm ?? campaign?.summary ?? null,
      nextSession,
      attention: [
        ...(pendingProposals.length ? [{ type: "player_proposals", count: pendingProposals.length, label: "Player proposals pending review" }] : []),
        ...(hiddenSecrets.length ? [{ type: "hidden_secrets", count: hiddenSecrets.length, label: "DM secrets still unrevealed" }] : []),
        ...(unresolvedClues.length ? [{ type: "unresolved_clues", count: unresolvedClues.length, label: "Prepared clues not revealed yet" }] : []),
        ...(openObjectives.length ? [{ type: "open_objectives", count: openObjectives.length, label: "Open objectives" }] : []),
      ],
      counts: {
        entities: entities.length,
        facts: facts.length,
        relations: relations.length,
        sessions: sessions.length,
        clues: clues.length,
        objectives: objectives.length,
        proposals: proposals.length,
        hiddenSecrets: hiddenSecrets.length,
      },
      openObjectives: openObjectives.slice(0, 12),
      unresolvedClues: unresolvedClues.slice(0, 12),
      pendingProposals: pendingProposals.slice(0, 12),
      recentActivity: activity,
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/dashboard", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);
    return {
      campaign: projection.campaign,
      counts: {
        players: projection.players?.size ?? 0,
        entities: projection.entities?.size ?? 0,
        relations: projection.relations?.size ?? 0,
        facts: projection.facts?.size ?? 0,
        sessions: projection.sessions?.size ?? 0,
      },
      recentActivity: [],
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/what-now", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { suggestions: [], attention: [], nextSession: null };
  });
}

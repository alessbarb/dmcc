import type { FastifyInstance } from "fastify";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
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
      const [players, entities, sessions, liveTables, clues, objectives, storyThreads, storySteps, activities] = await Promise.all([
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
        db.select().from(schema.campaignStoryThreads)
          .where(and(eq(schema.campaignStoryThreads.campaignId, campaign.campaignId), isNull(schema.campaignStoryThreads.archivedAt))),
        db.select().from(schema.campaignStorySteps)
          .where(eq(schema.campaignStorySteps.campaignId, campaign.campaignId)),
        db.select().from(schema.campaignActivity)
          .where(eq(schema.campaignActivity.campaignId, campaign.campaignId))
          .orderBy(desc(schema.campaignActivity.occurredAt))
          .limit(5),
      ]);
      const metadata = campaignMetadata(campaign.metadata);
      const activeSession = sessions.find((session) => session.status === "active");
      const activeTable = liveTables[0] ?? null;
      const nextSession = sessions
        .filter((session) => session.status === "planned" && session.plannedDate)
        .sort((left, right) => String(left.plannedDate).localeCompare(String(right.plannedDate)))[0] ?? null;
      const campaignStoryThreads = storyThreads.map((thread) => {
        const steps = storySteps.filter((step) => step.threadId === thread.threadId);
        const pendingSteps = steps.filter((step) => ["planned", "ready", "active"].includes(step.status)).length;
        return {
          threadId: thread.threadId,
          campaignId: campaign.campaignId,
          title: thread.title,
          status: thread.status === "active" ? "active" as const : thread.status === "planned" ? "planned" as const : "blocked" as const,
          pendingSteps,
          plannedSessionId: steps.find((step) => step.plannedSessionId)?.plannedSessionId ?? undefined,
          href: `/campaigns/${campaign.campaignId}/sessions?threadId=${encodeURIComponent(thread.threadId)}`,
          updatedAt: thread.updatedAt,
        };
      }).filter((thread) => thread.status !== "blocked" || thread.pendingSteps > 0)
        .sort((left, right) => Number(right.status === "active") - Number(left.status === "active") || right.updatedAt.getTime() - left.updatedAt.getTime())
        .slice(0, 3);
      const involvedEntities = new Set(storySteps.flatMap((step) => step.status !== "resolved" && step.status !== "discarded" && step.sceneEntityId ? [step.sceneEntityId] : []));

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
        featuredPreparation: {
          campaignId: campaign.campaignId,
          nextSession: nextSession ? {
            sessionId: nextSession.sessionId,
            title: nextSession.title,
            scheduledAt: nextSession.plannedDate ?? undefined,
            status: "planned" as const,
          } : null,
          preparedScenes: storySteps.filter((step) => ["ready", "active", "resolved"].includes(step.status) && step.sceneEntityId).length || undefined,
          availableClues: clues.filter((clue) => clue.status === "hidden").length || undefined,
          openObjectives: objectives.filter((objective) => objective.status === "open").length || undefined,
          involvedEntities: involvedEntities.size || undefined,
        },
        storyThreads: campaignStoryThreads,
        recentActivities: activities.map((activity) => ({
          id: activity.activityId,
          type: activity.type,
          category: activity.category,
          targetType: activity.targetType,
          targetId: activity.targetId,
          time: activity.occurredAt.toISOString(),
          href: `/campaigns/${campaign.campaignId}/sessions`,
        })),
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
    const featuredCampaign = campaigns
      .slice()
      .sort((left, right) => Number(Boolean(right.stats.activeSession) || right.status === "active") - Number(Boolean(left.stats.activeSession) || left.status === "active") || String(right.updatedAt).localeCompare(String(left.updatedAt)))[0] ?? null;
    const recentActivity = campaigns
      .filter((campaign) => campaign.updatedAt)
      .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)))
      .slice(0, 3)
      .map((campaign) => ({
        id: `campaign-${campaign.campaignId}`,
        icon: "campaign" as const,
        text: campaign.title,
        time: campaign.updatedAt ?? "",
        href: `/campaigns/${campaign.campaignId}/overview`,
      }));
    const featuredPreparation = featuredCampaign?.featuredPreparation ?? null;
    const storyThreads = featuredCampaign?.storyThreads ?? [];
    const continuation = featuredCampaign ? {
      campaignId: featuredCampaign.campaignId,
      campaignTitle: featuredCampaign.title,
      destinationLabel: "Sesiones",
      href: `/campaigns/${featuredCampaign.campaignId}/sessions`,
      lastVisitedAt: featuredCampaign.updatedAt,
    } : null;

    return {
      campaigns,
      activeTables,
      alerts: [],
      recentActivity,
      nextSession,
      preparation,
      featuredPreparation,
      storyThreads,
      continuation,
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

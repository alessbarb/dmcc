import type { FastifyInstance } from "fastify";
import { desc, eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { requireCampaignRole } from "../webAccess.js";

export async function registerCommandCenterWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/command-center",
    async (request) => {
      await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      const campaignId = request.params.campaignId;
      const [campaign] = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.campaignId, campaignId))
        .limit(1);

      const [entities, facts, relations, sessions, clues, objectives, proposals, activity] =
        await Promise.all([
          db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
          db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
          db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
          db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId)),
          db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)),
          db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
          db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, campaignId)),
          db
            .select()
            .from(schema.activityFeed)
            .where(eq(schema.activityFeed.campaignId, campaignId))
            .orderBy(desc(schema.activityFeed.occurredAt))
            .limit(12),
        ]);

      const lastClosedSession =
        sessions
          .filter((session) => session.status === "closed")
          .sort((left, right) =>
            String(right.playedDate ?? right.createdAt).localeCompare(
              String(left.playedDate ?? left.createdAt),
            ),
          )[0] ?? null;
      const nextSession =
        sessions
          .filter((session) => session.status === "planned" || session.status === "active")
          .sort((left, right) =>
            String(left.plannedDate ?? left.createdAt).localeCompare(
              String(right.plannedDate ?? right.createdAt),
            ),
          )[0] ?? null;
      const hiddenSecrets = facts.filter(
        (fact) => fact.kind === "dm_secret" && fact.status !== "archived",
      );
      const unresolvedClues = clues.filter(
        (clue) => clue.status !== "revealed" && clue.status !== "archived",
      );
      const openObjectives = objectives.filter(
        (objective) => objective.status !== "completed" && objective.status !== "archived",
      );
      const pendingProposals = proposals.filter(
        (proposal) => proposal.status === "submitted" || proposal.status === "draft",
      );

      return {
        campaign,
        recap:
          lastClosedSession?.recapPublic ??
          lastClosedSession?.recapDm ??
          campaign?.summary ??
          null,
        lastSession: lastClosedSession,
        nextSession,
        attention: [
          ...(pendingProposals.length
            ? [
                {
                  type: "player_proposals",
                  count: pendingProposals.length,
                  label: "Player proposals pending review",
                },
              ]
            : []),
          ...(hiddenSecrets.length
            ? [
                {
                  type: "hidden_secrets",
                  count: hiddenSecrets.length,
                  label: "DM secrets still unrevealed",
                },
              ]
            : []),
          ...(unresolvedClues.length
            ? [
                {
                  type: "unresolved_clues",
                  count: unresolvedClues.length,
                  label: "Prepared clues not revealed yet",
                },
              ]
            : []),
          ...(openObjectives.length
            ? [
                {
                  type: "open_objectives",
                  count: openObjectives.length,
                  label: "Open objectives",
                },
              ]
            : []),
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
    },
  );
}

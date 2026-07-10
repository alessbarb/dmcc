import { randomUUID, randomInt } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { createId } from "@shared/ids.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";
import { getRequiredWebUser } from "./webSession.js";
import { campaignEventBus } from "../realtime/campaignEventBus.js";


type CampaignAccessMembership = typeof schema.campaignMemberships.$inferSelect | {
  campaignId: string;
  userId: string;
  role: "dm";
  playerId: null;
  createdAt: Date;
  revokedAt: null;
};

async function getMembership(campaignId: string, userId: string): Promise<CampaignAccessMembership | undefined> {
  const [membership] = await db
    .select()
    .from(schema.campaignMemberships)
    .where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, userId),
      isNull(schema.campaignMemberships.revokedAt),
    ))
    .limit(1);
  if (membership) return membership;

  const [ownedCampaign] = await db
    .select({ campaignId: schema.campaigns.campaignId, createdAt: schema.campaigns.createdAt })
    .from(schema.campaigns)
    .where(and(
      eq(schema.campaigns.campaignId, campaignId),
      eq(schema.campaigns.ownerId, userId),
      sql`${schema.campaigns.status} <> 'deleted'`,
    ))
    .limit(1);

  if (!ownedCampaign) return undefined;

  return {
    campaignId: ownedCampaign.campaignId,
    userId,
    role: "dm",
    playerId: null,
    createdAt: ownedCampaign.createdAt,
    revokedAt: null,
  };
}

async function requireCampaignMembership(request: FastifyRequest, campaignId: string) {
  const user = getRequiredWebUser(request);
  const membership = await getMembership(campaignId, user.userId);
  if (!membership) {
    const error = new Error("Campaign membership required");
    (error as any).statusCode = 403;
    throw error;
  }
  return { user, membership };
}

async function requireCampaignRole(request: FastifyRequest, campaignId: string, roles: string[]) {
  const context = await requireCampaignMembership(request, campaignId);
  if (!roles.includes(context.membership.role)) {
    const error = new Error("Forbidden: insufficient campaign role");
    (error as any).statusCode = 403;
    throw error;
  }
  return context;
}



export const SHORT_TABLE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortTableCode(): string {
  const pick = () => Array.from({ length: 4 }, () => SHORT_TABLE_CODE_ALPHABET[randomInt(SHORT_TABLE_CODE_ALPHABET.length)]).join("");
  return `${pick()}-${pick()}`;
}



export async function registerWebPlatformRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();
  server.get("/api/health", async () => ({ ok: true }));


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



  server.post<{ Params: { campaignId: string }; Body: { activeSessionId?: string; durationHours?: number } }>("/api/campaigns/:campaignId/live-tables", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const liveTableId = createId("live");
    const shortCode = generateShortTableCode();
    const expiresAt = new Date(Date.now() + Math.max(1, Math.min(24, request.body?.durationHours ?? 4)) * 60 * 60 * 1000);
    await db.transaction(async (tx) => {
      await tx.update(schema.liveTables).set({ status: "closed", closedAt: new Date() }).where(and(
        eq(schema.liveTables.campaignId, request.params.campaignId),
        eq(schema.liveTables.status, "active"),
      ));
      await tx.insert(schema.liveTables).values({
        liveTableId,
        campaignId: request.params.campaignId,
        activeSessionId: request.body?.activeSessionId ?? null,
        shortCode,
        status: "active",
        expiresAt,
      });
      await tx.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "live_table.opened",
        actorUserId: user.userId,
        content: { liveTableId, activeSessionId: request.body?.activeSessionId ?? null, expiresAt },
      });
    });
    campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
    reply.code(201);
    return { liveTable: { liveTableId, shortCode, expiresAt, status: "active" } };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/live-tables/current", async (request) => {
    await requireCampaignMembership(request, request.params.campaignId);
    const [liveTable] = await db.select().from(schema.liveTables).where(and(
      eq(schema.liveTables.campaignId, request.params.campaignId),
      eq(schema.liveTables.status, "active"),
    )).limit(1);
    if (!liveTable || liveTable.expiresAt < new Date()) return { liveTable: null };
    return { liveTable };
  });

  server.post<{ Params: { campaignId: string; liveTableId: string } }>("/api/campaigns/:campaignId/live-tables/:liveTableId/close", async (request) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    await db.update(schema.liveTables).set({ status: "closed", closedAt: new Date() }).where(and(
      eq(schema.liveTables.campaignId, request.params.campaignId),
      eq(schema.liveTables.liveTableId, request.params.liveTableId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "live_table.closed",
      actorUserId: user.userId,
      content: { liveTableId: request.params.liveTableId },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
    return { ok: true };
  });

  server.post<{ Params: { code: string } }>("/api/live-tables/:code/join", async (request, reply) => {
    const user = getRequiredWebUser(request);
    const [liveTable] = await db.select().from(schema.liveTables).where(and(
      eq(schema.liveTables.shortCode, request.params.code.toUpperCase()),
      eq(schema.liveTables.status, "active"),
    )).limit(1);
    if (!liveTable || liveTable.expiresAt < new Date()) {
      reply.code(404);
      return { error: "Live table code is invalid or expired" };
    }
    const membership = await getMembership(liveTable.campaignId, user.userId);
    if (!membership) {
      reply.code(403);
      return { error: "Campaign invitation must be accepted before joining live table" };
    }
    return { ok: true, campaignId: liveTable.campaignId, liveTableId: liveTable.liveTableId, playerPortalPath: `/player/campaigns/${liveTable.campaignId}/home` };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/events/stream", async (request, reply) => {
    await requireCampaignMembership(request, request.params.campaignId);
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    const listenerId = randomUUID();
    const listener = (event: any) => {
      reply.raw.write(`event: ${event.type}\n`);
      reply.raw.write(`data: ${JSON.stringify({ type: event.type, sequence: event.sequence })}\n\n`);
    };
    campaignEventBus.subscribe(request.params.campaignId, listenerId, listener);
    request.raw.on("close", () => campaignEventBus.unsubscribe(request.params.campaignId, listenerId));
  });

  const gone = async (_request: FastifyRequest, reply: any) => {
    reply.code(410);
    return { error: "Legacy vault/LAN/token API removed in PostgreSQL web mode" };
  };
  server.all("/api/vaults/*", gone);
  server.all("/api/join/:campaignId", gone);
  server.all("/api/campaigns/:campaignId/rejoin", gone);
  server.all("/api/campaigns/:campaignId/register", gone);
  server.all("/api/auth/local-token", gone);
}

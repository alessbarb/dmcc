import { randomUUID, randomInt } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { createId } from "@shared/ids.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";
import {
  getRequiredWebUser,
  hashOpaque,
  issueOpaqueToken,
  type WebUser,
} from "./webSession.js";
import { campaignEventBus } from "../realtime/campaignEventBus.js";

function isDmRole(role?: string | null): boolean {
  return role === "dm" || role === "co_dm";
}

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

async function requireCampaignOwner(request: FastifyRequest, campaignId: string) {
  const context = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const [campaign] = await db
    .select({ ownerId: schema.campaigns.ownerId })
    .from(schema.campaigns)
    .where(eq(schema.campaigns.campaignId, campaignId))
    .limit(1);
  if (!campaign || campaign.ownerId !== context.user.userId) {
    const error = new Error("Forbidden: campaign owner required");
    (error as any).statusCode = 403;
    throw error;
  }
  return context;
}

function makeInviteUrl(request: FastifyRequest, token: string): string {
  const origin = process.env.DMCC_PUBLIC_ORIGIN ?? `${request.protocol}://${request.headers.host}`;
  return `${origin.replace(/\/$/, "")}/join/${token}`;
}

export const SHORT_TABLE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortTableCode(): string {
  const pick = () => Array.from({ length: 4 }, () => SHORT_TABLE_CODE_ALPHABET[randomInt(SHORT_TABLE_CODE_ALPHABET.length)]).join("");
  return `${pick()}-${pick()}`;
}

async function playerProfileFor(userId: string, campaignId: string) {
  const [profile] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.userId, userId),
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  return profile;
}

async function acceptInvitation(token: string, user: WebUser) {
  const tokenHash = hashOpaque(token);
  return db.transaction(async (tx) => {
    const [invitation] = await tx
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.tokenHash, tokenHash))
      .limit(1);
    if (!invitation || invitation.revokedAt || invitation.expiresAt < new Date()) {
      const error = new Error("Invitation is invalid or expired");
      (error as any).statusCode = 404;
      throw error;
    }

    const [existingMembership] = await tx
      .select()
      .from(schema.campaignMemberships)
      .where(and(
        eq(schema.campaignMemberships.campaignId, invitation.campaignId),
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
      ))
      .limit(1);
    if (existingMembership) {
      return { campaignId: invitation.campaignId, membership: existingMembership, alreadyAccepted: true };
    }

    if (invitation.usesCount >= invitation.maxUses) {
      const error = new Error("Invitation has no remaining uses");
      (error as any).statusCode = 409;
      throw error;
    }

    let playerId: string | null = null;
    if (invitation.role === "player") {
      playerId = createId("ply");
      await tx.insert(schema.playerProfiles).values({
        profileId: playerId,
        campaignId: invitation.campaignId,
        userId: user.userId,
        displayName: user.displayName,
        status: "active",
      });
    }

    const membership = {
      campaignId: invitation.campaignId,
      userId: user.userId,
      role: invitation.role,
      playerId,
      createdAt: new Date(),
    };
    await tx.insert(schema.campaignMemberships).values(membership);
    await tx.update(schema.campaignInvitations).set({ usesCount: invitation.usesCount + 1 }).where(eq(schema.campaignInvitations.invitationId, invitation.invitationId));
    await tx.insert(schema.campaignInvitationAcceptances).values({
      acceptanceId: createId("acc"),
      invitationId: invitation.invitationId,
      userId: user.userId,
      acceptedAt: new Date(),
    });
    await tx.insert(schema.activityFeed).values({
      campaignId: invitation.campaignId,
      activityId: createId("act"),
      type: "invitation.accepted",
      actorUserId: user.userId,
      content: { role: invitation.role, playerId },
    });
    return { campaignId: invitation.campaignId, membership, alreadyAccepted: false };
  });
}


function sqlRows<T = any>(result: unknown): T[] {
  const value = result as any;
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray(value?.rows)) return value.rows as T[];
  return [];
}


function sanitizeSearchQuery(raw?: string): string {
  return (raw ?? "").trim().slice(0, 120);
}

async function runDmSearch(campaignId: string, query: string) {
  const like = `%${query}%`;
  const result = await db.execute(sql`
    SELECT 'entity' AS type, entity_id AS id, name AS title, public_summary AS summary, dm_summary AS dm_summary, 'dm' AS visibility
      FROM campaign_entities
      WHERE campaign_id = ${campaignId} AND (name ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'fact' AS type, fact_id AS id, kind AS title, content_public AS summary, content_dm AS dm_summary, kind AS visibility
      FROM campaign_facts
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (content_public ILIKE ${like} OR content_dm ILIKE ${like})
    UNION ALL
    SELECT 'relation' AS type, relation_id AS id, type AS title, public_summary AS summary, dm_summary AS dm_summary, visibility
      FROM campaign_relations
      WHERE campaign_id = ${campaignId} AND (type ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, dm_summary AS dm_summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, NULL AS dm_summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR description ILIKE ${like})
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      dmSummary: row.dm_summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}

async function runPlayerSearch(campaignId: string, user: WebUser, query: string) {
  const like = `%${query}%`;
  const profile = await playerProfileFor(user.userId, campaignId);
  const playerId = profile?.profileId ?? "";
  const result = await db.execute(sql`
    SELECT 'entity' AS type, e.entity_id AS id, e.name AS title, e.public_summary AS summary, g.scope AS visibility
      FROM campaign_entities e
      JOIN visibility_grants g
        ON g.campaign_id = e.campaign_id
       AND g.target_type = 'entity'
       AND g.target_id = e.entity_id
      WHERE e.campaign_id = ${campaignId}
        AND (e.name ILIKE ${like} OR e.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'fact' AS type, f.fact_id AS id, f.kind AS title, f.content_public AS summary, g.scope AS visibility
      FROM campaign_facts f
      JOIN visibility_grants g
        ON g.campaign_id = f.campaign_id
       AND g.target_type = 'fact'
       AND g.target_id = f.fact_id
      WHERE f.campaign_id = ${campaignId}
        AND f.status <> 'archived'
        AND f.kind <> 'dm_secret'
        AND f.content_public ILIKE ${like}
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'relation' AS type, r.relation_id AS id, r.type AS title, r.public_summary AS summary, g.scope AS visibility
      FROM campaign_relations r
      JOIN visibility_grants g
        ON g.campaign_id = r.campaign_id
       AND g.target_type = 'relation'
       AND g.target_id = r.relation_id
      WHERE r.campaign_id = ${campaignId}
        AND (r.type ILIKE ${like} OR r.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND visibility_scope <> 'dm_only'
        AND (title ILIKE ${like} OR public_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND (title ILIKE ${like} OR description ILIKE ${like})
        AND (visibility_scope IN ('public', 'all_players') OR player_id = ${playerId})
    UNION ALL
    SELECT 'note' AS type, note_id AS id, split_part(content, E'\n', 1) AS title, content AS summary, visibility_scope AS visibility
      FROM campaign_notes
      WHERE campaign_id = ${campaignId}
        AND author_user_id = ${user.userId}
        AND content ILIKE ${like}
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}


export async function registerWebPlatformRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();
  server.get("/api/health", async () => ({ ok: true }));

  server.get("/api/player/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
        sql`${schema.campaigns.status} <> 'deleted'`,
      ));
    return { campaigns: rows
      .filter((row) => row.membership.role === "player" || isDmRole(row.membership.role))
      .map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId })) };
  });

  server.post<{ Params: { campaignId: string }; Body: { command?: any } & Record<string, any> }>("/api/campaigns/:campaignId/commands", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandId = request.headers["idempotency-key"];
    if (!commandId || Array.isArray(commandId)) {
      reply.code(400);
      return { error: "Idempotency-Key header is required" };
    }
    const command = request.body.command ?? request.body;
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      }, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: any) {
      if (error.name === "CommandConflictError" || /Conflict/.test(error.message)) {
        reply.code(409);
        return { error: error.message };
      }
      reply.code(error.statusCode ?? 500);
      return { error: error.message ?? "Command failed" };
    }
  });


  async function executeDmCommand(request: FastifyRequest<{ Params: { campaignId: string }; Body?: any }>, reply: any, command: Record<string, any>) {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandIdHeader = request.headers["idempotency-key"];
    const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      } as any, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: any) {
      if (error.name === "CommandConflictError" || /Conflict/.test(error.message)) {
        reply.code(409);
        return { error: error.message };
      }
      reply.code(error.statusCode ?? 500);
      return { error: error.message ?? "Command failed" };
    }
  }

  server.patch<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateCampaign", ...((request.body ?? {}) as any) });
  });

  server.delete<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request, _reply) => {
    await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaigns).set({ status: "deleted", updatedAt: new Date() }).where(eq(schema.campaigns.campaignId, request.params.campaignId));
    return { ok: true };
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

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/graph", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const entities = await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId));
    const relations = await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId));
    return { entities, relations };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/timeline", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const sessions = await db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, request.params.campaignId));
    return { sessions, events: [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/visibility", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, request.params.campaignId));
    return { grants };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/lan-status", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { enabled: false, mode: "web_invitations", message: "LAN mode has been replaced by web invitations." };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/players", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const profiles = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, request.params.campaignId));
    return profiles.map((profile) => ({
      playerId: profile.profileId,
      displayName: profile.displayName,
      email: null,
      isActive: profile.status === "active",
      linkedCharacterEntityId: profile.linkedCharacterId,
    }));
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/entities", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { entities: await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/facts", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { facts: await db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/relations", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { relations: await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/clues", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { clues: await db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/objectives", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { objectives: await db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/activity", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { activity: await db.select().from(schema.activityFeed).where(eq(schema.activityFeed.campaignId, request.params.campaignId)).orderBy(desc(schema.activityFeed.occurredAt)).limit(100) };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/entities", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateEntity", ...((request.body ?? {}) as any) });
  });
  server.patch<{ Params: { campaignId: string; entityId: string }; Body: any }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateEntity", entityId: request.params.entityId, ...((request.body ?? {}) as any) });
  });
  server.delete<{ Params: { campaignId: string; entityId: string } }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveEntity", entityId: request.params.entityId });
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/relations", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateRelation", ...((request.body ?? {}) as any) });
  });
  server.put<{ Params: { campaignId: string; relationId: string }; Body: any }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateRelation", relationId: request.params.relationId, ...((request.body ?? {}) as any) });
  });
  server.delete<{ Params: { campaignId: string; relationId: string } }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveRelation", relationId: request.params.relationId });
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/facts", async (request, reply) => {
    const body = (request.body ?? {}) as any;
    return executeDmCommand(request, reply, {
      type: "RecordFact",
      factId: body.factId,
      statement: body.statement ?? body.content ?? "",
      kind: body.kind ?? "canon",
      confidence: body.confidence ?? "confirmed",
      visibility: body.visibility ?? (body.kind === "dm_secret" ? { kind: "dm_only" } : { kind: "party" }),
      relatedEntityIds: body.relatedEntityIds ?? (body.subjectEntityId ? [body.subjectEntityId] : []),
      relatedRelationIds: body.relatedRelationIds ?? [],
      source: body.source ?? { kind: "manual" },
    });
  });
  server.put<{ Params: { campaignId: string; factId: string }; Body: any }>("/api/campaigns/:campaignId/facts/:factId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateFact", factId: request.params.factId, ...((request.body ?? {}) as any) });
  });


  server.post<{ Params: { campaignId: string }; Body: { role?: string; maxUses?: number; expiresInHours?: number; label?: string } }>("/api/campaigns/:campaignId/invitations", async (request, reply) => {
    const { user } = await requireCampaignOwner(request, request.params.campaignId);
    const token = issueOpaqueToken("inv");
    const invitationId = createId("inv");
    const expiresAt = new Date(Date.now() + (request.body?.expiresInHours ?? 168) * 60 * 60 * 1000);
    await db.insert(schema.campaignInvitations).values({
      invitationId,
      campaignId: request.params.campaignId,
      tokenHash: hashOpaque(token),
      role: request.body?.role ?? "player",
      maxUses: request.body?.maxUses ?? 1,
      usesCount: 0,
      expiresAt,
      createdBy: user.userId,
    });
    reply.code(201);
    return { invitation: { invitationId, url: makeInviteUrl(request, token), token, expiresAt } };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/invitations", async (request) => {
    await requireCampaignOwner(request, request.params.campaignId);
    const invitations = await db
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.campaignId, request.params.campaignId))
      .orderBy(desc(schema.campaignInvitations.createdAt));
    return {
      invitations: invitations.map((invitation) => ({
        invitationId: invitation.invitationId,
        role: invitation.role,
        maxUses: invitation.maxUses,
        usesCount: invitation.usesCount,
        expiresAt: invitation.expiresAt,
        revokedAt: invitation.revokedAt,
        createdAt: invitation.createdAt,
        status: invitation.revokedAt ? "revoked" : invitation.expiresAt < new Date() ? "expired" : invitation.usesCount >= invitation.maxUses ? "exhausted" : "active",
      })),
    };
  });

  server.post<{ Params: { campaignId: string; invitationId: string } }>("/api/campaigns/:campaignId/invitations/:invitationId/revoke", async (request) => {
    const { user } = await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaignInvitations).set({ revokedAt: new Date() }).where(and(
      eq(schema.campaignInvitations.campaignId, request.params.campaignId),
      eq(schema.campaignInvitations.invitationId, request.params.invitationId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "invitation.revoked",
      actorUserId: user.userId,
      content: { invitationId: request.params.invitationId },
    });
    return { ok: true };
  });

  server.get<{ Params: { token: string } }>("/api/invitations/:token", async (request, reply) => {
    const tokenHash = hashOpaque(request.params.token);
    const [row] = await db
      .select({ invitation: schema.campaignInvitations, campaign: schema.campaigns })
      .from(schema.campaignInvitations)
      .innerJoin(schema.campaigns, eq(schema.campaignInvitations.campaignId, schema.campaigns.campaignId))
      .where(eq(schema.campaignInvitations.tokenHash, tokenHash))
      .limit(1);
    if (!row || row.invitation.revokedAt || row.invitation.expiresAt < new Date()) {
      reply.code(404);
      return { error: "Invitation not found" };
    }
    return { campaign: { campaignId: row.campaign.campaignId, title: row.campaign.title, summary: row.campaign.summary }, role: row.invitation.role };
  });

  server.post<{ Params: { token: string } }>("/api/invitations/:token/accept", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
    if (!user) { reply.code(401); return { error: "AUTH_REQUIRED" }; }
    const result = await acceptInvitation(request.params.token, user);
    campaignEventBus.publish(result.campaignId, { type: "invitation.accepted" });
    return { ok: true, campaignId: result.campaignId, playerPortalPath: `/player/campaigns/${result.campaignId}` };
  });



  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: isDmRole(membership.role)
      ? await runDmSearch(request.params.campaignId, query)
      : await runPlayerSearch(request.params.campaignId, user, query) };
  });

  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/player/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: await runPlayerSearch(request.params.campaignId, user, query) };
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

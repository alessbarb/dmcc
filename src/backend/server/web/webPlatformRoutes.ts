import { randomUUID } from "node:crypto";
import argon2 from "argon2";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { createId, generateCampaignId } from "@shared/ids.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";
import {
  clearWebSessionCookie,
  createWebSession,
  getRequiredWebUser,
  hashOpaque,
  issueOpaqueToken,
  normalizeEmail,
  publicWebUser,
  revokeCurrentWebSession,
  setWebSessionCookie,
  type WebUser,
} from "./webSession.js";
import { campaignEventBus } from "../realtime/campaignEventBus.js";
import { getPremadeCampaignTemplate, listPremadeCampaignTemplates } from "../premade/premadeCampaigns.js";

function requireBodyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    const error = new Error(`${field} is required`);
    (error as any).statusCode = 400;
    throw error;
  }
  return value.trim();
}

function isDmRole(role?: string | null): boolean {
  return role === "dm" || role === "co_dm";
}

async function ensureDefaultWorkspace(user: WebUser): Promise<string> {
  const existing = await db
    .select({ workspaceId: schema.workspaceMemberships.workspaceId })
    .from(schema.workspaceMemberships)
    .where(eq(schema.workspaceMemberships.userId, user.userId))
    .limit(1);
  if (existing[0]) return existing[0].workspaceId;

  const workspaceId = createId("wks");
  await db.transaction(async (tx) => {
    await tx.insert(schema.workspaces).values({
      workspaceId,
      name: `${user.displayName}'s workspace`,
      ownerId: user.userId,
    });
    await tx.insert(schema.workspaceMemberships).values({
      workspaceId,
      userId: user.userId,
      role: "owner",
    });
  });
  return workspaceId;
}

async function getMembership(campaignId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(schema.campaignMemberships)
    .where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, userId),
      isNull(schema.campaignMemberships.revokedAt),
    ))
    .limit(1);
  return membership;
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

function makeInviteUrl(request: FastifyRequest, token: string): string {
  const origin = process.env.DMCC_PUBLIC_ORIGIN ?? `${request.protocol}://${request.headers.host}`;
  return `${origin.replace(/\/$/, "")}/join/${token}`;
}

function generateShortTableCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
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

function sanitizeObject(value: any): any {
  if (Array.isArray(value)) return value.map(sanitizeObject).filter((item) => item !== undefined);
  if (!value || typeof value !== "object") return value;
  const visibility = value.visibility?.kind ?? value.visibility?.mode ?? value.visibility ?? value.visibilityScope;
  const kind = value.kind;
  if (visibility === "dm_only" || visibility === "dm" || kind === "dm_secret") return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (/^dm|secret/i.test(key) || key === "contentDm") continue;
    const sanitized = sanitizeObject(child);
    if (sanitized !== undefined) result[key] = sanitized;
  }
  return result;
}

function toPortalEntity(entity: typeof schema.campaignEntities.$inferSelect) {
  return {
    entityId: entity.entityId,
    entityType: entity.type,
    typeLabel: entity.type,
    title: entity.name,
    summary: entity.publicSummary ?? undefined,
    status: entity.status,
    importance: entity.importance,
  };
}

function groupPortalEntities(entities: Array<typeof schema.campaignEntities.$inferSelect>) {
  const groups: Record<string, any[]> = {};
  const groupFor = (type: string) => {
    if (["npc", "creature"].includes(type)) return "npcs";
    if (["location", "place"].includes(type)) return "locations";
    if (["quest", "front", "clock"].includes(type)) return "quests";
    if (["clue", "rumor", "secret"].includes(type)) return "clues";
    if (["item", "object"].includes(type)) return "items";
    if (["faction"].includes(type)) return "factions";
    if (["player_character"].includes(type)) return "characters";
    return "other";
  };
  for (const entity of entities) {
    const key = groupFor(entity.type);
    groups[key] ??= [];
    groups[key].push(toPortalEntity(entity));
  }
  return groups;
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

async function buildPlayerPortal(campaignId: string, user: WebUser) {
  const profile = await playerProfileFor(user.userId, campaignId);
  const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
  const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId));
  const allowed = (targetType: string, targetId: string) => grants.some((grant) =>
    grant.targetType === targetType &&
    grant.targetId === targetId &&
    (
      grant.scope === "public" ||
      grant.scope === "all_players" ||
      (grant.scope === "specific_user" && grant.userId === user.userId) ||
      (grant.scope === "specific_player" && profile && grant.playerId === profile.profileId)
    )
  );

  const entities = (await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)))
    .filter((entity) => allowed("entity", entity.entityId));
  const facts = (await db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)))
    .filter((fact) => allowed("fact", fact.factId) && fact.kind !== "dm_secret");
  const relations = (await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)))
    .filter((relation) => allowed("relation", relation.relationId));
  const notes = await db
    .select()
    .from(schema.campaignNotes)
    .where(and(eq(schema.campaignNotes.campaignId, campaignId), eq(schema.campaignNotes.authorUserId, user.userId)));
  const proposals = await db
    .select()
    .from(schema.playerProposals)
    .where(and(eq(schema.playerProposals.campaignId, campaignId), eq(schema.playerProposals.userId, user.userId)));
  const objectives = (await db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)))
    .filter((objective) => objective.status !== "archived" && (
      objective.visibilityScope === "public" ||
      objective.visibilityScope === "all_players" ||
      (profile && objective.playerId === profile.profileId)
    ));
  const clues = (await db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)))
    .filter((clue) => clue.status !== "archived" && clue.visibilityScope !== "dm_only");

  const safeEntities = entities.map(toPortalEntity);
  const safeFacts = facts.map((fact) => ({
    factId: fact.factId,
    statement: fact.contentPublic ?? "",
    kind: fact.kind,
    confidence: fact.confidence,
  })).filter((fact) => fact.statement.length > 0);
  const safeRelations = relations.map((relation) => ({
    relationId: relation.relationId,
    label: relation.type,
    description: relation.publicSummary ?? undefined,
    sourceEntityId: relation.sourceEntityId,
    targetEntityId: relation.targetEntityId,
  }));
  const linkedCharacter = profile?.linkedCharacterId
    ? safeEntities.find((entity) => entity.entityId === profile.linkedCharacterId) ?? null
    : null;

  return sanitizeObject({
    campaign: campaign ? {
      campaignId: campaign.campaignId,
      title: campaign.title,
      summary: campaign.summary,
      status: campaign.status,
    } : { campaignId },
    playerId: profile?.profileId ?? null,
    player: profile ? { playerId: profile.profileId, displayName: profile.displayName } : null,
    playerProfile: profile,
    link: profile?.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
    linkedCharacter,
    availableCharacters: safeEntities.filter((entity) => entity.entityType === "player_character"),
    sheet: { status: {}, resources: [] },
    notes: notes.map((note) => ({
      noteId: note.noteId,
      title: note.content.slice(0, 80),
      content: note.content,
      visibility: note.visibilityScope,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })),
    objectives: objectives.map((objective) => ({
      objectiveId: objective.objectiveId,
      title: objective.title,
      description: objective.description ?? undefined,
      kind: objective.kind,
      status: objective.status,
      visibility: objective.visibilityScope,
      linkedEntityIds: objective.linkedEntityIds,
      playerId: objective.playerId,
    })),
    proposals,
    memory: {
      entities: groupPortalEntities(entities),
      facts: safeFacts,
      relations: safeRelations,
      history: [],
      activeThreads: {
        quests: safeEntities.filter((entity) => entity.entityType === "quest"),
        cluesAndRumors: [
          ...safeEntities.filter((entity) => ["clue", "rumor"].includes(entity.entityType)),
          ...clues.map((clue) => ({
            entityId: clue.entityId ?? clue.clueId,
            title: clue.title,
            summary: clue.publicSummary ?? undefined,
            status: clue.status,
            entityType: "clue",
          })),
        ],
      },
      counts: {
        visibleEntities: safeEntities.length,
        facts: safeFacts.length,
        relations: safeRelations.length,
        objectives: objectives.length,
        clues: clues.length,
        historyEntries: 0,
      },
    },
    entities: safeEntities,
    facts: safeFacts,
    relations: safeRelations,
    clues: clues.map((clue) => ({
      clueId: clue.clueId,
      entityId: clue.entityId,
      title: clue.title,
      summary: clue.publicSummary ?? undefined,
      status: clue.status,
    })),
  });
}

export async function registerWebPlatformRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();

  server.get("/api/health", async () => ({ ok: true, app: "dmcc-web", storage: "postgres" }));

  server.post<{ Body: { email?: string; password?: string; displayName?: string } }>("/api/auth/register", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const password = requireBodyString(request.body?.password, "password");
    if (password.length < 8) {
      reply.code(400);
      return { error: "Password must have at least 8 characters" };
    }
    const displayName = request.body?.displayName?.trim() || email.split("@")[0];
    const existing = await db.select().from(schema.users).where(eq(schema.users.emailNormalized, email)).limit(1);
    if (existing[0]) {
      reply.code(409);
      return { error: "Email already registered" };
    }

    const userId = createId("usr");
    await db.transaction(async (tx) => {
      await tx.insert(schema.users).values({
        userId,
        emailNormalized: email,
        emailHash: hashOpaque(email),
        displayName,
        passwordHash: await argon2.hash(password),
        passwordSalt: "argon2id",
        passwordAlgorithm: "argon2id",
        vaultRole: "user",
      });
      const workspaceId = createId("wks");
      await tx.insert(schema.workspaces).values({ workspaceId, name: `${displayName}'s workspace`, ownerId: userId });
      await tx.insert(schema.workspaceMemberships).values({ workspaceId, userId, role: "owner" });
    });
    const [createdUser] = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
    const session = await createWebSession(userId);
    setWebSessionCookie(reply, session.token, session.expiresAt);
    reply.code(201);
    return { user: publicWebUser(createdUser) };
  });

  server.post<{ Body: { email?: string; password?: string } }>("/api/auth/login", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const password = requireBodyString(request.body?.password, "password");
    const [user] = await db.select().from(schema.users).where(eq(schema.users.emailNormalized, email)).limit(1);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      reply.code(401);
      return { error: "Invalid email or password" };
    }
    const session = await createWebSession(user.userId);
    setWebSessionCookie(reply, session.token, session.expiresAt);
    return { user: publicWebUser(user) };
  });

  server.post("/api/auth/logout", async (request, reply) => {
    await revokeCurrentWebSession(request);
    clearWebSessionCookie(reply);
    return { ok: true };
  });

  server.get("/api/me", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
    if (!user) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    const campaigns = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(eq(schema.campaignMemberships.userId, user.userId), isNull(schema.campaignMemberships.revokedAt)));
    return { user, campaigns: campaigns.map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId })) };
  });

  server.get("/api/me/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(eq(schema.campaignMemberships.userId, user.userId), isNull(schema.campaignMemberships.revokedAt)));
    return { campaigns: rows.map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId })) };
  });

  server.get("/api/player/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
      ));
    return { campaigns: rows
      .filter((row) => row.membership.role === "player" || isDmRole(row.membership.role))
      .map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId })) };
  });

  server.get("/api/auth/session", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
    if (!user) { reply.code(401); return { error: "Authentication required" }; }
    return { user };
  });

  server.get("/api/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(eq(schema.campaignMemberships.userId, user.userId), isNull(schema.campaignMemberships.revokedAt)));
    return rows.map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId }));
  });

  server.post<{ Body: { title?: string; system?: string; summary?: string; campaignId?: string } }>("/api/campaigns", async (request, reply) => {
    const user = getRequiredWebUser(request);
    const title = requireBodyString(request.body?.title, "title");
    const campaignId = request.body?.campaignId ?? createId("cmp");
    const workspaceId = await ensureDefaultWorkspace(user);
    const commandId = String(request.headers["idempotency-key"] ?? randomUUID());

    await db.transaction(async (tx) => {
      await tx.insert(schema.campaigns).values({
        campaignId,
        workspaceId,
        title,
        summary: request.body?.summary ?? null,
        status: "active",
        metadata: { system: request.body?.system ?? "generic_fantasy_d20" },
      });
      await tx.insert(schema.campaignMemberships).values({ campaignId, userId: user.userId, role: "dm", playerId: null });
    });

    const projection = await repo.executeCommand(campaignId, {
      type: "CreateCampaign",
      campaignId,
      actorId: user.userId,
      title,
      summary: request.body?.summary,
      system: request.body?.system ?? "generic_fantasy_d20",
      settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
    }, { commandId, actorUserId: user.userId });

    reply.code(201);
    return { campaignId, campaign: projection.campaign };
  });



  server.get<{ Querystring: { locale?: string } }>("/api/premade-campaigns", async (request) => {
    getRequiredWebUser(request);
    return { schemaVersion: 2, templates: listPremadeCampaignTemplates(request.query.locale) };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>("/api/premade-campaigns/:templateId", async (request, reply) => {
    getRequiredWebUser(request);
    const template = getPremadeCampaignTemplate(request.params.templateId, request.query.locale);
    if (!template) { reply.code(404); return { error: "Premade campaign template not found" }; }
    return template;
  });

  server.post<{ Params: { templateId: string }; Body: { title?: string; summary?: string; campaignId?: string; importMode?: "full" | "structure" | "sessions"; locale?: string } }>(
    "/api/premade-campaigns/:templateId/import",
    async (request, reply) => {
      const user = getRequiredWebUser(request);
      const template = getPremadeCampaignTemplate(request.params.templateId, request.body?.locale);
      if (!template) { reply.code(404); return { error: "Premade campaign template not found" }; }

      const importMode = ["full", "structure", "sessions"].includes(request.body?.importMode ?? "")
        ? request.body!.importMode!
        : "full";
      const campaignId = request.body?.campaignId?.trim() && /^[a-zA-Z0-9_-]+$/.test(request.body.campaignId)
        ? request.body.campaignId.trim()
        : generateCampaignId();
      const title = request.body?.title?.trim() || template.title;
      const workspaceId = await ensureDefaultWorkspace(user);
      const summary = request.body?.summary?.trim() || template.summary;
      const importMetadata = {
        createdFromTemplateId: template.templateId,
        createdFromTemplateVersion: template.version,
        createdFromTemplateTitle: template.title,
        createdFromTemplateAt: new Date().toISOString(),
        importedByUserId: user.userId,
        importMode,
        templateLocale: template.locale,
        templateSystem: template.system,
        templateDifficulty: template.difficulty,
        templateTags: template.tags,
      };

      const shouldImportEntities = importMode === "full" || importMode === "structure" || importMode === "sessions";
      const shouldImportRelations = importMode === "full" || importMode === "structure";
      const shouldImportFacts = importMode === "full";
      const shouldImportSessions = importMode === "full" || importMode === "sessions";
      const shouldImportCanvases = importMode === "full" || importMode === "structure";

      try {
        await db.transaction(async (tx) => {
          await tx.insert(schema.campaigns).values({
            campaignId,
            workspaceId,
            title,
            summary,
            status: "active",
            metadata: { system: template.system, ...importMetadata },
          });
          await tx.insert(schema.campaignMemberships).values({ campaignId, userId: user.userId, role: "dm", playerId: null });
        });

        const commandOptions = (label: string) => ({ commandId: `${request.headers["idempotency-key"] ?? createId("cmd")}:${label}`, actorUserId: user.userId });
        await repo.executeCommand(campaignId, {
          type: "CreateCampaign",
          campaignId,
          actorId: user.userId,
          title,
          summary: `${summary}\n\nCreada desde la campaña de ejemplo ${template.title} v${template.version}.`,
          system: template.system,
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
          metadata: importMetadata,
        }, commandOptions("campaign"));

        if (shouldImportEntities) {
          let index = 0;
          for (const entity of template.entities) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateEntity",
              campaignId,
              actorId: user.userId,
              entityId: entity.entityId,
              entityType: entity.entityType,
              title: entity.title,
              subtitle: entity.subtitle,
              summary: entity.summary,
              content: entity.content,
              status: entity.status,
              importance: entity.importance,
              visibility: (entity.visibility ?? { kind: "dm_only" }) as any,
              metadata: { ...(entity.metadata ?? {}), createdFromTemplateId: template.templateId, createdFromTemplateVersion: template.version },
            }, commandOptions(`entity:${index}:${entity.entityId}`));
          }
        }

        if (shouldImportRelations) {
          let index = 0;
          for (const relation of template.relations) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateRelation",
              campaignId,
              actorId: user.userId,
              relationId: relation.relationId,
              sourceEntityId: relation.sourceEntityId,
              targetEntityId: relation.targetEntityId,
              relationType: relation.relationType as any,
              description: relation.description,
              visibility: (relation.visibility ?? { kind: "dm_only" }) as any,
              allowDuplicate: true,
            }, commandOptions(`relation:${index}:${relation.relationId}`));
          }
        }

        if (shouldImportFacts) {
          let index = 0;
          for (const fact of template.facts) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "RecordFact",
              campaignId,
              actorId: user.userId,
              factId: fact.factId,
              statement: fact.statement,
              kind: fact.kind,
              confidence: fact.confidence,
              visibility: (fact.visibility ?? { kind: "dm_only" }) as any,
              relatedEntityIds: fact.relatedEntityIds ?? [],
              relatedRelationIds: [],
              source: { kind: "import", importId: `premade:${template.templateId}`, sourcePath: `premade/${template.templateId}@${template.version}` },
            }, commandOptions(`fact:${index}:${fact.factId}`));
          }
        }

        if (shouldImportSessions) {
          let index = 0;
          for (const session of template.sessions) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreatePreparedSession",
              campaignId,
              actorId: user.userId,
              sessionId: session.sessionId,
              title: session.title,
              scheduledAt: session.scheduledAt,
              prep: session.prep,
            }, commandOptions(`session:${index}:${session.sessionId}`));
          }
        }

        if (shouldImportCanvases) {
          let canvasIndex = 0;
          for (const canvas of template.canvases) {
            canvasIndex += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateCanvas",
              campaignId,
              actorId: user.userId,
              canvasId: canvas.canvasId,
              title: canvas.title,
              kind: canvas.kind,
              description: canvas.description,
            }, commandOptions(`canvas:${canvasIndex}:${canvas.canvasId}`));

            let nodeIndex = 0;
            for (const node of canvas.nodes ?? []) {
              nodeIndex += 1;
              await repo.executeCommand(campaignId, { type: "PlaceNodeOnCanvas", campaignId, actorId: user.userId, canvasId: canvas.canvasId, node }, commandOptions(`canvas-node:${canvas.canvasId}:${nodeIndex}`));
            }
            let edgeIndex = 0;
            for (const edge of canvas.edges ?? []) {
              edgeIndex += 1;
              await repo.executeCommand(campaignId, { type: "AddEdgeToCanvas", campaignId, actorId: user.userId, canvasId: canvas.canvasId, edge }, commandOptions(`canvas-edge:${canvas.canvasId}:${edgeIndex}`));
            }
          }
        }

        await repo.executeCommand(campaignId, {
          type: "RecordImport",
          campaignId,
          actorId: user.userId,
          importId: createId("imp"),
          format: `premade:${template.templateId}@${template.version}`,
          count: (shouldImportEntities ? template.entities.length : 0)
            + (shouldImportRelations ? template.relations.length : 0)
            + (shouldImportFacts ? template.facts.length : 0)
            + (shouldImportSessions ? template.sessions.length : 0)
            + (shouldImportCanvases ? template.canvases.length : 0),
        }, commandOptions("import-record"));

        campaignEventBus.publish(campaignId, { type: "projection.updated" });
        reply.code(201);
        return { ok: true, campaignId, title, templateId: template.templateId, templateVersion: template.version, importMode, metadata: importMetadata };
      } catch (error: any) {
        await db.delete(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, campaignId)).catch(() => undefined);
        await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).catch(() => undefined);
        reply.code(error.statusCode ?? 500);
        return { error: `Failed to import premade campaign: ${error?.message ?? "unknown error"}` };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request) => {
    const { membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (isDmRole(membership.role)) {
      const projection = await repo.getCampaignState(request.params.campaignId);
      return projection;
    }
    return buildPlayerPortal(request.params.campaignId, getRequiredWebUser(request));
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/projection", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return repo.getCampaignState(request.params.campaignId);
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
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
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
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
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

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    return buildPlayerPortal(request.params.campaignId, user);
  });


  async function readPlayerPortalForRequest(request: FastifyRequest<{ Params: { campaignId: string } }>) {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    return buildPlayerPortal(request.params.campaignId, user) as Promise<any>;
  }

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/home", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return {
      campaign: portal.campaign,
      player: portal.player,
      recap: portal.recap ?? portal.campaign?.summary ?? null,
      objectives: portal.objectives ?? [],
      memoryCounts: portal.memory?.counts ?? {},
      notifications: [],
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/memory", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return portal.memory;
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/character", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { player: portal.player, linkedCharacter: portal.linkedCharacter, sheet: portal.sheet, availableCharacters: portal.availableCharacters };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/objectives", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { objectives: portal.objectives ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/recap", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { recap: portal.recap ?? portal.campaign?.summary ?? null, history: portal.memory?.history ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/notes", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { notes: portal.notes ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/proposals", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { proposals: portal.proposals ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    return buildPlayerPortal(request.params.campaignId, user);
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal/state", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    return buildPlayerPortal(request.params.campaignId, user);
  });

  server.put<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/status", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.status.updated",
      actorUserId: user.userId,
      content: (request.body ?? {}) as any,
    });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/resources", async () => ({ ok: true }));
  server.put<{ Params: { campaignId: string; resourceId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/resources/:resourceId", async () => ({ ok: true }));

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/notes", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const body = (request.body ?? {}) as any;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const noteId = createId("note");
    await db.insert(schema.campaignNotes).values({
      campaignId: request.params.campaignId,
      noteId,
      authorUserId: user.userId,
      authorPlayerId: membership.playerId ?? null,
      content,
      visibilityScope: body.visibility ?? "private",
    });
    return { ok: true, noteId };
  });

  server.put<{ Params: { campaignId: string; noteId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/notes/:noteId", async (request, reply) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    const body = (request.body ?? {}) as any;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    await db.update(schema.campaignNotes)
      .set({ content, visibilityScope: body.visibility ?? "private", updatedAt: new Date() })
      .where(and(
        eq(schema.campaignNotes.campaignId, request.params.campaignId),
        eq(schema.campaignNotes.noteId, request.params.noteId),
        eq(schema.campaignNotes.authorUserId, user.userId),
      ));
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.objective.created",
      actorUserId: user.userId,
      content: (request.body ?? {}) as any,
    });
    return { ok: true, objectiveId: createId("obj") };
  });
  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives/:objectiveId", async () => ({ ok: true }));

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/proposals", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const proposalId = createId("prop");
    await db.insert(schema.playerProposals).values({
      campaignId: request.params.campaignId,
      proposalId,
      userId: user.userId,
      playerId: membership.playerId,
      type: ((request.body ?? {}) as any).kind ?? ((request.body ?? {}) as any).type ?? "note",
      content: (request.body ?? {}) as any,
      status: "submitted",
    });
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.proposal.submitted",
      actorUserId: user.userId,
      content: { proposalId, type: ((request.body ?? {}) as any).kind ?? ((request.body ?? {}) as any).type ?? "note" },
    });
    return { ok: true, proposalId };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal/dm-summary", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const proposals = await db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, request.params.campaignId));
    return { proposals, notes: [] };
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

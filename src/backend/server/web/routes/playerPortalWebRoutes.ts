import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { isDmRole, requireCampaignMembership, requireCampaignRole } from "../webAccess.js";
import type { WebUser } from "../webSession.js";

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

function isPublicPortalCanvasVisibility(value: unknown): boolean {
  return value !== "dm" && value !== "dm_only" && !isDmOnlyVisibility(value);
}

function buildPublicConstellationCanvases(portal: any, state: any) {
  const publicEntityIds = new Set((portal.entities ?? []).map((entity: any) => entity.entityId));
  const publicFactIds = new Set((portal.facts ?? []).map((fact: any) => fact.factId));
  const publicRelationIds = new Set((portal.relations ?? []).map((relation: any) => relation.relationId));
  const canvases = Array.from(state.canvases?.values?.() ?? []).filter((canvas: any) => !canvas.archived);

  return canvases.map((canvas: any) => {
    const nodes = (canvas.nodes ?? []).filter((node: any) => {
      if (!isPublicPortalCanvasVisibility(node.visibility)) return false;
      if (node.entityId) return publicEntityIds.has(node.entityId);
      if (node.factId) return publicFactIds.has(node.factId);
      return node.kind === "note" && isPublicPortalCanvasVisibility(node.visibility);
    });
    const visibleNodeIds = new Set(nodes.map((node: any) => node.id));
    const edges = (canvas.edges ?? []).filter((edge: any) => {
      if (edge.style === "secret" || !isPublicPortalCanvasVisibility(edge.visibility)) return false;
      if (!visibleNodeIds.has(edge.sourceNodeId) || !visibleNodeIds.has(edge.targetNodeId)) return false;
      return !edge.relationshipId || publicRelationIds.has(edge.relationshipId);
    });
    return { ...canvas, nodes, edges };
  }).filter((canvas: any) => canvas.nodes.length > 0);
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

export async function registerPlayerPortalWebRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();

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

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/constellation", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    const state = await repo.getCampaignState(request.params.campaignId);
    const canvases = buildPublicConstellationCanvases(portal, state);
    return {
      campaign: portal.campaign,
      entities: portal.entities ?? [],
      facts: portal.facts ?? [],
      relations: portal.relations ?? [],
      objectives: portal.objectives ?? [],
      clues: portal.clues ?? [],
      proposals: portal.proposals ?? [],
      canvases,
    };
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

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const body = (request.body ?? {}) as any;
    const objectiveId = createId("obj");
    await db.insert(schema.campaignObjectives).values({
      campaignId: request.params.campaignId,
      objectiveId,
      playerId: membership.playerId,
      title: String(body.title ?? body.label ?? "Objetivo personal").slice(0, 180),
      description: body.description ?? body.details ?? null,
      kind: body.kind ?? "player",
      status: body.status ?? "open",
      visibilityScope: body.visibility ?? "specific_player",
      linkedEntityIds: body.linkedEntityIds ?? [],
      sourceType: "player",
    });
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.objective.created",
      actorUserId: user.userId,
      content: { objectiveId, title: body.title ?? body.label ?? "Objetivo personal" },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true, objectiveId };
  });

  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives/:objectiveId", async (request, reply) => {
    const { membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const body = (request.body ?? {}) as any;
    await db.update(schema.campaignObjectives).set({
      title: body.title,
      description: body.description ?? body.details,
      status: body.status,
      updatedAt: new Date(),
    }).where(and(
      eq(schema.campaignObjectives.campaignId, request.params.campaignId),
      eq(schema.campaignObjectives.objectiveId, request.params.objectiveId),
      eq(schema.campaignObjectives.playerId, membership.playerId),
    ));
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true };
  });

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

  server.put<{ Params: { campaignId: string; proposalId: string }; Body: { status?: string; dmNote?: string } }>("/api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const status = request.body?.status === "approved" ? "approved" : request.body?.status === "rejected" ? "rejected" : null;
    if (!status) { reply.code(400); return { error: "status must be approved or rejected" }; }
    const [proposal] = await db.select().from(schema.playerProposals).where(and(
      eq(schema.playerProposals.campaignId, request.params.campaignId),
      eq(schema.playerProposals.proposalId, request.params.proposalId),
    )).limit(1);
    if (!proposal) { reply.code(404); return { error: "Proposal not found" }; }
    if (proposal.status === "approved" || proposal.status === "rejected") {
      return { ok: true, proposal };
    }
    await db.update(schema.playerProposals).set({
      status,
      processedBy: user.userId,
      processedAt: new Date(),
    }).where(and(
      eq(schema.playerProposals.campaignId, request.params.campaignId),
      eq(schema.playerProposals.proposalId, request.params.proposalId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: status === "approved" ? "player.proposal.approved" : "player.proposal.rejected",
      actorUserId: user.userId,
      content: { proposalId: request.params.proposalId, dmNote: request.body?.dmNote ?? null },
    });
    await db.insert(schema.notifications).values({
      notificationId: createId("ntf"),
      userId: proposal.userId,
      type: status === "approved" ? "proposal.approved" : "proposal.rejected",
      content: { campaignId: request.params.campaignId, proposalId: request.params.proposalId },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true, status };
  });
}

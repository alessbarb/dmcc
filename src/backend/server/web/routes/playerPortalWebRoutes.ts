import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { playerPortalResources, playerPortalStates } from "../../../db/playerPortalSchema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignMembership } from "../webAccess.js";
import type { WebUser } from "../webSession.js";

async function playerProfileFor(userId: string, campaignId: string) {
  const [profile] = await db.select().from(schema.playerProfiles).where(and(
    eq(schema.playerProfiles.userId, userId),
    eq(schema.playerProfiles.campaignId, campaignId),
    eq(schema.playerProfiles.status, "active"),
  )).limit(1);
  return profile;
}

async function requirePlayerPortal(request: FastifyRequest<{ Params: { campaignId: string } }>) {
  const context = await requireCampaignMembership(request, request.params.campaignId);
  if (context.membership.role !== "player" || !context.membership.playerId) {
    const error = new Error("Player portal requires active player membership");
    (error as { statusCode?: number }).statusCode = 403;
    throw error;
  }
  return context;
}

function sanitizeObject(value: any): any {
  if (Array.isArray(value)) return value.map(sanitizeObject).filter((item) => item !== undefined);
  if (!value || typeof value !== "object") return value;
  const visibility = value.visibility?.kind ?? value.visibility?.mode ?? value.visibility ?? value.visibilityScope;
  if (visibility === "dm_only" || visibility === "dm" || value.kind === "dm_secret") return undefined;
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
    if (type === "faction") return "factions";
    if (type === "player_character") return "characters";
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
  if (!profile) throw Object.assign(new Error("Active player profile required"), { statusCode: 403 });

  const [campaign, grants, allEntities, allFacts, allRelations, notes, proposals, allObjectives, allClues, stateRow, resources, sessions, liveTables, notifications] = await Promise.all([
    db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1),
    db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId)),
    db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
    db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
    db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
    db.select().from(schema.campaignNotes).where(and(eq(schema.campaignNotes.campaignId, campaignId), eq(schema.campaignNotes.authorUserId, user.userId))),
    db.select().from(schema.playerProposals).where(and(eq(schema.playerProposals.campaignId, campaignId), eq(schema.playerProposals.userId, user.userId), eq(schema.playerProposals.type, "link_request"))),
    db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
    db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)),
    db.select().from(playerPortalStates).where(and(eq(playerPortalStates.campaignId, campaignId), eq(playerPortalStates.playerId, profile.profileId))).limit(1),
    db.select().from(playerPortalResources).where(and(eq(playerPortalResources.campaignId, campaignId), eq(playerPortalResources.playerId, profile.profileId))),
    db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId)).orderBy(desc(schema.campaignSessions.createdAt)),
    db.select().from(schema.liveTables).where(and(eq(schema.liveTables.campaignId, campaignId), eq(schema.liveTables.status, "active"))).orderBy(desc(schema.liveTables.createdAt)).limit(1),
    db.select().from(schema.notifications).where(and(eq(schema.notifications.userId, user.userId), isNull(schema.notifications.readAt))).orderBy(desc(schema.notifications.createdAt)),
  ]);

  const allowed = (targetType: string, targetId: string) => grants.some((grant) =>
    grant.targetType === targetType && grant.targetId === targetId && (
      grant.scope === "public" || grant.scope === "all_players" ||
      (grant.scope === "specific_user" && grant.userId === user.userId) ||
      (grant.scope === "specific_player" && grant.playerId === profile.profileId)
    ));

  const entities = allEntities.filter((entity) => allowed("entity", entity.entityId));
  const facts = allFacts.filter((fact) => allowed("fact", fact.factId) && fact.kind !== "dm_secret");
  const relations = allRelations.filter((relation) => allowed("relation", relation.relationId));
  const objectives = allObjectives.filter((objective) => objective.status !== "archived" && (
    objective.visibilityScope === "public" || objective.visibilityScope === "all_players" || objective.playerId === profile.profileId
  ));
  const clues = allClues.filter((clue) => clue.status !== "archived" && clue.visibilityScope !== "dm_only");
  const history = sessions.filter((session) => Boolean(session.recapPublic)).map((session) => ({
    sessionId: session.sessionId,
    number: session.number,
    title: session.title,
    recap: session.recapPublic,
    playedDate: session.playedDate,
  }));
  const currentLiveTable = liveTables[0] && liveTables[0].expiresAt > new Date() ? liveTables[0] : null;
  const campaignNotifications = notifications.filter((notification) => {
    const content = notification.content && typeof notification.content === "object" ? notification.content as Record<string, unknown> : {};
    return content.campaignId === campaignId;
  });

  const safeEntities = entities.map(toPortalEntity);
  const safeFacts = facts.map((fact) => ({ factId: fact.factId, statement: fact.contentPublic ?? "", kind: fact.kind, confidence: fact.confidence })).filter((fact) => fact.statement.length > 0);
  const safeRelations = relations.map((relation) => ({ relationId: relation.relationId, label: relation.type, description: relation.publicSummary ?? undefined, sourceEntityId: relation.sourceEntityId, targetEntityId: relation.targetEntityId }));
  const linkedCharacter = profile.linkedCharacterId ? safeEntities.find((entity) => entity.entityId === profile.linkedCharacterId) ?? null : null;

  return sanitizeObject({
    campaign: campaign[0] ? { campaignId: campaign[0].campaignId, title: campaign[0].title, summary: campaign[0].summary, status: campaign[0].status } : { campaignId },
    playerId: profile.profileId,
    player: { playerId: profile.profileId, displayName: profile.displayName },
    playerProfile: profile,
    link: profile.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
    linkedCharacter,
    availableCharacters: safeEntities.filter((entity) => entity.entityType === "player_character"),
    sheet: { status: stateRow[0]?.status ?? {}, resources: resources.map((resource) => ({ resourceId: resource.resourceId, ...(resource.data as Record<string, unknown>) })) },
    recap: history[0]?.recap ?? null,
    history,
    liveTable: currentLiveTable,
    notifications: campaignNotifications,
    notes: notes.map((note) => ({ noteId: note.noteId, title: note.content.slice(0, 80), content: note.content, visibility: note.visibilityScope, createdAt: note.createdAt, updatedAt: note.updatedAt })),
    objectives: objectives.map((objective) => ({ objectiveId: objective.objectiveId, title: objective.title, description: objective.description ?? undefined, kind: objective.kind, status: objective.status, visibility: objective.visibilityScope, linkedEntityIds: objective.linkedEntityIds, playerId: objective.playerId })),
    proposals,
    memory: {
      entities: groupPortalEntities(entities),
      facts: safeFacts,
      relations: safeRelations,
      history,
      activeThreads: {
        quests: safeEntities.filter((entity) => entity.entityType === "quest"),
        cluesAndRumors: [
          ...safeEntities.filter((entity) => ["clue", "rumor"].includes(entity.entityType)),
          ...clues.map((clue) => ({ entityId: clue.entityId ?? clue.clueId, title: clue.title, summary: clue.publicSummary ?? undefined, status: clue.status, entityType: "clue" })),
        ],
      },
      counts: { visibleEntities: safeEntities.length, facts: safeFacts.length, relations: safeRelations.length, objectives: objectives.length, clues: clues.length, historyEntries: history.length },
    },
    entities: safeEntities,
    facts: safeFacts,
    relations: safeRelations,
    clues: clues.map((clue) => ({ clueId: clue.clueId, entityId: clue.entityId, title: clue.title, summary: clue.publicSummary ?? undefined, status: clue.status })),
  });
}

export async function registerPlayerPortalWebRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();

  async function readPlayerPortalForRequest(request: FastifyRequest<{ Params: { campaignId: string } }>) {
    const { user } = await requirePlayerPortal(request);
    return buildPlayerPortal(request.params.campaignId, user) as Promise<any>;
  }

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId", readPlayerPortalForRequest);
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/home", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { campaign: portal.campaign, player: portal.player, recap: portal.recap, objectives: portal.objectives ?? [], memoryCounts: portal.memory?.counts ?? {}, notifications: portal.notifications ?? [], liveTable: portal.liveTable };
  });
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/memory", async (request) => (await readPlayerPortalForRequest(request)).memory);
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/constellation", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    const state = await repo.getCampaignState(request.params.campaignId);
    return { campaign: portal.campaign, entities: portal.entities ?? [], facts: portal.facts ?? [], relations: portal.relations ?? [], objectives: portal.objectives ?? [], clues: portal.clues ?? [], canvases: buildPublicConstellationCanvases(portal, state) };
  });
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/character", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { player: portal.player, linkedCharacter: portal.linkedCharacter, sheet: portal.sheet, availableCharacters: portal.availableCharacters, proposals: portal.proposals ?? [] };
  });
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/objectives", async (request) => ({ objectives: (await readPlayerPortalForRequest(request)).objectives ?? [] }));
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/recap", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { recap: portal.recap, history: portal.history ?? [] };
  });
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/notes", async (request) => ({ notes: (await readPlayerPortalForRequest(request)).notes ?? [] }));
  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal/state", readPlayerPortalForRequest);

  server.put<{ Params: { campaignId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/status", async (request) => {
    const { membership } = await requirePlayerPortal(request);
    await db.insert(playerPortalStates).values({ campaignId: request.params.campaignId, playerId: membership.playerId!, status: request.body ?? {}, updatedAt: new Date() }).onConflictDoUpdate({ target: [playerPortalStates.campaignId, playerPortalStates.playerId], set: { status: request.body ?? {}, updatedAt: new Date() } });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/resources", async (request, reply) => {
    const { membership } = await requirePlayerPortal(request);
    const resourceId = createId("res");
    await db.insert(playerPortalResources).values({ campaignId: request.params.campaignId, resourceId, playerId: membership.playerId!, data: request.body ?? {} });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    reply.code(201);
    return { ok: true, resourceId };
  });

  server.put<{ Params: { campaignId: string; resourceId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/resources/:resourceId", async (request, reply) => {
    const { membership } = await requirePlayerPortal(request);
    const updated = await db.update(playerPortalResources).set({ data: request.body ?? {}, updatedAt: new Date() }).where(and(eq(playerPortalResources.campaignId, request.params.campaignId), eq(playerPortalResources.resourceId, request.params.resourceId), eq(playerPortalResources.playerId, membership.playerId!))).returning({ resourceId: playerPortalResources.resourceId });
    if (updated.length === 0) { reply.code(404); return { error: "Resource not found" }; }
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, any> }>("/api/campaigns/:campaignId/player-portal/notes", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = (request.body ?? {}) as Record<string, any>;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const noteId = createId("note");
    await db.insert(schema.campaignNotes).values({ campaignId: request.params.campaignId, noteId, authorUserId: user.userId, authorPlayerId: membership.playerId, content, visibilityScope: body.visibility ?? "private" });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, noteId };
  });

  server.put<{ Params: { campaignId: string; noteId: string }; Body: Record<string, any> }>("/api/campaigns/:campaignId/player-portal/notes/:noteId", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = (request.body ?? {}) as Record<string, any>;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const updated = await db.update(schema.campaignNotes).set({ content, visibilityScope: body.visibility ?? "private", updatedAt: new Date() }).where(and(eq(schema.campaignNotes.campaignId, request.params.campaignId), eq(schema.campaignNotes.noteId, request.params.noteId), eq(schema.campaignNotes.authorUserId, user.userId))).returning({ noteId: schema.campaignNotes.noteId });
    if (updated.length === 0) { reply.code(404); return { error: "Note not found" }; }
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, any> }>("/api/campaigns/:campaignId/player-portal/objectives", async (request) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = (request.body ?? {}) as Record<string, any>;
    const objectiveId = createId("obj");
    await db.insert(schema.campaignObjectives).values({ campaignId: request.params.campaignId, objectiveId, playerId: membership.playerId, title: String(body.title ?? body.label ?? "Objetivo personal").slice(0, 180), description: body.description ?? body.details ?? null, kind: body.kind ?? "player", status: body.status ?? "open", visibilityScope: body.visibility ?? "specific_player", linkedEntityIds: body.linkedEntityIds ?? [], sourceType: "player" });
    await db.insert(schema.activityFeed).values({ campaignId: request.params.campaignId, activityId: createId("act"), type: "player.objective.created", actorUserId: user.userId, content: { objectiveId, title: body.title ?? body.label ?? "Objetivo personal" } });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, objectiveId };
  });

  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: Record<string, any> }>("/api/campaigns/:campaignId/player-portal/objectives/:objectiveId", async (request, reply) => {
    const { membership } = await requirePlayerPortal(request);
    const body = (request.body ?? {}) as Record<string, any>;
    const updated = await db.update(schema.campaignObjectives).set({ title: body.title, description: body.description ?? body.details, status: body.status, updatedAt: new Date() }).where(and(eq(schema.campaignObjectives.campaignId, request.params.campaignId), eq(schema.campaignObjectives.objectiveId, request.params.objectiveId), eq(schema.campaignObjectives.playerId, membership.playerId!))).returning({ objectiveId: schema.campaignObjectives.objectiveId });
    if (updated.length === 0) { reply.code(404); return { error: "Objective not found" }; }
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, any> }>("/api/campaigns/:campaignId/player-portal/proposals", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = (request.body ?? {}) as Record<string, any>;
    const type = body.kind ?? body.type;
    const characterEntityId = body.targetCharacterEntityId ?? body.characterEntityId;
    if (type !== "link_request" || typeof characterEntityId !== "string" || !characterEntityId) {
      reply.code(400);
      return { error: "Only structured character link requests are accepted as proposals" };
    }
    const proposalId = createId("prop");
    const content = { ...body, kind: "link_request", type: "link_request", targetCharacterEntityId: characterEntityId, characterEntityId };
    await db.insert(schema.playerProposals).values({ campaignId: request.params.campaignId, proposalId, userId: user.userId, playerId: membership.playerId!, type: "link_request", content, status: "submitted" });
    await db.insert(schema.activityFeed).values({ campaignId: request.params.campaignId, activityId: createId("act"), type: "player.character.link.requested", actorUserId: user.userId, content: { proposalId, characterEntityId } });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, proposalId };
  });
}

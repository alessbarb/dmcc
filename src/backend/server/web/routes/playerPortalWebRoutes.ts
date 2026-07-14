import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { CampaignProjection } from "@core/projections/campaignProjection.js";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { playerPortalResources, playerPortalStates } from "../../../db/playerPortalSchema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import {
  buildKnowledgeAccessIndex,
  loadKnowledgeSnapshot,
  playerCanAccessKnowledge,
} from "../playerKnowledgeProjection.js";
import { requireCampaignMembership } from "../webAccess.js";
import type { WebUser } from "../webSession.js";
import { HttpError } from "../../errors.js";
import { recordOperationalActivity } from "../../activity/recordOperationalActivity.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// HTTP boundary helpers: request bodies are unvalidated JSON at this layer, so we narrow
// individual fields explicitly rather than casting the whole body to a concrete shape.
function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

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
    throw new HttpError("Player portal requires active player membership", 403);
  }
  return context;
}

function sanitizeObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeObject).filter((item) => item !== undefined);
  if (!isRecord(value)) return value;
  const visibilityValue = value.visibility;
  const visibility = isRecord(visibilityValue) ? visibilityValue.kind ?? visibilityValue.mode : visibilityValue ?? value.visibilityScope;
  if (visibility === "dm_only" || visibility === "dm" || value.kind === "dm_secret") return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (/^dm|secret/i.test(key) || key === "contentDm") continue;
    const sanitized = sanitizeObject(child);
    if (sanitized !== undefined) result[key] = sanitized;
  }
  return result;
}

type PortalEntity = ReturnType<typeof toPortalEntity>;

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
  const groups: Record<string, PortalEntity[]> = {};
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

function projectPlayerCanvases(state: CampaignProjection, visibleEntityIds: Set<string>, visibleFactIds: Set<string>, visibleRelationIds: Set<string>) {
  const canvases = Array.from(state.canvases.values()).filter((canvas) => !canvas.archived);
  return canvases.map((canvas) => {
    const nodes = canvas.nodes.flatMap((node) => {
      if (node.entityId && !visibleEntityIds.has(node.entityId)) return [];
      if (node.factId && !visibleFactIds.has(node.factId)) return [];
      if (!node.entityId && !node.factId) return [];
      return [{
        id: node.id,
        kind: node.kind,
        entityId: node.entityId ?? undefined,
        factId: node.factId ?? undefined,
        title: node.title ?? undefined,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      }];
    });
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = canvas.edges.flatMap((edge) => {
      if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) return [];
      if (edge.relationshipId && !visibleRelationIds.has(edge.relationshipId)) return [];
      return [{
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        relationshipId: edge.relationshipId ?? undefined,
        label: edge.label ?? undefined,
      }];
    });
    if (nodes.length === 0) return null;
    return {
      canvasId: canvas.id,
      title: canvas.title,
      nodes,
      edges,
    };
  }).filter(Boolean);
}

async function buildPlayerPortal(campaignId: string, user: WebUser) {
  const profile = await playerProfileFor(user.userId, campaignId);
  if (!profile) throw new HttpError("Active player profile required", 403);

  const [snapshot, campaign, notes, proposals, stateRow, resources, sessions, liveTables, notifications] = await Promise.all([
    loadKnowledgeSnapshot(campaignId),
    db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1),
    db.select().from(schema.campaignNotes).where(and(eq(schema.campaignNotes.campaignId, campaignId), eq(schema.campaignNotes.authorUserId, user.userId))),
    db.select().from(schema.playerProposals).where(and(eq(schema.playerProposals.campaignId, campaignId), eq(schema.playerProposals.userId, user.userId), eq(schema.playerProposals.type, "link_request"))),
    db.select().from(playerPortalStates).where(and(eq(playerPortalStates.campaignId, campaignId), eq(playerPortalStates.playerId, profile.profileId))).limit(1),
    db.select().from(playerPortalResources).where(and(eq(playerPortalResources.campaignId, campaignId), eq(playerPortalResources.playerId, profile.profileId))),
    db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId)).orderBy(desc(schema.campaignSessions.createdAt)),
    db.select().from(schema.liveTables).where(and(eq(schema.liveTables.campaignId, campaignId), eq(schema.liveTables.status, "active"))).orderBy(desc(schema.liveTables.createdAt)).limit(1),
    db.select().from(schema.notifications).where(and(eq(schema.notifications.userId, user.userId), isNull(schema.notifications.readAt))).orderBy(desc(schema.notifications.createdAt)),
  ]);
  const accessIndex = buildKnowledgeAccessIndex(snapshot);
  const allowed = (targetType: "entity" | "fact" | "relation" | "clue" | "objective", targetId: string) => playerCanAccessKnowledge(
    accessIndex,
    targetType,
    targetId,
    user.userId,
    profile.profileId,
    profile.linkedCharacterId,
  );

  const entities = snapshot.entities.filter((entity) => entity.status !== "archived" && allowed("entity", entity.entityId));
  const facts = snapshot.facts.filter((fact) => fact.status !== "archived" && fact.kind !== "dm_secret" && allowed("fact", fact.factId));
  const relations = snapshot.relations.filter((relation) => allowed("relation", relation.relationId));
  const objectives = snapshot.objectives.filter((objective) => objective.status !== "archived" && allowed("objective", objective.objectiveId));
  const clues = snapshot.clues.filter((clue) => clue.status !== "archived" && allowed("clue", clue.clueId));
  const history = sessions.filter((session) => Boolean(session.recapPublic)).map((session) => ({
    sessionId: session.sessionId,
    number: session.number,
    title: session.title,
    recap: session.recapPublic,
    playedDate: session.playedDate,
  }));
  const currentLiveTable = liveTables[0] && liveTables[0].expiresAt > new Date() ? liveTables[0] : null;
  const campaignNotifications = notifications.filter((notification) => {
    const content: Record<string, unknown> = isRecord(notification.content) ? notification.content : {};
    return content.campaignId === campaignId;
  });

  const safeEntities = entities.map(toPortalEntity);
  const safeFacts = facts.map((fact) => ({ factId: fact.factId, statement: fact.contentPublic ?? "", kind: fact.kind, confidence: fact.confidence })).filter((fact) => fact.statement.length > 0);
  const safeRelations = relations.map((relation) => ({ relationId: relation.relationId, label: relation.type, description: relation.publicSummary ?? undefined, sourceEntityId: relation.sourceEntityId, targetEntityId: relation.targetEntityId }));
  const linkedCharacter = profile.linkedCharacterId ? safeEntities.find((entity) => entity.entityId === profile.linkedCharacterId) ?? null : null;
  const canvases = projectPlayerCanvases(
    snapshot.state,
    new Set(safeEntities.map((entity) => entity.entityId)),
    new Set(safeFacts.map((fact) => fact.factId)),
    new Set(safeRelations.map((relation) => relation.relationId)),
  );

  const rawPortal = {
    campaign: campaign[0] ? { campaignId: campaign[0].campaignId, title: campaign[0].title, summary: campaign[0].summary, status: campaign[0].status } : { campaignId },
    playerId: profile.profileId,
    player: { playerId: profile.profileId, displayName: profile.displayName },
    playerProfile: profile,
    link: profile.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
    linkedCharacter,
    availableCharacters: safeEntities.filter((entity) => entity.entityType === "player_character"),
    sheet: { status: stateRow[0]?.status ?? {}, resources: resources.map((resource) => ({ resourceId: resource.resourceId, ...(isRecord(resource.data) ? resource.data : {}) })) },
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
    canvases,
  };
  // sanitizeObject strips dm-only branches recursively but otherwise preserves the shape of
  // its input; casting back to the pre-sanitize shape keeps downstream property access typed.
  return sanitizeObject(rawPortal) as typeof rawPortal;
}

export type PlayerPortalPayload = Awaited<ReturnType<typeof buildPlayerPortal>>;

export async function registerPlayerPortalWebRoutes(server: FastifyInstance) {
  async function readPlayerPortalForRequest(request: FastifyRequest<{ Params: { campaignId: string } }>): Promise<PlayerPortalPayload> {
    const { user } = await requirePlayerPortal(request);
    return buildPlayerPortal(request.params.campaignId, user);
  }

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId", readPlayerPortalForRequest);
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/home", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { campaign: portal.campaign, player: portal.player, recap: portal.recap, objectives: portal.objectives ?? [], memoryCounts: portal.memory?.counts ?? {}, notifications: portal.notifications ?? [], liveTable: portal.liveTable };
  });
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/memory", async (request) => (await readPlayerPortalForRequest(request)).memory);
  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/constellation", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { campaign: portal.campaign, entities: portal.entities ?? [], facts: portal.facts ?? [], relations: portal.relations ?? [], objectives: portal.objectives ?? [], clues: portal.clues ?? [], canvases: portal.canvases ?? [] };
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

  server.post<{ Params: { campaignId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/notes", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = request.body ?? {};
    const content = [asOptionalString(body.title), asOptionalString(body.content) ?? asOptionalString(body.details)].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const noteId = createId("note");
    await db.insert(schema.campaignNotes).values({ campaignId: request.params.campaignId, noteId, authorUserId: user.userId, authorPlayerId: membership.playerId, content, visibilityScope: asString(body.visibility, "private") });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, noteId };
  });

  server.put<{ Params: { campaignId: string; noteId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/notes/:noteId", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = request.body ?? {};
    const content = [asOptionalString(body.title), asOptionalString(body.content) ?? asOptionalString(body.details)].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const updated = await db.update(schema.campaignNotes).set({ content, visibilityScope: asString(body.visibility, "private"), updatedAt: new Date() }).where(and(eq(schema.campaignNotes.campaignId, request.params.campaignId), eq(schema.campaignNotes.noteId, request.params.noteId), eq(schema.campaignNotes.authorUserId, user.userId))).returning({ noteId: schema.campaignNotes.noteId });
    if (updated.length === 0) { reply.code(404); return { error: "Note not found" }; }
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/objectives", async (request) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = request.body ?? {};
    const objectiveId = createId("obj");
    const title = asString(body.title, asString(body.label, "Objetivo personal")).slice(0, 180);
    const linkedEntityIds = Array.isArray(body.linkedEntityIds) ? body.linkedEntityIds.filter((id): id is string => typeof id === "string") : [];
    await db.insert(schema.campaignObjectives).values({ campaignId: request.params.campaignId, objectiveId, playerId: membership.playerId, title, description: asOptionalString(body.description) ?? asOptionalString(body.details) ?? null, kind: asString(body.kind, "player"), status: asString(body.status, "open"), visibilityScope: asString(body.visibility, "specific_player"), linkedEntityIds, sourceType: "player" });
    await recordOperationalActivity(db, {
      campaignId: request.params.campaignId,
      sourceId: createId("act"),
      type: "player.objective.created",
      category: "knowledge",
      data: { objectiveId, title },
      actorUserId: user.userId,
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, objectiveId };
  });

  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/objectives/:objectiveId", async (request, reply) => {
    const { membership } = await requirePlayerPortal(request);
    const body = request.body ?? {};
    const updated = await db.update(schema.campaignObjectives).set({ title: asOptionalString(body.title), description: asOptionalString(body.description) ?? asOptionalString(body.details), status: asOptionalString(body.status), updatedAt: new Date() }).where(and(eq(schema.campaignObjectives.campaignId, request.params.campaignId), eq(schema.campaignObjectives.objectiveId, request.params.objectiveId), eq(schema.campaignObjectives.playerId, membership.playerId!))).returning({ objectiveId: schema.campaignObjectives.objectiveId });
    if (updated.length === 0) { reply.code(404); return { error: "Objective not found" }; }
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: Record<string, unknown> }>("/api/campaigns/:campaignId/player-portal/proposals", async (request, reply) => {
    const { user, membership } = await requirePlayerPortal(request);
    const body = request.body ?? {};
    const type = body.kind ?? body.type;
    const characterEntityId = body.targetCharacterEntityId ?? body.characterEntityId;
    if (type !== "link_request" || typeof characterEntityId !== "string" || !characterEntityId) {
      reply.code(400);
      return { error: "Only structured character link requests are accepted as proposals" };
    }
    const proposalId = createId("prop");
    const content = { ...body, kind: "link_request", type: "link_request", targetCharacterEntityId: characterEntityId, characterEntityId };
    await db.insert(schema.playerProposals).values({ campaignId: request.params.campaignId, proposalId, userId: user.userId, playerId: membership.playerId!, type: "link_request", content, status: "submitted" });
    await recordOperationalActivity(db, {
      campaignId: request.params.campaignId,
      sourceId: createId("act"),
      type: "player.character.link.requested",
      category: "people",
      data: { proposalId, characterEntityId },
      actorUserId: user.userId,
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated", playerId: membership.playerId! });
    return { ok: true, proposalId };
  });
}

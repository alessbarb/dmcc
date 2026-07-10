import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { desc, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { getRequiredWebUser } from "../webSession.js";
import { ensureDefaultWorkspace, isDmRole, listAccessibleCampaigns, requireCampaignOwner, requireCampaignRole } from "../webAccess.js";

type RequestBody = Record<string, unknown>;
type DmCommandInput = { type: string } & RequestBody;
type CampaignCommandBody = { command?: DmCommandInput } & RequestBody;

function commandErrorPayload(error: unknown): { message: string; statusCode: number; isConflict: boolean } {
  if (!(error instanceof Error)) {
    return { message: "Command failed", statusCode: 500, isConflict: false };
  }

  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return {
    message: error.message || "Command failed",
    statusCode: typeof statusCode === "number" ? statusCode : 500,
    isConflict: error.name === "CommandConflictError" || /Conflict/.test(error.message),
  };
}

function campaignSummary(row: typeof schema.campaigns.$inferSelect & { role?: string; playerId?: string | null }) {
  const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
    ? row.metadata as Record<string, unknown>
    : {};
  return {
    campaignId: row.campaignId,
    title: row.title,
    summary: row.summary ?? undefined,
    status: row.status,
    system: typeof metadata.system === "string" ? metadata.system : undefined,
    coverUrl: typeof metadata.coverUrl === "string" ? metadata.coverUrl : undefined,
    metadata,
    role: row.role ?? "dm",
    playerId: row.playerId ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
    updatedAt: row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

function entityDto(row: typeof schema.campaignEntities.$inferSelect) {
  return {
    campaignId: row.campaignId,
    entityId: row.entityId,
    entityType: row.type,
    title: row.name,
    summary: row.publicSummary ?? undefined,
    content: row.dmSummary ?? undefined,
    status: row.status,
    importance: row.importance,
    visibility: { kind: "dm_only" },
    metadata: {},
    tagIds: Array.isArray(row.tags) ? row.tags : [],
    archived: row.status === "archived",
    updatedAt: row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

function factDto(row: typeof schema.campaignFacts.$inferSelect) {
  return {
    campaignId: row.campaignId,
    factId: row.factId,
    statement: row.contentDm ?? row.contentPublic ?? "",
    kind: row.kind,
    confidence: row.confidence,
    relatedEntityIds: row.subjectEntityId ? [row.subjectEntityId] : [],
    visibility: row.kind === "dm_secret" ? { kind: "dm_only" } : { kind: "party" },
    source: row.source ? { kind: row.source } : { kind: "manual" },
    archived: row.status === "archived",
  };
}

function relationDto(row: typeof schema.campaignRelations.$inferSelect) {
  return {
    campaignId: row.campaignId,
    relationId: row.relationId,
    sourceEntityId: row.sourceEntityId,
    targetEntityId: row.targetEntityId,
    relationType: row.type,
    description: row.dmSummary ?? row.publicSummary ?? undefined,
    visibility: { kind: row.visibility },
    archived: false,
  };
}

function sessionDto(row: typeof schema.campaignSessions.$inferSelect) {
  return {
    campaignId: row.campaignId,
    sessionId: row.sessionId,
    number: row.number,
    title: row.title,
    summary: row.recapDm ?? row.recapPublic ?? undefined,
    status: row.status === "live" ? "active" : row.status,
    scheduledAt: row.plannedDate ?? undefined,
    startedAt: undefined,
    endedAt: row.playedDate ?? undefined,
    prep: row.notes ? { notes: row.notes } : undefined,
  };
}

export async function registerCampaignWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get("/api/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const campaigns = await listAccessibleCampaigns(user.userId);
    return campaigns.map(campaignSummary);
  });

  server.post<{ Body: { title?: string; summary?: string; system?: string; coverUrl?: string; metadata?: Record<string, unknown> } }>("/api/campaigns", async (request, reply) => {
    const user = getRequiredWebUser(request);
    const title = request.body?.title?.trim();
    if (!title) {
      reply.code(400);
      return { error: "Campaign title is required" };
    }
    const campaignId = createId("cmp");
    const workspaceId = await ensureDefaultWorkspace(user);
    const metadata = {
      ...(request.body?.metadata && typeof request.body.metadata === "object" ? request.body.metadata : {}),
      ...(request.body?.system ? { system: request.body.system } : {}),
      ...(request.body?.coverUrl ? { coverUrl: request.body.coverUrl } : {}),
    };
    await db.transaction(async (tx) => {
      await tx.insert(schema.campaigns).values({
        campaignId,
        title,
        summary: request.body?.summary ?? null,
        workspaceId,
        ownerId: user.userId,
        status: "active",
        metadata,
      });
      await tx.insert(schema.campaignMemberships).values({
        campaignId,
        userId: user.userId,
        role: "dm",
        playerId: null,
      }).onConflictDoNothing();
    });
    await repo.executeCommand(campaignId, {
      type: "CreateCampaign",
      campaignId,
      title,
      summary: request.body?.summary,
      system: request.body?.system,
      coverUrl: request.body?.coverUrl,
      metadata,
      actorId: user.userId,
    } as Command, { commandId: createId("cmd"), actorUserId: user.userId });
    reply.code(201);
    return { campaignId };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm", "player", "viewer"]);
    const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, request.params.campaignId)).limit(1);
    const [entities, facts, relations, sessions, players] = await Promise.all([
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, request.params.campaignId)),
      db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, request.params.campaignId)),
    ]);
    return {
      campaign: campaign ? campaignSummary(campaign) : null,
      entities: entities.map(entityDto),
      facts: facts.map(factDto),
      relations: relations.map(relationDto),
      sessions: sessions.map(sessionDto),
      players: players.map((player) => ({
        campaignId: player.campaignId,
        playerId: player.profileId,
        name: player.displayName,
        displayName: player.displayName,
        email: null,
        archived: player.status === "archived",
        createdAt: player.createdAt?.toISOString?.() ?? String(player.createdAt),
      })),
      canvases: [],
      tags: [],
      attachments: [],
      sessionEvents: [],
    };
  });

  server.get("/api/player/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const campaigns = (await listAccessibleCampaigns(user.userId))
      .filter((campaign) => campaign.role === "player" || isDmRole(campaign.role));
    return { campaigns: campaigns.map(campaignSummary) };
  });

  server.post<{ Params: { campaignId: string }; Body: CampaignCommandBody }>("/api/campaigns/:campaignId/commands", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandId = request.headers["idempotency-key"];
    if (!commandId || Array.isArray(commandId)) {
      reply.code(400);
      return { error: "Idempotency-Key header is required" };
    }
    const command = request.body.command ?? request.body as DmCommandInput;
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      } as Command, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: unknown) {
      const payload = commandErrorPayload(error);
      reply.code(payload.isConflict ? 409 : payload.statusCode);
      return { error: payload.message };
    }
  });


  async function executeDmCommand(request: FastifyRequest<{ Params: { campaignId: string }; Body?: RequestBody }>, reply: FastifyReply, command: DmCommandInput) {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandIdHeader = request.headers["idempotency-key"];
    const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      } as Command, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: unknown) {
      const payload = commandErrorPayload(error);
      reply.code(payload.isConflict ? 409 : payload.statusCode);
      return { error: payload.message };
    }
  }

  server.patch<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateCampaign", ...(request.body ?? {}) });
  });

  server.delete<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request, _reply) => {
    await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaigns).set({ status: "deleted", updatedAt: new Date() }).where(eq(schema.campaigns.campaignId, request.params.campaignId));
    return { ok: true };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/network-status", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { networkModeEnabled: false, accessCode: null, localIp: "", port: 0, joinUrl: "" };
  });

  server.post<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/network/toggle", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { networkModeEnabled: false, accessCode: null, localIp: "", port: 0, joinUrl: "" };
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

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/entities", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateEntity", ...(request.body ?? {}) });
  });
  server.patch<{ Params: { campaignId: string; entityId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateEntity", entityId: request.params.entityId, ...(request.body ?? {}) });
  });
  server.delete<{ Params: { campaignId: string; entityId: string } }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveEntity", entityId: request.params.entityId });
  });

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/relations", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateRelation", ...(request.body ?? {}) });
  });
  server.put<{ Params: { campaignId: string; relationId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateRelation", relationId: request.params.relationId, ...(request.body ?? {}) });
  });
  server.delete<{ Params: { campaignId: string; relationId: string } }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveRelation", relationId: request.params.relationId });
  });

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/facts", async (request, reply) => {
    const body = request.body ?? {};
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
  server.put<{ Params: { campaignId: string; factId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/facts/:factId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateFact", factId: request.params.factId, ...(request.body ?? {}) });
  });

}

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import type { Entity } from "@core/domain/entity/types.js";
import type { Canvas } from "@core/domain/canvas/types.js";
import { desc, eq } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { writeMarkdownCampaignExport } from "../../export/markdownCampaignExport.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { getRequiredWebUser } from "../webSession.js";
import { ensureDefaultWorkspace, isDmRole, listAccessibleCampaigns, requireCampaignOwner, requireCampaignRole } from "../webAccess.js";

type RequestBody = Record<string, unknown>;
type DmCommandInput = { type: string } & RequestBody;
type CampaignCommandBody = { command?: DmCommandInput } & RequestBody;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Entities/canvases in the projection are Entity/Canvas domain objects, but some optional
// display-only fields (imageUrl/avatarUrl/etc.) are populated ad hoc via metadata and are not
// part of the strict domain schema. Model them as optional passthrough fields rather than `any`.
type ProjectedEntity = Entity & {
  id?: string;
  name?: string;
  type?: string;
  imageUrl?: unknown;
  avatarUrl?: unknown;
  portraitUrl?: unknown;
  coverUrl?: unknown;
};

export interface CampaignWebRoutesOptions {
  dataDir: string;
}

const MARKDOWN_PRIMARY_FILE = "Campaña completa.md";
const EXPORT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isSafeExportId(exportId: string): boolean {
  return exportId.length > 0 && EXPORT_ID_PATTERN.test(exportId) && basename(exportId) === exportId;
}

function markdownExportDir(dataDir: string, campaignId: string, exportId: string): string {
  return join(dataDir, "exports", campaignId, exportId);
}

function commandErrorPayload(error: unknown): { message: string; statusCode: number; isConflict: boolean } {
  if (!(error instanceof Error)) {
    return { message: "Command failed", statusCode: 500, isConflict: false };
  }

  const statusCode = isRecord(error) && typeof error.statusCode === "number" ? error.statusCode : 500;
  return {
    message: error.message || "Command failed",
    statusCode,
    isConflict: error.name === "CommandConflictError" || /Conflict/.test(error.message),
  };
}

function campaignSummary(row: typeof schema.campaigns.$inferSelect & { role?: string; playerId?: string | null }) {
  const metadata: Record<string, unknown> = isRecord(row.metadata) ? row.metadata : {};
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

function projectionMapValues<T>(value: Map<string, T> | T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  if (value instanceof Map) return Array.from(value.values());
  if (Array.isArray(value)) return value;
  return Object.values(value);
}

function serializeCanvas(canvas: Canvas) {
  if (canvas.archived) return null;
  return {
    ...canvas,
    canvasId: canvas.id,
    nodes: Array.isArray(canvas.nodes) ? canvas.nodes : [],
    edges: Array.isArray(canvas.edges) ? canvas.edges : [],
  };
}

function entityDto(row: typeof schema.campaignEntities.$inferSelect, projected?: ProjectedEntity) {
  const metadata: Record<string, unknown> = isRecord(projected?.metadata) ? projected.metadata : {};
  return {
    campaignId: row.campaignId,
    entityId: row.entityId,
    entityType: projected?.entityType ?? row.type,
    title: projected?.title ?? row.name,
    subtitle: projected?.subtitle,
    summary: projected?.summary ?? row.publicSummary ?? undefined,
    content: projected?.content ?? row.dmSummary ?? undefined,
    status: projected?.status ?? row.status,
    importance: projected?.importance ?? row.importance,
    visibility: projected?.visibility ?? { kind: "dm_only" },
    metadata,
    imageUrl: metadata.imageUrl ?? projected?.imageUrl,
    avatarUrl: metadata.avatarUrl ?? projected?.avatarUrl,
    portraitUrl: metadata.portraitUrl ?? projected?.portraitUrl,
    coverUrl: metadata.coverUrl ?? projected?.coverUrl,
    tagIds: projected?.tagIds ?? (Array.isArray(row.tags) ? row.tags : []),
    archived: Boolean(projected?.archived ?? row.status === "archived"),
    updatedAt: projected?.updatedAt ?? row.updatedAt?.toISOString?.() ?? String(row.updatedAt),
  };
}

function projectedEntityDto(entity: ProjectedEntity, campaignId: string) {
  const metadata: Record<string, unknown> = isRecord(entity.metadata) ? entity.metadata : {};
  return {
    ...entity,
    campaignId: entity.campaignId ?? campaignId,
    entityId: entity.entityId ?? entity.id,
    entityType: entity.entityType ?? entity.type ?? "note",
    title: entity.title ?? entity.name ?? "Untitled entity",
    summary: entity.summary,
    content: entity.content,
    status: entity.status ?? "active",
    importance: entity.importance ?? "normal",
    visibility: entity.visibility ?? { kind: "dm_only" },
    metadata,
    imageUrl: metadata.imageUrl ?? entity.imageUrl,
    avatarUrl: metadata.avatarUrl ?? entity.avatarUrl,
    portraitUrl: metadata.portraitUrl ?? entity.portraitUrl,
    coverUrl: metadata.coverUrl ?? entity.coverUrl,
    tagIds: entity.tagIds ?? [],
    archived: Boolean(entity.archived),
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

async function deleteCampaignShell(campaignId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, campaignId));
    await tx.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId));
  });
}

export async function registerCampaignWebRoutes(server: FastifyInstance, options: CampaignWebRoutesOptions): Promise<void> {
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
    const commandIdHeader = request.headers["idempotency-key"];
    const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");

    try {
      await db.transaction(async (tx) => {
        await tx.insert(schema.campaigns).values({ campaignId, title, summary: request.body?.summary ?? null, workspaceId, ownerId: user.userId, status: "active", metadata });
        await tx.insert(schema.campaignMemberships).values({ campaignId, userId: user.userId, role: "dm", playerId: null }).onConflictDoNothing();
      });

      try {
        await repo.executeCommand(campaignId, {
          type: "CreateCampaign",
          campaignId,
          title,
          summary: request.body?.summary,
          system: request.body?.system,
          coverUrl: request.body?.coverUrl,
          metadata,
          actorId: user.userId,
        } as Command, { commandId, actorUserId: user.userId });
      } catch (error) {
        await deleteCampaignShell(campaignId).catch(() => undefined);
        throw error;
      }

      reply.code(201);
      return { campaignId };
    } catch (error) {
      const payload = commandErrorPayload(error);
      reply.code(payload.isConflict ? 409 : payload.statusCode);
      return { error: payload.message };
    }
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm", "player", "viewer"]);
    const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, request.params.campaignId)).limit(1);
    const [projection, entities, facts, relations, sessions, players] = await Promise.all([
      repo.getCampaignState(request.params.campaignId),
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, request.params.campaignId)),
      db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, request.params.campaignId)),
    ]);
    const projectedEntityList = projectionMapValues<ProjectedEntity>(projection.entities);
    const projectedEntities = new Map(projectedEntityList.map((entity) => [entity.entityId ?? entity.id, entity]));
    const readModelEntityIds = new Set(entities.map((entity) => entity.entityId));
    const mergedEntities = [
      ...entities.map((entity) => entityDto(entity, projectedEntities.get(entity.entityId))),
      ...projectedEntityList
        .filter((entity) => !readModelEntityIds.has(entity.entityId ?? entity.id))
        .map((entity) => projectedEntityDto(entity, request.params.campaignId)),
    ];
    const canvases = projectionMapValues(projection.canvases).map(serializeCanvas).filter(Boolean);
    const tags = projectionMapValues(projection.tags);
    const attachments = projectionMapValues(projection.attachments);
    const sessionEvents = projectionMapValues(projection.sessionEvents);
    return {
      campaign: campaign ? campaignSummary(campaign) : null,
      entities: mergedEntities,
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
      canvases,
      tags,
      attachments,
      sessionEvents,
    };
  });

  server.get("/api/player/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const campaigns = (await listAccessibleCampaigns(user.userId)).filter((campaign) => campaign.role === "player" || isDmRole(campaign.role));
    return { campaigns: campaigns.map(campaignSummary) };
  });

  server.post<{ Params: { campaignId: string }; Body: CampaignCommandBody }>("/api/campaigns/:campaignId/commands", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandId = request.headers["idempotency-key"];
    if (!commandId || Array.isArray(commandId)) {
      reply.code(400);
      return { error: "Idempotency-Key header is required" };
    }
    // HTTP boundary: raw request body, not yet validated against the Command union.
    // The command bus (handleCommand) validates shape/type before any event is produced.
    const command = request.body.command ?? (request.body as DmCommandInput);
    try {
      const projection = await repo.executeCommand(request.params.campaignId, { ...command, campaignId: request.params.campaignId, actorId: user.userId } as Command, { commandId, actorUserId: user.userId });
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
      // HTTP boundary: command is assembled from DM-supplied fields; handleCommand validates
      // the concrete shape for `type` before producing any event.
      const projection = await repo.executeCommand(request.params.campaignId, { ...command, campaignId: request.params.campaignId, actorId: user.userId } as Command, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: unknown) {
      const payload = commandErrorPayload(error);
      reply.code(payload.isConflict ? 409 : payload.statusCode);
      return { error: payload.message };
    }
  }

  server.patch<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId", async (request, reply) => executeDmCommand(request, reply, { type: "UpdateCampaign", ...(request.body ?? {}) }));

  server.delete<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request, _reply) => {
    await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaigns).set({ status: "deleted", updatedAt: new Date() }).where(eq(schema.campaigns.campaignId, request.params.campaignId));
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/export/markdown", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);

    const [state, events] = await Promise.all([
      repo.getCampaignState(request.params.campaignId),
      repo.loadEvents(request.params.campaignId),
    ]);
    const exportId = createId("exp");
    const exportDir = markdownExportDir(options.dataDir, request.params.campaignId, exportId);

    return writeMarkdownCampaignExport({
      state,
      events,
      exportDir,
      campaignId: request.params.campaignId,
      exportId,
    });
  });

  server.get<{ Params: { campaignId: string; exportId: string } }>("/api/campaigns/:campaignId/exports/:exportId/download", async (request, reply) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);

    if (!isSafeExportId(request.params.exportId)) {
      reply.code(400);
      return { error: "Invalid export ID" };
    }

    try {
      const filePath = join(markdownExportDir(options.dataDir, request.params.campaignId, request.params.exportId), MARKDOWN_PRIMARY_FILE);
      const content = await readFile(filePath);
      reply
        .type("text/markdown; charset=utf-8")
        .header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(MARKDOWN_PRIMARY_FILE)}`);
      return content;
    } catch (error) {
      if (isRecord(error) && error.code === "ENOENT") {
        reply.code(404);
        return { error: "Markdown export not found" };
      }
      throw error;
    }
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
    return profiles.map((profile) => ({ playerId: profile.profileId, displayName: profile.displayName, email: null, isActive: profile.status === "active", linkedCharacterEntityId: profile.linkedCharacterId }));
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

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/entities", async (request, reply) => executeDmCommand(request, reply, { type: "CreateEntity", ...(request.body ?? {}) }));
  server.patch<{ Params: { campaignId: string; entityId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => executeDmCommand(request, reply, { type: "UpdateEntity", entityId: request.params.entityId, ...(request.body ?? {}) }));
  server.delete<{ Params: { campaignId: string; entityId: string } }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => executeDmCommand(request, reply, { type: "ArchiveEntity", entityId: request.params.entityId }));

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/relations", async (request, reply) => executeDmCommand(request, reply, { type: "CreateRelation", ...(request.body ?? {}) }));
  server.put<{ Params: { campaignId: string; relationId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => executeDmCommand(request, reply, { type: "UpdateRelation", relationId: request.params.relationId, ...(request.body ?? {}) }));
  server.delete<{ Params: { campaignId: string; relationId: string } }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => executeDmCommand(request, reply, { type: "ArchiveRelation", relationId: request.params.relationId }));

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
  server.put<{ Params: { campaignId: string; factId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/facts/:factId", async (request, reply) => executeDmCommand(request, reply, { type: "UpdateFact", factId: request.params.factId, ...(request.body ?? {}) }));
}

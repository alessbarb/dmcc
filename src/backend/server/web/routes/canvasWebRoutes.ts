import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";

type CanvasParams = { campaignId: string; canvasId: string };
type NodeParams = CanvasParams & { nodeId: string };
type EdgeParams = CanvasParams & { edgeId: string };
type RequestBody = Record<string, unknown>;

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

function serializeCanvas(canvas: any) {
  if (!canvas) return null;
  return {
    ...canvas,
    canvasId: canvas.canvasId ?? canvas.id,
    id: canvas.id ?? canvas.canvasId,
    nodes: Array.isArray(canvas.nodes) ? canvas.nodes : [],
    edges: Array.isArray(canvas.edges) ? canvas.edges : [],
  };
}

function canvasesFromProjection(projection: any): any[] {
  const raw = projection?.canvases;
  if (!raw) return [];
  const values = raw instanceof Map ? Array.from(raw.values()) : Array.isArray(raw) ? raw : Object.values(raw);
  return values.map(serializeCanvas).filter((canvas) => canvas && !canvas.archived);
}

function getCanvasFromProjection(projection: any, canvasId: string): any | null {
  const raw = projection?.canvases;
  if (!raw) return null;
  const canvas = raw instanceof Map ? raw.get(canvasId) : Array.isArray(raw) ? raw.find((item: any) => item?.id === canvasId || item?.canvasId === canvasId) : (raw as Record<string, any>)[canvasId];
  return serializeCanvas(canvas);
}

async function executeCanvasCommand(
  request: FastifyRequest,
  reply: FastifyReply,
  campaignId: string,
  command: Record<string, unknown>,
  repo: PostgresCampaignRepository,
) {
  const { user } = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const commandIdHeader = request.headers["idempotency-key"];
  const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
  try {
    const projection = await repo.executeCommand(campaignId, {
      ...command,
      campaignId,
      actorId: user.userId,
    } as Command, { commandId, actorUserId: user.userId });
    campaignEventBus.publish(campaignId, { type: "projection.updated", sequence: projection.lastSequence });
    return { ok: true, sequence: projection.lastSequence, projection };
  } catch (error) {
    const payload = commandErrorPayload(error);
    reply.code(payload.isConflict ? 409 : payload.statusCode);
    return { error: payload.message };
  }
}

export async function registerCanvasWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/canvases", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);
    return { canvases: canvasesFromProjection(projection) };
  });

  server.get<{ Params: CanvasParams }>("/api/campaigns/:campaignId/canvases/:canvasId", async (request, reply) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);
    const canvas = getCanvasFromProjection(projection, request.params.canvasId);
    if (!canvas || canvas.archived) {
      reply.code(404);
      return { error: "Canvas not found" };
    }
    return canvas;
  });

  server.post<{ Params: { campaignId: string }; Body: RequestBody }>("/api/campaigns/:campaignId/canvases", async (request, reply) => {
    const body = request.body ?? {};
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "CreateCanvas",
      canvasId: body.canvasId ?? body.id,
      title: body.title ?? "Untitled canvas",
      kind: body.kind ?? "freeform",
      description: body.description,
      template: body.template,
    }, repo);
  });

  server.patch<{ Params: CanvasParams; Body: RequestBody }>("/api/campaigns/:campaignId/canvases/:canvasId", async (request, reply) => {
    const body = request.body ?? {};
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "UpdateCanvas",
      canvasId: request.params.canvasId,
      title: body.title,
      description: body.description,
      viewport: body.viewport,
    }, repo);
  });

  server.delete<{ Params: CanvasParams }>("/api/campaigns/:campaignId/canvases/:canvasId", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "ArchiveCanvas",
      canvasId: request.params.canvasId,
    }, repo);
  });

  server.post<{ Params: CanvasParams; Body: { node?: unknown } }>("/api/campaigns/:campaignId/canvases/:canvasId/nodes", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "PlaceNodeOnCanvas",
      canvasId: request.params.canvasId,
      node: request.body?.node ?? request.body ?? {},
    }, repo);
  });

  server.patch<{ Params: NodeParams; Body: { updates?: unknown } }>("/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "UpdateCanvasNode",
      canvasId: request.params.canvasId,
      nodeId: request.params.nodeId,
      updates: request.body?.updates ?? request.body ?? {},
    }, repo);
  });

  server.delete<{ Params: NodeParams }>("/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "RemoveNodeFromCanvas",
      canvasId: request.params.canvasId,
      nodeId: request.params.nodeId,
    }, repo);
  });

  server.post<{ Params: CanvasParams; Body: { edge?: unknown } }>("/api/campaigns/:campaignId/canvases/:canvasId/edges", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "AddEdgeToCanvas",
      canvasId: request.params.canvasId,
      edge: request.body?.edge ?? request.body ?? {},
    }, repo);
  });

  server.patch<{ Params: EdgeParams; Body: { updates?: unknown } }>("/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "UpdateCanvasEdge",
      canvasId: request.params.canvasId,
      edgeId: request.params.edgeId,
      updates: request.body?.updates ?? request.body ?? {},
    }, repo);
  });

  server.delete<{ Params: EdgeParams }>("/api/campaigns/:campaignId/canvases/:canvasId/edges/:edgeId", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "RemoveEdgeFromCanvas",
      canvasId: request.params.canvasId,
      edgeId: request.params.edgeId,
    }, repo);
  });

  server.patch<{ Params: CanvasParams; Body: { nodeUpdates?: unknown } }>("/api/campaigns/:campaignId/canvases/:canvasId/layout", async (request, reply) => {
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "UpdateCanvasNodesLayout",
      canvasId: request.params.canvasId,
      nodeUpdates: request.body?.nodeUpdates ?? [],
    }, repo);
  });

  server.post<{ Params: NodeParams; Body: RequestBody }>("/api/campaigns/:campaignId/canvases/:canvasId/nodes/:nodeId/convert", async (request, reply) => {
    const body = request.body ?? {};
    const entityId = typeof body.entityId === "string" ? body.entityId : createId("ent");
    const createResult: any = await executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "CreateEntity",
      entityId,
      entityType: body.entityType ?? "note",
      title: body.title ?? body.text ?? "Converted note",
      summary: body.summary,
      content: body.content ?? body.text,
      status: body.status,
      importance: body.importance,
      visibility: body.visibility,
      metadata: body.metadata,
      tagIds: body.tagIds,
    }, repo);
    if (createResult?.error) return createResult;
    return executeCanvasCommand(request, reply, request.params.campaignId, {
      type: "UpdateCanvasNode",
      canvasId: request.params.canvasId,
      nodeId: request.params.nodeId,
      updates: { kind: "entity", entityId, text: undefined },
    }, repo);
  });
}

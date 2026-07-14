import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";

async function executeNotebookCommand(
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
    return { ok: true, sequence: projection.lastSequence };
  } catch (error: any) {
    reply.code(error.name === "CommandConflictError" || /Conflict/.test(error.message) ? 409 : 500);
    return { error: error.message || "Command failed" };
  }
}

export async function registerNotebooksWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/notebooks", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);

    const notebooks = Array.from(projection.notebooks.values()).filter(n => !n.archivedAt);
    const items = Array.from(projection.notebookItems.values());

    return { notebooks, items };
  });

  server.post<{ Params: { campaignId: string }; Body: { title: string; parentNotebookId?: string | null; sortOrder?: number } }>(
    "/api/campaigns/:campaignId/notebooks",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const notebookId = createId("nbk");
      
      const notebooks = (await repo.getCampaignState(campaignId)).notebooks;
      const nextSortOrder = request.body.sortOrder ?? (Array.from(notebooks.values()).reduce((max, n) => Math.max(max, n.sortOrder), -1) + 1);

      return executeNotebookCommand(request, reply, campaignId, {
        type: "CreateNotebook",
        notebookId,
        parentNotebookId: request.body.parentNotebookId ?? null,
        title: request.body.title,
        sortOrder: nextSortOrder,
      }, repo);
    }
  );

  server.patch<{ Params: { campaignId: string; notebookId: string }; Body: { title?: string; parentNotebookId?: string | null } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeNotebookCommand(request, reply, campaignId, {
        type: "UpdateNotebook",
        notebookId: request.params.notebookId,
        title: request.body.title,
        parentNotebookId: request.body.parentNotebookId,
      }, repo);
    }
  );

  server.delete<{ Params: { campaignId: string; notebookId: string } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeNotebookCommand(request, reply, campaignId, {
        type: "ArchiveNotebook",
        notebookId: request.params.notebookId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; notebookId: string }; Body: { targetType: string; targetId: string } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId/items",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const notebookItemId = createId("nbi");
      
      const items = (await repo.getCampaignState(campaignId)).notebookItems;
      const nextSortOrder = Array.from(items.values())
        .filter(item => item.notebookId === request.params.notebookId)
        .reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;

      return executeNotebookCommand(request, reply, campaignId, {
        type: "AddNotebookItem",
        notebookItemId,
        notebookId: request.params.notebookId,
        targetType: request.body.targetType,
        targetId: request.body.targetId,
        sortOrder: nextSortOrder,
      }, repo);
    }
  );

  server.delete<{ Params: { campaignId: string; notebookItemId: string } }>(
    "/api/campaigns/:campaignId/notebooks/items/:notebookItemId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeNotebookCommand(request, reply, campaignId, {
        type: "RemoveNotebookItem",
        notebookItemId: request.params.notebookItemId,
      }, repo);
    }
  );

  server.patch<{ Params: { campaignId: string; notebookId: string }; Body: { orderedItemIds: string[] } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId/items/reorder",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeNotebookCommand(request, reply, campaignId, {
        type: "ReorderNotebookItems",
        notebookId: request.params.notebookId,
        orderedItemIds: request.body.orderedItemIds,
      }, repo);
    }
  );
}

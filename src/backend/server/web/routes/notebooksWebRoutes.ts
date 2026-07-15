import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import type { NotebookItemTargetType } from "@core/domain/resource/resourceType.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";
import { writeCommandError } from "../commandErrorResponse.js";

async function executeNotebookCommand(
  request: FastifyRequest,
  reply: FastifyReply,
  campaignId: string,
  command: Record<string, unknown>,
  repository: PostgresCampaignRepository,
) {
  const { user } = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const commandIdHeader = request.headers["idempotency-key"];
  const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
  try {
    const projection = await repository.executeCommand(campaignId, {
      ...command,
      campaignId,
      actorId: user.userId,
    } as Command, { commandId, actorUserId: user.userId });
    campaignEventBus.publish(campaignId, { type: "projection.updated", sequence: projection.lastSequence });
    return { ok: true, sequence: projection.lastSequence };
  } catch (error: unknown) {
    return writeCommandError(reply, error);
  }
}

export async function registerNotebooksWebRoutes(server: FastifyInstance): Promise<void> {
  const repository = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/notebooks", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repository.getCampaignState(request.params.campaignId);
    return {
      notebooks: Array.from(projection.notebooks.values()).filter((notebook) => !notebook.archivedAt),
      items: Array.from(projection.notebookItems.values()),
    };
  });

  server.post<{
    Params: { campaignId: string };
    Body: { title: string; description?: string | null; icon?: string | null; parentNotebookId?: string | null; sortOrder?: number };
  }>("/api/campaigns/:campaignId/notebooks", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const parentNotebookId = request.body.parentNotebookId ?? null;
    const notebooks = (await repository.getCampaignState(campaignId)).notebooks;
    const nextSortOrder = request.body.sortOrder ?? Array.from(notebooks.values())
      .filter((notebook) => notebook.parentNotebookId === parentNotebookId && !notebook.archivedAt)
      .reduce((maximum, notebook) => Math.max(maximum, notebook.sortOrder), -1) + 1;

    return executeNotebookCommand(request, reply, campaignId, {
      type: "CreateNotebook",
      notebookId: createId("nbk"),
      parentNotebookId,
      title: request.body.title,
      description: request.body.description ?? null,
      icon: request.body.icon ?? null,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.patch<{
    Params: { campaignId: string; notebookId: string };
    Body: { title?: string; description?: string | null; icon?: string | null; parentNotebookId?: string | null };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId", async (request, reply) => {
    return executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "UpdateNotebook",
      notebookId: request.params.notebookId,
      title: request.body.title,
      description: request.body.description,
      icon: request.body.icon,
      parentNotebookId: request.body.parentNotebookId,
    }, repository);
  });

  server.delete<{ Params: { campaignId: string; notebookId: string } }>(
    "/api/campaigns/:campaignId/notebooks/:notebookId",
    async (request, reply) => executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "ArchiveNotebook",
      notebookId: request.params.notebookId,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; notebookId: string };
    Body: { targetType: NotebookItemTargetType; targetId: string };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId/items", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const items = (await repository.getCampaignState(campaignId)).notebookItems;
    const nextSortOrder = Array.from(items.values())
      .filter((item) => item.notebookId === request.params.notebookId)
      .reduce((maximum, item) => Math.max(maximum, item.sortOrder), -1) + 1;

    return executeNotebookCommand(request, reply, campaignId, {
      type: "AddNotebookItem",
      notebookItemId: createId("nbi"),
      notebookId: request.params.notebookId,
      targetType: request.body.targetType,
      targetId: request.body.targetId,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.delete<{ Params: { campaignId: string; notebookItemId: string } }>(
    "/api/campaigns/:campaignId/notebooks/items/:notebookItemId",
    async (request, reply) => executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "RemoveNotebookItem",
      notebookItemId: request.params.notebookItemId,
    }, repository),
  );

  server.patch<{
    Params: { campaignId: string; notebookId: string };
    Body: { orderedItemIds: string[] };
  }>("/api/campaigns/:campaignId/notebooks/:notebookId/items/reorder", async (request, reply) => {
    return executeNotebookCommand(request, reply, request.params.campaignId, {
      type: "ReorderNotebookItems",
      notebookId: request.params.notebookId,
      orderedItemIds: request.body.orderedItemIds,
    }, repository);
  });
}

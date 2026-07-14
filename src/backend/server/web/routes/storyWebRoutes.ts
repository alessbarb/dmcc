import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";

async function executeStoryCommand(
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

export async function registerStoryWebRoutes(server: FastifyInstance): Promise<void> {
  const repo = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/story", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);

    const threads = Array.from(projection.storyThreads.values()).filter(t => !t.archivedAt);
    const steps = Array.from(projection.storySteps.values());

    return { threads, steps };
  });

  server.post<{ Params: { campaignId: string }; Body: { title: string; summary?: string | null; status?: string } }>(
    "/api/campaigns/:campaignId/story/threads",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const threadId = createId("sth");

      const threads = (await repo.getCampaignState(campaignId)).storyThreads;
      const nextSortOrder = Array.from(threads.values()).reduce((max, t) => Math.max(max, t.sortOrder), -1) + 1;

      return executeStoryCommand(request, reply, campaignId, {
        type: "CreateStoryThread",
        threadId,
        title: request.body.title,
        summary: request.body.summary ?? null,
        status: request.body.status ?? "planned",
        sortOrder: nextSortOrder,
      }, repo);
    }
  );

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { title?: string; summary?: string | null; status?: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "UpdateStoryThread",
        threadId: request.params.threadId,
        title: request.body.title,
        summary: request.body.summary,
        status: request.body.status,
      }, repo);
    }
  );

  server.delete<{ Params: { campaignId: string; threadId: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "ArchiveStoryThread",
        threadId: request.params.threadId,
      }, repo);
    }
  );

  server.patch<{ Params: { campaignId: string }; Body: { orderedThreadIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/reorder",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "ReorderStoryThreads",
        orderedThreadIds: request.body.orderedThreadIds,
      }, repo);
    }
  );

  server.post<{
    Params: { campaignId: string; threadId: string };
    Body: {
      title: string;
      intent?: string | null;
      expectedOutcome?: string | null;
      sceneEntityId?: string | null;
      plannedSessionId?: string | null;
      plannedSessionOrder?: number | null;
    };
  }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/steps",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const stepId = createId("stp");

      const steps = (await repo.getCampaignState(campaignId)).storySteps;
      const nextSortOrder = Array.from(steps.values())
        .filter(s => s.threadId === request.params.threadId)
        .reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;

      return executeStoryCommand(request, reply, campaignId, {
        type: "CreateStoryStep",
        stepId,
        threadId: request.params.threadId,
        title: request.body.title,
        intent: request.body.intent ?? null,
        expectedOutcome: request.body.expectedOutcome ?? null,
        sceneEntityId: request.body.sceneEntityId ?? null,
        plannedSessionId: request.body.plannedSessionId ?? null,
        plannedSessionOrder: request.body.plannedSessionOrder ?? null,
        sortOrder: nextSortOrder,
      }, repo);
    }
  );

  server.patch<{
    Params: { campaignId: string; stepId: string };
    Body: { title?: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null };
  }>(
    "/api/campaigns/:campaignId/story/steps/:stepId",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "UpdateStoryStep",
        stepId: request.params.stepId,
        title: request.body.title,
        intent: request.body.intent,
        expectedOutcome: request.body.expectedOutcome,
        sceneEntityId: request.body.sceneEntityId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string }; Body: { plannedSessionId: string; plannedSessionOrder: number } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/schedule",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "ScheduleStoryStep",
        stepId: request.params.stepId,
        plannedSessionId: request.body.plannedSessionId,
        plannedSessionOrder: request.body.plannedSessionOrder,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string }; Body: { plannedSessionId: string; plannedSessionOrder: number } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/defer",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "DeferStoryStep",
        stepId: request.params.stepId,
        plannedSessionId: request.body.plannedSessionId,
        plannedSessionOrder: request.body.plannedSessionOrder,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/unschedule",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "UnscheduleStoryStep",
        stepId: request.params.stepId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string }; Body: { resolvedSessionId: string; status: "resolved" | "discarded"; resolutionKind: "as_planned" | "changed" | "discarded"; actualOutcome?: string | null } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/reconcile",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "ReconcileStoryStep",
        stepId: request.params.stepId,
        resolvedSessionId: request.body.resolvedSessionId,
        status: request.body.status,
        resolutionKind: request.body.resolutionKind,
        actualOutcome: request.body.actualOutcome,
      }, repo);
    }
  );

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { orderedStepIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/steps/reorder",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "ReorderStorySteps",
        threadId: request.params.threadId,
        orderedStepIds: request.body.orderedStepIds,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; threadId: string }; Body: { entityId: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/link",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "LinkEntityToStoryThread",
        threadId: request.params.threadId,
        entityId: request.body.entityId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; threadId: string }; Body: { entityId: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/unlink",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "UnlinkEntityFromStoryThread",
        threadId: request.params.threadId,
        entityId: request.body.entityId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string }; Body: { entityId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/link",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "LinkEntityToStoryStep",
        stepId: request.params.stepId,
        entityId: request.body.entityId,
      }, repo);
    }
  );

  server.post<{ Params: { campaignId: string; stepId: string }; Body: { entityId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/unlink",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      return executeStoryCommand(request, reply, campaignId, {
        type: "UnlinkEntityFromStoryStep",
        stepId: request.params.stepId,
        entityId: request.body.entityId,
      }, repo);
    }
  );
}

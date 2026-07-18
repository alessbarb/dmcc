import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Command } from "@core/application/commands.js";
import { createId } from "@shared/ids.js";
import { campaignEventBus } from "../../realtime/campaignEventBus.js";
import { PostgresCampaignRepository } from "../postgresCampaignRepository.js";
import { requireCampaignRole } from "../webAccess.js";
import { writeCommandError } from "../commandErrorResponse.js";
import { requireIdempotencyKey } from "../idempotencyKey.js";

async function executeStoryCommand(
  request: FastifyRequest,
  reply: FastifyReply,
  campaignId: string,
  command: Record<string, unknown>,
  repository: PostgresCampaignRepository,
) {
  const { user } = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  let commandId: string;
  try {
    commandId = requireIdempotencyKey(request);
    // HTTP boundary: handleCommand validates the concrete shape before producing any event.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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

export async function registerStoryWebRoutes(server: FastifyInstance): Promise<void> {
  const repository = new PostgresCampaignRepository();

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/story", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repository.getCampaignState(request.params.campaignId);
    return {
      threads: Array.from(projection.storyThreads.values()).filter((thread) => !thread.archivedAt),
      steps: Array.from(projection.storySteps.values()),
    };
  });

  server.post<{ Params: { campaignId: string }; Body: { title: string; summary?: string | null } }>(
    "/api/campaigns/:campaignId/story/threads",
    async (request, reply) => {
      const campaignId = request.params.campaignId;
      const threads = (await repository.getCampaignState(campaignId)).storyThreads;
      const nextSortOrder = Array.from(threads.values())
        .filter((thread) => !thread.archivedAt)
        .reduce((maximum, thread) => Math.max(maximum, thread.sortOrder), -1) + 1;
      return executeStoryCommand(request, reply, campaignId, {
        type: "CreateStoryThread",
        threadId: createId("sth"),
        title: request.body.title,
        summary: request.body.summary ?? null,
        status: "planned",
        sortOrder: nextSortOrder,
      }, repository);
    },
  );

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { title?: string; summary?: string | null } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "UpdateStoryThread",
      threadId: request.params.threadId,
      title: request.body.title,
      summary: request.body.summary,
    }, repository),
  );

  for (const transition of [
    { path: "activate", type: "ActivateStoryThread" },
    { path: "resolve", type: "ResolveStoryThread" },
    { path: "discard", type: "DiscardStoryThread" },
  ] as const) {
    server.post<{ Params: { campaignId: string; threadId: string } }>(
      `/api/campaigns/:campaignId/story/threads/:threadId/${transition.path}`,
      async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
        type: transition.type,
        threadId: request.params.threadId,
      }, repository),
    );
  }

  server.delete<{ Params: { campaignId: string; threadId: string } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ArchiveStoryThread",
      threadId: request.params.threadId,
    }, repository),
  );

  server.patch<{ Params: { campaignId: string }; Body: { orderedThreadIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/reorder",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ReorderStoryThreads",
      orderedThreadIds: request.body.orderedThreadIds,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; threadId: string };
    Body: { title: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null; plannedSessionId?: string | null; plannedSessionOrder?: number | null };
  }>("/api/campaigns/:campaignId/story/threads/:threadId/steps", async (request, reply) => {
    const campaignId = request.params.campaignId;
    const steps = (await repository.getCampaignState(campaignId)).storySteps;
    const nextSortOrder = Array.from(steps.values())
      .filter((step) => step.threadId === request.params.threadId)
      .reduce((maximum, step) => Math.max(maximum, step.sortOrder), -1) + 1;
    return executeStoryCommand(request, reply, campaignId, {
      type: "CreateStoryStep",
      stepId: createId("stp"),
      threadId: request.params.threadId,
      title: request.body.title,
      intent: request.body.intent ?? null,
      expectedOutcome: request.body.expectedOutcome ?? null,
      sceneEntityId: request.body.sceneEntityId ?? null,
      plannedSessionId: request.body.plannedSessionId ?? null,
      plannedSessionOrder: request.body.plannedSessionOrder ?? null,
      sortOrder: nextSortOrder,
    }, repository);
  });

  server.patch<{
    Params: { campaignId: string; stepId: string };
    Body: { title?: string; intent?: string | null; expectedOutcome?: string | null; sceneEntityId?: string | null };
  }>("/api/campaigns/:campaignId/story/steps/:stepId", async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
    type: "UpdateStoryStep",
    stepId: request.params.stepId,
    title: request.body.title,
    intent: request.body.intent,
    expectedOutcome: request.body.expectedOutcome,
    sceneEntityId: request.body.sceneEntityId,
  }, repository));

  for (const scheduling of [
    { path: "schedule", type: "ScheduleStoryStep" },
    { path: "defer", type: "DeferStoryStep" },
  ] as const) {
    server.post<{ Params: { campaignId: string; stepId: string }; Body: { plannedSessionId: string; plannedSessionOrder: number } }>(
      `/api/campaigns/:campaignId/story/steps/:stepId/${scheduling.path}`,
      async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
        type: scheduling.type,
        stepId: request.params.stepId,
        plannedSessionId: request.body.plannedSessionId,
        plannedSessionOrder: request.body.plannedSessionOrder,
      }, repository),
    );
  }

  server.post<{ Params: { campaignId: string; stepId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/unschedule",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "UnscheduleStoryStep",
      stepId: request.params.stepId,
    }, repository),
  );

  server.post<{ Params: { campaignId: string; stepId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/ready",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "MarkStoryStepReady",
      stepId: request.params.stepId,
    }, repository),
  );

  server.post<{ Params: { campaignId: string; stepId: string } }>(
    "/api/campaigns/:campaignId/story/steps/:stepId/activate",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ActivateStoryStep",
      stepId: request.params.stepId,
    }, repository),
  );

  server.post<{
    Params: { campaignId: string; stepId: string };
    Body: { resolvedSessionId: string; status: "resolved" | "discarded"; resolutionKind: "as_planned" | "changed" | "discarded"; actualOutcome?: string | null };
  }>("/api/campaigns/:campaignId/story/steps/:stepId/reconcile", async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
    type: "ReconcileStoryStep",
    stepId: request.params.stepId,
    resolvedSessionId: request.body.resolvedSessionId,
    status: request.body.status,
    resolutionKind: request.body.resolutionKind,
    actualOutcome: request.body.actualOutcome,
  }, repository));

  server.patch<{ Params: { campaignId: string; threadId: string }; Body: { orderedStepIds: string[] } }>(
    "/api/campaigns/:campaignId/story/threads/:threadId/steps/reorder",
    async (request, reply) => executeStoryCommand(request, reply, request.params.campaignId, {
      type: "ReorderStorySteps",
      threadId: request.params.threadId,
      orderedStepIds: request.body.orderedStepIds,
    }, repository),
  );

  for (const target of ["threads", "steps"] as const) {
    const idName = target === "threads" ? "threadId" : "stepId";
    for (const action of ["link", "unlink"] as const) {
      server.post<{ Params: { campaignId: string; threadId?: string; stepId?: string }; Body: { entityId: string } }>(
        `/api/campaigns/:campaignId/story/${target}/:${idName}/${action}`,
        async (request, reply) => {
          const targetId = target === "threads" ? request.params.threadId : request.params.stepId;
          return executeStoryCommand(request, reply, request.params.campaignId, {
            type: `${action === "link" ? "Link" : "Unlink"}Entity${action === "link" ? "To" : "From"}Story${target === "threads" ? "Thread" : "Step"}`,
            [idName]: targetId,
            entityId: request.body.entityId,
          }, repository);
        },
      );
    }
  }
}

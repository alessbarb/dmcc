import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
} from "../../auth.js";
import { sendCommandError } from "../../commandHttp.js";

type PrepBody = { actorId?: string; sessionId?: string; title: string; scheduledAt?: string; prep?: Record<string, unknown> };
type UpdatePrepBody = { actorId?: string; title?: string; scheduledAt?: string; prep?: Record<string, unknown> };
type ActorBody = { actorId?: string };
type StartSessionBody = { actorId?: string; sessionId?: string; title?: string };
type RevealClueBody = { actorId?: string; clueEntityId: string; audience?: VisibilityRule; note?: string };
type CloseSessionBody = { actorId?: string; summary: string };
type SessionEventBody = {
  actorId?: string;
  sessionEventId?: string;
  type: string;
  title: string;
  description?: string;
  relatedEntityIds?: string[];
  relatedFactIds?: string[];
  relatedRelationIds?: string[];
  visibility?: VisibilityRule;
  metadata?: Record<string, unknown>;
};

function statusForDomainError(err: any): number {
  const message = String(err?.message ?? "");
  if (err?.code === "NOT_FOUND" || /not found|missing/i.test(message)) return 404;
  if (err?.code === "INVARIANT_VIOLATION" || /already active|only one active|only planned|only active|duplicate/i.test(message)) return 409;
  if (err?.code === "VALIDATION_FAILED" || /required|invalid|requires/i.test(message)) return 400;
  return 500;
}

export async function registerSessionRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  server.post<{ Params: { campaignId: string }; Body: PrepBody }>(
    "/api/campaigns/:campaignId/sessions/prepared",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { sessionId, title, scheduledAt, prep } = request.body;

      try {
        if (!title || !String(title).trim()) {
          reply.code(400);
          return { error: "Session title is required" };
        }
        const projection = await getRepository(vaultId).executeCommand(campaignId, {
          type: "CreatePreparedSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
          title: String(title).trim(),
          scheduledAt,
          prep: prep ?? { state: "draft" },
        });
        const created = sessionId
          ? projection.sessions.get(sessionId)
          : Array.from(projection.sessions.values()).find((s: any) => s.title === String(title).trim() && s.status === "planned");
        reply.code(201);
        return { sessionId: created?.sessionId || sessionId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.patch<{
    Params: { campaignId: string; sessionId: string };
    Body: UpdatePrepBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/prep",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const { title, scheduledAt, prep } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "UpdateSessionPrep",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
          title,
          scheduledAt,
          prep: prep ?? {},
        });
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: ActorBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/activate",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "ActivatePreparedSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: ActorBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/cancel",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "CancelPreparedSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: ActorBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/archive",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "ArchiveSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  // Legacy/ad-hoc endpoint: starts a live session immediately.
  server.post<{ Params: { campaignId: string }; Body: StartSessionBody }>(
    "/api/campaigns/:campaignId/sessions",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { sessionId, title } = request.body;

      try {
        const projection = await getRepository(vaultId).executeCommand(campaignId, {
          type: "StartSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
          title: title || `Sesión ${new Date().toLocaleDateString("es")}`,
        });
        const newSession = Array.from(projection.sessions.values())
          .find((s: any) => s.status === "active");
        reply.code(201);
        return { sessionId: newSession?.sessionId || sessionId };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: RevealClueBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/reveal-clue",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const { clueEntityId, audience, note } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "RevealClue",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          clueEntityId: clueEntityId,
          sessionId: sessionId,
          audience: (audience || { kind: "party" as const }) as VisibilityRule,
          note,
        });
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string };
    Body: { targetId: string; targetType: "entity" | "relation" | "fact"; visibility: VisibilityRule };
  }>(
    "/api/campaigns/:campaignId/visibility/change",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { targetId, targetType, visibility } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "ChangeVisibility",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          targetId,
          targetType,
          visibility,
        });
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: CloseSessionBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/close",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const { summary } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "CloseSession",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionId: sessionId,
          summary,
        });
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: SessionEventBody;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/events",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const { sessionEventId, type, title, description, relatedEntityIds, relatedFactIds, relatedRelationIds, visibility, metadata } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "RecordSessionEvent",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          sessionEventId,
          sessionId: sessionId,
          eventType: type,
          title,
          description,
          relatedEntityIds,
          relatedFactIds,
          relatedRelationIds,
          visibility,
          metadata,
        });
        reply.code(201);
        return { ok: true };
      } catch (err: any) {
        if (sendCommandError(reply, err)) return;
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );
}

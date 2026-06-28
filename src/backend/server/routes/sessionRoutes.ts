import type { FastifyInstance } from "fastify";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

function statusForDomainError(err: any): number {
  const message = String(err?.message ?? "");
  if (err?.code === "NOT_FOUND" || /not found|missing/i.test(message)) return 404;
  if (err?.code === "INVARIANT_VIOLATION" || /already active|only one active|only planned|only active|duplicate/i.test(message)) return 409;
  if (err?.code === "VALIDATION_FAILED" || /required|invalid|requires/i.test(message)) return 400;
  return 500;
}

export async function registerSessionRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/sessions/prepared",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body as any;
      const { actorId, sessionId, title, scheduledAt, prep } = body;

      try {
        if (!title || !String(title).trim()) {
          reply.code(400);
          return { error: "Session title is required" };
        }
        const projection = await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "CreatePreparedSession",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          sessionId: sessionId as any,
          title: String(title).trim(),
          scheduledAt,
          prep: prep ?? { state: "draft" },
        });
        const created = sessionId
          ? projection.sessions.get(sessionId)
          : Array.from(projection.sessions.values()).find((s: any) => s.title === String(title).trim() && s.status === "planned");
        reply.code(201);
        return { sessionId: (created as any)?.sessionId || sessionId };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.patch<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/prep",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;
      const { actorId, title, scheduledAt, prep } = body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "UpdateSessionPrep",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          sessionId: sessionId as any,
          title,
          scheduledAt,
          prep: prep ?? {},
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/activate",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "ActivatePreparedSession",
          campaignId: campaignId as any,
          actorId: body?.actorId || "usr_dm",
          sessionId: sessionId as any,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/cancel",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "CancelPreparedSession",
          campaignId: campaignId as any,
          actorId: body?.actorId || "usr_dm",
          sessionId: sessionId as any,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/archive",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "ArchiveSession",
          campaignId: campaignId as any,
          actorId: body?.actorId || "usr_dm",
          sessionId: sessionId as any,
        });
        return { ok: true, sessionId };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  // Legacy/ad-hoc endpoint: starts a live session immediately.
  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/sessions",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body as any;
      const { actorId, sessionId, title } = body;

      try {
        const projection = await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "StartSession",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          sessionId: sessionId as any,
          title: title || `Sesión ${new Date().toLocaleDateString("es")}`,
        });
        const newSession = Array.from(projection.sessions.values())
          .find((s: any) => s.status === "active");
        reply.code(201);
        return { sessionId: (newSession as any)?.sessionId || sessionId };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/reveal-clue",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;
      const { actorId, clueEntityId, audience, note } = body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "RevealClue",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          clueEntityId: clueEntityId as any,
          sessionId: sessionId as any,
          audience: audience || { kind: "party" as const },
          note,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string };
    Body: { targetId: string; targetType: "entity" | "relation" | "fact"; visibility: any };
  }>(
    "/api/campaigns/:campaignId/visibility/change",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { targetId, targetType, visibility } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "ChangeVisibility",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          targetId,
          targetType,
          visibility,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/close",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;
      const { actorId, summary } = body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "CloseSession",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          sessionId: sessionId as any,
          summary,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );

  server.post<{
    Params: { campaignId: string; sessionId: string };
    Body: any;
  }>(
    "/api/campaigns/:campaignId/sessions/:sessionId/events",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const sessionId = request.params.sessionId;
      const body = request.body as any;
      const { actorId, sessionEventId, type, title, description, relatedEntityIds, relatedFactIds, relatedRelationIds, visibility, metadata } = body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "RecordSessionEvent",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          sessionEventId,
          sessionId: sessionId as any,
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
        reply.code(statusForDomainError(err));
        return { error: err.message };
      }
    }
  );
}

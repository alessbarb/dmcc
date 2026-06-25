import type { FastifyInstance } from "fastify";
import { EventStore } from "../../persistence/eventStore/eventStore.js";
import { SnapshotStore } from "../../persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "../../persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

export async function registerSessionRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

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
        reply.code(500);
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
        reply.code(500);
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
        reply.code(500);
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
        reply.code(500);
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
      const { actorId, sessionEventId, type, title, description, relatedEntityIds, relatedFactIds, relatedRelationIds } = body;

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
        });
        reply.code(201);
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

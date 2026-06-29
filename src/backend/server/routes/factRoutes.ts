import type { FastifyInstance } from "fastify";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

export async function registerFactRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/facts",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body as any;
      const { actorId, factId, statement, kind, confidence, visibility, relatedEntityIds, relatedRelationIds, source } = body;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "RecordFact",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          factId: factId as any,
          statement,
          kind,
          confidence: confidence || "confirmed",
          visibility: visibility || { kind: "dm_only" as const },
          relatedEntityIds: relatedEntityIds || [],
          relatedRelationIds: relatedRelationIds || [],
          source: source || { kind: "manual" },
        });
        reply.code(201);
        return { campaignId, statement, kind };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.put<{ Params: { campaignId: string; factId: string }; Body: any }>(
    "/api/campaigns/:campaignId/facts/:factId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const factId = request.params.factId;
      const updates = request.body as any;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "UpdateFact",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          factId: factId as any,
          ...(updates.statement !== undefined && { statement: updates.statement }),
          ...(updates.kind !== undefined && { kind: updates.kind }),
          ...(updates.confidence !== undefined && { confidence: updates.confidence }),
          ...(updates.visibility !== undefined && { visibility: updates.visibility }),
        });
        return { ok: true };
      } catch (err: any) {
        if (err.message?.includes("not found")) {
          reply.code(404);
          return { error: "Fact not found" };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.delete<{ Params: { campaignId: string; factId: string } }>(
    "/api/campaigns/:campaignId/facts/:factId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const factId = request.params.factId;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "ArchiveFact",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          factId: factId as any,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

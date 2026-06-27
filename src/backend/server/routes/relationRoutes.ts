import type { FastifyInstance } from "fastify";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

export async function registerRelationRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: any }>(
    "/api/campaigns/:campaignId/relations",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const body = request.body as any;
      const { actorId, relationId, sourceEntityId, targetEntityId, relationType, description, visibility } = body;
      const isForced = (request.query as any)?.force === "true";

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId as any);

        const isDuplicate = Array.from(state.relations.values()).some(
          (r: any) => !r.archived && r.sourceEntityId === sourceEntityId
            && r.targetEntityId === targetEntityId && r.relationType === relationType
        );
        if (isDuplicate && !isForced) {
          reply.code(409);
          return { error: "Duplicate relation found", duplicate: true };
        }

        await repo.executeCommand(campaignId as any, {
          type: "CreateRelation",
          campaignId: campaignId as any,
          actorId: actorId || "usr_dm",
          relationId: relationId as any,
          sourceEntityId: sourceEntityId as any,
          targetEntityId: targetEntityId as any,
          relationType,
          description,
          visibility: visibility || { kind: "dm_only" as const },
          allowDuplicate: isForced,
        });
        reply.code(201);
        return { campaignId, sourceEntityId, targetEntityId, relationType };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.put<{ Params: { campaignId: string; relationId: string }; Body: any }>(
    "/api/campaigns/:campaignId/relations/:relationId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const relationId = request.params.relationId;
      const updates = request.body as any;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId as any, {
          type: "UpdateRelation",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          relationId: relationId as any,
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.visibility !== undefined && { visibility: updates.visibility }),
        });
        return { ok: true };
      } catch (err: any) {
        if (err.message?.includes("not found")) {
          reply.code(404);
          return { error: "Relation not found" };
        }
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.delete<{ Params: { campaignId: string; relationId: string } }>(
    "/api/campaigns/:campaignId/relations/:relationId",
    async (request, reply) => {
      assertDM(request, (server as any).dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const relationId = request.params.relationId;

      try {
        await getRepository(vaultId).executeCommand(campaignId as any, {
          type: "ArchiveRelation",
          campaignId: campaignId as any,
          actorId: "usr_dm",
          relationId: relationId as any,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

import type { FastifyInstance } from "fastify";
import { makeRepositoryFactory } from "../repositoryFactory.js";
import type { RelationType } from "@core/domain/relation/types.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
  getRequestActorId,
} from "../auth.js";

type CreateRelationBody = {
  actorId?: string;
  relationId?: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: RelationType;
  description?: string;
  visibility?: VisibilityRule;
};

type UpdateRelationBody = {
  description?: string;
  visibility?: VisibilityRule;
  relationType?: RelationType;
};

export async function registerRelationRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  const getRepository = makeRepositoryFactory(dataDir);

  server.post<{ Params: { campaignId: string }; Body: CreateRelationBody; Querystring: { force?: string } }>(
    "/api/campaigns/:campaignId/relations",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { relationId, sourceEntityId, targetEntityId, relationType, description, visibility } = request.body;
      const isForced = request.query.force === "true";

      try {
        const repo = getRepository(vaultId);
        const state = await repo.getCampaignState(campaignId);

        const isDuplicate = Array.from(state.relations.values()).some(
          (r: any) => !r.archived && r.sourceEntityId === sourceEntityId
            && r.targetEntityId === targetEntityId && r.relationType === relationType
        );
        if (isDuplicate && !isForced) {
          reply.code(409);
          return { error: "Duplicate relation found", duplicate: true };
        }

        await repo.executeCommand(campaignId, {
          type: "CreateRelation",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          relationId: relationId,
          sourceEntityId: sourceEntityId,
          targetEntityId: targetEntityId,
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

  server.put<{ Params: { campaignId: string; relationId: string }; Body: UpdateRelationBody }>(
    "/api/campaigns/:campaignId/relations/:relationId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const relationId = request.params.relationId;
      const updates = request.body;

      try {
        const repo = getRepository(vaultId);
        await repo.executeCommand(campaignId, {
          type: "UpdateRelation",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          relationId: relationId,
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const relationId = request.params.relationId;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "ArchiveRelation",
          campaignId: campaignId,
          actorId: getRequestActorId(request, server.dmSessionToken),
          relationId: relationId,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

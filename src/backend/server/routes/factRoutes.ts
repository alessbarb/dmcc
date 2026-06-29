import type { FastifyInstance } from "fastify";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import type { FactKind, FactConfidence } from "@core/domain/fact/types.js";
import type { FactSource } from "@core/domain/fact/fact.js";
import type { VisibilityRule } from "@core/domain/visibility/visibility.js";
import {
  assertDM,
  getValidatedVaultId,
  getValidatedCampaignId,
} from "../auth.js";

type CreateFactBody = {
  actorId?: string;
  factId?: string;
  statement: string;
  kind: FactKind;
  confidence?: FactConfidence;
  visibility?: VisibilityRule;
  relatedEntityIds?: string[];
  relatedRelationIds?: string[];
  source?: FactSource;
};

type UpdateFactBody = {
  statement?: string;
  kind?: FactKind;
  confidence?: FactConfidence;
  visibility?: VisibilityRule;
};

export async function registerFactRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: CreateFactBody }>(
    "/api/campaigns/:campaignId/facts",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { actorId, factId, statement, kind, confidence, visibility, relatedEntityIds, relatedRelationIds, source } = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "RecordFact",
          campaignId: campaignId,
          actorId: actorId || "usr_dm",
          factId: factId,
          statement,
          kind,
          confidence: confidence || "confirmed",
          visibility: visibility || { kind: "dm_only" as const },
          relatedEntityIds: relatedEntityIds || [],
          relatedRelationIds: relatedRelationIds || [],
          source: (source ?? { kind: "manual" as const }),
        });
        reply.code(201);
        return { campaignId, statement, kind };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.put<{ Params: { campaignId: string; factId: string }; Body: UpdateFactBody }>(
    "/api/campaigns/:campaignId/facts/:factId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const factId = request.params.factId;
      const updates = request.body;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "UpdateFact",
          campaignId: campaignId,
          actorId: "usr_dm",
          factId: factId,
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
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const factId = request.params.factId;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "ArchiveFact",
          campaignId: campaignId,
          actorId: "usr_dm",
          factId: factId,
        });
        return { ok: true };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

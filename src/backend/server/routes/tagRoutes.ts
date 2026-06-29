import type { FastifyInstance } from "fastify";
import { EventStore } from "@core/persistence/eventStore/eventStore.js";
import { SnapshotStore } from "@core/persistence/snapshotStore/snapshotStore.js";
import { CampaignRepository } from "@core/persistence/repositories/campaignRepository.js";
import { assertDM, getValidatedVaultId, getValidatedCampaignId } from "../auth.js";
import { createId } from "@shared/ids.js";

export async function registerTagRoutes(server: FastifyInstance, opts: { dataDir: string }) {
  const { dataDir } = opts;

  function getRepository(vaultId = "default") {
    return new CampaignRepository(new EventStore(dataDir, vaultId), new SnapshotStore(dataDir, vaultId));
  }

  server.post<{ Params: { campaignId: string }; Body: { name: string; color?: string; tagId?: string } }>(
    "/api/campaigns/:campaignId/tags",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { name, color, tagId: requestedTagId } = request.body;

      if (!name || name.trim() === "") {
        reply.code(400);
        return { error: "Tag name is required" };
      }

      const tagId = requestedTagId ?? createId("tag");

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "CreateTag",
          campaignId: campaignId,
          actorId: "usr_dm",
          tagId,
          name: name.trim(),
          color,
        });
        reply.code(201);
        return { tagId, name: name.trim(), color };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/tags",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);

      try {
        const state = await getRepository(vaultId).getCampaignState(campaignId);
        const tags = Array.from((state.tags ?? new Map()).values());
        return { tags };
      } catch {
        reply.code(404);
        return { error: "Campaign not found" };
      }
    }
  );

  server.post<{ Params: { campaignId: string; entityId: string }; Body: { tagId: string } }>(
    "/api/campaigns/:campaignId/entities/:entityId/tags",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { entityId } = request.params;
      const { tagId } = request.body;

      if (!tagId || tagId.trim() === "") {
        reply.code(400);
        return { error: "tagId is required" };
      }

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "AddTagToEntity",
          campaignId: campaignId,
          actorId: "usr_dm",
          entityId: entityId,
          tagId,
        });
        reply.code(201);
        return { ok: true, entityId, tagId };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );

  server.delete<{ Params: { campaignId: string; entityId: string; tagId: string } }>(
    "/api/campaigns/:campaignId/entities/:entityId/tags/:tagId",
    async (request, reply) => {
      assertDM(request, server.dmSessionToken);
      const vaultId = getValidatedVaultId(request);
      const campaignId = getValidatedCampaignId(request.params.campaignId);
      const { entityId, tagId } = request.params;

      try {
        await getRepository(vaultId).executeCommand(campaignId, {
          type: "RemoveTagFromEntity",
          campaignId: campaignId,
          actorId: "usr_dm",
          entityId: entityId,
          tagId,
        });
        return { ok: true, entityId, tagId };
      } catch (err: any) {
        reply.code(500);
        return { error: err.message };
      }
    }
  );
}

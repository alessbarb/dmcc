import type { FastifyInstance } from "fastify";
import { buildDmPlayerKnowledgeProjection } from "../playerKnowledgeProjection.js";
import { requireCampaignRole } from "../webAccess.js";

export async function registerPlayerKnowledgeWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-knowledge",
    async (request) => {
      await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      return buildDmPlayerKnowledgeProjection(request.params.campaignId);
    },
  );
}

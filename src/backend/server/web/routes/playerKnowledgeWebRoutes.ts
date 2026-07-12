import type { FastifyInstance } from "fastify";
import { buildDmPlayerKnowledgeProjection, synchronizeLegacyKnowledgeVisibility } from "../playerKnowledgeProjection.js";
import { requireCampaignRole } from "../webAccess.js";

function campaignIdFromPortalPath(pathname: string): string | null {
  const playerMatch = pathname.match(/^\/api\/player\/campaigns\/([^/]+)/);
  if (playerMatch) return decodeURIComponent(playerMatch[1]);
  const portalMatch = pathname.match(/^\/api\/campaigns\/([^/]+)\/player-portal(?:\/|$)/);
  return portalMatch ? decodeURIComponent(portalMatch[1]) : null;
}

export async function registerPlayerKnowledgeWebRoutes(server: FastifyInstance): Promise<void> {
  server.addHook("preHandler", async (request) => {
    const pathname = request.url.split("?", 1)[0];
    const campaignId = campaignIdFromPortalPath(pathname);
    if (campaignId) await synchronizeLegacyKnowledgeVisibility(campaignId);
  });

  server.get<{ Params: { campaignId: string } }>(
    "/api/campaigns/:campaignId/player-knowledge",
    async (request) => {
      await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
      return buildDmPlayerKnowledgeProjection(request.params.campaignId);
    },
  );
}

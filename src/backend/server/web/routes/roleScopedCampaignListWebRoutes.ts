import type { FastifyInstance } from "fastify";

interface CampaignSummary {
  role?: string | null;
  playerId?: string | null;
}

function requestPath(url: string): string {
  return url.split("?", 1)[0];
}

export async function registerRoleScopedCampaignListWebRoutes(server: FastifyInstance): Promise<void> {
  server.addHook("preSerialization", async (request, _reply, payload) => {
    if (request.method !== "GET") return payload;
    const path = requestPath(request.url);

    if (path === "/api/campaigns" && Array.isArray(payload)) {
      return (payload as CampaignSummary[]).filter(
        (campaign) => campaign.role === "dm" || campaign.role === "co_dm",
      );
    }

    if (path === "/api/player/campaigns" && payload && typeof payload === "object") {
      const response = payload as { campaigns?: CampaignSummary[] };
      return {
        ...response,
        campaigns: Array.isArray(response.campaigns)
          ? response.campaigns.filter(
              (campaign) => campaign.role === "player" && Boolean(campaign.playerId),
            )
          : [],
      };
    }

    return payload;
  });
}

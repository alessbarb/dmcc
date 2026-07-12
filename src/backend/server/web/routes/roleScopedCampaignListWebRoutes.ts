import type { FastifyInstance } from "fastify";

export interface CampaignSummary {
  role?: string | null;
  playerId?: string | null;
}

function requestPath(url: string): string {
  return url.split("?", 1)[0];
}

export function scopeDmCampaigns<T extends CampaignSummary>(campaigns: T[]): T[] {
  return campaigns.filter(
    (campaign) => campaign.role === "dm" || campaign.role === "co_dm",
  );
}

export function scopePlayerCampaigns<T extends CampaignSummary>(campaigns: T[]): T[] {
  return campaigns.filter(
    (campaign) => campaign.role === "player" && Boolean(campaign.playerId),
  );
}

export async function registerRoleScopedCampaignListWebRoutes(server: FastifyInstance): Promise<void> {
  server.addHook("preSerialization", async (request, _reply, payload) => {
    if (request.method !== "GET") return payload;
    const path = requestPath(request.url);

    if (path === "/api/campaigns" && Array.isArray(payload)) {
      return scopeDmCampaigns(payload as CampaignSummary[]);
    }

    if (path === "/api/player/campaigns" && payload && typeof payload === "object") {
      const response = payload as { campaigns?: CampaignSummary[] };
      return {
        ...response,
        campaigns: Array.isArray(response.campaigns)
          ? scopePlayerCampaigns(response.campaigns)
          : [],
      };
    }

    return payload;
  });
}

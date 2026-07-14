import type { FastifyInstance } from "fastify";
import { requireCampaignRole } from "../webAccess.js";
import { activityRepository } from "../../activity/activityRepository.js";
import type { ActivityFilter } from "@core/projections/activity/activityTypes.js";

export async function registerHistoryWebRoutes(server: FastifyInstance): Promise<void> {
  server.get<{
    Params: { campaignId: string };
    Querystring: {
      category?: string;
      actorUserId?: string;
      sessionId?: string;
      targetType?: string;
      targetId?: string;
      cursor?: string;
      limit?: string;
    };
  }>("/api/campaigns/:campaignId/history", async (request) => {
    const campaignId = request.params.campaignId;
    await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);

    const query = request.query;
    const limit = query.limit ? parseInt(query.limit, 10) : undefined;

    const filters: ActivityFilter = {
      category: query.category,
      actorUserId: query.actorUserId,
      sessionId: query.sessionId,
      targetType: query.targetType,
      targetId: query.targetId,
      cursor: query.cursor,
      limit: isNaN(limit as any) ? undefined : limit,
    };

    const history = await activityRepository.findCampaignHistory(null, campaignId, filters);
    return history;
  });
}

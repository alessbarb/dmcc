import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import type { DbClient, DbTransaction } from "../../db/client.js";
import { campaignSessions } from "../../db/schema.js";
import { activityRepository } from "./activityRepository.js";
import type { CampaignActivityCategory, CampaignActivityData } from "../../../core/projections/activity/activityTypes.js";

type DbExecutor = DbClient | DbTransaction;

export async function assertSessionBelongsToCampaign(tx: DbExecutor, campaignId: string, sessionId: string): Promise<void> {
  const client = tx ?? db;
  const [session] = await client
    .select({ sessionId: campaignSessions.sessionId })
    .from(campaignSessions)
    .where(
      and(
        eq(campaignSessions.campaignId, campaignId),
        eq(campaignSessions.sessionId, sessionId)
      )
    )
    .limit(1);

  if (!session) {
    throw new Error(`Session ${sessionId} does not belong to campaign ${campaignId}`);
  }
}

export async function recordOperationalActivity(
  tx: DbExecutor,
  params: {
    campaignId: string;
    sourceId: string;
    type: string;
    category: CampaignActivityCategory;
    data: CampaignActivityData;
    actorUserId?: string | null;
    sessionId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    occurredAt?: Date;
  }
): Promise<void> {
  if (params.sessionId) {
    await assertSessionBelongsToCampaign(tx, params.campaignId, params.sessionId);
  }

  await activityRepository.recordOperationalActivity(tx, params);
}

import { and, eq, lte } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { enqueueCampaignPurge } from "./campaignPurgeJobs.js";

/**
 * Scans for campaigns in the trash whose retention period has expired
 * (purgeEligibleAt <= current time) and enqueues them for background physical purging.
 */
export async function enqueueExpiredCampaignPurges(): Promise<string[]> {
  const now = new Date();

  // Find expired campaigns
  const expiredCampaigns = await db
    .select({ campaignId: schema.campaigns.campaignId })
    .from(schema.campaigns)
    .where(
      and(
        eq(schema.campaigns.status, "trashed"),
        lte(schema.campaigns.purgeEligibleAt, now)
      )
    );

  const enqueued: string[] = [];

  for (const campaign of expiredCampaigns) {
    const result = await enqueueCampaignPurge({
      campaignId: campaign.campaignId,
      actorType: "system",
      reason: "retention_expired",
    });

    if (result.outcome === "enqueued") {
      enqueued.push(campaign.campaignId);
    }
  }

  return enqueued;
}

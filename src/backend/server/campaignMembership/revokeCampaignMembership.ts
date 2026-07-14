import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";

/**
 * Sole writer of `campaign_memberships.revoked_at`. Membership rows are never
 * deleted — they're marked revoked so history/audit trails survive. Personal
 * shortcuts are not FK-cascaded by a revoke (only by a hard delete), so they're
 * cleared explicitly in the same transaction: reactivating a membership later
 * must not resurrect old shortcuts.
 */
export async function revokeCampaignMembership(campaignId: string, userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(schema.campaignShortcuts)
      .where(and(
        eq(schema.campaignShortcuts.campaignId, campaignId),
        eq(schema.campaignShortcuts.userId, userId),
      ));

    await tx
      .update(schema.campaignMemberships)
      .set({ revokedAt: new Date() })
      .where(and(
        eq(schema.campaignMemberships.campaignId, campaignId),
        eq(schema.campaignMemberships.userId, userId),
      ));
  });
}

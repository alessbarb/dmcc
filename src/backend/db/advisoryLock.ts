import { sql } from "drizzle-orm";
import type { DbTransaction } from "./client.js";

export async function acquireCampaignAdvisoryLock(
  tx: DbTransaction,
  campaignId: string,
): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${campaignId}::text, 0))`);
}

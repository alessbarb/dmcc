import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { claimCampaignPurgeJob, processCampaignPurge } from "./processCampaignPurge.js";
import { randomUUID } from "node:crypto";

export type PurgeBatchResult = {
  processedCount: number;
  successes: string[];
  failures: { jobId: string; error: string }[];
};

/**
 * Finds and processes pending or failed campaign purge jobs.
 * Uses SKIP LOCKED to allow multiple concurrent worker processes to process batches safely.
 */
export async function processPendingCampaignPurges(params: {
  limit?: number;
  workerId?: string;
}): Promise<PurgeBatchResult> {
  const limit = params.limit ?? 10;
  const workerId = params.workerId ?? `worker_${randomUUID()}`;

  const successes: string[] = [];
  const failures: { jobId: string; error: string }[] = [];

  // 1. Find a batch of job IDs using SKIP LOCKED
  const jobIds = await db.transaction(async (tx) => {
    const result = await tx.execute(sql`
      SELECT job_id
      FROM campaign_purge_jobs
      WHERE status IN ('pending', 'failed')
        AND attempt_count < 5
      ORDER BY created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED;
    `);

    return result.rows.map((row) => String(row.job_id));
  });

  // 2. Process each job individually
  for (const jobId of jobIds) {
    const leaseToken = randomUUID();
    try {
      const claimedJob = await claimCampaignPurgeJob({ jobId, workerId, leaseToken });
      if (!claimedJob) {
        continue; // Was claimed or changed status in the meantime
      }

      await processCampaignPurge(claimedJob);
      successes.push(jobId);
    } catch (error: unknown) {
      failures.push({
        jobId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    processedCount: successes.length + failures.length,
    successes,
    failures,
  };
}

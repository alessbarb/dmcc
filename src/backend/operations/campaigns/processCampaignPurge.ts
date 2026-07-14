import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { campaignPurgeJobs, operationsAuditLog, type CampaignPurgeManifestV1 } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";
import { deleteStorageKey } from "../storage/campaignStorage.js";

const LEASE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export type ClaimedJob = {
  jobId: string;
  campaignId: string;
  workerId: string;
  leaseToken: string;
  resourceManifest: CampaignPurgeManifestV1;
};

/**
 * Attempts to claim a pending or failed purge job for a worker.
 * Returns the claimed job info, or null if no job is available.
 */
export async function claimCampaignPurgeJob(params: {
  jobId: string;
  workerId: string;
  leaseToken: string;
}): Promise<ClaimedJob | null> {
  const { jobId, workerId, leaseToken } = params;

  return await db.transaction(async (tx) => {
    const jobs = await tx
      .select()
      .from(campaignPurgeJobs)
      .where(eq(campaignPurgeJobs.jobId, jobId))
      .for("update");

    const job = jobs[0];
    if (!job) return null;
    if (job.status !== "pending" && job.status !== "failed") {
      return null;
    }

    const now = new Date();
    const leaseExpiresAt = new Date(now.getTime() + LEASE_DURATION_MS);

    await tx
      .update(campaignPurgeJobs)
      .set({
        status: "running",
        workerId,
        leaseToken,
        leaseExpiresAt,
        firstStartedAt: job.firstStartedAt || now,
        lastAttemptAt: now,
        attemptCount: job.attemptCount + 1,
        updatedAt: now,
      })
      .where(eq(campaignPurgeJobs.jobId, jobId));

    return {
      jobId: job.jobId,
      campaignId: job.campaignId,
      workerId,
      leaseToken,
      resourceManifest: job.resourceManifest,
    };
  });
}

/**
 * Renews the lease for a running job to prevent it from expiring.
 */
export async function renewCampaignPurgeLease(params: {
  jobId: string;
  workerId: string;
  leaseToken: string;
}): Promise<boolean> {
  const { jobId, workerId, leaseToken } = params;
  const now = new Date();
  const leaseExpiresAt = new Date(now.getTime() + LEASE_DURATION_MS);

  const rawResult = await db.execute(sql`
    UPDATE campaign_purge_jobs
    SET lease_expires_at = ${leaseExpiresAt}, updated_at = ${now}
    WHERE job_id = ${jobId}
      AND status = 'running'
      AND worker_id = ${workerId}
      AND lease_token = ${leaseToken}
    RETURNING job_id;
  `);

  return rawResult.rows.length > 0;
}

/**
 * Processes a claimed purge job.
 * 1. Physical assets deletion (outside transaction).
 * 2. Database records deletion (inside transaction, enforcing lease checks).
 */
export async function processCampaignPurge(job: ClaimedJob): Promise<void> {
  const { jobId, campaignId, workerId, leaseToken, resourceManifest } = job;

  // Validate manifest version
  if (resourceManifest.schemaVersion !== 1) {
    const errorMsg = `Unsupported manifest version: ${resourceManifest.schemaVersion}`;
    await markJobFailed(jobId, "UNSUPPORTED_VERSION", errorMsg);
    throw new Error(errorMsg);
  }

  // 1. Physical deletion
  try {
    for (const resource of resourceManifest.resources) {
      // Periodic check: verify lease is still active before continuing file deletion
      const isLeaseOk = await renewCampaignPurgeLease({ jobId, workerId, leaseToken });
      if (!isLeaseOk) {
        throw new Error("Lease lost during physical file deletion");
      }

      await deleteStorageKey(resource.storageKey);
    }
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    await markJobFailed(jobId, "FS_DELETE_ERROR", errMsg);
    throw error;
  }

  // 2. Database deletion (inside a fast transaction, checking lease again)
  await db.transaction(async (tx) => {
    const now = new Date();

    // Verify lease is still valid and owned by us
    const jobs = await tx
      .select()
      .from(campaignPurgeJobs)
      .where(
        and(
          eq(campaignPurgeJobs.jobId, jobId),
          eq(campaignPurgeJobs.status, "running"),
          eq(campaignPurgeJobs.workerId, workerId),
          eq(campaignPurgeJobs.leaseToken, leaseToken),
          sql`${campaignPurgeJobs.leaseExpiresAt} > ${now}`
        )
      )
      .for("update");

    const activeJob = jobs[0];
    if (!activeJob) {
      throw new Error("Lease lost or expired before database commit");
    }

    // Delete the campaign row (Cascade deletes will remove all campaign-owned tables)
    await tx.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId));

    // Update job to completed
    await tx
      .update(campaignPurgeJobs)
      .set({
        status: "completed",
        completedAt: now,
        workerId: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(campaignPurgeJobs.jobId, jobId));

    // Write audit log
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId: null,
      actorType: "system",
      action: "campaign.purged",
      targetType: "campaign",
      targetId: campaignId,
      details: { jobId },
    });
  });
}

async function markJobFailed(jobId: string, code: string, message: string): Promise<void> {
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(campaignPurgeJobs)
      .set({
        status: "failed",
        lastErrorCode: code,
        lastErrorMessage: message,
        workerId: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(campaignPurgeJobs.jobId, jobId));

    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId: null,
      actorType: "system",
      action: "campaign.purge_failed",
      targetType: "campaign_purge_job",
      targetId: jobId,
      details: { code, message },
    });
  });
}

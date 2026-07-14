import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { campaignPurgeJobs, operationsAuditLog } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../server/errors.js";

/**
 * Moves a campaign to the trash by setting its status, trashed_at, trashed_by_user_id,
 * and computing its purge_eligible_at (30 days from now).
 */
export async function moveCampaignToTrash(params: {
  campaignId: string;
  actorUserId: string;
}): Promise<void> {
  const { campaignId, actorUserId } = params;

  await db.transaction(async (tx) => {
    // 1. Verify campaign exists and is active
    const campaigns = await tx
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);

    const campaign = campaigns[0];
    if (!campaign) {
      throw new HttpError("Campaign not found", 404);
    }
    if (campaign.status === "trashed") {
      return; // Already trashed, idempotent success
    }

    const now = new Date();
    const purgeEligibleAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // 2. Update campaign status and trash metadata
    await tx
      .update(schema.campaigns)
      .set({
        status: "trashed",
        trashedAt: now,
        trashedByUserId: actorUserId,
        purgeEligibleAt,
      })
      .where(eq(schema.campaigns.campaignId, campaignId));

    // 3. Insert audit log entry
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "campaign.trashed",
      targetType: "campaign",
      targetId: campaignId,
      details: { actorUserId, trashedAt: now.toISOString() },
    });
  });
}

/**
 * Restores a campaign from the trash to active.
 * Reject with 409 Conflict if a purge job for this campaign is already running,
 * failed, or pending with attemptCount > 0.
 * If the job is pending and attemptCount === 0, cancels the job and activates the campaign.
 */
export async function restoreCampaign(params: {
  campaignId: string;
  actorUserId: string;
}): Promise<void> {
  const { campaignId, actorUserId } = params;

  await db.transaction(async (tx) => {
    // 1. Verify campaign exists and is currently trashed
    const campaigns = await tx
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);

    const campaign = campaigns[0];
    if (!campaign) {
      throw new HttpError("Campaign not found", 404);
    }
    if (campaign.status === "active" || campaign.status === "importing") {
      return; // Already active, idempotent success
    }

    // 2. Lock and inspect active purge jobs
    const activeJobs = await tx
      .select()
      .from(campaignPurgeJobs)
      .where(
        and(
          eq(campaignPurgeJobs.campaignId, campaignId),
          inArray(campaignPurgeJobs.status, ["pending", "running", "failed"])
        )
      )
      .for("update");

    const activeJob = activeJobs[0];
    if (activeJob) {
      const { status, attemptCount, jobId } = activeJob;
      if (status === "running" || status === "failed" || (status === "pending" && attemptCount > 0)) {
        throw new HttpError("Campaign purge in progress or has failed attempts", 409);
      }

      // If pending and attemptCount === 0, cancel it
      if (status === "pending" && attemptCount === 0) {
        await tx
          .update(campaignPurgeJobs)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(campaignPurgeJobs.jobId, jobId));

        // Audit the cancellation of the purge job
        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId,
          actorType: "user",
          action: "campaign.purge_cancelled",
          targetType: "campaign_purge_job",
          targetId: jobId,
          details: { actorUserId, campaignId },
        });
      }
    }

    // 3. Restore campaign
    await tx
      .update(schema.campaigns)
      .set({
        status: "active",
        trashedAt: null,
        trashedByUserId: null,
        purgeEligibleAt: null,
      })
      .where(eq(schema.campaigns.campaignId, campaignId));

    // 4. Audit the restoration
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "campaign.restored",
      targetType: "campaign",
      targetId: campaignId,
      details: { actorUserId },
    });
  });
}

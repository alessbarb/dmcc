import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { operationsAuditLog, type CampaignPurgeManifestV1, type CampaignPurgeReason, type OperationActorType } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";

export type EnqueuePurgeResult =
  | { outcome: "already_queued" }
  | { outcome: "enqueued"; jobId: string };

/**
 * Enqueues a campaign purge job. Builds the manifest of resources (attachments and export directory)
 * to delete. Performs a conflict-directed insert to prevent duplicate active purge jobs.
 */
export async function enqueueCampaignPurge(params: {
  campaignId: string;
  actorUserId?: string;
  actorType: OperationActorType;
  reason: CampaignPurgeReason;
}): Promise<EnqueuePurgeResult> {
  const { campaignId, actorUserId, actorType, reason } = params;

  return await db.transaction(async (tx) => {
    // 1. Gather all attachments relative paths
    const attachmentRows = await tx
      .select()
      .from(schema.attachments)
      .where(eq(schema.attachments.campaignId, campaignId));

    const resources: CampaignPurgeManifestV1["resources"] = [];
    for (const row of attachmentRows) {
      resources.push({
        kind: "attachment",
        attachmentId: row.attachmentId,
        storageKey: row.path,
      });
    }

    // 2. Add campaign's export directory
    resources.push({
      kind: "export_directory",
      storageKey: `exports/${campaignId}`,
    });

    const jobId = createId("pur");
    const now = new Date();
    const manifest: CampaignPurgeManifestV1 = {
      schemaVersion: 1,
      resources,
    };

    // 3. Conflict-directed insert using raw SQL to ensure exact partial unique index handling
    const result = await tx.execute(sql`
      INSERT INTO campaign_purge_jobs (
        job_id, campaign_id, actor_user_id, actor_type, reason, status, resource_manifest, attempt_count, created_at, updated_at
      ) VALUES (
        ${jobId}, ${campaignId}, ${actorUserId || null}, ${actorType}, ${reason}, 'pending', ${JSON.stringify(manifest)}::jsonb, 0, ${now}, ${now}
      ) ON CONFLICT (campaign_id)
        WHERE status IN ('pending', 'running', 'failed')
        DO NOTHING
      RETURNING job_id;
    `);

    const insertedRow = result.rows[0];
    if (!insertedRow) {
      return { outcome: "already_queued" };
    }

    // 4. Record audit log for the purge request
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId: actorUserId || null,
      actorType,
      action: "campaign.purge_requested",
      targetType: "campaign_purge_job",
      targetId: jobId,
      details: { campaignId, reason },
    });

    return { outcome: "enqueued", jobId };
  });
}

import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { operationsAuditLog } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../server/errors.js";

/**
 * Revokes a campaign invitation by setting revokedAt to current timestamp.
 */
export async function revokeInvitation(params: {
  invitationId: string;
  actorUserId: string;
}): Promise<void> {
  const { invitationId, actorUserId } = params;

  await db.transaction(async (tx) => {
    const [invitation] = await tx
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.invitationId, invitationId))
      .limit(1);

    if (!invitation) {
      throw new HttpError("Invitation not found", 404);
    }

    if (invitation.revokedAt) {
      return; // Already revoked, idempotent success
    }

    const now = new Date();

    await tx
      .update(schema.campaignInvitations)
      .set({ revokedAt: now })
      .where(eq(schema.campaignInvitations.invitationId, invitationId));

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "invitation.revoked",
      targetType: "invitation",
      targetId: invitationId,
      details: { actorUserId, campaignId: invitation.campaignId },
    });
  });
}

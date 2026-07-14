import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { operationsAuditLog } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../server/errors.js";

/**
 * Disables a user. Prevents disabling yourself or the last active administrator.
 * Revokes all active web sessions for the target user.
 */
export async function disableUser(params: {
  targetUserId: string;
  actorUserId: string;
}): Promise<void> {
  const { targetUserId, actorUserId } = params;

  if (targetUserId === actorUserId) {
    throw new HttpError("You cannot disable your own account", 400);
  }

  await db.transaction(async (tx) => {
    // Check if target is last active admin
    const [targetUser] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.userId, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new HttpError("User not found", 404);
    }

    if (targetUser.isPlatformAdmin && !targetUser.disabledAt) {
      const activeAdminsCount = await tx
        .select({ value: count() })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.isPlatformAdmin, true),
            isNull(schema.users.disabledAt)
          )
        );

      if (activeAdminsCount[0].value <= 1) {
        throw new HttpError("Cannot disable the last active platform administrator", 400);
      }
    }

    const now = new Date();

    // Disable user
    await tx
      .update(schema.users)
      .set({ disabledAt: now })
      .where(eq(schema.users.userId, targetUserId));

    // Revoke all active sessions
    await tx
      .update(schema.authSessions)
      .set({ revokedAt: now })
      .where(
        and(
          eq(schema.authSessions.userId, targetUserId),
          isNull(schema.authSessions.revokedAt)
        )
      );

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "user.disabled",
      targetType: "user",
      targetId: targetUserId,
      details: { actorUserId },
    });
  });
}

/**
 * Enables a disabled user.
 */
export async function enableUser(params: {
  targetUserId: string;
  actorUserId: string;
}): Promise<void> {
  const { targetUserId, actorUserId } = params;

  await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.userId, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new HttpError("User not found", 404);
    }

    await tx
      .update(schema.users)
      .set({ disabledAt: null })
      .where(eq(schema.users.userId, targetUserId));

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "user.enabled",
      targetType: "user",
      targetId: targetUserId,
      details: { actorUserId },
    });
  });
}

/**
 * Revokes all active sessions for a user.
 */
export async function revokeUserSessions(params: {
  targetUserId: string;
  actorUserId: string;
}): Promise<void> {
  const { targetUserId, actorUserId } = params;

  await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.userId, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new HttpError("User not found", 404);
    }

    const now = new Date();
    await tx
      .update(schema.authSessions)
      .set({ revokedAt: now })
      .where(
        and(
          eq(schema.authSessions.userId, targetUserId),
          isNull(schema.authSessions.revokedAt)
        )
      );

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "user.sessions_revoked",
      targetType: "user",
      targetId: targetUserId,
      details: { actorUserId },
    });
  });
}

/**
 * Grants platform administrator privileges to a user.
 */
export async function grantPlatformAdmin(params: {
  targetUserId: string;
  actorUserId: string;
}): Promise<void> {
  const { targetUserId, actorUserId } = params;

  await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.userId, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new HttpError("User not found", 404);
    }

    await tx
      .update(schema.users)
      .set({ isPlatformAdmin: true })
      .where(eq(schema.users.userId, targetUserId));

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "user.platform_admin_granted",
      targetType: "user",
      targetId: targetUserId,
      details: { actorUserId },
    });
  });
}

/**
 * Revokes platform administrator privileges from a user.
 * Prevents revoking your own privileges.
 */
export async function revokePlatformAdmin(params: {
  targetUserId: string;
  actorUserId: string;
}): Promise<void> {
  const { targetUserId, actorUserId } = params;

  if (targetUserId === actorUserId) {
    throw new HttpError("You cannot revoke your own administrator privileges", 400);
  }

  await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select()
      .from(schema.users)
      .where(eq(schema.users.userId, targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new HttpError("User not found", 404);
    }

    // Check if target is the last active admin
    const activeAdminsCount = await tx
      .select({ value: count() })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.isPlatformAdmin, true),
          isNull(schema.users.disabledAt)
        )
      );

    if (targetUser.isPlatformAdmin && !targetUser.disabledAt && activeAdminsCount[0].value <= 1) {
      throw new HttpError("Cannot revoke privileges from the last active platform administrator", 400);
    }

    await tx
      .update(schema.users)
      .set({ isPlatformAdmin: false })
      .where(eq(schema.users.userId, targetUserId));

    // Audit
    await tx.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId,
      actorType: "user",
      action: "user.platform_admin_revoked",
      targetType: "user",
      targetId: targetUserId,
      details: { actorUserId },
    });
  });
}

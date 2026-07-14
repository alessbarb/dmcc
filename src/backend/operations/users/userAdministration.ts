import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { userRoles } from "../../db/authSchema.js";
import { operationsAuditLog } from "../../db/operationsSchema.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../server/errors.js";

async function activeAdminCount(tx: Parameters<Parameters<typeof db.transaction>[0]>[0]): Promise<number> {
  const [result] = await tx
    .select({ value: count() })
    .from(userRoles)
    .innerJoin(schema.users, eq(userRoles.userId, schema.users.userId))
    .where(and(
      eq(userRoles.role, "admin"),
      isNull(schema.users.disabledAt),
    ));
  return Number(result?.value ?? 0);
}

async function userHasRole(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  role: "admin",
): Promise<boolean> {
  const [row] = await tx
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)))
    .limit(1);
  return Boolean(row);
}

export async function disableUser(params: { targetUserId: string; actorUserId: string }): Promise<void> {
  const { targetUserId, actorUserId } = params;
  if (targetUserId === actorUserId) throw new HttpError("You cannot disable your own account", 400);

  await db.transaction(async (tx) => {
    const [targetUser] = await tx.select().from(schema.users).where(eq(schema.users.userId, targetUserId)).limit(1);
    if (!targetUser) throw new HttpError("User not found", 404);

    const targetIsAdmin = await userHasRole(tx, targetUserId, "admin");
    if (targetIsAdmin && !targetUser.disabledAt && await activeAdminCount(tx) <= 1) {
      throw new HttpError("Cannot disable the last active platform administrator", 400);
    }

    const now = new Date();
    await tx.update(schema.users).set({ disabledAt: now }).where(eq(schema.users.userId, targetUserId));
    await tx.update(schema.authSessions).set({ revokedAt: now }).where(and(
      eq(schema.authSessions.userId, targetUserId),
      isNull(schema.authSessions.revokedAt),
    ));
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

export async function enableUser(params: { targetUserId: string; actorUserId: string }): Promise<void> {
  const { targetUserId, actorUserId } = params;
  await db.transaction(async (tx) => {
    const [targetUser] = await tx.select().from(schema.users).where(eq(schema.users.userId, targetUserId)).limit(1);
    if (!targetUser) throw new HttpError("User not found", 404);
    await tx.update(schema.users).set({ disabledAt: null }).where(eq(schema.users.userId, targetUserId));
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

export async function revokeUserSessions(params: { targetUserId: string; actorUserId: string }): Promise<void> {
  const { targetUserId, actorUserId } = params;
  await db.transaction(async (tx) => {
    const [targetUser] = await tx.select().from(schema.users).where(eq(schema.users.userId, targetUserId)).limit(1);
    if (!targetUser) throw new HttpError("User not found", 404);
    await tx.update(schema.authSessions).set({ revokedAt: new Date() }).where(and(
      eq(schema.authSessions.userId, targetUserId),
      isNull(schema.authSessions.revokedAt),
    ));
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

export async function grantPlatformAdmin(params: { targetUserId: string; actorUserId: string }): Promise<void> {
  const { targetUserId, actorUserId } = params;
  await db.transaction(async (tx) => {
    const [targetUser] = await tx.select().from(schema.users).where(eq(schema.users.userId, targetUserId)).limit(1);
    if (!targetUser) throw new HttpError("User not found", 404);
    await tx.insert(userRoles).values({
      userId: targetUserId,
      role: "admin",
      source: "administration",
      assignedByUserId: actorUserId,
    }).onConflictDoNothing();
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

export async function revokePlatformAdmin(params: { targetUserId: string; actorUserId: string }): Promise<void> {
  const { targetUserId, actorUserId } = params;
  if (targetUserId === actorUserId) throw new HttpError("You cannot revoke your own administrator privileges", 400);

  await db.transaction(async (tx) => {
    const [targetUser] = await tx.select().from(schema.users).where(eq(schema.users.userId, targetUserId)).limit(1);
    if (!targetUser) throw new HttpError("User not found", 404);
    const targetIsAdmin = await userHasRole(tx, targetUserId, "admin");
    if (targetIsAdmin && !targetUser.disabledAt && await activeAdminCount(tx) <= 1) {
      throw new HttpError("Cannot revoke privileges from the last active platform administrator", 400);
    }
    await tx.delete(userRoles).where(and(eq(userRoles.userId, targetUserId), eq(userRoles.role, "admin")));
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

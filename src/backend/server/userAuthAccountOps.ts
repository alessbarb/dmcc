import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { hashSecret, verifySecret } from "./auth.js";
import {
  getTenantIdFromVaultDir,
  hashOpaque,
  normalizeEmail,
  type CampaignMembership,
} from "./userAuthStore.js";

function pathFor(vaultDir: string): string {
  return join(vaultDir, "auth.json");
}

async function touchVaultAuthFile(vaultDir: string): Promise<void> {
  try {
    await mkdir(vaultDir, { recursive: true });
    const authPath = pathFor(vaultDir);
    let persisted: Record<string, unknown> = {};
    try {
      persisted = JSON.parse(await readFile(authPath, "utf8"));
    } catch {}
    await writeFile(
      authPath,
      JSON.stringify({ schemaVersion: 4, ...persisted, updatedAt: new Date().toISOString() }, null, 2),
      "utf8",
    );
  } catch {}
}

export async function getVaultAccessCodePepper(vaultDir: string): Promise<string> {
  const authPath = pathFor(vaultDir);
  let persisted: Record<string, unknown> = {};
  try {
    persisted = JSON.parse(await readFile(authPath, "utf8")) as Record<string, unknown>;
    if (typeof persisted.accessCodePepper === "string" && persisted.accessCodePepper) {
      return persisted.accessCodePepper;
    }
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }

  const accessCodePepper = randomBytes(32).toString("hex");
  await mkdir(vaultDir, { recursive: true });
  await writeFile(
    authPath,
    JSON.stringify({ schemaVersion: 4, ...persisted, accessCodePepper }, null, 2),
    "utf8",
  );
  return accessCodePepper;
}

export async function revokeAllSessions(vaultDir: string): Promise<void> {
  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const vaultUsers = await db.select().from(schema.users).where(eq(schema.users.vaultId, tenantId));
  const userIds = vaultUsers.map((user) => user.userId);

  if (userIds.length > 0) {
    await db.update(schema.authSessions).set({ revokedAt: new Date() }).where(
      and(inArray(schema.authSessions.userId, userIds), isNull(schema.authSessions.revokedAt)),
    );
  }

  await touchVaultAuthFile(vaultDir);
}

export async function addCampaignMembership(
  vaultDir: string,
  membership: Omit<CampaignMembership, "createdAt">,
): Promise<CampaignMembership> {
  const existing = await db.select().from(schema.campaignMemberships).where(
    and(
      eq(schema.campaignMemberships.campaignId, membership.campaignId),
      eq(schema.campaignMemberships.userId, membership.userId),
    ),
  ).limit(1);

  if (existing.length > 0) {
    const current = existing[0];
    if (!current.revokedAt) {
      return {
        campaignId: current.campaignId,
        userId: current.userId,
        role: current.role as CampaignMembership["role"],
        playerId: current.playerId ?? undefined,
        createdAt: current.createdAt.toISOString(),
        revokedAt: current.revokedAt?.toISOString(),
      };
    }

    await db.update(schema.campaignMemberships).set({
      revokedAt: null,
      role: membership.role,
      playerId: membership.playerId ?? null,
    }).where(
      and(
        eq(schema.campaignMemberships.campaignId, membership.campaignId),
        eq(schema.campaignMemberships.userId, membership.userId),
      ),
    );

    const updated = await db.select().from(schema.campaignMemberships).where(
      and(
        eq(schema.campaignMemberships.campaignId, membership.campaignId),
        eq(schema.campaignMemberships.userId, membership.userId),
      ),
    ).limit(1);

    await touchVaultAuthFile(vaultDir);
    return {
      campaignId: updated[0].campaignId,
      userId: updated[0].userId,
      role: updated[0].role as CampaignMembership["role"],
      playerId: updated[0].playerId ?? undefined,
      createdAt: updated[0].createdAt.toISOString(),
      revokedAt: updated[0].revokedAt?.toISOString(),
    };
  }

  const now = new Date();
  await db.insert(schema.campaignMemberships).values({
    campaignId: membership.campaignId,
    userId: membership.userId,
    role: membership.role,
    playerId: membership.playerId ?? null,
    createdAt: now,
  });

  await touchVaultAuthFile(vaultDir);
  return { ...membership, createdAt: now.toISOString() };
}

export async function changeUserPassword(
  vaultDir: string,
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) {
    throw Object.assign(new Error("New password must be 12-128 characters"), { statusCode: 400 });
  }

  const users = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = users[0];
  if (!user || user.disabledAt || !(await verifySecret(currentPassword, user.passwordSalt, user.passwordHash))) return false;

  const replacement = await hashSecret(newPassword);
  await db.update(schema.users).set({
    passwordHash: replacement.hash,
    passwordSalt: replacement.salt,
  }).where(eq(schema.users.userId, userId));

  await db.update(schema.authSessions).set({ revokedAt: new Date() }).where(
    and(eq(schema.authSessions.userId, userId), isNull(schema.authSessions.revokedAt)),
  );

  await touchVaultAuthFile(vaultDir);
  return true;
}

export async function regenerateRecoveryCodes(
  vaultDir: string,
  userId: string,
  currentPassword: string,
): Promise<string[] | null> {
  const users = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = users[0];
  if (!user || user.disabledAt || !(await verifySecret(currentPassword, user.passwordSalt, user.passwordHash))) return null;

  const codes = Array.from({ length: 10 }, () => randomBytes(12).toString("base64url"));
  await db.delete(schema.recoveryCodes).where(eq(schema.recoveryCodes.userId, userId));
  for (const code of codes) {
    await db.insert(schema.recoveryCodes).values({
      userId,
      codeHash: hashOpaque(code),
      createdAt: new Date(),
    });
  }

  await touchVaultAuthFile(vaultDir);
  return codes;
}

export async function recoverUserPassword(
  vaultDir: string,
  email: string,
  recoveryCode: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) return false;
  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const emailHash = hashOpaque(normalizeEmail(email ?? ""));

  const users = await db.select().from(schema.users).where(
    and(eq(schema.users.emailHash, emailHash), eq(schema.users.vaultId, tenantId), isNull(schema.users.disabledAt)),
  ).limit(1);
  const user = users[0];
  if (!user) return false;

  const codeHash = hashOpaque(recoveryCode ?? "");
  const dbCodes = await db.select().from(schema.recoveryCodes).where(
    and(eq(schema.recoveryCodes.userId, user.userId), eq(schema.recoveryCodes.codeHash, codeHash), isNull(schema.recoveryCodes.usedAt)),
  ).limit(1);
  const dbCode = dbCodes[0];
  if (!dbCode) return false;

  const password = await hashSecret(newPassword);
  const now = new Date();
  await db.update(schema.users).set({ passwordHash: password.hash, passwordSalt: password.salt }).where(eq(schema.users.userId, user.userId));
  await db.update(schema.recoveryCodes).set({ usedAt: now }).where(
    and(eq(schema.recoveryCodes.userId, user.userId), eq(schema.recoveryCodes.codeHash, codeHash)),
  );
  await db.update(schema.authSessions).set({ revokedAt: now }).where(
    and(eq(schema.authSessions.userId, user.userId), isNull(schema.authSessions.revokedAt)),
  );

  await touchVaultAuthFile(vaultDir);
  return true;
}

export async function issuePasswordResetToken(vaultDir: string, userId: string): Promise<string | null> {
  const users = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = users[0];
  if (!user || user.disabledAt) return null;

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
  await db.insert(schema.passwordResetTokens).values({
    userId,
    tokenHash: hashOpaque(token),
    createdAt: now,
    expiresAt,
  });

  await touchVaultAuthFile(vaultDir);
  return token;
}

export async function issuePasswordResetTokenByEmail(vaultDir: string, email: string): Promise<string | null> {
  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const emailHash = hashOpaque(normalizeEmail(email ?? ""));

  const users = await db.select().from(schema.users).where(
    and(eq(schema.users.emailHash, emailHash), eq(schema.users.vaultId, tenantId), isNull(schema.users.disabledAt)),
  ).limit(1);

  const user = users[0];
  if (!user) return null;
  return issuePasswordResetToken(vaultDir, user.userId);
}

export async function resetPasswordWithToken(
  vaultDir: string,
  resetToken: string,
  newPassword: string,
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) return false;
  const tokenHash = hashOpaque(resetToken ?? "");
  const now = new Date();

  const tokens = await db.select().from(schema.passwordResetTokens).where(
    and(eq(schema.passwordResetTokens.tokenHash, tokenHash), isNull(schema.passwordResetTokens.usedAt)),
  ).limit(1);
  const token = tokens[0];
  if (!token || token.expiresAt <= now) return false;

  const password = await hashSecret(newPassword);
  await db.update(schema.users).set({ passwordHash: password.hash, passwordSalt: password.salt }).where(eq(schema.users.userId, token.userId));
  await db.update(schema.passwordResetTokens).set({ usedAt: now }).where(eq(schema.passwordResetTokens.tokenHash, tokenHash));
  await db.update(schema.authSessions).set({ revokedAt: now }).where(
    and(eq(schema.authSessions.userId, token.userId), isNull(schema.authSessions.revokedAt)),
  );

  await touchVaultAuthFile(vaultDir);
  return true;
}

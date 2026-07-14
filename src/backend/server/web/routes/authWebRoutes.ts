import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { HttpError } from "../../errors.js";
import { sendExistingAccountRegistrationEmail, sendPasswordResetEmail } from "../../emailService.js";
import { listAccessibleCampaigns } from "../webAccess.js";
import {
  clearWebSessionCookie,
  createWebSession,
  getRequiredWebUser,
  hashOpaque,
  normalizeEmail,
  publicWebUser,
  revokeCurrentWebSession,
  setWebSessionCookie,
  type WebUser,
} from "../webSession.js";

type RegisterRateLimitEntry = { count: number; resetAt: number };
type LoginRateLimitEntry = { count: number; resetAt: number };
type LoginLockoutEntry = { failures: number; windowResetAt: number; lockedUntil: number };

const REGISTER_SUCCESS_RESPONSE = { ok: true, message: "If registration can proceed, you will receive the next steps." };
const REGISTER_RATE_LIMIT_WINDOW_MS = 60_000;
const REGISTER_RATE_LIMIT_MAX_BY_IP = 20;
const REGISTER_RATE_LIMIT_MAX_BY_EMAIL = 5;
const LOGIN_FAILURE_RESPONSE = { error: "Invalid email or password" };
const LOGIN_THROTTLED_RESPONSE = { error: "Too many login attempts. Try again later." };
const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
const LOGIN_RATE_LIMIT_MAX_BY_IP = 5;
const LOGIN_RATE_LIMIT_MAX_BY_EMAIL = 10;
const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60_000;
const LOGIN_LOCKOUT_THRESHOLD = 5;
const LOGIN_LOCKOUT_BASE_MS = 60_000;
const LOGIN_LOCKOUT_MAX_MS = 15 * 60_000;
const AUTH_STATE_MAX_ENTRIES = 10_000;
const fallbackPasswordHashPromise = argon2.hash(randomBytes(32));

function pruneExpiringMap<T>(entries: Map<string, T>, isExpired: (entry: T) => boolean): void {
  for (const [key, entry] of entries) {
    if (isExpired(entry)) {
      entries.delete(key);
    }
  }

  while (entries.size >= AUTH_STATE_MAX_ENTRIES) {
    const oldestKey = entries.keys().next().value as string | undefined;
    if (!oldestKey) break;
    entries.delete(oldestKey);
  }
}

function getRegisterRateLimitRetryAfter(
  registerRateLimits: Map<string, RegisterRateLimitEntry>,
  key: string,
  limit: number,
  now = Date.now(),
): number | null {
  pruneExpiringMap(registerRateLimits, (entry) => entry.resetAt <= now);
  const current = registerRateLimits.get(key);
  if (!current || current.resetAt <= now) {
    registerRateLimits.set(key, { count: 1, resetAt: now + REGISTER_RATE_LIMIT_WINDOW_MS });
    return null;
  }
  if (current.count >= limit) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }
  current.count += 1;
  registerRateLimits.set(key, current);
  return null;
}

function getLoginRateLimitRetryAfter(
  loginRateLimits: Map<string, LoginRateLimitEntry>,
  key: string,
  limit: number,
  now = Date.now(),
): number | null {
  pruneExpiringMap(loginRateLimits, (entry) => entry.resetAt <= now);
  const current = loginRateLimits.get(key);
  if (!current || current.resetAt <= now) {
    loginRateLimits.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return null;
  }
  if (current.count >= limit) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }
  current.count += 1;
  loginRateLimits.set(key, current);
  return null;
}

function enforceLoginRateLimit(
  loginRateLimits: Map<string, LoginRateLimitEntry>,
  request: FastifyRequest,
  normalizedEmail: string,
): number | null {
  const ipRetryAfter = getLoginRateLimitRetryAfter(
    loginRateLimits,
    `login:ip:${request.ip}`,
    LOGIN_RATE_LIMIT_MAX_BY_IP,
  );
  const emailRetryAfter = getLoginRateLimitRetryAfter(
    loginRateLimits,
    `login:email:${hashOpaque(normalizedEmail)}`,
    LOGIN_RATE_LIMIT_MAX_BY_EMAIL,
  );
  return Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0) || null;
}

function getLoginLockoutRetryAfter(
  loginLockouts: Map<string, LoginLockoutEntry>,
  normalizedEmail: string,
  now = Date.now(),
): number | null {
  pruneExpiringMap(loginLockouts, (entry) => entry.windowResetAt <= now && entry.lockedUntil <= now);
  const key = hashOpaque(normalizedEmail);
  const current = loginLockouts.get(key);
  if (!current) return null;
  if (current.windowResetAt <= now && current.lockedUntil <= now) {
    loginLockouts.delete(key);
    return null;
  }
  if (current.lockedUntil > now) {
    return Math.max(1, Math.ceil((current.lockedUntil - now) / 1000));
  }
  return null;
}

function recordFailedLogin(
  loginLockouts: Map<string, LoginLockoutEntry>,
  normalizedEmail: string,
  now = Date.now(),
): void {
  pruneExpiringMap(loginLockouts, (entry) => entry.windowResetAt <= now && entry.lockedUntil <= now);
  const key = hashOpaque(normalizedEmail);
  const current = loginLockouts.get(key);
  const entry = !current || current.windowResetAt <= now
    ? { failures: 1, windowResetAt: now + LOGIN_LOCKOUT_WINDOW_MS, lockedUntil: 0 }
    : { ...current, failures: current.failures + 1 };

  if (entry.failures >= LOGIN_LOCKOUT_THRESHOLD) {
    const lockoutStep = entry.failures - LOGIN_LOCKOUT_THRESHOLD;
    const lockoutMs = Math.min(LOGIN_LOCKOUT_MAX_MS, LOGIN_LOCKOUT_BASE_MS * (2 ** lockoutStep));
    entry.lockedUntil = now + lockoutMs;
  }
  loginLockouts.set(key, entry);
}

function clearLoginLockout(loginLockouts: Map<string, LoginLockoutEntry>, normalizedEmail: string): void {
  loginLockouts.delete(hashOpaque(normalizedEmail));
}

function enforceRegisterRateLimit(
  registerRateLimits: Map<string, RegisterRateLimitEntry>,
  request: FastifyRequest,
  normalizedEmail: string,
): number | null {
  const ipRetryAfter = getRegisterRateLimitRetryAfter(
    registerRateLimits,
    `register:ip:${request.ip}`,
    REGISTER_RATE_LIMIT_MAX_BY_IP,
  );
  const emailRetryAfter = getRegisterRateLimitRetryAfter(
    registerRateLimits,
    `register:email:${hashOpaque(normalizedEmail)}`,
    REGISTER_RATE_LIMIT_MAX_BY_EMAIL,
  );
  return Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0) || null;
}

function requireBodyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(`${field} is required`, 400);
  }
  return value.trim();
}

export function registerAuthWebRoutes(server: FastifyInstance): void {
  const registerRateLimits = new Map<string, RegisterRateLimitEntry>();
  const loginRateLimits = new Map<string, LoginRateLimitEntry>();
  const loginLockouts = new Map<string, LoginLockoutEntry>();

  server.post<{ Body: { email?: string; password?: string; displayName?: string } }>("/api/auth/register", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const retryAfter = enforceRegisterRateLimit(registerRateLimits, request, email);
    if (retryAfter) {
      reply.header("Retry-After", String(retryAfter));
      reply.code(429);
      return { error: "Too many registration attempts" };
    }

    const password = requireBodyString(request.body?.password, "password");
    if (password.length < 8) {
      reply.code(400);
      return { error: "Password must have at least 8 characters" };
    }
    const displayName = request.body?.displayName?.trim() || email.split("@")[0];
    const existing = await db.select().from(schema.users).where(eq(schema.users.emailNormalized, email)).limit(1);
    if (existing[0]) {
      console.info("[auth-register] Existing account registration attempt", { emailHash: hashOpaque(email), ip: request.ip });
      await sendExistingAccountRegistrationEmail({ to: email });
      reply.code(201);
      return REGISTER_SUCCESS_RESPONSE;
    }

    const userId = createId("usr");
    await db.transaction(async (tx) => {
      await tx.insert(schema.users).values({
        userId,
        emailNormalized: email,
        emailHash: hashOpaque(email),
        displayName,
        passwordHash: await argon2.hash(password),
        isPlatformAdmin: false,
      });
      const workspaceId = createId("wks");
      await tx.insert(schema.workspaces).values({ workspaceId, name: `${displayName}'s workspace`, ownerId: userId });
      await tx.insert(schema.workspaceMemberships).values({ workspaceId, userId, role: "owner" });
    });
    console.info("[auth-register] Account registered", { userId, emailHash: hashOpaque(email), ip: request.ip });
    reply.code(201);
    return REGISTER_SUCCESS_RESPONSE;
  });

  server.post<{ Body: { email?: string; password?: string } }>("/api/auth/login", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const lockoutRetryAfter = getLoginLockoutRetryAfter(loginLockouts, email);
    if (lockoutRetryAfter) {
      reply.header("Retry-After", String(lockoutRetryAfter));
      reply.code(401);
      return LOGIN_FAILURE_RESPONSE;
    }

    const retryAfter = enforceLoginRateLimit(loginRateLimits, request, email);
    if (retryAfter) {
      reply.header("Retry-After", String(retryAfter));
      reply.code(429);
      return LOGIN_THROTTLED_RESPONSE;
    }

    const password = requireBodyString(request.body?.password, "password");
    let passwordValid = false;

    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(
        eq(schema.users.emailNormalized, email),
        isNull(schema.users.disabledAt),
      ))
      .limit(1);

    if (user) {
      passwordValid = await argon2.verify(user.passwordHash, password).catch(() => false);
    } else {
      const fallbackPasswordHash = await fallbackPasswordHashPromise;
      await argon2.verify(fallbackPasswordHash, password).catch(() => false);
    }

    if (!user || !passwordValid) {
      recordFailedLogin(loginLockouts, email);
      reply.code(401);
      return LOGIN_FAILURE_RESPONSE;
    }

    clearLoginLockout(loginLockouts, email);

    await db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.userId, user.userId));

    const session = await createWebSession(user.userId);
    setWebSessionCookie(reply, session.token, session.expiresAt);
    return { user: publicWebUser(user) };
  });

  server.post("/api/auth/logout", async (request, reply) => {
    await revokeCurrentWebSession(request);
    clearWebSessionCookie(reply);
    return { ok: true };
  });

  server.post<{ Body: { email?: string } }>(
    "/api/auth/forgot-password",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request) => {
      const email = normalizeEmail(request.body?.email || "");
      if (!email) {
        return { ok: true };
      }

      const [user] = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.emailNormalized, email),
            isNull(schema.users.disabledAt),
          ),
        )
        .limit(1);

      let token: string | null = null;
      if (user) {
        token = randomBytes(32).toString("base64url");
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
        const tokenHash = hashOpaque(token);

        await db.insert(schema.passwordResetTokens).values({
          userId: user.userId,
          tokenHash,
          createdAt: now,
          expiresAt,
        });

        const publicOrigin = process.env.DMCC_PUBLIC_ORIGIN?.replace(/\/$/, "");
        if (publicOrigin) {
          const resetUrl = `${publicOrigin}/reset-password/${encodeURIComponent(token)}`;
          await sendPasswordResetEmail({
            to: email,
            resetUrl,
            expiresInMinutes: 30,
          });
        } else if (process.env.NODE_ENV !== "production") {
          console.warn("[forgot-password] DMCC_PUBLIC_ORIGIN not set; skipping email dispatch.");
        }
      }

      const allowDevToken =
        process.env.NODE_ENV !== "production" &&
        process.env.DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE === "true";
      return allowDevToken && token
        ? { ok: true, resetToken: token, expiresInSeconds: 1800 }
        : { ok: true };
    },
  );

  server.post<{ Body: { token?: string; resetToken?: string; newPassword?: string } }>(
    "/api/auth/reset-password",
    {
      config: {
        rateLimit: {
          max: 8,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const resetToken = request.body?.token ?? request.body?.resetToken;
      const newPassword = request.body?.newPassword;
      if (typeof resetToken !== "string" || resetToken.trim().length === 0) {
        reply.code(400);
        return { error: "Reset token is required" };
      }
      if (typeof newPassword !== "string" || newPassword.length < 12 || newPassword.length > 128) {
        reply.code(400);
        return { error: "Password must be between 12 and 128 characters" };
      }

      const tokenHash = hashOpaque(resetToken.trim());
      const now = new Date();
      const [tokenRecord] = await db
        .select()
        .from(schema.passwordResetTokens)
        .where(
          and(
            eq(schema.passwordResetTokens.tokenHash, tokenHash),
            isNull(schema.passwordResetTokens.usedAt),
          ),
        )
        .limit(1);

      if (!tokenRecord || tokenRecord.expiresAt <= now) {
        reply.code(400);
        return { error: "Invalid or expired recovery token" };
      }

      const passwordHash = await argon2.hash(newPassword);

      await db.transaction(async (tx) => {
        await tx
          .update(schema.users)
          .set({
            passwordHash,
          })
          .where(eq(schema.users.userId, tokenRecord.userId));

        await tx
          .update(schema.passwordResetTokens)
          .set({ usedAt: now })
          .where(eq(schema.passwordResetTokens.tokenHash, tokenHash));

        await tx
          .update(schema.authSessions)
          .set({ revokedAt: now })
          .where(
            and(
              eq(schema.authSessions.userId, tokenRecord.userId),
              isNull(schema.authSessions.revokedAt),
            ),
          );
      });

      clearWebSessionCookie(reply);
      return { ok: true };
    },
  );

  server.get("/api/auth/session", async (request, reply) => {
    const user = (request as { webUser?: WebUser }).webUser;
    if (!user) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    return { user };
  });

  server.get("/api/auth/status", async (request) => {
    const user = (request as { webUser?: WebUser }).webUser;
    const memberships = user
      ? (await listAccessibleCampaigns(user.userId)).map((campaign) => ({
          campaignId: campaign.campaignId,
          userId: user.userId,
          role: campaign.role,
          playerId: campaign.playerId ?? null,
        }))
      : [];

    return {
      sessionValid: Boolean(user),
      user: user ?? null,
      memberships,
    };
  });

  server.get("/api/me", async (request, reply) => {
    const user = (request as { webUser?: WebUser }).webUser;
    if (!user) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    const campaigns = await listAccessibleCampaigns(user.userId);
    return { user, campaigns };
  });

  server.get("/api/me/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const campaigns = await listAccessibleCampaigns(user.userId);
    return { campaigns };
  });
}

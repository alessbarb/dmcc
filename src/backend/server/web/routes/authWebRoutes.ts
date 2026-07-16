import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { userRoles } from "../../../db/authSchema.js";
import { HttpError } from "../../errors.js";
import { sendExistingAccountRegistrationEmail, sendPasswordResetEmail } from "../../emailService.js";
import {
  clearLoginLockout,
  consumeAuthRateLimit,
  getLoginLockoutRetryAfter,
  recordFailedLogin,
} from "../authThrottleStore.js";
import { listAccessibleCampaigns } from "../webAccess.js";
import {
  clearWebSessionCookie,
  createWebSession,
  getPlatformRoles,
  getRequiredWebUser,
  hashOpaque,
  normalizeEmail,
  publicWebUser,
  revokeCurrentWebSession,
  setWebSessionCookie,
  type WebUser,
} from "../webSession.js";

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
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
const fallbackPasswordHashPromise = argon2.hash(randomBytes(32));

async function enforceLoginRateLimit(request: FastifyRequest, email: string): Promise<number | null> {
  const byIp = await consumeAuthRateLimit({
    key: `login:ip:${hashOpaque(request.ip)}`,
    purpose: "login_rate",
    limit: LOGIN_RATE_LIMIT_MAX_BY_IP,
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  });
  const byEmail = await consumeAuthRateLimit({
    key: `login:email:${hashOpaque(email)}`,
    purpose: "login_rate",
    limit: LOGIN_RATE_LIMIT_MAX_BY_EMAIL,
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  });
  return Math.max(byIp ?? 0, byEmail ?? 0) || null;
}

async function enforceRegisterRateLimit(request: FastifyRequest, email: string): Promise<number | null> {
  const byIp = await consumeAuthRateLimit({
    key: `register:ip:${hashOpaque(request.ip)}`,
    purpose: "register_rate",
    limit: REGISTER_RATE_LIMIT_MAX_BY_IP,
    windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
  });
  const byEmail = await consumeAuthRateLimit({
    key: `register:email:${hashOpaque(email)}`,
    purpose: "register_rate",
    limit: REGISTER_RATE_LIMIT_MAX_BY_EMAIL,
    windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
  });
  return Math.max(byIp ?? 0, byEmail ?? 0) || null;
}

function requireBodyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new HttpError(`${field} is required`, 400);
  return value.trim();
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export function registerAuthWebRoutes(server: FastifyInstance): void {
  server.post<{ Body: { email?: string; password?: string; displayName?: string } }>("/api/auth/register", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const retryAfter = await enforceRegisterRateLimit(request, email);
    if (retryAfter) {
      reply.header("Retry-After", String(retryAfter));
      reply.code(429);
      return { error: "Too many registration attempts" };
    }

    const password = requireBodyString(request.body?.password, "password");
    const passwordError = validatePassword(password);
    if (passwordError) {
      reply.code(400);
      return { error: passwordError };
    }

    const displayName = request.body?.displayName?.trim() || email.split("@")[0];
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.emailNormalized, email)).limit(1);
    if (existing) {
      console.info("[auth-register] Existing account registration attempt", { emailHash: hashOpaque(email), ip: request.ip });
      await sendExistingAccountRegistrationEmail({ to: email });
      reply.code(201);
      return REGISTER_SUCCESS_RESPONSE;
    }

    const userId = createId("usr");
    const passwordHash = await argon2.hash(password);
    await db.transaction(async (tx) => {
      await tx.insert(schema.users).values({
        userId,
        emailNormalized: email,
        emailHash: hashOpaque(email),
        displayName,
        passwordHash,
      });
      const workspaceId = createId("wks");
      await tx.insert(schema.workspaces).values({ workspaceId, name: `${displayName}'s workspace`, ownerId: userId });
      await tx.insert(schema.workspaceMemberships).values({ workspaceId, userId, role: "owner" });
      await tx.insert(userRoles).values({ userId, role: "dm", source: "registration" });
    });

    const [createdUser] = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
    if (!createdUser) throw new Error("Registered account could not be loaded");
    const roles = await getPlatformRoles(userId);
    const session = await createWebSession(userId);
    setWebSessionCookie(reply, session.token, session.expiresAt);
    console.info("[auth-register] Account registered", { userId, emailHash: hashOpaque(email), ip: request.ip });
    reply.code(201);
    return { ok: true, user: publicWebUser(createdUser, roles) };
  });

  server.post<{ Body: { email?: string; password?: string } }>("/api/auth/login", async (request, reply) => {
    const email = normalizeEmail(requireBodyString(request.body?.email, "email"));
    const lockoutKey = `login-lockout:email:${hashOpaque(email)}`;
    const lockoutRetryAfter = await getLoginLockoutRetryAfter({ key: lockoutKey });
    if (lockoutRetryAfter) {
      reply.header("Retry-After", String(lockoutRetryAfter));
      reply.code(401);
      return LOGIN_FAILURE_RESPONSE;
    }
    const retryAfter = await enforceLoginRateLimit(request, email);
    if (retryAfter) {
      reply.header("Retry-After", String(retryAfter));
      reply.code(429);
      return LOGIN_THROTTLED_RESPONSE;
    }

    const password = requireBodyString(request.body?.password, "password");
    const [user] = await db.select().from(schema.users).where(and(eq(schema.users.emailNormalized, email), isNull(schema.users.disabledAt))).limit(1);
    const passwordValid = user
      ? await argon2.verify(user.passwordHash, password).catch(() => false)
      : await fallbackPasswordHashPromise.then((hash) => argon2.verify(hash, password).catch(() => false));
    if (!user || !passwordValid) {
      await recordFailedLogin({
        key: lockoutKey,
        windowMs: LOGIN_LOCKOUT_WINDOW_MS,
        threshold: LOGIN_LOCKOUT_THRESHOLD,
        baseLockoutMs: LOGIN_LOCKOUT_BASE_MS,
        maxLockoutMs: LOGIN_LOCKOUT_MAX_MS,
      });
      reply.code(401);
      return LOGIN_FAILURE_RESPONSE;
    }

    await clearLoginLockout(lockoutKey);
    await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.userId, user.userId));
    const roles = await getPlatformRoles(user.userId);
    const session = await createWebSession(user.userId);
    setWebSessionCookie(reply, session.token, session.expiresAt);
    return { user: publicWebUser(user, roles) };
  });

  server.post("/api/auth/logout", async (request, reply) => {
    await revokeCurrentWebSession(request);
    clearWebSessionCookie(reply);
    return { ok: true };
  });

  server.post<{ Body: { email?: string } }>("/api/auth/forgot-password", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
  }, async (request) => {
    const email = normalizeEmail(request.body?.email || "");
    if (!email) return { ok: true };
    const [user] = await db.select().from(schema.users).where(and(eq(schema.users.emailNormalized, email), isNull(schema.users.disabledAt))).limit(1);
    let token: string | null = null;
    if (user) {
      token = randomBytes(32).toString("base64url");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
      await db.insert(schema.passwordResetTokens).values({ userId: user.userId, tokenHash: hashOpaque(token), createdAt: now, expiresAt });
      const publicOrigin = process.env.DMCC_PUBLIC_ORIGIN?.replace(/\/$/, "");
      if (publicOrigin) {
        await sendPasswordResetEmail({ to: email, resetUrl: `${publicOrigin}/reset-password/${encodeURIComponent(token)}`, expiresInMinutes: 30 });
      } else if (process.env.NODE_ENV !== "production") {
        console.warn("[forgot-password] DMCC_PUBLIC_ORIGIN not set; skipping email dispatch.");
      }
    }
    const allowDevToken = process.env.NODE_ENV !== "production" && process.env.DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE === "true";
    return allowDevToken && token ? { ok: true, resetToken: token, expiresInSeconds: 1800 } : { ok: true };
  });

  server.post<{ Body: { token?: string; resetToken?: string; newPassword?: string } }>("/api/auth/reset-password", {
    config: { rateLimit: { max: 8, timeWindow: "1 minute" } },
  }, async (request, reply) => {
    const resetToken = request.body?.token ?? request.body?.resetToken;
    const newPassword = request.body?.newPassword;
    if (typeof resetToken !== "string" || resetToken.trim().length === 0) {
      reply.code(400);
      return { error: "Reset token is required" };
    }
    if (typeof newPassword !== "string" || validatePassword(newPassword)) {
      reply.code(400);
      return { error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters` };
    }

    const tokenHash = hashOpaque(resetToken.trim());
    const now = new Date();
    const [tokenRecord] = await db.select().from(schema.passwordResetTokens).where(and(eq(schema.passwordResetTokens.tokenHash, tokenHash), isNull(schema.passwordResetTokens.usedAt))).limit(1);
    if (!tokenRecord || tokenRecord.expiresAt <= now) {
      reply.code(400);
      return { error: "Invalid or expired recovery token" };
    }

    const passwordHash = await argon2.hash(newPassword);
    await db.transaction(async (tx) => {
      await tx.update(schema.users).set({ passwordHash }).where(eq(schema.users.userId, tokenRecord.userId));
      await tx.update(schema.passwordResetTokens).set({ usedAt: now }).where(eq(schema.passwordResetTokens.tokenHash, tokenHash));
      await tx.update(schema.authSessions).set({ revokedAt: now }).where(and(eq(schema.authSessions.userId, tokenRecord.userId), isNull(schema.authSessions.revokedAt)));
    });
    clearWebSessionCookie(reply);
    return { ok: true };
  });

  server.get("/api/auth/session", async (request, reply) => {
    const user = (request as { webUser?: WebUser }).webUser;
    if (!user) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    return { user };
  });

  server.get("/api/me", async (request, reply) => {
    const user = (request as { webUser?: WebUser }).webUser;
    if (!user) {
      reply.code(401);
      return { error: "Authentication required" };
    }
    return { user, campaigns: await listAccessibleCampaigns(user.userId) };
  });

  server.get("/api/me/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    return { campaigns: await listAccessibleCampaigns(user.userId) };
  });
}

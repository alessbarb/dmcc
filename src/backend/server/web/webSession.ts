import { createHash, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { userRoles } from "../../db/authSchema.js";
import { HttpError } from "../errors.js";

export const WEB_SESSION_COOKIE = "dmcc_session";
const SESSION_DAYS = 30;
const SESSION_LAST_SEEN_REFRESH_MS = 10 * 60 * 1000;

export type PlatformRole = "dm" | "player" | "admin";
export type WebUser = {
  userId: string;
  email: string;
  displayName: string;
  roles: PlatformRole[];
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashOpaque(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function issueOpaqueToken(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

type CookieSameSite = "lax" | "strict" | "none" | boolean;
type WebSessionCookieOptions = { sameSite: CookieSameSite; secure: boolean };

function getCookieSameSite(): CookieSameSite {
  const value = (process.env.DMCC_COOKIE_SAMESITE ?? process.env.COOKIE_SAMESITE)?.toLowerCase();
  if (value === "none") return "none";
  if (value === "lax") return "lax";
  if (value === "strict") return "strict";
  if (value === "true") return true;
  if (value === "false") return false;
  return "lax";
}

function getCookieSecure(): boolean | undefined {
  const value = (process.env.DMCC_COOKIE_SECURE ?? process.env.COOKIE_SECURE)?.toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function resolveWebSessionCookieOptions(): WebSessionCookieOptions {
  const sameSite = getCookieSameSite();
  const configuredSecure = getCookieSecure();
  if (sameSite === "none") {
    if (configuredSecure === false) {
      throw new Error("Invalid cookie configuration: SameSite=None requires Secure. Remove DMCC_COOKIE_SECURE=false or set DMCC_COOKIE_SECURE=true.");
    }
    return { sameSite, secure: true };
  }
  return { sameSite, secure: configuredSecure ?? process.env.NODE_ENV === "production" };
}

export function setWebSessionCookie(reply: FastifyReply, token: string, expiresAt: Date): void {
  const cookieOptions = resolveWebSessionCookieOptions();
  reply.setCookie(WEB_SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    expires: expiresAt,
  });
}

export function clearWebSessionCookie(reply: FastifyReply): void {
  const cookieOptions = resolveWebSessionCookieOptions();
  reply.clearCookie(WEB_SESSION_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
  });
}

export async function createWebSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = issueOpaqueToken("sess");
  const tokenHash = hashOpaque(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(schema.authSessions).values({
    sessionIdHash: tokenHash,
    userId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
  });
  return { token, expiresAt };
}

function isPlatformRole(value: string): value is PlatformRole {
  return value === "dm" || value === "player" || value === "admin";
}

export function publicWebUser(
  user: typeof schema.users.$inferSelect,
  roles: PlatformRole[] = [],
): WebUser {
  return {
    userId: user.userId,
    email: user.emailNormalized,
    displayName: user.displayName ?? user.emailNormalized,
    roles,
  };
}

function shouldRefreshSessionLastSeen(lastSeenAt: Date, now = new Date()): boolean {
  return now.getTime() - lastSeenAt.getTime() >= SESSION_LAST_SEEN_REFRESH_MS;
}

export async function getPlatformRoles(userId: string): Promise<PlatformRole[]> {
  const roleRows = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));
  return roleRows.map((entry) => entry.role).filter(isPlatformRole).sort();
}

export async function resolveWebUser(request: FastifyRequest): Promise<WebUser | null> {
  const token = request.cookies?.[WEB_SESSION_COOKIE];
  if (!token) return null;

  const tokenHash = hashOpaque(token);
  const now = new Date();
  const [row] = await db
    .select({ session: schema.authSessions, user: schema.users })
    .from(schema.authSessions)
    .innerJoin(schema.users, eq(schema.authSessions.userId, schema.users.userId))
    .where(and(
      eq(schema.authSessions.sessionIdHash, tokenHash),
      isNull(schema.authSessions.revokedAt),
      gt(schema.authSessions.expiresAt, now),
      isNull(schema.users.disabledAt),
    ))
    .limit(1);
  if (!row) return null;

  if (shouldRefreshSessionLastSeen(row.session.lastSeenAt, now)) {
    await db.update(schema.authSessions).set({ lastSeenAt: now }).where(eq(schema.authSessions.sessionIdHash, tokenHash));
  }

  const roles = await getPlatformRoles(row.user.userId);
  return publicWebUser(row.user, roles);
}

export async function revokeCurrentWebSession(request: FastifyRequest): Promise<void> {
  const token = request.cookies?.[WEB_SESSION_COOKIE];
  if (!token) return;
  await db.update(schema.authSessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.authSessions.sessionIdHash, hashOpaque(token)));
}

export function getRequiredWebUser(request: FastifyRequest): WebUser {
  if (!request.webUser) throw new HttpError("Authentication required", 401);
  return request.webUser;
}

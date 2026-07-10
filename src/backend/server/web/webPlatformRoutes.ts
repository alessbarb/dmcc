import { randomUUID, randomBytes, randomInt } from "node:crypto";
import argon2 from "argon2";
import { sendExistingAccountRegistrationEmail, sendPasswordResetEmail } from "../emailService.js";
import { verifySecret } from "../auth.js";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import * as schema from "../../db/schema.js";
import { createId, generateCampaignId } from "@shared/ids.js";
import { PostgresCampaignRepository } from "./postgresCampaignRepository.js";
import {
  clearWebSessionCookie,
  createWebSession,
  getRequiredWebUser,
  hashOpaque,
  issueOpaqueToken,
  normalizeEmail,
  publicWebUser,
  revokeCurrentWebSession,
  setWebSessionCookie,
  type WebUser,
} from "./webSession.js";
import { campaignEventBus } from "../realtime/campaignEventBus.js";
import { getPremadeCampaignTemplate, listPremadeCampaignTemplates } from "../premade/premadeCampaigns.js";
import { isDmOnlyVisibility } from "@core/domain/visibility/visibility.js";

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
function getRegisterRateLimitRetryAfter(registerRateLimits: Map<string, RegisterRateLimitEntry>, key: string, limit: number, now = Date.now()): number | null {
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

function getLoginRateLimitRetryAfter(loginRateLimits: Map<string, LoginRateLimitEntry>, key: string, limit: number, now = Date.now()): number | null {
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

function enforceLoginRateLimit(loginRateLimits: Map<string, LoginRateLimitEntry>, request: FastifyRequest, normalizedEmail: string): number | null {
  const ipRetryAfter = getLoginRateLimitRetryAfter(loginRateLimits, `login:ip:${request.ip}`, LOGIN_RATE_LIMIT_MAX_BY_IP);
  const emailRetryAfter = getLoginRateLimitRetryAfter(loginRateLimits, `login:email:${hashOpaque(normalizedEmail)}`, LOGIN_RATE_LIMIT_MAX_BY_EMAIL);
  return Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0) || null;
}

function getLoginLockoutRetryAfter(loginLockouts: Map<string, LoginLockoutEntry>, normalizedEmail: string, now = Date.now()): number | null {
  const current = loginLockouts.get(hashOpaque(normalizedEmail));
  if (!current) return null;
  if (current.windowResetAt <= now && current.lockedUntil <= now) {
    loginLockouts.delete(hashOpaque(normalizedEmail));
    return null;
  }
  if (current.lockedUntil > now) {
    return Math.max(1, Math.ceil((current.lockedUntil - now) / 1000));
  }
  return null;
}

function recordFailedLogin(loginLockouts: Map<string, LoginLockoutEntry>, normalizedEmail: string, now = Date.now()): void {
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

function enforceRegisterRateLimit(registerRateLimits: Map<string, RegisterRateLimitEntry>, request: FastifyRequest, normalizedEmail: string): number | null {
  const ipRetryAfter = getRegisterRateLimitRetryAfter(registerRateLimits, `register:ip:${request.ip}`, REGISTER_RATE_LIMIT_MAX_BY_IP);
  const emailRetryAfter = getRegisterRateLimitRetryAfter(registerRateLimits, `register:email:${hashOpaque(normalizedEmail)}`, REGISTER_RATE_LIMIT_MAX_BY_EMAIL);
  return Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0) || null;
}

function requireBodyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    const error = new Error(`${field} is required`);
    (error as any).statusCode = 400;
    throw error;
  }
  return value.trim();
}

function isDmRole(role?: string | null): boolean {
  return role === "dm" || role === "co_dm";
}

function getExpectedAuthErrorStatusCode(error: unknown): 401 | 403 | null {
  if (!(error instanceof Error)) return null;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return statusCode === 401 || statusCode === 403 ? statusCode : null;
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Authentication required";
}

async function ensureDefaultWorkspace(user: WebUser): Promise<string> {
  const existing = await db
    .select({ workspaceId: schema.workspaceMemberships.workspaceId })
    .from(schema.workspaceMemberships)
    .where(eq(schema.workspaceMemberships.userId, user.userId))
    .limit(1);
  if (existing[0]) return existing[0].workspaceId;

  const workspaceId = createId("wks");
  await db.transaction(async (tx) => {
    await tx.insert(schema.workspaces).values({
      workspaceId,
      vaultId: user.vaultId,
      name: `${user.displayName}'s workspace`,
      ownerId: user.userId,
    });
    await tx.insert(schema.workspaceMemberships).values({
      workspaceId,
      userId: user.userId,
      role: "owner",
    });
  });
  return workspaceId;
}

type CampaignAccessMembership = typeof schema.campaignMemberships.$inferSelect | {
  campaignId: string;
  userId: string;
  role: "dm";
  playerId: null;
  createdAt: Date;
  revokedAt: null;
};

async function getMembership(campaignId: string, userId: string): Promise<CampaignAccessMembership | undefined> {
  const [membership] = await db
    .select()
    .from(schema.campaignMemberships)
    .where(and(
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.userId, userId),
      isNull(schema.campaignMemberships.revokedAt),
    ))
    .limit(1);
  if (membership) return membership;

  const [ownedCampaign] = await db
    .select({ campaignId: schema.campaigns.campaignId, createdAt: schema.campaigns.createdAt })
    .from(schema.campaigns)
    .where(and(
      eq(schema.campaigns.campaignId, campaignId),
      eq(schema.campaigns.ownerId, userId),
      sql`${schema.campaigns.status} <> 'deleted'`,
    ))
    .limit(1);

  if (!ownedCampaign) return undefined;

  return {
    campaignId: ownedCampaign.campaignId,
    userId,
    role: "dm",
    playerId: null,
    createdAt: ownedCampaign.createdAt,
    revokedAt: null,
  };
}

async function requireCampaignMembership(request: FastifyRequest, campaignId: string) {
  const user = getRequiredWebUser(request);
  const membership = await getMembership(campaignId, user.userId);
  if (!membership) {
    const error = new Error("Campaign membership required");
    (error as any).statusCode = 403;
    throw error;
  }
  return { user, membership };
}

async function requireCampaignRole(request: FastifyRequest, campaignId: string, roles: string[]) {
  const context = await requireCampaignMembership(request, campaignId);
  if (!roles.includes(context.membership.role)) {
    const error = new Error("Forbidden: insufficient campaign role");
    (error as any).statusCode = 403;
    throw error;
  }
  return context;
}

async function requireCampaignOwner(request: FastifyRequest, campaignId: string) {
  const context = await requireCampaignRole(request, campaignId, ["dm", "co_dm"]);
  const [campaign] = await db
    .select({ ownerId: schema.campaigns.ownerId })
    .from(schema.campaigns)
    .where(eq(schema.campaigns.campaignId, campaignId))
    .limit(1);
  if (!campaign || campaign.ownerId !== context.user.userId) {
    const error = new Error("Forbidden: campaign owner required");
    (error as any).statusCode = 403;
    throw error;
  }
  return context;
}

function makeInviteUrl(request: FastifyRequest, token: string): string {
  const origin = process.env.DMCC_PUBLIC_ORIGIN ?? `${request.protocol}://${request.headers.host}`;
  return `${origin.replace(/\/$/, "")}/join/${token}`;
}

export const SHORT_TABLE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortTableCode(): string {
  const pick = () => Array.from({ length: 4 }, () => SHORT_TABLE_CODE_ALPHABET[randomInt(SHORT_TABLE_CODE_ALPHABET.length)]).join("");
  return `${pick()}-${pick()}`;
}

async function playerProfileFor(userId: string, campaignId: string) {
  const [profile] = await db
    .select()
    .from(schema.playerProfiles)
    .where(and(
      eq(schema.playerProfiles.userId, userId),
      eq(schema.playerProfiles.campaignId, campaignId),
      eq(schema.playerProfiles.status, "active"),
    ))
    .limit(1);
  return profile;
}

async function acceptInvitation(token: string, user: WebUser) {
  const tokenHash = hashOpaque(token);
  return db.transaction(async (tx) => {
    const [invitation] = await tx
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.tokenHash, tokenHash))
      .limit(1);
    if (!invitation || invitation.revokedAt || invitation.expiresAt < new Date()) {
      const error = new Error("Invitation is invalid or expired");
      (error as any).statusCode = 404;
      throw error;
    }

    const [existingMembership] = await tx
      .select()
      .from(schema.campaignMemberships)
      .where(and(
        eq(schema.campaignMemberships.campaignId, invitation.campaignId),
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
      ))
      .limit(1);
    if (existingMembership) {
      return { campaignId: invitation.campaignId, membership: existingMembership, alreadyAccepted: true };
    }

    if (invitation.usesCount >= invitation.maxUses) {
      const error = new Error("Invitation has no remaining uses");
      (error as any).statusCode = 409;
      throw error;
    }

    let playerId: string | null = null;
    if (invitation.role === "player") {
      playerId = createId("ply");
      await tx.insert(schema.playerProfiles).values({
        profileId: playerId,
        campaignId: invitation.campaignId,
        userId: user.userId,
        displayName: user.displayName,
        status: "active",
      });
    }

    const membership = {
      campaignId: invitation.campaignId,
      userId: user.userId,
      role: invitation.role,
      playerId,
      createdAt: new Date(),
    };
    await tx.insert(schema.campaignMemberships).values(membership);
    await tx.update(schema.campaignInvitations).set({ usesCount: invitation.usesCount + 1 }).where(eq(schema.campaignInvitations.invitationId, invitation.invitationId));
    await tx.insert(schema.campaignInvitationAcceptances).values({
      acceptanceId: createId("acc"),
      invitationId: invitation.invitationId,
      userId: user.userId,
      acceptedAt: new Date(),
    });
    await tx.insert(schema.activityFeed).values({
      campaignId: invitation.campaignId,
      activityId: createId("act"),
      type: "invitation.accepted",
      actorUserId: user.userId,
      content: { role: invitation.role, playerId },
    });
    return { campaignId: invitation.campaignId, membership, alreadyAccepted: false };
  });
}

function sanitizeObject(value: any): any {
  if (Array.isArray(value)) return value.map(sanitizeObject).filter((item) => item !== undefined);
  if (!value || typeof value !== "object") return value;
  const visibility = value.visibility?.kind ?? value.visibility?.mode ?? value.visibility ?? value.visibilityScope;
  const kind = value.kind;
  if (visibility === "dm_only" || visibility === "dm" || kind === "dm_secret") return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (/^dm|secret/i.test(key) || key === "contentDm") continue;
    const sanitized = sanitizeObject(child);
    if (sanitized !== undefined) result[key] = sanitized;
  }
  return result;
}

function toPortalEntity(entity: typeof schema.campaignEntities.$inferSelect) {
  return {
    entityId: entity.entityId,
    entityType: entity.type,
    typeLabel: entity.type,
    title: entity.name,
    summary: entity.publicSummary ?? undefined,
    status: entity.status,
    importance: entity.importance,
  };
}

function groupPortalEntities(entities: Array<typeof schema.campaignEntities.$inferSelect>) {
  const groups: Record<string, any[]> = {};
  const groupFor = (type: string) => {
    if (["npc", "creature"].includes(type)) return "npcs";
    if (["location", "place"].includes(type)) return "locations";
    if (["quest", "front", "clock"].includes(type)) return "quests";
    if (["clue", "rumor", "secret"].includes(type)) return "clues";
    if (["item", "object"].includes(type)) return "items";
    if (["faction"].includes(type)) return "factions";
    if (["player_character"].includes(type)) return "characters";
    return "other";
  };
  for (const entity of entities) {
    const key = groupFor(entity.type);
    groups[key] ??= [];
    groups[key].push(toPortalEntity(entity));
  }
  return groups;
}

function sqlRows<T = any>(result: unknown): T[] {
  const value = result as any;
  if (Array.isArray(value)) return value as T[];
  if (Array.isArray(value?.rows)) return value.rows as T[];
  return [];
}


type DmDashboardCampaignRow = {
  campaign: typeof schema.campaigns.$inferSelect;
  membership: typeof schema.campaignMemberships.$inferSelect;
};

type CampaignStatsAccumulator = {
  playersCount: number;
  npcsCount: number;
  locationsCount: number;
  questsCount: number;
  secretsCount: number;
  cluesCount: number;
  sessionsCount: number;
  activeSession: string | null;
};

function toRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function getMetadataString(metadata: Record<string, any>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function getMetadataNumber(metadata: Record<string, any>, keys: string[]): number | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.min(100, Math.round(value)));
  }
  return null;
}

function formatActivityTime(value: unknown): string {
  const occurredAt = value instanceof Date ? value.getTime() : new Date(String(value ?? "")).getTime();
  if (!Number.isFinite(occurredAt)) return "Ahora";
  const minutes = Math.max(0, Math.floor((Date.now() - occurredAt) / 60000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? "" : "s"}`;
}

function iconForActivity(type: string): "session" | "npc" | "note" | "entity" | "campaign" {
  if (type.includes("session") || type.includes("table")) return "session";
  if (type.includes("npc") || type.includes("player") || type.includes("invitation")) return "npc";
  if (type.includes("note") || type.includes("fact") || type.includes("clue")) return "note";
  if (type.includes("entity") || type.includes("relation")) return "entity";
  return "campaign";
}

function labelForActivity(type: string, campaignTitle: string, content: unknown): string {
  const data = toRecord(content);
  const subject =
    getMetadataString(data, ["title", "name", "sessionTitle", "entityTitle", "label"]) ??
    type.replace(/[._-]+/g, " ");

  if (type.includes("campaign") && type.includes("created")) return `Campaña creada: ${campaignTitle}`;
  if (type.includes("premade") || type.includes("template")) return `Aventura preparada importada: ${campaignTitle}`;
  if (type.includes("session") && type.includes("completed")) return `Sesión completada: ${campaignTitle}`;
  if (type.includes("session") && (type.includes("created") || type.includes("scheduled") || type.includes("planned"))) return `Sesión programada: ${subject}`;
  if (type.includes("session")) return `Sesión actualizada: ${subject}`;
  if (type.includes("entity") && type.includes("created")) return `Entidad creada: ${subject}`;
  if (type.includes("entity")) return `Entidad actualizada: ${subject}`;
  if (type.includes("note")) return `Nota actualizada: ${subject}`;
  if (type.includes("proposal")) return `Propuesta de jugador: ${subject}`;
  return `${subject}: ${campaignTitle}`;
}

function emptyStats(): CampaignStatsAccumulator {
  return {
    playersCount: 0,
    npcsCount: 0,
    locationsCount: 0,
    questsCount: 0,
    secretsCount: 0,
    cluesCount: 0,
    sessionsCount: 0,
    activeSession: null,
  };
}

async function getDmCampaignRows(user: WebUser): Promise<DmDashboardCampaignRow[]> {
  const rows = await db
    .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
    .from(schema.campaigns)
    .leftJoin(
      schema.campaignMemberships,
      and(
        eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId),
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
      ),
    )
    .where(and(
      sql`${schema.campaigns.status} <> 'deleted'`,
      or(
        eq(schema.campaigns.ownerId, user.userId),
        eq(schema.campaignMemberships.userId, user.userId),
      ),
    ));

  return rows.filter((row) => isDmRole(row.membership?.role) || row.campaign.ownerId === user.userId) as DmDashboardCampaignRow[];
}


async function listAccessibleCampaigns(userId: string) {
  const rows = await db
    .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
    .from(schema.campaigns)
    .leftJoin(
      schema.campaignMemberships,
      and(
        eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId),
        eq(schema.campaignMemberships.userId, userId),
        isNull(schema.campaignMemberships.revokedAt),
      ),
    )
    .where(and(
      sql`${schema.campaigns.status} <> 'deleted'`,
      or(
        eq(schema.campaigns.ownerId, userId),
        eq(schema.campaignMemberships.userId, userId),
      ),
    ));

  return rows.map((row) => ({
    ...row.campaign,
    role: row.membership?.role ?? "dm",
    playerId: row.membership?.playerId ?? null,
  }));
}

async function buildDmDashboard(user: WebUser, locale?: string) {
  const rows = await getDmCampaignRows(user);
  const campaignIds = rows.map((row) => row.campaign.campaignId);
  const statsByCampaign = new Map<string, CampaignStatsAccumulator>();
  const playerProposalCounts = new Map<string, number>();
  const plannedSessionCounts = new Map<string, number>();

  for (const campaignId of campaignIds) statsByCampaign.set(campaignId, emptyStats());

  if (campaignIds.length > 0) {
    const playerCounts = await db
      .select({ campaignId: schema.playerProfiles.campaignId, count: sql<number>`count(*)::int` })
      .from(schema.playerProfiles)
      .where(and(inArray(schema.playerProfiles.campaignId, campaignIds), eq(schema.playerProfiles.status, "active")))
      .groupBy(schema.playerProfiles.campaignId);
    for (const row of playerCounts) statsByCampaign.get(row.campaignId)!.playersCount = Number(row.count ?? 0);

    const sessionCounts = await db
      .select({
        campaignId: schema.campaignSessions.campaignId,
        count: sql<number>`count(*)::int`,
        activeSession: sql<string | null>`max(case when ${schema.campaignSessions.status} = 'live' then ${schema.campaignSessions.title} else null end)`,
        plannedCount: sql<number>`sum(case when ${schema.campaignSessions.status} = 'planned' then 1 else 0 end)::int`,
      })
      .from(schema.campaignSessions)
      .where(and(inArray(schema.campaignSessions.campaignId, campaignIds), sql`${schema.campaignSessions.status} <> 'cancelled'`))
      .groupBy(schema.campaignSessions.campaignId);
    for (const row of sessionCounts) {
      const stats = statsByCampaign.get(row.campaignId)!;
      stats.sessionsCount = Number(row.count ?? 0);
      stats.activeSession = row.activeSession ?? null;
      plannedSessionCounts.set(row.campaignId, Number(row.plannedCount ?? 0));
    }

    const entityTypeCounts = await db
      .select({ campaignId: schema.campaignEntities.campaignId, type: schema.campaignEntities.type, count: sql<number>`count(*)::int` })
      .from(schema.campaignEntities)
      .where(and(inArray(schema.campaignEntities.campaignId, campaignIds), sql`${schema.campaignEntities.status} <> 'archived'`))
      .groupBy(schema.campaignEntities.campaignId, schema.campaignEntities.type);
    for (const row of entityTypeCounts) {
      const stats = statsByCampaign.get(row.campaignId)!;
      const type = row.type;
      const count = Number(row.count ?? 0);
      if (["npc", "creature"].includes(type)) stats.npcsCount += count;
      else if (["location", "place"].includes(type)) stats.locationsCount += count;
      else if (["quest", "front", "clock"].includes(type)) stats.questsCount += count;
      else if (["clue", "rumor"].includes(type)) stats.cluesCount += count;
    }

    const secretFactCounts = await db
      .select({ campaignId: schema.campaignFacts.campaignId, count: sql<number>`count(*)::int` })
      .from(schema.campaignFacts)
      .where(and(
        inArray(schema.campaignFacts.campaignId, campaignIds),
        sql`${schema.campaignFacts.status} <> 'archived'`,
        eq(schema.campaignFacts.kind, "dm_secret"),
      ))
      .groupBy(schema.campaignFacts.campaignId);
    for (const row of secretFactCounts) statsByCampaign.get(row.campaignId)!.secretsCount = Number(row.count ?? 0);

    const clueCounts = await db
      .select({ campaignId: schema.campaignClues.campaignId, count: sql<number>`count(*)::int` })
      .from(schema.campaignClues)
      .where(and(inArray(schema.campaignClues.campaignId, campaignIds), sql`${schema.campaignClues.status} <> 'archived'`))
      .groupBy(schema.campaignClues.campaignId);
    for (const row of clueCounts) statsByCampaign.get(row.campaignId)!.cluesCount += Number(row.count ?? 0);

    const proposalCounts = await db
      .select({ campaignId: schema.playerProposals.campaignId, count: sql<number>`count(*)::int` })
      .from(schema.playerProposals)
      .where(and(inArray(schema.playerProposals.campaignId, campaignIds), eq(schema.playerProposals.status, "submitted")))
      .groupBy(schema.playerProposals.campaignId);
    for (const row of proposalCounts) playerProposalCounts.set(row.campaignId, Number(row.count ?? 0));
  }

  const activeTableRows = campaignIds.length === 0 ? [] : await db
    .select({ liveTable: schema.liveTables, campaign: schema.campaigns, session: schema.campaignSessions })
    .from(schema.liveTables)
    .innerJoin(schema.campaigns, eq(schema.liveTables.campaignId, schema.campaigns.campaignId))
    .leftJoin(schema.campaignSessions, and(
      eq(schema.campaignSessions.campaignId, schema.liveTables.campaignId),
      eq(schema.campaignSessions.sessionId, schema.liveTables.activeSessionId),
    ))
    .where(and(
      inArray(schema.liveTables.campaignId, campaignIds),
      eq(schema.liveTables.status, "active"),
      sql`${schema.liveTables.expiresAt} > now()`,
    ))
    .orderBy(desc(schema.liveTables.createdAt))
    .limit(8);

  const activeTables = activeTableRows.map((row) => {
    const stats = statsByCampaign.get(row.liveTable.campaignId) ?? emptyStats();
    return {
      id: row.liveTable.liveTableId,
      campaignId: row.liveTable.campaignId,
      tableName: row.campaign.title,
      campaignTitle: row.campaign.title,
      sessionTitle: row.session?.title ?? stats.activeSession ?? "Mesa activa",
      status: "running" as const,
      elapsed: formatActivityTime(row.liveTable.createdAt).replace("Hace ", ""),
      playersPresent: 0,
      playersTotal: stats.playersCount,
    };
  });

  const campaignTitleById = new Map(rows.map((row) => [row.campaign.campaignId, row.campaign.title]));
  const recentActivityRows = campaignIds.length === 0 ? [] : await db
    .select({ activity: schema.activityFeed })
    .from(schema.activityFeed)
    .where(inArray(schema.activityFeed.campaignId, campaignIds))
    .orderBy(desc(schema.activityFeed.occurredAt))
    .limit(12);

  const recentActivity = recentActivityRows.map((row) => {
    const campaignTitle = campaignTitleById.get(row.activity.campaignId) ?? "Campaña";
    return {
      id: row.activity.activityId,
      icon: iconForActivity(row.activity.type),
      text: labelForActivity(row.activity.type, campaignTitle, row.activity.content),
      time: formatActivityTime(row.activity.occurredAt),
      href: `/campaigns/${encodeURIComponent(row.activity.campaignId)}/dashboard`,
    };
  });

  const campaigns = rows.map((row) => {
    const metadata = toRecord(row.campaign.metadata);
    const stats = statsByCampaign.get(row.campaign.campaignId) ?? emptyStats();
    const progressPercent = getMetadataNumber(metadata, ["progressPercent", "progress"]);
    return {
      ...row.campaign,
      role: row.membership?.role ?? "dm",
      playerId: row.membership?.playerId ?? null,
      system: getMetadataString(metadata, ["system", "ruleset", "ruleSystem"]) ?? "custom",
      coverUrl: getMetadataString(metadata, ["coverUrl", "coverImage", "coverImagePath"]),
      stats,
      progressPercent,
    };
  });

  const missingCoverCount = campaigns.filter((campaign) => !campaign.coverUrl).length;
  const emptyCampaignCount = campaigns.filter((campaign) => {
    const stats = campaign.stats;
    return stats.playersCount + stats.sessionsCount + stats.npcsCount + stats.locationsCount + stats.questsCount + stats.secretsCount + stats.cluesCount === 0;
  }).length;
  const pendingProposalCount = Array.from(playerProposalCounts.values()).reduce((sum, count) => sum + count, 0);
  const plannedSessionCount = Array.from(plannedSessionCounts.values()).reduce((sum, count) => sum + count, 0);

  const alerts = [
    missingCoverCount > 0 ? {
      id: "missing_campaign_cover",
      label: missingCoverCount === 1 ? "1 campaña sin portada" : `${missingCoverCount} campañas sin portada`,
      count: missingCoverCount,
      severity: "info" as const,
      href: "/dm/campaigns?filter=missing-cover",
    } : null,
    emptyCampaignCount > 0 ? {
      id: "empty_campaigns",
      label: emptyCampaignCount === 1 ? "1 campaña todavía vacía" : `${emptyCampaignCount} campañas todavía vacías`,
      count: emptyCampaignCount,
      severity: "warning" as const,
      href: "/dm/campaigns?filter=empty",
    } : null,
    pendingProposalCount > 0 ? {
      id: "pending_player_proposals",
      label: pendingProposalCount === 1 ? "1 propuesta de jugador pendiente" : `${pendingProposalCount} propuestas de jugador pendientes`,
      count: pendingProposalCount,
      severity: "critical" as const,
      href: "/dm/alerts?type=pending-player-proposals",
    } : null,
    plannedSessionCount > 0 ? {
      id: "planned_sessions",
      label: plannedSessionCount === 1 ? "1 sesión planificada" : `${plannedSessionCount} sesiones planificadas`,
      count: plannedSessionCount,
      severity: "info" as const,
      href: "/dm/tables?status=planned",
    } : null,
  ].filter((alert): alert is NonNullable<typeof alert> => Boolean(alert));

  const totals = campaigns.reduce(
    (acc, campaign) => {
      acc.players += campaign.stats.playersCount;
      acc.sessions += campaign.stats.sessionsCount;
      acc.npcs += campaign.stats.npcsCount;
      acc.entities += campaign.stats.npcsCount + campaign.stats.locationsCount + campaign.stats.questsCount + campaign.stats.secretsCount + campaign.stats.cluesCount;
      if (campaign.status === "completed") acc.completedCampaigns += 1;
      return acc;
    },
    {
      campaigns: campaigns.length,
      activeTables: activeTables.length,
      players: 0,
      sessions: 0,
      npcs: 0,
      entities: 0,
      completedCampaigns: 0,
      playtimeLast30DaysLabel: "0h",
    },
  );

  return {
    profile: {
      displayName: user.displayName,
      email: user.email,
      avatarUrl: undefined,
    },
    totals,
    campaigns,
    activeTables,
    alerts,
    recentActivity,
    premadeTemplates: listPremadeCampaignTemplates(locale),
  };
}

function sanitizeSearchQuery(raw?: string): string {
  return (raw ?? "").trim().slice(0, 120);
}

async function runDmSearch(campaignId: string, query: string) {
  const like = `%${query}%`;
  const result = await db.execute(sql`
    SELECT 'entity' AS type, entity_id AS id, name AS title, public_summary AS summary, dm_summary AS dm_summary, 'dm' AS visibility
      FROM campaign_entities
      WHERE campaign_id = ${campaignId} AND (name ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'fact' AS type, fact_id AS id, kind AS title, content_public AS summary, content_dm AS dm_summary, kind AS visibility
      FROM campaign_facts
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (content_public ILIKE ${like} OR content_dm ILIKE ${like})
    UNION ALL
    SELECT 'relation' AS type, relation_id AS id, type AS title, public_summary AS summary, dm_summary AS dm_summary, visibility
      FROM campaign_relations
      WHERE campaign_id = ${campaignId} AND (type ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, dm_summary AS dm_summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR public_summary ILIKE ${like} OR dm_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, NULL AS dm_summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId} AND status <> 'archived' AND (title ILIKE ${like} OR description ILIKE ${like})
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      dmSummary: row.dm_summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}

async function runPlayerSearch(campaignId: string, user: WebUser, query: string) {
  const like = `%${query}%`;
  const profile = await playerProfileFor(user.userId, campaignId);
  const playerId = profile?.profileId ?? "";
  const result = await db.execute(sql`
    SELECT 'entity' AS type, e.entity_id AS id, e.name AS title, e.public_summary AS summary, g.scope AS visibility
      FROM campaign_entities e
      JOIN visibility_grants g
        ON g.campaign_id = e.campaign_id
       AND g.target_type = 'entity'
       AND g.target_id = e.entity_id
      WHERE e.campaign_id = ${campaignId}
        AND (e.name ILIKE ${like} OR e.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'fact' AS type, f.fact_id AS id, f.kind AS title, f.content_public AS summary, g.scope AS visibility
      FROM campaign_facts f
      JOIN visibility_grants g
        ON g.campaign_id = f.campaign_id
       AND g.target_type = 'fact'
       AND g.target_id = f.fact_id
      WHERE f.campaign_id = ${campaignId}
        AND f.status <> 'archived'
        AND f.kind <> 'dm_secret'
        AND f.content_public ILIKE ${like}
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'relation' AS type, r.relation_id AS id, r.type AS title, r.public_summary AS summary, g.scope AS visibility
      FROM campaign_relations r
      JOIN visibility_grants g
        ON g.campaign_id = r.campaign_id
       AND g.target_type = 'relation'
       AND g.target_id = r.relation_id
      WHERE r.campaign_id = ${campaignId}
        AND (r.type ILIKE ${like} OR r.public_summary ILIKE ${like})
        AND (
          g.scope IN ('public', 'all_players')
          OR (g.scope = 'specific_user' AND g.user_id = ${user.userId})
          OR (g.scope = 'specific_player' AND g.player_id = ${playerId})
        )
    UNION ALL
    SELECT 'clue' AS type, clue_id AS id, title, public_summary AS summary, visibility_scope AS visibility
      FROM campaign_clues
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND visibility_scope <> 'dm_only'
        AND (title ILIKE ${like} OR public_summary ILIKE ${like})
    UNION ALL
    SELECT 'objective' AS type, objective_id AS id, title, description AS summary, visibility_scope AS visibility
      FROM campaign_objectives
      WHERE campaign_id = ${campaignId}
        AND status <> 'archived'
        AND (title ILIKE ${like} OR description ILIKE ${like})
        AND (visibility_scope IN ('public', 'all_players') OR player_id = ${playerId})
    UNION ALL
    SELECT 'note' AS type, note_id AS id, split_part(content, E'\n', 1) AS title, content AS summary, visibility_scope AS visibility
      FROM campaign_notes
      WHERE campaign_id = ${campaignId}
        AND author_user_id = ${user.userId}
        AND content ILIKE ${like}
    LIMIT 80
  `);
  return sqlRows(result).map((row: any) => ({
    type: row.type,
    item: {
      id: row.id,
      title: row.title,
      summary: row.summary ?? undefined,
      visibility: row.visibility,
    },
  }));
}

function isPublicPortalCanvasVisibility(value: unknown): boolean {
  return value !== "dm" && value !== "dm_only" && !isDmOnlyVisibility(value);
}

function buildPublicConstellationCanvases(portal: any, state: any) {
  const publicEntityIds = new Set((portal.entities ?? []).map((entity: any) => entity.entityId));
  const publicFactIds = new Set((portal.facts ?? []).map((fact: any) => fact.factId));
  const publicRelationIds = new Set((portal.relations ?? []).map((relation: any) => relation.relationId));
  const canvases = Array.from(state.canvases?.values?.() ?? []).filter((canvas: any) => !canvas.archived);

  return canvases.map((canvas: any) => {
    const nodes = (canvas.nodes ?? []).filter((node: any) => {
      if (!isPublicPortalCanvasVisibility(node.visibility)) return false;
      if (node.entityId) return publicEntityIds.has(node.entityId);
      if (node.factId) return publicFactIds.has(node.factId);
      return node.kind === "note" && isPublicPortalCanvasVisibility(node.visibility);
    });
    const visibleNodeIds = new Set(nodes.map((node: any) => node.id));
    const edges = (canvas.edges ?? []).filter((edge: any) => {
      if (edge.style === "secret" || !isPublicPortalCanvasVisibility(edge.visibility)) return false;
      if (!visibleNodeIds.has(edge.sourceNodeId) || !visibleNodeIds.has(edge.targetNodeId)) return false;
      return !edge.relationshipId || publicRelationIds.has(edge.relationshipId);
    });
    return { ...canvas, nodes, edges };
  }).filter((canvas: any) => canvas.nodes.length > 0);
}

async function buildPlayerPortal(campaignId: string, user: WebUser) {
  const profile = await playerProfileFor(user.userId, campaignId);
  const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
  const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, campaignId));
  const allowed = (targetType: string, targetId: string) => grants.some((grant) =>
    grant.targetType === targetType &&
    grant.targetId === targetId &&
    (
      grant.scope === "public" ||
      grant.scope === "all_players" ||
      (grant.scope === "specific_user" && grant.userId === user.userId) ||
      (grant.scope === "specific_player" && profile && grant.playerId === profile.profileId)
    )
  );

  const entities = (await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)))
    .filter((entity) => allowed("entity", entity.entityId));
  const facts = (await db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)))
    .filter((fact) => allowed("fact", fact.factId) && fact.kind !== "dm_secret");
  const relations = (await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)))
    .filter((relation) => allowed("relation", relation.relationId));
  const notes = await db
    .select()
    .from(schema.campaignNotes)
    .where(and(eq(schema.campaignNotes.campaignId, campaignId), eq(schema.campaignNotes.authorUserId, user.userId)));
  const proposals = await db
    .select()
    .from(schema.playerProposals)
    .where(and(eq(schema.playerProposals.campaignId, campaignId), eq(schema.playerProposals.userId, user.userId)));
  const objectives = (await db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)))
    .filter((objective) => objective.status !== "archived" && (
      objective.visibilityScope === "public" ||
      objective.visibilityScope === "all_players" ||
      (profile && objective.playerId === profile.profileId)
    ));
  const clues = (await db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)))
    .filter((clue) => clue.status !== "archived" && clue.visibilityScope !== "dm_only");

  const safeEntities = entities.map(toPortalEntity);
  const safeFacts = facts.map((fact) => ({
    factId: fact.factId,
    statement: fact.contentPublic ?? "",
    kind: fact.kind,
    confidence: fact.confidence,
  })).filter((fact) => fact.statement.length > 0);
  const safeRelations = relations.map((relation) => ({
    relationId: relation.relationId,
    label: relation.type,
    description: relation.publicSummary ?? undefined,
    sourceEntityId: relation.sourceEntityId,
    targetEntityId: relation.targetEntityId,
  }));
  const linkedCharacter = profile?.linkedCharacterId
    ? safeEntities.find((entity) => entity.entityId === profile.linkedCharacterId) ?? null
    : null;

  return sanitizeObject({
    campaign: campaign ? {
      campaignId: campaign.campaignId,
      title: campaign.title,
      summary: campaign.summary,
      status: campaign.status,
    } : { campaignId },
    playerId: profile?.profileId ?? null,
    player: profile ? { playerId: profile.profileId, displayName: profile.displayName } : null,
    playerProfile: profile,
    link: profile?.linkedCharacterId ? { characterEntityId: profile.linkedCharacterId } : null,
    linkedCharacter,
    availableCharacters: safeEntities.filter((entity) => entity.entityType === "player_character"),
    sheet: { status: {}, resources: [] },
    notes: notes.map((note) => ({
      noteId: note.noteId,
      title: note.content.slice(0, 80),
      content: note.content,
      visibility: note.visibilityScope,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    })),
    objectives: objectives.map((objective) => ({
      objectiveId: objective.objectiveId,
      title: objective.title,
      description: objective.description ?? undefined,
      kind: objective.kind,
      status: objective.status,
      visibility: objective.visibilityScope,
      linkedEntityIds: objective.linkedEntityIds,
      playerId: objective.playerId,
    })),
    proposals,
    memory: {
      entities: groupPortalEntities(entities),
      facts: safeFacts,
      relations: safeRelations,
      history: [],
      activeThreads: {
        quests: safeEntities.filter((entity) => entity.entityType === "quest"),
        cluesAndRumors: [
          ...safeEntities.filter((entity) => ["clue", "rumor"].includes(entity.entityType)),
          ...clues.map((clue) => ({
            entityId: clue.entityId ?? clue.clueId,
            title: clue.title,
            summary: clue.publicSummary ?? undefined,
            status: clue.status,
            entityType: "clue",
          })),
        ],
      },
      counts: {
        visibleEntities: safeEntities.length,
        facts: safeFacts.length,
        relations: safeRelations.length,
        objectives: objectives.length,
        clues: clues.length,
        historyEntries: 0,
      },
    },
    entities: safeEntities,
    facts: safeFacts,
    relations: safeRelations,
    clues: clues.map((clue) => ({
      clueId: clue.clueId,
      entityId: clue.entityId,
      title: clue.title,
      summary: clue.publicSummary ?? undefined,
      status: clue.status,
    })),
  });
}

export async function registerWebPlatformRoutes(server: FastifyInstance) {
  const repo = new PostgresCampaignRepository();
  const registerRateLimits = new Map<string, RegisterRateLimitEntry>();
  const loginRateLimits = new Map<string, LoginRateLimitEntry>();
  const loginLockouts = new Map<string, LoginLockoutEntry>();

  server.get("/api/health", async () => ({ ok: true }));

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
        passwordSalt: "argon2id",
        passwordAlgorithm: "argon2id",
        vaultRole: "user",
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

    const [user] = await db
      .select()
      .from(schema.users)
      .where(and(
        eq(schema.users.emailNormalized, email),
        isNull(schema.users.disabledAt),
      ))
      .limit(1);

    let passwordValid = false;

    if (user?.passwordAlgorithm === "argon2id") {
      passwordValid = await argon2.verify(user.passwordHash, password).catch(() => false);
    } else if (user?.passwordAlgorithm === "scrypt") {
      passwordValid = await verifySecret(password, user.passwordSalt, user.passwordHash);

      if (passwordValid) {
        await db
          .update(schema.users)
          .set({
            passwordHash: await argon2.hash(password),
            passwordSalt: "argon2id",
            passwordAlgorithm: "argon2id",
            lastLoginAt: new Date(),
          })
          .where(eq(schema.users.userId, user.userId));

        user.passwordHash = "";
        user.passwordSalt = "argon2id";
        user.passwordAlgorithm = "argon2id";
        user.lastLoginAt = new Date();
      }
    }

    if (!user || !passwordValid) {
      if (user) {
        recordFailedLogin(loginLockouts, email);
      }
      reply.code(401);
      return LOGIN_FAILURE_RESPONSE;
    }

    clearLoginLockout(loginLockouts, email);

    if (user.passwordAlgorithm === "argon2id") {
      await db
        .update(schema.users)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.users.userId, user.userId));
    }

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
    async (request, _reply) => {
      const email = normalizeEmail(request.body?.email || "");
      if (!email) {
        return { ok: true };
      }

      // Check if user exists and is not disabled
      const [user] = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.emailNormalized, email),
            isNull(schema.users.disabledAt)
          )
        )
        .limit(1);

      let token: string | null = null;
      if (user) {
        token = randomBytes(32).toString("base64url");
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins
        const tokenHash = hashOpaque(token);

        await db.insert(schema.passwordResetTokens).values({
          userId: user.userId,
          tokenHash,
          createdAt: now,
          expiresAt,
        });

        // Try to send email when SMTP is configured.
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

      // In production the token is NEVER returned in the response, regardless
      // of SMTP config or caller IP — even if email sending failed.
      // In non-production it is only surfaced when the operator has explicitly
      // opted in via DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE=true, so a
      // mis-configured staging/Render environment cannot accidentally leak tokens.
      const allowDevToken =
        process.env.NODE_ENV !== "production" &&
        process.env.DMCC_DEV_PASSWORD_RESET_TOKEN_RESPONSE === "true";
      return allowDevToken && token
        ? { ok: true, resetToken: token, expiresInSeconds: 1800 }
        : { ok: true };
    }
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
            isNull(schema.passwordResetTokens.usedAt)
          )
        )
        .limit(1);

      if (!tokenRecord || tokenRecord.expiresAt <= now) {
        reply.code(400);
        return { error: "Invalid or expired recovery token" };
      }

      const passwordHash = await argon2.hash(newPassword);

      await db.transaction(async (tx) => {
        // Update user password using argon2 (consistent with register/login in web mode)
        await tx
          .update(schema.users)
          .set({
            passwordHash,
            passwordSalt: "argon2id",
            passwordAlgorithm: "argon2id",
          })
          .where(eq(schema.users.userId, tokenRecord.userId));

        // Mark token as used
        await tx
          .update(schema.passwordResetTokens)
          .set({
            usedAt: now,
          })
          .where(eq(schema.passwordResetTokens.tokenHash, tokenHash));

        // Revoke all sessions for this user
        await tx
          .update(schema.authSessions)
          .set({
            revokedAt: now,
          })
          .where(
            and(
              eq(schema.authSessions.userId, tokenRecord.userId),
              isNull(schema.authSessions.revokedAt)
            )
          );
      });

      clearWebSessionCookie(reply);
      return { ok: true };
    }
  );


  server.get("/api/me", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
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

  server.get("/api/player/campaigns", async (request) => {
    const user = getRequiredWebUser(request);
    const rows = await db
      .select({ campaign: schema.campaigns, membership: schema.campaignMemberships })
      .from(schema.campaignMemberships)
      .innerJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
      .where(and(
        eq(schema.campaignMemberships.userId, user.userId),
        isNull(schema.campaignMemberships.revokedAt),
        sql`${schema.campaigns.status} <> 'deleted'`,
      ));
    return { campaigns: rows
      .filter((row) => row.membership.role === "player" || isDmRole(row.membership.role))
      .map((row) => ({ ...row.campaign, role: row.membership.role, playerId: row.membership.playerId })) };
  });

  server.get("/api/auth/session", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
    if (!user) { reply.code(401); return { error: "Authentication required" }; }
    return { user };
  });

  // Web auth status exposes the session/cookie contract used by the frontend.
  server.get("/api/auth/status", async (request) => {
    const user = (request as any).webUser as WebUser | undefined;
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.users);
    const memberships = user
      ? (await listAccessibleCampaigns(user.userId)).map((campaign) => ({
          campaignId: campaign.campaignId,
          userId: user.userId,
          role: campaign.role,
          playerId: campaign.playerId ?? null,
        }))
      : [];

    return {
      accountConfigured: count > 0,
      sessionValid: Boolean(user),
      user: user ?? null,
      memberships,
    };
  });

  server.get<{ Querystring: { locale?: string } }>("/api/dm/dashboard", async (request) => {
    const user = getRequiredWebUser(request);
    return buildDmDashboard(user, request.query.locale);
  });

  server.get("/api/campaigns", async (request, reply) => {
    let user: WebUser | undefined;

    try {
      user = getRequiredWebUser(request);
      return await listAccessibleCampaigns(user.userId);
    } catch (error) {
      const statusCode = getExpectedAuthErrorStatusCode(error);
      if (statusCode) {
        reply.code(statusCode);
        return { error: getSafeErrorMessage(error) };
      }

      request.log.error({ err: error, userId: user?.userId }, "Failed to list campaigns for user");
      reply.code(500);
      return { error: "No se pudieron cargar las campañas. Inténtalo de nuevo." };
    }
  });

  server.post<{ Body: { title?: string; system?: string; summary?: string; campaignId?: string; coverUrl?: string } }>("/api/campaigns", async (request, reply) => {
    const user = getRequiredWebUser(request);
    const title = requireBodyString(request.body?.title, "title");
    const campaignId = request.body?.campaignId ?? createId("cmp");
    const coverUrl = request.body?.coverUrl?.trim();
    const workspaceId = await ensureDefaultWorkspace(user);
    const commandId = String(request.headers["idempotency-key"] ?? randomUUID());

    await db.transaction(async (tx) => {
      await tx.insert(schema.campaigns).values({
        campaignId,
        vaultId: user.vaultId,
        workspaceId,
        ownerId: user.userId,
        title,
        summary: request.body?.summary ?? null,
        status: "active",
        metadata: {
          system: request.body?.system ?? "generic_fantasy_d20",
          ...(coverUrl ? { coverUrl } : {}),
        },
      });
      await tx.insert(schema.campaignMemberships).values({ campaignId, userId: user.userId, role: "dm", playerId: null });
    });

    const projection = await repo.executeCommand(campaignId, {
      type: "CreateCampaign",
      campaignId,
      actorId: user.userId,
      title,
      summary: request.body?.summary,
      system: request.body?.system ?? "generic_fantasy_d20",
      settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
    }, { commandId, actorUserId: user.userId });

    reply.code(201);
    return { campaignId, campaign: projection.campaign };
  });



  server.get<{ Querystring: { locale?: string } }>("/api/premades", async (request) => {
    getRequiredWebUser(request);
    return { schemaVersion: 2, templates: listPremadeCampaignTemplates(request.query.locale) };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>("/api/premades/:templateId", async (request, reply) => {
    getRequiredWebUser(request);
    const template = getPremadeCampaignTemplate(request.params.templateId, request.query.locale);
    if (!template) { reply.code(404); return { error: "Premade campaign template not found" }; }
    return template;
  });

  server.post<{ Params: { templateId: string } }>("/api/premades/:templateId/import", async (request, reply) => {
    return reply.redirect(`/api/premade-campaigns/${encodeURIComponent(request.params.templateId)}/import`, 307);
  });

  server.get<{ Querystring: { locale?: string } }>("/api/premade-campaigns", async (request) => {
    getRequiredWebUser(request);
    return { schemaVersion: 2, templates: listPremadeCampaignTemplates(request.query.locale) };
  });

  server.get<{ Params: { templateId: string }; Querystring: { locale?: string } }>("/api/premade-campaigns/:templateId", async (request, reply) => {
    getRequiredWebUser(request);
    const template = getPremadeCampaignTemplate(request.params.templateId, request.query.locale);
    if (!template) { reply.code(404); return { error: "Premade campaign template not found" }; }
    return template;
  });

  server.post<{ Params: { templateId: string }; Body: { title?: string; summary?: string; campaignId?: string; importMode?: "full" | "structure" | "sessions"; locale?: string } }>(
    "/api/premade-campaigns/:templateId/import",
    async (request, reply) => {
      const user = getRequiredWebUser(request);
      const template = getPremadeCampaignTemplate(request.params.templateId, request.body?.locale);
      if (!template) { reply.code(404); return { error: "Premade campaign template not found" }; }

      const importMode = ["full", "structure", "sessions"].includes(request.body?.importMode ?? "")
        ? request.body!.importMode!
        : "full";
      const campaignId = request.body?.campaignId?.trim() && /^[a-zA-Z0-9_-]+$/.test(request.body.campaignId)
        ? request.body.campaignId.trim()
        : generateCampaignId();
      const title = request.body?.title?.trim() || template.title;
      const workspaceId = await ensureDefaultWorkspace(user);
      const summary = request.body?.summary?.trim() || template.summary;
      const importMetadata = {
        createdFromTemplateId: template.templateId,
        createdFromTemplateVersion: template.version,
        createdFromTemplateTitle: template.title,
        createdFromTemplateAt: new Date().toISOString(),
        importedByUserId: user.userId,
        importMode,
        templateLocale: template.locale,
        templateSystem: template.system,
        templateDifficulty: template.difficulty,
        templateTags: template.tags,
      };

      const shouldImportEntities = importMode === "full" || importMode === "structure" || importMode === "sessions";
      const shouldImportRelations = importMode === "full" || importMode === "structure";
      const shouldImportFacts = importMode === "full";
      const shouldImportSessions = importMode === "full" || importMode === "sessions";
      const shouldImportCanvases = importMode === "full" || importMode === "structure";

      try {
        await db.transaction(async (tx) => {
          await tx.insert(schema.campaigns).values({
            campaignId,
            vaultId: user.vaultId,
            workspaceId,
            ownerId: user.userId,
            title,
            summary,
            status: "active",
            metadata: { system: template.system, ...importMetadata },
          });
          await tx.insert(schema.campaignMemberships).values({ campaignId, userId: user.userId, role: "dm", playerId: null });
        });

        const commandOptions = (label: string) => ({ commandId: `${request.headers["idempotency-key"] ?? createId("cmd")}:${label}`, actorUserId: user.userId });
        await repo.executeCommand(campaignId, {
          type: "CreateCampaign",
          campaignId,
          actorId: user.userId,
          title,
          summary: `${summary}\n\nCreada desde la campaña de ejemplo ${template.title} v${template.version}.`,
          system: template.system,
          settings: { backupOnClose: true, lanModeEnabled: false, activeQuestsLimit: 5 },
          metadata: importMetadata,
        }, commandOptions("campaign"));

        if (shouldImportEntities) {
          let index = 0;
          for (const entity of template.entities) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateEntity",
              campaignId,
              actorId: user.userId,
              entityId: entity.entityId,
              entityType: entity.entityType,
              title: entity.title,
              subtitle: entity.subtitle,
              summary: entity.summary,
              content: entity.content,
              status: entity.status,
              importance: entity.importance,
              visibility: (entity.visibility ?? { kind: "dm_only" }) as any,
              metadata: { ...(entity.metadata ?? {}), createdFromTemplateId: template.templateId, createdFromTemplateVersion: template.version },
            }, commandOptions(`entity:${index}:${entity.entityId}`));
          }
        }

        if (shouldImportRelations) {
          let index = 0;
          for (const relation of template.relations) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateRelation",
              campaignId,
              actorId: user.userId,
              relationId: relation.relationId,
              sourceEntityId: relation.sourceEntityId,
              targetEntityId: relation.targetEntityId,
              relationType: relation.relationType as any,
              description: relation.description,
              visibility: (relation.visibility ?? { kind: "dm_only" }) as any,
              allowDuplicate: true,
            }, commandOptions(`relation:${index}:${relation.relationId}`));
          }
        }

        if (shouldImportFacts) {
          let index = 0;
          for (const fact of template.facts) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "RecordFact",
              campaignId,
              actorId: user.userId,
              factId: fact.factId,
              statement: fact.statement,
              kind: fact.kind,
              confidence: fact.confidence,
              visibility: (fact.visibility ?? { kind: "dm_only" }) as any,
              relatedEntityIds: fact.relatedEntityIds ?? [],
              relatedRelationIds: [],
              source: { kind: "import", importId: `premade:${template.templateId}`, sourcePath: `premade/${template.templateId}@${template.version}` },
            }, commandOptions(`fact:${index}:${fact.factId}`));
          }
        }

        if (shouldImportSessions) {
          let index = 0;
          for (const session of template.sessions) {
            index += 1;
            await repo.executeCommand(campaignId, {
              type: "CreatePreparedSession",
              campaignId,
              actorId: user.userId,
              sessionId: session.sessionId,
              title: session.title,
              scheduledAt: session.scheduledAt,
              prep: session.prep,
            }, commandOptions(`session:${index}:${session.sessionId}`));
          }
        }

        if (shouldImportCanvases) {
          let canvasIndex = 0;
          for (const canvas of template.canvases) {
            canvasIndex += 1;
            await repo.executeCommand(campaignId, {
              type: "CreateCanvas",
              campaignId,
              actorId: user.userId,
              canvasId: canvas.canvasId,
              title: canvas.title,
              kind: canvas.kind,
              description: canvas.description,
            }, commandOptions(`canvas:${canvasIndex}:${canvas.canvasId}`));

            let nodeIndex = 0;
            for (const node of canvas.nodes ?? []) {
              nodeIndex += 1;
              await repo.executeCommand(campaignId, { type: "PlaceNodeOnCanvas", campaignId, actorId: user.userId, canvasId: canvas.canvasId, node }, commandOptions(`canvas-node:${canvas.canvasId}:${nodeIndex}`));
            }
            let edgeIndex = 0;
            for (const edge of canvas.edges ?? []) {
              edgeIndex += 1;
              await repo.executeCommand(campaignId, { type: "AddEdgeToCanvas", campaignId, actorId: user.userId, canvasId: canvas.canvasId, edge }, commandOptions(`canvas-edge:${canvas.canvasId}:${edgeIndex}`));
            }
          }
        }

        await repo.executeCommand(campaignId, {
          type: "RecordImport",
          campaignId,
          actorId: user.userId,
          importId: createId("imp"),
          format: `premade:${template.templateId}@${template.version}`,
          count: (shouldImportEntities ? template.entities.length : 0)
            + (shouldImportRelations ? template.relations.length : 0)
            + (shouldImportFacts ? template.facts.length : 0)
            + (shouldImportSessions ? template.sessions.length : 0)
            + (shouldImportCanvases ? template.canvases.length : 0),
        }, commandOptions("import-record"));

        campaignEventBus.publish(campaignId, { type: "projection.updated" });
        reply.code(201);
        return { ok: true, campaignId, title, templateId: template.templateId, templateVersion: template.version, importMode, metadata: importMetadata };
      } catch (error: any) {
        await db.delete(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, campaignId)).catch(() => undefined);
        await db.delete(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).catch(() => undefined);
        reply.code(error.statusCode ?? 500);
        return { error: `Failed to import premade campaign: ${error?.message ?? "unknown error"}` };
      }
    }
  );

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request) => {
    const { membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (isDmRole(membership.role)) {
      return repo.getSerializedCampaignState(request.params.campaignId);
    }
    return buildPlayerPortal(request.params.campaignId, getRequiredWebUser(request));
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/projection", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return repo.getCampaignState(request.params.campaignId);
  });

  server.post<{ Params: { campaignId: string }; Body: { command?: any } & Record<string, any> }>("/api/campaigns/:campaignId/commands", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandId = request.headers["idempotency-key"];
    if (!commandId || Array.isArray(commandId)) {
      reply.code(400);
      return { error: "Idempotency-Key header is required" };
    }
    const command = request.body.command ?? request.body;
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      }, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: any) {
      if (error.name === "CommandConflictError" || /Conflict/.test(error.message)) {
        reply.code(409);
        return { error: error.message };
      }
      reply.code(error.statusCode ?? 500);
      return { error: error.message ?? "Command failed" };
    }
  });


  async function executeDmCommand(request: FastifyRequest<{ Params: { campaignId: string }; Body?: any }>, reply: any, command: Record<string, any>) {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const commandIdHeader = request.headers["idempotency-key"];
    const commandId = Array.isArray(commandIdHeader) ? commandIdHeader[0] : commandIdHeader ?? createId("cmd");
    try {
      const projection = await repo.executeCommand(request.params.campaignId, {
        ...command,
        campaignId: request.params.campaignId,
        actorId: user.userId,
      } as any, { commandId, actorUserId: user.userId });
      campaignEventBus.publish(request.params.campaignId, { type: "projection.updated", sequence: projection.lastSequence });
      return { ok: true, sequence: projection.lastSequence, projection };
    } catch (error: any) {
      if (error.name === "CommandConflictError" || /Conflict/.test(error.message)) {
        reply.code(409);
        return { error: error.message };
      }
      reply.code(error.statusCode ?? 500);
      return { error: error.message ?? "Command failed" };
    }
  }

  server.patch<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateCampaign", ...((request.body ?? {}) as any) });
  });

  server.delete<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId", async (request, _reply) => {
    await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaigns).set({ status: "deleted", updatedAt: new Date() }).where(eq(schema.campaigns.campaignId, request.params.campaignId));
    return { ok: true };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/command-center", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const campaignId = request.params.campaignId;
    const [campaign] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
    const [entities, facts, relations, sessions, clues, objectives, proposals, activity] = await Promise.all([
      db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId)),
      db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId)),
      db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId)),
      db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId)),
      db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId)),
      db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, campaignId)),
      db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, campaignId)),
      db.select().from(schema.activityFeed).where(eq(schema.activityFeed.campaignId, campaignId)).orderBy(desc(schema.activityFeed.occurredAt)).limit(12),
    ]);
    const lastCompletedSession = sessions
      .filter((session) => session.status === "completed")
      .sort((a, b) => String(b.playedDate ?? b.createdAt).localeCompare(String(a.playedDate ?? a.createdAt)))[0] ?? null;
    const nextSession = sessions
      .filter((session) => session.status === "planned" || session.status === "live")
      .sort((a, b) => String(a.plannedDate ?? a.createdAt).localeCompare(String(b.plannedDate ?? b.createdAt)))[0] ?? null;
    const hiddenSecrets = facts.filter((fact) => fact.kind === "dm_secret" && fact.status !== "archived");
    const unresolvedClues = clues.filter((clue) => clue.status !== "revealed" && clue.status !== "archived");
    const openObjectives = objectives.filter((objective) => objective.status === "open");
    const pendingProposals = proposals.filter((proposal) => proposal.status === "submitted" || proposal.status === "draft");
    return {
      campaign,
      recap: lastCompletedSession?.recapPublic ?? lastCompletedSession?.recapDm ?? campaign?.summary ?? null,
      nextSession,
      attention: [
        ...(pendingProposals.length ? [{ type: "player_proposals", count: pendingProposals.length, label: "Player proposals pending review" }] : []),
        ...(hiddenSecrets.length ? [{ type: "hidden_secrets", count: hiddenSecrets.length, label: "DM secrets still unrevealed" }] : []),
        ...(unresolvedClues.length ? [{ type: "unresolved_clues", count: unresolvedClues.length, label: "Prepared clues not revealed yet" }] : []),
        ...(openObjectives.length ? [{ type: "open_objectives", count: openObjectives.length, label: "Open objectives" }] : []),
      ],
      counts: {
        entities: entities.length,
        facts: facts.length,
        relations: relations.length,
        sessions: sessions.length,
        clues: clues.length,
        objectives: objectives.length,
        proposals: proposals.length,
        hiddenSecrets: hiddenSecrets.length,
      },
      openObjectives: openObjectives.slice(0, 12),
      unresolvedClues: unresolvedClues.slice(0, 12),
      pendingProposals: pendingProposals.slice(0, 12),
      recentActivity: activity,
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/dashboard", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const projection = await repo.getCampaignState(request.params.campaignId);
    return {
      campaign: projection.campaign,
      counts: {
        players: projection.players?.size ?? 0,
        entities: projection.entities?.size ?? 0,
        relations: projection.relations?.size ?? 0,
        facts: projection.facts?.size ?? 0,
        sessions: projection.sessions?.size ?? 0,
      },
      recentActivity: [],
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/what-now", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { suggestions: [], attention: [], nextSession: null };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/graph", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const entities = await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId));
    const relations = await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId));
    return { entities, relations };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/timeline", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const sessions = await db.select().from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, request.params.campaignId));
    return { sessions, events: [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/visibility", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const grants = await db.select().from(schema.visibilityGrants).where(eq(schema.visibilityGrants.campaignId, request.params.campaignId));
    return { grants };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/lan-status", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { enabled: false, mode: "web_invitations", message: "LAN mode has been replaced by web invitations." };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/players", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const profiles = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, request.params.campaignId));
    return profiles.map((profile) => ({
      playerId: profile.profileId,
      displayName: profile.displayName,
      email: null,
      isActive: profile.status === "active",
      linkedCharacterEntityId: profile.linkedCharacterId,
    }));
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/entities", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { entities: await db.select().from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/facts", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { facts: await db.select().from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/relations", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { relations: await db.select().from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/clues", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { clues: await db.select().from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/objectives", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { objectives: await db.select().from(schema.campaignObjectives).where(eq(schema.campaignObjectives.campaignId, request.params.campaignId)) };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/activity", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    return { activity: await db.select().from(schema.activityFeed).where(eq(schema.activityFeed.campaignId, request.params.campaignId)).orderBy(desc(schema.activityFeed.occurredAt)).limit(100) };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/entities", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateEntity", ...((request.body ?? {}) as any) });
  });
  server.patch<{ Params: { campaignId: string; entityId: string }; Body: any }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateEntity", entityId: request.params.entityId, ...((request.body ?? {}) as any) });
  });
  server.delete<{ Params: { campaignId: string; entityId: string } }>("/api/campaigns/:campaignId/entities/:entityId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveEntity", entityId: request.params.entityId });
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/relations", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "CreateRelation", ...((request.body ?? {}) as any) });
  });
  server.put<{ Params: { campaignId: string; relationId: string }; Body: any }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateRelation", relationId: request.params.relationId, ...((request.body ?? {}) as any) });
  });
  server.delete<{ Params: { campaignId: string; relationId: string } }>("/api/campaigns/:campaignId/relations/:relationId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "ArchiveRelation", relationId: request.params.relationId });
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/facts", async (request, reply) => {
    const body = (request.body ?? {}) as any;
    return executeDmCommand(request, reply, {
      type: "RecordFact",
      factId: body.factId,
      statement: body.statement ?? body.content ?? "",
      kind: body.kind ?? "canon",
      confidence: body.confidence ?? "confirmed",
      visibility: body.visibility ?? (body.kind === "dm_secret" ? { kind: "dm_only" } : { kind: "party" }),
      relatedEntityIds: body.relatedEntityIds ?? (body.subjectEntityId ? [body.subjectEntityId] : []),
      relatedRelationIds: body.relatedRelationIds ?? [],
      source: body.source ?? { kind: "manual" },
    });
  });
  server.put<{ Params: { campaignId: string; factId: string }; Body: any }>("/api/campaigns/:campaignId/facts/:factId", async (request, reply) => {
    return executeDmCommand(request, reply, { type: "UpdateFact", factId: request.params.factId, ...((request.body ?? {}) as any) });
  });


  server.post<{ Params: { campaignId: string }; Body: { role?: string; maxUses?: number; expiresInHours?: number; label?: string } }>("/api/campaigns/:campaignId/invitations", async (request, reply) => {
    const { user } = await requireCampaignOwner(request, request.params.campaignId);
    const token = issueOpaqueToken("inv");
    const invitationId = createId("inv");
    const expiresAt = new Date(Date.now() + (request.body?.expiresInHours ?? 168) * 60 * 60 * 1000);
    await db.insert(schema.campaignInvitations).values({
      invitationId,
      campaignId: request.params.campaignId,
      tokenHash: hashOpaque(token),
      role: request.body?.role ?? "player",
      maxUses: request.body?.maxUses ?? 1,
      usesCount: 0,
      expiresAt,
      createdBy: user.userId,
    });
    reply.code(201);
    return { invitation: { invitationId, url: makeInviteUrl(request, token), token, expiresAt } };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/invitations", async (request) => {
    await requireCampaignOwner(request, request.params.campaignId);
    const invitations = await db
      .select()
      .from(schema.campaignInvitations)
      .where(eq(schema.campaignInvitations.campaignId, request.params.campaignId))
      .orderBy(desc(schema.campaignInvitations.createdAt));
    return {
      invitations: invitations.map((invitation) => ({
        invitationId: invitation.invitationId,
        role: invitation.role,
        maxUses: invitation.maxUses,
        usesCount: invitation.usesCount,
        expiresAt: invitation.expiresAt,
        revokedAt: invitation.revokedAt,
        createdAt: invitation.createdAt,
        status: invitation.revokedAt ? "revoked" : invitation.expiresAt < new Date() ? "expired" : invitation.usesCount >= invitation.maxUses ? "exhausted" : "active",
      })),
    };
  });

  server.post<{ Params: { campaignId: string; invitationId: string } }>("/api/campaigns/:campaignId/invitations/:invitationId/revoke", async (request) => {
    const { user } = await requireCampaignOwner(request, request.params.campaignId);
    await db.update(schema.campaignInvitations).set({ revokedAt: new Date() }).where(and(
      eq(schema.campaignInvitations.campaignId, request.params.campaignId),
      eq(schema.campaignInvitations.invitationId, request.params.invitationId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "invitation.revoked",
      actorUserId: user.userId,
      content: { invitationId: request.params.invitationId },
    });
    return { ok: true };
  });

  server.get<{ Params: { token: string } }>("/api/invitations/:token", async (request, reply) => {
    const tokenHash = hashOpaque(request.params.token);
    const [row] = await db
      .select({ invitation: schema.campaignInvitations, campaign: schema.campaigns })
      .from(schema.campaignInvitations)
      .innerJoin(schema.campaigns, eq(schema.campaignInvitations.campaignId, schema.campaigns.campaignId))
      .where(eq(schema.campaignInvitations.tokenHash, tokenHash))
      .limit(1);
    if (!row || row.invitation.revokedAt || row.invitation.expiresAt < new Date()) {
      reply.code(404);
      return { error: "Invitation not found" };
    }
    return { campaign: { campaignId: row.campaign.campaignId, title: row.campaign.title, summary: row.campaign.summary }, role: row.invitation.role };
  });

  server.post<{ Params: { token: string } }>("/api/invitations/:token/accept", async (request, reply) => {
    const user = (request as any).webUser as WebUser | undefined;
    if (!user) { reply.code(401); return { error: "AUTH_REQUIRED" }; }
    const result = await acceptInvitation(request.params.token, user);
    campaignEventBus.publish(result.campaignId, { type: "invitation.accepted" });
    return { ok: true, campaignId: result.campaignId, playerPortalPath: `/player/campaigns/${result.campaignId}` };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    return buildPlayerPortal(request.params.campaignId, user);
  });


  async function readPlayerPortalForRequest(request: FastifyRequest<{ Params: { campaignId: string } }>) {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    return buildPlayerPortal(request.params.campaignId, user) as Promise<any>;
  }

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/home", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return {
      campaign: portal.campaign,
      player: portal.player,
      recap: portal.recap ?? portal.campaign?.summary ?? null,
      objectives: portal.objectives ?? [],
      memoryCounts: portal.memory?.counts ?? {},
      notifications: [],
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/memory", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return portal.memory;
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/constellation", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    const state = await repo.getCampaignState(request.params.campaignId);
    const canvases = buildPublicConstellationCanvases(portal, state);
    return {
      campaign: portal.campaign,
      entities: portal.entities ?? [],
      facts: portal.facts ?? [],
      relations: portal.relations ?? [],
      objectives: portal.objectives ?? [],
      clues: portal.clues ?? [],
      proposals: portal.proposals ?? [],
      canvases,
    };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/character", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { player: portal.player, linkedCharacter: portal.linkedCharacter, sheet: portal.sheet, availableCharacters: portal.availableCharacters };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/objectives", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { objectives: portal.objectives ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/recap", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { recap: portal.recap ?? portal.campaign?.summary ?? null, history: portal.memory?.history ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/notes", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { notes: portal.notes ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/player/campaigns/:campaignId/proposals", async (request) => {
    const portal = await readPlayerPortalForRequest(request);
    return { proposals: portal.proposals ?? [] };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    return buildPlayerPortal(request.params.campaignId, user);
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal/state", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    return buildPlayerPortal(request.params.campaignId, user);
  });

  server.put<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/status", async (request) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.status.updated",
      actorUserId: user.userId,
      content: (request.body ?? {}) as any,
    });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/resources", async () => ({ ok: true }));
  server.put<{ Params: { campaignId: string; resourceId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/resources/:resourceId", async () => ({ ok: true }));

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/notes", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const body = (request.body ?? {}) as any;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    const noteId = createId("note");
    await db.insert(schema.campaignNotes).values({
      campaignId: request.params.campaignId,
      noteId,
      authorUserId: user.userId,
      authorPlayerId: membership.playerId ?? null,
      content,
      visibilityScope: body.visibility ?? "private",
    });
    return { ok: true, noteId };
  });

  server.put<{ Params: { campaignId: string; noteId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/notes/:noteId", async (request, reply) => {
    const { user } = await requireCampaignMembership(request, request.params.campaignId);
    const body = (request.body ?? {}) as any;
    const content = [body.title, body.content ?? body.details].filter(Boolean).join("\n\n").trim();
    if (!content) { reply.code(400); return { error: "Note content is required" }; }
    await db.update(schema.campaignNotes)
      .set({ content, visibilityScope: body.visibility ?? "private", updatedAt: new Date() })
      .where(and(
        eq(schema.campaignNotes.campaignId, request.params.campaignId),
        eq(schema.campaignNotes.noteId, request.params.noteId),
        eq(schema.campaignNotes.authorUserId, user.userId),
      ));
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const body = (request.body ?? {}) as any;
    const objectiveId = createId("obj");
    await db.insert(schema.campaignObjectives).values({
      campaignId: request.params.campaignId,
      objectiveId,
      playerId: membership.playerId,
      title: String(body.title ?? body.label ?? "Objetivo personal").slice(0, 180),
      description: body.description ?? body.details ?? null,
      kind: body.kind ?? "player",
      status: body.status ?? "open",
      visibilityScope: body.visibility ?? "specific_player",
      linkedEntityIds: body.linkedEntityIds ?? [],
      sourceType: "player",
    });
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.objective.created",
      actorUserId: user.userId,
      content: { objectiveId, title: body.title ?? body.label ?? "Objetivo personal" },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true, objectiveId };
  });

  server.put<{ Params: { campaignId: string; objectiveId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/objectives/:objectiveId", async (request, reply) => {
    const { membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const body = (request.body ?? {}) as any;
    await db.update(schema.campaignObjectives).set({
      title: body.title,
      description: body.description ?? body.details,
      status: body.status,
      updatedAt: new Date(),
    }).where(and(
      eq(schema.campaignObjectives.campaignId, request.params.campaignId),
      eq(schema.campaignObjectives.objectiveId, request.params.objectiveId),
      eq(schema.campaignObjectives.playerId, membership.playerId),
    ));
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true };
  });

  server.post<{ Params: { campaignId: string }; Body: any }>("/api/campaigns/:campaignId/player-portal/proposals", async (request, reply) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (!membership.playerId) { reply.code(403); return { error: "Player membership required" }; }
    const proposalId = createId("prop");
    await db.insert(schema.playerProposals).values({
      campaignId: request.params.campaignId,
      proposalId,
      userId: user.userId,
      playerId: membership.playerId,
      type: ((request.body ?? {}) as any).kind ?? ((request.body ?? {}) as any).type ?? "note",
      content: (request.body ?? {}) as any,
      status: "submitted",
    });
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "player.proposal.submitted",
      actorUserId: user.userId,
      content: { proposalId, type: ((request.body ?? {}) as any).kind ?? ((request.body ?? {}) as any).type ?? "note" },
    });
    return { ok: true, proposalId };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/player-portal/dm-summary", async (request) => {
    await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const proposals = await db.select().from(schema.playerProposals).where(eq(schema.playerProposals.campaignId, request.params.campaignId));
    return { proposals, notes: [] };
  });

  server.put<{ Params: { campaignId: string; proposalId: string }; Body: { status?: string; dmNote?: string } }>("/api/campaigns/:campaignId/player-portal/proposals/:proposalId/resolve", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const status = request.body?.status === "approved" ? "approved" : request.body?.status === "rejected" ? "rejected" : null;
    if (!status) { reply.code(400); return { error: "status must be approved or rejected" }; }
    const [proposal] = await db.select().from(schema.playerProposals).where(and(
      eq(schema.playerProposals.campaignId, request.params.campaignId),
      eq(schema.playerProposals.proposalId, request.params.proposalId),
    )).limit(1);
    if (!proposal) { reply.code(404); return { error: "Proposal not found" }; }
    if (proposal.status === "approved" || proposal.status === "rejected") {
      return { ok: true, proposal };
    }
    await db.update(schema.playerProposals).set({
      status,
      processedBy: user.userId,
      processedAt: new Date(),
    }).where(and(
      eq(schema.playerProposals.campaignId, request.params.campaignId),
      eq(schema.playerProposals.proposalId, request.params.proposalId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: status === "approved" ? "player.proposal.approved" : "player.proposal.rejected",
      actorUserId: user.userId,
      content: { proposalId: request.params.proposalId, dmNote: request.body?.dmNote ?? null },
    });
    await db.insert(schema.notifications).values({
      notificationId: createId("ntf"),
      userId: proposal.userId,
      type: status === "approved" ? "proposal.approved" : "proposal.rejected",
      content: { campaignId: request.params.campaignId, proposalId: request.params.proposalId },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "player.portal.updated" });
    return { ok: true, status };
  });


  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: isDmRole(membership.role)
      ? await runDmSearch(request.params.campaignId, query)
      : await runPlayerSearch(request.params.campaignId, user, query) };
  });

  server.get<{ Params: { campaignId: string }; Querystring: { q?: string } }>("/api/player/campaigns/:campaignId/search", async (request) => {
    const { user, membership } = await requireCampaignMembership(request, request.params.campaignId);
    if (membership.role !== "player" && !isDmRole(membership.role)) {
      const error = new Error("Player portal requires player membership");
      (error as any).statusCode = 403;
      throw error;
    }
    const query = sanitizeSearchQuery(request.query.q);
    if (!query) return { results: [] };
    return { results: await runPlayerSearch(request.params.campaignId, user, query) };
  });

  server.post<{ Params: { campaignId: string }; Body: { activeSessionId?: string; durationHours?: number } }>("/api/campaigns/:campaignId/live-tables", async (request, reply) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    const liveTableId = createId("live");
    const shortCode = generateShortTableCode();
    const expiresAt = new Date(Date.now() + Math.max(1, Math.min(24, request.body?.durationHours ?? 4)) * 60 * 60 * 1000);
    await db.transaction(async (tx) => {
      await tx.update(schema.liveTables).set({ status: "closed", closedAt: new Date() }).where(and(
        eq(schema.liveTables.campaignId, request.params.campaignId),
        eq(schema.liveTables.status, "active"),
      ));
      await tx.insert(schema.liveTables).values({
        liveTableId,
        campaignId: request.params.campaignId,
        activeSessionId: request.body?.activeSessionId ?? null,
        shortCode,
        status: "active",
        expiresAt,
      });
      await tx.insert(schema.activityFeed).values({
        campaignId: request.params.campaignId,
        activityId: createId("act"),
        type: "live_table.opened",
        actorUserId: user.userId,
        content: { liveTableId, activeSessionId: request.body?.activeSessionId ?? null, expiresAt },
      });
    });
    campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
    reply.code(201);
    return { liveTable: { liveTableId, shortCode, expiresAt, status: "active" } };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/live-tables/current", async (request) => {
    await requireCampaignMembership(request, request.params.campaignId);
    const [liveTable] = await db.select().from(schema.liveTables).where(and(
      eq(schema.liveTables.campaignId, request.params.campaignId),
      eq(schema.liveTables.status, "active"),
    )).limit(1);
    if (!liveTable || liveTable.expiresAt < new Date()) return { liveTable: null };
    return { liveTable };
  });

  server.post<{ Params: { campaignId: string; liveTableId: string } }>("/api/campaigns/:campaignId/live-tables/:liveTableId/close", async (request) => {
    const { user } = await requireCampaignRole(request, request.params.campaignId, ["dm", "co_dm"]);
    await db.update(schema.liveTables).set({ status: "closed", closedAt: new Date() }).where(and(
      eq(schema.liveTables.campaignId, request.params.campaignId),
      eq(schema.liveTables.liveTableId, request.params.liveTableId),
    ));
    await db.insert(schema.activityFeed).values({
      campaignId: request.params.campaignId,
      activityId: createId("act"),
      type: "live_table.closed",
      actorUserId: user.userId,
      content: { liveTableId: request.params.liveTableId },
    });
    campaignEventBus.publish(request.params.campaignId, { type: "campaign.updated" });
    return { ok: true };
  });

  server.post<{ Params: { code: string } }>("/api/live-tables/:code/join", async (request, reply) => {
    const user = getRequiredWebUser(request);
    const [liveTable] = await db.select().from(schema.liveTables).where(and(
      eq(schema.liveTables.shortCode, request.params.code.toUpperCase()),
      eq(schema.liveTables.status, "active"),
    )).limit(1);
    if (!liveTable || liveTable.expiresAt < new Date()) {
      reply.code(404);
      return { error: "Live table code is invalid or expired" };
    }
    const membership = await getMembership(liveTable.campaignId, user.userId);
    if (!membership) {
      reply.code(403);
      return { error: "Campaign invitation must be accepted before joining live table" };
    }
    return { ok: true, campaignId: liveTable.campaignId, liveTableId: liveTable.liveTableId, playerPortalPath: `/player/campaigns/${liveTable.campaignId}/home` };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/events/stream", async (request, reply) => {
    await requireCampaignMembership(request, request.params.campaignId);
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    const listenerId = randomUUID();
    const listener = (event: any) => {
      reply.raw.write(`event: ${event.type}\n`);
      reply.raw.write(`data: ${JSON.stringify({ type: event.type, sequence: event.sequence })}\n\n`);
    };
    campaignEventBus.subscribe(request.params.campaignId, listenerId, listener);
    request.raw.on("close", () => campaignEventBus.unsubscribe(request.params.campaignId, listenerId));
  });

  const gone = async (_request: FastifyRequest, reply: any) => {
    reply.code(410);
    return { error: "Legacy vault/LAN/token API removed in PostgreSQL web mode" };
  };
  server.all("/api/vaults/*", gone);
  server.all("/api/join/:campaignId", gone);
  server.all("/api/campaigns/:campaignId/rejoin", gone);
  server.all("/api/campaigns/:campaignId/register", gone);
  server.all("/api/auth/local-token", gone);
}

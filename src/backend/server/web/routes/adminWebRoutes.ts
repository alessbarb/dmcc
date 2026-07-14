import type { FastifyInstance, FastifyRequest } from "fastify";
import argon2 from "argon2";
import { and, count, desc, eq, gt, isNull, like, or, sql } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignMessages } from "../../../db/messagingSchema.js";
import { systemAnnouncements } from "../../../db/announcementsSchema.js";
import { campaignPurgeJobs, operationsAuditLog } from "../../../db/operationsSchema.js";
import { campaignTemplateSettings, gameSystemSettings } from "../../../db/catalogSettingsSchema.js";
import { getRequiredPlatformAdmin } from "../webAccess.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../errors.js";
import { restoreCampaign } from "../../../operations/campaigns/campaignTrash.js";
import { enqueueCampaignPurge } from "../../../operations/campaigns/campaignPurgeJobs.js";
import { disableUser, enableUser, grantPlatformAdmin, revokePlatformAdmin, revokeUserSessions } from "../../../operations/users/userAdministration.js";
import { revokeInvitation } from "../../../operations/users/invitationAdministration.js";
import { listCampaignTemplates } from "../../campaignTemplate/campaignTemplates.js";

async function requireConfirmedPassword(actorUserId: string, currentPassword: unknown): Promise<void> {
  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    throw new HttpError("Password confirmation is required for this action", 401);
  }
  const [actor] = await db.select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.userId, actorUserId))
    .limit(1);
  if (!actor || !await argon2.verify(actor.passwordHash, currentPassword).catch(() => false)) {
    throw new HttpError("Current password is invalid", 401);
  }
}

const platformAdminExpression = sql<boolean>`EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = ${schema.users.userId}
    AND user_roles.role = 'admin'
)`;

export async function registerAdminWebRoutes(server: FastifyInstance): Promise<void> {
  server.addHook("preValidation", async (request: FastifyRequest) => {
    if (request.url.startsWith("/api/admin")) getRequiredPlatformAdmin(request);
  });

  server.get("/api/admin/overview", async () => {
    const [totalUsersRes] = await db.select({ value: count() }).from(schema.users);
    const [activeUsersRes] = await db.select({ value: count() }).from(schema.users).where(isNull(schema.users.disabledAt));
    const [totalCampaignsRes] = await db.select({ value: count() }).from(schema.campaigns);
    const [activeCampaignsRes] = await db.select({ value: count() }).from(schema.campaigns).where(eq(schema.campaigns.status, "active"));
    const [trashedCampaignsRes] = await db.select({ value: count() }).from(schema.campaigns).where(eq(schema.campaigns.status, "trashed"));
    const [totalPurgeJobsRes] = await db.select({ value: count() }).from(campaignPurgeJobs);
    const [failedPurgeJobsRes] = await db.select({ value: count() }).from(campaignPurgeJobs).where(eq(campaignPurgeJobs.status, "failed"));
    const [pendingPurgeJobsRes] = await db.select({ value: count() }).from(campaignPurgeJobs).where(eq(campaignPurgeJobs.status, "pending"));
    return {
      totalUsers: totalUsersRes.value,
      activeUsers: activeUsersRes.value,
      totalCampaigns: totalCampaignsRes.value,
      activeCampaigns: activeCampaignsRes.value,
      trashedCampaigns: trashedCampaignsRes.value,
      totalPurgeJobs: totalPurgeJobsRes.value,
      failedPurgeJobs: failedPurgeJobsRes.value,
      pendingPurgeJobs: pendingPurgeJobsRes.value,
    };
  });

  server.get("/api/admin/campaigns", async (request) => {
    const queryParams = request.query as { status?: "active" | "trashed" | "importing"; query?: string; limit?: string; cursor?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = [];
    if (queryParams.status) conditions.push(eq(schema.campaigns.status, queryParams.status));
    if (queryParams.query?.trim()) conditions.push(or(
      like(schema.campaigns.title, `%${queryParams.query.trim()}%`),
      like(schema.users.emailNormalized, `%${queryParams.query.trim().toLowerCase()}%`),
    ));
    if (queryParams.cursor) conditions.push(gt(schema.campaigns.campaignId, queryParams.cursor));
    const rows = await db.select({
      campaignId: schema.campaigns.campaignId,
      title: schema.campaigns.title,
      status: schema.campaigns.status,
      ownerId: schema.campaigns.ownerId,
      ownerEmail: schema.users.emailNormalized,
      ownerName: schema.users.displayName,
      createdAt: schema.campaigns.createdAt,
      trashedAt: schema.campaigns.trashedAt,
      purgeEligibleAt: schema.campaigns.purgeEligibleAt,
      trashedByUserId: schema.campaigns.trashedByUserId,
    }).from(schema.campaigns)
      .innerJoin(schema.users, eq(schema.campaigns.ownerId, schema.users.userId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(schema.campaigns.campaignId)
      .limit(limit);
    return { campaigns: rows, nextCursor: rows.length === limit ? rows.at(-1)?.campaignId ?? null : null };
  });

  server.get("/api/admin/campaigns/:campaignId", async (request) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const [campaign] = await db.select({
      campaignId: schema.campaigns.campaignId,
      title: schema.campaigns.title,
      summary: schema.campaigns.summary,
      status: schema.campaigns.status,
      ownerId: schema.campaigns.ownerId,
      ownerEmail: schema.users.emailNormalized,
      ownerName: schema.users.displayName,
      createdAt: schema.campaigns.createdAt,
      trashedAt: schema.campaigns.trashedAt,
      purgeEligibleAt: schema.campaigns.purgeEligibleAt,
      trashedByUserId: schema.campaigns.trashedByUserId,
    }).from(schema.campaigns)
      .innerJoin(schema.users, eq(schema.campaigns.ownerId, schema.users.userId))
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);
    if (!campaign) throw new HttpError("Campaign not found", 404);
    const [entitiesCount] = await db.select({ value: count() }).from(schema.campaignEntities).where(eq(schema.campaignEntities.campaignId, campaignId));
    const [factsCount] = await db.select({ value: count() }).from(schema.campaignFacts).where(eq(schema.campaignFacts.campaignId, campaignId));
    const [relationsCount] = await db.select({ value: count() }).from(schema.campaignRelations).where(eq(schema.campaignRelations.campaignId, campaignId));
    const [sessionsCount] = await db.select({ value: count() }).from(schema.campaignSessions).where(eq(schema.campaignSessions.campaignId, campaignId));
    const [scenesCount] = await db.select({ value: count() }).from(schema.campaignScenes).where(eq(schema.campaignScenes.campaignId, campaignId));
    const [cluesCount] = await db.select({ value: count() }).from(schema.campaignClues).where(eq(schema.campaignClues.campaignId, campaignId));
    const [charactersCount] = await db.select({ value: count() }).from(schema.characters).where(eq(schema.characters.campaignId, campaignId));
    const [notesCount] = await db.select({ value: count() }).from(schema.campaignNotes).where(eq(schema.campaignNotes.campaignId, campaignId));
    const [attachmentsCount] = await db.select({ value: count() }).from(schema.attachments).where(eq(schema.attachments.campaignId, campaignId));
    const [messagesCount] = await db.select({ value: count() }).from(campaignMessages).where(eq(campaignMessages.campaignId, campaignId));
    return { ...campaign, counts: {
      entities: entitiesCount.value,
      facts: factsCount.value,
      relations: relationsCount.value,
      sessions: sessionsCount.value,
      scenes: scenesCount.value,
      clues: cluesCount.value,
      characters: charactersCount.value,
      notes: notesCount.value,
      attachments: attachmentsCount.value,
      messages: messagesCount.value,
    } };
  });

  server.post("/api/admin/campaigns/:campaignId/restore", async (request) => {
    await restoreCampaign({ campaignId: (request.params as { campaignId: string }).campaignId, actorUserId: request.webUser!.userId });
    return { success: true };
  });

  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/campaigns/:campaignId/purge", async (request, reply) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const user = request.webUser!;
    await requireConfirmedPassword(user.userId, request.body?.currentPassword);
    const [campaign] = await db.select({ status: schema.campaigns.status }).from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
    if (!campaign) throw new HttpError("Campaign not found", 404);
    if (campaign.status !== "trashed") {
      reply.code(409);
      return { error: "Only campaigns in trashed status can be purged" };
    }
    const result = await enqueueCampaignPurge({ campaignId, actorUserId: user.userId, actorType: "user", reason: "manual" });
    return { success: true, outcome: result.outcome };
  });

  server.post("/api/admin/campaigns/:campaignId/purge-incomplete-import", async (request, reply) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const user = request.webUser!;
    const [campaign] = await db.select({ status: schema.campaigns.status, createdAt: schema.campaigns.createdAt }).from(schema.campaigns).where(eq(schema.campaigns.campaignId, campaignId)).limit(1);
    if (!campaign) throw new HttpError("Campaign not found", 404);
    if (campaign.status !== "importing" || campaign.createdAt >= new Date(Date.now() - 15 * 60 * 1000)) {
      reply.code(400);
      return { error: campaign.status !== "importing" ? "Campaign is not in importing status" : "Campaign import was started less than 15 minutes ago" };
    }
    const result = await enqueueCampaignPurge({ campaignId, actorUserId: user.userId, actorType: "user", reason: "incomplete_import" });
    await db.update(schema.campaigns).set({ status: "trashed", trashedAt: new Date(), trashedByUserId: user.userId, purgeEligibleAt: new Date() }).where(eq(schema.campaigns.campaignId, campaignId));
    await db.insert(operationsAuditLog).values({
      auditId: createId("aud"), actorUserId: user.userId, actorType: "user", action: "campaign.incomplete_import_purge_requested", targetType: "campaign_purge_job", targetId: result.outcome === "enqueued" ? result.jobId : "already_queued", details: { campaignId },
    });
    return { success: true, outcome: result.outcome };
  });

  server.get("/api/admin/purge-jobs", async (request) => {
    const queryParams = request.query as { status?: string; cursor?: string; limit?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = [];
    if (queryParams.status) conditions.push(eq(campaignPurgeJobs.status, queryParams.status));
    if (queryParams.cursor) conditions.push(gt(campaignPurgeJobs.jobId, queryParams.cursor));
    const rows = await db.select().from(campaignPurgeJobs).where(conditions.length ? and(...conditions) : undefined).orderBy(campaignPurgeJobs.jobId).limit(limit);
    return { jobs: rows, nextCursor: rows.length === limit ? rows.at(-1)?.jobId ?? null : null };
  });

  server.get("/api/admin/purge-jobs/:jobId", async (request) => {
    const [job] = await db.select().from(campaignPurgeJobs).where(eq(campaignPurgeJobs.jobId, (request.params as { jobId: string }).jobId)).limit(1);
    if (!job) throw new HttpError("Purge job not found", 404);
    return job;
  });

  server.post("/api/admin/purge-jobs/:jobId/retry", async (request, reply) => {
    const jobId = (request.params as { jobId: string }).jobId;
    const user = request.webUser!;
    await db.transaction(async (tx) => {
      const [job] = await tx.select().from(campaignPurgeJobs).where(eq(campaignPurgeJobs.jobId, jobId)).for("update");
      if (!job) throw new HttpError("Purge job not found", 404);
      if (job.status !== "failed") {
        reply.code(400);
        return;
      }
      await tx.update(campaignPurgeJobs).set({ status: "pending", workerId: null, leaseToken: null, leaseExpiresAt: null, updatedAt: new Date() }).where(eq(campaignPurgeJobs.jobId, jobId));
      await tx.insert(operationsAuditLog).values({ auditId: createId("aud"), actorUserId: user.userId, actorType: "user", action: "campaign.purge_retried", targetType: "campaign_purge_job", targetId: jobId, details: { actorUserId: user.userId } });
    });
    return { success: true };
  });

  server.get("/api/admin/users", async (request) => {
    const queryParams = request.query as { query?: string; status?: "active" | "disabled"; cursor?: string; limit?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = [];
    if (queryParams.status === "active") conditions.push(isNull(schema.users.disabledAt));
    if (queryParams.status === "disabled") conditions.push(sql`${schema.users.disabledAt} IS NOT NULL`);
    if (queryParams.query?.trim()) conditions.push(or(
      like(schema.users.displayName, `%${queryParams.query.trim()}%`),
      like(schema.users.emailNormalized, `%${queryParams.query.trim().toLowerCase()}%`),
    ));
    if (queryParams.cursor) conditions.push(gt(schema.users.userId, queryParams.cursor));
    const rows = await db.select({
      userId: schema.users.userId,
      email: schema.users.emailNormalized,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      isPlatformAdmin: platformAdminExpression,
      createdAt: schema.users.createdAt,
      lastLoginAt: schema.users.lastLoginAt,
      disabledAt: schema.users.disabledAt,
    }).from(schema.users).where(conditions.length ? and(...conditions) : undefined).orderBy(schema.users.userId).limit(limit);
    return { users: rows, nextCursor: rows.length === limit ? rows.at(-1)?.userId ?? null : null };
  });

  server.get("/api/admin/users/:userId", async (request) => {
    const [user] = await db.select({
      userId: schema.users.userId,
      email: schema.users.emailNormalized,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      isPlatformAdmin: platformAdminExpression,
      createdAt: schema.users.createdAt,
      lastLoginAt: schema.users.lastLoginAt,
      disabledAt: schema.users.disabledAt,
    }).from(schema.users).where(eq(schema.users.userId, (request.params as { userId: string }).userId)).limit(1);
    if (!user) throw new HttpError("User not found", 404);
    return user;
  });

  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/disable", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);
    await disableUser({ targetUserId, actorUserId });
    return { success: true };
  });
  server.post("/api/admin/users/:userId/enable", async (request) => {
    await enableUser({ targetUserId: (request.params as { userId: string }).userId, actorUserId: request.webUser!.userId });
    return { success: true };
  });
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/revoke-sessions", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);
    await revokeUserSessions({ targetUserId, actorUserId });
    return { success: true };
  });
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/grant-platform-admin", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);
    await grantPlatformAdmin({ targetUserId, actorUserId });
    return { success: true };
  });
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/revoke-platform-admin", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);
    await revokePlatformAdmin({ targetUserId, actorUserId });
    return { success: true };
  });

  server.get("/api/admin/invitations", async (request) => {
    const queryParams = request.query as { activeOnly?: string; cursor?: string; limit?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = [];
    if (queryParams.activeOnly === "true") conditions.push(and(isNull(schema.campaignInvitations.revokedAt), gt(schema.campaignInvitations.expiresAt, new Date())));
    if (queryParams.cursor) conditions.push(gt(schema.campaignInvitations.invitationId, queryParams.cursor));
    const rows = await db.select().from(schema.campaignInvitations).where(conditions.length ? and(...conditions) : undefined).orderBy(schema.campaignInvitations.invitationId).limit(limit);
    return { invitations: rows, nextCursor: rows.length === limit ? rows.at(-1)?.invitationId ?? null : null };
  });
  server.post("/api/admin/invitations/:invitationId/revoke", async (request) => {
    await revokeInvitation({ invitationId: (request.params as { invitationId: string }).invitationId, actorUserId: request.webUser!.userId });
    return { success: true };
  });

  server.get("/api/admin/audit-log", async (request) => {
    const queryParams = request.query as { action?: string; actorUserId?: string; cursor?: string; limit?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = [];
    if (queryParams.action) conditions.push(eq(operationsAuditLog.action, queryParams.action));
    if (queryParams.actorUserId) conditions.push(eq(operationsAuditLog.actorUserId, queryParams.actorUserId));
    if (queryParams.cursor) conditions.push(gt(operationsAuditLog.auditId, queryParams.cursor));
    const rows = await db.select().from(operationsAuditLog).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(operationsAuditLog.createdAt)).limit(limit);
    return { auditLog: rows, nextCursor: rows.length === limit ? rows.at(-1)?.auditId ?? null : null };
  });

  server.get("/api/admin/announcements", async (request) => {
    const queryParams = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const conditions = queryParams.cursor ? [gt(systemAnnouncements.announcementId, queryParams.cursor)] : [];
    const rows = await db.select().from(systemAnnouncements).where(conditions.length ? and(...conditions) : undefined).orderBy(systemAnnouncements.announcementId).limit(limit);
    return { announcements: rows, nextCursor: rows.length === limit ? rows.at(-1)?.announcementId ?? null : null };
  });

  server.get("/api/admin/campaign-templates", async () => {
    const catalog = await listCampaignTemplates();
    const settings = await db.select().from(campaignTemplateSettings);
    const settingsById = new Map(settings.map((setting) => [setting.templateId, setting]));
    return { templates: catalog.map((template, index) => ({ ...template, ...(settingsById.get(template.templateId) ?? { isVisible: true, sortOrder: index, isFeatured: false, updatedAt: null }) })) };
  });

  server.get("/api/admin/game-systems", async () => ({ systems: await db.select().from(gameSystemSettings).orderBy(gameSystemSettings.sortOrder) }));
}

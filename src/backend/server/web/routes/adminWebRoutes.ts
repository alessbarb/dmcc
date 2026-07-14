import type { FastifyInstance, FastifyRequest } from "fastify";
import argon2 from "argon2";
import { and, count, desc, eq, gt, isNull, like, or, sql } from "drizzle-orm";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import { campaignMessages } from "../../../db/messagingSchema.js";
import { systemAnnouncements } from "../../../db/announcementsSchema.js";
import { campaignPurgeJobs, operationsAuditLog } from "../../../db/operationsSchema.js";
import { campaignTemplateSettings, gameSystemSettings } from "../../../db/catalogSettingsSchema.js";
import { userRoles } from "../../../db/authSchema.js";
import { getRequiredPlatformAdmin } from "../webAccess.js";
import { createId } from "@shared/ids.js";
import { HttpError } from "../../errors.js";
import { restoreCampaign } from "../../../operations/campaigns/campaignTrash.js";
import { enqueueCampaignPurge } from "../../../operations/campaigns/campaignPurgeJobs.js";
import { disableUser, enableUser, grantPlatformAdmin, revokePlatformAdmin, revokeUserSessions } from "../../../operations/users/userAdministration.js";
import { revokeInvitation } from "../../../operations/users/invitationAdministration.js";
import { listCampaignTemplates } from "../../campaignTemplate/campaignTemplates.js";

/**
 * Verifies the acting platform admin's current password for a critical mutation.
 * Never persisted or logged. Throws 401 if missing or invalid.
 */
async function requireConfirmedPassword(actorUserId: string, currentPassword: unknown): Promise<void> {
  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    throw new HttpError("Password confirmation is required for this action", 401);
  }
  const [actor] = await db
    .select({ passwordHash: schema.users.passwordHash })
    .from(schema.users)
    .where(eq(schema.users.userId, actorUserId))
    .limit(1);
  if (!actor) {
    throw new HttpError("Password confirmation is required for this action", 401);
  }
  const valid = await argon2.verify(actor.passwordHash, currentPassword).catch(() => false);
  if (!valid) {
    throw new HttpError("Current password is invalid", 401);
  }
}

export async function registerAdminWebRoutes(server: FastifyInstance): Promise<void> {
  // Global preValidation hook to restrict all routes under /api/admin/* to Platform Admins
  server.addHook("preValidation", async (request: FastifyRequest) => {
    if (request.url.startsWith("/api/admin")) {
      getRequiredPlatformAdmin(request);
    }
  });

  // 1. GET /api/admin/overview
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

  // 2. GET /api/admin/campaigns
  server.get("/api/admin/campaigns", async (request) => {
    const queryParams = request.query as {
      status?: "active" | "trashed" | "importing";
      query?: string;
      limit?: string;
      cursor?: string;
    };

    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const cursor = queryParams.cursor;
    const status = queryParams.status;
    const searchQuery = queryParams.query?.trim();

    const conditions = [];
    if (status) {
      conditions.push(eq(schema.campaigns.status, status));
    }
    if (searchQuery) {
      conditions.push(
        or(
          like(schema.campaigns.title, `%${searchQuery}%`),
          like(schema.users.emailNormalized, `%${searchQuery.toLowerCase()}%`)
        )
      );
    }
    if (cursor) {
      conditions.push(gt(schema.campaigns.campaignId, cursor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
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
      })
      .from(schema.campaigns)
      .innerJoin(schema.users, eq(schema.campaigns.ownerId, schema.users.userId))
      .where(whereClause)
      .orderBy(schema.campaigns.campaignId)
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].campaignId : null;

    return {
      campaigns: rows,
      nextCursor,
    };
  });

  // 3. GET /api/admin/campaigns/:campaignId
  server.get("/api/admin/campaigns/:campaignId", async (request) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;

    const [campaign] = await db
      .select({
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
      })
      .from(schema.campaigns)
      .innerJoin(schema.users, eq(schema.campaigns.ownerId, schema.users.userId))
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);

    if (!campaign) {
      throw new HttpError("Campaign not found", 404);
    }

    // Direct counts of entities to avoid pulling private details into the DTO
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

    return {
      ...campaign,
      counts: {
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
      },
    };
  });

  // 4. POST /api/admin/campaigns/:campaignId/restore
  server.post("/api/admin/campaigns/:campaignId/restore", async (request) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const user = request.webUser!;

    await restoreCampaign({ campaignId, actorUserId: user.userId });
    return { success: true };
  });

  // 5. POST /api/admin/campaigns/:campaignId/purge
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/campaigns/:campaignId/purge", async (request, reply) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const user = request.webUser!;
    await requireConfirmedPassword(user.userId, request.body?.currentPassword);

    const [campaign] = await db
      .select({ status: schema.campaigns.status })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);

    if (!campaign) {
      throw new HttpError("Campaign not found", 404);
    }
    if (campaign.status !== "trashed") {
      reply.code(409);
      return { error: "Only campaigns in trashed status can be purged" };
    }

    const result = await enqueueCampaignPurge({
      campaignId,
      actorUserId: user.userId,
      actorType: "user",
      reason: "manual",
    });

    return { success: true, outcome: result.outcome };
  });

  // 6. POST /api/admin/campaigns/:campaignId/purge-incomplete-import
  server.post("/api/admin/campaigns/:campaignId/purge-incomplete-import", async (request, reply) => {
    const campaignId = (request.params as { campaignId: string }).campaignId;
    const user = request.webUser!;

    const [campaign] = await db
      .select({ status: schema.campaigns.status, createdAt: schema.campaigns.createdAt })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.campaignId, campaignId))
      .limit(1);

    if (!campaign) {
      throw new HttpError("Campaign not found", 404);
    }
    if (campaign.status !== "importing") {
      reply.code(400);
      return { error: "Campaign is not in importing status" };
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (campaign.createdAt >= fifteenMinutesAgo) {
      reply.code(400);
      return { error: "Campaign import was started less than 15 minutes ago" };
    }

    const result = await enqueueCampaignPurge({
      campaignId,
      actorUserId: user.userId,
      actorType: "user",
      reason: "incomplete_import",
    });

    // Also update campaigns status to 'trashed' so it matches the expected flow
    await db
      .update(schema.campaigns)
      .set({
        status: "trashed",
        trashedAt: new Date(),
        trashedByUserId: user.userId,
        purgeEligibleAt: new Date(),
      })
      .where(eq(schema.campaigns.campaignId, campaignId));

    // Log operational audit for the purge execution
    await db.insert(operationsAuditLog).values({
      auditId: createId("aud"),
      actorUserId: user.userId,
      actorType: "user",
      action: "campaign.incomplete_import_purge_requested",
      targetType: "campaign_purge_job",
      targetId: result.outcome === "enqueued" ? result.jobId : "already_queued",
      details: { campaignId },
    });

    return { success: true, outcome: result.outcome };
  });

  // 7. GET /api/admin/purge-jobs
  server.get("/api/admin/purge-jobs", async (request) => {
    const queryParams = request.query as {
      status?: string;
      cursor?: string;
      limit?: string;
    };

    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const cursor = queryParams.cursor;
    const status = queryParams.status;

    const conditions = [];
    if (status) {
      conditions.push(eq(campaignPurgeJobs.status, status));
    }
    if (cursor) {
      conditions.push(gt(campaignPurgeJobs.jobId, cursor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(campaignPurgeJobs)
      .where(whereClause)
      .orderBy(campaignPurgeJobs.jobId)
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].jobId : null;

    return {
      jobs: rows,
      nextCursor,
    };
  });

  // 8. GET /api/admin/purge-jobs/:jobId
  server.get("/api/admin/purge-jobs/:jobId", async (request) => {
    const jobId = (request.params as { jobId: string }).jobId;

    const [job] = await db
      .select()
      .from(campaignPurgeJobs)
      .where(eq(campaignPurgeJobs.jobId, jobId))
      .limit(1);

    if (!job) {
      throw new HttpError("Purge job not found", 404);
    }

    return job;
  });

  // 9. POST /api/admin/purge-jobs/:jobId/retry
  server.post("/api/admin/purge-jobs/:jobId/retry", async (request, reply) => {
    const jobId = (request.params as { jobId: string }).jobId;
    const user = request.webUser!;

    await db.transaction(async (tx) => {
      const [job] = await tx
        .select()
        .from(campaignPurgeJobs)
        .where(eq(campaignPurgeJobs.jobId, jobId))
        .for("update");

      if (!job) {
        throw new HttpError("Purge job not found", 404);
      }
      if (job.status !== "failed") {
        reply.code(400);
        return { error: "Only failed purge jobs can be retried" };
      }

      const now = new Date();
      await tx
        .update(campaignPurgeJobs)
        .set({
          status: "pending",
          workerId: null,
          leaseToken: null,
          leaseExpiresAt: null,
          updatedAt: now,
        })
        .where(eq(campaignPurgeJobs.jobId, jobId));

      await tx.insert(operationsAuditLog).values({
        auditId: createId("aud"),
        actorUserId: user.userId,
        actorType: "user",
        action: "campaign.purge_retried",
        targetType: "campaign_purge_job",
        targetId: jobId,
        details: { actorUserId: user.userId },
      });
    });

    return { success: true };
  });

  // 10. GET /api/admin/users
  server.get("/api/admin/users", async (request) => {
    const queryParams = request.query as {
      query?: string;
      status?: "active" | "disabled";
      cursor?: string;
      limit?: string;
    };

    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const cursor = queryParams.cursor;
    const status = queryParams.status;
    const searchQuery = queryParams.query?.trim();

    const conditions = [];
    if (status === "active") {
      conditions.push(isNull(schema.users.disabledAt));
    } else if (status === "disabled") {
      conditions.push(sql`${schema.users.disabledAt} IS NOT NULL`);
    }
    if (searchQuery) {
      conditions.push(
        or(
          like(schema.users.displayName, `%${searchQuery}%`),
          like(schema.users.emailNormalized, `%${searchQuery.toLowerCase()}%`)
        )
      );
    }
    if (cursor) {
      conditions.push(gt(schema.users.userId, cursor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        userId: schema.users.userId,
        email: schema.users.emailNormalized,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
        isPlatformAdmin: sql<boolean>`${userRoles.userId} IS NOT NULL`,
        createdAt: schema.users.createdAt,
        lastLoginAt: schema.users.lastLoginAt,
        disabledAt: schema.users.disabledAt,
      })
      .from(schema.users)
      .leftJoin(userRoles, and(eq(userRoles.userId, schema.users.userId), eq(userRoles.role, "admin")))
      .where(whereClause)
      .orderBy(schema.users.userId)
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].userId : null;

    return {
      users: rows,
      nextCursor,
    };
  });

  // 11. GET /api/admin/users/:userId
  server.get("/api/admin/users/:userId", async (request) => {
    const userId = (request.params as { userId: string }).userId;

    const [user] = await db
      .select({
        userId: schema.users.userId,
        email: schema.users.emailNormalized,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
        isPlatformAdmin: sql<boolean>`${userRoles.userId} IS NOT NULL`,
        createdAt: schema.users.createdAt,
        lastLoginAt: schema.users.lastLoginAt,
        disabledAt: schema.users.disabledAt,
      })
      .from(schema.users)
      .leftJoin(userRoles, and(eq(userRoles.userId, schema.users.userId), eq(userRoles.role, "admin")))
      .where(eq(schema.users.userId, userId))
      .limit(1);

    if (!user) {
      throw new HttpError("User not found", 404);
    }

    return user;
  });

  // 12. POST /api/admin/users/:userId/disable
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/disable", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);

    await disableUser({ targetUserId, actorUserId });
    return { success: true };
  });

  // 13. POST /api/admin/users/:userId/enable
  server.post("/api/admin/users/:userId/enable", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;

    await enableUser({ targetUserId, actorUserId });
    return { success: true };
  });

  // 14. POST /api/admin/users/:userId/revoke-sessions
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/revoke-sessions", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);

    await revokeUserSessions({ targetUserId, actorUserId });
    return { success: true };
  });

  // 15. POST /api/admin/users/:userId/grant-platform-admin
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/grant-platform-admin", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);

    await grantPlatformAdmin({ targetUserId, actorUserId });
    return { success: true };
  });

  // 16. POST /api/admin/users/:userId/revoke-platform-admin
  server.post<{ Body?: { currentPassword?: string } }>("/api/admin/users/:userId/revoke-platform-admin", async (request) => {
    const targetUserId = (request.params as { userId: string }).userId;
    const actorUserId = request.webUser!.userId;
    await requireConfirmedPassword(actorUserId, request.body?.currentPassword);

    await revokePlatformAdmin({ targetUserId, actorUserId });
    return { success: true };
  });

  // 17. GET /api/admin/invitations
  server.get("/api/admin/invitations", async (request) => {
    const queryParams = request.query as {
      activeOnly?: string;
      cursor?: string;
      limit?: string;
    };

    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const cursor = queryParams.cursor;
    const activeOnly = queryParams.activeOnly === "true";
    const now = new Date();

    const conditions = [];
    if (activeOnly) {
      conditions.push(
        and(
          isNull(schema.campaignInvitations.revokedAt),
          gt(schema.campaignInvitations.expiresAt, now)
        )
      );
    }
    if (cursor) {
      conditions.push(gt(schema.campaignInvitations.invitationId, cursor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Do NOT return token hashes or raw shortcodes, only administrative fields.
    const rows = await db
      .select({
        invitationId: schema.campaignInvitations.invitationId,
        campaignId: schema.campaignInvitations.campaignId,
        role: schema.campaignInvitations.role,
        maxUses: schema.campaignInvitations.maxUses,
        usesCount: schema.campaignInvitations.usesCount,
        expiresAt: schema.campaignInvitations.expiresAt,
        revokedAt: schema.campaignInvitations.revokedAt,
        createdBy: schema.campaignInvitations.createdBy,
        createdAt: schema.campaignInvitations.createdAt,
      })
      .from(schema.campaignInvitations)
      .where(whereClause)
      .orderBy(schema.campaignInvitations.invitationId)
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].invitationId : null;

    return {
      invitations: rows,
      nextCursor,
    };
  });

  // 18. POST /api/admin/invitations/:invitationId/revoke
  server.post("/api/admin/invitations/:invitationId/revoke", async (request) => {
    const invitationId = (request.params as { invitationId: string }).invitationId;
    const actorUserId = request.webUser!.userId;

    await revokeInvitation({ invitationId, actorUserId });
    return { success: true };
  });

  // 19. GET /api/admin/audit-log
  server.get("/api/admin/audit-log", async (request) => {
    const queryParams = request.query as {
      action?: string;
      actorUserId?: string;
      cursor?: string;
      limit?: string;
    };

    const limit = Math.min(Number(queryParams.limit ?? "50"), 100);
    const cursor = queryParams.cursor;
    const action = queryParams.action;
    const actorUserId = queryParams.actorUserId;

    const conditions = [];
    if (action) {
      conditions.push(eq(operationsAuditLog.action, action));
    }
    if (actorUserId) {
      conditions.push(eq(operationsAuditLog.actorUserId, actorUserId));
    }
    if (cursor) {
      conditions.push(gt(operationsAuditLog.auditId, cursor));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(operationsAuditLog)
      .where(whereClause)
      .orderBy(desc(operationsAuditLog.createdAt))
      .limit(limit);

    const nextCursor = rows.length === limit ? rows[rows.length - 1].auditId : null;

    return {
      auditLog: rows,
      nextCursor,
    };
  });

  // ─────────────────────────────────────────────
  // Administrative System Announcements (CRUD)
  // ─────────────────────────────────────────────

  interface AnnouncementBody {
    content: { title: string; body: string };
    kind: "info" | "warning" | "maintenance";
    isEnabled?: boolean;
    showOnLanding?: boolean;
    showOnDashboard?: boolean;
    isDismissible?: boolean;
    priority?: number;
    startsAt?: string | null;
    expiresAt?: string | null;
  }

  server.get<{ Querystring: { limit?: string; cursor?: string } }>(
    "/api/admin/announcements",
    async (request) => {
      const limit = Math.min(Number(request.query.limit || 50), 100);
      const cursor = request.query.cursor;

      const conditions = [];
      if (cursor) {
        conditions.push(gt(systemAnnouncements.announcementId, cursor));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(systemAnnouncements)
        .where(whereClause)
        .orderBy(desc(systemAnnouncements.createdAt))
        .limit(limit);

      const nextCursor = rows.length === limit ? rows[rows.length - 1].announcementId : null;

      return {
        announcements: rows,
        nextCursor,
      };
    }
  );

  server.post<{ Body: AnnouncementBody }>(
    "/api/admin/announcements",
    async (request, reply) => {
      const user = getRequiredPlatformAdmin(request);
      const { content, kind, isEnabled, showOnLanding, showOnDashboard, isDismissible, priority, startsAt, expiresAt } = request.body;

      if (!content || typeof content.title !== "string" || typeof content.body !== "string" || !content.title.trim() || !content.body.trim()) {
        throw new HttpError("Content with non-empty title and body is required.", 400);
      }

      if (!["info", "warning", "maintenance"].includes(kind)) {
        throw new HttpError("Invalid announcement kind. Must be info, warning, or maintenance.", 400);
      }

      const announcementId = createId("ann");

      await db.transaction(async (tx) => {
        await tx.insert(systemAnnouncements).values({
          announcementId,
          content,
          kind,
          isEnabled: isEnabled ?? true,
          showOnLanding: showOnLanding ?? true,
          showOnDashboard: showOnDashboard ?? true,
          isDismissible: isDismissible ?? true,
          priority: priority ?? 0,
          startsAt: startsAt ? new Date(startsAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdByUserId: user.userId,
        });

        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId: user.userId,
          actorType: "user",
          action: "announcement.created",
          targetType: "system_announcement",
          targetId: announcementId,
          details: { title: content.title, kind },
        });
      });

      reply.code(201);
      return { announcementId };
    }
  );

  server.put<{ Params: { announcementId: string }; Body: AnnouncementBody }>(
    "/api/admin/announcements/:announcementId",
    async (request) => {
      const user = getRequiredPlatformAdmin(request);
      const { announcementId } = request.params;
      const { content, kind, isEnabled, showOnLanding, showOnDashboard, isDismissible, priority, startsAt, expiresAt } = request.body;

      const [existing] = await db
        .select()
        .from(systemAnnouncements)
        .where(eq(systemAnnouncements.announcementId, announcementId))
        .limit(1);

      if (!existing) {
        throw new HttpError("Announcement not found.", 404);
      }

      await db.transaction(async (tx) => {
        await tx
          .update(systemAnnouncements)
          .set({
            ...(content !== undefined && { content }),
            ...(kind !== undefined && { kind }),
            ...(isEnabled !== undefined && { isEnabled }),
            ...(showOnLanding !== undefined && { showOnLanding }),
            ...(showOnDashboard !== undefined && { showOnDashboard }),
            ...(isDismissible !== undefined && { isDismissible }),
            ...(priority !== undefined && { priority }),
            ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
            ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
            updatedAt: new Date(),
          })
          .where(eq(systemAnnouncements.announcementId, announcementId));

        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId: user.userId,
          actorType: "user",
          action: "announcement.updated",
          targetType: "system_announcement",
          targetId: announcementId,
          details: { announcementId, updatedFields: Object.keys(request.body) },
        });
      });

      return { success: true };
    }
  );

  server.delete<{ Params: { announcementId: string } }>(
    "/api/admin/announcements/:announcementId",
    async (request) => {
      const user = getRequiredPlatformAdmin(request);
      const { announcementId } = request.params;

      const [existing] = await db
        .select()
        .from(systemAnnouncements)
        .where(eq(systemAnnouncements.announcementId, announcementId))
        .limit(1);

      if (!existing) {
        throw new HttpError("Announcement not found.", 404);
      }

      await db.transaction(async (tx) => {
        await tx
          .update(systemAnnouncements)
          .set({
            archivedAt: new Date(),
            isEnabled: false,
            updatedAt: new Date(),
          })
          .where(eq(systemAnnouncements.announcementId, announcementId));

        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId: user.userId,
          actorType: "user",
          action: "announcement.archived",
          targetType: "system_announcement",
          targetId: announcementId,
          details: { announcementId },
        });
      });

      return { success: true };
    }
  );

  // ── Catalog Settings: Campaign Templates ──────────────────────────────────

  // GET /api/admin/campaign-templates — list templates merged with DB settings
  server.get("/api/admin/campaign-templates", async (request) => {
    const locale = (request.query as Record<string, string>).locale;

    // Load disk templates
    const diskTemplates = listCampaignTemplates(locale ?? null);

    // Load all DB settings rows
    const dbSettings = await db.select().from(campaignTemplateSettings);
    const settingsMap = new Map(dbSettings.map((row) => [row.templateId, row]));

    const merged = diskTemplates.map((template) => {
      const settings = settingsMap.get(template.templateId);
      return {
        templateId: template.templateId,
        title: template.title,
        system: template.system,
        difficulty: template.difficulty,
        locale: template.locale,
        isVisible: settings?.isVisible ?? true,
        sortOrder: settings?.sortOrder ?? 0,
        isFeatured: settings?.isFeatured ?? false,
        updatedAt: settings?.updatedAt ?? null,
      };
    });

    return { templates: merged };
  });

  // PATCH /api/admin/campaign-templates/:templateId — update template settings
  server.patch<{
    Params: { templateId: string };
    Body: { isVisible?: boolean; sortOrder?: number; isFeatured?: boolean };
  }>(
    "/api/admin/campaign-templates/:templateId",
    async (request) => {
      const user = getRequiredPlatformAdmin(request);
      const { templateId } = request.params;
      const { isVisible, sortOrder, isFeatured } = request.body ?? {};

      await db.transaction(async (tx) => {
        // Upsert the settings row
        await tx
          .insert(campaignTemplateSettings)
          .values({
            templateId,
            ...(isVisible !== undefined && { isVisible }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isFeatured !== undefined && { isFeatured }),
            updatedByUserId: user.userId,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: campaignTemplateSettings.templateId,
            set: {
              ...(isVisible !== undefined && { isVisible }),
              ...(sortOrder !== undefined && { sortOrder }),
              ...(isFeatured !== undefined && { isFeatured }),
              updatedByUserId: user.userId,
              updatedAt: new Date(),
            },
          });

        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId: user.userId,
          actorType: "user",
          action: "campaign_template.settings_updated",
          targetType: "campaign_template",
          targetId: templateId,
          details: { templateId, updatedFields: Object.keys(request.body ?? {}) },
        });
      });

      return { success: true };
    }
  );

  // ── Catalog Settings: Game Systems ────────────────────────────────────────

  const BUILT_IN_GAME_SYSTEMS = [
    { systemId: "dnd_5e", label: "D&D 5e (SRD 5.2.1)" },
    { systemId: "pathfinder_2e", label: "Pathfinder 2e" },
    { systemId: "shadowdark", label: "Shadowdark" },
    { systemId: "custom", label: "Custom System" },
  ] as const;

  // GET /api/admin/game-systems — list systems merged with DB settings
  server.get("/api/admin/game-systems", async () => {
    const dbSettings = await db.select().from(gameSystemSettings);
    const settingsMap = new Map(dbSettings.map((row) => [row.systemId, row]));

    const merged = BUILT_IN_GAME_SYSTEMS.map(({ systemId, label }) => {
      const settings = settingsMap.get(systemId);
      return {
        systemId,
        label,
        isEnabledForNewCampaigns: systemId === "custom" ? true : (settings?.isEnabledForNewCampaigns ?? true),
        sortOrder: settings?.sortOrder ?? 0,
        updatedAt: settings?.updatedAt ?? null,
      };
    });

    return { systems: merged };
  });

  // PATCH /api/admin/game-systems/:systemId — update game system settings
  server.patch<{
    Params: { systemId: string };
    Body: { isEnabledForNewCampaigns?: boolean; sortOrder?: number };
  }>(
    "/api/admin/game-systems/:systemId",
    async (request) => {
      const user = getRequiredPlatformAdmin(request);
      const { systemId } = request.params;
      const { isEnabledForNewCampaigns, sortOrder } = request.body ?? {};

      const validSystemIds = BUILT_IN_GAME_SYSTEMS.map((s) => s.systemId) as readonly string[];
      if (!validSystemIds.includes(systemId)) {
        throw new HttpError(`Unknown game system: ${systemId}`, 400);
      }
      // The 'custom' system always remains enabled — reject attempts to disable it
      if (systemId === "custom" && isEnabledForNewCampaigns === false) {
        throw new HttpError("The 'custom' system cannot be disabled.", 422);
      }

      await db.transaction(async (tx) => {
        await tx
          .insert(gameSystemSettings)
          .values({
            systemId,
            ...(isEnabledForNewCampaigns !== undefined && { isEnabledForNewCampaigns }),
            ...(sortOrder !== undefined && { sortOrder }),
            updatedByUserId: user.userId,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: gameSystemSettings.systemId,
            set: {
              ...(isEnabledForNewCampaigns !== undefined && { isEnabledForNewCampaigns }),
              ...(sortOrder !== undefined && { sortOrder }),
              updatedByUserId: user.userId,
              updatedAt: new Date(),
            },
          });

        await tx.insert(operationsAuditLog).values({
          auditId: createId("aud"),
          actorUserId: user.userId,
          actorType: "user",
          action: "game_system.settings_updated",
          targetType: "game_system",
          targetId: systemId,
          details: { systemId, updatedFields: Object.keys(request.body ?? {}) },
        });
      });

      return { success: true };
    }
  );
}

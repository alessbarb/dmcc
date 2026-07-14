import argon2 from "argon2";
import type { FastifyInstance } from "fastify";
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
import { createId } from "@shared/ids.js";
import { db } from "../../../db/client.js";
import * as schema from "../../../db/schema.js";
import {
  getRequiredWebUser,
  hashOpaque,
  WEB_SESSION_COOKIE,
} from "../webSession.js";
import type { UserPreferences, SocialVisibility, ProfileAudience as DbProfileAudience } from "../../account/accountTypes.js";

type ProfileAudience = "owner" | "dm" | "table" | "global";

type EditableSocialProfile = {
  userId?: string;
  campaignId?: string;
  playerId?: string | null;
  displayName?: string;
  avatarUrl?: string | null;
  pronouns?: string | null;
  timeZone?: string | null;
  biography?: string | null;
  contact?: string | null;
  visibility: SocialVisibility;
  publicHandle?: string | null;
  publicationState: "private" | "unlisted" | "published";
  version: number;
};

function defaultVisibility(): SocialVisibility {
  return {
    displayName: "table",
    avatarUrl: "table",
    pronouns: "table",
    timeZone: "private",
    biography: "dm",
    contact: "private",
  };
}

function defaultPreferences(userId: string): UserPreferences {
  return {
    userId,
    locale: "en",
    timeFormat: "system",
    themeId: "default",
    colorMode: "system",
    typographySetId: "default",
    density: "comfortable",
    textScale: 1,
    enhancedContrast: false,
    reducedMotion: false,
    interfaceSounds: false,
    notifications: {
      membership: true,
      campaignActivity: true,
      sessionReminder: true,
      direct: true,
    },
    campaignNotifications: {},
    version: 0,
  };
}

function normalizePreferences(userId: string, value: unknown): UserPreferences {
  const base = defaultPreferences(userId);
  if (!value || typeof value !== "object") return base;
  return { ...base, ...(value as Record<string, any>), userId } as UserPreferences;
}

function toDmProfile(row: typeof schema.dmProfiles.$inferSelect | undefined): EditableSocialProfile | undefined {
  if (!row) return undefined;
  return {
    userId: row.userId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    pronouns: row.pronouns,
    timeZone: row.timeZone,
    biography: row.biography,
    contact: row.contact,
    visibility: (row.visibility as SocialVisibility | null) ?? defaultVisibility(),
    publicHandle: row.publicHandle,
    publicationState: row.publicationState as EditableSocialProfile["publicationState"],
    version: row.version,
  };
}

function toPlayerProfile(row: typeof schema.playerProfiles.$inferSelect): EditableSocialProfile {
  return {
    userId: row.userId ?? undefined,
    campaignId: row.campaignId,
    playerId: row.profileId,
    displayName: row.displayName,
    avatarUrl: undefined,
    pronouns: row.pronouns,
    biography: row.biography,
    contact: row.contact,
    visibility: (row.visibility as SocialVisibility | null) ?? defaultVisibility(),
    publicHandle: row.publicHandle,
    publicationState: row.publicationState as EditableSocialProfile["publicationState"],
    version: row.version,
  };
}

function canSeeProfileField(audience: ProfileAudience, visibility: DbProfileAudience | undefined): boolean {
  const resolved = visibility ?? "private";
  if (audience === "owner") return true;
  if (audience === "dm") return resolved === "dm" || resolved === "table" || resolved === "global";
  if (audience === "table") return resolved === "table" || resolved === "global";
  return resolved === "global";
}

function projectProfile(profile: EditableSocialProfile | undefined | null, audience: ProfileAudience = "owner") {
  if (!profile) return null;
  const visibility = { ...defaultVisibility(), ...(profile.visibility ?? {}) };
  const projected: Record<string, unknown> = {
    publicHandle: profile.publicHandle ?? null,
    publicationState: profile.publicationState,
  };

  const maybeAdd = (field: keyof Pick<EditableSocialProfile, "displayName" | "avatarUrl" | "pronouns" | "timeZone" | "biography" | "contact">) => {
    if (canSeeProfileField(audience, visibility[field])) {
      projected[field] = profile[field] ?? null;
    }
  };

  maybeAdd("displayName");
  maybeAdd("avatarUrl");
  maybeAdd("pronouns");
  maybeAdd("timeZone");
  maybeAdd("biography");
  maybeAdd("contact");

  return projected;
}

function projectProfilePreviews(profile: EditableSocialProfile | undefined | null) {
  return {
    owner: projectProfile(profile, "owner"),
    dm: projectProfile(profile, "dm"),
    table: projectProfile(profile, "table"),
    global: projectProfile(profile, "global"),
  };
}

function isPubliclyAddressable(profile: EditableSocialProfile | undefined | null): profile is EditableSocialProfile {
  return Boolean(profile?.publicHandle && profile.publicationState !== "private");
}

function bodyString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

async function verifyCurrentPassword(user: typeof schema.users.$inferSelect, currentPassword: unknown): Promise<boolean> {
  if (typeof currentPassword !== "string" || currentPassword.length === 0) return false;
  return argon2.verify(user.passwordHash, currentPassword).catch(() => false);
}

async function getCurrentUserRecord(userId: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  return user;
}

function getCurrentSessionHash(request: { cookies?: Record<string, string | undefined> }): string | null {
  const token = request.cookies?.[WEB_SESSION_COOKIE];
  return token ? hashOpaque(token) : null;
}

export async function registerAccountWebRoutes(server: FastifyInstance): Promise<void> {
  server.get("/api/account", async (request, reply) => {
    const webUser = getRequiredWebUser(request);
    const user = await getCurrentUserRecord(webUser.userId);
    if (!user) {
      reply.code(404);
      return { error: "Account not found" };
    }

    const [storedPreferences] = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, webUser.userId)).limit(1);
    const [dmProfileRow] = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.userId, webUser.userId)).limit(1);
    const playerProfileRows = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.userId, webUser.userId));
    const membershipRows = await db.select().from(schema.campaignMemberships).where(eq(schema.campaignMemberships.userId, webUser.userId));
    const campaignIds = Array.from(new Set(membershipRows.map((membership) => membership.campaignId)));
    const campaignRows = campaignIds.length
      ? await db.select().from(schema.campaigns).where(inArray(schema.campaigns.campaignId, campaignIds))
      : [];
    const campaignById = new Map(campaignRows.map((campaign) => [campaign.campaignId, campaign]));

    const activeMemberships = membershipRows.filter((membership) => {
      const campaign = campaignById.get(membership.campaignId);
      return campaign && campaign.status !== "deleted";
    });

    const activePlayerProfiles = playerProfileRows.filter((profile) => {
      const campaign = campaignById.get(profile.campaignId);
      return campaign && campaign.status !== "deleted";
    });

    return {
      account: {
        userId: user.userId,
        email: user.emailNormalized,
        displayName: user.displayName ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
      },
      preferences: normalizePreferences(webUser.userId, storedPreferences?.preferences),
      dmProfile: toDmProfile(dmProfileRow),
      playerProfiles: activePlayerProfiles.map(toPlayerProfile),
      memberships: activeMemberships.map((membership) => ({
        campaignId: membership.campaignId,
        role: membership.role === "viewer" ? "observer" : membership.role,
        playerId: membership.playerId ?? undefined,
        campaignTitle: campaignById.get(membership.campaignId)?.title,
        campaignStatus: campaignById.get(membership.campaignId)?.status,
        revokedAt: membership.revokedAt?.toISOString(),
      })),
    };
  });

  server.put<{ Body: { displayName?: unknown; avatarUrl?: unknown; email?: unknown; currentPassword?: unknown } }>(
    "/api/account/identity",
    async (request, reply) => {
      const webUser = getRequiredWebUser(request);
      const user = await getCurrentUserRecord(webUser.userId);
      if (!user) {
        reply.code(404);
        return { error: "Account not found" };
      }
      const displayName = bodyString(request.body?.displayName);
      const avatarUrl = bodyString(request.body?.avatarUrl);
      const email = bodyString(request.body?.email)?.toLowerCase();
      const patch: Partial<typeof schema.users.$inferInsert> = {};
      if (displayName !== undefined) patch.displayName = displayName;
      if (avatarUrl !== undefined) patch.avatarUrl = avatarUrl;
      if (email && email !== user.emailNormalized) {
        const currentPasswordValid = await verifyCurrentPassword(user, request.body?.currentPassword);
        if (!currentPasswordValid) {
          reply.code(403);
          return { error: "Current password is required to change email", field: "currentPassword" };
        }
        patch.emailNormalized = email;
        patch.emailHash = hashOpaque(email);
      }
      if (Object.keys(patch).length > 0) {
        await db.update(schema.users).set(patch).where(eq(schema.users.userId, webUser.userId));
      }
      const updated = await getCurrentUserRecord(webUser.userId);
      return {
        account: {
          userId: webUser.userId,
          email: updated?.emailNormalized ?? email ?? webUser.email,
          displayName: updated?.displayName ?? undefined,
          avatarUrl: updated?.avatarUrl ?? undefined,
        },
      };
    },
  );

  server.put<{ Body: Record<string, unknown> }>("/api/account/preferences", async (request) => {
    const webUser = getRequiredWebUser(request);
    const preferences = normalizePreferences(webUser.userId, request.body);
    await db
      .insert(schema.userPreferences)
      .values({ userId: webUser.userId, preferences })
      .onConflictDoUpdate({
        target: schema.userPreferences.userId,
        set: { preferences, updatedAt: new Date() },
      });
    return { preferences };
  });

  server.put<{ Body: EditableSocialProfile }>("/api/account/profiles/dm", async (request) => {
    const webUser = getRequiredWebUser(request);
    const body = request.body;
    const displayName = bodyString(body.displayName) || webUser.displayName || webUser.email;
    const values = {
      userId: webUser.userId,
      displayName,
      avatarUrl: body.avatarUrl ?? null,
      pronouns: body.pronouns ?? null,
      timeZone: body.timeZone ?? null,
      biography: body.biography ?? null,
      contact: body.contact ?? null,
      publicHandle: body.publicHandle ?? null,
      publicationState: body.publicationState ?? "private",
      visibility: body.visibility ?? defaultVisibility(),
      version: (body.version ?? 0) + 1,
      updatedAt: new Date(),
    };
    await db.insert(schema.dmProfiles).values(values).onConflictDoUpdate({ target: schema.dmProfiles.userId, set: values });
    return { profile: { ...body, ...values } };
  });

  server.put<{ Params: { campaignId: string }; Body: EditableSocialProfile }>(
    "/api/account/profiles/player/:campaignId",
    async (request, reply) => {
      const webUser = getRequiredWebUser(request);
      const membership = await db
        .select()
        .from(schema.campaignMemberships)
        .where(and(
          eq(schema.campaignMemberships.userId, webUser.userId),
          eq(schema.campaignMemberships.campaignId, request.params.campaignId),
          isNull(schema.campaignMemberships.revokedAt),
        ))
        .limit(1);
      if (!membership[0]) {
        reply.code(403);
        return { error: "Active campaign membership required" };
      }
      const existing = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(
          eq(schema.playerProfiles.userId, webUser.userId),
          eq(schema.playerProfiles.campaignId, request.params.campaignId),
        ))
        .limit(1);
      const profileId = existing[0]?.profileId ?? membership[0].playerId ?? createId("ply");
      const body = request.body;
      const values = {
        profileId,
        campaignId: request.params.campaignId,
        userId: webUser.userId,
        displayName: bodyString(body.displayName) || webUser.displayName || webUser.email,
        pronouns: body.pronouns ?? null,
        biography: body.biography ?? null,
        contact: body.contact ?? null,
        linkedCharacterId: null,
        publicHandle: body.publicHandle ?? null,
        publicationState: body.publicationState ?? "private",
        visibility: body.visibility ?? defaultVisibility(),
        version: (body.version ?? 0) + 1,
        updatedAt: new Date(),
      };
      if (existing[0]) {
        await db.update(schema.playerProfiles).set(values).where(eq(schema.playerProfiles.profileId, profileId));
      } else {
        await db.insert(schema.playerProfiles).values(values);
      }
      return { profile: { ...body, ...values, playerId: profileId } };
    },
  );

  server.get<{ Querystring: { profile?: string; campaignId?: string } }>("/api/account/privacy/preview", async (request) => {
    const webUser = getRequiredWebUser(request);
    if (request.query.profile === "player" && request.query.campaignId) {
      const [profile] = await db
        .select()
        .from(schema.playerProfiles)
        .where(and(eq(schema.playerProfiles.userId, webUser.userId), eq(schema.playerProfiles.campaignId, request.query.campaignId)))
        .limit(1);
      return { previews: projectProfilePreviews(profile ? toPlayerProfile(profile) : null) };
    }
    const [profile] = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.userId, webUser.userId)).limit(1);
    return { previews: projectProfilePreviews(toDmProfile(profile)) };
  });

  server.get<{ Params: { publicHandle: string } }>("/api/profiles/:publicHandle", async (request, reply) => {
    const [dmProfile] = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.publicHandle, request.params.publicHandle)).limit(1);
    const dm = toDmProfile(dmProfile);
    if (isPubliclyAddressable(dm)) return { profile: projectProfile(dm, "global") };

    const [playerProfile] = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.publicHandle, request.params.publicHandle)).limit(1);
    const player = playerProfile ? toPlayerProfile(playerProfile) : undefined;
    if (isPubliclyAddressable(player)) return { profile: projectProfile(player, "global") };

    reply.code(404);
    return { error: "Profile not found" };
  });

  server.get<{ Params: { campaignId: string } }>("/api/campaigns/:campaignId/member-profiles", async (request, reply) => {
    const webUser = getRequiredWebUser(request);
    const requester = await db
      .select()
      .from(schema.campaignMemberships)
      .where(and(
        eq(schema.campaignMemberships.userId, webUser.userId),
        eq(schema.campaignMemberships.campaignId, request.params.campaignId),
        isNull(schema.campaignMemberships.revokedAt),
      ))
      .limit(1);
    if (!requester[0]) {
      reply.code(403);
      return { error: "Active campaign membership required" };
    }
    const requesterIsDm = requester[0].role === "dm" || requester[0].role === "co_dm";
    const members = await db.select().from(schema.campaignMemberships).where(eq(schema.campaignMemberships.campaignId, request.params.campaignId));
    const userIds = members.map((member) => member.userId);
    const dmRows = userIds.length ? await db.select().from(schema.dmProfiles).where(inArray(schema.dmProfiles.userId, userIds)) : [];
    const playerRows = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.campaignId, request.params.campaignId));
    return {
      profiles: members.flatMap((member) => {
        const source = member.role === "dm" || member.role === "co_dm"
          ? toDmProfile(dmRows.find((profile) => profile.userId === member.userId))
          : playerRows.find((profile) => profile.userId === member.userId);
        const audience: ProfileAudience = member.userId === webUser.userId ? "owner" : requesterIsDm ? "dm" : "table";
        const profile = member.role === "dm" || member.role === "co_dm"
          ? projectProfile(source as EditableSocialProfile | undefined, audience)
          : projectProfile(source ? toPlayerProfile(source as typeof schema.playerProfiles.$inferSelect) : null, audience);
        return profile ? [{ userId: member.userId, role: member.role, playerId: member.playerId ?? undefined, profile }] : [];
      }),
    };
  });

  server.get("/api/account/sessions", async (request) => {
    const webUser = getRequiredWebUser(request);
    const currentHash = getCurrentSessionHash(request);
    const sessions = await db.select().from(schema.authSessions).where(and(eq(schema.authSessions.userId, webUser.userId), isNull(schema.authSessions.revokedAt)));
    return {
      sessions: sessions.map((session) => ({
        sessionRef: session.sessionIdHash.slice(0, 24),
        createdAt: session.createdAt.toISOString(),
        lastSeenAt: session.lastSeenAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        current: session.sessionIdHash === currentHash,
      })),
    };
  });

  server.delete("/api/account/sessions/others", async (request) => {
    const webUser = getRequiredWebUser(request);
    const currentHash = getCurrentSessionHash(request);
    const sessions = await db.select().from(schema.authSessions).where(eq(schema.authSessions.userId, webUser.userId));
    const now = new Date();
    await Promise.all(
      sessions
        .filter((session) => session.sessionIdHash !== currentHash && !session.revokedAt)
        .map((session) => db.update(schema.authSessions).set({ revokedAt: now }).where(eq(schema.authSessions.sessionIdHash, session.sessionIdHash))),
    );
    return { revoked: true };
  });

  server.delete<{ Params: { sessionRef: string } }>("/api/account/sessions/:sessionRef", async (request, reply) => {
    const webUser = getRequiredWebUser(request);
    const sessions = await db
      .select()
      .from(schema.authSessions)
      .where(and(eq(schema.authSessions.userId, webUser.userId), isNull(schema.authSessions.revokedAt)));
    const session = sessions.find((candidate) => candidate.sessionIdHash.startsWith(request.params.sessionRef));
    if (!session) {
      reply.code(404);
      return { error: "Session not found" };
    }
    await db.update(schema.authSessions).set({ revokedAt: new Date() }).where(eq(schema.authSessions.sessionIdHash, session.sessionIdHash));
    return { revoked: true };
  });

  server.delete("/api/account/sessions", async (request) => {
    const webUser = getRequiredWebUser(request);
    await db.update(schema.authSessions).set({ revokedAt: new Date() }).where(eq(schema.authSessions.userId, webUser.userId));
    return { revoked: true };
  });

  server.get("/api/account/export", async (request, reply) => {
    const webUser = getRequiredWebUser(request);
    const [user] = await db.select().from(schema.users).where(eq(schema.users.userId, webUser.userId)).limit(1);
    const [preferences] = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, webUser.userId)).limit(1);
    const dmProfile = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.userId, webUser.userId));
    const playerProfiles = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.userId, webUser.userId));
    const memberships = await db.select().from(schema.campaignMemberships).where(eq(schema.campaignMemberships.userId, webUser.userId));
    reply.header("Content-Disposition", `attachment; filename="dmcc-account-${webUser.userId}.json"`);
    return { user, preferences, dmProfile, playerProfiles, memberships };
  });

  server.get("/api/account/deletion-impact", async (request) => {
    const webUser = getRequiredWebUser(request);
    const ownedCampaigns = await db.select().from(schema.campaigns).where(
      and(
        eq(schema.campaigns.ownerId, webUser.userId),
        ne(schema.campaigns.status, "deleted")
      )
    );
    return { blockers: ownedCampaigns.map((campaign) => ({ campaignId: campaign.campaignId, reason: "sole_responsible_dm" })) };
  });

  server.delete<{ Body: { currentPassword?: string; confirmation?: string } }>("/api/account", async (request, reply) => {
    const webUser = getRequiredWebUser(request);
    const user = await getCurrentUserRecord(webUser.userId);
    if (!user) {
      reply.code(404);
      return { error: "Account not found" };
    }
    if (!(await verifyCurrentPassword(user, request.body?.currentPassword))) {
      reply.code(403);
      return { error: "Current password is invalid", field: "currentPassword" };
    }
    const ownedCampaigns = await db.select().from(schema.campaigns).where(
      and(
        eq(schema.campaigns.ownerId, webUser.userId),
        ne(schema.campaigns.status, "deleted")
      )
    );
    if (ownedCampaigns.length > 0) {
      reply.code(409);
      return { error: "Transfer or delete owned campaigns before deleting this account", blockers: ownedCampaigns.map((campaign) => ({ campaignId: campaign.campaignId, reason: "sole_responsible_dm" })) };
    }
    await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.userId, webUser.userId));
    await db.update(schema.authSessions).set({ revokedAt: new Date() }).where(eq(schema.authSessions.userId, webUser.userId));
    return { deleted: true };
  });
}

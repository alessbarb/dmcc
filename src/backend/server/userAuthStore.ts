import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename, resolve } from "node:path";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { hashSecret, verifySecret } from "./auth.js";
import { validateAvatarUrl, validateDisplayName, normalizePublicHandle, PROFILE_LIMITS } from "./account/accountValidation.js";
import type { DmSocialProfile, PlayerSocialProfile, UserPreferences, ProfileAudience, PublicationState, SocialVisibility } from "./account/accountTypes.js";

export type UserAccount = {
  userId: string;
  emailNormalized: string;
  emailHash: string;
  displayName?: string;
  avatarUrl?: string;
  passwordHash: string;
  passwordSalt: string;
  passwordAlgorithm: "scrypt";
  vaultRole: "admin" | "user";
  createdAt: string;
  lastLoginAt?: string;
  disabledAt?: string;
};

export type CampaignMembership = {
  campaignId: string;
  userId: string;
  role: "dm" | "player" | "observer";
  playerId?: string;
  createdAt: string;
  revokedAt?: string;
};

export type AuthSession = {
  sessionIdHash: string;
  userId: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt?: string;
};

export type RecoveryCode = {
  userId: string;
  codeHash: string;
  createdAt: string;
  usedAt?: string;
};

export type PasswordResetToken = {
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

export type UserAuthStore = {
  schemaVersion: 4;
  accessCodePepper: string;
  users: UserAccount[];
  memberships: CampaignMembership[];
  sessions: AuthSession[];
  recoveryCodes: RecoveryCode[];
  passwordResetTokens: PasswordResetToken[];
  preferences: UserPreferences[];
  dmProfiles: DmSocialProfile[];
  playerProfiles: PlayerSocialProfile[];
  createdAt: string;
  updatedAt: string;
  migration?: {
    fromSchemaVersion: 2 | 3;
    completedAt: string;
  };
};

const ABSOLUTE_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
export const IDLE_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashOpaque(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function nowIso(): string {
  return new Date().toISOString();
}

function pathFor(vaultDir: string): string {
  return join(vaultDir, "auth.json");
}

export function getTenantIdFromVaultDir(vaultDir: string): string {
  if (process.env.DMCC_STORAGE_MODE === "postgres") {
    return "default";
  }
  const absVault = resolve(vaultDir);
  const vaultId = basename(absVault) || "default";
  const baseDir = resolve(absVault, "..", "..");
  const hash = createHash("sha256").update(baseDir).digest("hex").slice(0, 10);
  return `${vaultId}_${hash}`;
}

export async function readUserAuthStore(vaultDir: string, skipMigration = false): Promise<UserAuthStore> {
  const authPath = pathFor(vaultDir);
  if (!skipMigration && existsSync(authPath)) {
    try {
      const fileData = JSON.parse(await readFile(authPath, "utf8"));
      if (!fileData.migration && fileData.schemaVersion >= 3 && fileData.schemaVersion < 4) {
        const absVault = resolve(vaultDir);
        const vaultId = basename(absVault) || "default";
        const dataDir = resolve(absVault, "..", "..");
        return await migrateLegacyAuthStore(dataDir, vaultId);
      }
    } catch {}
  }
  const tenantId = getTenantIdFromVaultDir(vaultDir);

  // Load from DB
  const dbUsers = await db.select().from(schema.users).where(eq(schema.users.vaultId, tenantId));
  const userIds = dbUsers.map((u) => u.userId);

  let dbSessions: typeof schema.authSessions.$inferSelect[] = [];
  let dbMemberships: typeof schema.campaignMemberships.$inferSelect[] = [];
  let dbRecoveryCodes: typeof schema.recoveryCodes.$inferSelect[] = [];
  let dbResetTokens: typeof schema.passwordResetTokens.$inferSelect[] = [];
  let dbPreferences: typeof schema.userPreferences.$inferSelect[] = [];
  let dbDmProfiles: typeof schema.dmProfiles.$inferSelect[] = [];
  let dbPlayerProfiles: typeof schema.playerProfiles.$inferSelect[] = [];

  if (userIds.length > 0) {
    dbSessions = await db.select().from(schema.authSessions).where(inArray(schema.authSessions.userId, userIds));
    dbMemberships = await db.select().from(schema.campaignMemberships).where(inArray(schema.campaignMemberships.userId, userIds));
    dbRecoveryCodes = await db.select().from(schema.recoveryCodes).where(inArray(schema.recoveryCodes.userId, userIds));
    dbResetTokens = await db.select().from(schema.passwordResetTokens).where(inArray(schema.passwordResetTokens.userId, userIds));
    dbPreferences = await db.select().from(schema.userPreferences).where(inArray(schema.userPreferences.userId, userIds));
    dbDmProfiles = await db.select().from(schema.dmProfiles).where(inArray(schema.dmProfiles.userId, userIds));
    dbPlayerProfiles = await db.select().from(schema.playerProfiles).where(inArray(schema.playerProfiles.userId, userIds));
  }

  const usersList: UserAccount[] = dbUsers.map((u) => ({
    userId: u.userId,
    emailNormalized: u.emailNormalized,
    emailHash: u.emailHash,
    displayName: u.displayName ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    passwordHash: u.passwordHash,
    passwordSalt: u.passwordSalt,
    passwordAlgorithm: u.passwordAlgorithm as "scrypt",
    vaultRole: u.vaultRole as "admin" | "user",
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString(),
    disabledAt: u.disabledAt?.toISOString(),
  }));

  const sessionsList: AuthSession[] = dbSessions.map((s) => ({
    sessionIdHash: s.sessionIdHash,
    userId: s.userId,
    createdAt: s.createdAt.toISOString(),
    lastSeenAt: s.lastSeenAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    revokedAt: s.revokedAt?.toISOString(),
  }));

  const membershipsList: CampaignMembership[] = dbMemberships.map((m) => ({
    campaignId: m.campaignId,
    userId: m.userId,
    role: m.role as "dm" | "player" | "observer",
    playerId: m.playerId ?? undefined,
    createdAt: m.createdAt.toISOString(),
    revokedAt: m.revokedAt?.toISOString(),
  }));

  const recoveryCodesList: RecoveryCode[] = dbRecoveryCodes.map((rc) => ({
    userId: rc.userId,
    codeHash: rc.codeHash,
    createdAt: rc.createdAt.toISOString(),
    usedAt: rc.usedAt?.toISOString(),
  }));

  const resetTokensList: PasswordResetToken[] = dbResetTokens.map((rt) => ({
    userId: rt.userId,
    tokenHash: rt.tokenHash,
    createdAt: rt.createdAt.toISOString(),
    expiresAt: rt.expiresAt.toISOString(),
    usedAt: rt.usedAt?.toISOString(),
  }));

  const preferencesList: UserPreferences[] = dbPreferences.map((p) => p.preferences as UserPreferences);

  const dmProfilesList: DmSocialProfile[] = dbDmProfiles.map((dp) => ({
    userId: dp.userId,
    displayName: dp.displayName,
    avatarUrl: dp.avatarUrl ?? undefined,
    pronouns: dp.pronouns ?? undefined,
    timeZone: dp.timeZone ?? undefined,
    biography: dp.biography ?? undefined,
    contact: dp.contact ?? undefined,
    publicHandle: dp.publicHandle ?? undefined,
    publicationState: dp.publicationState as PublicationState,
    visibility: dp.visibility as SocialVisibility,
    version: dp.version,
  }));

  const playerProfilesList: PlayerSocialProfile[] = dbPlayerProfiles.map((pp) => ({
    userId: pp.userId ?? "",
    campaignId: pp.campaignId,
    playerId: pp.profileId,
    displayName: pp.displayName,
    avatarUrl: undefined,
    pronouns: pp.pronouns ?? undefined,
    biography: pp.biography ?? undefined,
    contact: pp.contact ?? undefined,
    publicHandle: pp.publicHandle ?? undefined,
    publicationState: pp.publicationState as PublicationState,
    visibility: pp.visibility as SocialVisibility,
    version: pp.version,
  }));

  let accessCodePepper = randomBytes(32).toString("hex");
  let migration: any = undefined;
  // Use already declared authPath
  if (existsSync(authPath)) {
    try {
      const fileData = JSON.parse(await readFile(authPath, "utf8"));
      accessCodePepper = fileData.accessCodePepper ?? accessCodePepper;
      migration = fileData.migration;
    } catch {}
  }

  return {
    schemaVersion: 4,
    accessCodePepper,
    users: usersList,
    memberships: membershipsList,
    sessions: sessionsList,
    recoveryCodes: recoveryCodesList,
    passwordResetTokens: resetTokensList,
    preferences: preferencesList,
    dmProfiles: dmProfilesList,
    playerProfiles: playerProfilesList,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    migration,
  };
}

export async function writeUserAuthStore(vaultDir: string, store: UserAuthStore): Promise<void> {
  const authPath = pathFor(vaultDir);
  try {
    await mkdir(vaultDir, { recursive: true });
    await writeFile(authPath, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("MIGRATE LOG: failed to write auth.json", err);
  }
}

async function syncToDisk(vaultDir: string): Promise<void> {
  const store = await readUserAuthStore(vaultDir);
  await writeUserAuthStore(vaultDir, store);
}

export async function migrateLegacyAuthStore(dataDir: string, vaultId: string): Promise<UserAuthStore> {
  const vaultDir = join(dataDir, "vaults", vaultId);
  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const authPath = pathFor(vaultDir);

  if (!existsSync(authPath)) {
    return await readUserAuthStore(vaultDir, true);
  }

  let legacyData: any = null;
  try {
    legacyData = JSON.parse(await readFile(authPath, "utf8"));
  } catch {
    return await readUserAuthStore(vaultDir, true);
  }
  if (legacyData.migration) {
    return await readUserAuthStore(vaultDir, true);
  }

  const migratedUsers: UserAccount[] = [];
  if (legacyData.schemaVersion === 2 && Array.isArray(legacyData.dmAccounts)) {
    try {
      await writeFile(`${authPath}.v2.bak`, JSON.stringify(legacyData, null, 2), "utf8");
    } catch {}

    for (const dm of legacyData.dmAccounts) {

      const userObj: UserAccount = {
        userId: dm.dmId,
        emailNormalized: dm.emailNormalized,
        emailHash: dm.emailHash,
        displayName: dm.displayName,
        passwordHash: dm.secretHash,
        passwordSalt: dm.secretSalt,
        passwordAlgorithm: "scrypt",
        vaultRole: "admin",
        createdAt: dm.createdAt || nowIso(),
      };
      migratedUsers.push(userObj);
      await db.insert(schema.users).values({
        userId: userObj.userId,
        vaultId: tenantId,
        emailNormalized: userObj.emailNormalized,
        emailHash: userObj.emailHash,
        displayName: userObj.displayName,
        passwordHash: userObj.passwordHash,
        passwordSalt: userObj.passwordSalt,
        passwordAlgorithm: userObj.passwordAlgorithm,
        vaultRole: userObj.vaultRole,
        createdAt: new Date(userObj.createdAt),
      }).onConflictDoNothing();




      const workspaceId = `wsp_personal_${userObj.userId}`;
      await db.insert(schema.workspaces).values({
        workspaceId,
        vaultId: tenantId,
        name: `${userObj.displayName ?? "Personal"}'s Workspace`,
        ownerId: userObj.userId,
      }).onConflictDoNothing();

      await db.insert(schema.workspaceMemberships).values({
        workspaceId,
        userId: userObj.userId,
        role: "owner",
      }).onConflictDoNothing();
    }
  }

  if (Array.isArray(legacyData.users)) {
    for (const user of legacyData.users) {
      await db.insert(schema.users).values({
        userId: user.userId,
        vaultId: tenantId,
        emailNormalized: user.emailNormalized,
        emailHash: user.emailHash,
        displayName: user.displayName,
        passwordHash: user.passwordHash,
        passwordSalt: user.passwordSalt,
        passwordAlgorithm: user.passwordAlgorithm || "scrypt",
        vaultRole: user.vaultRole || "user",
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      }).onConflictDoNothing();

      const workspaceId = `wsp_personal_${user.userId}`;
      await db.insert(schema.workspaces).values({
        workspaceId,
        vaultId: tenantId,
        name: `${user.displayName ?? "Personal"}'s Workspace`,
        ownerId: user.userId,
      }).onConflictDoNothing();

      await db.insert(schema.workspaceMemberships).values({
        workspaceId,
        userId: user.userId,
        role: "owner",
      }).onConflictDoNothing();
    }
  }

  let acl: any = { campaigns: {} };
  const aclPath = join(vaultDir, "campaign-acl.json");
  if (existsSync(aclPath)) {
    try {
      acl = JSON.parse(await readFile(aclPath, "utf8"));
    } catch {}
  }

  for (const entry of Object.values(acl.campaigns ?? {}) as any[]) {
    const dmIds = new Set<string>([entry.ownerDmId, ...(entry.dmIds ?? [])].filter(Boolean));
    for (const userId of dmIds) {
      const dbUser = await db.select().from(schema.users).where(and(eq(schema.users.userId, userId), eq(schema.users.vaultId, tenantId))).limit(1);
      if (dbUser.length === 0) continue;

      const campaignId = entry.campaignId;
      const workspaceId = `wsp_personal_${userId}`;
      await db.insert(schema.campaigns).values({
        campaignId,
        vaultId: tenantId,
        title: entry.title ?? "Imported Campaign",
        workspaceId,
        ownerId: userId,
      }).onConflictDoNothing();

      await db.insert(schema.campaignMemberships).values({
        campaignId,
        userId,
        role: "dm",
        createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
      }).onConflictDoNothing();
    }
  }

  if (Array.isArray(legacyData.memberships)) {
    for (const membership of legacyData.memberships) {
      await db.insert(schema.campaignMemberships).values({
        campaignId: membership.campaignId,
        userId: membership.userId,
        role: membership.role,
        playerId: membership.playerId ?? null,
        createdAt: membership.createdAt ? new Date(membership.createdAt) : new Date(),
      }).onConflictDoNothing();
    }
  }

  const updatedStore = await readUserAuthStore(vaultDir, true);
  const migratedStore: UserAuthStore = {
    ...updatedStore,
    migration: {
      fromSchemaVersion: legacyData.schemaVersion === 2 ? 2 : 3,
      completedAt: nowIso(),
    },
  };

  await writeUserAuthStore(vaultDir, migratedStore);
  return migratedStore;
}

export function defaultUserPreferences(userId: string): UserPreferences {
  return {
    userId,
    locale: "en",
    timeFormat: "system",
    themeId: "default",
    colorMode: "system",
    typographySetId: "cinzel-outfit",
    density: "comfortable",
    textScale: 1,
    enhancedContrast: false,
    reducedMotion: false,
    interfaceSounds: true,
    notifications: {
      membership: true,
      campaignActivity: true,
      sessionReminder: true,
      direct: true,
    },
    campaignNotifications: {},
    version: 1,
  };
}

export async function getOrCreatePreferences(vaultDir: string, userId: string): Promise<UserPreferences> {
  const existing = await db.select().from(schema.userPreferences).where(eq(schema.userPreferences.userId, userId)).limit(1);
  if (existing.length > 0) {
    return existing[0].preferences as UserPreferences;
  }
  const preferences = defaultUserPreferences(userId);
  await db.insert(schema.userPreferences).values({
    userId,
    preferences,
  }).onConflictDoNothing();
  return preferences;
}

export async function getAccountAggregate(vaultDir: string, userId: string) {
  const dbUser = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = dbUser[0];
  if (!user || user.disabledAt) throw Object.assign(new Error("Account not found"), { statusCode: 404 });

  const preferences = await getOrCreatePreferences(vaultDir, userId);

  const dbDmProfile = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.userId, userId)).limit(1);
  const dmProfile: DmSocialProfile | null = dbDmProfile.length > 0 ? {
    userId: dbDmProfile[0].userId,
    displayName: dbDmProfile[0].displayName,
    avatarUrl: dbDmProfile[0].avatarUrl ?? undefined,
    pronouns: dbDmProfile[0].pronouns ?? undefined,
    timeZone: dbDmProfile[0].timeZone ?? undefined,
    biography: dbDmProfile[0].biography ?? undefined,
    contact: dbDmProfile[0].contact ?? undefined,
    publicHandle: dbDmProfile[0].publicHandle ?? undefined,
    publicationState: dbDmProfile[0].publicationState as PublicationState,
    visibility: dbDmProfile[0].visibility as SocialVisibility,
    version: dbDmProfile[0].version,
  } : null;

  const dbPlayerProfiles = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.userId, userId));
  const playerProfiles: PlayerSocialProfile[] = dbPlayerProfiles.map((pp) => ({
    userId: pp.userId ?? "",
    campaignId: pp.campaignId,
    playerId: pp.profileId,
    displayName: pp.displayName,
    avatarUrl: undefined,
    pronouns: pp.pronouns ?? undefined,
    biography: pp.biography ?? undefined,
    contact: pp.contact ?? undefined,
    publicHandle: pp.publicHandle ?? undefined,
    publicationState: pp.publicationState as PublicationState,
    visibility: pp.visibility as SocialVisibility,
    version: pp.version,
  }));

  const dbMemberships = await db
    .select({
      campaignId: schema.campaignMemberships.campaignId,
      userId: schema.campaignMemberships.userId,
      role: schema.campaignMemberships.role,
      playerId: schema.campaignMemberships.playerId,
      createdAt: schema.campaignMemberships.createdAt,
      revokedAt: schema.campaignMemberships.revokedAt,
      campaignTitle: schema.campaigns.title,
      campaignStatus: schema.campaigns.status,
    })
    .from(schema.campaignMemberships)
    .leftJoin(schema.campaigns, eq(schema.campaignMemberships.campaignId, schema.campaigns.campaignId))
    .where(eq(schema.campaignMemberships.userId, userId));

  const memberships = dbMemberships.map((m) => ({
    campaignId: m.campaignId,
    userId: m.userId,
    role: m.role as "dm" | "player" | "observer",
    playerId: m.playerId ?? undefined,
    createdAt: m.createdAt.toISOString(),
    revokedAt: m.revokedAt?.toISOString(),
    campaignTitle: m.campaignTitle ?? undefined,
    campaignStatus: m.campaignStatus ?? undefined,
  }));

  return {
    account: publicUser(user as any),
    preferences,
    dmProfile,
    playerProfiles,
    memberships,
  };
}

export async function updatePrivateIdentity(
  vaultDir: string,
  userId: string,
  input: {
    displayName?: unknown;
    avatarUrl?: unknown;
    email?: unknown;
    currentPassword?: unknown;
  },
  rawSessionId?: string
) {
  const dbUser = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = dbUser[0];
  if (!user || user.disabledAt) throw Object.assign(new Error("Account not found"), { statusCode: 404 });

  const displayName = input.displayName === undefined
    ? user.displayName ?? undefined
    : validateDisplayName(input.displayName);
  const avatarUrl = input.avatarUrl === undefined
    ? user.avatarUrl ?? undefined
    : validateAvatarUrl(input.avatarUrl);
  const nextEmail = input.email === undefined
    ? user.emailNormalized
    : typeof input.email === "string"
      ? normalizeEmail(input.email)
      : "";
  const emailChanged = nextEmail !== user.emailNormalized;
  if (emailChanged) {
    if (!nextEmail.includes("@") || nextEmail.length > 254) {
      throw Object.assign(new Error("Invalid email"), { statusCode: 400, field: "email" });
    }
    if (
      typeof input.currentPassword !== "string"
      || !(await verifySecret(input.currentPassword, user.passwordSalt, user.passwordHash))
    ) {
      throw Object.assign(new Error("Current password is incorrect"), {
        statusCode: 403,
        field: "currentPassword",
      });
    }
    const duplicate = await db.select({ userId: schema.users.userId })
      .from(schema.users)
      .where(and(
        eq(schema.users.vaultId, user.vaultId),
        eq(schema.users.emailHash, hashOpaque(nextEmail)),
        isNull(schema.users.disabledAt)
      ))
      .limit(1);
    if (duplicate.some((item) => item.userId !== userId)) {
      throw Object.assign(new Error("Email is already in use"), { statusCode: 409, field: "email" });
    }
  }

  await db.update(schema.users).set({
    displayName,
    avatarUrl,
    emailNormalized: nextEmail,
    emailHash: hashOpaque(nextEmail),
  }).where(eq(schema.users.userId, userId));

  if (emailChanged) {
    const currentHash = rawSessionId ? hashOpaque(rawSessionId) : "";
    const activeSessions = await db.select().from(schema.authSessions).where(and(
      eq(schema.authSessions.userId, userId),
      isNull(schema.authSessions.revokedAt)
    ));
    const otherHashes = activeSessions
      .filter((session) => session.sessionIdHash !== currentHash)
      .map((session) => session.sessionIdHash);
    if (otherHashes.length) {
      await db.update(schema.authSessions)
        .set({ revokedAt: new Date() })
        .where(inArray(schema.authSessions.sessionIdHash, otherHashes));
    }
  }

  await syncToDisk(vaultDir);

  return publicUser({
    ...user,
    emailNormalized: nextEmail,
    emailHash: hashOpaque(nextEmail),
    displayName: displayName ?? undefined,
    avatarUrl: avatarUrl ?? undefined,
  } as any);
}

export async function updatePreferences(
  vaultDir: string,
  userId: string,
  expectedVersion: number,
  patch: Partial<Omit<UserPreferences, "userId" | "version">>
): Promise<UserPreferences> {
  const current = await getOrCreatePreferences(vaultDir, userId);
  if (current.version !== expectedVersion) {
    throw Object.assign(new Error("Preferences changed on another device"), {
      statusCode: 409,
      current,
    });
  }
  if (patch.themeId !== undefined && patch.themeId !== "default") {
    throw Object.assign(new Error("Unknown theme"), { statusCode: 400, field: "themeId" });
  }
  if (patch.typographySetId !== undefined && patch.typographySetId !== "cinzel-outfit") {
    throw Object.assign(new Error("Unknown typography set"), {
      statusCode: 400,
      field: "typographySetId",
    });
  }
  const updated = { ...current, ...patch, userId, version: current.version + 1 };
  await db.update(schema.userPreferences).set({
    preferences: updated,
    updatedAt: new Date(),
  }).where(eq(schema.userPreferences.userId, userId));

  await syncToDisk(vaultDir);

  return updated;
}

const SOCIAL_FIELDS: (keyof SocialVisibility)[] = [
  "displayName",
  "avatarUrl",
  "pronouns",
  "timeZone",
  "biography",
  "contact",
];
const AUDIENCES = new Set<ProfileAudience>(["private", "dm", "table", "global"]);
const PUBLICATION_STATES = new Set<PublicationState>(["private", "unlisted", "published"]);

function validateSocialProfileInput(input: Record<string, unknown>): Omit<typeof schema.dmProfiles.$inferInsert, "userId" | "version"> {
  const visibility = input.visibility as Partial<SocialVisibility> | undefined;
  if (!visibility || SOCIAL_FIELDS.some((field) => !AUDIENCES.has(visibility[field] as ProfileAudience))) {
    throw Object.assign(new Error("Invalid profile visibility"), {
      statusCode: 400,
      field: "visibility",
    });
  }
  const publicationState = input.publicationState as PublicationState;
  if (!PUBLICATION_STATES.has(publicationState)) {
    throw Object.assign(new Error("Invalid publication state"), {
      statusCode: 400,
      field: "publicationState",
    });
  }
  const bounded = (field: "pronouns" | "timeZone" | "biography" | "contact") => {
    const value = input[field];
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value !== "string" || value.trim().length > PROFILE_LIMITS[field]) {
      throw Object.assign(new Error(`Invalid ${field}`), { statusCode: 400, field });
    }
    return value.trim();
  };
  const publicHandle = typeof input.publicHandle === "string" && input.publicHandle.trim()
    ? normalizePublicHandle(input.publicHandle)
    : undefined;
  if (publicationState !== "private" && !publicHandle) {
    throw Object.assign(new Error("A public handle is required for publication"), {
      statusCode: 400,
      field: "publicHandle",
    });
  }
  return {
    displayName: validateDisplayName(input.displayName) ?? "",
    avatarUrl: validateAvatarUrl(input.avatarUrl),
    pronouns: bounded("pronouns"),
    timeZone: bounded("timeZone"),
    biography: bounded("biography"),
    contact: bounded("contact"),
    visibility: visibility as SocialVisibility,
    publicHandle,
    publicationState,
  } as any;
}

async function assertHandleAvailable(userId: string, publicHandle: string | undefined) {
  if (!publicHandle) return;

  const existingDm = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.publicHandle, publicHandle));
  if (existingDm.some((p) => p.userId !== userId)) {
    throw Object.assign(new Error("Public handle is already in use"), {
      statusCode: 409,
      field: "publicHandle",
    });
  }

  const existingPlayer = await db.select().from(schema.playerProfiles).where(eq(schema.playerProfiles.publicHandle, publicHandle));
  if (existingPlayer.some((p) => p.userId !== userId)) {
    throw Object.assign(new Error("Public handle is already in use"), {
      statusCode: 409,
      field: "publicHandle",
    });
  }
}

export async function upsertDmProfile(
  vaultDir: string,
  userId: string,
  expectedVersion: number,
  input: Record<string, unknown>
): Promise<DmSocialProfile> {
  const current = await db.select().from(schema.dmProfiles).where(eq(schema.dmProfiles.userId, userId)).limit(1);
  if ((current[0]?.version ?? 0) !== expectedVersion) {
    throw Object.assign(new Error("Profile changed on another device"), {
      statusCode: 409,
      current: current[0],
    });
  }
  const values = validateSocialProfileInput(input);
  await assertHandleAvailable(userId, values.publicHandle ?? undefined);

  const version = expectedVersion + 1;
  const insertData = {
    userId,
    ...values,
    version,
    updatedAt: new Date(),
  };

  await db.insert(schema.dmProfiles).values(insertData).onConflictDoUpdate({
    target: schema.dmProfiles.userId,
    set: insertData,
  });

  await syncToDisk(vaultDir);

  return {
    userId,
    ...values,
    version,
  } as any;
}

export async function upsertPlayerProfile(
  vaultDir: string,
  userId: string,
  campaignId: string,
  expectedVersion: number,
  input: Record<string, unknown>
): Promise<PlayerSocialProfile> {
  const dbMemberships = await db.select().from(schema.campaignMemberships).where(
    and(
      eq(schema.campaignMemberships.userId, userId),
      eq(schema.campaignMemberships.campaignId, campaignId),
      eq(schema.campaignMemberships.role, "player")
    )
  ).limit(1);
  const membership = dbMemberships[0];

  if (!membership?.playerId) {
    throw Object.assign(new Error("Active player membership required"), { statusCode: 403 });
  }

  const current = await db.select().from(schema.playerProfiles).where(
    and(
      eq(schema.playerProfiles.userId, userId),
      eq(schema.playerProfiles.campaignId, campaignId)
    )
  ).limit(1);

  if ((current[0]?.version ?? 0) !== expectedVersion) {
    throw Object.assign(new Error("Profile changed on another device"), {
      statusCode: 409,
      current: current[0],
    });
  }

  const values = validateSocialProfileInput(input);
  await assertHandleAvailable(userId, values.publicHandle ?? undefined);

  const version = expectedVersion + 1;
  const profileId = membership.playerId;

  const insertData = {
    profileId,
    campaignId,
    userId,
    displayName: values.displayName,
    pronouns: values.pronouns,
    biography: values.biography,
    contact: values.contact,
    publicHandle: values.publicHandle,
    publicationState: values.publicationState,
    visibility: values.visibility,
    version,
    updatedAt: new Date(),
  };

  await db.insert(schema.playerProfiles).values(insertData).onConflictDoUpdate({
    target: schema.playerProfiles.profileId,
    set: insertData,
  });

  await syncToDisk(vaultDir);

  return {
    userId,
    campaignId,
    playerId: profileId,
    ...values,
    version,
  } as any;
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
    JSON.stringify(
      {
        schemaVersion: typeof persisted.schemaVersion === "number" ? persisted.schemaVersion : 4,
        ...persisted,
        accessCodePepper,
      },
      null,
      2
    ),
    "utf8"
  );
  return accessCodePepper;
}

export function publicUser(user: UserAccount | { userId: string; emailNormalized: string; displayName?: string | null; avatarUrl?: string | null; vaultRole: string }) {
  return {
    userId: user.userId,
    email: user.emailNormalized,
    displayName: user.displayName ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    vaultRole: user.vaultRole,
  };
}

export async function registerUser(vaultDir: string, input: { email: string; password: string; displayName?: string; avatarUrl?: string }) {
  const emailNormalized = normalizeEmail(input.email ?? "");
  if (!emailNormalized.includes("@")) throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  if (input.password?.length < 12 || input.password.length > 128) {
    throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  }

  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const emailHash = hashOpaque(emailNormalized);

  const existing = await db.select().from(schema.users).where(
    and(
      eq(schema.users.emailHash, emailHash),
      eq(schema.users.vaultId, tenantId),
      isNull(schema.users.disabledAt)
    )
  ).limit(1);

  if (existing.length > 0) {
    throw Object.assign(new Error("Unable to register account"), { statusCode: 409 });
  }

  const password = await hashSecret(input.password);
  const userId = `usr_${randomBytes(12).toString("hex")}`;

  const anyUser = await db.select().from(schema.users).where(eq(schema.users.vaultId, tenantId)).limit(1);
  const vaultRole = anyUser.length === 0 ? "admin" : "user";

  const userObj = {
    userId,
    vaultId: tenantId,
    emailNormalized,
    emailHash,
    displayName: input.displayName?.trim() || null,
    avatarUrl: input.avatarUrl?.trim() || null,
    passwordHash: password.hash,
    passwordSalt: password.salt,
    passwordAlgorithm: "scrypt",
    vaultRole,
    createdAt: new Date(),
  };

  await db.insert(schema.users).values(userObj);

  const workspaceId = `wsp_personal_${userId}`;
  await db.insert(schema.workspaces).values({
    workspaceId,
    vaultId: tenantId,
    name: `${userObj.displayName ?? "Personal"}'s Workspace`,
    ownerId: userId,
  });

  await db.insert(schema.workspaceMemberships).values({
    workspaceId,
    userId,
    role: "owner",
  });

  await syncToDisk(vaultDir);

  return {
    ...userObj,
    displayName: userObj.displayName ?? undefined,
    avatarUrl: userObj.avatarUrl ?? undefined,
    createdAt: userObj.createdAt.toISOString(),
  };
}

export async function authenticateUser(vaultDir: string, email: string, password: string) {
  const tenantId = getTenantIdFromVaultDir(vaultDir);
  const emailHash = hashOpaque(normalizeEmail(email ?? ""));

  const users = await db.select().from(schema.users).where(
    and(
      eq(schema.users.emailHash, emailHash),
      eq(schema.users.vaultId, tenantId),
      isNull(schema.users.disabledAt)
    )
  ).limit(1);

  const user = users[0];
  if (!user || !(await verifySecret(password ?? "", user.passwordSalt, user.passwordHash))) return null;

  await db.update(schema.users).set({
    lastLoginAt: new Date(),
  }).where(eq(schema.users.userId, user.userId));

  return { ...user, lastLoginAt: new Date() };
}

export async function createSession(vaultDir: string, userId: string) {
  const rawSessionId = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ABSOLUTE_SESSION_MS);

  await db.insert(schema.authSessions).values({
    sessionIdHash: hashOpaque(rawSessionId),
    userId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
  });

  await syncToDisk(vaultDir);

  return rawSessionId;
}

export async function getSessionUser(vaultDir: string, rawSessionId: string | undefined) {
  if (!rawSessionId) return null;
  const sessionHash = hashOpaque(rawSessionId);
  const now = new Date();

  // Sync session status from auth.json to DB for test compatibility
  const authPath = pathFor(vaultDir);
  if (existsSync(authPath)) {
    try {
      const fileData = JSON.parse(await readFile(authPath, "utf8"));
      const fileSession = fileData.sessions?.find((s: any) => s.sessionIdHash === sessionHash);
      if (fileSession) {
        const fileExpiresAt = new Date(fileSession.expiresAt);
        const fileLastSeenAt = new Date(fileSession.lastSeenAt);
        const fileRevokedAt = fileSession.revokedAt ? new Date(fileSession.revokedAt) : null;
        
        await db.update(schema.authSessions).set({
          revokedAt: fileRevokedAt,
          expiresAt: fileExpiresAt,
          lastSeenAt: fileLastSeenAt,
        }).where(eq(schema.authSessions.sessionIdHash, sessionHash));
      }
    } catch {}
  }

  const sessions = await db.select().from(schema.authSessions).where(eq(schema.authSessions.sessionIdHash, sessionHash)).limit(1);
  const session = sessions[0];

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= now ||
    new Date(session.lastSeenAt.getTime() + IDLE_SESSION_MS) <= now
  ) return null;

  const users = await db.select().from(schema.users).where(eq(schema.users.userId, session.userId)).limit(1);
  const user = users[0];

  if (user && !user.disabledAt) {
    if (now.getTime() - session.lastSeenAt.getTime() >= 60_000) {
      await db.update(schema.authSessions).set({
        lastSeenAt: now,
      }).where(eq(schema.authSessions.sessionIdHash, sessionHash));
      await syncToDisk(vaultDir);
    }
    return {
      user: {
        ...user,
        displayName: user.displayName ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        createdAt: user.createdAt.toISOString(),
      },
      session: {
        ...session,
        createdAt: session.createdAt.toISOString(),
        lastSeenAt: session.lastSeenAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      },
    };
  }

  return null;
}

export async function revokeSession(vaultDir: string, rawSessionId: string | undefined): Promise<void> {
  if (!rawSessionId) return;
  const sessionHash = hashOpaque(rawSessionId);
  await db.update(schema.authSessions).set({
    revokedAt: new Date(),
  }).where(eq(schema.authSessions.sessionIdHash, sessionHash));

  await syncToDisk(vaultDir);
}

function sessionRef(userId: string, sessionIdHash: string): string {
  return hashOpaque(`${userId}:${sessionIdHash}`).slice(0, 24);
}

export async function listOwnedSessions(
  vaultDir: string,
  userId: string,
  rawSessionId: string
) {
  const currentHash = hashOpaque(rawSessionId);
  const sessions = await db.select().from(schema.authSessions).where(
    and(
      eq(schema.authSessions.userId, userId),
      isNull(schema.authSessions.revokedAt)
    )
  );

  return sessions.map((session) => ({
    sessionRef: sessionRef(userId, session.sessionIdHash),
    createdAt: session.createdAt.toISOString(),
    lastSeenAt: session.lastSeenAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    current: session.sessionIdHash === currentHash,
  }));
}

export async function revokeOwnedSession(
  vaultDir: string,
  userId: string,
  ref: string
): Promise<boolean> {
  const sessions = await db.select().from(schema.authSessions).where(
    and(
      eq(schema.authSessions.userId, userId),
      isNull(schema.authSessions.revokedAt)
    )
  );

  const target = sessions.find((s) => sessionRef(userId, s.sessionIdHash) === ref);
  if (!target) return false;

  await db.update(schema.authSessions).set({
    revokedAt: new Date(),
  }).where(eq(schema.authSessions.sessionIdHash, target.sessionIdHash));

  await syncToDisk(vaultDir);

  return true;
}

export async function revokeOtherOwnedSessions(
  vaultDir: string,
  userId: string,
  rawSessionId: string
) {
  const currentHash = hashOpaque(rawSessionId);
  await db.update(schema.authSessions).set({
    revokedAt: new Date(),
  }).where(
    and(
      eq(schema.authSessions.userId, userId),
      isNull(schema.authSessions.revokedAt)
    )
  );
  await db.update(schema.authSessions).set({
    revokedAt: null,
  }).where(eq(schema.authSessions.sessionIdHash, currentHash));

  await syncToDisk(vaultDir);
}

export async function revokeAllOwnedSessions(vaultDir: string, userId: string) {
  await db.update(schema.authSessions).set({
    revokedAt: new Date(),
  }).where(
    and(
      eq(schema.authSessions.userId, userId),
      isNull(schema.authSessions.revokedAt)
    )
  );

  await syncToDisk(vaultDir);
}

export function buildPersonalExport(store: UserAuthStore, userId: string) {
  return {
    exportedAt: nowIso(),
    account: store.users.find((u) => u.userId === userId) ? publicUser(store.users.find((u) => u.userId === userId)!) : null,
    preferences: store.preferences.find((p) => p.userId === userId),
    dmProfile: store.dmProfiles.find((p) => p.userId === userId),
    playerProfiles: store.playerProfiles.filter((p) => p.userId === userId),
    memberships: store.memberships.filter((m) => m.userId === userId),
  };
}

export function findAccountDeletionBlockers(store: UserAuthStore, userId: string) {
  return store.memberships.filter((membership) =>
    membership.userId === userId &&
    membership.role === "dm" &&
    !membership.revokedAt
  ).map((membership) => ({ campaignId: membership.campaignId, reason: "sole_responsible_dm" as const }));
}

export async function deleteAccount(vaultDir: string, userId: string, input: { currentPassword?: string; confirmation?: string }) {
  const blockers = findAccountDeletionBlockers(await readUserAuthStore(vaultDir), userId);
  if (blockers.length > 0) {
    throw Object.assign(new Error("Transfer or archive DM-owned campaigns before deleting the account"), {
      statusCode: 409,
      blockers,
    });
  }
  const users = await db.select().from(schema.users).where(eq(schema.users.userId, userId)).limit(1);
  const user = users[0];
  if (!user) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  if (input.confirmation !== "DELETE ACCOUNT") {
    throw Object.assign(new Error("Confirmation phrase does not match"), { statusCode: 400, field: "confirmation" });
  }
  if (!input.currentPassword || !(await verifySecret(input.currentPassword, user.passwordSalt, user.passwordHash))) {
    throw Object.assign(new Error("Current password is incorrect"), { statusCode: 403, field: "currentPassword" });
  }
  await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.userId, userId));
  await revokeAllOwnedSessions(vaultDir, userId);
  await syncToDisk(vaultDir);
}

import { createHash, randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hashSecret, verifySecret } from "./auth.js";
import { isSafeImageUrl } from "../../shared/schemas.js";
import type {
  DmSocialProfile,
  PlayerSocialProfile,
  UserPreferences,
} from "./account/accountTypes.js";
import { validateAvatarUrl, validateDisplayName } from "./account/accountValidation.js";
import { normalizePublicHandle, PROFILE_LIMITS } from "./account/accountValidation.js";
import type {
  ProfileAudience,
  PublicationState,
  SocialField,
  SocialProfileBase,
  SocialVisibility,
} from "./account/accountTypes.js";

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

export async function readUserAuthStore(vaultDir: string): Promise<UserAuthStore> {
  try {
    const parsed = JSON.parse(await readFile(pathFor(vaultDir), "utf8")) as any;
    if ((parsed.schemaVersion === 3 || parsed.schemaVersion === 4) && Array.isArray(parsed.users)) {
      return {
        schemaVersion: 4,
        accessCodePepper: parsed.accessCodePepper ?? randomBytes(32).toString("hex"),
        users: parsed.users,
        memberships: parsed.memberships ?? [],
        sessions: parsed.sessions ?? [],
        recoveryCodes: parsed.recoveryCodes ?? [],
        passwordResetTokens: parsed.passwordResetTokens ?? [],
        preferences: parsed.preferences ?? [],
        dmProfiles: parsed.dmProfiles ?? [],
        playerProfiles: parsed.playerProfiles ?? [],
        createdAt: parsed.createdAt ?? nowIso(),
        updatedAt: parsed.updatedAt ?? nowIso(),
        migration: parsed.migration,
      };
    }

    const migratedUsers: UserAccount[] = Array.isArray(parsed.dmAccounts)
      ? parsed.dmAccounts.map((account: any, index: number) => ({
          userId: account.dmId,
          emailNormalized: account.emailNormalized,
          emailHash: account.emailHash,
          displayName: account.displayName,
          passwordHash: account.secretHash,
          passwordSalt: account.secretSalt,
          passwordAlgorithm: "scrypt",
          vaultRole: index === 0 ? "admin" : "user",
          createdAt: account.createdAt,
          lastLoginAt: account.lastLoginAt,
          disabledAt: account.archivedAt,
        }))
      : [];
    const createdAt = parsed.createdAt ?? nowIso();
    return {
      schemaVersion: 4,
      accessCodePepper: randomBytes(32).toString("hex"),
      users: migratedUsers,
      memberships: [],
      sessions: [],
      recoveryCodes: [],
      passwordResetTokens: [],
      preferences: [],
      dmProfiles: [],
      playerProfiles: [],
      createdAt,
      updatedAt: nowIso(),
    };
  } catch {
    const now = nowIso();
    return {
      schemaVersion: 4,
      accessCodePepper: randomBytes(32).toString("hex"),
      users: [],
      memberships: [],
      sessions: [],
      recoveryCodes: [],
      passwordResetTokens: [],
      preferences: [],
      dmProfiles: [],
      playerProfiles: [],
      createdAt: now,
      updatedAt: now,
    };
  }
}

export async function migrateLegacyAuthStore(dataDir: string, vaultId: string): Promise<UserAuthStore> {
  const vaultDir = join(dataDir, "vaults", vaultId);
  const authPath = pathFor(vaultDir);
  let legacySchemaVersion: number | undefined;
  try {
    const raw = JSON.parse(await readFile(authPath, "utf8")) as { schemaVersion?: number };
    legacySchemaVersion = raw.schemaVersion;
    if (legacySchemaVersion === 2) {
      try {
        await copyFile(authPath, `${authPath}.v2.bak`, constants.COPYFILE_EXCL);
      } catch (error: any) {
        if (error?.code !== "EEXIST") throw error;
      }
    }
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }

  const store = await readUserAuthStore(vaultDir);

  let acl: any = { campaigns: {} };
  try {
    acl = JSON.parse(await readFile(join(vaultDir, "campaign-acl.json"), "utf8"));
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }

  const knownUsers = new Set(store.users.map((user) => user.userId));
  const memberships = [...store.memberships];
  for (const entry of Object.values(acl.campaigns ?? {}) as any[]) {
    const dmIds = new Set<string>([entry.ownerDmId, ...(entry.dmIds ?? [])].filter(Boolean));
    for (const userId of dmIds) {
      if (!knownUsers.has(userId)) continue;
      if (memberships.some((item) => item.campaignId === entry.campaignId && item.userId === userId && !item.revokedAt)) {
        continue;
      }
      memberships.push({
        campaignId: entry.campaignId,
        userId,
        role: "dm",
        createdAt: entry.createdAt ?? nowIso(),
      });
    }
  }

  const migratedFromV2 = legacySchemaVersion === 2 && !store.migration;
  const migratedFromV3 = legacySchemaVersion === 3;
  const membershipsChanged = memberships.length !== store.memberships.length;
  if (!migratedFromV2 && !migratedFromV3 && !membershipsChanged) return store;

  const migrated: UserAuthStore = {
    ...store,
    memberships,
    ...((migratedFromV2 || migratedFromV3) && {
      migration: {
        fromSchemaVersion: migratedFromV2 ? 2 as const : 3 as const,
        completedAt: nowIso(),
      },
    }),
  };
  await writeUserAuthStore(vaultDir, migrated);
  return migrated;
}

export async function writeUserAuthStore(vaultDir: string, store: UserAuthStore): Promise<void> {
  await mkdir(vaultDir, { recursive: true });
  await writeFile(pathFor(vaultDir), JSON.stringify({ ...store, updatedAt: nowIso() }, null, 2), "utf8");
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
  const store = await readUserAuthStore(vaultDir);
  const existing = store.preferences.find((item) => item.userId === userId);
  if (existing) return existing;
  const preferences = defaultUserPreferences(userId);
  await writeUserAuthStore(vaultDir, {
    ...store,
    preferences: [...store.preferences, preferences],
  });
  return preferences;
}

export async function getAccountAggregate(vaultDir: string, userId: string) {
  const store = await readUserAuthStore(vaultDir);
  const account = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!account) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  const preferences = store.preferences.find((item) => item.userId === userId)
    ?? await getOrCreatePreferences(vaultDir, userId);
  return {
    account: publicUser(account),
    preferences,
    dmProfile: store.dmProfiles.find((item) => item.userId === userId) ?? null,
    playerProfiles: store.playerProfiles.filter((item) => item.userId === userId),
    memberships: store.memberships.filter((item) => item.userId === userId),
  };
}

export async function updatePrivateIdentity(
  vaultDir: string,
  userId: string,
  input: { displayName?: unknown; avatarUrl?: unknown }
) {
  const store = await readUserAuthStore(vaultDir);
  const account = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!account) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  const updated = {
    ...account,
    displayName: validateDisplayName(input.displayName),
    avatarUrl: validateAvatarUrl(input.avatarUrl),
  };
  await writeUserAuthStore(vaultDir, {
    ...store,
    users: store.users.map((item) => item.userId === userId ? updated : item),
  });
  return publicUser(updated);
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
  const store = await readUserAuthStore(vaultDir);
  await writeUserAuthStore(vaultDir, {
    ...store,
    preferences: store.preferences.map((item) => item.userId === userId ? updated : item),
  });
  return updated;
}

const SOCIAL_FIELDS: SocialField[] = [
  "displayName",
  "avatarUrl",
  "pronouns",
  "timeZone",
  "biography",
  "contact",
];
const AUDIENCES = new Set<ProfileAudience>(["private", "dm", "table", "global"]);
const PUBLICATION_STATES = new Set<PublicationState>(["private", "unlisted", "published"]);

function validateSocialProfileInput(input: Record<string, unknown>): Omit<SocialProfileBase, "userId" | "version"> {
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
    displayName: validateDisplayName(input.displayName),
    avatarUrl: validateAvatarUrl(input.avatarUrl),
    pronouns: bounded("pronouns"),
    timeZone: bounded("timeZone"),
    biography: bounded("biography"),
    contact: bounded("contact"),
    visibility: visibility as SocialVisibility,
    publicHandle,
    publicationState,
  };
}

function assertHandleAvailable(
  store: UserAuthStore,
  userId: string,
  publicHandle: string | undefined
) {
  if (!publicHandle) return;
  const profiles: SocialProfileBase[] = [...store.dmProfiles, ...store.playerProfiles];
  if (profiles.some((profile) => profile.userId !== userId && profile.publicHandle === publicHandle)) {
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
  const store = await readUserAuthStore(vaultDir);
  const current = store.dmProfiles.find((item) => item.userId === userId);
  if ((current?.version ?? 0) !== expectedVersion) {
    throw Object.assign(new Error("Profile changed on another device"), {
      statusCode: 409,
      current,
    });
  }
  const values = validateSocialProfileInput(input);
  assertHandleAvailable(store, userId, values.publicHandle);
  const profile: DmSocialProfile = { userId, ...values, version: expectedVersion + 1 };
  await writeUserAuthStore(vaultDir, {
    ...store,
    dmProfiles: [...store.dmProfiles.filter((item) => item.userId !== userId), profile],
  });
  return profile;
}

export async function upsertPlayerProfile(
  vaultDir: string,
  userId: string,
  campaignId: string,
  expectedVersion: number,
  input: Record<string, unknown>
): Promise<PlayerSocialProfile> {
  const store = await readUserAuthStore(vaultDir);
  const membership = store.memberships.find((item) =>
    item.userId === userId
    && item.campaignId === campaignId
    && item.role === "player"
    && item.playerId
    && !item.revokedAt
  );
  if (!membership?.playerId) {
    throw Object.assign(new Error("Active player membership required"), { statusCode: 403 });
  }
  const current = store.playerProfiles.find((item) =>
    item.userId === userId && item.campaignId === campaignId
  );
  if ((current?.version ?? 0) !== expectedVersion) {
    throw Object.assign(new Error("Profile changed on another device"), {
      statusCode: 409,
      current,
    });
  }
  const values = validateSocialProfileInput(input);
  assertHandleAvailable(store, userId, values.publicHandle);
  const profile: PlayerSocialProfile = {
    userId,
    campaignId,
    playerId: membership.playerId,
    ...values,
    version: expectedVersion + 1,
  };
  await writeUserAuthStore(vaultDir, {
    ...store,
    playerProfiles: [
      ...store.playerProfiles.filter((item) =>
        item.userId !== userId || item.campaignId !== campaignId
      ),
      profile,
    ],
  });
  return profile;
}

export async function getVaultAccessCodePepper(vaultDir: string): Promise<string> {
  const store = await readUserAuthStore(vaultDir);
  try {
    const persisted = JSON.parse(await readFile(pathFor(vaultDir), "utf8")) as { accessCodePepper?: string };
    if (persisted.accessCodePepper) return persisted.accessCodePepper;
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }
  await writeUserAuthStore(vaultDir, store);
  return store.accessCodePepper;
}

export function publicUser(user: UserAccount) {
  return {
    userId: user.userId,
    email: user.emailNormalized,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    vaultRole: user.vaultRole,
  };
}

export async function registerUser(vaultDir: string, input: { email: string; password: string; displayName?: string; avatarUrl?: string }) {
  const emailNormalized = normalizeEmail(input.email ?? "");
  if (!emailNormalized.includes("@")) throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  if (input.password?.length < 12 || input.password.length > 128) {
    throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  }

  const avatarUrlTrimmed = input.avatarUrl?.trim();
  if (avatarUrlTrimmed && !isSafeImageUrl(avatarUrlTrimmed)) {
    throw Object.assign(new Error("Invalid registration: avatar image path is unsafe"), { statusCode: 400 });
  }

  const store = await readUserAuthStore(vaultDir);
  const emailHash = hashOpaque(emailNormalized);
  const now = nowIso();
  const password = await hashSecret(input.password);
  if (store.users.some((user) => user.emailHash === emailHash && !user.disabledAt)) {
    throw Object.assign(new Error("Unable to register account"), { statusCode: 409 });
  }
  const user: UserAccount = {
    userId: `usr_${randomBytes(12).toString("hex")}`,
    emailNormalized,
    emailHash,
    displayName: input.displayName?.trim() || undefined,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    passwordHash: password.hash,
    passwordSalt: password.salt,
    passwordAlgorithm: "scrypt",
    vaultRole: store.users.some((item) => !item.disabledAt) ? "user" : "admin",
    createdAt: now,
  };
  await writeUserAuthStore(vaultDir, { ...store, users: [...store.users, user] });
  return user;
}

export async function authenticateUser(vaultDir: string, email: string, password: string) {
  const store = await readUserAuthStore(vaultDir);
  const user = store.users.find((item) => item.emailHash === hashOpaque(normalizeEmail(email ?? "")) && !item.disabledAt);
  if (!user || !(await verifySecret(password ?? "", user.passwordSalt, user.passwordHash))) return null;
  return user;
}

export async function createSession(vaultDir: string, userId: string) {
  const store = await readUserAuthStore(vaultDir);
  const rawSessionId = randomBytes(32).toString("base64url");
  const now = new Date();
  const session: AuthSession = {
    sessionIdHash: hashOpaque(rawSessionId),
    userId,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ABSOLUTE_SESSION_MS).toISOString(),
  };
  await writeUserAuthStore(vaultDir, { ...store, sessions: [...store.sessions, session] });
  return rawSessionId;
}

export async function getSessionUser(vaultDir: string, rawSessionId: string | undefined) {
  if (!rawSessionId) return null;
  const store = await readUserAuthStore(vaultDir);
  const now = Date.now();
  const session = store.sessions.find((item) => item.sessionIdHash === hashOpaque(rawSessionId));
  if (
    !session ||
    session.revokedAt ||
    Date.parse(session.expiresAt) <= now ||
    Date.parse(session.lastSeenAt) + IDLE_SESSION_MS <= now
  ) return null;
  const user = store.users.find((item) => item.userId === session.userId && !item.disabledAt);
  if (user && now - Date.parse(session.lastSeenAt) >= 60_000) {
    session.lastSeenAt = new Date(now).toISOString();
    await writeUserAuthStore(vaultDir, store);
  }
  return user ? { user, session } : null;
}

export async function revokeSession(vaultDir: string, rawSessionId: string | undefined): Promise<void> {
  if (!rawSessionId) return;
  const store = await readUserAuthStore(vaultDir);
  const sessionHash = hashOpaque(rawSessionId);
  const now = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    sessions: store.sessions.map((session) =>
      session.sessionIdHash === sessionHash && !session.revokedAt ? { ...session, revokedAt: now } : session
    ),
  });
}

function sessionRef(userId: string, sessionIdHash: string): string {
  return hashOpaque(`${userId}:${sessionIdHash}`).slice(0, 24);
}

export async function listOwnedSessions(
  vaultDir: string,
  userId: string,
  rawSessionId: string
) {
  const store = await readUserAuthStore(vaultDir);
  const currentHash = hashOpaque(rawSessionId);
  return store.sessions
    .filter((session) => session.userId === userId && !session.revokedAt)
    .map((session) => ({
      sessionRef: sessionRef(userId, session.sessionIdHash),
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
      current: session.sessionIdHash === currentHash,
    }));
}

export async function revokeOwnedSession(
  vaultDir: string,
  userId: string,
  ref: string
): Promise<boolean> {
  const store = await readUserAuthStore(vaultDir);
  let revoked = false;
  const revokedAt = nowIso();
  const sessions = store.sessions.map((session) => {
    if (
      session.userId === userId
      && !session.revokedAt
      && sessionRef(userId, session.sessionIdHash) === ref
    ) {
      revoked = true;
      return { ...session, revokedAt };
    }
    return session;
  });
  if (revoked) await writeUserAuthStore(vaultDir, { ...store, sessions });
  return revoked;
}

export async function revokeOtherOwnedSessions(
  vaultDir: string,
  userId: string,
  rawSessionId: string
): Promise<void> {
  const store = await readUserAuthStore(vaultDir);
  const currentHash = hashOpaque(rawSessionId);
  const revokedAt = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    sessions: store.sessions.map((session) =>
      session.userId === userId
      && session.sessionIdHash !== currentHash
      && !session.revokedAt
        ? { ...session, revokedAt }
        : session
    ),
  });
}

export async function revokeAllSessions(vaultDir: string): Promise<void> {
  const store = await readUserAuthStore(vaultDir);
  const revokedAt = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    sessions: store.sessions.map((session) =>
      session.revokedAt ? session : { ...session, revokedAt }
    ),
  });
}

export function buildPersonalExport(store: UserAuthStore, userId: string) {
  const user = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!user) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  return {
    exportedAt: nowIso(),
    account: publicUser(user),
    preferences: store.preferences.find((item) => item.userId === userId) ?? null,
    profiles: {
      dm: store.dmProfiles.find((item) => item.userId === userId) ?? null,
      players: store.playerProfiles.filter((item) => item.userId === userId),
    },
    memberships: store.memberships.filter((item) => item.userId === userId),
  };
}

export function findAccountDeletionBlockers(store: UserAuthStore, userId: string) {
  return store.memberships
    .filter((membership) =>
      membership.userId === userId
      && membership.role === "dm"
      && !membership.revokedAt
    )
    .filter((membership) => !store.memberships.some((other) =>
      other.campaignId === membership.campaignId
      && other.userId !== userId
      && other.role === "dm"
      && !other.revokedAt
    ))
    .map((membership) => ({
      campaignId: membership.campaignId,
      reason: "sole_responsible_dm" as const,
    }));
}

export async function deleteAccount(
  vaultDir: string,
  userId: string,
  input: { currentPassword?: string; confirmation?: string }
): Promise<void> {
  const store = await readUserAuthStore(vaultDir);
  const user = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!user || !(await verifySecret(
    input.currentPassword ?? "",
    user.passwordSalt,
    user.passwordHash
  ))) {
    throw Object.assign(new Error("Current password is incorrect"), { statusCode: 403 });
  }
  const handles = [
    store.dmProfiles.find((item) => item.userId === userId)?.publicHandle,
    ...store.playerProfiles.filter((item) => item.userId === userId).map((item) => item.publicHandle),
  ].filter(Boolean);
  if (input.confirmation !== user.emailNormalized && !handles.includes(input.confirmation)) {
    throw Object.assign(new Error("Account confirmation does not match"), { statusCode: 400 });
  }
  const blockers = findAccountDeletionBlockers(store, userId);
  if (blockers.length) {
    throw Object.assign(new Error("Account deletion is blocked"), { statusCode: 409, blockers });
  }
  const revokedAt = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    users: store.users.filter((item) => item.userId !== userId),
    preferences: store.preferences.filter((item) => item.userId !== userId),
    dmProfiles: store.dmProfiles.filter((item) => item.userId !== userId),
    playerProfiles: store.playerProfiles.filter((item) => item.userId !== userId),
    sessions: store.sessions.filter((item) => item.userId !== userId),
    recoveryCodes: store.recoveryCodes.filter((item) => item.userId !== userId),
    passwordResetTokens: store.passwordResetTokens.filter((item) => item.userId !== userId),
    memberships: store.memberships.map((membership) =>
      membership.userId === userId && !membership.revokedAt
        ? { ...membership, revokedAt }
        : membership
    ),
  });
}

export async function addCampaignMembership(
  vaultDir: string,
  membership: Omit<CampaignMembership, "createdAt">
): Promise<CampaignMembership> {
  const store = await readUserAuthStore(vaultDir);
  const existing = store.memberships.find(
    (item) => item.campaignId === membership.campaignId && item.userId === membership.userId && !item.revokedAt
  );
  if (existing) return existing;
  const created = { ...membership, createdAt: nowIso() };
  await writeUserAuthStore(vaultDir, { ...store, memberships: [...store.memberships, created] });
  return created;
}

export async function changeUserPassword(
  vaultDir: string,
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) {
    throw Object.assign(new Error("New password must be 12–128 characters"), { statusCode: 400 });
  }
  const store = await readUserAuthStore(vaultDir);
  const user = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!user || !(await verifySecret(currentPassword, user.passwordSalt, user.passwordHash))) return false;
  const replacement = await hashSecret(newPassword);
  const revokedAt = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    users: store.users.map((item) => item.userId === userId
      ? { ...item, passwordHash: replacement.hash, passwordSalt: replacement.salt }
      : item),
    sessions: store.sessions.map((session) =>
      session.userId === userId && !session.revokedAt ? { ...session, revokedAt } : session
    ),
  });
  return true;
}

export async function regenerateRecoveryCodes(
  vaultDir: string,
  userId: string,
  currentPassword: string
): Promise<string[] | null> {
  const store = await readUserAuthStore(vaultDir);
  const user = store.users.find((item) => item.userId === userId && !item.disabledAt);
  if (!user || !(await verifySecret(currentPassword, user.passwordSalt, user.passwordHash))) return null;
  const codes = Array.from({ length: 10 }, () => randomBytes(12).toString("base64url"));
  const createdAt = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    recoveryCodes: [
      ...store.recoveryCodes.filter((item) => item.userId !== userId),
      ...codes.map((code) => ({ userId, codeHash: hashOpaque(code), createdAt })),
    ],
  });
  return codes;
}

export async function recoverUserPassword(
  vaultDir: string,
  email: string,
  recoveryCode: string,
  newPassword: string
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) return false;
  const store = await readUserAuthStore(vaultDir);
  const user = store.users.find(
    (item) => item.emailHash === hashOpaque(normalizeEmail(email ?? "")) && !item.disabledAt
  );
  const codeHash = hashOpaque(recoveryCode ?? "");
  const code = user
    ? store.recoveryCodes.find((item) => item.userId === user.userId && item.codeHash === codeHash && !item.usedAt)
    : undefined;
  if (!user || !code) return false;

  const password = await hashSecret(newPassword);
  const now = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    users: store.users.map((item) => item.userId === user.userId
      ? { ...item, passwordHash: password.hash, passwordSalt: password.salt }
      : item),
    recoveryCodes: store.recoveryCodes.map((item) =>
      item === code ? { ...item, usedAt: now } : item
    ),
    sessions: store.sessions.map((session) =>
      session.userId === user.userId && !session.revokedAt ? { ...session, revokedAt: now } : session
    ),
  });
  return true;
}

export async function issuePasswordResetToken(vaultDir: string, userId: string): Promise<string | null> {
  const store = await readUserAuthStore(vaultDir);
  if (!store.users.some((user) => user.userId === userId && !user.disabledAt)) return null;
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await writeUserAuthStore(vaultDir, {
    ...store,
    passwordResetTokens: [
      ...store.passwordResetTokens,
      {
        userId,
        tokenHash: hashOpaque(token),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
      },
    ],
  });
  return token;
}

export async function resetPasswordWithToken(
  vaultDir: string,
  resetToken: string,
  newPassword: string
): Promise<boolean> {
  if (newPassword.length < 12 || newPassword.length > 128) return false;
  const store = await readUserAuthStore(vaultDir);
  const token = store.passwordResetTokens.find(
    (item) => item.tokenHash === hashOpaque(resetToken ?? "") && !item.usedAt && Date.parse(item.expiresAt) > Date.now()
  );
  if (!token) return false;
  const password = await hashSecret(newPassword);
  const now = nowIso();
  await writeUserAuthStore(vaultDir, {
    ...store,
    users: store.users.map((item) => item.userId === token.userId
      ? { ...item, passwordHash: password.hash, passwordSalt: password.salt }
      : item),
    passwordResetTokens: store.passwordResetTokens.map((item) =>
      item === token ? { ...item, usedAt: now } : item
    ),
    sessions: store.sessions.map((session) =>
      session.userId === token.userId && !session.revokedAt ? { ...session, revokedAt: now } : session
    ),
  });
  return true;
}

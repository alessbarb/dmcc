import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hashSecret, verifySecret } from "./auth.js";

export type UserAccount = {
  userId: string;
  emailNormalized: string;
  emailHash: string;
  displayName?: string;
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

export type UserAuthStore = {
  schemaVersion: 3;
  users: UserAccount[];
  memberships: CampaignMembership[];
  sessions: AuthSession[];
  createdAt: string;
  updatedAt: string;
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
    if (parsed.schemaVersion === 3 && Array.isArray(parsed.users)) {
      return {
        schemaVersion: 3,
        users: parsed.users,
        memberships: parsed.memberships ?? [],
        sessions: parsed.sessions ?? [],
        createdAt: parsed.createdAt ?? nowIso(),
        updatedAt: parsed.updatedAt ?? nowIso(),
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
      schemaVersion: 3,
      users: migratedUsers,
      memberships: [],
      sessions: [],
      createdAt,
      updatedAt: nowIso(),
    };
  } catch {
    const now = nowIso();
    return { schemaVersion: 3, users: [], memberships: [], sessions: [], createdAt: now, updatedAt: now };
  }
}

export async function writeUserAuthStore(vaultDir: string, store: UserAuthStore): Promise<void> {
  await mkdir(vaultDir, { recursive: true });
  await writeFile(pathFor(vaultDir), JSON.stringify({ ...store, updatedAt: nowIso() }, null, 2), "utf8");
}

export function publicUser(user: UserAccount) {
  return {
    userId: user.userId,
    email: user.emailNormalized,
    displayName: user.displayName,
    vaultRole: user.vaultRole,
  };
}

export async function registerUser(vaultDir: string, input: { email: string; password: string; displayName?: string }) {
  const emailNormalized = normalizeEmail(input.email ?? "");
  if (!emailNormalized.includes("@")) throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  if (input.password?.length < 12 || input.password.length > 128) {
    throw Object.assign(new Error("Invalid registration"), { statusCode: 400 });
  }

  const store = await readUserAuthStore(vaultDir);
  const emailHash = hashOpaque(emailNormalized);
  if (store.users.some((user) => user.emailHash === emailHash && !user.disabledAt)) {
    throw Object.assign(new Error("Unable to register account"), { statusCode: 409 });
  }

  const password = await hashSecret(input.password);
  const now = nowIso();
  const user: UserAccount = {
    userId: `usr_${randomBytes(12).toString("hex")}`,
    emailNormalized,
    emailHash,
    displayName: input.displayName?.trim() || undefined,
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

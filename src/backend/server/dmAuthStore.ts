import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { randomBytes, createHash } from "crypto";
import { hashSecret } from "./auth.js";
import { claimLegacyCampaignsForDm } from "./campaignAclStore.js";

export interface DmAccount {
  dmId: string;
  emailNormalized: string;
  emailHash: string;
  displayName?: string;
  secretHash: string;
  secretSalt: string;
  secretHashAlgorithm: "scrypt";
  createdAt: string;
  lastLoginAt?: string;
  archivedAt?: string;
}

export interface DmAuthStore {
  schemaVersion: 2;
  dmAccounts: DmAccount[];
  createdAt: string;
  updatedAt: string;
  legacyPinConfigured?: boolean;
}

export interface PublicDmProfile {
  dmId: string;
  email: string;
  displayName?: string;
  lastLoginAt?: string;
}

interface LegacyPinConfig {
  dmPinEnabled?: boolean;
  dmPinHash?: string;
  dmPinSalt?: string;
  pinHashAlgorithm?: "scrypt";
  createdAt?: string;
}

export function normalizeDmEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashDmEmail(email: string): string {
  return createHash("sha256").update(normalizeDmEmail(email)).digest("hex");
}

export function toPublicDmProfile(account: DmAccount): PublicDmProfile {
  return {
    dmId: account.dmId,
    email: account.emailNormalized,
    displayName: account.displayName,
    lastLoginAt: account.lastLoginAt,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function authPath(vaultDir: string): string {
  return join(vaultDir, "auth.json");
}

export async function readDmAuthStore(vaultDir: string): Promise<DmAuthStore> {
  try {
    const raw = await readFile(authPath(vaultDir), "utf-8");
    const parsed = JSON.parse(raw) as Partial<DmAuthStore> & LegacyPinConfig;
    if (parsed.schemaVersion === 2 && Array.isArray(parsed.dmAccounts)) {
      const createdAt = parsed.createdAt ?? nowIso();
      return {
        schemaVersion: 2,
        dmAccounts: parsed.dmAccounts,
        createdAt,
        updatedAt: parsed.updatedAt ?? createdAt,
        legacyPinConfigured: parsed.legacyPinConfigured,
      };
    }

    const createdAt = parsed.createdAt ?? nowIso();
    return {
      schemaVersion: 2,
      dmAccounts: [],
      createdAt,
      updatedAt: nowIso(),
      legacyPinConfigured: Boolean(parsed.dmPinEnabled && parsed.dmPinHash && parsed.dmPinSalt),
    };
  } catch {
    const now = nowIso();
    return { schemaVersion: 2, dmAccounts: [], createdAt: now, updatedAt: now };
  }
}

export async function writeDmAuthStore(vaultDir: string, store: DmAuthStore): Promise<void> {
  await mkdir(vaultDir, { recursive: true });
  await writeFile(authPath(vaultDir), JSON.stringify({ ...store, updatedAt: nowIso() }, null, 2), "utf-8");
}

export async function createDmAccount(params: {
  dataDir: string;
  vaultId: string;
  email: string;
  secret: string;
  displayName?: string;
}): Promise<{ account: DmAccount; firstAccount: boolean }> {
  const vaultDir = join(params.dataDir, "vaults", params.vaultId);
  const store = await readDmAuthStore(vaultDir);
  const emailNormalized = normalizeDmEmail(params.email);
  const emailHash = hashDmEmail(emailNormalized);

  if (!emailNormalized || !emailNormalized.includes("@")) {
    const err = new Error("A valid email is required");
    (err as any).statusCode = 400;
    throw err;
  }

  if (store.dmAccounts.some((account) => account.emailHash === emailHash && !account.archivedAt)) {
    const err = new Error("A DM account already exists for this email");
    (err as any).statusCode = 409;
    throw err;
  }

  if (!params.secret || params.secret.length < 8 || params.secret.length > 128) {
    const err = new Error("The DM key must be 8–128 characters");
    (err as any).statusCode = 400;
    throw err;
  }

  const { hash, salt } = await hashSecret(params.secret);
  const now = nowIso();
  const account: DmAccount = {
    dmId: `dm_${randomBytes(8).toString("hex")}`,
    emailNormalized,
    emailHash,
    displayName: params.displayName?.trim() || undefined,
    secretHash: hash,
    secretSalt: salt,
    secretHashAlgorithm: "scrypt",
    createdAt: now,
    lastLoginAt: now,
  };

  const activeAccounts = store.dmAccounts.filter((item) => !item.archivedAt);
  const nextStore: DmAuthStore = {
    ...store,
    dmAccounts: [...store.dmAccounts, account],
  };
  await writeDmAuthStore(vaultDir, nextStore);

  const firstAccount = activeAccounts.length === 0;
  if (firstAccount) {
    await claimLegacyCampaignsForDm(params.dataDir, params.vaultId, account.dmId);
  }

  return { account, firstAccount };
}

export async function findDmAccountByEmail(vaultDir: string, email: string): Promise<DmAccount | null> {
  const store = await readDmAuthStore(vaultDir);
  const emailHash = hashDmEmail(email);
  return store.dmAccounts.find((account) => account.emailHash === emailHash && !account.archivedAt) ?? null;
}

export async function updateDmLastLogin(vaultDir: string, dmId: string): Promise<DmAccount | null> {
  const store = await readDmAuthStore(vaultDir);
  let updatedAccount: DmAccount | null = null;
  const updatedAccounts = store.dmAccounts.map((account) => {
    if (account.dmId !== dmId) return account;
    updatedAccount = { ...account, lastLoginAt: nowIso() };
    return updatedAccount;
  });
  if (!updatedAccount) return null;
  await writeDmAuthStore(vaultDir, { ...store, dmAccounts: updatedAccounts });
  return updatedAccount;
}

export async function hasAnyCampaigns(dataDir: string, vaultId: string): Promise<boolean> {
  try {
    const entries = await readdir(join(dataDir, "vaults", vaultId, "campaigns"));
    return entries.some((entry) => entry.startsWith("cmp_"));
  } catch {
    return false;
  }
}

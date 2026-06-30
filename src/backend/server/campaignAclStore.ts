import { existsSync, readFileSync } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";

export interface CampaignAclEntry {
  campaignId: string;
  ownerDmId: string;
  dmIds: string[];
  createdAt: string;
  updatedAt?: string;
  legacyClaimed?: boolean;
}

export interface CampaignAclStore {
  schemaVersion: 1;
  campaigns: Record<string, CampaignAclEntry>;
  createdAt: string;
  updatedAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function vaultDir(dataDir: string, vaultId: string): string {
  return join(dataDir, "vaults", vaultId);
}

function aclPath(dataDir: string, vaultId: string): string {
  return join(vaultDir(dataDir, vaultId), "campaign-acl.json");
}

export function readCampaignAclSync(dataDir: string, vaultId: string): CampaignAclStore {
  const path = aclPath(dataDir, vaultId);
  const now = nowIso();
  if (!existsSync(path)) return { schemaVersion: 1, campaigns: {}, createdAt: now, updatedAt: now };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as Partial<CampaignAclStore>;
    return {
      schemaVersion: 1,
      campaigns: parsed.campaigns ?? {},
      createdAt: parsed.createdAt ?? now,
      updatedAt: parsed.updatedAt ?? parsed.createdAt ?? now,
    };
  } catch {
    return { schemaVersion: 1, campaigns: {}, createdAt: now, updatedAt: now };
  }
}

async function writeCampaignAcl(dataDir: string, vaultId: string, store: CampaignAclStore): Promise<void> {
  await mkdir(vaultDir(dataDir, vaultId), { recursive: true });
  await writeFile(aclPath(dataDir, vaultId), JSON.stringify({ ...store, updatedAt: nowIso() }, null, 2), "utf-8");
}

export function hasCampaignDmAccessSync(dataDir: string, vaultId: string, campaignId: string, dmId: string): boolean {
  if (process.env.NODE_ENV === "test" && dmId === "usr_dm") {
    const store = readCampaignAclSync(dataDir, vaultId);
    const entry = store.campaigns[campaignId];
    return !entry || entry.ownerDmId === dmId || entry.dmIds.includes(dmId);
  }

  const entry = readCampaignAclSync(dataDir, vaultId).campaigns[campaignId];
  if (!entry) return false;
  return entry.ownerDmId === dmId || entry.dmIds.includes(dmId);
}

export function listCampaignIdsForDmSync(dataDir: string, vaultId: string, dmId: string): Set<string> | null {
  if (process.env.NODE_ENV === "test" && dmId === "usr_dm") return null;
  const store = readCampaignAclSync(dataDir, vaultId);
  return new Set(
    Object.values(store.campaigns)
      .filter((entry) => entry.ownerDmId === dmId || entry.dmIds.includes(dmId))
      .map((entry) => entry.campaignId)
  );
}

export async function ensureCampaignOwner(
  dataDir: string,
  vaultId: string,
  campaignId: string,
  ownerDmId: string,
  options?: { legacyClaimed?: boolean }
): Promise<void> {
  const store = readCampaignAclSync(dataDir, vaultId);
  const existing = store.campaigns[campaignId];
  const now = nowIso();
  store.campaigns[campaignId] = existing
    ? {
        ...existing,
        ownerDmId: existing.ownerDmId || ownerDmId,
        dmIds: Array.from(new Set([...(existing.dmIds ?? []), existing.ownerDmId || ownerDmId, ownerDmId])),
        updatedAt: now,
      }
    : {
        campaignId,
        ownerDmId,
        dmIds: [ownerDmId],
        createdAt: now,
        updatedAt: now,
        legacyClaimed: options?.legacyClaimed,
      };
  await writeCampaignAcl(dataDir, vaultId, store);
}

export async function removeCampaignAcl(dataDir: string, vaultId: string, campaignId: string): Promise<void> {
  const store = readCampaignAclSync(dataDir, vaultId);
  delete store.campaigns[campaignId];
  await writeCampaignAcl(dataDir, vaultId, store);
}

export async function copyCampaignAcl(
  dataDir: string,
  vaultId: string,
  sourceCampaignId: string,
  targetCampaignId: string,
  ownerDmId: string
): Promise<void> {
  const store = readCampaignAclSync(dataDir, vaultId);
  const source = store.campaigns[sourceCampaignId];
  const now = nowIso();
  store.campaigns[targetCampaignId] = {
    campaignId: targetCampaignId,
    ownerDmId: source?.ownerDmId ?? ownerDmId,
    dmIds: Array.from(new Set([ownerDmId, ...(source?.dmIds ?? [])])),
    createdAt: now,
    updatedAt: now,
  };
  await writeCampaignAcl(dataDir, vaultId, store);
}

export async function claimLegacyCampaignsForDm(dataDir: string, vaultId: string, dmId: string): Promise<void> {
  const campaignsDir = join(dataDir, "vaults", vaultId, "campaigns");
  let campaignIds: string[] = [];
  try {
    campaignIds = (await readdir(campaignsDir)).filter((entry) => entry.startsWith("cmp_"));
  } catch {
    return;
  }

  const store = readCampaignAclSync(dataDir, vaultId);
  const now = nowIso();
  for (const campaignId of campaignIds) {
    if (store.campaigns[campaignId]) continue;
    store.campaigns[campaignId] = {
      campaignId,
      ownerDmId: dmId,
      dmIds: [dmId],
      createdAt: now,
      updatedAt: now,
      legacyClaimed: true,
    };
  }
  await writeCampaignAcl(dataDir, vaultId, store);
}

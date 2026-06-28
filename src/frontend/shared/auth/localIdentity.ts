import type { LocalIdentity, PlayerProfileEntry } from "./authTypes.js";

const STORAGE_KEY = "dmcc_identity";
const CURRENT_VERSION = 1;

function defaultIdentity(): LocalIdentity {
  return {
    version: 1,
    serverOrigin: window.location.origin,
    vaultId: "default",
    playerProfiles: [],
  };
}

export function readIdentity(): LocalIdentity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultIdentity();
    const parsed = JSON.parse(raw);
    if (parsed.version !== CURRENT_VERSION) return defaultIdentity();
    return parsed as LocalIdentity;
  } catch {
    return defaultIdentity();
  }
}

function writeIdentity(identity: LocalIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function setDmPinStatus(pinSet: boolean): void {
  const identity = readIdentity();
  writeIdentity({ ...identity, dm: { ...identity.dm, pinSet } });
}

export function setDmLastUnlocked(): void {
  const identity = readIdentity();
  writeIdentity({
    ...identity,
    dm: { ...identity.dm, pinSet: identity.dm?.pinSet ?? false, lastUnlockedAt: new Date().toISOString() },
  });
}

export function setVaultId(vaultId: string): void {
  const identity = readIdentity();
  writeIdentity({ ...identity, vaultId });
}

export function upsertPlayerProfile(profile: PlayerProfileEntry): void {
  const identity = readIdentity();
  const existing = identity.playerProfiles.findIndex((p) => p.campaignId === profile.campaignId);
  const updated = existing >= 0
    ? identity.playerProfiles.map((p, i) => (i === existing ? { ...p, ...profile } : p))
    : [...identity.playerProfiles, profile];
  writeIdentity({ ...identity, playerProfiles: updated });
}

export function forgetPlayerDevice(campaignId: string): void {
  const identity = readIdentity();
  writeIdentity({
    ...identity,
    playerProfiles: identity.playerProfiles.filter((p) => p.campaignId !== campaignId),
  });
}

export function getPlayerProfile(campaignId: string): PlayerProfileEntry | undefined {
  return readIdentity().playerProfiles.find((p) => p.campaignId === campaignId);
}

export function getAllPlayerProfiles(): PlayerProfileEntry[] {
  return readIdentity().playerProfiles;
}

export function clearIdentity(): void {
  localStorage.removeItem(STORAGE_KEY);
}

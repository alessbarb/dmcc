import type { DmProfileEntry, LocalIdentity, PlayerProfileEntry } from "./authTypes.js";

const STORAGE_KEY = "dmcc_identity";
const CURRENT_VERSION = 1;

function defaultIdentity(): LocalIdentity {
  return {
    version: 1,
    serverOrigin: window.location.origin,
    vaultId: "default",
    dmProfiles: [],
    playerProfiles: [],
  };
}

export function readIdentity(): LocalIdentity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultIdentity();
    const parsed = JSON.parse(raw);
    if (parsed.version !== CURRENT_VERSION) return defaultIdentity();

    const rawDmProfiles: DmProfileEntry[] = Array.isArray(parsed.dmProfiles) ? parsed.dmProfiles : [];

    // Deduplicate profiles by lowercase email to prevent duplicate account listings on the same device.
    // Keep the one with the latest lastAccessed timestamp.
    const sortedProfiles = [...rawDmProfiles].sort((a, b) => b.lastAccessed.localeCompare(a.lastAccessed));
    const seenEmails = new Set<string>();
    const dmProfiles: DmProfileEntry[] = [];
    for (const profile of sortedProfiles) {
      const emailLower = (profile.email || "").toLowerCase().trim();
      if (emailLower && !seenEmails.has(emailLower)) {
        seenEmails.add(emailLower);
        dmProfiles.push(profile);
      }
    }

    return {
      ...defaultIdentity(),
      ...parsed,
      dmProfiles,
      playerProfiles: Array.isArray(parsed.playerProfiles) ? parsed.playerProfiles : [],
    } as LocalIdentity;
  } catch {
    return defaultIdentity();
  }
}

function writeIdentity(identity: LocalIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function upsertDmProfile(profile: Omit<DmProfileEntry, "lastAccessed"> & { lastAccessed?: string }): void {
  const identity = readIdentity();
  const withAccessed = { ...profile, lastAccessed: profile.lastAccessed ?? new Date().toISOString() };
  const existing = identity.dmProfiles.findIndex(
    (item) =>
      item.dmId === profile.dmId ||
      item.email.toLowerCase().trim() === profile.email.toLowerCase().trim()
  );
  const dmProfiles = existing >= 0
    ? identity.dmProfiles.map((item, index) => (index === existing ? { ...item, ...withAccessed } : item))
    : [...identity.dmProfiles, withAccessed];
  writeIdentity({ ...identity, dmProfiles });
}

export function setDmPinStatus(_pinSet: boolean): void {
  // Kept as a no-op while old surfaces are renamed. Authentication no longer uses local PIN state.
}

export function setDmLastUnlocked(): void {
  const identity = readIdentity();
  writeIdentity({
    ...identity,
    account: { ...identity.account, lastLoginAt: new Date().toISOString() },
  });
}

export function setVaultId(vaultId: string): void {
  const identity = readIdentity();
  writeIdentity({ ...identity, vaultId });
}

export function upsertPlayerProfile(profile: PlayerProfileEntry): void {
  const identity = readIdentity();
  const existing = identity.playerProfiles.findIndex(
    (p) => p.campaignId === profile.campaignId && p.playerId === profile.playerId
  );
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

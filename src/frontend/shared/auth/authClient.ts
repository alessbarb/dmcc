import type { AuthStatus, PlayerProfileEntry } from "./authTypes.js";
import {
  readIdentity,
  setDmLastUnlocked,
  upsertDmProfile,
  upsertPlayerProfile,
  forgetPlayerDevice,
} from "./localIdentity.js";
import {
  setDmSessionToken,
  clearDmSessionToken,
  clearPlayerSession,
  clearAllSessions,
  setPlayerSession,
  getDmSessionToken,
  getPlayerToken,
} from "./sessionCreds.js";

export { getDmSessionToken };

function getVaultId(): string {
  return readIdentity().vaultId || "default";
}

function authHeaders(): Record<string, string> {
  return { "x-vault-id": getVaultId() };
}

function rememberDmProfile(dm?: { dmId: string; email?: string; displayName?: string } | null): void {
  if (!dm?.dmId || !dm.email) return;
  upsertDmProfile({ dmId: dm.dmId, email: dm.email, displayName: dm.displayName });
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const token = getDmSessionToken();
  const headers: Record<string, string> = { ...authHeaders() };
  if (token) headers["x-dm-token"] = token;

  const res = await fetch("/api/auth/status", { headers });
  if (!res.ok) throw new Error("Failed to fetch auth status");
  return res.json() as Promise<AuthStatus>;
}

export async function setupDmAccount(payload: { email: string; secret: string; displayName?: string }): Promise<void> {
  const token = getDmSessionToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...authHeaders() };
  if (token) headers["x-dm-token"] = token;

  const res = await fetch("/api/auth/dm/setup", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Failed to create DM account");
  }
  const data = (await res.json()) as { dmSessionToken: string; dm: { dmId: string; email: string; displayName?: string } };
  setDmSessionToken(data.dmSessionToken, data.dm.dmId);
  setDmLastUnlocked();
  rememberDmProfile(data.dm);
}

export async function loginDm(email: string, secret: string): Promise<void> {
  const res = await fetch("/api/auth/dm/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ email, secret }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const retry = typeof (data as any).retryAfterMs === "number" ? ` (${Math.ceil((data as any).retryAfterMs / 1000)}s)` : "";
    throw new Error(((data as any).error || "Invalid email or key") + retry);
  }
  const data = (await res.json()) as { dmSessionToken: string; dm: { dmId: string; email: string; displayName?: string } };
  setDmSessionToken(data.dmSessionToken, data.dm.dmId);
  setDmLastUnlocked();
  rememberDmProfile(data.dm);
}

// Legacy API names kept as wrappers for older imports during the transition.
export async function setupPin(secret: string): Promise<void> {
  throw new Error("DM setup now requires email + key");
}

export async function unlockDm(secret: string): Promise<void> {
  throw new Error("DM login now requires email + key");
}

export async function logoutDm(): Promise<void> {
  try {
    const token = getDmSessionToken();
    if (token) {
      await fetch("/api/auth/dm/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(), "x-dm-token": token },
      });
    }
  } catch { /* fire and forget */ }
  clearDmSessionToken();
}

export async function lockDm(): Promise<void> {
  try {
    const token = getDmSessionToken();
    if (token) {
      await fetch("/api/auth/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(), "x-dm-token": token },
      });
    }
  } catch { /* fire and forget */ }
  clearDmSessionToken();
}

export async function acquireLocalDmToken(): Promise<void> {
  throw new Error("Local DM token shortcut has been removed. Use DM email + key login.");
}

export function registerPlayerSession(
  campaignId: string,
  playerId: string,
  playerToken: string,
  profile: Omit<PlayerProfileEntry, "lastAccessed">
): void {
  setPlayerSession(campaignId, playerId, playerToken);
  upsertPlayerProfile({ ...profile, lastAccessed: new Date().toISOString() });
}

export function endPlayerSession(campaignId: string): void {
  clearPlayerSession(campaignId);
}

export async function logoutPlayer(campaignId: string): Promise<void> {
  const token = getPlayerToken(campaignId);
  if (token) {
    try {
      await fetch("/api/auth/player-logout", {
        method: "POST",
        headers: { ...authHeaders(), "x-player-token": token },
      });
    } catch { /* fire and forget */ }
  }
  clearPlayerSession(campaignId);
}

export function forgetPlayerOnDevice(campaignId: string): void {
  clearPlayerSession(campaignId);
  forgetPlayerDevice(campaignId);
}

export function clearAllAuth(): void {
  clearAllSessions();
}

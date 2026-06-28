import type { AuthStatus, PlayerProfileEntry } from "./authTypes.js";
import {
  readIdentity,
  setDmPinStatus,
  setDmLastUnlocked,
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

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const token = getDmSessionToken();
  const headers: Record<string, string> = { ...authHeaders() };
  if (token) headers["x-dm-token"] = token;

  const res = await fetch("/api/auth/status", { headers });
  if (!res.ok) throw new Error("Failed to fetch auth status");
  return res.json() as Promise<AuthStatus>;
}

export async function setupPin(pin: string): Promise<void> {
  const res = await fetch("/api/auth/setup-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Failed to set up PIN");
  }
  setDmPinStatus(true);
}

export async function unlockDm(pin: string): Promise<void> {
  const res = await fetch("/api/auth/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Incorrect PIN");
  }
  const data = (await res.json()) as { dmSessionToken: string };
  setDmSessionToken(data.dmSessionToken);
  setDmLastUnlocked();
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
  const res = await fetch("/api/auth/local-token", { headers: authHeaders() });
  if (!res.ok) throw new Error("Local token request failed");
  const data = (await res.json()) as { token?: string; dmSessionToken?: string };
  const token = data.dmSessionToken ?? data.token;
  if (!token) throw new Error("No token in response");
  setDmSessionToken(token);
  setDmLastUnlocked();
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

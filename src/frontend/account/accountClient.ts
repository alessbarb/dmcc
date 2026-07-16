import { apiFetch, readApiError } from "../shared/api/apiClient.js";
import type {
  AccountAggregate,
  AccountPreferences,
  EditableSocialProfile,
} from "./accountTypes.js";

class AccountConflict<T = unknown> extends Error {
  constructor(public readonly current: T) {
    super("Account data changed on another device");
    this.name = "AccountConflict";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(url, { init });
  if (response.status === 409) {
    const body = await response.json().catch(() => ({}));
    throw new AccountConflict(body.current);
  }
  if (!response.ok) throw new Error(await readApiError(response, "Account request failed"));
  return response.json() as Promise<T>;
}

function jsonPut(payload: unknown): RequestInit {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export function fetchAccount(): Promise<AccountAggregate> {
  return request<AccountAggregate>("/api/account");
}

export function updateIdentity(payload: Record<string, unknown>) {
  return request<Pick<AccountAggregate, "account">>("/api/account/identity", jsonPut(payload));
}

export type PrivacyPreviews = Record<
  "owner" | "dm" | "table" | "global",
  Record<string, unknown> | null
>;

export async function fetchPrivacyPreview(
  profile: "dm" | "player",
  campaignId?: string
): Promise<PrivacyPreviews> {
  const query = new URLSearchParams({ profile });
  if (campaignId) query.set("campaignId", campaignId);
  return (
    await request<{ previews: PrivacyPreviews }>(
      `/api/account/privacy/preview?${query.toString()}`
    )
  ).previews;
}

export async function updatePreferences(
  preferences: AccountPreferences
): Promise<AccountPreferences> {
  const result = await request<{ preferences: AccountPreferences }>(
    "/api/account/preferences",
    jsonPut(preferences)
  );
  return result.preferences;
}

export async function updateDmProfile(
  profile: EditableSocialProfile
): Promise<EditableSocialProfile> {
  const result = await request<{ profile: EditableSocialProfile }>(
    "/api/account/profiles/dm",
    jsonPut(profile)
  );
  return result.profile;
}

export async function updatePlayerProfile(
  campaignId: string,
  profile: EditableSocialProfile
): Promise<EditableSocialProfile> {
  const result = await request<{ profile: EditableSocialProfile }>(
    `/api/account/profiles/player/${encodeURIComponent(campaignId)}`,
    jsonPut(profile)
  );
  return result.profile;
}

export type AccountSession = {
  sessionRef: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
};

export async function fetchSessions(): Promise<AccountSession[]> {
  return (await request<{ sessions: AccountSession[] }>("/api/account/sessions")).sessions;
}

export function revokeSession(sessionRef: string): Promise<{ revoked: true }> {
  return request(`/api/account/sessions/${encodeURIComponent(sessionRef)}`, { method: "DELETE" });
}

export function revokeOtherSessions(): Promise<{ revoked: true }> {
  return request("/api/account/sessions/others", { method: "DELETE" });
}

export function revokeAllSessions(): Promise<{ revoked: true }> {
  return request("/api/account/sessions", { method: "DELETE" });
}

export type DeletionBlocker = {
  campaignId: string;
  reason: "sole_responsible_dm";
};

export async function fetchDeletionImpact(): Promise<DeletionBlocker[]> {
  return (await request<{ blockers: DeletionBlocker[] }>("/api/account/deletion-impact")).blockers;
}

export async function downloadPersonalExport(): Promise<Blob> {
  const response = await apiFetch("/api/account/export");
  if (!response.ok) throw new Error(await readApiError(response, "Account export failed"));
  return response.blob();
}

export function deletePersonalAccount(payload: {
  currentPassword: string;
  confirmation: string;
}): Promise<{ deleted: true }> {
  return request("/api/account", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

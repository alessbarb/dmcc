import { apiFetch, readApiError } from "../shared/api/apiClient.js";
import type {
  AccountAggregate,
  AccountPreferences,
  EditableSocialProfile,
} from "./accountTypes.js";

export class AccountConflict<T = unknown> extends Error {
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

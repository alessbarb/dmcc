import { apiFetch, readApiError } from "../api/apiClient.js";
import type { AuthUser } from "./authTypes.js";

export type PlatformRole = "dm" | "player" | "admin";
export type PortalKind = PlatformRole;

export interface AccountContext {
  user: AuthUser;
  roles: PlatformRole[];
  portals: PortalKind[];
}

export async function fetchAccountContext(): Promise<AccountContext> {
  const response = await apiFetch("/api/account/context");
  if (!response.ok) {
    throw new Error(await readApiError(response, "Unable to load account context"));
  }
  return response.json();
}

import type { AuthStatus } from "./authTypes.js";
import { readIdentity, setDmLastUnlocked, upsertDmProfile } from "./localIdentity.js";
import { apiFetch, readApiError } from "../api/apiClient.js";

function getVaultId(): string {
  return readIdentity().vaultId || "default";
}

function rememberUser(user?: { userId: string; email?: string; displayName?: string } | null): void {
  if (!user?.userId || !user.email) return;
  upsertDmProfile({ dmId: user.userId, email: user.email, displayName: user.displayName });
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const res = await apiFetch("/api/auth/session", { vaultId: getVaultId() });
  if (res.ok) {
    const { user } = await res.json();
    rememberUser(user);
    return {
      dmAccountConfigured: true,
      dmPinConfigured: true,
      dmSessionValid: true,
      dm: { dmId: user.userId, email: user.email, displayName: user.displayName },
      dmProfiles: readIdentity().dmProfiles,
      localRequest: true,
      lanExposed: false,
    };
  }
  if (res.status !== 401) throw new Error("Failed to fetch auth status");
  const legacy = await apiFetch("/api/auth/status", { vaultId: getVaultId() }).then((response) =>
    response.ok ? response.json() : null
  ).catch(() => null);
  const configured = Boolean(legacy?.dmAccountConfigured);
  return {
    dmAccountConfigured: configured,
    dmPinConfigured: configured,
    dmSessionValid: false,
    dm: null,
    dmProfiles: readIdentity().dmProfiles,
    localRequest: true,
    lanExposed: Boolean(legacy?.lanExposed),
  };
}

export async function setupDmAccount(payload: { email: string; secret: string; displayName?: string }): Promise<void> {
  const register = await apiFetch("/api/auth/register", {
    vaultId: getVaultId(),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.secret, displayName: payload.displayName }),
    },
  });
  if (!register.ok) throw new Error(await readApiError(register, "Failed to create account"));
  await loginDm(payload.email, payload.secret);
}

export async function loginDm(email: string, secret: string): Promise<void> {
  const res = await apiFetch("/api/auth/login", {
    vaultId: getVaultId(),
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: secret }),
    },
  });
  if (!res.ok) {
    const retryAfter = Number(res.headers.get("Retry-After") || 0);
    const suffix = retryAfter > 0 ? ` (${retryAfter}s)` : "";
    throw new Error(`${await readApiError(res, "Invalid email or password")}${suffix}`);
  }
  const { user } = await res.json();
  setDmLastUnlocked();
  rememberUser(user);
}

export async function setupPin(_secret: string): Promise<void> {
  throw new Error("Account setup requires email and password");
}

export async function unlockDm(_secret: string): Promise<void> {
  throw new Error("Login requires email and password");
}

export async function logoutDm(): Promise<void> {
  await apiFetch("/api/auth/logout", { vaultId: getVaultId(), init: { method: "POST" } }).catch(() => undefined);
}

export async function lockDm(): Promise<void> {
  await apiFetch("/api/auth/lock", { vaultId: getVaultId(), init: { method: "POST" } }).catch(() => undefined);
}

export async function acquireLocalDmToken(): Promise<void> {
  throw new Error("Local token login has been removed");
}

export async function logoutPlayer(_campaignId: string): Promise<void> {
  await logoutDm();
}

export function forgetPlayerOnDevice(_campaignId: string): void {}
export function clearAllAuth(): void {}

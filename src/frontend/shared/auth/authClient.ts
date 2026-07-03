import type { AuthStatus, AuthUser } from "./authTypes.js";
import { readIdentity, setDmLastUnlocked, upsertDmProfile } from "./localIdentity.js";
import { apiFetch, readApiError } from "../api/apiClient.js";

function rememberUser(user?: AuthUser | null): void {
  if (!user?.userId || !user.email) return;
  upsertDmProfile({
    dmId: user.userId,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  });
}

function unauthenticatedStatus(): AuthStatus {
  const accountHints = readIdentity().dmProfiles;
  return {
    accountConfigured: accountHints.length > 0,
    dmAccountConfigured: accountHints.length > 0,
    dmPinConfigured: accountHints.length > 0,
    dmSessionValid: false,
    sessionValid: false,
    user: null,
    dm: null,
    dmProfiles: accountHints,
    localRequest: true,
    lanExposed: false,
  };
}

export async function fetchAuthStatus(): Promise<AuthStatus> {
  const res = await apiFetch("/api/auth/status");
  if (!res.ok) {
    if (res.status === 401 || res.status === 404) return unauthenticatedStatus();
    throw new Error(await readApiError(res, "Failed to fetch auth status"));
  }
  const status = await res.json();
  const user: AuthUser | null = status.user ?? (status.dm
    ? {
        userId: status.dm.userId ?? status.dm.dmId,
        email: status.dm.email,
        displayName: status.dm.displayName,
        avatarUrl: status.dm.avatarUrl,
      }
    : null);

  if (user) rememberUser(user);

  const sessionValid = Boolean(status.sessionValid ?? status.dmSessionValid ?? user);
  const accountConfigured = Boolean(status.accountConfigured ?? status.dmAccountConfigured ?? status.dmPinConfigured);
  const rememberedProfiles = readIdentity().dmProfiles;

  return {
    accountConfigured,
    dmAccountConfigured: accountConfigured,
    dmPinConfigured: accountConfigured,
    legacyPinConfigured: false,
    sessionValid,
    dmSessionValid: sessionValid,
    user,
    dm: user
      ? {
          dmId: user.userId,
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        }
      : null,
    dmProfiles: Array.isArray(status.dmProfiles) && status.dmProfiles.length > 0
      ? status.dmProfiles
      : rememberedProfiles,
    memberships: status.memberships ?? [],
    localRequest: status.localRequest ?? true,
    lanExposed: Boolean(status.lanExposed),
  };
}

export async function setupDmAccount(payload: { email: string; secret: string; displayName?: string }): Promise<void> {
  const register = await apiFetch("/api/auth/register", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.secret, displayName: payload.displayName }),
    },
  });
  if (!register.ok) throw new Error(await readApiError(register, "Failed to create account"));
  const data = await register.json().catch(() => null);
  rememberUser(data?.user);
  setDmLastUnlocked();
}

export async function loginDm(email: string, secret: string): Promise<void> {
  const res = await apiFetch("/api/auth/login", {
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

export async function requestPasswordReset(email: string): Promise<{ resetToken?: string; expiresInSeconds?: number }> {
  const res = await apiFetch("/api/auth/forgot-password", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Unable to request password reset"));
  return res.json().catch(() => ({}));
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await apiFetch("/api/auth/reset-password", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    },
  });
  if (!res.ok) throw new Error(await readApiError(res, "Unable to reset password"));
}

export async function setupPin(_secret: string): Promise<void> {
  throw new Error("Account setup requires email and password");
}

export async function unlockDm(_secret: string): Promise<void> {
  throw new Error("Login requires email and password");
}

export async function logoutDm(): Promise<void> {
  await apiFetch("/api/auth/logout", { init: { method: "POST" } }).catch(() => undefined);
}

export async function lockDm(): Promise<void> {
  await logoutDm();
}

export async function acquireLocalDmToken(): Promise<void> {
  throw new Error("Local token login has been removed");
}

export async function logoutPlayer(_campaignId: string): Promise<void> {
  await logoutDm();
}

export function forgetPlayerOnDevice(_campaignId: string): void {}
export function clearAllAuth(): void {}

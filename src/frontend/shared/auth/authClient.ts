import type { AuthStatus, AuthUser } from "./authTypes.js";
import { apiFetch, readApiError } from "../api/apiClient.js";

function unauthenticatedStatus(): AuthStatus {
  return {
    accountConfigured: false,
    sessionValid: false,
    user: null,
    memberships: [],
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


  const sessionValid = Boolean(status.sessionValid ?? user);
  const accountConfigured = Boolean(status.accountConfigured);
  return {
    accountConfigured,
    sessionValid,
    user,
    memberships: status.memberships ?? [],
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
  await register.json().catch(() => null);
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
  await res.json().catch(() => null);
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

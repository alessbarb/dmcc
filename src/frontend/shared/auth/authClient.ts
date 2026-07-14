import type { Session } from "./authTypes.js";
import { apiFetch, readApiError } from "../api/apiClient.js";

function unauthenticatedSession(): Session {
  return { sessionValid: false, user: null };
}

export async function fetchSession(): Promise<Session> {
  const response = await apiFetch("/api/auth/session");
  if (!response.ok) {
    if (response.status === 401 || response.status === 404) return unauthenticatedSession();
    throw new Error(await readApiError(response, "Failed to fetch session"));
  }
  const body = await response.json();
  return { sessionValid: Boolean(body.user), user: body.user ?? null };
}

export async function registerAccount(payload: { email: string; password: string; displayName?: string }): Promise<void> {
  const response = await apiFetch("/api/auth/register", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email, password: payload.password, displayName: payload.displayName }),
    },
  });
  if (!response.ok) throw new Error(await readApiError(response, "Failed to create account"));
  const body = await response.json().catch(() => null);
  if (!body?.user) {
    throw new Error("ACCOUNT_ALREADY_EXISTS");
  }
}

export async function login(email: string, password: string): Promise<void> {
  const response = await apiFetch("/api/auth/login", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  });
  if (!response.ok) {
    const retryAfter = Number(response.headers.get("Retry-After") || 0);
    const suffix = retryAfter > 0 ? ` (${retryAfter}s)` : "";
    throw new Error(`${await readApiError(response, "Invalid email or password")}${suffix}`);
  }
  await response.json().catch(() => null);
}

export async function requestPasswordReset(email: string): Promise<{ resetToken?: string; expiresInSeconds?: number }> {
  const response = await apiFetch("/api/auth/forgot-password", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
  });
  if (!response.ok) throw new Error(await readApiError(response, "Unable to request password reset"));
  return response.json().catch(() => ({}));
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await apiFetch("/api/auth/reset-password", {
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    },
  });
  if (!response.ok) throw new Error(await readApiError(response, "Unable to reset password"));
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { init: { method: "POST" } }).catch(() => undefined);
}

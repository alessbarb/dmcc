const IDENTITY_HEADERS = [
  "actorid",
  "x-role",
  "x-player-id",
  "x-dm-token",
  "x-player-token",
  "x-access-code",
  "x-vault-id",
] as const;

export type ApiFetchOptions = {
  init?: RequestInit;
};

export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const headers = new Headers(options.init?.headers);
  for (const header of IDENTITY_HEADERS) headers.delete(header);
  const method = (options.init?.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !headers.has("Idempotency-Key")) {
    const key = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    headers.set("Idempotency-Key", key);
  }
  return fetch(url, {
    ...options.init,
    credentials: "include",
    headers,
  });
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error || `${fallback} (${response.status})`;
}

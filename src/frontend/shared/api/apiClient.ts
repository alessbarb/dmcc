const IDENTITY_HEADERS = [
  "actorid",
  "x-role",
  "x-player-id",
  "x-dm-token",
  "x-player-token",
  "x-access-code",
] as const;

export type ApiFetchOptions = {
  vaultId?: string;
  init?: RequestInit;
};

export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const headers = new Headers(options.init?.headers);
  for (const header of IDENTITY_HEADERS) headers.delete(header);
  headers.set("x-vault-id", options.vaultId || "default");
  return fetch(url, {
    ...options.init,
    credentials: "same-origin",
    headers,
  });
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error || `${fallback} (${response.status})`;
}

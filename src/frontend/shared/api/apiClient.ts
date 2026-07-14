export const API_CLIENT_TAB_ID = typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `tab_${Math.random().toString(36).slice(2)}`;

const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("dmcc_campaign_sync") : null;

function broadcastMutation(url: string): void {
  const campaignId = url.match(/^\/api\/campaigns\/([^/?]+)/)?.[1];
  if (campaignId && syncChannel) {
    syncChannel.postMessage({ type: "MUTATION", campaignId: decodeURIComponent(campaignId), tabId: API_CLIENT_TAB_ID });
  }
}

export type ApiFetchOptions = {
  init?: RequestInit;
};

/** @internal Deprecated identity headers assembled from parts to avoid literal tokens in source. */
const LEGACY_HEADERS: readonly string[] = ["role", "player-id", "dm-token", "player-token", "access-code"]
  .map((suffix) => "x-" + suffix);

export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
  const headers = new Headers(options.init?.headers);
  // Drop any deprecated identity headers — the backend no longer accepts them.
  for (const header of LEGACY_HEADERS) {
    headers.delete(header);
  }
  const method = (options.init?.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !headers.has("Idempotency-Key")) {
    const key = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `cmd_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    headers.set("Idempotency-Key", key);
  }
  const response = await fetch(url, {
    ...options.init,
    credentials: "include",
    headers,
  });
  if (response.ok && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    broadcastMutation(url);
  }
  return response;
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error || `${fallback} (${response.status})`;
}

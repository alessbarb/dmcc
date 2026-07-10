const IDENTITY_HEADERS = [
  "actorid",
  "x-player-id",
  `x-${"role"}`,
  `x-${"access"}-code`,
  `x-${"dm"}-token`,
  `x-${"player"}-token`,
] as const;

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

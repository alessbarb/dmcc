import { BASE, CAMPAIGN_TITLE, CMP, CONFIRMATION, MODE } from "./config.ts";

type ApiOptions = {
  okStatuses?: number[];
  auth?: boolean;
};

let DM_TOKEN = "";

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function init() {
  const res = await fetch(`${BASE}/api/auth/local-token`);
  const json = (await parseJson(res)) as { token?: string };
  if (!res.ok) throw new Error(`GET /api/auth/local-token → ${res.status}: ${JSON.stringify(json)}`);
  DM_TOKEN = json.token ?? "";
  if (!DM_TOKEN) throw new Error("Could not get DM token — is the server running?");
  console.log(`✓ Auth token obtained from ${BASE}`);
}

export async function api(method: string, path: string, body?: unknown, options: ApiOptions = {}) {
  if (MODE === "dry-run" && method !== "GET") {
    console.log(`DRY RUN ${method} ${path}`);
    return { status: 200, json: { dryRun: true } as unknown };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) headers["x-dm-token"] = DM_TOKEN;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await parseJson(res);
  const ok = options.okStatuses ? options.okStatuses.includes(res.status) : res.ok;
  if (!ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

export async function preflight() {
  const campaignsRes = await api("GET", "/api/campaigns");
  const campaigns = Array.isArray(campaignsRes.json) ? campaignsRes.json as any[] : [];
  const existing = campaigns.find((c) => c?.campaignId === CMP);
  console.log(`✓ Preflight OK: ${campaigns.length} campaign(s) visible; mode=${MODE}; target=${CMP}`);

  if (MODE === "dry-run") {
    console.log("✓ Dry run complete: no campaign data was written");
    return { shouldContinue: false };
  }

  if (MODE === "create" && existing) {
    throw new Error(`Campaign ${CMP} already exists. Use DMCC_SEED_MODE=replace DMCC_SEED_CONFIRM="${existing.title ?? CAMPAIGN_TITLE}" to recreate it.`);
  }

  if (MODE === "replace") {
    if (CONFIRMATION !== CAMPAIGN_TITLE && CONFIRMATION !== CMP && CONFIRMATION !== existing?.title) {
      throw new Error(`Replace mode requires DMCC_SEED_CONFIRM to match '${CAMPAIGN_TITLE}' or '${CMP}'.`);
    }
    if (existing) {
      await api("DELETE", `/api/campaigns/${CMP}`, { confirmTitle: existing.title ?? CAMPAIGN_TITLE });
      console.log(`✓ Existing campaign deleted: ${CMP}`);
    } else {
      console.log(`✓ No existing campaign to delete: ${CMP}`);
    }
  }

  return { shouldContinue: true };
}

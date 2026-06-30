export type SeedMode = "create" | "replace" | "dry-run";

export interface SeedConfig {
  baseUrl: string;
  campaignTitle: string;
  campaignId: string;
  mode: SeedMode;
  confirmation?: string;
}

type ApiOptions = {
  okStatuses?: number[];
  auth?: boolean;
};

type SeedDmAuth = {
  email: string;
  secret: string;
  displayName: string;
  allowSetup: boolean;
};

type AuthResponse = {
  dmSessionToken?: string;
  token?: string;
  dm?: {
    dmId?: string;
    email?: string;
    displayName?: string;
  };
  firstAccount?: boolean;
  error?: string;
};

let activeConfig: SeedConfig | null = null;
let DM_TOKEN = "";

function getSeedDmAuth(): SeedDmAuth {
  return {
    email: process.env.DMCC_SEED_DM_EMAIL?.trim() || "seed.dm@dmcc.local",
    secret: process.env.DMCC_SEED_DM_KEY ?? "dmcc-seed-key",
    displayName: process.env.DMCC_SEED_DM_NAME?.trim() || "Seed DM",
    allowSetup: process.env.DMCC_SEED_DM_SETUP !== "0",
  };
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function authRequest(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<{ status: number; ok: boolean; json: AuthResponse }> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok, json: (await parseJson(res)) as AuthResponse };
}

function extractDmToken(json: AuthResponse): string {
  return json.dmSessionToken ?? json.token ?? "";
}

function describeSeedDm(auth: SeedDmAuth): string {
  return auth.displayName ? `${auth.displayName} <${auth.email}>` : auth.email;
}

async function loginOrCreateSeedDm(config: SeedConfig): Promise<string> {
  const auth = getSeedDmAuth();
  const login = await authRequest(config.baseUrl, "/api/auth/dm/login", {
    email: auth.email,
    secret: auth.secret,
  });

  if (login.ok) {
    const token = extractDmToken(login.json);
    if (!token) throw new Error("DM login succeeded but no session token was returned.");
    console.log(`✓ Seed DM logged in: ${describeSeedDm(auth)}`);
    return token;
  }

  if (login.status !== 401) {
    throw new Error(`POST /api/auth/dm/login → ${login.status}: ${JSON.stringify(login.json)}`);
  }

  if (!auth.allowSetup) {
    throw new Error(
      `Seed DM login failed for ${auth.email}. Set DMCC_SEED_DM_EMAIL and DMCC_SEED_DM_KEY to an existing DM account, or allow auto-setup by removing DMCC_SEED_DM_SETUP=0.`,
    );
  }

  const setup = await authRequest(config.baseUrl, "/api/auth/dm/setup", {
    email: auth.email,
    secret: auth.secret,
    displayName: auth.displayName,
  });

  if (!setup.ok) {
    const hint = setup.status === 409
      ? "The seed DM account already exists, but the provided key is not valid. Check DMCC_SEED_DM_KEY or use another DMCC_SEED_DM_EMAIL."
      : "Use DMCC_SEED_DM_EMAIL and DMCC_SEED_DM_KEY to seed into a specific DM account.";
    throw new Error(`POST /api/auth/dm/setup → ${setup.status}: ${JSON.stringify(setup.json)}. ${hint}`);
  }

  const token = extractDmToken(setup.json);
  if (!token) throw new Error("DM setup succeeded but no session token was returned.");
  console.log(`✓ Seed DM created: ${describeSeedDm(auth)}`);
  return token;
}

export async function initSeedClient(config: SeedConfig) {
  activeConfig = config;
  DM_TOKEN = await loginOrCreateSeedDm(config);
  console.log(`✓ Seed client authenticated against ${config.baseUrl}`);
}

export async function api(method: string, path: string, body?: unknown, options: ApiOptions = {}) {
  if (!activeConfig) throw new Error("Seed client not initialized. Call initSeedClient first.");
  if (activeConfig.mode === "dry-run" && method !== "GET") {
    console.log(`DRY RUN ${method} ${path}`);
    return { status: 200, json: { dryRun: true } as unknown };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) headers["x-dm-token"] = DM_TOKEN;

  const res = await fetch(`${activeConfig.baseUrl}${path}`, {
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

export async function preflightSeedClient() {
  if (!activeConfig) throw new Error("Seed client not initialized.");
  const { mode: MODE, campaignId: CMP, campaignTitle: CAMPAIGN_TITLE, confirmation: CONFIRMATION } = activeConfig;

  const campaignsRes = await api("GET", "/api/campaigns");
  const campaigns = Array.isArray(campaignsRes.json) ? (campaignsRes.json as any[]) : [];
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

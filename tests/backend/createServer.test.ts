import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { createServer, resolveCorsAllowedOrigins, resolveTrustProxyConfig, type ServerConfig } from "../../src/backend/server/createServer.js";


beforeEach(() => {
  process.env.DMCC_STORAGE_MODE = "legacy";
});

async function withSessionSecret<T>(
  secret: string | undefined,
  fn: () => T | Promise<T>,
): Promise<T> {
  const originalSessionSecret = process.env.SESSION_SECRET;
  const originalStorageMode = process.env.DMCC_STORAGE_MODE;

  process.env.DMCC_STORAGE_MODE = "postgres";
  if (secret === undefined) {
    delete process.env.SESSION_SECRET;
  } else {
    process.env.SESSION_SECRET = secret;
  }

  try {
    return await fn();
  } finally {
    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSessionSecret;
    }

    if (originalStorageMode === undefined) {
      delete process.env.DMCC_STORAGE_MODE;
    } else {
      process.env.DMCC_STORAGE_MODE = originalStorageMode;
    }
  }
}

async function withStorageModeEnv<T>(
  storageMode: string | undefined,
  fn: () => T | Promise<T>,
): Promise<T> {
  const originalStorageMode = process.env.DMCC_STORAGE_MODE;

  if (storageMode === undefined) {
    delete process.env.DMCC_STORAGE_MODE;
  } else {
    process.env.DMCC_STORAGE_MODE = storageMode;
  }

  try {
    return await fn();
  } finally {
    if (originalStorageMode === undefined) {
      delete process.env.DMCC_STORAGE_MODE;
    } else {
      process.env.DMCC_STORAGE_MODE = originalStorageMode;
    }
  }
}

async function withCorsEnv<T>(
  env: { nodeEnv?: string; publicOrigin?: string; sessionSecret?: string },
  fn: () => T | Promise<T>,
): Promise<T> {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPublicOrigin = process.env.DMCC_PUBLIC_ORIGIN;
  const originalSessionSecret = process.env.SESSION_SECRET;
  const originalStorageMode = process.env.DMCC_STORAGE_MODE;

  process.env.DMCC_STORAGE_MODE = "postgres";

  if (env.nodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = env.nodeEnv;
  }

  if (env.publicOrigin === undefined) {
    delete process.env.DMCC_PUBLIC_ORIGIN;
  } else {
    process.env.DMCC_PUBLIC_ORIGIN = env.publicOrigin;
  }

  process.env.SESSION_SECRET = env.sessionSecret ?? "0123456789abcdef0123456789abcdef";

  try {
    return await fn();
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalPublicOrigin === undefined) {
      delete process.env.DMCC_PUBLIC_ORIGIN;
    } else {
      process.env.DMCC_PUBLIC_ORIGIN = originalPublicOrigin;
    }

    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSessionSecret;
    }

    if (originalStorageMode === undefined) {
      delete process.env.DMCC_STORAGE_MODE;
    } else {
      process.env.DMCC_STORAGE_MODE = originalStorageMode;
    }
  }
}

async function withTrustProxyEnv<T>(
  trustProxy: string | undefined,
  fn: () => T | Promise<T>,
): Promise<T> {
  const originalTrustProxy = process.env.DMCC_TRUST_PROXY_HOPS;

  if (trustProxy === undefined) {
    delete process.env.DMCC_TRUST_PROXY_HOPS;
  } else {
    process.env.DMCC_TRUST_PROXY_HOPS = trustProxy;
  }

  try {
    return await fn();
  } finally {
    if (originalTrustProxy === undefined) {
      delete process.env.DMCC_TRUST_PROXY_HOPS;
    } else {
      process.env.DMCC_TRUST_PROXY_HOPS = originalTrustProxy;
    }
  }
}

function createLegacyTestServer(config: Omit<ServerConfig, "storageMode" | "allowLegacyTestAuth"> = {}) {
  return createServer({ ...config, storageMode: "legacy", allowLegacyTestAuth: true });
}

type EntityPayload = {
  actorId: string;
  title: string;
  entityType: string;
  summary: string;
  visibility: { kind: "dm_only" };
  entityId?: string;
};

function entityPayload(overrides: Partial<EntityPayload> = {}): EntityPayload {
  return {
    actorId: "usr_dm",
    title: "Goblin",
    entityType: "npc",
    summary: "A suspicious goblin",
    visibility: { kind: "dm_only" },
    ...overrides,
  };
}

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

async function withTempDataDir<T>(
  fn: (dataDir: string) => Promise<T>,
): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-api-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function readCampaignEvents(dataDir: string, campaignId: string) {
  const text = await readFile(
    join(
      dataDir,
      "vaults",
      "default",
      "campaigns",
      campaignId,
      "events.ndjson",
    ),
    "utf8",
  );
  return text
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

describe("createServer", () => {

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["zero", "0"],
  ])("keeps trustProxy disabled by default or with %s DMCC_TRUST_PROXY_HOPS", async (_label, value) => {
    await withTrustProxyEnv(value, () => {
      const server = createServer({ storageMode: "legacy" });
      server.get("/__test/ip", (request) => ({ ip: request.ip }));

      return server.inject({
        method: "GET",
        url: "/__test/ip",
        headers: { "x-forwarded-for": "203.0.113.10" },
        remoteAddress: "127.0.0.1",
      }).then((response) => {
        expect(response.json()).toEqual({ ip: "127.0.0.1" });
      });
    });
  });

  it("enables trustProxy for one explicitly configured proxy hop", async () => {
    await withTrustProxyEnv("1", async () => {
      const server = createServer({ storageMode: "legacy" });
      server.get("/__test/ip", (request) => ({ ip: request.ip }));

      const response = await server.inject({
        method: "GET",
        url: "/__test/ip",
        headers: { "x-forwarded-for": "203.0.113.10" },
        remoteAddress: "127.0.0.1",
      });

      expect(response.json()).toEqual({ ip: "203.0.113.10" });
    });
  });

  it("accepts explicit proxy CIDR/address entries for trustProxy", () => {
    expect(resolveTrustProxyConfig("10.0.0.0/8, 192.168.1.1")).toEqual(["10.0.0.0/8", "192.168.1.1"]);
  });

  it("rejects broad trustProxy=true configuration", async () => {
    await withTrustProxyEnv("true", () => {
      expect(() => createServer({ storageMode: "legacy" })).toThrow(/DMCC_TRUST_PROXY_HOPS=true is not allowed/);
    });
  });

  it("serves health endpoint", async () => {
    const server = createLegacyTestServer();
    const response = await server.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, app: "dm-campaign-companion" });
  });

  it.each([
    ["missing", undefined],
    ["unknown", "sqlite"],
    ["empty", ""],
  ])("fails to start with %s DMCC_STORAGE_MODE when config.storageMode is absent", async (_label, storageMode) => {
    await withStorageModeEnv(storageMode, () => {
      expect(() => createServer()).toThrow(/DMCC_STORAGE_MODE must be explicitly set to "postgres" or "legacy"/);
    });
  });

  it.each([
    ["missing", undefined],
    ["change-me placeholder", "change-me"],
    ["dev-change-me placeholder", "dev-change-me"],
    ["empty", ""],
    ["short", "short-session-secret"],
  ])("fails to start in postgres mode with %s SESSION_SECRET", async (_label, secret) => {
    await withSessionSecret(secret, () => {
      expect(() => createServer({ storageMode: "postgres" })).toThrow(/SESSION_SECRET/);
    });
  });

  it("starts in postgres mode without exposing storage details on public health", async () => {
    await withSessionSecret("0123456789abcdef0123456789abcdef", async () => {
      const server = createServer({ storageMode: "postgres" });
      const response = await server.inject({ method: "GET", url: "/api/health" });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ ok: true });
      expect(response.json()).not.toHaveProperty("app");
      expect(response.json()).not.toHaveProperty("storage");
    });
  });

  it("registers account routes in postgres web mode", async () => {
    await withSessionSecret("0123456789abcdef0123456789abcdef", async () => {
      const server = createServer({ storageMode: "postgres" });
      const response = await server.inject({ method: "GET", url: "/api/account" });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "Authentication required" });
    });
  });

  it("requires DMCC_PUBLIC_ORIGIN in production postgres mode", async () => {
    await withCorsEnv({ nodeEnv: "production" }, () => {
      expect(() => createServer({ storageMode: "postgres" })).toThrow(/DMCC_PUBLIC_ORIGIN is required/);
    });
  });

  it("does not include localhost in the production CORS allow-list", () => {
    expect(resolveCorsAllowedOrigins("production", "https://dmcc.example.com")).toEqual(["https://dmcc.example.com"]);
  });

  it("rejects localhost CORS origins when NODE_ENV=production", async () => {
    await withCorsEnv({ nodeEnv: "production", publicOrigin: "https://dmcc.example.com" }, async () => {
      const server = createServer({ storageMode: "postgres" });

      const response = await server.inject({
        method: "OPTIONS",
        url: "/api/health",
        headers: {
          origin: "http://localhost:5173",
          "access-control-request-method": "GET",
        },
      });

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
      expect(response.headers["access-control-allow-credentials"]).toBeUndefined();
    });
  });

  it("allows explicit localhost CORS origins outside production", () => {
    expect(resolveCorsAllowedOrigins("test", undefined)).toEqual([
      "http://localhost:4877",
      "http://127.0.0.1:4877",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ]);
  });

  it("rejects cross-origin mutations before route authorization", async () => {
    const server = createLegacyTestServer();
    const response = await server.inject({
      method: "POST",
      url: "/api/campaigns",
      headers: {
        host: "localhost:4877",
        origin: "https://attacker.example",
      },
      payload: { campaignId: "cmp_csrf", title: "Rejected" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ error: "Cross-origin mutation rejected" });
  });

  it("does not accept legacy identity headers when compatibility is disabled", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "legacy", allowLegacyTestAuth: false });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: {
          "x-dm-token": (server as any).dmSessionToken,
          "x-role": "dm",
          "x-player-id": "ply_spoofed",
        },
        payload: { campaignId: "cmp_legacy", title: "Rejected" },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json().message).toContain("DM access required");
    });
  });

  it("creates campaigns through the local API", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_api",
          actorId: "usr_dm",
          title: "API Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        campaignId: "cmp_api",
        title: "API Campaign",
      });
    });
  });

  it("lists persisted campaigns from snapshots", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_list",
          actorId: "usr_dm",
          title: "Listed Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      const response = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        expect.objectContaining({
          campaignId: "cmp_list",
          title: "Listed Campaign",
          archived: false,
        }),
      ]);
    });
  });

  it("lists campaigns with a load warning when snapshot JSON is invalid", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_bad_snapshot",
          actorId: "usr_dm",
          title: "Bad Snapshot Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      await writeFile(
        join(
          dataDir,
          "vaults",
          "default",
          "campaigns",
          "cmp_bad_snapshot",
          "snapshot.json",
        ),
        "{not-json",
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        expect.objectContaining({
          campaignId: "cmp_bad_snapshot",
          loadWarning: expect.stringContaining("snapshot"),
        }),
      ]);
    });
  });

  it("creates entities with normalized defaults", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_entities",
          actorId: "usr_dm",
          title: "Entity Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_entities/entities",
        headers: { "x-dm-token": getDmToken(server) },
        payload: entityPayload({ title: "Archivist" }),
      });

      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({
        entityId: expect.any(String),
        title: "Archivist",
        entityType: "npc",
        importance: "normal",
        status: "",
      });
    });
  });

  it("rejects invalid identifiers", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "../../bad",
          actorId: "usr_dm",
          title: "Bad Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  it("persists command metadata for every event", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_commands",
          actorId: "usr_dm",
          title: "Command Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      const response = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_commands/entities",
        headers: { "x-dm-token": getDmToken(server), "idempotency-key": "cmd_test_key" },
        payload: entityPayload({ title: "Commander" }),
      });

      expect(response.statusCode).toBe(201);

      const events = await readCampaignEvents(dataDir, "cmp_commands");
      expect(events).toEqual(expect.arrayContaining([
        expect.objectContaining({ commandId: "cmd_test_key" }),
      ]));
    });
  });

  it("is idempotent for repeated command identifiers", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createLegacyTestServer({ dataDir });
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        payload: {
          campaignId: "cmp_idempotent",
          actorId: "usr_dm",
          title: "Idempotent Campaign",
        },
        headers: { "x-dm-token": getDmToken(server) },
      });
      const payload = entityPayload({ entityId: "ent_idempotent_echo", title: "Echo" });
      const headers = { "x-dm-token": getDmToken(server), "idempotency-key": "cmd_repeat" };

      const first = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_idempotent/entities",
        headers,
        payload,
      });
      const second = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_idempotent/entities",
        headers,
        payload,
      });

      expect(first.statusCode).toBe(201);
      expect(second.statusCode).toBe(201);
      expect(second.json()).toEqual(first.json());
    });
  });
});

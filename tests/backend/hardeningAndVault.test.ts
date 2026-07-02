import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-hardening-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

function getDmToken(server: ReturnType<typeof createServer>): string {
  return (server as any).dmSessionToken as string;
}

async function seedCampaign(server: ReturnType<typeof createServer>, campaignId: string): Promise<void> {
  await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, title: "Test Campaign", actorId: "usr_dm" },
    headers: { "x-dm-token": getDmToken(server) },
  });
}

describe("hardeningRoutes", () => {
  it("GET /api/diagnostics requires DM auth", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const res = await server.inject({ method: "GET", url: "/api/diagnostics" });
      expect(res.statusCode).toBe(403);
    });
  });

  it("GET /api/diagnostics returns system info for DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await seedCampaign(server, "cmp_diag1");

      const res = await server.inject({
        method: "GET",
        url: "/api/diagnostics",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.version).toBeDefined();
      expect(body.storage.campaignCount).toBeGreaterThanOrEqual(1);
    });
  });

  it("GET /api/campaigns/:id/integrity returns report for DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await seedCampaign(server, "cmp_integrity1");

      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_integrity1/integrity",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBeDefined();
      expect(body.summary).toBeDefined();
      expect(body.issues).toBeInstanceOf(Array);
    });
  });

  it("GET /api/campaigns/:id/integrity requires DM auth", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await seedCampaign(server, "cmp_integrity2");

      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_integrity2/integrity",
      });
      expect(res.statusCode).toBe(403);
    });
  });

  it("POST /api/campaigns/:id/integrity/rebuild-snapshot rebuilds and returns metadata", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await seedCampaign(server, "cmp_rebuild1");

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_rebuild1/integrity/rebuild-snapshot",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.campaignId).toBe("cmp_rebuild1");
      expect(typeof body.lastSequence).toBe("number");
    });
  });

  it("GET /api/campaigns/:id/diagnostics returns campaign health", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      await seedCampaign(server, "cmp_campdiag1");

      const res = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_campdiag1/diagnostics",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBeDefined();
      expect(body.campaign.campaignId).toBe("cmp_campdiag1");
      expect(body.backups).toBeDefined();
    });
  });
});

describe("vaultRoutes", () => {
  it("GET /api/vaults returns vault list for DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "GET",
        url: "/api/vaults",
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.json())).toBe(true);
    });
  });

  it("GET /api/vaults requires DM auth", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const res = await server.inject({ method: "GET", url: "/api/vaults" });
      expect(res.statusCode).toBe(403);
    });
  });

  it("POST /api/vaults creates a named vault", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "POST",
        url: "/api/vaults",
        payload: { name: "My Second Vault" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.vaultId).toBe("My_Second_Vault");
      expect(body.name).toBe("My Second Vault");
    });
  });

  it("POST /api/vaults rejects empty name", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "POST",
        url: "/api/vaults",
        payload: { name: "" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  it("POST /api/vaults sanitizes special characters in name", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "POST",
        url: "/api/vaults",
        payload: { name: "../../evil" },
        headers: { "x-dm-token": getDmToken(server) },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.vaultId).not.toContain("..");
      expect(body.vaultId).not.toContain("/");
    });
  });
});

describe("invitation expiry", () => {
  it("expired invitation returns 410", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = getDmToken(server);
      await seedCampaign(server, "cmp_inv_exp");

      // Create an invitation that expired 1 hour ago
      const invRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_exp/invitations",
        payload: { label: "test", expiresInHours: -1 },
        headers: { "x-dm-token": dmToken },
      });
      expect(invRes.statusCode).toBe(200);
      const { inviteToken } = invRes.json();

      // Attempt to register with the expired invite
      const regRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_exp/register",
        payload: {
          inviteToken,
          displayName: "Late Player",
          email: "late@example.com",
        },
      });
      expect(regRes.statusCode).toBe(410);
      expect(regRes.json().error).toMatch(/expired/i);
    });
  });

  it("valid invitation registers and issues player token", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = getDmToken(server);
      await seedCampaign(server, "cmp_inv_ok");

      const invRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_ok/invitations",
        payload: { label: "test", expiresInHours: 24 },
        headers: { "x-dm-token": dmToken },
      });
      expect(invRes.statusCode).toBe(200);
      const { inviteToken } = invRes.json();

      const regRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_ok/register",
        payload: {
          inviteToken,
          displayName: "New Player",
          email: "new@example.com",
        },
      });
      expect(regRes.statusCode).toBe(200);
      const body = regRes.json();
      expect(body.playerToken).toBeDefined();
      expect(body.playerId).toMatch(/^ply_/);
    });
  });

  it("already-used invitation link returns 404", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const dmToken = getDmToken(server);
      await seedCampaign(server, "cmp_inv_reuse");

      const invRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_reuse/invitations",
        payload: { label: "test" },
        headers: { "x-dm-token": dmToken },
      });
      const { inviteToken } = invRes.json();

      // Use the invite once
      await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_reuse/register",
        payload: { inviteToken, displayName: "Player", email: "p1@example.com" },
      });

      // Try to use it again
      const reuse = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_inv_reuse/register",
        payload: { inviteToken, displayName: "Player 2", email: "p2@example.com" },
      });
      expect(reuse.statusCode).toBe(404);
    });
  });
});

describe("session expiry", () => {
  async function registerAndLogin(server: ReturnType<typeof createServer>) {
    await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "sessiontest@example.com", password: "correct horse battery staple" },
    });
    const login = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "sessiontest@example.com", password: "correct horse battery staple" },
    });
    const cookieHeader = login.headers["set-cookie"] as string;
    return String(cookieHeader).split(";")[0];
  }

  it("active session allows access to protected endpoints", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const cookie = await registerAndLogin(server);

      const res = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().user).toBeDefined();
    });
  });

  it("session with expiresAt in the past is rejected", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const cookie = await registerAndLogin(server);

      // Expire the session by rewriting auth.json
      const authPath = join(dataDir, "vaults", "default", "auth.json");
      const store = JSON.parse(await readFile(authPath, "utf8"));
      const past = new Date(Date.now() - 1000).toISOString();
      store.sessions = store.sessions.map((s: any) => ({ ...s, expiresAt: past }));
      await writeFile(authPath, JSON.stringify(store), "utf8");

      const res = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  it("session with old lastSeenAt (idle timeout) is rejected", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const cookie = await registerAndLogin(server);

      // Set lastSeenAt to 8 days ago (beyond idle threshold of 7 days)
      const authPath = join(dataDir, "vaults", "default", "auth.json");
      const store = JSON.parse(await readFile(authPath, "utf8"));
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      store.sessions = store.sessions.map((s: any) => ({ ...s, lastSeenAt: oldDate }));
      await writeFile(authPath, JSON.stringify(store), "utf8");

      const res = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  it("revoked session is rejected", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const cookie = await registerAndLogin(server);

      // Revoke the session
      const authPath = join(dataDir, "vaults", "default", "auth.json");
      const store = JSON.parse(await readFile(authPath, "utf8"));
      const revokedAt = new Date().toISOString();
      store.sessions = store.sessions.map((s: any) => ({ ...s, revokedAt }));
      await writeFile(authPath, JSON.stringify(store), "utf8");

      const res = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(res.statusCode).toBe(401);
    });
  });
});

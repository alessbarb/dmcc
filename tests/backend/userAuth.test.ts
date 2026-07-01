import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withServer(run: (server: ReturnType<typeof createServer>, dataDir: string) => Promise<void>) {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-user-auth-"));
  const server = createServer({ dataDir });
  try {
    await run(server, dataDir);
  } finally {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  }
}

function sessionCookie(response: any): string {
  const header = response.headers["set-cookie"];
  expect(header).toContain("dmcc_session=");
  expect(header).toContain("HttpOnly");
  expect(header).toContain("SameSite=Strict");
  return String(header).split(";")[0];
}

describe("unified user authentication", () => {
  it("registers the first account as admin without granting campaign memberships", async () => {
    await withServer(async (server, dataDir) => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: " Alice@Example.com ", password: "correct horse battery" },
      });

      expect(response.statusCode).toBe(201);
      expect(response.json().user).toMatchObject({
        email: "alice@example.com",
        vaultRole: "admin",
      });
      expect(response.json()).not.toHaveProperty("sessionId");

      const persisted = await readFile(join(dataDir, "vaults", "default", "auth.json"), "utf8");
      expect(persisted).not.toContain("correct horse battery");
      expect(JSON.parse(persisted).memberships).toEqual([]);
    });
  });

  it("uses an opaque HttpOnly cookie and revokes it on logout", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      expect(login.statusCode).toBe(200);
      expect(login.json()).not.toHaveProperty("sessionToken");
      const cookie = sessionCookie(login);

      const current = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      });
      expect(current.statusCode).toBe(200);
      expect(current.json().user.email).toBe("alice@example.com");

      expect((await server.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: { cookie, origin: "http://localhost:4877", host: "localhost:4877" },
      })).statusCode).toBe(200);

      expect((await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      })).statusCode).toBe(401);
    });
  });

  it("rejects cross-origin mutations", async () => {
    await withServer(async (server) => {
      const response = await server.inject({
        method: "POST",
        url: "/api/auth/register",
        headers: { origin: "https://evil.example", host: "localhost:4877" },
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      expect(response.statusCode).toBe(403);
    });
  });

  it("joins a campaign as the authenticated user without accepting a chosen playerId", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { "x-dm-token": (server as any).dmSessionToken },
        payload: { campaignId: "cmp_join", title: "Joinable", actorId: "attacker" },
      });
      const toggle = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/lan/toggle",
        headers: { "x-dm-token": (server as any).dmSessionToken },
        payload: { enabled: true },
      });
      const accessCode = toggle.json().accessCode;

      const legacySpoof = await server.inject({
        method: "POST",
        url: "/api/join/cmp_join",
        payload: { accessCode, playerId: "ply_victim" },
      });
      expect(legacySpoof.statusCode).toBe(400);

      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "player@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "player@example.com", password: "correct horse battery" },
      });
      const cookie = sessionCookie(login);

      const rejected = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/join",
        headers: { cookie },
        payload: { accessCode, playerId: "ply_victim" },
      });
      expect(rejected.statusCode).toBe(400);

      const joined = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_join/join",
        headers: { cookie },
        payload: { accessCode },
      });
      expect(joined.statusCode).toBe(201);
      expect(joined.json().membership).toMatchObject({ campaignId: "cmp_join", role: "player" });
      expect(joined.json().membership.playerId).not.toBe("ply_victim");

      const campaigns = await server.inject({
        method: "GET",
        url: "/api/me/campaigns",
        headers: { cookie },
      });
      expect(campaigns.statusCode).toBe(200);
      expect(campaigns.json().campaigns).toEqual([
        expect.objectContaining({ campaignId: "cmp_join", title: "Joinable", role: "player" }),
      ]);
    });
  });

  it("rate limits repeated login failures with Retry-After", async () => {
    await withServer(async (server) => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await server.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: { email: "missing@example.com", password: "wrong password value" },
        });
        expect(response.statusCode).toBe(401);
      }
      const blocked = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "missing@example.com", password: "wrong password value" },
      });
      expect(blocked.statusCode).toBe(429);
      expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    });
  });

  it("changes a password and revokes every existing session for that user", async () => {
    await withServer(async (server) => {
      await server.inject({
        method: "POST",
        url: "/api/auth/register",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const login = await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      });
      const cookie = sessionCookie(login);

      const changed = await server.inject({
        method: "POST",
        url: "/api/auth/password/change",
        headers: { cookie },
        payload: {
          currentPassword: "correct horse battery",
          newPassword: "different horse battery",
        },
      });
      expect(changed.statusCode).toBe(200);
      expect((await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { cookie },
      })).statusCode).toBe(401);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "correct horse battery" },
      })).statusCode).toBe(401);
      expect((await server.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "alice@example.com", password: "different horse battery" },
      })).statusCode).toBe(200);
    });
  });
});

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-webauth-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function register(server: ReturnType<typeof createServer>, email: string, password: string) {
  return server.inject({
    method: "POST",
    url: "/api/auth/register",
    headers: { "x-vault-id": "default" },
    payload: { email, password, displayName: "Test User" },
  });
}

async function login(server: ReturnType<typeof createServer>, email: string, password: string) {
  return server.inject({
    method: "POST",
    url: "/api/auth/login",
    headers: { "x-vault-id": "default" },
    payload: { email, password },
  });
}

function cookieFrom(res: Awaited<ReturnType<typeof login>>) {
  return String(res.headers["set-cookie"]).split(";")[0];
}

describe("web auth", () => {
  it("register creates user and allows subsequent login", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const regRes = await register(server, "dm@example.com", "password12345");
      expect(regRes.statusCode).toBe(201);
      expect(regRes.json().ok).toBe(true);

      const loginRes = await login(server, "dm@example.com", "password12345");
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.json().user.email).toBe("dm@example.com");
      expect(loginRes.headers["set-cookie"]).toBeDefined();

      await server.close();
    });
  });

  it("login creates session accessible via GET /api/auth/session", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      await register(server, "dm@example.com", "password12345");
      const loginRes = await login(server, "dm@example.com", "password12345");
      const cookie = cookieFrom(loginRes);

      const sessionRes = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { "x-vault-id": "default", cookie },
      });
      expect(sessionRes.statusCode).toBe(200);
      expect(sessionRes.json().user.email).toBe("dm@example.com");

      await server.close();
    });
  });

  it("logout revokes session", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      await register(server, "dm@example.com", "password12345");
      const loginRes = await login(server, "dm@example.com", "password12345");
      const cookie = cookieFrom(loginRes);

      await server.inject({
        method: "POST",
        url: "/api/auth/logout",
        headers: { "x-vault-id": "default", cookie },
      });

      const sessionRes = await server.inject({
        method: "GET",
        url: "/api/auth/session",
        headers: { "x-vault-id": "default", cookie },
      });
      expect(sessionRes.statusCode).toBe(401);

      await server.close();
    });
  });

  it("unauthenticated user cannot create a campaign", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "origin": "http://localhost" },
        payload: { campaignId: "cmp_test", title: "Test Campaign" },
      });
      // Should be rejected (401 or 403 — not created)
      expect(res.statusCode).toBeGreaterThanOrEqual(400);

      await server.close();
    });
  });

  it("wrong password returns 401", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      await register(server, "dm@example.com", "password12345");
      const loginRes = await login(server, "dm@example.com", "wrongpassword");
      expect(loginRes.statusCode).toBe(401);

      await server.close();
    });
  });
});

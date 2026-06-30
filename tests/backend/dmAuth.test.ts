import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-dm-auth-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

async function setupDm(server: any, email: string, secret: string, token?: string) {
  const response = await server.inject({
    method: "POST",
    url: "/api/auth/dm/setup",
    payload: { email, secret, displayName: email.split("@")[0] },
    headers: { "x-vault-id": "default", ...(token ? { "x-dm-token": token } : {}) },
  });
  expect(response.statusCode).toBe(200);
  return response.json() as { dmSessionToken: string; dm: { dmId: string; email: string } };
}

async function createCampaign(server: any, campaignId: string, title: string, token: string) {
  const response = await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, actorId: "usr_dm", title },
    headers: { "x-vault-id": "default", "x-dm-token": token },
  });
  expect(response.statusCode).toBe(201);
}

describe("DM account authentication", () => {
  it("keeps campaigns scoped to the authenticated DM", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const dmA = await setupDm(server, "a@example.com", "secret-aaaa");
      await createCampaign(server, "cmp_a", "A campaign", dmA.dmSessionToken);

      const dmB = await setupDm(server, "b@example.com", "secret-bbbb");

      const listA = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dmA.dmSessionToken },
      });
      expect(listA.statusCode).toBe(200);
      expect(listA.json().map((campaign: any) => campaign.campaignId)).toEqual(["cmp_a"]);

      const listB = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(listB.statusCode).toBe(200);
      expect(listB.json()).toEqual([]);

      const forbidden = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_a",
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(forbidden.statusCode).toBe(403);

      await server.close();
    });
  });

  it("allows another DM to create an isolated account without an existing DM session", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const dmA = await setupDm(server, "a@example.com", "secret-aaaa");
      await createCampaign(server, "cmp_a", "A campaign", dmA.dmSessionToken);

      const dmB = await setupDm(server, "b@example.com", "secret-bbbb");

      const listB = await server.inject({
        method: "GET",
        url: "/api/campaigns",
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(listB.statusCode).toBe(200);
      expect(listB.json()).toEqual([]);

      const forbidden = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_a",
        headers: { "x-vault-id": "default", "x-dm-token": dmB.dmSessionToken },
      });
      expect(forbidden.statusCode).toBe(403);

      await server.close();
    });
  });

  it("does not expose DM profiles without a valid DM session", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });

      const dmA = await setupDm(server, "a@example.com", "secret-aaaa");
      const anonymousStatus = await server.inject({
        method: "GET",
        url: "/api/auth/status",
        headers: { "x-vault-id": "default" },
      });
      expect(anonymousStatus.statusCode).toBe(200);
      expect(anonymousStatus.json()).toMatchObject({
        dmAccountConfigured: true,
        dmSessionValid: false,
        dm: null,
        dmProfiles: [],
      });

      const authenticatedStatus = await server.inject({
        method: "GET",
        url: "/api/auth/status",
        headers: { "x-vault-id": "default", "x-dm-token": dmA.dmSessionToken },
      });
      expect(authenticatedStatus.statusCode).toBe(200);
      expect(authenticatedStatus.json().dmSessionValid).toBe(true);
      expect(authenticatedStatus.json().dmProfiles).toEqual([
        expect.objectContaining({ dmId: dmA.dm.dmId, email: "a@example.com" }),
      ]);

      await server.close();
    });
  });
});

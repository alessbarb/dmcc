import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
import { db } from "../../src/backend/db/client.js";
import * as schema from "../../src/backend/db/schema.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-cmdapi-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function sessionCookie(response: any): string {
  const header = response.headers["set-cookie"];
  const cookieStr = Array.isArray(header) ? header[0] : String(header);
  expect(cookieStr).toContain("dmcc_session=");
  return cookieStr.split(";")[0];
}

async function registerAndLogin(server: any, email: string, secret: string) {
  const register = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email, password: secret, displayName: email.split("@")[0] },
  });
  expect(register.statusCode).toBe(201);

  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password: secret },
  });
  expect(login.statusCode).toBe(200);
  return sessionCookie(login);
}

async function registerAndLoginWithUser(server: any, email: string, secret: string) {
  const register = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email, password: secret, displayName: email.split("@")[0] },
  });
  expect(register.statusCode).toBe(201);
  const userId = register.json().user.userId as string;

  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password: secret },
  });
  expect(login.statusCode).toBe(200);
  return { cookie: sessionCookie(login), userId };
}

async function addCampaignMember(campaignId: string, userId: string, role: "dm" | "co_dm" | "player" | "viewer") {
  await db.insert(schema.campaignMemberships).values({ campaignId, userId, role, playerId: null });
}

async function setupCampaign(server: ReturnType<typeof createServer>, cookie: string) {
  const res = await server.inject({
    method: "POST",
    url: "/api/campaigns",
    headers: { cookie },
    payload: { campaignId: "cmp_cmd_test", title: "Command Test Campaign" },
  });
  expect(res.statusCode).toBe(201);
}

describe("command API", () => {
  it("creates campaign and generates an initial snapshot", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "postgres" });
      const dmCookie = await registerAndLogin(server, "dm_snap@example.com", "correct horse battery");

      const res = await server.inject({
        method: "POST",
        url: "/api/campaigns",
        headers: { cookie: dmCookie },
        payload: { campaignId: "cmp_snap_test", title: "Snapshot Test" },
      });
      expect(res.statusCode).toBe(201);

      const snapshotRes = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_snap_test",
        headers: { cookie: dmCookie },
      });
      expect(snapshotRes.statusCode).toBe(200);
      expect(snapshotRes.json().campaign.campaignId).toBe("cmp_snap_test");

      await server.close();
    });
  });

  it("commands execute and are reflected in projection", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "postgres" });
      const dmCookie = await registerAndLogin(server, "dm_cmd@example.com", "correct horse battery");
      await setupCampaign(server, dmCookie);

      const commandRes = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_cmd_test/commands",
        headers: { cookie: dmCookie, "idempotency-key": "key_001" },
        payload: {
          commandId: "cmd_entity_001",
          type: "CreateEntity",
          actorId: "usr_dm_cmd",
          entityId: "ent_gandalf",
          title: "Gandalf",
          entityType: "npc",
          visibility: { kind: "party" },
        },
      });
      expect(commandRes.statusCode).not.toBe(404);
      expect(commandRes.statusCode).toBe(200);

      await server.close();
    });
  });

  it("player cannot execute DM-only commands", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "postgres" });
      const dmCookie = await registerAndLogin(server, "dm_lock@example.com", "correct horse battery");
      const playerCookie = await registerAndLogin(server, "player_lock@example.com", "different horse battery");
      await setupCampaign(server, dmCookie);

      // Player tries to delete the campaign (DM-only action)
      const deleteRes = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_cmd_test",
        headers: { cookie: playerCookie },
        payload: { confirm: "Command Test Campaign" },
      });
      expect(deleteRes.statusCode).toBeGreaterThanOrEqual(400);

      await server.close();
    });
  });

  it("allows only the campaign owner to delete a campaign", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "postgres" });
      const owner = await registerAndLoginWithUser(server, "owner_delete@example.com", "correct horse battery");
      const coDm = await registerAndLoginWithUser(server, "codm_delete@example.com", "correct horse battery");
      await setupCampaign(server, owner.cookie);
      await addCampaignMember("cmp_cmd_test", coDm.userId, "co_dm");

      const coDmDelete = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_cmd_test",
        headers: { cookie: coDm.cookie },
      });
      expect(coDmDelete.statusCode).toBe(403);

      const ownerDelete = await server.inject({
        method: "DELETE",
        url: "/api/campaigns/cmp_cmd_test",
        headers: { cookie: owner.cookie },
      });
      expect(ownerDelete.statusCode).toBe(200);
      expect(ownerDelete.json().ok).toBe(true);

      await server.close();
    });
  });

  it("allows only the campaign owner to manage invitations", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir, storageMode: "postgres" });
      const owner = await registerAndLoginWithUser(server, "owner_invite@example.com", "correct horse battery");
      const coDm = await registerAndLoginWithUser(server, "codm_invite@example.com", "correct horse battery");
      await setupCampaign(server, owner.cookie);
      await addCampaignMember("cmp_cmd_test", coDm.userId, "co_dm");

      const coDmInvite = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_cmd_test/invitations",
        headers: { cookie: coDm.cookie },
        payload: { role: "player" },
      });
      expect(coDmInvite.statusCode).toBe(403);

      const ownerInvite = await server.inject({
        method: "POST",
        url: "/api/campaigns/cmp_cmd_test/invitations",
        headers: { cookie: owner.cookie },
        payload: { role: "player" },
      });
      expect(ownerInvite.statusCode).toBe(201);

      const coDmList = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_cmd_test/invitations",
        headers: { cookie: coDm.cookie },
      });
      expect(coDmList.statusCode).toBe(403);

      const ownerList = await server.inject({
        method: "GET",
        url: "/api/campaigns/cmp_cmd_test/invitations",
        headers: { cookie: owner.cookie },
      });
      expect(ownerList.statusCode).toBe(200);
      expect(ownerList.json().invitations).toHaveLength(1);

      await server.close();
    });
  });

});

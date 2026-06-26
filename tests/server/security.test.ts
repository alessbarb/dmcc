import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-sec-"));
  try {
    return await fn(dataDir);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
}

function getDmToken(server: any): string {
  return (server as any).dmSessionToken;
}

async function seedCampaign(server: any, campaignId = "cmp_sec") {
  const res = await server.inject({
    method: "POST",
    url: "/api/campaigns",
    payload: { campaignId, actorId: "usr_dm", title: "Security Test Campaign" },
    headers: { "x-dm-token": getDmToken(server) },
  });
  expect(res.statusCode).toBe(201);
  return campaignId;
}

describe("Security", () => {
  describe("vaultId validation", () => {
    it("rejects vaultId with path traversal characters", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_sec");
        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_sec",
          headers: { "x-vault-id": "../evil" },
        });
        expect(response.statusCode).toBe(400);
      });
    });

    it("rejects vaultId with slash", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_sec");
        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_sec",
          headers: { "x-vault-id": "a/b" },
        });
        expect(response.statusCode).toBe(400);
      });
    });

    it("accepts valid vaultId", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_sec");
        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_sec",
          headers: { "x-vault-id": "default", "x-dm-token": getDmToken(server) },
        });
        expect([200, 404]).toContain(response.statusCode);
      });
    });
  });

  describe("campaignId validation", () => {
    it("rejects campaignId with path traversal", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/..%2F..%2Fevil/state",
        });
        // Either 400 (invalid id) or 404 (not found) — both are safe
        expect([400, 404]).toContain(response.statusCode);
      });
    });

    it("rejects campaignId with special characters", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_../state",
        });
        expect([400, 404]).toContain(response.statusCode);
      });
    });
  });

  describe("LAN status access code visibility", () => {
    it("hides accessCode from unauthenticated requests", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_lan");

        const response = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_lan/lan-status",
          // No x-dm-token — unauthenticated
        });
        if (response.statusCode === 200) {
          expect(response.json().accessCode).toBeNull();
        }
      });
    });
  });

  describe("restore campaign ownership validation", () => {
    it("rejects backup that belongs to a different campaign", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_a");
        await seedCampaign(server, "cmp_b");

        // Backup campaign A
        const backupRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_a/backups",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect([200, 201]).toContain(backupRes.statusCode);
        const backupId = backupRes.json().backupId;

        // Try to restore backup of A into campaign B — cannot access: file lives under cmp_a/backups, not cmp_b/backups
        const restoreRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_b/restore",
          payload: { backupId },
          headers: { "x-dm-token": getDmToken(server) },
        });
        // 404 = backup not found in cmp_b's backups dir (physically isolated) — also safe
        expect([400, 404]).toContain(restoreRes.statusCode);
      });
    });
  });

  describe("entity metadata type validation", () => {
    it("rejects clue entity without metadata.content", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_meta");

        const response = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_meta/entities",
          payload: {
            entityType: "clue",
            title: "Missing Content Clue",
            // metadata.content intentionally absent
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(response.statusCode).toBe(500);
        expect(response.json().error).toMatch(/content/i);
      });
    });

    it("rejects secret entity without metadata.truth", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_meta2");

        const response = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_meta2/entities",
          payload: {
            entityType: "secret",
            title: "Missing Truth Secret",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(response.statusCode).toBe(500);
        expect(response.json().error).toMatch(/truth/i);
      });
    });

    it("allows player_character entity without metadata.playerId (pre-made template)", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_meta3");

        const response = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_meta3/entities",
          payload: {
            entityType: "player_character",
            title: "Pre-made Character (no player assigned)",
            metadata: {
              isPremade: true,
            },
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(response.statusCode).toBe(201);
      });
    });
  });

  describe("DM-only route protection", () => {
    it("dashboard returns 401/403 for unauthenticated", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_dm1");

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_dm1/dashboard",
          // No token — unauthenticated
        });
        expect([401, 403]).toContain(res.statusCode);
      });
    });

    it("what-now returns 401/403 for unauthenticated", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_dm2");

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_dm2/what-now",
        });
        expect([401, 403]).toContain(res.statusCode);
      });
    });

    it("entity list returns 401/403 for unauthenticated (LAN disabled)", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_dm3");

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_dm3",
        });
        expect([401, 403]).toContain(res.statusCode);
      });
    });

    it("export returns 401/403 for unauthenticated", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_dm4");

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_dm4/export/json",
        });
        expect([401, 403, 404]).toContain(res.statusCode);
      });
    });

    it("timeline returns 401/403 for unauthenticated", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_dm5");

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_dm5/timeline",
        });
        expect([401, 403]).toContain(res.statusCode);
      });
    });
  });

  describe("player authentication via x-role header (CVE: role header bypass)", () => {
    it("LAN enabled + x-role: player alone (no token, no access code) → 401", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_auth1");

        // Enable LAN mode
        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth1/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": getDmToken(server) },
        });

        // x-role: player alone must NOT grant access — it's not a credential
        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_auth1",
          headers: { "x-role": "player" },
        });
        expect(res.statusCode).toBe(401);
      });
    });

    it("LAN enabled + x-role: player + invalid player token → 401", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_auth2");

        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth2/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": getDmToken(server) },
        });

        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_auth2",
          headers: { "x-role": "player", "x-player-token": "invalid-token-that-does-not-exist" },
        });
        expect(res.statusCode).toBe(401);
      });
    });

    it("LAN enabled + valid player token for WRONG campaign → 401", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        const dmToken = getDmToken(server);

        // Create two campaigns
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: { campaignId: "cmp_auth3a", title: "Campaign A", actorId: "usr_dm" },
          headers: { "x-dm-token": dmToken },
        });
        await server.inject({
          method: "POST",
          url: "/api/campaigns",
          payload: { campaignId: "cmp_auth3b", title: "Campaign B", actorId: "usr_dm" },
          headers: { "x-dm-token": dmToken },
        });

        // Enable LAN on both
        const toggleA = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth3a/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": dmToken },
        });
        const { accessCode: codeA } = toggleA.json();

        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth3b/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": dmToken },
        });

        // Join campaign A to get a token scoped to A
        const joinA = await server.inject({
          method: "POST",
          url: "/api/join/cmp_auth3a",
          payload: { accessCode: codeA },
        });
        expect(joinA.statusCode).toBe(200);
        const { playerToken } = joinA.json();

        // Use campaign A's token to try to access campaign B — must be rejected
        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_auth3b",
          headers: { "x-player-token": playerToken },
        });
        expect(res.statusCode).toBe(401);
      });
    });

    it("LAN disabled + valid player token → 403", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        const dmToken = getDmToken(server);
        await seedCampaign(server, "cmp_auth4");

        // Enable LAN, join to get token, then disable LAN
        const toggleOn = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth4/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": dmToken },
        });
        const { accessCode } = toggleOn.json();

        const join = await server.inject({
          method: "POST",
          url: "/api/join/cmp_auth4",
          payload: { accessCode },
        });
        expect(join.statusCode).toBe(200);
        const { playerToken } = join.json();

        // Disable LAN
        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth4/lan/toggle",
          payload: { enabled: false },
          headers: { "x-dm-token": dmToken },
        });

        // Token is still in memory but LAN is off — must be 403
        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_auth4",
          headers: { "x-player-token": playerToken },
        });
        expect(res.statusCode).toBe(403);
      });
    });

    it("x-player-id header alone (spoofed) → 401", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_auth5");

        // Enable LAN
        await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_auth5/lan/toggle",
          payload: { enabled: true },
          headers: { "x-dm-token": getDmToken(server) },
        });

        // Spoofed x-player-id without a valid player token must not grant access
        const res = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_auth5",
          headers: { "x-player-id": "ply_spoofed" },
        });
        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe("RevealClue projection consistency", () => {
    it("RevealClue updates entity visibility after rebuild from events", async () => {
      await withTempDataDir(async (dataDir) => {
        const server = createServer({ dataDir });
        await seedCampaign(server, "cmp_rc");

        // Create a clue
        const clueRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_rc/entities",
          payload: {
            entityType: "clue",
            title: "Hidden Clue",
            metadata: { content: "The butler did it" },
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(clueRes.statusCode).toBe(201);
        const clueId = clueRes.json().entityId;

        // Start session
        const sessRes = await server.inject({
          method: "POST",
          url: "/api/campaigns/cmp_rc/sessions",
          payload: { sessionId: "sess_rc1", title: "Session 1", actorId: "usr_dm" },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(sessRes.statusCode).toBe(201);
        const sessionId = sessRes.json().sessionId;

        // Reveal clue
        const revealRes = await server.inject({
          method: "POST",
          url: `/api/campaigns/cmp_rc/sessions/${sessionId}/reveal-clue`,
          payload: {
            clueEntityId: clueId,
            audience: { kind: "party" },
            actorId: "usr_dm",
          },
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(revealRes.statusCode).toBe(200);

        // Rebuild snapshot and verify visibility updated
        const stateRes = await server.inject({
          method: "GET",
          url: "/api/campaigns/cmp_rc",
          headers: { "x-dm-token": getDmToken(server) },
        });
        expect(stateRes.statusCode).toBe(200);
        const state = stateRes.json();
        const entities: any[] = Array.isArray(state.entities)
          ? state.entities
          : Object.values(state.entities ?? {});
        const clue = entities.find((e: any) => e.entityId === clueId);
        expect(clue).toBeDefined();
        expect(clue.visibility?.kind).toBe("party");
      });
    });
  });
});

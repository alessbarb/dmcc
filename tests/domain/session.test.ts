import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "../../src/server/createServer.js";

async function withTempDataDir<T>(fn: (dataDir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "dmcc-sess-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

function getDmToken(server: any): string {
  return server.dmSessionToken;
}

describe("Session round-trip", () => {
  it("start session event round-trips through projection correctly", async () => {
    await withTempDataDir(async (dataDir) => {
      const server = createServer({ dataDir });
      const token = getDmToken(server);

      // Create campaign
      const campRes = await server.inject({
        method: "POST", url: "/api/campaigns",
        payload: { campaignId: "cmp_sess1", title: "Session Test", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });
      expect(campRes.statusCode).toBe(201);

      // Start session
      const sessRes = await server.inject({
        method: "POST", url: "/api/campaigns/cmp_sess1/sessions",
        payload: { title: "Session 1", actorId: "usr_dm" },
        headers: { "x-dm-token": token },
      });
      expect(sessRes.statusCode).toBe(201);
      const sessionId = sessRes.json().sessionId;
      expect(sessionId).toMatch(/^sess_/);

      // Rebuild snapshot
      await server.inject({
        method: "POST", url: "/api/campaigns/cmp_sess1/rebuild",
        headers: { "x-dm-token": token },
      });

      // State includes session
      const stateRes = await server.inject({
        method: "GET", url: "/api/campaigns/cmp_sess1",
        headers: { "x-dm-token": token },
      });
      expect(stateRes.statusCode).toBe(200);
      const state = stateRes.json();
      const sessions = Array.isArray(state.sessions)
        ? state.sessions
        : Object.values(state.sessions ?? {});
      expect(sessions.length).toBeGreaterThan(0);
      const sess = sessions.find((s: any) => s.sessionId === sessionId || s.id === sessionId);
      expect(sess).toBeDefined();
      expect(sess.status).toBe("active");
    });
  });
});

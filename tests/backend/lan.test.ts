import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";

const resources: Array<{ server: ReturnType<typeof createServer>; dataDir: string }> = [];

afterEach(async () => {
  for (const { server, dataDir } of resources.splice(0)) {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

describe("retired LAN identity routes", () => {
  for (const [url, payload] of [
    ["/api/join/cmp_legacy", { accessCode: "OLD-CODE" }],
    ["/api/player/join", { campaignCode: "cmp_legacy", accessCode: "OLD-CODE" }],
    ["/api/player/rejoin/lookup", { email: "player@example.com" }],
    ["/api/player/rejoin", { email: "player@example.com", campaignId: "cmp_legacy", playerId: "ply_victim" }],
    ["/api/campaigns/cmp_legacy/rejoin", { email: "player@example.com", accessCode: "OLD-CODE" }],
  ] as const) {
    it(`returns 410 for ${url}`, async () => {
      const dataDir = await mkdtemp(join(tmpdir(), "dmcc-retired-lan-"));
      const server = createServer({ dataDir });
      resources.push({ server, dataDir });
      const response = await server.inject({ method: "POST", url, payload });
      expect(response.statusCode).toBe(410);
      expect(response.json().error).toMatch(/retired/i);
    });
  }
});

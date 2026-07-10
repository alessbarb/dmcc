import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
import { addCampaignMembership } from "../../src/backend/server/userAuthAccountOps.js";

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => Promise.all(cleanup.splice(0).map((fn) => fn())));

async function setup() {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-account-lifecycle-"));
  const server = createServer({ dataDir });
  cleanup.push(async () => {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  });
  await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email: "owner@example.com", password: "correct horse battery", displayName: "Owner" },
  });
  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email: "owner@example.com", password: "correct horse battery" },
  });
  return {
    server,
    cookie: String(login.headers["set-cookie"]).split(";")[0],
    userId: login.json().user.userId as string,
    vaultDir: join(dataDir, "vaults", "default"),
  };
}

describe("account lifecycle", () => {
  it("exports personal data without authentication secrets", async () => {
    const { server, cookie } = await setup();
    const response = await server.inject({
      method: "GET",
      url: "/api/account/export",
      headers: { cookie },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-disposition"]).toContain("attachment");
    expect(response.json()).toHaveProperty("profiles");
    for (const forbidden of ["passwordHash", "passwordSalt", "sessionIdHash", "codeHash", "tokenHash"]) {
      expect(JSON.stringify(response.json())).not.toContain(forbidden);
    }
  });

  it("blocks deletion while the account is a campaign's sole DM", async () => {
    const { server, cookie, userId, vaultDir } = await setup();
    await addCampaignMembership(vaultDir, {
      campaignId: "cmp_owned",
      userId,
      role: "dm",
    });
    const response = await server.inject({
      method: "DELETE",
      url: "/api/account",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        currentPassword: "correct horse battery",
        confirmation: "owner@example.com",
      },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json().blockers).toEqual([
      { campaignId: "cmp_owned", reason: "sole_responsible_dm" },
    ]);
  });
});

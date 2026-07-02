import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/backend/server/createServer.js";
import { addCampaignMembership } from "../../src/backend/server/userAuthStore.js";

const cleanup: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((fn) => fn()));
});

async function authenticatedServer() {
  const dataDir = await mkdtemp(join(tmpdir(), "dmcc-account-routes-"));
  const server = createServer({ dataDir });
  cleanup.push(async () => {
    await server.close();
    await rm(dataDir, { recursive: true, force: true });
  });
  await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: {
      email: "owner@example.com",
      password: "correct horse battery",
      displayName: "Owner",
    },
  });
  const login = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email: "owner@example.com", password: "correct horse battery" },
  });
  return {
    server,
    cookie: String(login.headers["set-cookie"]).split(";")[0],
    dataDir,
    userId: login.json().user.userId as string,
  };
}

const validVisibility = {
  displayName: "table",
  avatarUrl: "table",
  pronouns: "table",
  timeZone: "table",
  biography: "table",
  contact: "dm",
};

describe("account routes", () => {
  it("returns only the signed-in owner's account aggregate", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "GET",
      url: "/api/account",
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().account.email).toBe("owner@example.com");
    expect(response.json().preferences.themeId).toBe("default");
    expect(JSON.stringify(response.json())).not.toContain("passwordHash");
  });

  it("rejects stale preference updates", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/preferences",
      headers: { cookie, origin: "http://localhost" , host: "localhost" },
      payload: { version: 0, themeId: "default", colorMode: "dark" },
    });

    expect(response.statusCode).toBe(409);
  });

  it("updates the owner's DM profile", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/dm",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Keeper Alex",
        biography: "Runs investigative fantasy.",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().profile.displayName).toBe("Keeper Alex");
  });

  it("cannot edit a player profile without an active membership", async () => {
    const { server, cookie } = await authenticatedServer();

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/player/cmp_other",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        displayName: "Player Alex",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("derives playerId from the active campaign membership", async () => {
    const { server, cookie, dataDir, userId } = await authenticatedServer();
    await addCampaignMembership(join(dataDir, "vaults", "default"), {
      campaignId: "cmp_member",
      userId,
      role: "player",
      playerId: "ply_owned",
    });

    const response = await server.inject({
      method: "PUT",
      url: "/api/account/profiles/player/cmp_member",
      headers: { cookie, origin: "http://localhost", host: "localhost" },
      payload: {
        version: 0,
        playerId: "ply_attacker_selected",
        displayName: "Player Alex",
        visibility: validVisibility,
        publicationState: "private",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().profile.playerId).toBe("ply_owned");
  });
});
